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