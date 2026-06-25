/*******************************************************
 * 750_AutonomousOpsDigestProcessor
 *******************************************************/

const AUTONOMOUS_OPS_DIGEST_PROCESSOR_NAME = '750_AutonomousOpsDigestProcessor';

const AUTONOMOUS_OPS_DIGEST_INPUT_SHEET = 'COMMAND_CENTER_UPDATES';
const AUTONOMOUS_OPS_DIGEST_OUTPUT_SHEET = 'AUTONOMOUS_OPS_DIGESTS';

const AUTONOMOUS_OPS_DIGEST_SCHEMA = [
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

function sciipRunAutonomousOpsDigestProcessor() {
  const startedAt = new Date();

  sciipEnsureAutonomousOpsDigestSheet_();

  const digestDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_OPS_DIGEST_INPUT_SHEET,
      'Update_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_OPS_DIGEST|${digestDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_OPS_DIGEST_PROCESSOR_NAME,
    resolvedDigestDate: digestDate,
    businessKey
  }));

  if (
    sciipBusinessKeyPrefixExists_(
      AUTONOMOUS_OPS_DIGEST_OUTPUT_SHEET,
      businessKey
    )
  ) {
    return {
      processor: AUTONOMOUS_OPS_DIGEST_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousOpsDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetCommandCenterUpdatesForDigestDate_(digestDate);

  if (!sourceRows.length) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_OPS_DIGEST_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      digestDate,
      inputSheet: AUTONOMOUS_OPS_DIGEST_INPUT_SHEET
    }));

    return {
      processor: AUTONOMOUS_OPS_DIGEST_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousOpsDigestsCreated: 0,
      digestDate,
      completedAt: new Date().toISOString()
    };
  }

  const digest = sciipBuildAutonomousOpsDigest_({
    digestDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousOpsDigest_(digest);

  return {
    processor: AUTONOMOUS_OPS_DIGEST_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousOpsDigestsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousOpsDigest_(payload) {
  const digestId = `AUTONOMOUS_OPS_DIGEST_${Utilities.getUuid()}`;

  const digestText = sciipCreateAutonomousOpsDigestText_(
    payload.digestDate,
    payload.sourceRows
  );

  return {
    Digest_ID: digestId,
    Business_Key: payload.businessKey,
    Digest_Date: payload.digestDate,
    Source_Sheet: AUTONOMOUS_OPS_DIGEST_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Digest_Title: `Autonomous Operations Digest — ${payload.digestDate}`,
    Digest_Text: digestText,
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_OPS_DIGEST_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousOpsDigestSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_OPS_DIGEST_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_OPS_DIGEST_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_OPS_DIGEST_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_OPS_DIGEST_SCHEMA);
  }

  return sheet;
}

function sciipGetCommandCenterUpdatesForDigestDate_(digestDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_OPS_DIGEST_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Update_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_OPS_DIGEST_PROCESSOR_NAME,
      error: 'UPDATE_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === digestDate;
    })
    .map(row => sciipRowToObject_(headers, row));
}

function sciipCreateAutonomousOpsDigestText_(digestDate, sourceRows) {
  const lines = [];

  lines.push(`Autonomous Operations Digest for ${digestDate}`);
  lines.push('');
  lines.push(`Source Records Reviewed: ${sourceRows.length}`);
  lines.push('');

  sourceRows.forEach((row, index) => {
    lines.push(`Update ${index + 1}:`);

    const preferredFields = [
      'Update_Title',
      'Update_Text',
      'Command_Update',
      'Summary',
      'Status',
      'Processor',
      'Business_Key'
    ];

    preferredFields.forEach(field => {
      if (row[field]) {
        lines.push(`${field}: ${row[field]}`);
      }
    });

    lines.push('');
  });

  return lines.join('\n').trim();
}

function sciipAppendAutonomousOpsDigest_(digest) {
  const sheet = sciipEnsureAutonomousOpsDigestSheet_();

  const row = AUTONOMOUS_OPS_DIGEST_SCHEMA.map(header => digest[header] || '');

  sheet.appendRow(row);
}

function sciipRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

function sciipResolveLatestProcessingDate_(sheetName, dateColumnName) {
  const sheet = sciipGetSpreadsheet_().getSheetByName(sheetName);

  if (!sheet) return null;

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) return null;

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf(String(dateColumnName).trim());

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      error: 'DATE_COLUMN_NOT_FOUND',
      sheetName,
      dateColumnName,
      headers
    }));
    return null;
  }

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
    .filter(Boolean);

  if (!dates.length) return null;

  dates.sort();

  return dates[dates.length - 1];
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousOpsDigestProcessor() {
  const result = sciipRunAutonomousOpsDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOpsDigestProcessor',
    result
  }));

  return result;
}