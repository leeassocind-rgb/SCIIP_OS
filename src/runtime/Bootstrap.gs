/* ==========================================================
   SCIIP_OS
   Module: Runtime
   File: Bootstrap.gs

   Purpose:
   Bootstraps SCIIP_OS runtime execution.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Primary SCIIP runtime entry point.
 *
 * @param {Object=} options
 * @returns {Object}
 */
function sciipBootstrap(options) {

  const startedAt =
    sciipNowIso();

  const context =
    sciipCreateRuntimeContext(
      options || {}
    );

  const processorResults =
    sciipRunEnabledProcessors(
      context
    );

  const queueResults =
    sciipRunQueue();

  return {

    platform:
      SCIIP.SHORT_NAME,

    version:
      SCIIP.VERSION,

    status:
      'BOOTSTRAP_COMPLETE',

    startedAt:
      startedAt,

    completedAt:
      sciipNowIso(),

    context:
      context,

    processors:
      processorResults,

    queueResults:
      queueResults
  };
}

/**
 * Creates a standard runtime context.
 *
 * @param {Object=} options
 * @returns {Object}
 */
function sciipCreateRuntimeContext(
  options
) {

  const runtimeOptions =
    options || {};

  return {

    platform:
      SCIIP.SHORT_NAME,

    version:
      SCIIP.VERSION,

    region:
      SCIIP.REGION,

    architecture:
      SCIIP.ARCHITECTURE,

    coreObject:
      SCIIP.CORE_OBJECT,

    sourceOfTruth:
      SCIIP.SOURCE_OF_TRUTH,

    runtime:
      SCIIP.RUNTIME,

    runId:
      sciipCreateRunId(),

    mode:
      runtimeOptions.mode ||
      'STANDARD',

    dryRun:
      runtimeOptions.dryRun ===
      true,

    startedAt:
      sciipNowIso(),

    options:
      runtimeOptions
  };
}

/**
 * Creates a unique run ID.
 *
 * @returns {string}
 */
function sciipCreateRunId() {

  return (
    'SCIIP_RUN_' +
    Utilities.getUuid()
  );
}

/**
 * Manual smoke test.
 *
 * @returns {Object}
 */
function sciipSmokeTest() {

  return {

    status: 'OK',

    platform:
      SCIIP.SHORT_NAME,

    version:
      SCIIP.VERSION,

    timestamp:
      sciipNowIso(),

    registeredProcessors:
      sciipGetProcessorRegistry()
        .length,

    queueStats:
      sciipQueueStats()
  };
}