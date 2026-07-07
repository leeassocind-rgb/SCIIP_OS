/*******************************************************
 * SCIIP_OS
 * 80_EventTimelineProcessor.gs
 *
 * Converts SCIIP events into permanent asset timeline rows.
 *
 * PROPERTY_EVENTS
 *      ↓
 * ASSET_TIMELINE
 *
 * Idempotent:
 * - Uses Timeline_Key to prevent duplicate timeline entries.
 * - Does not mutate source events.
 * - Resolves PROPERTY_OBSERVED events to assets using:
 *   Payload address/city/zip → Business_Key → ASSET_REGISTRY
 *******************************************************/

var SCIIP_TIMELINE = SCIIP_TIMELINE || {};

SCIIP_TIMELINE.SHEETS = {
  EVENTS: 'PROPERTY_EVENTS',
  TIMELINE: 'ASSET_TIMELINE',
  ASSETS: 'ASSET_REGISTRY'
};

SCIIP_TIMELINE.TIMELINE_HEADERS = [
  'Timeline_ID',
  'Timeline_Key',
  'Asset_ID',
  'Event_ID',
  'Event_Type',
  'Event_Date',
  'Timeline_Title',
  'Timeline_Description',
  'Source_Type',
  'Source_ID',
  'Confidence',
  'Created_At',
  'Created_By'
];

SCIIP_TIMELINE.SUPPORTED_EVENT_TYPES = [
  'PROPERTY_OBSERVED',
  'ASSET_CREATED',
  'ASSET_UPDATED',
  'ALIAS_CREATED',
  'GRAPH_NODE_CREATED',
  'GRAPH_EDGE_CREATED',
  'CAMPUS_ASSIGNED'
];

/**
 * Processor entrypoint.
 */
function sciipRunEventTimelineProcessor() {
  return sciipProcessEventTimeline();
}

/**
 * Main processor.
 */
function sciipProcessEventTimeline() {
  var startedAt = new Date();

  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);

  var eventsSheet = ss.getSheetByName(SCIIP_TIMELINE.SHEETS.EVENTS);
  if (!eventsSheet) {
    throw new Error('Missing required sheet: ' + SCIIP_TIMELINE.SHEETS.EVENTS);
  }

  var timelineSheet = sciipEnsureAssetTimelineSheet_();

  var events = sciipReadSheetObjects_(eventsSheet);
  var existingTimeline = sciipReadSheetObjects_(timelineSheet);

  var existingKeys = {};
  existingTimeline.forEach(function(row) {
    if (row.Timeline_Key) {
      existingKeys[String(row.Timeline_Key)] = true;
    }
  });

  var rowsToAppend = [];
  var processed = 0;
  var skippedDuplicate = 0;
  var skippedUnsupported = 0;
  var skippedNoAsset = 0;

  events.forEach(function(eventRow) {
    var eventType = sciipFirstValue_(eventRow, [
      'Event_Type',
      'Type',
      'event_type'
    ]);

    if (!eventType) return;

    eventType = String(eventType).trim();

    if (SCIIP_TIMELINE.SUPPORTED_EVENT_TYPES.indexOf(eventType) === -1) {
      skippedUnsupported++;
      return;
    }

    var eventId = sciipFirstValue_(eventRow, [
      'Event_ID',
      'ID',
      'event_id'
    ]);

    var assetId = sciipResolveAssetIdForTimeline_(eventRow);

    if (!assetId) {
      skippedNoAsset++;
      return;
    }

    var eventDate = sciipFirstValue_(eventRow, [
      'Event_Date',
      'Observed_At',
      'Created_At',
      'Timestamp',
      'timestamp'
    ]) || startedAt;

    var timelineKey = sciipBuildTimelineKey_(assetId, eventId, eventType, eventDate);

    if (existingKeys[timelineKey]) {
      skippedDuplicate++;
      return;
    }

    var title = sciipTimelineTitle_(eventType, eventRow);
    var description = sciipTimelineDescription_(eventType, eventRow);

    var timelineId = sciipGenerateTimelineId_(timelineKey);

    rowsToAppend.push([
      timelineId,
      timelineKey,
      assetId,
      eventId || '',
      eventType,
      eventDate,
      title,
      description,
      sciipFirstValue_(eventRow, ['Source_Type', 'Source']) || '',
      sciipFirstValue_(eventRow, ['Source_ID', 'Source_Row_ID', 'Observation_ID']) || '',
      sciipFirstValue_(eventRow, ['Confidence', 'Match_Confidence']) || '',
      startedAt,
      Session.getActiveUser().getEmail()
    ]);

    existingKeys[timelineKey] = true;
    processed++;
  });

  if (rowsToAppend.length > 0) {
    timelineSheet
      .getRange(
        timelineSheet.getLastRow() + 1,
        1,
        rowsToAppend.length,
        SCIIP_TIMELINE.TIMELINE_HEADERS.length
      )
      .setValues(rowsToAppend);
  }

  var result = {
    processor: '80_EventTimelineProcessor',
    status: 'SUCCESS',
    processed: processed,
    appended: rowsToAppend.length,
    skippedDuplicate: skippedDuplicate,
    skippedUnsupported: skippedUnsupported,
    skippedNoAsset: skippedNoAsset,
    startedAt: startedAt,
    completedAt: new Date()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Creates ASSET_TIMELINE if missing.
 */
function sciipEnsureAssetTimelineSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_TIMELINE.SHEETS.TIMELINE);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_TIMELINE.SHEETS.TIMELINE);
  }

  var existingHeaders = [];
  if (sheet.getLastRow() > 0 && sheet.getLastColumn() > 0) {
    existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }

  if (sheet.getLastRow() === 0 || existingHeaders[0] !== 'Timeline_ID') {
    sheet.clear();
    sheet
      .getRange(1, 1, 1, SCIIP_TIMELINE.TIMELINE_HEADERS.length)
      .setValues([SCIIP_TIMELINE.TIMELINE_HEADERS]);

    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Resolves an event row to an Asset_ID.
 *
 * Priority:
 * 1. Direct Asset_ID on event
 * 2. Event Business_Key lookup in ASSET_REGISTRY
 * 3. Payload address/city/zip → derived business key → ASSET_REGISTRY
 */
function sciipResolveAssetIdForTimeline_(eventRow) {
  var assetId = sciipFirstValue_(eventRow, [
    'Asset_ID',
    'AssetId',
    'asset_id'
  ]);

  if (assetId) return assetId;

  var businessKey = sciipFirstValue_(eventRow, [
    'Business_Key',
    'BusinessKey',
    'business_key'
  ]);

  if (businessKey) {
    var resolvedByKey = sciipFindAssetIdByBusinessKey_(businessKey);
    if (resolvedByKey) return resolvedByKey;
  }

  var payloadRaw = sciipFirstValue_(eventRow, [
    'Payload',
    'payload'
  ]);

  if (!payloadRaw) return '';

  var payload;
  try {
    payload = typeof payloadRaw === 'string'
      ? JSON.parse(payloadRaw)
      : payloadRaw;
  } catch (err) {
    return '';
  }

  var address = payload.address || payload.Address || payload.rawAddress || payload.Raw_Address || '';
  var city = payload.city || payload.City || '';
  var zip = payload.zip || payload.Zip || payload.ZIP || '';

  if (!address || !city || !zip) return '';

  var derivedBusinessKey = sciipBuildAssetBusinessKeyFromParts_(address, city, zip);

  return sciipFindAssetIdByBusinessKey_(derivedBusinessKey);
}

/**
 * Looks up Asset_ID from ASSET_REGISTRY by Business_Key.
 */
function sciipFindAssetIdByBusinessKey_(businessKey) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_TIMELINE.SHEETS.ASSETS);

  if (!sheet) return '';

  var rows = sciipReadSheetObjects_(sheet);

  for (var i = 0; i < rows.length; i++) {
    var rowKey = sciipFirstValue_(rows[i], [
      'Business_Key',
      'BusinessKey',
      'business_key'
    ]);

    if (String(rowKey).trim() === String(businessKey).trim()) {
      return sciipFirstValue_(rows[i], [
        'Asset_ID',
        'AssetId',
        'asset_id'
      ]);
    }
  }

  return '';
}

  /**
 * Stable timeline idempotency key.
 */
function sciipBuildTimelineKey_(assetId, eventId, eventType, eventDate) {
  if (eventId) {
    return [
      'TIMELINE',
      String(assetId).trim(),
      String(eventId).trim(),
      String(eventType).trim()
    ].join('|');
  }

  var normalizedDate = eventDate instanceof Date
    ? eventDate.toISOString()
    : String(eventDate || '').trim();

  return [
    'TIMELINE',
    String(assetId).trim(),
    String(eventType).trim(),
    normalizedDate
  ].join('|');
}

function sciipBuildAssetBusinessKeyFromParts_(address, city, zip) {
  var normalizedAddress = sciipNormalizeBusinessKeyPart_(address);
  var normalizedCity = sciipNormalizeBusinessKeyPart_(city);
  var normalizedZip = String(zip || '').trim();

  return [
    'ASSET',
    normalizedAddress,
    normalizedCity,
    normalizedZip
  ].join('|');
}

/**
 * Normalizes address/city for business key generation.
 */
function sciipNormalizeBusinessKeyPart_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_');
}

/**
 * Reads a sheet into objects by header row.
 */
function sciipReadSheetObjects_(sheet) {
  var values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) {
    return [];
  }

  var headers = values[0].map(function(h) {
    return String(h).trim();
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
 * First non-empty value by possible column names.
 */
function sciipFirstValue_(obj, keys) {
  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
}

/**
 * Stable timeline idempotency key.
 */
function sciipBuildTimelineKey_(assetId, eventId, eventType, eventDate) {
  if (eventId) {
    return [
      'TIMELINE',
      String(assetId).trim(),
      String(eventId).trim(),
      String(eventType).trim()
    ].join('|');
  }

  var normalizedDate = eventDate instanceof Date
    ? eventDate.toISOString()
    : String(eventDate || '').trim();

  return [
    'TIMELINE',
    String(assetId).trim(),
    String(eventType).trim(),
    normalizedDate
  ].join('|');
}

/**
 * Timeline ID.
 */
function sciipGenerateTimelineId_(timelineKey) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    timelineKey
  );

  var hex = digest.map(function(byte) {
    var v = (byte < 0 ? byte + 256 : byte).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');

  return 'TIMELINE_' + hex.substring(0, 16).toUpperCase();
}

/**
 * Human title by event type.
 */
function sciipTimelineTitle_(eventType, row) {
  switch (eventType) {
    case 'PROPERTY_OBSERVED':
      return 'Property observed';
    case 'ASSET_CREATED':
      return 'Asset created';
    case 'ASSET_UPDATED':
      return 'Asset updated';
    case 'ALIAS_CREATED':
      return 'Property alias created';
    case 'GRAPH_NODE_CREATED':
      return 'Graph node created';
    case 'GRAPH_EDGE_CREATED':
      return 'Graph edge created';
    case 'CAMPUS_ASSIGNED':
      return 'Campus assigned';
    default:
      return eventType;
  }
}

/**
 * Human description by event type.
 */
function sciipTimelineDescription_(eventType, row) {
  var payload = sciipParsePayloadSafe_(row);

  var address =
    sciipFirstValue_(row, ['Address', 'Raw_Address', 'Property_Address']) ||
    payload.address ||
    payload.Address ||
    payload.rawAddress ||
    payload.Raw_Address ||
    '';

  var city =
    sciipFirstValue_(row, ['City']) ||
    payload.city ||
    payload.City ||
    '';

  var zip =
    sciipFirstValue_(row, ['Zip', 'ZIP']) ||
    payload.zip ||
    payload.Zip ||
    payload.ZIP ||
    '';

  var source = sciipFirstValue_(row, ['Source_Type', 'Source']) || payload.source || '';

  var location = [address, city, zip].filter(function(x) {
    return x && String(x).trim() !== '';
  }).join(', ');

  var base = '';

  switch (eventType) {
    case 'PROPERTY_OBSERVED':
      base = 'SCIIP observed a property record';
      break;
    case 'ASSET_CREATED':
      base = 'SCIIP created a canonical asset';
      break;
    case 'ASSET_UPDATED':
      base = 'SCIIP updated an existing asset';
      break;
    case 'ALIAS_CREATED':
      base = 'SCIIP created an alias for identity resolution';
      break;
    case 'GRAPH_NODE_CREATED':
      base = 'SCIIP created a graph node';
      break;
    case 'GRAPH_EDGE_CREATED':
      base = 'SCIIP created a graph edge';
      break;
    case 'CAMPUS_ASSIGNED':
      base = 'SCIIP assigned the asset to a campus';
      break;
    default:
      base = 'SCIIP recorded event ' + eventType;
  }

  if (location) {
    base += ': ' + location;
  }

  if (source) {
    base += ' | Source: ' + source;
  }

  return base;
}

/**
 * Safely parses event Payload.
 */
function sciipParsePayloadSafe_(row) {
  var payloadRaw = sciipFirstValue_(row, [
    'Payload',
    'payload'
  ]);

  if (!payloadRaw) return {};

  try {
    return typeof payloadRaw === 'string'
      ? JSON.parse(payloadRaw)
      : payloadRaw;
  } catch (err) {
    return {};
  }
}