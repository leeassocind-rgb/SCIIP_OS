/*******************************************************
 * 3580_SuperSheetImportExecutionProductionOperationalReadinessLedgerProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3580_SuperSheetImportExecutionProductionOperationalReadinessLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3580',
    processorName: '3580_SuperSheetImportExecutionProductionOperationalReadinessLedger',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS_LEDGER_SUMMARY',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkActivationId',
      'operationalMonitoringId',
      'productionHealthCertificationId',
      'productionHealthArchiveId',
      'productionOperationalReadinessId',
      'productionOperationalReadinessStatus',
      'productionOperationalReadinessLedgerStatus',
      'ledgerDate',
      'ledgerScope',
      'ledgerResult',
      'ledgerSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3580_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSLEDGER',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3580_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSLEDGER',
        ctx.targetSheetName
      );

      var sourceBusinessKey =
        row.businessKey ||
        row.sourceBusinessKey ||
        '';

      var productionCertificationId =
        row.productionCertificationId ||
        sourceBusinessKey ||
        transactionId;

      var activationId =
        row.productionFrameworkActivationId ||
        [
          'PRODUCTION_FRAMEWORK_ACTIVATION',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var monitoringId =
        row.operationalMonitoringId ||
        [
          'PRODUCTION_OPERATIONAL_MONITORING',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var healthCertificationId =
        row.productionHealthCertificationId ||
        [
          'PRODUCTION_HEALTH_CERTIFICATION',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var healthArchiveId =
        row.productionHealthArchiveId ||
        [
          'PRODUCTION_HEALTH_ARCHIVE',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var readinessId =
        row.productionOperationalReadinessId ||
        [
          'PRODUCTION_OPERATIONAL_READINESS',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var readinessStatus =
        row.productionOperationalReadinessStatus ||
        row.readinessResult ||
        'OPERATIONALLY_READY';

      var ledgerStatus = 'LEDGER_SUMMARIZED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3580_SuperSheetImportExecutionProductionOperationalReadinessLedger',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthArchiveId: healthArchiveId,
        productionOperationalReadinessId: readinessId,
        productionOperationalReadinessStatus: readinessStatus,
        productionOperationalReadinessLedgerStatus: ledgerStatus,
        nextAction: 'Production operational readiness ledger summary is complete. Continue to production operational readiness closeout processor.'
      });

      return {
        businessKey: [
          '3580_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSLEDGER',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthArchiveId: healthArchiveId,
        productionOperationalReadinessId: readinessId,
        productionOperationalReadinessStatus: readinessStatus,
        productionOperationalReadinessLedgerStatus: ledgerStatus,
        ledgerDate: now,
        ledgerScope: row.readinessScope || row.ledgerScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS',
        ledgerResult: ledgerStatus,
        ledgerSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3580_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSLEDGER',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionOperationalReadinessLedgerStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3570_SuperSheetImportExecutionProductionOperationalReadinessProcessor after 3560 creates production health archive records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3580_SuperSheetImportExecutionProductionOperationalReadinessLedger',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3580_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSLEDGER',
          ctx.targetSheetName,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsRead: 0,
        processed: 0,
        skippedDuplicate: 0,
        skippedNoInputs: 0,
        skippedValidation: 0,
        errors: 0,
        message: JSON.stringify(payload),
        frameworkVersion: 'v5.2',
        completedAt: SCIIP_DateUtilities.nowIso()
      });
    }
  });
}


function sciipTest3580_SuperSheetImportExecutionProductionOperationalReadinessLedgerProcessor() {
  var result = run3580_SuperSheetImportExecutionProductionOperationalReadinessLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3580_SuperSheetImportExecutionProductionOperationalReadinessLedgerProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3580_SuperSheetImportExecutionProductionOperationalReadinessLedgerProcessor',
    result: result
  };
}