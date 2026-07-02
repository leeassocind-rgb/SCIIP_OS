/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 650_StrategicMemoryConsolidationProcessor
 *
 * AUTONOMOUS_MODEL_CALIBRATION → STRATEGIC_MEMORY
 *
 * Migration note:
 * Preserves original 650 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR = '650_StrategicMemoryConsolidationProcessor';
const STRATEGIC_MEMORY_SHEET = 'STRATEGIC_MEMORY';

const STRATEGIC_MEMORY_HEADERS = [
  'Memory_ID',
  'Business_Key',
  'Memory_Date',
  'Calibration_ID',
  'Signal_Weight_ID',
  'Evolution_ID',
  'Learning_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Memory_Type',
  'Memory_Title',
  'Memory_Statement',
  'Strategic_Principle',
  'Pattern_To_Reinforce',
  'Pattern_To_Suppress',
  'Reasoning_Instruction',
  'Future_Use_Case',
  'Memory_Confidence',
  'Memory_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureStrategicMemorySchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    STRATEGIC_MEMORY_SHEET,
    STRATEGIC_MEMORY_HEADERS
  );
}

function sciipRunStrategicMemoryConsolidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR,
    action: 'STRATEGIC_MEMORY_BUILD',
    sourceSheet: 'AUTONOMOUS_MODEL_CALIBRATION',
    targetSheet: STRATEGIC_MEMORY_SHEET,
    ledgerSheet: 'STRATEGIC_MEMORY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const calibrations = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_MODEL_CALIBRATION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: calibrations.length,
        outputCount: calibrations.length || 1,
        summary: 'Strategic memory consolidation runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR,
          inputSheets: ['AUTONOMOUS_MODEL_CALIBRATION']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureStrategicMemorySchema();
      const memoryDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const memoryBusinessKey = 'STRATEGIC_MEMORY|' + memoryDate;

      if (sciipRuntimeBusinessKeyPrefixExists650_(definition.targetSheet, memoryBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            memoriesCreated: 0,
            skippedDuplicate: 1,
            memoryBusinessKey: memoryBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const calibrations = sciipGetRuntimeRecordsByDate650_(
        'AUTONOMOUS_MODEL_CALIBRATION',
        'Calibration_Date',
        memoryDate
      );

      if (calibrations.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            calibrationsReviewed: 0,
            memoriesCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const memories = sciipCreateStrategicMemories650_({
        businessKey: memoryBusinessKey,
        memoryDate: memoryDate,
        calibrations: calibrations,
        processor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR
      });

      memories.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: memories.length,
        recordsRead: calibrations.length,
        processed: memories.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          calibrationsReviewed: calibrations.length,
          memoriesCreated: memories.length,
          skippedDuplicate: 0,
          memoryBusinessKey: memoryBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists650_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate650_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue650_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue650_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable650_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey650_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateStrategicMemories650_(args) {
  const now = new Date();

  const rows = args.calibrations.map(calibration => {
    const calibrationId = sciipExtractFirstAvailable650_(calibration, [
      'Calibration_ID'
    ]);

    const signalWeightId = sciipExtractFirstAvailable650_(calibration, [
      'Signal_Weight_ID'
    ]);

    const evolutionId = sciipExtractFirstAvailable650_(calibration, [
      'Evolution_ID'
    ]);

    const learningId = sciipExtractFirstAvailable650_(calibration, [
      'Learning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable650_(calibration, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable650_(calibration, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable650_(calibration, [
      'Signal_Category'
    ]);

    const profile =
      sciipInferStrategicMemoryProfile650_(calibration);

    const rowKey =
      `${args.businessKey}|${profile.memoryType}|${sciipNormalizeMissionKey650_(calibrationId || signalWeightId || evolutionId || learningId || hypothesisId || profile.memoryTitle)}`;

    return [
      sciipGenerateId_('MEM'),
      rowKey,
      args.memoryDate,
      calibrationId,
      signalWeightId,
      evolutionId,
      learningId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      profile.memoryType,
      profile.memoryTitle,
      profile.memoryStatement,
      profile.strategicPrinciple,
      profile.patternToReinforce,
      profile.patternToSuppress,
      profile.reasoningInstruction,
      profile.futureUseCase,
      profile.memoryConfidence,
      'CONSOLIDATED',
      `AUTONOMOUS_MODEL_CALIBRATION:${calibrationId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateStrategicMemoryRows650_(rows);
}

function sciipInferStrategicMemoryProfile650_(calibration) {
  const hypothesisType = sciipExtractFirstAvailable650_(calibration, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable650_(calibration, [
    'Signal_Category'
  ]);

  const calibrationType = sciipExtractFirstAvailable650_(calibration, [
    'Calibration_Type'
  ]);

  const calibrationAction = sciipExtractFirstAvailable650_(calibration, [
    'Calibration_Action'
  ]);

  const calibrationDirection = sciipExtractFirstAvailable650_(calibration, [
    'Calibration_Direction'
  ]);

  const calibrationMagnitude = sciipExtractFirstAvailable650_(calibration, [
    'Calibration_Magnitude'
  ]);

  const calibrationRationale = sciipExtractFirstAvailable650_(calibration, [
    'Calibration_Rationale'
  ]);

  const expectedModelEffect = sciipExtractFirstAvailable650_(calibration, [
    'Expected_Model_Effect'
  ]);

  const calibrationPriority =
    sciipExtractFirstAvailable650_(calibration, [
      'Calibration_Priority'
    ]) || 'MEDIUM';

  let memoryType = 'GENERAL_STRATEGIC_MEMORY';
  let memoryTitle = `Strategic memory: ${signalCategory || 'general signal'}`;
  let strategicPrinciple =
    'Preserve validated calibration history so future SCIIP reasoning can improve without overwriting prior evidence.';
  let patternToReinforce = 'NONE';
  let patternToSuppress = 'NONE';
  let reasoningInstruction =
    'Use this memory as context when generating future hypotheses, weighing evidence, and routing validation work.';
  let futureUseCase =
    'Future autonomous reasoning, hypothesis generation, evidence prioritization, and graph confidence adjustment.';
  let memoryConfidence =
    calibrationPriority === 'HIGH' ? 'MEDIUM' : 'LOW';

  const action = String(calibrationAction || '').toUpperCase();
  const direction = String(calibrationDirection || '').toUpperCase();

  if (
    action === 'CALIBRATE_MODEL_TO_PRIORITIZE_SIGNAL' ||
    direction === 'INCREASE_SENSITIVITY'
  ) {
    memoryType = 'REINFORCEMENT_MEMORY';
    patternToReinforce =
      `${signalCategory || 'This signal category'} should receive greater attention in future reasoning.`;
    reasoningInstruction =
      'When similar signals appear again, raise their priority during hypothesis generation and evidence routing.';
    memoryConfidence =
      calibrationMagnitude === 'MODERATE' ? 'MEDIUM' : memoryConfidence;
  }

  if (
    action === 'CALIBRATE_MODEL_TO_DOWNWEIGHT_SIGNAL' ||
    direction === 'DECREASE_SENSITIVITY'
  ) {
    memoryType = 'SUPPRESSION_MEMORY';
    patternToSuppress =
      `${signalCategory || 'This signal category'} should receive reduced weight unless supported by stronger evidence.`;
    reasoningInstruction =
      'When similar signals appear again, require stronger evidence before escalating them into high-priority hypotheses.';
    memoryConfidence =
      calibrationMagnitude === 'MODERATE' ? 'MEDIUM' : memoryConfidence;
  }

  if (
    action === 'ROUTE_CALIBRATION_TO_OPERATOR_REVIEW' ||
    direction === 'PENDING_REVIEW'
  ) {
    memoryType = 'OPERATOR_REVIEW_MEMORY';
    strategicPrinciple =
      'SCIIP should preserve unresolved calibration conflicts and route similar future cases to operator review.';
    reasoningInstruction =
      'Do not autonomously change confidence or signal weighting for similar cases until operator review resolves the conflict.';
    futureUseCase =
      'Operator review routing, conflict-aware reasoning, and calibration governance.';
    memoryConfidence = 'MEDIUM';
  }

  if (
    action === 'MAINTAIN_MODEL_BEHAVIOR' ||
    direction === 'NO_CHANGE'
  ) {
    memoryType = 'STABILITY_MEMORY';
    strategicPrinciple =
      'SCIIP should preserve this signal history but avoid changing future model behavior until stronger validated evidence exists.';
    reasoningInstruction =
      'Maintain baseline reasoning behavior for similar future signals unless additional validated learning accumulates.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    memoryTitle = 'Property strategic memory';
    futureUseCase =
      'Future property hypothesis generation, asset confidence scoring, GIS evidence routing, and property graph enrichment.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    memoryTitle = 'Company strategic memory';
    futureUseCase =
      'Future company signal detection, occupier movement inference, supplier/OEM analysis, and company graph enrichment.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    memoryTitle = 'Risk strategic memory';
    futureUseCase =
      'Future risk detection, severity scoring, counterevidence routing, and mitigation prioritization.';
    memoryConfidence = 'MEDIUM';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    memoryTitle = 'Opportunity strategic memory';
    futureUseCase =
      'Future opportunity detection, actionability scoring, pursuit prioritization, and market timing reasoning.';
    memoryConfidence = 'MEDIUM';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    memoryTitle = 'Operating system strategic memory';
    futureUseCase =
      'Future processor improvement, graph completeness review, schema evolution, workflow automation, and autonomous reasoning calibration.';
  }

  const memoryStatement = [
    `Calibration type: ${calibrationType || 'UNKNOWN'}.`,
    `Calibration action: ${calibrationAction || 'UNKNOWN'}.`,
    `Calibration direction: ${calibrationDirection || 'UNKNOWN'}.`,
    `Calibration magnitude: ${calibrationMagnitude || 'UNKNOWN'}.`,
    `Expected model effect: ${expectedModelEffect || 'No expected effect recorded.'}`,
    `Rationale: ${calibrationRationale || 'No calibration rationale recorded.'}`
  ].join('\n');

  return {
    memoryType,
    memoryTitle,
    memoryStatement,
    strategicPrinciple,
    patternToReinforce,
    patternToSuppress,
    reasoningInstruction,
    futureUseCase,
    memoryConfidence
  };
}

function sciipDeduplicateStrategicMemoryRows650_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestStrategicMemoryConsolidationProcessor() {
  const result =
    sciipRunStrategicMemoryConsolidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestStrategicMemoryConsolidationProcessor',
    result: result
  }));

  return result;
}
