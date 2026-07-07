/*******************************************************
 * 3540_SuperSheetImportExecutionProductionHealthCertificationLedgerProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3540_SuperSheetImportExecutionProductionHealthCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3540',
    processorName: '3540_SuperSheetImportExecutionProductionHealthCertificationLedger',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH_CERTIFICATIONS',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH_CERTIFICATION_LEDGER_SUMMARY',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkActivationId',
      'operationalMonitoringId',
      'productionHealthCertificationId',
      'productionHealthCertificationStatus',
      'productionHealthCertificationLedgerStatus',
      'ledgerDate',
      'ledgerScope',
      'ledgerResult',
      'ledgerSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3540_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCERTIFICATIONLEDGER',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3540_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCERTIFICATIONLEDGER',
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

      var healthStatus =
        row.productionHealthCertificationStatus ||
        row.certificationResult ||
        'HEALTH_CERTIFIED';

      var ledgerStatus = 'LEDGER_SUMMARIZED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3540_SuperSheetImportExecutionProductionHealthCertificationLedger',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthCertificationStatus: healthStatus,
        productionHealthCertificationLedgerStatus: ledgerStatus,
        nextAction: 'Production health certification ledger summary is complete. Continue to production health closeout processor.'
      });

      return {
        businessKey: [
          '3540_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCERTIFICATIONLEDGER',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthCertificationStatus: healthStatus,
        productionHealthCertificationLedgerStatus: ledgerStatus,
        ledgerDate: now,
        ledgerScope: row.certificationScope || row.ledgerScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH',
        ledgerResult: ledgerStatus,
        ledgerSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3540_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCERTIFICATIONLEDGER',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionHealthCertificationLedgerStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3530_SuperSheetImportExecutionProductionHealthCertificationProcessor after 3520 creates operational monitoring ledger summary records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3540_SuperSheetImportExecutionProductionHealthCertificationLedger',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3540_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCERTIFICATIONLEDGER',
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


function sciipTest3540_SuperSheetImportExecutionProductionHealthCertificationLedgerProcessor() {
  var result = run3540_SuperSheetImportExecutionProductionHealthCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3540_SuperSheetImportExecutionProductionHealthCertificationLedgerProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3540_SuperSheetImportExecutionProductionHealthCertificationLedgerProcessor',
    result: result
  };
}