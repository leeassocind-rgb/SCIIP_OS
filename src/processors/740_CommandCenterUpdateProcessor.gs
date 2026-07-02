/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 740_CommandCenterUpdateProcessor
 *
 * OPERATOR_BRIEFINGS → COMMAND_CENTER_UPDATES
 *
 * Migration note:
 * Preserves original 740 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetCommandCenterUpdateProcessorName740_() {
  return '740_CommandCenterUpdateProcessor';
}

function sciipGetCommandCenterUpdatesHeaders740_() {
  return [
    'Command_Update_ID',
    'Business_Key',
    'Update_Date',
    'Operator_Briefing_ID',
    'Briefing_Title',
    'Recommended_Operating_Posture',
    'Priority_Assessment',
    'Operator_Decision_Focus',
    'Next_Best_Action',
    'Update_Type',
    'Update_Title',
    'Command_Status',
    'Command_Message',
    'Primary_Focus',
    'Required_Operator_Action',
    'Visibility_Level',
    'Update_Priority',
    'Update_Status',
    'Source_Record',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureCommandCenterUpdatesSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'COMMAND_CENTER_UPDATES',
    sciipGetCommandCenterUpdatesHeaders740_()
  );
}

function sciipRunCommandCenterUpdateProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetCommandCenterUpdateProcessorName740_(),
    action: 'COMMAND_CENTER_UPDATE_BUILD',
    sourceSheet: 'OPERATOR_BRIEFINGS',
    targetSheet: 'COMMAND_CENTER_UPDATES',
    ledgerSheet: 'COMMAND_CENTER_UPDATES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const operatorBriefings = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('OPERATOR_BRIEFINGS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: operatorBriefings.length,
        outputCount: operatorBriefings.length ? 1 : 0,
        summary: 'Command center update runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetCommandCenterUpdateProcessorName740_(),
          inputSheets: ['OPERATOR_BRIEFINGS']
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
      const outputSheet = sciipEnsureCommandCenterUpdatesSchema();
      const updateDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const commandCenterUpdateBusinessKey = 'COMMAND_CENTER_UPDATE|' + updateDate;

      if (sciipRuntimeBusinessKeyPrefixExists740_(definition.targetSheet, commandCenterUpdateBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetCommandCenterUpdateProcessorName740_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            operatorBriefingsReviewed: 0,
            commandCenterUpdatesCreated: 0,
            skippedDuplicate: 1,
            commandCenterUpdateBusinessKey: commandCenterUpdateBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const operatorBriefings = sciipGetRuntimeRecordsByDate740_(
        'OPERATOR_BRIEFINGS',
        'Briefing_Date',
        updateDate
      );

      if (operatorBriefings.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetCommandCenterUpdateProcessorName740_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            operatorBriefingsReviewed: 0,
            commandCenterUpdatesCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const update = sciipCreateCommandCenterUpdate740_({
        businessKey: commandCenterUpdateBusinessKey,
        updateDate: updateDate,
        operatorBriefing: operatorBriefings[0],
        processor: sciipGetCommandCenterUpdateProcessorName740_()
      });

      outputSheet.appendRow(update);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetCommandCenterUpdateProcessorName740_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: operatorBriefings.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          operatorBriefingsReviewed: operatorBriefings.length,
          commandCenterUpdatesCreated: 1,
          skippedDuplicate: 0,
          commandCenterUpdateBusinessKey: commandCenterUpdateBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists740_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate740_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue740_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue740_(value) {
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

function sciipExtractFirstAvailable740_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipGenerateId740_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipCreateCommandCenterUpdate740_(args) {
  const now = new Date();

  const briefing = args.operatorBriefing;

  const operatorBriefingId = sciipExtractFirstAvailable740_(briefing, [
    'Operator_Briefing_ID'
  ]);

  const profile = sciipInferCommandCenterUpdateProfile740_(briefing);

  return [
    sciipGenerateId740_('CCU'),
    args.businessKey,
    args.updateDate,
    operatorBriefingId,
    sciipExtractFirstAvailable740_(briefing, ['Briefing_Title']),
    sciipExtractFirstAvailable740_(briefing, ['Recommended_Operating_Posture']),
    sciipExtractFirstAvailable740_(briefing, ['Priority_Assessment']),
    sciipExtractFirstAvailable740_(briefing, ['Operator_Decision_Focus']),
    sciipExtractFirstAvailable740_(briefing, ['Next_Best_Action']),
    profile.updateType,
    profile.updateTitle,
    profile.commandStatus,
    profile.commandMessage,
    profile.primaryFocus,
    profile.requiredOperatorAction,
    profile.visibilityLevel,
    profile.updatePriority,
    'PUBLISHED_TO_COMMAND_CENTER',
    'OPERATOR_BRIEFINGS:' + operatorBriefingId,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferCommandCenterUpdateProfile740_(briefing) {
  const briefingTitle = sciipExtractFirstAvailable740_(briefing, [
    'Briefing_Title'
  ]);

  const operatingPosture = sciipExtractFirstAvailable740_(briefing, [
    'Recommended_Operating_Posture'
  ]);

  const priorityAssessment = sciipExtractFirstAvailable740_(briefing, [
    'Priority_Assessment'
  ]);

  const operatorDecisionFocus = sciipExtractFirstAvailable740_(briefing, [
    'Operator_Decision_Focus'
  ]);

  const commandCenterMessage = sciipExtractFirstAvailable740_(briefing, [
    'Command_Center_Message'
  ]);

  const nextBestAction = sciipExtractFirstAvailable740_(briefing, [
    'Next_Best_Action'
  ]);

  let updateType = 'STANDARD_COMMAND_UPDATE';
  let updateTitle = briefingTitle || 'SCIIP Command Center Update';
  let commandStatus = 'NORMAL';
  let primaryFocus =
    'Review current action queue and continue normal SCIIP operations.';
  let requiredOperatorAction =
    nextBestAction || 'Review command center update and action queue.';
  let visibilityLevel = 'OPERATOR';
  let updatePriority = 'MEDIUM';

  const postureText = String(operatingPosture || '').toUpperCase();

  if (postureText.includes('PRIORITY_REVIEW')) {
    updateType = 'PRIORITY_COMMAND_UPDATE';
    commandStatus = 'PRIORITY_REVIEW_REQUIRED';
    primaryFocus =
      'High-priority or due-now action items require operator attention.';
    updatePriority = 'HIGH';
  }

  if (postureText.includes('OPERATOR_GOVERNANCE')) {
    updateType = 'GOVERNANCE_COMMAND_UPDATE';
    commandStatus = 'OPERATOR_GOVERNANCE_REQUIRED';
    primaryFocus =
      'Operator-review items must be resolved before SCIIP changes confidence, weights, graph structure, or processor behavior.';
    updatePriority = 'HIGH';
  }

  if (postureText.includes('RISK_REVIEW')) {
    updateType = 'RISK_COMMAND_UPDATE';
    commandStatus = 'RISK_REVIEW_REQUIRED';
    primaryFocus =
      'Risk-related actions require review for severity, timing, affected entities, and mitigation path.';
    updatePriority = 'HIGH';
  }

  if (postureText.includes('OPPORTUNITY_REVIEW')) {
    updateType = 'OPPORTUNITY_COMMAND_UPDATE';
    commandStatus = 'OPPORTUNITY_REVIEW_REQUIRED';
    primaryFocus =
      'Opportunity-related actions require review for timing, target fit, ownership fit, pricing gap, and actionability.';
    updatePriority = 'HIGH';
  }

  if (postureText.includes('CONTINUE_NORMAL')) {
    updateType = 'NORMAL_COMMAND_UPDATE';
    commandStatus = 'NORMAL_OPERATIONS';
    updatePriority = 'MEDIUM';
  }

  const commandMessage = [
    commandCenterMessage || 'SCIIP generated a command center update from the operator briefing.',
    '',
    'Command status: ' + commandStatus + '.',
    'Operating posture: ' + (operatingPosture || 'UNKNOWN') + '.',
    'Priority assessment: ' + (priorityAssessment || 'No priority assessment recorded.'),
    'Operator decision focus: ' + (operatorDecisionFocus || 'No decision focus recorded.'),
    'Next best action: ' + requiredOperatorAction
  ].join('\n');

  return {
    updateType: updateType,
    updateTitle: updateTitle,
    commandStatus: commandStatus,
    commandMessage: commandMessage,
    primaryFocus: primaryFocus,
    requiredOperatorAction: requiredOperatorAction,
    visibilityLevel: visibilityLevel,
    updatePriority: updatePriority
  };
}

function sciipTestCommandCenterUpdateProcessor() {
  const result = sciipRunCommandCenterUpdateProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestCommandCenterUpdateProcessor',
    result: result
  }));

  return result;
}
