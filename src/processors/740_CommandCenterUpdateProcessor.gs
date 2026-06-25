/************************************************************
 * 740_CommandCenterUpdateProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - OPERATOR_BRIEFINGS
 *
 * Output:
 * - COMMAND_CENTER_UPDATES
 ************************************************************/

const COMMAND_CENTER_UPDATES_SHEET =
  'COMMAND_CENTER_UPDATES';

const COMMAND_CENTER_UPDATES_HEADERS = [
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

function sciipEnsureCommandCenterUpdatesSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(COMMAND_CENTER_UPDATES_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(COMMAND_CENTER_UPDATES_SHEET);
  }

  sheet.getRange(1, 1, 1, COMMAND_CENTER_UPDATES_HEADERS.length)
    .setValues([COMMAND_CENTER_UPDATES_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunCommandCenterUpdateProcessor() {
  const processor = '740_CommandCenterUpdateProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureCommandCenterUpdatesSchema();

  const updateDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `COMMAND_CENTER_UPDATE|${updateDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      commandCenterUpdatesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const operatorBriefings = sciipGetRecordsByDate_(
    'OPERATOR_BRIEFINGS',
    'Briefing_Date',
    updateDate
  );

  if (operatorBriefings.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      operatorBriefingsReviewed: 0,
      commandCenterUpdatesCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const update =
    sciipCreateCommandCenterUpdate_({
      businessKey,
      updateDate,
      operatorBriefing: operatorBriefings[0],
      processor
    });

  outputSheet.appendRow(update);

  const result = {
    processor,
    status: 'SUCCESS',
    operatorBriefingsReviewed: operatorBriefings.length,
    commandCenterUpdatesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateCommandCenterUpdate_(args) {
  const now = new Date();

  const briefing = args.operatorBriefing;

  const operatorBriefingId = sciipExtractFirstAvailable_(briefing, [
    'Operator_Briefing_ID'
  ]);

  const profile =
    sciipInferCommandCenterUpdateProfile_(briefing);

  return [
    sciipGenerateId_('CCU'),
    args.businessKey,
    args.updateDate,
    operatorBriefingId,
    sciipExtractFirstAvailable_(briefing, ['Briefing_Title']),
    sciipExtractFirstAvailable_(briefing, ['Recommended_Operating_Posture']),
    sciipExtractFirstAvailable_(briefing, ['Priority_Assessment']),
    sciipExtractFirstAvailable_(briefing, ['Operator_Decision_Focus']),
    sciipExtractFirstAvailable_(briefing, ['Next_Best_Action']),
    profile.updateType,
    profile.updateTitle,
    profile.commandStatus,
    profile.commandMessage,
    profile.primaryFocus,
    profile.requiredOperatorAction,
    profile.visibilityLevel,
    profile.updatePriority,
    'PUBLISHED_TO_COMMAND_CENTER',
    `OPERATOR_BRIEFINGS:${operatorBriefingId}`,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferCommandCenterUpdateProfile_(briefing) {
  const briefingTitle = sciipExtractFirstAvailable_(briefing, [
    'Briefing_Title'
  ]);

  const operatingPosture = sciipExtractFirstAvailable_(briefing, [
    'Recommended_Operating_Posture'
  ]);

  const priorityAssessment = sciipExtractFirstAvailable_(briefing, [
    'Priority_Assessment'
  ]);

  const operatorDecisionFocus = sciipExtractFirstAvailable_(briefing, [
    'Operator_Decision_Focus'
  ]);

  const commandCenterMessage = sciipExtractFirstAvailable_(briefing, [
    'Command_Center_Message'
  ]);

  const nextBestAction = sciipExtractFirstAvailable_(briefing, [
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
    `Command status: ${commandStatus}.`,
    `Operating posture: ${operatingPosture || 'UNKNOWN'}.`,
    `Priority assessment: ${priorityAssessment || 'No priority assessment recorded.'}`,
    `Operator decision focus: ${operatorDecisionFocus || 'No decision focus recorded.'}`,
    `Next best action: ${requiredOperatorAction}`
  ].join('\n');

  return {
    updateType,
    updateTitle,
    commandStatus,
    commandMessage,
    primaryFocus,
    requiredOperatorAction,
    visibilityLevel,
    updatePriority
  };
}

function sciipTestCommandCenterUpdateProcessor() {
  const result =
    sciipRunCommandCenterUpdateProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestCommandCenterUpdateProcessor',
    result
  }));

  return result;
}