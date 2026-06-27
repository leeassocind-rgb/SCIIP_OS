function sciipResolveSheetAlias_(sheetName) {
  const aliases = {
    ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW',

    ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER'
  };

  return aliases[sheetName] || sheetName;
}

function sciipEnsureSheetWithHeadersAlias_(ss, sheetName, headers) {
  return sciipEnsureSheetWithHeaders_(
    ss,
    sciipResolveSheetAlias_(sheetName),
    headers
  );
}

function sciipRunConfiguredContinuityProcessor_(config) {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();
  const now = new Date();

  const sourceSheet = sciipEnsureSheetWithHeadersAlias_(
    ss,
    config.sourceSheetName,
    config.sourceHeaders
  );

  const outputSheet = sciipEnsureSheetWithHeadersAlias_(
    ss,
    config.outputSheetName,
    config.outputHeaders
  );

  const businessKey = config.businessKeyPrefix + '|' + dateKey;

  if (sciipSheetBusinessKeyExists_(outputSheet, businessKey)) {
    const duplicateResult = {
      processor: config.processor,
      status: 'SUCCESS',
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: now.toISOString()
    };

    duplicateResult[config.createdCountField] = 0;

    Logger.log(JSON.stringify(duplicateResult));
    return duplicateResult;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const skippedResult = {
      processor: config.processor,
      status: 'SKIPPED_NO_INPUTS',
      skippedDuplicate: 0,
      businessKey: businessKey,
      completedAt: now.toISOString()
    };

    skippedResult[config.createdCountField] = 0;

    Logger.log(JSON.stringify(skippedResult));
    return skippedResult;
  }

  outputSheet.appendRow(
    config.buildRow({
      businessKey: businessKey,
      dateKey: dateKey,
      processor: config.processor,
      sourceRecord: sourceRecord,
      now: now
    })
  );

  const result = {
    processor: config.processor,
    status: 'SUCCESS',
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: now.toISOString()
  };

  result[config.createdCountField] = 1;

  Logger.log(JSON.stringify(result));
  return result;
}