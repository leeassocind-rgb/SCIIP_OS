/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 900_AutonomousGovernanceReviewProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousGovernanceReviewProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '900_AutonomousGovernanceReviewProcessor',
    action: 'AUTONOMOUS_GOVERNANCE_REVIEW_BUILD',
    sourceSheet: 'AUTONOMOUS_GOVERNANCE_MONITORING',
    targetSheet: 'AUTONOMOUS_GOVERNANCE_REVIEWS',
    ledgerSheet: 'AUTONOMOUS_GOVERNANCE_REVIEWS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '900_AutonomousGovernanceReviewProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousGovernanceReviewProcessorLegacy900_();
      return sciipWrapLegacyRuntimeResult900_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult900_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * 900_AutonomousGovernanceReviewProcessor
 *******************************************************/

const AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME = '900_AutonomousGovernanceReviewProcessor';

const AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_MONITORING';
const AUTONOMOUS_GOVERNANCE_REVIEW_OUTPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_REVIEWS';

const AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA = [
  'Review_ID',
  'Business_Key',
  'Review_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Review_Title',
  'Review_Type',
  'Review_Summary',
  'Governance_Health',
  'Review_Decision',
  'Next_Action',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousGovernanceReviewProcessorLegacy900_() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousGovernanceReviewSheet_();

  const reviewDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET,
      'Monitoring_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_GOVERNANCE_REVIEW|${reviewDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
    resolvedReviewDate: reviewDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousGovernanceReviewsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousGovernanceMonitoringForReviewDate_(reviewDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousGovernanceReviewsCreated: 0,
      reviewDate,
      completedAt: new Date().toISOString()
    };
  }

  const review = sciipBuildAutonomousGovernanceReview_({
    reviewDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousGovernanceReview_(review);

  return {
    processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousGovernanceReviewsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousGovernanceReview_(payload) {
  const reviewId = `AUTONOMOUS_GOVERNANCE_REVIEW_${Utilities.getUuid()}`;

  return {
    Review_ID: reviewId,
    Business_Key: payload.businessKey,
    Review_Date: payload.reviewDate,
    Source_Sheet: AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Review_Title: `Autonomous Governance Review — ${payload.reviewDate}`,
    Review_Type: 'PROCESSOR_GOVERNANCE_STANDARD_REVIEW',
    Review_Summary: sciipCreateAutonomousGovernanceReviewSummary_(payload.sourceRows),
    Governance_Health: sciipResolveAutonomousGovernanceHealth_(payload.sourceRows),
    Review_Decision: sciipCreateAutonomousGovernanceReviewDecision_(payload.sourceRows),
    Next_Action: sciipCreateAutonomousGovernanceReviewNextAction_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousGovernanceReviewSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_REVIEW_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_GOVERNANCE_REVIEW_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousGovernanceMonitoringForReviewDate_(reviewDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Monitoring_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
      error: 'MONITORING_DATE_COLUMN_NOT_FOUND',
      headers
    }));
    return [];
  }

  return values
    .slice(1)
    .filter(row => {
      const rawDate = row[dateIndex];
      const rowDate =
        rawDate instanceof Date
          ? sciipFormatDateKey_(rawDate)
          : String(rawDate).trim();

      return rowDate === reviewDate;
    })
    .map(row => sciipAutonomousGovernanceReviewRowToObject_(headers, row));
}

function sciipCreateAutonomousGovernanceReviewSummary_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} governance monitoring record(s).`,
    'The latest completed processing date standard remains active as a monitored governance rule.',
    'The governance chain now provides traceability from standard adoption through compliance, audit, enforcement, monitoring, and review.'
  ].join(' ');
}

function sciipResolveAutonomousGovernanceHealth_(sourceRows) {
  if (!sourceRows.length) return 'UNKNOWN';

  const hasActiveMonitoring = sourceRows.some(row => {
    return String(row.Monitoring_Status || '').trim().toUpperCase() === 'ACTIVE_MONITORING';
  });

  return hasActiveMonitoring ? 'HEALTHY' : 'REVIEW_REQUIRED';
}

function sciipCreateAutonomousGovernanceReviewDecision_(sourceRows) {
  return [
    'CONTINUE_STANDARD_ENFORCEMENT.',
    'Future downstream processors should continue to use the latest completed upstream processing date standard.',
    'The standard is suitable for ongoing SCIIP_OS processor governance.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceReviewNextAction_(sourceRows) {
  return [
    'Apply the standard to processor 910 and all later downstream processors.',
    'During future builds, verify first-run creation and second-run duplicate protection.',
    'Preserve each governance review as permanent operating-system history.'
  ].join('\n');
}

function sciipAppendAutonomousGovernanceReview_(review) {
  const sheet = sciipEnsureAutonomousGovernanceReviewSheet_();

  const row = AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA.map(header => review[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousGovernanceReviewRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceReviewProcessor() {
  const result = sciipRunAutonomousGovernanceReviewProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceReviewProcessor',
    result
  }));

  return result;
}