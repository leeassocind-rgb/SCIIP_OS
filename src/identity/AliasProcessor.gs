/* ==========================================================
   SCIIP_OS
   Module: Identity
   File: AliasProcessor.gs

   Purpose:
   Manages SCIIP asset aliases.

   Aliases allow multiple observed identities
   to resolve to a single canonical asset.

   Examples:

   5517 AYON AVE
   5517 AYON AVENUE
   5517 AYON

   → Same Asset

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_ALIAS_SHEET = 'PROPERTY_ALIAS';

/**
 * Returns alias sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function sciipGetAliasSheet() {
  return sciipGetOrCreateSheet(
    SCIIP_ALIAS_SHEET
  );
}

/**
 * Creates alias table if missing.
 */
function sciipInitializeAliasSheet() {
  const sheet = sciipGetAliasSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Alias_ID',
    'Asset_ID',
    'Alias_Type',
    'Alias_Value',
    'Canonical_Value',
    'Created_At',
    'Source'
  ]);
}

/**
 * Creates a new alias.
 *
 * @param {Object} alias
 * @returns {Object}
 */
function sciipCreateAlias(alias) {
  sciipInitializeAliasSheet();

  const aliasId =
    'ALIAS_' +
    sciipUuid()
      .replace(/-/g, '')
      .substring(0, 16)
      .toUpperCase();

  const row = [
    aliasId,
    alias.assetId,
    alias.aliasType,
    alias.aliasValue,
    alias.canonicalValue,
    sciipNowIso(),
    alias.source || 'SCIIP'
  ];

  sciipAppendRow(
    SCIIP_ALIAS_SHEET,
    row
  );

  return {
    aliasId: aliasId,
    assetId: alias.assetId,
    aliasType: alias.aliasType,
    aliasValue: alias.aliasValue,
    canonicalValue:
      alias.canonicalValue
  };
}

/**
 * Creates an address alias.
 *
 * @param {string} assetId
 * @param {string} observedAddress
 * @param {string} canonicalAddress
 * @returns {Object}
 */
function sciipCreateAddressAlias(
  assetId,
  observedAddress,
  canonicalAddress
) {
  return sciipCreateAlias({
    assetId: assetId,
    aliasType: 'ADDRESS',
    aliasValue: observedAddress,
    canonicalValue:
      canonicalAddress,
    source: 'MATCH_ENGINE'
  });
}

/**
 * Finds aliases for an asset.
 *
 * @param {string} assetId
 * @returns {Array}
 */
function sciipGetAliasesByAssetId(
  assetId
) {
  sciipInitializeAliasSheet();

  const rows =
    sciipGetSheetValues(
      SCIIP_ALIAS_SHEET
    );

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  const assetIndex =
    headers.indexOf('Asset_ID');

  return rows
    .slice(1)
    .filter(function(row) {
      return (
        row[assetIndex] === assetId
      );
    })
    .map(function(row) {
      const obj = {};

      headers.forEach(
        function(header, index) {
          obj[header] =
            row[index];
        }
      );

      return obj;
    });
}

/**
 * Returns alias statistics.
 *
 * @returns {Object}
 */
function sciipGetAliasStats() {
  const rows =
    sciipGetSheetValues(
      SCIIP_ALIAS_SHEET
    );

  return {
    aliasCount:
      rows.length > 0
        ? rows.length - 1
        : 0,
    generatedAt:
      sciipNowIso()
  };
}

/**
 * Processor entry point.
 *
 * Future:
 * - Auto-alias generation
 * - Fuzzy matching
 * - APN aliases
 * - Campus aliases
 *
 * @param {Object=} context
 * @returns {Object}
 */
function sciipRunAliasProcessor(
  context
) {
  sciipInitializeAliasSheet();

  return {
    status: 'SUCCESS',
    processor: 'AliasProcessor',
    generatedAt:
      sciipNowIso()
  };
}