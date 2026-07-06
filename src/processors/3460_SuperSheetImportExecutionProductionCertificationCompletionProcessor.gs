/*******************************************************
 * 3460_SuperSheetImportExecutionProductionCertificationCompletionProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3460_SuperSheetImportExecutionProductionCertificationCompletionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3460',
    processorName: '3460_SuperSheetImportExecutionProductionCertificationCompletion',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_RECONCILIATIONS',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_COMPLETIONS',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionCertificationReconciliationId',
      'productionCertificationCompletionId',
      'productionCertificationCompletionStatus',
      'completionDate',
      'completionScope',
      'completionResult',
      'completionSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3460_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONCOMPLETION',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3460_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONCOMPLETION',
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

      var reconciliationId =
        row.productionCertificationReconciliationId ||
        [
          'PRODUCTION_CERTIFICATION_RECONCILIATION',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var completionId = [
        'PRODUCTION_CERTIFICATION_COMPLETION',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'COMPLETED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3460_SuperSheetImportExecutionProductionCertificationCompletion',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationReconciliationId: reconciliationId,
        productionCertificationCompletionId: completionId,
        productionCertificationCompletionStatus: status,
        nextAction: 'Production certification completion is complete. Continue to final SCIIP_OS production framework handoff or operational readiness processor.'
      });

      return {
        businessKey: [
          '3460_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONCOMPLETION',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationReconciliationId: reconciliationId,
        productionCertificationCompletionId: completionId,
        productionCertificationCompletionStatus: status,
        completionDate: now,
        completionScope: row.reconciliationScope || row.completionScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION',
        completionResult: status,
        completionSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3460_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONCOMPLETION',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionCertificationCompletionStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3450_SuperSheetImportExecutionProductionCertificationReconciliationProcessor after 3440 creates production certification archive records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3460_SuperSheetImportExecutionProductionCertificationCompletion',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3460_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONCOMPLETION',
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


function sciipTest3460_SuperSheetImportExecutionProductionCertificationCompletionProcessor() {
  var result = run3460_SuperSheetImportExecutionProductionCertificationCompletionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3460_SuperSheetImportExecutionProductionCertificationCompletionProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3460_SuperSheetImportExecutionProductionCertificationCompletionProcessor',
    result: result
  };
}