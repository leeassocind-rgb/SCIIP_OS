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
