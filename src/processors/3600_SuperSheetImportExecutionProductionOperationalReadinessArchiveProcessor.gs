/*******************************************************
 * 3600_SuperSheetImportExecutionProductionOperationalReadinessArchiveProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3600_SuperSheetImportExecutionProductionOperationalReadinessArchiveProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3600',
    processorName: '3600_SuperSheetImportExecutionProductionOperationalReadinessArchive',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS_CLOSEOUTS',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS_ARCHIVE',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkActivationId',
      'operationalMonitoringId',
      'productionHealthCertificationId',
      'productionHealthArchiveId',
      'productionOperationalReadinessId',
      'productionOperationalReadinessCloseoutId',
      'productionOperationalReadinessArchiveId',
      'productionOperationalReadinessArchiveStatus',
      'archiveDate',
      'archiveScope',
      'archiveResult',
      'archiveSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3600_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSARCHIVE',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3600_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSARCHIVE',
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

      var healthArchiveId =
        row.productionHealthArchiveId ||
        [
          'PRODUCTION_HEALTH_ARCHIVE',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var readinessId =
        row.productionOperationalReadinessId ||
        [
          'PRODUCTION_OPERATIONAL_READINESS',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var closeoutId =
        row.productionOperationalReadinessCloseoutId ||
        [
          'PRODUCTION_OPERATIONAL_READINESS_CLOSEOUT',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var archiveId = [
        'PRODUCTION_OPERATIONAL_READINESS_ARCHIVE',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'OPERATIONAL_READINESS_ARCHIVED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3600_SuperSheetImportExecutionProductionOperationalReadinessArchive',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthArchiveId: healthArchiveId,
        productionOperationalReadinessId: readinessId,
        productionOperationalReadinessCloseoutId: closeoutId,
        productionOperationalReadinessArchiveId: archiveId,
        productionOperationalReadinessArchiveStatus: status,
        nextAction: 'Production operational readiness archive is complete. Continue to production operations continuity processor.'
      });

      return {
        businessKey: [
          '3600_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSARCHIVE',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthArchiveId: healthArchiveId,
        productionOperationalReadinessId: readinessId,
        productionOperationalReadinessCloseoutId: closeoutId,
        productionOperationalReadinessArchiveId: archiveId,
        productionOperationalReadinessArchiveStatus: status,
        archiveDate: now,
        archiveScope: row.closeoutScope || row.archiveScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS',
        archiveResult: status,
        archiveSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3600_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSARCHIVE',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionOperationalReadinessArchiveStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3590_SuperSheetImportExecutionProductionOperationalReadinessCloseoutProcessor after 3580 creates production operational readiness ledger summary records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3600_SuperSheetImportExecutionProductionOperationalReadinessArchive',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3600_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSARCHIVE',
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


function sciipTest3600_SuperSheetImportExecutionProductionOperationalReadinessArchiveProcessor() {
  var result = run3600_SuperSheetImportExecutionProductionOperationalReadinessArchiveProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3600_SuperSheetImportExecutionProductionOperationalReadinessArchiveProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3600_SuperSheetImportExecutionProductionOperationalReadinessArchiveProcessor',
    result: result
  };
}