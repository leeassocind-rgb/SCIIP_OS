/************************************************************
 * 750_AutonomousOpsDigestProcessor
 * SCIIP_OS v4.1
 *
 * Inputs:
 * - COMMAND_CENTER_UPDATES
 * - ACTION_DIGESTS
 * - PREDICTIVE_SCENARIOS
 * - AUTONOMOUS_REASONING
 * - STRATEGIC_MEMORY
 * - VALIDATED_LEARNINGS
 *
 * Output:
 * - AUTONOMOUS_OPS_DIGEST
 ************************************************************/

const AUTONOMOUS_OPS_DIGEST_SHEET =
  'AUTONOMOUS_OPS_DIGEST';

const AUTONOMOUS_OPS_DIGEST_HEADERS = [
  'Ops_Digest_ID',
  'Business_Key',
  'Digest_Date',
  'Command_Update_ID',
  'Command_Status',
  'Recommended_Operating_Posture',
  'Actions_Reviewed',
  'Scenarios_Count',
  'Reasoning_Count',
  'Strategic_Memory_Count',
  'Validated_Learning_Count',
  'Ops_Digest_Title',
  'Ops_Status',
  'Autonomous_Loop_Summary',
  'Command_Center_Summary',
  'Learning_Summary',
  'Scenario_Summary',
  'Action_Summary',
  'Recommended_Operating_Response',
  'Next_Autonomous_Focus',
  'Digest_Status',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousOpsDigestSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_OPS_DIGEST_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_OPS_DIGEST_SHEET);
  }

  sheet.getRange(1, 1, 1, AUTONOMOUS_OPS_DIGEST_HEADERS.length)
    .setValues([AUTONOMOUS_OPS_DIGEST_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunAutonomousOpsDigestProcessor() {
  const processor = '750_AutonomousOpsDigestProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureAutonomousOpsDigestSchema();

  const digestDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `AUTONOMOUS_OPS_DIGEST|${digestDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousOpsDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const commandUpdates = sciipGetRecordsByDate_(
    'COMMAND_CENTER_UPDATES',
    'Update_Date',
    digestDate
  );

  const actionDigests = sciipGetRecordsByDate_(
    'ACTION_DIGESTS',
    'Digest_Date',
    digestDate
  );

  const scenarios = sciipGetRecordsByDate_(
    'PREDICTIVE_SCENARIOS',
    'Scenario_Date',
    digestDate
  );

  const reasoningOutputs = sciipGetRecordsByDate_(
    'AUTONOMOUS_REASONING',
    'Reasoning_Date',
    digestDate
  );

  const strategicMemory = sciipGetRecordsByDate_(
    'STRATEGIC_MEMORY',
    'Memory_Date',
    digestDate
  );

  const validatedLearnings = sciipGetRecordsByDate_(
    'VALIDATED_LEARNINGS',
    'Learning_Date',
    digestDate
  );

  if (
    commandUpdates.length === 0 &&
    actionDigests.length === 0 &&
    scenarios.length === 0 &&
    reasoningOutputs.length === 0 &&
    strategicMemory.length === 0 &&
    validatedLearnings.length === 0
  ) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousOpsDigestsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const digest =
    sciipCreateAutonomousOpsDigest_({
      businessKey,
      digestDate,
      commandUpdate: commandUpdates[0] || null,
      actionDigest: actionDigests[0] || null,
      scenarios,
      reasoningOutputs,
      strategicMemory,
      validatedLearnings,
      processor
    });

  outputSheet.appendRow(digest);

  const result = {
    processor,
    status: 'SUCCESS',
    commandUpdatesReviewed: commandUpdates.length,
    actionDigestsReviewed: actionDigests.length,
    scenariosReviewed: scenarios.length,
    reasoningOutputsReviewed: reasoningOutputs.length,
    strategicMemoryReviewed: strategicMemory.length,
    validatedLearningsReviewed: validatedLearnings.length,
    autonomousOpsDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateAutonomousOpsDigest_(args) {
  const now = new Date();

  const commandUpdateId = args.commandUpdate
    ? sciipExtractFirstAvailable_(args.commandUpdate, ['Command_Update_ID'])
    : '';

  const profile =
    sciipInferAutonomousOpsDigestProfile_(args);

  return [
    sciipGenerateId_('AOD'),
    args.businessKey,
    args.digestDate,
    commandUpdateId,
    profile.commandStatus,
    profile.recommendedOperatingPosture,
    profile.actionsReviewed,
    args.scenarios.length,
    args.reasoningOutputs.length,
    args.strategicMemory.length,
    args.validatedLearnings.length,
    profile.opsDigestTitle,
    profile.opsStatus,
    profile.autonomousLoopSummary,
    profile.commandCenterSummary,
    profile.learningSummary,
    profile.scenarioSummary,
    profile.actionSummary,
    profile.recommendedOperatingResponse,
    profile.nextAutonomousFocus,
    'GENERATED',
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferAutonomousOpsDigestProfile_(args) {
  const commandStatus = args.commandUpdate
    ? sciipExtractFirstAvailable_(args.commandUpdate, ['Command_Status'])
    : 'NO_COMMAND_UPDATE';

  const recommendedOperatingPosture = args.commandUpdate
    ? sciipExtractFirstAvailable_(args.commandUpdate, ['Recommended_Operating_Posture'])
    : 'UNKNOWN';

  const commandMessage = args.commandUpdate
    ? sciipExtractFirstAvailable_(args.commandUpdate, ['Command_Message'])
    : '';

  const primaryFocus = args.commandUpdate
    ? sciipExtractFirstAvailable_(args.commandUpdate, ['Primary_Focus'])
    : '';

  const requiredOperatorAction = args.commandUpdate
    ? sciipExtractFirstAvailable_(args.commandUpdate, ['Required_Operator_Action'])
    : '';

  const actionsReviewed = args.actionDigest
    ? Number(sciipExtractFirstAvailable_(args.actionDigest, ['Actions_Reviewed']) || 0)
    : 0;

  const highPriorityCount = args.actionDigest
    ? Number(sciipExtractFirstAvailable_(args.actionDigest, ['High_Priority_Count']) || 0)
    : 0;

  const dueNowCount = args.actionDigest
    ? Number(sciipExtractFirstAvailable_(args.actionDigest, ['Due_Now_Count']) || 0)
    : 0;

  const operatorReviewCount = args.actionDigest
    ? Number(sciipExtractFirstAvailable_(args.actionDigest, ['Operator_Review_Count']) || 0)
    : 0;

  const riskActionCount = args.actionDigest
    ? Number(sciipExtractFirstAvailable_(args.actionDigest, ['Risk_Action_Count']) || 0)
    : 0;

  const opportunityActionCount = args.actionDigest
    ? Number(sciipExtractFirstAvailable_(args.actionDigest, ['Opportunity_Action_Count']) || 0)
    : 0;

  let opsStatus = 'NORMAL';
  let opsDigestTitle = 'SCIIP Autonomous Operations Digest';
  let recommendedOperatingResponse =
    'Continue normal operations and preserve all generated intelligence, memory, reasoning, scenarios, monitoring signals, action routes, and command updates.';
  let nextAutonomousFocus =
    'Continue strengthening the autonomous intelligence loop through additional validated learning and scenario monitoring.';

  if (
    String(commandStatus).includes('PRIORITY') ||
    highPriorityCount > 0 ||
    dueNowCount > 0
  ) {
    opsStatus = 'PRIORITY_REVIEW';
    opsDigestTitle = 'SCIIP Autonomous Operations Digest — Priority Review';
    recommendedOperatingResponse =
      'Review high-priority and due-now action items first, then resolve operator-review, risk, opportunity, property, company, and system items.';
    nextAutonomousFocus =
      'Prioritize action execution and operator review before additional autonomous escalation.';
  }

  if (
    String(commandStatus).includes('GOVERNANCE') ||
    operatorReviewCount > 0
  ) {
    opsStatus = 'OPERATOR_GOVERNANCE_REQUIRED';
    recommendedOperatingResponse =
      'Resolve operator-review items before SCIIP applies autonomous confidence, weighting, graph, calibration, or processor changes.';
    nextAutonomousFocus =
      'Use operator decisions to improve future autonomous calibration and graph confidence behavior.';
  }

  if (
    String(commandStatus).includes('RISK') ||
    riskActionCount > 0
  ) {
    opsStatus = 'RISK_REVIEW_REQUIRED';
    recommendedOperatingResponse =
      'Review risk actions for severity, affected entities, timing, counterevidence, and mitigation path.';
    nextAutonomousFocus =
      'Strengthen risk monitoring, counterevidence collection, and alert readiness.';
  }

  if (
    String(commandStatus).includes('OPPORTUNITY') ||
    opportunityActionCount > 0
  ) {
    opsStatus = 'OPPORTUNITY_REVIEW_REQUIRED';
    recommendedOperatingResponse =
      'Review opportunity actions for demand, timing, target fit, ownership fit, pricing gap, and actionability.';
    nextAutonomousFocus =
      'Strengthen opportunity monitoring, target validation, and action recommendation readiness.';
  }

  const autonomousLoopSummary = [
    `SCIIP completed a daily autonomous operating loop for ${args.digestDate}.`,
    `Validated learnings: ${args.validatedLearnings.length}.`,
    `Strategic memories consolidated: ${args.strategicMemory.length}.`,
    `Autonomous reasoning outputs: ${args.reasoningOutputs.length}.`,
    `Predictive scenarios generated: ${args.scenarios.length}.`,
    `Actions reviewed: ${actionsReviewed}.`
  ].join('\n');

  const commandCenterSummary = [
    `Command status: ${commandStatus || 'UNKNOWN'}.`,
    `Operating posture: ${recommendedOperatingPosture || 'UNKNOWN'}.`,
    `Primary focus: ${primaryFocus || 'No primary focus recorded.'}`,
    `Required operator action: ${requiredOperatorAction || 'No required operator action recorded.'}`,
    '',
    commandMessage || 'No command center message recorded.'
  ].join('\n');

  const learningSummary = [
    `SCIIP preserved ${args.validatedLearnings.length} validated learning record(s) and ${args.strategicMemory.length} strategic memory record(s).`,
    'These records strengthen future reasoning, signal weighting, model calibration, hypothesis generation, and graph evolution.'
  ].join('\n');

  const scenarioSummary = [
    `SCIIP generated or reviewed ${args.scenarios.length} predictive scenario(s) and ${args.reasoningOutputs.length} autonomous reasoning output(s).`,
    'These outputs define future implications, monitoring conditions, and possible downstream action paths.'
  ].join('\n');

  const actionSummary = [
    `Action items reviewed: ${actionsReviewed}.`,
    `High priority: ${highPriorityCount}. Due now: ${dueNowCount}. Operator review: ${operatorReviewCount}.`,
    `Risk actions: ${riskActionCount}. Opportunity actions: ${opportunityActionCount}.`
  ].join('\n');

  return {
    commandStatus,
    recommendedOperatingPosture,
    actionsReviewed,
    opsDigestTitle,
    opsStatus,
    autonomousLoopSummary,
    commandCenterSummary,
    learningSummary,
    scenarioSummary,
    actionSummary,
    recommendedOperatingResponse,
    nextAutonomousFocus
  };
}

function sciipTestAutonomousOpsDigestProcessor() {
  const result =
    sciipRunAutonomousOpsDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOpsDigestProcessor',
    result
  }));

  return result;
}