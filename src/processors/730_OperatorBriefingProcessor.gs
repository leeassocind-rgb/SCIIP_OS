/************************************************************
 * 730_OperatorBriefingProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - ACTION_DIGESTS
 *
 * Output:
 * - OPERATOR_BRIEFINGS
 ************************************************************/

const OPERATOR_BRIEFINGS_SHEET =
  'OPERATOR_BRIEFINGS';

const OPERATOR_BRIEFINGS_HEADERS = [
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

function sciipEnsureOperatorBriefingsSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(OPERATOR_BRIEFINGS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(OPERATOR_BRIEFINGS_SHEET);
  }

  sheet.getRange(1, 1, 1, OPERATOR_BRIEFINGS_HEADERS.length)
    .setValues([OPERATOR_BRIEFINGS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunOperatorBriefingProcessor() {
  const processor = '730_OperatorBriefingProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureOperatorBriefingsSchema();

  const briefingDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `OPERATOR_BRIEFING|${briefingDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      operatorBriefingsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const actionDigests = sciipGetRecordsByDate_(
    'ACTION_DIGESTS',
    'Digest_Date',
    briefingDate
  );

  if (actionDigests.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      actionDigestsReviewed: 0,
      operatorBriefingsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const briefing =
    sciipCreateOperatorBriefing_({
      businessKey,
      briefingDate,
      actionDigest: actionDigests[0],
      processor
    });

  outputSheet.appendRow(briefing);

  const result = {
    processor,
    status: 'SUCCESS',
    actionDigestsReviewed: actionDigests.length,
    operatorBriefingsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateOperatorBriefing_(args) {
  const now = new Date();

  const digest = args.actionDigest;

  const actionDigestId = sciipExtractFirstAvailable_(digest, [
    'Action_Digest_ID'
  ]);

  const profile =
    sciipInferOperatorBriefingProfile_(digest);

  return [
    sciipGenerateId_('OBR'),
    args.businessKey,
    args.briefingDate,
    actionDigestId,
    sciipExtractFirstAvailable_(digest, ['Actions_Reviewed']),
    sciipExtractFirstAvailable_(digest, ['High_Priority_Count']),
    sciipExtractFirstAvailable_(digest, ['Due_Now_Count']),
    sciipExtractFirstAvailable_(digest, ['Operator_Review_Count']),
    sciipExtractFirstAvailable_(digest, ['Risk_Action_Count']),
    sciipExtractFirstAvailable_(digest, ['Opportunity_Action_Count']),
    profile.briefingTitle,
    profile.executiveBrief,
    profile.priorityAssessment,
    profile.operatorDecisionFocus,
    profile.recommendedOperatingPosture,
    profile.commandCenterMessage,
    profile.nextBestAction,
    'GENERATED',
    `ACTION_DIGESTS:${actionDigestId}`,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferOperatorBriefingProfile_(digest) {
  const actionsReviewed = Number(
    sciipExtractFirstAvailable_(digest, ['Actions_Reviewed']) || 0
  );

  const highPriorityCount = Number(
    sciipExtractFirstAvailable_(digest, ['High_Priority_Count']) || 0
  );

  const dueNowCount = Number(
    sciipExtractFirstAvailable_(digest, ['Due_Now_Count']) || 0
  );

  const operatorReviewCount = Number(
    sciipExtractFirstAvailable_(digest, ['Operator_Review_Count']) || 0
  );

  const riskActionCount = Number(
    sciipExtractFirstAvailable_(digest, ['Risk_Action_Count']) || 0
  );

  const opportunityActionCount = Number(
    sciipExtractFirstAvailable_(digest, ['Opportunity_Action_Count']) || 0
  );

  const digestTitle = sciipExtractFirstAvailable_(digest, [
    'Digest_Title'
  ]);

  const digestSummary = sciipExtractFirstAvailable_(digest, [
    'Digest_Summary'
  ]);

  const topActionFocus = sciipExtractFirstAvailable_(digest, [
    'Top_Action_Focus'
  ]);

  const recommendedOperatorResponse = sciipExtractFirstAvailable_(digest, [
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
      `${highPriorityCount} high-priority action(s) and ${dueNowCount} due-now action(s) require attention.`;
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
    `SCIIP reviewed ${actionsReviewed} action item(s) from the daily action digest.`,
    `High-priority: ${highPriorityCount}. Due now: ${dueNowCount}. Operator review: ${operatorReviewCount}.`,
    `Risk actions: ${riskActionCount}. Opportunity actions: ${opportunityActionCount}.`,
    '',
    `Digest focus: ${topActionFocus || 'No focus recorded.'}`,
    '',
    `Recommended response: ${recommendedOperatorResponse || 'No response recorded.'}`,
    '',
    `Digest summary:\n${digestSummary || 'No digest summary recorded.'}`
  ].join('\n');

  commandCenterMessage = [
    commandCenterMessage,
    `Operating posture: ${recommendedOperatingPosture}.`,
    `Decision focus: ${operatorDecisionFocus}`,
    `Next best action: ${nextBestAction}`
  ].join('\n');

  return {
    briefingTitle,
    executiveBrief,
    priorityAssessment,
    operatorDecisionFocus,
    recommendedOperatingPosture,
    commandCenterMessage,
    nextBestAction
  };
}

function sciipTestOperatorBriefingProcessor() {
  const result =
    sciipRunOperatorBriefingProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestOperatorBriefingProcessor',
    result
  }));

  return result;
}