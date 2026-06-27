/*******************************************************
 * 2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor.gs
 *******************************************************/

function sciipRun2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor() {
  return sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor();
}

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor() {
  const processor =
    '2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor';

  const inputSheetName =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION';

  const outputSheetName =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER';

  const outputHeaders = [
    'Activation_Ledger_ID',
    'Business_Key',
    'Source_Business_Key',
    'Review_Date',
    'Ledger_Status',
    'Ledger_Type',
    'Activation_Status',
    'Activation_Reference',
    'Summary',
    'Created_At',
    'Processor'
  ];

  sciipEnsureSheetWithHeaders(outputSheetName, outputHeaders);

  const inputRows = sciipGetSheetRecords(inputSheetName);

  if (!inputRows || inputRows.length === 0) {
    return {
      processor: processor,
      status: 'SKIPPED_NO_INPUTS',
      activationLedgerEntriesCreated: 0,
      completedAt: sciipNowIso()
    };
  }

  const latestActivation = inputRows[inputRows.length - 1];

  const reviewDate =
    latestActivation.Review_Date ||
    latestActivation.Activation_Date ||
    sciipResolveBusinessDate();

  const sourceBusinessKey =
    latestActivation.Business_Key ||
    latestActivation.Activation_Business_Key ||
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION|' + reviewDate;

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER|' + reviewDate;

  if (sciipBusinessKeyExists(outputSheetName, businessKey)) {
    return {
      processor: processor,
      status: 'SUCCESS',
      activationLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: sciipNowIso()
    };
  }

  const activationLedgerId =
    sciipCreateId('AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER');

  const activationStatus =
    latestActivation.Activation_Status ||
    latestActivation.Status ||
    'ACTIVATED';

  const activationReference = JSON.stringify({
    sourceBusinessKey: sourceBusinessKey,
    reviewDate: reviewDate,
    activationStatus: activationStatus,
    sourceProcessor: latestActivation.Processor || ''
  });

  const row = [
    activationLedgerId,
    businessKey,
    sourceBusinessKey,
    reviewDate,
    'RECORDED',
    'ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    activationStatus,
    activationReference,
    'Architecture review activation recorded into permanent activation ledger.',
    sciipNowIso(),
    processor
  ];

  sciipAppendRow(outputSheetName, row);

  return {
    processor: processor,
    status: 'SUCCESS',
    activationLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: sciipNowIso()
  };
}