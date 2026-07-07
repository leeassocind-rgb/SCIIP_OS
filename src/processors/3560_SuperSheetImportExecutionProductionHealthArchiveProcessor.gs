/*******************************************************
 * 3560_SuperSheetImportExecutionProductionHealthArchiveProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3560_SuperSheetImportExecutionProductionHealthArchiveProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3560',
    processorName: '3560_SuperSheetImportExecutionProductionHealthArchive',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH_CLOSEOUTS',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH_ARCHIVE',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkActivationId',
      'operationalMonitoringId',
      'productionHealthCertificationId',
      'productionHealthCloseoutId',
      'productionHealthArchiveId',
      'productionHealthArchiveStatus',
      'archiveDate',
      'archiveScope',
      'archiveResult',
      'archiveSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3560_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHARCHIVE',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3560_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHARCHIVE',
        ctx.targetSheetName
      );

      var sourceBusinessKey = row.businessKey || row.sourceBusinessKey || '';

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

      var closeoutId =
        row.productionHealthCloseoutId ||
        [
          'PRODUCTION_HEALTH_CLOSEOUT',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var archiveId = [
        'PRODUCTION_HEALTH_ARCHIVE',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'HEALTH_ARCHIVED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3560_SuperSheetImportExecutionProductionHealthArchive',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthCloseoutId: closeoutId,
        productionHealthArchiveId: archiveId,
        productionHealthArchiveStatus: status,
        nextAction: 'Production health archive is complete. Continue to production operational readiness processor.'
      });

      return {
        businessKey: [
          '3560_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHARCHIVE',
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
        productionHealthArchiveId: archiveId,
        productionHealthArchiveStatus: status,
        archiveDate: now,
        archiveScope: row.closeoutScope || row.archiveScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH',
        archiveResult: status,
        archiveSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3560_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHARCHIVE',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionHealthArchiveStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3550_SuperSheetImportExecutionProductionHealthCloseoutProcessor after 3540 creates production health certification ledger summary records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3560_SuperSheetImportExecutionProductionHealthArchive',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3560_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHARCHIVE',
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


function sciipTest3560_SuperSheetImportExecutionProductionHealthArchiveProcessor() {
  var result = run3560_SuperSheetImportExecutionProductionHealthArchiveProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3560_SuperSheetImportExecutionProductionHealthArchiveProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3560_SuperSheetImportExecutionProductionHealthArchiveProcessor',
    result: result
  };
}