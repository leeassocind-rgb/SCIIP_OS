/*******************************************************
 * 3500_SuperSheetImportExecutionProductionFrameworkActivationLedgerProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3500_SuperSheetImportExecutionProductionFrameworkActivationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3500',
    processorName: '3500_SuperSheetImportExecutionProductionFrameworkActivationLedger',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK_ACTIVATIONS',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK_ACTIVATION_LEDGER_SUMMARY',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkActivationId',
      'productionFrameworkActivationStatus',
      'activationLedgerStatus',
      'ledgerDate',
      'ledgerScope',
      'ledgerResult',
      'ledgerSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3500_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACTIVATIONLEDGER',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3500_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACTIVATIONLEDGER',
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

      var activationStatus =
        row.productionFrameworkActivationStatus ||
        row.activationResult ||
        'PRODUCTION_ACTIVE';

      var ledgerStatus = 'LEDGER_SUMMARIZED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3500_SuperSheetImportExecutionProductionFrameworkActivationLedger',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        productionFrameworkActivationStatus: activationStatus,
        activationLedgerStatus: ledgerStatus,
        nextAction: 'Production framework activation ledger summary is complete. Continue to operational monitoring or final production framework continuity processor.'
      });

      return {
        businessKey: [
          '3500_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACTIVATIONLEDGER',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        productionFrameworkActivationStatus: activationStatus,
        activationLedgerStatus: ledgerStatus,
        ledgerDate: now,
        ledgerScope: row.activationScope || row.ledgerScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK',
        ledgerResult: ledgerStatus,
        ledgerSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3500_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACTIVATIONLEDGER',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionFrameworkActivationLedgerStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3490_SuperSheetImportExecutionProductionFrameworkActivationProcessor after 3480 creates production framework acceptance records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3500_SuperSheetImportExecutionProductionFrameworkActivationLedger',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3500_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACTIVATIONLEDGER',
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


function sciipTest3500_SuperSheetImportExecutionProductionFrameworkActivationLedgerProcessor() {
  var result = run3500_SuperSheetImportExecutionProductionFrameworkActivationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3500_SuperSheetImportExecutionProductionFrameworkActivationLedgerProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3500_SuperSheetImportExecutionProductionFrameworkActivationLedgerProcessor',
    result: result
  };
}