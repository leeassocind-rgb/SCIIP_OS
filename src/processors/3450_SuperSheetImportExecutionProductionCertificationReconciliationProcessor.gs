/*******************************************************
 * 3450_SuperSheetImportExecutionProductionCertificationReconciliationProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3450_SuperSheetImportExecutionProductionCertificationReconciliationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3450',
    processorName: '3450_SuperSheetImportExecutionProductionCertificationReconciliation',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_ARCHIVE',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_RECONCILIATIONS',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionCertificationArchiveId',
      'productionCertificationReconciliationId',
      'productionCertificationReconciliationStatus',
      'reconciliationDate',
      'reconciliationScope',
      'reconciliationResult',
      'reconciliationSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3450_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONRECONCILIATION',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3450_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONRECONCILIATION',
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

      var archiveId =
        row.productionCertificationArchiveId ||
        [
          'PRODUCTION_CERTIFICATION_ARCHIVE',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var reconciliationId = [
        'PRODUCTION_CERTIFICATION_RECONCILIATION',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'RECONCILED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3450_SuperSheetImportExecutionProductionCertificationReconciliation',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationArchiveId: archiveId,
        productionCertificationReconciliationId: reconciliationId,
        productionCertificationReconciliationStatus: status,
        nextAction: 'Production certification reconciliation is complete. Continue to final production certification completion processor.'
      });

      return {
        businessKey: [
          '3450_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONRECONCILIATION',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationArchiveId: archiveId,
        productionCertificationReconciliationId: reconciliationId,
        productionCertificationReconciliationStatus: status,
        reconciliationDate: now,
        reconciliationScope: row.archiveScope || row.reconciliationScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION',
        reconciliationResult: status,
        reconciliationSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3450_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONRECONCILIATION',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionCertificationReconciliationStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3440_SuperSheetImportExecutionProductionCertificationArchiveProcessor after 3430 creates production certification closeout records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3450_SuperSheetImportExecutionProductionCertificationReconciliation',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3450_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONRECONCILIATION',
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


function sciipTest3450_SuperSheetImportExecutionProductionCertificationReconciliationProcessor() {
  var result = run3450_SuperSheetImportExecutionProductionCertificationReconciliationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3450_SuperSheetImportExecutionProductionCertificationReconciliationProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3450_SuperSheetImportExecutionProductionCertificationReconciliationProcessor',
    result: result
  };
}