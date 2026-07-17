/** SCIIP_OS compiled bundle: 01_runtime_001.gs
 * sources: 44
 * generated: 2026-07-17T18:10:17.256Z
 */
/*******************************************************
 * SCIIP_OS
 * 100_AssetProfileProcessor.gs
 *
 * Builds current-state asset profiles from SCIIP history.
 *
 * ASSET_REGISTRY
 * PROPERTY_EVENTS
 * ASSET_TIMELINE
 * GRAPH_NODE
 * GRAPH_EDGE
 *      ↓
 * ASSET_PROFILE
 *
 * Purpose:
 * - Current state answer layer
 * - Idempotent rebuild
 * - One row per asset
 *******************************************************/

var SCIIP_ASSET_PROFILE = SCIIP_ASSET_PROFILE || {};

SCIIP_ASSET_PROFILE.SHEETS = {
  ASSET_REGISTRY: 'ASSET_REGISTRY',
  PROPERTY_EVENTS: 'PROPERTY_EVENTS',
  ASSET_TIMELINE: 'ASSET_TIMELINE',
  GRAPH_NODE: 'GRAPH_NODE',
  GRAPH_EDGE: 'GRAPH_EDGE',
  ASSET_PROFILE: 'ASSET_PROFILE',
  PROFILE_LOG: 'ASSET_PROFILE_LOG'
};

SCIIP_ASSET_PROFILE.PROFILE_HEADERS = [
  'Asset_ID',
  'Business_Key',
  'Display_Name',
  'Address',
  'City',
  'Zip',
  'Current_Status',
  'Latest_Source',
  'Observation_Count',
  'Event_Count',
  'Timeline_Count',
  'First_Seen_At',
  'Last_Seen_At',
  'Latest_Event_Type',
  'Latest_Event_At',
  'Latest_Raw_Text',
  'Latest_Building_SF',
  'Latest_Land_Acres',
  'Latest_Clear_Height',
  'Latest_Dock_Doors',
  'Latest_GL_Doors',
  'Latest_Rate',
  'Latest_Sale_Price',
  'Graph_Node_Count',
  'Graph_Edge_Count',
  'Profile_Confidence',
  'Profile_Updated_At'
];

SCIIP_ASSET_PROFILE.LOG_HEADERS = [
  'Run_ID',
  'Processor',
  'Status',
  'Assets_Read',
  'Profiles_Written',
  'Started_At',
  'Completed_At',
  'Created_By'
];

function sciipRunAssetProfileProcessor() {
  return sciipProcessAssetProfiles();
}

function sciipProcessAssetProfiles() {
  var startedAt = new Date();

  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);

  var assetSheet = ss.getSheetByName(SCIIP_ASSET_PROFILE.SHEETS.ASSET_REGISTRY);
  if (!assetSheet) {
    throw new Error('Missing required sheet: ASSET_REGISTRY');
  }

  var profileSheet = sciipEnsureAssetProfileSheet_();
  var logSheet = sciipEnsureAssetProfileLogSheet_();

  var assets = sciipReadProfileObjects_(assetSheet);
  var events = sciipReadOptionalProfileObjects_(SCIIP_ASSET_PROFILE.SHEETS.PROPERTY_EVENTS);
  var timeline = sciipReadOptionalProfileObjects_(SCIIP_ASSET_PROFILE.SHEETS.ASSET_TIMELINE);
  var graphNodes = sciipReadOptionalProfileObjects_(SCIIP_ASSET_PROFILE.SHEETS.GRAPH_NODE);
  var graphEdges = sciipReadOptionalProfileObjects_(SCIIP_ASSET_PROFILE.SHEETS.GRAPH_EDGE);

  var eventsByAsset = sciipGroupByAssetProfile_(events);
  var timelineByAsset = sciipGroupByAssetProfile_(timeline);
  var graphNodeCounts = sciipCountGraphNodesByAsset_((graphNodes));
  var graphEdgeCounts = sciipCountGraphEdgesByAsset_(graphEdges);

  var profileRows = [];

  assets.forEach(function(asset) {
    var assetId = sciipFirstProfileValue_(asset, ['Asset_ID', 'AssetId', 'asset_id']);
    if (!assetId) return;

    var businessKey = sciipFirstProfileValue_(asset, ['Business_Key', 'BusinessKey', 'business_key']);
    var displayName = sciipFirstProfileValue_(asset, ['Display_Name', 'Name', 'Address']);
    var parsed = sciipParseAssetBusinessKey_(businessKey);

    var assetEvents = eventsByAsset[assetId] || [];
    var assetTimeline = timelineByAsset[assetId] || [];

    var latestEvent = sciipLatestProfileRow_(assetEvents, [
      'Created_At',
      'Event_Date',
      'Timestamp'
    ]);

    var latestTimeline = sciipLatestProfileRow_(assetTimeline, [
      'Event_Date',
      'Created_At'
    ]);

var latestObservationEvent =
  sciipLatestEventByType_(assetEvents, 'PROPERTY_OBSERVED');

if (!latestObservationEvent ||
    Object.keys(latestObservationEvent).length === 0) {
  latestObservationEvent = latestEvent;
}

var latestPayload =
  sciipParseProfilePayload_(latestObservationEvent);
    var firstSeenAt = sciipEarliestDateProfile_(assetEvents.concat(assetTimeline), [
      'Created_At',
      'Event_Date',
      'Timestamp'
    ]);

    var lastSeenAt = sciipLatestDateProfile_(assetEvents.concat(assetTimeline), [
      'Created_At',
      'Event_Date',
      'Timestamp'
    ]);

    var currentStatus =
      latestPayload.status ||
      latestPayload.Status ||
      sciipFirstProfileValue_(asset, ['Status']) ||
      'ACTIVE';

    var latestSource =
      sciipFirstProfileValue_(latestEvent, ['Source', 'Source_Type']) ||
      sciipFirstProfileValue_(latestTimeline, ['Source_Type', 'Source']) ||
      latestPayload.source ||
      '';

    var latestRawText =
  sciipFirstProfileValue_(latestObservationEvent, ['Raw_Text']) ||
  latestPayload.rawText ||
      latestPayload.Raw_Text ||
      sciipFirstProfileValue_(latestEvent, ['Raw_Text']) ||
      sciipFirstProfileValue_(latestTimeline, ['Timeline_Description']) ||
      '';

    var latestEventType =
      sciipFirstProfileValue_(latestEvent, ['Event_Type']) ||
      sciipFirstProfileValue_(latestTimeline, ['Event_Type']) ||
      '';

    var latestEventAt =
      sciipFirstProfileValue_(latestEvent, ['Created_At', 'Event_Date', 'Timestamp']) ||
      sciipFirstProfileValue_(latestTimeline, ['Event_Date', 'Created_At']) ||
      '';

    profileRows.push([
      assetId,
      businessKey,
      displayName || parsed.address,
      parsed.address,
      parsed.city,
      parsed.zip,
      currentStatus,
      latestSource,
      sciipCountEventType_(assetEvents, 'PROPERTY_OBSERVED'),
      assetEvents.length,
      assetTimeline.length,
      firstSeenAt,
      lastSeenAt,
      latestEventType,
      latestEventAt,
      latestRawText,
      sciipProfileValueFromPayloadOrRaw_(
  latestPayload,
  latestRawText,
  ['buildingSf', 'Building_SF', 'Available_SF'],
  'Building SF'
),
sciipProfileValueFromPayloadOrRaw_(
  latestPayload,
  latestRawText,
  ['landAcres', 'Land_Acres', 'Acres'],
  'Land Acres'
),
sciipProfileValueFromPayloadOrRaw_(
  latestPayload,
  latestRawText,
  ['clearHeight', 'Clear_Height', 'Clear'],
  'Clear Height'
),
sciipProfileValueFromPayloadOrRaw_(
  latestPayload,
  latestRawText,
  ['dockDoors', 'Dock_Doors', 'DH'],
  'Dock Doors'
),
sciipProfileValueFromPayloadOrRaw_(
  latestPayload,
  latestRawText,
  ['glDoors', 'GL_Doors', 'GL'],
  'GL Doors'
),
sciipProfileValueFromPayloadOrRaw_(
  latestPayload,
  latestRawText,
  ['rate', 'Rate'],
  'Rate'
),
sciipProfileValueFromPayloadOrRaw_(
  latestPayload,
  latestRawText,
  ['salePrice', 'Sale_Price', 'Price'],
  'Sale Price'
),
      graphNodeCounts[assetId] || 0,
      graphEdgeCounts[assetId] || 0,
      sciipCalculateProfileConfidence_(asset, assetEvents, assetTimeline),
      startedAt
    ]);
  });

  profileSheet.clear();
  profileSheet
    .getRange(1, 1, 1, SCIIP_ASSET_PROFILE.PROFILE_HEADERS.length)
    .setValues([SCIIP_ASSET_PROFILE.PROFILE_HEADERS]);
  profileSheet.setFrozenRows(1);

  if (profileRows.length > 0) {
    profileSheet
      .getRange(2, 1, profileRows.length, SCIIP_ASSET_PROFILE.PROFILE_HEADERS.length)
      .setValues(profileRows);
  }

  var completedAt = new Date();
  var runId = sciipAssetProfileId_('ASSET_PROFILE_RUN', startedAt.toISOString());

  logSheet.appendRow([
    runId,
    '100_AssetProfileProcessor',
    'SUCCESS',
    assets.length,
    profileRows.length,
    startedAt,
    completedAt,
    Session.getActiveUser().getEmail()
  ]);

  var result = {
    processor: '100_AssetProfileProcessor',
    status: 'SUCCESS',
    assetsRead: assets.length,
    profilesWritten: profileRows.length,
    startedAt: startedAt,
    completedAt: completedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAssetProfileSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_ASSET_PROFILE.SHEETS.ASSET_PROFILE);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_ASSET_PROFILE.SHEETS.ASSET_PROFILE);
  }

  return sheet;
}

function sciipEnsureAssetProfileLogSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_ASSET_PROFILE.SHEETS.PROFILE_LOG);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_ASSET_PROFILE.SHEETS.PROFILE_LOG);
    sheet
      .getRange(1, 1, 1, SCIIP_ASSET_PROFILE.LOG_HEADERS.length)
      .setValues([SCIIP_ASSET_PROFILE.LOG_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadOptionalProfileObjects_(sheetName) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  return sciipReadProfileObjects_(sheet);
}

function sciipReadProfileObjects_(sheet) {
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

function sciipGroupByAssetProfile_(rows) {
  var grouped = {};

  rows.forEach(function(row) {
    var assetId = sciipFirstProfileValue_(row, [
      'Asset_ID',
      'AssetId',
      'asset_id'
    ]);

    if (!assetId) {
      assetId = sciipResolveAssetIdForProfileEvent_(row);
    }

    if (!assetId) return;

    if (!grouped[assetId]) grouped[assetId] = [];

    grouped[assetId].push(row);
  });

  return grouped;
}

function sciipCountGraphNodesByAsset_(rows) {
  var counts = {};

  rows.forEach(function(row) {
    var nodeType = sciipFirstProfileValue_(row, ['Node_Type']);
    if (String(nodeType).toUpperCase() !== 'ASSET') return;

    var businessKey = sciipFirstProfileValue_(row, ['Business_Key']);
    var assetId = sciipFindAssetIdByBusinessKeyProfile_(businessKey);

    if (!assetId) return;

    counts[assetId] = (counts[assetId] || 0) + 1;
  });

  return counts;
}

function sciipCountGraphEdgesByAsset_(rows) {
  var counts = {};

  rows.forEach(function(row) {
    var fromId = sciipFirstProfileValue_(row, ['From_Node_ID', 'Source_Node_ID']);
    var toId = sciipFirstProfileValue_(row, ['To_Node_ID', 'Target_Node_ID']);

    var fromAssetId = sciipFindAssetIdByGraphNodeIdProfile_(fromId);
    var toAssetId = sciipFindAssetIdByGraphNodeIdProfile_(toId);

    if (fromAssetId) counts[fromAssetId] = (counts[fromAssetId] || 0) + 1;
    if (toAssetId && toAssetId !== fromAssetId) counts[toAssetId] = (counts[toAssetId] || 0) + 1;
  });

  return counts;
}

function sciipFindAssetIdByGraphNodeIdProfile_(nodeId) {
  if (!nodeId) return '';

  var nodes = sciipReadOptionalProfileObjects_(SCIIP_ASSET_PROFILE.SHEETS.GRAPH_NODE);

  for (var i = 0; i < nodes.length; i++) {
    var rowNodeId = sciipFirstProfileValue_(nodes[i], ['Node_ID']);
    if (String(rowNodeId).trim() !== String(nodeId).trim()) continue;

    var nodeType = sciipFirstProfileValue_(nodes[i], ['Node_Type']);
    if (String(nodeType).toUpperCase() !== 'ASSET') return '';

    var businessKey = sciipFirstProfileValue_(nodes[i], ['Business_Key']);
    return sciipFindAssetIdByBusinessKeyProfile_(businessKey);
  }

  return '';
}

function sciipFindAssetIdByBusinessKeyProfile_(businessKey) {
  if (!businessKey) return '';

  var assets = sciipReadOptionalProfileObjects_(SCIIP_ASSET_PROFILE.SHEETS.ASSET_REGISTRY);

  for (var i = 0; i < assets.length; i++) {
    var assetKey = sciipFirstProfileValue_(assets[i], ['Business_Key', 'BusinessKey']);
    if (String(assetKey).trim() === String(businessKey).trim()) {
      return sciipFirstProfileValue_(assets[i], ['Asset_ID', 'AssetId']);
    }
  }

  return '';
}

function sciipLatestProfileRow_(rows, dateKeys) {
  var latest = null;
  var latestTime = null;

  rows.forEach(function(row) {
    var value = sciipFirstProfileValue_(row, dateKeys);
    var time = sciipProfileDateValue_(value);

    if (!time) return;

    if (!latestTime || time.getTime() > latestTime.getTime()) {
      latestTime = time;
      latest = row;
    }
  });

  return latest || {};
}

function sciipLatestDateProfile_(rows, dateKeys) {
  var latestRow = sciipLatestProfileRow_(rows, dateKeys);
  return sciipFirstProfileValue_(latestRow, dateKeys);
}

function sciipEarliestDateProfile_(rows, dateKeys) {
  var earliest = null;
  var earliestRaw = '';

  rows.forEach(function(row) {
    var value = sciipFirstProfileValue_(row, dateKeys);
    var time = sciipProfileDateValue_(value);

    if (!time) return;

    if (!earliest || time.getTime() < earliest.getTime()) {
      earliest = time;
      earliestRaw = value;
    }
  });

  return earliestRaw;
}

function sciipProfileDateValue_(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  var parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;

  return parsed;
}

function sciipParseProfilePayload_(row) {
  var raw = sciipFirstProfileValue_(row || {}, ['Payload', 'payload']);

  if (!raw) return {};

  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err) {
    return {};
  }
}

function sciipParseAssetBusinessKey_(businessKey) {
  var result = {
    address: '',
    city: '',
    zip: ''
  };

  if (!businessKey) return result;

  var parts = String(businessKey).split('|');

  if (parts.length >= 4 && parts[0] === 'ASSET') {
    result.address = String(parts[1]).replace(/_/g, ' ');
    result.city = String(parts[2]).replace(/_/g, ' ');
    result.zip = String(parts[3]);
  }

  return result;
}

function sciipCountEventType_(rows, eventType) {
  var count = 0;

  rows.forEach(function(row) {
    var rowType = sciipFirstProfileValue_(row, ['Event_Type']);
    if (String(rowType).trim() === String(eventType).trim()) {
      count++;
    }
  });

  return count;
}

function sciipCalculateProfileConfidence_(asset, events, timeline) {
  var score = 50;

  if (asset) score += 10;
  if (events && events.length > 0) score += 15;
  if (timeline && timeline.length > 0) score += 15;
  if (events && events.length > 1) score += 5;
  if (timeline && timeline.length > 1) score += 5;

  if (score > 100) score = 100;

  return score;
}

function sciipFirstProfileValue_(obj, keys) {
  obj = obj || {};

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function sciipAssetProfileHash_(value) {
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

function sciipAssetProfileId_(prefix, seed) {
  return prefix + '_' + sciipAssetProfileHash_(seed);
}
function sciipExtractProfileFieldFromRawText_(rawText, label) {
  if (!rawText || !label) return '';

  var parts = String(rawText).split('|');

  for (var i = 0; i < parts.length; i++) {
    var part = String(parts[i]).trim();
    var prefix = label + ':';

    if (part.toUpperCase().indexOf(prefix.toUpperCase()) === 0) {
      return part.substring(prefix.length).trim();
    }
  }

  return '';
}

function sciipProfileValueFromPayloadOrRaw_(payload, rawText, payloadKeys, rawLabel) {
  payload = payload || {};

  for (var i = 0; i < payloadKeys.length; i++) {
    var value = payload[payloadKeys[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return sciipExtractProfileFieldFromRawText_(rawText, rawLabel);
}

function sciipLatestEventByType_(rows, eventType) {
  var filtered = rows.filter(function(row) {
    return String(
      sciipFirstProfileValue_(row, ['Event_Type'])
    ).toUpperCase() === String(eventType).toUpperCase();
  });

  return sciipLatestProfileRow_(filtered, [
    'Created_At',
    'Event_Date',
    'Timestamp'
  ]);
}

function sciipResolveAssetIdForProfileEvent_(eventRow) {
  var businessKey = sciipFirstProfileValue_(eventRow, [
    'Business_Key',
    'BusinessKey',
    'business_key'
  ]);

  if (businessKey) {
    var byKey = sciipFindAssetIdByBusinessKeyProfile_(businessKey);

    if (byKey) return byKey;
  }

  var payload = sciipParseProfilePayload_(eventRow);

  var address = payload.address || payload.Address || '';
  var city = payload.city || payload.City || '';
  var zip = payload.zip || payload.Zip || payload.ZIP || '';

  if (!address || !city || !zip) return '';

  var derivedBusinessKey =
    sciipProfileAssetBusinessKeyFromParts_(address, city, zip);

  return sciipFindAssetIdByBusinessKeyProfile_(derivedBusinessKey);
}

function sciipProfileAssetBusinessKeyFromParts_(address, city, zip) {
  return [
    'ASSET',
    sciipProfileBusinessKeyPart_(address),
    sciipProfileBusinessKeyPart_(city),
    String(zip || '').trim()
  ].join('|');
}

function sciipProfileBusinessKeyPart_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_');
}

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

/*******************************************************
 * SCIIP_OS
 * 120_CampusIntelligenceProcessor.gs
 *
 * Rolls asset profiles and market activity into campus /
 * market intelligence summaries.
 *
 * ASSET_PROFILE
 * MARKET_ACTIVITY
 * CAMPUS_REGISTRY
 *      ↓
 * CAMPUS_PROFILE
 *
 * Idempotent:
 * - Rebuilds CAMPUS_PROFILE from source data
 * - One row per campus
 *******************************************************/

var SCIIP_CAMPUS_INTEL = SCIIP_CAMPUS_INTEL || {};

SCIIP_CAMPUS_INTEL.SHEETS = {
  ASSET_PROFILE: 'ASSET_PROFILE',
  MARKET_ACTIVITY: 'MARKET_ACTIVITY',
  CAMPUS_REGISTRY: 'CAMPUS_REGISTRY',
  CAMPUS_PROFILE: 'CAMPUS_PROFILE',
  CAMPUS_PROFILE_LOG: 'CAMPUS_PROFILE_LOG'
};

SCIIP_CAMPUS_INTEL.PROFILE_HEADERS = [
  'Campus_ID',
  'Campus_Name',
  'Region',
  'City_Count',
  'Asset_Count',
  'Active_Asset_Count',
  'Total_Building_SF',
  'Total_Land_Acres',
  'Average_Clear_Height',
  'Average_Rate',
  'Market_Activity_Count',
  'New_Listing_Count',
  'Lease_Listing_Count',
  'Sale_Listing_Count',
  'Availability_Mention_Count',
  'Asset_Created_Count',
  'Latest_Activity_Date',
  'Latest_Activity_Type',
  'Latest_Activity_Summary',
  'Top_Cities',
  'Profile_Confidence',
  'Profile_Updated_At'
];

SCIIP_CAMPUS_INTEL.LOG_HEADERS = [
  'Run_ID',
  'Processor',
  'Status',
  'Assets_Read',
  'Activities_Read',
  'Campuses_Written',
  'Started_At',
  'Completed_At',
  'Created_By'
];

function sciipRunCampusIntelligenceProcessor() {
  return sciipProcessCampusIntelligence();
}

function sciipProcessCampusIntelligence() {
  var startedAt = new Date();

  var assetProfiles = sciipReadOptionalCampusObjects_(
    SCIIP_CAMPUS_INTEL.SHEETS.ASSET_PROFILE
  );

  var marketActivities = sciipReadOptionalCampusObjects_(
    SCIIP_CAMPUS_INTEL.SHEETS.MARKET_ACTIVITY
  );

  var campusRegistry = sciipReadOptionalCampusObjects_(
    SCIIP_CAMPUS_INTEL.SHEETS.CAMPUS_REGISTRY
  );

  var campusSheet = sciipEnsureCampusProfileSheet_();
  var logSheet = sciipEnsureCampusProfileLogSheet_();

  var campusIndex = sciipBuildCampusIndex_(campusRegistry);
  var assetsByCampus = {};
  var activitiesByCampus = {};

  assetProfiles.forEach(function(asset) {
    var campus = sciipResolveCampusForAsset_(asset, campusIndex);

    if (!assetsByCampus[campus.campusId]) {
      assetsByCampus[campus.campusId] = {
        campus: campus,
        assets: []
      };
    }

    assetsByCampus[campus.campusId].assets.push(asset);
  });

  marketActivities.forEach(function(activity) {
    var campus = sciipResolveCampusForActivity_(activity, assetProfiles, campusIndex);

    if (!activitiesByCampus[campus.campusId]) {
      activitiesByCampus[campus.campusId] = {
        campus: campus,
        activities: []
      };
    }

    activitiesByCampus[campus.campusId].activities.push(activity);
  });

  var campusIds = {};
  Object.keys(assetsByCampus).forEach(function(id) {
    campusIds[id] = true;
  });
  Object.keys(activitiesByCampus).forEach(function(id) {
    campusIds[id] = true;
  });

  var rows = [];

  Object.keys(campusIds).sort().forEach(function(campusId) {
    var campus =
      (assetsByCampus[campusId] && assetsByCampus[campusId].campus) ||
      (activitiesByCampus[campusId] && activitiesByCampus[campusId].campus) ||
      {
        campusId: campusId,
        campusName: campusId,
        region: ''
      };

    var assets = assetsByCampus[campusId]
      ? assetsByCampus[campusId].assets
      : [];

    var activities = activitiesByCampus[campusId]
      ? activitiesByCampus[campusId].activities
      : [];

    var latestActivity = sciipLatestCampusActivity_(activities);

    rows.push([
      campus.campusId,
      campus.campusName,
      campus.region,
      sciipCampusCityCount_(assets),
      assets.length,
      sciipCampusActiveAssetCount_(assets),
      sciipCampusSumNumber_(assets, ['Latest_Building_SF', 'Building_SF']),
      sciipCampusSumNumber_(assets, ['Latest_Land_Acres', 'Land_Acres']),
      sciipCampusAverageNumber_(assets, ['Latest_Clear_Height', 'Clear_Height']),
      sciipCampusAverageNumber_(assets, ['Latest_Rate', 'Rate']),
      activities.length,
      sciipCampusActivityTypeCount_(activities, ['PROPERTY_OBSERVED', 'NEW_LISTING']),
      sciipCampusActivityTypeCount_(activities, ['LEASE_LISTING']),
      sciipCampusActivityTypeCount_(activities, ['SALE_LISTING']),
      sciipCampusActivityTypeCount_(activities, ['AVAILABILITY_MENTION']),
      sciipCampusActivityTypeCount_(activities, ['ASSET_CREATED']),
      sciipFirstCampusValue_(latestActivity, ['Activity_Date', 'Created_At']),
      sciipFirstCampusValue_(latestActivity, ['Activity_Type']),
      sciipFirstCampusValue_(latestActivity, ['Summary']),
      sciipCampusTopCities_(assets),
      sciipCampusConfidence_(assets, activities),
      startedAt
    ]);
  });

  campusSheet.clear();
  campusSheet
    .getRange(1, 1, 1, SCIIP_CAMPUS_INTEL.PROFILE_HEADERS.length)
    .setValues([SCIIP_CAMPUS_INTEL.PROFILE_HEADERS]);
  campusSheet.setFrozenRows(1);

  if (rows.length > 0) {
    campusSheet
      .getRange(2, 1, rows.length, SCIIP_CAMPUS_INTEL.PROFILE_HEADERS.length)
      .setValues(rows);
  }

  var completedAt = new Date();
  var runId = sciipCampusId_('CAMPUS_PROFILE_RUN', startedAt.toISOString());

  logSheet.appendRow([
    runId,
    '120_CampusIntelligenceProcessor',
    'SUCCESS',
    assetProfiles.length,
    marketActivities.length,
    rows.length,
    startedAt,
    completedAt,
    Session.getActiveUser().getEmail()
  ]);

  var result = {
    processor: '120_CampusIntelligenceProcessor',
    status: 'SUCCESS',
    assetsRead: assetProfiles.length,
    activitiesRead: marketActivities.length,
    campusesWritten: rows.length,
    startedAt: startedAt,
    completedAt: completedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Builds city → campus index from CAMPUS_REGISTRY if available.
 */
function sciipBuildCampusIndex_(campusRows) {
  var index = {
    byCity: {}
  };

  campusRows.forEach(function(row) {
    var campusId = sciipFirstCampusValue_(row, [
      'Campus_ID',
      'CampusId',
      'campus_id'
    ]);

    var campusName = sciipFirstCampusValue_(row, [
      'Campus_Name',
      'Campus',
      'Name'
    ]);

    var region = sciipFirstCampusValue_(row, [
      'Region',
      'Market',
      'Submarket'
    ]);

    var city = sciipFirstCampusValue_(row, [
      'City',
      'Canonical_City'
    ]);

    if (!city) return;

    var normalizedCity = sciipNormalizeCampusToken_(city);

    index.byCity[normalizedCity] = {
      campusId: campusId || sciipCampusKeyFromName_(campusName || city),
      campusName: campusName || city,
      region: region || ''
    };
  });

  return index;
}

/**
 * Resolves campus for an asset.
 * Current version uses city-based campus logic.
 * Later version can be replaced with GIS polygon assignment.
 */
function sciipResolveCampusForAsset_(asset, campusIndex) {
  var city = sciipFirstCampusValue_(asset, [
    'City',
    'Canonical_City',
    'Asset_City'
  ]);

  var normalizedCity = sciipNormalizeCampusToken_(city);

  if (normalizedCity && campusIndex.byCity[normalizedCity]) {
    return campusIndex.byCity[normalizedCity];
  }

  var inferred = sciipInferCampusFromCity_(city);

  return inferred;
}

/**
 * Resolves campus for market activity.
 */
function sciipResolveCampusForActivity_(activity, assetProfiles, campusIndex) {
  var city = sciipFirstCampusValue_(activity, [
    'City',
    'Canonical_City'
  ]);

  if (city) {
    return sciipResolveCampusForAsset_({ City: city }, campusIndex);
  }

  var assetId = sciipFirstCampusValue_(activity, [
    'Asset_ID',
    'AssetId'
  ]);

  if (assetId) {
    for (var i = 0; i < assetProfiles.length; i++) {
      var rowAssetId = sciipFirstCampusValue_(assetProfiles[i], [
        'Asset_ID',
        'AssetId'
      ]);

      if (String(rowAssetId).trim() === String(assetId).trim()) {
        return sciipResolveCampusForAsset_(assetProfiles[i], campusIndex);
      }
    }
  }

  return {
    campusId: 'CAMPUS_UNKNOWN',
    campusName: 'Unknown',
    region: ''
  };
}

/**
 * Conservative SoCal city → campus inference.
 */
function sciipInferCampusFromCity_(city) {
  var normalized = sciipNormalizeCampusToken_(city);

  var southBay = [
    'CARSON',
    'COMPTON',
    'GARDENA',
    'HAWTHORNE',
    'LAWNDALE',
    'LONG BEACH',
    'LOS ANGELES',
    'PARAMOUNT',
    'RANCHO DOMINGUEZ',
    'REDONDO BEACH',
    'SIGNAL HILL',
    'TORRANCE',
    'WILMINGTON'
  ];

  var sanGabrielValley = [
    'ALHAMBRA',
    'AZUSA',
    'BALDWIN PARK',
    'CITY OF INDUSTRY',
    'COVINA',
    'DIAMOND BAR',
    'DUARTE',
    'EL MONTE',
    'GLENDORA',
    'IRWINDALE',
    'LA PUENTE',
    'MONROVIA',
    'POMONA',
    'ROSEMEAD',
    'SAN DIMAS',
    'SOUTH EL MONTE',
    'WALNUT',
    'WEST COVINA'
  ];

  var inlandEmpire = [
    'BLOOMINGTON',
    'CHINO',
    'CHINO HILLS',
    'COLTON',
    'CORONA',
    'FONTANA',
    'JURUPA VALLEY',
    'MIRA LOMA',
    'MORENO VALLEY',
    'ONTARIO',
    'PERRIS',
    'RANCHO CUCAMONGA',
    'REDLANDS',
    'RIALTO',
    'RIVERSIDE',
    'SAN BERNARDINO'
  ];

  var orangeCounty = [
    'ANAHEIM',
    'BREA',
    'BUENA PARK',
    'COSTA MESA',
    'FULLERTON',
    'GARDEN GROVE',
    'HUNTINGTON BEACH',
    'IRVINE',
    'LA HABRA',
    'ORANGE',
    'PLACENTIA',
    'SANTA ANA',
    'TUSTIN'
  ];

  if (southBay.indexOf(normalized) !== -1) {
    return {
      campusId: 'CAMPUS_SOUTH_BAY',
      campusName: 'South Bay / Ports',
      region: 'Los Angeles'
    };
  }

  if (sanGabrielValley.indexOf(normalized) !== -1) {
    return {
      campusId: 'CAMPUS_SAN_GABRIEL_VALLEY',
      campusName: 'San Gabriel Valley',
      region: 'Los Angeles'
    };
  }

  if (inlandEmpire.indexOf(normalized) !== -1) {
    return {
      campusId: 'CAMPUS_INLAND_EMPIRE',
      campusName: 'Inland Empire',
      region: 'Inland Empire'
    };
  }

  if (orangeCounty.indexOf(normalized) !== -1) {
    return {
      campusId: 'CAMPUS_ORANGE_COUNTY',
      campusName: 'Orange County',
      region: 'Orange County'
    };
  }

  if (normalized) {
    return {
      campusId: 'CAMPUS_' + normalized.replace(/\s+/g, '_'),
      campusName: city,
      region: ''
    };
  }

  return {
    campusId: 'CAMPUS_UNKNOWN',
    campusName: 'Unknown',
    region: ''
  };
}

function sciipEnsureCampusProfileSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_CAMPUS_INTEL.SHEETS.CAMPUS_PROFILE);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_CAMPUS_INTEL.SHEETS.CAMPUS_PROFILE);
  }

  return sheet;
}

function sciipEnsureCampusProfileLogSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_CAMPUS_INTEL.SHEETS.CAMPUS_PROFILE_LOG);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_CAMPUS_INTEL.SHEETS.CAMPUS_PROFILE_LOG);
    sheet
      .getRange(1, 1, 1, SCIIP_CAMPUS_INTEL.LOG_HEADERS.length)
      .setValues([SCIIP_CAMPUS_INTEL.LOG_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadOptionalCampusObjects_(sheetName) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

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

function sciipLatestCampusActivity_(activities) {
  var latest = {};
  var latestDate = null;

  activities.forEach(function(activity) {
    var value = sciipFirstCampusValue_(activity, [
      'Activity_Date',
      'Created_At'
    ]);

    var parsed = sciipCampusDate_(value);

    if (!parsed) return;

    if (!latestDate || parsed.getTime() > latestDate.getTime()) {
      latestDate = parsed;
      latest = activity;
    }
  });

  return latest;
}

function sciipCampusCityCount_(assets) {
  var cities = {};

  assets.forEach(function(asset) {
    var city = sciipNormalizeCampusToken_(
      sciipFirstCampusValue_(asset, ['City', 'Canonical_City'])
    );

    if (city) cities[city] = true;
  });

  return Object.keys(cities).length;
}

function sciipCampusActiveAssetCount_(assets) {
  var count = 0;

  assets.forEach(function(asset) {
    var status = sciipFirstCampusValue_(asset, [
      'Current_Status',
      'Status'
    ]);

    if (!status || String(status).toUpperCase() === 'ACTIVE') {
      count++;
    }
  });

  return count;
}

function sciipCampusActivityTypeCount_(activities, types) {
  var allowed = {};
  types.forEach(function(type) {
    allowed[String(type).toUpperCase()] = true;
  });

  var count = 0;

  activities.forEach(function(activity) {
    var type = sciipFirstCampusValue_(activity, ['Activity_Type']);
    if (allowed[String(type).toUpperCase()]) count++;
  });

  return count;
}

function sciipCampusTopCities_(assets) {
  var counts = {};

  assets.forEach(function(asset) {
    var city = sciipFirstCampusValue_(asset, ['City', 'Canonical_City']);
    if (!city) return;

    var key = sciipNormalizeCampusToken_(city);
    counts[key] = counts[key] || {
      city: city,
      count: 0
    };

    counts[key].count++;
  });

  return Object.keys(counts)
    .map(function(key) {
      return counts[key];
    })
    .sort(function(a, b) {
      return b.count - a.count;
    })
    .slice(0, 5)
    .map(function(item) {
      return item.city + ' (' + item.count + ')';
    })
    .join(', ');
}

function sciipCampusSumNumber_(rows, keys) {
  var total = 0;

  rows.forEach(function(row) {
    var value = sciipFirstCampusValue_(row, keys);
    var number = sciipCampusNumber_(value);

    if (number !== null) total += number;
  });

  return total;
}

function sciipCampusAverageNumber_(rows, keys) {
  var total = 0;
  var count = 0;

  rows.forEach(function(row) {
    var value = sciipFirstCampusValue_(row, keys);
    var number = sciipCampusNumber_(value);

    if (number !== null) {
      total += number;
      count++;
    }
  });

  if (count === 0) return '';

  return Math.round((total / count) * 100) / 100;
}

function sciipCampusNumber_(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  var cleaned = String(value)
    .replace(/[$,]/g, '')
    .replace(/[^\d.-]/g, '');

  if (cleaned === '') return null;

  var number = Number(cleaned);

  if (isNaN(number)) return null;

  return number;
}

function sciipCampusConfidence_(assets, activities) {
  var score = 50;

  if (assets.length > 0) score += 20;
  if (activities.length > 0) score += 20;
  if (assets.length > 5) score += 5;
  if (activities.length > 5) score += 5;

  if (score > 100) score = 100;

  return score;
}

function sciipFirstCampusValue_(obj, keys) {
  obj = obj || {};

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function sciipNormalizeCampusToken_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

function sciipCampusKeyFromName_(value) {
  return 'CAMPUS_' + sciipNormalizeCampusToken_(value).replace(/\s+/g, '_');
}

function sciipCampusDate_(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  var parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;

  return parsed;
}

function sciipCampusHash_(value) {
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

function sciipCampusId_(prefix, seed) {
  return prefix + '_' + sciipCampusHash_(seed);
}

/*******************************************************
 * SCIIP_OS
 * 130_IntelligenceQueryProcessor.gs
 *
 * Structured intelligence query layer.
 *
 * Reads:
 * - ASSET_PROFILE
 * - MARKET_ACTIVITY
 * - CAMPUS_PROFILE
 * - ASSET_TIMELINE
 *
 * Writes:
 * - INTELLIGENCE_QUERY
 * - INTELLIGENCE_RESPONSE
 *******************************************************/

var SCIIP_INTEL_QUERY = SCIIP_INTEL_QUERY || {};

SCIIP_INTEL_QUERY.SHEETS = {
  QUERY: 'INTELLIGENCE_QUERY',
  RESPONSE: 'INTELLIGENCE_RESPONSE',
  ASSET_PROFILE: 'ASSET_PROFILE',
  MARKET_ACTIVITY: 'MARKET_ACTIVITY',
  CAMPUS_PROFILE: 'CAMPUS_PROFILE',
  ASSET_TIMELINE: 'ASSET_TIMELINE'
};

SCIIP_INTEL_QUERY.QUERY_HEADERS = [
  'Query_ID',
  'Query_Type',
  'Query_Text',
  'Asset_ID',
  'Address',
  'City',
  'Campus_ID',
  'Status',
  'Created_At',
  'Processed_At'
];

SCIIP_INTEL_QUERY.RESPONSE_HEADERS = [
  'Response_ID',
  'Query_ID',
  'Query_Type',
  'Status',
  'Answer',
  'Evidence_Count',
  'Created_At'
];

function sciipRunIntelligenceQueryProcessor() {
  return sciipProcessIntelligenceQueries();
}

function sciipProcessIntelligenceQueries() {
  var startedAt = new Date();

  var querySheet = sciipEnsureIntelQuerySheet_();
  var responseSheet = sciipEnsureIntelResponseSheet_();

  var queries = sciipReadIntelObjects_(querySheet);
  var assetProfiles = sciipReadOptionalIntelObjects_(SCIIP_INTEL_QUERY.SHEETS.ASSET_PROFILE);
  var marketActivity = sciipReadOptionalIntelObjects_(SCIIP_INTEL_QUERY.SHEETS.MARKET_ACTIVITY);
  var campusProfiles = sciipReadOptionalIntelObjects_(SCIIP_INTEL_QUERY.SHEETS.CAMPUS_PROFILE);
  var timeline = sciipReadOptionalIntelObjects_(SCIIP_INTEL_QUERY.SHEETS.ASSET_TIMELINE);

  var rowsToAppend = [];
  var processed = 0;
  var skipped = 0;

  queries.forEach(function(query, index) {
    var status = sciipFirstIntelValue_(query, ['Status']);
    if (String(status).toUpperCase() !== 'PENDING') {
      skipped++;
      return;
    }

    var queryId = sciipFirstIntelValue_(query, ['Query_ID']);
    var queryType = sciipFirstIntelValue_(query, ['Query_Type']);
    var answer = sciipAnswerIntelQuery_(
      query,
      assetProfiles,
      marketActivity,
      campusProfiles,
      timeline
    );

    rowsToAppend.push([
      sciipIntelId_('RESPONSE', queryId + '|' + startedAt.toISOString()),
      queryId,
      queryType,
      answer.status,
      answer.text,
      answer.evidenceCount,
      startedAt
    ]);

    querySheet.getRange(index + 2, 8).setValue('PROCESSED');
    querySheet.getRange(index + 2, 10).setValue(startedAt);

    processed++;
  });

  if (rowsToAppend.length > 0) {
    responseSheet
      .getRange(
        responseSheet.getLastRow() + 1,
        1,
        rowsToAppend.length,
        SCIIP_INTEL_QUERY.RESPONSE_HEADERS.length
      )
      .setValues(rowsToAppend);
  }

  var result = {
    processor: '130_IntelligenceQueryProcessor',
    status: 'SUCCESS',
    queriesRead: queries.length,
    processed: processed,
    skipped: skipped,
    responsesWritten: rowsToAppend.length,
    startedAt: startedAt,
    completedAt: new Date()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Convenience test query creator.
 */
function sciipCreateIntelligenceQuery(queryType, queryText, options) {
  options = options || {};

  var sheet = sciipEnsureIntelQuerySheet_();
  var createdAt = new Date();

  var queryId = sciipIntelId_(
    'QUERY',
    [
      queryType,
      queryText,
      options.assetId || '',
      options.address || '',
      options.city || '',
      options.campusId || '',
      createdAt.toISOString()
    ].join('|')
  );

  sheet.appendRow([
    queryId,
    queryType,
    queryText || '',
    options.assetId || '',
    options.address || '',
    options.city || '',
    options.campusId || '',
    'PENDING',
    createdAt,
    ''
  ]);

  return {
    queryId: queryId,
    status: 'PENDING'
  };
}

/**
 * Test shortcut:
 * sciipAskAboutAsset('777 S Alameda St')
 */
function sciipAskAboutAsset(address) {
  return sciipCreateIntelligenceQuery(
    'ASSET_SUMMARY',
    'Tell me everything SCIIP knows about this asset',
    {
      address: address
    }
  );
}

/**
 * Main router.
 */
function sciipAnswerIntelQuery_(query, assets, activities, campuses, timeline) {
  var queryType = String(
    sciipFirstIntelValue_(query, ['Query_Type'])
  ).toUpperCase();

  if (queryType === 'ASSET_SUMMARY') {
    return sciipAnswerAssetSummary_(query, assets, activities, timeline);
  }

  if (queryType === 'MARKET_ACTIVITY') {
    return sciipAnswerMarketActivity_(query, activities);
  }

  if (queryType === 'CAMPUS_SUMMARY') {
    return sciipAnswerCampusSummary_(query, campuses, activities);
  }

  if (queryType === 'RECENT_CHANGES') {
    return sciipAnswerRecentChanges_(query, activities);
  }

  return {
    status: 'UNSUPPORTED_QUERY_TYPE',
    text: 'Unsupported query type: ' + queryType,
    evidenceCount: 0
  };
}

function sciipAnswerAssetSummary_(query, assets, activities, timeline) {
  var asset = sciipFindIntelAsset_(query, assets);

  if (!asset) {
    return {
      status: 'NO_MATCH',
      text: 'SCIIP could not find a matching asset profile for this query.',
      evidenceCount: 0
    };
  }

  var assetId = sciipFirstIntelValue_(asset, ['Asset_ID']);
  var assetActivities = activities.filter(function(row) {
    return String(sciipFirstIntelValue_(row, ['Asset_ID'])).trim() === String(assetId).trim();
  });

  var assetTimeline = timeline.filter(function(row) {
    return String(sciipFirstIntelValue_(row, ['Asset_ID'])).trim() === String(assetId).trim();
  });

  var latestActivity = sciipLatestIntelRow_(assetActivities, ['Activity_Date', 'Created_At']);

  var lines = [];

  lines.push('Asset Summary');
  lines.push('');
  lines.push('Asset ID: ' + assetId);
  lines.push('Address: ' + sciipFirstIntelValue_(asset, ['Address']));
  lines.push('City: ' + sciipFirstIntelValue_(asset, ['City']));
  lines.push('Zip: ' + sciipFirstIntelValue_(asset, ['Zip']));
  lines.push('Current Status: ' + sciipFirstIntelValue_(asset, ['Current_Status']));
  lines.push('Latest Source: ' + sciipFirstIntelValue_(asset, ['Latest_Source']));
  lines.push('Observation Count: ' + sciipFirstIntelValue_(asset, ['Observation_Count']));
  lines.push('Event Count: ' + sciipFirstIntelValue_(asset, ['Event_Count']));
  lines.push('Timeline Count: ' + sciipFirstIntelValue_(asset, ['Timeline_Count']));

  if (sciipFirstIntelValue_(asset, ['Latest_Building_SF'])) {
    lines.push('Latest Building SF: ' + sciipFirstIntelValue_(asset, ['Latest_Building_SF']));
  }

  if (sciipFirstIntelValue_(asset, ['Latest_Rate'])) {
    lines.push('Latest Rate: ' + sciipFirstIntelValue_(asset, ['Latest_Rate']));
  }

  if (assetActivities.length > 0) {
    lines.push('');
    lines.push('Latest Market Activity:');
    lines.push(sciipFirstIntelValue_(latestActivity, ['Summary']));
  }

  return {
    status: 'SUCCESS',
    text: lines.join('\n'),
    evidenceCount: 1 + assetActivities.length + assetTimeline.length
  };
}

function sciipAnswerMarketActivity_(query, activities) {
  var city = sciipNormalizeIntelToken_(sciipFirstIntelValue_(query, ['City']));
  var campusId = sciipNormalizeIntelToken_(sciipFirstIntelValue_(query, ['Campus_ID']));

  var filtered = activities.filter(function(row) {
    if (city) {
      return sciipNormalizeIntelToken_(sciipFirstIntelValue_(row, ['City'])) === city;
    }

    if (campusId) {
      return sciipNormalizeIntelToken_(sciipFirstIntelValue_(row, ['Campus_ID'])) === campusId;
    }

    return true;
  });

  filtered = sciipSortIntelRowsDesc_(filtered, ['Activity_Date', 'Created_At']).slice(0, 10);

  if (filtered.length === 0) {
    return {
      status: 'NO_ACTIVITY',
      text: 'SCIIP found no matching market activity.',
      evidenceCount: 0
    };
  }

  var lines = ['Market Activity', ''];

  filtered.forEach(function(row) {
    lines.push('- ' + sciipFirstIntelValue_(row, ['Summary']));
  });

  return {
    status: 'SUCCESS',
    text: lines.join('\n'),
    evidenceCount: filtered.length
  };
}

function sciipAnswerCampusSummary_(query, campuses, activities) {
  var campusId = sciipFirstIntelValue_(query, ['Campus_ID']);
  var city = sciipFirstIntelValue_(query, ['City']);

  var campus = null;

  if (campusId) {
    campus = campuses.filter(function(row) {
      return String(sciipFirstIntelValue_(row, ['Campus_ID'])).trim() === String(campusId).trim();
    })[0];
  }

  if (!campus && city) {
    campus = campuses.filter(function(row) {
      var topCities = String(sciipFirstIntelValue_(row, ['Top_Cities'])).toUpperCase();
      return topCities.indexOf(String(city).toUpperCase()) !== -1;
    })[0];
  }

  if (!campus && campuses.length === 1) {
    campus = campuses[0];
  }

  if (!campus) {
    return {
      status: 'NO_MATCH',
      text: 'SCIIP could not find a matching campus profile.',
      evidenceCount: 0
    };
  }

  var lines = [];

  lines.push('Campus Summary');
  lines.push('');
  lines.push('Campus: ' + sciipFirstIntelValue_(campus, ['Campus_Name']));
  lines.push('Region: ' + sciipFirstIntelValue_(campus, ['Region']));
  lines.push('Asset Count: ' + sciipFirstIntelValue_(campus, ['Asset_Count']));
  lines.push('Active Asset Count: ' + sciipFirstIntelValue_(campus, ['Active_Asset_Count']));
  lines.push('Total Building SF: ' + sciipFirstIntelValue_(campus, ['Total_Building_SF']));
  lines.push('Market Activity Count: ' + sciipFirstIntelValue_(campus, ['Market_Activity_Count']));
  lines.push('Lease Listing Count: ' + sciipFirstIntelValue_(campus, ['Lease_Listing_Count']));
  lines.push('Sale Listing Count: ' + sciipFirstIntelValue_(campus, ['Sale_Listing_Count']));
  lines.push('Latest Activity: ' + sciipFirstIntelValue_(campus, ['Latest_Activity_Summary']));
  lines.push('Top Cities: ' + sciipFirstIntelValue_(campus, ['Top_Cities']));

  return {
    status: 'SUCCESS',
    text: lines.join('\n'),
    evidenceCount: 1
  };
}

function sciipAnswerRecentChanges_(query, activities) {
  var sorted = sciipSortIntelRowsDesc_(activities, ['Activity_Date', 'Created_At']).slice(0, 10);

  if (sorted.length === 0) {
    return {
      status: 'NO_ACTIVITY',
      text: 'SCIIP found no recent changes.',
      evidenceCount: 0
    };
  }

  var lines = ['Recent Changes', ''];

  sorted.forEach(function(row) {
    lines.push('- ' + sciipFirstIntelValue_(row, ['Summary']));
  });

  return {
    status: 'SUCCESS',
    text: lines.join('\n'),
    evidenceCount: sorted.length
  };
}

function sciipFindIntelAsset_(query, assets) {
  var assetId = sciipFirstIntelValue_(query, ['Asset_ID']);
  var address = sciipNormalizeIntelToken_(sciipFirstIntelValue_(query, ['Address']));
  var city = sciipNormalizeIntelToken_(sciipFirstIntelValue_(query, ['City']));

  if (assetId) {
    for (var i = 0; i < assets.length; i++) {
      if (String(sciipFirstIntelValue_(assets[i], ['Asset_ID'])).trim() === String(assetId).trim()) {
        return assets[i];
      }
    }
  }

  if (address) {
    for (var j = 0; j < assets.length; j++) {
      var rowAddress = sciipNormalizeIntelToken_(sciipFirstIntelValue_(assets[j], ['Address']));

      if (rowAddress === address || rowAddress.indexOf(address) !== -1 || address.indexOf(rowAddress) !== -1) {
        if (!city || sciipNormalizeIntelToken_(sciipFirstIntelValue_(assets[j], ['City'])) === city) {
          return assets[j];
        }
      }
    }
  }

  return null;
}

function sciipEnsureIntelQuerySheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_INTEL_QUERY.SHEETS.QUERY);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_INTEL_QUERY.SHEETS.QUERY);
    sheet
      .getRange(1, 1, 1, SCIIP_INTEL_QUERY.QUERY_HEADERS.length)
      .setValues([SCIIP_INTEL_QUERY.QUERY_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipEnsureIntelResponseSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_INTEL_QUERY.SHEETS.RESPONSE);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_INTEL_QUERY.SHEETS.RESPONSE);
    sheet
      .getRange(1, 1, 1, SCIIP_INTEL_QUERY.RESPONSE_HEADERS.length)
      .setValues([SCIIP_INTEL_QUERY.RESPONSE_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadOptionalIntelObjects_(sheetName) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

  return sciipReadIntelObjects_(sheet);
}

function sciipReadIntelObjects_(sheet) {
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

function sciipFirstIntelValue_(obj, keys) {
  obj = obj || {};

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function sciipLatestIntelRow_(rows, dateKeys) {
  var sorted = sciipSortIntelRowsDesc_(rows, dateKeys);
  return sorted.length > 0 ? sorted[0] : {};
}

function sciipSortIntelRowsDesc_(rows, dateKeys) {
  return rows.slice().sort(function(a, b) {
    var aDate = sciipIntelDate_(sciipFirstIntelValue_(a, dateKeys));
    var bDate = sciipIntelDate_(sciipFirstIntelValue_(b, dateKeys));

    var aTime = aDate ? aDate.getTime() : 0;
    var bTime = bDate ? bDate.getTime() : 0;

    return bTime - aTime;
  });
}

function sciipIntelDate_(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  var parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;

  return parsed;
}

function sciipNormalizeIntelToken_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, ' ');
}

function sciipIntelHash_(value) {
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

function sciipIntelId_(prefix, seed) {
  return prefix + '_' + sciipIntelHash_(seed);
}

/*******************************************************
 * SCIIP_OS
 * 140_ChangeDetectionProcessor.gs
 *
 * Detects meaningful changes in asset state.
 *
 * Reads:
 * - ASSET_PROFILE
 * - MARKET_ACTIVITY
 *
 * Writes:
 * - ASSET_STATE
 * - CHANGE_EVENT
 * - CHANGE_DETECTION_LOG
 *******************************************************/

var SCIIP_CHANGE = SCIIP_CHANGE || {};

SCIIP_CHANGE.SHEETS = {
  ASSET_PROFILE: 'ASSET_PROFILE',
  MARKET_ACTIVITY: 'MARKET_ACTIVITY',
  ASSET_STATE: 'ASSET_STATE',
  CHANGE_EVENT: 'CHANGE_EVENT',
  CHANGE_LOG: 'CHANGE_DETECTION_LOG'
};

SCIIP_CHANGE.STATE_HEADERS = [
  'Asset_ID',
  'Business_Key',
  'Address',
  'City',
  'Zip',
  'Current_Status',
  'Latest_Source',
  'Latest_Building_SF',
  'Latest_Land_Acres',
  'Latest_Clear_Height',
  'Latest_Dock_Doors',
  'Latest_GL_Doors',
  'Latest_Rate',
  'Latest_Sale_Price',
  'Latest_Raw_Text',
  'Last_Seen_At',
  'State_Updated_At'
];

SCIIP_CHANGE.CHANGE_HEADERS = [
  'Change_ID',
  'Change_Key',
  'Asset_ID',
  'Business_Key',
  'Address',
  'City',
  'Zip',
  'Change_Type',
  'Field_Name',
  'Old_Value',
  'New_Value',
  'Delta',
  'Source',
  'Detected_At',
  'Summary',
  'Confidence'
];

SCIIP_CHANGE.LOG_HEADERS = [
  'Run_ID',
  'Processor',
  'Status',
  'Assets_Read',
  'States_Updated',
  'Changes_Detected',
  'Skipped_Duplicate',
  'Started_At',
  'Completed_At',
  'Created_By'
];

function sciipRunChangeDetectionProcessor() {
  return sciipProcessChangeDetection();
}

function sciipProcessChangeDetection() {
  var startedAt = new Date();

  var assets = sciipReadOptionalChangeObjects_(SCIIP_CHANGE.SHEETS.ASSET_PROFILE);
  var existingStates = sciipReadOptionalChangeObjects_(SCIIP_CHANGE.SHEETS.ASSET_STATE);
  var existingChanges = sciipReadOptionalChangeObjects_(SCIIP_CHANGE.SHEETS.CHANGE_EVENT);

  var stateSheet = sciipEnsureAssetStateSheet_();
  var changeSheet = sciipEnsureChangeEventSheet_();
  var logSheet = sciipEnsureChangeLogSheet_();

  var statesByAsset = sciipIndexChangeRows_(existingStates, 'Asset_ID');

  var existingChangeKeys = {};
  existingChanges.forEach(function(row) {
    var key = sciipFirstChangeValue_(row, ['Change_Key']);
    if (key) existingChangeKeys[String(key).trim()] = true;
  });

  var newStates = [];
  var changeRows = [];
  var skippedDuplicate = 0;

  assets.forEach(function(asset) {
    var assetId = sciipFirstChangeValue_(asset, ['Asset_ID']);
    if (!assetId) return;

    var previousState = statesByAsset[assetId] || {};
    var currentState = sciipBuildCurrentAssetState_(asset, startedAt);

    var changes = sciipDetectAssetChanges_(previousState, currentState, startedAt);

    changes.forEach(function(change) {
      if (existingChangeKeys[change.changeKey]) {
        skippedDuplicate++;
        return;
      }

      changeRows.push([
        change.changeId,
        change.changeKey,
        change.assetId,
        change.businessKey,
        change.address,
        change.city,
        change.zip,
        change.changeType,
        change.fieldName,
        change.oldValue,
        change.newValue,
        change.delta,
        change.source,
        startedAt,
        change.summary,
        change.confidence
      ]);

      existingChangeKeys[change.changeKey] = true;
    });

    newStates.push([
      currentState.assetId,
      currentState.businessKey,
      currentState.address,
      currentState.city,
      currentState.zip,
      currentState.currentStatus,
      currentState.latestSource,
      currentState.latestBuildingSf,
      currentState.latestLandAcres,
      currentState.latestClearHeight,
      currentState.latestDockDoors,
      currentState.latestGlDoors,
      currentState.latestRate,
      currentState.latestSalePrice,
      currentState.latestRawText,
      currentState.lastSeenAt,
      startedAt
    ]);
  });

  stateSheet.clear();
  stateSheet
    .getRange(1, 1, 1, SCIIP_CHANGE.STATE_HEADERS.length)
    .setValues([SCIIP_CHANGE.STATE_HEADERS]);
  stateSheet.setFrozenRows(1);

  if (newStates.length > 0) {
    stateSheet
      .getRange(2, 1, newStates.length, SCIIP_CHANGE.STATE_HEADERS.length)
      .setValues(newStates);
  }

  if (changeRows.length > 0) {
    changeSheet
      .getRange(
        changeSheet.getLastRow() + 1,
        1,
        changeRows.length,
        SCIIP_CHANGE.CHANGE_HEADERS.length
      )
      .setValues(changeRows);
  }

  var completedAt = new Date();
  var runId = sciipChangeId_('CHANGE_RUN', startedAt.toISOString());

  logSheet.appendRow([
    runId,
    '140_ChangeDetectionProcessor',
    'SUCCESS',
    assets.length,
    newStates.length,
    changeRows.length,
    skippedDuplicate,
    startedAt,
    completedAt,
    Session.getActiveUser().getEmail()
  ]);

  var result = {
    processor: '140_ChangeDetectionProcessor',
    status: 'SUCCESS',
    assetsRead: assets.length,
    statesUpdated: newStates.length,
    changesDetected: changeRows.length,
    skippedDuplicate: skippedDuplicate,
    startedAt: startedAt,
    completedAt: completedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildCurrentAssetState_(asset, updatedAt) {
  return {
    assetId: sciipFirstChangeValue_(asset, ['Asset_ID']),
    businessKey: sciipFirstChangeValue_(asset, ['Business_Key']),
    address: sciipFirstChangeValue_(asset, ['Address']),
    city: sciipFirstChangeValue_(asset, ['City']),
    zip: sciipFirstChangeValue_(asset, ['Zip']),
    currentStatus: sciipFirstChangeValue_(asset, ['Current_Status']),
    latestSource: sciipFirstChangeValue_(asset, ['Latest_Source']),
    latestBuildingSf: sciipFirstChangeValue_(asset, ['Latest_Building_SF']),
    latestLandAcres: sciipFirstChangeValue_(asset, ['Latest_Land_Acres']),
    latestClearHeight: sciipFirstChangeValue_(asset, ['Latest_Clear_Height']),
    latestDockDoors: sciipFirstChangeValue_(asset, ['Latest_Dock_Doors']),
    latestGlDoors: sciipFirstChangeValue_(asset, ['Latest_GL_Doors']),
    latestRate: sciipFirstChangeValue_(asset, ['Latest_Rate']),
    latestSalePrice: sciipFirstChangeValue_(asset, ['Latest_Sale_Price']),
    latestRawText: sciipFirstChangeValue_(asset, ['Latest_Raw_Text']),
    lastSeenAt: sciipFirstChangeValue_(asset, ['Last_Seen_At', 'Latest_Event_At']),
    updatedAt: updatedAt
  };
}

function sciipDetectAssetChanges_(previousState, currentState, detectedAt) {
  var assetId = currentState.assetId;
  var changes = [];

  if (!assetId) return changes;

  var hasPrevious = sciipFirstChangeValue_(previousState, ['Asset_ID']);

  if (!hasPrevious) {
    changes.push(
      sciipCreateChangeObject_(
        currentState,
        'ASSET_STATE_CREATED',
        'Asset_ID',
        '',
        assetId,
        '',
        detectedAt
      )
    );

    return changes;
  }

  var fields = [
    {
      key: 'currentStatus',
      header: 'Current_Status',
      type: 'STATUS_CHANGE'
    },
    {
      key: 'latestBuildingSf',
      header: 'Latest_Building_SF',
      type: 'BUILDING_SF_CHANGE'
    },
    {
      key: 'latestLandAcres',
      header: 'Latest_Land_Acres',
      type: 'LAND_ACRES_CHANGE'
    },
    {
      key: 'latestClearHeight',
      header: 'Latest_Clear_Height',
      type: 'CLEAR_HEIGHT_CHANGE'
    },
    {
      key: 'latestDockDoors',
      header: 'Latest_Dock_Doors',
      type: 'DOCK_DOOR_CHANGE'
    },
    {
      key: 'latestGlDoors',
      header: 'Latest_GL_Doors',
      type: 'GL_DOOR_CHANGE'
    },
    {
      key: 'latestRate',
      header: 'Latest_Rate',
      type: 'RATE_CHANGE'
    },
    {
      key: 'latestSalePrice',
      header: 'Latest_Sale_Price',
      type: 'SALE_PRICE_CHANGE'
    },
    {
      key: 'latestSource',
      header: 'Latest_Source',
      type: 'SOURCE_CHANGE'
    }
  ];

  fields.forEach(function(field) {
    var oldValue = sciipFirstChangeValue_(previousState, [field.header]);
    var newValue = currentState[field.key];

    if (sciipEquivalentChangeValue_(oldValue, newValue)) return;

    if (!oldValue && !newValue) return;

    changes.push(
      sciipCreateChangeObject_(
        currentState,
        field.type,
        field.header,
        oldValue,
        newValue,
        sciipChangeDelta_(oldValue, newValue),
        detectedAt
      )
    );
  });

  return changes;
}

function sciipCreateChangeObject_(state, changeType, fieldName, oldValue, newValue, delta, detectedAt) {
  var changeKey = [
    'CHANGE',
    state.assetId,
    changeType,
    fieldName,
    sciipNormalizeChangeValue_(oldValue),
    sciipNormalizeChangeValue_(newValue)
  ].join('|');

  var summary = sciipBuildChangeSummary_(
    state,
    changeType,
    fieldName,
    oldValue,
    newValue,
    delta
  );

  return {
    changeId: sciipChangeId_('CHANGE', changeKey),
    changeKey: changeKey,
    assetId: state.assetId,
    businessKey: state.businessKey,
    address: state.address,
    city: state.city,
    zip: state.zip,
    changeType: changeType,
    fieldName: fieldName,
    oldValue: oldValue,
    newValue: newValue,
    delta: delta,
    source: state.latestSource,
    summary: summary,
    confidence: sciipChangeConfidence_(changeType, oldValue, newValue)
  };
}

function sciipBuildChangeSummary_(state, changeType, fieldName, oldValue, newValue, delta) {
  var location = [state.address, state.city, state.zip]
    .filter(function(v) {
      return v && String(v).trim() !== '';
    })
    .join(', ');

  var summary = changeType;

  if (location) summary += ' | ' + location;

  summary += ' | ' + fieldName + ': ';
  summary += oldValue ? oldValue : '[blank]';
  summary += ' → ';
  summary += newValue ? newValue : '[blank]';

  if (delta) summary += ' | Delta: ' + delta;

  return summary;
}

function sciipChangeDelta_(oldValue, newValue) {
  var oldNumber = sciipChangeNumber_(oldValue);
  var newNumber = sciipChangeNumber_(newValue);

  if (oldNumber === null || newNumber === null) return '';

  var diff = newNumber - oldNumber;

  if (oldNumber === 0) return String(diff);

  var pct = diff / oldNumber;

  return (
    (diff >= 0 ? '+' : '') +
    diff.toFixed(2) +
    ' / ' +
    (pct >= 0 ? '+' : '') +
    (pct * 100).toFixed(2) +
    '%'
  );
}

function sciipEquivalentChangeValue_(a, b) {
  var left = sciipNormalizeChangeValue_(a);
  var right = sciipNormalizeChangeValue_(b);

  return left === right;
}

function sciipNormalizeChangeValue_(value) {
  if (value === null || value === undefined) return '';

  return String(value)
    .trim()
    .toUpperCase()
    .replace(/[$,]/g, '')
    .replace(/\s+/g, ' ');
}

function sciipChangeNumber_(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  var cleaned = String(value)
    .replace(/[$,]/g, '')
    .replace(/[^\d.-]/g, '');

  if (cleaned === '') return null;

  var number = Number(cleaned);

  if (isNaN(number)) return null;

  return number;
}

function sciipChangeConfidence_(changeType, oldValue, newValue) {
  var score = 70;

  if (changeType) score += 10;
  if (oldValue !== null && oldValue !== undefined && String(oldValue).trim() !== '') score += 10;
  if (newValue !== null && newValue !== undefined && String(newValue).trim() !== '') score += 10;

  if (score > 100) score = 100;

  return score;
}

function sciipEnsureAssetStateSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_CHANGE.SHEETS.ASSET_STATE);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_CHANGE.SHEETS.ASSET_STATE);
    sheet
      .getRange(1, 1, 1, SCIIP_CHANGE.STATE_HEADERS.length)
      .setValues([SCIIP_CHANGE.STATE_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipEnsureChangeEventSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_CHANGE.SHEETS.CHANGE_EVENT);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_CHANGE.SHEETS.CHANGE_EVENT);
    sheet
      .getRange(1, 1, 1, SCIIP_CHANGE.CHANGE_HEADERS.length)
      .setValues([SCIIP_CHANGE.CHANGE_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipEnsureChangeLogSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_CHANGE.SHEETS.CHANGE_LOG);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_CHANGE.SHEETS.CHANGE_LOG);
    sheet
      .getRange(1, 1, 1, SCIIP_CHANGE.LOG_HEADERS.length)
      .setValues([SCIIP_CHANGE.LOG_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadOptionalChangeObjects_(sheetName) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

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

function sciipIndexChangeRows_(rows, keyHeader) {
  var index = {};

  rows.forEach(function(row) {
    var key = sciipFirstChangeValue_(row, [keyHeader]);
    if (key) index[String(key).trim()] = row;
  });

  return index;
}

function sciipFirstChangeValue_(obj, keys) {
  obj = obj || {};

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function sciipChangeHash_(value) {
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

function sciipChangeId_(prefix, seed) {
  return prefix + '_' + sciipChangeHash_(seed);
}

/*******************************************************
 * SCIIP_OS
 * 150_MarketSignalProcessor.gs
 *
 * Converts CHANGE_EVENT rows into interpreted market signals.
 *
 * CHANGE_EVENT
 *      ↓
 * MARKET_SIGNAL
 *
 * Purpose:
 * - Interpret raw changes
 * - Rank importance
 * - Create analyst-ready market signals
 *******************************************************/

var SCIIP_SIGNAL = SCIIP_SIGNAL || {};

SCIIP_SIGNAL.SHEETS = {
  CHANGE_EVENT: 'CHANGE_EVENT',
  MARKET_SIGNAL: 'MARKET_SIGNAL',
  SIGNAL_LOG: 'MARKET_SIGNAL_LOG'
};

SCIIP_SIGNAL.SIGNAL_HEADERS = [
  'Signal_ID',
  'Signal_Key',
  'Asset_ID',
  'Business_Key',
  'Address',
  'City',
  'Zip',
  'Signal_Type',
  'Signal_Category',
  'Signal_Severity',
  'Change_Type',
  'Field_Name',
  'Old_Value',
  'New_Value',
  'Delta',
  'Source',
  'Signal_Date',
  'Signal_Summary',
  'Recommended_Action',
  'Confidence',
  'Created_At'
];

SCIIP_SIGNAL.LOG_HEADERS = [
  'Run_ID',
  'Processor',
  'Status',
  'Changes_Read',
  'Signals_Written',
  'Skipped_Duplicate',
  'Started_At',
  'Completed_At',
  'Created_By'
];

function sciipRunMarketSignalProcessor() {
  return sciipProcessMarketSignals();
}

function sciipProcessMarketSignals() {
  var startedAt = new Date();

  var changes = sciipReadOptionalSignalObjects_(SCIIP_SIGNAL.SHEETS.CHANGE_EVENT);
  var signalSheet = sciipEnsureMarketSignalSheet_();
  var logSheet = sciipEnsureMarketSignalLogSheet_();

  var existingSignals = sciipReadOptionalSignalObjects_(SCIIP_SIGNAL.SHEETS.MARKET_SIGNAL);
  var existingKeys = {};

  existingSignals.forEach(function(row) {
    var key = sciipFirstSignalValue_(row, ['Signal_Key']);
    if (key) existingKeys[String(key).trim()] = true;
  });

  var rowsToAppend = [];
  var skippedDuplicate = 0;

  changes.forEach(function(change) {
    var signal = sciipBuildSignalFromChange_(change, startedAt);

    if (!signal) return;

    if (existingKeys[signal.signalKey]) {
      skippedDuplicate++;
      return;
    }

    rowsToAppend.push([
      signal.signalId,
      signal.signalKey,
      signal.assetId,
      signal.businessKey,
      signal.address,
      signal.city,
      signal.zip,
      signal.signalType,
      signal.signalCategory,
      signal.signalSeverity,
      signal.changeType,
      signal.fieldName,
      signal.oldValue,
      signal.newValue,
      signal.delta,
      signal.source,
      signal.signalDate,
      signal.signalSummary,
      signal.recommendedAction,
      signal.confidence,
      startedAt
    ]);

    existingKeys[signal.signalKey] = true;
  });

  if (rowsToAppend.length > 0) {
    signalSheet
      .getRange(
        signalSheet.getLastRow() + 1,
        1,
        rowsToAppend.length,
        SCIIP_SIGNAL.SIGNAL_HEADERS.length
      )
      .setValues(rowsToAppend);
  }

  var completedAt = new Date();
  var runId = sciipSignalId_('SIGNAL_RUN', startedAt.toISOString());

  logSheet.appendRow([
    runId,
    '150_MarketSignalProcessor',
    'SUCCESS',
    changes.length,
    rowsToAppend.length,
    skippedDuplicate,
    startedAt,
    completedAt,
    Session.getActiveUser().getEmail()
  ]);

  var result = {
    processor: '150_MarketSignalProcessor',
    status: 'SUCCESS',
    changesRead: changes.length,
    signalsWritten: rowsToAppend.length,
    skippedDuplicate: skippedDuplicate,
    startedAt: startedAt,
    completedAt: completedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildSignalFromChange_(change, createdAt) {
  var changeType = sciipFirstSignalValue_(change, ['Change_Type']);
  if (!changeType) return null;

  var assetId = sciipFirstSignalValue_(change, ['Asset_ID']);
  var fieldName = sciipFirstSignalValue_(change, ['Field_Name']);
  var oldValue = sciipFirstSignalValue_(change, ['Old_Value']);
  var newValue = sciipFirstSignalValue_(change, ['New_Value']);
  var delta = sciipFirstSignalValue_(change, ['Delta']);

  var interpretation = sciipInterpretChangeAsSignal_(
    changeType,
    fieldName,
    oldValue,
    newValue,
    delta
  );

  if (!interpretation) return null;

  var signalDate =
    sciipFirstSignalValue_(change, ['Detected_At']) ||
    createdAt;

  var signalKey = [
    'SIGNAL',
    assetId,
    changeType,
    fieldName,
    sciipNormalizeSignalValue_(oldValue),
    sciipNormalizeSignalValue_(newValue),
    interpretation.signalType
  ].join('|');

  var address = sciipFirstSignalValue_(change, ['Address']);
  var city = sciipFirstSignalValue_(change, ['City']);
  var zip = sciipFirstSignalValue_(change, ['Zip']);

  var summary = sciipBuildSignalSummary_({
    signalType: interpretation.signalType,
    address: address,
    city: city,
    zip: zip,
    fieldName: fieldName,
    oldValue: oldValue,
    newValue: newValue,
    delta: delta
  });

  return {
    signalId: sciipSignalId_('SIGNAL', signalKey),
    signalKey: signalKey,
    assetId: assetId,
    businessKey: sciipFirstSignalValue_(change, ['Business_Key']),
    address: address,
    city: city,
    zip: zip,
    signalType: interpretation.signalType,
    signalCategory: interpretation.signalCategory,
    signalSeverity: interpretation.signalSeverity,
    changeType: changeType,
    fieldName: fieldName,
    oldValue: oldValue,
    newValue: newValue,
    delta: delta,
    source: sciipFirstSignalValue_(change, ['Source']),
    signalDate: signalDate,
    signalSummary: summary,
    recommendedAction: interpretation.recommendedAction,
    confidence: sciipSignalConfidence_(change, interpretation)
  };
}

function sciipInterpretChangeAsSignal_(changeType, fieldName, oldValue, newValue, delta) {
  var type = String(changeType || '').toUpperCase();

  if (type === 'ASSET_STATE_CREATED') {
    return {
      signalType: 'NEW_ASSET_STATE',
      signalCategory: 'INITIAL_STATE',
      signalSeverity: 'LOW',
      recommendedAction: 'No action required. Baseline state created.'
    };
  }

  if (type === 'RATE_CHANGE') {
    var oldNumber = sciipSignalNumber_(oldValue);
    var newNumber = sciipSignalNumber_(newValue);

    if (oldNumber !== null && newNumber !== null) {
      if (newNumber > oldNumber) {
        return {
          signalType: 'RENT_INCREASE_SIGNAL',
          signalCategory: 'PRICING',
          signalSeverity: sciipSignalSeverityFromPercent_(oldNumber, newNumber),
          recommendedAction: 'Review pricing movement and compare against nearby competing availability.'
        };
      }

      if (newNumber < oldNumber) {
        return {
          signalType: 'RENT_DECREASE_SIGNAL',
          signalCategory: 'PRICING',
          signalSeverity: sciipSignalSeverityFromPercent_(oldNumber, newNumber),
          recommendedAction: 'Review potential softening, concession pressure, or stale listing behavior.'
        };
      }
    }

    return {
      signalType: 'RATE_UPDATED_SIGNAL',
      signalCategory: 'PRICING',
      signalSeverity: 'MEDIUM',
      recommendedAction: 'Review updated asking rate.'
    };
  }

  if (type === 'SALE_PRICE_CHANGE') {
    return {
      signalType: 'SALE_PRICE_UPDATED_SIGNAL',
      signalCategory: 'PRICING',
      signalSeverity: 'MEDIUM',
      recommendedAction: 'Review updated sale pricing and compare against investment comps.'
    };
  }

  if (type === 'STATUS_CHANGE') {
    return {
      signalType: 'STATUS_CHANGE_SIGNAL',
      signalCategory: 'AVAILABILITY',
      signalSeverity: 'HIGH',
      recommendedAction: 'Review whether the asset moved on-market, off-market, leased, sold, or under contract.'
    };
  }

  if (type === 'BUILDING_SF_CHANGE') {
    return {
      signalType: 'BUILDING_SIZE_UPDATED_SIGNAL',
      signalCategory: 'PROPERTY_ATTRIBUTE',
      signalSeverity: 'MEDIUM',
      recommendedAction: 'Review whether this reflects corrected data, changed availability, or building subdivision.'
    };
  }

  if (type === 'LAND_ACRES_CHANGE') {
    return {
      signalType: 'LAND_AREA_UPDATED_SIGNAL',
      signalCategory: 'PROPERTY_ATTRIBUTE',
      signalSeverity: 'MEDIUM',
      recommendedAction: 'Review parcel/site area change and confirm against source documents.'
    };
  }

  if (type === 'CLEAR_HEIGHT_CHANGE') {
    return {
      signalType: 'CLEAR_HEIGHT_UPDATED_SIGNAL',
      signalCategory: 'PROPERTY_ATTRIBUTE',
      signalSeverity: 'LOW',
      recommendedAction: 'Verify physical spec change or corrected source data.'
    };
  }

  if (type === 'DOCK_DOOR_CHANGE' || type === 'GL_DOOR_CHANGE') {
    return {
      signalType: 'LOADING_SPEC_UPDATED_SIGNAL',
      signalCategory: 'PROPERTY_ATTRIBUTE',
      signalSeverity: 'LOW',
      recommendedAction: 'Verify loading information and reconcile with marketing materials.'
    };
  }

  if (type === 'SOURCE_CHANGE') {
    return {
      signalType: 'SOURCE_UPDATED_SIGNAL',
      signalCategory: 'DATA_QUALITY',
      signalSeverity: 'LOW',
      recommendedAction: 'Review source lineage if conflicting information appears.'
    };
  }

  return {
    signalType: 'GENERAL_CHANGE_SIGNAL',
    signalCategory: 'GENERAL',
    signalSeverity: 'LOW',
    recommendedAction: 'Review change event.'
  };
}

function sciipBuildSignalSummary_(obj) {
  var location = [obj.address, obj.city, obj.zip]
    .filter(function(v) {
      return v && String(v).trim() !== '';
    })
    .join(', ');

  var parts = [];

  parts.push(obj.signalType);

  if (location) parts.push(location);

  parts.push(obj.fieldName + ': ' + (obj.oldValue || '[blank]') + ' → ' + (obj.newValue || '[blank]'));

  if (obj.delta) {
    parts.push('Delta: ' + obj.delta);
  }

  return parts.join(' | ');
}

function sciipSignalSeverityFromPercent_(oldNumber, newNumber) {
  if (!oldNumber || oldNumber === 0) return 'MEDIUM';

  var pct = Math.abs((newNumber - oldNumber) / oldNumber);

  if (pct >= 0.15) return 'HIGH';
  if (pct >= 0.05) return 'MEDIUM';
  return 'LOW';
}

function sciipSignalConfidence_(change, interpretation) {
  var score = 70;

  if (sciipFirstSignalValue_(change, ['Asset_ID'])) score += 10;
  if (sciipFirstSignalValue_(change, ['Change_Type'])) score += 10;
  if (interpretation && interpretation.signalType) score += 10;

  if (score > 100) score = 100;

  return score;
}

function sciipEnsureMarketSignalSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_SIGNAL.SHEETS.MARKET_SIGNAL);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_SIGNAL.SHEETS.MARKET_SIGNAL);
    sheet
      .getRange(1, 1, 1, SCIIP_SIGNAL.SIGNAL_HEADERS.length)
      .setValues([SCIIP_SIGNAL.SIGNAL_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipEnsureMarketSignalLogSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_SIGNAL.SHEETS.SIGNAL_LOG);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_SIGNAL.SHEETS.SIGNAL_LOG);
    sheet
      .getRange(1, 1, 1, SCIIP_SIGNAL.LOG_HEADERS.length)
      .setValues([SCIIP_SIGNAL.LOG_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadOptionalSignalObjects_(sheetName) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

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

function sciipFirstSignalValue_(obj, keys) {
  obj = obj || {};

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function sciipNormalizeSignalValue_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[$,]/g, '')
    .replace(/\s+/g, ' ');
}

function sciipSignalNumber_(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  var cleaned = String(value)
    .replace(/[$,]/g, '')
    .replace(/[^\d.-]/g, '');

  if (cleaned === '') return null;

  var number = Number(cleaned);

  if (isNaN(number)) return null;

  return number;
}

function sciipSignalHash_(value) {
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

function sciipSignalId_(prefix, seed) {
  return prefix + '_' + sciipSignalHash_(seed);
}

/*******************************************************
 * SCIIP_OS
 * 160_MarketStatisticsProcessor.gs
 *
 * Builds market-level statistics from SCIIP intelligence.
 *
 * Reads:
 * - ASSET_PROFILE
 * - MARKET_ACTIVITY
 * - CHANGE_EVENT
 * - MARKET_SIGNAL
 * - CAMPUS_PROFILE
 *
 * Writes:
 * - MARKET_STATISTICS
 * - MARKET_STATISTICS_LOG
 *******************************************************/

var SCIIP_MARKET_STATS = SCIIP_MARKET_STATS || {};

SCIIP_MARKET_STATS.SHEETS = {
  ASSET_PROFILE: 'ASSET_PROFILE',
  MARKET_ACTIVITY: 'MARKET_ACTIVITY',
  CHANGE_EVENT: 'CHANGE_EVENT',
  MARKET_SIGNAL: 'MARKET_SIGNAL',
  CAMPUS_PROFILE: 'CAMPUS_PROFILE',
  MARKET_STATISTICS: 'MARKET_STATISTICS',
  MARKET_STATISTICS_LOG: 'MARKET_STATISTICS_LOG'
};

SCIIP_MARKET_STATS.STATS_HEADERS = [
  'Statistic_ID',
  'Market_Name',
  'Region',
  'Snapshot_Date',
  'Asset_Count',
  'Active_Asset_Count',
  'Campus_Count',
  'Total_Building_SF',
  'Total_Land_Acres',
  'Average_Clear_Height',
  'Average_Rate',
  'Market_Activity_Count',
  'Change_Event_Count',
  'Market_Signal_Count',
  'Rate_Increase_Count',
  'Rate_Decrease_Count',
  'New_Asset_State_Count',
  'Property_Attribute_Update_Count',
  'High_Severity_Signal_Count',
  'Medium_Severity_Signal_Count',
  'Low_Severity_Signal_Count',
  'Top_Cities',
  'Top_Signal_Types',
  'Latest_Signal_Date',
  'Latest_Signal_Summary',
  'Created_At'
];

SCIIP_MARKET_STATS.LOG_HEADERS = [
  'Run_ID',
  'Processor',
  'Status',
  'Assets_Read',
  'Activities_Read',
  'Changes_Read',
  'Signals_Read',
  'Statistics_Written',
  'Started_At',
  'Completed_At',
  'Created_By'
];

function sciipRunMarketStatisticsProcessor() {
  return sciipProcessMarketStatistics();
}

function sciipProcessMarketStatistics() {
  var startedAt = new Date();

  var assets = sciipReadOptionalMarketStatsObjects_(SCIIP_MARKET_STATS.SHEETS.ASSET_PROFILE);
  var activities = sciipReadOptionalMarketStatsObjects_(SCIIP_MARKET_STATS.SHEETS.MARKET_ACTIVITY);
  var changes = sciipReadOptionalMarketStatsObjects_(SCIIP_MARKET_STATS.SHEETS.CHANGE_EVENT);
  var signals = sciipReadOptionalMarketStatsObjects_(SCIIP_MARKET_STATS.SHEETS.MARKET_SIGNAL);
  var campuses = sciipReadOptionalMarketStatsObjects_(SCIIP_MARKET_STATS.SHEETS.CAMPUS_PROFILE);

  var statsSheet = sciipEnsureMarketStatisticsSheet_();
  var logSheet = sciipEnsureMarketStatisticsLogSheet_();

  var latestSignal = sciipLatestMarketStatsRow_(signals, ['Signal_Date', 'Created_At']);

  var row = [
    sciipMarketStatsId_('MARKET_STATS', startedAt.toISOString()),
    'Southern California Industrial Market',
    'Southern California',
    startedAt,
    assets.length,
    sciipStatsActiveAssetCount_(assets),
    campuses.length,
    sciipStatsSumNumber_(assets, ['Latest_Building_SF']),
    sciipStatsSumNumber_(assets, ['Latest_Land_Acres']),
    sciipStatsAverageNumber_(assets, ['Latest_Clear_Height']),
    sciipStatsAverageNumber_(assets, ['Latest_Rate']),
    activities.length,
    changes.length,
    signals.length,
    sciipStatsSignalTypeCount_(signals, ['RENT_INCREASE_SIGNAL']),
    sciipStatsSignalTypeCount_(signals, ['RENT_DECREASE_SIGNAL']),
    sciipStatsSignalTypeCount_(signals, ['NEW_ASSET_STATE']),
    sciipStatsSignalCategoryCount_(signals, ['PROPERTY_ATTRIBUTE']),
    sciipStatsSeverityCount_(signals, 'HIGH'),
    sciipStatsSeverityCount_(signals, 'MEDIUM'),
    sciipStatsSeverityCount_(signals, 'LOW'),
    sciipStatsTopCities_(assets),
    sciipStatsTopSignalTypes_(signals),
    sciipFirstMarketStatsValue_(latestSignal, ['Signal_Date', 'Created_At']),
    sciipFirstMarketStatsValue_(latestSignal, ['Signal_Summary']),
    startedAt
  ];

  statsSheet.appendRow(row);

  var completedAt = new Date();
  var runId = sciipMarketStatsId_('MARKET_STATS_RUN', startedAt.toISOString());

  logSheet.appendRow([
    runId,
    '160_MarketStatisticsProcessor',
    'SUCCESS',
    assets.length,
    activities.length,
    changes.length,
    signals.length,
    1,
    startedAt,
    completedAt,
    Session.getActiveUser().getEmail()
  ]);

  var result = {
    processor: '160_MarketStatisticsProcessor',
    status: 'SUCCESS',
    assetsRead: assets.length,
    activitiesRead: activities.length,
    changesRead: changes.length,
    signalsRead: signals.length,
    statisticsWritten: 1,
    startedAt: startedAt,
    completedAt: completedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureMarketStatisticsSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_MARKET_STATS.SHEETS.MARKET_STATISTICS);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_MARKET_STATS.SHEETS.MARKET_STATISTICS);
    sheet
      .getRange(1, 1, 1, SCIIP_MARKET_STATS.STATS_HEADERS.length)
      .setValues([SCIIP_MARKET_STATS.STATS_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipEnsureMarketStatisticsLogSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_MARKET_STATS.SHEETS.MARKET_STATISTICS_LOG);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_MARKET_STATS.SHEETS.MARKET_STATISTICS_LOG);
    sheet
      .getRange(1, 1, 1, SCIIP_MARKET_STATS.LOG_HEADERS.length)
      .setValues([SCIIP_MARKET_STATS.LOG_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadOptionalMarketStatsObjects_(sheetName) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

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

function sciipStatsActiveAssetCount_(assets) {
  var count = 0;

  assets.forEach(function(asset) {
    var status = sciipFirstMarketStatsValue_(asset, ['Current_Status', 'Status']);
    if (!status || String(status).toUpperCase() === 'ACTIVE') count++;
  });

  return count;
}

function sciipStatsSignalTypeCount_(signals, types) {
  var allowed = {};
  types.forEach(function(type) {
    allowed[String(type).toUpperCase()] = true;
  });

  var count = 0;

  signals.forEach(function(signal) {
    var type = sciipFirstMarketStatsValue_(signal, ['Signal_Type']);
    if (allowed[String(type).toUpperCase()]) count++;
  });

  return count;
}

function sciipStatsSignalCategoryCount_(signals, categories) {
  var allowed = {};
  categories.forEach(function(category) {
    allowed[String(category).toUpperCase()] = true;
  });

  var count = 0;

  signals.forEach(function(signal) {
    var category = sciipFirstMarketStatsValue_(signal, ['Signal_Category']);
    if (allowed[String(category).toUpperCase()]) count++;
  });

  return count;
}

function sciipStatsSeverityCount_(signals, severity) {
  var count = 0;

  signals.forEach(function(signal) {
    var rowSeverity = sciipFirstMarketStatsValue_(signal, ['Signal_Severity']);
    if (String(rowSeverity).toUpperCase() === String(severity).toUpperCase()) {
      count++;
    }
  });

  return count;
}

function sciipStatsTopCities_(assets) {
  var counts = {};

  assets.forEach(function(asset) {
    var city = sciipFirstMarketStatsValue_(asset, ['City']);
    if (!city) return;

    var key = sciipNormalizeMarketStatsToken_(city);

    counts[key] = counts[key] || {
      city: city,
      count: 0
    };

    counts[key].count++;
  });

  return Object.keys(counts)
    .map(function(key) {
      return counts[key];
    })
    .sort(function(a, b) {
      return b.count - a.count;
    })
    .slice(0, 10)
    .map(function(item) {
      return item.city + ' (' + item.count + ')';
    })
    .join(', ');
}

function sciipStatsTopSignalTypes_(signals) {
  var counts = {};

  signals.forEach(function(signal) {
    var type = sciipFirstMarketStatsValue_(signal, ['Signal_Type']);
    if (!type) return;

    counts[type] = counts[type] || 0;
    counts[type]++;
  });

  return Object.keys(counts)
    .map(function(type) {
      return {
        type: type,
        count: counts[type]
      };
    })
    .sort(function(a, b) {
      return b.count - a.count;
    })
    .slice(0, 10)
    .map(function(item) {
      return item.type + ' (' + item.count + ')';
    })
    .join(', ');
}

function sciipStatsSumNumber_(rows, keys) {
  var total = 0;

  rows.forEach(function(row) {
    var value = sciipFirstMarketStatsValue_(row, keys);
    var number = sciipMarketStatsNumber_(value);
    if (number !== null) total += number;
  });

  return total;
}

function sciipStatsAverageNumber_(rows, keys) {
  var total = 0;
  var count = 0;

  rows.forEach(function(row) {
    var value = sciipFirstMarketStatsValue_(row, keys);
    var number = sciipMarketStatsNumber_(value);

    if (number !== null) {
      total += number;
      count++;
    }
  });

  if (count === 0) return '';

  return Math.round((total / count) * 100) / 100;
}

function sciipMarketStatsNumber_(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  var cleaned = String(value)
    .replace(/[$,]/g, '')
    .replace(/[^\d.-]/g, '');

  if (cleaned === '') return null;

  var number = Number(cleaned);

  if (isNaN(number)) return null;

  return number;
}

function sciipLatestMarketStatsRow_(rows, dateKeys) {
  var latest = {};
  var latestDate = null;

  rows.forEach(function(row) {
    var value = sciipFirstMarketStatsValue_(row, dateKeys);
    var parsed = sciipMarketStatsDate_(value);

    if (!parsed) return;

    if (!latestDate || parsed.getTime() > latestDate.getTime()) {
      latestDate = parsed;
      latest = row;
    }
  });

  return latest;
}

function sciipMarketStatsDate_(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  var parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;

  return parsed;
}

function sciipFirstMarketStatsValue_(obj, keys) {
  obj = obj || {};

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function sciipNormalizeMarketStatsToken_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, ' ');
}

function sciipMarketStatsHash_(value) {
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

function sciipMarketStatsId_(prefix, seed) {
  return prefix + '_' + sciipMarketStatsHash_(seed);
}

/*******************************************************
 * SCIIP_OS
 * 170_GISIntelligenceProcessor.gs
 *
 * Geography-native intelligence layer.
 *
 * Reads:
 * - ASSET_PROFILE
 * - CAMPUS_PROFILE
 * - MARKET_SIGNAL
 *
 * Writes:
 * - GIS_ASSET_INDEX
 * - GIS_CLUSTER
 * - GIS_INTELLIGENCE_LOG
 *******************************************************/

var SCIIP_GIS_INTEL = SCIIP_GIS_INTEL || {};

SCIIP_GIS_INTEL.SHEETS = {
  ASSET_PROFILE: 'ASSET_PROFILE',
  CAMPUS_PROFILE: 'CAMPUS_PROFILE',
  MARKET_SIGNAL: 'MARKET_SIGNAL',
  GIS_ASSET_INDEX: 'GIS_ASSET_INDEX',
  GIS_CLUSTER: 'GIS_CLUSTER',
  GIS_LOG: 'GIS_INTELLIGENCE_LOG'
};

SCIIP_GIS_INTEL.ASSET_INDEX_HEADERS = [
  'Asset_ID',
  'Business_Key',
  'Address',
  'City',
  'Zip',
  'Latitude',
  'Longitude',
  'Geo_Source',
  'Campus_ID',
  'Campus_Name',
  'Region',
  'Latest_Rate',
  'Latest_Building_SF',
  'Latest_Clear_Height',
  'Signal_Count',
  'High_Severity_Signal_Count',
  'Latest_Signal_Type',
  'Latest_Signal_Date',
  'Geo_Confidence',
  'Updated_At'
];

SCIIP_GIS_INTEL.CLUSTER_HEADERS = [
  'Cluster_ID',
  'Cluster_Name',
  'Region',
  'Campus_ID',
  'Campus_Name',
  'Asset_Count',
  'Signal_Count',
  'High_Severity_Signal_Count',
  'Average_Rate',
  'Total_Building_SF',
  'Average_Clear_Height',
  'Top_Cities',
  'Latest_Signal_Date',
  'Latest_Signal_Type',
  'Cluster_Center_Latitude',
  'Cluster_Center_Longitude',
  'Cluster_Confidence',
  'Updated_At'
];

SCIIP_GIS_INTEL.LOG_HEADERS = [
  'Run_ID',
  'Processor',
  'Status',
  'Assets_Read',
  'Signals_Read',
  'Asset_Index_Written',
  'Clusters_Written',
  'Started_At',
  'Completed_At',
  'Created_By'
];

function sciipRunGISIntelligenceProcessor() {
  return sciipProcessGISIntelligence();
}

function sciipProcessGISIntelligence() {
  var startedAt = new Date();

  var assets = sciipReadOptionalGISObjects_(SCIIP_GIS_INTEL.SHEETS.ASSET_PROFILE);
  var campuses = sciipReadOptionalGISObjects_(SCIIP_GIS_INTEL.SHEETS.CAMPUS_PROFILE);
  var signals = sciipReadOptionalGISObjects_(SCIIP_GIS_INTEL.SHEETS.MARKET_SIGNAL);

  var assetIndexSheet = sciipEnsureGISAssetIndexSheet_();
  var clusterSheet = sciipEnsureGISClusterSheet_();
  var logSheet = sciipEnsureGISLogSheet_();

  var signalsByAsset = sciipGroupGISRowsBy_(signals, 'Asset_ID');
  var campusByName = sciipIndexGISCampuses_(campuses);

  var indexRows = [];

  assets.forEach(function(asset) {
    var assetId = sciipFirstGISValue_(asset, ['Asset_ID']);
    if (!assetId) return;

    var city = sciipFirstGISValue_(asset, ['City']);
    var geo = sciipResolveGISCoordinates_(asset);

    var campus = sciipResolveGISCampus_(asset, campusByName);
    var assetSignals = signalsByAsset[assetId] || [];
    var latestSignal = sciipLatestGISRow_(assetSignals, ['Signal_Date', 'Created_At']);

    indexRows.push([
      assetId,
      sciipFirstGISValue_(asset, ['Business_Key']),
      sciipFirstGISValue_(asset, ['Address']),
      city,
      sciipFirstGISValue_(asset, ['Zip']),
      geo.latitude,
      geo.longitude,
      geo.source,
      campus.campusId,
      campus.campusName,
      campus.region,
      sciipFirstGISValue_(asset, ['Latest_Rate']),
      sciipFirstGISValue_(asset, ['Latest_Building_SF']),
      sciipFirstGISValue_(asset, ['Latest_Clear_Height']),
      assetSignals.length,
      sciipGISSeverityCount_(assetSignals, 'HIGH'),
      sciipFirstGISValue_(latestSignal, ['Signal_Type']),
      sciipFirstGISValue_(latestSignal, ['Signal_Date', 'Created_At']),
      geo.confidence,
      startedAt
    ]);
  });

  var clusters = sciipBuildGISClusters_(indexRows, startedAt);

  assetIndexSheet.clear();
  assetIndexSheet
    .getRange(1, 1, 1, SCIIP_GIS_INTEL.ASSET_INDEX_HEADERS.length)
    .setValues([SCIIP_GIS_INTEL.ASSET_INDEX_HEADERS]);
  assetIndexSheet.setFrozenRows(1);

  if (indexRows.length > 0) {
    assetIndexSheet
      .getRange(2, 1, indexRows.length, SCIIP_GIS_INTEL.ASSET_INDEX_HEADERS.length)
      .setValues(indexRows);
  }

  clusterSheet.clear();
  clusterSheet
    .getRange(1, 1, 1, SCIIP_GIS_INTEL.CLUSTER_HEADERS.length)
    .setValues([SCIIP_GIS_INTEL.CLUSTER_HEADERS]);
  clusterSheet.setFrozenRows(1);

  if (clusters.length > 0) {
    clusterSheet
      .getRange(2, 1, clusters.length, SCIIP_GIS_INTEL.CLUSTER_HEADERS.length)
      .setValues(clusters);
  }

  var completedAt = new Date();
  var runId = sciipGISId_('GIS_RUN', startedAt.toISOString());

  logSheet.appendRow([
    runId,
    '170_GISIntelligenceProcessor',
    'SUCCESS',
    assets.length,
    signals.length,
    indexRows.length,
    clusters.length,
    startedAt,
    completedAt,
    Session.getActiveUser().getEmail()
  ]);

  var result = {
    processor: '170_GISIntelligenceProcessor',
    status: 'SUCCESS',
    assetsRead: assets.length,
    signalsRead: signals.length,
    assetIndexWritten: indexRows.length,
    clustersWritten: clusters.length,
    startedAt: startedAt,
    completedAt: completedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildGISClusters_(indexRows, updatedAt) {
  var groups = {};

  indexRows.forEach(function(row) {
    var obj = sciipGISAssetIndexRowToObject_(row);
    var key = obj.Campus_ID || obj.City || 'GIS_CLUSTER_UNKNOWN';

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(obj);
  });

  var rows = [];

  Object.keys(groups).sort().forEach(function(clusterKey) {
    var assets = groups[clusterKey];
    var first = assets[0] || {};

    var latestSignal = sciipLatestGISRow_(assets, ['Latest_Signal_Date']);

    rows.push([
      sciipGISId_('CLUSTER', clusterKey),
      first.Campus_Name || first.City || 'Unknown Cluster',
      first.Region || '',
      first.Campus_ID || '',
      first.Campus_Name || '',
      assets.length,
      sciipGISSumNumber_(assets, ['Signal_Count']),
      sciipGISSumNumber_(assets, ['High_Severity_Signal_Count']),
      sciipGISAverageNumber_(assets, ['Latest_Rate']),
      sciipGISSumNumber_(assets, ['Latest_Building_SF']),
      sciipGISAverageNumber_(assets, ['Latest_Clear_Height']),
      sciipGISTopCities_(assets),
      sciipFirstGISValue_(latestSignal, ['Latest_Signal_Date']),
      sciipFirstGISValue_(latestSignal, ['Latest_Signal_Type']),
      sciipGISAverageNumber_(assets, ['Latitude']),
      sciipGISAverageNumber_(assets, ['Longitude']),
      sciipGISClusterConfidence_(assets),
      updatedAt
    ]);
  });

  return rows;
}

function sciipGISAssetIndexRowToObject_(row) {
  var obj = {};
  SCIIP_GIS_INTEL.ASSET_INDEX_HEADERS.forEach(function(header, index) {
    obj[header] = row[index];
  });
  return obj;
}

function sciipResolveGISCoordinates_(asset) {
  var lat = sciipFirstGISValue_(asset, ['Latitude', 'Lat']);
  var lng = sciipFirstGISValue_(asset, ['Longitude', 'Lng', 'Long']);

  if (lat && lng) {
    return {
      latitude: lat,
      longitude: lng,
      source: 'ASSET_PROFILE',
      confidence: 95
    };
  }

  var city = sciipFirstGISValue_(asset, ['City']);
  var cityGeo = sciipApproximateCityCoordinates_(city);

  return {
    latitude: cityGeo.latitude,
    longitude: cityGeo.longitude,
    source: cityGeo.source,
    confidence: cityGeo.confidence
  };
}

function sciipApproximateCityCoordinates_(city) {
  var key = sciipNormalizeGISToken_(city);

  var coords = {
    'CARSON': [33.8317, -118.2817],
    'LONG BEACH': [33.7701, -118.1937],
    'GARDENA': [33.8883, -118.3089],
    'LOS ANGELES': [34.0522, -118.2437],
    'COMPTON': [33.8958, -118.2201],
    'TORRANCE': [33.8358, -118.3406],
    'RANCHO DOMINGUEZ': [33.8472, -118.2645],
    'WILMINGTON': [33.7701, -118.2620],
    'CITY OF INDUSTRY': [34.0197, -117.9587],
    'IRWINDALE': [34.1069, -117.9353],
    'ONTARIO': [34.0633, -117.6509],
    'FONTANA': [34.0922, -117.4350],
    'RIALTO': [34.1064, -117.3703],
    'SAN BERNARDINO': [34.1083, -117.2898],
    'RIVERSIDE': [33.9806, -117.3755],
    'PERRIS': [33.7825, -117.2286],
    'MORENO VALLEY': [33.9425, -117.2297],
    'ANAHEIM': [33.8366, -117.9143],
    'FULLERTON': [33.8704, -117.9242],
    'SANTA ANA': [33.7455, -117.8677],
    'IRVINE': [33.6846, -117.8265]
  };

  if (coords[key]) {
    return {
      latitude: coords[key][0],
      longitude: coords[key][1],
      source: 'CITY_APPROXIMATION',
      confidence: 60
    };
  }

  return {
    latitude: '',
    longitude: '',
    source: 'UNKNOWN',
    confidence: 0
  };
}

function sciipResolveGISCampus_(asset, campusByName) {
  var city = sciipFirstGISValue_(asset, ['City']);
  var inferred = sciipInferGISCampusFromCity_(city);

  if (campusByName[inferred.campusName]) {
    return campusByName[inferred.campusName];
  }

  return inferred;
}

function sciipIndexGISCampuses_(campuses) {
  var index = {};

  campuses.forEach(function(campus) {
    var name = sciipFirstGISValue_(campus, ['Campus_Name']);
    if (!name) return;

    index[name] = {
      campusId: sciipFirstGISValue_(campus, ['Campus_ID']),
      campusName: name,
      region: sciipFirstGISValue_(campus, ['Region'])
    };
  });

  return index;
}

function sciipInferGISCampusFromCity_(city) {
  var normalized = sciipNormalizeGISToken_(city);

  var southBay = [
    'CARSON',
    'COMPTON',
    'GARDENA',
    'LONG BEACH',
    'LOS ANGELES',
    'RANCHO DOMINGUEZ',
    'TORRANCE',
    'WILMINGTON'
  ];

  var inlandEmpire = [
    'ONTARIO',
    'FONTANA',
    'RIALTO',
    'RIVERSIDE',
    'SAN BERNARDINO',
    'MORENO VALLEY',
    'PERRIS'
  ];

  var sanGabrielValley = [
    'CITY OF INDUSTRY',
    'IRWINDALE',
    'EL MONTE',
    'SOUTH EL MONTE',
    'POMONA',
    'AZUSA'
  ];

  var orangeCounty = [
    'ANAHEIM',
    'FULLERTON',
    'SANTA ANA',
    'IRVINE',
    'TUSTIN',
    'ORANGE'
  ];

  if (southBay.indexOf(normalized) !== -1) {
    return {
      campusId: 'CAMPUS_SOUTH_BAY',
      campusName: 'South Bay / Ports',
      region: 'Los Angeles'
    };
  }

  if (inlandEmpire.indexOf(normalized) !== -1) {
    return {
      campusId: 'CAMPUS_INLAND_EMPIRE',
      campusName: 'Inland Empire',
      region: 'Inland Empire'
    };
  }

  if (sanGabrielValley.indexOf(normalized) !== -1) {
    return {
      campusId: 'CAMPUS_SAN_GABRIEL_VALLEY',
      campusName: 'San Gabriel Valley',
      region: 'Los Angeles'
    };
  }

  if (orangeCounty.indexOf(normalized) !== -1) {
    return {
      campusId: 'CAMPUS_ORANGE_COUNTY',
      campusName: 'Orange County',
      region: 'Orange County'
    };
  }

  return {
    campusId: normalized ? 'CAMPUS_' + normalized.replace(/\s+/g, '_') : 'CAMPUS_UNKNOWN',
    campusName: city || 'Unknown',
    region: ''
  };
}

function sciipEnsureGISAssetIndexSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_GIS_INTEL.SHEETS.GIS_ASSET_INDEX);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_GIS_INTEL.SHEETS.GIS_ASSET_INDEX);
  }

  return sheet;
}

function sciipEnsureGISClusterSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_GIS_INTEL.SHEETS.GIS_CLUSTER);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_GIS_INTEL.SHEETS.GIS_CLUSTER);
  }

  return sheet;
}

function sciipEnsureGISLogSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCIIP_GIS_INTEL.SHEETS.GIS_LOG);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_GIS_INTEL.SHEETS.GIS_LOG);
    sheet
      .getRange(1, 1, 1, SCIIP_GIS_INTEL.LOG_HEADERS.length)
      .setValues([SCIIP_GIS_INTEL.LOG_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadOptionalGISObjects_(sheetName) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

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

function sciipGroupGISRowsBy_(rows, keyHeader) {
  var grouped = {};

  rows.forEach(function(row) {
    var key = sciipFirstGISValue_(row, [keyHeader]);
    if (!key) return;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  });

  return grouped;
}

function sciipGISSeverityCount_(rows, severity) {
  var count = 0;

  rows.forEach(function(row) {
    var rowSeverity = sciipFirstGISValue_(row, ['Signal_Severity']);
    if (String(rowSeverity).toUpperCase() === String(severity).toUpperCase()) {
      count++;
    }
  });

  return count;
}

function sciipGISSumNumber_(rows, keys) {
  var total = 0;

  rows.forEach(function(row) {
    var value = sciipFirstGISValue_(row, keys);
    var number = sciipGISNumber_(value);
    if (number !== null) total += number;
  });

  return total;
}

function sciipGISAverageNumber_(rows, keys) {
  var total = 0;
  var count = 0;

  rows.forEach(function(row) {
    var value = sciipFirstGISValue_(row, keys);
    var number = sciipGISNumber_(value);

    if (number !== null) {
      total += number;
      count++;
    }
  });

  if (count === 0) return '';

  return Math.round((total / count) * 1000000) / 1000000;
}

function sciipGISTopCities_(assets) {
  var counts = {};

  assets.forEach(function(asset) {
    var city = sciipFirstGISValue_(asset, ['City']);
    if (!city) return;

    var key = sciipNormalizeGISToken_(city);
    counts[key] = counts[key] || {
      city: city,
      count: 0
    };

    counts[key].count++;
  });

  return Object.keys(counts)
    .map(function(key) {
      return counts[key];
    })
    .sort(function(a, b) {
      return b.count - a.count;
    })
    .slice(0, 5)
    .map(function(item) {
      return item.city + ' (' + item.count + ')';
    })
    .join(', ');
}

function sciipGISClusterConfidence_(assets) {
  if (!assets || assets.length === 0) return 0;

  var total = 0;

  assets.forEach(function(asset) {
    total += sciipGISNumber_(sciipFirstGISValue_(asset, ['Geo_Confidence'])) || 0;
  });

  return Math.round(total / assets.length);
}

function sciipLatestGISRow_(rows, dateKeys) {
  var latest = {};
  var latestDate = null;

  rows.forEach(function(row) {
    var value = sciipFirstGISValue_(row, dateKeys);
    var parsed = sciipGISDate_(value);

    if (!parsed) return;

    if (!latestDate || parsed.getTime() > latestDate.getTime()) {
      latestDate = parsed;
      latest = row;
    }
  });

  return latest;
}

function sciipGISNumber_(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  var cleaned = String(value)
    .replace(/[$,]/g, '')
    .replace(/[^\d.-]/g, '');

  if (cleaned === '') return null;

  var number = Number(cleaned);
  if (isNaN(number)) return null;

  return number;
}

function sciipGISDate_(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  var parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;

  return parsed;
}

function sciipFirstGISValue_(obj, keys) {
  obj = obj || {};

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function sciipNormalizeGISToken_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, ' ');
}

function sciipGISHash_(value) {
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

function sciipGISId_(prefix, seed) {
  return prefix + '_' + sciipGISHash_(seed);
}

var SCIIP_NLI = SCIIP_NLI || {};

SCIIP_NLI.SHEETS = {
  QUERY: 'INTELLIGENCE_QUERY',
  RESPONSE: 'INTELLIGENCE_RESPONSE',
  ASSET_PROFILE: 'ASSET_PROFILE',
  CHANGE_EVENT: 'CHANGE_EVENT',
  MARKET_SIGNAL: 'MARKET_SIGNAL',
  MARKET_STATISTICS: 'MARKET_STATISTICS',
  LOG: 'NLI_LOG'
};

function sciipRunNaturalLanguageIntelligenceProcessor() {
  return sciipProcessNaturalLanguageQueries();
}

function sciipProcessNaturalLanguageQueries() {

  var startedAt = new Date();

  var querySheet =
    SpreadsheetApp
      .openById(SCIIP.SPREADSHEET_ID)
      .getSheetByName(SCIIP_NLI.SHEETS.QUERY);

  var queries =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.QUERY
    );

  var existingResponses =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.RESPONSE
    );

  var responsesByQueryId = {};

  existingResponses.forEach(function(response) {
    var queryId =
      sciipFirstNLIValue_(response, ['Query_ID']);

    if (queryId) {
      responsesByQueryId[String(queryId).trim()] = true;
    }
  });

  var responsesSheet =
    sciipEnsureNLIResponseSheet_();

  var processed = 0;
  var skippedAlreadyProcessed = 0;
  var skippedDuplicateResponse = 0;

  queries.forEach(function(query, index) {

    var status =
      sciipFirstNLIValue_(query, ['Status']);

    var queryId =
      sciipFirstNLIValue_(query, ['Query_ID']);

    if (String(status).toUpperCase() === 'PROCESSED') {
      skippedAlreadyProcessed++;
      return;
    }

    if (responsesByQueryId[String(queryId).trim()]) {
      skippedDuplicateResponse++;

      if (querySheet) {
        querySheet.getRange(index + 2, 8).setValue('PROCESSED');
        querySheet.getRange(index + 2, 10).setValue(startedAt);
      }

      return;
    }

    var queryType =
      sciipFirstNLIValue_(query, ['Query_Type']);

    var answer =
      sciipExecuteNLIQuery_(queryType, query);

    responsesSheet.appendRow([
      sciipNLIId_('RESPONSE', queryId),
      queryId,
      queryType,
      answer.status,
      answer.text,
      answer.evidenceCount,
      startedAt
    ]);

    responsesByQueryId[String(queryId).trim()] = true;

    if (querySheet) {
      querySheet.getRange(index + 2, 8).setValue('PROCESSED');
      querySheet.getRange(index + 2, 10).setValue(startedAt);
    }

    processed++;

  });

  var result = {
    processor: '180_NaturalLanguageIntelligenceProcessor',
    status: 'SUCCESS',
    queriesRead: queries.length,
    processed: processed,
    skippedAlreadyProcessed: skippedAlreadyProcessed,
    skippedDuplicateResponse: skippedDuplicateResponse,
    completedAt: new Date()
  };

  Logger.log(JSON.stringify(result));

  return result;
}

function sciipExecuteNLIQuery_(queryType, query) {

  switch (String(queryType || '').toUpperCase()) {

    case 'ASSET_SUMMARY':
      return sciipNLIAssetSummary_(query);

    case 'MARKET_SUMMARY':
      return sciipNLIMarketSummary_();

    case 'RECENT_CHANGES':
      return sciipNLIRecentChanges_();

    case 'RECENT_SIGNALS':
      return sciipNLIRecentSignals_();

    case 'TOP_CITIES':
      return sciipNLITopCities_();

    case 'RENT_INCREASES':
      return sciipNLIRentIncreases_();

    case 'HIGH_SEVERITY_SIGNALS':
      return sciipNLIHighSeveritySignals_();

    case 'CITY_SUMMARY':
      return sciipNLICitySummary_(query);

    default:
      return {
        status: 'NO_MATCH',
        text: 'SCIIP could not understand this query.',
        evidenceCount: 0
      };
  }
}

function sciipNLIAssetSummary_(query) {

  var assetId =
    sciipFirstNLIValue_(query, ['Asset_ID']);

  var assets =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.ASSET_PROFILE
    );

  var asset = assets.find(function(row) {
    return sciipFirstNLIValue_(row, ['Asset_ID']) === assetId;
  });

  if (!asset) {
    return {
      status: 'NO_MATCH',
      text: 'Asset not found.',
      evidenceCount: 0
    };
  }

  var answer =
    'Asset Summary\n\n' +
    'Asset ID: ' + asset.Asset_ID + '\n' +
    'Address: ' + asset.Address + '\n' +
    'City: ' + asset.City + '\n' +
    'Zip: ' + asset.Zip + '\n' +
    'Rate: ' + asset.Latest_Rate + '\n' +
    'Building SF: ' + asset.Latest_Building_SF + '\n' +
    'Clear Height: ' + asset.Latest_Clear_Height;

  return {
    status: 'SUCCESS',
    text: answer,
    evidenceCount: 1
  };
}

function sciipNLIMarketSummary_() {

  var stats =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.MARKET_STATISTICS
    );

  if (!stats.length) {
    return {
      status: 'NO_MATCH',
      text: 'No market statistics available.',
      evidenceCount: 0
    };
  }

  var latest = stats[stats.length - 1];

  return {
    status: 'SUCCESS',
    text:
      'Market Summary\n\n' +
      'Assets: ' + latest.Asset_Count + '\n' +
      'Average Rate: ' + latest.Average_Rate + '\n' +
      'Signals: ' + latest.Market_Signal_Count,
    evidenceCount: 1
  };
}

function sciipNLIRecentChanges_() {

  var changes =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.CHANGE_EVENT
    );

  var recent =
    changes.slice(-10);

  return {
    status: 'SUCCESS',
    text:
      'Recent Changes\n\n' +
      recent.map(function(row) {
        return row.Change_Type +
          ' | ' +
          row.Address;
      }).join('\n'),
    evidenceCount: recent.length
  };
}

function sciipNLIRecentSignals_() {

  var signals =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.MARKET_SIGNAL
    );

  var recent =
    signals.slice(-10);

  return {
    status: 'SUCCESS',
    text:
      'Recent Signals\n\n' +
      recent.map(function(row) {
        return row.Signal_Type +
          ' | ' +
          row.Address;
      }).join('\n'),
    evidenceCount: recent.length
  };
}

function sciipNLITopCities_() {

  var stats =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.MARKET_STATISTICS
    );

  if (!stats.length) {
    return {
      status: 'NO_MATCH',
      text: 'No statistics available.',
      evidenceCount: 0
    };
  }

  var latest = stats[stats.length - 1];

  return {
    status: 'SUCCESS',
    text:
      'Top Cities\n\n' +
      latest.Top_Cities,
    evidenceCount: 1
  };
}

function sciipReadOptionalNLIObjects_(sheetName) {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

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

function sciipEnsureNLIResponseSheet_() {
  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  var sheet = ss.getSheetByName('INTELLIGENCE_RESPONSE');

  if (!sheet) {
    sheet = ss.insertSheet('INTELLIGENCE_RESPONSE');
    sheet.appendRow([
      'Response_ID',
      'Query_ID',
      'Query_Type',
      'Status',
      'Answer',
      'Evidence_Count',
      'Created_At'
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipFirstNLIValue_(obj, keys) {
  obj = obj || {};

  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function sciipNLIHash_(value) {
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

function sciipNLIId_(prefix, seed) {
  return prefix + '_' + sciipNLIHash_(seed);
}

function sciipNLIRentIncreases_() {

  var signals =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.MARKET_SIGNAL
    );

  var rentSignals = signals.filter(function(row) {
    return String(
      sciipFirstNLIValue_(row, ['Signal_Type'])
    ).toUpperCase() === 'RENT_INCREASE_SIGNAL';
  });

  rentSignals = sciipSortNLIRowsDesc_(
    rentSignals,
    ['Signal_Date', 'Created_At']
  ).slice(0, 10);

  if (!rentSignals.length) {
    return {
      status: 'NO_MATCH',
      text: 'SCIIP found no rent increase signals.',
      evidenceCount: 0
    };
  }

  return {
    status: 'SUCCESS',
    text:
      'Rent Increase Signals\n\n' +
      rentSignals.map(function(row) {
        return '- ' +
          sciipFirstNLIValue_(row, ['Address']) +
          ', ' +
          sciipFirstNLIValue_(row, ['City']) +
          ' | ' +
          sciipFirstNLIValue_(row, ['Old_Value']) +
          ' → ' +
          sciipFirstNLIValue_(row, ['New_Value']) +
          ' | ' +
          sciipFirstNLIValue_(row, ['Delta']);
      }).join('\n'),
    evidenceCount: rentSignals.length
  };
}

function sciipNLIHighSeveritySignals_() {

  var signals =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.MARKET_SIGNAL
    );

  var highSignals = signals.filter(function(row) {
    return String(
      sciipFirstNLIValue_(row, ['Signal_Severity'])
    ).toUpperCase() === 'HIGH';
  });

  highSignals = sciipSortNLIRowsDesc_(
    highSignals,
    ['Signal_Date', 'Created_At']
  ).slice(0, 10);

  if (!highSignals.length) {
    return {
      status: 'NO_MATCH',
      text: 'SCIIP found no high severity signals.',
      evidenceCount: 0
    };
  }

  return {
    status: 'SUCCESS',
    text:
      'High Severity Signals\n\n' +
      highSignals.map(function(row) {
        return '- ' +
          sciipFirstNLIValue_(row, ['Signal_Type']) +
          ' | ' +
          sciipFirstNLIValue_(row, ['Address']) +
          ', ' +
          sciipFirstNLIValue_(row, ['City']) +
          ' | ' +
          sciipFirstNLIValue_(row, ['Signal_Summary']);
      }).join('\n'),
    evidenceCount: highSignals.length
  };
}

function sciipNLICitySummary_(query) {

  var city =
    sciipFirstNLIValue_(query, ['City']);

  if (!city) {
    var text =
      sciipFirstNLIValue_(query, ['Query_Text']);

    city = sciipExtractKnownCityFromText_(text);
  }

  if (!city) {
    return {
      status: 'NO_MATCH',
      text: 'SCIIP could not identify a city for this query.',
      evidenceCount: 0
    };
  }

  var assets =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.ASSET_PROFILE
    );

  var signals =
    sciipReadOptionalNLIObjects_(
      SCIIP_NLI.SHEETS.MARKET_SIGNAL
    );

  var normalizedCity =
    sciipNormalizeNLIToken_(city);

  var cityAssets = assets.filter(function(row) {
    return sciipNormalizeNLIToken_(
      sciipFirstNLIValue_(row, ['City'])
    ) === normalizedCity;
  });

  var citySignals = signals.filter(function(row) {
    return sciipNormalizeNLIToken_(
      sciipFirstNLIValue_(row, ['City'])
    ) === normalizedCity;
  });

  var avgRate =
    sciipNLIAverageNumber_(cityAssets, ['Latest_Rate']);

  var latestSignal =
    sciipSortNLIRowsDesc_(
      citySignals,
      ['Signal_Date', 'Created_At']
    )[0] || {};

  return {
    status: 'SUCCESS',
    text:
      'City Summary: ' + city + '\n\n' +
      'Assets: ' + cityAssets.length + '\n' +
      'Signals: ' + citySignals.length + '\n' +
      'Average Rate: ' + (avgRate || '') + '\n' +
      'Latest Signal: ' +
        sciipFirstNLIValue_(latestSignal, ['Signal_Summary']),
    evidenceCount: cityAssets.length + citySignals.length
  };
}

function sciipSortNLIRowsDesc_(rows, dateKeys) {
  return rows.slice().sort(function(a, b) {
    var aDate =
      sciipNLIDate_(
        sciipFirstNLIValue_(a, dateKeys)
      );

    var bDate =
      sciipNLIDate_(
        sciipFirstNLIValue_(b, dateKeys)
      );

    var aTime = aDate ? aDate.getTime() : 0;
    var bTime = bDate ? bDate.getTime() : 0;

    return bTime - aTime;
  });
}

function sciipNLIDate_(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  var parsed = new Date(value);

  if (isNaN(parsed.getTime())) return null;

  return parsed;
}

function sciipNormalizeNLIToken_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, ' ');
}

function sciipNLIAverageNumber_(rows, keys) {
  var total = 0;
  var count = 0;

  rows.forEach(function(row) {
    var value =
      sciipFirstNLIValue_(row, keys);

    var number =
      sciipNLINumber_(value);

    if (number !== null) {
      total += number;
      count++;
    }
  });

  if (!count) return '';

  return Math.round((total / count) * 100) / 100;
}

function sciipNLINumber_(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return null;
  }

  var cleaned =
    String(value)
      .replace(/[$,]/g, '')
      .replace(/[^\d.-]/g, '');

  if (cleaned === '') return null;

  var number = Number(cleaned);

  if (isNaN(number)) return null;

  return number;
}

function sciipExtractKnownCityFromText_(text) {
  var normalized =
    sciipNormalizeNLIToken_(text);

  var cities = [
    'LOS ANGELES',
    'LONG BEACH',
    'CARSON',
    'GARDENA',
    'TORRANCE',
    'COMPTON',
    'ONTARIO',
    'FONTANA',
    'RIALTO',
    'RIVERSIDE',
    'SAN BERNARDINO',
    'CITY OF INDUSTRY',
    'IRWINDALE',
    'ANAHEIM',
    'SANTA ANA',
    'IRVINE'
  ];

  for (var i = 0; i < cities.length; i++) {
    if (normalized.indexOf(cities[i]) !== -1) {
      return cities[i];
    }
  }

  return '';
}

/************************************************************
 * 190_AutonomousResearchAgentProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * SCIIP asks SCIIP.
 *
 * Inputs:
 * - MARKET_SIGNAL
 * - CHANGE_EVENT
 * - MARKET_STATISTICS
 * - GIS_CLUSTER
 *
 * Outputs:
 * - RESEARCH_QUEUE
 * - RESEARCH_FINDINGS
 * - RESEARCH_INSIGHTS
 *
 * Design:
 * - Event sourced
 * - Knowledge graph native
 * - GIS native
 * - Idempotent
 * - Stable business keys
 * - No duplicate research questions
 ************************************************************/

const SCIIP_RESEARCH_QUEUE_SHEET = 'RESEARCH_QUEUE';
const SCIIP_RESEARCH_FINDINGS_SHEET = 'RESEARCH_FINDINGS';
const SCIIP_RESEARCH_INSIGHTS_SHEET = 'RESEARCH_INSIGHTS';

const SCIIP_RESEARCH_QUEUE_HEADERS = [
  'Research_ID',
  'Business_Key',
  'Source_Type',
  'Source_ID',
  'Source_Business_Key',
  'Asset_ID',
  'Asset_Business_Key',
  'Market',
  'Submarket',
  'City',
  'Cluster_ID',
  'Signal_Type',
  'Research_Question',
  'Research_Category',
  'Priority',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const SCIIP_RESEARCH_FINDINGS_HEADERS = [
  'Finding_ID',
  'Research_ID',
  'Research_Business_Key',
  'Finding_Business_Key',
  'Finding_Type',
  'Finding_Text',
  'Evidence_Source',
  'Evidence_ID',
  'Confidence',
  'Status',
  'Created_At',
  'Processor',
  'Notes'
];

const SCIIP_RESEARCH_INSIGHTS_HEADERS = [
  'Insight_ID',
  'Research_ID',
  'Research_Business_Key',
  'Insight_Business_Key',
  'Insight_Type',
  'Insight_Text',
  'Market',
  'Submarket',
  'City',
  'Asset_ID',
  'Cluster_ID',
  'Confidence',
  'Status',
  'Created_At',
  'Processor',
  'Notes'
];

/**
 * Main entry point.
 */
function sciipRunAutonomousResearchAgentProcessor() {
  const startedAt = new Date();
const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureAutonomousResearchSheets_(ss);

  const queueSheet = ss.getSheetByName(SCIIP_RESEARCH_QUEUE_SHEET);
  const existingResearchKeys = sciipGetExistingColumnValues_(queueSheet, 'Business_Key');

  const candidates = []
    .concat(sciipBuildResearchFromMarketSignals_(ss))
    .concat(sciipBuildResearchFromChangeEvents_(ss))
    .concat(sciipBuildResearchFromMarketStatistics_(ss))
    .concat(sciipBuildResearchFromGISClusters_(ss));

  let created = 0;
  let skippedDuplicate = 0;

  candidates.forEach(function(candidate) {
    if (!candidate || !candidate.Business_Key) return;

    if (existingResearchKeys.has(candidate.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(queueSheet, SCIIP_RESEARCH_QUEUE_HEADERS, candidate);
    existingResearchKeys.add(candidate.Business_Key);
    created++;
  });

  const result = {
    processor: '190_AutonomousResearchAgentProcessor',
    status: 'SUCCESS',
    candidatesGenerated: candidates.length,
    researchQuestionsCreated: created,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * One-time / safe repeated initializer.
 */
function sciipEnsureAutonomousResearchSheets_(ss) {
  sciipEnsureSheetWithHeaders_(ss, SCIIP_RESEARCH_QUEUE_SHEET, SCIIP_RESEARCH_QUEUE_HEADERS);
  sciipEnsureSheetWithHeaders_(ss, SCIIP_RESEARCH_FINDINGS_SHEET, SCIIP_RESEARCH_FINDINGS_HEADERS);
  sciipEnsureSheetWithHeaders_(ss, SCIIP_RESEARCH_INSIGHTS_SHEET, SCIIP_RESEARCH_INSIGHTS_HEADERS);
}

/************************************************************
 * SOURCE BUILDERS
 ************************************************************/

function sciipBuildResearchFromMarketSignals_(ss) {
  const sheet = ss.getSheetByName('MARKET_SIGNAL');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    const signalType = sciipFirstValue_(r, ['Signal_Type', 'SignalType', 'Type']);
    const sourceId = sciipFirstValue_(r, ['Signal_ID', 'Market_Signal_ID', 'ID']);
    const sourceKey = sciipFirstValue_(r, ['Business_Key', 'Signal_Business_Key']);
    const assetId = sciipFirstValue_(r, ['Asset_ID']);
    const assetKey = sciipFirstValue_(r, ['Asset_Business_Key']);
    const city = sciipFirstValue_(r, ['City']);
    const submarket = sciipFirstValue_(r, ['Submarket']);
    const market = sciipFirstValue_(r, ['Market']);
    const clusterId = sciipFirstValue_(r, ['Cluster_ID']);
    const confidence = sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score']));

    const q = sciipResearchQuestionForSignal_(signalType, r);
    if (!q) return;

    out.push(sciipCreateResearchCandidate_({
      Source_Type: 'MARKET_SIGNAL',
      Source_ID: sourceId,
      Source_Business_Key: sourceKey,
      Asset_ID: assetId,
      Asset_Business_Key: assetKey,
      Market: market,
      Submarket: submarket,
      City: city,
      Cluster_ID: clusterId,
      Signal_Type: signalType,
      Research_Question: q.question,
      Research_Category: q.category,
      Priority: q.priority,
      Confidence: confidence,
      Notes: q.notes
    }));
  });

  return out;
}

function sciipBuildResearchFromChangeEvents_(ss) {
  const sheet = ss.getSheetByName('CHANGE_EVENT');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    const changeType = sciipFirstValue_(r, ['Change_Type', 'Event_Type', 'Type']);
    const sourceId = sciipFirstValue_(r, ['Change_ID', 'Change_Event_ID', 'Event_ID', 'ID']);
    const sourceKey = sciipFirstValue_(r, ['Business_Key', 'Change_Business_Key']);
    const assetId = sciipFirstValue_(r, ['Asset_ID']);
    const assetKey = sciipFirstValue_(r, ['Asset_Business_Key']);
    const city = sciipFirstValue_(r, ['City']);
    const submarket = sciipFirstValue_(r, ['Submarket']);
    const market = sciipFirstValue_(r, ['Market']);

    const q = sciipResearchQuestionForChange_(changeType, r);
    if (!q) return;

    out.push(sciipCreateResearchCandidate_({
      Source_Type: 'CHANGE_EVENT',
      Source_ID: sourceId,
      Source_Business_Key: sourceKey,
      Asset_ID: assetId,
      Asset_Business_Key: assetKey,
      Market: market,
      Submarket: submarket,
      City: city,
      Cluster_ID: '',
      Signal_Type: changeType,
      Research_Question: q.question,
      Research_Category: q.category,
      Priority: q.priority,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: q.notes
    }));
  });

  return out;
}

function sciipBuildResearchFromMarketStatistics_(ss) {
  const sheet = ss.getSheetByName('MARKET_STATISTICS');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    const statType = sciipFirstValue_(r, ['Statistic_Type', 'Metric', 'Signal_Type', 'Type']);
    const sourceId = sciipFirstValue_(r, ['Statistic_ID', 'Market_Statistic_ID', 'ID']);
    const sourceKey = sciipFirstValue_(r, ['Business_Key', 'Statistic_Business_Key']);
    const city = sciipFirstValue_(r, ['City']);
    const submarket = sciipFirstValue_(r, ['Submarket']);
    const market = sciipFirstValue_(r, ['Market']);
    const count = Number(sciipFirstValue_(r, ['Count', 'Signal_Count', 'Observation_Count']) || 0);

    const q = sciipResearchQuestionForStatistic_(statType, r, count);
    if (!q) return;

    out.push(sciipCreateResearchCandidate_({
      Source_Type: 'MARKET_STATISTICS',
      Source_ID: sourceId,
      Source_Business_Key: sourceKey,
      Asset_ID: '',
      Asset_Business_Key: '',
      Market: market,
      Submarket: submarket,
      City: city,
      Cluster_ID: '',
      Signal_Type: statType,
      Research_Question: q.question,
      Research_Category: q.category,
      Priority: q.priority,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: q.notes
    }));
  });

  return out;
}

function sciipBuildResearchFromGISClusters_(ss) {
  const sheet = ss.getSheetByName('GIS_CLUSTER');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    const clusterId = sciipFirstValue_(r, ['Cluster_ID', 'GIS_Cluster_ID', 'ID']);
    const clusterType = sciipFirstValue_(r, ['Cluster_Type', 'Type', 'Signal_Type']);
    const city = sciipFirstValue_(r, ['City']);
    const submarket = sciipFirstValue_(r, ['Submarket']);
    const market = sciipFirstValue_(r, ['Market']);
    const activityCount = Number(sciipFirstValue_(r, ['Activity_Count', 'Asset_Count', 'Count']) || 0);

    const q = sciipResearchQuestionForGISCluster_(clusterType, r, activityCount);
    if (!q) return;

    out.push(sciipCreateResearchCandidate_({
      Source_Type: 'GIS_CLUSTER',
      Source_ID: clusterId,
      Source_Business_Key: sciipFirstValue_(r, ['Business_Key']),
      Asset_ID: '',
      Asset_Business_Key: '',
      Market: market,
      Submarket: submarket,
      City: city,
      Cluster_ID: clusterId,
      Signal_Type: clusterType,
      Research_Question: q.question,
      Research_Category: q.category,
      Priority: q.priority,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: q.notes
    }));
  });

  return out;
}

/************************************************************
 * QUESTION LOGIC
 ************************************************************/

function sciipResearchQuestionForSignal_(signalType, r) {
  const s = String(signalType || '').toUpperCase();
  const asset = sciipAssetLabel_(r);
  const city = sciipFirstValue_(r, ['City']) || 'this market';

  if (s.indexOf('RATE_INCREASE') >= 0 || s.indexOf('RENT_INCREASE') >= 0) {
    return {
      question: 'Why did the asking rate increase for ' + asset + '?',
      category: 'PRICING_POWER',
      priority: 'HIGH',
      notes: 'Generated from rate increase market signal.'
    };
  }

  if (s.indexOf('RATE_DECREASE') >= 0 || s.indexOf('RENT_DECREASE') >= 0) {
    return {
      question: 'Why did the asking rate decrease for ' + asset + '?',
      category: 'PRICING_WEAKNESS',
      priority: 'MEDIUM',
      notes: 'Generated from rate decrease market signal.'
    };
  }

  if (s.indexOf('AEROSPACE') >= 0 || s.indexOf('ADVANCED_MANUFACTURING') >= 0) {
    return {
      question: 'Is advanced manufacturing demand accelerating in ' + city + '?',
      category: 'ADVANCED_MANUFACTURING_DEMAND',
      priority: 'HIGH',
      notes: 'Generated from aerospace / advanced manufacturing signal.'
    };
  }

  if (s.indexOf('ACTIVITY_CLUSTER') >= 0 || s.indexOf('HIGH_ACTIVITY') >= 0) {
    return {
      question: 'What is driving elevated industrial activity in ' + city + '?',
      category: 'MARKET_ACTIVITY',
      priority: 'HIGH',
      notes: 'Generated from high activity market signal.'
    };
  }

  return null;
}

function sciipResearchQuestionForChange_(changeType, r) {
  const c = String(changeType || '').toUpperCase();
  const asset = sciipAssetLabel_(r);

  if (c.indexOf('RATE') >= 0 || c.indexOf('PRICE') >= 0) {
    return {
      question: 'What changed in the market position of ' + asset + '?',
      category: 'ASSET_POSITIONING',
      priority: 'HIGH',
      notes: 'Generated from pricing-related change event.'
    };
  }

  if (c.indexOf('STATUS') >= 0 || c.indexOf('AVAILABILITY') >= 0) {
    return {
      question: 'What does the status change at ' + asset + ' indicate about demand?',
      category: 'SUPPLY_DEMAND',
      priority: 'MEDIUM',
      notes: 'Generated from status / availability change event.'
    };
  }

  return null;
}

function sciipResearchQuestionForStatistic_(statType, r, count) {
  const s = String(statType || '').toUpperCase();
  const city = sciipFirstValue_(r, ['City']) || sciipFirstValue_(r, ['Submarket']) || 'this market';

  if ((s.indexOf('RATE_INCREASE') >= 0 || s.indexOf('RENT_INCREASE') >= 0) && count >= 3) {
    return {
      question: 'Is ' + city + ' experiencing upward rent pressure?',
      category: 'RENT_PRESSURE',
      priority: 'HIGH',
      notes: 'Generated from repeated rent increase statistics.'
    };
  }

  if (s.indexOf('ACTIVITY') >= 0 && count >= 3) {
    return {
      question: 'What is driving concentrated activity in ' + city + '?',
      category: 'MARKET_ACTIVITY',
      priority: 'HIGH',
      notes: 'Generated from market activity statistics.'
    };
  }

  return null;
}

function sciipResearchQuestionForGISCluster_(clusterType, r, activityCount) {
  const c = String(clusterType || '').toUpperCase();
  const city = sciipFirstValue_(r, ['City']) || sciipFirstValue_(r, ['Submarket']) || 'this cluster';

  if (activityCount >= 3 || c.indexOf('ACTIVITY') >= 0) {
    return {
      question: 'What is driving the industrial activity cluster in ' + city + '?',
      category: 'GIS_CLUSTER_ACTIVITY',
      priority: 'HIGH',
      notes: 'Generated from GIS cluster intelligence.'
    };
  }

  return null;
}

/************************************************************
 * RESEARCH OBJECT FACTORY
 ************************************************************/

function sciipCreateResearchCandidate_(o) {
  const now = new Date().toISOString();

  const sourceType = o.Source_Type || '';
  const sourceId = o.Source_ID || '';
  const question = o.Research_Question || '';
  const keyBasis = [
    sourceType,
    sourceId,
    o.Source_Business_Key || '',
    o.Asset_Business_Key || '',
    o.Cluster_ID || '',
    question
  ].join('|');

  const businessKey = 'RESEARCH|' + sciipStableHash_(keyBasis);

  return {
    Research_ID: 'RQ_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Source_Type: sourceType,
    Source_ID: sourceId,
    Source_Business_Key: o.Source_Business_Key || '',
    Asset_ID: o.Asset_ID || '',
    Asset_Business_Key: o.Asset_Business_Key || '',
    Market: o.Market || '',
    Submarket: o.Submarket || '',
    City: o.City || '',
    Cluster_ID: o.Cluster_ID || '',
    Signal_Type: o.Signal_Type || '',
    Research_Question: question,
    Research_Category: o.Research_Category || 'GENERAL_MARKET_RESEARCH',
    Priority: o.Priority || 'MEDIUM',
    Confidence: o.Confidence || 0.75,
    Status: 'PENDING',
    Created_At: now,
    Updated_At: now,
    Processor: '190_AutonomousResearchAgentProcessor',
    Notes: o.Notes || ''
  };
}

/************************************************************
 * OPTIONAL: SIMPLE FINDING / INSIGHT SEEDER
 * This does not answer research externally yet.
 * It records that a question was generated and awaits future research.
 ************************************************************/

function sciipSeedPendingResearchFindings() {
const ss = sciipGetRuntimeSpreadsheet_();  sciipEnsureAutonomousResearchSheets_(ss);

  const queue = ss.getSheetByName(SCIIP_RESEARCH_QUEUE_SHEET);
  const findings = ss.getSheetByName(SCIIP_RESEARCH_FINDINGS_SHEET);
  const insights = ss.getSheetByName(SCIIP_RESEARCH_INSIGHTS_SHEET);

  const queueRows = sciipReadSheetAsObjects_(queue);
  const existingFindings = sciipGetExistingColumnValues_(findings, 'Finding_Business_Key');
  const existingInsights = sciipGetExistingColumnValues_(insights, 'Insight_Business_Key');

  let findingsCreated = 0;
  let insightsCreated = 0;

  queueRows.forEach(function(r) {
    const researchId = r.Research_ID;
    const researchKey = r.Business_Key;
    if (!researchId || !researchKey) return;

    const findingKey = 'FINDING|' + sciipStableHash_(researchKey + '|INITIAL_PENDING_FINDING');
    if (!existingFindings.has(findingKey)) {
      sciipAppendObjectRow_(findings, SCIIP_RESEARCH_FINDINGS_HEADERS, {
        Finding_ID: 'RF_' + sciipStableHash_(findingKey).substring(0, 16),
        Research_ID: researchId,
        Research_Business_Key: researchKey,
        Finding_Business_Key: findingKey,
        Finding_Type: 'INITIAL_RESEARCH_PROMPT',
        Finding_Text: 'SCIIP generated an autonomous research question: ' + r.Research_Question,
        Evidence_Source: r.Source_Type,
        Evidence_ID: r.Source_ID,
        Confidence: r.Confidence,
        Status: 'PENDING_RESEARCH',
        Created_At: new Date().toISOString(),
        Processor: '190_AutonomousResearchAgentProcessor',
        Notes: 'Seed finding only. No external research performed.'
      });
      existingFindings.add(findingKey);
      findingsCreated++;
    }

    const insightKey = 'INSIGHT|' + sciipStableHash_(researchKey + '|INITIAL_INSIGHT_PLACEHOLDER');
    if (!existingInsights.has(insightKey)) {
      sciipAppendObjectRow_(insights, SCIIP_RESEARCH_INSIGHTS_HEADERS, {
        Insight_ID: 'RI_' + sciipStableHash_(insightKey).substring(0, 16),
        Research_ID: researchId,
        Research_Business_Key: researchKey,
        Insight_Business_Key: insightKey,
        Insight_Type: 'RESEARCH_AGENDA',
        Insight_Text: 'Autonomous research agenda item created: ' + r.Research_Question,
        Market: r.Market,
        Submarket: r.Submarket,
        City: r.City,
        Asset_ID: r.Asset_ID,
        Cluster_ID: r.Cluster_ID,
        Confidence: r.Confidence,
        Status: 'PENDING_RESEARCH',
        Created_At: new Date().toISOString(),
        Processor: '190_AutonomousResearchAgentProcessor',
        Notes: 'Insight placeholder for permanent intelligence history.'
      });
      existingInsights.add(insightKey);
      insightsCreated++;
    }
  });

  const result = {
    processor: '190_AutonomousResearchAgentProcessor.seed',
    status: 'SUCCESS',
    findingsCreated: findingsCreated,
    insightsCreated: insightsCreated,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestAutonomousResearchAgentProcessor() {
const ss = sciipGetRuntimeSpreadsheet_();  sciipEnsureAutonomousResearchSheets_(ss);

  const result = sciipRunAutonomousResearchAgentProcessor();
  const seed = sciipSeedPendingResearchFindings();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousResearchAgentProcessor',
    processorResult: result,
    seedResult: seed
  }));

  return {
    status: 'SUCCESS',
    processorResult: result,
    seedResult: seed
  };
}

/************************************************************
 * SHARED HELPERS
 * These are intentionally included here so this processor can run
 * even before shared helper consolidation.
 ************************************************************/

function sciipEnsureSheetWithHeaders_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  const existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
  const hasHeaders = existing.some(function(v) { return String(v || '').trim() !== ''; });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  const existingSet = new Set(existing.map(function(h) { return String(h || '').trim(); }));
  let col = existing.length;

  headers.forEach(function(h) {
    if (!existingSet.has(h)) {
      col++;
      sheet.getRange(1, col).setValue(h);
    }
  });

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipReadSheetAsObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(function(h) { return String(h || '').trim(); });

  return values
    .filter(function(row) {
      return row.some(function(v) { return String(v || '').trim() !== ''; });
    })
    .map(function(row) {
      const obj = {};
      headers.forEach(function(h, i) {
        obj[h] = row[i];
      });
      return obj;
    });
}

function sciipAppendObjectRow_(sheet, headers, obj) {
  const row = headers.map(function(h) {
    return obj[h] !== undefined ? obj[h] : '';
  });
  sheet.appendRow(row);
}

function sciipGetExistingColumnValues_(sheet, columnName) {
  const set = new Set();
  if (!sheet || sheet.getLastRow() < 2) return set;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function(h) { return String(h || '').trim(); });

  const idx = headers.indexOf(columnName);
  if (idx < 0) return set;

  const values = sheet.getRange(2, idx + 1, sheet.getLastRow() - 1, 1).getValues();
  values.forEach(function(r) {
    const v = String(r[0] || '').trim();
    if (v) set.add(v);
  });

  return set;
}

function sciipFirstValue_(obj, keys) {
  for (let i = 0; i < keys.length; i++) {
    const v = obj[keys[i]];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return '';
}

function sciipNormalizeConfidence_(v) {
  const n = Number(v);
  if (!isNaN(n) && n > 0) {
    if (n > 1) return Math.min(n / 100, 1);
    return Math.min(n, 1);
  }
  return 0.75;
}

function sciipAssetLabel_(r) {
  return (
    sciipFirstValue_(r, ['Address', 'Asset_Address', 'Property_Address']) ||
    sciipFirstValue_(r, ['Asset_Name', 'Property_Name']) ||
    sciipFirstValue_(r, ['Asset_ID']) ||
    'the asset'
  );
}

function sciipStableHash_(input) {
  const raw = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(input || ''),
    Utilities.Charset.UTF_8
  );

  return raw.map(function(b) {
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('').toUpperCase();
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const id =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (id) return SpreadsheetApp.openById(id);

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error(
    'No runtime spreadsheet found. Set Script Property SCIIP_SPREADSHEET_ID to the SCIIP workbook ID.'
  );
}

/************************************************************
 * 200_ResearchSynthesisProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * 190 asks the questions.
 * 200 begins answering them using internal SCIIP evidence.
 *
 * Input:
 * - RESEARCH_QUEUE
 * - MARKET_SIGNAL
 * - CHANGE_EVENT
 * - MARKET_STATISTICS
 * - GIS_CLUSTER
 * - ASSET_PROFILE
 * - MARKET_ACTIVITY
 * - CAMPUS_PROFILE
 *
 * Output:
 * - RESEARCH_FINDINGS
 *
 * Design:
 * - Event sourced
 * - Idempotent
 * - Evidence based
 * - No duplicate findings
 ************************************************************/

const SCIIP_RESEARCH_SYNTHESIS_PROCESSOR = '200_ResearchSynthesisProcessor';

function sciipRunResearchSynthesisProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_RESEARCH_FINDINGS_SHEET, SCIIP_RESEARCH_FINDINGS_HEADERS);

  const queueSheet = ss.getSheetByName(SCIIP_RESEARCH_QUEUE_SHEET);
  const findingsSheet = ss.getSheetByName(SCIIP_RESEARCH_FINDINGS_SHEET);

  if (!queueSheet) {
    throw new Error('Missing RESEARCH_QUEUE. Run 190 first.');
  }

  const researchRows = sciipReadSheetAsObjects_(queueSheet);
  const existingFindingKeys = sciipGetExistingColumnValues_(findingsSheet, 'Finding_Business_Key');

  let findingsCreated = 0;
  let researchReviewed = 0;
  let skippedNoEvidence = 0;
  let skippedDuplicate = 0;

  researchRows.forEach(function(research) {
    if (!research.Research_ID || !research.Business_Key) return;
    if (String(research.Status || '').toUpperCase() === 'CLOSED') return;

    researchReviewed++;

    const evidence = sciipCollectEvidenceForResearch_(ss, research);

    if (!evidence.length) {
      skippedNoEvidence++;
      return;
    }

    evidence.forEach(function(e) {
      const finding = sciipCreateResearchFinding_(research, e);

      if (existingFindingKeys.has(finding.Finding_Business_Key)) {
        skippedDuplicate++;
        return;
      }

      sciipAppendObjectRow_(findingsSheet, SCIIP_RESEARCH_FINDINGS_HEADERS, finding);
      existingFindingKeys.add(finding.Finding_Business_Key);
      findingsCreated++;
    });
  });

  const result = {
    processor: SCIIP_RESEARCH_SYNTHESIS_PROCESSOR,
    status: 'SUCCESS',
    researchReviewed: researchReviewed,
    findingsCreated: findingsCreated,
    skippedNoEvidence: skippedNoEvidence,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * EVIDENCE COLLECTION
 ************************************************************/

function sciipCollectEvidenceForResearch_(ss, research) {
  const evidence = [];

  evidence.push.apply(evidence, sciipEvidenceFromMarketSignals_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromChangeEvents_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromMarketStatistics_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromGISClusters_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromAssetProfiles_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromMarketActivity_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromCampusProfiles_(ss, research));

  return evidence;
}

function sciipEvidenceFromMarketSignals_(ss, research) {
  const sheet = ss.getSheetByName('MARKET_SIGNAL');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const signalType = sciipFirstValue_(r, ['Signal_Type', 'SignalType', 'Type']);
    const sourceId = sciipFirstValue_(r, ['Signal_ID', 'Market_Signal_ID', 'ID']);

    out.push({
      Finding_Type: 'MARKET_SIGNAL_EVIDENCE',
      Finding_Text: 'Market signal detected: ' + signalType + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'MARKET_SIGNAL',
      Evidence_ID: sourceId,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: 'Evidence matched to autonomous research question.'
    });
  });

  return out;
}

function sciipEvidenceFromChangeEvents_(ss, research) {
  const sheet = ss.getSheetByName('CHANGE_EVENT');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const changeType = sciipFirstValue_(r, ['Change_Type', 'Event_Type', 'Type']);
    const sourceId = sciipFirstValue_(r, ['Change_ID', 'Change_Event_ID', 'Event_ID', 'ID']);

    out.push({
      Finding_Type: 'CHANGE_EVENT_EVIDENCE',
      Finding_Text: 'Change event detected: ' + changeType + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'CHANGE_EVENT',
      Evidence_ID: sourceId,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: 'Evidence matched to autonomous research question.'
    });
  });

  return out;
}

function sciipEvidenceFromMarketStatistics_(ss, research) {
  const sheet = ss.getSheetByName('MARKET_STATISTICS');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const metric = sciipFirstValue_(r, ['Statistic_Type', 'Metric', 'Signal_Type', 'Type']);
    const count = sciipFirstValue_(r, ['Count', 'Signal_Count', 'Observation_Count']);
    const sourceId = sciipFirstValue_(r, ['Statistic_ID', 'Market_Statistic_ID', 'ID']);

    out.push({
      Finding_Type: 'MARKET_STATISTIC_EVIDENCE',
      Finding_Text: 'Market statistic supports research question: ' + metric + ' count=' + count + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'MARKET_STATISTICS',
      Evidence_ID: sourceId,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: 'Statistical evidence matched to research question.'
    });
  });

  return out;
}

function sciipEvidenceFromGISClusters_(ss, research) {
  const sheet = ss.getSheetByName('GIS_CLUSTER');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const clusterId = sciipFirstValue_(r, ['Cluster_ID', 'GIS_Cluster_ID', 'ID']);
    const clusterType = sciipFirstValue_(r, ['Cluster_Type', 'Type', 'Signal_Type']);

    out.push({
      Finding_Type: 'GIS_CLUSTER_EVIDENCE',
      Finding_Text: 'GIS cluster evidence detected: ' + clusterType + ' cluster ' + clusterId + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'GIS_CLUSTER',
      Evidence_ID: clusterId,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: 'Spatial evidence matched to research question.'
    });
  });

  return out;
}

function sciipEvidenceFromAssetProfiles_(ss, research) {
  const sheet = ss.getSheetByName('ASSET_PROFILE');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!research.Asset_ID && !research.Asset_Business_Key) return;
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const assetId = sciipFirstValue_(r, ['Asset_ID']);
    const address = sciipFirstValue_(r, ['Address', 'Asset_Address', 'Property_Address']);

    out.push({
      Finding_Type: 'ASSET_PROFILE_EVIDENCE',
      Finding_Text: 'Asset profile evidence found for ' + (address || assetId) + '.',
      Evidence_Source: 'ASSET_PROFILE',
      Evidence_ID: assetId,
      Confidence: 0.8,
      Notes: 'Asset profile matched to research question.'
    });
  });

  return out;
}

function sciipEvidenceFromMarketActivity_(ss, research) {
  const sheet = ss.getSheetByName('MARKET_ACTIVITY');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const activityType = sciipFirstValue_(r, ['Activity_Type', 'Event_Type', 'Type']);
    const activityId = sciipFirstValue_(r, ['Activity_ID', 'ID']);

    out.push({
      Finding_Type: 'MARKET_ACTIVITY_EVIDENCE',
      Finding_Text: 'Market activity evidence detected: ' + activityType + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'MARKET_ACTIVITY',
      Evidence_ID: activityId,
      Confidence: 0.75,
      Notes: 'Market activity matched to research question.'
    });
  });

  return out;
}

function sciipEvidenceFromCampusProfiles_(ss, research) {
  const sheet = ss.getSheetByName('CAMPUS_PROFILE');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const campusId = sciipFirstValue_(r, ['Campus_ID', 'ID']);
    const campusName = sciipFirstValue_(r, ['Campus_Name', 'Name']);

    out.push({
      Finding_Type: 'CAMPUS_PROFILE_EVIDENCE',
      Finding_Text: 'Campus intelligence evidence found: ' + (campusName || campusId) + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'CAMPUS_PROFILE',
      Evidence_ID: campusId,
      Confidence: 0.75,
      Notes: 'Campus profile matched to research question.'
    });
  });

  return out;
}

/************************************************************
 * MATCHING LOGIC
 ************************************************************/

function sciipResearchEvidenceMatches_(research, row) {
  const researchAssetId = String(research.Asset_ID || '').trim();
  const researchAssetKey = String(research.Asset_Business_Key || '').trim();
  const researchCity = String(research.City || '').trim().toUpperCase();
  const researchSubmarket = String(research.Submarket || '').trim().toUpperCase();
  const researchMarket = String(research.Market || '').trim().toUpperCase();
  const researchCluster = String(research.Cluster_ID || '').trim();
  const researchSignalType = String(research.Signal_Type || '').trim().toUpperCase();

  const rowAssetId = String(sciipFirstValue_(row, ['Asset_ID']) || '').trim();
  const rowAssetKey = String(sciipFirstValue_(row, ['Asset_Business_Key']) || '').trim();
  const rowCity = String(sciipFirstValue_(row, ['City']) || '').trim().toUpperCase();
  const rowSubmarket = String(sciipFirstValue_(row, ['Submarket']) || '').trim().toUpperCase();
  const rowMarket = String(sciipFirstValue_(row, ['Market']) || '').trim().toUpperCase();
  const rowCluster = String(sciipFirstValue_(row, ['Cluster_ID', 'GIS_Cluster_ID']) || '').trim();
  const rowSignalType = String(sciipFirstValue_(row, ['Signal_Type', 'Change_Type', 'Statistic_Type', 'Metric', 'Type']) || '').trim().toUpperCase();

  if (researchAssetId && rowAssetId && researchAssetId === rowAssetId) return true;
  if (researchAssetKey && rowAssetKey && researchAssetKey === rowAssetKey) return true;
  if (researchCluster && rowCluster && researchCluster === rowCluster) return true;

  if (researchCity && rowCity && researchCity === rowCity) return true;
  if (researchSubmarket && rowSubmarket && researchSubmarket === rowSubmarket) return true;
  if (researchMarket && rowMarket && researchMarket === rowMarket) return true;

  if (researchSignalType && rowSignalType && rowSignalType.indexOf(researchSignalType) >= 0) return true;

  return false;
}

/************************************************************
 * FINDING FACTORY
 ************************************************************/

function sciipCreateResearchFinding_(research, evidence) {
  const now = new Date().toISOString();

  const keyBasis = [
    research.Business_Key,
    evidence.Evidence_Source,
    evidence.Evidence_ID,
    evidence.Finding_Type,
    evidence.Finding_Text
  ].join('|');

  const findingKey = 'FINDING|' + sciipStableHash_(keyBasis);

  return {
    Finding_ID: 'RF_' + sciipStableHash_(findingKey).substring(0, 16),
    Research_ID: research.Research_ID,
    Research_Business_Key: research.Business_Key,
    Finding_Business_Key: findingKey,
    Finding_Type: evidence.Finding_Type || 'INTERNAL_EVIDENCE',
    Finding_Text: evidence.Finding_Text || '',
    Evidence_Source: evidence.Evidence_Source || '',
    Evidence_ID: evidence.Evidence_ID || '',
    Confidence: evidence.Confidence || 0.75,
    Status: 'ACTIVE',
    Created_At: now,
    Processor: SCIIP_RESEARCH_SYNTHESIS_PROCESSOR,
    Notes: evidence.Notes || ''
  };
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestResearchSynthesisProcessor() {
  const result = sciipRunResearchSynthesisProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestResearchSynthesisProcessor',
    result: result
  }));

  return result;
}

/************************************************************
 * SMALL HELPER
 ************************************************************/

function sciipLocationSuffix_(r) {
  const city = sciipFirstValue_(r, ['City']);
  const submarket = sciipFirstValue_(r, ['Submarket']);
  const market = sciipFirstValue_(r, ['Market']);

  if (city) return ' in ' + city;
  if (submarket) return ' in ' + submarket;
  if (market) return ' in ' + market;
  return '';
}

/************************************************************
 * 210_InsightGenerationProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * 200 creates research findings.
 * 210 turns findings into synthesized intelligence insights.
 *
 * Input:
 * - RESEARCH_QUEUE
 * - RESEARCH_FINDINGS
 *
 * Output:
 * - RESEARCH_INSIGHTS
 ************************************************************/

const SCIIP_INSIGHT_GENERATION_PROCESSOR = '210_InsightGenerationProcessor';

function sciipRunInsightGenerationProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_RESEARCH_INSIGHTS_SHEET, SCIIP_RESEARCH_INSIGHTS_HEADERS);

  const queueSheet = ss.getSheetByName(SCIIP_RESEARCH_QUEUE_SHEET);
  const findingsSheet = ss.getSheetByName(SCIIP_RESEARCH_FINDINGS_SHEET);
  const insightsSheet = ss.getSheetByName(SCIIP_RESEARCH_INSIGHTS_SHEET);

  if (!queueSheet) throw new Error('Missing RESEARCH_QUEUE. Run 190 first.');
  if (!findingsSheet) throw new Error('Missing RESEARCH_FINDINGS. Run 200 first.');

  const researchRows = sciipReadSheetAsObjects_(queueSheet);
  const findingRows = sciipReadSheetAsObjects_(findingsSheet);
  const existingInsightKeys = sciipGetExistingColumnValues_(insightsSheet, 'Insight_Business_Key');

  const findingsByResearchKey = sciipGroupFindingsByResearchKey_(findingRows);

  let researchReviewed = 0;
  let insightsCreated = 0;
  let skippedNoFindings = 0;
  let skippedDuplicate = 0;

  researchRows.forEach(function(research) {
    if (!research.Research_ID || !research.Business_Key) return;

    researchReviewed++;

    const findings = findingsByResearchKey[research.Business_Key] || [];

    const activeFindings = findings.filter(function(f) {
      return String(f.Status || '').toUpperCase() !== 'SUPERSEDED';
    });

    if (!activeFindings.length) {
      skippedNoFindings++;
      return;
    }

    const insight = sciipCreateSynthesizedInsight_(research, activeFindings);

    if (existingInsightKeys.has(insight.Insight_Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(insightsSheet, SCIIP_RESEARCH_INSIGHTS_HEADERS, insight);
    existingInsightKeys.add(insight.Insight_Business_Key);
    insightsCreated++;
  });

  const result = {
    processor: SCIIP_INSIGHT_GENERATION_PROCESSOR,
    status: 'SUCCESS',
    researchReviewed: researchReviewed,
    insightsCreated: insightsCreated,
    skippedNoFindings: skippedNoFindings,
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

function sciipGroupFindingsByResearchKey_(findingRows) {
  const grouped = {};

  findingRows.forEach(function(f) {
    const key = f.Research_Business_Key;
    if (!key) return;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  });

  return grouped;
}

/************************************************************
 * INSIGHT FACTORY
 ************************************************************/

function sciipCreateSynthesizedInsight_(research, findings) {
  const now = new Date().toISOString();

  const findingCount = findings.length;
  const evidenceSources = sciipUniqueValues_(findings.map(function(f) {
    return f.Evidence_Source;
  })).filter(Boolean);

  const avgConfidence = sciipAverageConfidence_(findings);

  const insightType = sciipInsightTypeFromResearch_(research);
  const insightText = sciipBuildInsightText_(research, findings, evidenceSources, avgConfidence);

  const keyBasis = [
    research.Business_Key,
    insightType,
    findingCount,
    evidenceSources.join(',')
  ].join('|');

  const insightKey = 'INSIGHT|' + sciipStableHash_(keyBasis);

  return {
    Insight_ID: 'RI_' + sciipStableHash_(insightKey).substring(0, 16),
    Research_ID: research.Research_ID,
    Research_Business_Key: research.Business_Key,
    Insight_Business_Key: insightKey,
    Insight_Type: insightType,
    Insight_Text: insightText,
    Market: research.Market || '',
    Submarket: research.Submarket || '',
    City: research.City || '',
    Asset_ID: research.Asset_ID || '',
    Cluster_ID: research.Cluster_ID || '',
    Confidence: avgConfidence,
    Status: 'ACTIVE',
    Created_At: now,
    Processor: SCIIP_INSIGHT_GENERATION_PROCESSOR,
    Notes: 'Synthesized from ' + findingCount + ' research findings across ' + evidenceSources.length + ' evidence source(s).'
  };
}

function sciipInsightTypeFromResearch_(research) {
  const category = String(research.Research_Category || '').toUpperCase();
  const signal = String(research.Signal_Type || '').toUpperCase();

  if (category.indexOf('RENT') >= 0 || category.indexOf('PRICING') >= 0 || signal.indexOf('RATE') >= 0) {
    return 'PRICING_INSIGHT';
  }

  if (category.indexOf('ADVANCED_MANUFACTURING') >= 0 || signal.indexOf('AEROSPACE') >= 0) {
    return 'ADVANCED_MANUFACTURING_INSIGHT';
  }

  if (category.indexOf('GIS') >= 0 || category.indexOf('CLUSTER') >= 0) {
    return 'SPATIAL_MARKET_INSIGHT';
  }

  if (category.indexOf('ACTIVITY') >= 0) {
    return 'MARKET_ACTIVITY_INSIGHT';
  }

  return 'GENERAL_MARKET_INSIGHT';
}

function sciipBuildInsightText_(research, findings, evidenceSources, confidence) {
  const question = research.Research_Question || 'Autonomous research question';
  const location =
    research.City ||
    research.Submarket ||
    research.Market ||
    'the market';

  const category = research.Research_Category || 'market intelligence';
  const findingCount = findings.length;

  let strength = 'emerging';
  if (confidence >= 0.85 && findingCount >= 5) strength = 'strong';
  else if (confidence >= 0.75 && findingCount >= 3) strength = 'supported';

  return (
    strength.toUpperCase() +
    ' insight for ' +
    location +
    ': ' +
    question +
    ' Evidence review found ' +
    findingCount +
    ' supporting finding(s) across ' +
    evidenceSources.length +
    ' source type(s). Category: ' +
    category +
    '.'
  );
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestInsightGenerationProcessor() {
  const result = sciipRunInsightGenerationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestInsightGenerationProcessor',
    result: result
  }));

  return result;
}

/************************************************************
 * HELPERS
 ************************************************************/

function sciipUniqueValues_(arr) {
  const seen = {};
  const out = [];

  arr.forEach(function(v) {
    const key = String(v || '').trim();
    if (!key) return;
    if (seen[key]) return;

    seen[key] = true;
    out.push(key);
  });

  return out;
}

function sciipAverageConfidence_(rows) {
  if (!rows || !rows.length) return 0.75;

  let total = 0;
  let count = 0;

  rows.forEach(function(r) {
    const n = Number(r.Confidence);
    if (!isNaN(n) && n > 0) {
      total += n > 1 ? n / 100 : n;
      count++;
    }
  });

  if (!count) return 0.75;

  return Math.round((total / count) * 100) / 100;
}

/************************************************************
 * 220_MarketThesisProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * 210 creates insights.
 * 220 converts repeated insights into durable market theses.
 *
 * Input:
 * - RESEARCH_INSIGHTS
 *
 * Output:
 * - MARKET_THESIS
 ************************************************************/

const SCIIP_MARKET_THESIS_PROCESSOR = '220_MarketThesisProcessor';
const SCIIP_MARKET_THESIS_SHEET = 'MARKET_THESIS';

const SCIIP_MARKET_THESIS_HEADERS = [
  'Thesis_ID',
  'Business_Key',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Thesis_Type',
  'Thesis_Text',
  'Supporting_Insight_Count',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunMarketThesisProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_MARKET_THESIS_SHEET, SCIIP_MARKET_THESIS_HEADERS);

  const insightsSheet = ss.getSheetByName(SCIIP_RESEARCH_INSIGHTS_SHEET);
  const thesisSheet = ss.getSheetByName(SCIIP_MARKET_THESIS_SHEET);

  if (!insightsSheet) throw new Error('Missing RESEARCH_INSIGHTS. Run 210 first.');

  const insights = sciipReadSheetAsObjects_(insightsSheet).filter(function(i) {
    return String(i.Status || '').toUpperCase() === 'ACTIVE';
  });

  const existingThesisKeys = sciipGetExistingColumnValues_(thesisSheet, 'Business_Key');
  const groups = sciipGroupInsightsForThesis_(insights);

  let groupsReviewed = 0;
  let thesesCreated = 0;
  let skippedInsufficientEvidence = 0;
  let skippedDuplicate = 0;

  Object.keys(groups).forEach(function(groupKey) {
    const group = groups[groupKey];
    groupsReviewed++;

    if (group.insights.length < 2) {
      skippedInsufficientEvidence++;
      return;
    }

    const thesis = sciipCreateMarketThesis_(group);

    if (existingThesisKeys.has(thesis.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(thesisSheet, SCIIP_MARKET_THESIS_HEADERS, thesis);
    existingThesisKeys.add(thesis.Business_Key);
    thesesCreated++;
  });

  const result = {
    processor: SCIIP_MARKET_THESIS_PROCESSOR,
    status: 'SUCCESS',
    groupsReviewed: groupsReviewed,
    thesesCreated: thesesCreated,
    skippedInsufficientEvidence: skippedInsufficientEvidence,
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

function sciipGroupInsightsForThesis_(insights) {
  const groups = {};

  insights.forEach(function(i) {
    const market = String(i.Market || '').trim();
    const submarket = String(i.Submarket || '').trim();
    const city = String(i.City || '').trim();
    const type = String(i.Insight_Type || 'GENERAL_MARKET_INSIGHT').trim();

    const location = city || submarket || market || 'UNKNOWN_MARKET';
    const thesisType = sciipThesisTypeFromInsight_(type);

    const key = [
      location.toUpperCase(),
      thesisType
    ].join('|');

    if (!groups[key]) {
      groups[key] = {
        Market: market,
        Submarket: submarket,
        City: city,
        Thesis_Type: thesisType,
        Industry: sciipIndustryFromInsightType_(type),
        insights: []
      };
    }

    groups[key].insights.push(i);
  });

  return groups;
}

/************************************************************
 * THESIS FACTORY
 ************************************************************/

function sciipCreateMarketThesis_(group) {
  const now = new Date().toISOString();
  const location = group.City || group.Submarket || group.Market || 'the market';
  const count = group.insights.length;
  const confidence = sciipAverageConfidence_(group.insights);

  const thesisText = sciipBuildMarketThesisText_(group, location, count, confidence);

  const keyBasis = [
    location,
    group.Thesis_Type,
    group.Industry,
    count
  ].join('|');

  const businessKey = 'MARKET_THESIS|' + sciipStableHash_(keyBasis);

  return {
    Thesis_ID: 'MT_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Market: group.Market || '',
    Submarket: group.Submarket || '',
    City: group.City || '',
    Industry: group.Industry || '',
    Thesis_Type: group.Thesis_Type || 'GENERAL_MARKET_THESIS',
    Thesis_Text: thesisText,
    Supporting_Insight_Count: count,
    Confidence: confidence,
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_MARKET_THESIS_PROCESSOR,
    Notes: 'Generated from repeated intelligence insights.'
  };
}

function sciipBuildMarketThesisText_(group, location, count, confidence) {
  const type = group.Thesis_Type;

  if (type === 'PRICING_POWER_THESIS') {
    return location + ' is showing evidence of upward pricing pressure based on ' + count + ' supporting intelligence insights.';
  }

  if (type === 'ADVANCED_MANUFACTURING_DEMAND_THESIS') {
    return location + ' is showing evidence of accelerating advanced manufacturing demand based on ' + count + ' supporting intelligence insights.';
  }

  if (type === 'SPATIAL_ACTIVITY_THESIS') {
    return location + ' is showing evidence of spatially concentrated industrial activity based on ' + count + ' supporting intelligence insights.';
  }

  if (type === 'MARKET_ACTIVITY_THESIS') {
    return location + ' is showing evidence of elevated industrial market activity based on ' + count + ' supporting intelligence insights.';
  }

  return location + ' is showing an emerging market pattern based on ' + count + ' supporting intelligence insights.';
}

/************************************************************
 * CLASSIFICATION
 ************************************************************/

function sciipThesisTypeFromInsight_(insightType) {
  const t = String(insightType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'PRICING_POWER_THESIS';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_THESIS';
  if (t.indexOf('SPATIAL') >= 0 || t.indexOf('GIS') >= 0) return 'SPATIAL_ACTIVITY_THESIS';
  if (t.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_THESIS';

  return 'GENERAL_MARKET_THESIS';
}

function sciipIndustryFromInsightType_(insightType) {
  const t = String(insightType || '').toUpperCase();

  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'Advanced Manufacturing';
  if (t.indexOf('AEROSPACE') >= 0) return 'Aerospace / Defense';

  return '';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestMarketThesisProcessor() {
  const result = sciipRunMarketThesisProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestMarketThesisProcessor',
    result: result
  }));

  return result;
}

/************************************************************
 * 230_IndustrialForesightProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * 220 creates market theses.
 * 230 creates forward-looking industrial forecasts.
 *
 * Inputs:
 * - MARKET_THESIS
 * - RESEARCH_INSIGHTS
 *
 * Output:
 * - FORECAST
 ************************************************************/

const SCIIP_INDUSTRIAL_FORESIGHT_PROCESSOR = '230_IndustrialForesightProcessor';
const SCIIP_FORECAST_SHEET = 'FORECAST';

const SCIIP_FORECAST_HEADERS = [
  'Forecast_ID',
  'Business_Key',
  'Source_Type',
  'Source_ID',
  'Source_Business_Key',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Forecast_Type',
  'Forecast_Horizon',
  'Forecast_Text',
  'Direction',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunIndustrialForesightProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_FORECAST_SHEET, SCIIP_FORECAST_HEADERS);

  const forecastSheet = ss.getSheetByName(SCIIP_FORECAST_SHEET);
  const existingKeys = sciipGetExistingColumnValues_(forecastSheet, 'Business_Key');

  const candidates = []
    .concat(sciipForecastsFromMarketTheses_(ss))
    .concat(sciipForecastsFromResearchInsights_(ss));

  let forecastsCreated = 0;
  let skippedDuplicate = 0;

  candidates.forEach(function(forecast) {
    if (!forecast || !forecast.Business_Key) return;

    if (existingKeys.has(forecast.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(forecastSheet, SCIIP_FORECAST_HEADERS, forecast);
    existingKeys.add(forecast.Business_Key);
    forecastsCreated++;
  });

  const result = {
    processor: SCIIP_INDUSTRIAL_FORESIGHT_PROCESSOR,
    status: 'SUCCESS',
    candidatesGenerated: candidates.length,
    forecastsCreated: forecastsCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * FORECAST SOURCES
 ************************************************************/

function sciipForecastsFromMarketTheses_(ss) {
  const sheet = ss.getSheetByName('MARKET_THESIS');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(t) {
    if (String(t.Status || '').toUpperCase() !== 'ACTIVE') return;

    out.push(sciipCreateForecastCandidate_({
      Source_Type: 'MARKET_THESIS',
      Source_ID: t.Thesis_ID,
      Source_Business_Key: t.Business_Key,
      Market: t.Market,
      Submarket: t.Submarket,
      City: t.City,
      Industry: t.Industry,
      Forecast_Type: sciipForecastTypeFromThesis_(t.Thesis_Type),
      Forecast_Horizon: 'NEAR_TERM',
      Forecast_Text: sciipForecastTextFromThesis_(t),
      Direction: sciipDirectionFromThesis_(t.Thesis_Type),
      Confidence: t.Confidence,
      Notes: 'Generated from active market thesis.'
    }));
  });

  return out;
}

function sciipForecastsFromResearchInsights_(ss) {
  const sheet = ss.getSheetByName('RESEARCH_INSIGHTS');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(i) {
    if (String(i.Status || '').toUpperCase() !== 'ACTIVE') return;

    const confidence = Number(i.Confidence || 0);
    if (confidence < 0.75) return;

    out.push(sciipCreateForecastCandidate_({
      Source_Type: 'RESEARCH_INSIGHTS',
      Source_ID: i.Insight_ID,
      Source_Business_Key: i.Insight_Business_Key,
      Market: i.Market,
      Submarket: i.Submarket,
      City: i.City,
      Industry: sciipIndustryFromInsightType_(i.Insight_Type),
      Forecast_Type: sciipForecastTypeFromInsight_(i.Insight_Type),
      Forecast_Horizon: 'SHORT_TERM',
      Forecast_Text: sciipForecastTextFromInsight_(i),
      Direction: sciipDirectionFromInsight_(i.Insight_Type),
      Confidence: i.Confidence,
      Notes: 'Generated from high-confidence research insight.'
    }));
  });

  return out;
}

/************************************************************
 * FORECAST FACTORY
 ************************************************************/

function sciipCreateForecastCandidate_(o) {
  const now = new Date().toISOString();

  const keyBasis = [
    o.Source_Type,
    o.Source_Business_Key || o.Source_ID,
    o.Forecast_Type,
    o.Forecast_Horizon,
    o.Direction
  ].join('|');

  const businessKey = 'FORECAST|' + sciipStableHash_(keyBasis);

  return {
    Forecast_ID: 'FC_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Source_Type: o.Source_Type || '',
    Source_ID: o.Source_ID || '',
    Source_Business_Key: o.Source_Business_Key || '',
    Market: o.Market || '',
    Submarket: o.Submarket || '',
    City: o.City || '',
    Industry: o.Industry || '',
    Forecast_Type: o.Forecast_Type || 'GENERAL_MARKET_FORECAST',
    Forecast_Horizon: o.Forecast_Horizon || 'SHORT_TERM',
    Forecast_Text: o.Forecast_Text || '',
    Direction: o.Direction || 'UNKNOWN',
    Confidence: sciipNormalizeConfidence_(o.Confidence),
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_INDUSTRIAL_FORESIGHT_PROCESSOR,
    Notes: o.Notes || ''
  };
}

/************************************************************
 * CLASSIFICATION
 ************************************************************/

function sciipForecastTypeFromThesis_(thesisType) {
  const t = String(thesisType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'PRICING_FORECAST';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_FORECAST';
  if (t.indexOf('SPATIAL') >= 0) return 'SPATIAL_ACTIVITY_FORECAST';
  if (t.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_FORECAST';

  return 'GENERAL_MARKET_FORECAST';
}

function sciipForecastTypeFromInsight_(insightType) {
  const t = String(insightType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'PRICING_FORECAST';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_FORECAST';
  if (t.indexOf('SPATIAL') >= 0) return 'SPATIAL_ACTIVITY_FORECAST';
  if (t.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_FORECAST';

  return 'GENERAL_MARKET_FORECAST';
}

function sciipDirectionFromThesis_(thesisType) {
  const t = String(thesisType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'UPWARD';
  if (t.indexOf('DEMAND') >= 0) return 'INCREASING';
  if (t.indexOf('ACTIVITY') >= 0) return 'INCREASING';

  return 'UNKNOWN';
}

function sciipDirectionFromInsight_(insightType) {
  const t = String(insightType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'UPWARD';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'INCREASING';
  if (t.indexOf('ACTIVITY') >= 0) return 'INCREASING';
  if (t.indexOf('SPATIAL') >= 0) return 'CONCENTRATING';

  return 'UNKNOWN';
}

/************************************************************
 * FORECAST TEXT
 ************************************************************/

function sciipForecastTextFromThesis_(t) {
  const location = t.City || t.Submarket || t.Market || 'the market';
  const type = String(t.Thesis_Type || '').toUpperCase();

  if (type.indexOf('PRICING') >= 0) {
    return location + ' is likely to continue showing upward pricing pressure if supporting conditions persist.';
  }

  if (type.indexOf('ADVANCED_MANUFACTURING') >= 0) {
    return location + ' is likely to see continued advanced manufacturing demand based on current thesis evidence.';
  }

  if (type.indexOf('SPATIAL') >= 0 || type.indexOf('ACTIVITY') >= 0) {
    return location + ' is likely to remain an active industrial cluster in the near term.';
  }

  return location + ' is showing conditions that may continue into the near term.';
}

function sciipForecastTextFromInsight_(i) {
  const location = i.City || i.Submarket || i.Market || 'the market';
  const type = String(i.Insight_Type || '').toUpperCase();

  if (type.indexOf('PRICING') >= 0) {
    return location + ' may experience continued pricing pressure based on recent research insight.';
  }

  if (type.indexOf('ADVANCED_MANUFACTURING') >= 0) {
    return location + ' may experience increasing advanced manufacturing demand based on recent research insight.';
  }

  if (type.indexOf('SPATIAL') >= 0) {
    return location + ' may continue to show geographically concentrated activity.';
  }

  if (type.indexOf('ACTIVITY') >= 0) {
    return location + ' may continue to show elevated industrial market activity.';
  }

  return location + ' may continue the pattern identified by recent research insight.';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestIndustrialForesightProcessor() {
  const result = sciipRunIndustrialForesightProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestIndustrialForesightProcessor',
    result: result
  }));

  return result;
}

/************************************************************
 * 240_ThesisValidationProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * 220 creates theses.
 * 240 validates theses against supporting and contradicting evidence.
 *
 * Input:
 * - MARKET_THESIS
 * - RESEARCH_INSIGHTS
 * - RESEARCH_FINDINGS
 * - CHANGE_EVENT
 * - MARKET_SIGNAL
 *
 * Output:
 * - THESIS_VALIDATION
 ************************************************************/

const SCIIP_THESIS_VALIDATION_PROCESSOR = '240_ThesisValidationProcessor';
const SCIIP_THESIS_VALIDATION_SHEET = 'THESIS_VALIDATION';

const SCIIP_THESIS_VALIDATION_HEADERS = [
  'Validation_ID',
  'Business_Key',
  'Thesis_ID',
  'Thesis_Business_Key',
  'Thesis_Type',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Supporting_Evidence_Count',
  'Contradicting_Evidence_Count',
  'Evidence_Diversity_Count',
  'Net_Score',
  'Confidence',
  'Validation_Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunThesisValidationProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_THESIS_VALIDATION_SHEET, SCIIP_THESIS_VALIDATION_HEADERS);

  const thesisSheet = ss.getSheetByName('MARKET_THESIS');
  const validationSheet = ss.getSheetByName(SCIIP_THESIS_VALIDATION_SHEET);

  if (!thesisSheet) throw new Error('Missing MARKET_THESIS. Run 220 first.');

  const theses = sciipReadSheetAsObjects_(thesisSheet).filter(function(t) {
    return String(t.Status || '').toUpperCase() === 'ACTIVE';
  });

  const existingKeys = sciipGetExistingColumnValues_(validationSheet, 'Business_Key');

  let thesesReviewed = 0;
  let validationsCreated = 0;
  let skippedDuplicate = 0;
  let skippedNoThesis = 0;

  theses.forEach(function(thesis) {
    if (!thesis.Thesis_ID || !thesis.Business_Key) {
      skippedNoThesis++;
      return;
    }

    thesesReviewed++;

    const validation = sciipCreateThesisValidation_(ss, thesis);

    if (existingKeys.has(validation.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(validationSheet, SCIIP_THESIS_VALIDATION_HEADERS, validation);
    existingKeys.add(validation.Business_Key);
    validationsCreated++;
  });

  const result = {
    processor: SCIIP_THESIS_VALIDATION_PROCESSOR,
    status: 'SUCCESS',
    thesesReviewed: thesesReviewed,
    validationsCreated: validationsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoThesis: skippedNoThesis,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * VALIDATION FACTORY
 ************************************************************/

function sciipCreateThesisValidation_(ss, thesis) {
  const now = new Date().toISOString();

  const evidence = sciipCollectThesisValidationEvidence_(ss, thesis);

  const supporting = evidence.filter(function(e) {
    return e.Direction === 'SUPPORTING';
  });

  const contradicting = evidence.filter(function(e) {
    return e.Direction === 'CONTRADICTING';
  });

  const diversity = sciipUniqueValues_(evidence.map(function(e) {
    return e.Source_Type;
  })).length;

  const netScore = supporting.length - contradicting.length;
  const confidence = sciipCalculateValidationConfidence_(thesis, supporting.length, contradicting.length, diversity);
  const status = sciipValidationStatusFromScore_(netScore, confidence);

  const keyBasis = [
    thesis.Business_Key,
    supporting.length,
    contradicting.length,
    diversity,
    status
  ].join('|');

  const businessKey = 'THESIS_VALIDATION|' + sciipStableHash_(keyBasis);

  return {
    Validation_ID: 'TV_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Thesis_ID: thesis.Thesis_ID,
    Thesis_Business_Key: thesis.Business_Key,
    Thesis_Type: thesis.Thesis_Type || '',
    Market: thesis.Market || '',
    Submarket: thesis.Submarket || '',
    City: thesis.City || '',
    Industry: thesis.Industry || '',
    Supporting_Evidence_Count: supporting.length,
    Contradicting_Evidence_Count: contradicting.length,
    Evidence_Diversity_Count: diversity,
    Net_Score: netScore,
    Confidence: confidence,
    Validation_Status: status,
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_THESIS_VALIDATION_PROCESSOR,
    Notes: 'Validated against internal SCIIP evidence.'
  };
}

/************************************************************
 * EVIDENCE COLLECTION
 ************************************************************/

function sciipCollectThesisValidationEvidence_(ss, thesis) {
  const evidence = [];

  evidence.push.apply(evidence, sciipValidationEvidenceFromInsights_(ss, thesis));
  evidence.push.apply(evidence, sciipValidationEvidenceFromFindings_(ss, thesis));
  evidence.push.apply(evidence, sciipValidationEvidenceFromMarketSignals_(ss, thesis));
  evidence.push.apply(evidence, sciipValidationEvidenceFromChangeEvents_(ss, thesis));

  return evidence;
}

function sciipValidationEvidenceFromInsights_(ss, thesis) {
  const sheet = ss.getSheetByName('RESEARCH_INSIGHTS');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(i) {
      return String(i.Status || '').toUpperCase() === 'ACTIVE';
    })
    .filter(function(i) {
      return sciipThesisLocationMatches_(thesis, i);
    })
    .map(function(i) {
      return {
        Source_Type: 'RESEARCH_INSIGHTS',
        Source_ID: i.Insight_ID,
        Direction: sciipEvidenceDirectionForThesis_(thesis, i.Insight_Type, i.Insight_Text),
        Confidence: sciipNormalizeConfidence_(i.Confidence)
      };
    });
}

function sciipValidationEvidenceFromFindings_(ss, thesis) {
  const sheet = ss.getSheetByName('RESEARCH_FINDINGS');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(f) {
      return String(f.Status || '').toUpperCase() === 'ACTIVE';
    })
    .map(function(f) {
      return {
        Source_Type: 'RESEARCH_FINDINGS',
        Source_ID: f.Finding_ID,
        Direction: sciipEvidenceDirectionForThesis_(thesis, f.Finding_Type, f.Finding_Text),
        Confidence: sciipNormalizeConfidence_(f.Confidence)
      };
    })
    .filter(function(e) {
      return e.Direction !== 'NEUTRAL';
    });
}

function sciipValidationEvidenceFromMarketSignals_(ss, thesis) {
  const sheet = ss.getSheetByName('MARKET_SIGNAL');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(s) {
      return sciipThesisLocationMatches_(thesis, s);
    })
    .map(function(s) {
      const type = sciipFirstValue_(s, ['Signal_Type', 'SignalType', 'Type']);
      return {
        Source_Type: 'MARKET_SIGNAL',
        Source_ID: sciipFirstValue_(s, ['Signal_ID', 'Market_Signal_ID', 'ID']),
        Direction: sciipEvidenceDirectionForThesis_(thesis, type, ''),
        Confidence: sciipNormalizeConfidence_(sciipFirstValue_(s, ['Confidence', 'Score']))
      };
    })
    .filter(function(e) {
      return e.Direction !== 'NEUTRAL';
    });
}

function sciipValidationEvidenceFromChangeEvents_(ss, thesis) {
  const sheet = ss.getSheetByName('CHANGE_EVENT');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(c) {
      return sciipThesisLocationMatches_(thesis, c);
    })
    .map(function(c) {
      const type = sciipFirstValue_(c, ['Change_Type', 'Event_Type', 'Type']);
      return {
        Source_Type: 'CHANGE_EVENT',
        Source_ID: sciipFirstValue_(c, ['Change_ID', 'Change_Event_ID', 'Event_ID', 'ID']),
        Direction: sciipEvidenceDirectionForThesis_(thesis, type, ''),
        Confidence: sciipNormalizeConfidence_(sciipFirstValue_(c, ['Confidence', 'Score']))
      };
    })
    .filter(function(e) {
      return e.Direction !== 'NEUTRAL';
    });
}

/************************************************************
 * EVIDENCE DIRECTION
 ************************************************************/

function sciipEvidenceDirectionForThesis_(thesis, type, text) {
  const thesisType = String(thesis.Thesis_Type || '').toUpperCase();
  const value = (String(type || '') + ' ' + String(text || '')).toUpperCase();

  if (thesisType.indexOf('PRICING') >= 0) {
    if (value.indexOf('RATE_INCREASE') >= 0 || value.indexOf('RENT_INCREASE') >= 0 || value.indexOf('PRICING') >= 0) return 'SUPPORTING';
    if (value.indexOf('RATE_DECREASE') >= 0 || value.indexOf('RENT_DECREASE') >= 0) return 'CONTRADICTING';
  }

  if (thesisType.indexOf('ADVANCED_MANUFACTURING') >= 0) {
    if (value.indexOf('ADVANCED_MANUFACTURING') >= 0 || value.indexOf('AEROSPACE') >= 0 || value.indexOf('DEFENSE') >= 0) return 'SUPPORTING';
    if (value.indexOf('VACANCY_INCREASE') >= 0 || value.indexOf('DEMAND_DECREASE') >= 0) return 'CONTRADICTING';
  }

  if (thesisType.indexOf('SPATIAL') >= 0 || thesisType.indexOf('ACTIVITY') >= 0) {
    if (value.indexOf('ACTIVITY') >= 0 || value.indexOf('CLUSTER') >= 0 || value.indexOf('GIS') >= 0) return 'SUPPORTING';
    if (value.indexOf('ACTIVITY_DECREASE') >= 0 || value.indexOf('CLUSTER_WEAKENING') >= 0) return 'CONTRADICTING';
  }

  return 'NEUTRAL';
}

/************************************************************
 * LOCATION MATCHING
 ************************************************************/

function sciipThesisLocationMatches_(thesis, row) {
  const thesisCity = String(thesis.City || '').trim().toUpperCase();
  const thesisSubmarket = String(thesis.Submarket || '').trim().toUpperCase();
  const thesisMarket = String(thesis.Market || '').trim().toUpperCase();

  const rowCity = String(sciipFirstValue_(row, ['City']) || '').trim().toUpperCase();
  const rowSubmarket = String(sciipFirstValue_(row, ['Submarket']) || '').trim().toUpperCase();
  const rowMarket = String(sciipFirstValue_(row, ['Market']) || '').trim().toUpperCase();

  if (thesisCity && rowCity && thesisCity === rowCity) return true;
  if (thesisSubmarket && rowSubmarket && thesisSubmarket === rowSubmarket) return true;
  if (thesisMarket && rowMarket && thesisMarket === rowMarket) return true;

  return false;
}

/************************************************************
 * SCORING
 ************************************************************/

function sciipCalculateValidationConfidence_(thesis, supportCount, contradictCount, diversity) {
  const base = sciipNormalizeConfidence_(thesis.Confidence || 0.65);

  let modifier = 0;
  modifier += Math.min(supportCount * 0.04, 0.2);
  modifier += Math.min(diversity * 0.03, 0.12);
  modifier -= Math.min(contradictCount * 0.06, 0.3);

  const score = Math.max(0.1, Math.min(0.99, base + modifier));

  return Math.round(score * 100) / 100;
}

function sciipValidationStatusFromScore_(netScore, confidence) {
  if (netScore >= 3 && confidence >= 0.75) return 'SUPPORTED';
  if (netScore >= 1) return 'WEAKLY_SUPPORTED';
  if (netScore === 0) return 'NEUTRAL';
  if (netScore <= -3) return 'INVALIDATED';
  return 'CHALLENGED';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestThesisValidationProcessor() {
  const result = sciipRunThesisValidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestThesisValidationProcessor',
    result: result
  }));

  return result;
}

/************************************************************
 * 250_OpportunityDetectionProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert SCIIP intelligence into actionable opportunities.
 *
 * Inputs:
 * - FORECAST
 * - MARKET_THESIS
 * - THESIS_VALIDATION
 * - RESEARCH_INSIGHTS
 * - RESEARCH_FINDINGS
 *
 * Output:
 * - OPPORTUNITY
 ************************************************************/

const SCIIP_OPPORTUNITY_DETECTION_PROCESSOR = '250_OpportunityDetectionProcessor';
const SCIIP_OPPORTUNITY_SHEET = 'OPPORTUNITY';

const SCIIP_OPPORTUNITY_HEADERS = [
  'Opportunity_ID',
  'Business_Key',
  'Source_Type',
  'Source_ID',
  'Source_Business_Key',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Opportunity_Type',
  'Opportunity_Text',
  'Action_Type',
  'Priority',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunOpportunityDetectionProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_OPPORTUNITY_SHEET, SCIIP_OPPORTUNITY_HEADERS);

  const opportunitySheet = ss.getSheetByName(SCIIP_OPPORTUNITY_SHEET);
  const existingKeys = sciipGetExistingColumnValues_(opportunitySheet, 'Business_Key');

  const candidates = []
    .concat(sciipOpportunitiesFromForecasts_(ss))
    .concat(sciipOpportunitiesFromMarketTheses_(ss))
    .concat(sciipOpportunitiesFromValidatedTheses_(ss))
    .concat(sciipOpportunitiesFromResearchInsights_(ss));

  let opportunitiesCreated = 0;
  let skippedDuplicate = 0;

  candidates.forEach(function(o) {
    if (!o || !o.Business_Key) return;

    if (existingKeys.has(o.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(opportunitySheet, SCIIP_OPPORTUNITY_HEADERS, o);
    existingKeys.add(o.Business_Key);
    opportunitiesCreated++;
  });

  const result = {
    processor: SCIIP_OPPORTUNITY_DETECTION_PROCESSOR,
    status: 'SUCCESS',
    candidatesGenerated: candidates.length,
    opportunitiesCreated: opportunitiesCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * SOURCE BUILDERS
 ************************************************************/

function sciipOpportunitiesFromForecasts_(ss) {
  const sheet = ss.getSheetByName('FORECAST');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(f) {
      return String(f.Status || '').toUpperCase() === 'ACTIVE';
    })
    .filter(function(f) {
      return sciipNormalizeConfidence_(f.Confidence) >= 0.7;
    })
    .map(function(f) {
      return sciipCreateOpportunityCandidate_({
        Source_Type: 'FORECAST',
        Source_ID: f.Forecast_ID,
        Source_Business_Key: f.Business_Key,
        Market: f.Market,
        Submarket: f.Submarket,
        City: f.City,
        Industry: f.Industry,
        Opportunity_Type: sciipOpportunityTypeFromForecast_(f),
        Opportunity_Text: sciipOpportunityTextFromForecast_(f),
        Action_Type: sciipActionTypeFromForecast_(f),
        Priority: sciipPriorityFromConfidence_(f.Confidence),
        Confidence: f.Confidence,
        Notes: 'Generated from forecast.'
      });
    });
}

function sciipOpportunitiesFromMarketTheses_(ss) {
  const sheet = ss.getSheetByName('MARKET_THESIS');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(t) {
      return String(t.Status || '').toUpperCase() === 'ACTIVE';
    })
    .map(function(t) {
      return sciipCreateOpportunityCandidate_({
        Source_Type: 'MARKET_THESIS',
        Source_ID: t.Thesis_ID,
        Source_Business_Key: t.Business_Key,
        Market: t.Market,
        Submarket: t.Submarket,
        City: t.City,
        Industry: t.Industry,
        Opportunity_Type: sciipOpportunityTypeFromThesis_(t.Thesis_Type),
        Opportunity_Text: sciipOpportunityTextFromThesis_(t),
        Action_Type: sciipActionTypeFromThesis_(t.Thesis_Type),
        Priority: sciipPriorityFromConfidence_(t.Confidence),
        Confidence: t.Confidence,
        Notes: 'Generated from active market thesis.'
      });
    });
}

function sciipOpportunitiesFromValidatedTheses_(ss) {
  const sheet = ss.getSheetByName('THESIS_VALIDATION');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(v) {
      const status = String(v.Validation_Status || '').toUpperCase();
      return status === 'SUPPORTED' || status === 'WEAKLY_SUPPORTED';
    })
    .map(function(v) {
      return sciipCreateOpportunityCandidate_({
        Source_Type: 'THESIS_VALIDATION',
        Source_ID: v.Validation_ID,
        Source_Business_Key: v.Business_Key,
        Market: v.Market,
        Submarket: v.Submarket,
        City: v.City,
        Industry: v.Industry,
        Opportunity_Type: sciipOpportunityTypeFromThesis_(v.Thesis_Type),
        Opportunity_Text: sciipOpportunityTextFromValidation_(v),
        Action_Type: sciipActionTypeFromThesis_(v.Thesis_Type),
        Priority: sciipPriorityFromValidation_(v),
        Confidence: v.Confidence,
        Notes: 'Generated from validated thesis.'
      });
    });
}

function sciipOpportunitiesFromResearchInsights_(ss) {
  const sheet = ss.getSheetByName('RESEARCH_INSIGHTS');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(i) {
      return String(i.Status || '').toUpperCase() === 'ACTIVE';
    })
    .filter(function(i) {
      return sciipNormalizeConfidence_(i.Confidence) >= 0.75;
    })
    .map(function(i) {
      return sciipCreateOpportunityCandidate_({
        Source_Type: 'RESEARCH_INSIGHTS',
        Source_ID: i.Insight_ID,
        Source_Business_Key: i.Insight_Business_Key,
        Market: i.Market,
        Submarket: i.Submarket,
        City: i.City,
        Industry: sciipIndustryFromInsightType_(i.Insight_Type),
        Opportunity_Type: sciipOpportunityTypeFromInsight_(i.Insight_Type),
        Opportunity_Text: sciipOpportunityTextFromInsight_(i),
        Action_Type: sciipActionTypeFromInsight_(i.Insight_Type),
        Priority: sciipPriorityFromConfidence_(i.Confidence),
        Confidence: i.Confidence,
        Notes: 'Generated from high-confidence research insight.'
      });
    });
}

/************************************************************
 * FACTORY
 ************************************************************/

function sciipCreateOpportunityCandidate_(o) {
  const now = new Date().toISOString();

  const keyBasis = [
    o.Source_Type,
    o.Source_Business_Key || o.Source_ID,
    o.Opportunity_Type,
    o.Action_Type
  ].join('|');

  const businessKey = 'OPPORTUNITY|' + sciipStableHash_(keyBasis);

  return {
    Opportunity_ID: 'OP_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Source_Type: o.Source_Type || '',
    Source_ID: o.Source_ID || '',
    Source_Business_Key: o.Source_Business_Key || '',
    Market: o.Market || '',
    Submarket: o.Submarket || '',
    City: o.City || '',
    Industry: o.Industry || '',
    Opportunity_Type: o.Opportunity_Type || 'GENERAL_OPPORTUNITY',
    Opportunity_Text: o.Opportunity_Text || '',
    Action_Type: o.Action_Type || 'REVIEW',
    Priority: o.Priority || 'MEDIUM',
    Confidence: sciipNormalizeConfidence_(o.Confidence),
    Status: 'OPEN',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_OPPORTUNITY_DETECTION_PROCESSOR,
    Notes: o.Notes || ''
  };
}

/************************************************************
 * CLASSIFICATION
 ************************************************************/

function sciipOpportunityTypeFromForecast_(f) {
  const type = String(f.Forecast_Type || '').toUpperCase();
  const direction = String(f.Direction || '').toUpperCase();

  if (type.indexOf('PRICING') >= 0 && direction === 'UPWARD') return 'LEASE_REPRICING_OPPORTUNITY';
  if (type.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_OPPORTUNITY';
  if (type.indexOf('SPATIAL') >= 0) return 'CLUSTER_TARGETING_OPPORTUNITY';
  if (type.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_OPPORTUNITY';

  return 'GENERAL_MARKET_OPPORTUNITY';
}

function sciipOpportunityTypeFromThesis_(thesisType) {
  const t = String(thesisType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'LEASE_REPRICING_OPPORTUNITY';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_OPPORTUNITY';
  if (t.indexOf('SPATIAL') >= 0) return 'CLUSTER_TARGETING_OPPORTUNITY';
  if (t.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_OPPORTUNITY';

  return 'GENERAL_MARKET_OPPORTUNITY';
}

function sciipOpportunityTypeFromInsight_(insightType) {
  const t = String(insightType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'LEASE_REPRICING_OPPORTUNITY';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_OPPORTUNITY';
  if (t.indexOf('SPATIAL') >= 0) return 'CLUSTER_TARGETING_OPPORTUNITY';
  if (t.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_OPPORTUNITY';

  return 'GENERAL_MARKET_OPPORTUNITY';
}

function sciipActionTypeFromForecast_(f) {
  return sciipActionTypeFromOpportunityType_(sciipOpportunityTypeFromForecast_(f));
}

function sciipActionTypeFromThesis_(thesisType) {
  return sciipActionTypeFromOpportunityType_(sciipOpportunityTypeFromThesis_(thesisType));
}

function sciipActionTypeFromInsight_(insightType) {
  return sciipActionTypeFromOpportunityType_(sciipOpportunityTypeFromInsight_(insightType));
}

function sciipActionTypeFromOpportunityType_(opportunityType) {
  const t = String(opportunityType || '').toUpperCase();

  if (t.indexOf('LEASE_REPRICING') >= 0) return 'BROKER_REVIEW_RENT_POSITION';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'TARGET_ADVANCED_MANUFACTURING_REQUIREMENTS';
  if (t.indexOf('CLUSTER') >= 0) return 'MAP_AND_TARGET_CLUSTER';
  if (t.indexOf('ACTIVITY') >= 0) return 'PRIORITIZE_MARKET_OUTREACH';

  return 'REVIEW';
}

/************************************************************
 * TEXT BUILDERS
 ************************************************************/

function sciipOpportunityTextFromForecast_(f) {
  const location = f.City || f.Submarket || f.Market || 'the market';
  const type = sciipOpportunityTypeFromForecast_(f);

  if (type === 'LEASE_REPRICING_OPPORTUNITY') {
    return location + ' may present a lease repricing opportunity due to forecasted upward pricing pressure.';
  }

  if (type === 'ADVANCED_MANUFACTURING_DEMAND_OPPORTUNITY') {
    return location + ' may present a tenant targeting opportunity for advanced manufacturing demand.';
  }

  if (type === 'CLUSTER_TARGETING_OPPORTUNITY') {
    return location + ' may present a cluster targeting opportunity based on spatially concentrated activity.';
  }

  if (type === 'MARKET_ACTIVITY_OPPORTUNITY') {
    return location + ' may warrant prioritized broker outreach due to elevated market activity.';
  }

  return location + ' may present a general industrial market opportunity.';
}

function sciipOpportunityTextFromThesis_(t) {
  const location = t.City || t.Submarket || t.Market || 'the market';
  return location + ' has an active market thesis that may warrant broker, owner, or tenant-targeting action.';
}

function sciipOpportunityTextFromValidation_(v) {
  const location = v.City || v.Submarket || v.Market || 'the market';
  return location + ' has a ' + v.Validation_Status + ' thesis with net score ' + v.Net_Score + ', suggesting an actionable market opportunity.';
}

function sciipOpportunityTextFromInsight_(i) {
  const location = i.City || i.Submarket || i.Market || 'the market';
  return location + ' has a high-confidence intelligence insight that may warrant immediate review.';
}

/************************************************************
 * PRIORITY
 ************************************************************/

function sciipPriorityFromConfidence_(confidence) {
  const c = sciipNormalizeConfidence_(confidence);

  if (c >= 0.9) return 'CRITICAL';
  if (c >= 0.8) return 'HIGH';
  if (c >= 0.65) return 'MEDIUM';
  return 'LOW';
}

function sciipPriorityFromValidation_(v) {
  const status = String(v.Validation_Status || '').toUpperCase();
  const net = Number(v.Net_Score || 0);
  const c = sciipNormalizeConfidence_(v.Confidence);

  if (status === 'SUPPORTED' && net >= 3 && c >= 0.85) return 'CRITICAL';
  if ((status === 'SUPPORTED' || status === 'WEAKLY_SUPPORTED') && c >= 0.75) return 'HIGH';
  if (net >= 1) return 'MEDIUM';

  return 'LOW';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestOpportunityDetectionProcessor() {
  const result = sciipRunOpportunityDetectionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestOpportunityDetectionProcessor',
    result: result
  }));

  return result;
}

/* ==========================================================
   SCIIP_OS
   Module: Processors
   File: 60_PropertyCandidateProcessor.gs

   Purpose:
   Processes PROPERTY_CANDIDATES into canonical SCIIP assets.

   Candidate
      ↓
   Identity Resolution
      ↓
   Asset Registry
      ↓
   Event Store
      ↓
   Knowledge Graph
      ↓
   Timeline

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

function sciipRunPropertyCandidateProcessor(context) {

  sciipInitializeCandidateSheet();
  sciipInitializeAssetRegistry();
  sciipInitializeGraphNodeSheet();
  sciipInitializeGraphEdgeSheet();

  const rows =
    sciipGetSheetValues(
      SCIIP.SHEETS.PROPERTY_CANDIDATES
    );

  if (rows.length < 2) {
    return {
      processor: 'PropertyCandidateProcessor',
      status: 'SUCCESS',
      candidatesProcessed: 0,
      assetsCreated: 0,
      matchesFound: 0,
      generatedAt: sciipNowIso()
    };
  }

  const headers =
    rows[0];

  let candidatesProcessed = 0;
  let assetsCreated = 0;
  let matchesFound = 0;

  rows
    .slice(1)
    .forEach(function(row) {

      const candidate =
        sciipCandidateRowToObject(
          headers,
          row
        );

      if (
        candidate.Status &&
        candidate.Status !== 'PENDING'
      ) {
        return;
      }

      candidatesProcessed++;

      const observation = {
        address: candidate.Address,
        city: candidate.City,
        zip: candidate.Zip,
        apn: candidate.APN,
        source:
          candidate.Source ||
          'PROPERTY_CANDIDATE_PROCESSOR'
      };

      const match =
        sciipResolveObservation(
          observation
        );

      if (match.action === 'MATCH') {

        matchesFound++;

        sciipCreateAndRecordEvent(
          SCIIP.VOCABULARY.EVENT_TYPES.PROPERTY_OBSERVED,
          {
            assetId:
              match.asset.Asset_ID ||
              match.asset.assetId,
            businessKey:
              match.identity.businessKey,
            source:
              observation.source,
            matchConfidence:
              match.confidence
          }
        );

        return;
      }

      const assetCandidate =
        sciipCreateAssetCandidate(
          observation
        );

      const asset =
        sciipCreateAssetFromCandidate(
          assetCandidate
        );

      sciipRegisterAsset(
        asset
      );

      sciipBuildAssetGraph(
        asset
      );

      assetsCreated++;
    });

  return {
    processor: 'PropertyCandidateProcessor',
    status: 'SUCCESS',
    candidatesProcessed: candidatesProcessed,
    assetsCreated: assetsCreated,
    matchesFound: matchesFound,
    generatedAt: sciipNowIso()
  };
}

function sciipCandidateRowToObject(
  headers,
  row
) {

  const obj = {};

  headers.forEach(
    function(header, index) {
      obj[header] = row[index];
    }
  );

  return obj;
}

/* ==========================================================
   SCIIP_OS
   Module: Processors
   File: 70_PropertyObservationProcessor.gs

   Purpose:
   Processes raw property observations into SCIIP events,
   candidates, assets, graph records, and timeline history.

   Observation
      ↓
   Event
      ↓
   Identity Resolution
      ↓
   Candidate / Match
      ↓
   Asset Registry
      ↓
   Knowledge Graph
      ↓
   Timeline

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_OBSERVATION_QUEUE_SHEET =
  'OBSERVATION_QUEUE';

function sciipGetObservationQueueSheet() {
  return sciipGetOrCreateSheet(
    SCIIP_OBSERVATION_QUEUE_SHEET
  );
}

function sciipInitializeObservationQueue() {
  const sheet =
    sciipGetObservationQueueSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
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
  ]);
}

function sciipRunPropertyObservationProcessor(context) {

  sciipInitializeObservationQueue();
  sciipInitializeCandidateSheet();
  sciipInitializeAssetRegistry();
  sciipInitializeEventStore();
  sciipInitializeTimelineSheet();
  sciipInitializeGraphNodeSheet();
  sciipInitializeGraphEdgeSheet();

  const sheet =
    sciipGetObservationQueueSheet();

  const rows =
    sheet.getDataRange().getValues();

  if (rows.length < 2) {
    return sciipObservationProcessorResult_(
      0,
      0,
      0,
      0
    );
  }

  const headers =
    rows[0];

  const statusIndex =
    headers.indexOf(
      'Status'
    );

  const processedAtIndex =
    headers.indexOf(
      'Processed_At'
    );

  let observationsProcessed = 0;
  let matchedAssets = 0;
  let candidatesCreated = 0;
  let assetsCreated = 0;

  for (
    let i = 1;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i];

    const observation =
      sciipObservationRowToObject_(
        headers,
        row
      );

    if (
      observation.Status &&
      observation.Status !== 'PENDING'
    ) {
      continue;
    }

    observationsProcessed++;

    const payload =
      sciipNormalizePropertyObservation_(
        observation
      );

    sciipCreateAndRecordEvent(
      SCIIP.VOCABULARY.EVENT_TYPES.PROPERTY_OBSERVED,
      payload
    );

    const match =
      sciipResolveObservation(
        payload
      );

    if (
      match.action === 'MATCH'
    ) {

      matchedAssets++;

      sciipCreateAndRecordEvent(
        SCIIP.VOCABULARY.EVENT_TYPES.PROPERTY_OBSERVED,
        {
          assetId:
            match.asset.Asset_ID ||
            match.asset.assetId,

          businessKey:
            match.identity.businessKey,

          source:
            payload.source,

          observationType:
            payload.observationType,

          rawText:
            payload.rawText,

          matchConfidence:
            match.confidence
        }
      );

    } else {

      sciipCreateCandidate({
        address:
          payload.address,

        city:
          payload.city,

        zip:
          payload.zip,

        apn:
          payload.apn,

        source:
          payload.source
      });

      candidatesCreated++;

      if (
        match.action ===
        'CREATE_ASSET'
      ) {

        const assetCandidate =
          sciipCreateAssetCandidate(
            payload
          );

        const asset =
          sciipCreateAssetFromCandidate(
            assetCandidate
          );

        sciipRegisterAsset(
          asset
        );

        sciipBuildAssetGraph(
          asset
        );

        assetsCreated++;
      }
    }

    if (
      statusIndex >= 0
    ) {
      sheet
        .getRange(
          i + 1,
          statusIndex + 1
        )
        .setValue(
          'PROCESSED'
        );
    }

    if (
      processedAtIndex >= 0
    ) {
      sheet
        .getRange(
          i + 1,
          processedAtIndex + 1
        )
        .setValue(
          sciipNowIso()
        );
    }
  }

  return sciipObservationProcessorResult_(
    observationsProcessed,
    matchedAssets,
    candidatesCreated,
    assetsCreated
  );
}

function sciipNormalizePropertyObservation_(
  observation
) {
  return {
    observationId:
      observation.Observation_ID ||
      observation.observationId ||
      'OBS_' + sciipUuid(),

    observationType:
      observation.Observation_Type ||
      observation.observationType ||
      'PROPERTY_OBSERVED',

    address:
      observation.Address ||
      observation.address ||
      '',

    city:
      observation.City ||
      observation.city ||
      '',

    zip:
      observation.Zip ||
      observation.zip ||
      '',

    apn:
      observation.APN ||
      observation.apn ||
      '',

    source:
      observation.Source ||
      observation.source ||
      'OBSERVATION_QUEUE',

    rawText:
      observation.Raw_Text ||
      observation.rawText ||
      '',

    createdAt:
      observation.Created_At ||
      observation.createdAt ||
      sciipNowIso()
  };
}

function sciipObservationRowToObject_(
  headers,
  row
) {

  const obj = {};

  headers.forEach(
    function(header, index) {
      obj[header] =
        row[index];
    }
  );

  return obj;
}

function sciipObservationProcessorResult_(
  observationsProcessed,
  matchedAssets,
  candidatesCreated,
  assetsCreated
) {

  return {
    processor:
      'PropertyObservationProcessor',

    status:
      'SUCCESS',

    observationsProcessed:
      observationsProcessed,

    matchedAssets:
      matchedAssets,

    candidatesCreated:
      candidatesCreated,

    assetsCreated:
      assetsCreated,

    generatedAt:
      sciipNowIso()
  };
}

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

/* ==========================================================
   SCIIP_OS
   Module: Runtime
   File: Bootstrap.gs

   Purpose:
   Bootstraps SCIIP_OS runtime execution.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Primary SCIIP runtime entry point.
 *
 * @param {Object=} options
 * @returns {Object}
 */
function sciipBootstrap(options) {

  const startedAt =
    sciipNowIso();

  const context =
    sciipCreateRuntimeContext(
      options || {}
    );

  const processorResults =
    sciipRunEnabledProcessors(
      context
    );

  const queueResults =
    sciipRunQueue();

  return {

    platform:
      SCIIP.SHORT_NAME,

    version:
      SCIIP.VERSION,

    status:
      'BOOTSTRAP_COMPLETE',

    startedAt:
      startedAt,

    completedAt:
      sciipNowIso(),

    context:
      context,

    processors:
      processorResults,

    queueResults:
      queueResults
  };
}

/**
 * Creates a standard runtime context.
 *
 * @param {Object=} options
 * @returns {Object}
 */
function sciipCreateRuntimeContext(
  options
) {

  const runtimeOptions =
    options || {};

  return {

    platform:
      SCIIP.SHORT_NAME,

    version:
      SCIIP.VERSION,

    region:
      SCIIP.REGION,

    architecture:
      SCIIP.ARCHITECTURE,

    coreObject:
      SCIIP.CORE_OBJECT,

    sourceOfTruth:
      SCIIP.SOURCE_OF_TRUTH,

    runtime:
      SCIIP.RUNTIME,

    runId:
      sciipCreateRunId(),

    mode:
      runtimeOptions.mode ||
      'STANDARD',

    dryRun:
      runtimeOptions.dryRun ===
      true,

    startedAt:
      sciipNowIso(),

    options:
      runtimeOptions
  };
}

/**
 * Creates a unique run ID.
 *
 * @returns {string}
 */
function sciipCreateRunId() {

  return (
    'SCIIP_RUN_' +
    Utilities.getUuid()
  );
}

/**
 * Manual smoke test.
 *
 * @returns {Object}
 */
function sciipSmokeTest() {

  return {

    status: 'OK',

    platform:
      SCIIP.SHORT_NAME,

    version:
      SCIIP.VERSION,

    timestamp:
      sciipNowIso(),

    registeredProcessors:
      sciipGetProcessorRegistry()
        .length,

    queueStats:
      sciipQueueStats()
  };
}

/* ==========================================================
   SCIIP_OS
   Module: Processors
   File: ProcessorRegistry.gs

   Purpose:
   Registers SCIIP processors and controls processor execution order.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Canonical processor registry.
 *
 * Processors are intentionally registered by name first.
 * Implementations may be added progressively during migration.
 */
const SCIIP_PROCESSOR_REGISTRY = [
  {
    id: 'PROPERTY_CANDIDATE_PROCESSOR',
    name: 'Property Candidate Processor',
    module: 'processors',
    functionName: 'sciipRunPropertyCandidateProcessor',
    enabled: true,
    order: 60
  },
  {
    id: 'ASSET_TIMELINE_PROCESSOR',
    name: 'Asset Timeline Processor',
    module: 'processors',
    functionName: 'sciipRunAssetTimelineProcessor',
    enabled: true,
    order: 61
  },
  {
    id: 'PARCEL_PROCESSOR',
    name: 'Parcel Processor',
    module: 'processors',
    functionName: 'sciipRunParcelProcessor',
    enabled: true,
    order: 62
  },
  {
    id: 'CAMPUS_PROCESSOR',
    name: 'Campus Processor',
    module: 'processors',
    functionName: 'sciipRunCampusProcessor',
    enabled: true,
    order: 63
  },
  {
    id: 'ALIAS_PROCESSOR',
    name: 'Alias Processor',
    module: 'identity',
    functionName: 'sciipRunAliasProcessor',
    enabled: true,
    order: 64
  },
  {
    id: 'LAND_PROCESSOR',
    name: 'Land Processor',
    module: 'processors',
    functionName: 'sciipRunLandProcessor',
    enabled: true,
    order: 65
  },
  {
    id: 'MANUAL_REVIEW_PROCESSOR',
    name: 'Manual Review Processor',
    module: 'processors',
    functionName: 'sciipRunManualReviewProcessor',
    enabled: true,
    order: 66
  },
  {
    id: 'DASHBOARD_PROCESSOR',
    name: 'Dashboard Processor',
    module: 'dashboard',
    functionName: 'sciipRunDashboardProcessor',
    enabled: true,
    order: 67
  }
];

/**
 * Returns all registered processors in execution order.
 *
 * @returns {Object[]}
 */
function sciipGetProcessorRegistry() {
  return SCIIP_PROCESSOR_REGISTRY
    .slice()
    .sort(function(a, b) {
      return Number(a.order || 0) - Number(b.order || 0);
    });
}

/**
 * Returns enabled processors only.
 *
 * @returns {Object[]}
 */
function sciipGetEnabledProcessors() {
  return sciipGetProcessorRegistry().filter(function(processor) {
    return processor.enabled === true;
  });
}

/**
 * Finds a processor by ID.
 *
 * @param {string} processorId
 * @returns {Object|null}
 */
function sciipGetProcessorById(processorId) {
  const normalizedId = sciipNormalizeRuntimeToken(processorId);

  const matches = sciipGetProcessorRegistry().filter(function(processor) {
    return processor.id === normalizedId;
  });

  return matches.length ? matches[0] : null;
}

/**
 * Runs all enabled processors that currently exist in the runtime.
 *
 * Missing processor implementations are skipped safely during migration.
 *
 * @param {Object=} context
 * @returns {Object[]}
 */
function sciipRunEnabledProcessors(context) {
  const runtimeContext = context || sciipCreateRuntimeContext();
  const results = [];

  sciipGetEnabledProcessors().forEach(function(processor) {
    results.push(sciipRunProcessor(processor.id, runtimeContext));
  });

  return results;
}

/**
 * Runs a single processor by ID.
 *
 * @param {string} processorId
 * @param {Object=} context
 * @returns {Object}
 */
function sciipRunProcessor(processorId, context) {
  const processor = sciipGetProcessorById(processorId);
  const startedAt = sciipNowIso();

  if (!processor) {
    return {
      processorId: processorId,
      status: 'NOT_FOUND',
      startedAt: startedAt,
      completedAt: sciipNowIso(),
      message: 'Processor is not registered.'
    };
  }

  const fn = this[processor.functionName];

  if (typeof fn !== 'function') {
    return {
      processorId: processor.id,
      processorName: processor.name,
      status: 'SKIPPED',
      startedAt: startedAt,
      completedAt: sciipNowIso(),
      message: 'Processor function is not implemented yet: ' + processor.functionName
    };
  }

  try {
    const result = fn(context || sciipCreateRuntimeContext());

    return {
      processorId: processor.id,
      processorName: processor.name,
      status: 'SUCCESS',
      startedAt: startedAt,
      completedAt: sciipNowIso(),
      result: result || null
    };
  } catch (error) {
    return {
      processorId: processor.id,
      processorName: processor.name,
      status: 'ERROR',
      startedAt: startedAt,
      completedAt: sciipNowIso(),
      error: String(error && error.stack ? error.stack : error)
    };
  }
}

/* ==========================================================
   SCIIP_OS
   Module: Processors
   File: ProcessorRunner.gs

   Purpose:
   Executes SCIIP processors against queued work.

   Processor Runner is responsible for:

   - Reading WORK_QUEUE
   - Resolving Processor
   - Executing Processor
   - Recording Results

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Runs all pending queue items.
 *
 * @returns {Object}
 */
function sciipRunQueue() {

  const pendingTasks =
    sciipQueuePending();

  const results = [];

  pendingTasks.forEach(function(task) {

    const result =
      sciipRunTask(task);

    results.push(result);

  });

  return {
    tasksProcessed:
      results.length,
    results: results,
    completedAt:
      sciipNowIso()
  };
}

/**
 * Runs a single queue task.
 *
 * @param {Object} task
 * @returns {Object}
 */
function sciipRunTask(task) {

  const processor =
    sciipFindProcessorForTask(
      task.Task_Type
    );

  if (!processor) {

    return {
      queueId:
        task.Queue_ID,
      status:
        'NO_PROCESSOR'
    };
  }

  try {

    const fn =
      this[
        processor.functionName
      ];

    if (
      typeof fn !==
      'function'
    ) {

      return {
        queueId:
          task.Queue_ID,
        status:
          'MISSING_FUNCTION',
        processor:
          processor.functionName
      };
    }

    const result =
      fn({
        queueTask: task
      });

    sciipMarkQueueComplete(
      task.Queue_ID
    );

    return {
      queueId:
        task.Queue_ID,
      status:
        'SUCCESS',
      processor:
        processor.id,
      result:
        result
    };

  } catch (error) {

    return {
      queueId:
        task.Queue_ID,
      status:
        'ERROR',
      error:
        String(error)
    };
  }
}

/**
 * Finds a processor for a task.
 *
 * Initial implementation:
 * Event Type → Processor
 *
 * Future:
 * Vocabulary driven routing.
 *
 * @param {string} taskType
 * @returns {Object|null}
 */
function sciipFindProcessorForTask(
  taskType
) {

  const processors =
    sciipGetEnabledProcessors();

  if (
    !processors.length
  ) {
    return null;
  }

  return processors[0];
}

/**
 * Marks queue item complete.
 *
 * @param {string} queueId
 */
function sciipMarkQueueComplete(
  queueId
) {

  const sheet =
    sciipGetWorkQueueSheet();

  const values =
    sheet
      .getDataRange()
      .getValues();

  const headers =
    values[0];

  const queueIndex =
    headers.indexOf(
      'Queue_ID'
    );

  const statusIndex =
    headers.indexOf(
      'Status'
    );

  const completedIndex =
    headers.indexOf(
      'Completed_At'
    );

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    if (
      values[i][queueIndex] ===
      queueId
    ) {

      sheet
        .getRange(
          i + 1,
          statusIndex + 1
        )
        .setValue(
          'COMPLETE'
        );

      sheet
        .getRange(
          i + 1,
          completedIndex + 1
        )
        .setValue(
          sciipNowIso()
        );

      return;
    }
  }
}

/**
 * Processor Runner statistics.
 *
 * @returns {Object}
 */
function sciipProcessorRunnerStats() {

  const queueStats =
    sciipQueueStats();

  return {
    queueRecords:
      queueStats.queueRecords,

    pendingTasks:
      queueStats.pendingTasks,

    generatedAt:
      sciipNowIso()
  };
}

/*******************************************************
 * SCIIP Runtime Certification Suite v2.1
 * Registry-based runtime certification.
 *******************************************************/

function sciipRunRuntimeCertificationSuiteV2() {
  const startedAt = new Date();
  const runId = 'RUNTIME_CERTIFICATION_V2_' + Utilities.getUuid();
  const tests = sciipGetRuntimeCertificationTestRegistry();

  const results = [];

  tests.forEach(function(item) {
    const testStartedAt = new Date();

    try {
      const result = item.fn();

      const row = {
        Run_ID: runId,
        Processor_ID: item.id,
        Test_Function: item.name,
        Processor: result.processor || '',
        Status: result.status || '',
        Errors: Number(result.errors || 0),
        Duration_MS: new Date() - testStartedAt,
        Message: result.message || '',
        Completed_At: new Date().toISOString()
      };

      results.push(row);
      Logger.log('PASS: ' + item.id + ' — ' + item.name + ' — ' + row.Status);

    } catch (e) {
      const row = {
        Run_ID: runId,
        Processor_ID: item.id,
        Test_Function: item.name,
        Processor: '',
        Status: 'ERROR',
        Errors: 1,
        Duration_MS: new Date() - testStartedAt,
        Message: e.stack || e.message,
        Completed_At: new Date().toISOString()
      };

      results.push(row);
      Logger.log('FAIL: ' + item.id + ' — ' + item.name);
      Logger.log(e.stack || e.message);
      throw e;
    }
  });

  sciipAppendRuntimeCertificationSuiteV2Ledger_(results);

  const failed = results.filter(function(row) {
    return row.Status === 'ERROR' || Number(row.Errors || 0) > 0;
  });

  const summary = {
    certification: failed.length === 0 ? 'CERTIFIED' : 'FAILED',
    runId: runId,
    processorsTested: results.length,
    processorsPassed: results.length - failed.length,
    processorsFailed: failed.length,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString()
  };

  sciipRecordSystemCertification(summary);

Logger.log(JSON.stringify(summary, null, 2));
return summary;
}

function sciipRuntimeCertificationTest_(id, name) {
  const fn = this[name];

  if (typeof fn !== 'function') {
    throw new Error('Missing test function: ' + name);
  }

  return {
    id: id,
    name: name,
    fn: fn
  };
}

function sciipAppendRuntimeCertificationSuiteV2Ledger_(rows) {
  const sheet = sciipEnsureRuntimeCertificationSuiteV2Ledger_();

  rows.forEach(function(row) {
    sheet.appendRow([
      row.Run_ID,
      row.Processor_ID,
      row.Test_Function,
      row.Processor,
      row.Status,
      row.Errors,
      row.Duration_MS,
      row.Message,
      row.Completed_At
    ]);
  });
}

function sciipEnsureRuntimeCertificationSuiteV2Ledger_() {
  const ss = sciipGetSpreadsheet_();
  const sheetName = 'RUNTIME_CERTIFICATION_SUITE_LEDGER';

  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      'Run_ID',
      'Processor_ID',
      'Test_Function',
      'Processor',
      'Status',
      'Errors',
      'Duration_MS',
      'Message',
      'Completed_At'
    ]);
  }

  return sheet;
}

function sciipGetRuntimeCertificationTestRegistry() {
  return [
    sciipRuntimeCertificationTest_(890, 'sciipTestAutonomousGovernanceMonitoringProcessor'),
    sciipRuntimeCertificationTest_(900, 'sciipTestAutonomousGovernanceReviewProcessor'),
    sciipRuntimeCertificationTest_(910, 'sciipTestAutonomousProcessorGuidanceProcessor'),
    sciipRuntimeCertificationTest_(920, 'sciipTestAutonomousProcessorExecutionPlanProcessor'),
    sciipRuntimeCertificationTest_(930, 'sciipTestAutonomousProcessorBuildTaskProcessor'),
    sciipRuntimeCertificationTest_(940, 'sciipTestAutonomousProcessorBuildValidationProcessor'),
    sciipRuntimeCertificationTest_(950, 'sciipTestAutonomousProcessorReadinessProcessor'),
    sciipRuntimeCertificationTest_(960, 'sciipTestAutonomousProcessorPromotionDecisionProcessor'),
    sciipRuntimeCertificationTest_(970, 'sciipTestAutonomousProcessorOrchestrationQueueProcessor'),
    sciipRuntimeCertificationTest_(980, 'sciipTestAutonomousProcessorExecutionMonitorProcessor'),
    sciipRuntimeCertificationTest_(990, 'sciipTestAutonomousProcessorExecutionReadinessProcessor'),
    sciipRuntimeCertificationTest_(1000, 'sciipTestAutonomousProcessorExecutionControlProcessor'),
    sciipRuntimeCertificationTest_(1010, 'sciipTestAutonomousProcessorExecutionDispatchProcessor'),
    sciipRuntimeCertificationTest_(1020, 'sciipTestAutonomousProcessorExecutionLedgerProcessor'),
    sciipRuntimeCertificationTest_(1030, 'sciipTestAutonomousProcessorExecutionOutcomeProcessor'),
    sciipRuntimeCertificationTest_(1040, 'sciipTestAutonomousProcessorExecutionSummaryProcessor')
  ];
}

/*******************************************************
 * SCIIP System Certification Writer
 *******************************************************/

function sciipRecordSystemCertification(certificationSummary) {
  const sheet = sciipEnsureSystemCertificationsSheet_();

  sheet.appendRow([
    'SYSTEM_CERTIFICATION_' + Utilities.getUuid(),
    certificationSummary.runId || '',
    'SCIIP_OS_RUNTIME',
    certificationSummary.certification || '',
    certificationSummary.processorsTested || 0,
    certificationSummary.processorsPassed || 0,
    certificationSummary.processorsFailed || 0,
    certificationSummary.startedAt || '',
    certificationSummary.completedAt || '',
    new Date().toISOString()
  ]);

  return certificationSummary;
}

function sciipEnsureSystemCertificationsSheet_() {
  const ss = sciipGetSpreadsheet_();
  const sheetName = 'SYSTEM_CERTIFICATIONS';

  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      'Certification_ID',
      'Run_ID',
      'Certification_Surface',
      'Certification_Status',
      'Processors_Tested',
      'Processors_Passed',
      'Processors_Failed',
      'Run_Started_At',
      'Run_Completed_At',
      'Recorded_At'
    ]);
  }

  return sheet;
}

/*******************************************************
 * SCIIP Runtime Certification Suite
 * Permanent regression + certification harness
 *******************************************************/

const SCIIP_RUNTIME_CERTIFICATION_LEDGER_SHEET =
  'RUNTIME_CERTIFICATION_LEDGER';

function sciipRunRuntimeCertificationSuite() {
  const tests = sciipGetRuntimeCertificationTests_();
  const startedAt = new Date();
  const runId = 'RUNTIME_CERTIFICATION_' + Utilities.getUuid();

  const results = [];

  tests.forEach(function(item) {
    const testStartedAt = new Date();

    try {
      const result = item.fn();

      results.push({
        Run_ID: runId,
        Processor_ID: item.id,
        Test_Function: item.name,
        Processor: result.processor || '',
        Status: result.status || '',
        Errors: result.errors || 0,
        Duration_MS: new Date() - testStartedAt,
        Message: result.message || '',
        Completed_At: new Date().toISOString()
      });

      Logger.log('PASS: ' + item.id + ' — ' + item.name + ' — ' + result.status);

    } catch (e) {
      results.push({
        Run_ID: runId,
        Processor_ID: item.id,
        Test_Function: item.name,
        Processor: '',
        Status: 'ERROR',
        Errors: 1,
        Duration_MS: new Date() - testStartedAt,
        Message: e.stack || e.message,
        Completed_At: new Date().toISOString()
      });

      Logger.log('FAIL: ' + item.id + ' — ' + item.name);
      Logger.log(e.stack || e.message);

      throw e;
    }
  });

  sciipAppendRuntimeCertificationLedger_(results);

  const failed = results.filter(function(row) {
    return row.Status === 'ERROR' || Number(row.Errors || 0) > 0;
  });

  const summary = {
    certification: failed.length === 0 ? 'CERTIFIED' : 'FAILED',
    runId: runId,
    tested: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

function sciipRuntimeCertificationTest_(id, name) {
  const fn = this[name];

  if (typeof fn !== 'function') {
    throw new Error('Missing test function: ' + name);
  }

  return {
    id: id,
    name: name,
    fn: fn
  };
}

function sciipAppendRuntimeCertificationLedger_(rows) {
  const sheet = sciipEnsureRuntimeCertificationLedger_();

  rows.forEach(function(row) {
    sheet.appendRow([
      row.Run_ID,
      row.Processor_ID,
      row.Test_Function,
      row.Processor,
      row.Status,
      row.Errors,
      row.Duration_MS,
      row.Message,
      row.Completed_At
    ]);
  });
}

function sciipEnsureRuntimeCertificationLedger_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(SCIIP_RUNTIME_CERTIFICATION_LEDGER_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_RUNTIME_CERTIFICATION_LEDGER_SHEET);
    sheet.appendRow([
      'Run_ID',
      'Processor_ID',
      'Test_Function',
      'Processor',
      'Status',
      'Errors',
      'Duration_MS',
      'Message',
      'Completed_At'
    ]);
  }

  return sheet;
}

function sciipGetRuntimeCertificationTests_() {
  return [
    sciipRuntimeCertificationTest_(890, 'sciipTestAutonomousGovernanceMonitoringProcessor'),
    sciipRuntimeCertificationTest_(900, 'sciipTestAutonomousGovernanceReviewProcessor'),
    sciipRuntimeCertificationTest_(910, 'sciipTestAutonomousProcessorGuidanceProcessor'),
    sciipRuntimeCertificationTest_(920, 'sciipTestAutonomousProcessorExecutionPlanProcessor'),
    sciipRuntimeCertificationTest_(930, 'sciipTestAutonomousProcessorBuildTaskProcessor'),
    sciipRuntimeCertificationTest_(940, 'sciipTestAutonomousProcessorBuildValidationProcessor'),
    sciipRuntimeCertificationTest_(950, 'sciipTestAutonomousProcessorReadinessProcessor'),
    sciipRuntimeCertificationTest_(960, 'sciipTestAutonomousProcessorPromotionDecisionProcessor'),
    sciipRuntimeCertificationTest_(970, 'sciipTestAutonomousProcessorOrchestrationQueueProcessor'),
    sciipRuntimeCertificationTest_(980, 'sciipTestAutonomousProcessorExecutionMonitorProcessor'),
    sciipRuntimeCertificationTest_(990, 'sciipTestAutonomousProcessorExecutionReadinessProcessor'),
    sciipRuntimeCertificationTest_(1000, 'sciipTestAutonomousProcessorExecutionControlProcessor'),
    sciipRuntimeCertificationTest_(1010, 'sciipTestAutonomousProcessorExecutionDispatchProcessor'),
    sciipRuntimeCertificationTest_(1020, 'sciipTestAutonomousProcessorExecutionLedgerProcessor'),
    sciipRuntimeCertificationTest_(1030, 'sciipTestAutonomousProcessorExecutionOutcomeProcessor'),
    sciipRuntimeCertificationTest_(1040, 'sciipTestAutonomousProcessorExecutionSummaryProcessor')
  ];
}

/**
 * SCIIP_OS v5.2
 * Shared Runtime Framework
 * File: SCIIP_RuntimeCommon.gs
 */


SCIIP_RUNTIME.VERSION = 'v5.2';

SCIIP_RUNTIME.DEFAULT_SPREADSHEET_ID = '1x5lXkh0l63v92tYacGe7S8vHISHycBufaLfE54dPPDk';

SCIIP_RUNTIME.SHEETS = {
  RUNTIME_FRAMEWORK_LEDGER: 'RUNTIME_FRAMEWORK_LEDGER',
  RUNTIME_FRAMEWORK_INDEX: 'RUNTIME_FRAMEWORK_INDEX',
  RUNTIME_FRAMEWORK_ERRORS: 'RUNTIME_FRAMEWORK_ERRORS'
};

SCIIP_RUNTIME.HEADERS = {
  RUNTIME_FRAMEWORK_LEDGER: [
    'Timestamp',
    'Framework_Version',
    'Processor',
    'Action',
    'Business_Key',
    'Status',
    'Payload_JSON',
    'Result_JSON'
  ],
  RUNTIME_FRAMEWORK_INDEX: [
    'Business_Key',
    'Processor',
    'Action',
    'Status',
    'Last_Updated',
    'Latest_Result_JSON'
  ],
  RUNTIME_FRAMEWORK_ERRORS: [
    'Timestamp',
    'Processor',
    'Action',
    'Business_Key',
    'Error_Message',
    'Stack'
  ]
};

SCIIP_RUNTIME.getSpreadsheetId = function() {
  if (
    typeof SCIIP !== 'undefined' &&
    SCIIP &&
    SCIIP.SPREADSHEET_ID
  ) {
    return SCIIP.SPREADSHEET_ID;
  }

  return SCIIP_RUNTIME.DEFAULT_SPREADSHEET_ID;
};

SCIIP_RUNTIME.getSpreadsheet = function() {
  return SpreadsheetApp.openById(SCIIP_RUNTIME.getSpreadsheetId());
};

SCIIP_RUNTIME.ensureSheet = function(sheetName, headers) {
  var ss = SCIIP_RUNTIME.getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
};

SCIIP_RUNTIME.ensureRuntimeSheets = function() {
  Object.keys(SCIIP_RUNTIME.SHEETS).forEach(function(key) {
    var sheetName = SCIIP_RUNTIME.SHEETS[key];
    SCIIP_RUNTIME.ensureSheet(sheetName, SCIIP_RUNTIME.HEADERS[sheetName]);
  });
};

SCIIP_RUNTIME.getDateKey = function(config) {
  if (config && config.dateKey) return config.dateKey;

  if (typeof sciipTodayIso === 'function') {
    return sciipTodayIso();
  }

  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
};

SCIIP_RUNTIME.makeBusinessKey = function(parts) {
  return parts
    .filter(function(p) {
      return p !== null && p !== undefined && String(p).trim() !== '';
    })
    .map(function(p) {
      return String(p).trim().toUpperCase();
    })
    .join('|');
};

SCIIP_RUNTIME.existsInLedger = function(sheetName, businessKey) {
  var ss = SCIIP_RUNTIME.getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet || sheet.getLastRow() < 2) return false;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idx = headers.indexOf('Business_Key');

  if (idx === -1) return false;

  var values = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
    .getValues();

  return values.some(function(row) {
    return String(row[idx]) === String(businessKey);
  });
};

SCIIP_RUNTIME.compactPayload = function(payload) {
  if (!payload) return {};

  return {
    id: payload.id || payload.processor || null,
    businessKey: payload.businessKey || null,
    status: payload.status || null,
    count: payload.count || payload.recordsCreated || payload.processed || 0,
    completedAt: payload.completedAt || new Date().toISOString()
  };
};

SCIIP_RUNTIME.result = function(config) {
  return {
    processor: config.processor,
    status: config.status || 'SUCCESS',
    businessKey: config.businessKey || null,
    recordsCreated: config.recordsCreated || 0,
    skippedDuplicate: config.skippedDuplicate || 0,
    message: config.message || '',
    completedAt: new Date().toISOString()
  };
};

SCIIP_RUNTIME.logLedger = function(config) {
  SCIIP_RUNTIME.ensureRuntimeSheets();

  var sheet = SCIIP_RUNTIME
    .getSpreadsheet()
    .getSheetByName(SCIIP_RUNTIME.SHEETS.RUNTIME_FRAMEWORK_LEDGER);

  sheet.appendRow([
    new Date(),
    SCIIP_RUNTIME.VERSION,
    config.processor,
    config.action,
    config.businessKey,
    config.status,
    JSON.stringify(SCIIP_RUNTIME.compactPayload(config.payload)),
    JSON.stringify(SCIIP_RUNTIME.compactPayload(config.result))
  ]);
};

SCIIP_RUNTIME.logError = function(config, error) {
  SCIIP_RUNTIME.ensureRuntimeSheets();

  var sheet = SCIIP_RUNTIME
    .getSpreadsheet()
    .getSheetByName(SCIIP_RUNTIME.SHEETS.RUNTIME_FRAMEWORK_ERRORS);

  sheet.appendRow([
    new Date(),
    config.processor || '',
    config.action || '',
    config.businessKey || '',
    error && error.message ? error.message : String(error),
    error && error.stack ? error.stack : ''
  ]);
};

SCIIP_RUNTIME.runProcessor = function(config) {
  SCIIP_RUNTIME.ensureRuntimeSheets();

  var dateKey = SCIIP_RUNTIME.getDateKey(config);

  var businessKey = SCIIP_RUNTIME.makeBusinessKey([
    config.processor,
    config.action,
    dateKey
  ]);

  try {
    if (
      SCIIP_RUNTIME.existsInLedger(
        SCIIP_RUNTIME.SHEETS.RUNTIME_FRAMEWORK_LEDGER,
        businessKey
      )
    ) {
      var duplicateResult = SCIIP_RUNTIME.result({
        processor: config.processor,
        status: 'SUCCESS',
        businessKey: businessKey,
        skippedDuplicate: 1,
        message: 'Duplicate skipped by shared runtime framework.'
      });

      SCIIP_RUNTIME.logLedger({
        processor: config.processor,
        action: config.action,
        businessKey: businessKey,
        status: 'SKIPPED_DUPLICATE',
        payload: { businessKey: businessKey },
        result: duplicateResult
      });

      return duplicateResult;
    }

    var payload = config.buildPayload ? config.buildPayload() : {};
    var executionResult = config.execute ? config.execute(payload) : {};

    var result = SCIIP_RUNTIME.result({
      processor: config.processor,
      status: executionResult.status || 'SUCCESS',
      businessKey: businessKey,
      recordsCreated: executionResult.recordsCreated || 0,
      message: executionResult.message || ''
    });

    SCIIP_RUNTIME.logLedger({
      processor: config.processor,
      action: config.action,
      businessKey: businessKey,
      status: result.status,
      payload: payload,
      result: result
    });

    return result;

  } catch (err) {
    SCIIP_RUNTIME.logError({
      processor: config.processor,
      action: config.action,
      businessKey: businessKey
    }, err);

    throw err;
  }
};

/**
 * Standalone validation test.
 */
function sciipTest2380_RuntimeFrameworkCommon() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2380_RuntimeFrameworkCommon',
    action: 'RUNTIME_FRAMEWORK_BOOTSTRAP',

    buildPayload: function() {
      return {
        processor: '2380_RuntimeFrameworkCommon',
        status: 'TEST_PAYLOAD_CREATED',
        count: 1
      };
    },

    execute: function(payload) {
      return {
        status: 'SUCCESS',
        recordsCreated: 1,
        message: 'Runtime framework common validated.'
      };
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2380_RuntimeFrameworkCommon',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v6.1
 * Runtime Compatibility Facade
 *
 * Canonical location for preserved v5.x runtime aliases. New code must call
 * the owning service namespace directly. These aliases remain read-through
 * delegates so existing processors continue to work during modernization.
 */
var SCIIP_RUNTIME_COMPATIBILITY = (function () {
  'use strict';

  var VERSION = 'v6.1';
  var aliases = [];

  function bind(name, resolver) {
    if (typeof SCIIP_RUNTIME[name] === 'function') {
      return;
    }
    SCIIP_RUNTIME[name] = function () {
      var fn = resolver();
      if (typeof fn !== 'function') {
        throw new Error('SCIIP runtime compatibility target unavailable: ' + name);
      }
      return fn.apply(null, arguments);
    };
    aliases.push(name);
  }

  bind('result', function () { return SCIIP_RUNTIME_RESULT_FACTORY.create; });
  bind('compactPayload', function () { return SCIIP_RUNTIME_PAYLOAD_FACTORY.compact; });
  bind('createContext', function () { return SCIIP_RUNTIME_CONTEXT.create; });
  bind('getSpreadsheet', function () { return SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet; });
  bind('ensureSheet', function () {
    return function (sheetName, headers) {
      return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(sheetName, headers);
    };
  });
  bind('runTransaction', function () { return SCIIP_RUNTIME_TRANSACTION_MANAGER.run; });
  bind('runBaseProcessor', function () { return SCIIP_RUNTIME_PROCESSOR_BASE.run; });
  bind('log', function () { return SCIIP_RUNTIME_LOGGING.write; });
  bind('logInfo', function () { return SCIIP_RUNTIME_LOGGING.info; });
  bind('logWarn', function () { return SCIIP_RUNTIME_LOGGING.warn; });
  bind('logErrorEvent', function () { return SCIIP_RUNTIME_LOGGING.error; });
  bind('logDebug', function () { return SCIIP_RUNTIME_LOGGING.debug; });
  bind('logAudit', function () { return SCIIP_RUNTIME_LOGGING.audit; });

  function report() {
    return {
      version: VERSION,
      namespaceOwner: SCIIP_RUNTIME.NAMESPACE_OWNER || null,
      aliasCount: aliases.length,
      aliases: aliases.slice()
    };
  }

  return {
    VERSION: VERSION,
    report: report
  };
})();

function sciipTestRuntimeCompatibilityFacade() {
  var report = SCIIP_RUNTIME_COMPATIBILITY.report();
  var required = [
    'result', 'compactPayload', 'createContext', 'getSpreadsheet',
    'ensureSheet', 'runTransaction', 'runBaseProcessor', 'log',
    'logInfo', 'logWarn', 'logErrorEvent', 'logDebug', 'logAudit'
  ];
  var missing = required.filter(function (name) {
    return typeof SCIIP_RUNTIME[name] !== 'function';
  });
  var result = {
    test: 'sciipTestRuntimeCompatibilityFacade',
    status: missing.length ? 'FAILED' : 'PASSED',
    namespaceOwner: SCIIP_RUNTIME.NAMESPACE_OWNER || null,
    requiredAliasCount: required.length,
    missingAliases: missing,
    report: report
  };
  Logger.log(JSON.stringify(result));
  return result;
}


/**
 * SCIIP_OS v5.2
 * Runtime Context
 * File: SCIIP_RuntimeContext.gs
 *
 * Processor: 2420_RuntimeContext
 *
 * Purpose:
 * Centralizes runtime context creation for SCIIP_OS.
 * Future processors should use this module to create consistent
 * processor/action/date/business-key/spreadsheet metadata.
 */

var SCIIP_RUNTIME_CONTEXT = SCIIP_RUNTIME_CONTEXT || {};

SCIIP_RUNTIME_CONTEXT.VERSION = 'v5.2';

SCIIP_RUNTIME_CONTEXT.create = function(config) {
  config = config || {};

  var processor = config.processor || '';
  var action = config.action || '';
  var dateKey = config.dateKey || SCIIP_RUNTIME.getDateKey(config);

  var businessKey = config.businessKey || SCIIP_RUNTIME.makeBusinessKey([
    processor,
    action,
    dateKey
  ]);

  var spreadsheetId = config.spreadsheetId;

  if (!spreadsheetId && SCIIP_RUNTIME_SHEET_FACTORY) {
    spreadsheetId = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheetId();
  }

  if (!spreadsheetId && SCIIP_RUNTIME.getSpreadsheetId) {
    spreadsheetId = SCIIP_RUNTIME.getSpreadsheetId();
  }

  return {
    processor: processor,
    action: action,
    dateKey: dateKey,
    businessKey: businessKey,
    spreadsheetId: spreadsheetId || null,
    frameworkVersion: SCIIP_RUNTIME_CONTEXT.VERSION,
    runtimeVersion: SCIIP_RUNTIME.VERSION || SCIIP_RUNTIME_CONTEXT.VERSION,
    startedAt: config.startedAt || new Date().toISOString(),
    operator: config.operator || Session.getActiveUser().getEmail() || '',
    sourceSheet: config.sourceSheet || null,
    targetSheet: config.targetSheet || null,
    ledgerSheet: config.ledgerSheet || null,
    flags: config.flags || {},
    refs: config.refs || {}
  };
};

SCIIP_RUNTIME_CONTEXT.fromProcessor = function(processor, action, dateKey) {
  return SCIIP_RUNTIME_CONTEXT.create({
    processor: processor,
    action: action,
    dateKey: dateKey
  });
};

SCIIP_RUNTIME_CONTEXT.withSheets = function(config) {
  config = config || {};

  return SCIIP_RUNTIME_CONTEXT.create({
    processor: config.processor,
    action: config.action,
    dateKey: config.dateKey,
    businessKey: config.businessKey,
    sourceSheet: config.sourceSheet,
    targetSheet: config.targetSheet,
    ledgerSheet: config.ledgerSheet,
    flags: config.flags || {},
    refs: config.refs || {}
  });
};

SCIIP_RUNTIME_CONTEXT.compact = function(context) {
  context = context || {};

  return {
    processor: context.processor || null,
    action: context.action || null,
    dateKey: context.dateKey || null,
    businessKey: context.businessKey || null,
    frameworkVersion: context.frameworkVersion || SCIIP_RUNTIME_CONTEXT.VERSION,
    startedAt: context.startedAt || null
  };
};

SCIIP_RUNTIME_CONTEXT.validate = function(context) {
  var errors = [];

  if (!context) {
    errors.push('Missing runtime context.');
  } else {
    if (!context.processor) errors.push('Missing processor.');
    if (!context.action) errors.push('Missing action.');
    if (!context.dateKey) errors.push('Missing dateKey.');
    if (!context.businessKey) errors.push('Missing businessKey.');
    if (!context.spreadsheetId) errors.push('Missing spreadsheetId.');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
};

/**
 * Standalone validation test.
 */
function sciipTest2420_RuntimeContext() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2420_RuntimeContext',
    action: 'RUNTIME_CONTEXT_VALIDATION',

    buildPayload: function() {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: '2420_RuntimeContext',
        action: 'RUNTIME_CONTEXT_VALIDATION'
      });

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: '2420_RuntimeContext',
        action: 'RUNTIME_CONTEXT_VALIDATION',
        businessKey: context.businessKey,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime context test payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context)
        }
      });
    },

    execute: function(payload) {
      var context = SCIIP_RUNTIME_CONTEXT.withSheets({
        processor: '2420_RuntimeContext',
        action: 'RUNTIME_CONTEXT_SHEET_VALIDATION',
        sourceSheet: 'SCIIP_RUNTIME_CONTEXT_SOURCE_TEST',
        targetSheet: 'SCIIP_RUNTIME_CONTEXT_TARGET_TEST',
        ledgerSheet: 'SCIIP_RUNTIME_CONTEXT_LEDGER_TEST'
      });

      var validation = SCIIP_RUNTIME_CONTEXT.validate(context);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: '2420_RuntimeContext',
        recordsCreated: validation.valid ? 1 : 0,
        processed: 1,
        message: JSON.stringify({
          contextValid: validation.valid,
          errors: validation.errors,
          businessKey: context.businessKey,
          spreadsheetId: context.spreadsheetId
        })
      });
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2420_RuntimeContext',
    result: result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2260 Runtime Dispatch Registry
 ************************************************************/

function sciipRun2260_RuntimeDispatchRegistry() {
  const processor = '2260_RuntimeDispatchRegistry';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_QUEUE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'queueLedgerScope',
      'queueLedgerName',
      'queueLedgerStatus',
      'ledgeredQueueBusinessKey',
      'executionMode',
      'nextStageNumber',
      'queuedProcessorCount',
      'queuedProcessorRegistryKeys',
      'queueLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const dispatchSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_DISPATCH_REGISTRY',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'dispatchScope',
      'dispatchName',
      'dispatchStatus',
      'dispatchResult',
      'executionMode',
      'nextStageNumber',
      'dispatchableProcessorCount',
      'dispatchableProcessorRegistryKeys',
      'dispatchRegistryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_DISPATCH_REGISTRY|' + dateKey;

  if (sciipSheetBusinessKeyExists_(dispatchSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeDispatchRegistriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_EXECUTION_QUEUE_LEDGER',
      runtimeDispatchRegistriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let dispatchableProcessorRegistryKeys = [];

  try {
    dispatchableProcessorRegistryKeys = JSON.parse(
      sourceRecord.queuedProcessorRegistryKeys || '[]'
    );
  } catch (err) {
    dispatchableProcessorRegistryKeys = [];
  }

  const dispatchableProcessorCount = dispatchableProcessorRegistryKeys.length;
  const executionMode = sourceRecord.executionMode || 'NONE';
  const nextStageNumber = Number(sourceRecord.nextStageNumber || 0);

  let dispatchStatus = 'READY';
  let dispatchResult = 'DISPATCH_READY';

  if (dispatchableProcessorCount === 0) {
    dispatchStatus = 'EMPTY';
    dispatchResult = 'NO_PROCESSORS_TO_DISPATCH';
  }

  const now = new Date();

  const dispatchRegistryPayload = {
    dispatchRegistryType: 'SCIIP_RUNTIME_DISPATCH_REGISTRY',
    sourceExecutionQueueLedgerBusinessKey: sourceRecord.businessKey || '',
    executionMode,
    nextStageNumber,
    dispatchableProcessorCount,
    dispatchableProcessorRegistryKeys,
    dispatchStatus,
    dispatchResult,
    registeredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.queueLedgerStatus || '',
    executionMode,
    createdAt: sourceRecord.createdAt || ''
  };

  dispatchSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.queueLedgerStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Dispatch Registry',
    dispatchStatus,
    dispatchResult,
    executionMode,
    nextStageNumber,
    dispatchableProcessorCount,
    JSON.stringify(dispatchableProcessorRegistryKeys),
    JSON.stringify(dispatchRegistryPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeDispatchRegistriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    dispatchStatus,
    dispatchableProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2260_RuntimeDispatchRegistry() {
  const result = sciipRun2260_RuntimeDispatchRegistry();

  Logger.log(JSON.stringify({
    test: 'sciipTest2260_RuntimeDispatchRegistry',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2300 Runtime Error Handler
 ************************************************************/

function sciipRun2300_RuntimeErrorHandler() {
  const processor = '2300_RuntimeErrorHandler';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_EXECUTION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'runtimeLedgerScope',
      'runtimeLedgerName',
      'runtimeLedgerStatus',
      'ledgeredRuntimeBusinessKey',
      'runtimeStatus',
      'runtimeResult',
      'executionMode',
      'nextStageNumber',
      'resolvedProcessorCount',
      'executedProcessorCount',
      'failedProcessorCount',
      'skippedProcessorCount',
      'runtimeExecutionResultsJson',
      'runtimeLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const errorSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_ERROR_HANDLER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'errorScope',
      'errorHandlerName',
      'errorHandlerStatus',
      'errorHandlerResult',
      'runtimeStatus',
      'runtimeResult',
      'failedProcessorCount',
      'skippedProcessorCount',
      'detectedErrorCount',
      'detectedErrorsJson',
      'errorHandlerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_ERROR_HANDLER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(errorSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeErrorHandlersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_RUNTIME_EXECUTION_LEDGER',
      runtimeErrorHandlersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let runtimeExecutionResults = [];

  try {
    runtimeExecutionResults = JSON.parse(
      sourceRecord.runtimeExecutionResultsJson || '[]'
    );
  } catch (err) {
    runtimeExecutionResults = [];
  }

  const detectedErrors = runtimeExecutionResults.filter(function(item) {
    const status = String(item.status || '').toUpperCase();
    return (
      status === 'FAILED' ||
      status === 'SKIPPED_FUNCTION_NOT_FOUND' ||
      status.indexOf('ERROR') >= 0
    );
  });

  const failedProcessorCount = Number(sourceRecord.failedProcessorCount || 0);
  const skippedProcessorCount = Number(sourceRecord.skippedProcessorCount || 0);
  const detectedErrorCount = detectedErrors.length;

  let errorHandlerStatus = 'CLEAR';
  let errorHandlerResult = 'NO_RUNTIME_ERRORS_DETECTED';

  if (failedProcessorCount > 0 || detectedErrorCount > 0) {
    errorHandlerStatus = 'ERRORS_DETECTED';
    errorHandlerResult = 'RUNTIME_ERRORS_REQUIRE_REVIEW';
  } else if (skippedProcessorCount > 0) {
    errorHandlerStatus = 'WARNINGS_DETECTED';
    errorHandlerResult = 'RUNTIME_SKIPS_REQUIRE_REVIEW';
  }

  const now = new Date();

  const errorHandlerPayload = {
    errorHandlerType: 'SCIIP_RUNTIME_ERROR_HANDLER',
    sourceRuntimeExecutionLedgerBusinessKey: sourceRecord.businessKey || '',
    runtimeStatus: sourceRecord.runtimeStatus || '',
    runtimeResult: sourceRecord.runtimeResult || '',
    failedProcessorCount,
    skippedProcessorCount,
    detectedErrorCount,
    detectedErrors,
    errorHandlerStatus,
    errorHandlerResult,
    handledAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.runtimeLedgerStatus || '',
    runtimeStatus: sourceRecord.runtimeStatus || '',
    runtimeResult: sourceRecord.runtimeResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  errorSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.runtimeLedgerStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Error Handler',
    errorHandlerStatus,
    errorHandlerResult,
    sourceRecord.runtimeStatus || '',
    sourceRecord.runtimeResult || '',
    failedProcessorCount,
    skippedProcessorCount,
    detectedErrorCount,
    JSON.stringify(detectedErrors),
    JSON.stringify(errorHandlerPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeErrorHandlersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    errorHandlerStatus,
    detectedErrorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2300_RuntimeErrorHandler() {
  const result = sciipRun2300_RuntimeErrorHandler();

  Logger.log(JSON.stringify({
    test: 'sciipTest2300_RuntimeErrorHandler',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2290 Runtime Execution Ledger
 ************************************************************/

function sciipRun2290_RuntimeExecutionLedger() {
  const processor = '2290_RuntimeExecutionLedger';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_RUNTIME',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'runtimeScope',
      'runtimeName',
      'runtimeStatus',
      'runtimeResult',
      'executionMode',
      'nextStageNumber',
      'resolvedProcessorCount',
      'executedProcessorCount',
      'failedProcessorCount',
      'skippedProcessorCount',
      'runtimeExecutionResultsJson',
      'runtimePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_EXECUTION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'runtimeLedgerScope',
      'runtimeLedgerName',
      'runtimeLedgerStatus',
      'ledgeredRuntimeBusinessKey',
      'runtimeStatus',
      'runtimeResult',
      'executionMode',
      'nextStageNumber',
      'resolvedProcessorCount',
      'executedProcessorCount',
      'failedProcessorCount',
      'skippedProcessorCount',
      'runtimeExecutionResultsJson',
      'runtimeLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_EXECUTION_LEDGER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeExecutionLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_EXECUTION_RUNTIME',
      runtimeExecutionLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SCIIP_RUNTIME_EXECUTION_LEDGER',
    ledgeredRuntimeBusinessKey: sourceRecord.businessKey || '',
    runtimeStatus: sourceRecord.runtimeStatus || '',
    runtimeResult: sourceRecord.runtimeResult || '',
    executionMode: sourceRecord.executionMode || '',
    nextStageNumber: Number(sourceRecord.nextStageNumber || 0),
    resolvedProcessorCount: Number(sourceRecord.resolvedProcessorCount || 0),
    executedProcessorCount: Number(sourceRecord.executedProcessorCount || 0),
    failedProcessorCount: Number(sourceRecord.failedProcessorCount || 0),
    skippedProcessorCount: Number(sourceRecord.skippedProcessorCount || 0),
    ledgeredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.runtimeStatus || '',
    runtimeResult: sourceRecord.runtimeResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.runtimeStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Execution Ledger',
    'LEDGERED',
    sourceRecord.businessKey || '',
    sourceRecord.runtimeStatus || '',
    sourceRecord.runtimeResult || '',
    sourceRecord.executionMode || '',
    sourceRecord.nextStageNumber || 0,
    sourceRecord.resolvedProcessorCount || 0,
    sourceRecord.executedProcessorCount || 0,
    sourceRecord.failedProcessorCount || 0,
    sourceRecord.skippedProcessorCount || 0,
    sourceRecord.runtimeExecutionResultsJson || '[]',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeExecutionLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2290_RuntimeExecutionLedger() {
  const result = sciipRun2290_RuntimeExecutionLedger();

  Logger.log(JSON.stringify({
    test: 'sciipTest2290_RuntimeExecutionLedger',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2360 Runtime Health Ledger
 ************************************************************/

function sciipRun2360_RuntimeHealthLedger() {
  const processor = '2360_RuntimeHealthLedger';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_HEALTH_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'snapshotScope',
      'snapshotName',
      'snapshotStatus',
      'snapshotResult',
      'runtimeHealthStatus',
      'overallRuntimeScore',
      'harnessStatus',
      'registeredTestCount',
      'executableTestCount',
      'missingTestCount',
      'snapshotFinding',
      'snapshotRecommendation',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_HEALTH_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'healthLedgerScope',
      'healthLedgerName',
      'healthLedgerStatus',
      'ledgeredHealthSnapshotBusinessKey',
      'runtimeHealthStatus',
      'overallRuntimeScore',
      'snapshotStatus',
      'snapshotResult',
      'healthFinding',
      'healthRecommendation',
      'healthLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_HEALTH_LEDGER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeHealthLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_RUNTIME_HEALTH_SNAPSHOT',
      runtimeHealthLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const healthLedgerPayload = {
    ledgerType: 'SCIIP_RUNTIME_HEALTH_LEDGER',
    ledgeredHealthSnapshotBusinessKey: sourceRecord.businessKey || '',
    runtimeHealthStatus: sourceRecord.runtimeHealthStatus || '',
    overallRuntimeScore: Number(sourceRecord.overallRuntimeScore || 0),
    snapshotStatus: sourceRecord.snapshotStatus || '',
    snapshotResult: sourceRecord.snapshotResult || '',
    healthFinding: sourceRecord.snapshotFinding || '',
    healthRecommendation: sourceRecord.snapshotRecommendation || '',
    ledgeredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.snapshotStatus || '',
    snapshotResult: sourceRecord.snapshotResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.snapshotStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Health Ledger',
    'LEDGERED',
    sourceRecord.businessKey || '',
    sourceRecord.runtimeHealthStatus || '',
    sourceRecord.overallRuntimeScore || 0,
    sourceRecord.snapshotStatus || '',
    sourceRecord.snapshotResult || '',
    sourceRecord.snapshotFinding || '',
    sourceRecord.snapshotRecommendation || '',
    JSON.stringify(healthLedgerPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeHealthLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2360_RuntimeHealthLedger() {
  const result = sciipRun2360_RuntimeHealthLedger();

  Logger.log(JSON.stringify({
    test: 'sciipTest2360_RuntimeHealthLedger',
    result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2350 Runtime Health Snapshot
 ************************************************************/

function sciipRun2350_RuntimeHealthSnapshot() {
  const processor = '2350_RuntimeHealthSnapshot';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_REGRESSION_TEST_HARNESS',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'harnessScope',
      'harnessName',
      'harnessStatus',
      'harnessResult',
      'registeredTestCount',
      'executableTestCount',
      'missingTestCount',
      'testHarnessMode',
      'registeredTestsJson',
      'missingTestsJson',
      'harnessPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const snapshotSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_HEALTH_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'snapshotScope',
      'snapshotName',
      'snapshotStatus',
      'snapshotResult',
      'runtimeHealthStatus',
      'overallRuntimeScore',
      'harnessStatus',
      'registeredTestCount',
      'executableTestCount',
      'missingTestCount',
      'snapshotFinding',
      'snapshotRecommendation',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_HEALTH_SNAPSHOT|' + dateKey;

  if (sciipSheetBusinessKeyExists_(snapshotSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeHealthSnapshotsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGRESSION_TEST_HARNESS',
      runtimeHealthSnapshotsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const missingTestCount = Number(sourceRecord.missingTestCount || 0);
  const registeredTestCount = Number(sourceRecord.registeredTestCount || 0);
  const executableTestCount = Number(sourceRecord.executableTestCount || 0);

  let snapshotStatus = 'HEALTHY';
  let snapshotResult = 'RUNTIME_HEALTH_CONFIRMED';
  let runtimeHealthStatus = 'HEALTHY';
  let overallRuntimeScore = 100;
  let snapshotFinding =
    'Runtime health snapshot confirms the runtime engine is healthy and regression harness is ready.';
  let snapshotRecommendation =
    'Proceed toward runtime health ledger and readiness certification.';

  if (missingTestCount > 0) {
    snapshotStatus = 'ATTENTION_REQUIRED';
    snapshotResult = 'RUNTIME_HEALTH_ATTENTION_REQUIRED';
    runtimeHealthStatus = 'TEST_COVERAGE_GAP';
    overallRuntimeScore = 80;
    snapshotFinding =
      'Runtime health snapshot detected missing registered processor test coverage.';
    snapshotRecommendation =
      'Add missing processor tests before certifying the runtime engine as production ready.';
  }

  const now = new Date();

  const snapshotPayload = {
    snapshotType: 'SCIIP_RUNTIME_HEALTH_SNAPSHOT',
    sourceRegressionTestHarnessBusinessKey: sourceRecord.businessKey || '',
    runtimeHealthStatus,
    overallRuntimeScore,
    harnessStatus: sourceRecord.harnessStatus || '',
    registeredTestCount,
    executableTestCount,
    missingTestCount,
    snapshotStatus,
    snapshotResult,
    snapshotFinding,
    snapshotRecommendation,
    snapshottedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.harnessStatus || '',
    harnessResult: sourceRecord.harnessResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  snapshotSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.harnessStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Health Snapshot',
    snapshotStatus,
    snapshotResult,
    runtimeHealthStatus,
    overallRuntimeScore,
    sourceRecord.harnessStatus || '',
    registeredTestCount,
    executableTestCount,
    missingTestCount,
    snapshotFinding,
    snapshotRecommendation,
    JSON.stringify(snapshotPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeHealthSnapshotsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    snapshotStatus,
    runtimeHealthStatus,
    overallRuntimeScore,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2350_RuntimeHealthSnapshot() {
  const result = sciipRun2350_RuntimeHealthSnapshot();

  Logger.log(JSON.stringify({
    test: 'sciipTest2350_RuntimeHealthSnapshot',
    result
  }));

  return result;
}

/**
 * SCIIP_OS v5.2
 * Runtime Logging
 * File: SCIIP_RuntimeLogging.gs
 *
 * Processor: 2440_RuntimeLogging
 *
 * Purpose:
 * Centralizes structured runtime logging for SCIIP_OS.
 * Supports INFO, WARN, ERROR, DEBUG, and AUDIT log levels.
 */

var SCIIP_RUNTIME_LOGGING = SCIIP_RUNTIME_LOGGING || {};

SCIIP_RUNTIME_LOGGING.VERSION = 'v5.2';

SCIIP_RUNTIME_LOGGING.SHEET = 'SCIIP_RUNTIME_LOG';

SCIIP_RUNTIME_LOGGING.HEADERS = [
  'Timestamp',
  'Level',
  'Processor',
  'Action',
  'Business_Key',
  'Message',
  'Payload_JSON',
  'Context_JSON',
  'Framework_Version'
];

SCIIP_RUNTIME_LOGGING.ensureLogSheet = function() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    SCIIP_RUNTIME_LOGGING.SHEET,
    SCIIP_RUNTIME_LOGGING.HEADERS
  );
};

SCIIP_RUNTIME_LOGGING.write = function(config) {
  config = config || {};

  SCIIP_RUNTIME_LOGGING.ensureLogSheet();

  var context = config.context || {};

  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
    SCIIP_RUNTIME_LOGGING.SHEET,
    SCIIP_RUNTIME_LOGGING.HEADERS,
    {
      Timestamp: new Date(),
      Level: config.level || 'INFO',
      Processor: config.processor || context.processor || '',
      Action: config.action || context.action || '',
      Business_Key: config.businessKey || context.businessKey || '',
      Message: config.message || '',
      Payload_JSON: config.payload || {},
      Context_JSON: context || {},
      Framework_Version: SCIIP_RUNTIME_LOGGING.VERSION
    }
  );

  return {
    status: 'LOG_WRITTEN',
    level: config.level || 'INFO',
    processor: config.processor || context.processor || '',
    action: config.action || context.action || '',
    businessKey: config.businessKey || context.businessKey || '',
    completedAt: new Date().toISOString()
  };
};

SCIIP_RUNTIME_LOGGING.info = function(config) {
  config = config || {};
  config.level = 'INFO';
  return SCIIP_RUNTIME_LOGGING.write(config);
};

SCIIP_RUNTIME_LOGGING.warn = function(config) {
  config = config || {};
  config.level = 'WARN';
  return SCIIP_RUNTIME_LOGGING.write(config);
};

SCIIP_RUNTIME_LOGGING.error = function(config) {
  config = config || {};
  config.level = 'ERROR';
  return SCIIP_RUNTIME_LOGGING.write(config);
};

SCIIP_RUNTIME_LOGGING.debug = function(config) {
  config = config || {};
  config.level = 'DEBUG';
  return SCIIP_RUNTIME_LOGGING.write(config);
};

SCIIP_RUNTIME_LOGGING.audit = function(config) {
  config = config || {};
  config.level = 'AUDIT';
  return SCIIP_RUNTIME_LOGGING.write(config);
};

SCIIP_RUNTIME_LOGGING.fromError = function(context, error, payload) {
  return SCIIP_RUNTIME_LOGGING.error({
    context: context || {},
    payload: payload || {},
    message:
      error && error.message
        ? error.message
        : String(error || 'Unknown runtime error.')
  });
};

/**
 * Standalone validation test.
 */
function sciipTest2440_RuntimeLogging() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2440_RuntimeLogging',
    action: 'RUNTIME_LOGGING_VALIDATION',

    buildPayload: function() {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: '2440_RuntimeLogging',
        action: 'RUNTIME_LOGGING_VALIDATION'
      });

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: '2440_RuntimeLogging',
        action: 'RUNTIME_LOGGING_VALIDATION',
        businessKey: context.businessKey,
        inputCount: 5,
        outputCount: 5,
        summary: 'Runtime logging test payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context)
        }
      });
    },

    execute: function(payload) {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: '2440_RuntimeLogging',
        action: 'RUNTIME_LOGGING_EXECUTION_TEST'
      });

      SCIIP_RUNTIME_LOGGING.info({
        context: context,
        payload: payload,
        message: 'Runtime logging INFO event validated.'
      });

      SCIIP_RUNTIME_LOGGING.warn({
        context: context,
        payload: payload,
        message: 'Runtime logging WARN event validated.'
      });

      SCIIP_RUNTIME_LOGGING.debug({
        context: context,
        payload: payload,
        message: 'Runtime logging DEBUG event validated.'
      });

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: payload,
        message: 'Runtime logging AUDIT event validated.'
      });

      SCIIP_RUNTIME_LOGGING.error({
        context: context,
        payload: payload,
        message: 'Runtime logging ERROR event validated.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: '2440_RuntimeLogging',
        recordsCreated: 5,
        processed: 5,
        message: 'Runtime logging validated across INFO, WARN, DEBUG, AUDIT, ERROR.'
      });
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2440_RuntimeLogging',
    result: result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2330 Runtime Metrics Index
 ************************************************************/

function sciipRun2330_RuntimeMetricsIndex() {
  const processor = '2330_RuntimeMetricsIndex';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_MONITOR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'monitorScope',
      'monitorName',
      'monitorStatus',
      'monitorResult',
      'detectedErrorCount',
      'retryEligibleCount',
      'retryBlockedCount',
      'runtimeHealthStatus',
      'runtimeHealthScore',
      'monitorFinding',
      'monitorRecommendation',
      'monitorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const metricsSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_METRICS_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'metricsScope',
      'metricsName',
      'metricsStatus',
      'runtimeHealthStatus',
      'runtimeHealthScore',
      'throughputScore',
      'reliabilityScore',
      'availabilityScore',
      'overallRuntimeScore',
      'metricsPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_METRICS_INDEX|' + dateKey;

  if (sciipSheetBusinessKeyExists_(metricsSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeMetricsIndexesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_EXECUTION_MONITOR',
      runtimeMetricsIndexesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const runtimeHealthScore = Number(sourceRecord.runtimeHealthScore || 100);
  const detectedErrorCount = Number(sourceRecord.detectedErrorCount || 0);
  const retryEligibleCount = Number(sourceRecord.retryEligibleCount || 0);
  const retryBlockedCount = Number(sourceRecord.retryBlockedCount || 0);

  const throughputScore = Math.max(0, 100 - detectedErrorCount * 5);
  const reliabilityScore = Math.max(0, 100 - retryEligibleCount * 10);
  const availabilityScore = Math.max(0, 100 - retryBlockedCount * 20);

  const overallRuntimeScore = Math.round(
    (
      runtimeHealthScore +
      throughputScore +
      reliabilityScore +
      availabilityScore
    ) / 4
  );

  const now = new Date();

  const metricsPayload = {
    metricsType: 'SCIIP_RUNTIME_METRICS_INDEX',
    sourceExecutionMonitorBusinessKey: sourceRecord.businessKey || '',
    runtimeHealthStatus: sourceRecord.runtimeHealthStatus || '',
    runtimeHealthScore,
    throughputScore,
    reliabilityScore,
    availabilityScore,
    overallRuntimeScore,
    indexedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.monitorStatus || '',
    monitorResult: sourceRecord.monitorResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  metricsSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.monitorStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Metrics Index',
    'INDEXED',
    sourceRecord.runtimeHealthStatus || '',
    runtimeHealthScore,
    throughputScore,
    reliabilityScore,
    availabilityScore,
    overallRuntimeScore,
    JSON.stringify(metricsPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeMetricsIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    overallRuntimeScore,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2330_RuntimeMetricsIndex() {
  const result = sciipRun2330_RuntimeMetricsIndex();

  Logger.log(JSON.stringify({
    test: 'sciipTest2330_RuntimeMetricsIndex',
    result
  }));

  return result;
}

/**
 * SCIIP_OS v5.2
 * Runtime Payload Factory
 * File: SCIIP_RuntimePayloadFactory.gs
 *
 * Processor: 2400_RuntimePayloadFactory
 *
 * Purpose:
 * Centralizes compact runtime payload creation for SCIIP_OS.
 * Future processors should use this factory instead of hand-building
 * oversized JSON payloads.
 */

var SCIIP_RUNTIME_PAYLOAD_FACTORY = SCIIP_RUNTIME_PAYLOAD_FACTORY || {};

SCIIP_RUNTIME_PAYLOAD_FACTORY.VERSION = 'v5.2';

SCIIP_RUNTIME_PAYLOAD_FACTORY.create = function(config) {
  config = config || {};

  return {
    processor: config.processor || '',
    action: config.action || '',
    businessKey: config.businessKey || null,
    sourceSheet: config.sourceSheet || null,
    targetSheet: config.targetSheet || null,
    ledgerSheet: config.ledgerSheet || null,
    inputCount: config.inputCount || 0,
    outputCount: config.outputCount || 0,
    status: config.status || 'PAYLOAD_CREATED',
    summary: config.summary || '',
    refs: config.refs || {},
    flags: config.flags || {},
    frameworkVersion: SCIIP_RUNTIME_PAYLOAD_FACTORY.VERSION,
    createdAt: new Date().toISOString()
  };
};

SCIIP_RUNTIME_PAYLOAD_FACTORY.compact = function(payload) {
  payload = payload || {};

  return {
    processor: payload.processor || null,
    action: payload.action || null,
    businessKey: payload.businessKey || null,
    status: payload.status || null,
    inputCount: payload.inputCount || payload.count || 0,
    outputCount: payload.outputCount || payload.recordsCreated || 0,
    summary: payload.summary || '',
    createdAt: payload.createdAt || new Date().toISOString()
  };
};

SCIIP_RUNTIME_PAYLOAD_FACTORY.fromSheets = function(config) {
  config = config || {};

  return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
    processor: config.processor,
    action: config.action,
    businessKey: config.businessKey,
    sourceSheet: config.sourceSheet,
    targetSheet: config.targetSheet,
    ledgerSheet: config.ledgerSheet,
    inputCount: config.inputCount || 0,
    outputCount: config.outputCount || 0,
    summary: config.summary || 'Sheet-based payload created.',
    refs: config.refs || {},
    flags: config.flags || {}
  });
};

SCIIP_RUNTIME_PAYLOAD_FACTORY.fromLatestRecord = function(config) {
  config = config || {};
  var record = config.record || {};

  return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
    processor: config.processor,
    action: config.action,
    businessKey: config.businessKey || record.Business_Key || record.businessKey || null,
    sourceSheet: config.sourceSheet || null,
    targetSheet: config.targetSheet || null,
    ledgerSheet: config.ledgerSheet || null,
    inputCount: record ? 1 : 0,
    outputCount: 0,
    summary: config.summary || 'Latest-record payload created.',
    refs: {
      sourceBusinessKey: record.Business_Key || record.businessKey || null,
      sourceStatus: record.Status || record.status || null,
      sourceTimestamp: record.Timestamp || record.timestamp || null
    },
    flags: config.flags || {}
  });
};

SCIIP_RUNTIME_PAYLOAD_FACTORY.empty = function(config) {
  config = config || {};

  return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
    processor: config.processor,
    action: config.action,
    businessKey: config.businessKey || null,
    inputCount: 0,
    outputCount: 0,
    status: 'EMPTY_PAYLOAD',
    summary: config.summary || 'No input records available.',
    refs: {},
    flags: {
      noInputs: true
    }
  });
};

/**
 * Standalone validation test.
 */
function sciipTest2400_RuntimePayloadFactory() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2400_RuntimePayloadFactory',
    action: 'RUNTIME_PAYLOAD_FACTORY_VALIDATION',

    buildPayload: function() {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: '2400_RuntimePayloadFactory',
        action: 'RUNTIME_PAYLOAD_FACTORY_VALIDATION',
        inputCount: 3,
        outputCount: 3,
        summary: 'Runtime payload factory test payload created.'
      });
    },

    execute: function(payload) {
      var sheetPayload = SCIIP_RUNTIME_PAYLOAD_FACTORY.fromSheets({
        processor: '2400_RuntimePayloadFactory',
        action: 'SHEET_PAYLOAD_TEST',
        sourceSheet: 'TEST_SOURCE',
        targetSheet: 'TEST_TARGET',
        ledgerSheet: 'TEST_LEDGER',
        inputCount: 1,
        outputCount: 1
      });

      var latestPayload = SCIIP_RUNTIME_PAYLOAD_FACTORY.fromLatestRecord({
        processor: '2400_RuntimePayloadFactory',
        action: 'LATEST_RECORD_TEST',
        record: {
          Business_Key: 'TEST|LATEST',
          Status: 'SUCCESS',
          Timestamp: new Date().toISOString()
        }
      });

      var emptyPayload = SCIIP_RUNTIME_PAYLOAD_FACTORY.empty({
        processor: '2400_RuntimePayloadFactory',
        action: 'EMPTY_PAYLOAD_TEST'
      });

      return {
        status: 'SUCCESS',
        recordsCreated: 3,
        message: JSON.stringify({
          basePayloadStatus: payload.status,
          sheetPayloadStatus: sheetPayload.status,
          latestPayloadInputCount: latestPayload.inputCount,
          emptyPayloadStatus: emptyPayload.status
        })
      };
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2400_RuntimePayloadFactory',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.2
 * Runtime Processor Base
 * File: SCIIP_RuntimeProcessorBase.gs
 *
 * Processor: 2450_RuntimeProcessorBase
 *
 * Purpose:
 * Provides the reusable base runner for future SCIIP_OS runtime processors.
 * Centralizes context creation, payload creation, transaction handling,
 * logging, execution, result creation, and error handling.
 */

var SCIIP_RUNTIME_PROCESSOR_BASE = SCIIP_RUNTIME_PROCESSOR_BASE || {};

SCIIP_RUNTIME_PROCESSOR_BASE.VERSION = 'v5.2';

SCIIP_RUNTIME_PROCESSOR_BASE.createDefinition = function(config) {
  config = config || {};

  return {
    processor: config.processor || '',
    action: config.action || '',
    sourceSheet: config.sourceSheet || null,
    targetSheet: config.targetSheet || null,
    ledgerSheet: config.ledgerSheet || null,
    buildPayload: config.buildPayload || null,
    execute: config.execute || null,
    validate: config.validate || null,
    onSuccess: config.onSuccess || null,
    onError: config.onError || null,
    flags: config.flags || {},
    refs: config.refs || {},
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION
  };
};

SCIIP_RUNTIME_PROCESSOR_BASE.validateDefinition = function(definition) {
  var errors = [];

  if (!definition) {
    errors.push('Missing processor definition.');
  } else {
    if (!definition.processor) errors.push('Missing processor.');
    if (!definition.action) errors.push('Missing action.');
    if (!definition.execute || typeof definition.execute !== 'function') {
      errors.push('Missing execute function.');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
};

SCIIP_RUNTIME_PROCESSOR_BASE.buildDefaultPayload = function(context, definition) {
  return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
    processor: context.processor,
    action: context.action,
    businessKey: context.businessKey,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    ledgerSheet: definition.ledgerSheet,
    inputCount: 0,
    outputCount: 0,
    summary: 'Default runtime processor base payload created.',
    refs: {
      context: SCIIP_RUNTIME_CONTEXT.compact(context)
    },
    flags: definition.flags || {}
  });
};

SCIIP_RUNTIME_PROCESSOR_BASE.run = function(config) {
  var definition =
    SCIIP_RUNTIME_PROCESSOR_BASE.createDefinition(config);

  var definitionValidation =
    SCIIP_RUNTIME_PROCESSOR_BASE.validateDefinition(definition);

  if (!definitionValidation.valid) {
    return SCIIP_RUNTIME_RESULT_FACTORY.validationFailure({
      processor: definition.processor || 'UNKNOWN_PROCESSOR',
      message: JSON.stringify(definitionValidation.errors)
    });
  }

  return SCIIP_RUNTIME.runProcessor({
    processor: definition.processor,
    action: definition.action,

    buildPayload: function() {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: definition.processor,
        action: definition.action,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        flags: definition.flags,
        refs: definition.refs
      });

      var payload = definition.buildPayload
        ? definition.buildPayload(context, definition)
        : SCIIP_RUNTIME_PROCESSOR_BASE.buildDefaultPayload(
            context,
            definition
          );

      if (!payload.businessKey) {
        payload.businessKey = context.businessKey;
      }

      if (!payload.processor) {
        payload.processor = context.processor;
      }

      if (!payload.action) {
        payload.action = context.action;
      }

      return payload;
    },

    execute: function(payload) {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: definition.processor,
        action: definition.action,
        businessKey: payload.businessKey || null,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        flags: definition.flags,
        refs: definition.refs
      });

      var contextValidation = SCIIP_RUNTIME_CONTEXT.validate(context);

      if (!contextValidation.valid) {
        return SCIIP_RUNTIME_RESULT_FACTORY.validationFailure({
          processor: definition.processor,
          businessKey: context.businessKey,
          message: JSON.stringify(contextValidation.errors)
        });
      }

      if (definition.validate) {
        var customValidation =
          definition.validate(payload, context, definition);

        if (customValidation && customValidation.valid === false) {
          return SCIIP_RUNTIME_RESULT_FACTORY.validationFailure({
            processor: definition.processor,
            businessKey: context.businessKey,
            message: JSON.stringify(customValidation.errors || [])
          });
        }
      }

      SCIIP_RUNTIME_LOGGING.info({
        context: context,
        payload: payload,
        message: 'Runtime processor base execution started.'
      });

      var executionResult =
        SCIIP_RUNTIME_TRANSACTION_MANAGER.run(
          context,
          payload,
          function(txPayload, txContext, transaction) {
            return definition.execute(
              txPayload,
              txContext,
              transaction,
              definition
            );
          }
        );

      var result =
        executionResult && executionResult.status
          ? executionResult
          : SCIIP_RUNTIME_RESULT_FACTORY.success({
              processor: definition.processor,
              businessKey: context.businessKey,
              recordsCreated:
                executionResult && executionResult.recordsCreated
                  ? executionResult.recordsCreated
                  : 0,
              processed:
                executionResult && executionResult.processed
                  ? executionResult.processed
                  : 0,
              message:
                executionResult && executionResult.message
                  ? executionResult.message
                  : 'Runtime processor base execution completed.'
            });

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'Runtime processor base execution completed.'
      });

      if (definition.onSuccess) {
        definition.onSuccess(result, payload, context, definition);
      }

      return result;
    }
  });
};

/**
 * Standalone validation test.
 */
function sciipTest2450_RuntimeProcessorBase() {
  var result = SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2450_RuntimeProcessorBase',
    action: 'RUNTIME_PROCESSOR_BASE_VALIDATION',
    sourceSheet: 'SCIIP_RUNTIME_PROCESSOR_BASE_SOURCE_TEST',
    targetSheet: 'SCIIP_RUNTIME_PROCESSOR_BASE_TARGET_TEST',
    ledgerSheet: 'SCIIP_RUNTIME_PROCESSOR_BASE_LEDGER_TEST',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime processor base validation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context)
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.processor) errors.push('Definition missing processor.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var testSheetName = 'SCIIP_RUNTIME_PROCESSOR_BASE_TEST';

      var headers = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Status',
        'Payload_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(testSheetName, headers, {
        Timestamp: new Date(),
        Processor: context.processor,
        Business_Key: context.businessKey,
        Status: 'SUCCESS',
        Payload_JSON: payload
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: 1,
        message: JSON.stringify({
          processorBaseValidated: true,
          transactionId: transaction.transactionId,
          testSheetName: testSheetName
        })
      });
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2450_RuntimeProcessorBase',
    result: result
  }));

  return result;
}

/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2370 Runtime Readiness Certification
 ************************************************************/

function sciipRun2370_RuntimeReadinessCertification() {
  const processor = '2370_RuntimeReadinessCertification';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_HEALTH_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'healthLedgerScope',
      'healthLedgerName',
      'healthLedgerStatus',
      'ledgeredHealthSnapshotBusinessKey',
      'runtimeHealthStatus',
      'overallRuntimeScore',
      'snapshotStatus',
      'snapshotResult',
      'healthFinding',
      'healthRecommendation',
      'healthLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const certificationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_READINESS_CERTIFICATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'certificationScope',
      'certificationName',
      'certificationStatus',
      'certificationResult',
      'runtimeHealthStatus',
      'overallRuntimeScore',
      'readinessLevel',
      'certificationFinding',
      'certificationRecommendation',
      'certificationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_READINESS_CERTIFICATION|' + dateKey;

  if (sciipSheetBusinessKeyExists_(certificationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeReadinessCertificationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_RUNTIME_HEALTH_LEDGER',
      runtimeReadinessCertificationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const overallRuntimeScore = Number(sourceRecord.overallRuntimeScore || 0);
  const runtimeHealthStatus = sourceRecord.runtimeHealthStatus || '';

  let certificationStatus = 'CERTIFIED';
  let certificationResult = 'RUNTIME_READY';
  let readinessLevel = 'PRODUCTION_READY';
  let certificationFinding =
    'Runtime readiness certification confirms SCIIP_OS Runtime Engine is ready for production autonomous execution.';
  let certificationRecommendation =
    'Proceed with controlled autonomous runtime execution and continue monitoring runtime health ledgers.';

  if (overallRuntimeScore < 90 || runtimeHealthStatus !== 'HEALTHY') {
    certificationStatus = 'CONDITIONAL';
    certificationResult = 'RUNTIME_READY_WITH_CONDITIONS';
    readinessLevel = 'CONDITIONALLY_READY';
    certificationFinding =
      'Runtime readiness certification found conditions requiring monitoring before unrestricted autonomous execution.';
    certificationRecommendation =
      'Proceed only with controlled execution and review runtime health findings before expanding automation.';
  }

  if (overallRuntimeScore < 75) {
    certificationStatus = 'NOT_CERTIFIED';
    certificationResult = 'RUNTIME_NOT_READY';
    readinessLevel = 'NOT_READY';
    certificationFinding =
      'Runtime readiness certification found runtime health below readiness threshold.';
    certificationRecommendation =
      'Do not proceed with autonomous runtime execution until health issues are resolved.';
  }

  const now = new Date();

  const certificationPayload = {
    certificationType: 'SCIIP_RUNTIME_READINESS_CERTIFICATION',
    sourceRuntimeHealthLedgerBusinessKey: sourceRecord.businessKey || '',
    runtimeHealthStatus,
    overallRuntimeScore,
    readinessLevel,
    certificationStatus,
    certificationResult,
    certificationFinding,
    certificationRecommendation,
    certifiedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.healthLedgerStatus || '',
    runtimeHealthStatus,
    overallRuntimeScore,
    createdAt: sourceRecord.createdAt || ''
  };

  certificationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.healthLedgerStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Readiness Certification',
    certificationStatus,
    certificationResult,
    runtimeHealthStatus,
    overallRuntimeScore,
    readinessLevel,
    certificationFinding,
    certificationRecommendation,
    JSON.stringify(certificationPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeReadinessCertificationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    certificationStatus,
    certificationResult,
    readinessLevel,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2370_RuntimeReadinessCertification() {
  const result = sciipRun2370_RuntimeReadinessCertification();

  Logger.log(JSON.stringify({
    test: 'sciipTest2370_RuntimeReadinessCertification',
    result
  }));

  return result;
}

/**
 * SCIIP_OS v5.2
 * Runtime Result Factory
 * File: SCIIP_RuntimeResultFactory.gs
 *
 * Processor: 2390_RuntimeResultFactory
 *
 * Purpose:
 * Centralizes standardized runtime result-object creation for SCIIP_OS.
 * This reduces duplicated result construction across future processors.
 */

var SCIIP_RUNTIME_RESULT_FACTORY = SCIIP_RUNTIME_RESULT_FACTORY || {};

SCIIP_RUNTIME_RESULT_FACTORY.VERSION = 'v5.2';

SCIIP_RUNTIME_RESULT_FACTORY.create = function(config) {
  config = config || {};

  return {
    processor: config.processor || '',
    status: config.status || 'SUCCESS',
    businessKey: config.businessKey || null,
    recordsCreated: config.recordsCreated || 0,
    recordsUpdated: config.recordsUpdated || 0,
    recordsRead: config.recordsRead || 0,
    processed: config.processed || 0,
    skippedDuplicate: config.skippedDuplicate || 0,
    skippedNoInputs: config.skippedNoInputs || 0,
    skippedValidation: config.skippedValidation || 0,
    errors: config.errors || 0,
    message: config.message || '',
    frameworkVersion: SCIIP_RUNTIME_RESULT_FACTORY.VERSION,
    completedAt: new Date().toISOString()
  };
};

SCIIP_RUNTIME_RESULT_FACTORY.success = function(config) {
  config = config || {};
  config.status = 'SUCCESS';
  return SCIIP_RUNTIME_RESULT_FACTORY.create(config);
};

SCIIP_RUNTIME_RESULT_FACTORY.duplicate = function(config) {
  config = config || {};
  config.status = 'SUCCESS';
  config.skippedDuplicate = 1;
  config.recordsCreated = 0;
  config.message = config.message || 'Duplicate skipped by runtime result factory.';
  return SCIIP_RUNTIME_RESULT_FACTORY.create(config);
};

SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs = function(config) {
  config = config || {};
  config.status = 'SKIPPED_NO_INPUTS';
  config.skippedNoInputs = 1;
  config.recordsCreated = 0;
  config.message = config.message || 'No inputs available for processor.';
  return SCIIP_RUNTIME_RESULT_FACTORY.create(config);
};

SCIIP_RUNTIME_RESULT_FACTORY.validationFailure = function(config) {
  config = config || {};
  config.status = 'VALIDATION_FAILED';
  config.skippedValidation = 1;
  config.recordsCreated = 0;
  config.message = config.message || 'Validation failed.';
  return SCIIP_RUNTIME_RESULT_FACTORY.create(config);
};

SCIIP_RUNTIME_RESULT_FACTORY.error = function(config) {
  config = config || {};
  config.status = 'ERROR';
  config.errors = config.errors || 1;
  config.recordsCreated = 0;
  config.message = config.message || 'Runtime error occurred.';
  return SCIIP_RUNTIME_RESULT_FACTORY.create(config);
};

/**
 * Standalone validation test.
 */
function sciipTest2390_RuntimeResultFactory() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2390_RuntimeResultFactory',
    action: 'RUNTIME_RESULT_FACTORY_VALIDATION',

    buildPayload: function() {
      return {
        processor: '2390_RuntimeResultFactory',
        status: 'TEST_PAYLOAD_CREATED',
        count: 5
      };
    },

    execute: function(payload) {
      var successResult = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: '2390_RuntimeResultFactory',
        businessKey: 'TEST|SUCCESS',
        recordsCreated: 1,
        message: 'Success result created.'
      });

      var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
        processor: '2390_RuntimeResultFactory',
        businessKey: 'TEST|DUPLICATE'
      });

      var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
        processor: '2390_RuntimeResultFactory',
        businessKey: 'TEST|NO_INPUTS'
      });

      var validationResult = SCIIP_RUNTIME_RESULT_FACTORY.validationFailure({
        processor: '2390_RuntimeResultFactory',
        businessKey: 'TEST|VALIDATION'
      });

      var errorResult = SCIIP_RUNTIME_RESULT_FACTORY.error({
        processor: '2390_RuntimeResultFactory',
        businessKey: 'TEST|ERROR',
        message: 'Synthetic error result created.'
      });

      return {
        status: 'SUCCESS',
        recordsCreated: 5,
        message: JSON.stringify({
          successResult: successResult.status,
          duplicateSkipped: duplicateResult.skippedDuplicate,
          skippedStatus: skippedResult.status,
          validationStatus: validationResult.status,
          errorStatus: errorResult.status
        })
      };
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2390_RuntimeResultFactory',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.2
 * Runtime Sheet Factory
 * File: SCIIP_RuntimeSheetFactory.gs
 *
 * Processor: 2410_RuntimeSheetFactory
 *
 * Purpose:
 * Centralizes runtime spreadsheet access, sheet initialization,
 * header validation, row appends, and latest-record retrieval.
 */

var SCIIP_RUNTIME_SHEET_FACTORY = SCIIP_RUNTIME_SHEET_FACTORY || {};

SCIIP_RUNTIME_SHEET_FACTORY.VERSION = 'v5.2';

SCIIP_RUNTIME_SHEET_FACTORY.DEFAULT_SPREADSHEET_ID =
  '1x5lXkh0l63v92tYacGe7S8vHISHycBufaLfE54dPPDk';

SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheetId = function() {
  if (
    typeof SCIIP !== 'undefined' &&
    SCIIP &&
    SCIIP.SPREADSHEET_ID
  ) {
    return SCIIP.SPREADSHEET_ID;
  }

  if (
    typeof SCIIP_RUNTIME !== 'undefined' &&
    SCIIP_RUNTIME &&
    SCIIP_RUNTIME.DEFAULT_SPREADSHEET_ID
  ) {
    return SCIIP_RUNTIME.DEFAULT_SPREADSHEET_ID;
  }

  return SCIIP_RUNTIME_SHEET_FACTORY.DEFAULT_SPREADSHEET_ID;
};

SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet = function() {
  return SpreadsheetApp.openById(
    SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheetId()
  );
};

SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet = function(sheetName, headers) {
  var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (headers && headers.length > 0) {
    SCIIP_RUNTIME_SHEET_FACTORY.ensureHeaders(sheet, headers);
  }

  return sheet;
};

SCIIP_RUNTIME_SHEET_FACTORY.ensureHeaders = function(sheet, headers) {
  if (!sheet || !headers || headers.length === 0) return sheet;

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    return sheet;
  }

  var existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length))
    .getValues()[0];

  var changed = false;

  headers.forEach(function(header, index) {
    if (existingHeaders[index] !== header) {
      existingHeaders[index] = header;
      changed = true;
    }
  });

  if (changed) {
    sheet
      .getRange(1, 1, 1, existingHeaders.length)
      .setValues([existingHeaders]);
    sheet.setFrozenRows(1);
  }

  return sheet;
};

SCIIP_RUNTIME_SHEET_FACTORY.appendObject = function(sheetName, headers, object) {
  var sheet = SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(sheetName, headers);

  var row = headers.map(function(header) {
    var value = object && object.hasOwnProperty(header) ? object[header] : '';

    if (
      value !== null &&
      value !== undefined &&
      typeof value === 'object'
    ) {
      return JSON.stringify(value);
    }

    return value === null || value === undefined ? '' : value;
  });

  sheet.appendRow(row);

  return {
    sheetName: sheetName,
    rowNumber: sheet.getLastRow(),
    columnsWritten: headers.length
  };
};

SCIIP_RUNTIME_SHEET_FACTORY.getHeaders = function(sheetName) {
  var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet || sheet.getLastRow() === 0) return [];

  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
};

SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords = function(sheetName) {
  var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet || sheet.getLastRow() < 2) return [];

  var headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  var values = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
    .getValues();

  return values.map(function(row) {
    var record = {};

    headers.forEach(function(header, index) {
      record[header] = row[index];
    });

    return record;
  });
};

SCIIP_RUNTIME_SHEET_FACTORY.getLatestRecord = function(sheetName) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  return records[records.length - 1];
};

SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey = function(sheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  for (var i = records.length - 1; i >= 0; i--) {
    if (String(records[i].Business_Key) === String(businessKey)) {
      return records[i];
    }

    if (String(records[i].businessKey) === String(businessKey)) {
      return records[i];
    }
  }

  return null;
};

/**
 * Standalone validation test.
 */
function sciipTest2410_RuntimeSheetFactory() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2410_RuntimeSheetFactory',
    action: 'RUNTIME_SHEET_FACTORY_VALIDATION',

    buildPayload: function() {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: '2410_RuntimeSheetFactory',
        action: 'RUNTIME_SHEET_FACTORY_VALIDATION',
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime sheet factory test payload created.'
      });
    },

    execute: function(payload) {
      var testSheetName = 'SCIIP_RUNTIME_SHEET_FACTORY_TEST';

      var headers = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Status',
        'Payload_JSON'
      ];

      var testBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        '2410_RuntimeSheetFactory',
        'SHEET_APPEND_TEST',
        SCIIP_RUNTIME.getDateKey({})
      ]);

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(testSheetName, headers, {
        Timestamp: new Date(),
        Processor: '2410_RuntimeSheetFactory',
        Business_Key: testBusinessKey,
        Status: 'SUCCESS',
        Payload_JSON: payload
      });

      var latestRecord =
        SCIIP_RUNTIME_SHEET_FACTORY.getLatestRecord(testSheetName);

      var locatedRecord =
        SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
          testSheetName,
          testBusinessKey
        );

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: '2410_RuntimeSheetFactory',
        recordsCreated: 1,
        processed: latestRecord && locatedRecord ? 1 : 0,
        message: JSON.stringify({
          testSheetName: testSheetName,
          latestRecordFound: !!latestRecord,
          businessKeyLocated: !!locatedRecord
        })
      });
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2410_RuntimeSheetFactory',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.2
 * Runtime Transaction Manager
 * File: SCIIP_RuntimeTransactionManager.gs
 *
 * Processor: 2430_RuntimeTransactionManager
 *
 * Purpose:
 * Centralizes transaction lifecycle management for SCIIP_OS runtime execution.
 * Tracks transaction start, commit, failure, rollback intent, duration,
 * business key, status, and compact payloads.
 */

var SCIIP_RUNTIME_TRANSACTION_MANAGER =
  SCIIP_RUNTIME_TRANSACTION_MANAGER || {};

SCIIP_RUNTIME_TRANSACTION_MANAGER.VERSION = 'v5.2';

SCIIP_RUNTIME_TRANSACTION_MANAGER.SHEET =
  'SCIIP_RUNTIME_TRANSACTION_LEDGER';

SCIIP_RUNTIME_TRANSACTION_MANAGER.HEADERS = [
  'Timestamp',
  'Transaction_Id',
  'Processor',
  'Action',
  'Business_Key',
  'Transaction_Status',
  'Duration_Ms',
  'Payload_JSON',
  'Result_JSON',
  'Error_JSON',
  'Framework_Version'
];

SCIIP_RUNTIME_TRANSACTION_MANAGER.ensureLedger = function() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    SCIIP_RUNTIME_TRANSACTION_MANAGER.SHEET,
    SCIIP_RUNTIME_TRANSACTION_MANAGER.HEADERS
  );
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.createTransactionId = function(context) {
  context = context || {};

  return SCIIP_RUNTIME.makeBusinessKey([
    'TXN',
    context.processor || 'UNKNOWN_PROCESSOR',
    context.action || 'UNKNOWN_ACTION',
    context.dateKey || SCIIP_RUNTIME.getDateKey({}),
    new Date().getTime()
  ]);
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.begin = function(context, payload) {
  context = context || {};
  payload = payload || {};

  var transactionId =
    context.transactionId ||
    SCIIP_RUNTIME_TRANSACTION_MANAGER.createTransactionId(context);

  var startedAt = new Date();

  var transaction = {
    transactionId: transactionId,
    processor: context.processor || '',
    action: context.action || '',
    businessKey: context.businessKey || null,
    status: 'STARTED',
    startedAt: startedAt,
    startedAtIso: startedAt.toISOString(),
    durationMs: 0,
    payload: SCIIP_RUNTIME.compactPayload(payload),
    result: null,
    error: null,
    frameworkVersion: SCIIP_RUNTIME_TRANSACTION_MANAGER.VERSION
  };

  SCIIP_RUNTIME_TRANSACTION_MANAGER.log(transaction);

  return transaction;
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.commit = function(transaction, result) {
  transaction = transaction || {};
  result = result || {};

  var completedAt = new Date();

  transaction.status = 'COMMITTED';
  transaction.completedAt = completedAt;
  transaction.completedAtIso = completedAt.toISOString();
  transaction.durationMs =
    completedAt.getTime() - new Date(transaction.startedAt).getTime();
  transaction.result = SCIIP_RUNTIME.compactPayload(result);
  transaction.error = null;

  SCIIP_RUNTIME_TRANSACTION_MANAGER.log(transaction);

  return transaction;
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.fail = function(transaction, error) {
  transaction = transaction || {};
  error = error || {};

  var completedAt = new Date();

  transaction.status = 'FAILED';
  transaction.completedAt = completedAt;
  transaction.completedAtIso = completedAt.toISOString();
  transaction.durationMs =
    transaction.startedAt
      ? completedAt.getTime() - new Date(transaction.startedAt).getTime()
      : 0;
  transaction.error = {
    message: error && error.message ? error.message : String(error),
    stack: error && error.stack ? error.stack : ''
  };

  SCIIP_RUNTIME_TRANSACTION_MANAGER.log(transaction);

  return transaction;
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.rollbackIntent = function(transaction, reason) {
  transaction = transaction || {};

  var completedAt = new Date();

  transaction.status = 'ROLLBACK_INTENT_RECORDED';
  transaction.completedAt = completedAt;
  transaction.completedAtIso = completedAt.toISOString();
  transaction.durationMs =
    transaction.startedAt
      ? completedAt.getTime() - new Date(transaction.startedAt).getTime()
      : 0;
  transaction.error = {
    message: reason || 'Rollback intent recorded.',
    stack: ''
  };

  SCIIP_RUNTIME_TRANSACTION_MANAGER.log(transaction);

  return transaction;
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.log = function(transaction) {
  SCIIP_RUNTIME_TRANSACTION_MANAGER.ensureLedger();

  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
    SCIIP_RUNTIME_TRANSACTION_MANAGER.SHEET,
    SCIIP_RUNTIME_TRANSACTION_MANAGER.HEADERS,
    {
      Timestamp: new Date(),
      Transaction_Id: transaction.transactionId || '',
      Processor: transaction.processor || '',
      Action: transaction.action || '',
      Business_Key: transaction.businessKey || '',
      Transaction_Status: transaction.status || '',
      Duration_Ms: transaction.durationMs || 0,
      Payload_JSON: transaction.payload || {},
      Result_JSON: transaction.result || {},
      Error_JSON: transaction.error || {},
      Framework_Version:
        transaction.frameworkVersion ||
        SCIIP_RUNTIME_TRANSACTION_MANAGER.VERSION
    }
  );
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.run = function(context, payload, executor) {
  var transaction =
    SCIIP_RUNTIME_TRANSACTION_MANAGER.begin(context, payload);

  try {
    var result = executor ? executor(payload, context, transaction) : {};

    SCIIP_RUNTIME_TRANSACTION_MANAGER.commit(transaction, result);

    return result;

  } catch (err) {
    SCIIP_RUNTIME_TRANSACTION_MANAGER.fail(transaction, err);
    SCIIP_RUNTIME_TRANSACTION_MANAGER.rollbackIntent(
      transaction,
      'Rollback intent recorded after runtime execution failure.'
    );

    throw err;
  }
};

/**
 * Standalone validation test.
 */
function sciipTest2430_RuntimeTransactionManager() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2430_RuntimeTransactionManager',
    action: 'RUNTIME_TRANSACTION_MANAGER_VALIDATION',

    buildPayload: function() {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: '2430_RuntimeTransactionManager',
        action: 'RUNTIME_TRANSACTION_MANAGER_VALIDATION'
      });

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: '2430_RuntimeTransactionManager',
        action: 'RUNTIME_TRANSACTION_MANAGER_VALIDATION',
        businessKey: context.businessKey,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime transaction manager test payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context)
        }
      });
    },

    execute: function(payload) {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: '2430_RuntimeTransactionManager',
        action: 'TRANSACTION_EXECUTION_TEST'
      });

      var transactionResult =
        SCIIP_RUNTIME_TRANSACTION_MANAGER.run(
          context,
          payload,
          function(txPayload, txContext, transaction) {
            return SCIIP_RUNTIME_RESULT_FACTORY.success({
              processor: '2430_RuntimeTransactionManager',
              businessKey: txContext.businessKey,
              recordsCreated: 1,
              processed: 1,
              message: JSON.stringify({
                transactionId: transaction.transactionId,
                transactionStatus: transaction.status,
                payloadStatus: txPayload.status
              })
            });
          }
        );

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: '2430_RuntimeTransactionManager',
        recordsCreated: 1,
        processed: 1,
        message: JSON.stringify({
          transactionResultStatus: transactionResult.status,
          transactionBusinessKey: transactionResult.businessKey || null
        })
      });
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2430_RuntimeTransactionManager',
    result: result
  }));

  return result;
}

function sciipCompactWorkbookGrid() {
  const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

  ss.getSheets().forEach(function(sheet) {
    const lastRow = Math.max(sheet.getLastRow(), 1);
    const lastCol = Math.max(sheet.getLastColumn(), 1);

    const maxRows = sheet.getMaxRows();
    const maxCols = sheet.getMaxColumns();

    if (maxRows > lastRow + 25) {
      sheet.deleteRows(lastRow + 26, maxRows - lastRow - 25);
    }

    if (maxCols > lastCol + 5) {
      sheet.deleteColumns(lastCol + 6, maxCols - lastCol - 5);
    }
  });

  Logger.log('SCIIP runtime workbook grid compacted.');
}