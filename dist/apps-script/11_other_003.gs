/** SCIIP_OS compiled bundle: 11_other_003.gs
 * sources: 41
 * generated: 2026-07-25T20:28:39.332Z
 */
/***************************************
 * SCIIP_OS v5.4 / Runtime v5.2
 * Batch: 5210–5300
 * Autonomous Production Runtime Control
 *
 * Paste below the validated 3420–5200 batch files.
 * Requires helper: sciipPatch3420_3610Run_
 ***************************************/


function sciipRun5210_SuperSheetImportExecutionAutonomousProductionRuntimeControlProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5210_SuperSheetImportExecutionAutonomousProductionRuntimeControl',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_GOVERNANCE_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeControlId',
      'autonomousProductionRuntimeControlStatus',
      'autonomousProductionRuntimeControlResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMECONTROLREADY',
    summary: 'Autonomous Production Runtime Control runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5210 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_GOVERNANCE_ACCEPTANCE_LEDGER_SUMMARY.',
    nextProcessor: '5220_SuperSheetImportExecutionAutonomousProductionRuntimeControlLedgerProcessor'
  });
}

function run5210_SuperSheetImportExecutionAutonomousProductionRuntimeControlProcessor() {
  return sciipRun5210_SuperSheetImportExecutionAutonomousProductionRuntimeControlProcessor();
}

function sciipTest5210_SuperSheetImportExecutionAutonomousProductionRuntimeControlProcessor() {
  var result = sciipRun5210_SuperSheetImportExecutionAutonomousProductionRuntimeControlProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5210_SuperSheetImportExecutionAutonomousProductionRuntimeControlProcessor',
    result: result
  }));
  return result;
}


function sciipRun5220_SuperSheetImportExecutionAutonomousProductionRuntimeControlLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5220_SuperSheetImportExecutionAutonomousProductionRuntimeControlLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeControlLedgerId',
      'autonomousProductionRuntimeControlLedgerStatus',
      'autonomousProductionRuntimeControlLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMECONTROLLEDGERREADY',
    summary: 'Autonomous Production Runtime Control Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5220 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL.',
    nextProcessor: '5230_SuperSheetImportExecutionAutonomousProductionRuntimeControlCloseoutProcessor'
  });
}

function run5220_SuperSheetImportExecutionAutonomousProductionRuntimeControlLedgerProcessor() {
  return sciipRun5220_SuperSheetImportExecutionAutonomousProductionRuntimeControlLedgerProcessor();
}

function sciipTest5220_SuperSheetImportExecutionAutonomousProductionRuntimeControlLedgerProcessor() {
  var result = sciipRun5220_SuperSheetImportExecutionAutonomousProductionRuntimeControlLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5220_SuperSheetImportExecutionAutonomousProductionRuntimeControlLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5230_SuperSheetImportExecutionAutonomousProductionRuntimeControlCloseoutProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5230_SuperSheetImportExecutionAutonomousProductionRuntimeControlCloseout',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CLOSEOUTS',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CLOSEOUTS',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CLOSEOUTS_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeControlCloseoutId',
      'autonomousProductionRuntimeControlCloseoutStatus',
      'autonomousProductionRuntimeControlCloseoutResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMECONTROLCLOSEOUTREADY',
    summary: 'Autonomous Production Runtime Control Closeout runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5230 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_LEDGER_SUMMARY.',
    nextProcessor: '5240_SuperSheetImportExecutionAutonomousProductionRuntimeControlArchiveProcessor'
  });
}

function run5230_SuperSheetImportExecutionAutonomousProductionRuntimeControlCloseoutProcessor() {
  return sciipRun5230_SuperSheetImportExecutionAutonomousProductionRuntimeControlCloseoutProcessor();
}

function sciipTest5230_SuperSheetImportExecutionAutonomousProductionRuntimeControlCloseoutProcessor() {
  var result = sciipRun5230_SuperSheetImportExecutionAutonomousProductionRuntimeControlCloseoutProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5230_SuperSheetImportExecutionAutonomousProductionRuntimeControlCloseoutProcessor',
    result: result
  }));
  return result;
}


function sciipRun5240_SuperSheetImportExecutionAutonomousProductionRuntimeControlArchiveProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5240_SuperSheetImportExecutionAutonomousProductionRuntimeControlArchive',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ARCHIVE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CLOSEOUTS',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ARCHIVE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ARCHIVE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeControlArchiveId',
      'autonomousProductionRuntimeControlArchiveStatus',
      'autonomousProductionRuntimeControlArchiveResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMECONTROLARCHIVEREADY',
    summary: 'Autonomous Production Runtime Control Archive runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5240 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CLOSEOUTS.',
    nextProcessor: '5250_SuperSheetImportExecutionAutonomousProductionRuntimeControlReconciliationProcessor'
  });
}

function run5240_SuperSheetImportExecutionAutonomousProductionRuntimeControlArchiveProcessor() {
  return sciipRun5240_SuperSheetImportExecutionAutonomousProductionRuntimeControlArchiveProcessor();
}

function sciipTest5240_SuperSheetImportExecutionAutonomousProductionRuntimeControlArchiveProcessor() {
  var result = sciipRun5240_SuperSheetImportExecutionAutonomousProductionRuntimeControlArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5240_SuperSheetImportExecutionAutonomousProductionRuntimeControlArchiveProcessor',
    result: result
  }));
  return result;
}


function sciipRun5250_SuperSheetImportExecutionAutonomousProductionRuntimeControlReconciliationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5250_SuperSheetImportExecutionAutonomousProductionRuntimeControlReconciliation',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_RECONCILIATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ARCHIVE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_RECONCILIATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_RECONCILIATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeControlReconciliationId',
      'autonomousProductionRuntimeControlReconciliationStatus',
      'autonomousProductionRuntimeControlReconciliationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMECONTROLRECONCILIATIONREADY',
    summary: 'Autonomous Production Runtime Control Reconciliation runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5250 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ARCHIVE.',
    nextProcessor: '5260_SuperSheetImportExecutionAutonomousProductionRuntimeControlCompletionProcessor'
  });
}

function run5250_SuperSheetImportExecutionAutonomousProductionRuntimeControlReconciliationProcessor() {
  return sciipRun5250_SuperSheetImportExecutionAutonomousProductionRuntimeControlReconciliationProcessor();
}

function sciipTest5250_SuperSheetImportExecutionAutonomousProductionRuntimeControlReconciliationProcessor() {
  var result = sciipRun5250_SuperSheetImportExecutionAutonomousProductionRuntimeControlReconciliationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5250_SuperSheetImportExecutionAutonomousProductionRuntimeControlReconciliationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5260_SuperSheetImportExecutionAutonomousProductionRuntimeControlCompletionProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5260_SuperSheetImportExecutionAutonomousProductionRuntimeControlCompletion',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_COMPLETION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_RECONCILIATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_COMPLETION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_COMPLETION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeControlCompletionId',
      'autonomousProductionRuntimeControlCompletionStatus',
      'autonomousProductionRuntimeControlCompletionResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMECONTROLCOMPLETIONREADY',
    summary: 'Autonomous Production Runtime Control Completion runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5260 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_RECONCILIATION.',
    nextProcessor: '5270_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationProcessor'
  });
}

function run5260_SuperSheetImportExecutionAutonomousProductionRuntimeControlCompletionProcessor() {
  return sciipRun5260_SuperSheetImportExecutionAutonomousProductionRuntimeControlCompletionProcessor();
}

function sciipTest5260_SuperSheetImportExecutionAutonomousProductionRuntimeControlCompletionProcessor() {
  var result = sciipRun5260_SuperSheetImportExecutionAutonomousProductionRuntimeControlCompletionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5260_SuperSheetImportExecutionAutonomousProductionRuntimeControlCompletionProcessor',
    result: result
  }));
  return result;
}


function sciipRun5270_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5270_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertification',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CERTIFICATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_COMPLETION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CERTIFICATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CERTIFICATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeControlCertificationId',
      'autonomousProductionRuntimeControlCertificationStatus',
      'autonomousProductionRuntimeControlCertificationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMECONTROLCERTIFICATIONREADY',
    summary: 'Autonomous Production Runtime Control Certification runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5270 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_COMPLETION.',
    nextProcessor: '5280_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationLedgerProcessor'
  });
}

function run5270_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationProcessor() {
  return sciipRun5270_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationProcessor();
}

function sciipTest5270_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationProcessor() {
  var result = sciipRun5270_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5270_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5280_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5280_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CERTIFICATION_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CERTIFICATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CERTIFICATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CERTIFICATION_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeControlCertificationLedgerId',
      'autonomousProductionRuntimeControlCertificationLedgerStatus',
      'autonomousProductionRuntimeControlCertificationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMECONTROLCERTIFICATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime Control Certification Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5280 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CERTIFICATION.',
    nextProcessor: '5290_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceProcessor'
  });
}

function run5280_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationLedgerProcessor() {
  return sciipRun5280_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationLedgerProcessor();
}

function sciipTest5280_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationLedgerProcessor() {
  var result = sciipRun5280_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5280_SuperSheetImportExecutionAutonomousProductionRuntimeControlCertificationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5290_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5290_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptance',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ACCEPTANCE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CERTIFICATION_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ACCEPTANCE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeControlAcceptanceId',
      'autonomousProductionRuntimeControlAcceptanceStatus',
      'autonomousProductionRuntimeControlAcceptanceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMECONTROLACCEPTANCEREADY',
    summary: 'Autonomous Production Runtime Control Acceptance runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5290 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_CERTIFICATION_LEDGER_SUMMARY.',
    nextProcessor: '5300_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceLedgerProcessor'
  });
}

function run5290_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceProcessor() {
  return sciipRun5290_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceProcessor();
}

function sciipTest5290_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceProcessor() {
  var result = sciipRun5290_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5290_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceProcessor',
    result: result
  }));
  return result;
}


function sciipRun5300_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5300_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ACCEPTANCE_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ACCEPTANCE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ACCEPTANCE_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ACCEPTANCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeControlAcceptanceLedgerId',
      'autonomousProductionRuntimeControlAcceptanceLedgerStatus',
      'autonomousProductionRuntimeControlAcceptanceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMECONTROLACCEPTANCELEDGERREADY',
    summary: 'Autonomous Production Runtime Control Acceptance Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5300 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ACCEPTANCE.',
    nextProcessor: '5310_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingProcessor'
  });
}

function run5300_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceLedgerProcessor() {
  return sciipRun5300_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceLedgerProcessor();
}

function sciipTest5300_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceLedgerProcessor() {
  var result = sciipRun5300_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5300_SuperSheetImportExecutionAutonomousProductionRuntimeControlAcceptanceLedgerProcessor',
    result: result
  }));
  return result;
}

/***************************************
 * SCIIP_OS v5.4 / Runtime v5.2
 * Batch: 5310–5400
 * Autonomous Production Runtime Scheduling
 *
 * Paste below the validated 3420–5300 batch files.
 * Requires helper: sciipPatch3420_3610Run_
 ***************************************/


function sciipRun5310_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5310_SuperSheetImportExecutionAutonomousProductionRuntimeScheduling',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSchedulingId',
      'autonomousProductionRuntimeSchedulingStatus',
      'autonomousProductionRuntimeSchedulingResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESCHEDULINGREADY',
    summary: 'Autonomous Production Runtime Scheduling runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5310 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_CONTROL_ACCEPTANCE_LEDGER_SUMMARY.',
    nextProcessor: '5320_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingLedgerProcessor'
  });
}

function run5310_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingProcessor() {
  return sciipRun5310_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingProcessor();
}

function sciipTest5310_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingProcessor() {
  var result = sciipRun5310_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5310_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingProcessor',
    result: result
  }));
  return result;
}


function sciipRun5320_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5320_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSchedulingLedgerId',
      'autonomousProductionRuntimeSchedulingLedgerStatus',
      'autonomousProductionRuntimeSchedulingLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESCHEDULINGLEDGERREADY',
    summary: 'Autonomous Production Runtime Scheduling Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5320 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING.',
    nextProcessor: '5330_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCloseoutProcessor'
  });
}

function run5320_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingLedgerProcessor() {
  return sciipRun5320_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingLedgerProcessor();
}

function sciipTest5320_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingLedgerProcessor() {
  var result = sciipRun5320_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5320_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5330_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCloseoutProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5330_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCloseout',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CLOSEOUTS',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CLOSEOUTS',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CLOSEOUTS_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSchedulingCloseoutId',
      'autonomousProductionRuntimeSchedulingCloseoutStatus',
      'autonomousProductionRuntimeSchedulingCloseoutResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESCHEDULINGCLOSEOUTREADY',
    summary: 'Autonomous Production Runtime Scheduling Closeout runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5330 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_LEDGER_SUMMARY.',
    nextProcessor: '5340_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingArchiveProcessor'
  });
}

function run5330_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCloseoutProcessor() {
  return sciipRun5330_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCloseoutProcessor();
}

function sciipTest5330_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCloseoutProcessor() {
  var result = sciipRun5330_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCloseoutProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5330_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCloseoutProcessor',
    result: result
  }));
  return result;
}


function sciipRun5340_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingArchiveProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5340_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingArchive',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ARCHIVE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CLOSEOUTS',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ARCHIVE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ARCHIVE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSchedulingArchiveId',
      'autonomousProductionRuntimeSchedulingArchiveStatus',
      'autonomousProductionRuntimeSchedulingArchiveResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESCHEDULINGARCHIVEREADY',
    summary: 'Autonomous Production Runtime Scheduling Archive runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5340 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CLOSEOUTS.',
    nextProcessor: '5350_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingReconciliationProcessor'
  });
}

function run5340_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingArchiveProcessor() {
  return sciipRun5340_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingArchiveProcessor();
}

function sciipTest5340_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingArchiveProcessor() {
  var result = sciipRun5340_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5340_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingArchiveProcessor',
    result: result
  }));
  return result;
}


function sciipRun5350_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingReconciliationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5350_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingReconciliation',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_RECONCILIATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ARCHIVE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_RECONCILIATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_RECONCILIATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSchedulingReconciliationId',
      'autonomousProductionRuntimeSchedulingReconciliationStatus',
      'autonomousProductionRuntimeSchedulingReconciliationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESCHEDULINGRECONCILIATIONREADY',
    summary: 'Autonomous Production Runtime Scheduling Reconciliation runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5350 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ARCHIVE.',
    nextProcessor: '5360_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCompletionProcessor'
  });
}

function run5350_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingReconciliationProcessor() {
  return sciipRun5350_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingReconciliationProcessor();
}

function sciipTest5350_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingReconciliationProcessor() {
  var result = sciipRun5350_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingReconciliationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5350_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingReconciliationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5360_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCompletionProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5360_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCompletion',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_COMPLETION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_RECONCILIATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_COMPLETION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_COMPLETION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSchedulingCompletionId',
      'autonomousProductionRuntimeSchedulingCompletionStatus',
      'autonomousProductionRuntimeSchedulingCompletionResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESCHEDULINGCOMPLETIONREADY',
    summary: 'Autonomous Production Runtime Scheduling Completion runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5360 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_RECONCILIATION.',
    nextProcessor: '5370_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationProcessor'
  });
}

function run5360_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCompletionProcessor() {
  return sciipRun5360_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCompletionProcessor();
}

function sciipTest5360_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCompletionProcessor() {
  var result = sciipRun5360_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCompletionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5360_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCompletionProcessor',
    result: result
  }));
  return result;
}


function sciipRun5370_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5370_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertification',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CERTIFICATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_COMPLETION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CERTIFICATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CERTIFICATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSchedulingCertificationId',
      'autonomousProductionRuntimeSchedulingCertificationStatus',
      'autonomousProductionRuntimeSchedulingCertificationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESCHEDULINGCERTIFICATIONREADY',
    summary: 'Autonomous Production Runtime Scheduling Certification runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5370 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_COMPLETION.',
    nextProcessor: '5380_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationLedgerProcessor'
  });
}

function run5370_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationProcessor() {
  return sciipRun5370_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationProcessor();
}

function sciipTest5370_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationProcessor() {
  var result = sciipRun5370_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5370_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5380_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5380_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CERTIFICATION_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CERTIFICATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CERTIFICATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CERTIFICATION_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSchedulingCertificationLedgerId',
      'autonomousProductionRuntimeSchedulingCertificationLedgerStatus',
      'autonomousProductionRuntimeSchedulingCertificationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESCHEDULINGCERTIFICATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime Scheduling Certification Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5380 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CERTIFICATION.',
    nextProcessor: '5390_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceProcessor'
  });
}

function run5380_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationLedgerProcessor() {
  return sciipRun5380_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationLedgerProcessor();
}

function sciipTest5380_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationLedgerProcessor() {
  var result = sciipRun5380_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5380_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingCertificationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5390_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5390_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptance',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ACCEPTANCE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CERTIFICATION_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ACCEPTANCE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSchedulingAcceptanceId',
      'autonomousProductionRuntimeSchedulingAcceptanceStatus',
      'autonomousProductionRuntimeSchedulingAcceptanceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESCHEDULINGACCEPTANCEREADY',
    summary: 'Autonomous Production Runtime Scheduling Acceptance runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5390 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_CERTIFICATION_LEDGER_SUMMARY.',
    nextProcessor: '5400_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceLedgerProcessor'
  });
}

function run5390_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceProcessor() {
  return sciipRun5390_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceProcessor();
}

function sciipTest5390_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceProcessor() {
  var result = sciipRun5390_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5390_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceProcessor',
    result: result
  }));
  return result;
}


function sciipRun5400_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5400_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ACCEPTANCE_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ACCEPTANCE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ACCEPTANCE_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ACCEPTANCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSchedulingAcceptanceLedgerId',
      'autonomousProductionRuntimeSchedulingAcceptanceLedgerStatus',
      'autonomousProductionRuntimeSchedulingAcceptanceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESCHEDULINGACCEPTANCELEDGERREADY',
    summary: 'Autonomous Production Runtime Scheduling Acceptance Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5400 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ACCEPTANCE.',
    nextProcessor: '5410_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationProcessor'
  });
}

function run5400_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceLedgerProcessor() {
  return sciipRun5400_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceLedgerProcessor();
}

function sciipTest5400_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceLedgerProcessor() {
  var result = sciipRun5400_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5400_SuperSheetImportExecutionAutonomousProductionRuntimeSchedulingAcceptanceLedgerProcessor',
    result: result
  }));
  return result;
}

/***************************************
 * SCIIP_OS v5.4 / Runtime v5.2
 * Batch: 5410–5500
 * Autonomous Production Runtime Optimization
 *
 * Paste below the validated 3420–5400 batch files.
 * Requires helper: sciipPatch3420_3610Run_
 ***************************************/


function sciipRun5410_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5410_SuperSheetImportExecutionAutonomousProductionRuntimeOptimization',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeOptimizationId',
      'autonomousProductionRuntimeOptimizationStatus',
      'autonomousProductionRuntimeOptimizationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEOPTIMIZATIONREADY',
    summary: 'Autonomous Production Runtime Optimization runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5410 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_SCHEDULING_ACCEPTANCE_LEDGER_SUMMARY.',
    nextProcessor: '5420_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationLedgerProcessor'
  });
}

function run5410_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationProcessor() {
  return sciipRun5410_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationProcessor();
}

function sciipTest5410_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationProcessor() {
  var result = sciipRun5410_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5410_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5420_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5420_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeOptimizationLedgerId',
      'autonomousProductionRuntimeOptimizationLedgerStatus',
      'autonomousProductionRuntimeOptimizationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEOPTIMIZATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime Optimization Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5420 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION.',
    nextProcessor: '5430_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCloseoutProcessor'
  });
}

function run5420_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationLedgerProcessor() {
  return sciipRun5420_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationLedgerProcessor();
}

function sciipTest5420_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationLedgerProcessor() {
  var result = sciipRun5420_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5420_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5430_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCloseoutProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5430_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCloseout',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CLOSEOUTS',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CLOSEOUTS',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CLOSEOUTS_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeOptimizationCloseoutId',
      'autonomousProductionRuntimeOptimizationCloseoutStatus',
      'autonomousProductionRuntimeOptimizationCloseoutResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEOPTIMIZATIONCLOSEOUTREADY',
    summary: 'Autonomous Production Runtime Optimization Closeout runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5430 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_LEDGER_SUMMARY.',
    nextProcessor: '5440_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationArchiveProcessor'
  });
}

function run5430_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCloseoutProcessor() {
  return sciipRun5430_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCloseoutProcessor();
}

function sciipTest5430_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCloseoutProcessor() {
  var result = sciipRun5430_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCloseoutProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5430_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCloseoutProcessor',
    result: result
  }));
  return result;
}


function sciipRun5440_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationArchiveProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5440_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationArchive',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ARCHIVE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CLOSEOUTS',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ARCHIVE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ARCHIVE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeOptimizationArchiveId',
      'autonomousProductionRuntimeOptimizationArchiveStatus',
      'autonomousProductionRuntimeOptimizationArchiveResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEOPTIMIZATIONARCHIVEREADY',
    summary: 'Autonomous Production Runtime Optimization Archive runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5440 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CLOSEOUTS.',
    nextProcessor: '5450_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationReconciliationProcessor'
  });
}

function run5440_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationArchiveProcessor() {
  return sciipRun5440_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationArchiveProcessor();
}

function sciipTest5440_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationArchiveProcessor() {
  var result = sciipRun5440_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5440_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationArchiveProcessor',
    result: result
  }));
  return result;
}


function sciipRun5450_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationReconciliationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5450_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationReconciliation',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_RECONCILIATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ARCHIVE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_RECONCILIATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_RECONCILIATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeOptimizationReconciliationId',
      'autonomousProductionRuntimeOptimizationReconciliationStatus',
      'autonomousProductionRuntimeOptimizationReconciliationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEOPTIMIZATIONRECONCILIATIONREADY',
    summary: 'Autonomous Production Runtime Optimization Reconciliation runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5450 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ARCHIVE.',
    nextProcessor: '5460_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCompletionProcessor'
  });
}

function run5450_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationReconciliationProcessor() {
  return sciipRun5450_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationReconciliationProcessor();
}

function sciipTest5450_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationReconciliationProcessor() {
  var result = sciipRun5450_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationReconciliationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5450_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationReconciliationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5460_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCompletionProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5460_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCompletion',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_COMPLETION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_RECONCILIATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_COMPLETION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_COMPLETION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeOptimizationCompletionId',
      'autonomousProductionRuntimeOptimizationCompletionStatus',
      'autonomousProductionRuntimeOptimizationCompletionResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEOPTIMIZATIONCOMPLETIONREADY',
    summary: 'Autonomous Production Runtime Optimization Completion runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5460 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_RECONCILIATION.',
    nextProcessor: '5470_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationProcessor'
  });
}

function run5460_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCompletionProcessor() {
  return sciipRun5460_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCompletionProcessor();
}

function sciipTest5460_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCompletionProcessor() {
  var result = sciipRun5460_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCompletionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5460_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCompletionProcessor',
    result: result
  }));
  return result;
}


function sciipRun5470_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5470_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertification',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CERTIFICATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_COMPLETION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CERTIFICATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CERTIFICATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeOptimizationCertificationId',
      'autonomousProductionRuntimeOptimizationCertificationStatus',
      'autonomousProductionRuntimeOptimizationCertificationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEOPTIMIZATIONCERTIFICATIONREADY',
    summary: 'Autonomous Production Runtime Optimization Certification runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5470 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_COMPLETION.',
    nextProcessor: '5480_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationLedgerProcessor'
  });
}

function run5470_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationProcessor() {
  return sciipRun5470_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationProcessor();
}

function sciipTest5470_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationProcessor() {
  var result = sciipRun5470_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5470_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5480_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5480_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CERTIFICATION_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CERTIFICATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CERTIFICATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CERTIFICATION_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeOptimizationCertificationLedgerId',
      'autonomousProductionRuntimeOptimizationCertificationLedgerStatus',
      'autonomousProductionRuntimeOptimizationCertificationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEOPTIMIZATIONCERTIFICATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime Optimization Certification Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5480 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CERTIFICATION.',
    nextProcessor: '5490_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceProcessor'
  });
}

function run5480_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationLedgerProcessor() {
  return sciipRun5480_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationLedgerProcessor();
}

function sciipTest5480_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationLedgerProcessor() {
  var result = sciipRun5480_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5480_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationCertificationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5490_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5490_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptance',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ACCEPTANCE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CERTIFICATION_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ACCEPTANCE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeOptimizationAcceptanceId',
      'autonomousProductionRuntimeOptimizationAcceptanceStatus',
      'autonomousProductionRuntimeOptimizationAcceptanceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEOPTIMIZATIONACCEPTANCEREADY',
    summary: 'Autonomous Production Runtime Optimization Acceptance runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5490 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_CERTIFICATION_LEDGER_SUMMARY.',
    nextProcessor: '5500_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceLedgerProcessor'
  });
}

function run5490_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceProcessor() {
  return sciipRun5490_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceProcessor();
}

function sciipTest5490_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceProcessor() {
  var result = sciipRun5490_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5490_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceProcessor',
    result: result
  }));
  return result;
}


function sciipRun5500_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5500_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ACCEPTANCE_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ACCEPTANCE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ACCEPTANCE_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ACCEPTANCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeOptimizationAcceptanceLedgerId',
      'autonomousProductionRuntimeOptimizationAcceptanceLedgerStatus',
      'autonomousProductionRuntimeOptimizationAcceptanceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEOPTIMIZATIONACCEPTANCELEDGERREADY',
    summary: 'Autonomous Production Runtime Optimization Acceptance Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5500 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ACCEPTANCE.',
    nextProcessor: '5510_SuperSheetImportExecutionAutonomousProductionRuntimeLearningProcessor'
  });
}

function run5500_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceLedgerProcessor() {
  return sciipRun5500_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceLedgerProcessor();
}

function sciipTest5500_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceLedgerProcessor() {
  var result = sciipRun5500_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5500_SuperSheetImportExecutionAutonomousProductionRuntimeOptimizationAcceptanceLedgerProcessor',
    result: result
  }));
  return result;
}

/***************************************
 * SCIIP_OS v5.4 / Runtime v5.2
 * Batch: 5510–5600
 * Autonomous Production Runtime Learning
 *
 * Paste below the validated 3420–5500 batch files.
 * Requires helper: sciipPatch3420_3610Run_
 ***************************************/


function sciipRun5510_SuperSheetImportExecutionAutonomousProductionRuntimeLearningProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5510_SuperSheetImportExecutionAutonomousProductionRuntimeLearning',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeLearningId',
      'autonomousProductionRuntimeLearningStatus',
      'autonomousProductionRuntimeLearningResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMELEARNINGREADY',
    summary: 'Autonomous Production Runtime Learning runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5510 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_OPTIMIZATION_ACCEPTANCE_LEDGER_SUMMARY.',
    nextProcessor: '5520_SuperSheetImportExecutionAutonomousProductionRuntimeLearningLedgerProcessor'
  });
}

function run5510_SuperSheetImportExecutionAutonomousProductionRuntimeLearningProcessor() {
  return sciipRun5510_SuperSheetImportExecutionAutonomousProductionRuntimeLearningProcessor();
}

function sciipTest5510_SuperSheetImportExecutionAutonomousProductionRuntimeLearningProcessor() {
  var result = sciipRun5510_SuperSheetImportExecutionAutonomousProductionRuntimeLearningProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5510_SuperSheetImportExecutionAutonomousProductionRuntimeLearningProcessor',
    result: result
  }));
  return result;
}


function sciipRun5520_SuperSheetImportExecutionAutonomousProductionRuntimeLearningLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5520_SuperSheetImportExecutionAutonomousProductionRuntimeLearningLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeLearningLedgerId',
      'autonomousProductionRuntimeLearningLedgerStatus',
      'autonomousProductionRuntimeLearningLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMELEARNINGLEDGERREADY',
    summary: 'Autonomous Production Runtime Learning Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5520 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING.',
    nextProcessor: '5530_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCloseoutProcessor'
  });
}

function run5520_SuperSheetImportExecutionAutonomousProductionRuntimeLearningLedgerProcessor() {
  return sciipRun5520_SuperSheetImportExecutionAutonomousProductionRuntimeLearningLedgerProcessor();
}

function sciipTest5520_SuperSheetImportExecutionAutonomousProductionRuntimeLearningLedgerProcessor() {
  var result = sciipRun5520_SuperSheetImportExecutionAutonomousProductionRuntimeLearningLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5520_SuperSheetImportExecutionAutonomousProductionRuntimeLearningLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5530_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCloseoutProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5530_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCloseout',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CLOSEOUTS',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CLOSEOUTS',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CLOSEOUTS_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeLearningCloseoutId',
      'autonomousProductionRuntimeLearningCloseoutStatus',
      'autonomousProductionRuntimeLearningCloseoutResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMELEARNINGCLOSEOUTREADY',
    summary: 'Autonomous Production Runtime Learning Closeout runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5530 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_LEDGER_SUMMARY.',
    nextProcessor: '5540_SuperSheetImportExecutionAutonomousProductionRuntimeLearningArchiveProcessor'
  });
}

function run5530_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCloseoutProcessor() {
  return sciipRun5530_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCloseoutProcessor();
}

function sciipTest5530_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCloseoutProcessor() {
  var result = sciipRun5530_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCloseoutProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5530_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCloseoutProcessor',
    result: result
  }));
  return result;
}


function sciipRun5540_SuperSheetImportExecutionAutonomousProductionRuntimeLearningArchiveProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5540_SuperSheetImportExecutionAutonomousProductionRuntimeLearningArchive',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ARCHIVE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CLOSEOUTS',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ARCHIVE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ARCHIVE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeLearningArchiveId',
      'autonomousProductionRuntimeLearningArchiveStatus',
      'autonomousProductionRuntimeLearningArchiveResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMELEARNINGARCHIVEREADY',
    summary: 'Autonomous Production Runtime Learning Archive runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5540 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CLOSEOUTS.',
    nextProcessor: '5550_SuperSheetImportExecutionAutonomousProductionRuntimeLearningReconciliationProcessor'
  });
}

function run5540_SuperSheetImportExecutionAutonomousProductionRuntimeLearningArchiveProcessor() {
  return sciipRun5540_SuperSheetImportExecutionAutonomousProductionRuntimeLearningArchiveProcessor();
}

function sciipTest5540_SuperSheetImportExecutionAutonomousProductionRuntimeLearningArchiveProcessor() {
  var result = sciipRun5540_SuperSheetImportExecutionAutonomousProductionRuntimeLearningArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5540_SuperSheetImportExecutionAutonomousProductionRuntimeLearningArchiveProcessor',
    result: result
  }));
  return result;
}


function sciipRun5550_SuperSheetImportExecutionAutonomousProductionRuntimeLearningReconciliationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5550_SuperSheetImportExecutionAutonomousProductionRuntimeLearningReconciliation',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_RECONCILIATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ARCHIVE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_RECONCILIATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_RECONCILIATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeLearningReconciliationId',
      'autonomousProductionRuntimeLearningReconciliationStatus',
      'autonomousProductionRuntimeLearningReconciliationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMELEARNINGRECONCILIATIONREADY',
    summary: 'Autonomous Production Runtime Learning Reconciliation runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5550 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ARCHIVE.',
    nextProcessor: '5560_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCompletionProcessor'
  });
}

function run5550_SuperSheetImportExecutionAutonomousProductionRuntimeLearningReconciliationProcessor() {
  return sciipRun5550_SuperSheetImportExecutionAutonomousProductionRuntimeLearningReconciliationProcessor();
}

function sciipTest5550_SuperSheetImportExecutionAutonomousProductionRuntimeLearningReconciliationProcessor() {
  var result = sciipRun5550_SuperSheetImportExecutionAutonomousProductionRuntimeLearningReconciliationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5550_SuperSheetImportExecutionAutonomousProductionRuntimeLearningReconciliationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5560_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCompletionProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5560_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCompletion',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_COMPLETION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_RECONCILIATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_COMPLETION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_COMPLETION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeLearningCompletionId',
      'autonomousProductionRuntimeLearningCompletionStatus',
      'autonomousProductionRuntimeLearningCompletionResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMELEARNINGCOMPLETIONREADY',
    summary: 'Autonomous Production Runtime Learning Completion runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5560 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_RECONCILIATION.',
    nextProcessor: '5570_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationProcessor'
  });
}

function run5560_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCompletionProcessor() {
  return sciipRun5560_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCompletionProcessor();
}

function sciipTest5560_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCompletionProcessor() {
  var result = sciipRun5560_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCompletionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5560_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCompletionProcessor',
    result: result
  }));
  return result;
}


function sciipRun5570_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5570_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertification',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CERTIFICATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_COMPLETION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CERTIFICATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CERTIFICATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeLearningCertificationId',
      'autonomousProductionRuntimeLearningCertificationStatus',
      'autonomousProductionRuntimeLearningCertificationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMELEARNINGCERTIFICATIONREADY',
    summary: 'Autonomous Production Runtime Learning Certification runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5570 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_COMPLETION.',
    nextProcessor: '5580_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationLedgerProcessor'
  });
}

function run5570_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationProcessor() {
  return sciipRun5570_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationProcessor();
}

function sciipTest5570_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationProcessor() {
  var result = sciipRun5570_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5570_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5580_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5580_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CERTIFICATION_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CERTIFICATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CERTIFICATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CERTIFICATION_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeLearningCertificationLedgerId',
      'autonomousProductionRuntimeLearningCertificationLedgerStatus',
      'autonomousProductionRuntimeLearningCertificationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMELEARNINGCERTIFICATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime Learning Certification Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5580 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CERTIFICATION.',
    nextProcessor: '5590_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceProcessor'
  });
}

function run5580_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationLedgerProcessor() {
  return sciipRun5580_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationLedgerProcessor();
}

function sciipTest5580_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationLedgerProcessor() {
  var result = sciipRun5580_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5580_SuperSheetImportExecutionAutonomousProductionRuntimeLearningCertificationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5590_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5590_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptance',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ACCEPTANCE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CERTIFICATION_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ACCEPTANCE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeLearningAcceptanceId',
      'autonomousProductionRuntimeLearningAcceptanceStatus',
      'autonomousProductionRuntimeLearningAcceptanceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMELEARNINGACCEPTANCEREADY',
    summary: 'Autonomous Production Runtime Learning Acceptance runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5590 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_CERTIFICATION_LEDGER_SUMMARY.',
    nextProcessor: '5600_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceLedgerProcessor'
  });
}

function run5590_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceProcessor() {
  return sciipRun5590_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceProcessor();
}

function sciipTest5590_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceProcessor() {
  var result = sciipRun5590_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5590_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceProcessor',
    result: result
  }));
  return result;
}


function sciipRun5600_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5600_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ACCEPTANCE_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ACCEPTANCE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ACCEPTANCE_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ACCEPTANCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeLearningAcceptanceLedgerId',
      'autonomousProductionRuntimeLearningAcceptanceLedgerStatus',
      'autonomousProductionRuntimeLearningAcceptanceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMELEARNINGACCEPTANCELEDGERREADY',
    summary: 'Autonomous Production Runtime Learning Acceptance Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5600 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ACCEPTANCE.',
    nextProcessor: '5610_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphProcessor'
  });
}

function run5600_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceLedgerProcessor() {
  return sciipRun5600_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceLedgerProcessor();
}

function sciipTest5600_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceLedgerProcessor() {
  var result = sciipRun5600_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5600_SuperSheetImportExecutionAutonomousProductionRuntimeLearningAcceptanceLedgerProcessor',
    result: result
  }));
  return result;
}

/***************************************
 * SCIIP_OS v5.4 / Runtime v5.2
 * Batch: 5610–5700
 * Autonomous Production Runtime Knowledge Graph
 *
 * Paste below the validated 3420–5600 batch files.
 * Requires helper: sciipPatch3420_3610Run_
 ***************************************/


function sciipRun5610_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5610_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraph',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeKnowledgeGraphId',
      'autonomousProductionRuntimeKnowledgeGraphStatus',
      'autonomousProductionRuntimeKnowledgeGraphResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEKNOWLEDGEGRAPHREADY',
    summary: 'Autonomous Production Runtime Knowledge Graph runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5610 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_LEARNING_ACCEPTANCE_LEDGER_SUMMARY.',
    nextProcessor: '5620_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphLedgerProcessor'
  });
}

function run5610_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphProcessor() {
  return sciipRun5610_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphProcessor();
}

function sciipTest5610_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphProcessor() {
  var result = sciipRun5610_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5610_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphProcessor',
    result: result
  }));
  return result;
}


function sciipRun5620_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5620_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeKnowledgeGraphLedgerId',
      'autonomousProductionRuntimeKnowledgeGraphLedgerStatus',
      'autonomousProductionRuntimeKnowledgeGraphLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEKNOWLEDGEGRAPHLEDGERREADY',
    summary: 'Autonomous Production Runtime Knowledge Graph Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5620 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH.',
    nextProcessor: '5630_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCloseoutProcessor'
  });
}

function run5620_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphLedgerProcessor() {
  return sciipRun5620_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphLedgerProcessor();
}

function sciipTest5620_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphLedgerProcessor() {
  var result = sciipRun5620_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5620_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5630_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCloseoutProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5630_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCloseout',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CLOSEOUTS',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CLOSEOUTS',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CLOSEOUTS_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeKnowledgeGraphCloseoutId',
      'autonomousProductionRuntimeKnowledgeGraphCloseoutStatus',
      'autonomousProductionRuntimeKnowledgeGraphCloseoutResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEKNOWLEDGEGRAPHCLOSEOUTREADY',
    summary: 'Autonomous Production Runtime Knowledge Graph Closeout runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5630 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_LEDGER_SUMMARY.',
    nextProcessor: '5640_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphArchiveProcessor'
  });
}

function run5630_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCloseoutProcessor() {
  return sciipRun5630_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCloseoutProcessor();
}

function sciipTest5630_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCloseoutProcessor() {
  var result = sciipRun5630_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCloseoutProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5630_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCloseoutProcessor',
    result: result
  }));
  return result;
}


function sciipRun5640_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphArchiveProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5640_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphArchive',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ARCHIVE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CLOSEOUTS',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ARCHIVE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ARCHIVE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeKnowledgeGraphArchiveId',
      'autonomousProductionRuntimeKnowledgeGraphArchiveStatus',
      'autonomousProductionRuntimeKnowledgeGraphArchiveResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEKNOWLEDGEGRAPHARCHIVEREADY',
    summary: 'Autonomous Production Runtime Knowledge Graph Archive runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5640 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CLOSEOUTS.',
    nextProcessor: '5650_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphReconciliationProcessor'
  });
}

function run5640_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphArchiveProcessor() {
  return sciipRun5640_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphArchiveProcessor();
}

function sciipTest5640_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphArchiveProcessor() {
  var result = sciipRun5640_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5640_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphArchiveProcessor',
    result: result
  }));
  return result;
}


function sciipRun5650_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphReconciliationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5650_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphReconciliation',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_RECONCILIATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ARCHIVE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_RECONCILIATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_RECONCILIATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeKnowledgeGraphReconciliationId',
      'autonomousProductionRuntimeKnowledgeGraphReconciliationStatus',
      'autonomousProductionRuntimeKnowledgeGraphReconciliationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEKNOWLEDGEGRAPHRECONCILIATIONREADY',
    summary: 'Autonomous Production Runtime Knowledge Graph Reconciliation runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5650 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ARCHIVE.',
    nextProcessor: '5660_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCompletionProcessor'
  });
}

function run5650_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphReconciliationProcessor() {
  return sciipRun5650_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphReconciliationProcessor();
}

function sciipTest5650_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphReconciliationProcessor() {
  var result = sciipRun5650_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphReconciliationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5650_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphReconciliationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5660_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCompletionProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5660_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCompletion',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_COMPLETION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_RECONCILIATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_COMPLETION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_COMPLETION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeKnowledgeGraphCompletionId',
      'autonomousProductionRuntimeKnowledgeGraphCompletionStatus',
      'autonomousProductionRuntimeKnowledgeGraphCompletionResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEKNOWLEDGEGRAPHCOMPLETIONREADY',
    summary: 'Autonomous Production Runtime Knowledge Graph Completion runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5660 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_RECONCILIATION.',
    nextProcessor: '5670_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationProcessor'
  });
}

function run5660_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCompletionProcessor() {
  return sciipRun5660_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCompletionProcessor();
}

function sciipTest5660_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCompletionProcessor() {
  var result = sciipRun5660_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCompletionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5660_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCompletionProcessor',
    result: result
  }));
  return result;
}


function sciipRun5670_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5670_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertification',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CERTIFICATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_COMPLETION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CERTIFICATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CERTIFICATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeKnowledgeGraphCertificationId',
      'autonomousProductionRuntimeKnowledgeGraphCertificationStatus',
      'autonomousProductionRuntimeKnowledgeGraphCertificationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEKNOWLEDGEGRAPHCERTIFICATIONREADY',
    summary: 'Autonomous Production Runtime Knowledge Graph Certification runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5670 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_COMPLETION.',
    nextProcessor: '5680_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationLedgerProcessor'
  });
}

function run5670_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationProcessor() {
  return sciipRun5670_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationProcessor();
}

function sciipTest5670_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationProcessor() {
  var result = sciipRun5670_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5670_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5680_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5680_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationLedger',
    action: 'AUTO_RUNTIME_KNOWLEDGE_GRAPH_CERT_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CERTIFICATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CERTIFICATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CERTIFICATION_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeKnowledgeGraphCertificationLedgerId',
      'autonomousProductionRuntimeKnowledgeGraphCertificationLedgerStatus',
      'autonomousProductionRuntimeKnowledgeGraphCertificationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEKNOWLEDGEGRAPHCERTIFICATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime Knowledge Graph Certification Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5680 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CERTIFICATION.',
    nextProcessor: '5690_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceProcessor'
  });
}

function run5680_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationLedgerProcessor() {
  return sciipRun5680_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationLedgerProcessor();
}

function sciipTest5680_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationLedgerProcessor() {
  var result = sciipRun5680_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5680_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphCertificationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5690_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5690_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptance',
    action: 'AUTO_RUNTIME_KNOWLEDGE_GRAPH_CERT_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CERTIFICATION_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ACCEPTANCE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeKnowledgeGraphAcceptanceId',
      'autonomousProductionRuntimeKnowledgeGraphAcceptanceStatus',
      'autonomousProductionRuntimeKnowledgeGraphAcceptanceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEKNOWLEDGEGRAPHACCEPTANCEREADY',
    summary: 'Autonomous Production Runtime Knowledge Graph Acceptance runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5690 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_CERTIFICATION_LEDGER_SUMMARY.',
    nextProcessor: '5700_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceLedgerProcessor'
  });
}

function run5690_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceProcessor() {
  return sciipRun5690_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceProcessor();
}

function sciipTest5690_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceProcessor() {
  var result = sciipRun5690_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5690_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceProcessor',
    result: result
  }));
  return result;
}


function sciipRun5700_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5700_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ACCEPTANCE_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ACCEPTANCE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ACCEPTANCE_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ACCEPTANCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeKnowledgeGraphAcceptanceLedgerId',
      'autonomousProductionRuntimeKnowledgeGraphAcceptanceLedgerStatus',
      'autonomousProductionRuntimeKnowledgeGraphAcceptanceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEKNOWLEDGEGRAPHACCEPTANCELEDGERREADY',
    summary: 'Autonomous Production Runtime Knowledge Graph Acceptance Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5700 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ACCEPTANCE.',
    nextProcessor: '5710_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceProcessor'
  });
}

function run5700_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceLedgerProcessor() {
  return sciipRun5700_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceLedgerProcessor();
}

function sciipTest5700_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceLedgerProcessor() {
  var result = sciipRun5700_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5700_SuperSheetImportExecutionAutonomousProductionRuntimeKnowledgeGraphAcceptanceLedgerProcessor',
    result: result
  }));
  return result;
}

/***************************************
 * SCIIP_OS v5.4 / Runtime v5.2
 * Batch: 5710–5800
 * Autonomous Production Runtime Asset Intelligence
 *
 * Paste below the validated 3420–5700 batch files.
 * Requires helper: sciipPatch3420_3610Run_
 ***************************************/


function sciipRun5710_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5710_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligence',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeAssetIntelligenceId',
      'autonomousProductionRuntimeAssetIntelligenceStatus',
      'autonomousProductionRuntimeAssetIntelligenceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEASSETINTELLIGENCEREADY',
    summary: 'Autonomous Production Runtime Asset Intelligence runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5710 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_KNOWLEDGE_GRAPH_ACCEPTANCE_LEDGER_SUMMARY.',
    nextProcessor: '5720_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceLedgerProcessor'
  });
}

function run5710_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceProcessor() {
  return sciipRun5710_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceProcessor();
}

function sciipTest5710_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceProcessor() {
  var result = sciipRun5710_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5710_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceProcessor',
    result: result
  }));
  return result;
}


function sciipRun5720_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5720_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceLedger',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeAssetIntelligenceLedgerId',
      'autonomousProductionRuntimeAssetIntelligenceLedgerStatus',
      'autonomousProductionRuntimeAssetIntelligenceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEASSETINTELLIGENCELEDGERREADY',
    summary: 'Autonomous Production Runtime Asset Intelligence Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5720 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE.',
    nextProcessor: '5730_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCloseoutProcessor'
  });
}

function run5720_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceLedgerProcessor() {
  return sciipRun5720_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceLedgerProcessor();
}

function sciipTest5720_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceLedgerProcessor() {
  var result = sciipRun5720_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5720_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5730_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCloseoutProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5730_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCloseout',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CLOSEOUTS',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CLOSEOUTS',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CLOSEOUTS_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeAssetIntelligenceCloseoutId',
      'autonomousProductionRuntimeAssetIntelligenceCloseoutStatus',
      'autonomousProductionRuntimeAssetIntelligenceCloseoutResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEASSETINTELLIGENCECLOSEOUTREADY',
    summary: 'Autonomous Production Runtime Asset Intelligence Closeout runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5730 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_LEDGER_SUMMARY.',
    nextProcessor: '5740_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceArchiveProcessor'
  });
}

function run5730_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCloseoutProcessor() {
  return sciipRun5730_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCloseoutProcessor();
}

function sciipTest5730_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCloseoutProcessor() {
  var result = sciipRun5730_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCloseoutProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5730_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCloseoutProcessor',
    result: result
  }));
  return result;
}


function sciipRun5740_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceArchiveProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5740_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceArchive',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_ARCHIVE',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CLOSEOUTS',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_ARCHIVE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_ARCHIVE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeAssetIntelligenceArchiveId',
      'autonomousProductionRuntimeAssetIntelligenceArchiveStatus',
      'autonomousProductionRuntimeAssetIntelligenceArchiveResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEASSETINTELLIGENCEARCHIVEREADY',
    summary: 'Autonomous Production Runtime Asset Intelligence Archive runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5740 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CLOSEOUTS.',
    nextProcessor: '5750_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceReconciliationProcessor'
  });
}

function run5740_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceArchiveProcessor() {
  return sciipRun5740_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceArchiveProcessor();
}

function sciipTest5740_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceArchiveProcessor() {
  var result = sciipRun5740_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5740_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceArchiveProcessor',
    result: result
  }));
  return result;
}


function sciipRun5750_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceReconciliationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5750_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceReconciliation',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_RECONCILIATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_ARCHIVE',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_RECONCILIATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_RECONCILIATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeAssetIntelligenceReconciliationId',
      'autonomousProductionRuntimeAssetIntelligenceReconciliationStatus',
      'autonomousProductionRuntimeAssetIntelligenceReconciliationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEASSETINTELLIGENCERECONCILIATIONREADY',
    summary: 'Autonomous Production Runtime Asset Intelligence Reconciliation runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5750 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_ARCHIVE.',
    nextProcessor: '5760_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCompletionProcessor'
  });
}

function run5750_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceReconciliationProcessor() {
  return sciipRun5750_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceReconciliationProcessor();
}

function sciipTest5750_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceReconciliationProcessor() {
  var result = sciipRun5750_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceReconciliationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5750_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceReconciliationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5760_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCompletionProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5760_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCompletion',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_COMPLETION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_RECONCILIATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_COMPLETION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_COMPLETION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeAssetIntelligenceCompletionId',
      'autonomousProductionRuntimeAssetIntelligenceCompletionStatus',
      'autonomousProductionRuntimeAssetIntelligenceCompletionResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEASSETINTELLIGENCECOMPLETIONREADY',
    summary: 'Autonomous Production Runtime Asset Intelligence Completion runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5760 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_RECONCILIATION.',
    nextProcessor: '5770_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationProcessor'
  });
}

function run5760_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCompletionProcessor() {
  return sciipRun5760_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCompletionProcessor();
}

function sciipTest5760_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCompletionProcessor() {
  var result = sciipRun5760_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCompletionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5760_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCompletionProcessor',
    result: result
  }));
  return result;
}


function sciipRun5770_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5770_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertification',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CERTIFICATION',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_COMPLETION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CERTIFICATION',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CERTIFICATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeAssetIntelligenceCertificationId',
      'autonomousProductionRuntimeAssetIntelligenceCertificationStatus',
      'autonomousProductionRuntimeAssetIntelligenceCertificationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEASSETINTELLIGENCECERTIFICATIONREADY',
    summary: 'Autonomous Production Runtime Asset Intelligence Certification runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5770 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_COMPLETION.',
    nextProcessor: '5780_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationLedgerProcessor'
  });
}

function run5770_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationProcessor() {
  return sciipRun5770_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationProcessor();
}

function sciipTest5770_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationProcessor() {
  var result = sciipRun5770_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5770_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5780_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5780_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationLedger',
    action: 'AUTO_RUNTIME_ASSET_INTELLIGENCE_CERT_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CERTIFICATION',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CERTIFICATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CERTIFICATION_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeAssetIntelligenceCertificationLedgerId',
      'autonomousProductionRuntimeAssetIntelligenceCertificationLedgerStatus',
      'autonomousProductionRuntimeAssetIntelligenceCertificationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEASSETINTELLIGENCECERTIFICATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime Asset Intelligence Certification Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5780 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CERTIFICATION.',
    nextProcessor: '5790_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceProcessor'
  });
}

function run5780_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationLedgerProcessor() {
  return sciipRun5780_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationLedgerProcessor();
}

function sciipTest5780_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationLedgerProcessor() {
  var result = sciipRun5780_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5780_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceCertificationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5790_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5790_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptance',
    action: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_ACCEPTANCE',
    sourceSheet: 'AUTO_RUNTIME_ASSET_INTELLIGENCE_CERT_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_ACCEPTANCE',
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeAssetIntelligenceAcceptanceId',
      'autonomousProductionRuntimeAssetIntelligenceAcceptanceStatus',
      'autonomousProductionRuntimeAssetIntelligenceAcceptanceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEASSETINTELLIGENCEACCEPTANCEREADY',
    summary: 'Autonomous Production Runtime Asset Intelligence Acceptance runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5790 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_CERTIFICATION_LEDGER_SUMMARY.',
    nextProcessor: '5800_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceLedgerProcessor'
  });
}

function run5790_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceProcessor() {
  return sciipRun5790_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceProcessor();
}

function sciipTest5790_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceProcessor() {
  var result = sciipRun5790_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5790_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceProcessor',
    result: result
  }));
  return result;
}


function sciipRun5800_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5800_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceLedger',
    action: 'AUTO_RUNTIME_ASSET_INTELLIGENCE_ACCEPTANCE_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_ASSET_INTELLIGENCE_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_ASSET_INTELLIGENCE_ACCEPTANCE_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_ASSET_INTELLIGENCE_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeAssetIntelligenceAcceptanceLedgerId',
      'autonomousProductionRuntimeAssetIntelligenceAcceptanceLedgerStatus',
      'autonomousProductionRuntimeAssetIntelligenceAcceptanceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEASSETINTELLIGENCEACCEPTANCELEDGERREADY',
    summary: 'Autonomous Production Runtime Asset Intelligence Acceptance Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5800 so records exist in SUPERSHEET_IMPORT_EXECUTION_AUTONOMOUS_PRODUCTION_RUNTIME_ASSET_INTELLIGENCE_ACCEPTANCE.',
    nextProcessor: '5810_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceProcessor'
  });
}

function run5800_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceLedgerProcessor() {
  return sciipRun5800_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceLedgerProcessor();
}

function sciipTest5800_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceLedgerProcessor() {
  var result = sciipRun5800_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5800_SuperSheetImportExecutionAutonomousProductionRuntimeAssetIntelligenceAcceptanceLedgerProcessor',
    result: result
  }));
  return result;
}

/***************************************
 * SCIIP_OS v5.4 / Runtime v5.2
 * Batch: 5810–5900
 * Autonomous Production Runtime GIS Intelligence
 *
 * Paste below the validated 3420–5800 batch files.
 * Requires helper: sciipPatch3420_3610Run_
 *
 * Naming convention:
 * - Processor names remain fully canonical.
 * - Physical sheet names are shortened where needed to remain under
 *   Google Sheets' 100-character sheet-name limit.
 ***************************************/


function sciipRun5810_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5810_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligence',
    action: 'AUTO_RUNTIME_GIS_INTELLIGENCE',
    sourceSheet: 'AUTO_RUNTIME_ASSET_INTELLIGENCE_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE',
    ledgerSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeGISIntelligenceId',
      'autonomousProductionRuntimeGISIntelligenceStatus',
      'autonomousProductionRuntimeGISIntelligenceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEGISINTELLIGENCEREADY',
    summary: 'Autonomous Production Runtime GIS Intelligence runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5810 so records exist in AUTO_RUNTIME_ASSET_INTELLIGENCE_ACCEPTANCE_LEDGER_SUMMARY.',
    nextProcessor: '5820_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceLedgerProcessor'
  });
}

function run5810_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceProcessor() {
  return sciipRun5810_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceProcessor();
}

function sciipTest5810_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceProcessor() {
  var result = sciipRun5810_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5810_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceProcessor',
    result: result
  }));
  return result;
}


function sciipRun5820_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5820_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceLedger',
    action: 'AUTO_RUNTIME_GIS_INTELLIGENCE_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE',
    targetSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeGISIntelligenceLedgerId',
      'autonomousProductionRuntimeGISIntelligenceLedgerStatus',
      'autonomousProductionRuntimeGISIntelligenceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEGISINTELLIGENCELEDGERREADY',
    summary: 'Autonomous Production Runtime GIS Intelligence Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5820 so records exist in AUTO_RUNTIME_GIS_INTELLIGENCE.',
    nextProcessor: '5830_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCloseoutProcessor'
  });
}

function run5820_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceLedgerProcessor() {
  return sciipRun5820_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceLedgerProcessor();
}

function sciipTest5820_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceLedgerProcessor() {
  var result = sciipRun5820_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5820_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5830_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCloseoutProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5830_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCloseout',
    action: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CLOSEOUTS',
    sourceSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CLOSEOUTS',
    ledgerSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CLOSEOUTS_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeGISIntelligenceCloseoutId',
      'autonomousProductionRuntimeGISIntelligenceCloseoutStatus',
      'autonomousProductionRuntimeGISIntelligenceCloseoutResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEGISINTELLIGENCECLOSEOUTREADY',
    summary: 'Autonomous Production Runtime GIS Intelligence Closeout runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5830 so records exist in AUTO_RUNTIME_GIS_INTELLIGENCE_LEDGER_SUMMARY.',
    nextProcessor: '5840_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceArchiveProcessor'
  });
}

function run5830_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCloseoutProcessor() {
  return sciipRun5830_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCloseoutProcessor();
}

function sciipTest5830_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCloseoutProcessor() {
  var result = sciipRun5830_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCloseoutProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5830_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCloseoutProcessor',
    result: result
  }));
  return result;
}


function sciipRun5840_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceArchiveProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5840_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceArchive',
    action: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ARCHIVE',
    sourceSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CLOSEOUTS',
    targetSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ARCHIVE',
    ledgerSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ARCHIVE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeGISIntelligenceArchiveId',
      'autonomousProductionRuntimeGISIntelligenceArchiveStatus',
      'autonomousProductionRuntimeGISIntelligenceArchiveResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEGISINTELLIGENCEARCHIVEREADY',
    summary: 'Autonomous Production Runtime GIS Intelligence Archive runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5840 so records exist in AUTO_RUNTIME_GIS_INTELLIGENCE_CLOSEOUTS.',
    nextProcessor: '5850_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceReconciliationProcessor'
  });
}

function run5840_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceArchiveProcessor() {
  return sciipRun5840_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceArchiveProcessor();
}

function sciipTest5840_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceArchiveProcessor() {
  var result = sciipRun5840_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5840_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceArchiveProcessor',
    result: result
  }));
  return result;
}


function sciipRun5850_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceReconciliationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5850_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceReconciliation',
    action: 'AUTO_RUNTIME_GIS_INTELLIGENCE_RECONCILIATION',
    sourceSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ARCHIVE',
    targetSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_RECONCILIATION',
    ledgerSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_RECONCILIATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeGISIntelligenceReconciliationId',
      'autonomousProductionRuntimeGISIntelligenceReconciliationStatus',
      'autonomousProductionRuntimeGISIntelligenceReconciliationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEGISINTELLIGENCERECONCILIATIONREADY',
    summary: 'Autonomous Production Runtime GIS Intelligence Reconciliation runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5850 so records exist in AUTO_RUNTIME_GIS_INTELLIGENCE_ARCHIVE.',
    nextProcessor: '5860_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCompletionProcessor'
  });
}

function run5850_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceReconciliationProcessor() {
  return sciipRun5850_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceReconciliationProcessor();
}

function sciipTest5850_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceReconciliationProcessor() {
  var result = sciipRun5850_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceReconciliationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5850_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceReconciliationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5860_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCompletionProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5860_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCompletion',
    action: 'AUTO_RUNTIME_GIS_INTELLIGENCE_COMPLETION',
    sourceSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_RECONCILIATION',
    targetSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_COMPLETION',
    ledgerSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_COMPLETION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeGISIntelligenceCompletionId',
      'autonomousProductionRuntimeGISIntelligenceCompletionStatus',
      'autonomousProductionRuntimeGISIntelligenceCompletionResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEGISINTELLIGENCECOMPLETIONREADY',
    summary: 'Autonomous Production Runtime GIS Intelligence Completion runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5860 so records exist in AUTO_RUNTIME_GIS_INTELLIGENCE_RECONCILIATION.',
    nextProcessor: '5870_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationProcessor'
  });
}

function run5860_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCompletionProcessor() {
  return sciipRun5860_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCompletionProcessor();
}

function sciipTest5860_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCompletionProcessor() {
  var result = sciipRun5860_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCompletionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5860_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCompletionProcessor',
    result: result
  }));
  return result;
}


function sciipRun5870_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5870_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertification',
    action: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CERTIFICATION',
    sourceSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_COMPLETION',
    targetSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CERTIFICATION',
    ledgerSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CERTIFICATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeGISIntelligenceCertificationId',
      'autonomousProductionRuntimeGISIntelligenceCertificationStatus',
      'autonomousProductionRuntimeGISIntelligenceCertificationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEGISINTELLIGENCECERTIFICATIONREADY',
    summary: 'Autonomous Production Runtime GIS Intelligence Certification runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5870 so records exist in AUTO_RUNTIME_GIS_INTELLIGENCE_COMPLETION.',
    nextProcessor: '5880_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationLedgerProcessor'
  });
}

function run5870_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationProcessor() {
  return sciipRun5870_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationProcessor();
}

function sciipTest5870_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationProcessor() {
  var result = sciipRun5870_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5870_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5880_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5880_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationLedger',
    action: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CERT_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CERTIFICATION',
    targetSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CERT_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CERT_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeGISIntelligenceCertificationLedgerId',
      'autonomousProductionRuntimeGISIntelligenceCertificationLedgerStatus',
      'autonomousProductionRuntimeGISIntelligenceCertificationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEGISINTELLIGENCECERTIFICATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime GIS Intelligence Certification Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5880 so records exist in AUTO_RUNTIME_GIS_INTELLIGENCE_CERTIFICATION.',
    nextProcessor: '5890_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceProcessor'
  });
}

function run5880_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationLedgerProcessor() {
  return sciipRun5880_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationLedgerProcessor();
}

function sciipTest5880_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationLedgerProcessor() {
  var result = sciipRun5880_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5880_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceCertificationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5890_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5890_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptance',
    action: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ACCEPTANCE',
    sourceSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_CERT_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ACCEPTANCE',
    ledgerSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeGISIntelligenceAcceptanceId',
      'autonomousProductionRuntimeGISIntelligenceAcceptanceStatus',
      'autonomousProductionRuntimeGISIntelligenceAcceptanceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEGISINTELLIGENCEACCEPTANCEREADY',
    summary: 'Autonomous Production Runtime GIS Intelligence Acceptance runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5890 so records exist in AUTO_RUNTIME_GIS_INTELLIGENCE_CERT_LEDGER_SUMMARY.',
    nextProcessor: '5900_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceLedgerProcessor'
  });
}

function run5890_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceProcessor() {
  return sciipRun5890_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceProcessor();
}

function sciipTest5890_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceProcessor() {
  var result = sciipRun5890_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5890_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceProcessor',
    result: result
  }));
  return result;
}


function sciipRun5900_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5900_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceLedger',
    action: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ACCEPTANCE_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ACCEPTANCE',
    targetSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ACCEPTANCE_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ACCEPTANCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeGISIntelligenceAcceptanceLedgerId',
      'autonomousProductionRuntimeGISIntelligenceAcceptanceLedgerStatus',
      'autonomousProductionRuntimeGISIntelligenceAcceptanceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEGISINTELLIGENCEACCEPTANCELEDGERREADY',
    summary: 'Autonomous Production Runtime GIS Intelligence Acceptance Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5900 so records exist in AUTO_RUNTIME_GIS_INTELLIGENCE_ACCEPTANCE.',
    nextProcessor: '5910_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingProcessor'
  });
}

function run5900_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceLedgerProcessor() {
  return sciipRun5900_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceLedgerProcessor();
}

function sciipTest5900_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceLedgerProcessor() {
  var result = sciipRun5900_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5900_SuperSheetImportExecutionAutonomousProductionRuntimeGISIntelligenceAcceptanceLedgerProcessor',
    result: result
  }));
  return result;
}

/***************************************
 * SCIIP_OS v5.4 / Runtime v5.2
 * Batch: 5910–6000
 * Autonomous Production Runtime Executive Reporting
 *
 * Paste below the validated 3420–5900 batch files.
 * Requires helper: sciipPatch3420_3610Run_
 *
 * Naming convention:
 * - Processor names remain fully canonical.
 * - Physical sheet names are shortened where needed to remain under
 *   Google Sheets' 100-character sheet-name limit.
 ***************************************/


function sciipRun5910_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5910_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReporting',
    action: 'AUTO_RUNTIME_EXEC_REPORTING',
    sourceSheet: 'AUTO_RUNTIME_GIS_INTELLIGENCE_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_EXEC_REPORTING',
    ledgerSheet: 'AUTO_RUNTIME_EXEC_REPORTING_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeExecutiveReportingId',
      'autonomousProductionRuntimeExecutiveReportingStatus',
      'autonomousProductionRuntimeExecutiveReportingResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEEXECUTIVEREPORTINGREADY',
    summary: 'Autonomous Production Runtime Executive Reporting runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5910 so records exist in AUTO_RUNTIME_GIS_INTELLIGENCE_ACCEPTANCE_LEDGER_SUMMARY.',
    nextProcessor: '5920_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingLedgerProcessor'
  });
}

function run5910_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingProcessor() {
  return sciipRun5910_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingProcessor();
}

function sciipTest5910_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingProcessor() {
  var result = sciipRun5910_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5910_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingProcessor',
    result: result
  }));
  return result;
}


function sciipRun5920_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5920_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingLedger',
    action: 'AUTO_RUNTIME_EXEC_REPORTING_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_EXEC_REPORTING',
    targetSheet: 'AUTO_RUNTIME_EXEC_REPORTING_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_EXEC_REPORTING_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeExecutiveReportingLedgerId',
      'autonomousProductionRuntimeExecutiveReportingLedgerStatus',
      'autonomousProductionRuntimeExecutiveReportingLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEEXECUTIVEREPORTINGLEDGERREADY',
    summary: 'Autonomous Production Runtime Executive Reporting Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5920 so records exist in AUTO_RUNTIME_EXEC_REPORTING.',
    nextProcessor: '5930_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCloseoutProcessor'
  });
}

function run5920_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingLedgerProcessor() {
  return sciipRun5920_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingLedgerProcessor();
}

function sciipTest5920_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingLedgerProcessor() {
  var result = sciipRun5920_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5920_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5930_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCloseoutProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5930_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCloseout',
    action: 'AUTO_RUNTIME_EXEC_REPORTING_CLOSEOUTS',
    sourceSheet: 'AUTO_RUNTIME_EXEC_REPORTING_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_EXEC_REPORTING_CLOSEOUTS',
    ledgerSheet: 'AUTO_RUNTIME_EXEC_REPORTING_CLOSEOUTS_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeExecutiveReportingCloseoutId',
      'autonomousProductionRuntimeExecutiveReportingCloseoutStatus',
      'autonomousProductionRuntimeExecutiveReportingCloseoutResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEEXECUTIVEREPORTINGCLOSEOUTREADY',
    summary: 'Autonomous Production Runtime Executive Reporting Closeout runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5930 so records exist in AUTO_RUNTIME_EXEC_REPORTING_LEDGER_SUMMARY.',
    nextProcessor: '5940_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingArchiveProcessor'
  });
}

function run5930_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCloseoutProcessor() {
  return sciipRun5930_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCloseoutProcessor();
}

function sciipTest5930_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCloseoutProcessor() {
  var result = sciipRun5930_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCloseoutProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5930_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCloseoutProcessor',
    result: result
  }));
  return result;
}


function sciipRun5940_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingArchiveProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5940_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingArchive',
    action: 'AUTO_RUNTIME_EXEC_REPORTING_ARCHIVE',
    sourceSheet: 'AUTO_RUNTIME_EXEC_REPORTING_CLOSEOUTS',
    targetSheet: 'AUTO_RUNTIME_EXEC_REPORTING_ARCHIVE',
    ledgerSheet: 'AUTO_RUNTIME_EXEC_REPORTING_ARCHIVE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeExecutiveReportingArchiveId',
      'autonomousProductionRuntimeExecutiveReportingArchiveStatus',
      'autonomousProductionRuntimeExecutiveReportingArchiveResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEEXECUTIVEREPORTINGARCHIVEREADY',
    summary: 'Autonomous Production Runtime Executive Reporting Archive runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5940 so records exist in AUTO_RUNTIME_EXEC_REPORTING_CLOSEOUTS.',
    nextProcessor: '5950_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingReconciliationProcessor'
  });
}

function run5940_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingArchiveProcessor() {
  return sciipRun5940_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingArchiveProcessor();
}

function sciipTest5940_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingArchiveProcessor() {
  var result = sciipRun5940_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5940_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingArchiveProcessor',
    result: result
  }));
  return result;
}


function sciipRun5950_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingReconciliationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5950_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingReconciliation',
    action: 'AUTO_RUNTIME_EXEC_REPORTING_RECONCILIATION',
    sourceSheet: 'AUTO_RUNTIME_EXEC_REPORTING_ARCHIVE',
    targetSheet: 'AUTO_RUNTIME_EXEC_REPORTING_RECONCILIATION',
    ledgerSheet: 'AUTO_RUNTIME_EXEC_REPORTING_RECONCILIATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeExecutiveReportingReconciliationId',
      'autonomousProductionRuntimeExecutiveReportingReconciliationStatus',
      'autonomousProductionRuntimeExecutiveReportingReconciliationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEEXECUTIVEREPORTINGRECONCILIATIONREADY',
    summary: 'Autonomous Production Runtime Executive Reporting Reconciliation runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5950 so records exist in AUTO_RUNTIME_EXEC_REPORTING_ARCHIVE.',
    nextProcessor: '5960_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCompletionProcessor'
  });
}

function run5950_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingReconciliationProcessor() {
  return sciipRun5950_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingReconciliationProcessor();
}

function sciipTest5950_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingReconciliationProcessor() {
  var result = sciipRun5950_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingReconciliationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5950_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingReconciliationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5960_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCompletionProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5960_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCompletion',
    action: 'AUTO_RUNTIME_EXEC_REPORTING_COMPLETION',
    sourceSheet: 'AUTO_RUNTIME_EXEC_REPORTING_RECONCILIATION',
    targetSheet: 'AUTO_RUNTIME_EXEC_REPORTING_COMPLETION',
    ledgerSheet: 'AUTO_RUNTIME_EXEC_REPORTING_COMPLETION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeExecutiveReportingCompletionId',
      'autonomousProductionRuntimeExecutiveReportingCompletionStatus',
      'autonomousProductionRuntimeExecutiveReportingCompletionResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEEXECUTIVEREPORTINGCOMPLETIONREADY',
    summary: 'Autonomous Production Runtime Executive Reporting Completion runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5960 so records exist in AUTO_RUNTIME_EXEC_REPORTING_RECONCILIATION.',
    nextProcessor: '5970_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationProcessor'
  });
}

function run5960_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCompletionProcessor() {
  return sciipRun5960_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCompletionProcessor();
}

function sciipTest5960_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCompletionProcessor() {
  var result = sciipRun5960_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCompletionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5960_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCompletionProcessor',
    result: result
  }));
  return result;
}


function sciipRun5970_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5970_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertification',
    action: 'AUTO_RUNTIME_EXEC_REPORTING_CERTIFICATION',
    sourceSheet: 'AUTO_RUNTIME_EXEC_REPORTING_COMPLETION',
    targetSheet: 'AUTO_RUNTIME_EXEC_REPORTING_CERTIFICATION',
    ledgerSheet: 'AUTO_RUNTIME_EXEC_REPORTING_CERTIFICATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeExecutiveReportingCertificationId',
      'autonomousProductionRuntimeExecutiveReportingCertificationStatus',
      'autonomousProductionRuntimeExecutiveReportingCertificationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEEXECUTIVEREPORTINGCERTIFICATIONREADY',
    summary: 'Autonomous Production Runtime Executive Reporting Certification runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5970 so records exist in AUTO_RUNTIME_EXEC_REPORTING_COMPLETION.',
    nextProcessor: '5980_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationLedgerProcessor'
  });
}

function run5970_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationProcessor() {
  return sciipRun5970_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationProcessor();
}

function sciipTest5970_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationProcessor() {
  var result = sciipRun5970_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5970_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationProcessor',
    result: result
  }));
  return result;
}


function sciipRun5980_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5980_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationLedger',
    action: 'AUTO_RUNTIME_EXEC_REPORTING_CERT_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_EXEC_REPORTING_CERTIFICATION',
    targetSheet: 'AUTO_RUNTIME_EXEC_REPORTING_CERT_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_EXEC_REPORTING_CERT_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeExecutiveReportingCertificationLedgerId',
      'autonomousProductionRuntimeExecutiveReportingCertificationLedgerStatus',
      'autonomousProductionRuntimeExecutiveReportingCertificationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEEXECUTIVEREPORTINGCERTIFICATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime Executive Reporting Certification Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5980 so records exist in AUTO_RUNTIME_EXEC_REPORTING_CERTIFICATION.',
    nextProcessor: '5990_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceProcessor'
  });
}

function run5980_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationLedgerProcessor() {
  return sciipRun5980_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationLedgerProcessor();
}

function sciipTest5980_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationLedgerProcessor() {
  var result = sciipRun5980_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5980_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingCertificationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun5990_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '5990_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptance',
    action: 'AUTO_RUNTIME_EXEC_REPORTING_ACCEPTANCE',
    sourceSheet: 'AUTO_RUNTIME_EXEC_REPORTING_CERT_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_EXEC_REPORTING_ACCEPTANCE',
    ledgerSheet: 'AUTO_RUNTIME_EXEC_REPORTING_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeExecutiveReportingAcceptanceId',
      'autonomousProductionRuntimeExecutiveReportingAcceptanceStatus',
      'autonomousProductionRuntimeExecutiveReportingAcceptanceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEEXECUTIVEREPORTINGACCEPTANCEREADY',
    summary: 'Autonomous Production Runtime Executive Reporting Acceptance runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 5990 so records exist in AUTO_RUNTIME_EXEC_REPORTING_CERT_LEDGER_SUMMARY.',
    nextProcessor: '6000_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceLedgerProcessor'
  });
}

function run5990_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceProcessor() {
  return sciipRun5990_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceProcessor();
}

function sciipTest5990_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceProcessor() {
  var result = sciipRun5990_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest5990_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceProcessor',
    result: result
  }));
  return result;
}


function sciipRun6000_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6000_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceLedger',
    action: 'AUTO_RUNTIME_EXEC_REPORTING_ACCEPTANCE_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_EXEC_REPORTING_ACCEPTANCE',
    targetSheet: 'AUTO_RUNTIME_EXEC_REPORTING_ACCEPTANCE_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_EXEC_REPORTING_ACCEPTANCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeExecutiveReportingAcceptanceLedgerId',
      'autonomousProductionRuntimeExecutiveReportingAcceptanceLedgerStatus',
      'autonomousProductionRuntimeExecutiveReportingAcceptanceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMEEXECUTIVEREPORTINGACCEPTANCELEDGERREADY',
    summary: 'Autonomous Production Runtime Executive Reporting Acceptance Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6000 so records exist in AUTO_RUNTIME_EXEC_REPORTING_ACCEPTANCE.',
    nextProcessor: '6010_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditProcessor'
  });
}

function run6000_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceLedgerProcessor() {
  return sciipRun6000_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceLedgerProcessor();
}

function sciipTest6000_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceLedgerProcessor() {
  var result = sciipRun6000_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6000_SuperSheetImportExecutionAutonomousProductionRuntimeExecutiveReportingAcceptanceLedgerProcessor',
    result: result
  }));
  return result;
}

/***************************************
 * SCIIP_OS v5.4 / Runtime v5.2
 * Batch: 6010–6100
 * Autonomous Production Runtime Security & Audit
 *
 * Paste below the validated 3420–6000 batch files.
 * Requires helper: sciipPatch3420_3610Run_
 *
 * Naming convention:
 * - Processor names remain fully canonical.
 * - Physical sheet names are shortened where needed to remain under
 *   Google Sheets' 100-character sheet-name limit.
 ***************************************/


function sciipRun6010_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6010_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAudit',
    action: 'AUTO_RUNTIME_SECURITY_AUDIT',
    sourceSheet: 'AUTO_RUNTIME_EXEC_REPORTING_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_SECURITY_AUDIT',
    ledgerSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSecurityAuditId',
      'autonomousProductionRuntimeSecurityAuditStatus',
      'autonomousProductionRuntimeSecurityAuditResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESECURITYAUDITREADY',
    summary: 'Autonomous Production Runtime Security & Audit runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6010 so records exist in AUTO_RUNTIME_EXEC_REPORTING_ACCEPTANCE_LEDGER_SUMMARY.',
    nextProcessor: '6020_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditLedgerProcessor'
  });
}

function run6010_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditProcessor() {
  return sciipRun6010_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditProcessor();
}

function sciipTest6010_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditProcessor() {
  var result = sciipRun6010_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6010_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditProcessor',
    result: result
  }));
  return result;
}


function sciipRun6020_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6020_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditLedger',
    action: 'AUTO_RUNTIME_SECURITY_AUDIT_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_SECURITY_AUDIT',
    targetSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSecurityAuditLedgerId',
      'autonomousProductionRuntimeSecurityAuditLedgerStatus',
      'autonomousProductionRuntimeSecurityAuditLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESECURITYAUDITLEDGERREADY',
    summary: 'Autonomous Production Runtime Security & Audit Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6020 so records exist in AUTO_RUNTIME_SECURITY_AUDIT.',
    nextProcessor: '6030_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCloseoutProcessor'
  });
}

function run6020_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditLedgerProcessor() {
  return sciipRun6020_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditLedgerProcessor();
}

function sciipTest6020_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditLedgerProcessor() {
  var result = sciipRun6020_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6020_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun6030_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCloseoutProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6030_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCloseout',
    action: 'AUTO_RUNTIME_SECURITY_AUDIT_CLOSEOUTS',
    sourceSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_CLOSEOUTS',
    ledgerSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_CLOSEOUTS_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSecurityAuditCloseoutId',
      'autonomousProductionRuntimeSecurityAuditCloseoutStatus',
      'autonomousProductionRuntimeSecurityAuditCloseoutResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESECURITYAUDITCLOSEOUTREADY',
    summary: 'Autonomous Production Runtime Security & Audit Closeout runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6030 so records exist in AUTO_RUNTIME_SECURITY_AUDIT_LEDGER_SUMMARY.',
    nextProcessor: '6040_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditArchiveProcessor'
  });
}

function run6030_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCloseoutProcessor() {
  return sciipRun6030_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCloseoutProcessor();
}

function sciipTest6030_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCloseoutProcessor() {
  var result = sciipRun6030_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCloseoutProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6030_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCloseoutProcessor',
    result: result
  }));
  return result;
}


function sciipRun6040_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditArchiveProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6040_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditArchive',
    action: 'AUTO_RUNTIME_SECURITY_AUDIT_ARCHIVE',
    sourceSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_CLOSEOUTS',
    targetSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_ARCHIVE',
    ledgerSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_ARCHIVE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSecurityAuditArchiveId',
      'autonomousProductionRuntimeSecurityAuditArchiveStatus',
      'autonomousProductionRuntimeSecurityAuditArchiveResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESECURITYAUDITARCHIVEREADY',
    summary: 'Autonomous Production Runtime Security & Audit Archive runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6040 so records exist in AUTO_RUNTIME_SECURITY_AUDIT_CLOSEOUTS.',
    nextProcessor: '6050_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditReconciliationProcessor'
  });
}

function run6040_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditArchiveProcessor() {
  return sciipRun6040_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditArchiveProcessor();
}

function sciipTest6040_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditArchiveProcessor() {
  var result = sciipRun6040_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6040_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditArchiveProcessor',
    result: result
  }));
  return result;
}


function sciipRun6050_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditReconciliationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6050_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditReconciliation',
    action: 'AUTO_RUNTIME_SECURITY_AUDIT_RECONCILIATION',
    sourceSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_ARCHIVE',
    targetSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_RECONCILIATION',
    ledgerSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_RECONCILIATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSecurityAuditReconciliationId',
      'autonomousProductionRuntimeSecurityAuditReconciliationStatus',
      'autonomousProductionRuntimeSecurityAuditReconciliationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESECURITYAUDITRECONCILIATIONREADY',
    summary: 'Autonomous Production Runtime Security & Audit Reconciliation runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6050 so records exist in AUTO_RUNTIME_SECURITY_AUDIT_ARCHIVE.',
    nextProcessor: '6060_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCompletionProcessor'
  });
}

function run6050_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditReconciliationProcessor() {
  return sciipRun6050_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditReconciliationProcessor();
}

function sciipTest6050_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditReconciliationProcessor() {
  var result = sciipRun6050_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditReconciliationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6050_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditReconciliationProcessor',
    result: result
  }));
  return result;
}


function sciipRun6060_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCompletionProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6060_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCompletion',
    action: 'AUTO_RUNTIME_SECURITY_AUDIT_COMPLETION',
    sourceSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_RECONCILIATION',
    targetSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_COMPLETION',
    ledgerSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_COMPLETION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSecurityAuditCompletionId',
      'autonomousProductionRuntimeSecurityAuditCompletionStatus',
      'autonomousProductionRuntimeSecurityAuditCompletionResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESECURITYAUDITCOMPLETIONREADY',
    summary: 'Autonomous Production Runtime Security & Audit Completion runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6060 so records exist in AUTO_RUNTIME_SECURITY_AUDIT_RECONCILIATION.',
    nextProcessor: '6070_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationProcessor'
  });
}

function run6060_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCompletionProcessor() {
  return sciipRun6060_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCompletionProcessor();
}

function sciipTest6060_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCompletionProcessor() {
  var result = sciipRun6060_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCompletionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6060_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCompletionProcessor',
    result: result
  }));
  return result;
}


function sciipRun6070_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6070_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertification',
    action: 'AUTO_RUNTIME_SECURITY_AUDIT_CERTIFICATION',
    sourceSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_COMPLETION',
    targetSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_CERTIFICATION',
    ledgerSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_CERTIFICATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSecurityAuditCertificationId',
      'autonomousProductionRuntimeSecurityAuditCertificationStatus',
      'autonomousProductionRuntimeSecurityAuditCertificationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESECURITYAUDITCERTIFICATIONREADY',
    summary: 'Autonomous Production Runtime Security & Audit Certification runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6070 so records exist in AUTO_RUNTIME_SECURITY_AUDIT_COMPLETION.',
    nextProcessor: '6080_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationLedgerProcessor'
  });
}

function run6070_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationProcessor() {
  return sciipRun6070_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationProcessor();
}

function sciipTest6070_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationProcessor() {
  var result = sciipRun6070_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6070_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationProcessor',
    result: result
  }));
  return result;
}


function sciipRun6080_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6080_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationLedger',
    action: 'AUTO_RUNTIME_SECURITY_AUDIT_CERT_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_CERTIFICATION',
    targetSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_CERT_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_CERT_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSecurityAuditCertificationLedgerId',
      'autonomousProductionRuntimeSecurityAuditCertificationLedgerStatus',
      'autonomousProductionRuntimeSecurityAuditCertificationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESECURITYAUDITCERTIFICATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime Security & Audit Certification Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6080 so records exist in AUTO_RUNTIME_SECURITY_AUDIT_CERTIFICATION.',
    nextProcessor: '6090_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceProcessor'
  });
}

function run6080_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationLedgerProcessor() {
  return sciipRun6080_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationLedgerProcessor();
}

function sciipTest6080_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationLedgerProcessor() {
  var result = sciipRun6080_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6080_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditCertificationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun6090_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6090_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptance',
    action: 'AUTO_RUNTIME_SECURITY_AUDIT_ACCEPTANCE',
    sourceSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_CERT_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_ACCEPTANCE',
    ledgerSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSecurityAuditAcceptanceId',
      'autonomousProductionRuntimeSecurityAuditAcceptanceStatus',
      'autonomousProductionRuntimeSecurityAuditAcceptanceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESECURITYAUDITACCEPTANCEREADY',
    summary: 'Autonomous Production Runtime Security & Audit Acceptance runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6090 so records exist in AUTO_RUNTIME_SECURITY_AUDIT_CERT_LEDGER_SUMMARY.',
    nextProcessor: '6100_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceLedgerProcessor'
  });
}

function run6090_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceProcessor() {
  return sciipRun6090_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceProcessor();
}

function sciipTest6090_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceProcessor() {
  var result = sciipRun6090_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6090_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceProcessor',
    result: result
  }));
  return result;
}


function sciipRun6100_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6100_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceLedger',
    action: 'AUTO_RUNTIME_SECURITY_AUDIT_ACCEPTANCE_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_ACCEPTANCE',
    targetSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_ACCEPTANCE_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_ACCEPTANCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSecurityAuditAcceptanceLedgerId',
      'autonomousProductionRuntimeSecurityAuditAcceptanceLedgerStatus',
      'autonomousProductionRuntimeSecurityAuditAcceptanceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESECURITYAUDITACCEPTANCELEDGERREADY',
    summary: 'Autonomous Production Runtime Security & Audit Acceptance Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6100 so records exist in AUTO_RUNTIME_SECURITY_AUDIT_ACCEPTANCE.',
    nextProcessor: '6110_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorProcessor'
  });
}

function run6100_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceLedgerProcessor() {
  return sciipRun6100_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceLedgerProcessor();
}

function sciipTest6100_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceLedgerProcessor() {
  var result = sciipRun6100_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6100_SuperSheetImportExecutionAutonomousProductionRuntimeSecurityAuditAcceptanceLedgerProcessor',
    result: result
  }));
  return result;
}

/***************************************
 * SCIIP_OS v5.4 / Runtime v5.2
 * Batch: 6110–6200
 * Autonomous Production Runtime Supervisor
 *
 * Paste below the validated 3420–6100 batch files.
 * Requires helper: sciipPatch3420_3610Run_
 *
 * Naming convention:
 * - Processor names remain fully canonical.
 * - Physical sheet names are shortened where needed to remain under
 *   Google Sheets' 100-character sheet-name limit.
 ***************************************/


function sciipRun6110_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6110_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisor',
    action: 'AUTO_RUNTIME_SUPERVISOR',
    sourceSheet: 'AUTO_RUNTIME_SECURITY_AUDIT_ACCEPTANCE_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_SUPERVISOR',
    ledgerSheet: 'AUTO_RUNTIME_SUPERVISOR_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSupervisorId',
      'autonomousProductionRuntimeSupervisorStatus',
      'autonomousProductionRuntimeSupervisorResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESUPERVISORREADY',
    summary: 'Autonomous Production Runtime Supervisor runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6110 so records exist in AUTO_RUNTIME_SECURITY_AUDIT_ACCEPTANCE_LEDGER_SUMMARY.',
    nextProcessor: '6120_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorLedgerProcessor'
  });
}

function run6110_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorProcessor() {
  return sciipRun6110_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorProcessor();
}

function sciipTest6110_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorProcessor() {
  var result = sciipRun6110_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6110_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorProcessor',
    result: result
  }));
  return result;
}


function sciipRun6120_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6120_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorLedger',
    action: 'AUTO_RUNTIME_SUPERVISOR_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_SUPERVISOR',
    targetSheet: 'AUTO_RUNTIME_SUPERVISOR_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_SUPERVISOR_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSupervisorLedgerId',
      'autonomousProductionRuntimeSupervisorLedgerStatus',
      'autonomousProductionRuntimeSupervisorLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESUPERVISORLEDGERREADY',
    summary: 'Autonomous Production Runtime Supervisor Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6120 so records exist in AUTO_RUNTIME_SUPERVISOR.',
    nextProcessor: '6130_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCloseoutProcessor'
  });
}

function run6120_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorLedgerProcessor() {
  return sciipRun6120_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorLedgerProcessor();
}

function sciipTest6120_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorLedgerProcessor() {
  var result = sciipRun6120_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6120_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun6130_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCloseoutProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6130_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCloseout',
    action: 'AUTO_RUNTIME_SUPERVISOR_CLOSEOUTS',
    sourceSheet: 'AUTO_RUNTIME_SUPERVISOR_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_SUPERVISOR_CLOSEOUTS',
    ledgerSheet: 'AUTO_RUNTIME_SUPERVISOR_CLOSEOUTS_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSupervisorCloseoutId',
      'autonomousProductionRuntimeSupervisorCloseoutStatus',
      'autonomousProductionRuntimeSupervisorCloseoutResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESUPERVISORCLOSEOUTREADY',
    summary: 'Autonomous Production Runtime Supervisor Closeout runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6130 so records exist in AUTO_RUNTIME_SUPERVISOR_LEDGER_SUMMARY.',
    nextProcessor: '6140_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorArchiveProcessor'
  });
}

function run6130_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCloseoutProcessor() {
  return sciipRun6130_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCloseoutProcessor();
}

function sciipTest6130_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCloseoutProcessor() {
  var result = sciipRun6130_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCloseoutProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6130_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCloseoutProcessor',
    result: result
  }));
  return result;
}


function sciipRun6140_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorArchiveProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6140_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorArchive',
    action: 'AUTO_RUNTIME_SUPERVISOR_ARCHIVE',
    sourceSheet: 'AUTO_RUNTIME_SUPERVISOR_CLOSEOUTS',
    targetSheet: 'AUTO_RUNTIME_SUPERVISOR_ARCHIVE',
    ledgerSheet: 'AUTO_RUNTIME_SUPERVISOR_ARCHIVE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSupervisorArchiveId',
      'autonomousProductionRuntimeSupervisorArchiveStatus',
      'autonomousProductionRuntimeSupervisorArchiveResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESUPERVISORARCHIVEREADY',
    summary: 'Autonomous Production Runtime Supervisor Archive runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6140 so records exist in AUTO_RUNTIME_SUPERVISOR_CLOSEOUTS.',
    nextProcessor: '6150_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorReconciliationProcessor'
  });
}

function run6140_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorArchiveProcessor() {
  return sciipRun6140_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorArchiveProcessor();
}

function sciipTest6140_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorArchiveProcessor() {
  var result = sciipRun6140_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6140_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorArchiveProcessor',
    result: result
  }));
  return result;
}


function sciipRun6150_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorReconciliationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6150_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorReconciliation',
    action: 'AUTO_RUNTIME_SUPERVISOR_RECONCILIATION',
    sourceSheet: 'AUTO_RUNTIME_SUPERVISOR_ARCHIVE',
    targetSheet: 'AUTO_RUNTIME_SUPERVISOR_RECONCILIATION',
    ledgerSheet: 'AUTO_RUNTIME_SUPERVISOR_RECONCILIATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSupervisorReconciliationId',
      'autonomousProductionRuntimeSupervisorReconciliationStatus',
      'autonomousProductionRuntimeSupervisorReconciliationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESUPERVISORRECONCILIATIONREADY',
    summary: 'Autonomous Production Runtime Supervisor Reconciliation runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6150 so records exist in AUTO_RUNTIME_SUPERVISOR_ARCHIVE.',
    nextProcessor: '6160_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCompletionProcessor'
  });
}

function run6150_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorReconciliationProcessor() {
  return sciipRun6150_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorReconciliationProcessor();
}

function sciipTest6150_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorReconciliationProcessor() {
  var result = sciipRun6150_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorReconciliationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6150_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorReconciliationProcessor',
    result: result
  }));
  return result;
}


function sciipRun6160_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCompletionProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6160_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCompletion',
    action: 'AUTO_RUNTIME_SUPERVISOR_COMPLETION',
    sourceSheet: 'AUTO_RUNTIME_SUPERVISOR_RECONCILIATION',
    targetSheet: 'AUTO_RUNTIME_SUPERVISOR_COMPLETION',
    ledgerSheet: 'AUTO_RUNTIME_SUPERVISOR_COMPLETION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSupervisorCompletionId',
      'autonomousProductionRuntimeSupervisorCompletionStatus',
      'autonomousProductionRuntimeSupervisorCompletionResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESUPERVISORCOMPLETIONREADY',
    summary: 'Autonomous Production Runtime Supervisor Completion runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6160 so records exist in AUTO_RUNTIME_SUPERVISOR_RECONCILIATION.',
    nextProcessor: '6170_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationProcessor'
  });
}

function run6160_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCompletionProcessor() {
  return sciipRun6160_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCompletionProcessor();
}

function sciipTest6160_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCompletionProcessor() {
  var result = sciipRun6160_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCompletionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6160_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCompletionProcessor',
    result: result
  }));
  return result;
}


function sciipRun6170_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6170_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertification',
    action: 'AUTO_RUNTIME_SUPERVISOR_CERTIFICATION',
    sourceSheet: 'AUTO_RUNTIME_SUPERVISOR_COMPLETION',
    targetSheet: 'AUTO_RUNTIME_SUPERVISOR_CERTIFICATION',
    ledgerSheet: 'AUTO_RUNTIME_SUPERVISOR_CERTIFICATION_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSupervisorCertificationId',
      'autonomousProductionRuntimeSupervisorCertificationStatus',
      'autonomousProductionRuntimeSupervisorCertificationResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESUPERVISORCERTIFICATIONREADY',
    summary: 'Autonomous Production Runtime Supervisor Certification runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6170 so records exist in AUTO_RUNTIME_SUPERVISOR_COMPLETION.',
    nextProcessor: '6180_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationLedgerProcessor'
  });
}

function run6170_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationProcessor() {
  return sciipRun6170_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationProcessor();
}

function sciipTest6170_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationProcessor() {
  var result = sciipRun6170_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6170_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationProcessor',
    result: result
  }));
  return result;
}


function sciipRun6180_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6180_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationLedger',
    action: 'AUTO_RUNTIME_SUPERVISOR_CERT_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_SUPERVISOR_CERTIFICATION',
    targetSheet: 'AUTO_RUNTIME_SUPERVISOR_CERT_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_SUPERVISOR_CERT_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSupervisorCertificationLedgerId',
      'autonomousProductionRuntimeSupervisorCertificationLedgerStatus',
      'autonomousProductionRuntimeSupervisorCertificationLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESUPERVISORCERTIFICATIONLEDGERREADY',
    summary: 'Autonomous Production Runtime Supervisor Certification Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6180 so records exist in AUTO_RUNTIME_SUPERVISOR_CERTIFICATION.',
    nextProcessor: '6190_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceProcessor'
  });
}

function run6180_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationLedgerProcessor() {
  return sciipRun6180_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationLedgerProcessor();
}

function sciipTest6180_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationLedgerProcessor() {
  var result = sciipRun6180_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6180_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorCertificationLedgerProcessor',
    result: result
  }));
  return result;
}


function sciipRun6190_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6190_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptance',
    action: 'AUTO_RUNTIME_SUPERVISOR_ACCEPTANCE',
    sourceSheet: 'AUTO_RUNTIME_SUPERVISOR_CERT_LEDGER_SUMMARY',
    targetSheet: 'AUTO_RUNTIME_SUPERVISOR_ACCEPTANCE',
    ledgerSheet: 'AUTO_RUNTIME_SUPERVISOR_ACCEPTANCE_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSupervisorAcceptanceId',
      'autonomousProductionRuntimeSupervisorAcceptanceStatus',
      'autonomousProductionRuntimeSupervisorAcceptanceResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESUPERVISORACCEPTANCEREADY',
    summary: 'Autonomous Production Runtime Supervisor Acceptance runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6190 so records exist in AUTO_RUNTIME_SUPERVISOR_CERT_LEDGER_SUMMARY.',
    nextProcessor: '6200_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceLedgerProcessor'
  });
}

function run6190_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceProcessor() {
  return sciipRun6190_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceProcessor();
}

function sciipTest6190_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceProcessor() {
  var result = sciipRun6190_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6190_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceProcessor',
    result: result
  }));
  return result;
}


function sciipRun6200_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceLedgerProcessor() {
  return sciipPatch3420_3610Run_({
    processor: '6200_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceLedger',
    action: 'AUTO_RUNTIME_SUPERVISOR_ACCEPTANCE_LEDGER_SUMMARY',
    sourceSheet: 'AUTO_RUNTIME_SUPERVISOR_ACCEPTANCE',
    targetSheet: 'AUTO_RUNTIME_SUPERVISOR_ACCEPTANCE_LEDGER_SUMMARY',
    ledgerSheet: 'AUTO_RUNTIME_SUPERVISOR_ACCEPTANCE_LEDGER_SUMMARY_RUNTIME_LEDGER',
    headers: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'autonomousProductionRuntimeSupervisorAcceptanceLedgerId',
      'autonomousProductionRuntimeSupervisorAcceptanceLedgerStatus',
      'autonomousProductionRuntimeSupervisorAcceptanceLedgerResult',
      'runtimeScope',
      'runtimeSummary',
      'frameworkVersion',
      'createdAt'
    ],
    status: 'SUPERSHEETIMPORTEXECUTIONAUTONOMOUSPRODUCTIONRUNTIMESUPERVISORACCEPTANCELEDGERREADY',
    summary: 'Autonomous Production Runtime Supervisor Acceptance Ledger runtime processor completed.',
    noInputNextAction: 'Run upstream processor before 6200 so records exist in AUTO_RUNTIME_SUPERVISOR_ACCEPTANCE.',
    nextProcessor: '6210_SuperSheetImportExecutionProductionDomainCapabilityActivationProcessor'
  });
}

function run6200_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceLedgerProcessor() {
  return sciipRun6200_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceLedgerProcessor();
}

function sciipTest6200_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceLedgerProcessor() {
  var result = sciipRun6200_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6200_SuperSheetImportExecutionAutonomousProductionRuntimeSupervisorAcceptanceLedgerProcessor',
    result: result
  }));
  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1000_AutonomousProcessorExecutionControlProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionControlProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1000_AutonomousProcessorExecutionControlProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_CONTROLS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_CONTROLS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1000_AutonomousProcessorExecutionControlProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionControlProcessorLegacy1000_();
      return sciipWrapLegacyRuntimeResult1000_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1000_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1000_AutonomousProcessorExecutionControlProcessor
 *******************************************************/

const SCIIP_1000_AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL = {
  PROCESSOR: '1000_AutonomousProcessorExecutionControlProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_READINESS',
  INPUT_DATE_COLUMN: 'Readiness_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL',

  OUTPUT_HEADERS: [
    'Execution_Control_ID',
    'Business_Key',
    'Control_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Readiness_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Readiness_Status',
    'Readiness_Decision',
    'Control_Status',
    'Control_Directive',
    'Control_Reason',
    'Execution_Gate',
    'Recommended_Action',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionControlProcessorLegacy1000_() {
  const cfg = SCIIP_1000_AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionControlSheet_();

  const resolvedControlDate =
    sciipResolveLatestProcessingDate1000_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey1000_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL|' + resolvedControlDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionControlsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionControlNoInput1000_(
      outputSheet,
      businessKey,
      resolvedControlDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1000_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1000_(row[cfg.INPUT_DATE_COLUMN]) === resolvedControlDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionControlNoInput1000_(
      outputSheet,
      businessKey,
      resolvedControlDate,
      startedAt
    );
  }

  const controlRecord =
    sciipBuildAutonomousProcessorExecutionControl1000_(
      sourceRows,
      businessKey,
      resolvedControlDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1000_(controlRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionControlsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    controlDate: resolvedControlDate,
    controlStatus: controlRecord.Control_Status,
    controlDirective: controlRecord.Control_Directive,
    executionGate: controlRecord.Execution_Gate,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionControl1000_(sourceRows, businessKey, controlDate, startedAt) {
  const cfg = SCIIP_1000_AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL;

  const aggregate = sciipAggregateExecutionReadinessRows1000_(sourceRows);
  const control = sciipResolveExecutionControlDirective1000_(aggregate);

  return {
    Execution_Control_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Control_Date: controlDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Readiness_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Readiness_Status: aggregate.Readiness_Status,
    Readiness_Decision: aggregate.Readiness_Decision,
    Control_Status: control.status,
    Control_Directive: control.directive,
    Control_Reason: control.reason,
    Execution_Gate: control.gate,
    Recommended_Action: control.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1000_(aggregate, control),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionControlNoInput1000_(outputSheet, businessKey, controlDate, startedAt) {
  const cfg = SCIIP_1000_AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL;

  const record = {
    Execution_Control_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Control_Date: controlDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Readiness_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Control_Reason: 'No execution readiness records were available for the resolved control date.',
    Execution_Gate: 'CLOSED',
    Recommended_Action: 'Do not advance autonomous execution until readiness records exist.',
    Knowledge_Graph_Impact: 'Created permanent execution-control history showing no available readiness inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1000_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionControlsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionControlSheet_() {
  const cfg = SCIIP_1000_AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1000_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1000_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1000_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey1000_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey1000_(parsed);

  return text;
}

function sciipFormatDateKey1000_(value) {
  return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function sciipResolveLatestProcessingDate1000_(sheetName, dateField) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return null;

  const records = sciipReadSheetObjects1000_(sheet);
  const dates = records
    .map(function(record) {
      return sciipNormalizeDateKey1000_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipAggregateExecutionReadinessRows1000_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1000_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1000_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1000_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1000_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1000_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1000_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1000_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1000_(
      aggregate.Highest_Priority,
      row.Highest_Priority
    );

    aggregate.Execution_Risk_Level = sciipHigherRisk1000_(
      aggregate.Execution_Risk_Level,
      row.Execution_Risk_Level
    );

    aggregate.Readiness_Status = sciipHigherReadinessConstraint1000_(
      aggregate.Readiness_Status,
      row.Readiness_Status
    );

    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1000_(
      aggregate.Readiness_Decision,
      row.Readiness_Decision
    );
  });

  return aggregate;
}

function sciipResolveExecutionControlDirective1000_(aggregate) {
  if (aggregate.Failed_Count > 0) {
    return {
      status: 'STOPPED',
      directive: 'DO_NOT_ADVANCE',
      reason: 'Execution control stopped because readiness inputs contain failed queue items.',
      gate: 'CLOSED',
      action: 'Investigate failed queue items and regenerate readiness before any downstream execution.'
    };
  }

  if (aggregate.Blocked_Count > 0) {
    return {
      status: 'STOPPED',
      directive: 'DO_NOT_ADVANCE',
      reason: 'Execution control stopped because readiness inputs contain blocked queue items.',
      gate: 'CLOSED',
      action: 'Resolve blocked dependencies and rerun execution monitor and readiness processors.'
    };
  }

  if (aggregate.Readiness_Decision === 'DEFER_EXECUTION') {
    return {
      status: 'STOPPED',
      directive: 'DO_NOT_ADVANCE',
      reason: 'Readiness decision requires execution deferral.',
      gate: 'CLOSED',
      action: 'Do not execute downstream autonomous processors until readiness improves.'
    };
  }

  if (aggregate.Hold_Count > 0 || aggregate.Readiness_Decision === 'HOLD_FOR_REVIEW') {
    return {
      status: 'HELD',
      directive: 'MANUAL_REVIEW_REQUIRED',
      reason: 'Execution control is held because readiness inputs require review.',
      gate: 'REVIEW',
      action: 'Review held items and release only approved autonomous processor work.'
    };
  }

  if (aggregate.Readiness_Decision === 'CONTINUE_MONITORING') {
    return {
      status: 'MONITORING',
      directive: 'WAIT',
      reason: 'Execution control is waiting because readiness inputs do not yet indicate executable work.',
      gate: 'PENDING',
      action: 'Continue monitoring until ready autonomous processor work exists.'
    };
  }

  if (aggregate.Readiness_Status === 'READY' && aggregate.Readiness_Decision === 'ADVANCE_EXECUTION') {
    return {
      status: 'CLEARED',
      directive: 'ADVANCE_AUTONOMOUS_EXECUTION',
      reason: 'Readiness inputs confirm autonomous processor execution may advance.',
      gate: 'OPEN',
      action: 'Proceed to downstream autonomous execution dispatch.'
    };
  }

  return {
    status: 'MONITORING',
    directive: 'WAIT',
    reason: 'Execution control could not confirm full readiness to advance.',
    gate: 'PENDING',
    action: 'Continue monitoring execution readiness state.'
  };
}

function sciipResolveKnowledgeGraphImpact1000_(aggregate, control) {
  return [
    'Created permanent autonomous execution-control directive history.',
    'Directive=' + control.directive + '.',
    'Gate=' + control.gate + '.',
    'Control status=' + control.status + '.',
    'Readiness decision=' + aggregate.Readiness_Decision + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.',
    'Ready=' + aggregate.Ready_Count + '.',
    'Blocked=' + aggregate.Blocked_Count + '.',
    'Failed=' + aggregate.Failed_Count + '.',
    'Hold=' + aggregate.Hold_Count + '.'
  ].join(' ');
}

function sciipNumber1000_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1000_(a, b) {
  const rank = {
    NONE: 0,
    LOW: 1,
    NORMAL: 2,
    MEDIUM: 3,
    HIGH: 4,
    CRITICAL: 5
  };

  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1000_(a, b) {
  const rank = {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessConstraint1000_(a, b) {
  const rank = {
    READY: 1,
    CONDITIONALLY_READY: 2,
    NOT_READY: 3
  };

  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1000_(a, b) {
  const rank = {
    ADVANCE_EXECUTION: 1,
    CONTINUE_MONITORING: 2,
    HOLD_FOR_REVIEW: 3,
    DEFER_EXECUTION: 4
  };

  const aa = String(a || 'DEFER_EXECUTION').trim().toUpperCase();
  const bb = String(b || 'DEFER_EXECUTION').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionControlProcessor() {
  const result = sciipRunAutonomousProcessorExecutionControlProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionControlProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1010_AutonomousProcessorExecutionDispatchProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionDispatchProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1010_AutonomousProcessorExecutionDispatchProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCHS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCHS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1010_AutonomousProcessorExecutionDispatchProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionDispatchProcessorLegacy1010_();
      return sciipWrapLegacyRuntimeResult1010_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1010_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1010_AutonomousProcessorExecutionDispatchProcessor
 *******************************************************/

const SCIIP_1010_AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH = {
  PROCESSOR: '1010_AutonomousProcessorExecutionDispatchProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL',
  INPUT_DATE_COLUMN: 'Control_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH',

  OUTPUT_HEADERS: [
    'Execution_Dispatch_ID',
    'Business_Key',
    'Dispatch_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Control_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Readiness_Status',
    'Readiness_Decision',
    'Control_Status',
    'Control_Directive',
    'Execution_Gate',
    'Dispatch_Status',
    'Dispatch_Decision',
    'Dispatch_Reason',
    'Dispatch_Mode',
    'Recommended_Action',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionDispatchProcessorLegacy1010_() {
  const cfg = SCIIP_1010_AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionDispatchSheet_();

  const resolvedDispatchDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH|' + resolvedDispatchDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionDispatchesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionDispatchNoInput1010_(
      outputSheet,
      businessKey,
      resolvedDispatchDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1010_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1010_(row[cfg.INPUT_DATE_COLUMN]) === resolvedDispatchDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionDispatchNoInput1010_(
      outputSheet,
      businessKey,
      resolvedDispatchDate,
      startedAt
    );
  }

  const dispatchRecord =
    sciipBuildAutonomousProcessorExecutionDispatch1010_(
      sourceRows,
      businessKey,
      resolvedDispatchDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1010_(dispatchRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionDispatchesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    dispatchDate: resolvedDispatchDate,
    dispatchStatus: dispatchRecord.Dispatch_Status,
    dispatchDecision: dispatchRecord.Dispatch_Decision,
    dispatchMode: dispatchRecord.Dispatch_Mode,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionDispatch1010_(sourceRows, businessKey, dispatchDate, startedAt) {
  const cfg = SCIIP_1010_AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH;

  const aggregate = sciipAggregateExecutionControlRows1010_(sourceRows);
  const dispatch = sciipResolveExecutionDispatchDecision1010_(aggregate);

  return {
    Execution_Dispatch_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Dispatch_Date: dispatchDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Control_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Readiness_Status: aggregate.Readiness_Status,
    Readiness_Decision: aggregate.Readiness_Decision,
    Control_Status: aggregate.Control_Status,
    Control_Directive: aggregate.Control_Directive,
    Execution_Gate: aggregate.Execution_Gate,
    Dispatch_Status: dispatch.status,
    Dispatch_Decision: dispatch.decision,
    Dispatch_Reason: dispatch.reason,
    Dispatch_Mode: dispatch.mode,
    Recommended_Action: dispatch.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1010_(aggregate, dispatch),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionDispatchNoInput1010_(outputSheet, businessKey, dispatchDate, startedAt) {
  const cfg = SCIIP_1010_AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH;

  const record = {
    Execution_Dispatch_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Dispatch_Date: dispatchDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Control_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Reason: 'No execution control records were available for the resolved dispatch date.',
    Dispatch_Mode: 'NONE',
    Recommended_Action: 'Do not dispatch autonomous processor work until execution control records exist.',
    Knowledge_Graph_Impact: 'Created permanent execution-dispatch history showing no available control inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1010_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionDispatchesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionDispatchSheet_() {
  const cfg = SCIIP_1010_AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1010_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1010_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1010_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionControlRows1010_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1010_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1010_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1010_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1010_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1010_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1010_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1010_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1010_(
      aggregate.Highest_Priority,
      row.Highest_Priority
    );

    aggregate.Execution_Risk_Level = sciipHigherRisk1010_(
      aggregate.Execution_Risk_Level,
      row.Execution_Risk_Level
    );

    aggregate.Readiness_Status = sciipHigherReadinessConstraint1010_(
      aggregate.Readiness_Status,
      row.Readiness_Status
    );

    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1010_(
      aggregate.Readiness_Decision,
      row.Readiness_Decision
    );

    aggregate.Control_Status = sciipHigherControlStatusConstraint1010_(
      aggregate.Control_Status,
      row.Control_Status
    );

    aggregate.Control_Directive = sciipHigherControlDirectiveConstraint1010_(
      aggregate.Control_Directive,
      row.Control_Directive
    );

    aggregate.Execution_Gate = sciipHigherExecutionGateConstraint1010_(
      aggregate.Execution_Gate,
      row.Execution_Gate
    );
  });

  return aggregate;
}

function sciipResolveExecutionDispatchDecision1010_(aggregate) {
  if (aggregate.Execution_Gate === 'CLOSED') {
    return {
      status: 'NOT_DISPATCHED',
      decision: 'DO_NOT_DISPATCH',
      reason: 'Dispatch blocked because execution gate is closed.',
      mode: 'NONE',
      action: 'Do not dispatch downstream autonomous processor work.'
    };
  }

  if (aggregate.Control_Directive === 'DO_NOT_ADVANCE') {
    return {
      status: 'NOT_DISPATCHED',
      decision: 'DO_NOT_DISPATCH',
      reason: 'Dispatch blocked because execution control directive is DO_NOT_ADVANCE.',
      mode: 'NONE',
      action: 'Resolve execution control blockers before dispatching autonomous work.'
    };
  }

  if (aggregate.Execution_Gate === 'REVIEW' || aggregate.Control_Directive === 'MANUAL_REVIEW_REQUIRED') {
    return {
      status: 'HELD_FOR_REVIEW',
      decision: 'REQUIRE_MANUAL_DISPATCH_REVIEW',
      reason: 'Dispatch requires manual review based on execution control state.',
      mode: 'MANUAL_REVIEW',
      action: 'Review held control records before authorizing dispatch.'
    };
  }

  if (aggregate.Execution_Gate === 'PENDING' || aggregate.Control_Directive === 'WAIT') {
    return {
      status: 'WAITING',
      decision: 'WAIT_TO_DISPATCH',
      reason: 'Dispatch is waiting because execution control has not opened the gate.',
      mode: 'MONITOR_ONLY',
      action: 'Continue monitoring until the execution gate opens.'
    };
  }

  if (
    aggregate.Execution_Gate === 'OPEN' &&
    aggregate.Control_Directive === 'ADVANCE_AUTONOMOUS_EXECUTION'
  ) {
    return {
      status: 'DISPATCH_READY',
      decision: 'DISPATCH_APPROVED',
      reason: 'Execution control gate is open and autonomous execution has been approved.',
      mode: 'AUTONOMOUS',
      action: 'Dispatch approved autonomous processor work to downstream execution.'
    };
  }

  return {
    status: 'WAITING',
    decision: 'WAIT_TO_DISPATCH',
    reason: 'Dispatch could not confirm a fully open autonomous execution state.',
    mode: 'MONITOR_ONLY',
    action: 'Continue monitoring execution control state.'
  };
}

function sciipResolveKnowledgeGraphImpact1010_(aggregate, dispatch) {
  return [
    'Created permanent autonomous execution-dispatch decision history.',
    'Dispatch decision=' + dispatch.decision + '.',
    'Dispatch status=' + dispatch.status + '.',
    'Dispatch mode=' + dispatch.mode + '.',
    'Execution gate=' + aggregate.Execution_Gate + '.',
    'Control directive=' + aggregate.Control_Directive + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1010_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1010_(a, b) {
  const rank = {
    NONE: 0,
    LOW: 1,
    NORMAL: 2,
    MEDIUM: 3,
    HIGH: 4,
    CRITICAL: 5
  };

  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1010_(a, b) {
  const rank = {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessConstraint1010_(a, b) {
  const rank = {
    READY: 1,
    CONDITIONALLY_READY: 2,
    NOT_READY: 3
  };

  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1010_(a, b) {
  const rank = {
    ADVANCE_EXECUTION: 1,
    CONTINUE_MONITORING: 2,
    HOLD_FOR_REVIEW: 3,
    DEFER_EXECUTION: 4
  };

  const aa = String(a || 'DEFER_EXECUTION').trim().toUpperCase();
  const bb = String(b || 'DEFER_EXECUTION').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlStatusConstraint1010_(a, b) {
  const rank = {
    CLEARED: 1,
    MONITORING: 2,
    HELD: 3,
    STOPPED: 4
  };

  const aa = String(a || 'STOPPED').trim().toUpperCase();
  const bb = String(b || 'STOPPED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlDirectiveConstraint1010_(a, b) {
  const rank = {
    ADVANCE_AUTONOMOUS_EXECUTION: 1,
    WAIT: 2,
    MANUAL_REVIEW_REQUIRED: 3,
    DO_NOT_ADVANCE: 4
  };

  const aa = String(a || 'DO_NOT_ADVANCE').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_ADVANCE').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherExecutionGateConstraint1010_(a, b) {
  const rank = {
    OPEN: 1,
    PENDING: 2,
    REVIEW: 3,
    CLOSED: 4
  };

  const aa = String(a || 'CLOSED').trim().toUpperCase();
  const bb = String(b || 'CLOSED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionDispatchProcessor() {
  const result = sciipRunAutonomousProcessorExecutionDispatchProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionDispatchProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1020_AutonomousProcessorExecutionLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1020_AutonomousProcessorExecutionLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1020_AutonomousProcessorExecutionLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionLedgerProcessorLegacy1020_();
      return sciipWrapLegacyRuntimeResult1020_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1020_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1020_AutonomousProcessorExecutionLedgerProcessor
 *******************************************************/

const SCIIP_1020_AUTONOMOUS_PROCESSOR_EXECUTION_LEDGER = {
  PROCESSOR: '1020_AutonomousProcessorExecutionLedgerProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH',
  INPUT_DATE_COLUMN: 'Dispatch_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_LEDGER',

  OUTPUT_HEADERS: [
    'Execution_Ledger_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Dispatch_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Readiness_Status',
    'Readiness_Decision',
    'Control_Status',
    'Control_Directive',
    'Execution_Gate',
    'Dispatch_Status',
    'Dispatch_Decision',
    'Dispatch_Mode',
    'Ledger_Status',
    'Ledger_Event_Type',
    'Ledger_Conclusion',
    'Ledger_Reason',
    'Recommended_Action',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionLedgerProcessorLegacy1020_() {
  const cfg = SCIIP_1020_AUTONOMOUS_PROCESSOR_EXECUTION_LEDGER;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionLedgerSheet_();

  const resolvedLedgerDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_LEDGER|' + resolvedLedgerDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionLedgerNoInput1020_(
      outputSheet,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1020_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1020_(row[cfg.INPUT_DATE_COLUMN]) === resolvedLedgerDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionLedgerNoInput1020_(
      outputSheet,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );
  }

  const ledgerRecord =
    sciipBuildAutonomousProcessorExecutionLedger1020_(
      sourceRows,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1020_(ledgerRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    ledgerDate: resolvedLedgerDate,
    ledgerStatus: ledgerRecord.Ledger_Status,
    ledgerEventType: ledgerRecord.Ledger_Event_Type,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionLedger1020_(sourceRows, businessKey, ledgerDate, startedAt) {
  const cfg = SCIIP_1020_AUTONOMOUS_PROCESSOR_EXECUTION_LEDGER;

  const aggregate = sciipAggregateExecutionDispatchRows1020_(sourceRows);
  const ledger = sciipResolveExecutionLedgerConclusion1020_(aggregate);

  return {
    Execution_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Ledger_Date: ledgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Dispatch_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Readiness_Status: aggregate.Readiness_Status,
    Readiness_Decision: aggregate.Readiness_Decision,
    Control_Status: aggregate.Control_Status,
    Control_Directive: aggregate.Control_Directive,
    Execution_Gate: aggregate.Execution_Gate,
    Dispatch_Status: aggregate.Dispatch_Status,
    Dispatch_Decision: aggregate.Dispatch_Decision,
    Dispatch_Mode: aggregate.Dispatch_Mode,
    Ledger_Status: ledger.status,
    Ledger_Event_Type: ledger.eventType,
    Ledger_Conclusion: ledger.conclusion,
    Ledger_Reason: ledger.reason,
    Recommended_Action: ledger.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1020_(aggregate, ledger),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionLedgerNoInput1020_(outputSheet, businessKey, ledgerDate, startedAt) {
  const cfg = SCIIP_1020_AUTONOMOUS_PROCESSOR_EXECUTION_LEDGER;

  const record = {
    Execution_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Ledger_Date: ledgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Dispatch_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_NO_INPUTS',
    Ledger_Event_Type: 'NO_DISPATCH_INPUT',
    Ledger_Conclusion: 'No autonomous execution dispatch activity was available to ledger.',
    Ledger_Reason: 'No execution dispatch records were available for the resolved ledger date.',
    Recommended_Action: 'Do not create downstream execution summaries until dispatch records exist.',
    Knowledge_Graph_Impact: 'Created permanent execution-ledger history showing no available dispatch inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1020_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionLedgerSheet_() {
  const cfg = SCIIP_1020_AUTONOMOUS_PROCESSOR_EXECUTION_LEDGER;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1020_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1020_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1020_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionDispatchRows1020_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1020_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1020_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1020_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1020_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1020_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1020_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1020_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1020_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1020_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Readiness_Status = sciipHigherReadinessConstraint1020_(aggregate.Readiness_Status, row.Readiness_Status);
    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1020_(aggregate.Readiness_Decision, row.Readiness_Decision);
    aggregate.Control_Status = sciipHigherControlStatusConstraint1020_(aggregate.Control_Status, row.Control_Status);
    aggregate.Control_Directive = sciipHigherControlDirectiveConstraint1020_(aggregate.Control_Directive, row.Control_Directive);
    aggregate.Execution_Gate = sciipHigherExecutionGateConstraint1020_(aggregate.Execution_Gate, row.Execution_Gate);
    aggregate.Dispatch_Status = sciipHigherDispatchStatusConstraint1020_(aggregate.Dispatch_Status, row.Dispatch_Status);
    aggregate.Dispatch_Decision = sciipHigherDispatchDecisionConstraint1020_(aggregate.Dispatch_Decision, row.Dispatch_Decision);
    aggregate.Dispatch_Mode = sciipHigherDispatchModeConstraint1020_(aggregate.Dispatch_Mode, row.Dispatch_Mode);
  });

  return aggregate;
}

function sciipResolveExecutionLedgerConclusion1020_(aggregate) {
  if (aggregate.Dispatch_Decision === 'DISPATCH_APPROVED') {
    return {
      status: 'RECORDED_DISPATCH_APPROVED',
      eventType: 'AUTONOMOUS_EXECUTION_DISPATCH_APPROVED',
      conclusion: 'Autonomous processor execution dispatch was approved and ledgered.',
      reason: 'Dispatch records show an open execution gate and approved autonomous dispatch.',
      action: 'Proceed to downstream execution outcome tracking.'
    };
  }

  if (aggregate.Dispatch_Decision === 'REQUIRE_MANUAL_DISPATCH_REVIEW') {
    return {
      status: 'RECORDED_REVIEW_REQUIRED',
      eventType: 'AUTONOMOUS_EXECUTION_REVIEW_REQUIRED',
      conclusion: 'Autonomous processor execution dispatch requires manual review.',
      reason: 'Dispatch records show review-gated execution state.',
      action: 'Complete manual review before recording downstream execution outcomes.'
    };
  }

  if (aggregate.Dispatch_Decision === 'WAIT_TO_DISPATCH') {
    return {
      status: 'RECORDED_WAITING',
      eventType: 'AUTONOMOUS_EXECUTION_WAITING',
      conclusion: 'Autonomous processor execution dispatch is waiting.',
      reason: 'Dispatch records show execution gate is pending or control directive is WAIT.',
      action: 'Continue monitoring until dispatch is approved or blocked.'
    };
  }

  if (aggregate.Dispatch_Decision === 'DO_NOT_DISPATCH') {
    return {
      status: 'RECORDED_BLOCKED',
      eventType: 'AUTONOMOUS_EXECUTION_DISPATCH_BLOCKED',
      conclusion: 'Autonomous processor execution dispatch was blocked.',
      reason: 'Dispatch records show closed execution gate or do-not-advance directive.',
      action: 'Resolve upstream readiness and control blockers before dispatch.'
    };
  }

  return {
    status: 'RECORDED_UNKNOWN',
    eventType: 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN',
    conclusion: 'Autonomous processor execution dispatch state could not be classified.',
    reason: 'Dispatch decision did not match a known ledger classification.',
    action: 'Review dispatch records and normalize dispatch decision values.'
  };
}

function sciipResolveKnowledgeGraphImpact1020_(aggregate, ledger) {
  return [
    'Created immutable autonomous execution ledger entry.',
    'Ledger event=' + ledger.eventType + '.',
    'Ledger status=' + ledger.status + '.',
    'Dispatch decision=' + aggregate.Dispatch_Decision + '.',
    'Dispatch mode=' + aggregate.Dispatch_Mode + '.',
    'Execution gate=' + aggregate.Execution_Gate + '.',
    'Control directive=' + aggregate.Control_Directive + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1020_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1020_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1020_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessConstraint1020_(a, b) {
  const rank = { READY: 1, CONDITIONALLY_READY: 2, NOT_READY: 3 };
  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1020_(a, b) {
  const rank = {
    ADVANCE_EXECUTION: 1,
    CONTINUE_MONITORING: 2,
    HOLD_FOR_REVIEW: 3,
    DEFER_EXECUTION: 4
  };
  const aa = String(a || 'DEFER_EXECUTION').trim().toUpperCase();
  const bb = String(b || 'DEFER_EXECUTION').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlStatusConstraint1020_(a, b) {
  const rank = { CLEARED: 1, MONITORING: 2, HELD: 3, STOPPED: 4 };
  const aa = String(a || 'STOPPED').trim().toUpperCase();
  const bb = String(b || 'STOPPED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlDirectiveConstraint1020_(a, b) {
  const rank = {
    ADVANCE_AUTONOMOUS_EXECUTION: 1,
    WAIT: 2,
    MANUAL_REVIEW_REQUIRED: 3,
    DO_NOT_ADVANCE: 4
  };
  const aa = String(a || 'DO_NOT_ADVANCE').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_ADVANCE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherExecutionGateConstraint1020_(a, b) {
  const rank = { OPEN: 1, PENDING: 2, REVIEW: 3, CLOSED: 4 };
  const aa = String(a || 'CLOSED').trim().toUpperCase();
  const bb = String(b || 'CLOSED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchStatusConstraint1020_(a, b) {
  const rank = {
    DISPATCH_READY: 1,
    WAITING: 2,
    HELD_FOR_REVIEW: 3,
    NOT_DISPATCHED: 4
  };
  const aa = String(a || 'NOT_DISPATCHED').trim().toUpperCase();
  const bb = String(b || 'NOT_DISPATCHED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchDecisionConstraint1020_(a, b) {
  const rank = {
    DISPATCH_APPROVED: 1,
    WAIT_TO_DISPATCH: 2,
    REQUIRE_MANUAL_DISPATCH_REVIEW: 3,
    DO_NOT_DISPATCH: 4
  };
  const aa = String(a || 'DO_NOT_DISPATCH').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_DISPATCH').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchModeConstraint1020_(a, b) {
  const rank = {
    AUTONOMOUS: 1,
    MONITOR_ONLY: 2,
    MANUAL_REVIEW: 3,
    NONE: 4
  };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1030_AutonomousProcessorExecutionOutcomeProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionOutcomeProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1030_AutonomousProcessorExecutionOutcomeProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOMES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOMES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1030_AutonomousProcessorExecutionOutcomeProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionOutcomeProcessorLegacy1030_();
      return sciipWrapLegacyRuntimeResult1030_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1030_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1030_AutonomousProcessorExecutionOutcomeProcessor
 *******************************************************/

const SCIIP_1030_AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME = {
  PROCESSOR: '1030_AutonomousProcessorExecutionOutcomeProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_LEDGER',
  INPUT_DATE_COLUMN: 'Ledger_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME',

  OUTPUT_HEADERS: [
    'Execution_Outcome_ID',
    'Business_Key',
    'Outcome_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Ledger_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Readiness_Status',
    'Readiness_Decision',
    'Control_Status',
    'Control_Directive',
    'Execution_Gate',
    'Dispatch_Status',
    'Dispatch_Decision',
    'Dispatch_Mode',
    'Ledger_Status',
    'Ledger_Event_Type',
    'Outcome_Status',
    'Outcome_Type',
    'Outcome_Conclusion',
    'Outcome_Reason',
    'Operational_Impact',
    'Recommended_Action',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionOutcomeProcessorLegacy1030_() {
  const cfg = SCIIP_1030_AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionOutcomeSheet_();

  const resolvedOutcomeDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME|' + resolvedOutcomeDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionOutcomesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionOutcomeNoInput1030_(
      outputSheet,
      businessKey,
      resolvedOutcomeDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1030_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1030_(row[cfg.INPUT_DATE_COLUMN]) === resolvedOutcomeDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionOutcomeNoInput1030_(
      outputSheet,
      businessKey,
      resolvedOutcomeDate,
      startedAt
    );
  }

  const outcomeRecord =
    sciipBuildAutonomousProcessorExecutionOutcome1030_(
      sourceRows,
      businessKey,
      resolvedOutcomeDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1030_(outcomeRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionOutcomesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    outcomeDate: resolvedOutcomeDate,
    outcomeStatus: outcomeRecord.Outcome_Status,
    outcomeType: outcomeRecord.Outcome_Type,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionOutcome1030_(sourceRows, businessKey, outcomeDate, startedAt) {
  const cfg = SCIIP_1030_AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME;

  const aggregate = sciipAggregateExecutionLedgerRows1030_(sourceRows);
  const outcome = sciipResolveExecutionOutcome1030_(aggregate);

  return {
    Execution_Outcome_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Outcome_Date: outcomeDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Ledger_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Readiness_Status: aggregate.Readiness_Status,
    Readiness_Decision: aggregate.Readiness_Decision,
    Control_Status: aggregate.Control_Status,
    Control_Directive: aggregate.Control_Directive,
    Execution_Gate: aggregate.Execution_Gate,
    Dispatch_Status: aggregate.Dispatch_Status,
    Dispatch_Decision: aggregate.Dispatch_Decision,
    Dispatch_Mode: aggregate.Dispatch_Mode,
    Ledger_Status: aggregate.Ledger_Status,
    Ledger_Event_Type: aggregate.Ledger_Event_Type,
    Outcome_Status: outcome.status,
    Outcome_Type: outcome.type,
    Outcome_Conclusion: outcome.conclusion,
    Outcome_Reason: outcome.reason,
    Operational_Impact: outcome.impact,
    Recommended_Action: outcome.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1030_(aggregate, outcome),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionOutcomeNoInput1030_(outputSheet, businessKey, outcomeDate, startedAt) {
  const cfg = SCIIP_1030_AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME;

  const record = {
    Execution_Outcome_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Outcome_Date: outcomeDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Ledger_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_NO_INPUTS',
    Ledger_Event_Type: 'NO_LEDGER_INPUT',
    Outcome_Status: 'NO_OUTCOME',
    Outcome_Type: 'NO_LEDGER_INPUT',
    Outcome_Conclusion: 'No autonomous execution outcome could be classified.',
    Outcome_Reason: 'No execution ledger records were available for the resolved outcome date.',
    Operational_Impact: 'No operational execution impact was detected.',
    Recommended_Action: 'Do not create downstream execution summaries until ledger records exist.',
    Knowledge_Graph_Impact: 'Created permanent execution-outcome history showing no available ledger inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1030_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionOutcomesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionOutcomeSheet_() {
  const cfg = SCIIP_1030_AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1030_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1030_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1030_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionLedgerRows1030_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_UNKNOWN',
    Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1030_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1030_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1030_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1030_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1030_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1030_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1030_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1030_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1030_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Readiness_Status = sciipHigherReadinessConstraint1030_(aggregate.Readiness_Status, row.Readiness_Status);
    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1030_(aggregate.Readiness_Decision, row.Readiness_Decision);
    aggregate.Control_Status = sciipHigherControlStatusConstraint1030_(aggregate.Control_Status, row.Control_Status);
    aggregate.Control_Directive = sciipHigherControlDirectiveConstraint1030_(aggregate.Control_Directive, row.Control_Directive);
    aggregate.Execution_Gate = sciipHigherExecutionGateConstraint1030_(aggregate.Execution_Gate, row.Execution_Gate);
    aggregate.Dispatch_Status = sciipHigherDispatchStatusConstraint1030_(aggregate.Dispatch_Status, row.Dispatch_Status);
    aggregate.Dispatch_Decision = sciipHigherDispatchDecisionConstraint1030_(aggregate.Dispatch_Decision, row.Dispatch_Decision);
    aggregate.Dispatch_Mode = sciipHigherDispatchModeConstraint1030_(aggregate.Dispatch_Mode, row.Dispatch_Mode);
    aggregate.Ledger_Status = sciipHigherLedgerStatusConstraint1030_(aggregate.Ledger_Status, row.Ledger_Status);
    aggregate.Ledger_Event_Type = sciipHigherLedgerEventTypeConstraint1030_(aggregate.Ledger_Event_Type, row.Ledger_Event_Type);
  });

  return aggregate;
}

function sciipResolveExecutionOutcome1030_(aggregate) {
  if (aggregate.Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DISPATCH_APPROVED') {
    return {
      status: 'OUTCOME_SUCCESS',
      type: 'EXECUTION_ADVANCED',
      conclusion: 'Autonomous processor execution was approved for downstream advancement.',
      reason: 'Execution ledger records show dispatch approved with an open execution pathway.',
      impact: 'SCIIP_OS autonomous processor chain is operating and cleared for downstream execution tracking.',
      action: 'Continue to downstream execution-result and performance processors.'
    };
  }

  if (aggregate.Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_REVIEW_REQUIRED') {
    return {
      status: 'OUTCOME_REVIEW_REQUIRED',
      type: 'EXECUTION_HELD',
      conclusion: 'Autonomous processor execution was held for review.',
      reason: 'Execution ledger records show manual review is required before dispatch can advance.',
      impact: 'SCIIP_OS preserved control discipline and prevented unreviewed autonomous execution.',
      action: 'Complete review and rerun monitor, readiness, control, dispatch, ledger, and outcome processors.'
    };
  }

  if (aggregate.Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_WAITING') {
    return {
      status: 'OUTCOME_PENDING',
      type: 'EXECUTION_WAITING',
      conclusion: 'Autonomous processor execution is waiting.',
      reason: 'Execution ledger records show dispatch is not yet approved or blocked.',
      impact: 'SCIIP_OS maintained pending execution state without forcing downstream action.',
      action: 'Continue monitoring until autonomous execution is approved, blocked, or reviewed.'
    };
  }

  if (aggregate.Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DISPATCH_BLOCKED') {
    return {
      status: 'OUTCOME_BLOCKED',
      type: 'EXECUTION_BLOCKED',
      conclusion: 'Autonomous processor execution was blocked.',
      reason: 'Execution ledger records show dispatch was blocked by upstream readiness or control conditions.',
      impact: 'SCIIP_OS prevented unsafe downstream autonomous execution.',
      action: 'Resolve upstream blockers and rerun the autonomous execution chain.'
    };
  }

  return {
    status: 'OUTCOME_UNKNOWN',
    type: 'EXECUTION_UNCLASSIFIED',
    conclusion: 'Autonomous processor execution outcome could not be classified.',
    reason: 'Execution ledger event type did not match a known outcome class.',
    impact: 'SCIIP_OS recorded an unclassified outcome requiring normalization review.',
    action: 'Review execution ledger records and normalize event type values.'
  };
}

function sciipResolveKnowledgeGraphImpact1030_(aggregate, outcome) {
  return [
    'Created permanent autonomous execution outcome history.',
    'Outcome status=' + outcome.status + '.',
    'Outcome type=' + outcome.type + '.',
    'Ledger event=' + aggregate.Ledger_Event_Type + '.',
    'Ledger status=' + aggregate.Ledger_Status + '.',
    'Dispatch decision=' + aggregate.Dispatch_Decision + '.',
    'Execution gate=' + aggregate.Execution_Gate + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1030_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1030_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1030_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessConstraint1030_(a, b) {
  const rank = { READY: 1, CONDITIONALLY_READY: 2, NOT_READY: 3 };
  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1030_(a, b) {
  const rank = {
    ADVANCE_EXECUTION: 1,
    CONTINUE_MONITORING: 2,
    HOLD_FOR_REVIEW: 3,
    DEFER_EXECUTION: 4
  };
  const aa = String(a || 'DEFER_EXECUTION').trim().toUpperCase();
  const bb = String(b || 'DEFER_EXECUTION').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlStatusConstraint1030_(a, b) {
  const rank = { CLEARED: 1, MONITORING: 2, HELD: 3, STOPPED: 4 };
  const aa = String(a || 'STOPPED').trim().toUpperCase();
  const bb = String(b || 'STOPPED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlDirectiveConstraint1030_(a, b) {
  const rank = {
    ADVANCE_AUTONOMOUS_EXECUTION: 1,
    WAIT: 2,
    MANUAL_REVIEW_REQUIRED: 3,
    DO_NOT_ADVANCE: 4
  };
  const aa = String(a || 'DO_NOT_ADVANCE').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_ADVANCE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherExecutionGateConstraint1030_(a, b) {
  const rank = { OPEN: 1, PENDING: 2, REVIEW: 3, CLOSED: 4 };
  const aa = String(a || 'CLOSED').trim().toUpperCase();
  const bb = String(b || 'CLOSED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchStatusConstraint1030_(a, b) {
  const rank = {
    DISPATCH_READY: 1,
    WAITING: 2,
    HELD_FOR_REVIEW: 3,
    NOT_DISPATCHED: 4
  };
  const aa = String(a || 'NOT_DISPATCHED').trim().toUpperCase();
  const bb = String(b || 'NOT_DISPATCHED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchDecisionConstraint1030_(a, b) {
  const rank = {
    DISPATCH_APPROVED: 1,
    WAIT_TO_DISPATCH: 2,
    REQUIRE_MANUAL_DISPATCH_REVIEW: 3,
    DO_NOT_DISPATCH: 4
  };
  const aa = String(a || 'DO_NOT_DISPATCH').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_DISPATCH').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchModeConstraint1030_(a, b) {
  const rank = {
    AUTONOMOUS: 1,
    MONITOR_ONLY: 2,
    MANUAL_REVIEW: 3,
    NONE: 4
  };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherLedgerStatusConstraint1030_(a, b) {
  const rank = {
    RECORDED_DISPATCH_APPROVED: 1,
    RECORDED_WAITING: 2,
    RECORDED_REVIEW_REQUIRED: 3,
    RECORDED_BLOCKED: 4,
    RECORDED_NO_INPUTS: 5,
    RECORDED_UNKNOWN: 6
  };
  const aa = String(a || 'RECORDED_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherLedgerEventTypeConstraint1030_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_DISPATCH_APPROVED: 1,
    AUTONOMOUS_EXECUTION_WAITING: 2,
    AUTONOMOUS_EXECUTION_REVIEW_REQUIRED: 3,
    AUTONOMOUS_EXECUTION_DISPATCH_BLOCKED: 4,
    NO_DISPATCH_INPUT: 5,
    NO_LEDGER_INPUT: 6,
    AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionOutcomeProcessor() {
  const result = sciipRunAutonomousProcessorExecutionOutcomeProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionOutcomeProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1040_AutonomousProcessorExecutionSummaryProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionSummaryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1040_AutonomousProcessorExecutionSummaryProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARYS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARYS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1040_AutonomousProcessorExecutionSummaryProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionSummaryProcessorLegacy1040_();
      return sciipWrapLegacyRuntimeResult1040_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1040_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1040_AutonomousProcessorExecutionSummaryProcessor
 *******************************************************/

const SCIIP_1040_AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY = {
  PROCESSOR: '1040_AutonomousProcessorExecutionSummaryProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME',
  INPUT_DATE_COLUMN: 'Outcome_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY',

  OUTPUT_HEADERS: [
    'Execution_Summary_ID',
    'Business_Key',
    'Summary_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Outcome_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Readiness_Status',
    'Readiness_Decision',
    'Control_Status',
    'Control_Directive',
    'Execution_Gate',
    'Dispatch_Status',
    'Dispatch_Decision',
    'Dispatch_Mode',
    'Ledger_Status',
    'Ledger_Event_Type',
    'Outcome_Status',
    'Outcome_Type',
    'Summary_Status',
    'Summary_Headline',
    'Summary_Narrative',
    'Operational_Posture',
    'Recommended_Action',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionSummaryProcessorLegacy1040_() {
  const cfg = SCIIP_1040_AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionSummarySheet_();

  const resolvedSummaryDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY|' + resolvedSummaryDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionSummariesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionSummaryNoInput1040_(
      outputSheet,
      businessKey,
      resolvedSummaryDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1040_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1040_(row[cfg.INPUT_DATE_COLUMN]) === resolvedSummaryDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionSummaryNoInput1040_(
      outputSheet,
      businessKey,
      resolvedSummaryDate,
      startedAt
    );
  }

  const summaryRecord =
    sciipBuildAutonomousProcessorExecutionSummary1040_(
      sourceRows,
      businessKey,
      resolvedSummaryDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1040_(summaryRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    summaryDate: resolvedSummaryDate,
    summaryStatus: summaryRecord.Summary_Status,
    operationalPosture: summaryRecord.Operational_Posture,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionSummary1040_(sourceRows, businessKey, summaryDate, startedAt) {
  const cfg = SCIIP_1040_AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY;

  const aggregate = sciipAggregateExecutionOutcomeRows1040_(sourceRows);
  const summary = sciipResolveExecutionSummary1040_(aggregate);

  return {
    Execution_Summary_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Summary_Date: summaryDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Outcome_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Readiness_Status: aggregate.Readiness_Status,
    Readiness_Decision: aggregate.Readiness_Decision,
    Control_Status: aggregate.Control_Status,
    Control_Directive: aggregate.Control_Directive,
    Execution_Gate: aggregate.Execution_Gate,
    Dispatch_Status: aggregate.Dispatch_Status,
    Dispatch_Decision: aggregate.Dispatch_Decision,
    Dispatch_Mode: aggregate.Dispatch_Mode,
    Ledger_Status: aggregate.Ledger_Status,
    Ledger_Event_Type: aggregate.Ledger_Event_Type,
    Outcome_Status: aggregate.Outcome_Status,
    Outcome_Type: aggregate.Outcome_Type,
    Summary_Status: summary.status,
    Summary_Headline: summary.headline,
    Summary_Narrative: summary.narrative,
    Operational_Posture: summary.posture,
    Recommended_Action: summary.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1040_(aggregate, summary),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionSummaryNoInput1040_(outputSheet, businessKey, summaryDate, startedAt) {
  const cfg = SCIIP_1040_AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY;

  const record = {
    Execution_Summary_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Summary_Date: summaryDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Outcome_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_NO_INPUTS',
    Ledger_Event_Type: 'NO_LEDGER_INPUT',
    Outcome_Status: 'NO_OUTCOME',
    Outcome_Type: 'NO_LEDGER_INPUT',
    Summary_Status: 'NO_SUMMARY_INPUT',
    Summary_Headline: 'No autonomous execution outcome records available.',
    Summary_Narrative: 'SCIIP_OS could not produce an execution summary because no execution outcome records were available for the resolved summary date.',
    Operational_Posture: 'NO_INPUTS',
    Recommended_Action: 'Do not advance to downstream governance reporting until execution outcome records exist.',
    Knowledge_Graph_Impact: 'Created permanent execution-summary history showing no available outcome inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1040_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionSummarySheet_() {
  const cfg = SCIIP_1040_AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1040_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1040_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1040_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionOutcomeRows1040_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_UNKNOWN',
    Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN',
    Outcome_Status: 'OUTCOME_UNKNOWN',
    Outcome_Type: 'EXECUTION_UNCLASSIFIED'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1040_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1040_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1040_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1040_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1040_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1040_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1040_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1040_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1040_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Readiness_Status = sciipHigherReadinessConstraint1040_(aggregate.Readiness_Status, row.Readiness_Status);
    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1040_(aggregate.Readiness_Decision, row.Readiness_Decision);
    aggregate.Control_Status = sciipHigherControlStatusConstraint1040_(aggregate.Control_Status, row.Control_Status);
    aggregate.Control_Directive = sciipHigherControlDirectiveConstraint1040_(aggregate.Control_Directive, row.Control_Directive);
    aggregate.Execution_Gate = sciipHigherExecutionGateConstraint1040_(aggregate.Execution_Gate, row.Execution_Gate);
    aggregate.Dispatch_Status = sciipHigherDispatchStatusConstraint1040_(aggregate.Dispatch_Status, row.Dispatch_Status);
    aggregate.Dispatch_Decision = sciipHigherDispatchDecisionConstraint1040_(aggregate.Dispatch_Decision, row.Dispatch_Decision);
    aggregate.Dispatch_Mode = sciipHigherDispatchModeConstraint1040_(aggregate.Dispatch_Mode, row.Dispatch_Mode);
    aggregate.Ledger_Status = sciipHigherLedgerStatusConstraint1040_(aggregate.Ledger_Status, row.Ledger_Status);
    aggregate.Ledger_Event_Type = sciipHigherLedgerEventTypeConstraint1040_(aggregate.Ledger_Event_Type, row.Ledger_Event_Type);
    aggregate.Outcome_Status = sciipHigherOutcomeStatusConstraint1040_(aggregate.Outcome_Status, row.Outcome_Status);
    aggregate.Outcome_Type = sciipHigherOutcomeTypeConstraint1040_(aggregate.Outcome_Type, row.Outcome_Type);
  });

  return aggregate;
}

function sciipResolveExecutionSummary1040_(aggregate) {
  if (aggregate.Outcome_Status === 'OUTCOME_SUCCESS') {
    return {
      status: 'SUMMARY_CLEAR',
      headline: 'Autonomous execution chain cleared for downstream execution.',
      narrative: 'SCIIP_OS recorded a successful autonomous execution outcome. Dispatch was approved, the execution gate was open, and the processor chain is ready for downstream execution-result tracking.',
      posture: 'OPERATIONAL',
      action: 'Advance to downstream execution-result and performance summary processors.'
    };
  }

  if (aggregate.Outcome_Status === 'OUTCOME_REVIEW_REQUIRED') {
    return {
      status: 'SUMMARY_REVIEW_REQUIRED',
      headline: 'Autonomous execution chain requires manual review.',
      narrative: 'SCIIP_OS held autonomous execution because the outcome processor detected a review-required state. The system preserved governance control and prevented unreviewed downstream execution.',
      posture: 'CONTROLLED_REVIEW',
      action: 'Complete review, resolve held items, and rerun the autonomous execution chain.'
    };
  }

  if (aggregate.Outcome_Status === 'OUTCOME_PENDING') {
    return {
      status: 'SUMMARY_PENDING',
      headline: 'Autonomous execution chain is waiting.',
      narrative: 'SCIIP_OS recorded a pending execution outcome. Execution has not been blocked, but downstream dispatch has not yet been approved.',
      posture: 'MONITORING',
      action: 'Continue monitoring until readiness, control, and dispatch conditions resolve.'
    };
  }

  if (aggregate.Outcome_Status === 'OUTCOME_BLOCKED') {
    return {
      status: 'SUMMARY_BLOCKED',
      headline: 'Autonomous execution chain is blocked.',
      narrative: 'SCIIP_OS blocked downstream autonomous execution because upstream readiness, control, dispatch, or ledger conditions indicated execution should not advance.',
      posture: 'BLOCKED',
      action: 'Resolve upstream blockers and rerun monitor through summary processors.'
    };
  }

  if (aggregate.Outcome_Status === 'NO_OUTCOME') {
    return {
      status: 'SUMMARY_NO_OUTCOME',
      headline: 'No autonomous execution outcome available.',
      narrative: 'SCIIP_OS did not identify an execution outcome record for the resolved summary date.',
      posture: 'NO_INPUTS',
      action: 'Generate execution outcome records before relying on execution summary reporting.'
    };
  }

  return {
    status: 'SUMMARY_UNKNOWN',
    headline: 'Autonomous execution summary could not classify the current state.',
    narrative: 'SCIIP_OS created a summary, but the outcome status did not match a known summary class.',
    posture: 'REVIEW_REQUIRED',
    action: 'Review execution outcome records and normalize outcome values.'
  };
}

function sciipResolveKnowledgeGraphImpact1040_(aggregate, summary) {
  return [
    'Created permanent autonomous execution summary history.',
    'Summary status=' + summary.status + '.',
    'Operational posture=' + summary.posture + '.',
    'Outcome status=' + aggregate.Outcome_Status + '.',
    'Outcome type=' + aggregate.Outcome_Type + '.',
    'Ledger event=' + aggregate.Ledger_Event_Type + '.',
    'Dispatch decision=' + aggregate.Dispatch_Decision + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1040_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1040_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1040_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessConstraint1040_(a, b) {
  const rank = { READY: 1, CONDITIONALLY_READY: 2, NOT_READY: 3 };
  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1040_(a, b) {
  const rank = {
    ADVANCE_EXECUTION: 1,
    CONTINUE_MONITORING: 2,
    HOLD_FOR_REVIEW: 3,
    DEFER_EXECUTION: 4
  };
  const aa = String(a || 'DEFER_EXECUTION').trim().toUpperCase();
  const bb = String(b || 'DEFER_EXECUTION').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlStatusConstraint1040_(a, b) {
  const rank = { CLEARED: 1, MONITORING: 2, HELD: 3, STOPPED: 4 };
  const aa = String(a || 'STOPPED').trim().toUpperCase();
  const bb = String(b || 'STOPPED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlDirectiveConstraint1040_(a, b) {
  const rank = {
    ADVANCE_AUTONOMOUS_EXECUTION: 1,
    WAIT: 2,
    MANUAL_REVIEW_REQUIRED: 3,
    DO_NOT_ADVANCE: 4
  };
  const aa = String(a || 'DO_NOT_ADVANCE').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_ADVANCE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherExecutionGateConstraint1040_(a, b) {
  const rank = { OPEN: 1, PENDING: 2, REVIEW: 3, CLOSED: 4 };
  const aa = String(a || 'CLOSED').trim().toUpperCase();
  const bb = String(b || 'CLOSED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchStatusConstraint1040_(a, b) {
  const rank = {
    DISPATCH_READY: 1,
    WAITING: 2,
    HELD_FOR_REVIEW: 3,
    NOT_DISPATCHED: 4
  };
  const aa = String(a || 'NOT_DISPATCHED').trim().toUpperCase();
  const bb = String(b || 'NOT_DISPATCHED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchDecisionConstraint1040_(a, b) {
  const rank = {
    DISPATCH_APPROVED: 1,
    WAIT_TO_DISPATCH: 2,
    REQUIRE_MANUAL_DISPATCH_REVIEW: 3,
    DO_NOT_DISPATCH: 4
  };
  const aa = String(a || 'DO_NOT_DISPATCH').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_DISPATCH').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchModeConstraint1040_(a, b) {
  const rank = {
    AUTONOMOUS: 1,
    MONITOR_ONLY: 2,
    MANUAL_REVIEW: 3,
    NONE: 4
  };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherLedgerStatusConstraint1040_(a, b) {
  const rank = {
    RECORDED_DISPATCH_APPROVED: 1,
    RECORDED_WAITING: 2,
    RECORDED_REVIEW_REQUIRED: 3,
    RECORDED_BLOCKED: 4,
    RECORDED_NO_INPUTS: 5,
    RECORDED_UNKNOWN: 6
  };
  const aa = String(a || 'RECORDED_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherLedgerEventTypeConstraint1040_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_DISPATCH_APPROVED: 1,
    AUTONOMOUS_EXECUTION_WAITING: 2,
    AUTONOMOUS_EXECUTION_REVIEW_REQUIRED: 3,
    AUTONOMOUS_EXECUTION_DISPATCH_BLOCKED: 4,
    NO_DISPATCH_INPUT: 5,
    NO_LEDGER_INPUT: 6,
    AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOutcomeStatusConstraint1040_(a, b) {
  const rank = {
    OUTCOME_SUCCESS: 1,
    OUTCOME_PENDING: 2,
    OUTCOME_REVIEW_REQUIRED: 3,
    OUTCOME_BLOCKED: 4,
    NO_OUTCOME: 5,
    OUTCOME_UNKNOWN: 6
  };
  const aa = String(a || 'OUTCOME_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'OUTCOME_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOutcomeTypeConstraint1040_(a, b) {
  const rank = {
    EXECUTION_ADVANCED: 1,
    EXECUTION_WAITING: 2,
    EXECUTION_HELD: 3,
    EXECUTION_BLOCKED: 4,
    NO_LEDGER_INPUT: 5,
    EXECUTION_UNCLASSIFIED: 6
  };
  const aa = String(a || 'EXECUTION_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'EXECUTION_UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionSummaryProcessor() {
  const result = sciipRunAutonomousProcessorExecutionSummaryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionSummaryProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1050_AutonomousProcessorExecutionGovernanceProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionGovernanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1050_AutonomousProcessorExecutionGovernanceProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1050_AutonomousProcessorExecutionGovernanceProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionGovernanceProcessorLegacy1050_();
      return sciipWrapLegacyRuntimeResult1050_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1050_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1050_AutonomousProcessorExecutionGovernanceProcessor
 *******************************************************/

const SCIIP_1050_AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE = {
  PROCESSOR: '1050_AutonomousProcessorExecutionGovernanceProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY',
  INPUT_DATE_COLUMN: 'Summary_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE',

  OUTPUT_HEADERS: [
    'Execution_Governance_ID',
    'Business_Key',
    'Governance_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Summary_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Readiness_Status',
    'Readiness_Decision',
    'Control_Status',
    'Control_Directive',
    'Execution_Gate',
    'Dispatch_Status',
    'Dispatch_Decision',
    'Dispatch_Mode',
    'Ledger_Status',
    'Ledger_Event_Type',
    'Outcome_Status',
    'Outcome_Type',
    'Summary_Status',
    'Operational_Posture',
    'Governance_Status',
    'Governance_Decision',
    'Governance_Reason',
    'Governance_Risk_Level',
    'Governance_Action',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionGovernanceProcessorLegacy1050_() {
  const cfg = SCIIP_1050_AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionGovernanceSheet_();

  const resolvedGovernanceDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE|' + resolvedGovernanceDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionGovernanceCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionGovernanceNoInput1050_(
      outputSheet,
      businessKey,
      resolvedGovernanceDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1050_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1050_(row[cfg.INPUT_DATE_COLUMN]) === resolvedGovernanceDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionGovernanceNoInput1050_(
      outputSheet,
      businessKey,
      resolvedGovernanceDate,
      startedAt
    );
  }

  const governanceRecord =
    sciipBuildAutonomousProcessorExecutionGovernance1050_(
      sourceRows,
      businessKey,
      resolvedGovernanceDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1050_(governanceRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionGovernanceCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    governanceDate: resolvedGovernanceDate,
    governanceStatus: governanceRecord.Governance_Status,
    governanceDecision: governanceRecord.Governance_Decision,
    governanceRiskLevel: governanceRecord.Governance_Risk_Level,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionGovernance1050_(sourceRows, businessKey, governanceDate, startedAt) {
  const cfg = SCIIP_1050_AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE;

  const aggregate = sciipAggregateExecutionSummaryRows1050_(sourceRows);
  const governance = sciipResolveExecutionGovernance1050_(aggregate);

  return {
    Execution_Governance_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Governance_Date: governanceDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Summary_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Readiness_Status: aggregate.Readiness_Status,
    Readiness_Decision: aggregate.Readiness_Decision,
    Control_Status: aggregate.Control_Status,
    Control_Directive: aggregate.Control_Directive,
    Execution_Gate: aggregate.Execution_Gate,
    Dispatch_Status: aggregate.Dispatch_Status,
    Dispatch_Decision: aggregate.Dispatch_Decision,
    Dispatch_Mode: aggregate.Dispatch_Mode,
    Ledger_Status: aggregate.Ledger_Status,
    Ledger_Event_Type: aggregate.Ledger_Event_Type,
    Outcome_Status: aggregate.Outcome_Status,
    Outcome_Type: aggregate.Outcome_Type,
    Summary_Status: aggregate.Summary_Status,
    Operational_Posture: aggregate.Operational_Posture,
    Governance_Status: governance.status,
    Governance_Decision: governance.decision,
    Governance_Reason: governance.reason,
    Governance_Risk_Level: governance.riskLevel,
    Governance_Action: governance.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1050_(aggregate, governance),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionGovernanceNoInput1050_(outputSheet, businessKey, governanceDate, startedAt) {
  const cfg = SCIIP_1050_AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE;

  const record = {
    Execution_Governance_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Governance_Date: governanceDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Summary_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_NO_INPUTS',
    Ledger_Event_Type: 'NO_LEDGER_INPUT',
    Outcome_Status: 'NO_OUTCOME',
    Outcome_Type: 'NO_LEDGER_INPUT',
    Summary_Status: 'NO_SUMMARY_INPUT',
    Operational_Posture: 'NO_INPUTS',
    Governance_Status: 'NO_GOVERNANCE_INPUT',
    Governance_Decision: 'DO_NOT_CERTIFY',
    Governance_Reason: 'No execution summary records were available for the resolved governance date.',
    Governance_Risk_Level: 'UNKNOWN',
    Governance_Action: 'Generate execution summary records before governance certification.',
    Knowledge_Graph_Impact: 'Created permanent execution-governance history showing no available summary inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1050_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionGovernanceCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionGovernanceSheet_() {
  const cfg = SCIIP_1050_AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1050_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1050_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1050_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionSummaryRows1050_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_UNKNOWN',
    Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN',
    Outcome_Status: 'OUTCOME_UNKNOWN',
    Outcome_Type: 'EXECUTION_UNCLASSIFIED',
    Summary_Status: 'SUMMARY_UNKNOWN',
    Operational_Posture: 'REVIEW_REQUIRED'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1050_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1050_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1050_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1050_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1050_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1050_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1050_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1050_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1050_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Readiness_Status = sciipHigherReadinessConstraint1050_(aggregate.Readiness_Status, row.Readiness_Status);
    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1050_(aggregate.Readiness_Decision, row.Readiness_Decision);
    aggregate.Control_Status = sciipHigherControlStatusConstraint1050_(aggregate.Control_Status, row.Control_Status);
    aggregate.Control_Directive = sciipHigherControlDirectiveConstraint1050_(aggregate.Control_Directive, row.Control_Directive);
    aggregate.Execution_Gate = sciipHigherExecutionGateConstraint1050_(aggregate.Execution_Gate, row.Execution_Gate);
    aggregate.Dispatch_Status = sciipHigherDispatchStatusConstraint1050_(aggregate.Dispatch_Status, row.Dispatch_Status);
    aggregate.Dispatch_Decision = sciipHigherDispatchDecisionConstraint1050_(aggregate.Dispatch_Decision, row.Dispatch_Decision);
    aggregate.Dispatch_Mode = sciipHigherDispatchModeConstraint1050_(aggregate.Dispatch_Mode, row.Dispatch_Mode);
    aggregate.Ledger_Status = sciipHigherLedgerStatusConstraint1050_(aggregate.Ledger_Status, row.Ledger_Status);
    aggregate.Ledger_Event_Type = sciipHigherLedgerEventTypeConstraint1050_(aggregate.Ledger_Event_Type, row.Ledger_Event_Type);
    aggregate.Outcome_Status = sciipHigherOutcomeStatusConstraint1050_(aggregate.Outcome_Status, row.Outcome_Status);
    aggregate.Outcome_Type = sciipHigherOutcomeTypeConstraint1050_(aggregate.Outcome_Type, row.Outcome_Type);
    aggregate.Summary_Status = sciipHigherSummaryStatusConstraint1050_(aggregate.Summary_Status, row.Summary_Status);
    aggregate.Operational_Posture = sciipHigherOperationalPostureConstraint1050_(aggregate.Operational_Posture, row.Operational_Posture);
  });

  return aggregate;
}

function sciipResolveExecutionGovernance1050_(aggregate) {
  if (aggregate.Failed_Count > 0 || aggregate.Blocked_Count > 0 || aggregate.Summary_Status === 'SUMMARY_BLOCKED') {
    return {
      status: 'GOVERNANCE_BLOCKED',
      decision: 'DO_NOT_CERTIFY',
      reason: 'Execution governance identified blocked or failed autonomous processor conditions.',
      riskLevel: 'HIGH',
      action: 'Resolve upstream blockers before certifying autonomous execution chain.'
    };
  }

  if (
    aggregate.Summary_Status === 'SUMMARY_REVIEW_REQUIRED' ||
    aggregate.Operational_Posture === 'CONTROLLED_REVIEW' ||
    aggregate.Hold_Count > 0
  ) {
    return {
      status: 'GOVERNANCE_REVIEW_REQUIRED',
      decision: 'REQUIRE_REVIEW',
      reason: 'Execution governance identified a controlled-review state.',
      riskLevel: 'MEDIUM',
      action: 'Complete governance review before downstream command-center reporting.'
    };
  }

  if (
    aggregate.Summary_Status === 'SUMMARY_PENDING' ||
    aggregate.Operational_Posture === 'MONITORING'
  ) {
    return {
      status: 'GOVERNANCE_MONITORING',
      decision: 'CERTIFY_MONITORING_STATE',
      reason: 'Execution governance identified a valid pending monitoring state.',
      riskLevel: 'LOW',
      action: 'Continue monitoring until execution conditions resolve.'
    };
  }

  if (
    aggregate.Summary_Status === 'SUMMARY_CLEAR' &&
    aggregate.Operational_Posture === 'OPERATIONAL'
  ) {
    return {
      status: 'GOVERNANCE_CERTIFIED',
      decision: 'CERTIFY_EXECUTION_STATE',
      reason: 'Execution governance certified the autonomous processor execution chain as operational.',
      riskLevel: 'LOW',
      action: 'Advance to downstream command-center and governance reporting.'
    };
  }

  if (
    aggregate.Summary_Status === 'NO_SUMMARY_INPUT' ||
    aggregate.Operational_Posture === 'NO_INPUTS'
  ) {
    return {
      status: 'GOVERNANCE_NO_INPUTS',
      decision: 'DO_NOT_CERTIFY',
      reason: 'Execution governance could not certify because no summary inputs were available.',
      riskLevel: 'UNKNOWN',
      action: 'Generate execution summaries before governance certification.'
    };
  }

  return {
    status: 'GOVERNANCE_UNCLASSIFIED',
    decision: 'REQUIRE_REVIEW',
    reason: 'Execution governance could not classify the execution summary state.',
    riskLevel: 'MEDIUM',
    action: 'Review summary records and normalize governance inputs.'
  };
}

function sciipResolveKnowledgeGraphImpact1050_(aggregate, governance) {
  return [
    'Created permanent autonomous execution governance history.',
    'Governance status=' + governance.status + '.',
    'Governance decision=' + governance.decision + '.',
    'Governance risk=' + governance.riskLevel + '.',
    'Summary status=' + aggregate.Summary_Status + '.',
    'Operational posture=' + aggregate.Operational_Posture + '.',
    'Outcome status=' + aggregate.Outcome_Status + '.',
    'Dispatch decision=' + aggregate.Dispatch_Decision + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1050_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1050_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1050_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessConstraint1050_(a, b) {
  const rank = { READY: 1, CONDITIONALLY_READY: 2, NOT_READY: 3 };
  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1050_(a, b) {
  const rank = {
    ADVANCE_EXECUTION: 1,
    CONTINUE_MONITORING: 2,
    HOLD_FOR_REVIEW: 3,
    DEFER_EXECUTION: 4
  };
  const aa = String(a || 'DEFER_EXECUTION').trim().toUpperCase();
  const bb = String(b || 'DEFER_EXECUTION').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlStatusConstraint1050_(a, b) {
  const rank = { CLEARED: 1, MONITORING: 2, HELD: 3, STOPPED: 4 };
  const aa = String(a || 'STOPPED').trim().toUpperCase();
  const bb = String(b || 'STOPPED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlDirectiveConstraint1050_(a, b) {
  const rank = {
    ADVANCE_AUTONOMOUS_EXECUTION: 1,
    WAIT: 2,
    MANUAL_REVIEW_REQUIRED: 3,
    DO_NOT_ADVANCE: 4
  };
  const aa = String(a || 'DO_NOT_ADVANCE').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_ADVANCE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherExecutionGateConstraint1050_(a, b) {
  const rank = { OPEN: 1, PENDING: 2, REVIEW: 3, CLOSED: 4 };
  const aa = String(a || 'CLOSED').trim().toUpperCase();
  const bb = String(b || 'CLOSED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchStatusConstraint1050_(a, b) {
  const rank = {
    DISPATCH_READY: 1,
    WAITING: 2,
    HELD_FOR_REVIEW: 3,
    NOT_DISPATCHED: 4
  };
  const aa = String(a || 'NOT_DISPATCHED').trim().toUpperCase();
  const bb = String(b || 'NOT_DISPATCHED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchDecisionConstraint1050_(a, b) {
  const rank = {
    DISPATCH_APPROVED: 1,
    WAIT_TO_DISPATCH: 2,
    REQUIRE_MANUAL_DISPATCH_REVIEW: 3,
    DO_NOT_DISPATCH: 4
  };
  const aa = String(a || 'DO_NOT_DISPATCH').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_DISPATCH').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchModeConstraint1050_(a, b) {
  const rank = {
    AUTONOMOUS: 1,
    MONITOR_ONLY: 2,
    MANUAL_REVIEW: 3,
    NONE: 4
  };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherLedgerStatusConstraint1050_(a, b) {
  const rank = {
    RECORDED_DISPATCH_APPROVED: 1,
    RECORDED_WAITING: 2,
    RECORDED_REVIEW_REQUIRED: 3,
    RECORDED_BLOCKED: 4,
    RECORDED_NO_INPUTS: 5,
    RECORDED_UNKNOWN: 6
  };
  const aa = String(a || 'RECORDED_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherLedgerEventTypeConstraint1050_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_DISPATCH_APPROVED: 1,
    AUTONOMOUS_EXECUTION_WAITING: 2,
    AUTONOMOUS_EXECUTION_REVIEW_REQUIRED: 3,
    AUTONOMOUS_EXECUTION_DISPATCH_BLOCKED: 4,
    NO_DISPATCH_INPUT: 5,
    NO_LEDGER_INPUT: 6,
    AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOutcomeStatusConstraint1050_(a, b) {
  const rank = {
    OUTCOME_SUCCESS: 1,
    OUTCOME_PENDING: 2,
    OUTCOME_REVIEW_REQUIRED: 3,
    OUTCOME_BLOCKED: 4,
    NO_OUTCOME: 5,
    OUTCOME_UNKNOWN: 6
  };
  const aa = String(a || 'OUTCOME_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'OUTCOME_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOutcomeTypeConstraint1050_(a, b) {
  const rank = {
    EXECUTION_ADVANCED: 1,
    EXECUTION_WAITING: 2,
    EXECUTION_HELD: 3,
    EXECUTION_BLOCKED: 4,
    NO_LEDGER_INPUT: 5,
    EXECUTION_UNCLASSIFIED: 6
  };
  const aa = String(a || 'EXECUTION_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'EXECUTION_UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSummaryStatusConstraint1050_(a, b) {
  const rank = {
    SUMMARY_CLEAR: 1,
    SUMMARY_PENDING: 2,
    SUMMARY_REVIEW_REQUIRED: 3,
    SUMMARY_BLOCKED: 4,
    SUMMARY_NO_OUTCOME: 5,
    NO_SUMMARY_INPUT: 6,
    SUMMARY_UNKNOWN: 7
  };
  const aa = String(a || 'SUMMARY_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'SUMMARY_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOperationalPostureConstraint1050_(a, b) {
  const rank = {
    OPERATIONAL: 1,
    MONITORING: 2,
    CONTROLLED_REVIEW: 3,
    BLOCKED: 4,
    NO_INPUTS: 5,
    REVIEW_REQUIRED: 6
  };
  const aa = String(a || 'REVIEW_REQUIRED').trim().toUpperCase();
  const bb = String(b || 'REVIEW_REQUIRED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionGovernanceProcessor() {
  const result = sciipRunAutonomousProcessorExecutionGovernanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionGovernanceProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1060_AutonomousProcessorExecutionCommandCenterProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1060_AutonomousProcessorExecutionCommandCenterProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1060_AutonomousProcessorExecutionCommandCenterProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionCommandCenterProcessorLegacy1060_();
      return sciipWrapLegacyRuntimeResult1060_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1060_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1060_AutonomousProcessorExecutionCommandCenterProcessor
 *******************************************************/

const SCIIP_1060_AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER = {
  PROCESSOR: '1060_AutonomousProcessorExecutionCommandCenterProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE',
  INPUT_DATE_COLUMN: 'Governance_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER',

  OUTPUT_HEADERS: [
    'Command_Center_ID',
    'Business_Key',
    'Command_Center_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Governance_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Summary_Status',
    'Operational_Posture',
    'Governance_Status',
    'Governance_Decision',
    'Governance_Risk_Level',
    'Command_Center_Status',
    'Command_Center_Message',
    'Command_Center_Severity',
    'Command_Center_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionCommandCenterProcessorLegacy1060_() {
  const cfg = SCIIP_1060_AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionCommandCenterSheet_();

  const resolvedCommandCenterDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER|' + resolvedCommandCenterDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionCommandCentersCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionCommandCenterNoInput1060_(
      outputSheet,
      businessKey,
      resolvedCommandCenterDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1060_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1060_(row[cfg.INPUT_DATE_COLUMN]) === resolvedCommandCenterDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionCommandCenterNoInput1060_(
      outputSheet,
      businessKey,
      resolvedCommandCenterDate,
      startedAt
    );
  }

  const commandRecord =
    sciipBuildAutonomousProcessorExecutionCommandCenter1060_(
      sourceRows,
      businessKey,
      resolvedCommandCenterDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1060_(commandRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionCommandCentersCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    commandCenterDate: resolvedCommandCenterDate,
    commandCenterStatus: commandRecord.Command_Center_Status,
    commandCenterSeverity: commandRecord.Command_Center_Severity,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionCommandCenter1060_(sourceRows, businessKey, commandCenterDate, startedAt) {
  const cfg = SCIIP_1060_AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER;

  const aggregate = sciipAggregateExecutionGovernanceRows1060_(sourceRows);
  const command = sciipResolveExecutionCommandCenter1060_(aggregate);

  return {
    Command_Center_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Command_Center_Date: commandCenterDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Governance_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Summary_Status: aggregate.Summary_Status,
    Operational_Posture: aggregate.Operational_Posture,
    Governance_Status: aggregate.Governance_Status,
    Governance_Decision: aggregate.Governance_Decision,
    Governance_Risk_Level: aggregate.Governance_Risk_Level,
    Command_Center_Status: command.status,
    Command_Center_Message: command.message,
    Command_Center_Severity: command.severity,
    Command_Center_Action: command.action,
    Dashboard_Flag: command.dashboardFlag,
    Leadership_Flag: command.leadershipFlag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1060_(aggregate, command),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionCommandCenterNoInput1060_(outputSheet, businessKey, commandCenterDate, startedAt) {
  const cfg = SCIIP_1060_AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER;

  const record = {
    Command_Center_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Command_Center_Date: commandCenterDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Governance_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Summary_Status: 'NO_SUMMARY_INPUT',
    Operational_Posture: 'NO_INPUTS',
    Governance_Status: 'NO_GOVERNANCE_INPUT',
    Governance_Decision: 'DO_NOT_CERTIFY',
    Governance_Risk_Level: 'UNKNOWN',
    Command_Center_Status: 'NO_INPUTS',
    Command_Center_Message: 'No autonomous execution governance records are available for command-center reporting.',
    Command_Center_Severity: 'UNKNOWN',
    Command_Center_Action: 'Generate governance records before relying on command-center execution reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent command-center history showing no available governance inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1060_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionCommandCentersCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionCommandCenterSheet_() {
  const cfg = SCIIP_1060_AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1060_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1060_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1060_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionGovernanceRows1060_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Summary_Status: 'SUMMARY_UNKNOWN',
    Operational_Posture: 'REVIEW_REQUIRED',
    Governance_Status: 'GOVERNANCE_UNCLASSIFIED',
    Governance_Decision: 'REQUIRE_REVIEW',
    Governance_Risk_Level: 'MEDIUM'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1060_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1060_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1060_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1060_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1060_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1060_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1060_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1060_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1060_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Summary_Status = sciipHigherSummaryStatusConstraint1060_(aggregate.Summary_Status, row.Summary_Status);
    aggregate.Operational_Posture = sciipHigherOperationalPostureConstraint1060_(aggregate.Operational_Posture, row.Operational_Posture);
    aggregate.Governance_Status = sciipHigherGovernanceStatusConstraint1060_(aggregate.Governance_Status, row.Governance_Status);
    aggregate.Governance_Decision = sciipHigherGovernanceDecisionConstraint1060_(aggregate.Governance_Decision, row.Governance_Decision);
    aggregate.Governance_Risk_Level = sciipHigherGovernanceRiskConstraint1060_(aggregate.Governance_Risk_Level, row.Governance_Risk_Level);
  });

  return aggregate;
}

function sciipResolveExecutionCommandCenter1060_(aggregate) {
  if (
    aggregate.Governance_Status === 'GOVERNANCE_BLOCKED' ||
    aggregate.Governance_Decision === 'DO_NOT_CERTIFY' ||
    aggregate.Governance_Risk_Level === 'HIGH'
  ) {
    return {
      status: 'ACTION_REQUIRED',
      message: 'Autonomous execution chain is blocked or uncertified.',
      severity: 'HIGH',
      action: 'Review governance blockers and rerun the autonomous execution processor chain after remediation.',
      dashboardFlag: 'YES',
      leadershipFlag: 'YES'
    };
  }

  if (
    aggregate.Governance_Status === 'GOVERNANCE_REVIEW_REQUIRED' ||
    aggregate.Governance_Decision === 'REQUIRE_REVIEW'
  ) {
    return {
      status: 'REVIEW_REQUIRED',
      message: 'Autonomous execution chain requires governance review before certification.',
      severity: 'MEDIUM',
      action: 'Complete governance review before downstream command-center clearance.',
      dashboardFlag: 'YES',
      leadershipFlag: 'YES'
    };
  }

  if (
    aggregate.Governance_Status === 'GOVERNANCE_MONITORING' ||
    aggregate.Governance_Decision === 'CERTIFY_MONITORING_STATE'
  ) {
    return {
      status: 'MONITORING',
      message: 'Autonomous execution chain is in a valid monitoring state.',
      severity: 'LOW',
      action: 'Continue monitoring until execution state clears, blocks, or requires review.',
      dashboardFlag: 'YES',
      leadershipFlag: 'NO'
    };
  }

  if (
    aggregate.Governance_Status === 'GOVERNANCE_CERTIFIED' &&
    aggregate.Governance_Decision === 'CERTIFY_EXECUTION_STATE'
  ) {
    return {
      status: 'CLEARED',
      message: 'Autonomous execution chain is certified and operational.',
      severity: 'LOW',
      action: 'Advance certified state to dashboard and downstream reporting.',
      dashboardFlag: 'YES',
      leadershipFlag: 'NO'
    };
  }

  if (aggregate.Governance_Status === 'GOVERNANCE_NO_INPUTS') {
    return {
      status: 'NO_INPUTS',
      message: 'No governance inputs are available for autonomous execution command-center reporting.',
      severity: 'UNKNOWN',
      action: 'Generate governance records before reporting system execution posture.',
      dashboardFlag: 'YES',
      leadershipFlag: 'NO'
    };
  }

  return {
    status: 'UNCLASSIFIED',
    message: 'Autonomous execution command-center state could not be classified.',
    severity: 'MEDIUM',
    action: 'Review governance records and normalize command-center inputs.',
    dashboardFlag: 'YES',
    leadershipFlag: 'YES'
  };
}

function sciipResolveKnowledgeGraphImpact1060_(aggregate, command) {
  return [
    'Created permanent autonomous execution command-center history.',
    'Command status=' + command.status + '.',
    'Severity=' + command.severity + '.',
    'Governance status=' + aggregate.Governance_Status + '.',
    'Governance decision=' + aggregate.Governance_Decision + '.',
    'Governance risk=' + aggregate.Governance_Risk_Level + '.',
    'Operational posture=' + aggregate.Operational_Posture + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1060_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1060_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1060_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSummaryStatusConstraint1060_(a, b) {
  const rank = {
    SUMMARY_CLEAR: 1,
    SUMMARY_PENDING: 2,
    SUMMARY_REVIEW_REQUIRED: 3,
    SUMMARY_BLOCKED: 4,
    SUMMARY_NO_OUTCOME: 5,
    NO_SUMMARY_INPUT: 6,
    SUMMARY_UNKNOWN: 7
  };

  const aa = String(a || 'SUMMARY_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'SUMMARY_UNKNOWN').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOperationalPostureConstraint1060_(a, b) {
  const rank = {
    OPERATIONAL: 1,
    MONITORING: 2,
    CONTROLLED_REVIEW: 3,
    BLOCKED: 4,
    NO_INPUTS: 5,
    REVIEW_REQUIRED: 6
  };

  const aa = String(a || 'REVIEW_REQUIRED').trim().toUpperCase();
  const bb = String(b || 'REVIEW_REQUIRED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherGovernanceStatusConstraint1060_(a, b) {
  const rank = {
    GOVERNANCE_CERTIFIED: 1,
    GOVERNANCE_MONITORING: 2,
    GOVERNANCE_REVIEW_REQUIRED: 3,
    GOVERNANCE_BLOCKED: 4,
    GOVERNANCE_NO_INPUTS: 5,
    GOVERNANCE_UNCLASSIFIED: 6
  };

  const aa = String(a || 'GOVERNANCE_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'GOVERNANCE_UNCLASSIFIED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherGovernanceDecisionConstraint1060_(a, b) {
  const rank = {
    CERTIFY_EXECUTION_STATE: 1,
    CERTIFY_MONITORING_STATE: 2,
    REQUIRE_REVIEW: 3,
    DO_NOT_CERTIFY: 4
  };

  const aa = String(a || 'REQUIRE_REVIEW').trim().toUpperCase();
  const bb = String(b || 'REQUIRE_REVIEW').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherGovernanceRiskConstraint1060_(a, b) {
  const rank = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    UNKNOWN: 4
  };

  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionCommandCenterProcessor() {
  const result = sciipRunAutonomousProcessorExecutionCommandCenterProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionCommandCenterProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1070_AutonomousProcessorExecutionHealthProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionHealthProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1070_AutonomousProcessorExecutionHealthProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTHS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTHS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1070_AutonomousProcessorExecutionHealthProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionHealthProcessorLegacy1070_();
      return sciipWrapLegacyRuntimeResult1070_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1070_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1070_AutonomousProcessorExecutionHealthProcessor
 *******************************************************/

const SCIIP_1070_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH = {
  PROCESSOR: '1070_AutonomousProcessorExecutionHealthProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER',
  INPUT_DATE_COLUMN: 'Command_Center_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH',

  OUTPUT_HEADERS: [
    'Execution_Health_ID',
    'Business_Key',
    'Health_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Command_Center_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Summary_Status',
    'Operational_Posture',
    'Governance_Status',
    'Governance_Decision',
    'Governance_Risk_Level',
    'Command_Center_Status',
    'Command_Center_Severity',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Health_Status',
    'Health_Score',
    'Health_Rating',
    'Health_Reason',
    'Recommended_Action',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionHealthProcessorLegacy1070_() {
  const cfg = SCIIP_1070_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionHealthSheet_();

  const resolvedHealthDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH|' + resolvedHealthDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionHealthRecordsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionHealthNoInput1070_(
      outputSheet,
      businessKey,
      resolvedHealthDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1070_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1070_(row[cfg.INPUT_DATE_COLUMN]) === resolvedHealthDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionHealthNoInput1070_(
      outputSheet,
      businessKey,
      resolvedHealthDate,
      startedAt
    );
  }

  const healthRecord =
    sciipBuildAutonomousProcessorExecutionHealth1070_(
      sourceRows,
      businessKey,
      resolvedHealthDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1070_(healthRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionHealthRecordsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    healthDate: resolvedHealthDate,
    healthStatus: healthRecord.Health_Status,
    healthScore: healthRecord.Health_Score,
    healthRating: healthRecord.Health_Rating,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionHealth1070_(sourceRows, businessKey, healthDate, startedAt) {
  const cfg = SCIIP_1070_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH;

  const aggregate = sciipAggregateExecutionCommandCenterRows1070_(sourceRows);
  const health = sciipResolveExecutionHealth1070_(aggregate);

  return {
    Execution_Health_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Health_Date: healthDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Command_Center_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Summary_Status: aggregate.Summary_Status,
    Operational_Posture: aggregate.Operational_Posture,
    Governance_Status: aggregate.Governance_Status,
    Governance_Decision: aggregate.Governance_Decision,
    Governance_Risk_Level: aggregate.Governance_Risk_Level,
    Command_Center_Status: aggregate.Command_Center_Status,
    Command_Center_Severity: aggregate.Command_Center_Severity,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Health_Status: health.status,
    Health_Score: health.score,
    Health_Rating: health.rating,
    Health_Reason: health.reason,
    Recommended_Action: health.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1070_(aggregate, health),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionHealthNoInput1070_(outputSheet, businessKey, healthDate, startedAt) {
  const cfg = SCIIP_1070_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH;

  const record = {
    Execution_Health_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Health_Date: healthDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Command_Center_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Summary_Status: 'NO_SUMMARY_INPUT',
    Operational_Posture: 'NO_INPUTS',
    Governance_Status: 'NO_GOVERNANCE_INPUT',
    Governance_Decision: 'DO_NOT_CERTIFY',
    Governance_Risk_Level: 'UNKNOWN',
    Command_Center_Status: 'NO_INPUTS',
    Command_Center_Severity: 'UNKNOWN',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Health_Status: 'NO_INPUTS',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Health_Reason: 'No execution command-center records were available for the resolved health date.',
    Recommended_Action: 'Generate command-center execution records before relying on execution-health reporting.',
    Knowledge_Graph_Impact: 'Created permanent execution-health history showing no available command-center inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1070_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionHealthRecordsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionHealthSheet_() {
  const cfg = SCIIP_1070_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1070_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1070_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1070_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionCommandCenterRows1070_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Summary_Status: 'SUMMARY_UNKNOWN',
    Operational_Posture: 'REVIEW_REQUIRED',
    Governance_Status: 'GOVERNANCE_UNCLASSIFIED',
    Governance_Decision: 'REQUIRE_REVIEW',
    Governance_Risk_Level: 'MEDIUM',
    Command_Center_Status: 'UNCLASSIFIED',
    Command_Center_Severity: 'MEDIUM',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'YES'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1070_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1070_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1070_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1070_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1070_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1070_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1070_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1070_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1070_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Summary_Status = sciipHigherSummaryStatusConstraint1070_(aggregate.Summary_Status, row.Summary_Status);
    aggregate.Operational_Posture = sciipHigherOperationalPostureConstraint1070_(aggregate.Operational_Posture, row.Operational_Posture);
    aggregate.Governance_Status = sciipHigherGovernanceStatusConstraint1070_(aggregate.Governance_Status, row.Governance_Status);
    aggregate.Governance_Decision = sciipHigherGovernanceDecisionConstraint1070_(aggregate.Governance_Decision, row.Governance_Decision);
    aggregate.Governance_Risk_Level = sciipHigherGovernanceRiskConstraint1070_(aggregate.Governance_Risk_Level, row.Governance_Risk_Level);
    aggregate.Command_Center_Status = sciipHigherCommandCenterStatusConstraint1070_(aggregate.Command_Center_Status, row.Command_Center_Status);
    aggregate.Command_Center_Severity = sciipHigherCommandCenterSeverityConstraint1070_(aggregate.Command_Center_Severity, row.Command_Center_Severity);
    aggregate.Dashboard_Flag = sciipYesNo1070_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1070_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionHealth1070_(aggregate) {
  if (
    aggregate.Command_Center_Status === 'ACTION_REQUIRED' ||
    aggregate.Command_Center_Severity === 'HIGH' ||
    aggregate.Failed_Count > 0 ||
    aggregate.Blocked_Count > 0
  ) {
    return {
      status: 'UNHEALTHY',
      score: 25,
      rating: 'RED',
      reason: 'Execution health is unhealthy because command-center reporting indicates action required, high severity, blocked items, or failed items.',
      action: 'Resolve execution blockers and rerun the autonomous processor execution chain.'
    };
  }

  if (
    aggregate.Command_Center_Status === 'REVIEW_REQUIRED' ||
    aggregate.Command_Center_Severity === 'MEDIUM' ||
    aggregate.Hold_Count > 0
  ) {
    return {
      status: 'DEGRADED',
      score: 60,
      rating: 'YELLOW',
      reason: 'Execution health is degraded because governance or command-center state requires review.',
      action: 'Complete review and rerun affected execution processors.'
    };
  }

  if (aggregate.Command_Center_Status === 'MONITORING') {
    return {
      status: 'STABLE_MONITORING',
      score: 80,
      rating: 'BLUE',
      reason: 'Execution health is stable but monitoring because execution state has not fully cleared.',
      action: 'Continue monitoring until execution state clears or changes.'
    };
  }

  if (aggregate.Command_Center_Status === 'CLEARED') {
    return {
      status: 'HEALTHY',
      score: 100,
      rating: 'GREEN',
      reason: 'Execution health is healthy because command-center status is cleared and no blocking execution conditions were detected.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Command_Center_Status === 'NO_INPUTS') {
    return {
      status: 'NO_INPUTS',
      score: 0,
      rating: 'UNKNOWN',
      reason: 'Execution health cannot be assessed because no command-center input records are available.',
      action: 'Generate command-center records before relying on health assessment.'
    };
  }

  return {
    status: 'UNCLASSIFIED',
    score: 50,
    rating: 'YELLOW',
    reason: 'Execution health could not classify the command-center state.',
    action: 'Review command-center records and normalize health inputs.'
  };
}

function sciipResolveKnowledgeGraphImpact1070_(aggregate, health) {
  return [
    'Created permanent autonomous execution health history.',
    'Health status=' + health.status + '.',
    'Health score=' + health.score + '.',
    'Health rating=' + health.rating + '.',
    'Command-center status=' + aggregate.Command_Center_Status + '.',
    'Command-center severity=' + aggregate.Command_Center_Severity + '.',
    'Governance status=' + aggregate.Governance_Status + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1070_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1070_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();

  if (aa === 'YES' || bb === 'YES') return 'YES';
  return 'NO';
}

function sciipHigherPriority1070_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1070_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSummaryStatusConstraint1070_(a, b) {
  const rank = {
    SUMMARY_CLEAR: 1,
    SUMMARY_PENDING: 2,
    SUMMARY_REVIEW_REQUIRED: 3,
    SUMMARY_BLOCKED: 4,
    SUMMARY_NO_OUTCOME: 5,
    NO_SUMMARY_INPUT: 6,
    SUMMARY_UNKNOWN: 7
  };

  const aa = String(a || 'SUMMARY_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'SUMMARY_UNKNOWN').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOperationalPostureConstraint1070_(a, b) {
  const rank = {
    OPERATIONAL: 1,
    MONITORING: 2,
    CONTROLLED_REVIEW: 3,
    BLOCKED: 4,
    NO_INPUTS: 5,
    REVIEW_REQUIRED: 6
  };

  const aa = String(a || 'REVIEW_REQUIRED').trim().toUpperCase();
  const bb = String(b || 'REVIEW_REQUIRED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherGovernanceStatusConstraint1070_(a, b) {
  const rank = {
    GOVERNANCE_CERTIFIED: 1,
    GOVERNANCE_MONITORING: 2,
    GOVERNANCE_REVIEW_REQUIRED: 3,
    GOVERNANCE_BLOCKED: 4,
    GOVERNANCE_NO_INPUTS: 5,
    GOVERNANCE_UNCLASSIFIED: 6
  };

  const aa = String(a || 'GOVERNANCE_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'GOVERNANCE_UNCLASSIFIED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherGovernanceDecisionConstraint1070_(a, b) {
  const rank = {
    CERTIFY_EXECUTION_STATE: 1,
    CERTIFY_MONITORING_STATE: 2,
    REQUIRE_REVIEW: 3,
    DO_NOT_CERTIFY: 4
  };

  const aa = String(a || 'REQUIRE_REVIEW').trim().toUpperCase();
  const bb = String(b || 'REQUIRE_REVIEW').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherGovernanceRiskConstraint1070_(a, b) {
  const rank = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    UNKNOWN: 4
  };

  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterStatusConstraint1070_(a, b) {
  const rank = {
    CLEARED: 1,
    MONITORING: 2,
    REVIEW_REQUIRED: 3,
    ACTION_REQUIRED: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };

  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterSeverityConstraint1070_(a, b) {
  const rank = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    UNKNOWN: 4
  };

  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionHealthProcessor() {
  const result = sciipRunAutonomousProcessorExecutionHealthProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionHealthProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1080_AutonomousProcessorExecutionHealthDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionHealthDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1080_AutonomousProcessorExecutionHealthDigestProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGESTS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGESTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1080_AutonomousProcessorExecutionHealthDigestProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionHealthDigestProcessorLegacy1080_();
      return sciipWrapLegacyRuntimeResult1080_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1080_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1080_AutonomousProcessorExecutionHealthDigestProcessor
 *******************************************************/

const SCIIP_1080_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST = {
  PROCESSOR: '1080_AutonomousProcessorExecutionHealthDigestProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH',
  INPUT_DATE_COLUMN: 'Health_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST',

  OUTPUT_HEADERS: [
    'Execution_Health_Digest_ID',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Health_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Command_Center_Status',
    'Command_Center_Severity',
    'Health_Status',
    'Health_Score',
    'Health_Rating',
    'Digest_Status',
    'Digest_Title',
    'Digest_Body',
    'Digest_Severity',
    'Digest_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionHealthDigestProcessorLegacy1080_() {
  const cfg = SCIIP_1080_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionHealthDigestSheet_();

  const resolvedDigestDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST|' + resolvedDigestDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionHealthDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionHealthDigestNoInput1080_(
      outputSheet,
      businessKey,
      resolvedDigestDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1080_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1080_(row[cfg.INPUT_DATE_COLUMN]) === resolvedDigestDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionHealthDigestNoInput1080_(
      outputSheet,
      businessKey,
      resolvedDigestDate,
      startedAt
    );
  }

  const digestRecord =
    sciipBuildAutonomousProcessorExecutionHealthDigest1080_(
      sourceRows,
      businessKey,
      resolvedDigestDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1080_(digestRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionHealthDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    digestDate: resolvedDigestDate,
    digestStatus: digestRecord.Digest_Status,
    digestSeverity: digestRecord.Digest_Severity,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionHealthDigest1080_(sourceRows, businessKey, digestDate, startedAt) {
  const cfg = SCIIP_1080_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST;

  const aggregate = sciipAggregateExecutionHealthRows1080_(sourceRows);
  const digest = sciipResolveExecutionHealthDigest1080_(aggregate);

  return {
    Execution_Health_Digest_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Digest_Date: digestDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Health_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Command_Center_Status: aggregate.Command_Center_Status,
    Command_Center_Severity: aggregate.Command_Center_Severity,
    Health_Status: aggregate.Health_Status,
    Health_Score: aggregate.Health_Score,
    Health_Rating: aggregate.Health_Rating,
    Digest_Status: digest.status,
    Digest_Title: digest.title,
    Digest_Body: digest.body,
    Digest_Severity: digest.severity,
    Digest_Action: digest.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1080_(aggregate, digest),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionHealthDigestNoInput1080_(outputSheet, businessKey, digestDate, startedAt) {
  const cfg = SCIIP_1080_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST;

  const record = {
    Execution_Health_Digest_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Digest_Date: digestDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Health_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Command_Center_Status: 'NO_INPUTS',
    Command_Center_Severity: 'UNKNOWN',
    Health_Status: 'NO_INPUTS',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Digest_Status: 'NO_INPUTS',
    Digest_Title: 'No autonomous execution health records available.',
    Digest_Body: 'SCIIP_OS could not create an execution health digest because no execution-health records were available for the resolved digest date.',
    Digest_Severity: 'UNKNOWN',
    Digest_Action: 'Generate execution-health records before relying on health-digest reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-health-digest history showing no available health inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1080_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionHealthDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionHealthDigestSheet_() {
  const cfg = SCIIP_1080_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1080_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1080_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1080_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionHealthRows1080_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Command_Center_Status: 'UNCLASSIFIED',
    Command_Center_Severity: 'UNKNOWN',
    Health_Status: 'UNCLASSIFIED',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1080_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1080_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1080_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1080_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1080_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1080_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1080_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1080_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1080_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Command_Center_Status = sciipHigherCommandCenterStatusConstraint1080_(aggregate.Command_Center_Status, row.Command_Center_Status);
    aggregate.Command_Center_Severity = sciipHigherSeverity1080_(aggregate.Command_Center_Severity, row.Command_Center_Severity);
    aggregate.Health_Status = sciipHigherHealthStatusConstraint1080_(aggregate.Health_Status, row.Health_Status);
    aggregate.Health_Rating = sciipHigherHealthRatingConstraint1080_(aggregate.Health_Rating, row.Health_Rating);
    aggregate.Health_Score = Math.max(aggregate.Health_Score, sciipNumber1080_(row.Health_Score));
    aggregate.Dashboard_Flag = sciipYesNo1080_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1080_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionHealthDigest1080_(aggregate) {
  if (aggregate.Health_Status === 'UNHEALTHY') {
    return {
      status: 'DIGEST_ACTION_REQUIRED',
      title: 'Autonomous execution health is red.',
      body: 'SCIIP_OS detected an unhealthy autonomous execution state. Command-center status, severity, blocked work, or failed work indicates that the execution chain should not be treated as clear.',
      severity: 'HIGH',
      action: 'Resolve execution blockers and rerun the autonomous execution chain.'
    };
  }

  if (aggregate.Health_Status === 'DEGRADED') {
    return {
      status: 'DIGEST_REVIEW_REQUIRED',
      title: 'Autonomous execution health is degraded.',
      body: 'SCIIP_OS detected a degraded autonomous execution state. The chain is not fully blocked, but review or remediation is required before relying on downstream autonomous execution posture.',
      severity: 'MEDIUM',
      action: 'Complete review and rerun affected execution processors.'
    };
  }

  if (aggregate.Health_Status === 'STABLE_MONITORING') {
    return {
      status: 'DIGEST_MONITORING',
      title: 'Autonomous execution health is stable and monitoring.',
      body: 'SCIIP_OS detected a stable monitoring state. The system is not blocked, but execution has not fully cleared into a green operating posture.',
      severity: 'LOW',
      action: 'Continue monitoring until execution health clears or changes.'
    };
  }

  if (aggregate.Health_Status === 'HEALTHY') {
    return {
      status: 'DIGEST_HEALTHY',
      title: 'Autonomous execution health is green.',
      body: 'SCIIP_OS detected a healthy autonomous execution state. Command-center and health records indicate the execution chain is cleared for downstream reporting.',
      severity: 'LOW',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Health_Status === 'NO_INPUTS') {
    return {
      status: 'DIGEST_NO_INPUTS',
      title: 'No autonomous execution health inputs available.',
      body: 'SCIIP_OS could not assess autonomous execution health because no usable health inputs were available.',
      severity: 'UNKNOWN',
      action: 'Generate execution-health records before relying on the digest.'
    };
  }

  return {
    status: 'DIGEST_UNCLASSIFIED',
    title: 'Autonomous execution health digest is unclassified.',
    body: 'SCIIP_OS created a health digest, but the health status did not match a known digest class.',
    severity: 'MEDIUM',
    action: 'Review execution-health records and normalize health status values.'
  };
}

function sciipResolveKnowledgeGraphImpact1080_(aggregate, digest) {
  return [
    'Created permanent autonomous execution health digest history.',
    'Digest status=' + digest.status + '.',
    'Digest severity=' + digest.severity + '.',
    'Health status=' + aggregate.Health_Status + '.',
    'Health score=' + aggregate.Health_Score + '.',
    'Health rating=' + aggregate.Health_Rating + '.',
    'Command-center status=' + aggregate.Command_Center_Status + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1080_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1080_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1080_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1080_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1080_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterStatusConstraint1080_(a, b) {
  const rank = {
    CLEARED: 1,
    MONITORING: 2,
    REVIEW_REQUIRED: 3,
    ACTION_REQUIRED: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };

  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherHealthStatusConstraint1080_(a, b) {
  const rank = {
    HEALTHY: 1,
    STABLE_MONITORING: 2,
    DEGRADED: 3,
    UNHEALTHY: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };

  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherHealthRatingConstraint1080_(a, b) {
  const rank = {
    GREEN: 1,
    BLUE: 2,
    YELLOW: 3,
    RED: 4,
    UNKNOWN: 5
  };

  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionHealthDigestProcessor() {
  const result = sciipRunAutonomousProcessorExecutionHealthDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionHealthDigestProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1090_AutonomousProcessorExecutionSystemSignalProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionSystemSignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1090_AutonomousProcessorExecutionSystemSignalProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNALS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNALS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1090_AutonomousProcessorExecutionSystemSignalProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionSystemSignalProcessorLegacy1090_();
      return sciipWrapLegacyRuntimeResult1090_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1090_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1090_AutonomousProcessorExecutionSystemSignalProcessor
 *******************************************************/

const SCIIP_1090_AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL = {
  PROCESSOR: '1090_AutonomousProcessorExecutionSystemSignalProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST',
  INPUT_DATE_COLUMN: 'Digest_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL',

  OUTPUT_HEADERS: [
    'Execution_System_Signal_ID',
    'Business_Key',
    'Signal_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Digest_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Command_Center_Status',
    'Command_Center_Severity',
    'Health_Status',
    'Health_Score',
    'Health_Rating',
    'Digest_Status',
    'Digest_Severity',
    'System_Signal',
    'Signal_Strength',
    'Signal_Routing',
    'Signal_Message',
    'Recommended_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionSystemSignalProcessorLegacy1090_() {
  const cfg = SCIIP_1090_AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionSystemSignalSheet_();

  const resolvedSignalDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL|' + resolvedSignalDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionSystemSignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionSystemSignalNoInput1090_(
      outputSheet,
      businessKey,
      resolvedSignalDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1090_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1090_(row[cfg.INPUT_DATE_COLUMN]) === resolvedSignalDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionSystemSignalNoInput1090_(
      outputSheet,
      businessKey,
      resolvedSignalDate,
      startedAt
    );
  }

  const signalRecord =
    sciipBuildAutonomousProcessorExecutionSystemSignal1090_(
      sourceRows,
      businessKey,
      resolvedSignalDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1090_(signalRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionSystemSignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    signalDate: resolvedSignalDate,
    systemSignal: signalRecord.System_Signal,
    signalStrength: signalRecord.Signal_Strength,
    signalRouting: signalRecord.Signal_Routing,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionSystemSignal1090_(sourceRows, businessKey, signalDate, startedAt) {
  const cfg = SCIIP_1090_AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL;

  const aggregate = sciipAggregateExecutionHealthDigestRows1090_(sourceRows);
  const signal = sciipResolveExecutionSystemSignal1090_(aggregate);

  return {
    Execution_System_Signal_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Date: signalDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Digest_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Command_Center_Status: aggregate.Command_Center_Status,
    Command_Center_Severity: aggregate.Command_Center_Severity,
    Health_Status: aggregate.Health_Status,
    Health_Score: aggregate.Health_Score,
    Health_Rating: aggregate.Health_Rating,
    Digest_Status: aggregate.Digest_Status,
    Digest_Severity: aggregate.Digest_Severity,
    System_Signal: signal.signal,
    Signal_Strength: signal.strength,
    Signal_Routing: signal.routing,
    Signal_Message: signal.message,
    Recommended_Action: signal.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1090_(aggregate, signal),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionSystemSignalNoInput1090_(outputSheet, businessKey, signalDate, startedAt) {
  const cfg = SCIIP_1090_AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL;

  const record = {
    Execution_System_Signal_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Date: signalDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Digest_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Command_Center_Status: 'NO_INPUTS',
    Command_Center_Severity: 'UNKNOWN',
    Health_Status: 'NO_INPUTS',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Digest_Status: 'NO_INPUTS',
    Digest_Severity: 'UNKNOWN',
    System_Signal: 'NO_SIGNAL',
    Signal_Strength: 'NONE',
    Signal_Routing: 'NO_ROUTE',
    Signal_Message: 'No execution health digest records were available for system-signal generation.',
    Recommended_Action: 'Generate execution health digest records before relying on system-signal routing.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-system-signal history showing no available digest inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1090_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionSystemSignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionSystemSignalSheet_() {
  const cfg = SCIIP_1090_AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1090_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1090_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1090_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionHealthDigestRows1090_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Command_Center_Status: 'UNCLASSIFIED',
    Command_Center_Severity: 'UNKNOWN',
    Health_Status: 'UNCLASSIFIED',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Digest_Status: 'DIGEST_UNCLASSIFIED',
    Digest_Severity: 'UNKNOWN',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1090_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1090_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1090_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1090_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1090_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1090_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1090_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1090_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1090_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Command_Center_Status = sciipHigherCommandCenterStatusConstraint1090_(aggregate.Command_Center_Status, row.Command_Center_Status);
    aggregate.Command_Center_Severity = sciipHigherSeverity1090_(aggregate.Command_Center_Severity, row.Command_Center_Severity);
    aggregate.Health_Status = sciipHigherHealthStatusConstraint1090_(aggregate.Health_Status, row.Health_Status);
    aggregate.Health_Rating = sciipHigherHealthRatingConstraint1090_(aggregate.Health_Rating, row.Health_Rating);
    aggregate.Health_Score = Math.max(aggregate.Health_Score, sciipNumber1090_(row.Health_Score));
    aggregate.Digest_Status = sciipHigherDigestStatusConstraint1090_(aggregate.Digest_Status, row.Digest_Status);
    aggregate.Digest_Severity = sciipHigherSeverity1090_(aggregate.Digest_Severity, row.Digest_Severity);
    aggregate.Dashboard_Flag = sciipYesNo1090_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1090_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionSystemSignal1090_(aggregate) {
  if (aggregate.Digest_Status === 'DIGEST_ACTION_REQUIRED' || aggregate.Digest_Severity === 'HIGH') {
    return {
      signal: 'STOP',
      strength: 'STRONG',
      routing: 'LEADERSHIP_AND_DASHBOARD',
      message: 'Execution system signal is STOP because autonomous execution health digest requires action.',
      action: 'Escalate execution health state and resolve blockers before downstream automation.'
    };
  }

  if (aggregate.Digest_Status === 'DIGEST_REVIEW_REQUIRED' || aggregate.Digest_Severity === 'MEDIUM') {
    return {
      signal: 'REVIEW',
      strength: 'MODERATE',
      routing: 'GOVERNANCE_AND_DASHBOARD',
      message: 'Execution system signal is REVIEW because autonomous execution health is degraded or unclassified.',
      action: 'Complete governance review before treating autonomous execution state as cleared.'
    };
  }

  if (aggregate.Digest_Status === 'DIGEST_MONITORING') {
    return {
      signal: 'MONITOR',
      strength: 'NORMAL',
      routing: 'DASHBOARD',
      message: 'Execution system signal is MONITOR because autonomous execution health is stable but not fully cleared.',
      action: 'Continue monitoring the autonomous execution chain.'
    };
  }

  if (aggregate.Digest_Status === 'DIGEST_HEALTHY') {
    return {
      signal: 'GO',
      strength: 'NORMAL',
      routing: 'DASHBOARD',
      message: 'Execution system signal is GO because autonomous execution health is green.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Digest_Status === 'DIGEST_NO_INPUTS') {
    return {
      signal: 'NO_SIGNAL',
      strength: 'NONE',
      routing: 'DASHBOARD',
      message: 'Execution system signal could not be generated because health digest inputs were unavailable.',
      action: 'Generate execution health digest records before routing execution signals.'
    };
  }

  return {
    signal: 'UNKNOWN',
    strength: 'WEAK',
    routing: 'GOVERNANCE_AND_DASHBOARD',
    message: 'Execution system signal could not classify the health digest state.',
    action: 'Review health digest records and normalize digest status values.'
  };
}

function sciipResolveKnowledgeGraphImpact1090_(aggregate, signal) {
  return [
    'Created permanent autonomous execution system signal history.',
    'System signal=' + signal.signal + '.',
    'Signal strength=' + signal.strength + '.',
    'Routing=' + signal.routing + '.',
    'Digest status=' + aggregate.Digest_Status + '.',
    'Health status=' + aggregate.Health_Status + '.',
    'Health score=' + aggregate.Health_Score + '.',
    'Command-center status=' + aggregate.Command_Center_Status + '.'
  ].join(' ');
}

function sciipNumber1090_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1090_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1090_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1090_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1090_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterStatusConstraint1090_(a, b) {
  const rank = {
    CLEARED: 1,
    MONITORING: 2,
    REVIEW_REQUIRED: 3,
    ACTION_REQUIRED: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };

  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherHealthStatusConstraint1090_(a, b) {
  const rank = {
    HEALTHY: 1,
    STABLE_MONITORING: 2,
    DEGRADED: 3,
    UNHEALTHY: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };

  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherHealthRatingConstraint1090_(a, b) {
  const rank = {
    GREEN: 1,
    BLUE: 2,
    YELLOW: 3,
    RED: 4,
    UNKNOWN: 5
  };

  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDigestStatusConstraint1090_(a, b) {
  const rank = {
    DIGEST_HEALTHY: 1,
    DIGEST_MONITORING: 2,
    DIGEST_REVIEW_REQUIRED: 3,
    DIGEST_ACTION_REQUIRED: 4,
    DIGEST_NO_INPUTS: 5,
    DIGEST_UNCLASSIFIED: 6
  };

  const aa = String(a || 'DIGEST_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'DIGEST_UNCLASSIFIED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionSystemSignalProcessor() {
  const result = sciipRunAutonomousProcessorExecutionSystemSignalProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionSystemSignalProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1100_AutonomousProcessorExecutionSignalLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionSignalLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1100_AutonomousProcessorExecutionSignalLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1100_AutonomousProcessorExecutionSignalLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionSignalLedgerProcessorLegacy1100_();
      return sciipWrapLegacyRuntimeResult1100_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1100_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1100_AutonomousProcessorExecutionSignalLedgerProcessor
 *******************************************************/

const SCIIP_1100_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER = {
  PROCESSOR: '1100_AutonomousProcessorExecutionSignalLedgerProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL',
  INPUT_DATE_COLUMN: 'Signal_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER',

  OUTPUT_HEADERS: [
    'Execution_Signal_Ledger_ID',
    'Business_Key',
    'Signal_Ledger_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'System_Signal_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Command_Center_Status',
    'Command_Center_Severity',
    'Health_Status',
    'Health_Score',
    'Health_Rating',
    'Digest_Status',
    'Digest_Severity',
    'System_Signal',
    'Signal_Strength',
    'Signal_Routing',
    'Signal_Ledger_Status',
    'Signal_Ledger_Event_Type',
    'Signal_Ledger_Conclusion',
    'Signal_Ledger_Reason',
    'Recommended_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionSignalLedgerProcessorLegacy1100_() {
  const cfg = SCIIP_1100_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionSignalLedgerSheet_();

  const resolvedSignalLedgerDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER|' + resolvedSignalLedgerDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionSignalLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionSignalLedgerNoInput1100_(
      outputSheet,
      businessKey,
      resolvedSignalLedgerDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1100_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1100_(row[cfg.INPUT_DATE_COLUMN]) === resolvedSignalLedgerDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionSignalLedgerNoInput1100_(
      outputSheet,
      businessKey,
      resolvedSignalLedgerDate,
      startedAt
    );
  }

  const ledgerRecord =
    sciipBuildAutonomousProcessorExecutionSignalLedger1100_(
      sourceRows,
      businessKey,
      resolvedSignalLedgerDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1100_(ledgerRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionSignalLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    signalLedgerDate: resolvedSignalLedgerDate,
    signalLedgerStatus: ledgerRecord.Signal_Ledger_Status,
    signalLedgerEventType: ledgerRecord.Signal_Ledger_Event_Type,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionSignalLedger1100_(sourceRows, businessKey, signalLedgerDate, startedAt) {
  const cfg = SCIIP_1100_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER;

  const aggregate = sciipAggregateExecutionSystemSignalRows1100_(sourceRows);
  const ledger = sciipResolveExecutionSignalLedger1100_(aggregate);

  return {
    Execution_Signal_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Ledger_Date: signalLedgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    System_Signal_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Command_Center_Status: aggregate.Command_Center_Status,
    Command_Center_Severity: aggregate.Command_Center_Severity,
    Health_Status: aggregate.Health_Status,
    Health_Score: aggregate.Health_Score,
    Health_Rating: aggregate.Health_Rating,
    Digest_Status: aggregate.Digest_Status,
    Digest_Severity: aggregate.Digest_Severity,
    System_Signal: aggregate.System_Signal,
    Signal_Strength: aggregate.Signal_Strength,
    Signal_Routing: aggregate.Signal_Routing,
    Signal_Ledger_Status: ledger.status,
    Signal_Ledger_Event_Type: ledger.eventType,
    Signal_Ledger_Conclusion: ledger.conclusion,
    Signal_Ledger_Reason: ledger.reason,
    Recommended_Action: ledger.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1100_(aggregate, ledger),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionSignalLedgerNoInput1100_(outputSheet, businessKey, signalLedgerDate, startedAt) {
  const cfg = SCIIP_1100_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER;

  const record = {
    Execution_Signal_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Ledger_Date: signalLedgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    System_Signal_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Command_Center_Status: 'NO_INPUTS',
    Command_Center_Severity: 'UNKNOWN',
    Health_Status: 'NO_INPUTS',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Digest_Status: 'NO_INPUTS',
    Digest_Severity: 'UNKNOWN',
    System_Signal: 'NO_SIGNAL',
    Signal_Strength: 'NONE',
    Signal_Routing: 'NO_ROUTE',
    Signal_Ledger_Status: 'RECORDED_NO_INPUTS',
    Signal_Ledger_Event_Type: 'NO_SYSTEM_SIGNAL_INPUT',
    Signal_Ledger_Conclusion: 'No autonomous execution system signal was available to ledger.',
    Signal_Ledger_Reason: 'No execution system-signal records were available for the resolved signal-ledger date.',
    Recommended_Action: 'Generate system-signal records before relying on signal-ledger reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-signal-ledger history showing no available system-signal inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1100_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionSignalLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionSignalLedgerSheet_() {
  const cfg = SCIIP_1100_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1100_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1100_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1100_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionSystemSignalRows1100_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Command_Center_Status: 'UNCLASSIFIED',
    Command_Center_Severity: 'UNKNOWN',
    Health_Status: 'UNCLASSIFIED',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Digest_Status: 'DIGEST_UNCLASSIFIED',
    Digest_Severity: 'UNKNOWN',
    System_Signal: 'UNKNOWN',
    Signal_Strength: 'WEAK',
    Signal_Routing: 'GOVERNANCE_AND_DASHBOARD',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1100_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1100_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1100_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1100_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1100_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1100_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1100_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1100_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1100_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Command_Center_Status = sciipHigherCommandCenterStatusConstraint1100_(aggregate.Command_Center_Status, row.Command_Center_Status);
    aggregate.Command_Center_Severity = sciipHigherSeverity1100_(aggregate.Command_Center_Severity, row.Command_Center_Severity);
    aggregate.Health_Status = sciipHigherHealthStatusConstraint1100_(aggregate.Health_Status, row.Health_Status);
    aggregate.Health_Rating = sciipHigherHealthRatingConstraint1100_(aggregate.Health_Rating, row.Health_Rating);
    aggregate.Health_Score = Math.max(aggregate.Health_Score, sciipNumber1100_(row.Health_Score));
    aggregate.Digest_Status = sciipHigherDigestStatusConstraint1100_(aggregate.Digest_Status, row.Digest_Status);
    aggregate.Digest_Severity = sciipHigherSeverity1100_(aggregate.Digest_Severity, row.Digest_Severity);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1100_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1100_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1100_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Dashboard_Flag = sciipYesNo1100_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1100_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionSignalLedger1100_(aggregate) {
  if (aggregate.System_Signal === 'STOP') {
    return {
      status: 'RECORDED_STOP_SIGNAL',
      eventType: 'AUTONOMOUS_EXECUTION_STOP_SIGNAL',
      conclusion: 'Autonomous execution system signal requires stop/escalation.',
      reason: 'System signal records show STOP or strong action-required routing.',
      action: 'Escalate and resolve blockers before downstream automation proceeds.'
    };
  }

  if (aggregate.System_Signal === 'REVIEW') {
    return {
      status: 'RECORDED_REVIEW_SIGNAL',
      eventType: 'AUTONOMOUS_EXECUTION_REVIEW_SIGNAL',
      conclusion: 'Autonomous execution system signal requires governance review.',
      reason: 'System signal records show REVIEW or moderate routing conditions.',
      action: 'Complete governance review before treating execution state as clear.'
    };
  }

  if (aggregate.System_Signal === 'MONITOR') {
    return {
      status: 'RECORDED_MONITOR_SIGNAL',
      eventType: 'AUTONOMOUS_EXECUTION_MONITOR_SIGNAL',
      conclusion: 'Autonomous execution system signal is monitor.',
      reason: 'System signal records show stable monitoring state.',
      action: 'Continue monitoring autonomous execution chain.'
    };
  }

  if (aggregate.System_Signal === 'GO') {
    return {
      status: 'RECORDED_GO_SIGNAL',
      eventType: 'AUTONOMOUS_EXECUTION_GO_SIGNAL',
      conclusion: 'Autonomous execution system signal is go.',
      reason: 'System signal records show healthy execution state.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.System_Signal === 'NO_SIGNAL') {
    return {
      status: 'RECORDED_NO_SIGNAL',
      eventType: 'AUTONOMOUS_EXECUTION_NO_SIGNAL',
      conclusion: 'No autonomous execution system signal was generated.',
      reason: 'System signal records indicate no usable signal input.',
      action: 'Generate upstream execution signal records before relying on routing.'
    };
  }

  return {
    status: 'RECORDED_UNKNOWN_SIGNAL',
    eventType: 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL',
    conclusion: 'Autonomous execution system signal could not be classified.',
    reason: 'System signal did not match a known signal-ledger class.',
    action: 'Review system-signal records and normalize signal values.'
  };
}

function sciipResolveKnowledgeGraphImpact1100_(aggregate, ledger) {
  return [
    'Created immutable autonomous execution signal-ledger entry.',
    'Signal-ledger status=' + ledger.status + '.',
    'Signal-ledger event=' + ledger.eventType + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Signal strength=' + aggregate.Signal_Strength + '.',
    'Signal routing=' + aggregate.Signal_Routing + '.',
    'Health status=' + aggregate.Health_Status + '.',
    'Digest status=' + aggregate.Digest_Status + '.'
  ].join(' ');
}

function sciipNumber1100_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1100_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1100_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1100_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1100_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterStatusConstraint1100_(a, b) {
  const rank = {
    CLEARED: 1,
    MONITORING: 2,
    REVIEW_REQUIRED: 3,
    ACTION_REQUIRED: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };
  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherHealthStatusConstraint1100_(a, b) {
  const rank = {
    HEALTHY: 1,
    STABLE_MONITORING: 2,
    DEGRADED: 3,
    UNHEALTHY: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };
  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherHealthRatingConstraint1100_(a, b) {
  const rank = {
    GREEN: 1,
    BLUE: 2,
    YELLOW: 3,
    RED: 4,
    UNKNOWN: 5
  };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDigestStatusConstraint1100_(a, b) {
  const rank = {
    DIGEST_HEALTHY: 1,
    DIGEST_MONITORING: 2,
    DIGEST_REVIEW_REQUIRED: 3,
    DIGEST_ACTION_REQUIRED: 4,
    DIGEST_NO_INPUTS: 5,
    DIGEST_UNCLASSIFIED: 6
  };
  const aa = String(a || 'DIGEST_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'DIGEST_UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1100_(a, b) {
  const rank = {
    GO: 1,
    MONITOR: 2,
    REVIEW: 3,
    STOP: 4,
    NO_SIGNAL: 5,
    UNKNOWN: 6
  };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1100_(a, b) {
  const rank = {
    NONE: 0,
    WEAK: 1,
    NORMAL: 2,
    MODERATE: 3,
    STRONG: 4
  };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1100_(a, b) {
  const rank = {
    NO_ROUTE: 0,
    DASHBOARD: 1,
    GOVERNANCE_AND_DASHBOARD: 2,
    LEADERSHIP_AND_DASHBOARD: 3
  };
  const aa = String(a || 'NO_ROUTE').trim().toUpperCase();
  const bb = String(b || 'NO_ROUTE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionSignalLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionSignalLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionSignalLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1110_AutonomousProcessorExecutionSignalDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionSignalDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1110_AutonomousProcessorExecutionSignalDigestProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGESTS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGESTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1110_AutonomousProcessorExecutionSignalDigestProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionSignalDigestProcessorLegacy1110_();
      return sciipWrapLegacyRuntimeResult1110_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1110_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1110_AutonomousProcessorExecutionSignalDigestProcessor
 *******************************************************/

const SCIIP_1110_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST = {
  PROCESSOR: '1110_AutonomousProcessorExecutionSignalDigestProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER',
  INPUT_DATE_COLUMN: 'Signal_Ledger_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST',

  OUTPUT_HEADERS: [
    'Execution_Signal_Digest_ID',
    'Business_Key',
    'Signal_Digest_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Signal_Ledger_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Command_Center_Status',
    'Command_Center_Severity',
    'Health_Status',
    'Health_Score',
    'Health_Rating',
    'Digest_Status',
    'Digest_Severity',
    'System_Signal',
    'Signal_Strength',
    'Signal_Routing',
    'Signal_Ledger_Status',
    'Signal_Ledger_Event_Type',
    'Signal_Digest_Status',
    'Signal_Digest_Title',
    'Signal_Digest_Body',
    'Signal_Digest_Severity',
    'Recommended_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionSignalDigestProcessorLegacy1110_() {
  const cfg = SCIIP_1110_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionSignalDigestSheet_();

  const resolvedSignalDigestDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST|' + resolvedSignalDigestDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionSignalDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionSignalDigestNoInput1110_(
      outputSheet,
      businessKey,
      resolvedSignalDigestDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1110_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1110_(row[cfg.INPUT_DATE_COLUMN]) === resolvedSignalDigestDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionSignalDigestNoInput1110_(
      outputSheet,
      businessKey,
      resolvedSignalDigestDate,
      startedAt
    );
  }

  const digestRecord =
    sciipBuildAutonomousProcessorExecutionSignalDigest1110_(
      sourceRows,
      businessKey,
      resolvedSignalDigestDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1110_(digestRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionSignalDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    signalDigestDate: resolvedSignalDigestDate,
    signalDigestStatus: digestRecord.Signal_Digest_Status,
    signalDigestSeverity: digestRecord.Signal_Digest_Severity,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionSignalDigest1110_(sourceRows, businessKey, signalDigestDate, startedAt) {
  const cfg = SCIIP_1110_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST;

  const aggregate = sciipAggregateExecutionSignalLedgerRows1110_(sourceRows);
  const digest = sciipResolveExecutionSignalDigest1110_(aggregate);

  return {
    Execution_Signal_Digest_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Digest_Date: signalDigestDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Signal_Ledger_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Command_Center_Status: aggregate.Command_Center_Status,
    Command_Center_Severity: aggregate.Command_Center_Severity,
    Health_Status: aggregate.Health_Status,
    Health_Score: aggregate.Health_Score,
    Health_Rating: aggregate.Health_Rating,
    Digest_Status: aggregate.Digest_Status,
    Digest_Severity: aggregate.Digest_Severity,
    System_Signal: aggregate.System_Signal,
    Signal_Strength: aggregate.Signal_Strength,
    Signal_Routing: aggregate.Signal_Routing,
    Signal_Ledger_Status: aggregate.Signal_Ledger_Status,
    Signal_Ledger_Event_Type: aggregate.Signal_Ledger_Event_Type,
    Signal_Digest_Status: digest.status,
    Signal_Digest_Title: digest.title,
    Signal_Digest_Body: digest.body,
    Signal_Digest_Severity: digest.severity,
    Recommended_Action: digest.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1110_(aggregate, digest),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionSignalDigestNoInput1110_(outputSheet, businessKey, signalDigestDate, startedAt) {
  const cfg = SCIIP_1110_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST;

  const record = {
    Execution_Signal_Digest_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Digest_Date: signalDigestDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Signal_Ledger_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Command_Center_Status: 'NO_INPUTS',
    Command_Center_Severity: 'UNKNOWN',
    Health_Status: 'NO_INPUTS',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Digest_Status: 'NO_INPUTS',
    Digest_Severity: 'UNKNOWN',
    System_Signal: 'NO_SIGNAL',
    Signal_Strength: 'NONE',
    Signal_Routing: 'NO_ROUTE',
    Signal_Ledger_Status: 'RECORDED_NO_INPUTS',
    Signal_Ledger_Event_Type: 'NO_SYSTEM_SIGNAL_INPUT',
    Signal_Digest_Status: 'NO_INPUTS',
    Signal_Digest_Title: 'No autonomous execution signal-ledger records available.',
    Signal_Digest_Body: 'SCIIP_OS could not create an execution signal digest because no signal-ledger records were available for the resolved signal-digest date.',
    Signal_Digest_Severity: 'UNKNOWN',
    Recommended_Action: 'Generate execution signal-ledger records before relying on signal-digest reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-signal-digest history showing no available signal-ledger inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1110_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionSignalDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionSignalDigestSheet_() {
  const cfg = SCIIP_1110_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1110_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1110_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1110_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionSignalLedgerRows1110_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Command_Center_Status: 'UNCLASSIFIED',
    Command_Center_Severity: 'UNKNOWN',
    Health_Status: 'UNCLASSIFIED',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Digest_Status: 'DIGEST_UNCLASSIFIED',
    Digest_Severity: 'UNKNOWN',
    System_Signal: 'UNKNOWN',
    Signal_Strength: 'WEAK',
    Signal_Routing: 'GOVERNANCE_AND_DASHBOARD',
    Signal_Ledger_Status: 'RECORDED_UNKNOWN_SIGNAL',
    Signal_Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1110_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1110_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1110_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1110_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1110_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1110_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1110_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1110_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1110_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Command_Center_Status = sciipHigherCommandCenterStatusConstraint1110_(aggregate.Command_Center_Status, row.Command_Center_Status);
    aggregate.Command_Center_Severity = sciipHigherSeverity1110_(aggregate.Command_Center_Severity, row.Command_Center_Severity);
    aggregate.Health_Status = sciipHigherHealthStatusConstraint1110_(aggregate.Health_Status, row.Health_Status);
    aggregate.Health_Rating = sciipHigherHealthRatingConstraint1110_(aggregate.Health_Rating, row.Health_Rating);
    aggregate.Health_Score = Math.max(aggregate.Health_Score, sciipNumber1110_(row.Health_Score));
    aggregate.Digest_Status = sciipHigherDigestStatusConstraint1110_(aggregate.Digest_Status, row.Digest_Status);
    aggregate.Digest_Severity = sciipHigherSeverity1110_(aggregate.Digest_Severity, row.Digest_Severity);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1110_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1110_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1110_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Signal_Ledger_Status = sciipHigherSignalLedgerStatusConstraint1110_(aggregate.Signal_Ledger_Status, row.Signal_Ledger_Status);
    aggregate.Signal_Ledger_Event_Type = sciipHigherSignalLedgerEventTypeConstraint1110_(aggregate.Signal_Ledger_Event_Type, row.Signal_Ledger_Event_Type);
    aggregate.Dashboard_Flag = sciipYesNo1110_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1110_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionSignalDigest1110_(aggregate) {
  if (aggregate.Signal_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_STOP_SIGNAL') {
    return {
      status: 'SIGNAL_DIGEST_STOP',
      title: 'Autonomous execution signal: STOP.',
      body: 'SCIIP_OS recorded a STOP signal in the execution signal ledger. The autonomous execution chain requires escalation or remediation before downstream automation should continue.',
      severity: 'HIGH',
      action: 'Escalate execution signal state, resolve blockers, and rerun the autonomous execution chain.'
    };
  }

  if (aggregate.Signal_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_REVIEW_SIGNAL') {
    return {
      status: 'SIGNAL_DIGEST_REVIEW',
      title: 'Autonomous execution signal: REVIEW.',
      body: 'SCIIP_OS recorded a REVIEW signal in the execution signal ledger. The autonomous execution chain requires governance review before it should be treated as clear.',
      severity: 'MEDIUM',
      action: 'Complete governance review and rerun signal processors if the state changes.'
    };
  }

  if (aggregate.Signal_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_MONITOR_SIGNAL') {
    return {
      status: 'SIGNAL_DIGEST_MONITOR',
      title: 'Autonomous execution signal: MONITOR.',
      body: 'SCIIP_OS recorded a MONITOR signal in the execution signal ledger. The autonomous execution chain is stable but should continue to be observed.',
      severity: 'LOW',
      action: 'Continue monitoring autonomous execution signal state.'
    };
  }

  if (aggregate.Signal_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_GO_SIGNAL') {
    return {
      status: 'SIGNAL_DIGEST_GO',
      title: 'Autonomous execution signal: GO.',
      body: 'SCIIP_OS recorded a GO signal in the execution signal ledger. The autonomous execution chain is healthy and may continue downstream reporting.',
      severity: 'LOW',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Signal_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_NO_SIGNAL') {
    return {
      status: 'SIGNAL_DIGEST_NO_SIGNAL',
      title: 'Autonomous execution signal: NO SIGNAL.',
      body: 'SCIIP_OS recorded that no usable autonomous execution system signal was available.',
      severity: 'UNKNOWN',
      action: 'Generate upstream system-signal records before relying on signal digest reporting.'
    };
  }

  return {
    status: 'SIGNAL_DIGEST_UNKNOWN',
    title: 'Autonomous execution signal digest is unclassified.',
    body: 'SCIIP_OS created a signal digest, but the signal-ledger event type did not match a known digest class.',
    severity: 'MEDIUM',
    action: 'Review signal-ledger records and normalize signal-ledger event values.'
  };
}

function sciipResolveKnowledgeGraphImpact1110_(aggregate, digest) {
  return [
    'Created permanent autonomous execution signal digest history.',
    'Signal digest status=' + digest.status + '.',
    'Signal digest severity=' + digest.severity + '.',
    'Signal-ledger event=' + aggregate.Signal_Ledger_Event_Type + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Signal strength=' + aggregate.Signal_Strength + '.',
    'Signal routing=' + aggregate.Signal_Routing + '.',
    'Health status=' + aggregate.Health_Status + '.'
  ].join(' ');
}

function sciipNumber1110_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1110_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1110_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1110_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1110_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterStatusConstraint1110_(a, b) {
  const rank = {
    CLEARED: 1,
    MONITORING: 2,
    REVIEW_REQUIRED: 3,
    ACTION_REQUIRED: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };
  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherHealthStatusConstraint1110_(a, b) {
  const rank = {
    HEALTHY: 1,
    STABLE_MONITORING: 2,
    DEGRADED: 3,
    UNHEALTHY: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };
  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherHealthRatingConstraint1110_(a, b) {
  const rank = {
    GREEN: 1,
    BLUE: 2,
    YELLOW: 3,
    RED: 4,
    UNKNOWN: 5
  };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDigestStatusConstraint1110_(a, b) {
  const rank = {
    DIGEST_HEALTHY: 1,
    DIGEST_MONITORING: 2,
    DIGEST_REVIEW_REQUIRED: 3,
    DIGEST_ACTION_REQUIRED: 4,
    DIGEST_NO_INPUTS: 5,
    DIGEST_UNCLASSIFIED: 6
  };
  const aa = String(a || 'DIGEST_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'DIGEST_UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1110_(a, b) {
  const rank = {
    GO: 1,
    MONITOR: 2,
    REVIEW: 3,
    STOP: 4,
    NO_SIGNAL: 5,
    UNKNOWN: 6
  };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1110_(a, b) {
  const rank = {
    NONE: 0,
    WEAK: 1,
    NORMAL: 2,
    MODERATE: 3,
    STRONG: 4
  };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1110_(a, b) {
  const rank = {
    NO_ROUTE: 0,
    DASHBOARD: 1,
    GOVERNANCE_AND_DASHBOARD: 2,
    LEADERSHIP_AND_DASHBOARD: 3
  };
  const aa = String(a || 'NO_ROUTE').trim().toUpperCase();
  const bb = String(b || 'NO_ROUTE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalLedgerStatusConstraint1110_(a, b) {
  const rank = {
    RECORDED_GO_SIGNAL: 1,
    RECORDED_MONITOR_SIGNAL: 2,
    RECORDED_REVIEW_SIGNAL: 3,
    RECORDED_STOP_SIGNAL: 4,
    RECORDED_NO_SIGNAL: 5,
    RECORDED_NO_INPUTS: 6,
    RECORDED_UNKNOWN_SIGNAL: 7
  };
  const aa = String(a || 'RECORDED_UNKNOWN_SIGNAL').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN_SIGNAL').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalLedgerEventTypeConstraint1110_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_GO_SIGNAL: 1,
    AUTONOMOUS_EXECUTION_MONITOR_SIGNAL: 2,
    AUTONOMOUS_EXECUTION_REVIEW_SIGNAL: 3,
    AUTONOMOUS_EXECUTION_STOP_SIGNAL: 4,
    AUTONOMOUS_EXECUTION_NO_SIGNAL: 5,
    NO_SYSTEM_SIGNAL_INPUT: 6,
    AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionSignalDigestProcessor() {
  const result = sciipRunAutonomousProcessorExecutionSignalDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionSignalDigestProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1120_AutonomousProcessorExecutionDailyBriefProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionDailyBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1120_AutonomousProcessorExecutionDailyBriefProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEFS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEFS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1120_AutonomousProcessorExecutionDailyBriefProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionDailyBriefProcessorLegacy1120_();
      return sciipWrapLegacyRuntimeResult1120_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1120_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1120_AutonomousProcessorExecutionDailyBriefProcessor
 *******************************************************/

const SCIIP_1120_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF = {
  PROCESSOR: '1120_AutonomousProcessorExecutionDailyBriefProcessor',
  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST',
  INPUT_DATE_COLUMN: 'Signal_Digest_Date',
  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF',

  OUTPUT_HEADERS: [
    'Execution_Daily_Brief_ID',
    'Business_Key',
    'Brief_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Signal_Digest_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'System_Signal',
    'Signal_Strength',
    'Signal_Routing',
    'Signal_Ledger_Status',
    'Signal_Ledger_Event_Type',
    'Signal_Digest_Status',
    'Signal_Digest_Severity',
    'Daily_Brief_Status',
    'Daily_Brief_Title',
    'Daily_Brief_Narrative',
    'Daily_Brief_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

function sciipRunAutonomousProcessorExecutionDailyBriefProcessorLegacy1120_() {
  const cfg = SCIIP_1120_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();
  const outputSheet = sciipEnsureAutonomousProcessorExecutionDailyBriefSheet_();

  const resolvedBriefDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey = 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF|' + resolvedBriefDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionDailyBriefsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionDailyBriefNoInput1120_(
      outputSheet,
      businessKey,
      resolvedBriefDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1120_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1120_(row[cfg.INPUT_DATE_COLUMN]) === resolvedBriefDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionDailyBriefNoInput1120_(
      outputSheet,
      businessKey,
      resolvedBriefDate,
      startedAt
    );
  }

  const briefRecord = sciipBuildAutonomousProcessorExecutionDailyBrief1120_(
    sourceRows,
    businessKey,
    resolvedBriefDate,
    startedAt
  );

  outputSheet.appendRow(sciipObjectToRow1120_(briefRecord, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    briefDate: resolvedBriefDate,
    dailyBriefStatus: briefRecord.Daily_Brief_Status,
    completedAt: startedAt.toISOString()
  };
}

function sciipBuildAutonomousProcessorExecutionDailyBrief1120_(sourceRows, businessKey, briefDate, startedAt) {
  const cfg = SCIIP_1120_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF;
  const aggregate = sciipAggregateExecutionSignalDigestRows1120_(sourceRows);
  const brief = sciipResolveExecutionDailyBrief1120_(aggregate);

  return {
    Execution_Daily_Brief_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Brief_Date: briefDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Signal_Digest_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    System_Signal: aggregate.System_Signal,
    Signal_Strength: aggregate.Signal_Strength,
    Signal_Routing: aggregate.Signal_Routing,
    Signal_Ledger_Status: aggregate.Signal_Ledger_Status,
    Signal_Ledger_Event_Type: aggregate.Signal_Ledger_Event_Type,
    Signal_Digest_Status: aggregate.Signal_Digest_Status,
    Signal_Digest_Severity: aggregate.Signal_Digest_Severity,
    Daily_Brief_Status: brief.status,
    Daily_Brief_Title: brief.title,
    Daily_Brief_Narrative: brief.narrative,
    Daily_Brief_Action: brief.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1120_(aggregate, brief),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

function sciipCreateAutonomousProcessorExecutionDailyBriefNoInput1120_(outputSheet, businessKey, briefDate, startedAt) {
  const cfg = SCIIP_1120_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF;

  const record = {
    Execution_Daily_Brief_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Brief_Date: briefDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Signal_Digest_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    System_Signal: 'NO_SIGNAL',
    Signal_Strength: 'NONE',
    Signal_Routing: 'NO_ROUTE',
    Signal_Ledger_Status: 'RECORDED_NO_INPUTS',
    Signal_Ledger_Event_Type: 'NO_SYSTEM_SIGNAL_INPUT',
    Signal_Digest_Status: 'NO_INPUTS',
    Signal_Digest_Severity: 'UNKNOWN',
    Daily_Brief_Status: 'NO_INPUTS',
    Daily_Brief_Title: 'No autonomous execution signal digest available.',
    Daily_Brief_Narrative: 'SCIIP_OS could not create an autonomous execution daily brief because no signal-digest records were available for the resolved brief date.',
    Daily_Brief_Action: 'Generate signal-digest records before relying on daily execution brief reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-daily-brief history showing no available signal-digest inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1120_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

function sciipEnsureAutonomousProcessorExecutionDailyBriefSheet_() {
  const cfg = SCIIP_1120_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1120_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1120_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1120_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionSignalDigestRows1120_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    System_Signal: 'UNKNOWN',
    Signal_Strength: 'WEAK',
    Signal_Routing: 'GOVERNANCE_AND_DASHBOARD',
    Signal_Ledger_Status: 'RECORDED_UNKNOWN_SIGNAL',
    Signal_Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL',
    Signal_Digest_Status: 'SIGNAL_DIGEST_UNKNOWN',
    Signal_Digest_Severity: 'UNKNOWN',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1120_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1120_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1120_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1120_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1120_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1120_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1120_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1120_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1120_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1120_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1120_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1120_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Signal_Ledger_Status = sciipHigherSignalLedgerStatusConstraint1120_(aggregate.Signal_Ledger_Status, row.Signal_Ledger_Status);
    aggregate.Signal_Ledger_Event_Type = sciipHigherSignalLedgerEventTypeConstraint1120_(aggregate.Signal_Ledger_Event_Type, row.Signal_Ledger_Event_Type);
    aggregate.Signal_Digest_Status = sciipHigherSignalDigestStatusConstraint1120_(aggregate.Signal_Digest_Status, row.Signal_Digest_Status);
    aggregate.Signal_Digest_Severity = sciipHigherSeverity1120_(aggregate.Signal_Digest_Severity, row.Signal_Digest_Severity);
    aggregate.Dashboard_Flag = sciipYesNo1120_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1120_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionDailyBrief1120_(aggregate) {
  if (aggregate.Signal_Digest_Status === 'SIGNAL_DIGEST_STOP') {
    return {
      status: 'BRIEF_ACTION_REQUIRED',
      title: 'Daily Brief: Autonomous execution requires action.',
      narrative: 'SCIIP_OS recorded a STOP signal for the autonomous execution chain. The system should be treated as blocked or escalated until upstream conditions are remediated.',
      action: 'Escalate, resolve blockers, and rerun the execution processors from monitor through daily brief.'
    };
  }

  if (aggregate.Signal_Digest_Status === 'SIGNAL_DIGEST_REVIEW') {
    return {
      status: 'BRIEF_REVIEW_REQUIRED',
      title: 'Daily Brief: Autonomous execution requires review.',
      narrative: 'SCIIP_OS recorded a REVIEW signal. The execution chain is not fully blocked, but governance review is required before it should be treated as clear.',
      action: 'Complete governance review and rerun signal and daily brief processors if state changes.'
    };
  }

  if (aggregate.Signal_Digest_Status === 'SIGNAL_DIGEST_MONITOR') {
    return {
      status: 'BRIEF_MONITORING',
      title: 'Daily Brief: Autonomous execution is monitoring.',
      narrative: 'SCIIP_OS recorded a MONITOR signal. The autonomous execution chain is stable but should remain under observation.',
      action: 'Continue monitoring autonomous execution state.'
    };
  }

  if (aggregate.Signal_Digest_Status === 'SIGNAL_DIGEST_GO') {
    return {
      status: 'BRIEF_CLEAR',
      title: 'Daily Brief: Autonomous execution is clear.',
      narrative: 'SCIIP_OS recorded a GO signal. The autonomous execution chain is healthy and cleared for downstream reporting.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Signal_Digest_Status === 'SIGNAL_DIGEST_NO_SIGNAL') {
    return {
      status: 'BRIEF_NO_SIGNAL',
      title: 'Daily Brief: No autonomous execution signal.',
      narrative: 'SCIIP_OS did not identify a usable autonomous execution system signal for the resolved brief date.',
      action: 'Generate upstream system-signal and signal-ledger records before relying on daily brief reporting.'
    };
  }

  return {
    status: 'BRIEF_UNCLASSIFIED',
    title: 'Daily Brief: Autonomous execution state is unclassified.',
    narrative: 'SCIIP_OS created a daily brief, but the signal digest status did not match a known daily brief class.',
    action: 'Review signal digest records and normalize signal digest values.'
  };
}

function sciipResolveKnowledgeGraphImpact1120_(aggregate, brief) {
  return [
    'Created permanent autonomous execution daily brief history.',
    'Daily brief status=' + brief.status + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Signal digest status=' + aggregate.Signal_Digest_Status + '.',
    'Signal ledger event=' + aggregate.Signal_Ledger_Event_Type + '.',
    'Signal routing=' + aggregate.Signal_Routing + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1120_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1120_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1120_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1120_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1120_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1120_(a, b) {
  const rank = { GO: 1, MONITOR: 2, REVIEW: 3, STOP: 4, NO_SIGNAL: 5, UNKNOWN: 6 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1120_(a, b) {
  const rank = { NONE: 0, WEAK: 1, NORMAL: 2, MODERATE: 3, STRONG: 4 };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1120_(a, b) {
  const rank = {
    NO_ROUTE: 0,
    DASHBOARD: 1,
    GOVERNANCE_AND_DASHBOARD: 2,
    LEADERSHIP_AND_DASHBOARD: 3
  };
  const aa = String(a || 'NO_ROUTE').trim().toUpperCase();
  const bb = String(b || 'NO_ROUTE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalLedgerStatusConstraint1120_(a, b) {
  const rank = {
    RECORDED_GO_SIGNAL: 1,
    RECORDED_MONITOR_SIGNAL: 2,
    RECORDED_REVIEW_SIGNAL: 3,
    RECORDED_STOP_SIGNAL: 4,
    RECORDED_NO_SIGNAL: 5,
    RECORDED_NO_INPUTS: 6,
    RECORDED_UNKNOWN_SIGNAL: 7
  };
  const aa = String(a || 'RECORDED_UNKNOWN_SIGNAL').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN_SIGNAL').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalLedgerEventTypeConstraint1120_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_GO_SIGNAL: 1,
    AUTONOMOUS_EXECUTION_MONITOR_SIGNAL: 2,
    AUTONOMOUS_EXECUTION_REVIEW_SIGNAL: 3,
    AUTONOMOUS_EXECUTION_STOP_SIGNAL: 4,
    AUTONOMOUS_EXECUTION_NO_SIGNAL: 5,
    NO_SYSTEM_SIGNAL_INPUT: 6,
    AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalDigestStatusConstraint1120_(a, b) {
  const rank = {
    SIGNAL_DIGEST_GO: 1,
    SIGNAL_DIGEST_MONITOR: 2,
    SIGNAL_DIGEST_REVIEW: 3,
    SIGNAL_DIGEST_STOP: 4,
    SIGNAL_DIGEST_NO_SIGNAL: 5,
    NO_INPUTS: 6,
    SIGNAL_DIGEST_UNKNOWN: 7
  };
  const aa = String(a || 'SIGNAL_DIGEST_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'SIGNAL_DIGEST_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionDailyBriefProcessor() {
  const result = sciipRunAutonomousProcessorExecutionDailyBriefProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionDailyBriefProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1130_AutonomousProcessorExecutionDailyBriefLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionDailyBriefLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1130_AutonomousProcessorExecutionDailyBriefLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1130_AutonomousProcessorExecutionDailyBriefLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionDailyBriefLedgerProcessorLegacy1130_();
      return sciipWrapLegacyRuntimeResult1130_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1130_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1130_AutonomousProcessorExecutionDailyBriefLedgerProcessor
 *******************************************************/

const SCIIP_1130_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER = {
  PROCESSOR: '1130_AutonomousProcessorExecutionDailyBriefLedgerProcessor',
  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF',
  INPUT_DATE_COLUMN: 'Brief_Date',
  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER',

  OUTPUT_HEADERS: [
    'Execution_Daily_Brief_Ledger_ID',
    'Business_Key',
    'Daily_Brief_Ledger_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Daily_Brief_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'System_Signal',
    'Signal_Strength',
    'Signal_Routing',
    'Signal_Ledger_Status',
    'Signal_Ledger_Event_Type',
    'Signal_Digest_Status',
    'Signal_Digest_Severity',
    'Daily_Brief_Status',
    'Daily_Brief_Ledger_Status',
    'Daily_Brief_Ledger_Event_Type',
    'Daily_Brief_Ledger_Conclusion',
    'Daily_Brief_Ledger_Reason',
    'Recommended_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

function sciipRunAutonomousProcessorExecutionDailyBriefLedgerProcessorLegacy1130_() {
  const cfg = SCIIP_1130_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();
  const outputSheet = sciipEnsureAutonomousProcessorExecutionDailyBriefLedgerSheet_();

  const resolvedLedgerDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER|' + resolvedLedgerDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionDailyBriefLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionDailyBriefLedgerNoInput1130_(
      outputSheet,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1130_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1130_(row[cfg.INPUT_DATE_COLUMN]) === resolvedLedgerDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionDailyBriefLedgerNoInput1130_(
      outputSheet,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );
  }

  const record = sciipBuildAutonomousProcessorExecutionDailyBriefLedger1130_(
    sourceRows,
    businessKey,
    resolvedLedgerDate,
    startedAt
  );

  outputSheet.appendRow(sciipObjectToRow1130_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionDailyBriefLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    dailyBriefLedgerDate: resolvedLedgerDate,
    dailyBriefLedgerStatus: record.Daily_Brief_Ledger_Status,
    dailyBriefLedgerEventType: record.Daily_Brief_Ledger_Event_Type,
    completedAt: startedAt.toISOString()
  };
}

function sciipBuildAutonomousProcessorExecutionDailyBriefLedger1130_(sourceRows, businessKey, ledgerDate, startedAt) {
  const cfg = SCIIP_1130_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER;
  const aggregate = sciipAggregateExecutionDailyBriefRows1130_(sourceRows);
  const ledger = sciipResolveExecutionDailyBriefLedger1130_(aggregate);

  return {
    Execution_Daily_Brief_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Daily_Brief_Ledger_Date: ledgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Daily_Brief_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    System_Signal: aggregate.System_Signal,
    Signal_Strength: aggregate.Signal_Strength,
    Signal_Routing: aggregate.Signal_Routing,
    Signal_Ledger_Status: aggregate.Signal_Ledger_Status,
    Signal_Ledger_Event_Type: aggregate.Signal_Ledger_Event_Type,
    Signal_Digest_Status: aggregate.Signal_Digest_Status,
    Signal_Digest_Severity: aggregate.Signal_Digest_Severity,
    Daily_Brief_Status: aggregate.Daily_Brief_Status,
    Daily_Brief_Ledger_Status: ledger.status,
    Daily_Brief_Ledger_Event_Type: ledger.eventType,
    Daily_Brief_Ledger_Conclusion: ledger.conclusion,
    Daily_Brief_Ledger_Reason: ledger.reason,
    Recommended_Action: ledger.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1130_(aggregate, ledger),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

function sciipCreateAutonomousProcessorExecutionDailyBriefLedgerNoInput1130_(outputSheet, businessKey, ledgerDate, startedAt) {
  const cfg = SCIIP_1130_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER;

  const record = {
    Execution_Daily_Brief_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Daily_Brief_Ledger_Date: ledgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Daily_Brief_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    System_Signal: 'NO_SIGNAL',
    Signal_Strength: 'NONE',
    Signal_Routing: 'NO_ROUTE',
    Signal_Ledger_Status: 'RECORDED_NO_INPUTS',
    Signal_Ledger_Event_Type: 'NO_SYSTEM_SIGNAL_INPUT',
    Signal_Digest_Status: 'NO_INPUTS',
    Signal_Digest_Severity: 'UNKNOWN',
    Daily_Brief_Status: 'NO_INPUTS',
    Daily_Brief_Ledger_Status: 'RECORDED_NO_INPUTS',
    Daily_Brief_Ledger_Event_Type: 'NO_DAILY_BRIEF_INPUT',
    Daily_Brief_Ledger_Conclusion: 'No autonomous execution daily brief was available to ledger.',
    Daily_Brief_Ledger_Reason: 'No execution daily-brief records were available for the resolved ledger date.',
    Recommended_Action: 'Generate execution daily-brief records before relying on daily-brief-ledger reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-daily-brief-ledger history showing no available daily-brief inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1130_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionDailyBriefLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

function sciipEnsureAutonomousProcessorExecutionDailyBriefLedgerSheet_() {
  const cfg = SCIIP_1130_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1130_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1130_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1130_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionDailyBriefRows1130_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    System_Signal: 'UNKNOWN',
    Signal_Strength: 'WEAK',
    Signal_Routing: 'GOVERNANCE_AND_DASHBOARD',
    Signal_Ledger_Status: 'RECORDED_UNKNOWN_SIGNAL',
    Signal_Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL',
    Signal_Digest_Status: 'SIGNAL_DIGEST_UNKNOWN',
    Signal_Digest_Severity: 'UNKNOWN',
    Daily_Brief_Status: 'BRIEF_UNCLASSIFIED',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1130_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1130_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1130_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1130_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1130_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1130_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1130_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1130_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1130_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1130_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1130_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1130_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Signal_Ledger_Status = sciipHigherSignalLedgerStatusConstraint1130_(aggregate.Signal_Ledger_Status, row.Signal_Ledger_Status);
    aggregate.Signal_Ledger_Event_Type = sciipHigherSignalLedgerEventTypeConstraint1130_(aggregate.Signal_Ledger_Event_Type, row.Signal_Ledger_Event_Type);
    aggregate.Signal_Digest_Status = sciipHigherSignalDigestStatusConstraint1130_(aggregate.Signal_Digest_Status, row.Signal_Digest_Status);
    aggregate.Signal_Digest_Severity = sciipHigherSeverity1130_(aggregate.Signal_Digest_Severity, row.Signal_Digest_Severity);
    aggregate.Daily_Brief_Status = sciipHigherDailyBriefStatusConstraint1130_(aggregate.Daily_Brief_Status, row.Daily_Brief_Status);
    aggregate.Dashboard_Flag = sciipYesNo1130_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1130_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionDailyBriefLedger1130_(aggregate) {
  if (aggregate.Daily_Brief_Status === 'BRIEF_ACTION_REQUIRED') {
    return {
      status: 'RECORDED_ACTION_REQUIRED_BRIEF',
      eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_ACTION_REQUIRED',
      conclusion: 'Autonomous execution daily brief requires action.',
      reason: 'Daily brief records show an action-required autonomous execution state.',
      action: 'Escalate and resolve blockers before downstream automation proceeds.'
    };
  }

  if (aggregate.Daily_Brief_Status === 'BRIEF_REVIEW_REQUIRED') {
    return {
      status: 'RECORDED_REVIEW_REQUIRED_BRIEF',
      eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_REVIEW_REQUIRED',
      conclusion: 'Autonomous execution daily brief requires review.',
      reason: 'Daily brief records show a review-required autonomous execution state.',
      action: 'Complete governance review and rerun daily brief processors if state changes.'
    };
  }

  if (aggregate.Daily_Brief_Status === 'BRIEF_MONITORING') {
    return {
      status: 'RECORDED_MONITORING_BRIEF',
      eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_MONITORING',
      conclusion: 'Autonomous execution daily brief is monitoring.',
      reason: 'Daily brief records show a stable monitoring state.',
      action: 'Continue monitoring autonomous execution daily brief state.'
    };
  }

  if (aggregate.Daily_Brief_Status === 'BRIEF_CLEAR') {
    return {
      status: 'RECORDED_CLEAR_BRIEF',
      eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_CLEAR',
      conclusion: 'Autonomous execution daily brief is clear.',
      reason: 'Daily brief records show a clear autonomous execution state.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Daily_Brief_Status === 'BRIEF_NO_SIGNAL') {
    return {
      status: 'RECORDED_NO_SIGNAL_BRIEF',
      eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_NO_SIGNAL',
      conclusion: 'Autonomous execution daily brief recorded no signal.',
      reason: 'Daily brief records indicate no usable execution signal.',
      action: 'Generate upstream signal records before relying on daily brief ledger.'
    };
  }

  if (aggregate.Daily_Brief_Status === 'NO_INPUTS') {
    return {
      status: 'RECORDED_NO_INPUTS',
      eventType: 'NO_DAILY_BRIEF_INPUT',
      conclusion: 'No autonomous execution daily brief input was available.',
      reason: 'Daily brief input records were unavailable.',
      action: 'Generate daily brief records before ledger reporting.'
    };
  }

  return {
    status: 'RECORDED_UNKNOWN_BRIEF',
    eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN',
    conclusion: 'Autonomous execution daily brief could not be classified.',
    reason: 'Daily brief status did not match a known ledger class.',
    action: 'Review daily brief records and normalize daily brief status values.'
  };
}

function sciipResolveKnowledgeGraphImpact1130_(aggregate, ledger) {
  return [
    'Created immutable autonomous execution daily brief ledger entry.',
    'Daily brief ledger status=' + ledger.status + '.',
    'Daily brief ledger event=' + ledger.eventType + '.',
    'Daily brief status=' + aggregate.Daily_Brief_Status + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Signal digest status=' + aggregate.Signal_Digest_Status + '.',
    'Signal ledger event=' + aggregate.Signal_Ledger_Event_Type + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1130_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1130_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1130_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1130_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1130_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1130_(a, b) {
  const rank = { GO: 1, MONITOR: 2, REVIEW: 3, STOP: 4, NO_SIGNAL: 5, UNKNOWN: 6 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1130_(a, b) {
  const rank = { NONE: 0, WEAK: 1, NORMAL: 2, MODERATE: 3, STRONG: 4 };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1130_(a, b) {
  const rank = {
    NO_ROUTE: 0,
    DASHBOARD: 1,
    GOVERNANCE_AND_DASHBOARD: 2,
    LEADERSHIP_AND_DASHBOARD: 3
  };
  const aa = String(a || 'NO_ROUTE').trim().toUpperCase();
  const bb = String(b || 'NO_ROUTE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalLedgerStatusConstraint1130_(a, b) {
  const rank = {
    RECORDED_GO_SIGNAL: 1,
    RECORDED_MONITOR_SIGNAL: 2,
    RECORDED_REVIEW_SIGNAL: 3,
    RECORDED_STOP_SIGNAL: 4,
    RECORDED_NO_SIGNAL: 5,
    RECORDED_NO_INPUTS: 6,
    RECORDED_UNKNOWN_SIGNAL: 7
  };
  const aa = String(a || 'RECORDED_UNKNOWN_SIGNAL').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN_SIGNAL').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalLedgerEventTypeConstraint1130_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_GO_SIGNAL: 1,
    AUTONOMOUS_EXECUTION_MONITOR_SIGNAL: 2,
    AUTONOMOUS_EXECUTION_REVIEW_SIGNAL: 3,
    AUTONOMOUS_EXECUTION_STOP_SIGNAL: 4,
    AUTONOMOUS_EXECUTION_NO_SIGNAL: 5,
    NO_SYSTEM_SIGNAL_INPUT: 6,
    AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalDigestStatusConstraint1130_(a, b) {
  const rank = {
    SIGNAL_DIGEST_GO: 1,
    SIGNAL_DIGEST_MONITOR: 2,
    SIGNAL_DIGEST_REVIEW: 3,
    SIGNAL_DIGEST_STOP: 4,
    SIGNAL_DIGEST_NO_SIGNAL: 5,
    NO_INPUTS: 6,
    SIGNAL_DIGEST_UNKNOWN: 7
  };
  const aa = String(a || 'SIGNAL_DIGEST_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'SIGNAL_DIGEST_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDailyBriefStatusConstraint1130_(a, b) {
  const rank = {
    BRIEF_CLEAR: 1,
    BRIEF_MONITORING: 2,
    BRIEF_REVIEW_REQUIRED: 3,
    BRIEF_ACTION_REQUIRED: 4,
    BRIEF_NO_SIGNAL: 5,
    NO_INPUTS: 6,
    BRIEF_UNCLASSIFIED: 7
  };
  const aa = String(a || 'BRIEF_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'BRIEF_UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionDailyBriefLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionDailyBriefLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionDailyBriefLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1140_AutonomousProcessorExecutionRunStateProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1140_AutonomousProcessorExecutionRunStateProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1140_AutonomousProcessorExecutionRunStateProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateProcessorLegacy1140_();
      return sciipWrapLegacyRuntimeResult1140_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1140_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1140_AutonomousProcessorExecutionRunStateProcessor
 *******************************************************/

const SCIIP_1140_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE = {
  PROCESSOR: '1140_AutonomousProcessorExecutionRunStateProcessor',
  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER',
  INPUT_DATE_COLUMN: 'Daily_Brief_Ledger_Date',
  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE',

  OUTPUT_HEADERS: [
    'Execution_Run_State_ID',
    'Business_Key',
    'Run_State_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Daily_Brief_Ledger_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'System_Signal',
    'Signal_Strength',
    'Signal_Routing',
    'Signal_Digest_Status',
    'Daily_Brief_Status',
    'Daily_Brief_Ledger_Status',
    'Daily_Brief_Ledger_Event_Type',
    'Run_State',
    'Run_State_Category',
    'Run_State_Reason',
    'Run_State_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

function sciipRunAutonomousProcessorExecutionRunStateProcessorLegacy1140_() {
  const cfg = SCIIP_1140_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();
  const outputSheet = sciipEnsureAutonomousProcessorExecutionRunStateSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE|' + resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStatesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionRunStateNoInput1140_(
      outputSheet,
      businessKey,
      resolvedRunStateDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1140_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1140_(row[cfg.INPUT_DATE_COLUMN]) === resolvedRunStateDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionRunStateNoInput1140_(
      outputSheet,
      businessKey,
      resolvedRunStateDate,
      startedAt
    );
  }

  const record = sciipBuildAutonomousProcessorExecutionRunState1140_(
    sourceRows,
    businessKey,
    resolvedRunStateDate,
    startedAt
  );

  outputSheet.appendRow(sciipObjectToRow1140_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStatesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    runStateDate: resolvedRunStateDate,
    runState: record.Run_State,
    runStateCategory: record.Run_State_Category,
    completedAt: startedAt.toISOString()
  };
}

function sciipBuildAutonomousProcessorExecutionRunState1140_(sourceRows, businessKey, runStateDate, startedAt) {
  const cfg = SCIIP_1140_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE;
  const aggregate = sciipAggregateExecutionDailyBriefLedgerRows1140_(sourceRows);
  const runState = sciipResolveExecutionRunState1140_(aggregate);

  return {
    Execution_Run_State_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Run_State_Date: runStateDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Daily_Brief_Ledger_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    System_Signal: aggregate.System_Signal,
    Signal_Strength: aggregate.Signal_Strength,
    Signal_Routing: aggregate.Signal_Routing,
    Signal_Digest_Status: aggregate.Signal_Digest_Status,
    Daily_Brief_Status: aggregate.Daily_Brief_Status,
    Daily_Brief_Ledger_Status: aggregate.Daily_Brief_Ledger_Status,
    Daily_Brief_Ledger_Event_Type: aggregate.Daily_Brief_Ledger_Event_Type,
    Run_State: runState.state,
    Run_State_Category: runState.category,
    Run_State_Reason: runState.reason,
    Run_State_Action: runState.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1140_(aggregate, runState),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

function sciipCreateAutonomousProcessorExecutionRunStateNoInput1140_(outputSheet, businessKey, runStateDate, startedAt) {
  const cfg = SCIIP_1140_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE;

  const record = {
    Execution_Run_State_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Run_State_Date: runStateDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Daily_Brief_Ledger_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    System_Signal: 'NO_SIGNAL',
    Signal_Strength: 'NONE',
    Signal_Routing: 'NO_ROUTE',
    Signal_Digest_Status: 'NO_INPUTS',
    Daily_Brief_Status: 'NO_INPUTS',
    Daily_Brief_Ledger_Status: 'RECORDED_NO_INPUTS',
    Daily_Brief_Ledger_Event_Type: 'NO_DAILY_BRIEF_INPUT',
    Run_State: 'NO_RUN_STATE',
    Run_State_Category: 'NO_INPUTS',
    Run_State_Reason: 'No execution daily-brief-ledger records were available for the resolved run-state date.',
    Run_State_Action: 'Generate execution daily-brief-ledger records before relying on run-state reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-run-state history showing no available daily-brief-ledger inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1140_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionRunStatesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

function sciipEnsureAutonomousProcessorExecutionRunStateSheet_() {
  const cfg = SCIIP_1140_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1140_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1140_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1140_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionDailyBriefLedgerRows1140_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    System_Signal: 'UNKNOWN',
    Signal_Strength: 'WEAK',
    Signal_Routing: 'GOVERNANCE_AND_DASHBOARD',
    Signal_Digest_Status: 'SIGNAL_DIGEST_UNKNOWN',
    Daily_Brief_Status: 'BRIEF_UNCLASSIFIED',
    Daily_Brief_Ledger_Status: 'RECORDED_UNKNOWN_BRIEF',
    Daily_Brief_Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1140_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1140_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1140_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1140_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1140_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1140_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1140_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1140_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1140_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1140_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1140_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1140_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Signal_Digest_Status = sciipHigherSignalDigestStatusConstraint1140_(aggregate.Signal_Digest_Status, row.Signal_Digest_Status);
    aggregate.Daily_Brief_Status = sciipHigherDailyBriefStatusConstraint1140_(aggregate.Daily_Brief_Status, row.Daily_Brief_Status);
    aggregate.Daily_Brief_Ledger_Status = sciipHigherDailyBriefLedgerStatusConstraint1140_(aggregate.Daily_Brief_Ledger_Status, row.Daily_Brief_Ledger_Status);
    aggregate.Daily_Brief_Ledger_Event_Type = sciipHigherDailyBriefLedgerEventTypeConstraint1140_(aggregate.Daily_Brief_Ledger_Event_Type, row.Daily_Brief_Ledger_Event_Type);
    aggregate.Dashboard_Flag = sciipYesNo1140_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1140_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionRunState1140_(aggregate) {
  if (aggregate.Daily_Brief_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_ACTION_REQUIRED') {
    return {
      state: 'STOPPED',
      category: 'ACTION_REQUIRED',
      reason: 'Execution run state is stopped because the daily brief ledger recorded an action-required event.',
      action: 'Resolve blockers and rerun the autonomous execution chain.'
    };
  }

  if (aggregate.Daily_Brief_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_REVIEW_REQUIRED') {
    return {
      state: 'HELD',
      category: 'REVIEW_REQUIRED',
      reason: 'Execution run state is held because the daily brief ledger recorded a review-required event.',
      action: 'Complete governance review before advancing execution state.'
    };
  }

  if (aggregate.Daily_Brief_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_MONITORING') {
    return {
      state: 'MONITORING',
      category: 'STABLE',
      reason: 'Execution run state is monitoring because the daily brief ledger recorded a stable monitoring event.',
      action: 'Continue monitoring execution run state.'
    };
  }

  if (aggregate.Daily_Brief_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_CLEAR') {
    return {
      state: 'RUNNABLE',
      category: 'CLEAR',
      reason: 'Execution run state is runnable because the daily brief ledger recorded a clear event.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (
    aggregate.Daily_Brief_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_NO_SIGNAL' ||
    aggregate.Daily_Brief_Ledger_Event_Type === 'NO_DAILY_BRIEF_INPUT'
  ) {
    return {
      state: 'NO_RUN_STATE',
      category: 'NO_INPUTS',
      reason: 'Execution run state cannot be established because no usable daily brief signal was ledgered.',
      action: 'Generate upstream signal and daily brief records before relying on run-state reporting.'
    };
  }

  return {
    state: 'UNKNOWN',
    category: 'UNCLASSIFIED',
    reason: 'Execution run state could not classify the daily brief ledger event.',
    action: 'Review daily brief ledger records and normalize event type values.'
  };
}

function sciipResolveKnowledgeGraphImpact1140_(aggregate, runState) {
  return [
    'Created permanent autonomous execution run-state history.',
    'Run state=' + runState.state + '.',
    'Run state category=' + runState.category + '.',
    'Daily brief ledger event=' + aggregate.Daily_Brief_Ledger_Event_Type + '.',
    'Daily brief status=' + aggregate.Daily_Brief_Status + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1140_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1140_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1140_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1140_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1140_(a, b) {
  const rank = { GO: 1, MONITOR: 2, REVIEW: 3, STOP: 4, NO_SIGNAL: 5, UNKNOWN: 6 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1140_(a, b) {
  const rank = { NONE: 0, WEAK: 1, NORMAL: 2, MODERATE: 3, STRONG: 4 };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1140_(a, b) {
  const rank = {
    NO_ROUTE: 0,
    DASHBOARD: 1,
    GOVERNANCE_AND_DASHBOARD: 2,
    LEADERSHIP_AND_DASHBOARD: 3
  };
  const aa = String(a || 'NO_ROUTE').trim().toUpperCase();
  const bb = String(b || 'NO_ROUTE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalDigestStatusConstraint1140_(a, b) {
  const rank = {
    SIGNAL_DIGEST_GO: 1,
    SIGNAL_DIGEST_MONITOR: 2,
    SIGNAL_DIGEST_REVIEW: 3,
    SIGNAL_DIGEST_STOP: 4,
    SIGNAL_DIGEST_NO_SIGNAL: 5,
    NO_INPUTS: 6,
    SIGNAL_DIGEST_UNKNOWN: 7
  };
  const aa = String(a || 'SIGNAL_DIGEST_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'SIGNAL_DIGEST_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDailyBriefStatusConstraint1140_(a, b) {
  const rank = {
    BRIEF_CLEAR: 1,
    BRIEF_MONITORING: 2,
    BRIEF_REVIEW_REQUIRED: 3,
    BRIEF_ACTION_REQUIRED: 4,
    BRIEF_NO_SIGNAL: 5,
    NO_INPUTS: 6,
    BRIEF_UNCLASSIFIED: 7
  };
  const aa = String(a || 'BRIEF_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'BRIEF_UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDailyBriefLedgerStatusConstraint1140_(a, b) {
  const rank = {
    RECORDED_CLEAR_BRIEF: 1,
    RECORDED_MONITORING_BRIEF: 2,
    RECORDED_REVIEW_REQUIRED_BRIEF: 3,
    RECORDED_ACTION_REQUIRED_BRIEF: 4,
    RECORDED_NO_SIGNAL_BRIEF: 5,
    RECORDED_NO_INPUTS: 6,
    RECORDED_UNKNOWN_BRIEF: 7
  };
  const aa = String(a || 'RECORDED_UNKNOWN_BRIEF').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN_BRIEF').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDailyBriefLedgerEventTypeConstraint1140_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_CLEAR: 1,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_MONITORING: 2,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_REVIEW_REQUIRED: 3,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_ACTION_REQUIRED: 4,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_NO_SIGNAL: 5,
    NO_DAILY_BRIEF_INPUT: 6,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionRunStateProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1150_AutonomousProcessorExecutionRunStateLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1150_AutonomousProcessorExecutionRunStateLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1150_AutonomousProcessorExecutionRunStateLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateLedgerProcessorLegacy1150_();
      return sciipWrapLegacyRuntimeResult1150_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1150_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1150_AutonomousProcessorExecutionRunStateLedgerProcessor
 *******************************************************/

const SCIIP_1150_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER = {
  PROCESSOR: '1150_AutonomousProcessorExecutionRunStateLedgerProcessor',
  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE',
  INPUT_DATE_COLUMN: 'Run_State_Date',
  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER',

  OUTPUT_HEADERS: [
    'Execution_Run_State_Ledger_ID',
    'Business_Key',
    'Run_State_Ledger_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Run_State_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'System_Signal',
    'Signal_Strength',
    'Signal_Routing',
    'Daily_Brief_Ledger_Event_Type',
    'Run_State',
    'Run_State_Category',
    'Run_State_Ledger_Status',
    'Run_State_Ledger_Event_Type',
    'Run_State_Ledger_Conclusion',
    'Run_State_Ledger_Reason',
    'Recommended_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

function sciipRunAutonomousProcessorExecutionRunStateLedgerProcessorLegacy1150_() {
  const cfg = SCIIP_1150_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();
  const outputSheet = sciipEnsureAutonomousProcessorExecutionRunStateLedgerSheet_();

  const resolvedLedgerDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER|' + resolvedLedgerDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionRunStateLedgerNoInput1150_(
      outputSheet,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1150_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1150_(row[cfg.INPUT_DATE_COLUMN]) === resolvedLedgerDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionRunStateLedgerNoInput1150_(
      outputSheet,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );
  }

  const record = sciipBuildAutonomousProcessorExecutionRunStateLedger1150_(
    sourceRows,
    businessKey,
    resolvedLedgerDate,
    startedAt
  );

  outputSheet.appendRow(sciipObjectToRow1150_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    runStateLedgerDate: resolvedLedgerDate,
    runStateLedgerStatus: record.Run_State_Ledger_Status,
    runStateLedgerEventType: record.Run_State_Ledger_Event_Type,
    completedAt: startedAt.toISOString()
  };
}

function sciipBuildAutonomousProcessorExecutionRunStateLedger1150_(sourceRows, businessKey, ledgerDate, startedAt) {
  const cfg = SCIIP_1150_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER;
  const aggregate = sciipAggregateExecutionRunStateRows1150_(sourceRows);
  const ledger = sciipResolveExecutionRunStateLedger1150_(aggregate);

  return {
    Execution_Run_State_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Run_State_Ledger_Date: ledgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Run_State_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    System_Signal: aggregate.System_Signal,
    Signal_Strength: aggregate.Signal_Strength,
    Signal_Routing: aggregate.Signal_Routing,
    Daily_Brief_Ledger_Event_Type: aggregate.Daily_Brief_Ledger_Event_Type,
    Run_State: aggregate.Run_State,
    Run_State_Category: aggregate.Run_State_Category,
    Run_State_Ledger_Status: ledger.status,
    Run_State_Ledger_Event_Type: ledger.eventType,
    Run_State_Ledger_Conclusion: ledger.conclusion,
    Run_State_Ledger_Reason: ledger.reason,
    Recommended_Action: ledger.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1150_(aggregate, ledger),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

function sciipCreateAutonomousProcessorExecutionRunStateLedgerNoInput1150_(outputSheet, businessKey, ledgerDate, startedAt) {
  const cfg = SCIIP_1150_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER;

  const record = {
    Execution_Run_State_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Run_State_Ledger_Date: ledgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Run_State_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    System_Signal: 'NO_SIGNAL',
    Signal_Strength: 'NONE',
    Signal_Routing: 'NO_ROUTE',
    Daily_Brief_Ledger_Event_Type: 'NO_DAILY_BRIEF_INPUT',
    Run_State: 'NO_RUN_STATE',
    Run_State_Category: 'NO_INPUTS',
    Run_State_Ledger_Status: 'RECORDED_NO_INPUTS',
    Run_State_Ledger_Event_Type: 'NO_RUN_STATE_INPUT',
    Run_State_Ledger_Conclusion: 'No autonomous execution run state was available to ledger.',
    Run_State_Ledger_Reason: 'No execution run-state records were available for the resolved ledger date.',
    Recommended_Action: 'Generate execution run-state records before relying on run-state-ledger reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-run-state-ledger history showing no available run-state inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1150_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionRunStateLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

function sciipEnsureAutonomousProcessorExecutionRunStateLedgerSheet_() {
  const cfg = SCIIP_1150_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1150_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1150_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1150_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionRunStateRows1150_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    System_Signal: 'UNKNOWN',
    Signal_Strength: 'WEAK',
    Signal_Routing: 'GOVERNANCE_AND_DASHBOARD',
    Daily_Brief_Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN',
    Run_State: 'UNKNOWN',
    Run_State_Category: 'UNCLASSIFIED',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1150_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1150_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1150_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1150_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1150_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1150_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1150_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1150_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1150_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1150_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1150_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1150_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Daily_Brief_Ledger_Event_Type = sciipHigherDailyBriefLedgerEventTypeConstraint1150_(aggregate.Daily_Brief_Ledger_Event_Type, row.Daily_Brief_Ledger_Event_Type);
    aggregate.Run_State = sciipHigherRunStateConstraint1150_(aggregate.Run_State, row.Run_State);
    aggregate.Run_State_Category = sciipHigherRunStateCategoryConstraint1150_(aggregate.Run_State_Category, row.Run_State_Category);
    aggregate.Dashboard_Flag = sciipYesNo1150_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1150_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionRunStateLedger1150_(aggregate) {
  if (aggregate.Run_State === 'STOPPED') {
    return {
      status: 'RECORDED_STOPPED_RUN_STATE',
      eventType: 'AUTONOMOUS_EXECUTION_RUN_STATE_STOPPED',
      conclusion: 'Autonomous execution run state is stopped.',
      reason: 'Run-state records indicate action-required or blocked execution conditions.',
      action: 'Resolve blockers before downstream automation proceeds.'
    };
  }

  if (aggregate.Run_State === 'HELD') {
    return {
      status: 'RECORDED_HELD_RUN_STATE',
      eventType: 'AUTONOMOUS_EXECUTION_RUN_STATE_HELD',
      conclusion: 'Autonomous execution run state is held.',
      reason: 'Run-state records indicate review-required execution conditions.',
      action: 'Complete governance review before advancing execution state.'
    };
  }

  if (aggregate.Run_State === 'MONITORING') {
    return {
      status: 'RECORDED_MONITORING_RUN_STATE',
      eventType: 'AUTONOMOUS_EXECUTION_RUN_STATE_MONITORING',
      conclusion: 'Autonomous execution run state is monitoring.',
      reason: 'Run-state records indicate stable monitoring conditions.',
      action: 'Continue monitoring autonomous execution run state.'
    };
  }

  if (aggregate.Run_State === 'RUNNABLE') {
    return {
      status: 'RECORDED_RUNNABLE_RUN_STATE',
      eventType: 'AUTONOMOUS_EXECUTION_RUN_STATE_RUNNABLE',
      conclusion: 'Autonomous execution run state is runnable.',
      reason: 'Run-state records indicate clear execution conditions.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Run_State === 'NO_RUN_STATE') {
    return {
      status: 'RECORDED_NO_RUN_STATE',
      eventType: 'AUTONOMOUS_EXECUTION_NO_RUN_STATE',
      conclusion: 'No autonomous execution run state was available.',
      reason: 'Run-state records indicate no usable upstream execution state.',
      action: 'Generate upstream run-state records before relying on run-state ledger.'
    };
  }

  return {
    status: 'RECORDED_UNKNOWN_RUN_STATE',
    eventType: 'AUTONOMOUS_EXECUTION_RUN_STATE_UNKNOWN',
    conclusion: 'Autonomous execution run state could not be classified.',
    reason: 'Run state did not match a known ledger class.',
    action: 'Review run-state records and normalize run-state values.'
  };
}

function sciipResolveKnowledgeGraphImpact1150_(aggregate, ledger) {
  return [
    'Created immutable autonomous execution run-state ledger entry.',
    'Run-state ledger status=' + ledger.status + '.',
    'Run-state ledger event=' + ledger.eventType + '.',
    'Run state=' + aggregate.Run_State + '.',
    'Run-state category=' + aggregate.Run_State_Category + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1150_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1150_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1150_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1150_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1150_(a, b) {
  const rank = { GO: 1, MONITOR: 2, REVIEW: 3, STOP: 4, NO_SIGNAL: 5, UNKNOWN: 6 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1150_(a, b) {
  const rank = { NONE: 0, WEAK: 1, NORMAL: 2, MODERATE: 3, STRONG: 4 };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1150_(a, b) {
  const rank = {
    NO_ROUTE: 0,
    DASHBOARD: 1,
    GOVERNANCE_AND_DASHBOARD: 2,
    LEADERSHIP_AND_DASHBOARD: 3
  };
  const aa = String(a || 'NO_ROUTE').trim().toUpperCase();
  const bb = String(b || 'NO_ROUTE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDailyBriefLedgerEventTypeConstraint1150_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_CLEAR: 1,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_MONITORING: 2,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_REVIEW_REQUIRED: 3,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_ACTION_REQUIRED: 4,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_NO_SIGNAL: 5,
    NO_DAILY_BRIEF_INPUT: 6,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRunStateConstraint1150_(a, b) {
  const rank = {
    RUNNABLE: 1,
    MONITORING: 2,
    HELD: 3,
    STOPPED: 4,
    NO_RUN_STATE: 5,
    UNKNOWN: 6
  };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRunStateCategoryConstraint1150_(a, b) {
  const rank = {
    CLEAR: 1,
    STABLE: 2,
    REVIEW_REQUIRED: 3,
    ACTION_REQUIRED: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };
  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionRunStateLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1160_AutonomousProcessorExecutionRunStateDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1160_AutonomousProcessorExecutionRunStateDigestProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1160_AutonomousProcessorExecutionRunStateDigestProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateDigestProcessorLegacy1160_();
      return sciipWrapLegacyRuntimeResult1160_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1160_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1160_AutonomousProcessorExecutionRunStateDigestProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_PROCESSOR = '1160_AutonomousProcessorExecutionRunStateDigestProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_DATE_COLUMN = 'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_HEADERS = [
  'Digest_ID',
  'Business_Key',
  'Run_State_Date',
  'Digest_Type',
  'Operational_State',
  'Operational_Interpretation',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Ledger_Entries_Reviewed',
  'Unique_Processors_Observed',
  'Healthy_Count',
  'Warning_Count',
  'Blocked_Count',
  'Failed_Count',
  'Skipped_Count',
  'Duplicate_Count',
  'Latest_Processor',
  'Latest_Status',
  'Latest_Business_Key',
  'Latest_Completed_At',
  'Digest_Summary_JSON',
  'Source_Sheet',
  'Source_Date_Column',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateDigestProcessorLegacy1160_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_SHEET);
  if (!inputSheet) {
    throw new Error('Missing input sheet: ' + SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_SHEET);
  }

  const outputSheet = sciipEnsureAutonomousProcessorExecutionRunStateDigestSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST|' + resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateLedgerRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateLedgerRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDigestsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const digest =
    sciipBuildAutonomousProcessorExecutionRunStateDigest_(
      sourceRows,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(digest);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    ledgerEntriesReviewed: sourceRows.length,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateDigestSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_SHEET);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_HEADERS);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const missing = SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_HEADERS.filter(function(h) {
    return headers.indexOf(h) === -1;
  });

  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: digest row.
 */
function sciipBuildAutonomousProcessorExecutionRunStateDigest_(
  rows,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const aggregate =
    sciipAggregateAutonomousProcessorExecutionRunStateLedger_(rows);

  const latest =
    sciipResolveLatestAutonomousProcessorExecutionRunStateLedgerRow_(rows);

  const operationalState =
    sciipResolveAutonomousProcessorExecutionRunStateOperationalState_(aggregate);

  const interpretation =
    sciipResolveAutonomousProcessorExecutionRunStateInterpretation_(
      operationalState,
      aggregate
    );

  const governancePosture =
    sciipResolveAutonomousProcessorExecutionRunStateGovernancePosture_(
      operationalState,
      aggregate
    );

  const orchestrationPosture =
    sciipResolveAutonomousProcessorExecutionRunStateOrchestrationPosture_(
      operationalState,
      aggregate
    );

  const dashboardPosture =
    sciipResolveAutonomousProcessorExecutionRunStateDashboardPosture_(
      operationalState,
      aggregate
    );

  const decisioningPosture =
    sciipResolveAutonomousProcessorExecutionRunStateDecisioningPosture_(
      operationalState,
      aggregate
    );

  const digestId =
    'APRSD_' + Utilities.getUuid();

  const summaryJson = JSON.stringify({
    runStateDate: resolvedRunStateDate,
    operationalState: operationalState,
    governancePosture: governancePosture,
    orchestrationPosture: orchestrationPosture,
    dashboardPosture: dashboardPosture,
    decisioningPosture: decisioningPosture,
    aggregate: aggregate,
    latest: latest
  });

  return [
    digestId,
    businessKey,
    resolvedRunStateDate,
    'DAILY_AUTONOMOUS_RUN_STATE_DIGEST',
    operationalState,
    interpretation,
    governancePosture,
    orchestrationPosture,
    dashboardPosture,
    decisioningPosture,
    aggregate.ledgerEntriesReviewed,
    aggregate.uniqueProcessorsObserved,
    aggregate.healthyCount,
    aggregate.warningCount,
    aggregate.blockedCount,
    aggregate.failedCount,
    aggregate.skippedCount,
    aggregate.duplicateCount,
    latest.processor || '',
    latest.status || '',
    latest.businessKey || '',
    latest.completedAt || '',
    summaryJson,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_DATE_COLUMN,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Aggregation logic.
 */
function sciipAggregateAutonomousProcessorExecutionRunStateLedger_(rows) {
  const processors = {};
  let healthy = 0;
  let warning = 0;
  let blocked = 0;
  let failed = 0;
  let skipped = 0;
  let duplicate = 0;

  rows.forEach(function(row) {
    const processor = sciipGetRunStateLedgerValue_(row, [
      'Processor',
      'processor',
      'Processor_Name'
    ]);

    if (processor) processors[processor] = true;

    const status = String(sciipGetRunStateLedgerValue_(row, [
      'Status',
      'status',
      'Run_State',
      'Operational_State'
    ]) || '').toUpperCase();

    const skippedDuplicate = String(sciipGetRunStateLedgerValue_(row, [
      'Skipped_Duplicate',
      'skippedDuplicate'
    ]) || '');

    if (status.indexOf('FAIL') !== -1 || status.indexOf('ERROR') !== -1) {
      failed++;
    } else if (status.indexOf('BLOCK') !== -1) {
      blocked++;
    } else if (status.indexOf('WARN') !== -1) {
      warning++;
    } else if (status.indexOf('SKIPPED') !== -1) {
      skipped++;
    } else {
      healthy++;
    }

    if (skippedDuplicate === '1' || skippedDuplicate.toUpperCase() === 'TRUE') {
      duplicate++;
    }
  });

  return {
    ledgerEntriesReviewed: rows.length,
    uniqueProcessorsObserved: Object.keys(processors).length,
    healthyCount: healthy,
    warningCount: warning,
    blockedCount: blocked,
    failedCount: failed,
    skippedCount: skipped,
    duplicateCount: duplicate
  };
}

/**
 * Resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateOperationalState_(aggregate) {
  if (aggregate.failedCount > 0) return 'FAILED_ATTENTION_REQUIRED';
  if (aggregate.blockedCount > 0) return 'BLOCKED';
  if (aggregate.warningCount > 0) return 'OPERATIONAL_WITH_WARNINGS';
  if (aggregate.ledgerEntriesReviewed === aggregate.duplicateCount) return 'IDEMPOTENT_STABLE';
  return 'OPERATIONAL';
}

function sciipResolveAutonomousProcessorExecutionRunStateInterpretation_(state, aggregate) {
  if (state === 'FAILED_ATTENTION_REQUIRED') {
    return 'One or more autonomous run state ledger entries indicate failure; governance review should prioritize failed processors before further promotion.';
  }

  if (state === 'BLOCKED') {
    return 'Autonomous execution is blocked by one or more run state conditions and should not be advanced without review.';
  }

  if (state === 'OPERATIONAL_WITH_WARNINGS') {
    return 'Autonomous execution is functioning but contains warning signals that should be visible to dashboards and governance.';
  }

  if (state === 'IDEMPOTENT_STABLE') {
    return 'Run state ledger is stable and duplicate-protected; no new material state changes were detected for this processing date.';
  }

  return 'Autonomous run state is operational and suitable for downstream orchestration, dashboards, governance, and future decisioning.';
}

function sciipResolveAutonomousProcessorExecutionRunStateGovernancePosture_(state) {
  if (state === 'FAILED_ATTENTION_REQUIRED') return 'REVIEW_REQUIRED';
  if (state === 'BLOCKED') return 'ESCALATE';
  if (state === 'OPERATIONAL_WITH_WARNINGS') return 'MONITOR';
  return 'NORMAL';
}

function sciipResolveAutonomousProcessorExecutionRunStateOrchestrationPosture_(state) {
  if (state === 'FAILED_ATTENTION_REQUIRED') return 'PAUSE_PROMOTION';
  if (state === 'BLOCKED') return 'HOLD_DISPATCH';
  if (state === 'OPERATIONAL_WITH_WARNINGS') return 'ALLOW_WITH_MONITORING';
  return 'ALLOW';
}

function sciipResolveAutonomousProcessorExecutionRunStateDashboardPosture_(state) {
  if (state === 'FAILED_ATTENTION_REQUIRED') return 'SHOW_CRITICAL';
  if (state === 'BLOCKED') return 'SHOW_BLOCKED';
  if (state === 'OPERATIONAL_WITH_WARNINGS') return 'SHOW_WARNING';
  return 'SHOW_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateDecisioningPosture_(state) {
  if (state === 'FAILED_ATTENTION_REQUIRED') return 'DO_NOT_AUTONOMOUSLY_ADVANCE';
  if (state === 'BLOCKED') return 'REQUIRE_HUMAN_REVIEW';
  if (state === 'OPERATIONAL_WITH_WARNINGS') return 'ADVANCE_WITH_CAUTION';
  return 'ADVANCE';
}

/**
 * Row helpers.
 */
function sciipReadAutonomousProcessorExecutionRunStateLedgerRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipFilterAutonomousProcessorExecutionRunStateLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateLedgerValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Ledger_Date',
      'Date',
      'Created_At',
      'completedAt',
      'Completed_At'
    ]);

    return sciipNormalizeRunStateDigestDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateLedgerRow_(rows) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(sciipGetRunStateLedgerValue_(a, [
      'Completed_At',
      'completedAt',
      'Created_At',
      'createdAt'
    ]) || 0).getTime();

    const bDate = new Date(sciipGetRunStateLedgerValue_(b, [
      'Completed_At',
      'completedAt',
      'Created_At',
      'createdAt'
    ]) || 0).getTime();

    return bDate - aDate;
  });

  const latest = sorted[0];

  return {
    processor: sciipGetRunStateLedgerValue_(latest, [
      'Processor',
      'processor',
      'Processor_Name'
    ]),
    status: sciipGetRunStateLedgerValue_(latest, [
      'Status',
      'status',
      'Run_State',
      'Operational_State'
    ]),
    businessKey: sciipGetRunStateLedgerValue_(latest, [
      'Business_Key',
      'businessKey'
    ]),
    completedAt: sciipGetRunStateLedgerValue_(latest, [
      'Completed_At',
      'completedAt',
      'Created_At',
      'createdAt'
    ])
  };
}

function sciipGetRunStateLedgerValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }
  return '';
}

function sciipNormalizeRunStateDigestDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateDigestProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDigestProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessorLegacy1170_();
      return sciipWrapLegacyRuntimeResult1170_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1170_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR =
  '1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Digest_ID',
  'Digest_Type',
  'Operational_State',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Operational_Interpretation',
  'Ledger_Entries_Reviewed',
  'Unique_Processors_Observed',
  'Healthy_Count',
  'Warning_Count',
  'Blocked_Count',
  'Failed_Count',
  'Skipped_Count',
  'Duplicate_Count',
  'Latest_Processor',
  'Latest_Status',
  'Latest_Business_Key',
  'Latest_Completed_At',
  'Ledger_Summary_JSON',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessorLegacy1170_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateDigestLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const digestRows =
    sciipReadAutonomousProcessorExecutionRunStateDigestRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateDigestRowsByDate_(
      digestRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestDigest =
    sciipResolveLatestAutonomousProcessorExecutionRunStateDigestRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateDigestLedgerEntry_(
      latestDigest,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateDigestLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry row.
 */
function sciipBuildAutonomousProcessorExecutionRunStateDigestLedgerEntry_(
  digest,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSDL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    digestId: sciipGetRunStateDigestValue_(digest, ['Digest_ID']),
    operationalState: sciipGetRunStateDigestValue_(digest, ['Operational_State']),
    governancePosture: sciipGetRunStateDigestValue_(digest, ['Governance_Posture']),
    orchestrationPosture: sciipGetRunStateDigestValue_(digest, ['Orchestration_Posture']),
    dashboardPosture: sciipGetRunStateDigestValue_(digest, ['Dashboard_Posture']),
    decisioningPosture: sciipGetRunStateDigestValue_(digest, ['Decisioning_Posture']),
    sourceBusinessKey: sciipGetRunStateDigestValue_(digest, ['Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateDigestValue_(digest, ['Digest_ID']),
    sciipGetRunStateDigestValue_(digest, ['Digest_Type']),
    sciipGetRunStateDigestValue_(digest, ['Operational_State']),
    sciipGetRunStateDigestValue_(digest, ['Governance_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Orchestration_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Dashboard_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Decisioning_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Operational_Interpretation']),
    sciipGetRunStateDigestValue_(digest, ['Ledger_Entries_Reviewed']),
    sciipGetRunStateDigestValue_(digest, ['Unique_Processors_Observed']),
    sciipGetRunStateDigestValue_(digest, ['Healthy_Count']),
    sciipGetRunStateDigestValue_(digest, ['Warning_Count']),
    sciipGetRunStateDigestValue_(digest, ['Blocked_Count']),
    sciipGetRunStateDigestValue_(digest, ['Failed_Count']),
    sciipGetRunStateDigestValue_(digest, ['Skipped_Count']),
    sciipGetRunStateDigestValue_(digest, ['Duplicate_Count']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Processor']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Status']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Business_Key']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Completed_At']),
    JSON.stringify(summary),
    sciipGetRunStateDigestValue_(digest, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateDigestRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateDigestRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateDigestValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateDigestLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateDigestRow_(rows) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateDigestValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateDigestValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateDigestValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateDigestLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateDigestLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDigestLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1180_AutonomousProcessorExecutionRunStateSignalProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateSignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1180_AutonomousProcessorExecutionRunStateSignalProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1180_AutonomousProcessorExecutionRunStateSignalProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateSignalProcessorLegacy1180_();
      return sciipWrapLegacyRuntimeResult1180_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1180_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1180_AutonomousProcessorExecutionRunStateSignalProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR =
  '1180_AutonomousProcessorExecutionRunStateSignalProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_HEADERS = [
  'Signal_ID',
  'Business_Key',
  'Run_State_Date',
  'Signal_Type',
  'Signal_Category',
  'Signal_Severity',
  'Signal_Status',
  'Signal_Message',
  'Operational_State',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Ledger_Entries_Reviewed',
  'Unique_Processors_Observed',
  'Healthy_Count',
  'Warning_Count',
  'Blocked_Count',
  'Failed_Count',
  'Skipped_Count',
  'Duplicate_Count',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Signal_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalProcessorLegacy1180_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalInputRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerEntry =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalInputRow_(
      sourceRows
    );

  const signalRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignal_(
      latestLedgerEntry,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(signalRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateSignalSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: signal row.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignal_(
  ledgerEntry,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const operationalState =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Operational_State']);

  const governancePosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Governance_Posture']);

  const orchestrationPosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Orchestration_Posture']);

  const dashboardPosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Dashboard_Posture']);

  const decisioningPosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Decisioning_Posture']);

  const severity =
    sciipResolveAutonomousProcessorExecutionRunStateSignalSeverity_(
      operationalState,
      governancePosture,
      orchestrationPosture,
      decisioningPosture
    );

  const category =
    sciipResolveAutonomousProcessorExecutionRunStateSignalCategory_(
      operationalState,
      severity
    );

  const status =
    sciipResolveAutonomousProcessorExecutionRunStateSignalStatus_(severity);

  const recommendedAction =
    sciipResolveAutonomousProcessorExecutionRunStateSignalRecommendedAction_(
      operationalState,
      governancePosture,
      orchestrationPosture,
      decisioningPosture
    );

  const autonomousActionAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateSignalAutonomousAllowed_(
      decisioningPosture
    );

  const humanReviewRequired =
    sciipResolveAutonomousProcessorExecutionRunStateSignalHumanReviewRequired_(
      governancePosture,
      decisioningPosture
    );

  const message =
    sciipResolveAutonomousProcessorExecutionRunStateSignalMessage_(
      operationalState,
      severity,
      recommendedAction
    );

  const signalId = 'APRSS_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    signalType: 'AUTONOMOUS_RUN_STATE_SIGNAL',
    signalCategory: category,
    signalSeverity: severity,
    signalStatus: status,
    operationalState: operationalState,
    governancePosture: governancePosture,
    orchestrationPosture: orchestrationPosture,
    dashboardPosture: dashboardPosture,
    decisioningPosture: decisioningPosture,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: autonomousActionAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceLedgerEntryId: sciipGetRunStateSignalInputValue_(ledgerEntry, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateSignalInputValue_(ledgerEntry, [
      'Business_Key'
    ])
  };

  return [
    signalId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_SIGNAL',
    category,
    severity,
    status,
    message,
    operationalState,
    governancePosture,
    orchestrationPosture,
    dashboardPosture,
    decisioningPosture,
    recommendedAction,
    autonomousActionAllowed,
    humanReviewRequired,
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Ledger_Entries_Reviewed']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Unique_Processors_Observed']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Healthy_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Warning_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Blocked_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Failed_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Skipped_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Duplicate_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Ledger_Entry_ID']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Signal resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateSignalSeverity_(
  operationalState,
  governancePosture,
  orchestrationPosture,
  decisioningPosture
) {
  const state = String(operationalState || '').toUpperCase();
  const governance = String(governancePosture || '').toUpperCase();
  const orchestration = String(orchestrationPosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    state.indexOf('FAILED') !== -1 ||
    governance === 'REVIEW_REQUIRED' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE'
  ) {
    return 'CRITICAL';
  }

  if (
    state === 'BLOCKED' ||
    governance === 'ESCALATE' ||
    orchestration === 'HOLD_DISPATCH' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return 'HIGH';
  }

  if (
    state.indexOf('WARNING') !== -1 ||
    governance === 'MONITOR' ||
    orchestration === 'ALLOW_WITH_MONITORING' ||
    decisioning === 'ADVANCE_WITH_CAUTION'
  ) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalCategory_(
  operationalState,
  severity
) {
  const state = String(operationalState || '').toUpperCase();

  if (severity === 'CRITICAL') return 'RUN_STATE_FAILURE';
  if (severity === 'HIGH') return 'RUN_STATE_BLOCKER';
  if (state === 'IDEMPOTENT_STABLE') return 'RUN_STATE_STABILITY';
  if (severity === 'MEDIUM') return 'RUN_STATE_WARNING';
  return 'RUN_STATE_HEALTH';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalStatus_(severity) {
  if (severity === 'CRITICAL') return 'ACTIVE_CRITICAL';
  if (severity === 'HIGH') return 'ACTIVE_HIGH';
  if (severity === 'MEDIUM') return 'ACTIVE_MONITOR';
  return 'ACTIVE_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalRecommendedAction_(
  operationalState,
  governancePosture,
  orchestrationPosture,
  decisioningPosture
) {
  const state = String(operationalState || '').toUpperCase();
  const governance = String(governancePosture || '').toUpperCase();
  const orchestration = String(orchestrationPosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    state.indexOf('FAILED') !== -1 ||
    governance === 'REVIEW_REQUIRED' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE'
  ) {
    return 'PAUSE_AUTONOMOUS_ADVANCEMENT_AND_REVIEW_FAILURES';
  }

  if (
    state === 'BLOCKED' ||
    governance === 'ESCALATE' ||
    orchestration === 'HOLD_DISPATCH' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return 'HOLD_DISPATCH_AND_REQUIRE_HUMAN_REVIEW';
  }

  if (
    state.indexOf('WARNING') !== -1 ||
    governance === 'MONITOR' ||
    orchestration === 'ALLOW_WITH_MONITORING' ||
    decisioning === 'ADVANCE_WITH_CAUTION'
  ) {
    return 'ALLOW_DOWNSTREAM_PROCESSING_WITH_MONITORING';
  }

  return 'ALLOW_DOWNSTREAM_PROCESSING';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalAutonomousAllowed_(
  decisioningPosture
) {
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return false;
  }

  return true;
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalHumanReviewRequired_(
  governancePosture,
  decisioningPosture
) {
  const governance = String(governancePosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    governance === 'REVIEW_REQUIRED' ||
    governance === 'ESCALATE' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return true;
  }

  return false;
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalMessage_(
  operationalState,
  severity,
  recommendedAction
) {
  return (
    'Autonomous run state signal resolved as ' +
    severity +
    ' from operational state ' +
    operationalState +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalInputRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateSignalRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Ledger_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateSignalProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessorLegacy1190_();
      return sciipWrapLegacyRuntimeResult1190_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1190_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR =
  '1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Signal_ID',
  'Signal_Type',
  'Signal_Category',
  'Signal_Severity',
  'Signal_Status',
  'Signal_Message',
  'Operational_State',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Ledger_Entries_Reviewed',
  'Unique_Processors_Observed',
  'Healthy_Count',
  'Warning_Count',
  'Blocked_Count',
  'Failed_Count',
  'Skipped_Count',
  'Duplicate_Count',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Signal_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessorLegacy1190_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const signalRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalLedgerRowsByDate_(
      signalRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestSignal =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignalLedgerEntry_(
      latestSignal,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateSignalLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignalLedgerEntry_(
  signal,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSSL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    signalId: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_ID']),
    signalType: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Type']),
    signalCategory: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Category']),
    signalSeverity: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Severity']),
    signalStatus: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Status']),
    operationalState: sciipGetRunStateSignalLedgerInputValue_(signal, ['Operational_State']),
    governancePosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Governance_Posture']),
    orchestrationPosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Orchestration_Posture']),
    dashboardPosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Dashboard_Posture']),
    decisioningPosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Decisioning_Posture']),
    recommendedAction: sciipGetRunStateSignalLedgerInputValue_(signal, ['Recommended_Action']),
    autonomousActionAllowed: sciipGetRunStateSignalLedgerInputValue_(signal, ['Autonomous_Action_Allowed']),
    humanReviewRequired: sciipGetRunStateSignalLedgerInputValue_(signal, ['Human_Review_Required']),
    sourceLedgerEntryId: sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Ledger_Entry_ID']),
    sourceBusinessKey: sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Business_Key']),
    sourceSignalBusinessKey: sciipGetRunStateSignalLedgerInputValue_(signal, ['Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_ID']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Type']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Category']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Severity']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Status']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Message']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Operational_State']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Governance_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Orchestration_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Dashboard_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Decisioning_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Recommended_Action']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Autonomous_Action_Allowed']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Human_Review_Required']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Ledger_Entries_Reviewed']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Unique_Processors_Observed']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Healthy_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Warning_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Blocked_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Failed_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Skipped_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Duplicate_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Ledger_Entry_ID']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Business_Key']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalLedgerInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateSignalLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Signal_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalLedgerInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalLedgerInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateSignalLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1200_AutonomousProcessorExecutionRunStateSignalDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateSignalDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1200_AutonomousProcessorExecutionRunStateSignalDigestProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1200_AutonomousProcessorExecutionRunStateSignalDigestProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateSignalDigestProcessorLegacy1200_();
      return sciipWrapLegacyRuntimeResult1200_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1200_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1200_AutonomousProcessorExecutionRunStateSignalDigestProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_PROCESSOR =
  '1200_AutonomousProcessorExecutionRunStateSignalDigestProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_HEADERS = [
  'Digest_ID',
  'Business_Key',
  'Run_State_Date',
  'Digest_Type',
  'Signal_Posture',
  'Digest_Severity',
  'Digest_Status',
  'Digest_Message',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Latest_Signal_ID',
  'Latest_Signal_Category',
  'Latest_Signal_Severity',
  'Latest_Signal_Status',
  'Latest_Operational_State',
  'Latest_Source_Business_Key',
  'Digest_Summary_JSON',
  'Source_Sheet',
  'Source_Date_Column',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalDigestProcessorLegacy1200_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalDigestSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const signalLedgerRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalDigestInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalDigestRowsByDate_(
      signalLedgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalDigestsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const digestRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignalDigest_(
      sourceRows,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(digestRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    signalsReviewed: sourceRows.length,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateSignalDigestSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: digest row.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignalDigest_(
  rows,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const aggregate =
    sciipAggregateAutonomousProcessorExecutionRunStateSignalLedger_(rows);

  const latestSignal =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalDigestInputRow_(
      rows
    );

  const signalPosture =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestPosture_(
      aggregate
    );

  const digestSeverity =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestSeverity_(
      aggregate
    );

  const digestStatus =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestStatus_(
      digestSeverity,
      signalPosture
    );

  const governancePosture =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestGovernancePosture_(
      aggregate,
      latestSignal
    );

  const orchestrationPosture =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestOrchestrationPosture_(
      aggregate,
      latestSignal
    );

  const dashboardPosture =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestDashboardPosture_(
      digestSeverity
    );

  const decisioningPosture =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestDecisioningPosture_(
      aggregate,
      latestSignal
    );

  const recommendedAction =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestRecommendedAction_(
      digestSeverity,
      signalPosture
    );

  const autonomousAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestAutonomousAllowed_(
      aggregate
    );

  const humanReviewRequired =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestHumanReviewRequired_(
      aggregate
    );

  const digestMessage =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestMessage_(
      signalPosture,
      digestSeverity,
      recommendedAction,
      aggregate
    );

  const digestId = 'APRSSD_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    digestType: 'AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST',
    signalPosture: signalPosture,
    digestSeverity: digestSeverity,
    digestStatus: digestStatus,
    governancePosture: governancePosture,
    orchestrationPosture: orchestrationPosture,
    dashboardPosture: dashboardPosture,
    decisioningPosture: decisioningPosture,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    aggregate: aggregate,
    latestSignal: {
      signalId: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_ID']),
      signalCategory: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Category']),
      signalSeverity: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Severity']),
      signalStatus: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Status']),
      operationalState: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Operational_State']),
      sourceBusinessKey: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Source_Business_Key'])
    }
  };

  return [
    digestId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST',
    signalPosture,
    digestSeverity,
    digestStatus,
    digestMessage,
    governancePosture,
    orchestrationPosture,
    dashboardPosture,
    decisioningPosture,
    recommendedAction,
    autonomousAllowed,
    humanReviewRequired,
    aggregate.signalsReviewed,
    aggregate.criticalSignalCount,
    aggregate.highSignalCount,
    aggregate.mediumSignalCount,
    aggregate.lowSignalCount,
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_ID']),
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Category']),
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Severity']),
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Status']),
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Operational_State']),
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Source_Business_Key']),
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_DATE_COLUMN,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Aggregation logic.
 */
function sciipAggregateAutonomousProcessorExecutionRunStateSignalLedger_(rows) {
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;
  let humanReview = 0;
  let autonomousBlocked = 0;

  rows.forEach(function(row) {
    const severity = String(
      sciipGetRunStateSignalDigestInputValue_(row, ['Signal_Severity'])
    ).toUpperCase();

    if (severity === 'CRITICAL') critical++;
    else if (severity === 'HIGH') high++;
    else if (severity === 'MEDIUM') medium++;
    else low++;

    const requiresReview = String(
      sciipGetRunStateSignalDigestInputValue_(row, ['Human_Review_Required'])
    ).toUpperCase();

    const autonomousAllowed = String(
      sciipGetRunStateSignalDigestInputValue_(row, ['Autonomous_Action_Allowed'])
    ).toUpperCase();

    if (requiresReview === 'TRUE') humanReview++;
    if (autonomousAllowed === 'FALSE') autonomousBlocked++;
  });

  return {
    signalsReviewed: rows.length,
    criticalSignalCount: critical,
    highSignalCount: high,
    mediumSignalCount: medium,
    lowSignalCount: low,
    humanReviewRequiredCount: humanReview,
    autonomousBlockedCount: autonomousBlocked
  };
}

/**
 * Resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestPosture_(
  aggregate
) {
  if (aggregate.criticalSignalCount > 0) return 'CRITICAL_SIGNAL_ACTIVE';
  if (aggregate.highSignalCount > 0) return 'HIGH_SIGNAL_ACTIVE';
  if (aggregate.mediumSignalCount > 0) return 'MONITORING_SIGNAL_ACTIVE';
  return 'HEALTHY_SIGNAL_ACTIVE';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestSeverity_(
  aggregate
) {
  if (aggregate.criticalSignalCount > 0) return 'CRITICAL';
  if (aggregate.highSignalCount > 0) return 'HIGH';
  if (aggregate.mediumSignalCount > 0) return 'MEDIUM';
  return 'LOW';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestStatus_(
  severity,
  posture
) {
  if (severity === 'CRITICAL') return 'ACTIVE_CRITICAL_DIGEST';
  if (severity === 'HIGH') return 'ACTIVE_HIGH_DIGEST';
  if (severity === 'MEDIUM') return 'ACTIVE_MONITOR_DIGEST';
  return 'ACTIVE_HEALTHY_DIGEST';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestGovernancePosture_(
  aggregate,
  latestSignal
) {
  if (aggregate.criticalSignalCount > 0) return 'REVIEW_REQUIRED';
  if (aggregate.highSignalCount > 0) return 'ESCALATE';
  if (aggregate.mediumSignalCount > 0) return 'MONITOR';

  return sciipGetRunStateSignalDigestInputValue_(latestSignal, [
    'Governance_Posture'
  ]) || 'NORMAL';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestOrchestrationPosture_(
  aggregate,
  latestSignal
) {
  if (aggregate.criticalSignalCount > 0) return 'PAUSE_PROMOTION';
  if (aggregate.highSignalCount > 0) return 'HOLD_DISPATCH';
  if (aggregate.mediumSignalCount > 0) return 'ALLOW_WITH_MONITORING';

  return sciipGetRunStateSignalDigestInputValue_(latestSignal, [
    'Orchestration_Posture'
  ]) || 'ALLOW';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestDashboardPosture_(
  severity
) {
  if (severity === 'CRITICAL') return 'SHOW_CRITICAL';
  if (severity === 'HIGH') return 'SHOW_BLOCKED';
  if (severity === 'MEDIUM') return 'SHOW_WARNING';
  return 'SHOW_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestDecisioningPosture_(
  aggregate,
  latestSignal
) {
  if (aggregate.criticalSignalCount > 0) return 'DO_NOT_AUTONOMOUSLY_ADVANCE';
  if (aggregate.highSignalCount > 0) return 'REQUIRE_HUMAN_REVIEW';
  if (aggregate.mediumSignalCount > 0) return 'ADVANCE_WITH_CAUTION';

  return sciipGetRunStateSignalDigestInputValue_(latestSignal, [
    'Decisioning_Posture'
  ]) || 'ADVANCE';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestRecommendedAction_(
  severity,
  posture
) {
  if (severity === 'CRITICAL') {
    return 'PAUSE_AUTONOMOUS_ADVANCEMENT_AND_REVIEW_CRITICAL_SIGNALS';
  }

  if (severity === 'HIGH') {
    return 'HOLD_DISPATCH_AND_REVIEW_HIGH_SEVERITY_SIGNALS';
  }

  if (severity === 'MEDIUM') {
    return 'ALLOW_DOWNSTREAM_PROCESSING_WITH_SIGNAL_MONITORING';
  }

  return 'ALLOW_DOWNSTREAM_PROCESSING';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestAutonomousAllowed_(
  aggregate
) {
  return aggregate.autonomousBlockedCount === 0;
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestHumanReviewRequired_(
  aggregate
) {
  return aggregate.humanReviewRequiredCount > 0;
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestMessage_(
  signalPosture,
  digestSeverity,
  recommendedAction,
  aggregate
) {
  return (
    'Run state signal digest resolved as ' +
    digestSeverity +
    ' with posture ' +
    signalPosture +
    '. Signals reviewed: ' +
    aggregate.signalsReviewed +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalDigestInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipFilterAutonomousProcessorExecutionRunStateSignalDigestRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalDigestInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Signal_Date',
      'Ledger_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalDigestDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalDigestInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalDigestInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalDigestInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalDigestInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalDigestDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateSignalDigestProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalDigestProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessorLegacy1210_();
      return sciipWrapLegacyRuntimeResult1210_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1210_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR =
  '1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Digest_ID',
  'Digest_Type',
  'Signal_Posture',
  'Digest_Severity',
  'Digest_Status',
  'Digest_Message',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Latest_Signal_ID',
  'Latest_Signal_Category',
  'Latest_Signal_Severity',
  'Latest_Signal_Status',
  'Latest_Operational_State',
  'Latest_Source_Business_Key',
  'Source_Digest_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessorLegacy1210_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalDigestLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const digestRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalDigestLedgerRowsByDate_(
      digestRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestDigest =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignalDigestLedgerEntry_(
      latestDigest,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateSignalDigestLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignalDigestLedgerEntry_(
  digest,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSSDL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    digestId: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_ID']),
    digestType: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Type']),
    signalPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signal_Posture']),
    digestSeverity: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Severity']),
    digestStatus: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Status']),
    governancePosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Governance_Posture']),
    orchestrationPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Orchestration_Posture']),
    dashboardPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Dashboard_Posture']),
    decisioningPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Decisioning_Posture']),
    recommendedAction: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Recommended_Action']),
    autonomousActionAllowed: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Autonomous_Action_Allowed']),
    humanReviewRequired: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Human_Review_Required']),
    signalsReviewed: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signals_Reviewed']),
    sourceDigestBusinessKey: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_ID']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Type']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signal_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Severity']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Status']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Message']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Governance_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Orchestration_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Dashboard_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Decisioning_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Recommended_Action']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Autonomous_Action_Allowed']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Human_Review_Required']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signals_Reviewed']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Critical_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['High_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Medium_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Low_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_ID']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_Category']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_Severity']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_Status']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Operational_State']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Source_Business_Key']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateSignalDigestLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalDigestLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Signal_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalDigestLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalDigestLedgerInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalDigestLedgerInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalDigestLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalDigestLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessorLegacy1220_();
      return sciipWrapLegacyRuntimeResult1220_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1220_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR =
  '1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_HEADERS = [
  'Command_Center_Record_ID',
  'Business_Key',
  'Run_State_Date',
  'Command_Center_Type',
  'Command_Center_Status',
  'Display_Severity',
  'Display_Posture',
  'Display_Message',
  'Dashboard_Posture',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Latest_Signal_ID',
  'Latest_Signal_Category',
  'Latest_Signal_Severity',
  'Latest_Signal_Status',
  'Latest_Operational_State',
  'Source_Ledger_Entry_ID',
  'Source_Digest_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Command_Center_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessorLegacy1220_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateCommandCenterRecordsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateCommandCenterInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateCommandCenterRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateCommandCenterRecordsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterInputRow_(
      sourceRows
    );

  const commandCenterRow =
    sciipBuildAutonomousProcessorExecutionRunStateCommandCenterRecord_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(commandCenterRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateCommandCenterRecordsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: command-center record.
 */
function sciipBuildAutonomousProcessorExecutionRunStateCommandCenterRecord_(
  ledgerRow,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const displaySeverity =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Digest_Severity']);

  const signalPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Signal_Posture']);

  const dashboardPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Dashboard_Posture']);

  const governancePosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Governance_Posture']);

  const orchestrationPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Orchestration_Posture']);

  const decisioningPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Decisioning_Posture']);

  const recommendedAction =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Recommended_Action']);

  const commandCenterStatus =
    sciipResolveAutonomousProcessorExecutionRunStateCommandCenterStatus_(
      displaySeverity,
      governancePosture,
      decisioningPosture
    );

  const displayPosture =
    sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayPosture_(
      displaySeverity,
      signalPosture
    );

  const displayMessage =
    sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayMessage_(
      commandCenterStatus,
      displaySeverity,
      signalPosture,
      recommendedAction
    );

  const recordId = 'APRSCC_' + Utilities.getUuid();

  const commandCenterJson = {
    runStateDate: resolvedRunStateDate,
    commandCenterType: 'AUTONOMOUS_RUN_STATE_COMMAND_CENTER',
    commandCenterStatus: commandCenterStatus,
    displaySeverity: displaySeverity,
    displayPosture: displayPosture,
    dashboardPosture: dashboardPosture,
    governancePosture: governancePosture,
    orchestrationPosture: orchestrationPosture,
    decisioningPosture: decisioningPosture,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Autonomous_Action_Allowed'
    ]),
    humanReviewRequired: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Human_Review_Required'
    ]),
    sourceLedgerEntryId: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Ledger_Entry_ID'
    ]),
    sourceDigestId: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Digest_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Business_Key'
    ])
  };

  return [
    recordId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_COMMAND_CENTER',
    commandCenterStatus,
    displaySeverity,
    displayPosture,
    displayMessage,
    dashboardPosture,
    governancePosture,
    orchestrationPosture,
    decisioningPosture,
    recommendedAction,
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Signals_Reviewed']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Critical_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['High_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Medium_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Low_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_ID']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_Category']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_Severity']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_Status']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Operational_State']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Ledger_Entry_ID']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Digest_ID']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN,
    JSON.stringify(commandCenterJson),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Command-center resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateCommandCenterStatus_(
  displaySeverity,
  governancePosture,
  decisioningPosture
) {
  const severity = String(displaySeverity || '').toUpperCase();
  const governance = String(governancePosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    severity === 'CRITICAL' ||
    governance === 'REVIEW_REQUIRED' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE'
  ) {
    return 'COMMAND_CENTER_CRITICAL';
  }

  if (
    severity === 'HIGH' ||
    governance === 'ESCALATE' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return 'COMMAND_CENTER_ATTENTION_REQUIRED';
  }

  if (severity === 'MEDIUM') {
    return 'COMMAND_CENTER_MONITOR';
  }

  return 'COMMAND_CENTER_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayPosture_(
  displaySeverity,
  signalPosture
) {
  const severity = String(displaySeverity || '').toUpperCase();

  if (severity === 'CRITICAL') return 'Critical autonomous run state signal active';
  if (severity === 'HIGH') return 'High-priority autonomous run state signal active';
  if (severity === 'MEDIUM') return 'Autonomous run state requires monitoring';

  return 'Autonomous run state healthy';
}

function sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayMessage_(
  commandCenterStatus,
  displaySeverity,
  signalPosture,
  recommendedAction
) {
  return (
    commandCenterStatus +
    ': Run state signal digest is ' +
    displaySeverity +
    ' with posture ' +
    signalPosture +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateCommandCenterInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateCommandCenterRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateCommandCenterInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Signal_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateCommandCenterDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateCommandCenterInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateCommandCenterInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateCommandCenterInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateCommandCenterDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateCommandCenterProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateCommandCenterProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessorLegacy1230_();
      return sciipWrapLegacyRuntimeResult1230_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1230_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR =
  '1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Command_Center_Record_ID',
  'Command_Center_Type',
  'Command_Center_Status',
  'Display_Severity',
  'Display_Posture',
  'Display_Message',
  'Dashboard_Posture',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Latest_Signal_ID',
  'Latest_Signal_Category',
  'Latest_Signal_Severity',
  'Latest_Signal_Status',
  'Latest_Operational_State',
  'Source_Ledger_Entry_ID',
  'Source_Digest_ID',
  'Source_Command_Center_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessorLegacy1230_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateCommandCenterLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const commandCenterRows =
    sciipReadAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateCommandCenterLedgerRowsByDate_(
      commandCenterRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateCommandCenterLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestCommandCenterRecord =
    sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateCommandCenterLedgerEntry_(
      latestCommandCenterRecord,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateCommandCenterLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateCommandCenterLedgerEntry_(
  record,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSCCL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    commandCenterRecordId: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Record_ID'
    ]),
    commandCenterType: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Type'
    ]),
    commandCenterStatus: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Status'
    ]),
    displaySeverity: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Severity'
    ]),
    displayPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Posture'
    ]),
    dashboardPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Dashboard_Posture'
    ]),
    governancePosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Governance_Posture'
    ]),
    orchestrationPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Orchestration_Posture'
    ]),
    decisioningPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Decisioning_Posture'
    ]),
    recommendedAction: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Recommended_Action'
    ]),
    autonomousActionAllowed: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Autonomous_Action_Allowed'
    ]),
    humanReviewRequired: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Human_Review_Required'
    ]),
    sourceCommandCenterBusinessKey: sciipGetRunStateCommandCenterLedgerInputValue_(
      record,
      ['Business_Key']
    ),
    sourceBusinessKey: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Business_Key'
    ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Record_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Type'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Status'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Severity'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Message'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Dashboard_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Governance_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Decisioning_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Recommended_Action'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Signals_Reviewed'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'High_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Medium_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Low_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_Category'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_Severity'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_Status'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Operational_State'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Digest_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Business_Key'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Business_Key'
    ]),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateCommandCenterLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateCommandCenterLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Command_Center_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateCommandCenterLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateCommandCenterLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateCommandCenterLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateCommandCenterLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateCommandCenterLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1240_AutonomousProcessorExecutionRunStateExecutiveSummaryProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1240_AutonomousProcessorExecutionRunStateExecutiveSummaryProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1240_AutonomousProcessorExecutionRunStateExecutiveSummaryProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryProcessorLegacy1240_();
      return sciipWrapLegacyRuntimeResult1240_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1240_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1240_AutonomousProcessorExecutionRunStateExecutiveSummaryProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_PROCESSOR =
  '1240_AutonomousProcessorExecutionRunStateExecutiveSummaryProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_HEADERS = [
  'Executive_Summary_ID',
  'Business_Key',
  'Run_State_Date',
  'Summary_Type',
  'Executive_Status',
  'Executive_Severity',
  'Executive_Headline',
  'Executive_Summary',
  'Leadership_Interpretation',
  'Governance_Interpretation',
  'Operational_Risk',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Command_Center_Status',
  'Display_Severity',
  'Display_Posture',
  'Dashboard_Posture',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Command_Center_Record_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Executive_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryProcessorLegacy1240_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateExecutiveSummarySheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateExecutiveSummariesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateExecutiveSummaryInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateExecutiveSummaryRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateExecutiveSummariesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateExecutiveSummaryInputRow_(
      sourceRows
    );

  const summaryRow =
    sciipBuildAutonomousProcessorExecutionRunStateExecutiveSummary_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(summaryRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateExecutiveSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateExecutiveSummarySheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: executive summary.
 */
function sciipBuildAutonomousProcessorExecutionRunStateExecutiveSummary_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const executiveSeverity =
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Display_Severity']);

  const commandCenterStatus =
    sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Command_Center_Status'
    ]);

  const recommendedAction =
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Recommended_Action']);

  const humanReviewRequired =
    sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Human_Review_Required'
    ]);

  const autonomousAllowed =
    sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Autonomous_Action_Allowed'
    ]);

  const executiveStatus =
    sciipResolveAutonomousProcessorExecutionRunStateExecutiveStatus_(
      executiveSeverity,
      commandCenterStatus
    );

  const headline =
    sciipResolveAutonomousProcessorExecutionRunStateExecutiveHeadline_(
      executiveSeverity,
      executiveStatus
    );

  const executiveSummary =
    sciipResolveAutonomousProcessorExecutionRunStateExecutiveSummaryText_(
      executiveSeverity,
      commandCenterStatus,
      recommendedAction,
      humanReviewRequired,
      autonomousAllowed
    );

  const leadershipInterpretation =
    sciipResolveAutonomousProcessorExecutionRunStateLeadershipInterpretation_(
      executiveSeverity,
      humanReviewRequired,
      autonomousAllowed
    );

  const governanceInterpretation =
    sciipResolveAutonomousProcessorExecutionRunStateGovernanceInterpretation_(
      row
    );

  const operationalRisk =
    sciipResolveAutonomousProcessorExecutionRunStateOperationalRisk_(
      executiveSeverity
    );

  const summaryId = 'APRSES_' + Utilities.getUuid();

  const summaryJson = {
    runStateDate: resolvedRunStateDate,
    summaryType: 'AUTONOMOUS_RUN_STATE_EXECUTIVE_SUMMARY',
    executiveStatus: executiveStatus,
    executiveSeverity: executiveSeverity,
    executiveHeadline: headline,
    executiveSummary: executiveSummary,
    leadershipInterpretation: leadershipInterpretation,
    governanceInterpretation: governanceInterpretation,
    operationalRisk: operationalRisk,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceLedgerEntryId: sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    summaryId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_EXECUTIVE_SUMMARY',
    executiveStatus,
    executiveSeverity,
    headline,
    executiveSummary,
    leadershipInterpretation,
    governanceInterpretation,
    operationalRisk,
    recommendedAction,
    autonomousAllowed,
    humanReviewRequired,
    commandCenterStatus,
    executiveSeverity,
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Display_Posture']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Dashboard_Posture']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Command_Center_Record_ID'
    ]),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_DATE_COLUMN,
    JSON.stringify(summaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Executive resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateExecutiveStatus_(
  severity,
  commandCenterStatus
) {
  const sev = String(severity || '').toUpperCase();
  const status = String(commandCenterStatus || '').toUpperCase();

  if (sev === 'CRITICAL' || status.indexOf('CRITICAL') !== -1) {
    return 'EXECUTIVE_ATTENTION_REQUIRED';
  }

  if (sev === 'HIGH' || status.indexOf('ATTENTION') !== -1) {
    return 'EXECUTIVE_REVIEW_RECOMMENDED';
  }

  if (sev === 'MEDIUM' || status.indexOf('MONITOR') !== -1) {
    return 'EXECUTIVE_MONITOR';
  }

  return 'EXECUTIVE_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateExecutiveHeadline_(
  severity,
  executiveStatus
) {
  const sev = String(severity || '').toUpperCase();

  if (sev === 'CRITICAL') {
    return 'Autonomous run state requires immediate executive attention.';
  }

  if (sev === 'HIGH') {
    return 'Autonomous run state requires governance review before advancement.';
  }

  if (sev === 'MEDIUM') {
    return 'Autonomous run state is operational with monitoring conditions.';
  }

  return 'Autonomous run state is healthy and available for downstream processing.';
}

function sciipResolveAutonomousProcessorExecutionRunStateExecutiveSummaryText_(
  severity,
  commandCenterStatus,
  recommendedAction,
  humanReviewRequired,
  autonomousAllowed
) {
  return (
    'The autonomous run state command center resolved a ' +
    severity +
    ' status under ' +
    commandCenterStatus +
    '. Recommended action: ' +
    recommendedAction +
    '. Autonomous action allowed: ' +
    autonomousAllowed +
    '. Human review required: ' +
    humanReviewRequired +
    '.'
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateLeadershipInterpretation_(
  severity,
  humanReviewRequired,
  autonomousAllowed
) {
  const sev = String(severity || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (sev === 'CRITICAL' || allowed === 'FALSE') {
    return 'Leadership should treat the autonomous execution run state as constrained until the underlying signal is reviewed.';
  }

  if (review === 'TRUE' || sev === 'HIGH') {
    return 'Leadership should review the run state before allowing additional autonomous promotion.';
  }

  if (sev === 'MEDIUM') {
    return 'Leadership can allow continued operation while monitoring the signal trail.';
  }

  return 'Leadership can treat the autonomous run state as stable for this processing date.';
}

function sciipResolveAutonomousProcessorExecutionRunStateGovernanceInterpretation_(
  row
) {
  const governance =
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Governance_Posture']);

  const decisioning =
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Decisioning_Posture']);

  return (
    'Governance posture is ' +
    governance +
    '; decisioning posture is ' +
    decisioning +
    '.'
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateOperationalRisk_(
  severity
) {
  const sev = String(severity || '').toUpperCase();

  if (sev === 'CRITICAL') return 'HIGH_OPERATIONAL_RISK';
  if (sev === 'HIGH') return 'ELEVATED_OPERATIONAL_RISK';
  if (sev === 'MEDIUM') return 'MONITORED_OPERATIONAL_RISK';

  return 'LOW_OPERATIONAL_RISK';
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateExecutiveSummaryInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateExecutiveSummaryRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateExecutiveSummaryInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Command_Center_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateExecutiveSummaryDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateExecutiveSummaryInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateExecutiveSummaryInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateExecutiveSummaryInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateExecutiveSummaryInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateExecutiveSummaryDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateExecutiveSummaryProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateExecutiveSummaryProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessorLegacy1250_();
      return sciipWrapLegacyRuntimeResult1250_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1250_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR =
  '1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Executive_Summary_ID',
  'Summary_Type',
  'Executive_Status',
  'Executive_Severity',
  'Executive_Headline',
  'Executive_Summary',
  'Leadership_Interpretation',
  'Governance_Interpretation',
  'Operational_Risk',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Command_Center_Status',
  'Display_Severity',
  'Display_Posture',
  'Dashboard_Posture',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Command_Center_Record_ID',
  'Source_Ledger_Entry_ID',
  'Source_Executive_Summary_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessorLegacy1250_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const summaryRows =
    sciipReadAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerRowsByDate_(
      summaryRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestSummary =
    sciipResolveLatestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntry_(
      latestSummary,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntry_(
  summary,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSESL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    executiveSummaryId: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Summary_ID']
    ),
    summaryType: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Summary_Type']
    ),
    executiveStatus: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Status']
    ),
    executiveSeverity: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Severity']
    ),
    executiveHeadline: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Headline']
    ),
    operationalRisk: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Operational_Risk']
    ),
    recommendedAction: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Recommended_Action']
    ),
    autonomousActionAllowed: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Autonomous_Action_Allowed']
    ),
    humanReviewRequired: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Human_Review_Required']
    ),
    sourceExecutiveSummaryBusinessKey:
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
        'Business_Key'
      ]),
    sourceBusinessKey:
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
        'Source_Business_Key'
      ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Summary_ID'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Summary_Type'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Status'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Severity'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Headline'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Summary'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Leadership_Interpretation'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Governance_Interpretation'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Operational_Risk'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Recommended_Action'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Command_Center_Status'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Display_Severity'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Display_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Dashboard_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Governance_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Decisioning_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Signals_Reviewed'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'High_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Medium_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Low_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Source_Command_Center_Record_ID'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Business_Key'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Source_Business_Key'
    ]),
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateExecutiveSummaryLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Summary_Date',
      'Executive_Summary_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateExecutiveSummaryLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateExecutiveSummaryLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateExecutiveSummaryLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateDailyBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateDailyBriefProcessorLegacy1260_();
      return sciipWrapLegacyRuntimeResult1260_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1260_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR =
  '1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_HEADERS = [
  'Daily_Brief_ID',
  'Business_Key',
  'Run_State_Date',
  'Brief_Type',
  'Brief_Status',
  'Brief_Severity',
  'Brief_Title',
  'Brief_Text',
  'Executive_Headline',
  'Executive_Status',
  'Executive_Severity',
  'Operational_Risk',
  'Leadership_Interpretation',
  'Governance_Interpretation',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Command_Center_Status',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Executive_Summary_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Daily_Brief_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateDailyBriefProcessorLegacy1260_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDailyBriefsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateDailyBriefInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateDailyBriefRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDailyBriefsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefInputRow_(
      sourceRows
    );

  const dailyBriefRow =
    sciipBuildAutonomousProcessorExecutionRunStateDailyBrief_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(dailyBriefRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: daily brief.
 */
function sciipBuildAutonomousProcessorExecutionRunStateDailyBrief_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const executiveStatus =
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Status']);

  const executiveSeverity =
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Severity']);

  const operationalRisk =
    sciipGetRunStateDailyBriefInputValue_(row, ['Operational_Risk']);

  const recommendedAction =
    sciipGetRunStateDailyBriefInputValue_(row, ['Recommended_Action']);

  const humanReviewRequired =
    sciipGetRunStateDailyBriefInputValue_(row, ['Human_Review_Required']);

  const autonomousAllowed =
    sciipGetRunStateDailyBriefInputValue_(row, ['Autonomous_Action_Allowed']);

  const briefStatus =
    sciipResolveAutonomousProcessorExecutionRunStateDailyBriefStatus_(
      executiveStatus,
      executiveSeverity
    );

  const briefTitle =
    sciipResolveAutonomousProcessorExecutionRunStateDailyBriefTitle_(
      executiveSeverity
    );

  const briefText =
    sciipResolveAutonomousProcessorExecutionRunStateDailyBriefText_(
      row,
      resolvedRunStateDate,
      recommendedAction,
      humanReviewRequired,
      autonomousAllowed
    );

  const dailyBriefId = 'APRSDB_' + Utilities.getUuid();

  const briefJson = {
    runStateDate: resolvedRunStateDate,
    briefType: 'AUTONOMOUS_RUN_STATE_DAILY_BRIEF',
    briefStatus: briefStatus,
    briefSeverity: executiveSeverity,
    briefTitle: briefTitle,
    briefText: briefText,
    executiveStatus: executiveStatus,
    executiveSeverity: executiveSeverity,
    operationalRisk: operationalRisk,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceExecutiveSummaryId: sciipGetRunStateDailyBriefInputValue_(row, [
      'Executive_Summary_ID'
    ]),
    sourceLedgerEntryId: sciipGetRunStateDailyBriefInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateDailyBriefInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    dailyBriefId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_DAILY_BRIEF',
    briefStatus,
    executiveSeverity,
    briefTitle,
    briefText,
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Headline']),
    executiveStatus,
    executiveSeverity,
    operationalRisk,
    sciipGetRunStateDailyBriefInputValue_(row, [
      'Leadership_Interpretation'
    ]),
    sciipGetRunStateDailyBriefInputValue_(row, [
      'Governance_Interpretation'
    ]),
    recommendedAction,
    autonomousAllowed,
    humanReviewRequired,
    sciipGetRunStateDailyBriefInputValue_(row, ['Command_Center_Status']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Summary_ID']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN,
    JSON.stringify(briefJson),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Brief resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateDailyBriefStatus_(
  executiveStatus,
  executiveSeverity
) {
  const status = String(executiveStatus || '').toUpperCase();
  const severity = String(executiveSeverity || '').toUpperCase();

  if (severity === 'CRITICAL' || status.indexOf('ATTENTION_REQUIRED') !== -1) {
    return 'DAILY_BRIEF_CRITICAL';
  }

  if (severity === 'HIGH' || status.indexOf('REVIEW') !== -1) {
    return 'DAILY_BRIEF_REVIEW';
  }

  if (severity === 'MEDIUM' || status.indexOf('MONITOR') !== -1) {
    return 'DAILY_BRIEF_MONITOR';
  }

  return 'DAILY_BRIEF_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateDailyBriefTitle_(
  executiveSeverity
) {
  const severity = String(executiveSeverity || '').toUpperCase();

  if (severity === 'CRITICAL') {
    return 'Daily Brief: Autonomous Run State Requires Immediate Attention';
  }

  if (severity === 'HIGH') {
    return 'Daily Brief: Autonomous Run State Requires Governance Review';
  }

  if (severity === 'MEDIUM') {
    return 'Daily Brief: Autonomous Run State Requires Monitoring';
  }

  return 'Daily Brief: Autonomous Run State Healthy';
}

function sciipResolveAutonomousProcessorExecutionRunStateDailyBriefText_(
  row,
  resolvedRunStateDate,
  recommendedAction,
  humanReviewRequired,
  autonomousAllowed
) {
  const headline =
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Headline']);

  const leadershipInterpretation =
    sciipGetRunStateDailyBriefInputValue_(row, [
      'Leadership_Interpretation'
    ]);

  const operationalRisk =
    sciipGetRunStateDailyBriefInputValue_(row, ['Operational_Risk']);

  return (
    'For ' +
    resolvedRunStateDate +
    ', ' +
    headline +
    ' Operational risk: ' +
    operationalRisk +
    '. ' +
    leadershipInterpretation +
    ' Recommended action: ' +
    recommendedAction +
    '. Autonomous action allowed: ' +
    autonomousAllowed +
    '. Human review required: ' +
    humanReviewRequired +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateDailyBriefInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateDailyBriefRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateDailyBriefInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Brief_Date',
      'Daily_Brief_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateDailyBriefDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateDailyBriefInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateDailyBriefInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateDailyBriefInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateDailyBriefDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateDailyBriefProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDailyBriefProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDailyBriefProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessorLegacy1270_();
      return sciipWrapLegacyRuntimeResult1270_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1270_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR =
  '1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Daily_Brief_ID',
  'Brief_Type',
  'Brief_Status',
  'Brief_Severity',
  'Brief_Title',
  'Brief_Text',
  'Executive_Headline',
  'Executive_Status',
  'Executive_Severity',
  'Operational_Risk',
  'Leadership_Interpretation',
  'Governance_Interpretation',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Command_Center_Status',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Executive_Summary_ID',
  'Source_Ledger_Entry_ID',
  'Source_Daily_Brief_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessorLegacy1270_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDailyBriefLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const briefRows =
    sciipReadAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateDailyBriefLedgerRowsByDate_(
      briefRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDailyBriefLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestBrief =
    sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateDailyBriefLedgerEntry_(
      latestBrief,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDailyBriefLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateDailyBriefLedgerEntry_(
  brief,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSDBL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    dailyBriefId: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Daily_Brief_ID'
    ]),
    briefType: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Type'
    ]),
    briefStatus: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Status'
    ]),
    briefSeverity: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Severity'
    ]),
    briefTitle: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Title'
    ]),
    executiveStatus: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Executive_Status'
    ]),
    operationalRisk: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Operational_Risk'
    ]),
    recommendedAction: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Recommended_Action'
    ]),
    autonomousActionAllowed: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Autonomous_Action_Allowed'
    ]),
    humanReviewRequired: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Human_Review_Required'
    ]),
    sourceDailyBriefBusinessKey: sciipGetRunStateDailyBriefLedgerInputValue_(
      brief,
      ['Business_Key']
    ),
    sourceBusinessKey: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Source_Business_Key'
    ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Daily_Brief_ID']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Type']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Status']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Severity']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Title']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Text']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Executive_Headline']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Executive_Status']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Executive_Severity']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Operational_Risk']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Leadership_Interpretation'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Governance_Interpretation'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Recommended_Action']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Command_Center_Status'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Governance_Posture']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Decisioning_Posture']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Signals_Reviewed']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['High_Signal_Count']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Medium_Signal_Count']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Low_Signal_Count']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Source_Executive_Summary_ID'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Business_Key']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Source_Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateDailyBriefLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateDailyBriefLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Brief_Date',
      'Daily_Brief_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateDailyBriefLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateDailyBriefLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateDailyBriefLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateDailyBriefLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateDailyBriefLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1280_AutonomousProcessorExecutionRunStateFinalizationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateFinalizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1280_AutonomousProcessorExecutionRunStateFinalizationProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1280_AutonomousProcessorExecutionRunStateFinalizationProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateFinalizationProcessorLegacy1280_();
      return sciipWrapLegacyRuntimeResult1280_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1280_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1280_AutonomousProcessorExecutionRunStateFinalizationProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR =
  '1280_AutonomousProcessorExecutionRunStateFinalizationProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_HEADERS = [
  'Finalization_ID',
  'Business_Key',
  'Run_State_Date',
  'Finalization_Type',
  'Finalization_Status',
  'Finalization_Severity',
  'Finalization_Message',
  'Finalization_Decision',
  'Run_State_Closed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Brief_Status',
  'Brief_Severity',
  'Brief_Title',
  'Brief_Text',
  'Executive_Status',
  'Executive_Severity',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Daily_Brief_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Finalization_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateFinalizationProcessorLegacy1280_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateFinalizationSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateFinalizationsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateFinalizationInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateFinalizationRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateFinalizationsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationInputRow_(
      sourceRows
    );

  const finalizationRow =
    sciipBuildAutonomousProcessorExecutionRunStateFinalization_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(finalizationRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateFinalizationsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateFinalizationSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: finalization record.
 */
function sciipBuildAutonomousProcessorExecutionRunStateFinalization_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const briefStatus =
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Status']);

  const briefSeverity =
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Severity']);

  const autonomousAllowed =
    sciipGetRunStateFinalizationInputValue_(row, [
      'Autonomous_Action_Allowed'
    ]);

  const humanReviewRequired =
    sciipGetRunStateFinalizationInputValue_(row, [
      'Human_Review_Required'
    ]);

  const recommendedAction =
    sciipGetRunStateFinalizationInputValue_(row, ['Recommended_Action']);

  const finalizationStatus =
    sciipResolveAutonomousProcessorExecutionRunStateFinalizationStatus_(
      briefStatus,
      briefSeverity,
      humanReviewRequired,
      autonomousAllowed
    );

  const finalizationDecision =
    sciipResolveAutonomousProcessorExecutionRunStateFinalizationDecision_(
      briefSeverity,
      humanReviewRequired,
      autonomousAllowed
    );

  const runStateClosed =
    sciipResolveAutonomousProcessorExecutionRunStateClosed_(
      finalizationStatus
    );

  const readyForDownstreamUse =
    sciipResolveAutonomousProcessorExecutionRunStateReadyForDownstreamUse_(
      finalizationDecision
    );

  const readyForGovernance = true;
  const readyForDashboard = true;

  const readyForAutonomousDecisioning =
    sciipResolveAutonomousProcessorExecutionRunStateReadyForAutonomousDecisioning_(
      autonomousAllowed,
      humanReviewRequired
    );

  const finalizationMessage =
    sciipResolveAutonomousProcessorExecutionRunStateFinalizationMessage_(
      resolvedRunStateDate,
      finalizationStatus,
      finalizationDecision,
      recommendedAction
    );

  const finalizationId = 'APRSF_' + Utilities.getUuid();

  const finalizationJson = {
    runStateDate: resolvedRunStateDate,
    finalizationType: 'AUTONOMOUS_RUN_STATE_FINALIZATION',
    finalizationStatus: finalizationStatus,
    finalizationSeverity: briefSeverity,
    finalizationDecision: finalizationDecision,
    runStateClosed: runStateClosed,
    readyForDownstreamUse: readyForDownstreamUse,
    readyForGovernance: readyForGovernance,
    readyForDashboard: readyForDashboard,
    readyForAutonomousDecisioning: readyForAutonomousDecisioning,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    recommendedAction: recommendedAction,
    sourceDailyBriefId: sciipGetRunStateFinalizationInputValue_(row, [
      'Daily_Brief_ID'
    ]),
    sourceLedgerEntryId: sciipGetRunStateFinalizationInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateFinalizationInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    finalizationId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_FINALIZATION',
    finalizationStatus,
    briefSeverity,
    finalizationMessage,
    finalizationDecision,
    runStateClosed,
    readyForDownstreamUse,
    readyForGovernance,
    readyForDashboard,
    readyForAutonomousDecisioning,
    autonomousAllowed,
    humanReviewRequired,
    briefStatus,
    briefSeverity,
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Title']),
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Text']),
    sciipGetRunStateFinalizationInputValue_(row, ['Executive_Status']),
    sciipGetRunStateFinalizationInputValue_(row, ['Executive_Severity']),
    sciipGetRunStateFinalizationInputValue_(row, ['Operational_Risk']),
    recommendedAction,
    sciipGetRunStateFinalizationInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateFinalizationInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateFinalizationInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateFinalizationInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateFinalizationInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['Daily_Brief_ID']),
    sciipGetRunStateFinalizationInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateFinalizationInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN,
    JSON.stringify(finalizationJson),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Finalization resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateFinalizationStatus_(
  briefStatus,
  briefSeverity,
  humanReviewRequired,
  autonomousAllowed
) {
  const status = String(briefStatus || '').toUpperCase();
  const severity = String(briefSeverity || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (
    severity === 'CRITICAL' ||
    status.indexOf('CRITICAL') !== -1 ||
    allowed === 'FALSE'
  ) {
    return 'FINALIZED_WITH_CONTROL_CONSTRAINT';
  }

  if (
    severity === 'HIGH' ||
    status.indexOf('REVIEW') !== -1 ||
    review === 'TRUE'
  ) {
    return 'FINALIZED_WITH_GOVERNANCE_REVIEW';
  }

  if (severity === 'MEDIUM' || status.indexOf('MONITOR') !== -1) {
    return 'FINALIZED_WITH_MONITORING';
  }

  return 'FINALIZED_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateFinalizationDecision_(
  briefSeverity,
  humanReviewRequired,
  autonomousAllowed
) {
  const severity = String(briefSeverity || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (severity === 'CRITICAL' || allowed === 'FALSE') {
    return 'DO_NOT_ADVANCE_AUTONOMOUSLY';
  }

  if (severity === 'HIGH' || review === 'TRUE') {
    return 'REQUIRE_GOVERNANCE_REVIEW_BEFORE_ADVANCEMENT';
  }

  if (severity === 'MEDIUM') {
    return 'ADVANCE_WITH_MONITORING';
  }

  return 'ADVANCE';
}

function sciipResolveAutonomousProcessorExecutionRunStateClosed_(
  finalizationStatus
) {
  return String(finalizationStatus || '').indexOf('FINALIZED') === 0;
}

function sciipResolveAutonomousProcessorExecutionRunStateReadyForDownstreamUse_(
  finalizationDecision
) {
  const decision = String(finalizationDecision || '').toUpperCase();

  return decision !== 'DO_NOT_ADVANCE_AUTONOMOUSLY';
}

function sciipResolveAutonomousProcessorExecutionRunStateReadyForAutonomousDecisioning_(
  autonomousAllowed,
  humanReviewRequired
) {
  const allowed = String(autonomousAllowed || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();

  return allowed !== 'FALSE' && review !== 'TRUE';
}

function sciipResolveAutonomousProcessorExecutionRunStateFinalizationMessage_(
  resolvedRunStateDate,
  finalizationStatus,
  finalizationDecision,
  recommendedAction
) {
  return (
    'Run state finalization completed for ' +
    resolvedRunStateDate +
    ' with status ' +
    finalizationStatus +
    '. Finalization decision: ' +
    finalizationDecision +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateFinalizationInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateFinalizationRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateFinalizationInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Brief_Date',
      'Daily_Brief_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateFinalizationDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateFinalizationInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateFinalizationInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateFinalizationInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateFinalizationDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateFinalizationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateFinalizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateFinalizationProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessorLegacy1290_();
      return sciipWrapLegacyRuntimeResult1290_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1290_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR =
  '1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Finalization_ID',
  'Finalization_Type',
  'Finalization_Status',
  'Finalization_Severity',
  'Finalization_Message',
  'Finalization_Decision',
  'Run_State_Closed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Brief_Status',
  'Brief_Severity',
  'Brief_Title',
  'Brief_Text',
  'Executive_Status',
  'Executive_Severity',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Daily_Brief_ID',
  'Source_Ledger_Entry_ID',
  'Source_Finalization_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessorLegacy1290_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateFinalizationLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateFinalizationLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const finalizationRows =
    sciipReadAutonomousProcessorExecutionRunStateFinalizationLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateFinalizationLedgerRowsByDate_(
      finalizationRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateFinalizationLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestFinalization =
    sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateFinalizationLedgerEntry_(
      latestFinalization,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateFinalizationLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateFinalizationLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateFinalizationLedgerEntry_(
  finalization,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSFL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    finalizationId: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_ID']
    ),
    finalizationType: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Type']
    ),
    finalizationStatus: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Status']
    ),
    finalizationSeverity: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Severity']
    ),
    finalizationDecision: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Decision']
    ),
    runStateClosed: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Run_State_Closed']
    ),
    readyForDownstreamUse: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Ready_For_Downstream_Use']
    ),
    readyForGovernance: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Ready_For_Governance']
    ),
    readyForDashboard: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Ready_For_Dashboard']
    ),
    readyForAutonomousDecisioning:
      sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
        'Ready_For_Autonomous_Decisioning'
      ]),
    autonomousActionAllowed: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Autonomous_Action_Allowed']
    ),
    humanReviewRequired: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Human_Review_Required']
    ),
    sourceFinalizationBusinessKey:
      sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
        'Business_Key'
      ]),
    sourceBusinessKey: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Source_Business_Key']
    )
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_ID'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Type'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Status'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Severity'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Message'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Decision'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Run_State_Closed'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Downstream_Use'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Governance'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Dashboard'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Autonomous_Decisioning'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Status'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Severity'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Title'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Text'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Executive_Status'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Executive_Severity'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Operational_Risk'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Recommended_Action'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Governance_Posture'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Decisioning_Posture'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Signals_Reviewed'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'High_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Medium_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Low_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Source_Daily_Brief_ID'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Business_Key'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Source_Business_Key'
    ]),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateFinalizationLedgerInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateFinalizationLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateFinalizationLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Finalization_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateFinalizationLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateFinalizationLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateFinalizationLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateFinalizationLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateFinalizationLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1300_AutonomousProcessorExecutionRunStateClosureProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateClosureProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1300_AutonomousProcessorExecutionRunStateClosureProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1300_AutonomousProcessorExecutionRunStateClosureProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateClosureProcessorLegacy1300_();
      return sciipWrapLegacyRuntimeResult1300_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1300_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1300_AutonomousProcessorExecutionRunStateClosureProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR =
  '1300_AutonomousProcessorExecutionRunStateClosureProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_HEADERS = [
  'Closure_ID',
  'Business_Key',
  'Run_State_Date',
  'Closure_Type',
  'Closure_Status',
  'Closure_Severity',
  'Closure_Decision',
  'Closure_Message',
  'Run_State_Closed',
  'Closure_Confirmed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Finalization_Status',
  'Finalization_Severity',
  'Finalization_Decision',
  'Finalization_Message',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Finalization_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Closure_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateClosureProcessorLegacy1300_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' + SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateClosureSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateClosuresCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateClosureInputRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateClosureRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateClosuresCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateClosureInputRow_(
      sourceRows
    );

  const closureRow =
    sciipBuildAutonomousProcessorExecutionRunStateClosure_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(closureRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateClosuresCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateClosureSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: closure record.
 */
function sciipBuildAutonomousProcessorExecutionRunStateClosure_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const finalizationStatus =
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Status']);

  const finalizationSeverity =
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Severity']);

  const finalizationDecision =
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Decision']);

  const runStateClosed =
    sciipGetRunStateClosureInputValue_(row, ['Run_State_Closed']);

  const readyForDownstreamUse =
    sciipGetRunStateClosureInputValue_(row, ['Ready_For_Downstream_Use']);

  const readyForGovernance =
    sciipGetRunStateClosureInputValue_(row, ['Ready_For_Governance']);

  const readyForDashboard =
    sciipGetRunStateClosureInputValue_(row, ['Ready_For_Dashboard']);

  const readyForAutonomousDecisioning =
    sciipGetRunStateClosureInputValue_(row, [
      'Ready_For_Autonomous_Decisioning'
    ]);

  const autonomousAllowed =
    sciipGetRunStateClosureInputValue_(row, ['Autonomous_Action_Allowed']);

  const humanReviewRequired =
    sciipGetRunStateClosureInputValue_(row, ['Human_Review_Required']);

  const recommendedAction =
    sciipGetRunStateClosureInputValue_(row, ['Recommended_Action']);

  const closureStatus =
    sciipResolveAutonomousProcessorExecutionRunStateClosureStatus_(
      finalizationStatus,
      runStateClosed,
      readyForDownstreamUse,
      readyForAutonomousDecisioning
    );

  const closureDecision =
    sciipResolveAutonomousProcessorExecutionRunStateClosureDecision_(
      finalizationDecision,
      readyForAutonomousDecisioning,
      humanReviewRequired,
      autonomousAllowed
    );

  const closureConfirmed =
    sciipResolveAutonomousProcessorExecutionRunStateClosureConfirmed_(
      closureStatus,
      runStateClosed
    );

  const closureMessage =
    sciipResolveAutonomousProcessorExecutionRunStateClosureMessage_(
      resolvedRunStateDate,
      closureStatus,
      closureDecision,
      recommendedAction
    );

  const closureId = 'APRSC_' + Utilities.getUuid();

  const closureJson = {
    runStateDate: resolvedRunStateDate,
    closureType: 'AUTONOMOUS_RUN_STATE_CLOSURE',
    closureStatus: closureStatus,
    closureSeverity: finalizationSeverity,
    closureDecision: closureDecision,
    runStateClosed: runStateClosed,
    closureConfirmed: closureConfirmed,
    readyForDownstreamUse: readyForDownstreamUse,
    readyForGovernance: readyForGovernance,
    readyForDashboard: readyForDashboard,
    readyForAutonomousDecisioning: readyForAutonomousDecisioning,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceFinalizationId: sciipGetRunStateClosureInputValue_(row, [
      'Finalization_ID'
    ]),
    sourceLedgerEntryId: sciipGetRunStateClosureInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateClosureInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    closureId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_CLOSURE',
    closureStatus,
    finalizationSeverity,
    closureDecision,
    closureMessage,
    runStateClosed,
    closureConfirmed,
    readyForDownstreamUse,
    readyForGovernance,
    readyForDashboard,
    readyForAutonomousDecisioning,
    autonomousAllowed,
    humanReviewRequired,
    finalizationStatus,
    finalizationSeverity,
    finalizationDecision,
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Message']),
    sciipGetRunStateClosureInputValue_(row, ['Operational_Risk']),
    recommendedAction,
    sciipGetRunStateClosureInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateClosureInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateClosureInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateClosureInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateClosureInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['Finalization_ID']),
    sciipGetRunStateClosureInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateClosureInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN,
    JSON.stringify(closureJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Closure resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateClosureStatus_(
  finalizationStatus,
  runStateClosed,
  readyForDownstreamUse,
  readyForAutonomousDecisioning
) {
  const finalStatus = String(finalizationStatus || '').toUpperCase();
  const closed = String(runStateClosed || '').toUpperCase();
  const downstream = String(readyForDownstreamUse || '').toUpperCase();
  const autonomous = String(readyForAutonomousDecisioning || '').toUpperCase();

  if (closed !== 'TRUE') {
    return 'CLOSURE_INCOMPLETE';
  }

  if (finalStatus.indexOf('CONTROL_CONSTRAINT') !== -1) {
    return 'CLOSED_WITH_CONTROL_CONSTRAINT';
  }

  if (finalStatus.indexOf('GOVERNANCE_REVIEW') !== -1) {
    return 'CLOSED_WITH_GOVERNANCE_REVIEW';
  }

  if (finalStatus.indexOf('MONITORING') !== -1) {
    return 'CLOSED_WITH_MONITORING';
  }

  if (downstream === 'TRUE' && autonomous === 'TRUE') {
    return 'CLOSED_READY_FOR_AUTONOMOUS_CONTINUATION';
  }

  return 'CLOSED_READY_FOR_DOWNSTREAM_USE';
}

function sciipResolveAutonomousProcessorExecutionRunStateClosureDecision_(
  finalizationDecision,
  readyForAutonomousDecisioning,
  humanReviewRequired,
  autonomousAllowed
) {
  const decision = String(finalizationDecision || '').toUpperCase();
  const autonomousReady = String(readyForAutonomousDecisioning || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (decision === 'DO_NOT_ADVANCE_AUTONOMOUSLY' || allowed === 'FALSE') {
    return 'CLOSE_AND_PREVENT_AUTONOMOUS_ADVANCEMENT';
  }

  if (review === 'TRUE') {
    return 'CLOSE_AND_ROUTE_TO_GOVERNANCE_REVIEW';
  }

  if (autonomousReady === 'TRUE') {
    return 'CLOSE_AND_ALLOW_AUTONOMOUS_CONTINUATION';
  }

  return 'CLOSE_AND_ALLOW_DOWNSTREAM_USE';
}

function sciipResolveAutonomousProcessorExecutionRunStateClosureConfirmed_(
  closureStatus,
  runStateClosed
) {
  return (
    String(runStateClosed || '').toUpperCase() === 'TRUE' &&
    String(closureStatus || '').indexOf('CLOSED') === 0
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateClosureMessage_(
  resolvedRunStateDate,
  closureStatus,
  closureDecision,
  recommendedAction
) {
  return (
    'Run state closure completed for ' +
    resolvedRunStateDate +
    ' with status ' +
    closureStatus +
    '. Closure decision: ' +
    closureDecision +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateClosureInputRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateClosureRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateClosureInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Finalization_Date',
      'Closure_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateClosureDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateClosureInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateClosureInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateClosureInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateClosureInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateClosureDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateClosureProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateClosureProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateClosureProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessorLegacy1310_();
      return sciipWrapLegacyRuntimeResult1310_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1310_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR =
  '1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Closure_ID',
  'Closure_Type',
  'Closure_Status',
  'Closure_Severity',
  'Closure_Decision',
  'Closure_Message',
  'Run_State_Closed',
  'Closure_Confirmed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Finalization_Status',
  'Finalization_Severity',
  'Finalization_Decision',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Finalization_ID',
  'Source_Ledger_Entry_ID',
  'Source_Closure_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

function sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessorLegacy1310_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateClosureLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateClosureLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const closureRows =
    sciipReadAutonomousProcessorExecutionRunStateClosureLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateClosureLedgerRowsByDate_(
      closureRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateClosureLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestClosure =
    sciipResolveLatestAutonomousProcessorExecutionRunStateClosureLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateClosureLedgerEntry_(
      latestClosure,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateClosureLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateClosureLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

function sciipBuildAutonomousProcessorExecutionRunStateClosureLedgerEntry_(
  closure,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSCL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    closureId: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_ID']),
    closureType: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Type']),
    closureStatus: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Status']),
    closureSeverity: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Severity']),
    closureDecision: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Decision']),
    runStateClosed: sciipGetRunStateClosureLedgerInputValue_(closure, ['Run_State_Closed']),
    closureConfirmed: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Confirmed']),
    readyForDownstreamUse: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Downstream_Use']),
    readyForGovernance: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Governance']),
    readyForDashboard: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Dashboard']),
    readyForAutonomousDecisioning: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Autonomous_Decisioning']),
    autonomousActionAllowed: sciipGetRunStateClosureLedgerInputValue_(closure, ['Autonomous_Action_Allowed']),
    humanReviewRequired: sciipGetRunStateClosureLedgerInputValue_(closure, ['Human_Review_Required']),
    sourceClosureBusinessKey: sciipGetRunStateClosureLedgerInputValue_(closure, ['Business_Key']),
    sourceBusinessKey: sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_ID']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Type']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Status']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Severity']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Decision']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Message']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Run_State_Closed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Confirmed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Downstream_Use']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Governance']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Dashboard']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Autonomous_Decisioning']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Autonomous_Action_Allowed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Human_Review_Required']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Finalization_Status']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Finalization_Severity']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Finalization_Decision']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Operational_Risk']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Recommended_Action']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Governance_Posture']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Orchestration_Posture']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Decisioning_Posture']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Signals_Reviewed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Critical_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['High_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Medium_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Low_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Finalization_ID']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Ledger_Entry_ID']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Business_Key']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

function sciipReadAutonomousProcessorExecutionRunStateClosureLedgerInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipFilterAutonomousProcessorExecutionRunStateClosureLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateClosureLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Closure_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateClosureLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateClosureLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateClosureLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateClosureLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateClosureLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateClosureLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

function sciipTestAutonomousProcessorExecutionRunStateClosureLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateClosureLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1320_AutonomousProcessorExecutionRunStateContinuityProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1320_AutonomousProcessorExecutionRunStateContinuityProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1320_AutonomousProcessorExecutionRunStateContinuityProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityProcessorLegacy1320_();
      return sciipWrapLegacyRuntimeResult1320_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1320_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1320_AutonomousProcessorExecutionRunStateContinuityProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR =
  '1320_AutonomousProcessorExecutionRunStateContinuityProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_HEADERS = [
  'Continuity_ID',
  'Business_Key',
  'Run_State_Date',
  'Continuity_Type',
  'Continuity_Status',
  'Continuity_Severity',
  'Continuity_Decision',
  'Continuity_Message',
  'Next_Cycle_Eligible',
  'Downstream_Use_Allowed',
  'Governance_Routing_Required',
  'Dashboard_Update_Required',
  'Autonomous_Continuation_Allowed',
  'Human_Review_Required',
  'Closure_Status',
  'Closure_Severity',
  'Closure_Decision',
  'Run_State_Closed',
  'Closure_Confirmed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Closure_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Continuity_JSON',
  'Processor',
  'Created_At'
];

function sciipRunAutonomousProcessorExecutionRunStateContinuityProcessorLegacy1320_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' + SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitiesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateContinuityInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateContinuityRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitiesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestClosureLedger =
    sciipResolveLatestAutonomousProcessorExecutionRunStateContinuityInputRow_(
      sourceRows
    );

  const continuityRow =
    sciipBuildAutonomousProcessorExecutionRunStateContinuity_(
      latestClosureLedger,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(continuityRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitiesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuitySheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_HEADERS);
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

function sciipBuildAutonomousProcessorExecutionRunStateContinuity_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const closureStatus =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Status']);

  const closureSeverity =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Severity']);

  const closureDecision =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Decision']);

  const closureConfirmed =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Confirmed']);

  const readyForDownstreamUse =
    sciipGetRunStateContinuityInputValue_(row, ['Ready_For_Downstream_Use']);

  const readyForGovernance =
    sciipGetRunStateContinuityInputValue_(row, ['Ready_For_Governance']);

  const readyForDashboard =
    sciipGetRunStateContinuityInputValue_(row, ['Ready_For_Dashboard']);

  const readyForAutonomousDecisioning =
    sciipGetRunStateContinuityInputValue_(row, [
      'Ready_For_Autonomous_Decisioning'
    ]);

  const autonomousAllowed =
    sciipGetRunStateContinuityInputValue_(row, ['Autonomous_Action_Allowed']);

  const humanReviewRequired =
    sciipGetRunStateContinuityInputValue_(row, ['Human_Review_Required']);

  const recommendedAction =
    sciipGetRunStateContinuityInputValue_(row, ['Recommended_Action']);

  const continuityStatus =
    sciipResolveAutonomousProcessorExecutionRunStateContinuityStatus_(
      closureStatus,
      closureConfirmed,
      readyForAutonomousDecisioning,
      humanReviewRequired
    );

  const continuityDecision =
    sciipResolveAutonomousProcessorExecutionRunStateContinuityDecision_(
      closureDecision,
      readyForDownstreamUse,
      readyForAutonomousDecisioning,
      humanReviewRequired,
      autonomousAllowed
    );

  const nextCycleEligible =
    sciipResolveAutonomousProcessorExecutionRunStateNextCycleEligible_(
      closureConfirmed,
      readyForDownstreamUse
    );

  const downstreamUseAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateDownstreamUseAllowed_(
      readyForDownstreamUse
    );

  const governanceRoutingRequired =
    sciipResolveAutonomousProcessorExecutionRunStateGovernanceRoutingRequired_(
      humanReviewRequired,
      closureSeverity
    );

  const dashboardUpdateRequired =
    sciipResolveAutonomousProcessorExecutionRunStateDashboardUpdateRequired_(
      readyForDashboard
    );

  const autonomousContinuationAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateAutonomousContinuationAllowed_(
      readyForAutonomousDecisioning,
      autonomousAllowed,
      humanReviewRequired
    );

  const continuityMessage =
    sciipResolveAutonomousProcessorExecutionRunStateContinuityMessage_(
      resolvedRunStateDate,
      continuityStatus,
      continuityDecision,
      recommendedAction
    );

  const continuityId = 'APRSCONT_' + Utilities.getUuid();

  const continuityJson = {
    runStateDate: resolvedRunStateDate,
    continuityType: 'AUTONOMOUS_RUN_STATE_CONTINUITY',
    continuityStatus: continuityStatus,
    continuitySeverity: closureSeverity,
    continuityDecision: continuityDecision,
    nextCycleEligible: nextCycleEligible,
    downstreamUseAllowed: downstreamUseAllowed,
    governanceRoutingRequired: governanceRoutingRequired,
    dashboardUpdateRequired: dashboardUpdateRequired,
    autonomousContinuationAllowed: autonomousContinuationAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceClosureId: sciipGetRunStateContinuityInputValue_(row, ['Closure_ID']),
    sourceLedgerEntryId: sciipGetRunStateContinuityInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateContinuityInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    continuityId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_CONTINUITY',
    continuityStatus,
    closureSeverity,
    continuityDecision,
    continuityMessage,
    nextCycleEligible,
    downstreamUseAllowed,
    governanceRoutingRequired,
    dashboardUpdateRequired,
    autonomousContinuationAllowed,
    humanReviewRequired,
    closureStatus,
    closureSeverity,
    closureDecision,
    sciipGetRunStateContinuityInputValue_(row, ['Run_State_Closed']),
    closureConfirmed,
    readyForDownstreamUse,
    readyForGovernance,
    readyForDashboard,
    readyForAutonomousDecisioning,
    autonomousAllowed,
    sciipGetRunStateContinuityInputValue_(row, ['Operational_Risk']),
    recommendedAction,
    sciipGetRunStateContinuityInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateContinuityInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateContinuityInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateContinuityInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateContinuityInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['Closure_ID']),
    sciipGetRunStateContinuityInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateContinuityInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN,
    JSON.stringify(continuityJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
    startedAt.toISOString()
  ];
}

function sciipResolveAutonomousProcessorExecutionRunStateContinuityStatus_(
  closureStatus,
  closureConfirmed,
  readyForAutonomousDecisioning,
  humanReviewRequired
) {
  const status = String(closureStatus || '').toUpperCase();
  const confirmed = String(closureConfirmed || '').toUpperCase();
  const autonomousReady = String(readyForAutonomousDecisioning || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();

  if (confirmed !== 'TRUE') return 'CONTINUITY_BLOCKED_CLOSURE_NOT_CONFIRMED';
  if (status.indexOf('CONTROL_CONSTRAINT') !== -1) return 'CONTINUITY_CONTROLLED';
  if (review === 'TRUE') return 'CONTINUITY_REQUIRES_GOVERNANCE_REVIEW';
  if (autonomousReady === 'TRUE') return 'CONTINUITY_READY_FOR_AUTONOMOUS_CYCLE';

  return 'CONTINUITY_READY_FOR_DOWNSTREAM_USE';
}

function sciipResolveAutonomousProcessorExecutionRunStateContinuityDecision_(
  closureDecision,
  readyForDownstreamUse,
  readyForAutonomousDecisioning,
  humanReviewRequired,
  autonomousAllowed
) {
  const decision = String(closureDecision || '').toUpperCase();
  const downstream = String(readyForDownstreamUse || '').toUpperCase();
  const autonomousReady = String(readyForAutonomousDecisioning || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (
    decision.indexOf('PREVENT_AUTONOMOUS') !== -1 ||
    allowed === 'FALSE'
  ) {
    return 'CARRY_FORWARD_WITH_AUTONOMOUS_HOLD';
  }

  if (review === 'TRUE') return 'CARRY_FORWARD_TO_GOVERNANCE_REVIEW';
  if (autonomousReady === 'TRUE') return 'CARRY_FORWARD_TO_NEXT_AUTONOMOUS_CYCLE';
  if (downstream === 'TRUE') return 'CARRY_FORWARD_TO_DOWNSTREAM_PROCESSORS';

  return 'CARRY_FORWARD_WITH_REVIEW_REQUIRED';
}

function sciipResolveAutonomousProcessorExecutionRunStateNextCycleEligible_(
  closureConfirmed,
  readyForDownstreamUse
) {
  return (
    String(closureConfirmed || '').toUpperCase() === 'TRUE' &&
    String(readyForDownstreamUse || '').toUpperCase() === 'TRUE'
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateDownstreamUseAllowed_(
  readyForDownstreamUse
) {
  return String(readyForDownstreamUse || '').toUpperCase() === 'TRUE';
}

function sciipResolveAutonomousProcessorExecutionRunStateGovernanceRoutingRequired_(
  humanReviewRequired,
  closureSeverity
) {
  const review = String(humanReviewRequired || '').toUpperCase();
  const severity = String(closureSeverity || '').toUpperCase();

  return review === 'TRUE' || severity === 'CRITICAL' || severity === 'HIGH';
}

function sciipResolveAutonomousProcessorExecutionRunStateDashboardUpdateRequired_(
  readyForDashboard
) {
  return String(readyForDashboard || '').toUpperCase() === 'TRUE';
}

function sciipResolveAutonomousProcessorExecutionRunStateAutonomousContinuationAllowed_(
  readyForAutonomousDecisioning,
  autonomousAllowed,
  humanReviewRequired
) {
  return (
    String(readyForAutonomousDecisioning || '').toUpperCase() === 'TRUE' &&
    String(autonomousAllowed || '').toUpperCase() !== 'FALSE' &&
    String(humanReviewRequired || '').toUpperCase() !== 'TRUE'
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateContinuityMessage_(
  resolvedRunStateDate,
  continuityStatus,
  continuityDecision,
  recommendedAction
) {
  return (
    'Run state continuity established for ' +
    resolvedRunStateDate +
    ' with status ' +
    continuityStatus +
    '. Continuity decision: ' +
    continuityDecision +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

function sciipReadAutonomousProcessorExecutionRunStateContinuityInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipFilterAutonomousProcessorExecutionRunStateContinuityRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateContinuityInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Closure_Date',
      'Continuity_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateContinuityDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateContinuityInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateContinuityInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateContinuityInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateContinuityInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateContinuityDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1330_AutonomousProcessorExecutionRunStateContinuityLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1330_AutonomousProcessorExecutionRunStateContinuityLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1330_AutonomousProcessorExecutionRunStateContinuityLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityLedgerProcessorLegacy1330_();
      return sciipWrapLegacyRuntimeResult1330_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1330_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1330_AutonomousProcessorExecutionRunStateContinuityLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_PROCESSOR =
  '1330_AutonomousProcessorExecutionRunStateContinuityLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Continuity_ID',
  'Continuity_Type',
  'Continuity_Status',
  'Continuity_Severity',
  'Continuity_Decision',
  'Continuity_Message',
  'Next_Cycle_Eligible',
  'Downstream_Use_Allowed',
  'Governance_Routing_Required',
  'Dashboard_Update_Required',
  'Autonomous_Continuation_Allowed',
  'Human_Review_Required',
  'Closure_Status',
  'Closure_Severity',
  'Closure_Decision',
  'Run_State_Closed',
  'Closure_Confirmed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Closure_ID',
  'Source_Ledger_Entry_ID',
  'Source_Continuity_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

function sciipRunAutonomousProcessorExecutionRunStateContinuityLedgerProcessorLegacy1330_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
        SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuityLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const continuityRows =
    sciipReadAutonomousProcessorExecutionRunStateContinuityLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateContinuityLedgerRowsByDate_(
      continuityRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestContinuity =
    sciipResolveLatestAutonomousProcessorExecutionRunStateContinuityLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateContinuityLedgerEntry_(
      latestContinuity,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuityLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

function sciipBuildAutonomousProcessorExecutionRunStateContinuityLedgerEntry_(
  continuity,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSCONTL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    continuityId: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Continuity_ID'
    ]),
    continuityType: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Continuity_Type'
    ]),
    continuityStatus: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Continuity_Status'
    ]),
    continuitySeverity: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Continuity_Severity'
    ]),
    continuityDecision: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Continuity_Decision'
    ]),
    nextCycleEligible: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Next_Cycle_Eligible'
    ]),
    downstreamUseAllowed: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Downstream_Use_Allowed']
    ),
    governanceRoutingRequired: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Governance_Routing_Required']
    ),
    dashboardUpdateRequired: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Dashboard_Update_Required']
    ),
    autonomousContinuationAllowed: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Autonomous_Continuation_Allowed']
    ),
    humanReviewRequired: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Human_Review_Required']
    ),
    sourceContinuityBusinessKey: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Business_Key']
    ),
    sourceBusinessKey: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Source_Business_Key'
    ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_ID']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_Type']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_Status']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_Severity']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_Decision']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_Message']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Next_Cycle_Eligible']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Downstream_Use_Allowed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Governance_Routing_Required']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Dashboard_Update_Required']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Autonomous_Continuation_Allowed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Human_Review_Required']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Closure_Status']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Closure_Severity']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Closure_Decision']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Run_State_Closed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Closure_Confirmed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Ready_For_Downstream_Use']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Ready_For_Governance']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Ready_For_Dashboard']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Ready_For_Autonomous_Decisioning']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Autonomous_Action_Allowed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Operational_Risk']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Recommended_Action']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Governance_Posture']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Orchestration_Posture']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Decisioning_Posture']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Signals_Reviewed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Critical_Signal_Count']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['High_Signal_Count']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Medium_Signal_Count']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Low_Signal_Count']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Source_Closure_ID']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Source_Ledger_Entry_ID']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Business_Key']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Source_Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

function sciipReadAutonomousProcessorExecutionRunStateContinuityLedgerInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipFilterAutonomousProcessorExecutionRunStateContinuityLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateContinuityLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Continuity_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateContinuityLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateContinuityLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateContinuityLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateContinuityLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateContinuityLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateContinuityLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessorLegacy1340_();
      return sciipWrapLegacyRuntimeResult1340_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1340_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/**
 * 1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST
 */

const SCIIP_1340_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER';
const SCIIP_1340_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST';
const SCIIP_1340_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST';

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessorLegacy1340_() {
  const ss = sciipGetSpreadsheet_();
  const processingDate = sciipResolveLatestProcessingDate_();
  const dateKey = sciip1340ResolveDateKey_(processingDate);
  const businessKey = `${SCIIP_1340_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1340EnsureSheet_(ss, SCIIP_1340_TARGET_SHEET, sciip1340TargetHeaders_());

  if (sciip1340BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1340_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1340HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1340Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1340Get_(row, sourceMap, [
      'Date_Key',
      'Ledger_Date',
      'Continuity_Date',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1340NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  let successCount = 0;
  let duplicateCount = 0;
  let failedCount = 0;
  const processors = {};
  const sourceBusinessKeys = [];

  relevantRows.forEach(row => {
    const status = String(sciip1340Get_(row, sourceMap, ['Status', 'status']) || '').toUpperCase();
    const skippedDuplicate = Number(sciip1340Get_(row, sourceMap, ['Skipped_Duplicate', 'skippedDuplicate']) || 0);
    const processor = sciip1340Get_(row, sourceMap, ['Processor', 'processor']);
    const sourceBusinessKey = sciip1340Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (processor) processors[String(processor)] = true;
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    if (status === 'SUCCESS') successCount++;
    if (skippedDuplicate > 0) duplicateCount++;
    if (status === 'FAILED' || status === 'ERROR') failedCount++;
  });

  const digestSummary =
    `Continuity ledger digest for ${dateKey}: ` +
    `${relevantRows.length} ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${successCount} successful; ${duplicateCount} duplicate/idempotent; ${failedCount} failed.`;

  const digestId = `APRSC_DIGEST_${Utilities.getUuid()}`;

  targetSheet.appendRow([
    digestId,
    businessKey,
    dateKey,
    SCIIP_1340_SOURCE_SHEET,
    relevantRows.length,
    successCount,
    duplicateCount,
    failedCount,
    Object.keys(processors).join(', '),
    sourceBusinessKeys.join(', '),
    digestSummary,
    failedCount > 0 ? 'REVIEW_REQUIRED' : 'SUCCESS',
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityDigestProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityDigestProcessor',
    result
  }));
  return result;
}

function sciip1340TargetHeaders_() {
  return [
    'Digest_Id',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Ledger_Entries_Reviewed',
    'Successful_Continuity_Ledger_Entries',
    'Duplicate_Continuity_Ledger_Entries',
    'Failed_Continuity_Ledger_Entries',
    'Source_Processors',
    'Source_Business_Keys',
    'Digest_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1340EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1340HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1340Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1340BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1340_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1340HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1340ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1340NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessorLegacy1350_();
      return sciipWrapLegacyRuntimeResult1350_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1350_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/**
 * 1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER
 */

const SCIIP_1350_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST';
const SCIIP_1350_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER';
const SCIIP_1350_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessorLegacy1350_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1350ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1350_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1350EnsureSheet_(ss, SCIIP_1350_TARGET_SHEET, sciip1350TargetHeaders_());

  if (sciip1350BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1350_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1350HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1350Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1350Get_(row, sourceMap, [
      'Digest_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1350NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceBusinessKeys = [];
  const sourceDigestIds = [];
  const sourceStatuses = {};
  let totalLedgerEntriesReviewed = 0;
  let totalSuccessfulEntries = 0;
  let totalDuplicateEntries = 0;
  let totalFailedEntries = 0;

  relevantRows.forEach(row => {
    const sourceBusinessKey = sciip1350Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const digestId = sciip1350Get_(row, sourceMap, ['Digest_Id', 'Digest_ID', 'digestId']);
    const status = String(sciip1350Get_(row, sourceMap, ['Status', 'status']) || '').toUpperCase();

    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (digestId) sourceDigestIds.push(String(digestId));
    if (status) sourceStatuses[status] = true;

    totalLedgerEntriesReviewed += Number(sciip1350Get_(row, sourceMap, ['Ledger_Entries_Reviewed']) || 0);
    totalSuccessfulEntries += Number(sciip1350Get_(row, sourceMap, ['Successful_Continuity_Ledger_Entries']) || 0);
    totalDuplicateEntries += Number(sciip1350Get_(row, sourceMap, ['Duplicate_Continuity_Ledger_Entries']) || 0);
    totalFailedEntries += Number(sciip1350Get_(row, sourceMap, ['Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_DIGEST_LEDGER_${Utilities.getUuid()}`;

  const ledgerSummary =
    `Continuity digest ledger entry for ${dateKey}: ` +
    `${relevantRows.length} digest entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `${totalLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${totalSuccessfulEntries} successful; ${totalDuplicateEntries} duplicate/idempotent; ${totalFailedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1350_SOURCE_SHEET,
    relevantRows.length,
    sourceDigestIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(sourceStatuses).join(', '),
    totalLedgerEntriesReviewed,
    totalSuccessfulEntries,
    totalDuplicateEntries,
    totalFailedEntries,
    ledgerSummary,
    totalFailedEntries > 0 ? 'REVIEW_REQUIRED' : 'SUCCESS',
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
    result
  }));
  return result;
}

function sciip1350TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Digest_Entries_Reviewed',
    'Source_Digest_Ids',
    'Source_Business_Keys',
    'Source_Statuses',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1350EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1350HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1350Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1350BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1350_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1350HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1350ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1350NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

function sciip1350ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1350_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1350ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1350HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1350Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const digestDate = sciip1350Get_(row, map, ['Digest_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1350NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1350NormalizeDateKey_(digestDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1350ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalProcessorLegacy1360_();
      return sciipWrapLegacyRuntimeResult1360_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1360_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/**
 * 1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL
 */

const SCIIP_1360_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER';
const SCIIP_1360_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL';
const SCIIP_1360_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalProcessorLegacy1360_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1360ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1360_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1360EnsureSheet_(ss, SCIIP_1360_TARGET_SHEET, sciip1360TargetHeaders_());

  if (sciip1360BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1360_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1360HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1360Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1360Get_(row, sourceMap, [
      'Ledger_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1360NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const sourceStatuses = {};

  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1360Get_(row, sourceMap, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1360Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const status = String(sciip1360Get_(row, sourceMap, ['Status', 'status']) || '').toUpperCase();

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (status) sourceStatuses[status] = true;

    digestEntriesReviewed += Number(sciip1360Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1360Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1360Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1360Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1360Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const signalId = `APRSC_SIGNAL_${Utilities.getUuid()}`;

  let signalType = 'CONTINUITY_HEALTHY';
  let severity = 'INFO';
  let recommendedAction = 'No action required. Continue autonomous processor chain.';
  let signalStatus = 'SUCCESS';

  if (failedEntries > 0 || Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1) {
    signalType = 'CONTINUITY_REVIEW_REQUIRED';
    severity = 'WARN';
    recommendedAction = 'Review failed or review-required continuity digest ledger entries before downstream promotion.';
    signalStatus = 'REVIEW_REQUIRED';
  } else if (underlyingLedgerEntriesReviewed === 0) {
    signalType = 'CONTINUITY_NO_UNDERLYING_ACTIVITY';
    severity = 'LOW';
    recommendedAction = 'No immediate action required. Confirm upstream continuity chain if this persists.';
    signalStatus = 'SUCCESS';
  }

  const signalSummary =
    `Continuity signal for ${dateKey}: ${signalType}. ` +
    `${relevantRows.length} digest ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${digestEntriesReviewed} digest entries; ` +
    `${underlyingLedgerEntriesReviewed} underlying ledger entries; ` +
    `${successfulEntries} successful; ${duplicateEntries} duplicate/idempotent; ${failedEntries} failed.`;

  targetSheet.appendRow([
    signalId,
    businessKey,
    dateKey,
    SCIIP_1360_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(sourceStatuses).join(', '),
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    signalType,
    severity,
    signalSummary,
    recommendedAction,
    signalStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySignalProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySignalProcessor',
    result
  }));
  return result;
}

function sciip1360TargetHeaders_() {
  return [
    'Signal_Id',
    'Business_Key',
    'Signal_Date',
    'Source_Sheet',
    'Source_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Source_Statuses',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Signal_Type',
    'Severity',
    'Signal_Summary',
    'Recommended_Action',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1360EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1360HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1360Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1360BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1360_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1360HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1360ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1360_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1360ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1360HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1360Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1360Get_(row, map, ['Ledger_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1360NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1360NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1360ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1360ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1360NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessorLegacy1370_();
      return sciipWrapLegacyRuntimeResult1370_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1370_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/**
 * 1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER
 */

const SCIIP_1370_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL';
const SCIIP_1370_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER';
const SCIIP_1370_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessorLegacy1370_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1370ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1370_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1370EnsureSheet_(ss, SCIIP_1370_TARGET_SHEET, sciip1370TargetHeaders_());

  if (sciip1370BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1370_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1370HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1370Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1370Get_(row, sourceMap, [
      'Signal_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1370NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSignalIds = [];
  const sourceBusinessKeys = [];
  const signalTypes = {};
  const severities = {};
  const statuses = {};

  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const signalId = sciip1370Get_(row, sourceMap, ['Signal_Id', 'Signal_ID', 'signalId']);
    const sourceBusinessKey = sciip1370Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const signalType = sciip1370Get_(row, sourceMap, ['Signal_Type', 'signalType']);
    const severity = sciip1370Get_(row, sourceMap, ['Severity', 'severity']);
    const status = sciip1370Get_(row, sourceMap, ['Status', 'status']);

    if (signalId) sourceSignalIds.push(String(signalId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (signalType) signalTypes[String(signalType)] = true;
    if (severity) severities[String(severity)] = true;
    if (status) statuses[String(status)] = true;

    sourceLedgerEntriesReviewed += Number(sciip1370Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1370Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1370Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1370Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1370Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1370Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_SIGNAL_LEDGER_${Utilities.getUuid()}`;

  const ledgerSummary =
    `Continuity signal ledger entry for ${dateKey}: ` +
    `${relevantRows.length} signal entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `signal types: ${Object.keys(signalTypes).join(', ') || 'NONE'}; ` +
    `severity: ${Object.keys(severities).join(', ') || 'NONE'}; ` +
    `${failedEntries} failed underlying continuity entries.`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(statuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(signalTypes).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1370_SOURCE_SHEET,
    relevantRows.length,
    sourceSignalIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(statuses).join(', '),
    sourceLedgerEntriesReviewed,
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
    result
  }));
  return result;
}

function sciip1370TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Signal_Entries_Reviewed',
    'Source_Signal_Ids',
    'Source_Business_Keys',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Source_Ledger_Entries_Reviewed',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1370EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1370HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1370Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1370BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1370_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1370HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1370ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1370_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1370ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1370HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1370Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const signalDate = sciip1370Get_(row, map, ['Signal_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1370NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1370NormalizeDateKey_(signalDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1370ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1370ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1370NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessorLegacy1380_();
      return sciipWrapLegacyRuntimeResult1380_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1380_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/**
 * 1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST
 */

const SCIIP_1380_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER';
const SCIIP_1380_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST';
const SCIIP_1380_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessorLegacy1380_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1380ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1380_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1380EnsureSheet_(ss, SCIIP_1380_TARGET_SHEET, sciip1380TargetHeaders_());

  if (sciip1380BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1380_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1380HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1380Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1380Get_(row, sourceMap, [
      'Ledger_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1380NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let signalEntriesReviewed = 0;
  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1380Get_(row, sourceMap, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1380Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowSignalTypes = sciip1380Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']);
    const rowSeverities = sciip1380Get_(row, sourceMap, ['Severities', 'Severity']);
    const rowStatuses = sciip1380Get_(row, sourceMap, ['Source_Statuses', 'Status']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1380CollectList_(signalTypes, rowSignalTypes);
    sciip1380CollectList_(severities, rowSeverities);
    sciip1380CollectList_(sourceStatuses, rowStatuses);

    signalEntriesReviewed += Number(sciip1380Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    sourceLedgerEntriesReviewed += Number(sciip1380Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1380Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1380Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1380Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1380Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1380Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const digestId = `APRSC_SIGNAL_DIGEST_${Utilities.getUuid()}`;

  const digestStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(signalTypes).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const digestSummary =
    `Continuity signal digest for ${dateKey}: ` +
    `${relevantRows.length} signal ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `signal types: ${Object.keys(signalTypes).join(', ') || 'NONE'}; ` +
    `severities: ${Object.keys(severities).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    digestId,
    businessKey,
    dateKey,
    SCIIP_1380_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    signalEntriesReviewed,
    sourceLedgerEntriesReviewed,
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    digestSummary,
    digestStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySignalDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
    result
  }));
  return result;
}

function sciip1380TargetHeaders_() {
  return [
    'Digest_Id',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Signal_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Signal_Entries_Reviewed',
    'Source_Ledger_Entries_Reviewed',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Digest_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1380EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1380HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1380Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1380CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1380BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1380_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1380HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1380ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1380_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1380ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1380HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1380Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1380Get_(row, map, ['Ledger_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1380NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1380NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1380ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1380ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1380NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}