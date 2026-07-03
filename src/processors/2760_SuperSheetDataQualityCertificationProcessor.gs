/**
 * SCIIP_OS v5.4
 * SuperSheet Data Quality Certification Processor
 * File: 2760_SuperSheetDataQualityCertificationProcessor.gs
 *
 * Processor: 2760_SuperSheetDataQualityCertification
 *
 * Purpose:
 * Certifies the SuperSheet import data-quality posture based on
 * SUPERSHEET_DATA_QUALITY_DIGEST records produced by
 * 2750_SuperSheetDataQualityDigestProcessor.
 *
 * This processor is non-destructive and skip-safe.
 */

function sciipRun2760_SuperSheetDataQualityCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2760_SuperSheetDataQualityCertification',
    action: 'SUPERSHEET_DATA_QUALITY_CERTIFICATION_BUILD',
    sourceSheet: 'SUPERSHEET_DATA_QUALITY_DIGEST',
    targetSheet: 'SUPERSHEET_DATA_QUALITY_CERTIFICATIONS',
    ledgerSheet: 'SUPERSHEET_DATA_QUALITY_CERTIFICATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var digests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: digests.length,
        outputCount: digests.length ? 1 : 0,
        summary: 'SuperSheet data quality certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_CERTIFICATION',
          upstreamProcessor: '2750_SuperSheetDataQualityDigest'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing source sheet.');
      if (!definition.targetSheet) errors.push('Missing target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var certificationHeaders = sciipGet2760_SuperSheetDataQualityCertificationHeaders_();
      var runtimeLedgerHeaders = sciipGet2760_SuperSheetDataQualityCertificationRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        certificationHeaders
      );

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.ledgerSheet,
        runtimeLedgerHeaders
      );

      var digests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!digests || digests.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            dataQualityCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2750_SuperSheetDataQualityDigestProcessor after 2740 creates ledger summaries.'
          })
        });

        sciipAppend2760_SuperSheetDataQualityCertificationRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Certification_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: 0,
            Certifications_Created: 0,
            Certification_Date: '',
            Certification_Decision: 'NO_INPUTS',
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var certificationDate = sciipResolve2760_LatestDigestDate_(digests) ||
        SCIIP_RUNTIME.getDateKey({});

      var certificationBusinessKey = 'SUPERSHEET_DATA_QUALITY_CERTIFICATION|' + certificationDate;

      if (sciip2760_CertificationBusinessKeyExists_(definition.targetSheet, certificationBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: digests.length,
          processed: 0,
          message: JSON.stringify({
            dataQualityCertificationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: digests.length,
            certificationBusinessKey: certificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2760_SuperSheetDataQualityCertificationRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Certification_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: digests.length,
            Certifications_Created: 0,
            Certification_Date: certificationDate,
            Certification_Decision: 'DUPLICATE',
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var digestsForDate = sciipFilter2760_DigestsByDate_(digests, certificationDate);
      var latestDigest = sciipSelect2760_LatestDigestForDate_(digestsForDate);
      var certification = sciipBuild2760_SuperSheetDataQualityCertification_(latestDigest, digestsForDate);

      var certificationRecord = {
        Certification_ID: 'SUPERSHEET_DATA_QUALITY_CERTIFICATION_' + Utilities.getUuid(),
        Business_Key: certificationBusinessKey,
        Certification_Date: certificationDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: digestsForDate.length,
        Digest_Business_Key: certification.digestBusinessKey,
        Total_Records_Assessed: certification.totalRecordsAssessed,
        Average_Quality_Score: certification.averageQualityScore,
        Digest_Rating: certification.digestRating,
        Data_Quality_Posture: certification.dataQualityPosture,
        Certification_Decision: certification.certificationDecision,
        Certification_Status: certification.certificationStatus,
        Certification_Risk_Level: certification.certificationRiskLevel,
        Promotion_Gate: certification.promotionGate,
        Certification_Message: certification.certificationMessage,
        Required_Next_Action: certification.requiredNextAction,
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Certification_JSON: certification
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        certificationHeaders,
        certificationRecord
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: digests.length,
        processed: digestsForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          dataQualityCertificationStatus: 'CERTIFICATION_RECORDED',
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: digests.length,
          digestsReviewedForCertificationDate: digestsForDate.length,
          certificationDate: certificationDate,
          certificationBusinessKey: certificationBusinessKey,
          certificationDecision: certification.certificationDecision,
          certificationStatus: certification.certificationStatus,
          certificationRiskLevel: certification.certificationRiskLevel,
          promotionGate: certification.promotionGate,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: certification.requiredNextAction
        })
      });

      sciipAppend2760_SuperSheetDataQualityCertificationRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Certification_Status: certification.certificationStatus,
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: digests.length,
          Certifications_Created: 1,
          Certification_Date: certificationDate,
          Certification_Decision: certification.certificationDecision,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: digests.length,
          digestsReviewedForCertificationDate: digestsForDate.length,
          certification: certification,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet data quality certification completed.'
      });

      return result;
    }
  });
}

function sciipGet2760_SuperSheetDataQualityCertificationHeaders_() {
  return [
    'Certification_ID',
    'Business_Key',
    'Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Digest_Business_Key',
    'Total_Records_Assessed',
    'Average_Quality_Score',
    'Digest_Rating',
    'Data_Quality_Posture',
    'Certification_Decision',
    'Certification_Status',
    'Certification_Risk_Level',
    'Promotion_Gate',
    'Certification_Message',
    'Required_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Certification_JSON'
  ];
}

function sciipGet2760_SuperSheetDataQualityCertificationRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Certification_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Certifications_Created',
    'Certification_Date',
    'Certification_Decision',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2760_LatestDigestDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2760_DateValue_(record.Digest_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2760_DigestsByDate_(records, certificationDate) {
  return records.filter(function(record) {
    return sciipNormalize2760_DateValue_(record.Digest_Date) === certificationDate;
  });
}

function sciipSelect2760_LatestDigestForDate_(records) {
  if (!records || records.length === 0) return null;

  var sorted = records.slice().sort(function(a, b) {
    return String(a.Created_At || '').localeCompare(String(b.Created_At || ''));
  });

  return sorted[sorted.length - 1];
}

function sciipNormalize2760_DateValue_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  var text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return text;
}

function sciipBuild2760_SuperSheetDataQualityCertification_(digest, digestsForDate) {
  if (!digest) {
    return {
      digestsReviewed: 0,
      digestBusinessKey: '',
      totalRecordsAssessed: 0,
      averageQualityScore: 0,
      digestRating: 'NO_DIGEST',
      dataQualityPosture: 'NO_DIGEST_AVAILABLE',
      certificationDecision: 'NOT_CERTIFIED',
      certificationStatus: 'SKIPPED_NO_DIGEST',
      certificationRiskLevel: 'UNKNOWN',
      promotionGate: 'CLOSED',
      certificationMessage: 'No digest was available for certification.',
      requiredNextAction: 'Run 2750_SuperSheetDataQualityDigestProcessor.'
    };
  }

  var totalRecordsAssessed = Number(digest.Total_Records_Assessed || 0);
  var averageQualityScore = Number(digest.Average_Quality_Score || 0);
  var digestRating = String(digest.Digest_Rating || '').trim() || 'UNKNOWN';
  var dataQualityPosture = String(digest.Data_Quality_Posture || '').trim() || 'UNKNOWN';
  var needsReview = Number(digest.Needs_Review || 0);
  var newCandidate = Number(digest.New_Candidate || 0);

  var decision = sciipDetermine2760_CertificationDecision_(
    digestRating,
    averageQualityScore,
    needsReview,
    newCandidate,
    totalRecordsAssessed
  );

  return {
    digestsReviewed: digestsForDate.length,
    digestBusinessKey: String(digest.Business_Key || '').trim(),
    totalRecordsAssessed: totalRecordsAssessed,
    averageQualityScore: averageQualityScore,
    digestRating: digestRating,
    dataQualityPosture: dataQualityPosture,
    needsReview: needsReview,
    newCandidate: newCandidate,
    certificationDecision: decision.certificationDecision,
    certificationStatus: decision.certificationStatus,
    certificationRiskLevel: decision.certificationRiskLevel,
    promotionGate: decision.promotionGate,
    certificationMessage: decision.certificationMessage,
    requiredNextAction: decision.requiredNextAction
  };
}

function sciipDetermine2760_CertificationDecision_(digestRating, averageQualityScore, needsReview, newCandidate, totalRecordsAssessed) {
  if (!totalRecordsAssessed) {
    return {
      certificationDecision: 'NOT_CERTIFIED',
      certificationStatus: 'NO_RECORDS_ASSESSED',
      certificationRiskLevel: 'UNKNOWN',
      promotionGate: 'CLOSED',
      certificationMessage: 'No SuperSheet records were assessed by the data quality engine.',
      requiredNextAction: 'Load SuperSheet / Bridge rows and run 2730 through 2760 again.'
    };
  }

  if (digestRating === 'GREEN' && averageQualityScore >= 90 && needsReview === 0 && newCandidate === 0) {
    return {
      certificationDecision: 'CERTIFIED_FOR_AUTO_PROMOTION',
      certificationStatus: 'CERTIFIED',
      certificationRiskLevel: 'LOW',
      promotionGate: 'OPEN',
      certificationMessage: 'SuperSheet import quality is certified for automatic promotion.',
      requiredNextAction: 'Proceed to matching and promotion processors.'
    };
  }

  if (digestRating === 'GREEN_WITH_REVIEW' || (averageQualityScore >= 80 && newCandidate === 0)) {
    return {
      certificationDecision: 'CERTIFIED_WITH_REVIEW',
      certificationStatus: 'CONDITIONAL_CERTIFICATION',
      certificationRiskLevel: 'LOW_MEDIUM',
      promotionGate: 'REVIEW_REQUIRED',
      certificationMessage: 'SuperSheet import quality is mostly ready but flagged records require review before promotion.',
      requiredNextAction: 'Review flagged records, then proceed to matching and promotion.'
    };
  }

  if (digestRating === 'YELLOW' || averageQualityScore >= 65) {
    return {
      certificationDecision: 'NOT_CERTIFIED_REVIEW_REQUIRED',
      certificationStatus: 'REVIEW_REQUIRED',
      certificationRiskLevel: 'MEDIUM',
      promotionGate: 'CLOSED',
      certificationMessage: 'SuperSheet import quality requires manual review before knowledge graph ingestion.',
      requiredNextAction: 'Resolve review and candidate records before promotion.'
    };
  }

  return {
    certificationDecision: 'NOT_CERTIFIED_HIGH_RISK',
    certificationStatus: 'FAILED_CERTIFICATION',
    certificationRiskLevel: 'HIGH',
    promotionGate: 'CLOSED',
    certificationMessage: 'SuperSheet import quality is below certification threshold.',
    requiredNextAction: 'Pause promotion and remediate import normalization, identity, and address quality issues.'
  };
}

function sciip2760_CertificationBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2760_SuperSheetDataQualityCertificationRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2760_SuperSheetDataQualityCertificationProcessor() {
  var result = sciipRun2760_SuperSheetDataQualityCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2760_SuperSheetDataQualityCertificationProcessor',
    result: result
  }));

  return result;
}
