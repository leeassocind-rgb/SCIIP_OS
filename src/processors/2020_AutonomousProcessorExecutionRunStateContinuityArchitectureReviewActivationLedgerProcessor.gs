/*******************************************************
 * 2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor.gs
 *******************************************************/

function sciipRun2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor() {
  return sciipRunArchitectureReviewLedgerProcessor_({
    processorNumber: 2020,
    processorName: 'AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor',

    inputSheetName:
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION',

    outputSheetName:
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',

    outputIdPrefix:
      'ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',

    businessKeyPrefix:
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',

    sourceBusinessKeyPrefix:
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION',

    ledgerType:
      'ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',

    compactPayloadType:
      'ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',

    summary:
      'Architecture review activation recorded into permanent activation ledger.',

    createdCountField:
      'activationLedgerEntriesCreated'
  });
}