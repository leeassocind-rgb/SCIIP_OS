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