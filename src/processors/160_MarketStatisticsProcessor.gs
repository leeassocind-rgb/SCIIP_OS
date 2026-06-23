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