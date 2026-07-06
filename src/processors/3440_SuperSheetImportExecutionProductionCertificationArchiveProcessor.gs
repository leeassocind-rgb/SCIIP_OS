/*******************************************************
 * 3440_SuperSheetImportExecutionProductionCertificationArchiveProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3440_SuperSheetImportExecutionProductionCertificationArchiveProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3440',
    processorName: '3440_SuperSheetImportExecutionProductionCertificationArchive',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_CLOSEOUTS',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_ARCHIVE',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionCertificationCloseoutId',
      'productionCertificationArchiveId',
      'productionCertificationArchiveStatus',
      'archiveDate',
      'archiveScope',
      'archiveResult',
      'archiveSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3440_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONARCHIVE',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3440_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONARCHIVE',
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

      var closeoutId =
        row.productionCertificationCloseoutId ||
        [
          'PRODUCTION_CERTIFICATION_CLOSEOUT',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var archiveId = [
        'PRODUCTION_CERTIFICATION_ARCHIVE',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'ARCHIVED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3440_SuperSheetImportExecutionProductionCertificationArchive',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationCloseoutId: closeoutId,
        productionCertificationArchiveId: archiveId,
        productionCertificationArchiveStatus: status,
        nextAction: 'Production certification archive is complete. Continue to final production certification reconciliation or framework completion processor.'
      });

      return {
        businessKey: [
          '3440_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONARCHIVE',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationCloseoutId: closeoutId,
        productionCertificationArchiveId: archiveId,
        productionCertificationArchiveStatus: status,
        archiveDate: now,
        archiveScope: row.closeoutScope || row.archiveScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION',
        archiveResult: status,
        archiveSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3440_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONARCHIVE',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionCertificationArchiveStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3430_SuperSheetImportExecutionProductionCertificationCloseoutProcessor after 3420 creates production certification ledger summary records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3440_SuperSheetImportExecutionProductionCertificationArchive',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3440_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONARCHIVE',
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


function sciipTest3440_SuperSheetImportExecutionProductionCertificationArchiveProcessor() {
  var result = run3440_SuperSheetImportExecutionProductionCertificationArchiveProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3440_SuperSheetImportExecutionProductionCertificationArchiveProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3440_SuperSheetImportExecutionProductionCertificationArchiveProcessor',
    result: result
  };
}