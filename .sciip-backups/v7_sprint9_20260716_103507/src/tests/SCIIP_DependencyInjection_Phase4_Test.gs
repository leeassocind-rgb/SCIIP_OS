/** SCIIP_OS v6.1 Phase 4 dependency-injection regression. */
function sciipTestDependencyInjectionPhase4() {
  var required = SCIIP_SERVICE_CONTAINER.CORE_SERVICES.slice();
  var missing = required.filter(function (name) { return !SCIIP_SERVICE_CONTAINER.has(name); });
  var mockLog = [];
  var mockDate = { dateKey: function () { return '2099-12-31'; } };
  var mockLogger = { info: function (event, payload) { mockLog.push({ event: event, payload: payload }); } };
  var scopedResult = SCIIP_SERVICE_CONTAINER.withOverrides({
    DateService: mockDate,
    LoggingService: mockLogger
  }, function (container) {
    return {
      dateKey: container.resolve('DateService').dateKey(new Date()),
      loggerIsMock: container.resolve('LoggingService') === mockLogger
    };
  });
  var restored = SCIIP_SERVICE_CONTAINER.resolve('DateService') !== mockDate;
  var snapshot = SCIIP_SERVICE_CONTAINER.snapshot();
  var status = !missing.length && scopedResult.dateKey === '2099-12-31' && scopedResult.loggerIsMock && restored;
  var result = {
    test: 'sciipTestDependencyInjectionPhase4',
    status: status ? 'PASSED' : 'FAILED',
    coreServices: required,
    missingServices: missing,
    scopedOverride: scopedResult,
    restoredAfterScope: restored,
    registrations: snapshot.length,
    version: SCIIP_SERVICE_CONTAINER.VERSION
  };
  Logger.log(JSON.stringify(result));
  return result;
}
