/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 660_AutonomousReasoningProcessor
 *
 * STRATEGIC_MEMORY → AUTONOMOUS_REASONING
 *
 * Migration note:
 * Preserves original 660 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const AUTONOMOUS_REASONING_PROCESSOR = '660_AutonomousReasoningProcessor';
const AUTONOMOUS_REASONING_SHEET = 'AUTONOMOUS_REASONING';

const AUTONOMOUS_REASONING_HEADERS = [
  'Reasoning_ID',
  'Business_Key',
  'Reasoning_Date',
  'Memory_ID',
  'Calibration_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Memory_Type',
  'Reasoning_Type',
  'Reasoning_Title',
  'Reasoning_Statement',
  'Strategic_Interpretation',
  'Future_Implication',
  'Recommended_Intelligence_Action',
  'Recommended_Operating_Action',
  'Next_Strategic_Question',
  'Reasoning_Confidence',
  'Reasoning_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousReasoningSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    AUTONOMOUS_REASONING_SHEET,
    AUTONOMOUS_REASONING_HEADERS
  );
}

function sciipRunAutonomousReasoningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: AUTONOMOUS_REASONING_PROCESSOR,
    action: 'AUTONOMOUS_REASONING_BUILD',
    sourceSheet: 'STRATEGIC_MEMORY',
    targetSheet: AUTONOMOUS_REASONING_SHEET,
    ledgerSheet: 'AUTONOMOUS_REASONING_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const memories = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('STRATEGIC_MEMORY');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: memories.length,
        outputCount: memories.length || 1,
        summary: 'Autonomous reasoning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: AUTONOMOUS_REASONING_PROCESSOR,
          inputSheets: ['STRATEGIC_MEMORY']
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
      const outputSheet = sciipEnsureAutonomousReasoningSchema();
      const reasoningDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const reasoningBusinessKey = 'AUTONOMOUS_REASONING|' + reasoningDate;

      if (sciipRuntimeBusinessKeyPrefixExists660_(definition.targetSheet, reasoningBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: AUTONOMOUS_REASONING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            reasoningOutputsCreated: 0,
            skippedDuplicate: 1,
            reasoningBusinessKey: reasoningBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const memories = sciipGetRuntimeRecordsByDate660_(
        'STRATEGIC_MEMORY',
        'Memory_Date',
        reasoningDate
      );

      if (memories.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: AUTONOMOUS_REASONING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            memoriesReviewed: 0,
            reasoningOutputsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const reasoningOutputs = sciipCreateAutonomousReasoningOutputs660_({
        businessKey: reasoningBusinessKey,
        reasoningDate: reasoningDate,
        memories: memories,
        processor: AUTONOMOUS_REASONING_PROCESSOR
      });

      reasoningOutputs.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: AUTONOMOUS_REASONING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: reasoningOutputs.length,
        recordsRead: memories.length,
        processed: reasoningOutputs.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          memoriesReviewed: memories.length,
          reasoningOutputsCreated: reasoningOutputs.length,
          skippedDuplicate: 0,
          reasoningBusinessKey: reasoningBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists660_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate660_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue660_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue660_(value) {
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

function sciipExtractFirstAvailable660_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey660_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateAutonomousReasoningOutputs660_(args) {
  const now = new Date();

  const rows = args.memories.map(function(memory) {
    const memoryId = sciipExtractFirstAvailable660_(memory, [
      'Memory_ID'
    ]);

    const calibrationId = sciipExtractFirstAvailable660_(memory, [
      'Calibration_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable660_(memory, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable660_(memory, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable660_(memory, [
      'Signal_Category'
    ]);

    const memoryType = sciipExtractFirstAvailable660_(memory, [
      'Memory_Type'
    ]);

    const profile =
      sciipInferAutonomousReasoningProfile660_(memory);

    const rowKey =
      args.businessKey + '|' + profile.reasoningType + '|' + sciipNormalizeMissionKey660_(memoryId || calibrationId || hypothesisId || profile.reasoningTitle);

    return [
      sciipGenerateId_('RSN'),
      rowKey,
      args.reasoningDate,
      memoryId,
      calibrationId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      memoryType,
      profile.reasoningType,
      profile.reasoningTitle,
      profile.reasoningStatement,
      profile.strategicInterpretation,
      profile.futureImplication,
      profile.recommendedIntelligenceAction,
      profile.recommendedOperatingAction,
      profile.nextStrategicQuestion,
      profile.reasoningConfidence,
      'GENERATED',
      'STRATEGIC_MEMORY:' + memoryId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateAutonomousReasoningRows660_(rows);
}

function sciipInferAutonomousReasoningProfile660_(memory) {
  const hypothesisType = sciipExtractFirstAvailable660_(memory, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable660_(memory, [
    'Signal_Category'
  ]);

  const memoryType = sciipExtractFirstAvailable660_(memory, [
    'Memory_Type'
  ]);

  const memoryStatement = sciipExtractFirstAvailable660_(memory, [
    'Memory_Statement'
  ]);

  const strategicPrinciple = sciipExtractFirstAvailable660_(memory, [
    'Strategic_Principle'
  ]);

  const patternToReinforce = sciipExtractFirstAvailable660_(memory, [
    'Pattern_To_Reinforce'
  ]);

  const patternToSuppress = sciipExtractFirstAvailable660_(memory, [
    'Pattern_To_Suppress'
  ]);

  const reasoningInstruction = sciipExtractFirstAvailable660_(memory, [
    'Reasoning_Instruction'
  ]);

  const futureUseCase = sciipExtractFirstAvailable660_(memory, [
    'Future_Use_Case'
  ]);

  const memoryConfidence =
    sciipExtractFirstAvailable660_(memory, [
      'Memory_Confidence'
    ]) || 'LOW';

  let reasoningType = 'GENERAL_AUTONOMOUS_REASONING';
  let reasoningTitle = 'Autonomous reasoning from ' + (signalCategory || 'strategic memory');
  let strategicInterpretation =
    'SCIIP should preserve this memory as context for future hypothesis generation, evidence prioritization, and graph reasoning.';
  let futureImplication =
    'Future intelligence outputs should consider this memory when similar signals appear.';
  let recommendedIntelligenceAction =
    'Use this memory to inform future intelligence requirements, hypotheses, and validation plans.';
  let recommendedOperatingAction =
    'No immediate operating action required. Preserve the reasoning output for downstream scenario and prediction processors.';
  let nextStrategicQuestion =
    'What future signals would confirm that this memory should materially influence SCIIP reasoning?';
  let reasoningConfidence = memoryConfidence;

  const memoryTypeText = String(memoryType || '').toUpperCase();

  if (memoryTypeText === 'REINFORCEMENT_MEMORY') {
    reasoningType = 'REINFORCEMENT_REASONING';
    strategicInterpretation =
      'SCIIP has identified a pattern that should receive greater attention in future reasoning.';
    futureImplication =
      patternToReinforce || 'Similar signals should be more likely to influence future hypothesis generation.';
    recommendedIntelligenceAction =
      'Create or prioritize future intelligence requirements when similar reinforced signals appear.';
    recommendedOperatingAction =
      'Increase reasoning attention to this signal category in future autonomous processing.';
    nextStrategicQuestion =
      'Where else is this reinforced pattern appearing across properties, companies, markets, or system workflows?';
  }

  if (memoryTypeText === 'SUPPRESSION_MEMORY') {
    reasoningType = 'SUPPRESSION_REASONING';
    strategicInterpretation =
      'SCIIP has identified a pattern that should receive less weight unless stronger evidence is present.';
    futureImplication =
      patternToSuppress || 'Similar signals should be treated cautiously in future reasoning.';
    recommendedIntelligenceAction =
      'Require stronger corroborating evidence before escalating similar signals.';
    recommendedOperatingAction =
      'Reduce autonomous escalation of similar weak or previously rejected signals.';
    nextStrategicQuestion =
      'What evidence threshold should be required before this suppressed pattern becomes actionable again?';
  }

  if (memoryTypeText === 'OPERATOR_REVIEW_MEMORY') {
    reasoningType = 'GOVERNED_REASONING';
    strategicInterpretation =
      'SCIIP has identified a reasoning pattern that should not be autonomously resolved without operator review.';
    futureImplication =
      'Similar unresolved or contested signals should be routed to operator review before confidence or weighting changes.';
    recommendedIntelligenceAction =
      'Prepare concise operator-review packets when similar evidence conflicts arise.';
    recommendedOperatingAction =
      'Maintain governance over autonomous calibration and graph confidence changes.';
    nextStrategicQuestion =
      'What operator decision would allow SCIIP to safely automate this reasoning path in the future?';
    reasoningConfidence = 'MEDIUM';
  }

  if (memoryTypeText === 'STABILITY_MEMORY') {
    reasoningType = 'STABILITY_REASONING';
    strategicInterpretation =
      'SCIIP should preserve the signal history but avoid changing model behavior until stronger validated evidence accumulates.';
    futureImplication =
      'Similar future signals should remain at baseline priority unless additional evidence strengthens them.';
    recommendedIntelligenceAction =
      'Continue monitoring similar signals but do not escalate automatically.';
    recommendedOperatingAction =
      'Maintain baseline processor behavior.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    reasoningTitle = 'Property autonomous reasoning';
    nextStrategicQuestion =
      'Which property-level facts or GIS signals would make this reasoning more actionable?';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    reasoningTitle = 'Company autonomous reasoning';
    nextStrategicQuestion =
      'Which company movement, funding, hiring, permit, or facility signals would confirm this reasoning?';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    reasoningTitle = 'Risk autonomous reasoning';
    recommendedIntelligenceAction =
      'Prioritize risk-related intelligence requirements and counterevidence review.';
    recommendedOperatingAction =
      'Route high-impact risk reasoning into future alerting, briefing, or scenario processors.';
    reasoningConfidence = memoryConfidence === 'LOW' ? 'MEDIUM' : memoryConfidence;
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    reasoningTitle = 'Opportunity autonomous reasoning';
    recommendedIntelligenceAction =
      'Prioritize opportunity-related intelligence requirements, target validation, and actionability review.';
    recommendedOperatingAction =
      'Route high-priority opportunity reasoning into future scenario, briefing, or action recommendation processors.';
    reasoningConfidence = memoryConfidence === 'LOW' ? 'MEDIUM' : memoryConfidence;
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    reasoningTitle = 'Operating system autonomous reasoning';
    recommendedOperatingAction =
      'Evaluate whether processor logic, schema design, graph completeness, or workflow automation should be improved.';
    nextStrategicQuestion =
      'What operating-system change would most improve future SCIIP reasoning quality?';
  }

  const reasoningStatement = [
    'Memory type: ' + (memoryType || 'UNKNOWN') + '.',
    'Signal category: ' + (signalCategory || 'UNKNOWN') + '.',
    'Strategic principle: ' + (strategicPrinciple || 'No strategic principle recorded.'),
    'Reasoning instruction: ' + (reasoningInstruction || 'No reasoning instruction recorded.'),
    'Future use case: ' + (futureUseCase || 'No future use case recorded.'),
    'Memory basis: ' + (memoryStatement || 'No memory statement recorded.')
  ].join('\n');

  return {
    reasoningType: reasoningType,
    reasoningTitle: reasoningTitle,
    reasoningStatement: reasoningStatement,
    strategicInterpretation: strategicInterpretation,
    futureImplication: futureImplication,
    recommendedIntelligenceAction: recommendedIntelligenceAction,
    recommendedOperatingAction: recommendedOperatingAction,
    nextStrategicQuestion: nextStrategicQuestion,
    reasoningConfidence: reasoningConfidence
  };
}

function sciipDeduplicateAutonomousReasoningRows660_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(function(row) {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestAutonomousReasoningProcessor() {
  const result =
    sciipRunAutonomousReasoningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousReasoningProcessor',
    result: result
  }));

  return result;
}
