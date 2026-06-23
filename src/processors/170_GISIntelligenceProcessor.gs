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