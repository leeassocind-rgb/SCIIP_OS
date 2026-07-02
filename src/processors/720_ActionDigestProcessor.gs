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
