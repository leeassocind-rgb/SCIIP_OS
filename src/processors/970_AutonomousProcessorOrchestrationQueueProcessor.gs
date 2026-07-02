/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 970_AutonomousProcessorOrchestrationQueueProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorOrchestrationQueueProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '970_AutonomousProcessorOrchestrationQueueProcessor',
    action: 'AUTONOMOUS_ORCHESTRATION_QUEUE_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_PROMOTION_DECISIONS',
    targetSheet: 'AUTONOMOUS_PROCESSOR_ORCHESTRATION_QUEUE',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_ORCHESTRATION_QUEUE_RUNTIME_LEDGER',

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
          originalProcessor: '970_AutonomousProcessorOrchestrationQueueProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorOrchestrationQueueProcessorLegacy970_();
      return sciipWrapLegacyRuntimeResult970_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult970_(legacyResult, context, transaction) {
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
 * SCIIP_OS v4.1
 * 970_AutonomousProcessorOrchestrationQueueProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_970_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_PROMOTION_DECISIONS';
const SCIIP_970_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_ORCHESTRATION_QUEUE';
const SCIIP_970_INPUT_DATE_COLUMN = 'Decision_Date';

const SCIIP_970_OUTPUT_HEADERS = [
  'Orchestration_Queue_ID',
  'Queue_Date',
  'Source_Promotion_Decision_ID',
  'Target_Processor',
  'Build_Phase',
  'Promotion_Decision',
  'Queue_Status',
  'Queue_Action',
  'Queue_Rationale',
  'Required_Next_Action',
  'Blocking_Risk',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_970_PROCESSOR = '970_AutonomousProcessorOrchestrationQueueProcessor';
const SCIIP_970_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_ORCHESTRATION_QUEUE';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorOrchestrationQueueProcessorLegacy970_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_970_INPUT_SHEET);
  if (!inputSheet) {
    return sciip970Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip970EnsureSheet_(ss, SCIIP_970_OUTPUT_SHEET, SCIIP_970_OUTPUT_HEADERS);

  const resolvedQueueDate =
    sciipResolveLatestProcessingDate_(SCIIP_970_INPUT_SHEET, SCIIP_970_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_970_BUSINESS_PREFIX}|${resolvedQueueDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip970Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const decisions = sciip970ReadRowsForDate_(
    inputSheet,
    SCIIP_970_INPUT_DATE_COLUMN,
    resolvedQueueDate
  );

  if (!decisions.length) {
    return sciip970Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = decisions.map((row, index) =>
    sciip970BuildQueueRecord_(row, resolvedQueueDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_970_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip970Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip970BuildQueueRecord_(row, queueDate, businessKey, startedAt, index) {
  const sourcePromotionDecisionId =
    row.Promotion_Decision_ID ||
    row.Source_Promotion_Decision_ID ||
    `PROMOTION_DECISION_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const buildPhase =
    row.Build_Phase ||
    'GENERAL';

  const promotionDecision =
    row.Promotion_Decision ||
    'HOLD_FOR_REVIEW';

  const queue = sciip970ResolveQueueAction_(promotionDecision, row);

  return [
    sciip970CreateId_('ORCH_QUEUE'),
    queueDate,
    sourcePromotionDecisionId,
    targetProcessor,
    buildPhase,
    promotionDecision,
    queue.status,
    queue.action,
    queue.rationale,
    row.Required_Next_Action || queue.nextAction,
    row.Blocking_Risk || queue.blockingRisk,
    row.Architecture_Standard || 'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    row.Knowledge_Graph_Impact || 'Creates permanent autonomous orchestration queue history from promotion decisions',
    `${businessKey}|${targetProcessor}|${sourcePromotionDecisionId}|${buildPhase}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip970ResolveQueueAction_(promotionDecision, row) {
  const decision = String(promotionDecision || '').toUpperCase();

  if (decision === 'PROMOTE_TO_NEXT_STAGE') {
    return {
      status: 'QUEUED_FOR_ORCHESTRATION',
      action: 'ADVANCE_PROCESSOR_CHAIN',
      rationale: 'Promotion decision approved this processor phase for downstream orchestration.',
      nextAction: 'Schedule or execute next downstream processor build step.',
      blockingRisk: 'NONE'
    };
  }

  if (decision === 'DO_NOT_PROMOTE') {
    return {
      status: 'BLOCKED_FROM_ORCHESTRATION',
      action: 'HOLD_AND_REMEDIATE',
      rationale: row.Decision_Rationale || 'Promotion decision blocked this processor phase.',
      nextAction: row.Required_Next_Action || 'Resolve blocking issue before orchestration.',
      blockingRisk: row.Blocking_Risk || 'Blocked processor phase may weaken downstream chain reliability.'
    };
  }

  return {
    status: 'QUEUED_FOR_REVIEW',
    action: 'MANUAL_REVIEW_REQUIRED',
    rationale: row.Decision_Rationale || 'Promotion decision requires review before orchestration.',
    nextAction: row.Required_Next_Action || 'Review promotion decision and approve or block orchestration.',
    blockingRisk: row.Blocking_Risk || 'Unreviewed promotion decision may delay or compromise downstream orchestration.'
  };
}

function sciip970ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_970_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip970EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip970CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip970Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_970_PROCESSOR,
    status,
    autonomousProcessorOrchestrationQueueCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorOrchestrationQueueProcessor() {
  const result = sciipRunAutonomousProcessorOrchestrationQueueProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorOrchestrationQueueProcessor',
    result
  }));

  return result;
}