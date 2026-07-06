/*******************************************************
 * 3470_SuperSheetImportExecutionProductionFrameworkHandoffProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3470_SuperSheetImportExecutionProductionFrameworkHandoffProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3470',
    processorName: '3470_SuperSheetImportExecutionProductionFrameworkHandoff',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_COMPLETIONS',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK_HANDOFFS',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionCertificationCompletionId',
      'productionFrameworkHandoffId',
      'productionFrameworkHandoffStatus',
      'handoffDate',
      'handoffScope',
      'handoffResult',
      'handoffSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3470_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKHANDOFF',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3470_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKHANDOFF',
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

      var completionId =
        row.productionCertificationCompletionId ||
        [
          'PRODUCTION_CERTIFICATION_COMPLETION',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var handoffId = [
        'PRODUCTION_FRAMEWORK_HANDOFF',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'HANDOFF_READY';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3470_SuperSheetImportExecutionProductionFrameworkHandoff',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationCompletionId: completionId,
        productionFrameworkHandoffId: handoffId,
        productionFrameworkHandoffStatus: status,
        nextAction: 'Production framework handoff is ready. Continue to production framework acceptance or operational readiness processor.'
      });

      return {
        businessKey: [
          '3470_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKHANDOFF',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationCompletionId: completionId,
        productionFrameworkHandoffId: handoffId,
        productionFrameworkHandoffStatus: status,
        handoffDate: now,
        handoffScope: row.completionScope || row.handoffScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK',
        handoffResult: status,
        handoffSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3470_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKHANDOFF',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionFrameworkHandoffStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3460_SuperSheetImportExecutionProductionCertificationCompletionProcessor after 3450 creates production certification reconciliation records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3470_SuperSheetImportExecutionProductionFrameworkHandoff',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3470_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKHANDOFF',
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


function sciipTest3470_SuperSheetImportExecutionProductionFrameworkHandoffProcessor() {
  var result = run3470_SuperSheetImportExecutionProductionFrameworkHandoffProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3470_SuperSheetImportExecutionProductionFrameworkHandoffProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3470_SuperSheetImportExecutionProductionFrameworkHandoffProcessor',
    result: result
  };
}