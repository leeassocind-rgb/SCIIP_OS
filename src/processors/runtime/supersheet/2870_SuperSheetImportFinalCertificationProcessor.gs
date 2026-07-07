/*******************************************************
 * SCIIP_OS v5.4 Runtime Processor
 * 2870_SuperSheetImportFinalCertificationProcessor
 *
 * SUPERSHEET_IMPORT_DAILY_BRIEF → SUPERSHEET_IMPORT_FINAL_CERTIFICATIONS
 *
 * Purpose:
 * Final certification layer for the SuperSheet import protection chain.
 * Certifies whether the SuperSheet intake firewall is ready before
 * production SuperSheet loading / promotion / matching activity.
 *******************************************************/

function sciipGetSuperSheetImportFinalCertificationProcessorName2870_() {
  return '2870_SuperSheetImportFinalCertification';
}

function sciipGetSuperSheetImportFinalCertificationHeaders2870_() {
  return [
    'Certification_ID',
    'Business_Key',
    'Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Status',
    'Import_Readiness_Status',
    'Quality_Posture',
    'Promotion_Gate_Posture',
    'Command_Center_Posture',
    'Certification_Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureSuperSheetImportFinalCertificationSchema2870_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_FINAL_CERTIFICATIONS',
    sciipGetSuperSheetImportFinalCertificationHeaders2870_()
  );
}

function sciipRunSuperSheetImportFinalCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_(),
    action: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_BUILD',
    sourceSheet: 'SUPERSHEET_IMPORT_DAILY_BRIEF',
    targetSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATIONS',
    ledgerSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const dailyBriefRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: dailyBriefRecords.length,
        outputCount: dailyBriefRecords.length ? 1 : 0,
        summary: 'SuperSheet import final certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeVersion: 'v5.4',
          originalProcessor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_(),
          inputSheets: ['SUPERSHEET_IMPORT_DAILY_BRIEF']
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
      const outputSheet = sciipEnsureSuperSheetImportFinalCertificationSchema2870_();
      const certificationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const finalCertificationBusinessKey = 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION|' + certificationDate;

      if (sciipSuperSheetRuntimeBusinessKeyExists2870_(definition.targetSheet, finalCertificationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importFinalCertificationStatus: 'DUPLICATE_SKIPPED',
            finalCertificationBusinessKey: finalCertificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const dailyBriefRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!dailyBriefRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importFinalCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2860_SuperSheetImportDailyBriefProcessor after 2850 creates command center updates.'
          })
        });
      }

      const latestBrief = sciipGetLatestSuperSheetRecord2870_(dailyBriefRecords);
      const certificationStatus = sciipResolveSuperSheetFinalCertificationStatus2870_(latestBrief);
      const row = sciipCreateSuperSheetFinalCertificationRow2870_({
        businessKey: finalCertificationBusinessKey,
        certificationDate: certificationDate,
        sourceRows: dailyBriefRecords,
        latestBrief: latestBrief,
        certificationStatus: certificationStatus,
        processor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_()
      });

      outputSheet.appendRow(row);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: dailyBriefRecords.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          importFinalCertificationStatus: certificationStatus,
          dailyBriefRecordsReviewed: dailyBriefRecords.length,
          finalCertificationsCreated: 1,
          finalCertificationBusinessKey: finalCertificationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: 'Production SuperSheet import / promotion workflow'
        })
      });
    }
  });
}

function sciipSuperSheetRuntimeBusinessKeyExists2870_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciipGetLatestSuperSheetRecord2870_(records) {
  if (!records || !records.length) return {};
  return records[records.length - 1] || {};
}

function sciipResolveSuperSheetFinalCertificationStatus2870_(brief) {
  const values = Object.keys(brief || {}).map(function(key) {
    return String(brief[key] || '').toUpperCase();
  }).join(' | ');

  if (values.indexOf('FAILED') !== -1 || values.indexOf('BLOCKED') !== -1 || values.indexOf('NOT_READY') !== -1) {
    return 'NOT_CERTIFIED';
  }

  if (values.indexOf('SKIPPED_NO_INPUTS') !== -1 || values.indexOf('NEEDS_REVIEW') !== -1 || values.indexOf('REVIEW_REQUIRED') !== -1) {
    return 'CONDITIONALLY_CERTIFIED_REVIEW_REQUIRED';
  }

  return 'CERTIFIED';
}

function sciipCreateSuperSheetFinalCertificationRow2870_(args) {
  const status = args.certificationStatus;

  return [
    'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_' + Utilities.getUuid(),
    args.businessKey,
    args.certificationDate,
    'SUPERSHEET_IMPORT_DAILY_BRIEF',
    args.sourceRows.length,
    status,
    sciipResolveImportReadinessPosture2870_(args.latestBrief),
    sciipResolveQualityPosture2870_(args.latestBrief),
    sciipResolvePromotionGatePosture2870_(args.latestBrief),
    sciipResolveCommandCenterPosture2870_(args.latestBrief),
    sciipCreateSuperSheetFinalCertificationSummary2870_(status, args.sourceRows.length),
    sciipCreateSuperSheetFinalCertificationNextAction2870_(status),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipResolveImportReadinessPosture2870_(record) {
  return String(record.Import_Readiness_Status || record.Readiness_Status || record.importReadinessStatus || 'UNKNOWN').trim() || 'UNKNOWN';
}

function sciipResolveQualityPosture2870_(record) {
  return String(record.Quality_Posture || record.Data_Quality_Posture || record.dataQualityStatus || 'UNKNOWN').trim() || 'UNKNOWN';
}

function sciipResolvePromotionGatePosture2870_(record) {
  return String(record.Promotion_Gate_Posture || record.PromotionGate_Status || record.promotionGateStatus || 'UNKNOWN').trim() || 'UNKNOWN';
}

function sciipResolveCommandCenterPosture2870_(record) {
  return String(record.Command_Center_Posture || record.Command_Center_Status || record.importCommandCenterStatus || 'UNKNOWN').trim() || 'UNKNOWN';
}

function sciipCreateSuperSheetFinalCertificationSummary2870_(status, count) {
  if (status === 'CERTIFIED') {
    return 'SuperSheet import firewall is certified based on ' + count + ' daily brief record(s). Production import may proceed subject to normal operator controls.';
  }

  if (status === 'CONDITIONALLY_CERTIFIED_REVIEW_REQUIRED') {
    return 'SuperSheet import firewall completed with review-required indicators based on ' + count + ' daily brief record(s). Operator review is recommended before production import.';
  }

  return 'SuperSheet import firewall is not certified. Production import should remain blocked until upstream quality/readiness issues are resolved.';
}

function sciipCreateSuperSheetFinalCertificationNextAction2870_(status) {
  if (status === 'CERTIFIED') {
    return 'Proceed to controlled SuperSheet production import / promotion workflow.';
  }

  if (status === 'CONDITIONALLY_CERTIFIED_REVIEW_REQUIRED') {
    return 'Review SuperSheet import daily brief and command center records before enabling production promotion.';
  }

  return 'Resolve upstream SuperSheet quality, readiness, certification, or command center issues before importing.';
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2870_SuperSheetImportFinalCertificationProcessor() {
  const result = sciipRunSuperSheetImportFinalCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2870_SuperSheetImportFinalCertificationProcessor',
    result: result
  }));

  return result;
}
