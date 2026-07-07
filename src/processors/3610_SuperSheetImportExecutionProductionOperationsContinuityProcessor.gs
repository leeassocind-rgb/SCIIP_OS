/***************************************
 * 3610_SuperSheetImportExecutionProductionOperationsContinuityProcessor.gs
 ***************************************/

const SCIIP_PROCESSOR_3610 = {
  processorNumber: 3610,
  processorName: '3610_SuperSheetImportExecutionProductionOperationsContinuity',
  sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONAL_READINESS_ARCHIVE',
  targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_OPERATIONS_CONTINUITY',
  businessKeyPrefix: '3610_SUPERSHEETIMPORTEXECUTIONPRODUCTIONOPERATIONSCONTINUITY'
};

function run3610_SuperSheetImportExecutionProductionOperationsContinuityProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.runProcessor({
    processorNumber: SCIIP_PROCESSOR_3610.processorNumber,
    processorName: SCIIP_PROCESSOR_3610.processorName,
    sourceSheetName: SCIIP_PROCESSOR_3610.sourceSheetName,
    targetSheetName: SCIIP_PROCESSOR_3610.targetSheetName,

    targetHeaders: [
      'Business_Key',
      'Continuity_ID',
      'Continuity_Status',
      'Source_Sheet',
      'Target_Sheet',
      'Source_Record_Count',
      'Continuity_Message',
      'Transaction_ID',
      'Runtime_Payload_JSON',
      'Runtime_Result_JSON',
      'Created_At'
    ],

    buildBusinessKey: function(context) {
      return [
        SCIIP_PROCESSOR_3610.businessKeyPrefix,
        SCIIP_PROCESSOR_3610.targetSheetName,
        SCIIP_DateUtilities.getTodayKey()
      ].join('|');
    },

    process: function(context) {
      const ss = context.spreadsheet;
      const transactionId = context.transactionId;

      const sourceSheet = SCIIP_RuntimeSheetFactory.getOrCreateSheet(
        ss,
        SCIIP_PROCESSOR_3610.sourceSheetName
      );

      const targetSheet = SCIIP_RuntimeSheetFactory.getOrCreateSheet(
        ss,
        SCIIP_PROCESSOR_3610.targetSheetName,
        context.targetHeaders
      );

      const sourceValues = sourceSheet.getDataRange().getValues();
      const sourceRecordCount = Math.max(sourceValues.length - 1, 0);

      const businessKey = context.businessKey;

      if (SCIIP_BusinessKeyUtilities.businessKeyExists(targetSheet, businessKey)) {
        return SCIIP_RuntimeResultFactory.createResult({
          processor: SCIIP_PROCESSOR_3610.processorName,
          status: 'SUCCESS',
          businessKey: businessKey,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsRead: sourceRecordCount,
          processed: 0,
          skippedDuplicate: 1,
          skippedNoInputs: 0,
          skippedValidation: 0,
          errors: 0,
          message: JSON.stringify({
            operationsContinuityStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: SCIIP_PROCESSOR_3610.sourceSheetName,
            targetSheet: SCIIP_PROCESSOR_3610.targetSheetName,
            transactionId: transactionId
          })
        });
      }

      if (sourceRecordCount === 0) {
        return SCIIP_RuntimeResultFactory.createResult({
          processor: SCIIP_PROCESSOR_3610.processorName,
          status: 'SKIPPED_NO_INPUTS',
          businessKey: businessKey,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsRead: 0,
          processed: 0,
          skippedDuplicate: 0,
          skippedNoInputs: 1,
          skippedValidation: 0,
          errors: 0,
          message: JSON.stringify({
            operationsContinuityStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: SCIIP_PROCESSOR_3610.sourceSheetName,
            targetSheet: SCIIP_PROCESSOR_3610.targetSheetName,
            transactionId: transactionId,
            nextAction: 'Run 3600_SuperSheetImportExecutionProductionOperationalReadinessArchiveProcessor after upstream production operational readiness records exist.'
          })
        });
      }

      const payload = SCIIP_RuntimePayloadFactory.createPayload({
        processor: SCIIP_PROCESSOR_3610.processorName,
        transactionId: transactionId,
        businessKey: businessKey,
        sourceSheet: SCIIP_PROCESSOR_3610.sourceSheetName,
        targetSheet: SCIIP_PROCESSOR_3610.targetSheetName,
        sourceRecordCount: sourceRecordCount,
        continuityStatus: 'PRODUCTION_OPERATIONS_CONTINUITY_CONFIRMED',
        continuityScope: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_RUNTIME_CONTINUITY',
        createdAt: new Date().toISOString()
      });

      const result = SCIIP_RuntimeResultFactory.createResult({
        processor: SCIIP_PROCESSOR_3610.processorName,
        status: 'SUCCESS',
        businessKey: businessKey,
        recordsCreated: 1,
        recordsUpdated: 0,
        recordsRead: sourceRecordCount,
        processed: sourceRecordCount,
        skippedDuplicate: 0,
        skippedNoInputs: 0,
        skippedValidation: 0,
        errors: 0,
        message: JSON.stringify({
          operationsContinuityStatus: 'SUCCESS',
          sourceSheet: SCIIP_PROCESSOR_3610.sourceSheetName,
          targetSheet: SCIIP_PROCESSOR_3610.targetSheetName,
          transactionId: transactionId,
          nextProcessor: '3620_SuperSheetImportExecutionProductionOperationsContinuityLedgerProcessor'
        })
      });

      targetSheet.appendRow([
        businessKey,
        Utilities.getUuid(),
        'PRODUCTION_OPERATIONS_CONTINUITY_CONFIRMED',
        SCIIP_PROCESSOR_3610.sourceSheetName,
        SCIIP_PROCESSOR_3610.targetSheetName,
        sourceRecordCount,
        'Production operations continuity confirmed from production operational readiness archive.',
        transactionId,
        JSON.stringify(payload),
        JSON.stringify(result),
        new Date()
      ]);

      return result;
    }
  });
}

function sciipTest3610_SuperSheetImportExecutionProductionOperationsContinuityProcessor() {
  const result = run3610_SuperSheetImportExecutionProductionOperationsContinuityProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest3610_SuperSheetImportExecutionProductionOperationsContinuityProcessor',
    result: result
  }));
  return result;
}