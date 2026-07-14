/**
 * SCIIP_OS v6.1 — Permanent Storage Backend Abstraction
 *
 * One contract for Google Sheets, BigQuery, Cloud SQL, Firestore, and local
 * runtime storage. External backends fail closed until their clients are
 * explicitly injected.
 */
var SCIIP_STORAGE_BACKEND = (function () {
  var ns = {};
  var registry = {};
  var activeBackend = 'GOOGLE_SHEETS';
  var injected = {};

  ns.VERSION = 'v6.1';
  ns.CONTRACT_VERSION = '1.0';
  ns.OPERATIONS = ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction'];

  function copy(source) {
    var target = {};
    source = source || {};
    Object.keys(source).forEach(function (key) { target[key] = source[key]; });
    return target;
  }

  function normalizeName(name) {
    return String(name || '').trim().toUpperCase();
  }

  function ensureRequest(request) {
    if (!request || typeof request !== 'object') throw new Error('SCIIP_STORAGE_BACKEND requires a request object.');
    if (!request.operation) throw new Error('SCIIP_STORAGE_BACKEND request missing operation.');
    return request;
  }

  function unsupported(name, operation, detail) {
    return {
      ok: false,
      status: 'BACKEND_UNAVAILABLE',
      backend: name,
      operation: operation,
      recordsRead: 0,
      recordsWritten: 0,
      detail: detail || 'Backend client is not configured.',
      version: ns.VERSION
    };
  }

  function requireAdapter(adapter) {
    if (!adapter || typeof adapter !== 'object') throw new Error('Storage adapter must be an object.');
    if (!adapter.name) throw new Error('Storage adapter missing name.');
    if (typeof adapter.execute !== 'function') throw new Error('Storage adapter missing execute(request, context).');
    return adapter;
  }

  ns.configure = function (services) {
    injected = copy(services);
    return ns;
  };

  ns.reset = function () {
    injected = {};
    activeBackend = 'GOOGLE_SHEETS';
    return ns;
  };

  ns.register = function (adapter) {
    requireAdapter(adapter);
    registry[normalizeName(adapter.name)] = adapter;
    return ns;
  };

  ns.has = function (name) {
    return !!registry[normalizeName(name)];
  };

  ns.get = function (name) {
    var key = normalizeName(name || activeBackend);
    if (!registry[key]) throw new Error('Unknown storage backend: ' + key);
    return registry[key];
  };

  ns.use = function (name) {
    var key = normalizeName(name);
    ns.get(key);
    activeBackend = key;
    return ns;
  };

  ns.getActiveName = function () {
    return activeBackend;
  };

  ns.list = function () {
    return Object.keys(registry).sort().map(function (key) {
      var adapter = registry[key];
      return {
        name: key,
        mode: adapter.mode || 'UNKNOWN',
        persistent: adapter.persistent !== false,
        configured: typeof adapter.isConfigured === 'function' ? !!adapter.isConfigured(injected) : true,
        capabilities: (adapter.capabilities || []).slice()
      };
    });
  };

  ns.execute = function (request) {
    ensureRequest(request);
    var backendName = normalizeName(request.backend || activeBackend);
    var adapter = ns.get(backendName);
    var context = {
      version: ns.VERSION,
      contractVersion: ns.CONTRACT_VERSION,
      services: injected,
      backend: backendName
    };
    if (typeof adapter.isConfigured === 'function' && !adapter.isConfigured(injected)) {
      return unsupported(backendName, request.operation, 'Backend exists but its client has not been injected.');
    }
    var result = adapter.execute(request, context);
    if (!result || typeof result !== 'object') throw new Error('Storage adapter returned an invalid result: ' + backendName);
    result.backend = result.backend || backendName;
    result.operation = result.operation || request.operation;
    result.version = result.version || ns.VERSION;
    return result;
  };

  ns.healthCheck = function (backend) {
    return ns.execute({ backend: backend, operation: 'healthCheck' });
  };

  function googleSheetsAdapter() {
    return {
      name: 'GOOGLE_SHEETS',
      mode: 'PERSISTENT',
      persistent: true,
      capabilities: ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction'],
      isConfigured: function (services) {
        return !!(services.GoogleSheetsClient || (typeof SpreadsheetApp !== 'undefined'));
      },
      execute: function (request, context) {
        var client = context.services.GoogleSheetsClient;
        if (client && typeof client.execute === 'function') return client.execute(request, context);
        if (request.operation === 'healthCheck') {
          var active = null;
          try { active = SpreadsheetApp.getActiveSpreadsheet() || null; } catch (err) { active = null; }
          return { ok: true, status: 'AVAILABLE', hasActiveSpreadsheet: !!active, recordsRead: 0, recordsWritten: 0 };
        }
        return unsupported('GOOGLE_SHEETS', request.operation, 'A GoogleSheetsClient must be injected for data operations.');
      }
    };
  }

  function delegatedAdapter(name, serviceName, capabilities) {
    return {
      name: name,
      mode: 'PERSISTENT',
      persistent: true,
      capabilities: capabilities,
      isConfigured: function (services) {
        return !!(services[serviceName] && typeof services[serviceName].execute === 'function');
      },
      execute: function (request, context) {
        return context.services[serviceName].execute(request, context);
      }
    };
  }

  function localAdapter() {
    var buckets = {};
    function bucket(name) {
      name = String(name || 'default');
      if (!buckets[name]) buckets[name] = [];
      return buckets[name];
    }
    return {
      name: 'LOCAL_RUNTIME',
      mode: 'EPHEMERAL',
      persistent: false,
      capabilities: ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction'],
      isConfigured: function () { return true; },
      execute: function (request) {
        var rows = bucket(request.collection);
        var op = request.operation;
        if (op === 'healthCheck') return { ok: true, status: 'AVAILABLE', recordsRead: 0, recordsWritten: 0 };
        if (op === 'read' || op === 'query') return { ok: true, status: 'SUCCESS', data: rows.slice(), recordsRead: rows.length, recordsWritten: 0 };
        if (op === 'write') { buckets[String(request.collection || 'default')] = (request.data || []).slice(); return { ok: true, status: 'SUCCESS', recordsRead: 0, recordsWritten: (request.data || []).length }; }
        if (op === 'append') { var values = request.data || []; Array.prototype.push.apply(rows, values); return { ok: true, status: 'SUCCESS', recordsRead: 0, recordsWritten: values.length }; }
        if (op === 'remove') { var removed = rows.length; buckets[String(request.collection || 'default')] = []; return { ok: true, status: 'SUCCESS', recordsRead: 0, recordsWritten: removed }; }
        if (op === 'transaction') {
          var operations = request.operations || [];
          var results = [];
          for (var i = 0; i < operations.length; i++) results.push(ns.execute(copyTransactionRequest(operations[i])));
          return { ok: true, status: 'SUCCESS', results: results, recordsRead: 0, recordsWritten: 0 };
        }
        return unsupported('LOCAL_RUNTIME', op, 'Operation is not implemented by the local adapter.');
      }
    };
  }

  function copyTransactionRequest(operation) {
    var request = copy(operation);
    request.backend = 'LOCAL_RUNTIME';
    return request;
  }

  ns.register(googleSheetsAdapter());
  ns.register(delegatedAdapter('BIGQUERY', 'BigQueryClient', ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction']));
  ns.register(delegatedAdapter('CLOUD_SQL', 'CloudSqlClient', ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction']));
  ns.register(delegatedAdapter('FIRESTORE', 'FirestoreClient', ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction']));
  ns.register(localAdapter());

  return ns;
})();
