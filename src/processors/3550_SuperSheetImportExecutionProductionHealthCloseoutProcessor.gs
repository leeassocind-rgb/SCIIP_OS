/*******************************************************
 * 3550_SuperSheetImportExecutionProductionHealthCloseoutProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3550_SuperSheetImportExecutionProductionHealthCloseoutProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3550',
    processorName: '3550_SuperSheetImportExecutionProductionHealthCloseout',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH_CERTIFICATION_LEDGER_SUMMARY',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH_CLOSEOUTS',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkActivationId',
      'operationalMonitoringId',
      'productionHealthCertificationId',
      'productionHealthCloseoutId',
      'productionHealthCloseoutStatus',
      'closeoutDate',
      'closeoutScope',
      'closeoutResult',
      'closeoutSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3550_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCLOSEOUT',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3550_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCLOSEOUT',
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

      var closeoutId = [
        'PRODUCTION_HEALTH_CLOSEOUT',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'HEALTH_CLOSED_OUT';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3550_SuperSheetImportExecutionProductionHealthCloseout',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthCloseoutId: closeoutId,
        productionHealthCloseoutStatus: status,
        nextAction: 'Production health closeout is complete. Continue to production health archive or final operational readiness processor.'
      });

      return {
        businessKey: [
          '3550_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCLOSEOUT',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthCloseoutId: closeoutId,
        productionHealthCloseoutStatus: status,
        closeoutDate: now,
        closeoutScope: row.ledgerScope || row.closeoutScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH',
        closeoutResult: status,
        closeoutSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3550_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCLOSEOUT',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionHealthCloseoutStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3540_SuperSheetImportExecutionProductionHealthCertificationLedgerProcessor after 3530 creates production health certification records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3550_SuperSheetImportExecutionProductionHealthCloseout',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3550_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCLOSEOUT',
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


function sciipTest3550_SuperSheetImportExecutionProductionHealthCloseoutProcessor() {
  var result = run3550_SuperSheetImportExecutionProductionHealthCloseoutProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3550_SuperSheetImportExecutionProductionHealthCloseoutProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3550_SuperSheetImportExecutionProductionHealthCloseoutProcessor',
    result: result
  };
}