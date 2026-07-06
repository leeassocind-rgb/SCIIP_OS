/*******************************************************
 * 3430_SuperSheetImportExecutionProductionCertificationCloseoutProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3430_SuperSheetImportExecutionProductionCertificationCloseoutProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3430',
    processorName: '3430_SuperSheetImportExecutionProductionCertificationCloseout',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_LEDGER_SUMMARY',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_CLOSEOUTS',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionCertificationCloseoutId',
      'productionCertificationCloseoutStatus',
      'closeoutDate',
      'closeoutScope',
      'closeoutResult',
      'closeoutSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3430_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONCLOSEOUT',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3430_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONCLOSEOUT',
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

      var closeoutId = [
        'PRODUCTION_CERTIFICATION_CLOSEOUT',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'CLOSED_OUT';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3430_SuperSheetImportExecutionProductionCertificationCloseout',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationCloseoutId: closeoutId,
        productionCertificationCloseoutStatus: status,
        nextAction: 'Production certification closeout is complete. Continue to production certification archive or final framework completion processor.'
      });

      return {
        businessKey: [
          '3430_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONCLOSEOUT',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationCloseoutId: closeoutId,
        productionCertificationCloseoutStatus: status,
        closeoutDate: now,
        closeoutScope: row.certificationScope || row.closeoutScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION',
        closeoutResult: status,
        closeoutSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3430_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONCLOSEOUT',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionCertificationCloseoutStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3420_SuperSheetImportExecutionProductionCertificationLedgerProcessor after 3410 creates production certification records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3430_SuperSheetImportExecutionProductionCertificationCloseout',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3430_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONCLOSEOUT',
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


function sciipTest3430_SuperSheetImportExecutionProductionCertificationCloseoutProcessor() {
  var result = run3430_SuperSheetImportExecutionProductionCertificationCloseoutProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3430_SuperSheetImportExecutionProductionCertificationCloseoutProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3430_SuperSheetImportExecutionProductionCertificationCloseoutProcessor',
    result: result
  };
}