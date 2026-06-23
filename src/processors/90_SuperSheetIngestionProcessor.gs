/*******************************************************
 * SCIIP_OS
 * 90_SuperSheetIngestionProcessor.gs
 *
 * AIR CRE SuperSheet rows
 *      ↓
 * OBSERVATION_QUEUE
 *      ↓
 * 70_PropertyObservationProcessor
 *      ↓
 * PROPERTY_EVENTS / ASSET / GRAPH
 *      ↓
 * 80_EventTimelineProcessor
 *      ↓
 * ASSET_TIMELINE
 *******************************************************/

var SCIIP_SUPERSHEET = SCIIP_SUPERSHEET || {};

SCIIP_SUPERSHEET.SHEETS = {
  SOURCE: 'AIR_CRE_SUPERSHEET_IMPORT',
  OBSERVATION_QUEUE: 'OBSERVATION_QUEUE',
  INGESTION_LOG: 'SUPERSHEET_INGESTION_LOG'
};

SCIIP_SUPERSHEET.OBSERVATION_HEADERS = [
  'Observation_ID',
  'Observation_Key',
  'Observation_Type',
  'Address',
  'City',
  'State',
  'Zip',
  'APN',
  'Building_SF',
  'Land_Acres',
  'Clear_Height',
  'Dock_Doors',
  'GL_Doors',
  'Rate',
  'Sale_Price',
  'Status',
  'Source',
  'Source_Sheet',
  'Source_Row',
  'Source_Record_Key',
  'Raw_Text',
  'Payload',
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

/**
 * Processor entrypoint.
 */
function sciipRunSuperSheetIngestionProcessor() {
  return sciipProcessSuperSheetIngestion();
}

/**
 * Optional full pipeline:
 * 90 → 70 → 80
 */
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

/**
 * Main processor.
 */
function sciipProcessSuperSheetIngestion() {
  var startedAt = new Date();
  var runId = sciipSuperSheetId_('SUPERSHEET_RUN', startedAt.toISOString());

  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);

  var sourceSheet = sciipEnsureSuperSheetImportSheet_();
  var queueSheet = sciipEnsureObservationQueueSheet_();
  var logSheet = sciipEnsureSuperSheetLogSheet_();

  var sourceRows = sciipReadObjects90_(sourceSheet);
  var existingQueueRows = sciipReadObjects90_(queueSheet);

  var existingKeys = {};
  existingQueueRows.forEach(function(row) {
    var key = sciipFirst90_(row, [
      'Observation_Key',
      'Source_Record_Key'
    ]);

    if (key) {
      existingKeys[String(key).trim()] = true;
    }
  });

  var rowsToAppend = [];
  var queued = 0;
  var skippedDuplicate = 0;
  var skippedNoAddress = 0;

  sourceRows.forEach(function(row, index) {
    var sourceRowNumber = index + 2;

    var observation = sciipBuildObservationFromSuperSheetRow_(
      row,
      sourceSheet.getName(),
      sourceRowNumber,
      startedAt
    );

    if (!observation.address) {
      skippedNoAddress++;
      return;
    }

    if (existingKeys[observation.observationKey]) {
      skippedDuplicate++;
      return;
    }

    rowsToAppend.push([
      observation.observationId,
      observation.observationKey,
      observation.observationType,
      observation.address,
      observation.city,
      observation.state,
      observation.zip,
      observation.apn,
      observation.buildingSf,
      observation.landAcres,
      observation.clearHeight,
      observation.dockDoors,
      observation.glDoors,
      observation.rate,
      observation.salePrice,
      'PENDING',
      observation.source,
      observation.sourceSheet,
      observation.sourceRow,
      observation.sourceRecordKey,
      observation.rawText,
      JSON.stringify(observation.payload),
      startedAt,
      ''
    ]);

    existingKeys[observation.observationKey] = true;
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

/**
 * Creates AIR_CRE_SUPERSHEET_IMPORT if missing.
 */
function sciipEnsureSuperSheetImportSheet_() {
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

/**
 * Creates/repairs OBSERVATION_QUEUE.
 */
function sciipEnsureObservationQueueSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_SUPERSHEET.SHEETS.OBSERVATION_QUEUE);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_SUPERSHEET.SHEETS.OBSERVATION_QUEUE);
    sheet
      .getRange(1, 1, 1, SCIIP_SUPERSHEET.OBSERVATION_HEADERS.length)
      .setValues([SCIIP_SUPERSHEET.OBSERVATION_HEADERS]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  var existingHeaders = [];
  if (sheet.getLastRow() > 0 && sheet.getLastColumn() > 0) {
    existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }

  if (sheet.getLastRow() === 0 || existingHeaders[0] !== 'Observation_ID') {
    sheet.clear();
    sheet
      .getRange(1, 1, 1, SCIIP_SUPERSHEET.OBSERVATION_HEADERS.length)
      .setValues([SCIIP_SUPERSHEET.OBSERVATION_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Creates ingestion log.
 */
function sciipEnsureSuperSheetLogSheet_() {
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

/**
 * Converts one AIR CRE row into a SCIIP observation.
 */
function sciipBuildObservationFromSuperSheetRow_(row, sourceSheetName, sourceRowNumber, createdAt) {
  var address = sciipFirst90_(row, [
    'Address',
    'Property Address',
    'Property_Address',
    'Street Address',
    'Street'
  ]);

  var city = sciipFirst90_(row, [
    'City',
    'Market City'
  ]);

  var state = sciipFirst90_(row, [
    'State'
  ]) || 'CA';

  var zip = sciipFirst90_(row, [
    'Zip',
    'ZIP',
    'Zip Code',
    'Postal Code'
  ]);

  var apn = sciipFirst90_(row, [
    'APN',
    'Parcel',
    'Parcel Number'
  ]);

  var buildingSf = sciipFirst90_(row, [
    'Building SF',
    'Building_SF',
    'SF',
    'Size',
    'Available SF',
    'Available_SF'
  ]);

  var landAcres = sciipFirst90_(row, [
    'Land Acres',
    'Land_Acres',
    'Acres',
    'Site Acres'
  ]);

  var clearHeight = sciipFirst90_(row, [
    'Clear Height',
    'Clear_Height',
    'Clear',
    'Clear Ht'
  ]);

  var dockDoors = sciipFirst90_(row, [
    'Dock Doors',
    'Dock_Doors',
    'DH',
    'Dock High Doors'
  ]);

  var glDoors = sciipFirst90_(row, [
    'GL Doors',
    'GL_Doors',
    'Ground Level Doors',
    'GL'
  ]);

  var rate = sciipFirst90_(row, [
    'Rate',
    'Lease Rate',
    'Asking Rate',
    'Rent'
  ]);

  var salePrice = sciipFirst90_(row, [
    'Sale Price',
    'Sale_Price',
    'Price',
    'Asking Price'
  ]);

  var dealType = sciipFirst90_(row, [
    'Deal Type',
    'Deal_Type',
    'Type',
    'Listing Type'
  ]);

  var status = sciipFirst90_(row, [
    'Status',
    'Availability Status'
  ]);

  var source = sciipFirst90_(row, [
    'Source',
    'Data Source'
  ]) || 'AIR_CRE_SUPERSHEET';

  var notes = sciipFirst90_(row, [
    'Notes',
    'Comments',
    'Remarks',
    'Description'
  ]);

  var observationType = sciipInferObservationType90_(dealType, rate, salePrice);

  var rawText = sciipBuildRawObservationText90_({
    address: address,
    city: city,
    state: state,
    zip: zip,
    apn: apn,
    buildingSf: buildingSf,
    landAcres: landAcres,
    clearHeight: clearHeight,
    dockDoors: dockDoors,
    glDoors: glDoors,
    rate: rate,
    salePrice: salePrice,
    dealType: dealType,
    status: status,
    notes: notes
  });

  var payload = {
    observationType: observationType,
    address: address,
    city: city,
    state: state,
    zip: zip,
    apn: apn,
    buildingSf: buildingSf,
    landAcres: landAcres,
    clearHeight: clearHeight,
    dockDoors: dockDoors,
    glDoors: glDoors,
    rate: rate,
    salePrice: salePrice,
    dealType: dealType,
    status: status,
    source: source,
    sourceSheet: sourceSheetName,
    sourceRow: sourceRowNumber,
    rawText: rawText,
    createdAt: createdAt.toISOString()
  };

  var sourceRecordKey = sciipSuperSheetSourceRecordKey_(payload);
  var observationKey = sourceRecordKey;
  var observationId = sciipSuperSheetId_('OBS', observationKey);

  payload.observationId = observationId;

  return {
    observationId: observationId,
    observationKey: observationKey,
    observationType: observationType,
    address: address,
    city: city,
    state: state,
    zip: zip,
    apn: apn,
    buildingSf: buildingSf,
    landAcres: landAcres,
    clearHeight: clearHeight,
    dockDoors: dockDoors,
    glDoors: glDoors,
    rate: rate,
    salePrice: salePrice,
    source: source,
    sourceSheet: sourceSheetName,
    sourceRow: sourceRowNumber,
    sourceRecordKey: sourceRecordKey,
    rawText: rawText,
    payload: payload
  };
}

/**
 * Infer observation type.
 */
function sciipInferObservationType90_(dealType, rate, salePrice) {
  var text = [
    dealType,
    rate,
    salePrice
  ].join(' ').toUpperCase();

  if (text.indexOf('SALE') !== -1 || salePrice) {
    return 'SALE_LISTING';
  }

  if (
    text.indexOf('LEASE') !== -1 ||
    text.indexOf('SUBLEASE') !== -1 ||
    rate
  ) {
    return 'LEASE_LISTING';
  }

  return 'LISTING';
}

/**
 * Raw text summary.
 */
function sciipBuildRawObservationText90_(obj) {
  var parts = [];

  if (obj.address) parts.push('Address: ' + obj.address);
  if (obj.city) parts.push('City: ' + obj.city);
  if (obj.zip) parts.push('Zip: ' + obj.zip);
  if (obj.buildingSf) parts.push('Building SF: ' + obj.buildingSf);
  if (obj.landAcres) parts.push('Land Acres: ' + obj.landAcres);
  if (obj.clearHeight) parts.push('Clear Height: ' + obj.clearHeight);
  if (obj.dockDoors) parts.push('Dock Doors: ' + obj.dockDoors);
  if (obj.glDoors) parts.push('GL Doors: ' + obj.glDoors);
  if (obj.rate) parts.push('Rate: ' + obj.rate);
  if (obj.salePrice) parts.push('Sale Price: ' + obj.salePrice);
  if (obj.dealType) parts.push('Deal Type: ' + obj.dealType);
  if (obj.status) parts.push('Status: ' + obj.status);
  if (obj.notes) parts.push('Notes: ' + obj.notes);

  return parts.join(' | ');
}

/**
 * Stable idempotency key for imported source row.
 */
function sciipSuperSheetSourceRecordKey_(payload) {
  var normalized = {
    observationType: sciipNormalize90_(payload.observationType),
    address: sciipNormalize90_(payload.address),
    city: sciipNormalize90_(payload.city),
    state: sciipNormalize90_(payload.state),
    zip: sciipNormalize90_(payload.zip),
    apn: sciipNormalize90_(payload.apn),
    buildingSf: sciipNormalize90_(payload.buildingSf),
    landAcres: sciipNormalize90_(payload.landAcres),
    rate: sciipNormalize90_(payload.rate),
    salePrice: sciipNormalize90_(payload.salePrice),
    dealType: sciipNormalize90_(payload.dealType),
    status: sciipNormalize90_(payload.status),
    source: sciipNormalize90_(payload.source)
  };

  return 'OBSERVATION|' + sciipHash90_(JSON.stringify(normalized));
}

/**
 * Reads sheet into objects.
 */
function sciipReadObjects90_(sheet) {
  var values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) {
    return [];
  }

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

/**
 * First non-empty value.
 */
function sciipFirst90_(obj, keys) {
  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

/**
 * Normalization for matching.
 */
function sciipNormalize90_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Stable hash.
 */
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

/**
 * ID factory.
 */
function sciipSuperSheetId_(prefix, seed) {
  return prefix + '_' + sciipHash90_(seed);
}