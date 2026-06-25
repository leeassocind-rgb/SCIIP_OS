/************************************************************
 * 720_ActionDigestProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - ACTION_QUEUE
 *
 * Output:
 * - ACTION_DIGESTS
 ************************************************************/

const ACTION_DIGESTS_SHEET =
  'ACTION_DIGESTS';

const ACTION_DIGESTS_HEADERS = [
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

function sciipEnsureActionDigestsSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(ACTION_DIGESTS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(ACTION_DIGESTS_SHEET);
  }

  sheet.getRange(1, 1, 1, ACTION_DIGESTS_HEADERS.length)
    .setValues([ACTION_DIGESTS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunActionDigestProcessor() {
  const processor = '720_ActionDigestProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureActionDigestsSchema();

  const digestDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `ACTION_DIGEST|${digestDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      actionDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const actionItems = sciipGetRecordsByDate_(
    'ACTION_QUEUE',
    'Queue_Date',
    digestDate
  );

  if (actionItems.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      actionsReviewed: 0,
      actionDigestsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const digest =
    sciipCreateActionDigest_({
      businessKey,
      digestDate,
      actionItems,
      processor
    });

  outputSheet.appendRow(digest);

  const result = {
    processor,
    status: 'SUCCESS',
    actionsReviewed: actionItems.length,
    actionDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateActionDigest_(args) {
  const now = new Date();

  const profile =
    sciipInferActionDigestProfile_(args.actionItems);

  return [
    sciipGenerateId_('ADG'),
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

function sciipInferActionDigestProfile_(actionItems) {
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

  actionItems.forEach(item => {
    const priority = String(
      sciipExtractFirstAvailable_(item, ['Priority'])
    ).toUpperCase();

    const dueStatus = String(
      sciipExtractFirstAvailable_(item, ['Due_Status'])
    ).toUpperCase();

    const actionType = String(
      sciipExtractFirstAvailable_(item, ['Action_Item_Type'])
    ).toUpperCase();

    const title = sciipExtractFirstAvailable_(item, [
      'Action_Title'
    ]);

    const objective = sciipExtractFirstAvailable_(item, [
      'Action_Objective'
    ]);

    if (priority === 'HIGH') highPriorityCount++;
    else if (priority === 'LOW') lowPriorityCount++;
    else mediumPriorityCount++;

    if (dueStatus === 'DUE_NOW') dueNowCount++;

    if (actionType.includes('OPERATOR')) operatorReviewCount++;
    if (actionType.includes('RISK')) riskActionCount++;
    if (actionType.includes('OPPORTUNITY')) opportunityActionCount++;
    if (actionType.includes('PROPERTY')) propertyActionCount++;
    if (actionType.includes('COMPANY')) companyActionCount++;
    if (actionType.includes('SYSTEM')) systemActionCount++;

    if (
      priority === 'HIGH' ||
      dueStatus === 'DUE_NOW' ||
      actionType.includes('RISK') ||
      actionType.includes('OPPORTUNITY') ||
      actionType.includes('OPERATOR')
    ) {
      topItems.push(
        `- ${title || actionType}: ${objective || 'No objective recorded.'}`
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
    `SCIIP reviewed ${actionItems.length} queued action item(s).`,
    `Priority mix: ${highPriorityCount} high, ${mediumPriorityCount} medium, ${lowPriorityCount} low.`,
    `Due now: ${dueNowCount}.`,
    `Workflow mix: ${operatorReviewCount} operator review, ${riskActionCount} risk, ${opportunityActionCount} opportunity, ${propertyActionCount} property, ${companyActionCount} company, ${systemActionCount} system.`,
    '',
    'Top action items:',
    topItems.length ? topItems.join('\n') : '- No high-priority action items identified.'
  ].join('\n');

  return {
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,
    dueNowCount,
    operatorReviewCount,
    riskActionCount,
    opportunityActionCount,
    propertyActionCount,
    companyActionCount,
    systemActionCount,
    digestTitle,
    digestSummary,
    topActionFocus,
    recommendedOperatorResponse
  };
}

function sciipTestActionDigestProcessor() {
  const result =
    sciipRunActionDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionDigestProcessor',
    result
  }));

  return result;
}