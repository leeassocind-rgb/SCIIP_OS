/*******************************************************
 * SCIIP_OS
 * 90_SuperSheetIngestionProcessor.gs
 *
 * AIR CRE SuperSheet rows
 *      ↓
 * OBSERVATION_QUEUE
 *
 * Backward-compatible with existing 70 processor.
 *
 * Preserves full AIR CRE row detail in Raw_Text.
 *******************************************************/

var SCIIP_SUPERSHEET = SCIIP_SUPERSHEET || {};

SCIIP_SUPERSHEET.SHEETS = {
  SOURCE: 'AIR_CRE_SUPERSHEET_IMPORT',
  OBSERVATION_QUEUE: 'OBSERVATION_QUEUE',
  INGESTION_LOG: 'SUPERSHEET_INGESTION_LOG'
};

SCIIP_SUPERSHEET.OBSERVATION_HEADERS = [
  'Observation_ID',
  'Observation_Type',
  'Address',
  'City',
  'Zip',
  'APN',
  'Source',
  'Raw_Text',
  'Status',
  'Created_At',
  'Processed_At'
];

SCIIP_SUPERSHEET.SOURCE_HEADERS = [
  'Address',
  'City',
  'State',
  'Zip',
  'APN',
  'Building SF',
  'Land Acres',
  'Clear Height',
  'Dock Doors',
  'GL Doors',
  'Rate',
  'Sale Price',
  'Status',
  'Deal Type',
  'Source',
  'Notes'
];

SCIIP_SUPERSHEET.LOG_HEADERS = [
  'Run_ID',
  'Processor',
  'Status',
  'Source_Sheet',
  'Rows_Read',
  'Queued',
  'Skipped_Duplicate',
  'Skipped_No_Address',
  'Started_At',
  'Completed_At',
  'Created_By'
];

function sciipRunSuperSheetIngestionProcessor() {
  return sciipProcessSuperSheetIngestion();
}

function sciipRunSuperSheetIngestionPipeline() {
  var ingestionResult = sciipRunSuperSheetIngestionProcessor();

  var observationResult = null;
  if (typeof sciipRunPropertyObservationProcessor === 'function') {
    observationResult = sciipRunPropertyObservationProcessor();
  }

  var timelineResult = null;
  if (typeof sciipRunEventTimelineProcessor === 'function') {
    timelineResult = sciipRunEventTimelineProcessor();
  }

  var result = {
    pipeline: '90_SuperSheetIngestionPipeline',
    status: 'SUCCESS',
    ingestion: ingestionResult,
    observationProcessor: observationResult,
    timelineProcessor: timelineResult,
    completedAt: new Date()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipProcessSuperSheetIngestion() {
  var startedAt = new Date();
  var runId = sciipSuperSheetId90_('SUPERSHEET_RUN', startedAt.toISOString());

  var sourceSheet = sciipEnsureSuperSheetImportSheet90_();
  var queueSheet = sciipEnsureObservationQueueSheet90_();
  var logSheet = sciipEnsureSuperSheetLogSheet90_();

  var sourceRows = sciipReadObjects90_(sourceSheet);
  var existingQueueRows = sciipReadObjects90_(queueSheet);

  var existingKeys = {};
  existingQueueRows.forEach(function(row) {
    var key = sciipBuildObservationDuplicateKey90_({
      observationType: sciipFirst90_(row, ['Observation_Type']),
      address: sciipFirst90_(row, ['Address']),
      city: sciipFirst90_(row, ['City']),
      zip: sciipFirst90_(row, ['Zip']),
      apn: sciipFirst90_(row, ['APN']),
      source: sciipFirst90_(row, ['Source']),
      rawText: sciipFirst90_(row, ['Raw_Text'])
    });

    if (key) existingKeys[key] = true;
  });

  var rowsToAppend = [];
  var queued = 0;
  var skippedDuplicate = 0;
  var skippedNoAddress = 0;

  sourceRows.forEach(function(row) {
    var observation = sciipBuildObservationFromSuperSheetRow90_(row, startedAt);

    if (!observation.address) {
      skippedNoAddress++;
      return;
    }

    var duplicateKey = sciipBuildObservationDuplicateKey90_(observation);

    if (existingKeys[duplicateKey]) {
      skippedDuplicate++;
      return;
    }

    rowsToAppend.push([
      observation.observationId,
      observation.observationType,
      observation.address,
      observation.city,
      observation.zip,
      observation.apn,
      observation.source,
      observation.rawText,
      'PENDING',
      startedAt,
      ''
    ]);

    existingKeys[duplicateKey] = true;
    queued++;
  });

  if (rowsToAppend.length > 0) {
    queueSheet
      .getRange(
        queueSheet.getLastRow() + 1,
        1,
        rowsToAppend.length,
        SCIIP_SUPERSHEET.OBSERVATION_HEADERS.length
      )
      .setValues(rowsToAppend);
  }

  var completedAt = new Date();

  logSheet.appendRow([
    runId,
    '90_SuperSheetIngestionProcessor',
    'SUCCESS',
    sourceSheet.getName(),
    sourceRows.length,
    queued,
    skippedDuplicate,
    skippedNoAddress,
    startedAt,
    completedAt,
    Session.getActiveUser().getEmail()
  ]);

  var result = {
    processor: '90_SuperSheetIngestionProcessor',
    status: 'SUCCESS',
    sourceSheet: sourceSheet.getName(),
    rowsRead: sourceRows.length,
    queued: queued,
    skippedDuplicate: skippedDuplicate,
    skippedNoAddress: skippedNoAddress,
    startedAt: startedAt,
    completedAt: completedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureSuperSheetImportSheet90_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_SUPERSHEET.SHEETS.SOURCE);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_SUPERSHEET.SHEETS.SOURCE);
    sheet
      .getRange(1, 1, 1, SCIIP_SUPERSHEET.SOURCE_HEADERS.length)
      .setValues([SCIIP_SUPERSHEET.SOURCE_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipEnsureObservationQueueSheet90_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_SUPERSHEET.SHEETS.OBSERVATION_QUEUE);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_SUPERSHEET.SHEETS.OBSERVATION_QUEUE);
    sheet
      .getRange(1, 1, 1, SCIIP_SUPERSHEET.OBSERVATION_HEADERS.length)
      .setValues([SCIIP_SUPERSHEET.OBSERVATION_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipEnsureSuperSheetLogSheet90_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_SUPERSHEET.SHEETS.INGESTION_LOG);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_SUPERSHEET.SHEETS.INGESTION_LOG);
    sheet
      .getRange(1, 1, 1, SCIIP_SUPERSHEET.LOG_HEADERS.length)
      .setValues([SCIIP_SUPERSHEET.LOG_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipBuildObservationFromSuperSheetRow90_(row, createdAt) {
  var address = sciipFirst90_(row, ['Address', 'Property Address', 'Street Address']);
  var city = sciipFirst90_(row, ['City']);
  var zip = sciipFirst90_(row, ['Zip', 'ZIP', 'Zip Code']);
  var apn = sciipFirst90_(row, ['APN', 'Parcel', 'Parcel Number']);
  var source = sciipFirst90_(row, ['Source']) || 'AIR_CRE_SUPERSHEET';

  var buildingSf = sciipFirst90_(row, ['Building SF', 'Available SF', 'SF']);
  var landAcres = sciipFirst90_(row, ['Land Acres', 'Acres']);
  var clearHeight = sciipFirst90_(row, ['Clear Height', 'Clear Ht', 'Clear']);
  var dockDoors = sciipFirst90_(row, ['Dock Doors', 'DH']);
  var glDoors = sciipFirst90_(row, ['GL Doors', 'GL']);
  var rate = sciipFirst90_(row, ['Rate', 'Lease Rate', 'Asking Rate']);
  var salePrice = sciipFirst90_(row, ['Sale Price', 'Price']);
  var status = sciipFirst90_(row, ['Status']);
  var dealType = sciipFirst90_(row, ['Deal Type', 'Type']);
  var notes = sciipFirst90_(row, ['Notes', 'Comments', 'Remarks']);

  var observationType = sciipInferObservationType90_(dealType, rate, salePrice);

  var rawText = sciipBuildRawObservationText90_({
    address: address,
    city: city,
    zip: zip,
    apn: apn,
    buildingSf: buildingSf,
    landAcres: landAcres,
    clearHeight: clearHeight,
    dockDoors: dockDoors,
    glDoors: glDoors,
    rate: rate,
    salePrice: salePrice,
    status: status,
    dealType: dealType,
    source: source,
    notes: notes
  });

  var seed = [
    observationType,
    address,
    city,
    zip,
    apn,
    source,
    rawText
  ].join('|');

  return {
    observationId: sciipSuperSheetId90_('OBS', seed),
    observationType: observationType,
    address: address,
    city: city,
    zip: zip,
    apn: apn,
    source: source,
    rawText: rawText,
    createdAt: createdAt
  };
}

function sciipInferObservationType90_(dealType, rate, salePrice) {
  var text = [dealType, rate, salePrice].join(' ').toUpperCase();

  if (text.indexOf('SALE') !== -1 || salePrice) {
    return 'SALE_LISTING';
  }

  if (
    text.indexOf('LEASE') !== -1 ||
    text.indexOf('SUBLEASE') !== -1 ||
    rate
  ) {
    return 'LISTING';
  }

  return 'LISTING';
}

function sciipBuildRawObservationText90_(obj) {
  var parts = [];

  if (obj.address) parts.push('Address: ' + obj.address);
  if (obj.city) parts.push('City: ' + obj.city);
  if (obj.zip) parts.push('Zip: ' + obj.zip);
  if (obj.apn) parts.push('APN: ' + obj.apn);
  if (obj.buildingSf) parts.push('Building SF: ' + obj.buildingSf);
  if (obj.landAcres) parts.push('Land Acres: ' + obj.landAcres);
  if (obj.clearHeight) parts.push('Clear Height: ' + obj.clearHeight);
  if (obj.dockDoors) parts.push('Dock Doors: ' + obj.dockDoors);
  if (obj.glDoors) parts.push('GL Doors: ' + obj.glDoors);
  if (obj.rate) parts.push('Rate: ' + obj.rate);
  if (obj.salePrice) parts.push('Sale Price: ' + obj.salePrice);
  if (obj.status) parts.push('Status: ' + obj.status);
  if (obj.dealType) parts.push('Deal Type: ' + obj.dealType);
  if (obj.source) parts.push('Source: ' + obj.source);
  if (obj.notes) parts.push('Notes: ' + obj.notes);

  return parts.join(' | ');
}

function sciipBuildObservationDuplicateKey90_(obj) {
  return [
    sciipNormalize90_(obj.observationType),
    sciipNormalize90_(obj.address),
    sciipNormalize90_(obj.city),
    sciipNormalize90_(obj.zip),
    sciipNormalize90_(obj.apn),
    sciipNormalize90_(obj.source),
    sciipNormalize90_(obj.rawText)
  ].join('|');
}

function sciipReadObjects90_(sheet) {
  var values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) return [];

  var headers = values[0].map(function(header) {
    return String(header).trim();
  });

  return values.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(header, index) {
      obj[header] = row[index];
    });
    return obj;
  });
}

function sciipFirst90_(obj, keys) {
  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
}

function sciipNormalize90_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, ' ');
}

function sciipHash90_(value) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value)
  );

  return digest.map(function(byte) {
    var v = byte < 0 ? byte + 256 : byte;
    var hex = v.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').substring(0, 16).toUpperCase();
}

function sciipSuperSheetId90_(prefix, seed) {
  return prefix + '_' + sciipHash90_(seed);
}