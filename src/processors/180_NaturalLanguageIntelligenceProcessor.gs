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

  var queries = sciipReadOptionalNLIObjects_(
    SCIIP_NLI.SHEETS.QUERY
  );

  var responsesSheet =
    sciipEnsureNLIResponseSheet_();

  var processed = 0;

  queries.forEach(function(query) {

    var status =
      sciipFirstNLIValue_(query, ['Status']);

    if (status === 'PROCESSED') return;

    var queryId =
      sciipFirstNLIValue_(query, ['Query_ID']);

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
      new Date()
    ]);

    query.Status = 'PROCESSED';

    processed++;

  });

  var result = {
    processor: '180_NaturalLanguageIntelligenceProcessor',
    processed: processed
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