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