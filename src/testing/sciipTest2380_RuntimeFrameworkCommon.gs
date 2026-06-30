function sciipTest2380_RuntimeFrameworkCommon() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2380_RuntimeFrameworkCommon',
    action: 'RUNTIME_FRAMEWORK_BOOTSTRAP',
    buildPayload: function() {
      return {
        processor: '2380_RuntimeFrameworkCommon',
        status: 'TEST_PAYLOAD_CREATED',
        count: 1
      };
    },
    execute: function(payload) {
      return {
        status: 'SUCCESS',
        recordsCreated: 1,
        message: 'Runtime framework common module validated.'
      };
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2380_RuntimeFrameworkCommon',
    result: result
  }));

  return result;
}