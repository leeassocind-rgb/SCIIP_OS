/*******************************************************
 * 3520_SuperSheetImportExecutionProductionOperationalMonitoringLedgerProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3520_SuperSheetImportExecutionProductionOperationalMonitoringLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3520',
    processorName: '3520_SuperSheetImportExecutionProductionOperationalMonitoringLedger',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_MONITORING',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_MONITORING_LEDGER_SUMMARY',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkActivationId',
      'operationalMonitoringId',
      'operationalMonitoringStatus',
      'operationalMonitoringLedgerStatus',
      'ledgerDate',
      'ledgerScope',
      'ledgerResult',
      'ledgerSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3520_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALMONITORINGLEDGER',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3520_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALMONITORINGLEDGER',
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

      var monitoringStatus =
        row.operationalMonitoringStatus ||
        row.monitoringResult ||
        'MONITORING_ACTIVE';

      var ledgerStatus = 'LEDGER_SUMMARIZED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3520_SuperSheetImportExecutionProductionOperationalMonitoringLedger',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        operationalMonitoringStatus: monitoringStatus,
        operationalMonitoringLedgerStatus: ledgerStatus,
        nextAction: 'Production operational monitoring ledger summary is complete. Continue to production health certification processor.'
      });

      return {
        businessKey: [
          '3520_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALMONITORINGLEDGER',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        operationalMonitoringStatus: monitoringStatus,
        operationalMonitoringLedgerStatus: ledgerStatus,
        ledgerDate: now,
        ledgerScope: row.monitoringScope || row.ledgerScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_MONITORING',
        ledgerResult: ledgerStatus,
        ledgerSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3520_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALMONITORINGLEDGER',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        operationalMonitoringLedgerStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3510_SuperSheetImportExecutionProductionOperationalMonitoringProcessor after 3500 creates production framework activation ledger summary records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3520_SuperSheetImportExecutionProductionOperationalMonitoringLedger',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3520_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONALMONITORINGLEDGER',
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


function sciipTest3520_SuperSheetImportExecutionProductionOperationalMonitoringLedgerProcessor() {
  var result = run3520_SuperSheetImportExecutionProductionOperationalMonitoringLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3520_SuperSheetImportExecutionProductionOperationalMonitoringLedgerProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3520_SuperSheetImportExecutionProductionOperationalMonitoringLedgerProcessor',
    result: result
  };
}