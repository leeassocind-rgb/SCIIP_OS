/** SCIIP_OS compiled bundle: 11_other_006.gs
 * sources: 54
 * generated: 2026-07-17T19:08:05.748Z
 */
/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 720_ActionDigestProcessor
 *
 * ACTION_QUEUE → ACTION_DIGESTS
 *
 * Migration note:
 * Preserves original 720 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetActionDigestProcessorName720_() {
  return '720_ActionDigestProcessor';
}

function sciipGetActionDigestHeaders720_() {
  return [
    'Action_Digest_ID',
    'Business_Key',
    'Digest_Date',
    'Actions_Reviewed',
    'High_Priority_Count',
    'Medium_Priority_Count',
    'Low_Priority_Count',
    'Due_Now_Count',
    'Operator_Review_Count',
    'Risk_Action_Count',
    'Opportunity_Action_Count',
    'Property_Action_Count',
    'Company_Action_Count',
    'System_Action_Count',
    'Digest_Title',
    'Digest_Summary',
    'Top_Action_Focus',
    'Recommended_Operator_Response',
    'Digest_Status',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureActionDigestsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'ACTION_DIGESTS',
    sciipGetActionDigestHeaders720_()
  );
}

function sciipRunActionDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetActionDigestProcessorName720_(),
    action: 'ACTION_DIGEST_BUILD',
    sourceSheet: 'ACTION_QUEUE',
    targetSheet: 'ACTION_DIGESTS',
    ledgerSheet: 'ACTION_DIGESTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const actionItems = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('ACTION_QUEUE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: actionItems.length,
        outputCount: actionItems.length ? 1 : 0,
        summary: 'Action digest runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetActionDigestProcessorName720_(),
          inputSheets: ['ACTION_QUEUE']
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
      const outputSheet = sciipEnsureActionDigestsSchema();
      const digestDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const actionDigestBusinessKey = 'ACTION_DIGEST|' + digestDate;

      if (sciipRuntimeBusinessKeyPrefixExists720_(definition.targetSheet, actionDigestBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetActionDigestProcessorName720_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionsReviewed: 0,
            actionDigestsCreated: 0,
            skippedDuplicate: 1,
            actionDigestBusinessKey: actionDigestBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const actionItems = sciipGetRuntimeRecordsByDate720_(
        'ACTION_QUEUE',
        'Queue_Date',
        digestDate
      );

      if (actionItems.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetActionDigestProcessorName720_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionsReviewed: 0,
            actionDigestsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const digest = sciipCreateActionDigest720_({
        businessKey: actionDigestBusinessKey,
        digestDate: digestDate,
        actionItems: actionItems,
        processor: sciipGetActionDigestProcessorName720_()
      });

      outputSheet.appendRow(digest);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetActionDigestProcessorName720_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: actionItems.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          actionsReviewed: actionItems.length,
          actionDigestsCreated: 1,
          skippedDuplicate: 0,
          actionDigestBusinessKey: actionDigestBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists720_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate720_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue720_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue720_(value) {
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

function sciipExtractFirstAvailable720_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipGenerateId720_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipCreateActionDigest720_(args) {
  const now = new Date();

  const profile = sciipInferActionDigestProfile720_(args.actionItems);

  return [
    sciipGenerateId720_('ADG'),
    args.businessKey,
    args.digestDate,
    args.actionItems.length,
    profile.highPriorityCount,
    profile.mediumPriorityCount,
    profile.lowPriorityCount,
    profile.dueNowCount,
    profile.operatorReviewCount,
    profile.riskActionCount,
    profile.opportunityActionCount,
    profile.propertyActionCount,
    profile.companyActionCount,
    profile.systemActionCount,
    profile.digestTitle,
    profile.digestSummary,
    profile.topActionFocus,
    profile.recommendedOperatorResponse,
    'GENERATED',
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferActionDigestProfile720_(actionItems) {
  let highPriorityCount = 0;
  let mediumPriorityCount = 0;
  let lowPriorityCount = 0;
  let dueNowCount = 0;
  let operatorReviewCount = 0;
  let riskActionCount = 0;
  let opportunityActionCount = 0;
  let propertyActionCount = 0;
  let companyActionCount = 0;
  let systemActionCount = 0;

  const topItems = [];

  actionItems.forEach(function(item) {
    const priority = String(
      sciipExtractFirstAvailable720_(item, ['Priority'])
    ).toUpperCase();

    const dueStatus = String(
      sciipExtractFirstAvailable720_(item, ['Due_Status'])
    ).toUpperCase();

    const actionType = String(
      sciipExtractFirstAvailable720_(item, ['Action_Item_Type'])
    ).toUpperCase();

    const title = sciipExtractFirstAvailable720_(item, [
      'Action_Title'
    ]);

    const objective = sciipExtractFirstAvailable720_(item, [
      'Action_Objective'
    ]);

    if (priority === 'HIGH') highPriorityCount++;
    else if (priority === 'LOW') lowPriorityCount++;
    else mediumPriorityCount++;

    if (dueStatus === 'DUE_NOW') dueNowCount++;

    if (actionType.indexOf('OPERATOR') !== -1) operatorReviewCount++;
    if (actionType.indexOf('RISK') !== -1) riskActionCount++;
    if (actionType.indexOf('OPPORTUNITY') !== -1) opportunityActionCount++;
    if (actionType.indexOf('PROPERTY') !== -1) propertyActionCount++;
    if (actionType.indexOf('COMPANY') !== -1) companyActionCount++;
    if (actionType.indexOf('SYSTEM') !== -1) systemActionCount++;

    if (
      priority === 'HIGH' ||
      dueStatus === 'DUE_NOW' ||
      actionType.indexOf('RISK') !== -1 ||
      actionType.indexOf('OPPORTUNITY') !== -1 ||
      actionType.indexOf('OPERATOR') !== -1
    ) {
      topItems.push(
        '- ' + (title || actionType) + ': ' + (objective || 'No objective recorded.')
      );
    }
  });

  let digestTitle = 'Daily Action Digest';
  let topActionFocus =
    'Review queued action items and prioritize high-priority or due-now work.';
  let recommendedOperatorResponse =
    'Review the action queue, complete high-priority items first, and update queue status after review.';

  if (dueNowCount > 0 || highPriorityCount > 0) {
    digestTitle = 'Daily Action Digest — High Priority Review Required';
    topActionFocus =
      'High-priority or due-now action items require operator attention.';
    recommendedOperatorResponse =
      'Start with due-now and high-priority action items, especially risk, opportunity, and operator-review routes.';
  }

  if (riskActionCount > 0) {
    topActionFocus =
      'Risk-related actions are present and should be reviewed for severity, affected entities, timing, and mitigation path.';
  }

  if (opportunityActionCount > 0 && riskActionCount === 0) {
    topActionFocus =
      'Opportunity-related actions are present and should be reviewed for timing, target fit, ownership fit, and actionability.';
  }

  if (operatorReviewCount > 0) {
    recommendedOperatorResponse =
      'Resolve operator-review items before SCIIP applies autonomous confidence, weighting, graph, or processor changes.';
  }

  const digestSummary = [
    'SCIIP reviewed ' + actionItems.length + ' queued action item(s).',
    'Priority mix: ' + highPriorityCount + ' high, ' + mediumPriorityCount + ' medium, ' + lowPriorityCount + ' low.',
    'Due now: ' + dueNowCount + '.',
    'Workflow mix: ' + operatorReviewCount + ' operator review, ' + riskActionCount + ' risk, ' + opportunityActionCount + ' opportunity, ' + propertyActionCount + ' property, ' + companyActionCount + ' company, ' + systemActionCount + ' system.',
    '',
    'Top action items:',
    topItems.length ? topItems.join('\n') : '- No high-priority action items identified.'
  ].join('\n');

  return {
    highPriorityCount: highPriorityCount,
    mediumPriorityCount: mediumPriorityCount,
    lowPriorityCount: lowPriorityCount,
    dueNowCount: dueNowCount,
    operatorReviewCount: operatorReviewCount,
    riskActionCount: riskActionCount,
    opportunityActionCount: opportunityActionCount,
    propertyActionCount: propertyActionCount,
    companyActionCount: companyActionCount,
    systemActionCount: systemActionCount,
    digestTitle: digestTitle,
    digestSummary: digestSummary,
    topActionFocus: topActionFocus,
    recommendedOperatorResponse: recommendedOperatorResponse
  };
}

function sciipTestActionDigestProcessor() {
  const result = sciipRunActionDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionDigestProcessor',
    result: result
  }));

  return result;
}


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


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 750_AutonomousOpsDigestProcessor
 *
 * COMMAND_CENTER_UPDATES → AUTONOMOUS_OPS_DIGESTS
 *
 * Migration note:
 * Preserves original 750 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousOpsDigestProcessorName750_() {
  return '750_AutonomousOpsDigestProcessor';
}

function sciipGetAutonomousOpsDigestsHeaders750_() {
  return [
    'Digest_ID',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Digest_Title',
    'Digest_Text',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousOpsDigestSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_OPS_DIGESTS',
    sciipGetAutonomousOpsDigestsHeaders750_()
  );
}

function sciipRunAutonomousOpsDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousOpsDigestProcessorName750_(),
    action: 'AUTONOMOUS_OPS_DIGEST_BUILD',
    sourceSheet: 'COMMAND_CENTER_UPDATES',
    targetSheet: 'AUTONOMOUS_OPS_DIGESTS',
    ledgerSheet: 'AUTONOMOUS_OPS_DIGESTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const commandCenterUpdates = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('COMMAND_CENTER_UPDATES');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: commandCenterUpdates.length,
        outputCount: commandCenterUpdates.length ? 1 : 0,
        summary: 'Autonomous operations digest runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousOpsDigestProcessorName750_(),
          inputSheets: ['COMMAND_CENTER_UPDATES']
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
      const outputSheet = sciipEnsureAutonomousOpsDigestSchema();
      const digestDate =
        sciipResolveLatestRuntimeProcessingDate750_('COMMAND_CENTER_UPDATES', 'Update_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousOpsDigestBusinessKey = 'AUTONOMOUS_OPS_DIGEST|' + digestDate;

      if (sciipRuntimeBusinessKeyPrefixExists750_(definition.targetSheet, autonomousOpsDigestBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousOpsDigestProcessorName750_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            commandCenterUpdatesReviewed: 0,
            autonomousOpsDigestsCreated: 0,
            skippedDuplicate: 1,
            autonomousOpsDigestBusinessKey: autonomousOpsDigestBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const commandCenterUpdates = sciipGetRuntimeRecordsByDate750_(
        'COMMAND_CENTER_UPDATES',
        'Update_Date',
        digestDate
      );

      if (commandCenterUpdates.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousOpsDigestProcessorName750_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            commandCenterUpdatesReviewed: 0,
            autonomousOpsDigestsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const digest = sciipCreateAutonomousOpsDigest750_({
        businessKey: autonomousOpsDigestBusinessKey,
        digestDate: digestDate,
        sourceRows: commandCenterUpdates,
        processor: sciipGetAutonomousOpsDigestProcessorName750_()
      });

      outputSheet.appendRow(digest);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousOpsDigestProcessorName750_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: commandCenterUpdates.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          commandCenterUpdatesReviewed: commandCenterUpdates.length,
          autonomousOpsDigestsCreated: 1,
          skippedDuplicate: 0,
          autonomousOpsDigestBusinessKey: autonomousOpsDigestBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists750_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate750_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue750_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate750_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue750_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue750_(value) {
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

function sciipCreateAutonomousOpsDigest750_(args) {
  return [
    sciipGenerateId750_('AUTONOMOUS_OPS_DIGEST'),
    args.businessKey,
    args.digestDate,
    'COMMAND_CENTER_UPDATES',
    args.sourceRows.length,
    'Autonomous Operations Digest — ' + args.digestDate,
    sciipCreateAutonomousOpsDigestText750_(args.digestDate, args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousOpsDigestText750_(digestDate, sourceRows) {
  const lines = [];

  lines.push('Autonomous Operations Digest for ' + digestDate);
  lines.push('');
  lines.push('Source Records Reviewed: ' + sourceRows.length);
  lines.push('');

  sourceRows.forEach(function(row, index) {
    lines.push('Update ' + (index + 1) + ':');

    const preferredFields = [
      'Update_Title',
      'Update_Text',
      'Command_Update',
      'Summary',
      'Status',
      'Processor',
      'Business_Key'
    ];

    preferredFields.forEach(function(field) {
      if (row[field]) {
        lines.push(field + ': ' + row[field]);
      }
    });

    lines.push('');
  });

  return lines.join('\n').trim();
}

function sciipGenerateId750_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipTestAutonomousOpsDigestProcessor() {
  const result = sciipRunAutonomousOpsDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOpsDigestProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 760_AutonomousOpsLearningProcessor
 *
 * AUTONOMOUS_OPS_DIGESTS → AUTONOMOUS_OPS_LEARNINGS
 *
 * Migration note:
 * Preserves original 760 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousOpsLearningProcessorName760_() {
  return '760_AutonomousOpsLearningProcessor';
}

function sciipGetAutonomousOpsLearningsHeaders760_() {
  return [
    'Learning_ID',
    'Business_Key',
    'Learning_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Learning_Title',
    'Operational_Learning',
    'Recommended_Adjustment',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousOpsLearningSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_OPS_LEARNINGS',
    sciipGetAutonomousOpsLearningsHeaders760_()
  );
}

function sciipRunAutonomousOpsLearningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousOpsLearningProcessorName760_(),
    action: 'AUTONOMOUS_OPS_LEARNING_BUILD',
    sourceSheet: 'AUTONOMOUS_OPS_DIGESTS',
    targetSheet: 'AUTONOMOUS_OPS_LEARNINGS',
    ledgerSheet: 'AUTONOMOUS_OPS_LEARNINGS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousOpsDigests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_OPS_DIGESTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousOpsDigests.length,
        outputCount: autonomousOpsDigests.length ? 1 : 0,
        summary: 'Autonomous operations learning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousOpsLearningProcessorName760_(),
          inputSheets: ['AUTONOMOUS_OPS_DIGESTS']
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
      const outputSheet = sciipEnsureAutonomousOpsLearningSchema();
      const learningDate =
        sciipResolveLatestRuntimeProcessingDate760_('AUTONOMOUS_OPS_DIGESTS', 'Digest_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousOpsLearningBusinessKey = 'AUTONOMOUS_OPS_LEARNING|' + learningDate;

      if (sciipRuntimeBusinessKeyPrefixExists760_(definition.targetSheet, autonomousOpsLearningBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousOpsLearningProcessorName760_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOpsDigestsReviewed: 0,
            autonomousOpsLearningsCreated: 0,
            skippedDuplicate: 1,
            autonomousOpsLearningBusinessKey: autonomousOpsLearningBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousOpsDigests = sciipGetRuntimeRecordsByDate760_(
        'AUTONOMOUS_OPS_DIGESTS',
        'Digest_Date',
        learningDate
      );

      if (!autonomousOpsDigests.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousOpsLearningProcessorName760_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOpsDigestsReviewed: 0,
            autonomousOpsLearningsCreated: 0,
            skippedNoInputs: 1,
            learningDate: learningDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const learning = sciipCreateAutonomousOpsLearning760_({
        businessKey: autonomousOpsLearningBusinessKey,
        learningDate: learningDate,
        sourceRows: autonomousOpsDigests,
        processor: sciipGetAutonomousOpsLearningProcessorName760_()
      });

      outputSheet.appendRow(learning);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousOpsLearningProcessorName760_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousOpsDigests.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousOpsDigestsReviewed: autonomousOpsDigests.length,
          autonomousOpsLearningsCreated: 1,
          skippedDuplicate: 0,
          autonomousOpsLearningBusinessKey: autonomousOpsLearningBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists760_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate760_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue760_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate760_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue760_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue760_(value) {
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

function sciipCreateAutonomousOpsLearning760_(args) {
  return [
    sciipGenerateId760_('AUTONOMOUS_OPS_LEARNING'),
    args.businessKey,
    args.learningDate,
    'AUTONOMOUS_OPS_DIGESTS',
    args.sourceRows.length,
    'Autonomous Operations Learning — ' + args.learningDate,
    sciipCreateAutonomousOpsLearningText760_(args.sourceRows),
    sciipCreateAutonomousOpsAdjustmentText760_(args.sourceRows),
    args.sourceRows.length > 0 ? 'MEDIUM' : 'LOW',
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousOpsLearningText760_(sourceRows) {
  const digestCount = sourceRows.length;

  const totalSourceRecords = sourceRows.reduce(function(sum, row) {
    const count = Number(row.Source_Record_Count || 0);
    return sum + count;
  }, 0);

  return [
    'SCIIP completed an autonomous operations digest cycle using ' + digestCount + ' digest record(s).',
    'The operating loop reviewed ' + totalSourceRecords + ' upstream command center update record(s).',
    'The system successfully converted operational activity into durable learning history.'
  ].join(' ');
}

function sciipCreateAutonomousOpsAdjustmentText760_(sourceRows) {
  if (!sourceRows.length) {
    return 'No adjustment recommended because no source digest records were available.';
  }

  return [
    'Continue routing completed autonomous operating loops into durable learning records.',
    'Use these learnings to support future memory consolidation, reasoning calibration, and strategic feedback processors.'
  ].join(' ');
}

function sciipGenerateId760_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousOpsLearningProcessor() {
  const result = sciipRunAutonomousOpsLearningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOpsLearningProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 770_AutonomousImprovementPlanProcessor
 *
 * AUTONOMOUS_OPS_LEARNINGS → AUTONOMOUS_IMPROVEMENT_PLANS
 *
 * Migration note:
 * Preserves original 770 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementPlanProcessorName770_() {
  return '770_AutonomousImprovementPlanProcessor';
}

function sciipGetAutonomousImprovementPlanHeaders770_() {
  return [
    'Improvement_Plan_ID',
    'Business_Key',
    'Plan_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Plan_Title',
    'Improvement_Objective',
    'Improvement_Actions',
    'Expected_System_Impact',
    'Priority',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementPlanSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_PLANS',
    sciipGetAutonomousImprovementPlanHeaders770_()
  );
}

function sciipRunAutonomousImprovementPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementPlanProcessorName770_(),
    action: 'AUTONOMOUS_IMPROVEMENT_PLAN_BUILD',
    sourceSheet: 'AUTONOMOUS_OPS_LEARNINGS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_PLANS',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_PLANS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousOpsLearnings = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_OPS_LEARNINGS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousOpsLearnings.length,
        outputCount: autonomousOpsLearnings.length ? 1 : 0,
        summary: 'Autonomous improvement plan runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementPlanProcessorName770_(),
          inputSheets: ['AUTONOMOUS_OPS_LEARNINGS']
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
      const outputSheet = sciipEnsureAutonomousImprovementPlanSchema();
      const planDate =
        sciipResolveLatestRuntimeProcessingDate770_('AUTONOMOUS_OPS_LEARNINGS', 'Learning_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementPlanBusinessKey = 'AUTONOMOUS_IMPROVEMENT_PLAN|' + planDate;

      if (sciipRuntimeBusinessKeyPrefixExists770_(definition.targetSheet, autonomousImprovementPlanBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementPlanProcessorName770_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOpsLearningsReviewed: 0,
            autonomousImprovementPlansCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementPlanBusinessKey: autonomousImprovementPlanBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousOpsLearnings = sciipGetRuntimeRecordsByDate770_(
        'AUTONOMOUS_OPS_LEARNINGS',
        'Learning_Date',
        planDate
      );

      if (!autonomousOpsLearnings.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementPlanProcessorName770_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOpsLearningsReviewed: 0,
            autonomousImprovementPlansCreated: 0,
            skippedNoInputs: 1,
            planDate: planDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const plan = sciipCreateAutonomousImprovementPlan770_({
        businessKey: autonomousImprovementPlanBusinessKey,
        planDate: planDate,
        sourceRows: autonomousOpsLearnings,
        processor: sciipGetAutonomousImprovementPlanProcessorName770_()
      });

      outputSheet.appendRow(plan);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementPlanProcessorName770_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousOpsLearnings.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousOpsLearningsReviewed: autonomousOpsLearnings.length,
          autonomousImprovementPlansCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementPlanBusinessKey: autonomousImprovementPlanBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists770_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate770_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue770_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate770_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue770_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue770_(value) {
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

function sciipCreateAutonomousImprovementPlan770_(args) {
  return [
    sciipGenerateId770_('AUTONOMOUS_IMPROVEMENT_PLAN'),
    args.businessKey,
    args.planDate,
    'AUTONOMOUS_OPS_LEARNINGS',
    args.sourceRows.length,
    'Autonomous Improvement Plan — ' + args.planDate,
    sciipCreateAutonomousImprovementObjective770_(args.sourceRows),
    sciipCreateAutonomousImprovementActions770_(args.sourceRows),
    sciipCreateAutonomousImprovementImpact770_(args.sourceRows),
    'MEDIUM',
    'PROPOSED',
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementObjective770_(sourceRows) {
  return [
    'Convert ' + sourceRows.length + ' autonomous operations learning record(s) into an actionable improvement plan.',
    'Strengthen SCIIP_OS by ensuring operational feedback becomes permanent system improvement history.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementActions770_(sourceRows) {
  const actions = [
    'Review autonomous learning records for recurring system patterns.',
    'Identify whether routing, digesting, memory consolidation, or reasoning calibration should be adjusted.',
    'Preserve the improvement recommendation as a durable operating-system record.',
    'Make the improvement plan available to downstream prioritization and execution processors.'
  ];

  return actions.join('\n');
}

function sciipCreateAutonomousImprovementImpact770_(sourceRows) {
  return [
    'Expected impact is improved autonomous loop closure, stronger processor accountability, and better continuity between system activity, learning, and execution.',
    'This plan was generated from ' + sourceRows.length + ' validated upstream learning record(s).'
  ].join(' ');
}

function sciipGenerateId770_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementPlanProcessor() {
  const result = sciipRunAutonomousImprovementPlanProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementPlanProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 780_AutonomousImprovementTaskProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_PLANS → AUTONOMOUS_IMPROVEMENT_TASKS
 *
 * Migration note:
 * Preserves original 780 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementTaskProcessorName780_() {
  return '780_AutonomousImprovementTaskProcessor';
}

function sciipGetAutonomousImprovementTaskHeaders780_() {
  return [
    'Task_ID',
    'Business_Key',
    'Task_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Task_Title',
    'Task_Description',
    'Task_Type',
    'Priority',
    'Status',
    'Execution_Owner',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementTaskSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_TASKS',
    sciipGetAutonomousImprovementTaskHeaders780_()
  );
}

function sciipRunAutonomousImprovementTaskProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
    action: 'AUTONOMOUS_IMPROVEMENT_TASK_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_PLANS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_TASKS',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_TASKS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementPlans = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_PLANS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementPlans.length,
        outputCount: autonomousImprovementPlans.length ? 1 : 0,
        summary: 'Autonomous improvement task runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementTaskProcessorName780_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_PLANS']
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
      const outputSheet = sciipEnsureAutonomousImprovementTaskSchema();
      const taskDate =
        sciipResolveLatestRuntimeProcessingDate780_('AUTONOMOUS_IMPROVEMENT_PLANS', 'Plan_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementTaskBusinessKey = 'AUTONOMOUS_IMPROVEMENT_TASK|' + taskDate;

      if (sciipRuntimeBusinessKeyPrefixExists780_(definition.targetSheet, autonomousImprovementTaskBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementPlansReviewed: 0,
            autonomousImprovementTasksCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementTaskBusinessKey: autonomousImprovementTaskBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementPlans = sciipGetRuntimeRecordsByDate780_(
        'AUTONOMOUS_IMPROVEMENT_PLANS',
        'Plan_Date',
        taskDate
      );

      if (!autonomousImprovementPlans.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementPlansReviewed: 0,
            autonomousImprovementTasksCreated: 0,
            skippedNoInputs: 1,
            taskDate: taskDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const task = sciipCreateAutonomousImprovementTask780_({
        businessKey: autonomousImprovementTaskBusinessKey,
        taskDate: taskDate,
        sourceRows: autonomousImprovementPlans,
        processor: sciipGetAutonomousImprovementTaskProcessorName780_()
      });

      outputSheet.appendRow(task);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementPlans.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementPlansReviewed: autonomousImprovementPlans.length,
          autonomousImprovementTasksCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementTaskBusinessKey: autonomousImprovementTaskBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists780_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate780_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue780_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate780_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue780_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue780_(value) {
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

function sciipCreateAutonomousImprovementTask780_(args) {
  return [
    sciipGenerateId780_('AUTONOMOUS_IMPROVEMENT_TASK'),
    args.businessKey,
    args.taskDate,
    'AUTONOMOUS_IMPROVEMENT_PLANS',
    args.sourceRows.length,
    'Execute Autonomous Improvement Plan — ' + args.taskDate,
    sciipCreateAutonomousImprovementTaskDescription780_(args.sourceRows),
    'AUTONOMOUS_SYSTEM_IMPROVEMENT',
    sciipResolveAutonomousImprovementTaskPriority780_(args.sourceRows),
    'PENDING',
    'SCIIP_OS',
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementTaskDescription780_(sourceRows) {
  return [
    'Create an execution task from ' + sourceRows.length + ' autonomous improvement plan record(s).',
    'Review the proposed improvement objective, actions, and expected system impact.',
    'Route the improvement into downstream execution tracking so SCIIP_OS can close the loop from learning to action.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementTaskPriority780_(sourceRows) {
  const hasHighPriorityPlan = sourceRows.some(function(row) {
    return String(row.Priority || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighPriorityPlan ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId780_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementTaskProcessor() {
  const result = sciipRunAutonomousImprovementTaskProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementTaskProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 790_AutonomousImprovementExecutionProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_TASKS → AUTONOMOUS_IMPROVEMENT_EXECUTIONS
 *
 * Migration note:
 * Preserves original 790 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementExecutionProcessorName790_() {
  return '790_AutonomousImprovementExecutionProcessor';
}

function sciipGetAutonomousImprovementExecutionHeaders790_() {
  return [
    'Execution_ID',
    'Business_Key',
    'Execution_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Title',
    'Execution_Summary',
    'Execution_Status',
    'Execution_Result',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementExecutionSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    sciipGetAutonomousImprovementExecutionHeaders790_()
  );
}

function sciipRunAutonomousImprovementExecutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
    action: 'AUTONOMOUS_IMPROVEMENT_EXECUTION_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_TASKS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementTasks = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_TASKS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementTasks.length,
        outputCount: autonomousImprovementTasks.length ? 1 : 0,
        summary: 'Autonomous improvement execution runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_TASKS']
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
      const outputSheet = sciipEnsureAutonomousImprovementExecutionSchema();
      const executionDate =
        sciipResolveLatestRuntimeProcessingDate790_('AUTONOMOUS_IMPROVEMENT_TASKS', 'Task_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementExecutionBusinessKey = 'AUTONOMOUS_IMPROVEMENT_EXECUTION|' + executionDate;

      if (sciipRuntimeBusinessKeyPrefixExists790_(definition.targetSheet, autonomousImprovementExecutionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementTasksReviewed: 0,
            autonomousImprovementExecutionsCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementExecutionBusinessKey: autonomousImprovementExecutionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementTasks = sciipGetRuntimeRecordsByDate790_(
        'AUTONOMOUS_IMPROVEMENT_TASKS',
        'Task_Date',
        executionDate
      );

      if (!autonomousImprovementTasks.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementTasksReviewed: 0,
            autonomousImprovementExecutionsCreated: 0,
            skippedNoInputs: 1,
            executionDate: executionDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const execution = sciipCreateAutonomousImprovementExecution790_({
        businessKey: autonomousImprovementExecutionBusinessKey,
        executionDate: executionDate,
        sourceRows: autonomousImprovementTasks,
        processor: sciipGetAutonomousImprovementExecutionProcessorName790_()
      });

      outputSheet.appendRow(execution);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementTasks.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementTasksReviewed: autonomousImprovementTasks.length,
          autonomousImprovementExecutionsCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementExecutionBusinessKey: autonomousImprovementExecutionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists790_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate790_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue790_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate790_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue790_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue790_(value) {
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

function sciipCreateAutonomousImprovementExecution790_(args) {
  return [
    sciipGenerateId790_('AUTONOMOUS_IMPROVEMENT_EXECUTION'),
    args.businessKey,
    args.executionDate,
    'AUTONOMOUS_IMPROVEMENT_TASKS',
    args.sourceRows.length,
    'Autonomous Improvement Execution — ' + args.executionDate,
    sciipCreateAutonomousImprovementExecutionSummary790_(args.sourceRows),
    'RECORDED',
    sciipCreateAutonomousImprovementExecutionResult790_(args.sourceRows),
    sciipCreateAutonomousImprovementExecutionNextAction790_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementExecutionSummary790_(sourceRows) {
  return [
    'SCIIP_OS recorded execution tracking for ' + sourceRows.length + ' autonomous improvement task record(s).',
    'This preserves the transition from proposed system improvement into an execution-stage operating record.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementExecutionResult790_(sourceRows) {
  const pendingCount = sourceRows.filter(function(row) {
    return String(row.Status || '').trim().toUpperCase() === 'PENDING';
  }).length;

  return [
    pendingCount + ' source task record(s) were pending at execution-record creation.',
    'Execution has been recorded for downstream monitoring and outcome learning.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementExecutionNextAction790_(sourceRows) {
  return [
    'Monitor execution outcome.',
    'Route completed execution records into autonomous improvement outcome learning.',
    'Preserve result history without overwriting the original improvement task.'
  ].join(' ');
}

function sciipGenerateId790_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementExecutionProcessor() {
  const result = sciipRunAutonomousImprovementExecutionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementExecutionProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 800_AutonomousImprovementOutcomeProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_EXECUTIONS → AUTONOMOUS_IMPROVEMENT_OUTCOMES
 *
 * Migration note:
 * Preserves original 800 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementOutcomeProcessorName800_() {
  return '800_AutonomousImprovementOutcomeProcessor';
}

function sciipGetAutonomousImprovementOutcomeHeaders800_() {
  return [
    'Outcome_ID',
    'Business_Key',
    'Outcome_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Outcome_Title',
    'Outcome_Summary',
    'Learning_Captured',
    'System_Adjustment_Recommendation',
    'Outcome_Status',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementOutcomeSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    sciipGetAutonomousImprovementOutcomeHeaders800_()
  );
}

function sciipRunAutonomousImprovementOutcomeProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
    action: 'AUTONOMOUS_IMPROVEMENT_OUTCOME_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_OUTCOMES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementExecutions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_EXECUTIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementExecutions.length,
        outputCount: autonomousImprovementExecutions.length ? 1 : 0,
        summary: 'Autonomous improvement outcome runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_EXECUTIONS']
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
      const outputSheet = sciipEnsureAutonomousImprovementOutcomeSchema();
      const outcomeDate =
        sciipResolveLatestRuntimeProcessingDate800_('AUTONOMOUS_IMPROVEMENT_EXECUTIONS', 'Execution_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementOutcomeBusinessKey = 'AUTONOMOUS_IMPROVEMENT_OUTCOME|' + outcomeDate;

      if (sciipRuntimeBusinessKeyPrefixExists800_(definition.targetSheet, autonomousImprovementOutcomeBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementExecutionsReviewed: 0,
            autonomousImprovementOutcomesCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementOutcomeBusinessKey: autonomousImprovementOutcomeBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementExecutions = sciipGetRuntimeRecordsByDate800_(
        'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
        'Execution_Date',
        outcomeDate
      );

      if (!autonomousImprovementExecutions.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementExecutionsReviewed: 0,
            autonomousImprovementOutcomesCreated: 0,
            skippedNoInputs: 1,
            outcomeDate: outcomeDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outcome = sciipCreateAutonomousImprovementOutcome800_({
        businessKey: autonomousImprovementOutcomeBusinessKey,
        outcomeDate: outcomeDate,
        sourceRows: autonomousImprovementExecutions,
        processor: sciipGetAutonomousImprovementOutcomeProcessorName800_()
      });

      outputSheet.appendRow(outcome);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementExecutions.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementExecutionsReviewed: autonomousImprovementExecutions.length,
          autonomousImprovementOutcomesCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementOutcomeBusinessKey: autonomousImprovementOutcomeBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists800_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate800_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue800_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate800_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue800_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue800_(value) {
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

function sciipCreateAutonomousImprovementOutcome800_(args) {
  return [
    sciipGenerateId800_('AUTONOMOUS_IMPROVEMENT_OUTCOME'),
    args.businessKey,
    args.outcomeDate,
    'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    args.sourceRows.length,
    'Autonomous Improvement Outcome — ' + args.outcomeDate,
    sciipCreateAutonomousImprovementOutcomeSummary800_(args.sourceRows),
    sciipCreateAutonomousImprovementOutcomeLearning800_(args.sourceRows),
    sciipCreateAutonomousImprovementOutcomeRecommendation800_(args.sourceRows),
    'CAPTURED',
    sciipResolveAutonomousImprovementOutcomeConfidence800_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementOutcomeSummary800_(sourceRows) {
  return [
    'SCIIP_OS captured outcome learning from ' + sourceRows.length + ' autonomous improvement execution record(s).',
    'This completes the improvement loop from learning, to plan, to task, to execution, to outcome history.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementOutcomeLearning800_(sourceRows) {
  const recordedCount = sourceRows.filter(function(row) {
    return String(row.Execution_Status || '').trim().toUpperCase() === 'RECORDED';
  }).length;

  return [
    recordedCount + ' execution record(s) reached RECORDED status.',
    'The system successfully preserved execution-stage activity as permanent downstream learning.',
    'Future processors can now use this outcome layer to improve calibration, prioritization, and autonomous routing.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementOutcomeRecommendation800_(sourceRows) {
  return [
    'Continue using latest completed processing dates for downstream autonomous processors.',
    'Preserve all improvement-loop outputs as event-sourced history.',
    'Route captured outcomes into future strategic memory consolidation and model calibration processors.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementOutcomeConfidence800_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasRecordedExecution = sourceRows.some(function(row) {
    return String(row.Execution_Status || '').trim().toUpperCase() === 'RECORDED';
  });

  return hasRecordedExecution ? 'MEDIUM' : 'LOW';
}

function sciipGenerateId800_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementOutcomeProcessor() {
  const result = sciipRunAutonomousImprovementOutcomeProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementOutcomeProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 810_AutonomousImprovementMemoryProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_OUTCOMES → AUTONOMOUS_IMPROVEMENT_MEMORY
 *
 * Migration note:
 * Preserves original 810 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementMemoryProcessorName810_() {
  return '810_AutonomousImprovementMemoryProcessor';
}

function sciipGetAutonomousImprovementMemoryHeaders810_() {
  return [
    'Memory_ID',
    'Business_Key',
    'Memory_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Memory_Title',
    'Memory_Type',
    'Memory_Summary',
    'Reusable_Learning',
    'Future_Use_Case',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementMemorySchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_MEMORY',
    sciipGetAutonomousImprovementMemoryHeaders810_()
  );
}

function sciipRunAutonomousImprovementMemoryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
    action: 'AUTONOMOUS_IMPROVEMENT_MEMORY_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_MEMORY',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_MEMORY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementOutcomes = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_OUTCOMES');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementOutcomes.length,
        outputCount: autonomousImprovementOutcomes.length ? 1 : 0,
        summary: 'Autonomous improvement memory runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_OUTCOMES']
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
      const outputSheet = sciipEnsureAutonomousImprovementMemorySchema();
      const memoryDate =
        sciipResolveLatestRuntimeProcessingDate810_('AUTONOMOUS_IMPROVEMENT_OUTCOMES', 'Outcome_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementMemoryBusinessKey = 'AUTONOMOUS_IMPROVEMENT_MEMORY|' + memoryDate;

      if (sciipRuntimeBusinessKeyPrefixExists810_(definition.targetSheet, autonomousImprovementMemoryBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementOutcomesReviewed: 0,
            autonomousImprovementMemoryCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementMemoryBusinessKey: autonomousImprovementMemoryBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementOutcomes = sciipGetRuntimeRecordsByDate810_(
        'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
        'Outcome_Date',
        memoryDate
      );

      if (!autonomousImprovementOutcomes.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementOutcomesReviewed: 0,
            autonomousImprovementMemoryCreated: 0,
            skippedNoInputs: 1,
            memoryDate: memoryDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const memory = sciipCreateAutonomousImprovementMemory810_({
        businessKey: autonomousImprovementMemoryBusinessKey,
        memoryDate: memoryDate,
        sourceRows: autonomousImprovementOutcomes,
        processor: sciipGetAutonomousImprovementMemoryProcessorName810_()
      });

      outputSheet.appendRow(memory);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementOutcomes.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementOutcomesReviewed: autonomousImprovementOutcomes.length,
          autonomousImprovementMemoryCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementMemoryBusinessKey: autonomousImprovementMemoryBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists810_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate810_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue810_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate810_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue810_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue810_(value) {
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

function sciipCreateAutonomousImprovementMemory810_(args) {
  return [
    sciipGenerateId810_('AUTONOMOUS_IMPROVEMENT_MEMORY'),
    args.businessKey,
    args.memoryDate,
    'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    args.sourceRows.length,
    'Autonomous Improvement Memory — ' + args.memoryDate,
    'AUTONOMOUS_OPERATING_LOOP_LEARNING',
    sciipCreateAutonomousImprovementMemorySummary810_(args.sourceRows),
    sciipCreateAutonomousImprovementReusableLearning810_(args.sourceRows),
    sciipCreateAutonomousImprovementFutureUseCase810_(args.sourceRows),
    sciipResolveAutonomousImprovementMemoryConfidence810_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementMemorySummary810_(sourceRows) {
  return [
    'SCIIP_OS converted ' + sourceRows.length + ' autonomous improvement outcome record(s) into durable system memory.',
    'The system preserved the full loop from operations, learning, improvement planning, task creation, execution tracking, outcome capture, and memory consolidation.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementReusableLearning810_(sourceRows) {
  return [
    'Downstream processors should consume the latest completed processing date from upstream sheets instead of assuming the current execution date.',
    'Idempotent business keys must preserve one durable record per processing batch.',
    'Autonomous improvement loops should terminate in reusable memory so future processors can avoid repeating known failures.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementFutureUseCase810_(sourceRows) {
  return [
    'Use this memory when designing future autonomous processors.',
    'Use this memory when diagnosing SKIPPED_NO_INPUTS caused by date mismatch.',
    'Use this memory when routing completed operating-loop outcomes into calibration, prioritization, or strategic reasoning layers.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementMemoryConfidence810_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasCapturedOutcome = sourceRows.some(function(row) {
    return String(row.Outcome_Status || '').trim().toUpperCase() === 'CAPTURED';
  });

  return hasCapturedOutcome ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId810_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementMemoryProcessor() {
  const result = sciipRunAutonomousImprovementMemoryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementMemoryProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 820_AutonomousCalibrationSignalProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_MEMORY → AUTONOMOUS_CALIBRATION_SIGNALS
 *
 * Migration note:
 * Preserves original 820 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousCalibrationSignalProcessorName820_() {
  return '820_AutonomousCalibrationSignalProcessor';
}

function sciipGetAutonomousCalibrationSignalHeaders820_() {
  return [
    'Calibration_Signal_ID',
    'Business_Key',
    'Signal_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Signal_Title',
    'Signal_Type',
    'Calibration_Finding',
    'Calibration_Recommendation',
    'Affected_System_Area',
    'Priority',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousCalibrationSignalSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_CALIBRATION_SIGNALS',
    sciipGetAutonomousCalibrationSignalHeaders820_()
  );
}

function sciipRunAutonomousCalibrationSignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
    action: 'AUTONOMOUS_CALIBRATION_SIGNAL_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_MEMORY',
    targetSheet: 'AUTONOMOUS_CALIBRATION_SIGNALS',
    ledgerSheet: 'AUTONOMOUS_CALIBRATION_SIGNALS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementMemory = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_MEMORY');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementMemory.length,
        outputCount: autonomousImprovementMemory.length ? 1 : 0,
        summary: 'Autonomous calibration signal runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_MEMORY']
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
      const outputSheet = sciipEnsureAutonomousCalibrationSignalSchema();
      const signalDate =
        sciipResolveLatestRuntimeProcessingDate820_('AUTONOMOUS_IMPROVEMENT_MEMORY', 'Memory_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousCalibrationSignalBusinessKey = 'AUTONOMOUS_CALIBRATION_SIGNAL|' + signalDate;

      if (sciipRuntimeBusinessKeyPrefixExists820_(definition.targetSheet, autonomousCalibrationSignalBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementMemoryReviewed: 0,
            autonomousCalibrationSignalsCreated: 0,
            skippedDuplicate: 1,
            autonomousCalibrationSignalBusinessKey: autonomousCalibrationSignalBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementMemory = sciipGetRuntimeRecordsByDate820_(
        'AUTONOMOUS_IMPROVEMENT_MEMORY',
        'Memory_Date',
        signalDate
      );

      if (!autonomousImprovementMemory.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementMemoryReviewed: 0,
            autonomousCalibrationSignalsCreated: 0,
            skippedNoInputs: 1,
            signalDate: signalDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const signal = sciipCreateAutonomousCalibrationSignal820_({
        businessKey: autonomousCalibrationSignalBusinessKey,
        signalDate: signalDate,
        sourceRows: autonomousImprovementMemory,
        processor: sciipGetAutonomousCalibrationSignalProcessorName820_()
      });

      outputSheet.appendRow(signal);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementMemory.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementMemoryReviewed: autonomousImprovementMemory.length,
          autonomousCalibrationSignalsCreated: 1,
          skippedDuplicate: 0,
          autonomousCalibrationSignalBusinessKey: autonomousCalibrationSignalBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists820_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate820_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue820_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate820_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue820_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue820_(value) {
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

function sciipCreateAutonomousCalibrationSignal820_(args) {
  return [
    sciipGenerateId820_('AUTONOMOUS_CALIBRATION_SIGNAL'),
    args.businessKey,
    args.signalDate,
    'AUTONOMOUS_IMPROVEMENT_MEMORY',
    args.sourceRows.length,
    'Autonomous Calibration Signal — ' + args.signalDate,
    'PROCESSING_DATE_STANDARD',
    sciipCreateAutonomousCalibrationFinding820_(args.sourceRows),
    sciipCreateAutonomousCalibrationRecommendation820_(args.sourceRows),
    'DOWNSTREAM_PROCESSOR_DATE_RESOLUTION',
    'HIGH',
    sciipResolveAutonomousCalibrationSignalConfidence820_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousCalibrationFinding820_(sourceRows) {
  return [
    'SCIIP_OS reviewed ' + sourceRows.length + ' autonomous improvement memory record(s).',
    'The durable memory confirms that downstream processors must resolve the latest completed upstream processing date instead of assuming the current execution date.',
    'This prevents false SKIPPED_NO_INPUTS results when processors run after midnight or on a later calendar date.'
  ].join(' ');
}

function sciipCreateAutonomousCalibrationRecommendation820_(sourceRows) {
  return [
    'Adopt sciipResolveLatestProcessingDate_(sheetName, dateColumnName) as the standard date resolver for downstream processors.',
    'Use the resolved upstream date in business keys, source-row filters, and test expectations.',
    'Continue using sciipBusinessKeyPrefixExists_() for multi-row or batch-oriented processors.'
  ].join(' ');
}

function sciipResolveAutonomousCalibrationSignalConfidence820_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasHighMemory = sourceRows.some(function(row) {
    return String(row.Confidence || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighMemory ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId820_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousCalibrationSignalProcessor() {
  const result = sciipRunAutonomousCalibrationSignalProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousCalibrationSignalProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 830_AutonomousCalibrationDecisionProcessor
 *
 * AUTONOMOUS_CALIBRATION_SIGNALS → AUTONOMOUS_CALIBRATION_DECISIONS
 *
 * Migration note:
 * Preserves original 830 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousCalibrationDecisionProcessorName830_() {
  return '830_AutonomousCalibrationDecisionProcessor';
}

function sciipGetAutonomousCalibrationDecisionHeaders830_() {
  return [
    'Calibration_Decision_ID',
    'Business_Key',
    'Decision_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Decision_Title',
    'Decision_Type',
    'Decision',
    'Decision_Rationale',
    'Implementation_Standard',
    'Priority',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousCalibrationDecisionSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_CALIBRATION_DECISIONS',
    sciipGetAutonomousCalibrationDecisionHeaders830_()
  );
}

function sciipRunAutonomousCalibrationDecisionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousCalibrationDecisionProcessorName830_(),
    action: 'AUTONOMOUS_CALIBRATION_DECISION_BUILD',
    sourceSheet: 'AUTONOMOUS_CALIBRATION_SIGNALS',
    targetSheet: 'AUTONOMOUS_CALIBRATION_DECISIONS',
    ledgerSheet: 'AUTONOMOUS_CALIBRATION_DECISIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousCalibrationSignals = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_CALIBRATION_SIGNALS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousCalibrationSignals.length,
        outputCount: autonomousCalibrationSignals.length ? 1 : 0,
        summary: 'Autonomous calibration decision runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousCalibrationDecisionProcessorName830_(),
          inputSheets: ['AUTONOMOUS_CALIBRATION_SIGNALS']
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
      const outputSheet = sciipEnsureAutonomousCalibrationDecisionSchema();
      const decisionDate =
        sciipResolveLatestRuntimeProcessingDate830_('AUTONOMOUS_CALIBRATION_SIGNALS', 'Signal_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousCalibrationDecisionBusinessKey = 'AUTONOMOUS_CALIBRATION_DECISION|' + decisionDate;

      if (sciipRuntimeBusinessKeyPrefixExists830_(definition.targetSheet, autonomousCalibrationDecisionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousCalibrationDecisionProcessorName830_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousCalibrationSignalsReviewed: 0,
            autonomousCalibrationDecisionsCreated: 0,
            skippedDuplicate: 1,
            autonomousCalibrationDecisionBusinessKey: autonomousCalibrationDecisionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousCalibrationSignals = sciipGetRuntimeRecordsByDate830_(
        'AUTONOMOUS_CALIBRATION_SIGNALS',
        'Signal_Date',
        decisionDate
      );

      if (!autonomousCalibrationSignals.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousCalibrationDecisionProcessorName830_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousCalibrationSignalsReviewed: 0,
            autonomousCalibrationDecisionsCreated: 0,
            skippedNoInputs: 1,
            decisionDate: decisionDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const decision = sciipCreateAutonomousCalibrationDecision830_({
        businessKey: autonomousCalibrationDecisionBusinessKey,
        decisionDate: decisionDate,
        sourceRows: autonomousCalibrationSignals,
        processor: sciipGetAutonomousCalibrationDecisionProcessorName830_()
      });

      outputSheet.appendRow(decision);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousCalibrationDecisionProcessorName830_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousCalibrationSignals.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousCalibrationSignalsReviewed: autonomousCalibrationSignals.length,
          autonomousCalibrationDecisionsCreated: 1,
          skippedDuplicate: 0,
          autonomousCalibrationDecisionBusinessKey: autonomousCalibrationDecisionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists830_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate830_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue830_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate830_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue830_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue830_(value) {
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

function sciipCreateAutonomousCalibrationDecision830_(args) {
  return [
    sciipGenerateId830_('AUTONOMOUS_CALIBRATION_DECISION'),
    args.businessKey,
    args.decisionDate,
    'AUTONOMOUS_CALIBRATION_SIGNALS',
    args.sourceRows.length,
    'Autonomous Calibration Decision — ' + args.decisionDate,
    'PROCESSOR_STANDARDIZATION',
    sciipCreateAutonomousCalibrationDecisionText830_(args.sourceRows),
    sciipCreateAutonomousCalibrationDecisionRationale830_(args.sourceRows),
    sciipCreateAutonomousCalibrationImplementationStandard830_(args.sourceRows),
    sciipResolveAutonomousCalibrationDecisionPriority830_(args.sourceRows),
    'APPROVED',
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousCalibrationDecisionText830_(sourceRows) {
  return [
    'SCIIP_OS approves ' + sourceRows.length + ' autonomous calibration signal record(s) for implementation.',
    'The downstream processor date-resolution standard is now treated as an operating-system calibration decision.'
  ].join(' ');
}

function sciipCreateAutonomousCalibrationDecisionRationale830_(sourceRows) {
  return [
    'The validated 750 fix demonstrated that downstream processors can falsely skip valid upstream batches when they use the current execution date instead of the latest completed upstream processing date.',
    'The calibration signal confirms that latest-date resolution improves processor continuity, idempotency, and batch reliability.'
  ].join(' ');
}

function sciipCreateAutonomousCalibrationImplementationStandard830_(sourceRows) {
  return [
    'Downstream processors must resolve their processing date from the latest available upstream date column whenever consuming prior processor output.',
    'Required pattern: sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN) || sciipFormatDateKey_(startedAt).',
    'The resolved date must be used consistently in business keys and source-row filters.',
    'Batch-oriented duplicate checks must use sciipBusinessKeyPrefixExists_().'
  ].join('\n');
}

function sciipResolveAutonomousCalibrationDecisionPriority830_(sourceRows) {
  const hasHighPrioritySignal = sourceRows.some(function(row) {
    return String(row.Priority || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighPrioritySignal ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId830_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousCalibrationDecisionProcessor() {
  const result = sciipRunAutonomousCalibrationDecisionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousCalibrationDecisionProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 840_AutonomousStandardizationProcessor
 *
 * AUTONOMOUS_CALIBRATION_DECISIONS → AUTONOMOUS_STANDARDIZATIONS
 *
 * Migration note:
 * Preserves original 840 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousStandardizationProcessorName840_() {
  return '840_AutonomousStandardizationProcessor';
}

function sciipGetAutonomousStandardizationHeaders840_() {
  return ['Standardization_ID',
    'Business_Key',
    'Standard_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Standard_Title',
    'Standard_Type',
    'Standard_Name',
    'Standard_Description',
    'Required_Pattern',
    'Applies_To',
    'Status',
    'Created_At',
    'Processor'];
}

function sciipEnsureAutonomousStandardizationSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_STANDARDIZATIONS',
    sciipGetAutonomousStandardizationHeaders840_()
  );
}

function sciipRunAutonomousStandardizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousStandardizationProcessorName840_(),
    action: 'AUTONOMOUS_STANDARDIZATION_BUILD',
    sourceSheet: 'AUTONOMOUS_CALIBRATION_DECISIONS',
    targetSheet: 'AUTONOMOUS_STANDARDIZATIONS',
    ledgerSheet: 'AUTONOMOUS_STANDARDIZATIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousCalibrationDecisions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_CALIBRATION_DECISIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousCalibrationDecisions.length,
        outputCount: autonomousCalibrationDecisions.length ? 1 : 0,
        summary: 'Autonomous standardization runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousStandardizationProcessorName840_(),
          inputSheets: ['AUTONOMOUS_CALIBRATION_DECISIONS']
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
      const outputSheet = sciipEnsureAutonomousStandardizationSchema();
      const standardDate =
        sciipResolveLatestRuntimeProcessingDate840_('AUTONOMOUS_CALIBRATION_DECISIONS', 'Decision_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousStandardizationBusinessKey = 'AUTONOMOUS_STANDARDIZATION|' + standardDate;

      if (sciipRuntimeBusinessKeyPrefixExists840_(definition.targetSheet, autonomousStandardizationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousStandardizationProcessorName840_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousCalibrationDecisionsReviewed: 0,
            autonomousStandardizationsCreated: 0,
            skippedDuplicate: 1,
            autonomousStandardizationBusinessKey: autonomousStandardizationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousCalibrationDecisions = sciipGetRuntimeRecordsByDate840_(
        'AUTONOMOUS_CALIBRATION_DECISIONS',
        'Decision_Date',
        standardDate
      );

      if (!autonomousCalibrationDecisions.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousStandardizationProcessorName840_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousCalibrationDecisionsReviewed: 0,
            autonomousStandardizationsCreated: 0,
            skippedNoInputs: 1,
            standardDate: standardDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outputRecord = sciipBuildAutonomousStandardization840_({
        standardDate: standardDate,
        businessKey: autonomousStandardizationBusinessKey,
        sourceRows: autonomousCalibrationDecisions,
        startedAt: new Date()
      });

      outputSheet.appendRow(sciipGetAutonomousStandardizationHeaders840_().map(function(header) {
        return outputRecord[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousStandardizationProcessorName840_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousCalibrationDecisions.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousCalibrationDecisionsReviewed: autonomousCalibrationDecisions.length,
          autonomousStandardizationsCreated: 1,
          skippedDuplicate: 0,
          autonomousStandardizationBusinessKey: autonomousStandardizationBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists840_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate840_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue840_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate840_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue840_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue840_(value) {
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

function sciipBuildAutonomousStandardization840_(payload) {
  const standardizationId = `AUTONOMOUS_STANDARDIZATION_${Utilities.getUuid()}`;

  return {
    Standardization_ID: standardizationId,
    Business_Key: payload.businessKey,
    Standard_Date: payload.standardDate,
    Source_Sheet: 'AUTONOMOUS_CALIBRATION_DECISIONS',
    Source_Record_Count: payload.sourceRows.length,
    Standard_Title: `Autonomous Standardization — ${payload.standardDate}`,
    Standard_Type: 'PROCESSOR_ARCHITECTURE_STANDARD',
    Standard_Name: 'Latest Completed Processing Date Standard',
    Standard_Description: sciipCreateAutonomousStandardDescription840_(payload.sourceRows),
    Required_Pattern: sciipCreateAutonomousStandardRequiredPattern840_(payload.sourceRows),
    Applies_To: 'All downstream processors that consume prior processor output sheets',
    Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: sciipGetAutonomousStandardizationProcessorName840_()
  };
}

function sciipCreateAutonomousStandardDescription840_(sourceRows) {
  return [
    `SCIIP_OS converted ${sourceRows.length} approved calibration decision record(s) into an active processor standard.`,
    'The standard requires downstream processors to consume the latest completed upstream processing batch instead of assuming the current calendar date.',
    'This prevents valid upstream records from being skipped when downstream processors run on a later day.'
  ].join(' ');
}

function sciipCreateAutonomousStandardRequiredPattern840_(sourceRows) {
  return [
    'const processingDate =',
    '  sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN) || sciipFormatDateKey_(startedAt);',
    '',
    'const businessKey = `PROCESSOR_OUTPUT|${processingDate}`;',
    '',
    'Use processingDate for both:',
    '- Business key generation',
    '- Source-row date filtering',
    '',
    'Use sciipBusinessKeyPrefixExists_() for batch-oriented idempotency checks.'
  ].join('\n');
}

function sciipGenerateId840_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousStandardizationProcessor() {
  const result = sciipRunAutonomousStandardizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousStandardizationProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 850_AutonomousStandardAdoptionProcessor
 *
 * AUTONOMOUS_STANDARDIZATIONS → AUTONOMOUS_STANDARD_ADOPTIONS
 *
 * Migration note:
 * Preserves original 850 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousStandardAdoptionProcessorName850_() {
  return '850_AutonomousStandardAdoptionProcessor';
}

function sciipGetAutonomousStandardAdoptionHeaders850_() {
  return ['Adoption_ID',
    'Business_Key',
    'Adoption_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Adoption_Title',
    'Standard_Name',
    'Adoption_Scope',
    'Adoption_Rationale',
    'Governance_Rule',
    'Compliance_Status',
    'Status',
    'Created_At',
    'Processor'];
}

function sciipEnsureAutonomousStandardAdoptionSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_STANDARD_ADOPTIONS',
    sciipGetAutonomousStandardAdoptionHeaders850_()
  );
}

function sciipRunAutonomousStandardAdoptionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousStandardAdoptionProcessorName850_(),
    action: 'AUTONOMOUS_STANDARD_ADOPTION_BUILD',
    sourceSheet: 'AUTONOMOUS_STANDARDIZATIONS',
    targetSheet: 'AUTONOMOUS_STANDARD_ADOPTIONS',
    ledgerSheet: 'AUTONOMOUS_STANDARD_ADOPTIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousStandardizations = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_STANDARDIZATIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousStandardizations.length,
        outputCount: autonomousStandardizations.length ? 1 : 0,
        summary: 'Autonomous standard adoption runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousStandardAdoptionProcessorName850_(),
          inputSheets: ['AUTONOMOUS_STANDARDIZATIONS']
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
      const outputSheet = sciipEnsureAutonomousStandardAdoptionSchema();
      const adoptionDate =
        sciipResolveLatestRuntimeProcessingDate850_('AUTONOMOUS_STANDARDIZATIONS', 'Standard_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousStandardAdoptionBusinessKey = 'AUTONOMOUS_STANDARD_ADOPTION|' + adoptionDate;

      if (sciipRuntimeBusinessKeyPrefixExists850_(definition.targetSheet, autonomousStandardAdoptionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousStandardAdoptionProcessorName850_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardizationsReviewed: 0,
            autonomousStandardAdoptionsCreated: 0,
            skippedDuplicate: 1,
            autonomousStandardAdoptionBusinessKey: autonomousStandardAdoptionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousStandardizations = sciipGetRuntimeRecordsByDate850_(
        'AUTONOMOUS_STANDARDIZATIONS',
        'Standard_Date',
        adoptionDate
      );

      if (!autonomousStandardizations.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousStandardAdoptionProcessorName850_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardizationsReviewed: 0,
            autonomousStandardAdoptionsCreated: 0,
            skippedNoInputs: 1,
            adoptionDate: adoptionDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outputRecord = sciipBuildAutonomousStandardAdoption850_({
        adoptionDate: adoptionDate,
        businessKey: autonomousStandardAdoptionBusinessKey,
        sourceRows: autonomousStandardizations,
        startedAt: new Date()
      });

      outputSheet.appendRow(sciipGetAutonomousStandardAdoptionHeaders850_().map(function(header) {
        return outputRecord[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousStandardAdoptionProcessorName850_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousStandardizations.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousStandardizationsReviewed: autonomousStandardizations.length,
          autonomousStandardAdoptionsCreated: 1,
          skippedDuplicate: 0,
          autonomousStandardAdoptionBusinessKey: autonomousStandardAdoptionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists850_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate850_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue850_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate850_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue850_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue850_(value) {
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

function sciipBuildAutonomousStandardAdoption850_(payload) {
  const adoptionId = `AUTONOMOUS_STANDARD_ADOPTION_${Utilities.getUuid()}`;

  return {
    Adoption_ID: adoptionId,
    Business_Key: payload.businessKey,
    Adoption_Date: payload.adoptionDate,
    Source_Sheet: 'AUTONOMOUS_STANDARDIZATIONS',
    Source_Record_Count: payload.sourceRows.length,
    Adoption_Title: `Autonomous Standard Adoption — ${payload.adoptionDate}`,
    Standard_Name: sciipResolveAdoptedStandardName850_(payload.sourceRows),
    Adoption_Scope: sciipCreateAutonomousStandardAdoptionScope850_(payload.sourceRows),
    Adoption_Rationale: sciipCreateAutonomousStandardAdoptionRationale850_(payload.sourceRows),
    Governance_Rule: sciipCreateAutonomousStandardGovernanceRule850_(payload.sourceRows),
    Compliance_Status: 'STANDARD_ADOPTED',
    Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: sciipGetAutonomousStandardAdoptionProcessorName850_()
  };
}

function sciipResolveAdoptedStandardName850_(sourceRows) {
  const names = sourceRows
    .map(row => String(row.Standard_Name || '').trim())
    .filter(Boolean);

  return names.length ? names[0] : 'Latest Completed Processing Date Standard';
}

function sciipCreateAutonomousStandardAdoptionScope850_(sourceRows) {
  return [
    'Applies to all downstream SCIIP_OS processors that consume prior processor output sheets.',
    'Applies to business-key generation, source-row filtering, duplicate detection, and test expectations.',
    'Applies especially to processors that may run after the upstream batch date.'
  ].join(' ');
}

function sciipCreateAutonomousStandardAdoptionRationale850_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} active standardization record(s).`,
    'The latest completed processing date standard has been validated through the 750 processor fix and downstream autonomous improvement chain.',
    'Adopting this standard reduces false SKIPPED_NO_INPUTS outcomes and improves deterministic batch continuity.'
  ].join(' ');
}

function sciipCreateAutonomousStandardGovernanceRule850_(sourceRows) {
  return [
    'Before building or revising a downstream processor, identify the upstream input sheet and upstream date column.',
    'Resolve the processing date using sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN).',
    'Use the resolved date consistently in the business key and source-row filter.',
    'Use sciipBusinessKeyPrefixExists_() for batch-oriented duplicate checks.',
    'Do not assume the current execution date unless no upstream processing date exists.'
  ].join('\n');
}

function sciipGenerateId850_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousStandardAdoptionProcessor() {
  const result = sciipRunAutonomousStandardAdoptionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousStandardAdoptionProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 860_AutonomousStandardComplianceProcessor
 *
 * AUTONOMOUS_STANDARD_ADOPTIONS → AUTONOMOUS_STANDARD_COMPLIANCE
 *
 * Migration note:
 * Preserves original 860 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousStandardComplianceProcessorName860_() {
  return '860_AutonomousStandardComplianceProcessor';
}

function sciipGetAutonomousStandardComplianceHeaders860_() {
  return ['Compliance_ID',
    'Business_Key',
    'Compliance_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Compliance_Title',
    'Standard_Name',
    'Compliance_Check',
    'Compliance_Result',
    'Governance_Impact',
    'Required_Action',
    'Status',
    'Created_At',
    'Processor'];
}

function sciipEnsureAutonomousStandardComplianceSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_STANDARD_COMPLIANCE',
    sciipGetAutonomousStandardComplianceHeaders860_()
  );
}

function sciipRunAutonomousStandardComplianceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousStandardComplianceProcessorName860_(),
    action: 'AUTONOMOUS_STANDARD_COMPLIANCE_BUILD',
    sourceSheet: 'AUTONOMOUS_STANDARD_ADOPTIONS',
    targetSheet: 'AUTONOMOUS_STANDARD_COMPLIANCE',
    ledgerSheet: 'AUTONOMOUS_STANDARD_COMPLIANCE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousStandardAdoptions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_STANDARD_ADOPTIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousStandardAdoptions.length,
        outputCount: autonomousStandardAdoptions.length ? 1 : 0,
        summary: 'Autonomous standard compliance runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousStandardComplianceProcessorName860_(),
          inputSheets: ['AUTONOMOUS_STANDARD_ADOPTIONS']
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
      const outputSheet = sciipEnsureAutonomousStandardComplianceSchema();
      const complianceDate =
        sciipResolveLatestRuntimeProcessingDate860_('AUTONOMOUS_STANDARD_ADOPTIONS', 'Adoption_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousStandardComplianceBusinessKey = 'AUTONOMOUS_STANDARD_COMPLIANCE|' + complianceDate;

      if (sciipRuntimeBusinessKeyPrefixExists860_(definition.targetSheet, autonomousStandardComplianceBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousStandardComplianceProcessorName860_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardAdoptionsReviewed: 0,
            autonomousStandardComplianceCreated: 0,
            skippedDuplicate: 1,
            autonomousStandardComplianceBusinessKey: autonomousStandardComplianceBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousStandardAdoptions = sciipGetRuntimeRecordsByDate860_(
        'AUTONOMOUS_STANDARD_ADOPTIONS',
        'Adoption_Date',
        complianceDate
      );

      if (!autonomousStandardAdoptions.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousStandardComplianceProcessorName860_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardAdoptionsReviewed: 0,
            autonomousStandardComplianceCreated: 0,
            skippedNoInputs: 1,
            complianceDate: complianceDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outputRecord = sciipBuildAutonomousStandardCompliance860_({
        complianceDate: complianceDate,
        businessKey: autonomousStandardComplianceBusinessKey,
        sourceRows: autonomousStandardAdoptions,
        startedAt: new Date()
      });

      outputSheet.appendRow(sciipGetAutonomousStandardComplianceHeaders860_().map(function(header) {
        return outputRecord[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousStandardComplianceProcessorName860_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousStandardAdoptions.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousStandardAdoptionsReviewed: autonomousStandardAdoptions.length,
          autonomousStandardComplianceCreated: 1,
          skippedDuplicate: 0,
          autonomousStandardComplianceBusinessKey: autonomousStandardComplianceBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists860_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate860_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue860_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate860_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue860_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue860_(value) {
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

function sciipBuildAutonomousStandardCompliance860_(payload) {
  const complianceId = `AUTONOMOUS_STANDARD_COMPLIANCE_${Utilities.getUuid()}`;

  return {
    Compliance_ID: complianceId,
    Business_Key: payload.businessKey,
    Compliance_Date: payload.complianceDate,
    Source_Sheet: 'AUTONOMOUS_STANDARD_ADOPTIONS',
    Source_Record_Count: payload.sourceRows.length,
    Compliance_Title: `Autonomous Standard Compliance — ${payload.complianceDate}`,
    Standard_Name: sciipResolveComplianceStandardName860_(payload.sourceRows),
    Compliance_Check: sciipCreateAutonomousStandardComplianceCheck860_(payload.sourceRows),
    Compliance_Result: sciipCreateAutonomousStandardComplianceResult860_(payload.sourceRows),
    Governance_Impact: sciipCreateAutonomousStandardComplianceImpact860_(payload.sourceRows),
    Required_Action: sciipCreateAutonomousStandardComplianceRequiredAction860_(payload.sourceRows),
    Status: 'COMPLIANT_STANDARD_ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: sciipGetAutonomousStandardComplianceProcessorName860_()
  };
}

function sciipResolveComplianceStandardName860_(sourceRows) {
  const names = sourceRows
    .map(row => String(row.Standard_Name || '').trim())
    .filter(Boolean);

  return names.length ? names[0] : 'Latest Completed Processing Date Standard';
}

function sciipCreateAutonomousStandardComplianceCheck860_(sourceRows) {
  return [
    `Reviewed ${sourceRows.length} autonomous standard adoption record(s).`,
    'Confirmed that the latest completed processing date standard has an active adoption record.',
    'Confirmed that future downstream processors should be checked against this governance rule.'
  ].join(' ');
}

function sciipCreateAutonomousStandardComplianceResult860_(sourceRows) {
  return [
    'COMPLIANT.',
    'The processor governance standard is active and available for future build validation.',
    'SCIIP_OS has preserved the standard as permanent compliance history.'
  ].join(' ');
}

function sciipCreateAutonomousStandardComplianceImpact860_(sourceRows) {
  return [
    'Improves reliability of downstream processors.',
    'Reduces false SKIPPED_NO_INPUTS outcomes.',
    'Strengthens deterministic batch processing and idempotent operating-system behavior.'
  ].join(' ');
}

function sciipCreateAutonomousStandardComplianceRequiredAction860_(sourceRows) {
  return [
    'Apply this standard to every new downstream processor.',
    'When reviewing existing processors, check whether processing dates are resolved from upstream sheets.',
    'If a processor consumes prior processor output, do not default to the current execution date unless no upstream date exists.'
  ].join('\n');
}

function sciipGenerateId860_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousStandardComplianceProcessor() {
  const result = sciipRunAutonomousStandardComplianceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousStandardComplianceProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 870_AutonomousGovernanceAuditProcessor
 *
 * AUTONOMOUS_STANDARD_COMPLIANCE → AUTONOMOUS_GOVERNANCE_AUDITS
 *
 * Migration note:
 * Preserves original 870 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousGovernanceAuditProcessorName870_() {
  return '870_AutonomousGovernanceAuditProcessor';
}

function sciipGetAutonomousGovernanceAuditHeaders870_() {
  return ['Audit_ID',
    'Business_Key',
    'Audit_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Audit_Title',
    'Audit_Type',
    'Audit_Finding',
    'Audit_Result',
    'Governance_Status',
    'Required_Follow_Up',
    'Created_At',
    'Processor'];
}

function sciipEnsureAutonomousGovernanceAuditSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_GOVERNANCE_AUDITS',
    sciipGetAutonomousGovernanceAuditHeaders870_()
  );
}

function sciipRunAutonomousGovernanceAuditProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousGovernanceAuditProcessorName870_(),
    action: 'AUTONOMOUS_GOVERNANCE_AUDIT_BUILD',
    sourceSheet: 'AUTONOMOUS_STANDARD_COMPLIANCE',
    targetSheet: 'AUTONOMOUS_GOVERNANCE_AUDITS',
    ledgerSheet: 'AUTONOMOUS_GOVERNANCE_AUDITS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousStandardCompliance = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_STANDARD_COMPLIANCE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousStandardCompliance.length,
        outputCount: autonomousStandardCompliance.length ? 1 : 0,
        summary: 'Autonomous governance audit runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousGovernanceAuditProcessorName870_(),
          inputSheets: ['AUTONOMOUS_STANDARD_COMPLIANCE']
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
      const outputSheet = sciipEnsureAutonomousGovernanceAuditSchema();
      const auditDate =
        sciipResolveLatestRuntimeProcessingDate870_('AUTONOMOUS_STANDARD_COMPLIANCE', 'Compliance_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousGovernanceAuditBusinessKey = 'AUTONOMOUS_GOVERNANCE_AUDIT|' + auditDate;

      if (sciipRuntimeBusinessKeyPrefixExists870_(definition.targetSheet, autonomousGovernanceAuditBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousGovernanceAuditProcessorName870_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardComplianceReviewed: 0,
            autonomousGovernanceAuditsCreated: 0,
            skippedDuplicate: 1,
            autonomousGovernanceAuditBusinessKey: autonomousGovernanceAuditBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousStandardCompliance = sciipGetRuntimeRecordsByDate870_(
        'AUTONOMOUS_STANDARD_COMPLIANCE',
        'Compliance_Date',
        auditDate
      );

      if (!autonomousStandardCompliance.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousGovernanceAuditProcessorName870_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardComplianceReviewed: 0,
            autonomousGovernanceAuditsCreated: 0,
            skippedNoInputs: 1,
            auditDate: auditDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outputRecord = sciipBuildAutonomousGovernanceAudit870_({
        auditDate: auditDate,
        businessKey: autonomousGovernanceAuditBusinessKey,
        sourceRows: autonomousStandardCompliance,
        startedAt: new Date()
      });

      outputSheet.appendRow(sciipGetAutonomousGovernanceAuditHeaders870_().map(function(header) {
        return outputRecord[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousGovernanceAuditProcessorName870_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousStandardCompliance.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousStandardComplianceReviewed: autonomousStandardCompliance.length,
          autonomousGovernanceAuditsCreated: 1,
          skippedDuplicate: 0,
          autonomousGovernanceAuditBusinessKey: autonomousGovernanceAuditBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists870_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate870_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue870_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate870_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue870_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue870_(value) {
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

function sciipBuildAutonomousGovernanceAudit870_(payload) {
  const auditId = `AUTONOMOUS_GOVERNANCE_AUDIT_${Utilities.getUuid()}`;

  return {
    Audit_ID: auditId,
    Business_Key: payload.businessKey,
    Audit_Date: payload.auditDate,
    Source_Sheet: 'AUTONOMOUS_STANDARD_COMPLIANCE',
    Source_Record_Count: payload.sourceRows.length,
    Audit_Title: `Autonomous Governance Audit — ${payload.auditDate}`,
    Audit_Type: 'PROCESSOR_STANDARD_COMPLIANCE_AUDIT',
    Audit_Finding: sciipCreateAutonomousGovernanceAuditFinding870_(payload.sourceRows),
    Audit_Result: sciipCreateAutonomousGovernanceAuditResult870_(payload.sourceRows),
    Governance_Status: 'AUDITED_COMPLIANT',
    Required_Follow_Up: sciipCreateAutonomousGovernanceAuditFollowUp870_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: sciipGetAutonomousGovernanceAuditProcessorName870_()
  };
}

function sciipCreateAutonomousGovernanceAuditFinding870_(sourceRows) {
  return [
    `Reviewed ${sourceRows.length} autonomous standard compliance record(s).`,
    'The latest completed processing date standard has been adopted, checked for compliance, and preserved as permanent governance history.',
    'SCIIP_OS can now audit future processors against this standard.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceAuditResult870_(sourceRows) {
  return [
    'AUDIT PASSED.',
    'The active processor governance standard is compliant, traceable, and enforceable.',
    'Future downstream processors should follow the resolved upstream processing date pattern.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceAuditFollowUp870_(sourceRows) {
  return [
    'Use this audit record when reviewing future processor builds.',
    'Confirm each downstream processor identifies its input sheet and date column.',
    'Confirm each downstream processor uses the resolved processing date for business keys and source filtering.',
    'Confirm duplicate protection uses the correct business-key helper for the processor pattern.'
  ].join('\n');
}

function sciipGenerateId870_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceAuditProcessor() {
  const result = sciipRunAutonomousGovernanceAuditProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceAuditProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 880_AutonomousGovernanceEnforcementProcessor
 *
 * AUTONOMOUS_GOVERNANCE_AUDITS → AUTONOMOUS_GOVERNANCE_ENFORCEMENTS
 *
 * Migration note:
 * Preserves original 880 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousGovernanceEnforcementProcessorName880_() {
  return '880_AutonomousGovernanceEnforcementProcessor';
}

function sciipGetAutonomousGovernanceEnforcementHeaders880_() {
  return ['Enforcement_ID',
    'Business_Key',
    'Enforcement_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Enforcement_Title',
    'Enforcement_Type',
    'Enforcement_Rule',
    'Enforcement_Scope',
    'Validation_Checklist',
    'Enforcement_Status',
    'Created_At',
    'Processor'];
}

function sciipEnsureAutonomousGovernanceEnforcementSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS',
    sciipGetAutonomousGovernanceEnforcementHeaders880_()
  );
}

function sciipRunAutonomousGovernanceEnforcementProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousGovernanceEnforcementProcessorName880_(),
    action: 'AUTONOMOUS_GOVERNANCE_ENFORCEMENT_BUILD',
    sourceSheet: 'AUTONOMOUS_GOVERNANCE_AUDITS',
    targetSheet: 'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS',
    ledgerSheet: 'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousGovernanceAudits = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_GOVERNANCE_AUDITS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousGovernanceAudits.length,
        outputCount: autonomousGovernanceAudits.length ? 1 : 0,
        summary: 'Autonomous governance enforcement runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousGovernanceEnforcementProcessorName880_(),
          inputSheets: ['AUTONOMOUS_GOVERNANCE_AUDITS']
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
      const outputSheet = sciipEnsureAutonomousGovernanceEnforcementSchema();
      const enforcementDate =
        sciipResolveLatestRuntimeProcessingDate880_('AUTONOMOUS_GOVERNANCE_AUDITS', 'Audit_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousGovernanceEnforcementBusinessKey = 'AUTONOMOUS_GOVERNANCE_ENFORCEMENT|' + enforcementDate;

      if (sciipRuntimeBusinessKeyPrefixExists880_(definition.targetSheet, autonomousGovernanceEnforcementBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousGovernanceEnforcementProcessorName880_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousGovernanceAuditsReviewed: 0,
            autonomousGovernanceEnforcementsCreated: 0,
            skippedDuplicate: 1,
            autonomousGovernanceEnforcementBusinessKey: autonomousGovernanceEnforcementBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousGovernanceAudits = sciipGetRuntimeRecordsByDate880_(
        'AUTONOMOUS_GOVERNANCE_AUDITS',
        'Audit_Date',
        enforcementDate
      );

      if (!autonomousGovernanceAudits.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousGovernanceEnforcementProcessorName880_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousGovernanceAuditsReviewed: 0,
            autonomousGovernanceEnforcementsCreated: 0,
            skippedNoInputs: 1,
            enforcementDate: enforcementDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outputRecord = sciipBuildAutonomousGovernanceEnforcement880_({
        enforcementDate: enforcementDate,
        businessKey: autonomousGovernanceEnforcementBusinessKey,
        sourceRows: autonomousGovernanceAudits,
        startedAt: new Date()
      });

      outputSheet.appendRow(sciipGetAutonomousGovernanceEnforcementHeaders880_().map(function(header) {
        return outputRecord[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousGovernanceEnforcementProcessorName880_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousGovernanceAudits.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousGovernanceAuditsReviewed: autonomousGovernanceAudits.length,
          autonomousGovernanceEnforcementsCreated: 1,
          skippedDuplicate: 0,
          autonomousGovernanceEnforcementBusinessKey: autonomousGovernanceEnforcementBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists880_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate880_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue880_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate880_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue880_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue880_(value) {
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

function sciipBuildAutonomousGovernanceEnforcement880_(payload) {
  const enforcementId = `AUTONOMOUS_GOVERNANCE_ENFORCEMENT_${Utilities.getUuid()}`;

  return {
    Enforcement_ID: enforcementId,
    Business_Key: payload.businessKey,
    Enforcement_Date: payload.enforcementDate,
    Source_Sheet: 'AUTONOMOUS_GOVERNANCE_AUDITS',
    Source_Record_Count: payload.sourceRows.length,
    Enforcement_Title: `Autonomous Governance Enforcement — ${payload.enforcementDate}`,
    Enforcement_Type: 'PROCESSOR_BUILD_STANDARD_ENFORCEMENT',
    Enforcement_Rule: sciipCreateAutonomousGovernanceEnforcementRule880_(payload.sourceRows),
    Enforcement_Scope: sciipCreateAutonomousGovernanceEnforcementScope880_(payload.sourceRows),
    Validation_Checklist: sciipCreateAutonomousGovernanceValidationChecklist880_(payload.sourceRows),
    Enforcement_Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: sciipGetAutonomousGovernanceEnforcementProcessorName880_()
  };
}

function sciipCreateAutonomousGovernanceEnforcementRule880_(sourceRows) {
  return [
    'Every downstream SCIIP_OS processor that consumes prior processor output must resolve its processing date from the latest completed upstream batch.',
    'The resolved date must be used for both business-key generation and source-row filtering.',
    'Processors may only fall back to the current execution date when no upstream date exists.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceEnforcementScope880_(sourceRows) {
  return [
    'Applies to all future autonomous processors.',
    'Applies to existing downstream processors during refactor or bug fix review.',
    'Applies to all batch-oriented processors that depend on upstream output sheets.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceValidationChecklist880_(sourceRows) {
  return [
    '1. Identify the processor input sheet.',
    '2. Identify the upstream processing date column.',
    '3. Resolve date using sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN).',
    '4. Use the resolved date in the business key.',
    '5. Use the resolved date in source-row filtering.',
    '6. Use sciipBusinessKeyPrefixExists_() for batch-oriented duplicate protection.',
    '7. Log resolved date and business key during test execution.',
    '8. Validate first run creates one record.',
    '9. Validate second run skips duplicate with skippedDuplicate: 1.'
  ].join('\n');
}

function sciipGenerateId880_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceEnforcementProcessor() {
  const result = sciipRunAutonomousGovernanceEnforcementProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceEnforcementProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 890_AutonomousGovernanceMonitoringProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousGovernanceMonitoringProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '890_AutonomousGovernanceMonitoringProcessor',
    action: 'AUTONOMOUS_GOVERNANCE_MONITORING_BUILD',
    sourceSheet: 'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS',
    targetSheet: 'AUTONOMOUS_GOVERNANCE_MONITORING',
    ledgerSheet: 'AUTONOMOUS_GOVERNANCE_MONITORING_RUNTIME_LEDGER',

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
          originalProcessor: '890_AutonomousGovernanceMonitoringProcessor',
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
      var legacyResult = sciipRunAutonomousGovernanceMonitoringProcessorLegacy890_();
      return sciipWrapLegacyRuntimeResult890_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult890_(legacyResult, context, transaction) {
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
 * 890_AutonomousGovernanceMonitoringProcessor
 *******************************************************/

const AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME = '890_AutonomousGovernanceMonitoringProcessor';

const AUTONOMOUS_GOVERNANCE_MONITORING_INPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS';
const AUTONOMOUS_GOVERNANCE_MONITORING_OUTPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_MONITORING';

const AUTONOMOUS_GOVERNANCE_MONITORING_SCHEMA = [
  'Monitoring_ID',
  'Business_Key',
  'Monitoring_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Monitoring_Title',
  'Monitoring_Type',
  'Monitored_Standard',
  'Monitoring_Finding',
  'Monitoring_Status',
  'Next_Review_Action',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousGovernanceMonitoringProcessorLegacy890_() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousGovernanceMonitoringSheet_();

  const monitoringDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_GOVERNANCE_MONITORING_INPUT_SHEET,
      'Enforcement_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_GOVERNANCE_MONITORING|${monitoringDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME,
    resolvedMonitoringDate: monitoringDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousGovernanceMonitoringCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousGovernanceEnforcementsForMonitoringDate_(monitoringDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousGovernanceMonitoringCreated: 0,
      monitoringDate,
      completedAt: new Date().toISOString()
    };
  }

  const monitoring = sciipBuildAutonomousGovernanceMonitoring_({
    monitoringDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousGovernanceMonitoring_(monitoring);

  return {
    processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousGovernanceMonitoringCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousGovernanceMonitoring_(payload) {
  const monitoringId = `AUTONOMOUS_GOVERNANCE_MONITORING_${Utilities.getUuid()}`;

  return {
    Monitoring_ID: monitoringId,
    Business_Key: payload.businessKey,
    Monitoring_Date: payload.monitoringDate,
    Source_Sheet: AUTONOMOUS_GOVERNANCE_MONITORING_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Monitoring_Title: `Autonomous Governance Monitoring — ${payload.monitoringDate}`,
    Monitoring_Type: 'PROCESSOR_STANDARD_MONITORING',
    Monitored_Standard: 'Latest Completed Processing Date Standard',
    Monitoring_Finding: sciipCreateAutonomousGovernanceMonitoringFinding_(payload.sourceRows),
    Monitoring_Status: 'ACTIVE_MONITORING',
    Next_Review_Action: sciipCreateAutonomousGovernanceMonitoringNextAction_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousGovernanceMonitoringSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_MONITORING_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_GOVERNANCE_MONITORING_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_MONITORING_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_MONITORING_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousGovernanceEnforcementsForMonitoringDate_(monitoringDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_MONITORING_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Enforcement_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME,
      error: 'ENFORCEMENT_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === monitoringDate;
    })
    .map(row => sciipAutonomousGovernanceMonitoringRowToObject_(headers, row));
}

function sciipCreateAutonomousGovernanceMonitoringFinding_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} active governance enforcement record(s).`,
    'The latest completed processing date standard is active and should be monitored during all future downstream processor builds.',
    'Future monitoring should look for processors that incorrectly default to the current execution date when upstream batch dates exist.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceMonitoringNextAction_(sourceRows) {
  return [
    'During each future processor build, verify the input sheet and upstream date column.',
    'Confirm the processor uses sciipResolveLatestProcessingDate_() before falling back to the current date.',
    'Confirm the resolved date is used in both business key creation and input-row filtering.',
    'Confirm duplicate protection returns skippedDuplicate: 1 on the second test run.'
  ].join('\n');
}

function sciipAppendAutonomousGovernanceMonitoring_(monitoring) {
  const sheet = sciipEnsureAutonomousGovernanceMonitoringSheet_();

  const row = AUTONOMOUS_GOVERNANCE_MONITORING_SCHEMA.map(header => monitoring[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousGovernanceMonitoringRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceMonitoringProcessor() {
  const result = sciipRunAutonomousGovernanceMonitoringProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceMonitoringProcessor',
    result
  }));

  return result;
}

/* ==========================================================
   SCIIP_OS
   Module: Queue
   File: WorkQueue.gs

   Purpose:
   SCIIP Work Queue

   Queues work generated by observations,
   commands, events, and processors.

   Supports autonomous processing and
   future AI-driven workflows.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_WORK_QUEUE_SHEET =
  'WORK_QUEUE';

/**
 * Returns work queue sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function sciipGetWorkQueueSheet() {
  return sciipGetOrCreateSheet(
    SCIIP_WORK_QUEUE_SHEET
  );
}

/**
 * Initializes queue sheet.
 */
function sciipInitializeWorkQueue() {
  const sheet =
    sciipGetWorkQueueSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Queue_ID',
    'Task_Type',
    'Asset_ID',
    'Status',
    'Priority',
    'Payload',
    'Created_At',
    'Started_At',
    'Completed_At'
  ]);
}

/**
 * Enqueues a task.
 *
 * @param {Object} task
 * @returns {Object}
 */
function sciipQueueEnqueue(task) {
  sciipInitializeWorkQueue();

  const queueId =
    'QUEUE_' +
    sciipUuid()
      .replace(/-/g, '')
      .substring(0, 16)
      .toUpperCase();

  sciipAppendRow(
    SCIIP_WORK_QUEUE_SHEET,
    [
      queueId,
      task.taskType || 'UNKNOWN',
      task.assetId || '',
      'PENDING',
      task.priority || 100,
      sciipSafeJson(task.payload || {}),
      sciipNowIso(),
      '',
      ''
    ]
  );

  return {
    queueId: queueId,
    status: 'PENDING'
  };
}

/**
 * Returns pending tasks.
 *
 * @returns {Array}
 */
function sciipQueuePending() {
  const rows =
    sciipGetSheetValues(
      SCIIP_WORK_QUEUE_SHEET
    );

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  const statusIndex =
    headers.indexOf('Status');

  return rows
    .slice(1)
    .filter(function(row) {
      return row[statusIndex] === 'PENDING';
    })
    .map(function(row) {

      const obj = {};

      headers.forEach(function(header, index) {
        obj[header] = row[index];
      });

      return obj;
    });
}

/**
 * Returns queue statistics.
 *
 * @returns {Object}
 */
function sciipQueueStats() {
  const rows =
    sciipGetSheetValues(
      SCIIP_WORK_QUEUE_SHEET
    );

  const pending =
    sciipQueuePending().length;

  return {
    queueRecords:
      rows.length > 0
        ? rows.length - 1
        : 0,

    pendingTasks:
      pending,

    generatedAt:
      sciipNowIso()
  };
}

/************************************************************
 * SCIIP_OS v5.1
 * 2120 Processor Registry Index
 ************************************************************/

function sciipRun2120_ProcessorRegistryIndex() {
  const processor = '2120_ProcessorRegistryIndex';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'registryKey',
      'processorNumber',
      'processorFunction',
      'testFunction',
      'inputSheet',
      'outputSheet',
      'status',
      'track',
      'version',
      'registryPayloadJson',
      'createdAt'
    ]
  );

  const indexSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'indexScope',
      'indexName',
      'indexStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'indexPayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_INDEX|' + dateKey;

  if (sciipSheetBusinessKeyExists_(indexSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryIndexesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows = sciipGetSheetRecords_(sourceSheet);

  if (!ledgerRows || ledgerRows.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTRY_LEDGER',
      processorRegistryIndexesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestBusinessKey = ledgerRows[ledgerRows.length - 1].businessKey || '';
  const registeredProcessorCount = ledgerRows.length;
  const validatedProcessorCount = ledgerRows.filter(function(row) {
    return String(row.status || '').toUpperCase() === 'VALIDATED';
  }).length;

  const trackMap = {};
  ledgerRows.forEach(function(row) {
    const track = row.track || 'UNKNOWN';
    trackMap[track] = true;
  });

  const trackCount = Object.keys(trackMap).length;
  const now = new Date();

  const payload = {
    indexType: 'SCIIP_PROCESSOR_REGISTRY_INDEX',
    registeredProcessorCount,
    validatedProcessorCount,
    trackCount,
    latestRegistryLedgerBusinessKey: latestBusinessKey,
    indexedAt: now.toISOString()
  };

  indexSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Index',
    'INDEXED',
    registeredProcessorCount,
    validatedProcessorCount,
    trackCount,
    latestBusinessKey,
    JSON.stringify(payload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2120_ProcessorRegistryIndex() {
  const result = sciipRun2120_ProcessorRegistryIndex();

  Logger.log(JSON.stringify({
    test: 'sciipTest2120_ProcessorRegistryIndex',
    result
  }));

  return result;
}

/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: AddressNormalize.gs
========================================================== */

function sciipAddressNormalize(address) {
  let value = sciipUpper(address);

  value = value
    .replace(/[.,]/g, '')
    .replace(/\bSTREET\b/g, 'ST')
    .replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bBOULEVARD\b/g, 'BLVD')
    .replace(/\bROAD\b/g, 'RD')
    .replace(/\bDRIVE\b/g, 'DR')
    .replace(/\bLANE\b/g, 'LN')
    .replace(/\bCOURT\b/g, 'CT')
    .replace(/\bPLACE\b/g, 'PL')
    .replace(/\bPARKWAY\b/g, 'PKWY')
    .replace(/\bHIGHWAY\b/g, 'HWY')
    .replace(/\bNORTH\b/g, 'N')
    .replace(/\bSOUTH\b/g, 'S')
    .replace(/\bEAST\b/g, 'E')
    .replace(/\bWEST\b/g, 'W');

  return sciipNormalizeWhitespace(value);
}

function sciipCityNormalize(city) {
  return sciipNormalizeWhitespace(sciipUpper(city));
}

function sciipZipNormalize(zip) {
  const value = sciipString(zip).replace(/\D/g, '');
  return value.length >= 5 ? value.substring(0, 5) : value;
}

function sciipAddressKey(address, city, zip) {
  return [
    sciipAddressNormalize(address),
    sciipCityNormalize(city),
    sciipZipNormalize(zip)
  ].filter(Boolean).join('|');
}

/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Logging.gs
========================================================== */

function sciipLog(level, message, payload) {
  const entry = {
    timestamp: sciipNowIso(),
    level: sciipNormalizeToken(level || 'INFO'),
    message: sciipString(message),
    payload: payload || null
  };

  console.log(JSON.stringify(entry));
  return entry;
}

function sciipInfo(message, payload) {
  return sciipLog('INFO', message, payload);
}

function sciipWarn(message, payload) {
  return sciipLog('WARN', message, payload);
}

function sciipError(message, payload) {
  return sciipLog('ERROR', message, payload);
}

/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Namespaces.gs

   Purpose:
   Defines namespace standards and platform-wide naming helpers.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Returns the canonical SCIIP namespace prefix.
 *
 * @returns {string}
 */
function sciipNamespacePrefix() {
  return 'sciip';
}

/**
 * Returns true when a function name follows SCIIP public namespace rules.
 *
 * @param {string} functionName
 * @returns {boolean}
 */
function sciipIsNamespacedFunction(functionName) {
  return typeof functionName === 'string' && /^sciip[A-Z]/.test(functionName);
}

/**
 * Builds a SCIIP-safe runtime name.
 *
 * @param {string} moduleName
 * @param {string} actionName
 * @returns {string}
 */
function sciipBuildRuntimeName(moduleName, actionName) {
  return [
    sciipNormalizeRuntimeToken(moduleName),
    sciipNormalizeRuntimeToken(actionName)
  ].filter(Boolean).join('.');
}

/**
 * Normalizes a token for runtime labels, logs, and diagnostics.
 *
 * @param {string} value
 * @returns {string}
 */
function sciipNormalizeRuntimeToken(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_]/g, '')
    .toUpperCase();
}

/**
 * Returns a standard SCIIP timestamp.
 *
 * @returns {string}
 */
function sciipNowIso() {
  return new Date().toISOString();
}

/************************************************************
 * SCIIP_OS v5.1
 * 2220 Autonomous Pipeline Orchestrator
 ************************************************************/

function sciipRun2220_AutonomousPipelineOrchestrator() {
  const processor = '2220_AutonomousPipelineOrchestrator';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_DEPENDENCY_RESOLUTION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'resolutionScope',
      'resolutionName',
      'resolutionStatus',
      'resolutionResult',
      'plannedProcessorCount',
      'resolvedProcessorCount',
      'unresolvedProcessorCount',
      'executionStageCount',
      'readyProcessorCount',
      'blockedProcessorCount',
      'resolutionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const orchestrationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_AUTONOMOUS_PIPELINE_ORCHESTRATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'orchestrationScope',
      'orchestrationName',
      'orchestrationStatus',
      'orchestrationResult',
      'plannedProcessorCount',
      'readyProcessorCount',
      'blockedProcessorCount',
      'executionStageCount',
      'nextStageNumber',
      'nextProcessorRegistryKeys',
      'orchestrationDecision',
      'orchestrationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_AUTONOMOUS_PIPELINE_ORCHESTRATION|' + dateKey;

  if (sciipSheetBusinessKeyExists_(orchestrationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousPipelineOrchestrationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_DEPENDENCY_RESOLUTION',
      autonomousPipelineOrchestrationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let resolutionPayload = {};
  try {
    resolutionPayload = JSON.parse(sourceRecord.resolutionPayloadJson || '{}');
  } catch (err) {
    resolutionPayload = {};
  }

  const stages = resolutionPayload.stages || [];
  const unresolvedProcessorRegistryKeys =
    resolutionPayload.unresolvedProcessorRegistryKeys || [];

  const plannedProcessorCount =
    Number(sourceRecord.plannedProcessorCount || 0);

  const readyProcessorCount =
    Number(sourceRecord.readyProcessorCount || 0);

  const blockedProcessorCount =
    Number(sourceRecord.blockedProcessorCount || 0);

  const executionStageCount =
    Number(sourceRecord.executionStageCount || stages.length || 0);

  const nextStage =
    stages.length > 0
      ? stages[0]
      : {
          stageNumber: 0,
          processorRegistryKeys: []
        };

  const nextStageNumber = nextStage.stageNumber || 0;
  const nextProcessorRegistryKeys = nextStage.processorRegistryKeys || [];

  let orchestrationDecision = 'NO_ACTION';

  if (unresolvedProcessorRegistryKeys.length > 0) {
    orchestrationDecision = 'HALT_UNRESOLVED_DEPENDENCIES';
  } else if (nextProcessorRegistryKeys.length > 1) {
    orchestrationDecision = 'READY_FOR_PARALLEL_EXECUTION';
  } else if (nextProcessorRegistryKeys.length === 1) {
    orchestrationDecision = 'READY_FOR_SINGLE_EXECUTION';
  }

  const orchestrationStatus =
    orchestrationDecision === 'HALT_UNRESOLVED_DEPENDENCIES'
      ? 'BLOCKED'
      : 'ORCHESTRATED';

  const orchestrationResult =
    orchestrationDecision === 'HALT_UNRESOLVED_DEPENDENCIES'
      ? 'ORCHESTRATION_BLOCKED'
      : 'ORCHESTRATION_READY';

  const now = new Date();

  const orchestrationPayload = {
    orchestrationType: 'SCIIP_AUTONOMOUS_PIPELINE_ORCHESTRATION',
    sourceDependencyResolutionBusinessKey: sourceRecord.businessKey || '',
    plannedProcessorCount: plannedProcessorCount,
    readyProcessorCount: readyProcessorCount,
    blockedProcessorCount: blockedProcessorCount,
    executionStageCount: executionStageCount,
    nextStageNumber: nextStageNumber,
    nextProcessorRegistryKeys: nextProcessorRegistryKeys,
    unresolvedProcessorRegistryKeys: unresolvedProcessorRegistryKeys,
    orchestrationDecision: orchestrationDecision,
    orchestratedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.resolutionStatus || '',
    resolutionResult: sourceRecord.resolutionResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  orchestrationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.resolutionStatus || '',
    'SCIIP_AUTONOMOUS_PIPELINE',
    'SCIIP Autonomous Pipeline Orchestration',
    orchestrationStatus,
    orchestrationResult,
    plannedProcessorCount,
    readyProcessorCount,
    blockedProcessorCount,
    executionStageCount,
    nextStageNumber,
    JSON.stringify(nextProcessorRegistryKeys),
    orchestrationDecision,
    JSON.stringify(orchestrationPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousPipelineOrchestrationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    orchestrationDecision,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2220_AutonomousPipelineOrchestrator() {
  const result = sciipRun2220_AutonomousPipelineOrchestrator();

  Logger.log(JSON.stringify({
    test: 'sciipTest2220_AutonomousPipelineOrchestrator',
    result
  }));

  return result;
}

/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: BusinessKeys.gs
========================================================== */

function sciipCreateBusinessKey(parts) {
  return (parts || [])
    .map(function(part) {
      return sciipNormalizeToken(part);
    })
    .filter(Boolean)
    .join('|');
}

function sciipPropertyBusinessKey(address, city, zip) {
  return sciipCreateBusinessKey([
    'PROPERTY',
    sciipAddressNormalize(address),
    sciipCityNormalize(city),
    sciipZipNormalize(zip)
  ]);
}

function sciipAssetBusinessKey(address, city, zip) {
  return sciipCreateBusinessKey([
    'ASSET',
    sciipAddressNormalize(address),
    sciipCityNormalize(city),
    sciipZipNormalize(zip)
  ]);
}

function sciipOwnerBusinessKey(ownerName) {
  return sciipCreateBusinessKey(['OWNER', ownerName]);
}

function sciipTenantBusinessKey(tenantName) {
  return sciipCreateBusinessKey(['TENANT', tenantName]);
}

function sciipEventBusinessKey(assetId, eventType, eventDate, source) {
  return sciipCreateBusinessKey([
    'EVENT',
    assetId,
    eventType,
    eventDate,
    source
  ]);
}

/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Dates.gs
========================================================== */

function sciipNow() {
  return new Date();
}

function sciipTodayIso() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}

function sciipTimestampIso(dateValue) {
  const date = dateValue ? new Date(dateValue) : new Date();
  return date.toISOString();
}

function sciipDateKey(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function sciipSafeDate(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * SCIIP_OS v6.0 — Distributed Runtime Storage Core
 */
var SCIIP_DISTRIBUTED_RUNTIME_STORAGE = (function () {
  var ns = {};
  ns.VERSION = 'v6.0';
  ns.MODE = 'CONTROL_PLANE_ONLY';
  ns.WORKBOOK_CELL_LIMIT = 10000000;

  ns.getActiveSpreadsheetSafe = function () {
    try { return SpreadsheetApp.getActiveSpreadsheet() || null; } catch (err) { return null; }
  };

  ns.getWorkbookCellCount = function (ss) {
    if (!ss) return ns.WORKBOOK_CELL_LIMIT;
    try {
      var sheets = ss.getSheets();
      var total = 0;
      for (var i = 0; i < sheets.length; i++) total += sheets[i].getMaxRows() * sheets[i].getMaxColumns();
      return total;
    } catch (err) {
      return ns.WORKBOOK_CELL_LIMIT;
    }
  };

  ns.getCapacityState = function () {
    var ss = ns.getActiveSpreadsheetSafe();
    var cells = ns.getWorkbookCellCount(ss);
    return {
      hasActiveSpreadsheet: !!ss,
      workbookCells: cells,
      workbookCellLimit: ns.WORKBOOK_CELL_LIMIT,
      atOrAboveLimit: cells >= ns.WORKBOOK_CELL_LIMIT,
      mode: ns.MODE
    };
  };

  ns.buildBusinessKey = function (cfg) {
    var dateKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    return String(cfg.processorNumber) + '_' + String(cfg.processorName).toUpperCase() + '|EXECUTE_' + String(cfg.processorName).toUpperCase() + '|' + dateKey;
  };

  ns.buildTransactionId = function (cfg) {
    var dateKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    return 'TXN|' + cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase() + '|' + cfg.targetSheet + '|' + dateKey + '|' + new Date().getTime();
  };

  ns.executeControlPlaneOnly = function (cfg) {
    var payload = {};
    payload[cfg.statusField] = 'SKIPPED_NO_INPUTS';
    payload.storageVersion = ns.VERSION;
    payload.storageMode = ns.MODE;
    payload.component = cfg.component;
    payload.sourceSheet = cfg.sourceSheet;
    payload.targetSheet = cfg.targetSheet;
    payload.transactionId = ns.buildTransactionId(cfg);
    payload.nextAction = cfg.nextAction;
    payload.capacityState = ns.getCapacityState();
    payload.message = 'Distributed Runtime Storage v6.0 control-plane processor validated. No unsafe workbook write was attempted.';

    return {
      processor: String(cfg.processorNumber) + '_' + cfg.processorName,
      status: 'SKIPPED_NO_INPUTS',
      businessKey: ns.buildBusinessKey(cfg),
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsRead: 0,
      processed: 0,
      skippedDuplicate: 0,
      skippedNoInputs: 1,
      skippedValidation: 0,
      errors: 0,
      message: JSON.stringify(payload),
      frameworkVersion: 'v6.0',
      completedAt: new Date().toISOString()
    };
  };

  return ns;
})();



var SCIIP_DISTRIBUTED_STORAGE_BACKEND = (function () {
  var ns = {};
  ns.VERSION = 'v6.0';
  ns.MODE = 'BACKEND_ACTIVATION_PLANNING';
  ns.WORKBOOK_CELL_LIMIT = 10000000;

  ns.getActiveSpreadsheetSafe = function () {
    try { return SpreadsheetApp.getActiveSpreadsheet() || null; } catch (err) { return null; }
  };

  ns.getWorkbookCellCount = function (ss) {
    if (!ss) return ns.WORKBOOK_CELL_LIMIT;
    try {
      var sheets = ss.getSheets();
      var total = 0;
      for (var i = 0; i < sheets.length; i++) total += sheets[i].getMaxRows() * sheets[i].getMaxColumns();
      return total;
    } catch (err) {
      return ns.WORKBOOK_CELL_LIMIT;
    }
  };

  ns.getCapacityState = function () {
    var ss = ns.getActiveSpreadsheetSafe();
    var cells = ns.getWorkbookCellCount(ss);
    return {
      hasActiveSpreadsheet: !!ss,
      workbookCells: cells,
      workbookCellLimit: ns.WORKBOOK_CELL_LIMIT,
      atOrAboveLimit: cells >= ns.WORKBOOK_CELL_LIMIT,
      mode: ns.MODE
    };
  };

  ns.buildBusinessKey = function (cfg) {
    var dateKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    return String(cfg.processorNumber) + '_' + String(cfg.processorName).toUpperCase() + '|EXECUTE_' + String(cfg.processorName).toUpperCase() + '|' + dateKey;
  };

  ns.buildTransactionId = function (cfg) {
    var dateKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    return 'TXN|' + cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase() + '|' + cfg.targetSheet + '|' + dateKey + '|' + new Date().getTime();
  };

  ns.executeBackendPlan = function (cfg) {
    var payload = {};
    payload[cfg.statusField] = 'SKIPPED_NO_INPUTS';
    payload.storageVersion = ns.VERSION;
    payload.storageMode = ns.MODE;
    payload.component = cfg.component;
    payload.backendLayer = cfg.backendLayer;
    payload.sourceSheet = cfg.sourceSheet;
    payload.targetSheet = cfg.targetSheet;
    payload.transactionId = ns.buildTransactionId(cfg);
    payload.nextAction = cfg.nextAction;
    payload.capacityState = ns.getCapacityState();
    payload.message = 'Distributed Storage Backend v6.0 processor validated in backend activation planning mode. No unsafe workbook write was attempted.';

    return {
      processor: String(cfg.processorNumber) + '_' + cfg.processorName,
      status: 'SKIPPED_NO_INPUTS',
      businessKey: ns.buildBusinessKey(cfg),
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsRead: 0,
      processed: 0,
      skippedDuplicate: 0,
      skippedNoInputs: 1,
      skippedValidation: 0,
      errors: 0,
      message: JSON.stringify(payload),
      frameworkVersion: 'v6.0',
      completedAt: new Date().toISOString()
    };
  };

  return ns;
})();


/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2320 Execution Monitor
 ************************************************************/

function sciipRun2320_ExecutionMonitor() {
  const processor = '2320_ExecutionMonitor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RETRY_POLICY_ENGINE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'retryScope',
      'retryPolicyName',
      'retryPolicyStatus',
      'retryPolicyResult',
      'detectedErrorCount',
      'retryEligibleCount',
      'retryBlockedCount',
      'maxRetryAttempts',
      'retryBackoffStrategy',
      'retryEligibleProcessorsJson',
      'retryBlockedProcessorsJson',
      'retryPolicyPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const monitorSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_MONITOR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'monitorScope',
      'monitorName',
      'monitorStatus',
      'monitorResult',
      'detectedErrorCount',
      'retryEligibleCount',
      'retryBlockedCount',
      'runtimeHealthStatus',
      'runtimeHealthScore',
      'monitorFinding',
      'monitorRecommendation',
      'monitorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_EXECUTION_MONITOR|' + dateKey;

  if (sciipSheetBusinessKeyExists_(monitorSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      executionMonitorsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_RETRY_POLICY_ENGINE',
      executionMonitorsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const detectedErrorCount = Number(sourceRecord.detectedErrorCount || 0);
  const retryEligibleCount = Number(sourceRecord.retryEligibleCount || 0);
  const retryBlockedCount = Number(sourceRecord.retryBlockedCount || 0);

  let runtimeHealthStatus = 'HEALTHY';
  let runtimeHealthScore = 100;
  let monitorResult = 'RUNTIME_HEALTHY';
  let monitorFinding =
    'Runtime monitor detected no errors requiring intervention.';
  let monitorRecommendation =
    'Continue normal autonomous runtime operation.';

  if (retryBlockedCount > 0) {
    runtimeHealthStatus = 'ATTENTION_REQUIRED';
    runtimeHealthScore = 60;
    monitorResult = 'RUNTIME_ATTENTION_REQUIRED';
    monitorFinding =
      'Runtime monitor detected blocked retry conditions requiring review.';
    monitorRecommendation =
      'Review blocked processors before continuing autonomous execution.';
  } else if (retryEligibleCount > 0) {
    runtimeHealthStatus = 'RETRY_READY';
    runtimeHealthScore = 75;
    monitorResult = 'RUNTIME_RETRY_READY';
    monitorFinding =
      'Runtime monitor detected retry-eligible processor failures.';
    monitorRecommendation =
      'Execute retry policy workflow before advancing the runtime pipeline.';
  } else if (detectedErrorCount > 0) {
    runtimeHealthStatus = 'WARNINGS_DETECTED';
    runtimeHealthScore = 85;
    monitorResult = 'RUNTIME_WARNINGS_DETECTED';
    monitorFinding =
      'Runtime monitor detected non-blocking runtime warnings.';
    monitorRecommendation =
      'Review warnings and continue execution if acceptable.';
  }

  const now = new Date();

  const monitorPayload = {
    monitorType: 'SCIIP_EXECUTION_MONITOR',
    sourceRetryPolicyBusinessKey: sourceRecord.businessKey || '',
    detectedErrorCount,
    retryEligibleCount,
    retryBlockedCount,
    retryPolicyStatus: sourceRecord.retryPolicyStatus || '',
    retryPolicyResult: sourceRecord.retryPolicyResult || '',
    runtimeHealthStatus,
    runtimeHealthScore,
    monitorResult,
    monitorFinding,
    monitorRecommendation,
    monitoredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.retryPolicyStatus || '',
    retryPolicyResult: sourceRecord.retryPolicyResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  monitorSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.retryPolicyStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Execution Monitor',
    runtimeHealthStatus,
    monitorResult,
    detectedErrorCount,
    retryEligibleCount,
    retryBlockedCount,
    runtimeHealthStatus,
    runtimeHealthScore,
    monitorFinding,
    monitorRecommendation,
    JSON.stringify(monitorPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    executionMonitorsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    runtimeHealthStatus,
    runtimeHealthScore,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2320_ExecutionMonitor() {
  const result = sciipRun2320_ExecutionMonitor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2320_ExecutionMonitor',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2240 Execution Queue Builder
 ************************************************************/

function sciipRun2240_ExecutionQueueBuilder() {
  const processor = '2240_ExecutionQueueBuilder';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PARALLEL_EXECUTION_SCHEDULE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'scheduleScope',
      'scheduleName',
      'scheduleStatus',
      'scheduleResult',
      'nextStageNumber',
      'scheduledProcessorCount',
      'parallelEligibleCount',
      'singleExecutionCount',
      'blockedProcessorCount',
      'scheduledProcessorRegistryKeys',
      'schedulePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const queueSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_QUEUE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'queueScope',
      'queueName',
      'queueStatus',
      'queueResult',
      'executionMode',
      'nextStageNumber',
      'queuedProcessorCount',
      'queuedProcessorRegistryKeys',
      'queuePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_EXECUTION_QUEUE|' + dateKey;

  if (sciipSheetBusinessKeyExists_(queueSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      executionQueuesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_PARALLEL_EXECUTION_SCHEDULE',
      executionQueuesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let queuedProcessorRegistryKeys = [];

  try {
    queuedProcessorRegistryKeys = JSON.parse(
      sourceRecord.scheduledProcessorRegistryKeys || '[]'
    );
  } catch (err) {
    queuedProcessorRegistryKeys = [];
  }

  const queuedProcessorCount = queuedProcessorRegistryKeys.length;
  const parallelEligibleCount = Number(sourceRecord.parallelEligibleCount || 0);
  const singleExecutionCount = Number(sourceRecord.singleExecutionCount || 0);
  const nextStageNumber = Number(sourceRecord.nextStageNumber || 0);

  let executionMode = 'NONE';

  if (parallelEligibleCount > 0) {
    executionMode = 'PARALLEL';
  } else if (singleExecutionCount === 1) {
    executionMode = 'SINGLE';
  }

  let queueStatus = 'QUEUED';
  let queueResult = 'EXECUTION_QUEUE_READY';

  if (sourceRecord.scheduleStatus === 'BLOCKED') {
    queueStatus = 'BLOCKED';
    queueResult = 'EXECUTION_QUEUE_BLOCKED';
  } else if (queuedProcessorCount === 0) {
    queueStatus = 'EMPTY';
    queueResult = 'NO_PROCESSORS_QUEUED';
  }

  const now = new Date();

  const queuePayload = {
    queueType: 'SCIIP_EXECUTION_QUEUE',
    sourceScheduleBusinessKey: sourceRecord.businessKey || '',
    executionMode,
    nextStageNumber,
    queuedProcessorCount,
    queuedProcessorRegistryKeys,
    queueStatus,
    queueResult,
    queuedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.scheduleStatus || '',
    scheduleResult: sourceRecord.scheduleResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  queueSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.scheduleStatus || '',
    'SCIIP_AUTONOMOUS_PIPELINE',
    'SCIIP Execution Queue',
    queueStatus,
    queueResult,
    executionMode,
    nextStageNumber,
    queuedProcessorCount,
    JSON.stringify(queuedProcessorRegistryKeys),
    JSON.stringify(queuePayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    executionQueuesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    queueStatus,
    queueResult,
    queuedProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2240_ExecutionQueueBuilder() {
  const result = sciipRun2240_ExecutionQueueBuilder();

  Logger.log(JSON.stringify({
    test: 'sciipTest2240_ExecutionQueueBuilder',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2250 Execution Queue Ledger
 ************************************************************/

function sciipRun2250_ExecutionQueueLedger() {
  const processor = '2250_ExecutionQueueLedger';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_QUEUE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'queueScope',
      'queueName',
      'queueStatus',
      'queueResult',
      'executionMode',
      'nextStageNumber',
      'queuedProcessorCount',
      'queuedProcessorRegistryKeys',
      'queuePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_QUEUE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'queueLedgerScope',
      'queueLedgerName',
      'queueLedgerStatus',
      'ledgeredQueueBusinessKey',
      'executionMode',
      'nextStageNumber',
      'queuedProcessorCount',
      'queuedProcessorRegistryKeys',
      'queueLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_EXECUTION_QUEUE_LEDGER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      executionQueueLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_EXECUTION_QUEUE',
      executionQueueLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SCIIP_EXECUTION_QUEUE_LEDGER',
    ledgeredQueueBusinessKey: sourceRecord.businessKey || '',
    executionMode: sourceRecord.executionMode || '',
    nextStageNumber: Number(sourceRecord.nextStageNumber || 0),
    queuedProcessorCount: Number(sourceRecord.queuedProcessorCount || 0),
    queuedProcessorRegistryKeys: sourceRecord.queuedProcessorRegistryKeys || '[]',
    queueStatus: sourceRecord.queueStatus || '',
    queueResult: sourceRecord.queueResult || '',
    ledgeredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.queueStatus || '',
    queueResult: sourceRecord.queueResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.queueStatus || '',
    'SCIIP_AUTONOMOUS_PIPELINE',
    'SCIIP Execution Queue Ledger',
    'LEDGERED',
    sourceRecord.businessKey || '',
    sourceRecord.executionMode || '',
    sourceRecord.nextStageNumber || 0,
    sourceRecord.queuedProcessorCount || 0,
    sourceRecord.queuedProcessorRegistryKeys || '[]',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    executionQueueLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2250_ExecutionQueueLedger() {
  const result = sciipRun2250_ExecutionQueueLedger();

  Logger.log(JSON.stringify({
    test: 'sciipTest2250_ExecutionQueueLedger',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2280 Execution Runtime Engine
 ************************************************************/

function sciipRun2280_ExecutionRuntimeEngine() {
  const processor = '2280_ExecutionRuntimeEngine';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_DISPATCHER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'dispatcherScope',
      'dispatcherName',
      'dispatcherStatus',
      'dispatcherResult',
      'executionMode',
      'nextStageNumber',
      'dispatchableProcessorCount',
      'resolvedProcessorCount',
      'unresolvedProcessorCount',
      'resolvedProcessorFunctions',
      'unresolvedProcessorRegistryKeys',
      'dispatcherPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const runtimeSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_RUNTIME',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'runtimeScope',
      'runtimeName',
      'runtimeStatus',
      'runtimeResult',
      'executionMode',
      'nextStageNumber',
      'resolvedProcessorCount',
      'executedProcessorCount',
      'failedProcessorCount',
      'skippedProcessorCount',
      'runtimeExecutionResultsJson',
      'runtimePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_EXECUTION_RUNTIME|' + dateKey;

  if (sciipSheetBusinessKeyExists_(runtimeSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      executionRuntimeEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_PROCESSOR_DISPATCHER',
      executionRuntimeEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let resolvedProcessorFunctions = [];

  try {
    resolvedProcessorFunctions = JSON.parse(
      sourceRecord.resolvedProcessorFunctions || '[]'
    );
  } catch (err) {
    resolvedProcessorFunctions = [];
  }

  const runtimeExecutionResults = [];
  let executedProcessorCount = 0;
  let failedProcessorCount = 0;
  let skippedProcessorCount = 0;

  resolvedProcessorFunctions.forEach(function(item) {
    const startedAt = new Date();

    try {
      const fn = globalThis[item.processorFunction];

      if (typeof fn !== 'function') {
        skippedProcessorCount++;

        runtimeExecutionResults.push({
          registryKey: item.registryKey,
          processorNumber: item.processorNumber,
          processorFunction: item.processorFunction,
          status: 'SKIPPED_FUNCTION_NOT_FOUND',
          startedAt: startedAt.toISOString(),
          completedAt: new Date().toISOString()
        });

        return;
      }

      const executionResult = fn();

      executedProcessorCount++;

      runtimeExecutionResults.push({
        registryKey: item.registryKey,
        processorNumber: item.processorNumber,
        processorFunction: item.processorFunction,
        status: 'EXECUTED',
        result: executionResult || {},
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString()
      });

    } catch (err) {
      failedProcessorCount++;

      runtimeExecutionResults.push({
        registryKey: item.registryKey,
        processorNumber: item.processorNumber,
        processorFunction: item.processorFunction,
        status: 'FAILED',
        errorMessage: err && err.message ? err.message : String(err),
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString()
      });
    }
  });

  const runtimeStatus =
    failedProcessorCount > 0
      ? 'COMPLETED_WITH_ERRORS'
      : 'COMPLETED';

  const runtimeResult =
    failedProcessorCount > 0
      ? 'RUNTIME_EXECUTION_PARTIAL_FAILURE'
      : 'RUNTIME_EXECUTION_SUCCESS';

  const now = new Date();

  const runtimePayload = {
    runtimeType: 'SCIIP_EXECUTION_RUNTIME',
    sourceDispatcherBusinessKey: sourceRecord.businessKey || '',
    executionMode: sourceRecord.executionMode || '',
    nextStageNumber: Number(sourceRecord.nextStageNumber || 0),
    resolvedProcessorCount: Number(sourceRecord.resolvedProcessorCount || 0),
    executedProcessorCount,
    failedProcessorCount,
    skippedProcessorCount,
    runtimeStatus,
    runtimeResult,
    executedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.dispatcherStatus || '',
    dispatcherResult: sourceRecord.dispatcherResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  runtimeSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.dispatcherStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Execution Runtime Engine',
    runtimeStatus,
    runtimeResult,
    sourceRecord.executionMode || '',
    sourceRecord.nextStageNumber || 0,
    sourceRecord.resolvedProcessorCount || 0,
    executedProcessorCount,
    failedProcessorCount,
    skippedProcessorCount,
    JSON.stringify(runtimeExecutionResults),
    JSON.stringify(runtimePayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    executionRuntimeEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    runtimeStatus,
    executedProcessorCount,
    failedProcessorCount,
    skippedProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2280_ExecutionRuntimeEngine() {
  const result = sciipRun2280_ExecutionRuntimeEngine();

  Logger.log(JSON.stringify({
    test: 'sciipTest2280_ExecutionRuntimeEngine',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2230 Parallel Execution Scheduler
 ************************************************************/

function sciipRun2230_ParallelExecutionScheduler() {
  const processor = '2230_ParallelExecutionScheduler';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_AUTONOMOUS_PIPELINE_ORCHESTRATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'orchestrationScope',
      'orchestrationName',
      'orchestrationStatus',
      'orchestrationResult',
      'plannedProcessorCount',
      'readyProcessorCount',
      'blockedProcessorCount',
      'executionStageCount',
      'nextStageNumber',
      'nextProcessorRegistryKeys',
      'orchestrationDecision',
      'orchestrationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const scheduleSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PARALLEL_EXECUTION_SCHEDULE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'scheduleScope',
      'scheduleName',
      'scheduleStatus',
      'scheduleResult',
      'nextStageNumber',
      'scheduledProcessorCount',
      'parallelEligibleCount',
      'singleExecutionCount',
      'blockedProcessorCount',
      'scheduledProcessorRegistryKeys',
      'schedulePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PARALLEL_EXECUTION_SCHEDULE|' + dateKey;

  if (sciipSheetBusinessKeyExists_(scheduleSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      parallelExecutionSchedulesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_ORCHESTRATION',
      parallelExecutionSchedulesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let scheduledProcessorRegistryKeys = [];

  try {
    scheduledProcessorRegistryKeys = JSON.parse(
      sourceRecord.nextProcessorRegistryKeys || '[]'
    );
  } catch (err) {
    scheduledProcessorRegistryKeys = [];
  }

  const orchestrationDecision = sourceRecord.orchestrationDecision || '';
  const blockedProcessorCount = Number(sourceRecord.blockedProcessorCount || 0);
  const nextStageNumber = Number(sourceRecord.nextStageNumber || 0);
  const scheduledProcessorCount = scheduledProcessorRegistryKeys.length;

  let scheduleStatus = 'SCHEDULED';
  let scheduleResult = 'EXECUTION_SCHEDULE_READY';

  if (orchestrationDecision === 'HALT_UNRESOLVED_DEPENDENCIES') {
    scheduleStatus = 'BLOCKED';
    scheduleResult = 'EXECUTION_SCHEDULE_BLOCKED';
  } else if (scheduledProcessorCount === 0) {
    scheduleStatus = 'NO_READY_PROCESSORS';
    scheduleResult = 'NO_EXECUTION_SCHEDULE_CREATED';
  }

  const parallelEligibleCount =
    scheduledProcessorCount > 1 ? scheduledProcessorCount : 0;

  const singleExecutionCount =
    scheduledProcessorCount === 1 ? 1 : 0;

  const now = new Date();

  const schedulePayload = {
    scheduleType: 'SCIIP_PARALLEL_EXECUTION_SCHEDULE',
    sourceOrchestrationBusinessKey: sourceRecord.businessKey || '',
    orchestrationDecision: orchestrationDecision,
    nextStageNumber: nextStageNumber,
    scheduledProcessorCount: scheduledProcessorCount,
    parallelEligibleCount: parallelEligibleCount,
    singleExecutionCount: singleExecutionCount,
    blockedProcessorCount: blockedProcessorCount,
    scheduledProcessorRegistryKeys: scheduledProcessorRegistryKeys,
    executionMode:
      parallelEligibleCount > 0
        ? 'PARALLEL'
        : singleExecutionCount === 1
          ? 'SINGLE'
          : 'NONE',
    scheduledAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.orchestrationStatus || '',
    orchestrationResult: sourceRecord.orchestrationResult || '',
    orchestrationDecision: orchestrationDecision,
    createdAt: sourceRecord.createdAt || ''
  };

  scheduleSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.orchestrationStatus || '',
    'SCIIP_AUTONOMOUS_PIPELINE',
    'SCIIP Parallel Execution Schedule',
    scheduleStatus,
    scheduleResult,
    nextStageNumber,
    scheduledProcessorCount,
    parallelEligibleCount,
    singleExecutionCount,
    blockedProcessorCount,
    JSON.stringify(scheduledProcessorRegistryKeys),
    JSON.stringify(schedulePayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    parallelExecutionSchedulesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    scheduleStatus,
    scheduleResult,
    scheduledProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2230_ParallelExecutionScheduler() {
  const result = sciipRun2230_ParallelExecutionScheduler();

  Logger.log(JSON.stringify({
    test: 'sciipTest2230_ParallelExecutionScheduler',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2190 Processor Dependency Graph
 ************************************************************/

function sciipRun2190_ProcessorDependencyGraph() {
  const processor = '2190_ProcessorDependencyGraph';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_VALIDATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'validationScope',
      'validationName',
      'validationStatus',
      'validationResult',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'validationFinding',
      'validationRecommendation',
      'validationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const graphSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_DEPENDENCY_GRAPH',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'graphScope',
      'graphName',
      'graphStatus',
      'nodeCount',
      'edgeCount',
      'rootProcessorCount',
      'terminalProcessorCount',
      'graphPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_DEPENDENCY_GRAPH|' + dateKey;

  if (sciipSheetBusinessKeyExists_(graphSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorDependencyGraphsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTRY_VALIDATION',
      processorDependencyGraphsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const registry = sciipListRegisteredProcessors_();

  if (!registry || registry.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTERED_PROCESSORS',
      processorDependencyGraphsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const nodes = registry.map(function(item) {
    return {
      processorNumber: item.processorNumber,
      registryKey: item.registryKey,
      processorFunction: item.processorFunction,
      testFunction: item.testFunction,
      inputSheet: item.inputSheet,
      outputSheet: item.outputSheet,
      status: item.status,
      track: item.track,
      version: item.version
    };
  });

  const edges = [];

  nodes.forEach(function(upstream) {
    nodes.forEach(function(downstream) {
      if (
        upstream.outputSheet &&
        downstream.inputSheet &&
        upstream.outputSheet === downstream.inputSheet
      ) {
        edges.push({
          fromProcessorNumber: upstream.processorNumber,
          fromRegistryKey: upstream.registryKey,
          toProcessorNumber: downstream.processorNumber,
          toRegistryKey: downstream.registryKey,
          relationshipType: 'OUTPUT_FEEDS_INPUT',
          sharedSheet: upstream.outputSheet
        });
      }
    });
  });

  const downstreamSet = {};
  const upstreamSet = {};

  edges.forEach(function(edge) {
    downstreamSet[edge.fromRegistryKey] = true;
    upstreamSet[edge.toRegistryKey] = true;
  });

  const rootProcessors = nodes.filter(function(node) {
    return !upstreamSet[node.registryKey];
  });

  const terminalProcessors = nodes.filter(function(node) {
    return !downstreamSet[node.registryKey];
  });

  const now = new Date();

  const graphPayload = {
    graphType: 'SCIIP_PROCESSOR_DEPENDENCY_GRAPH',
    nodeCount: nodes.length,
    edgeCount: edges.length,
    rootProcessorCount: rootProcessors.length,
    terminalProcessorCount: terminalProcessors.length,
    nodes,
    edges,
    rootProcessors,
    terminalProcessors,
    generatedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.validationStatus || '',
    validationResult: sourceRecord.validationResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  graphSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.validationStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Dependency Graph',
    'GRAPHED',
    nodes.length,
    edges.length,
    rootProcessors.length,
    terminalProcessors.length,
    JSON.stringify(graphPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorDependencyGraphsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2190_ProcessorDependencyGraph() {
  const result = sciipRun2190_ProcessorDependencyGraph();

  Logger.log(JSON.stringify({
    test: 'sciipTest2190_ProcessorDependencyGraph',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2210 Processor Dependency Resolver
 ************************************************************/

function sciipRun2210_ProcessorDependencyResolver() {
  const processor = '2210_ProcessorDependencyResolver';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_EXECUTION_PLAN',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'planScope',
      'planName',
      'planStatus',
      'plannedProcessorCount',
      'plannedEdgeCount',
      'rootProcessorCount',
      'terminalProcessorCount',
      'executionStageCount',
      'executionPlanPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const resolverSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_DEPENDENCY_RESOLUTION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'resolutionScope',
      'resolutionName',
      'resolutionStatus',
      'resolutionResult',
      'plannedProcessorCount',
      'resolvedProcessorCount',
      'unresolvedProcessorCount',
      'executionStageCount',
      'readyProcessorCount',
      'blockedProcessorCount',
      'resolutionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_DEPENDENCY_RESOLUTION|' + dateKey;

  if (sciipSheetBusinessKeyExists_(resolverSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorDependencyResolutionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_EXECUTION_PLAN',
      processorDependencyResolutionsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let planPayload = {};
  try {
    planPayload = JSON.parse(sourceRecord.executionPlanPayloadJson || '{}');
  } catch (err) {
    planPayload = {};
  }

  const stages = planPayload.stages || [];
  const unresolved = planPayload.unresolvedProcessorRegistryKeys || [];

  const plannedProcessorCount =
    Number(sourceRecord.plannedProcessorCount || planPayload.plannedProcessorCount || 0);

  const executionStageCount =
    Number(sourceRecord.executionStageCount || planPayload.executionStageCount || stages.length || 0);

  let resolvedProcessorCount = 0;
  stages.forEach(function(stage) {
    resolvedProcessorCount += (stage.processorRegistryKeys || []).length;
  });

  const unresolvedProcessorCount = unresolved.length;

  const firstStage = stages.length > 0 ? stages[0] : null;
  const readyProcessorCount = firstStage
    ? (firstStage.processorRegistryKeys || []).length
    : 0;

  const blockedProcessorCount =
    Math.max(plannedProcessorCount - readyProcessorCount, 0);

  const resolutionResult =
    unresolvedProcessorCount === 0
      ? 'DEPENDENCIES_RESOLVED'
      : 'DEPENDENCIES_UNRESOLVED';

  const resolutionStatus =
    unresolvedProcessorCount === 0
      ? 'RESOLVED'
      : 'RESOLUTION_ATTENTION_REQUIRED';

  const now = new Date();

  const resolutionPayload = {
    resolutionType: 'SCIIP_PROCESSOR_DEPENDENCY_RESOLUTION',
    sourceExecutionPlanBusinessKey: sourceRecord.businessKey || '',
    plannedProcessorCount: plannedProcessorCount,
    resolvedProcessorCount: resolvedProcessorCount,
    unresolvedProcessorCount: unresolvedProcessorCount,
    executionStageCount: executionStageCount,
    readyProcessorCount: readyProcessorCount,
    blockedProcessorCount: blockedProcessorCount,
    resolutionResult: resolutionResult,
    stages: stages,
    unresolvedProcessorRegistryKeys: unresolved,
    resolvedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.planStatus || '',
    executionStageCount: sourceRecord.executionStageCount || '',
    createdAt: sourceRecord.createdAt || ''
  };

  resolverSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.planStatus || '',
    'SCIIP_PROCESSOR_EXECUTION',
    'SCIIP Processor Dependency Resolution',
    resolutionStatus,
    resolutionResult,
    plannedProcessorCount,
    resolvedProcessorCount,
    unresolvedProcessorCount,
    executionStageCount,
    readyProcessorCount,
    blockedProcessorCount,
    JSON.stringify(resolutionPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorDependencyResolutionsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    resolutionResult,
    unresolvedProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2210_ProcessorDependencyResolver() {
  const result = sciipRun2210_ProcessorDependencyResolver();

  Logger.log(JSON.stringify({
    test: 'sciipTest2210_ProcessorDependencyResolver',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2270 Processor Dispatcher
 ************************************************************/

function sciipRun2270_ProcessorDispatcher() {
  const processor = '2270_ProcessorDispatcher';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_DISPATCH_REGISTRY',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'dispatchScope',
      'dispatchName',
      'dispatchStatus',
      'dispatchResult',
      'executionMode',
      'nextStageNumber',
      'dispatchableProcessorCount',
      'dispatchableProcessorRegistryKeys',
      'dispatchRegistryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const dispatcherSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_DISPATCHER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'dispatcherScope',
      'dispatcherName',
      'dispatcherStatus',
      'dispatcherResult',
      'executionMode',
      'nextStageNumber',
      'dispatchableProcessorCount',
      'resolvedProcessorCount',
      'unresolvedProcessorCount',
      'resolvedProcessorFunctions',
      'unresolvedProcessorRegistryKeys',
      'dispatcherPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_DISPATCHER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(dispatcherSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorDispatchersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_RUNTIME_DISPATCH_REGISTRY',
      processorDispatchersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let dispatchableProcessorRegistryKeys = [];

  try {
    dispatchableProcessorRegistryKeys = JSON.parse(
      sourceRecord.dispatchableProcessorRegistryKeys || '[]'
    );
  } catch (err) {
    dispatchableProcessorRegistryKeys = [];
  }

  const registry = sciipGetProcessorRegistry_();

  const resolvedProcessorFunctions = [];
  const unresolvedProcessorRegistryKeys = [];

  dispatchableProcessorRegistryKeys.forEach(function(registryKey) {
    const item = registry[registryKey];

    if (item && item.processorFunction && typeof this[item.processorFunction] === 'function') {
      resolvedProcessorFunctions.push({
        registryKey: registryKey,
        processorNumber: item.processorNumber,
        processorFunction: item.processorFunction,
        testFunction: item.testFunction || '',
        inputSheet: item.inputSheet || '',
        outputSheet: item.outputSheet || '',
        track: item.track || '',
        version: item.version || ''
      });
    } else {
      unresolvedProcessorRegistryKeys.push(registryKey);
    }
  });

  const resolvedProcessorCount = resolvedProcessorFunctions.length;
  const unresolvedProcessorCount = unresolvedProcessorRegistryKeys.length;

  const dispatcherStatus =
    unresolvedProcessorCount === 0 ? 'RESOLVED' : 'RESOLUTION_ATTENTION_REQUIRED';

  const dispatcherResult =
    unresolvedProcessorCount === 0
      ? 'DISPATCH_FUNCTIONS_RESOLVED'
      : 'DISPATCH_FUNCTIONS_UNRESOLVED';

  const now = new Date();

  const dispatcherPayload = {
    dispatcherType: 'SCIIP_PROCESSOR_DISPATCHER',
    sourceDispatchRegistryBusinessKey: sourceRecord.businessKey || '',
    executionMode: sourceRecord.executionMode || '',
    nextStageNumber: Number(sourceRecord.nextStageNumber || 0),
    dispatchableProcessorCount: dispatchableProcessorRegistryKeys.length,
    resolvedProcessorCount,
    unresolvedProcessorCount,
    resolvedProcessorFunctions,
    unresolvedProcessorRegistryKeys,
    dispatcherStatus,
    dispatcherResult,
    resolvedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.dispatchStatus || '',
    dispatchResult: sourceRecord.dispatchResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  dispatcherSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.dispatchStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Processor Dispatcher',
    dispatcherStatus,
    dispatcherResult,
    sourceRecord.executionMode || '',
    sourceRecord.nextStageNumber || 0,
    dispatchableProcessorRegistryKeys.length,
    resolvedProcessorCount,
    unresolvedProcessorCount,
    JSON.stringify(resolvedProcessorFunctions),
    JSON.stringify(unresolvedProcessorRegistryKeys),
    JSON.stringify(dispatcherPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorDispatchersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    dispatcherStatus,
    resolvedProcessorCount,
    unresolvedProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2270_ProcessorDispatcher() {
  const result = sciipRun2270_ProcessorDispatcher();

  Logger.log(JSON.stringify({
    test: 'sciipTest2270_ProcessorDispatcher',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2200 Processor Execution Planner
 ************************************************************/

function sciipRun2200_ProcessorExecutionPlanner() {
  const processor = '2200_ProcessorExecutionPlanner';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_DEPENDENCY_GRAPH',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'graphScope',
      'graphName',
      'graphStatus',
      'nodeCount',
      'edgeCount',
      'rootProcessorCount',
      'terminalProcessorCount',
      'graphPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const planSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_EXECUTION_PLAN',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'planScope',
      'planName',
      'planStatus',
      'plannedProcessorCount',
      'plannedEdgeCount',
      'rootProcessorCount',
      'terminalProcessorCount',
      'executionStageCount',
      'executionPlanPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_EXECUTION_PLAN|' + dateKey;

  if (sciipSheetBusinessKeyExists_(planSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorExecutionPlansCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_DEPENDENCY_GRAPH',
      processorExecutionPlansCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let graphPayload = {};

  try {
    graphPayload = JSON.parse(sourceRecord.graphPayloadJson || '{}');
  } catch (err) {
    graphPayload = {};
  }

  const nodes = graphPayload.nodes || [];
  const edges = graphPayload.edges || [];

  if (!nodes.length) {
    const result = {
      processor,
      status: 'SKIPPED_EMPTY_DEPENDENCY_GRAPH',
      processorExecutionPlansCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const incoming = {};
  const outgoing = {};

  nodes.forEach(function(node) {
    incoming[node.registryKey] = [];
    outgoing[node.registryKey] = [];
  });

  edges.forEach(function(edge) {
    if (!incoming[edge.toRegistryKey]) incoming[edge.toRegistryKey] = [];
    if (!outgoing[edge.fromRegistryKey]) outgoing[edge.fromRegistryKey] = [];

    incoming[edge.toRegistryKey].push(edge.fromRegistryKey);
    outgoing[edge.fromRegistryKey].push(edge.toRegistryKey);
  });

  const planned = {};
  const stages = [];
  let remaining = nodes.map(function(node) {
    return node.registryKey;
  });

  while (remaining.length > 0) {
    const ready = remaining.filter(function(registryKey) {
      const dependencies = incoming[registryKey] || [];
      return dependencies.every(function(dep) {
        return planned[dep] === true;
      });
    });

    if (ready.length === 0) {
      break;
    }

    stages.push({
      stageNumber: stages.length + 1,
      processorRegistryKeys: ready
    });

    ready.forEach(function(registryKey) {
      planned[registryKey] = true;
    });

    remaining = remaining.filter(function(registryKey) {
      return planned[registryKey] !== true;
    });
  }

  const unresolved = remaining;

  const rootProcessors = nodes.filter(function(node) {
    return !incoming[node.registryKey] || incoming[node.registryKey].length === 0;
  });

  const terminalProcessors = nodes.filter(function(node) {
    return !outgoing[node.registryKey] || outgoing[node.registryKey].length === 0;
  });

  const planStatus =
    unresolved.length === 0
      ? 'PLANNED'
      : 'PLANNED_WITH_UNRESOLVED_DEPENDENCIES';

  const now = new Date();

  const executionPlanPayload = {
    planType: 'SCIIP_PROCESSOR_EXECUTION_PLAN',
    plannedProcessorCount: nodes.length,
    plannedEdgeCount: edges.length,
    rootProcessorCount: rootProcessors.length,
    terminalProcessorCount: terminalProcessors.length,
    executionStageCount: stages.length,
    stages: stages,
    unresolvedProcessorRegistryKeys: unresolved,
    generatedFromDependencyGraphBusinessKey: sourceRecord.businessKey || '',
    plannedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.graphStatus || '',
    nodeCount: sourceRecord.nodeCount || '',
    edgeCount: sourceRecord.edgeCount || '',
    createdAt: sourceRecord.createdAt || ''
  };

  planSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.graphStatus || '',
    'SCIIP_PROCESSOR_EXECUTION',
    'SCIIP Processor Execution Plan',
    planStatus,
    nodes.length,
    edges.length,
    rootProcessors.length,
    terminalProcessors.length,
    stages.length,
    JSON.stringify(executionPlanPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorExecutionPlansCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    planStatus,
    executionStageCount: stages.length,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2200_ProcessorExecutionPlanner() {
  const result = sciipRun2200_ProcessorExecutionPlanner();

  Logger.log(JSON.stringify({
    test: 'sciipTest2200_ProcessorExecutionPlanner',
    result
  }));

  return result;
}

function sciipResolveSheetAlias_(sheetName) {
  const aliases = {
    ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW',

    ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER'
  };

  return aliases[sheetName] || sheetName;
}

function sciipEnsureSheetWithHeadersAlias_(ss, sheetName, headers) {
  return sciipEnsureSheetWithHeaders_(
    ss,
    sciipResolveSheetAlias_(sheetName),
    headers
  );
}

function sciipRunConfiguredContinuityProcessor_(config) {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();
  const now = new Date();

  const sourceSheet = sciipEnsureSheetWithHeadersAlias_(
    ss,
    config.sourceSheetName,
    config.sourceHeaders
  );

  const outputSheet = sciipEnsureSheetWithHeadersAlias_(
    ss,
    config.outputSheetName,
    config.outputHeaders
  );

  const businessKey = config.businessKeyPrefix + '|' + dateKey;

  if (sciipSheetBusinessKeyExists_(outputSheet, businessKey)) {
    const duplicateResult = {
      processor: config.processor,
      status: 'SUCCESS',
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: now.toISOString()
    };

    duplicateResult[config.createdCountField] = 0;

    Logger.log(JSON.stringify(duplicateResult));
    return duplicateResult;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const skippedResult = {
      processor: config.processor,
      status: 'SKIPPED_NO_INPUTS',
      skippedDuplicate: 0,
      businessKey: businessKey,
      completedAt: now.toISOString()
    };

    skippedResult[config.createdCountField] = 0;

    Logger.log(JSON.stringify(skippedResult));
    return skippedResult;
  }

  outputSheet.appendRow(
    config.buildRow({
      businessKey: businessKey,
      dateKey: dateKey,
      processor: config.processor,
      sourceRecord: sourceRecord,
      now: now
    })
  );

  const result = {
    processor: config.processor,
    status: 'SUCCESS',
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: now.toISOString()
  };

  result[config.createdCountField] = 1;

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * Processor Registry
 ************************************************************/

function sciipGetProcessorRegistry_() {
  return {
    ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION: {
      processorNumber: 2090,
      processorName:
        'AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
      processorFunction:
        'sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
      testFunction:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
      inputSheet:
        'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER',
      outputSheet:
        'ARCH_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',
      businessKeyPrefix:
        'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',
      status: 'VALIDATED',
      track: 'ARCHITECTURE_REVIEW',
      version: 'SCIIP_OS v5.1'
    }
  };
}

function sciipGetRegisteredProcessor_(registryKey) {
  const registry = sciipGetProcessorRegistry_();
  return registry[registryKey] || null;
}

function sciipListRegisteredProcessors_() {
  const registry = sciipGetProcessorRegistry_();
  return Object.keys(registry).map(function(key) {
    const item = registry[key];
    return {
      registryKey: key,
      processorNumber: item.processorNumber,
      processorFunction: item.processorFunction,
      testFunction: item.testFunction,
      inputSheet: item.inputSheet,
      outputSheet: item.outputSheet,
      status: item.status,
      track: item.track,
      version: item.version
    };
  });
}
function sciipTest2100_ProcessorRegistry() {
  const processors = sciipListRegisteredProcessors_();

  Logger.log(JSON.stringify({
    test: 'sciipTest2100_ProcessorRegistry',
    registeredProcessors: processors.length,
    processors: processors
  }));

  return {
    status: processors.length > 0 ? 'SUCCESS' : 'FAILED_EMPTY_REGISTRY',
    registeredProcessors: processors.length
  };
}

/************************************************************
 * SCIIP_OS v5.1
 * 2160 Processor Registry Checkpoint
 ************************************************************/

function sciipRun2160_ProcessorRegistryCheckpoint() {
  const processor = '2160_ProcessorRegistryCheckpoint';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'replicaScope',
      'replicaName',
      'replicaStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const checkpointSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'checkpointScope',
      'checkpointName',
      'checkpointStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'checkpointPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT|' + dateKey;

  if (sciipSheetBusinessKeyExists_(checkpointSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryCheckpointsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTRY_REPLICA',
      processorRegistryCheckpointsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const checkpointPayload = {
    checkpointType: 'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT',
    checkpointFromBusinessKey: sourceRecord.businessKey || '',
    registeredProcessorCount: sourceRecord.registeredProcessorCount || 0,
    validatedProcessorCount: sourceRecord.validatedProcessorCount || 0,
    trackCount: sourceRecord.trackCount || 0,
    latestRegistryLedgerBusinessKey:
      sourceRecord.latestRegistryLedgerBusinessKey || '',
    checkpointedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.replicaStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  checkpointSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.replicaStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Checkpoint',
    'CHECKPOINTED',
    sourceRecord.registeredProcessorCount || 0,
    sourceRecord.validatedProcessorCount || 0,
    sourceRecord.trackCount || 0,
    sourceRecord.latestRegistryLedgerBusinessKey || '',
    JSON.stringify(checkpointPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryCheckpointsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2160_ProcessorRegistryCheckpoint() {
  const result = sciipRun2160_ProcessorRegistryCheckpoint();

  Logger.log(JSON.stringify({
    test: 'sciipTest2160_ProcessorRegistryCheckpoint',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2170 Processor Registry Checkpoint Ledger
 ************************************************************/

function sciipRun2170_ProcessorRegistryCheckpointLedger() {
  const processor = '2170_ProcessorRegistryCheckpointLedger';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'checkpointScope',
      'checkpointName',
      'checkpointStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'checkpointPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'checkpointLedgerScope',
      'checkpointLedgerName',
      'checkpointLedgerStatus',
      'ledgeredCheckpointBusinessKey',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'checkpointLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT_LEDGER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryCheckpointLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTRY_CHECKPOINT',
      processorRegistryCheckpointLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT_LEDGER',
    ledgeredCheckpointBusinessKey: sourceRecord.businessKey || '',
    registeredProcessorCount: sourceRecord.registeredProcessorCount || 0,
    validatedProcessorCount: sourceRecord.validatedProcessorCount || 0,
    trackCount: sourceRecord.trackCount || 0,
    latestRegistryLedgerBusinessKey:
      sourceRecord.latestRegistryLedgerBusinessKey || '',
    ledgeredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.checkpointStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.checkpointStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Checkpoint Ledger',
    'LEDGERED',
    sourceRecord.businessKey || '',
    sourceRecord.registeredProcessorCount || 0,
    sourceRecord.validatedProcessorCount || 0,
    sourceRecord.trackCount || 0,
    sourceRecord.latestRegistryLedgerBusinessKey || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryCheckpointLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2170_ProcessorRegistryCheckpointLedger() {
  const result = sciipRun2170_ProcessorRegistryCheckpointLedger();

  Logger.log(JSON.stringify({
    test: 'sciipTest2170_ProcessorRegistryCheckpointLedger',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2110 Processor Registry Ledger
 ************************************************************/

function sciipRun2110_ProcessorRegistryLedger() {
  const processor = '2110_ProcessorRegistryLedger';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'registryKey',
      'processorNumber',
      'processorFunction',
      'testFunction',
      'inputSheet',
      'outputSheet',
      'status',
      'track',
      'version',
      'registryPayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_LEDGER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(sheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const registeredProcessors = sciipListRegisteredProcessors_();

  if (!registeredProcessors || registeredProcessors.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTERED_PROCESSORS',
      processorRegistryLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  registeredProcessors.forEach(function(item) {
    const payload = {
      registryKey: item.registryKey,
      processorNumber: item.processorNumber,
      processorFunction: item.processorFunction,
      testFunction: item.testFunction,
      inputSheet: item.inputSheet,
      outputSheet: item.outputSheet,
      status: item.status,
      track: item.track,
      version: item.version,
      ledgeredAt: now.toISOString()
    };

    sheet.appendRow([
      businessKey,
      dateKey,
      processor,
      item.registryKey,
      item.processorNumber,
      item.processorFunction,
      item.testFunction,
      item.inputSheet,
      item.outputSheet,
      item.status,
      item.track,
      item.version,
      JSON.stringify(payload),
      now.toISOString()
    ]);
  });

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryLedgerEntriesCreated: registeredProcessors.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2110_ProcessorRegistryLedger() {
  const result = sciipRun2110_ProcessorRegistryLedger();

  Logger.log(JSON.stringify({
    test: 'sciipTest2110_ProcessorRegistryLedger',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2140 Processor Registry Mirror
 ************************************************************/

function sciipRun2140_ProcessorRegistryMirror() {
  const processor = '2140_ProcessorRegistryMirror';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'snapshotScope',
      'snapshotName',
      'snapshotStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const mirrorSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_MIRROR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'mirrorScope',
      'mirrorName',
      'mirrorStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'mirrorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_MIRROR|' + dateKey;

  if (sciipSheetBusinessKeyExists_(mirrorSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryMirrorsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTRY_SNAPSHOT',
      processorRegistryMirrorsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const mirrorPayload = {
    mirrorType: 'SCIIP_PROCESSOR_REGISTRY_MIRROR',
    mirroredFromBusinessKey: sourceRecord.businessKey || '',
    registeredProcessorCount: sourceRecord.registeredProcessorCount || 0,
    validatedProcessorCount: sourceRecord.validatedProcessorCount || 0,
    trackCount: sourceRecord.trackCount || 0,
    latestRegistryLedgerBusinessKey:
      sourceRecord.latestRegistryLedgerBusinessKey || '',
    mirroredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.snapshotStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  mirrorSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.snapshotStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Mirror',
    'MIRRORED',
    sourceRecord.registeredProcessorCount || 0,
    sourceRecord.validatedProcessorCount || 0,
    sourceRecord.trackCount || 0,
    sourceRecord.latestRegistryLedgerBusinessKey || '',
    JSON.stringify(mirrorPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryMirrorsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2140_ProcessorRegistryMirror() {
  const result = sciipRun2140_ProcessorRegistryMirror();

  Logger.log(JSON.stringify({
    test: 'sciipTest2140_ProcessorRegistryMirror',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2150 Processor Registry Replica
 ************************************************************/

function sciipRun2150_ProcessorRegistryReplica() {
  const processor = '2150_ProcessorRegistryReplica';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_MIRROR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'mirrorScope',
      'mirrorName',
      'mirrorStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'mirrorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const replicaSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'replicaScope',
      'replicaName',
      'replicaStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_REPLICA|' + dateKey;

  if (sciipSheetBusinessKeyExists_(replicaSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryReplicasCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTRY_MIRROR',
      processorRegistryReplicasCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const replicaPayload = {
    replicaType: 'SCIIP_PROCESSOR_REGISTRY_REPLICA',
    replicatedFromBusinessKey: sourceRecord.businessKey || '',
    registeredProcessorCount: sourceRecord.registeredProcessorCount || 0,
    validatedProcessorCount: sourceRecord.validatedProcessorCount || 0,
    trackCount: sourceRecord.trackCount || 0,
    latestRegistryLedgerBusinessKey:
      sourceRecord.latestRegistryLedgerBusinessKey || '',
    replicatedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.mirrorStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  replicaSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.mirrorStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Replica',
    'REPLICATED',
    sourceRecord.registeredProcessorCount || 0,
    sourceRecord.validatedProcessorCount || 0,
    sourceRecord.trackCount || 0,
    sourceRecord.latestRegistryLedgerBusinessKey || '',
    JSON.stringify(replicaPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryReplicasCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2150_ProcessorRegistryReplica() {
  const result = sciipRun2150_ProcessorRegistryReplica();

  Logger.log(JSON.stringify({
    test: 'sciipTest2150_ProcessorRegistryReplica',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2130 Processor Registry Snapshot
 ************************************************************/

function sciipRun2130_ProcessorRegistrySnapshot() {
  const processor = '2130_ProcessorRegistrySnapshot';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'indexScope',
      'indexName',
      'indexStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'indexPayloadJson',
      'createdAt'
    ]
  );

  const snapshotSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'snapshotScope',
      'snapshotName',
      'snapshotStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_SNAPSHOT|' + dateKey;

  if (sciipSheetBusinessKeyExists_(snapshotSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistrySnapshotsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTRY_INDEX',
      processorRegistrySnapshotsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const snapshotPayload = {
    snapshotType: 'SCIIP_PROCESSOR_REGISTRY_SNAPSHOT',
    registeredProcessorCount: sourceRecord.registeredProcessorCount || 0,
    validatedProcessorCount: sourceRecord.validatedProcessorCount || 0,
    trackCount: sourceRecord.trackCount || 0,
    latestRegistryLedgerBusinessKey:
      sourceRecord.latestRegistryLedgerBusinessKey || '',
    snapshotAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.indexStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  snapshotSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.indexStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Snapshot',
    'SNAPSHOTTED',
    sourceRecord.registeredProcessorCount || 0,
    sourceRecord.validatedProcessorCount || 0,
    sourceRecord.trackCount || 0,
    sourceRecord.latestRegistryLedgerBusinessKey || '',
    JSON.stringify(snapshotPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistrySnapshotsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2130_ProcessorRegistrySnapshot() {
  const result = sciipRun2130_ProcessorRegistrySnapshot();

  Logger.log(JSON.stringify({
    test: 'sciipTest2130_ProcessorRegistrySnapshot',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1
 * 2180 Processor Registry Validation
 ************************************************************/

function sciipRun2180_ProcessorRegistryValidation() {
  const processor = '2180_ProcessorRegistryValidation';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'checkpointLedgerScope',
      'checkpointLedgerName',
      'checkpointLedgerStatus',
      'ledgeredCheckpointBusinessKey',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'checkpointLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const validationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_VALIDATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'validationScope',
      'validationName',
      'validationStatus',
      'validationResult',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'validationFinding',
      'validationRecommendation',
      'validationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_VALIDATION|' + dateKey;

  if (sciipSheetBusinessKeyExists_(validationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryValidationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTRY_CHECKPOINT_LEDGER',
      processorRegistryValidationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const registeredProcessorCount =
    Number(sourceRecord.registeredProcessorCount || 0);

  const validatedProcessorCount =
    Number(sourceRecord.validatedProcessorCount || 0);

  const trackCount =
    Number(sourceRecord.trackCount || 0);

  const validationResult =
    registeredProcessorCount > 0 &&
    validatedProcessorCount === registeredProcessorCount
      ? 'VALIDATED'
      : 'VALIDATION_ATTENTION_REQUIRED';

  const validationFinding =
    validationResult === 'VALIDATED'
      ? 'Processor registry checkpoint ledger confirms all registered processors are validated.'
      : 'Processor registry checkpoint ledger indicates one or more registered processors are not validated.';

  const validationRecommendation =
    validationResult === 'VALIDATED'
      ? 'Continue using the registry as the authoritative processor inventory for SCIIP_OS framework orchestration.'
      : 'Review processor registry records and update validation status before enabling automated orchestration.';

  const now = new Date();

  const validationPayload = {
    validationType: 'SCIIP_PROCESSOR_REGISTRY_VALIDATION',
    registeredProcessorCount: registeredProcessorCount,
    validatedProcessorCount: validatedProcessorCount,
    trackCount: trackCount,
    validationResult: validationResult,
    validationFinding: validationFinding,
    validationRecommendation: validationRecommendation,
    sourceCheckpointLedgerBusinessKey: sourceRecord.businessKey || '',
    validatedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.checkpointLedgerStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  validationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.checkpointLedgerStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Validation',
    validationResult,
    validationResult,
    registeredProcessorCount,
    validatedProcessorCount,
    trackCount,
    validationFinding,
    validationRecommendation,
    JSON.stringify(validationPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryValidationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    validationResult,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2180_ProcessorRegistryValidation() {
  const result = sciipRun2180_ProcessorRegistryValidation();

  Logger.log(JSON.stringify({
    test: 'sciipTest2180_ProcessorRegistryValidation',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2340 Regression Test Harness
 ************************************************************/

function sciipRun2340_RegressionTestHarness() {
  const processor = '2340_RegressionTestHarness';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_METRICS_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'metricsScope',
      'metricsName',
      'metricsStatus',
      'runtimeHealthStatus',
      'runtimeHealthScore',
      'throughputScore',
      'reliabilityScore',
      'availabilityScore',
      'overallRuntimeScore',
      'metricsPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const harnessSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_REGRESSION_TEST_HARNESS',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'harnessScope',
      'harnessName',
      'harnessStatus',
      'harnessResult',
      'registeredTestCount',
      'executableTestCount',
      'missingTestCount',
      'testHarnessMode',
      'registeredTestsJson',
      'missingTestsJson',
      'harnessPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_REGRESSION_TEST_HARNESS|' + dateKey;

  if (sciipSheetBusinessKeyExists_(harnessSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      regressionTestHarnessesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_RUNTIME_METRICS_INDEX',
      regressionTestHarnessesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const registry = sciipListRegisteredProcessors_();

  const registeredTests = [];
  const missingTests = [];

  registry.forEach(function(item) {
    const testFunction = item.testFunction || '';

    if (testFunction && typeof globalThis[testFunction] === 'function') {
      registeredTests.push({
        registryKey: item.registryKey,
        processorNumber: item.processorNumber,
        testFunction: testFunction,
        processorFunction: item.processorFunction,
        status: 'TEST_AVAILABLE'
      });
    } else {
      missingTests.push({
        registryKey: item.registryKey,
        processorNumber: item.processorNumber,
        testFunction: testFunction,
        processorFunction: item.processorFunction,
        status: 'TEST_MISSING'
      });
    }
  });

  const registeredTestCount = registry.length;
  const executableTestCount = registeredTests.length;
  const missingTestCount = missingTests.length;

  const harnessStatus =
    missingTestCount === 0 ? 'READY' : 'ATTENTION_REQUIRED';

  const harnessResult =
    missingTestCount === 0
      ? 'REGRESSION_TEST_HARNESS_READY'
      : 'REGRESSION_TESTS_MISSING';

  const now = new Date();

  const harnessPayload = {
    harnessType: 'SCIIP_REGRESSION_TEST_HARNESS',
    sourceRuntimeMetricsIndexBusinessKey: sourceRecord.businessKey || '',
    registeredTestCount,
    executableTestCount,
    missingTestCount,
    testHarnessMode: 'DISCOVERY_ONLY',
    registeredTests,
    missingTests,
    harnessStatus,
    harnessResult,
    createdAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.metricsStatus || '',
    overallRuntimeScore: sourceRecord.overallRuntimeScore || '',
    createdAt: sourceRecord.createdAt || ''
  };

  harnessSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.metricsStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Regression Test Harness',
    harnessStatus,
    harnessResult,
    registeredTestCount,
    executableTestCount,
    missingTestCount,
    'DISCOVERY_ONLY',
    JSON.stringify(registeredTests),
    JSON.stringify(missingTests),
    JSON.stringify(harnessPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    regressionTestHarnessesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    harnessStatus,
    executableTestCount,
    missingTestCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2340_RegressionTestHarness() {
  const result = sciipRun2340_RegressionTestHarness();

  Logger.log(JSON.stringify({
    test: 'sciipTest2340_RegressionTestHarness',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2310 Retry Policy Engine
 ************************************************************/

function sciipRun2310_RetryPolicyEngine() {
  const processor = '2310_RetryPolicyEngine';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_ERROR_HANDLER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'errorScope',
      'errorHandlerName',
      'errorHandlerStatus',
      'errorHandlerResult',
      'runtimeStatus',
      'runtimeResult',
      'failedProcessorCount',
      'skippedProcessorCount',
      'detectedErrorCount',
      'detectedErrorsJson',
      'errorHandlerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const retrySheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RETRY_POLICY_ENGINE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'retryScope',
      'retryPolicyName',
      'retryPolicyStatus',
      'retryPolicyResult',
      'detectedErrorCount',
      'retryEligibleCount',
      'retryBlockedCount',
      'maxRetryAttempts',
      'retryBackoffStrategy',
      'retryEligibleProcessorsJson',
      'retryBlockedProcessorsJson',
      'retryPolicyPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RETRY_POLICY_ENGINE|' + dateKey;

  if (sciipSheetBusinessKeyExists_(retrySheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      retryPolicyEnginesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_RUNTIME_ERROR_HANDLER',
      retryPolicyEnginesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let detectedErrors = [];

  try {
    detectedErrors = JSON.parse(sourceRecord.detectedErrorsJson || '[]');
  } catch (err) {
    detectedErrors = [];
  }

  const maxRetryAttempts = 3;
  const retryBackoffStrategy = 'EXPONENTIAL_BACKOFF';

  const retryEligibleProcessors = [];
  const retryBlockedProcessors = [];

  detectedErrors.forEach(function(item) {
    const status = String(item.status || '').toUpperCase();

    if (status === 'FAILED') {
      retryEligibleProcessors.push({
        registryKey: item.registryKey || '',
        processorNumber: item.processorNumber || '',
        processorFunction: item.processorFunction || '',
        status: item.status || '',
        retryReason: item.errorMessage || 'Processor failed during runtime execution.',
        maxRetryAttempts: maxRetryAttempts,
        retryBackoffStrategy: retryBackoffStrategy
      });
    } else {
      retryBlockedProcessors.push({
        registryKey: item.registryKey || '',
        processorNumber: item.processorNumber || '',
        processorFunction: item.processorFunction || '',
        status: item.status || '',
        blockedReason: 'Processor is not eligible for automatic retry under current policy.'
      });
    }
  });

  const detectedErrorCount = Number(sourceRecord.detectedErrorCount || detectedErrors.length);
  const retryEligibleCount = retryEligibleProcessors.length;
  const retryBlockedCount = retryBlockedProcessors.length;

  let retryPolicyStatus = 'NO_RETRY_REQUIRED';
  let retryPolicyResult = 'NO_ERRORS_ELIGIBLE_FOR_RETRY';

  if (retryEligibleCount > 0) {
    retryPolicyStatus = 'RETRY_READY';
    retryPolicyResult = 'RETRY_ELIGIBLE_PROCESSORS_IDENTIFIED';
  } else if (retryBlockedCount > 0) {
    retryPolicyStatus = 'RETRY_BLOCKED';
    retryPolicyResult = 'ERRORS_NOT_ELIGIBLE_FOR_AUTOMATIC_RETRY';
  }

  const now = new Date();

  const retryPolicyPayload = {
    retryPolicyType: 'SCIIP_RETRY_POLICY_ENGINE',
    sourceRuntimeErrorHandlerBusinessKey: sourceRecord.businessKey || '',
    detectedErrorCount,
    retryEligibleCount,
    retryBlockedCount,
    maxRetryAttempts,
    retryBackoffStrategy,
    retryEligibleProcessors,
    retryBlockedProcessors,
    retryPolicyStatus,
    retryPolicyResult,
    evaluatedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.errorHandlerStatus || '',
    errorHandlerResult: sourceRecord.errorHandlerResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  retrySheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.errorHandlerStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Retry Policy Engine',
    retryPolicyStatus,
    retryPolicyResult,
    detectedErrorCount,
    retryEligibleCount,
    retryBlockedCount,
    maxRetryAttempts,
    retryBackoffStrategy,
    JSON.stringify(retryEligibleProcessors),
    JSON.stringify(retryBlockedProcessors),
    JSON.stringify(retryPolicyPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    retryPolicyEnginesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    retryPolicyStatus,
    retryEligibleCount,
    retryBlockedCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2310_RetryPolicyEngine() {
  const result = sciipRun2310_RetryPolicyEngine();

  Logger.log(JSON.stringify({
    test: 'sciipTest2310_RetryPolicyEngine',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.0
 * Sheet Name Alias Registry
 ************************************************************/

function sciipResolveSheetName_(sheetNameOrAlias) {
  const aliases = {
    ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW',

    ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER'
  };

  return aliases[sheetNameOrAlias] || sheetNameOrAlias;
}

function sciipEnsureSheetWithHeadersByAlias_(ss, sheetNameOrAlias, headers) {
  return sciipEnsureSheetWithHeaders_(
    ss,
    sciipResolveSheetName_(sheetNameOrAlias),
    headers
  );
}

/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Sheets.gs
========================================================== */

function sciipGetActiveSpreadsheet() {
  if (
    typeof SCIIP !== 'undefined' &&
    SCIIP.SPREADSHEET_ID
  ) {
    return SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();

  if (active) {
    return active;
  }

  throw new Error(
    'No spreadsheet available. Add SCIIP.SPREADSHEET_ID in SCIIP_CONFIG.gs.'
  );
}

function sciipGetSheet(sheetName) {
  const ss = sciipGetActiveSpreadsheet();
  return ss.getSheetByName(sheetName);
}

function sciipGetOrCreateSheet(sheetName) {
  const ss = sciipGetActiveSpreadsheet();
  return ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
}

function sciipGetSheetValues(sheetName) {
  const sheet = sciipGetSheet(sheetName);
  if (!sheet) return [];
  const range = sheet.getDataRange();
  return range.getNumRows() ? range.getValues() : [];
}

function sciipGetHeaderMap(sheet) {
  const values = sheet.getDataRange().getValues();
  if (!values.length) return {};

  const headers = values[0];
  const map = {};

  headers.forEach(function(header, index) {
    map[sciipNormalizeToken(header)] = index;
  });

  return map;
}

function sciipAppendRow(sheetName, row) {
  const sheet = sciipGetOrCreateSheet(sheetName);
  sheet.appendRow(row);
  return row;
}

/**
 * Returns all records from a sheet as an array of objects.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @return {Object[]}
 */
function sciipGetSheetRecords_(sheet) {

  if (!sheet) {
    return [];
  }

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];

  return values.slice(1).map(function(row) {

    const record = {};

    headers.forEach(function(header, i) {
      record[header] = row[i];
    });

    return record;

  });

}

/************************************************************
 * SCIIP_OS v4.1
 * SCIIP_SystemContinuityCommon
 *
 * Shared continuity utilities for processors 1590+
 ************************************************************/

function sciipNormalizeProcessingDateKey_() {
  let processingDate = sciipResolveLatestProcessingDate_();
  let dateKey = '';

  if (processingDate instanceof Date && !isNaN(processingDate.getTime())) {
    dateKey = sciipFormatDateKey_(processingDate);
  } else if (processingDate) {
    const parsedDate = new Date(processingDate);

    if (!isNaN(parsedDate.getTime())) {
      dateKey = sciipFormatDateKey_(parsedDate);
    }
  }

  if (!dateKey || dateKey === '1969-12-31' || dateKey === '1970-01-01') {
    dateKey = '2026-06-25';
  }

  return dateKey;
}

function sciipSheetBusinessKeyExists_(sheet, businessKey) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return false;
  }

  const headers = values[0];
  const businessKeyIndex = headers.indexOf('businessKey');

  if (businessKeyIndex === -1) {
    return false;
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][businessKeyIndex]) === String(businessKey)) {
      return true;
    }
  }

  return false;
}

function sciipEnsureSheetWithHeaders_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function sciipLatestRecordFromSheet_(sheet) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const latestRow = values[values.length - 1];

  const record = {};

  headers.forEach(function(header, index) {
    record[header] = latestRow[index];
  });

  return record;
}

/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Strings.gs
========================================================== */

function sciipString(value) {
  return value === null || value === undefined ? '' : String(value);
}

function sciipTrim(value) {
  return sciipString(value).trim();
}

function sciipUpper(value) {
  return sciipTrim(value).toUpperCase();
}

function sciipLower(value) {
  return sciipTrim(value).toLowerCase();
}

function sciipNormalizeWhitespace(value) {
  return sciipTrim(value).replace(/\s+/g, ' ');
}

function sciipNormalizeToken(value) {
  return sciipUpper(value)
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function sciipIsBlank(value) {
  return sciipTrim(value) === '';
}

function sciipCoalesce() {
  for (let i = 0; i < arguments.length; i++) {
    if (!sciipIsBlank(arguments[i])) return arguments[i];
  }
  return '';
}

/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Utilities.gs
========================================================== */

function sciipUuid() {
  return Utilities.getUuid();
}

function sciipHash(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    sciipString(value)
  );

  return bytes.map(function(byte) {
    const v = (byte < 0 ? byte + 256 : byte).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function sciipObjectClone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

function sciipSafeJson(value) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function sciipRequire(value, message) {
  if (sciipIsBlank(value)) {
    throw new Error(message || 'Required value is missing.');
  }
  return value;
}

/**
 * SCIIP Spreadsheet Resolver
 */

function sciipGetSpreadsheet_() {
  if (typeof SCIIP_SPREADSHEET_ID !== 'undefined' && SCIIP_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SCIIP_SPREADSHEET_ID);
  }

  const propertySpreadsheetId =
    PropertiesService.getScriptProperties()
      .getProperty('SCIIP_SPREADSHEET_ID');

  if (propertySpreadsheetId) {
    return SpreadsheetApp.openById(propertySpreadsheetId);
  }

  throw new Error('SCIIP_SPREADSHEET_ID not configured.');
}

function sciipResolveLatestProcessingDate_(sheetName, dateColumnName) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) return null;

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) return null;

  const headers = values[0];
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) return null;

  const dates = values
    .slice(1)
    .map(row => row[dateIndex])
    .filter(String)
    .map(value => {
      if (value instanceof Date) {
        return sciipFormatDateKey_(value);
      }
      return String(value).trim();
    })
    .filter(String);

  if (!dates.length) return null;

  dates.sort();

  return dates[dates.length - 1];
}

function sciipFormatDateKey_(date) {
  if (!date) return '';

  if (Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return String(date).trim();
}

function sciipBusinessKeyPrefixExists_(sheet, businessKeyPrefix) {
  if (!sheet || !businessKeyPrefix) return false;

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return false;

  const headers = values[0].map(function(header) {
    return String(header).trim();
  });

  const businessKeyIndex = headers.indexOf('Business_Key');
  if (businessKeyIndex === -1) return false;

  return values.slice(1).some(function(row) {
    const key = String(row[businessKeyIndex] || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}