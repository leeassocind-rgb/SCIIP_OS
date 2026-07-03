/*******************************************************
 * SCIIP_OS v5.4 Runtime Processor
 * 2830_SuperSheetImportCertificationProcessor
 *
 * SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_CERTIFICATIONS
 *******************************************************/

function sciipGet2830_SuperSheetImportCertificationProcessorName_() {
  return '2830_SuperSheetImportCertification';
}

function sciipGet2830_SuperSheetImportCertificationSourceSheet_() {
  return 'SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY';
}

function sciipGet2830_SuperSheetImportCertificationTargetSheet_() {
  return 'SUPERSHEET_IMPORT_CERTIFICATIONS';
}

function sciipGet2830_SuperSheetImportCertificationLedgerSheet_() {
  return 'SUPERSHEET_IMPORT_CERTIFICATIONS_RUNTIME_LEDGER';
}

function sciipGet2830_SuperSheetImportCertificationHeaders_() {
  return [
    'Certification_ID',
    'Business_Key',
    'Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Status',
    'Certification_Summary',
    'Import_Readiness_Status',
    'Promotion_Readiness_Status',
    'Recommended_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2830_SuperSheetImportCertificationSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2830_SuperSheetImportCertificationTargetSheet_(),
    sciipGet2830_SuperSheetImportCertificationHeaders_()
  );
}

function sciipRun2830_SuperSheetImportCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2830_SuperSheetImportCertificationProcessorName_(),
    action: 'SUPERSHEET_IMPORT_CERTIFICATION_BUILD',
    sourceSheet: sciipGet2830_SuperSheetImportCertificationSourceSheet_(),
    targetSheet: sciipGet2830_SuperSheetImportCertificationTargetSheet_(),
    ledgerSheet: sciipGet2830_SuperSheetImportCertificationLedgerSheet_(),

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import certification runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          processorVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2830_SuperSheetImportCertificationProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2820_SuperSheetImportReadinessLedgerProcessor after 2810 creates readiness records.'
          })
        });
      }

      const certificationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const certificationBusinessKey = 'SUPERSHEET_IMPORT_CERTIFICATION|' + certificationDate;

      if (sciip2830_BusinessKeyExists_(definition.targetSheet, certificationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2830_SuperSheetImportCertificationProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importCertificationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            skippedDuplicate: 1,
            importCertificationBusinessKey: certificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const certification = sciip2830_BuildImportCertification_({
        businessKey: certificationBusinessKey,
        certificationDate: certificationDate,
        sourceRecords: sourceRecords,
        processor: sciipGet2830_SuperSheetImportCertificationProcessorName_()
      });

      const sheet = sciipEnsure2830_SuperSheetImportCertificationSheet_();
      sheet.appendRow(sciipGet2830_SuperSheetImportCertificationHeaders_().map(function(header) {
        return certification[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2830_SuperSheetImportCertificationProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          importCertificationStatus: certification.Certification_Status,
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          importReadinessLedgerRecordsReviewed: sourceRecords.length,
          importCertificationBusinessKey: certificationBusinessKey,
          recommendedAction: certification.Recommended_Action,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciip2830_BuildImportCertification_(args) {
  const readinessStatus = sciip2830_ResolveReadinessStatus_(args.sourceRows || args.sourceRecords || []);
  const promotionStatus = sciip2830_ResolvePromotionReadinessStatus_(args.sourceRows || args.sourceRecords || []);
  const certificationStatus = sciip2830_ResolveCertificationStatus_(readinessStatus, promotionStatus);
  const recommendedAction = sciip2830_ResolveRecommendedAction_(certificationStatus);

  return {
    Certification_ID: 'SUPERSHEET_IMPORT_CERTIFICATION_' + Utilities.getUuid(),
    Business_Key: args.businessKey,
    Certification_Date: args.certificationDate,
    Source_Sheet: sciipGet2830_SuperSheetImportCertificationSourceSheet_(),
    Source_Record_Count: (args.sourceRecords || []).length,
    Certification_Status: certificationStatus,
    Certification_Summary: sciip2830_BuildCertificationSummary_(certificationStatus, args.sourceRecords || []),
    Import_Readiness_Status: readinessStatus,
    Promotion_Readiness_Status: promotionStatus,
    Recommended_Action: recommendedAction,
    Created_At: new Date().toISOString(),
    Processor: args.processor
  };
}

function sciip2830_ResolveReadinessStatus_(records) {
  const text = JSON.stringify(records || {}).toUpperCase();
  if (text.indexOf('NOT_READY') !== -1 || text.indexOf('BLOCKED') !== -1 || text.indexOf('FAILED') !== -1) {
    return 'NOT_READY';
  }
  if (text.indexOf('READY') !== -1 || text.indexOf('PASS') !== -1 || text.indexOf('CERTIFIED') !== -1) {
    return 'READY';
  }
  return 'UNKNOWN';
}

function sciip2830_ResolvePromotionReadinessStatus_(records) {
  const text = JSON.stringify(records || {}).toUpperCase();
  if (text.indexOf('NEEDS_REVIEW') !== -1 || text.indexOf('REVIEW_REQUIRED') !== -1) {
    return 'REVIEW_REQUIRED';
  }
  if (text.indexOf('AUTO_PROMOTE_READY') !== -1 || text.indexOf('READY') !== -1 || text.indexOf('CERTIFIED') !== -1) {
    return 'PROMOTION_READY';
  }
  return 'UNKNOWN';
}

function sciip2830_ResolveCertificationStatus_(readinessStatus, promotionStatus) {
  if (readinessStatus === 'NOT_READY') return 'NOT_CERTIFIED';
  if (readinessStatus === 'READY' && promotionStatus === 'PROMOTION_READY') return 'CERTIFIED';
  if (readinessStatus === 'READY' && promotionStatus === 'REVIEW_REQUIRED') return 'CERTIFIED_WITH_REVIEW';
  return 'PENDING_INPUT_VALIDATION';
}

function sciip2830_ResolveRecommendedAction_(certificationStatus) {
  if (certificationStatus === 'CERTIFIED') return 'ALLOW_IMPORT_AND_PROMOTION';
  if (certificationStatus === 'CERTIFIED_WITH_REVIEW') return 'ALLOW_IMPORT_WITH_MANUAL_REVIEW';
  if (certificationStatus === 'NOT_CERTIFIED') return 'HOLD_IMPORT';
  return 'WAIT_FOR_COMPLETE_READINESS_INPUTS';
}

function sciip2830_BuildCertificationSummary_(certificationStatus, records) {
  return [
    'SuperSheet import certification status: ' + certificationStatus + '.',
    'Reviewed ' + (records || []).length + ' import readiness ledger summary record(s).',
    'This record controls whether SuperSheet data may proceed from intake protection into downstream matching and promotion workflows.'
  ].join(' ');
}

function sciip2830_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2830_SuperSheetImportCertificationProcessor() {
  const result = sciipRun2830_SuperSheetImportCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2830_SuperSheetImportCertificationProcessor',
    result: result
  }));

  return result;
}
