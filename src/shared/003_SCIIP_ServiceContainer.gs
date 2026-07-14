/**
 * SCIIP_OS v6.1 — Dependency Injection Service Container
 *
 * Canonical owner for application services. New code resolves dependencies
 * through this container. Legacy globals remain reachable only through lazy
 * default adapters, preserving backward compatibility during modernization.
 */
var SCIIP_SERVICE_CONTAINER = (function () {
  'use strict';

  var ns = {};
  var registrations = {};
  var instances = {};
  var overrides = {};

  ns.VERSION = 'v6.1';
  ns.CONTRACT_VERSION = '1.0';
  ns.CORE_SERVICES = [
    'StorageService', 'GraphService', 'IdentityService', 'GISService',
    'LoggingService', 'TransactionService', 'DateService'
  ];

  function normalizeName(name) {
    var value = String(name || '').trim();
    if (!value) throw new Error('SCIIP_SERVICE_CONTAINER requires a service name.');
    return value;
  }

  function copy(source) {
    var target = {};
    source = source || {};
    Object.keys(source).forEach(function (key) { target[key] = source[key]; });
    return target;
  }

  function validateService(name, service) {
    if (!service || (typeof service !== 'object' && typeof service !== 'function')) {
      throw new Error('Invalid service implementation: ' + name);
    }
    return service;
  }

  ns.register = function (name, provider, options) {
    name = normalizeName(name);
    options = options || {};
    if (typeof provider !== 'function' && (!provider || typeof provider !== 'object')) {
      throw new Error('Service provider must be a factory function or object: ' + name);
    }
    registrations[name] = {
      provider: provider,
      singleton: options.singleton !== false,
      source: options.source || 'APPLICATION',
      contract: options.contract || null
    };
    delete instances[name];
    return ns;
  };

  ns.unregister = function (name) {
    name = normalizeName(name);
    delete registrations[name];
    delete instances[name];
    delete overrides[name];
    return ns;
  };

  ns.override = function (name, service) {
    name = normalizeName(name);
    overrides[name] = validateService(name, service);
    return ns;
  };

  ns.clearOverride = function (name) {
    delete overrides[normalizeName(name)];
    return ns;
  };

  ns.has = function (name) {
    name = normalizeName(name);
    return !!overrides[name] || !!registrations[name];
  };

  ns.resolve = function (name, optional) {
    name = normalizeName(name);
    if (overrides[name]) return overrides[name];
    var registration = registrations[name];
    if (!registration) {
      if (optional === true) return null;
      throw new Error('Service is not registered: ' + name);
    }
    if (registration.singleton && instances[name]) return instances[name];
    var service = typeof registration.provider === 'function'
      ? registration.provider(ns)
      : registration.provider;
    validateService(name, service);
    if (registration.singleton) instances[name] = service;
    return service;
  };

  ns.resolveAll = function (names) {
    var result = {};
    (names || ns.CORE_SERVICES).forEach(function (name) {
      result[name] = ns.resolve(name);
    });
    return result;
  };

  ns.configure = function (services) {
    services = services || {};
    Object.keys(services).forEach(function (name) { ns.override(name, services[name]); });
    return ns;
  };

  ns.reset = function () {
    overrides = {};
    instances = {};
    return ns;
  };

  ns.withOverrides = function (services, callback) {
    if (typeof callback !== 'function') throw new Error('withOverrides requires a callback.');
    var prior = copy(overrides);
    ns.configure(services || {});
    try { return callback(ns); }
    finally { overrides = prior; }
  };

  ns.snapshot = function () {
    return Object.keys(registrations).sort().map(function (name) {
      var registration = registrations[name];
      return {
        name: name,
        registered: true,
        overridden: !!overrides[name],
        instantiated: !!instances[name],
        singleton: registration.singleton,
        source: registration.source,
        contract: registration.contract
      };
    });
  };

  // Lazy compatibility adapters. References are evaluated only when methods run.
  ns.register('StorageService', function () {
    return {
      getBackend: function () { return SCIIP_STORAGE_BACKEND; },
      execute: function (request) { return SCIIP_STORAGE_BACKEND.execute(request); },
      healthCheck: function (backend) { return SCIIP_STORAGE_BACKEND.healthCheck(backend); },
      getActiveSpreadsheetSafe: function () {
        try { return SpreadsheetApp.getActiveSpreadsheet() || null; } catch (err) { return null; }
      },
      getWorkbookCellCount: function (ss) {
        if (!ss) return 10000000;
        try {
          var sheets = ss.getSheets();
          var total = 0;
          for (var i = 0; i < sheets.length; i++) total += sheets[i].getMaxRows() * sheets[i].getMaxColumns();
          return total;
        } catch (err) { return 10000000; }
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'StorageService@1.0' });

  ns.register('GraphService', function () {
    return {
      createNode: function (node) { return sciipGraphCreateNode(node); },
      createEdge: function (edge) { return sciipGraphCreateEdge(edge); },
      getNodeSheet: function () { return sciipGetGraphNodeSheet(); }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'GraphService@1.0' });

  ns.register('IdentityService', function () {
    return {
      createCanonicalIdentity: function (input) { return sciipCreateCanonicalIdentity(input); },
      resolveCandidate: function (candidate) {
        if (typeof sciipResolveIdentityCandidate === 'function') return sciipResolveIdentityCandidate(candidate);
        return sciipCreateCanonicalIdentity(candidate);
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'IdentityService@1.0' });

  ns.register('GISService', function () {
    return {
      createCampus: function (campus) { return sciipCreateCampus(campus); },
      getCampusSheet: function () { return sciipGetCampusSheet(); },
      bindCoordinates: function (input) {
        if (typeof sciipBindCoordinates === 'function') return sciipBindCoordinates(input);
        return input;
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'GISService@1.0' });

  ns.register('LoggingService', function () {
    return {
      write: function (config) { return SCIIP_RUNTIME_LOGGING.write(config); },
      info: function (event, payload) {
        return SCIIP_RUNTIME_LOGGING.info({ action: event, message: event, payload: payload || {} });
      },
      warn: function (event, payload) {
        return SCIIP_RUNTIME_LOGGING.warn({ action: event, message: event, payload: payload || {} });
      },
      error: function (event, payload) {
        return SCIIP_RUNTIME_LOGGING.error({ action: event, message: event, payload: payload || {} });
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'LoggingService@1.0' });

  ns.register('TransactionService', function () {
    return {
      run: function (context, payload, callback) { return SCIIP_RUNTIME_TRANSACTION_MANAGER.run(context, payload, callback); },
      buildBusinessKey: function (cfg, dateKey) {
        return String(cfg.processorNumber) + '_' + String(cfg.processorName).toUpperCase() +
          '|EXECUTE_' + String(cfg.processorName).toUpperCase() + '|' + dateKey;
      },
      buildTransactionId: function (cfg, dateKey) {
        return 'TXN|' + cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase() +
          '|' + cfg.targetSheet + '|' + dateKey + '|' + new Date().getTime();
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'TransactionService@1.0' });

  ns.register('DateService', function () {
    return {
      now: function () { return new Date(); },
      nowIso: function () { return new Date().toISOString(); },
      dateKey: function (dateValue) {
        var date = dateValue || new Date();
        if (typeof sciipDateKey === 'function') return sciipDateKey(date);
        return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'DateService@1.0' });

  return ns;
})();

// Concise canonical alias for application composition roots.
var SCIIP_SERVICES = SCIIP_SERVICE_CONTAINER;
