/*******************************************************
 * 3530_SuperSheetImportExecutionProductionHealthCertificationProcessor
 * SCIIP_OS v5.4 / Runtime v5.2 Compatible
 *******************************************************/

function run3530_SuperSheetImportExecutionProductionHealthCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3530',
    processorName: '3530_SuperSheetImportExecutionProductionHealthCertification',
    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_MONITORING_LEDGER_SUMMARY',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH_CERTIFICATIONS',

    targetHeaders: [
      'businessKey',
      'transactionId',
      'sourceBusinessKey',
      'productionCertificationId',
      'productionFrameworkActivationId',
      'operationalMonitoringId',
      'productionHealthCertificationId',
      'productionHealthCertificationStatus',
      'certificationDate',
      'certificationScope',
      'certificationResult',
      'certificationSummary',
      'frameworkVersion',
      'createdAt'
    ],

    buildBusinessKey: function(ctx) {
      return [
        '3530_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCERTIFICATION',
        ctx.targetSheetName,
        SCIIP_DateUtilities.todayKey()
      ].join('|');
    },

    mapRecord: function(row, ctx) {
      var now = SCIIP_DateUtilities.nowIso();

      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3530_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCERTIFICATION',
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

      var healthCertificationId = [
        'PRODUCTION_HEALTH_CERTIFICATION',
        productionCertificationId,
        SCIIP_DateUtilities.todayKey()
      ].join('|');

      var status = 'HEALTH_CERTIFIED';

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: '3530_SuperSheetImportExecutionProductionHealthCertification',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthCertificationStatus: status,
        nextAction: 'Production health certification is complete. Continue to production health certification ledger processor.'
      });

      return {
        businessKey: [
          '3530_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCERTIFICATION',
          productionCertificationId,
          SCIIP_DateUtilities.todayKey()
        ].join('|'),
        transactionId: transactionId,
        sourceBusinessKey: sourceBusinessKey,
        productionCertificationId: productionCertificationId,
        productionFrameworkActivationId: activationId,
        operationalMonitoringId: monitoringId,
        productionHealthCertificationId: healthCertificationId,
        productionHealthCertificationStatus: status,
        certificationDate: now,
        certificationScope: row.ledgerScope || row.certificationScope || 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HEALTH',
        certificationResult: status,
        certificationSummary: JSON.stringify(payload),
        frameworkVersion: row.frameworkVersion || 'v5.2',
        createdAt: now
      };
    },

    buildSkippedNoInputsResult: function(ctx) {
      var transactionId = SCIIP_RuntimePayloadFactory.createTransactionId(
        '3530_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCERTIFICATION',
        ctx.targetSheetName
      );

      var payload = SCIIP_RuntimePayloadFactory.createPayload({
        productionHealthCertificationStatus: 'SKIPPED_NO_INPUTS',
        sourceSheet: ctx.sourceSheetName,
        targetSheet: ctx.targetSheetName,
        transactionId: transactionId,
        nextAction: 'Run 3520_SuperSheetImportExecutionProductionOperationalMonitoringLedgerProcessor after 3510 creates operational monitoring records.'
      });

      return SCIIP_RuntimeResultFactory.createResult({
        processor: '3530_SuperSheetImportExecutionProductionHealthCertification',
        status: 'SKIPPED_NO_INPUTS',
        businessKey: [
          '3530_SUPERSHEETIMPORTEXECUTIONPRODUCTIONHEALTHCERTIFICATION',
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


function sciipTest3530_SuperSheetImportExecutionProductionHealthCertificationProcessor() {
  var result = run3530_SuperSheetImportExecutionProductionHealthCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3530_SuperSheetImportExecutionProductionHealthCertificationProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3530_SuperSheetImportExecutionProductionHealthCertificationProcessor',
    result: result
  };
}