/*******************************************************
 * SCIIP_OS v4.0
 * 400_WorkQueueDigestProcessor
 *
 * WORK_QUEUE → WORK_QUEUE_DIGEST
 *******************************************************/

const WORK_QUEUE_DIGEST_SHEET = 'WORK_QUEUE_DIGEST';

const WORK_QUEUE_DIGEST_HEADERS = [
  'ID',
  'Business_Key',
  'Digest_Date',
  'Queue_Items_Reviewed',
  'Open_Items',
  'Critical_Items',
  'High_Items',
  'Medium_Items',
  'Low_Items',
  'Top_Work_Items',
  'Execution_Focus',
  'Escalation_Summary',
  'Recommended_Next_Step',
  'Digest_Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const WORK_QUEUE_DIGEST_PROCESSOR = '400_WorkQueueDigestProcessor';

function sciipRunWorkQueueDigestProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const queueSheet = ss.getSheetByName('WORK_QUEUE');
  if (!queueSheet) throw new Error('Missing WORK_QUEUE sheet');

  const digestSheet = sciipEnsureWorkQueueDigestSheet_();

  const queueItems = sciipReadSheetObjects_(queueSheet);
  const existingDigests = sciipReadSheetObjects_(digestSheet);

  const today = new Date().toISOString().slice(0, 10);
  const businessKey = `WORK_QUEUE_DIGEST|${today}`;

  const existingKeys = new Set(
    existingDigests.map(r => String(r.Business_Key || '').trim())
  );

  if (existingKeys.has(businessKey)) {
    const result = {
      processor: WORK_QUEUE_DIGEST_PROCESSOR,
      status: 'SUCCESS',
      queueItemsReviewed: queueItems.length,
      workQueueDigestsCreated: 0,
      skippedDuplicate: 1,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const digest = sciipBuildWorkQueueDigest_(queueItems, businessKey, today);

  digestSheet.appendRow(
    WORK_QUEUE_DIGEST_HEADERS.map(h => digest[h] || '')
  );

  const result = {
    processor: WORK_QUEUE_DIGEST_PROCESSOR,
    status: 'SUCCESS',
    queueItemsReviewed: queueItems.length,
    workQueueDigestsCreated: 1,
    skippedDuplicate: 0,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildWorkQueueDigest_(queueItems, businessKey, today) {
  const now = new Date().toISOString();

  const openItems = queueItems.filter(item =>
    String(item.Work_Status || '').toUpperCase() !== 'CLOSED'
  );

  const critical = sciipFilterQueueByPriority_(openItems, 'CRITICAL');
  const high = sciipFilterQueueByPriority_(openItems, 'HIGH');
  const medium = sciipFilterQueueByPriority_(openItems, 'MEDIUM');
  const low = sciipFilterQueueByPriority_(openItems, 'LOW');

  const sorted = openItems.slice().sort((a, b) => {
    const scoreB = Number(b.Composite_Score || 0);
    const scoreA = Number(a.Composite_Score || 0);
    return scoreB - scoreA;
  });

  return {
    ID: sciipGenerateWorkQueueDigestId_(),
    Business_Key: businessKey,
    Digest_Date: today,
    Queue_Items_Reviewed: queueItems.length,
    Open_Items: openItems.length,
    Critical_Items: critical.length,
    High_Items: high.length,
    Medium_Items: medium.length,
    Low_Items: low.length,
    Top_Work_Items: sciipTopWorkItems_(sorted),
    Execution_Focus: sciipExecutionFocus_(critical, high, medium, low),
    Escalation_Summary: sciipEscalationSummary_(sorted),
    Recommended_Next_Step: sciipRecommendedQueueNextStep_(critical, high, medium, low),
    Digest_Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: WORK_QUEUE_DIGEST_PROCESSOR,
    Notes: 'Generated from WORK_QUEUE'
  };
}

/**
 * Digest logic
 */
function sciipFilterQueueByPriority_(items, label) {
  return items.filter(item =>
    String(item.Priority_Label || '').toUpperCase() === label
  );
}

function sciipTopWorkItems_(sortedItems) {
  if (!sortedItems.length) {
    return 'No open work queue items.';
  }

  return sortedItems.slice(0, 5).map((item, i) => {
    return [
      `${i + 1}. ${item.Work_Title || 'Untitled Work Item'}`,
      `Priority: ${item.Priority_Label || 'UNKNOWN'}`,
      `Score: ${item.Composite_Score || ''}`,
      `Assigned: ${item.Assigned_Role || 'Unassigned'}`
    ].join(' | ');
  }).join('\n');
}

function sciipExecutionFocus_(critical, high, medium, low) {
  if (critical.length > 0) {
    return 'Immediate focus should be placed on critical work queue items.';
  }

  if (high.length > 0) {
    return 'Current-cycle focus should be placed on high-priority execution items.';
  }

  if (medium.length > 0) {
    return 'Next-cycle focus should be placed on medium-priority execution items.';
  }

  if (low.length > 0) {
    return 'Routine monitoring is appropriate for low-priority work queue items.';
  }

  return 'No open execution focus required.';
}

function sciipEscalationSummary_(sortedItems) {
  const escalations = sortedItems.filter(item =>
    String(item.Escalation_Trigger || '').trim() !== ''
  );

  if (!escalations.length) {
    return 'No escalation triggers currently identified.';
  }

  return escalations.slice(0, 5).map((item, i) => {
    return `${i + 1}. ${item.Work_Title || 'Untitled'} — ${item.Escalation_Trigger}`;
  }).join('\n');
}

function sciipRecommendedQueueNextStep_(critical, high, medium, low) {
  if (critical.length > 0) {
    return 'Review critical queue items immediately and determine whether landlord-facing action is required.';
  }

  if (high.length > 0) {
    return 'Review high-priority queue items during the current execution cycle.';
  }

  if (medium.length > 0) {
    return 'Review medium-priority queue items during the next intelligence cycle.';
  }

  if (low.length > 0) {
    return 'Maintain routine review of low-priority execution items.';
  }

  return 'No open work queue action required.';
}

/**
 * Sheet setup
 */
function sciipEnsureWorkQueueDigestSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(WORK_QUEUE_DIGEST_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(WORK_QUEUE_DIGEST_SHEET);
    sheet.appendRow(WORK_QUEUE_DIGEST_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== WORK_QUEUE_DIGEST_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(WORK_QUEUE_DIGEST_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateWorkQueueDigestId_() {
  return 'WQ_DIGEST_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipReadSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Missing SCIIP_SPREADSHEET_ID in Script Properties. Add your SCIIP runtime Google Sheet ID.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Test function
 */
function sciipTestWorkQueueDigestProcessor() {
  const result = sciipRunWorkQueueDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestWorkQueueDigestProcessor',
    result
  }));

  return result;
}