/************************************************************
 * 320_BriefingDigestProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Consolidate individual intelligence briefings into one digest.
 *
 * Input:
 * - INTELLIGENCE_BRIEFING
 *
 * Output:
 * - BRIEFING_DIGEST
 ************************************************************/

const SCIIP_BRIEFING_DIGEST_PROCESSOR = '320_BriefingDigestProcessor';
const SCIIP_BRIEFING_DIGEST_SHEET = 'BRIEFING_DIGEST';

const SCIIP_BRIEFING_DIGEST_HEADERS = [
  'Digest_ID',
  'Business_Key',
  'Digest_Date',
  'Digest_Type',
  'Digest_Title',
  'Digest_Text',
  'Briefing_Count',
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

function sciipRunBriefingDigestProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_BRIEFING_DIGEST_SHEET, SCIIP_BRIEFING_DIGEST_HEADERS);

  const briefingSheet = ss.getSheetByName('INTELLIGENCE_BRIEFING');
  const digestSheet = ss.getSheetByName(SCIIP_BRIEFING_DIGEST_SHEET);

  if (!briefingSheet) throw new Error('Missing INTELLIGENCE_BRIEFING. Run 310 first.');

  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  const briefings = sciipReadSheetAsObjects_(briefingSheet).filter(function(b) {
    return String(b.Status || '').toUpperCase() === 'ACTIVE' &&
           String(b.Briefing_Date || '') === today;
  });

  const existingKeys = sciipGetExistingColumnValues_(digestSheet, 'Business_Key');

  let digestsCreated = 0;
  let skippedDuplicate = 0;
  let skippedNoBriefings = 0;

  if (!briefings.length) {
    skippedNoBriefings++;
  } else {
    const digest = sciipCreateBriefingDigest_(briefings, today);

    if (existingKeys.has(digest.Business_Key)) {
      skippedDuplicate++;
    } else {
      sciipAppendObjectRow_(digestSheet, SCIIP_BRIEFING_DIGEST_HEADERS, digest);
      digestsCreated++;
    }
  }

  const result = {
    processor: SCIIP_BRIEFING_DIGEST_PROCESSOR,
    status: 'SUCCESS',
    briefingsReviewed: briefings.length,
    digestsCreated: digestsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoBriefings: skippedNoBriefings,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * DIGEST FACTORY
 ************************************************************/

function sciipCreateBriefingDigest_(briefings, today) {
  const now = new Date();

  const forecastCount = sciipSumColumn_(briefings, 'Forecast_Count');
  const opportunityCount = sciipSumColumn_(briefings, 'Opportunity_Count');
  const openActionCount = sciipSumColumn_(briefings, 'Open_Action_Count');
  const criticalCount = sciipSumColumn_(briefings, 'Critical_Count');
  const highCount = sciipSumColumn_(briefings, 'High_Count');

  const title = 'SCIIP Daily Intelligence Digest — ' + today;
  const text = sciipBuildDigestText_(briefings, forecastCount, opportunityCount, openActionCount, criticalCount, highCount);

  const keyBasis = [
    today,
    briefings.length,
    forecastCount,
    opportunityCount,
    openActionCount,
    criticalCount,
    highCount
  ].join('|');

  const businessKey = 'BRIEFING_DIGEST|' + sciipStableHash_(keyBasis);

  return {
    Digest_ID: 'BD_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Digest_Date: today,
    Digest_Type: 'DAILY_INTELLIGENCE_DIGEST',
    Digest_Title: title,
    Digest_Text: text,
    Briefing_Count: briefings.length,
    Forecast_Count: forecastCount,
    Opportunity_Count: opportunityCount,
    Open_Action_Count: openActionCount,
    Critical_Count: criticalCount,
    High_Count: highCount,
    Status: 'ACTIVE',
    Created_At: now.toISOString(),
    Updated_At: now.toISOString(),
    Processor: SCIIP_BRIEFING_DIGEST_PROCESSOR,
    Notes: 'Generated from active intelligence briefings.'
  };
}

/************************************************************
 * TEXT
 ************************************************************/

function sciipBuildDigestText_(briefings, forecastCount, opportunityCount, openActionCount, criticalCount, highCount) {
  const lines = [];

  lines.push('SCIIP Daily Intelligence Digest');
  lines.push('');
  lines.push('Markets / locations covered: ' + briefings.length);
  lines.push('Forecasts: ' + forecastCount);
  lines.push('Open opportunities: ' + opportunityCount);
  lines.push('Open recommended actions: ' + openActionCount);
  lines.push('Critical items: ' + criticalCount);
  lines.push('High-priority items: ' + highCount);
  lines.push('');

  briefings.forEach(function(b) {
    const location = b.City || b.Submarket || b.Market || 'Market';
    lines.push('--- ' + location + ' ---');
    lines.push(b.Briefing_Text || '');
    lines.push('');
  });

  return lines.join('\n');
}

/************************************************************
 * HELPERS
 ************************************************************/

function sciipSumColumn_(rows, columnName) {
  return rows.reduce(function(total, r) {
    return total + Number(r[columnName] || 0);
  }, 0);
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestBriefingDigestProcessor() {
  const result = sciipRunBriefingDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestBriefingDigestProcessor',
    result: result
  }));

  return result;
}