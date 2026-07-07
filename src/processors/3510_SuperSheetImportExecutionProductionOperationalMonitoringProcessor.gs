/*******************************************************
 * 3510_SuperSheetImportExecutionProductionOperationalMonitoringProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3510_SuperSheetImportExecutionProductionOperationalMonitoringProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3510',
    processorName: '3510_SuperSheetImportExecutionProductionOperationalMonitoring',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK_ACTIVATION_LEDGER_SUMMARY',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_MONITORING',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkActivationId',
      'operationalMonitoringId',
      'operationalMonitoringStatus',
      'monitoringDate',
      'monitoringScope',
      'monitoringResult',
      'monitoringSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3510_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALMONITORING',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3510_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALMONITORING',
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

      var monitoringId = [
        'PRODUCTION_OPERATIONAL_MONITORING',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'MONITORING_ACTIVE';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3510_SuperSheetImportExecutionProductionOperationalMonitoring',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        operationalMonitoringStatus: status,
        nextAction: 'Production operational monitoring is active. Continue to operational monitoring ledger or production health certification processor.'
      });

      return {
        businessKey: [
          '3510_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALMONITORING',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        operationalMonitoringStatus: status,
        monitoringDate: now,
        monitoringScope: row.ledgerScope || row.monitoringScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_MONITORING',
        monitoringResult: status,
        monitoringSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3510_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALMONITORING',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        operationalMonitoringStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3500_SuperSheetImportExecutionProductionFrameworkActivationLedgerProcessor after 3490 creates production framework activation records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3510_SuperSheetImportExecutionProductionOperationalMonitoring',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3510_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALMONITORING',
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


function sciipTest3510_SuperSheetImportExecutionProductionOperationalMonitoringProcessor() {
  var result = run3510_SuperSheetImportExecutionProductionOperationalMonitoringProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3510_SuperSheetImportExecutionProductionOperationalMonitoringProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3510_SuperSheetImportExecutionProductionOperationalMonitoringProcessor',
    result: result
  };
}