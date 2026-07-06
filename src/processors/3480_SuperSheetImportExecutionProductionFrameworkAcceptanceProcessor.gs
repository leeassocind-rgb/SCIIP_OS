/*******************************************************
 * 3480_SuperSheetImportExecutionProductionFrameworkAcceptanceProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3480_SuperSheetImportExecutionProductionFrameworkAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3480',
    processorName: '3480_SuperSheetImportExecutionProductionFrameworkAcceptance',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK_HANDOFFS',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK_ACCEPTANCES',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkHandoffId',
      'productionFrameworkAcceptanceId',
      'productionFrameworkAcceptanceStatus',
      'acceptanceDate',
      'acceptanceScope',
      'acceptanceResult',
      'acceptanceSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3480_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACCEPTANCE',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3480_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACCEPTANCE',
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

      var handoffId =
        row.productionFrameworkHandoffId ||
        [
          'PRODUCTION_FRAMEWORK_HANDOFF',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var acceptanceId = [
        'PRODUCTION_FRAMEWORK_ACCEPTANCE',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'ACCEPTED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3480_SuperSheetImportExecutionProductionFrameworkAcceptance',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkHandoffId: handoffId,
        productionFrameworkAcceptanceId: acceptanceId,
        productionFrameworkAcceptanceStatus: status,
        nextAction: 'Production framework acceptance is complete. Continue to operational readiness or production framework activation processor.'
      });

      return {
        businessKey: [
          '3480_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACCEPTANCE',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkHandoffId: handoffId,
        productionFrameworkAcceptanceId: acceptanceId,
        productionFrameworkAcceptanceStatus: status,
        acceptanceDate: now,
        acceptanceScope: row.handoffScope || row.acceptanceScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK',
        acceptanceResult: status,
        acceptanceSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3480_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACCEPTANCE',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionFrameworkAcceptanceStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3470_SuperSheetImportExecutionProductionFrameworkHandoffProcessor after 3460 creates production certification completion records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3480_SuperSheetImportExecutionProductionFrameworkAcceptance',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3480_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACCEPTANCE',
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


function sciipTest3480_SuperSheetImportExecutionProductionFrameworkAcceptanceProcessor() {
  var result = run3480_SuperSheetImportExecutionProductionFrameworkAcceptanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3480_SuperSheetImportExecutionProductionFrameworkAcceptanceProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3480_SuperSheetImportExecutionProductionFrameworkAcceptanceProcessor',
    result: result
  };
}