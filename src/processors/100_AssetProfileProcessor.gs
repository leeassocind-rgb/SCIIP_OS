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

    var latestPayload = sciipParseProfilePayload_(latestEvent);

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