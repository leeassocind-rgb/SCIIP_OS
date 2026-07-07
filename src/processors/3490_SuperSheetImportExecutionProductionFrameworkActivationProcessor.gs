/*******************************************************
 * 3490_SuperSheetImportExecutionProductionFrameworkActivationProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3490_SuperSheetImportExecutionProductionFrameworkActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3490',
    processorName: '3490_SuperSheetImportExecutionProductionFrameworkActivation',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK_ACCEPTANCES',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK_ACTIVATIONS',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkAcceptanceId',
      'productionFrameworkActivationId',
      'productionFrameworkActivationStatus',
      'activationDate',
      'activationScope',
      'activationResult',
      'activationSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3490_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACTIVATION',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3490_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACTIVATION',
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

      var acceptanceId =
        row.productionFrameworkAcceptanceId ||
        [
          'PRODUCTION_FRAMEWORK_ACCEPTANCE',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|');

      var activationId = [
        'PRODUCTION_FRAMEWORK_ACTIVATION',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'PRODUCTION_ACTIVE';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3490_SuperSheetImportExecutionProductionFrameworkActivation',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkAcceptanceId: acceptanceId,
        productionFrameworkActivationId: activationId,
        productionFrameworkActivationStatus: status,
        nextAction: 'Production framework activation is complete. Continue to production framework activation ledger or operational monitoring processor.'
      });

      return {
        businessKey: [
          '3490_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACTIVATION',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkAcceptanceId: acceptanceId,
        productionFrameworkActivationId: activationId,
        productionFrameworkActivationStatus: status,
        activationDate: now,
        activationScope: row.acceptanceScope || row.activationScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_FRAMEWORK',
        activationResult: status,
        activationSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3490_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACTIVATION',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionFrameworkActivationStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3480_SuperSheetImportExecutionProductionFrameworkAcceptanceProcessor after 3470 creates production framework handoff records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3490_SuperSheetImportExecutionProductionFrameworkActivation',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3490_SUPERSHEETIMPORTEXECUTIONPRODUCTIONFRAMEWORKACTIVATION',
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


function sciipTest3490_SuperSheetImportExecutionProductionFrameworkActivationProcessor() {
  var result = run3490_SuperSheetImportExecutionProductionFrameworkActivationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3490_SuperSheetImportExecutionProductionFrameworkActivationProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3490_SuperSheetImportExecutionProductionFrameworkActivationProcessor',
    result: result
  };
}