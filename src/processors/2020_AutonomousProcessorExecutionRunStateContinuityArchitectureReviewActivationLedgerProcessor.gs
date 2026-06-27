/*******************************************************
 * 2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor.gs
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor() {
  const processor = '2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor';

  const inputSheetName =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION';

  const outputSheetName =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER';

  const outputHeaders = [
    'Activation_Ledger_ID',
    'Business_Key',
    'Source_Business_Key',
    'Review_Date',
    'Ledger_Type',
    'Ledger_Status',
    'Activation_Reference',
    'Summary',
    'Created_At',
    'Processor'
  ];

  SCIIP.ensureSheetWithHeaders(outputSheetName, outputHeaders);

  const inputSheet = SCIIP.getSheet(inputSheetName);
  if (!inputSheet) {
    return {
      processor,
      status: 'SKIPPED_NO_INPUT_SHEET',
      activationLedgerEntriesCreated: 0,
      completedAt: SCIIP.nowIso()
    };
  }

  const rows = SCIIP.getSheetRecords(inputSheetName);
  if (!rows.length) {
    return {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      activationLedgerEntriesCreated: 0,
      completedAt: SCIIP.nowIso()
    };
  }

  const latest = rows[rows.length - 1];

  const reviewDate =
    latest.Review_Date ||
    latest.Activation_Date ||
    SCIIP.resolveBusinessDate();

  const sourceBusinessKey =
    latest.Business_Key ||
    latest.Activation_Business_Key ||
    `AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION|${reviewDate}`;

  const businessKey =
    `AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER|${reviewDate}`;

  if (SCIIP.businessKeyExists(outputSheetName, businessKey)) {
    return {
      processor,
      status: 'SUCCESS',
      activationLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: SCIIP.nowIso()
    };
  }

  const ledgerId = SCIIP.createId('AR_ACTIVATION_LEDGER');

  const activationReference = JSON.stringify({
    sourceBusinessKey,
    sourceProcessor: latest.Processor || '',
    sourceStatus: latest.Activation_Status || latest.Status || '',
    reviewDate
  });

  const row = [
    ledgerId,
    businessKey,
    sourceBusinessKey,
    reviewDate,
    'ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    'RECORDED',
    activationReference,
    'Architecture review activation recorded in permanent activation ledger.',
    SCIIP.nowIso(),
    processor
  ];

  SCIIP.appendRow(outputSheetName, row);

  return {
    processor,
    status: 'SUCCESS',
    activationLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: SCIIP.nowIso()
  };
}