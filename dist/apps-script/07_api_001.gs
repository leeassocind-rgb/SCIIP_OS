/** SCIIP_OS compiled bundle: 07_api_001.gs
 * sources: 3
 * generated: 2026-07-17T19:08:05.478Z
 */
/** Public contract metadata used by certification and future clients. */
var SCIIP_API_CONTRACT = Object.freeze({
  API_VERSION: 'v1',
  PLATFORM_VERSION: 'v6.1',
  ENVELOPE: ['apiVersion', 'status', 'requestId', 'timestamp', 'data', 'error', 'httpStatus'],
  METHODS: ['GET', 'POST'],
  AUTHENTICATION: 'INJECTED_PROVIDER_FAIL_CLOSED',
  DEFAULT_ROUTES: ['/health', '/version', '/routes']
});


/**
 * SCIIP_OS v6.1 API Foundation
 * Stable versioned Apps Script API boundary. No storage implementation details leak through this layer.
 */
var SCIIP_API = (function () {
  'use strict';

  var VERSION = 'v1';
  var routes = {};
  var authProvider = null;

  function normalizeMethod_(method) {
    return String(method || 'GET').toUpperCase();
  }

  function normalizePath_(path) {
    var value = String(path || '/').trim();
    if (value.charAt(0) !== '/') value = '/' + value;
    return value.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
  }

  function routeKey_(method, path) {
    return normalizeMethod_(method) + ' ' + normalizePath_(path);
  }

  function register(method, path, handler, options) {
    if (typeof handler !== 'function') throw new Error('SCIIP_API handler must be a function.');
    var key = routeKey_(method, path);
    if (routes[key]) throw new Error('SCIIP_API duplicate route: ' + key);
    routes[key] = {
      method: normalizeMethod_(method),
      path: normalizePath_(path),
      handler: handler,
      authRequired: !options || options.authRequired !== false,
      description: options && options.description ? String(options.description) : ''
    };
    return routes[key];
  }

  function setAuthProvider(provider) {
    if (provider !== null && typeof provider !== 'function') throw new Error('SCIIP_API auth provider must be a function or null.');
    authProvider = provider;
  }

  function envelope_(status, data, error, requestId) {
    return {
      apiVersion: VERSION,
      status: status,
      requestId: requestId,
      timestamp: new Date().toISOString(),
      data: data === undefined ? null : data,
      error: error || null
    };
  }

  function jsonOutput_(body, httpStatus) {
    var output = ContentService.createTextOutput(JSON.stringify(body));
    output.setMimeType(ContentService.MimeType.JSON);
    // Apps Script ContentService does not expose arbitrary response status codes.
    // Preserve the intended status in the envelope for deterministic clients.
    body.httpStatus = httpStatus;
    output.setContent(JSON.stringify(body));
    return output;
  }

  function requestId_() {
    return 'REQ|' + Utilities.getUuid();
  }

  function parseBody_(event) {
    var raw = event && event.postData && event.postData.contents;
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch (error) { throw { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' }; }
  }

  function requestFromEvent_(method, event) {
    var parameter = (event && event.parameter) || {};
    var path = parameter.path || parameter.route || '/health';
    return {
      method: normalizeMethod_(method),
      path: normalizePath_(path),
      query: parameter,
      parameters: (event && event.parameters) || {},
      body: method === 'POST' ? parseBody_(event) : null,
      headers: {},
      rawEvent: event || {}
    };
  }

  function authorize_(route, request) {
    if (!route.authRequired) return { ok: true, principal: { type: 'ANONYMOUS' } };
    if (!authProvider) return { ok: false, code: 'AUTH_NOT_CONFIGURED', message: 'Authentication provider is not configured.' };
    var result = authProvider(request);
    if (!result || result.ok !== true) return { ok: false, code: 'UNAUTHORIZED', message: 'Request is not authorized.' };
    return result;
  }

  function dispatch(method, event) {
    var requestId = requestId_();
    try {
      var request = requestFromEvent_(method, event);
      var route = routes[routeKey_(request.method, request.path)];
      if (!route) return jsonOutput_(envelope_('ERROR', null, { code: 'NOT_FOUND', message: 'Route not found.' }, requestId), 404);
      var auth = authorize_(route, request);
      if (!auth.ok) return jsonOutput_(envelope_('ERROR', null, { code: auth.code, message: auth.message }, requestId), 401);
      request.requestId = requestId;
      request.principal = auth.principal || null;
      request.services = typeof SCIIP_SERVICES !== 'undefined' ? SCIIP_SERVICES : null;
      var result = route.handler(request);
      return jsonOutput_(envelope_('SUCCESS', result, null, requestId), 200);
    } catch (error) {
      var code = error && error.code ? error.code : 'INTERNAL_ERROR';
      var message = error && error.message ? error.message : String(error);
      return jsonOutput_(envelope_('ERROR', null, { code: code, message: message }, requestId), code === 'INVALID_JSON' ? 400 : 500);
    }
  }

  function listRoutes() {
    return Object.keys(routes).sort().map(function (key) {
      var route = routes[key];
      return { method: route.method, path: route.path, authRequired: route.authRequired, description: route.description };
    });
  }

  function resetForTesting() {
    routes = {};
    authProvider = null;
    installDefaultRoutes_();
  }

  function installDefaultRoutes_() {
    register('GET', '/health', function () {
      return { service: 'SCIIP_OS_API', status: 'AVAILABLE', apiVersion: VERSION };
    }, { authRequired: false, description: 'API health check.' });

    register('GET', '/version', function () {
      return { apiVersion: VERSION, platformVersion: 'v6.1' };
    }, { authRequired: false, description: 'API and platform versions.' });

    register('GET', '/routes', function () {
      return { routes: listRoutes() };
    }, { authRequired: true, description: 'Authorized route registry.' });
  }

  installDefaultRoutes_();

  return {
    VERSION: VERSION,
    register: register,
    dispatch: dispatch,
    listRoutes: listRoutes,
    setAuthProvider: setAuthProvider,
    resetForTesting: resetForTesting
  };
})();

function doGet(e) {
  var path = e && e.pathInfo ? String(e.pathInfo) : '';
  if (path.indexOf('api/') === 0 || (e && e.parameter && e.parameter.api === '1')) return SCIIP_API.dispatch('GET', e);
  return SCIIP_APPLICATION.render(e || {});
}

function doPost(e) {
  return SCIIP_API.dispatch('POST', e);
}


function sciipTestApiFoundationPhase7C() {
  var failures = [];
  function assert_(condition, message) { if (!condition) failures.push(message); }
  assert_(typeof SCIIP_API !== 'undefined', 'SCIIP_API missing');
  assert_(SCIIP_API.VERSION === 'v1', 'API version mismatch');
  var routes = SCIIP_API.listRoutes();
  assert_(routes.length >= 3, 'Default routes missing');
  assert_(routes.some(function(r){ return r.method === 'GET' && r.path === '/health' && r.authRequired === false; }), 'Health route missing');
  assert_(routes.some(function(r){ return r.path === '/routes' && r.authRequired === true; }), 'Protected route missing');
  var result = { framework: 'SCIIP_API_CERTIFICATION', version: 'v6.1-phase7c', status: failures.length ? 'FAILED' : 'PASSED', failures: failures, routes: routes };
  console.log(JSON.stringify(result));
  if (failures.length) throw new Error(JSON.stringify(result));
  return result;
}
