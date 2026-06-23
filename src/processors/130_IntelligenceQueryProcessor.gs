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