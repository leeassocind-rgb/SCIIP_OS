/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Namespaces.gs

   Purpose:
   Defines namespace standards and platform-wide naming helpers.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Returns the canonical SCIIP namespace prefix.
 *
 * @returns {string}
 */
function sciipNamespacePrefix() {
  return 'sciip';
}

/**
 * Returns true when a function name follows SCIIP public namespace rules.
 *
 * @param {string} functionName
 * @returns {boolean}
 */
function sciipIsNamespacedFunction(functionName) {
  return typeof functionName === 'string' && /^sciip[A-Z]/.test(functionName);
}

/**
 * Builds a SCIIP-safe runtime name.
 *
 * @param {string} moduleName
 * @param {string} actionName
 * @returns {string}
 */
function sciipBuildRuntimeName(moduleName, actionName) {
  return [
    sciipNormalizeRuntimeToken(moduleName),
    sciipNormalizeRuntimeToken(actionName)
  ].filter(Boolean).join('.');
}

/**
 * Normalizes a token for runtime labels, logs, and diagnostics.
 *
 * @param {string} value
 * @returns {string}
 */
function sciipNormalizeRuntimeToken(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_]/g, '')
    .toUpperCase();
}

/**
 * Returns a standard SCIIP timestamp.
 *
 * @returns {string}
 */
function sciipNowIso() {
  return new Date().toISOString();
}