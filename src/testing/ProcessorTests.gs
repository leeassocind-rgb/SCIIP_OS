function test_190_AutonomousResearchAgentProcessor() {
  return sciipTestAutonomousResearchAgentProcessor();
}

function sciipDebugLatestProcessingDate750() {
  const latestDate = sciipResolveLatestProcessingDate_(
    'COMMAND_CENTER_UPDATES',
    'Update_Date'
  );

  Logger.log(JSON.stringify({
    latestDate,
    fallbackToday: sciipFormatDateKey_(new Date())
  }));
}