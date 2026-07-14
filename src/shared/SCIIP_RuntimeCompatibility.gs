/**
 * SCIIP_OS v6.1
 * Runtime Compatibility Facade
 *
 * Canonical location for preserved v5.x runtime aliases. New code must call
 * the owning service namespace directly. These aliases remain read-through
 * delegates so existing processors continue to work during modernization.
 */
var SCIIP_RUNTIME_COMPATIBILITY = (function () {
  'use strict';

  var VERSION = 'v6.1';
  var aliases = [];

  function bind(name, resolver) {
    if (typeof SCIIP_RUNTIME[name] === 'function') {
      return;
    }
    SCIIP_RUNTIME[name] = function () {
      var fn = resolver();
      if (typeof fn !== 'function') {
        throw new Error('SCIIP runtime compatibility target unavailable: ' + name);
      }
      return fn.apply(null, arguments);
    };
    aliases.push(name);
  }

  bind('result', function () { return SCIIP_RUNTIME_RESULT_FACTORY.create; });
  bind('compactPayload', function () { return SCIIP_RUNTIME_PAYLOAD_FACTORY.compact; });
  bind('createContext', function () { return SCIIP_RUNTIME_CONTEXT.create; });
  bind('getSpreadsheet', function () { return SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet; });
  bind('ensureSheet', function () {
    return function (sheetName, headers) {
      return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(sheetName, headers);
    };
  });
  bind('runTransaction', function () { return SCIIP_RUNTIME_TRANSACTION_MANAGER.run; });
  bind('runBaseProcessor', function () { return SCIIP_RUNTIME_PROCESSOR_BASE.run; });
  bind('log', function () { return SCIIP_RUNTIME_LOGGING.write; });
  bind('logInfo', function () { return SCIIP_RUNTIME_LOGGING.info; });
  bind('logWarn', function () { return SCIIP_RUNTIME_LOGGING.warn; });
  bind('logErrorEvent', function () { return SCIIP_RUNTIME_LOGGING.error; });
  bind('logDebug', function () { return SCIIP_RUNTIME_LOGGING.debug; });
  bind('logAudit', function () { return SCIIP_RUNTIME_LOGGING.audit; });

  function report() {
    return {
      version: VERSION,
      namespaceOwner: SCIIP_RUNTIME.NAMESPACE_OWNER || null,
      aliasCount: aliases.length,
      aliases: aliases.slice()
    };
  }

  return {
    VERSION: VERSION,
    report: report
  };
})();

function sciipTestRuntimeCompatibilityFacade() {
  var report = SCIIP_RUNTIME_COMPATIBILITY.report();
  var required = [
    'result', 'compactPayload', 'createContext', 'getSpreadsheet',
    'ensureSheet', 'runTransaction', 'runBaseProcessor', 'log',
    'logInfo', 'logWarn', 'logErrorEvent', 'logDebug', 'logAudit'
  ];
  var missing = required.filter(function (name) {
    return typeof SCIIP_RUNTIME[name] !== 'function';
  });
  var result = {
    test: 'sciipTestRuntimeCompatibilityFacade',
    status: missing.length ? 'FAILED' : 'PASSED',
    namespaceOwner: SCIIP_RUNTIME.NAMESPACE_OWNER || null,
    requiredAliasCount: required.length,
    missingAliases: missing,
    report: report
  };
  Logger.log(JSON.stringify(result));
  return result;
}
