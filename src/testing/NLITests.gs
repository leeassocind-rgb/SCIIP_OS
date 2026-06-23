function testMarketSummaryQuery() {
  sciipCreateNaturalLanguageQuery(
    'MARKET_SUMMARY',
    'What is happening in the market?',
    {}
  );
}

function testRentIncreaseQuery() {
  sciipCreateNaturalLanguageQuery(
    'RENT_INCREASES',
    'Which buildings increased rent?',
    {}
  );
}

function testRecentSignalsQuery() {
  sciipCreateNaturalLanguageQuery(
    'RECENT_SIGNALS',
    'What are the latest signals?',
    {}
  );
}

function testCitySummaryQuery() {
  sciipCreateNaturalLanguageQuery(
    'CITY_SUMMARY',
    'What is happening in Los Angeles?',
    {
      city: 'Los Angeles'
    }
  );
}