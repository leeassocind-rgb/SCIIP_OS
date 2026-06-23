/*******************************************************
 * SCIIP_OS
 * 110_MarketActivityProcessor.gs
 *
 * Converts SCIIP events into market activity intelligence.
 *
 * PROPERTY_EVENTS
 * ASSET_PROFILE
 *      ↓
 * MARKET_ACTIVITY
 *
 * Purpose:
 * - New listings
 * - Sale listings
 * - Lease listings
 * - Availability mentions
 * - Rate mentions
 * - Asset creation
 * - Status changes
 *
 * Idempotent:
 * - Uses Activity_Key
 * - Rebuild-safe
 *******************************************************/

var SCIIP_MARKET_ACTIVITY = SCIIP_MARKET_ACTIVITY || {};

SCIIP_MARKET_ACTIVITY.SHEETS = {
  PROPERTY_EVENTS: 'PROPERTY_EVENTS',
  ASSET_PROFILE: 'ASSET_PROFILE',
  MARKET_ACTIVITY: 'MARKET_ACTIVITY',
  MARKET_ACTIVITY_LOG: 'MARKET_ACTIVITY_LOG'
};

SCIIP_MARKET_ACTIVITY.ACTIVITY_HEADERS = [
  'Activity_ID',
  'Activity_Key',
  'Asset_ID',
  'Business_Key',
  'Address',
  'City',
  'Zip',
  'Event_ID',
  'Event_Type',
  'Activity_Type',
  'Activity_Date',
  'Source',
  'Summary',
  'Raw_Text',
  'Rate',
  'Sale_Price',
  'Building_SF',
  'Land_Acres',
  'Clear_Height',
  'Status',
  'Confidence',
  'Created_At'
];

SCIIP_MARKET_ACTIVITY.LOG_HEADERS = [
  'Run_ID',
  'Processor',
  'Status',
  'Events_Read',
  'Activities_Written',
  'Skipped_Duplicate',
  'Started_At',
  'Completed_At',
  'Created_By'
];

function sciipRunMarketActivityProcessor() {
  return sciipProcessMarketActivity();
}

function sciipProcessMarketActivity() {
  var startedAt = new Date();

  var eventsSheet = sciipGetRequiredMarketActivitySheet_(
    SCIIP_MARKET_ACTIVITY.SHEETS.PROPERTY_EVENTS
  );

  var activitySheet = sciipEnsureMarketActivitySheet_();
  var logSheet = sciipEnsureMarketActivityLogSheet_();

  var events = sciipReadMarketActivityObjects_(eventsSheet);
  var profiles = sciipReadOptionalMarketActivityObjects_(
    SCIIP_MARKET_ACTIVITY.SHEETS.ASSET_PROFILE
  );

  var profilesByAsset = sciipIndexMarketActivityProfiles_(profiles);

  var existingActivities = sciipReadMarketActivityObjects_(activitySheet);
  var existingKeys = {};

  existingActivities.forEach(function(row) {
    var key = sciipFirstMarketActivityValue_(row, ['Activity_Key']);
    if (key) existingKeys[String(key).trim()] = true;
  });

  var rowsToAppend = [];
  var skippedDuplicate = 0;

  events.forEach(function(eventRow) {
    var activity = sciipBuildMarketActivityFromEvent_(
      eventRow,
      profilesByAsset,
      startedAt
    );

    if (!activity) return;

    if (existingKeys[activity.activityKey]) {
      skippedDuplicate++;
      return;
    }

    rowsToAppend.push([
      activity.activityId,
      activity.activityKey,
      activity.assetId,
      activity.businessKey,
      activity.address,
      activity.city,
      activity.zip,
      activity.eventId,
      activity.eventType,
      activity.activityType,
      activity.activityDate,
      activity.source,
      activity.summary,
      activity.rawText,
      activity.rate,
      activity.salePrice,
      activity.buildingSf,
      activity.landAcres,
      activity.clearHeight,
      activity.status,
      activity.confidence,
      startedAt
    ]);

    existingKeys[activity.activityKey] = true;
  });

  if (rowsToAppend.length > 0) {
    activitySheet
      .getRange(
        activitySheet.getLastRow() + 1,
        1,
        rowsToAppend.length,
        SCIIP_MARKET_ACTIVITY.ACTIVITY_HEADERS.length
      )
      .setValues(rowsToAppend);
  }

  var completedAt = new Date();
  var runId = sciipMarketActivityId_(
    'MARKET_ACTIVITY_RUN',
    startedAt.toISOString()
  );

  logSheet.appendRow([
    runId,
    '110_MarketActivityProcessor',
    'SUCCESS',
    events.length,
    rowsToAppend.length,
    skippedDuplicate,
    startedAt,
    completedAt,
    Session.getActiveUser().getEmail()
  ]);

  var result = {
    processor: '110_MarketActivityProcessor',
    status: 'SUCCESS',
    eventsRead: events.length,
    activitiesWritten: rowsToAppend.length,
    skippedDuplicate: skippedDuplicate,
    startedAt: startedAt,
    completedAt: completedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Converts a PROPERTY_EVENTS row into market activity.
 */
function sciipBuildMarketActivityFromEvent_(eventRow, profilesByAsset, createdAt) {
  var eventId = sciipFirstMarketActivityValue_(eventRow, [
    'Event_ID',
    'ID',
    'event_id'
  ]);

  var eventType = sciipFirstMarketActivityValue_(eventRow, [
    'Event_Type',
    'Type',
    'event_type'
  ]);

  if (!eventType) return null;

  var assetId = sciipFirstMarketActivityValue_(eventRow, [
    'Asset_ID',
    'AssetId',
    'asset_id'
  ]);

  var payload = sciipParseMarketActivityPayload_(eventRow);

  if (!assetId) {
    assetId =
      payload.assetId ||
      payload.Asset_ID ||
      payload.asset_id ||
      '';
  }

  var profile = profilesByAsset[assetId] || {};

  var businessKey =
    sciipFirstMarketActivityValue_(eventRow, ['Business_Key']) ||
    sciipFirstMarketActivityValue_(profile, ['Business_Key']) ||
    payload.businessKey ||
    '';

  var address =
    payload.address ||
    payload.Address ||
    sciipFirstMarketActivityValue_(profile, ['Address']) ||
    '';

  var city =
    payload.city ||
    payload.City ||
    sciipFirstMarketActivityValue_(profile, ['City']) ||
    '';

  var zip =
    payload.zip ||
    payload.Zip ||
    payload.ZIP ||
    sciipFirstMarketActivityValue_(profile, ['Zip']) ||
    '';

  var rawText =
    payload.rawText ||
    payload.Raw_Text ||
    sciipFirstMarketActivityValue_(eventRow, ['Raw_Text']) ||
    sciipFirstMarketActivityValue_(profile, ['Latest_Raw_Text']) ||
    '';

  var source =
    sciipFirstMarketActivityValue_(eventRow, ['Source', 'Source_Type']) ||
    payload.source ||
    sciipFirstMarketActivityValue_(profile, ['Latest_Source']) ||
    '';

  var activityType = sciipClassifyMarketActivity_(
    eventType,
    payload,
    rawText
  );

  if (!activityType) return null;

  var activityDate =
    sciipFirstMarketActivityValue_(eventRow, [
      'Event_Date',
      'Created_At',
      'Timestamp'
    ]) ||
    createdAt;

  var rate =
    payload.rate ||
    payload.Rate ||
    sciipExtractRateFromText_(rawText) ||
    '';

  var salePrice =
    payload.salePrice ||
    payload.Sale_Price ||
    payload.price ||
    payload.Price ||
    sciipExtractSalePriceFromText_(rawText) ||
    '';

  var buildingSf =
    payload.buildingSf ||
    payload.Building_SF ||
    payload.availableSf ||
    payload.Available_SF ||
    '';

  var landAcres =
    payload.landAcres ||
    payload.Land_Acres ||
    payload.acres ||
    payload.Acres ||
    '';

  var clearHeight =
    payload.clearHeight ||
    payload.Clear_Height ||
    payload.clear ||
    payload.Clear ||
    '';

  var status =
    payload.status ||
    payload.Status ||
    sciipFirstMarketActivityValue_(profile, ['Current_Status']) ||
    '';

  var summary = sciipBuildMarketActivitySummary_({
    activityType: activityType,
    address: address,
    city: city,
    zip: zip,
    rate: rate,
    salePrice: salePrice,
    buildingSf: buildingSf,
    status: status,
    source: source
  });

  var activityKey = sciipBuildMarketActivityKey_(
    assetId,
    eventId,
    eventType,
    activityType
  );

  return {
    activityId: sciipMarketActivityId_('ACTIVITY', activityKey),
    activityKey: activityKey,
    assetId: assetId,
    businessKey: businessKey,
    address: address,
    city: city,
    zip: zip,
    eventId: eventId,
    eventType: eventType,
    activityType: activityType,
    activityDate: activityDate,
    source: source,
    summary: summary,
    rawText: rawText,
    rate: rate,
    salePrice: salePrice,
    buildingSf: buildingSf,
    landAcres: landAcres,
    clearHeight: clearHeight,
    status: status,
    confidence: sciipMarketActivityConfidence_(assetId, eventId, activityType, rawText)
  };
}

/**
 * Activity classifier.
 */
function sciipClassifyMarketActivity_(eventType, payload, rawText) {
  var event = String(eventType || '').toUpperCase();
  var text = [
    rawText,
    payload.observationType,
    payload.dealType,
    payload.status,
    payload.source
  ].join(' ').toUpperCase();

  if (event === 'ASSET_CREATED') {
    return 'ASSET_CREATED';
  }

  if (event === 'PROPERTY_OBSERVED') {
    if (text.indexOf('SALE') !== -1 || payload.salePrice || payload.Sale_Price) {
      return 'SALE_LISTING';
    }

    if (
      text.indexOf('LEASE') !== -1 ||
      text.indexOf('SUBLEASE') !== -1 ||
      payload.rate ||
      payload.Rate
    ) {
      return 'LEASE_LISTING';
    }

    if (
      text.indexOf('AVAILABLE') !== -1 ||
      text.indexOf('AVAILABILITY') !== -1
    ) {
      return 'AVAILABILITY_MENTION';
    }

    return 'PROPERTY_OBSERVED';
  }

  if (event === 'ASSET_UPDATED') {
    if (
      text.indexOf('STATUS') !== -1 ||
      payload.status ||
      payload.Status
    ) {
      return 'STATUS_CHANGE';
    }

    return 'ASSET_UPDATED';
  }

  if (event === 'ALIAS_CREATED') {
    return 'IDENTITY_ACTIVITY';
  }

  if (event === 'CAMPUS_ASSIGNED') {
    return 'CAMPUS_ACTIVITY';
  }

  if (event === 'GRAPH_NODE_CREATED' || event === 'GRAPH_EDGE_CREATED') {
    return 'GRAPH_ACTIVITY';
  }

  return '';
}

function sciipBuildMarketActivitySummary_(obj) {
  var parts = [];

  parts.push(obj.activityType);

  var location = [obj.address, obj.city, obj.zip].filter(function(v) {
    return v && String(v).trim() !== '';
  }).join(', ');

  if (location) parts.push(location);
  if (obj.buildingSf) parts.push('SF: ' + obj.buildingSf);
  if (obj.rate) parts.push('Rate: ' + obj.rate);
  if (obj.salePrice) parts.push('Sale Price: ' + obj.salePrice);
  if (obj.status) parts.push('Status: ' + obj.status);
  if (obj.source) parts.push('Source: ' + obj.source);

  return parts.join(' | ');
}

function sciipBuildMarketActivityKey_(assetId, eventId, eventType, activityType) {
  if (eventId) {
    return [
      'MARKET_ACTIVITY',
      String(assetId || '').trim(),
      String(eventId).trim(),
      String(activityType || '').trim()
    ].join('|');
  }

  return [
    'MARKET_ACTIVITY',
    String(assetId || '').trim(),
    String(eventType || '').trim(),
    String(activityType || '').trim()
  ].join('|');
}

function sciipEnsureMarketActivitySheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_MARKET_ACTIVITY.SHEETS.MARKET_ACTIVITY);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_MARKET_ACTIVITY.SHEETS.MARKET_ACTIVITY);
    sheet
      .getRange(1, 1, 1, SCIIP_MARKET_ACTIVITY.ACTIVITY_HEADERS.length)
      .setValues([SCIIP_MARKET_ACTIVITY.ACTIVITY_HEADERS]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  var existingHeaders = [];
  if (sheet.getLastRow() > 0 && sheet.getLastColumn() > 0) {
    existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }

  if (sheet.getLastRow() === 0 || existingHeaders[0] !== 'Activity_ID') {
    sheet.clear();
    sheet
      .getRange(1, 1, 1, SCIIP_MARKET_ACTIVITY.ACTIVITY_HEADERS.length)
      .setValues([SCIIP_MARKET_ACTIVITY.ACTIVITY_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipEnsureMarketActivityLogSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_MARKET_ACTIVITY.SHEETS.MARKET_ACTIVITY_LOG);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_MARKET_ACTIVITY.SHEETS.MARKET_ACTIVITY_LOG);
    sheet
      .getRange(1, 1, 1, SCIIP_MARKET_ACTIVITY.LOG_HEADERS.length)
      .setValues([SCIIP_MARKET_ACTIVITY.LOG_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipGetRequiredMarketActivitySheet_(sheetName) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Missing required sheet: ' + sheetName);
  }

  return sheet;
}

function sciipReadOptionalMarketActivityObjects_(sheetName) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

  return sciipReadMarketActivityObjects_(sheet);
}

function sciipReadMarketActivityObjects_(sheet) {
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

function sciipIndexMarketActivityProfiles_(profiles) {
  var index = {};

  profiles.forEach(function(profile) {
    var assetId = sciipFirstMarketActivityValue_(profile, [
      'Asset_ID',
      'AssetId',
      'asset_id'
    ]);

    if (assetId) {
      index[String(assetId).trim()] = profile;
    }
  });

  return index;
}

function sciipParseMarketActivityPayload_(row) {
  var raw = sciipFirstMarketActivityValue_(row || {}, ['Payload', 'payload']);

  if (!raw) return {};

  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err) {
    return {};
  }
}

function sciipFirstMarketActivityValue_(obj, keys) {
  obj = obj || {};

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function sciipMarketActivityConfidence_(assetId, eventId, activityType, rawText) {
  var score = 50;

  if (assetId) score += 20;
  if (eventId) score += 15;
  if (activityType) score += 10;
  if (rawText) score += 5;

  if (score > 100) score = 100;

  return score;
}

function sciipExtractRateFromText_(text) {
  if (!text) return '';

  var match = String(text).match(/\$?\d+(\.\d{1,2})?\s?(\/?\s?sf|psf|nnn|gross)?/i);
  return match ? match[0] : '';
}

function sciipExtractSalePriceFromText_(text) {
  if (!text) return '';

  var match = String(text).match(/\$\s?\d{1,3}(,\d{3})+(\.\d+)?/);
  return match ? match[0] : '';
}

function sciipMarketActivityHash_(value) {
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

function sciipMarketActivityId_(prefix, seed) {
  return prefix + '_' + sciipMarketActivityHash_(seed);
}