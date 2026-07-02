/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 730_OperatorBriefingProcessor
 *
 * ACTION_DIGESTS → OPERATOR_BRIEFINGS
 *
 * Migration note:
 * Preserves original 730 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetOperatorBriefingProcessorName730_() {
  return '730_OperatorBriefingProcessor';
}

function sciipGetOperatorBriefingsHeaders730_() {
  return [
    'Operator_Briefing_ID',
    'Business_Key',
    'Briefing_Date',
    'Action_Digest_ID',
    'Actions_Reviewed',
    'High_Priority_Count',
    'Due_Now_Count',
    'Operator_Review_Count',
    'Risk_Action_Count',
    'Opportunity_Action_Count',
    'Briefing_Title',
    'Executive_Brief',
    'Priority_Assessment',
    'Operator_Decision_Focus',
    'Recommended_Operating_Posture',
    'Command_Center_Message',
    'Next_Best_Action',
    'Briefing_Status',
    'Source_Record',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureOperatorBriefingsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'OPERATOR_BRIEFINGS',
    sciipGetOperatorBriefingsHeaders730_()
  );
}

function sciipRunOperatorBriefingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetOperatorBriefingProcessorName730_(),
    action: 'OPERATOR_BRIEFING_BUILD',
    sourceSheet: 'ACTION_DIGESTS',
    targetSheet: 'OPERATOR_BRIEFINGS',
    ledgerSheet: 'OPERATOR_BRIEFINGS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const actionDigests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('ACTION_DIGESTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: actionDigests.length,
        outputCount: actionDigests.length ? 1 : 0,
        summary: 'Operator briefing runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetOperatorBriefingProcessorName730_(),
          inputSheets: ['ACTION_DIGESTS']
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
      const outputSheet = sciipEnsureOperatorBriefingsSchema();
      const briefingDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const operatorBriefingBusinessKey = 'OPERATOR_BRIEFING|' + briefingDate;

      if (sciipRuntimeBusinessKeyPrefixExists730_(definition.targetSheet, operatorBriefingBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetOperatorBriefingProcessorName730_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionDigestsReviewed: 0,
            operatorBriefingsCreated: 0,
            skippedDuplicate: 1,
            operatorBriefingBusinessKey: operatorBriefingBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const actionDigests = sciipGetRuntimeRecordsByDate730_(
        'ACTION_DIGESTS',
        'Digest_Date',
        briefingDate
      );

      if (actionDigests.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetOperatorBriefingProcessorName730_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionDigestsReviewed: 0,
            operatorBriefingsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const briefing = sciipCreateOperatorBriefing730_({
        businessKey: operatorBriefingBusinessKey,
        briefingDate: briefingDate,
        actionDigest: actionDigests[0],
        processor: sciipGetOperatorBriefingProcessorName730_()
      });

      outputSheet.appendRow(briefing);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetOperatorBriefingProcessorName730_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: actionDigests.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          actionDigestsReviewed: actionDigests.length,
          operatorBriefingsCreated: 1,
          skippedDuplicate: 0,
          operatorBriefingBusinessKey: operatorBriefingBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists730_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate730_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue730_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue730_(value) {
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

function sciipExtractFirstAvailable730_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipGenerateId730_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipCreateOperatorBriefing730_(args) {
  const now = new Date();
  const digest = args.actionDigest;

  const actionDigestId = sciipExtractFirstAvailable730_(digest, [
    'Action_Digest_ID'
  ]);

  const profile = sciipInferOperatorBriefingProfile730_(digest);

  return [
    sciipGenerateId730_('OBR'),
    args.businessKey,
    args.briefingDate,
    actionDigestId,
    sciipExtractFirstAvailable730_(digest, ['Actions_Reviewed']),
    sciipExtractFirstAvailable730_(digest, ['High_Priority_Count']),
    sciipExtractFirstAvailable730_(digest, ['Due_Now_Count']),
    sciipExtractFirstAvailable730_(digest, ['Operator_Review_Count']),
    sciipExtractFirstAvailable730_(digest, ['Risk_Action_Count']),
    sciipExtractFirstAvailable730_(digest, ['Opportunity_Action_Count']),
    profile.briefingTitle,
    profile.executiveBrief,
    profile.priorityAssessment,
    profile.operatorDecisionFocus,
    profile.recommendedOperatingPosture,
    profile.commandCenterMessage,
    profile.nextBestAction,
    'GENERATED',
    'ACTION_DIGESTS:' + actionDigestId,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferOperatorBriefingProfile730_(digest) {
  const actionsReviewed = Number(
    sciipExtractFirstAvailable730_(digest, ['Actions_Reviewed']) || 0
  );

  const highPriorityCount = Number(
    sciipExtractFirstAvailable730_(digest, ['High_Priority_Count']) || 0
  );

  const dueNowCount = Number(
    sciipExtractFirstAvailable730_(digest, ['Due_Now_Count']) || 0
  );

  const operatorReviewCount = Number(
    sciipExtractFirstAvailable730_(digest, ['Operator_Review_Count']) || 0
  );

  const riskActionCount = Number(
    sciipExtractFirstAvailable730_(digest, ['Risk_Action_Count']) || 0
  );

  const opportunityActionCount = Number(
    sciipExtractFirstAvailable730_(digest, ['Opportunity_Action_Count']) || 0
  );

  const digestSummary = sciipExtractFirstAvailable730_(digest, [
    'Digest_Summary'
  ]);

  const topActionFocus = sciipExtractFirstAvailable730_(digest, [
    'Top_Action_Focus'
  ]);

  const recommendedOperatorResponse = sciipExtractFirstAvailable730_(digest, [
    'Recommended_Operator_Response'
  ]);

  let briefingTitle = 'SCIIP Operator Briefing';
  let priorityAssessment =
    'Normal operating posture. Review queued actions in priority order.';
  let operatorDecisionFocus =
    'Determine whether any queued actions require manual review, escalation, or additional evidence.';
  let recommendedOperatingPosture =
    'CONTINUE_NORMAL_OPERATIONS';
  let commandCenterMessage =
    'SCIIP has generated an operator briefing from the daily action digest.';
  let nextBestAction =
    'Review the action queue and update action statuses after completion.';

  if (highPriorityCount > 0 || dueNowCount > 0) {
    briefingTitle = 'SCIIP Operator Briefing — Priority Actions Required';
    priorityAssessment =
      highPriorityCount + ' high-priority action(s) and ' + dueNowCount + ' due-now action(s) require attention.';
    recommendedOperatingPosture =
      'PRIORITY_REVIEW_MODE';
    nextBestAction =
      'Review due-now and high-priority action items before lower-priority monitoring items.';
  }

  if (operatorReviewCount > 0) {
    operatorDecisionFocus =
      'Operator-review items must be resolved before SCIIP applies autonomous graph confidence, signal weighting, calibration, or processor behavior changes.';
    recommendedOperatingPosture =
      'OPERATOR_GOVERNANCE_MODE';
    nextBestAction =
      'Resolve operator-review items first, then proceed to risk, opportunity, property, company, or system queues.';
  }

  if (riskActionCount > 0) {
    priorityAssessment =
      'Risk-related action items are present and should be reviewed for severity, timing, affected entities, and mitigation path.';
    recommendedOperatingPosture =
      'RISK_REVIEW_MODE';
  }

  if (opportunityActionCount > 0 && riskActionCount === 0) {
    priorityAssessment =
      'Opportunity-related action items are present and should be reviewed for timing, target fit, ownership fit, pricing gap, and actionability.';
    recommendedOperatingPosture =
      'OPPORTUNITY_REVIEW_MODE';
  }

  const executiveBrief = [
    'SCIIP reviewed ' + actionsReviewed + ' action item(s) from the daily action digest.',
    'High-priority: ' + highPriorityCount + '. Due now: ' + dueNowCount + '. Operator review: ' + operatorReviewCount + '.',
    'Risk actions: ' + riskActionCount + '. Opportunity actions: ' + opportunityActionCount + '.',
    '',
    'Digest focus: ' + (topActionFocus || 'No focus recorded.'),
    '',
    'Recommended response: ' + (recommendedOperatorResponse || 'No response recorded.'),
    '',
    'Digest summary:\n' + (digestSummary || 'No digest summary recorded.')
  ].join('\n');

  commandCenterMessage = [
    commandCenterMessage,
    'Operating posture: ' + recommendedOperatingPosture + '.',
    'Operating posture: ' + recommendedOperatingPosture + '.',
    'Decision focus: ' + operatorDecisionFocus,
    'Next best action: ' + nextBestAction
  ].join('\n');

  return {
    briefingTitle: briefingTitle,
    executiveBrief: executiveBrief,
    priorityAssessment: priorityAssessment,
    operatorDecisionFocus: operatorDecisionFocus,
    recommendedOperatingPosture: recommendedOperatingPosture,
    commandCenterMessage: commandCenterMessage,
    nextBestAction: nextBestAction
  };
}

function sciipTestOperatorBriefingProcessor() {
  const result = sciipRunOperatorBriefingProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestOperatorBriefingProcessor',
    result: result
  }));

  return result;
}
