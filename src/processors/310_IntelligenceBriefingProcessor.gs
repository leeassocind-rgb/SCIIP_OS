/************************************************************
 * 310_IntelligenceBriefingProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert forecasts, opportunities, actions, and trackers into
 * broker-readable intelligence briefings.
 *
 * Output:
 * - INTELLIGENCE_BRIEFING
 ************************************************************/

const SCIIP_INTELLIGENCE_BRIEFING_PROCESSOR = '310_IntelligenceBriefingProcessor';
const SCIIP_INTELLIGENCE_BRIEFING_SHEET = 'INTELLIGENCE_BRIEFING';

const SCIIP_INTELLIGENCE_BRIEFING_HEADERS = [
  'Briefing_ID',
  'Business_Key',
  'Briefing_Date',
  'Briefing_Type',
  'Market',
  'Submarket',
  'City',
  'Briefing_Title',
  'Briefing_Text',
  'Forecast_Count',
  'Opportunity_Count',
  'Open_Action_Count',
  'Critical_Count',
  'High_Count',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunIntelligenceBriefingProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_INTELLIGENCE_BRIEFING_SHEET, SCIIP_INTELLIGENCE_BRIEFING_HEADERS);

  const briefingSheet = ss.getSheetByName(SCIIP_INTELLIGENCE_BRIEFING_SHEET);
  const existingKeys = sciipGetExistingColumnValues_(briefingSheet, 'Business_Key');

  const groups = sciipBuildBriefingGroups_(ss);

  let groupsReviewed = 0;
  let briefingsCreated = 0;
  let skippedEmpty = 0;
  let skippedDuplicate = 0;

  Object.keys(groups).forEach(function(key) {
    const group = groups[key];
    groupsReviewed++;

    if (
      group.forecasts.length === 0 &&
      group.opportunities.length === 0 &&
      group.actions.length === 0
    ) {
      skippedEmpty++;
      return;
    }

    const briefing = sciipCreateIntelligenceBriefing_(group);

    if (existingKeys.has(briefing.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(briefingSheet, SCIIP_INTELLIGENCE_BRIEFING_HEADERS, briefing);
    existingKeys.add(briefing.Business_Key);
    briefingsCreated++;
  });

  const result = {
    processor: SCIIP_INTELLIGENCE_BRIEFING_PROCESSOR,
    status: 'SUCCESS',
    groupsReviewed: groupsReviewed,
    briefingsCreated: briefingsCreated,
    skippedEmpty: skippedEmpty,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * GROUPING
 ************************************************************/

function sciipBuildBriefingGroups_(ss) {
  const groups = {};

  const forecasts = sciipReadOptionalSheet_(ss, 'FORECAST').filter(function(r) {
    return String(r.Status || '').toUpperCase() === 'ACTIVE';
  });

  const opportunities = sciipReadOptionalSheet_(ss, 'OPPORTUNITY').filter(function(r) {
    return String(r.Status || '').toUpperCase() === 'OPEN';
  });

  const actions = sciipReadOptionalSheet_(ss, 'RECOMMENDED_ACTION').filter(function(r) {
    return String(r.Status || '').toUpperCase() === 'OPEN';
  });

  forecasts.forEach(function(f) {
    const group = sciipGetBriefingGroup_(groups, f);
    group.forecasts.push(f);
  });

  opportunities.forEach(function(o) {
    const group = sciipGetBriefingGroup_(groups, o);
    group.opportunities.push(o);
  });

  actions.forEach(function(a) {
    const group = sciipGetBriefingGroup_(groups, a);
    group.actions.push(a);
  });

  return groups;
}

function sciipGetBriefingGroup_(groups, row) {
  const market = row.Market || '';
  const submarket = row.Submarket || '';
  const city = row.City || '';

  const location = city || submarket || market || 'GLOBAL';
  const key = location.toUpperCase();

  if (!groups[key]) {
    groups[key] = {
      Market: market,
      Submarket: submarket,
      City: city,
      Location: location,
      forecasts: [],
      opportunities: [],
      actions: []
    };
  }

  return groups[key];
}

/************************************************************
 * BRIEFING FACTORY
 ************************************************************/

function sciipCreateIntelligenceBriefing_(group) {
  const now = new Date();
  const today = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  const criticalCount =
    sciipCountPriority_(group.opportunities, 'CRITICAL') +
    sciipCountPriority_(group.actions, 'CRITICAL');

  const highCount =
    sciipCountPriority_(group.opportunities, 'HIGH') +
    sciipCountPriority_(group.actions, 'HIGH');

  const title = sciipBuildBriefingTitle_(group);
  const text = sciipBuildBriefingText_(group, criticalCount, highCount);

  const keyBasis = [
    today,
    group.Location,
    group.forecasts.length,
    group.opportunities.length,
    group.actions.length,
    criticalCount,
    highCount
  ].join('|');

  const businessKey = 'INTELLIGENCE_BRIEFING|' + sciipStableHash_(keyBasis);

  return {
    Briefing_ID: 'IB_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Briefing_Date: today,
    Briefing_Type: 'MARKET_INTELLIGENCE_BRIEFING',
    Market: group.Market || '',
    Submarket: group.Submarket || '',
    City: group.City || '',
    Briefing_Title: title,
    Briefing_Text: text,
    Forecast_Count: group.forecasts.length,
    Opportunity_Count: group.opportunities.length,
    Open_Action_Count: group.actions.length,
    Critical_Count: criticalCount,
    High_Count: highCount,
    Status: 'ACTIVE',
    Created_At: now.toISOString(),
    Updated_At: now.toISOString(),
    Processor: SCIIP_INTELLIGENCE_BRIEFING_PROCESSOR,
    Notes: 'Generated from SCIIP autonomous intelligence stack.'
  };
}

/************************************************************
 * TEXT
 ************************************************************/

function sciipBuildBriefingTitle_(group) {
  return 'SCIIP Intelligence Briefing — ' + group.Location;
}

function sciipBuildBriefingText_(group, criticalCount, highCount) {
  const location = group.Location;

  const lines = [];

  lines.push(location + ' intelligence briefing generated from SCIIP autonomous outputs.');
  lines.push('Forecasts: ' + group.forecasts.length + '.');
  lines.push('Open opportunities: ' + group.opportunities.length + '.');
  lines.push('Open recommended actions: ' + group.actions.length + '.');

  if (criticalCount > 0) {
    lines.push('Critical items require immediate review: ' + criticalCount + '.');
  }

  if (highCount > 0) {
    lines.push('High-priority items require near-term follow-up: ' + highCount + '.');
  }

  const topOpportunity = sciipTopPriorityRow_(group.opportunities);
  if (topOpportunity) {
    lines.push('Top opportunity: ' + topOpportunity.Opportunity_Text);
  }

  const topAction = sciipTopPriorityRow_(group.actions);
  if (topAction) {
    lines.push('Recommended next action: ' + topAction.Recommended_Action);
  }

  return lines.join('\n');
}

/************************************************************
 * HELPERS
 ************************************************************/

function sciipReadOptionalSheet_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  return sciipReadSheetAsObjects_(sheet);
}

function sciipCountPriority_(rows, priority) {
  return rows.filter(function(r) {
    return String(r.Priority || '').toUpperCase() === priority;
  }).length;
}

function sciipTopPriorityRow_(rows) {
  if (!rows || !rows.length) return null;

  const rank = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  rows.sort(function(a, b) {
    const ar = rank[String(a.Priority || '').toUpperCase()] || 0;
    const br = rank[String(b.Priority || '').toUpperCase()] || 0;
    return br - ar;
  });

  return rows[0];
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestIntelligenceBriefingProcessor() {
  const result = sciipRunIntelligenceBriefingProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestIntelligenceBriefingProcessor',
    result: result
  }));

  return result;
}