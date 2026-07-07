/*******************************************************
 * 3590_SuperSheetImportExecutionProductionOperationalReadinessCloseoutProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3590_SuperSheetImportExecutionProductionOperationalReadinessCloseoutProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3590',
    processorName: '3590_SuperSheetImportExecutionProductionOperationalReadinessCloseout',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS_LEDGER_SUMMARY',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS_CLOSEOUTS',

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
      'productionOperationalReadinessCloseoutStatus',
      'closeoutDate',
      'closeoutScope',
      'closeoutResult',
      'closeoutSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3590_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSCLOSEOUT',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3590_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSCLOSEOUT',
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

      var closeoutId = [
        'PRODUCTION_OPERATIONAL_READINESS_CLOSEOUT',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'OPERATIONAL_READINESS_CLOSED_OUT';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3590_SuperSheetImportExecutionProductionOperationalReadinessCloseout',
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
        productionOperationalReadinessCloseoutStatus: status,
        nextAction: 'Production operational readiness closeout is complete. Continue to production operational readiness archive processor.'
      });

      return {
        businessKey: [
          '3590_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSCLOSEOUT',
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
        productionOperationalReadinessCloseoutStatus: status,
        closeoutDate: now,
        closeoutScope: row.ledgerScope || row.closeoutScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS',
        closeoutResult: status,
        closeoutSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3590_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSCLOSEOUT',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionOperationalReadinessCloseoutStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3580_SuperSheetImportExecutionProductionOperationalReadinessLedgerProcessor after 3570 creates production operational readiness records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3590_SuperSheetImportExecutionProductionOperationalReadinessCloseout',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3590_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALREADINESSCLOSEOUT',
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


function sciipTest3590_SuperSheetImportExecutionProductionOperationalReadinessCloseoutProcessor() {
  var result = run3590_SuperSheetImportExecutionProductionOperationalReadinessCloseoutProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3590_SuperSheetImportExecutionProductionOperationalReadinessCloseoutProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3590_SuperSheetImportExecutionProductionOperationalReadinessCloseoutProcessor',
    result: result
  };
}