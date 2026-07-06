/*******************************************************
 * 3420_SuperSheetImportExecutionProductionCertificationLedgerProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3420_SuperSheetImportExecutionProductionCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3420',
    processorName: '3420_SuperSheetImportExecutionProductionCertificationLedger',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATIONS',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_LEDGER_SUMMARY',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionCertificationStatus',
      'certificationDate',
      'certificationScope',
      'certificationResult',
      'certificationSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3420_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONLEDGER',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3420_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONLEDGER',
        ctx.targetSheetName
      );

      var sourceBusinessKey =
        row.businessKey ||
        row.productionCertificationBusinessKey ||
        '';

      var productionCertificationId =
        row.productionCertificationId ||
        sourceBusinessKey ||
        transactionId;

      var status =
        row.productionCertificationStatus ||
        row.status ||
        'CERTIFIED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3420_SuperSheetImportExecutionProductionCertificationLedger',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationStatus: status,
        nextAction: 'Production certification ledger summary is complete. Continue to downstream production certification closure or archive processor.'
      });

      return {
        businessKey: [
          '3420_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONLEDGER',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionCertificationStatus: status,
        certificationDate: row.completedAt || row.createdAt || now,
        certificationScope: row.certificationScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST',
        certificationResult: row.certificationResult || status,
        certificationSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3420_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONLEDGER',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionCertificationLedgerStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3410_SuperSheetImportExecutionProductionCertificationProcessor after 3400 creates production test result records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3420_SuperSheetImportExecutionProductionCertificationLedger',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3420_SUPERSHEETIMPORTEXECUTIONPRODUCTIONCERTIFICATIONLEDGER',
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


function sciipTest3420_SuperSheetImportExecutionProductionCertificationLedgerProcessor() {
  var result = run3420_SuperSheetImportExecutionProductionCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3420_SuperSheetImportExecutionProductionCertificationLedgerProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3420_SuperSheetImportExecutionProductionCertificationLedgerProcessor',
    result: result
  };
}