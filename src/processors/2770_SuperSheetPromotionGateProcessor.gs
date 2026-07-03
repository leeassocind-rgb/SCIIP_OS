/**
 * SCIIP_OS v5.4
 * SuperSheet Promotion Gate Processor
 * File: 2770_SuperSheetPromotionGateProcessor.gs
 *
 * Processor: 2770_SuperSheetPromotionGate
 *
 * Purpose:
 * Converts SuperSheet Data Quality Certifications into durable
 * promotion-gate decisions before matching, promotion, or knowledge
 * graph mutation can proceed.
 *
 * This processor is non-destructive and skip-safe.
 */

function sciipRun2770_SuperSheetPromotionGateProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2770_SuperSheetPromotionGate',
    action: 'SUPERSHEET_PROMOTION_GATE_BUILD',
    sourceSheet: 'SUPERSHEET_DATA_QUALITY_CERTIFICATIONS',
    targetSheet: 'SUPERSHEET_PROMOTION_GATE',
    ledgerSheet: 'SUPERSHEET_PROMOTION_GATE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var certifications = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: certifications.length,
        outputCount: certifications.length ? 1 : 0,
        summary: 'SuperSheet promotion gate payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_PROMOTION_GATE',
          upstreamProcessor: '2760_SuperSheetDataQualityCertification'
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
      var gateHeaders = sciipGet2770_SuperSheetPromotionGateHeaders_();
      var runtimeLedgerHeaders = sciipGet2770_SuperSheetPromotionGateRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, gateHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, runtimeLedgerHeaders);

      var certifications = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!certifications || certifications.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            promotionGateStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2760_SuperSheetDataQualityCertificationProcessor after 2750 creates digest records.'
          })
        });

        sciipAppend2770_SuperSheetPromotionGateRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Gate_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: 0,
            Gates_Created: 0,
            Gate_Date: '',
            Gate_Decision: 'NO_INPUTS',
            Promotion_Gate: 'CLOSED',
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var gateDate = sciipResolve2770_LatestCertificationDate_(certifications) ||
        SCIIP_RUNTIME.getDateKey({});

      var gateBusinessKey = 'SUPERSHEET_PROMOTION_GATE|' + gateDate;

      if (sciip2770_GateBusinessKeyExists_(definition.targetSheet, gateBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: certifications.length,
          processed: 0,
          message: JSON.stringify({
            promotionGateStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: certifications.length,
            gateBusinessKey: gateBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2770_SuperSheetPromotionGateRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Gate_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: certifications.length,
            Gates_Created: 0,
            Gate_Date: gateDate,
            Gate_Decision: 'DUPLICATE',
            Promotion_Gate: 'UNCHANGED',
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var certificationsForDate = sciipFilter2770_CertificationsByDate_(certifications, gateDate);
      var latestCertification = sciipSelect2770_LatestCertificationForDate_(certificationsForDate);
      var gate = sciipBuild2770_SuperSheetPromotionGate_(latestCertification, certificationsForDate);

      var gateRecord = {
        Promotion_Gate_ID: 'SUPERSHEET_PROMOTION_GATE_' + Utilities.getUuid(),
        Business_Key: gateBusinessKey,
        Gate_Date: gateDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: certificationsForDate.length,
        Certification_Business_Key: gate.certificationBusinessKey,
        Certification_Status: gate.certificationStatus,
        Certification_Decision: gate.certificationDecision,
        Certification_Risk_Level: gate.certificationRiskLevel,
        Data_Quality_Posture: gate.dataQualityPosture,
        Average_Quality_Score: gate.averageQualityScore,
        Total_Records_Assessed: gate.totalRecordsAssessed,
        Upstream_Promotion_Gate: gate.upstreamPromotionGate,
        Gate_Decision: gate.gateDecision,
        Gate_Status: gate.gateStatus,
        Gate_Risk_Level: gate.gateRiskLevel,
        Matching_Allowed: gate.matchingAllowed,
        Auto_Promotion_Allowed: gate.autoPromotionAllowed,
        Manual_Review_Required: gate.manualReviewRequired,
        Knowledge_Graph_Write_Allowed: gate.knowledgeGraphWriteAllowed,
        Required_Next_Action: gate.requiredNextAction,
        Gate_Message: gate.gateMessage,
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Gate_JSON: gate
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        gateHeaders,
        gateRecord
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: certifications.length,
        processed: certificationsForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          promotionGateStatus: 'PROMOTION_GATE_RECORDED',
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: certifications.length,
          certificationsReviewedForGateDate: certificationsForDate.length,
          gateDate: gateDate,
          gateBusinessKey: gateBusinessKey,
          gateDecision: gate.gateDecision,
          gateStatus: gate.gateStatus,
          gateRiskLevel: gate.gateRiskLevel,
          matchingAllowed: gate.matchingAllowed,
          autoPromotionAllowed: gate.autoPromotionAllowed,
          knowledgeGraphWriteAllowed: gate.knowledgeGraphWriteAllowed,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: gate.requiredNextAction
        })
      });

      sciipAppend2770_SuperSheetPromotionGateRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Gate_Status: gate.gateStatus,
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: certifications.length,
          Gates_Created: 1,
          Gate_Date: gateDate,
          Gate_Decision: gate.gateDecision,
          Promotion_Gate: gate.upstreamPromotionGate,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: certifications.length,
          certificationsReviewedForGateDate: certificationsForDate.length,
          gate: gate,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet promotion gate completed.'
      });

      return result;
    }
  });
}

function sciipGet2770_SuperSheetPromotionGateHeaders_() {
  return [
    'Promotion_Gate_ID',
    'Business_Key',
    'Gate_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Business_Key',
    'Certification_Status',
    'Certification_Decision',
    'Certification_Risk_Level',
    'Data_Quality_Posture',
    'Average_Quality_Score',
    'Total_Records_Assessed',
    'Upstream_Promotion_Gate',
    'Gate_Decision',
    'Gate_Status',
    'Gate_Risk_Level',
    'Matching_Allowed',
    'Auto_Promotion_Allowed',
    'Manual_Review_Required',
    'Knowledge_Graph_Write_Allowed',
    'Required_Next_Action',
    'Gate_Message',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Gate_JSON'
  ];
}

function sciipGet2770_SuperSheetPromotionGateRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Gate_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Gates_Created',
    'Gate_Date',
    'Gate_Decision',
    'Promotion_Gate',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2770_LatestCertificationDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2770_DateValue_(record.Certification_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2770_CertificationsByDate_(records, gateDate) {
  return records.filter(function(record) {
    return sciipNormalize2770_DateValue_(record.Certification_Date) === gateDate;
  });
}

function sciipSelect2770_LatestCertificationForDate_(records) {
  if (!records || records.length === 0) return null;

  var sorted = records.slice().sort(function(a, b) {
    return String(a.Created_At || '').localeCompare(String(b.Created_At || ''));
  });

  return sorted[sorted.length - 1];
}

function sciipNormalize2770_DateValue_(value) {
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

function sciipBuild2770_SuperSheetPromotionGate_(certification, certificationsForDate) {
  if (!certification) {
    return {
      certificationsReviewed: 0,
      certificationBusinessKey: '',
      certificationStatus: 'NO_CERTIFICATION',
      certificationDecision: 'NO_CERTIFICATION',
      certificationRiskLevel: 'UNKNOWN',
      dataQualityPosture: 'NO_CERTIFICATION_AVAILABLE',
      averageQualityScore: 0,
      totalRecordsAssessed: 0,
      upstreamPromotionGate: 'CLOSED',
      gateDecision: 'DO_NOT_PROMOTE',
      gateStatus: 'CLOSED_NO_CERTIFICATION',
      gateRiskLevel: 'UNKNOWN',
      matchingAllowed: 'NO',
      autoPromotionAllowed: 'NO',
      manualReviewRequired: 'YES',
      knowledgeGraphWriteAllowed: 'NO',
      requiredNextAction: 'Run 2760_SuperSheetDataQualityCertificationProcessor.',
      gateMessage: 'No data quality certification was available, so promotion is blocked.'
    };
  }

  var certificationStatus = String(certification.Certification_Status || '').trim() || 'UNKNOWN';
  var certificationDecision = String(certification.Certification_Decision || '').trim() || 'UNKNOWN';
  var certificationRiskLevel = String(certification.Certification_Risk_Level || '').trim() || 'UNKNOWN';
  var upstreamPromotionGate = String(certification.Promotion_Gate || '').trim() || 'CLOSED';
  var dataQualityPosture = String(certification.Data_Quality_Posture || '').trim() || 'UNKNOWN';
  var averageQualityScore = Number(certification.Average_Quality_Score || 0);
  var totalRecordsAssessed = Number(certification.Total_Records_Assessed || 0);

  var decision = sciipDetermine2770_GateDecision_(
    certificationStatus,
    certificationDecision,
    certificationRiskLevel,
    upstreamPromotionGate,
    averageQualityScore,
    totalRecordsAssessed
  );

  return {
    certificationsReviewed: certificationsForDate.length,
    certificationBusinessKey: String(certification.Business_Key || '').trim(),
    certificationStatus: certificationStatus,
    certificationDecision: certificationDecision,
    certificationRiskLevel: certificationRiskLevel,
    dataQualityPosture: dataQualityPosture,
    averageQualityScore: averageQualityScore,
    totalRecordsAssessed: totalRecordsAssessed,
    upstreamPromotionGate: upstreamPromotionGate,
    gateDecision: decision.gateDecision,
    gateStatus: decision.gateStatus,
    gateRiskLevel: decision.gateRiskLevel,
    matchingAllowed: decision.matchingAllowed,
    autoPromotionAllowed: decision.autoPromotionAllowed,
    manualReviewRequired: decision.manualReviewRequired,
    knowledgeGraphWriteAllowed: decision.knowledgeGraphWriteAllowed,
    requiredNextAction: decision.requiredNextAction,
    gateMessage: decision.gateMessage
  };
}

function sciipDetermine2770_GateDecision_(
  certificationStatus,
  certificationDecision,
  certificationRiskLevel,
  upstreamPromotionGate,
  averageQualityScore,
  totalRecordsAssessed
) {
  if (!totalRecordsAssessed) {
    return {
      gateDecision: 'DO_NOT_PROMOTE',
      gateStatus: 'CLOSED_NO_RECORDS_ASSESSED',
      gateRiskLevel: 'UNKNOWN',
      matchingAllowed: 'NO',
      autoPromotionAllowed: 'NO',
      manualReviewRequired: 'YES',
      knowledgeGraphWriteAllowed: 'NO',
      requiredNextAction: 'Load SuperSheet / Bridge rows and rerun 2730 through 2770.',
      gateMessage: 'No records were assessed, so promotion remains closed.'
    };
  }

  if (
    certificationStatus === 'CERTIFIED' &&
    certificationDecision === 'CERTIFIED_FOR_AUTO_PROMOTION' &&
    upstreamPromotionGate === 'OPEN' &&
    averageQualityScore >= 90
  ) {
    return {
      gateDecision: 'ALLOW_AUTO_PROMOTION',
      gateStatus: 'OPEN',
      gateRiskLevel: 'LOW',
      matchingAllowed: 'YES',
      autoPromotionAllowed: 'YES',
      manualReviewRequired: 'NO',
      knowledgeGraphWriteAllowed: 'YES',
      requiredNextAction: 'Proceed to match engine and automatic promotion processors.',
      gateMessage: 'Data quality certification allows automatic promotion.'
    };
  }

  if (
    certificationStatus === 'CONDITIONAL_CERTIFICATION' ||
    certificationDecision === 'CERTIFIED_WITH_REVIEW' ||
    upstreamPromotionGate === 'REVIEW_REQUIRED'
  ) {
    return {
      gateDecision: 'ALLOW_MATCHING_REQUIRE_REVIEW_BEFORE_PROMOTION',
      gateStatus: 'REVIEW_REQUIRED',
      gateRiskLevel: certificationRiskLevel || 'LOW_MEDIUM',
      matchingAllowed: 'YES',
      autoPromotionAllowed: 'NO',
      manualReviewRequired: 'YES',
      knowledgeGraphWriteAllowed: 'NO',
      requiredNextAction: 'Allow matching, but require manual approval before promotion or graph write.',
      gateMessage: 'Matching may proceed, but promotion requires review.'
    };
  }

  if (
    certificationStatus === 'REVIEW_REQUIRED' ||
    certificationDecision === 'NOT_CERTIFIED_REVIEW_REQUIRED'
  ) {
    return {
      gateDecision: 'HOLD_FOR_REVIEW',
      gateStatus: 'CLOSED_REVIEW_REQUIRED',
      gateRiskLevel: certificationRiskLevel || 'MEDIUM',
      matchingAllowed: 'NO',
      autoPromotionAllowed: 'NO',
      manualReviewRequired: 'YES',
      knowledgeGraphWriteAllowed: 'NO',
      requiredNextAction: 'Resolve data quality review flags before matching or promotion.',
      gateMessage: 'Promotion is blocked pending data quality review.'
    };
  }

  return {
    gateDecision: 'BLOCK_PROMOTION_HIGH_RISK',
    gateStatus: 'CLOSED_HIGH_RISK',
    gateRiskLevel: certificationRiskLevel || 'HIGH',
    matchingAllowed: 'NO',
    autoPromotionAllowed: 'NO',
    manualReviewRequired: 'YES',
    knowledgeGraphWriteAllowed: 'NO',
    requiredNextAction: 'Pause promotion and remediate source data quality issues.',
    gateMessage: 'Promotion is blocked due to failed or high-risk data quality certification.'
  };
}

function sciip2770_GateBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2770_SuperSheetPromotionGateRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2770_SuperSheetPromotionGateProcessor() {
  var result = sciipRun2770_SuperSheetPromotionGateProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2770_SuperSheetPromotionGateProcessor',
    result: result
  }));

  return result;
}
