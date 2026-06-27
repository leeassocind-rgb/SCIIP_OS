/************************************************************
 * SCIIP_OS v5.0
 * Sheet Name Alias Registry
 ************************************************************/

function sciipResolveSheetName_(sheetNameOrAlias) {
  const aliases = {
    ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW',

    ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER'
  };

  return aliases[sheetNameOrAlias] || sheetNameOrAlias;
}

function sciipEnsureSheetWithHeadersByAlias_(ss, sheetNameOrAlias, headers) {
  return sciipEnsureSheetWithHeaders_(
    ss,
    sciipResolveSheetName_(sheetNameOrAlias),
    headers
  );
}