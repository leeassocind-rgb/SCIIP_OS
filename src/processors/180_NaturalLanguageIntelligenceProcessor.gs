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