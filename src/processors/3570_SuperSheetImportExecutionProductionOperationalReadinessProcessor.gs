/*******************************************************
 * 3570_SuperSheetImportExecutionProductionOperationalReadinessProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3570_SuperSheetImportExecutionProductionOperationalReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3570',
    processorName: '3570_SuperSheetImportExecutionProductionOperationalReadiness',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH_ARCHIVE',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS',

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
      'productionOperationalReadinessStatus',
      'readinessDate',
      'readinessScope',
      'readinessResult',
      'readinessSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3570_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESS',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3570_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESS',
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

      var healthArchiveId =
        row.productionHealthArchiveId ||
        [
          'PRODUCTION_HEALTH_ARCHIVE',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var readinessId = [
        'PRODUCTION_OPERATIONAL_READINESS',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'OPERATIONALLY_READY';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3570_SuperSheetImportExecutionProductionOperationalReadiness',
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
        productionOperationalReadinessStatus: status,
        nextAction: 'Production operational readiness is complete. Continue to operational readiness ledger processor.'
      });

      return {
        businessKey: [
          '3570_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESS',
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
        productionOperationalReadinessStatus: status,
        readinessDate: now,
        readinessScope: row.archiveScope || row.readinessScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS',
        readinessResult: status,
        readinessSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3570_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESS',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionOperationalReadinessStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3560_SuperSheetImportExecutionProductionHealthArchiveProcessor after 3550 creates production health closeout records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3570_SuperSheetImportExecutionProductionOperationalReadiness',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3570_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESS',
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


function sciipTest3570_SuperSheetImportExecutionProductionOperationalReadinessProcessor() {
  var result = run3570_SuperSheetImportExecutionProductionOperationalReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3570_SuperSheetImportExecutionProductionOperationalReadinessProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3570_SuperSheetImportExecutionProductionOperationalReadinessProcessor',
    result: result
  };
}