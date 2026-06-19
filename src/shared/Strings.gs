/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Strings.gs
========================================================== */

function sciipString(value) {
  return value === null || value === undefined ? '' : String(value);
}

function sciipTrim(value) {
  return sciipString(value).trim();
}

function sciipUpper(value) {
  return sciipTrim(value).toUpperCase();
}

function sciipLower(value) {
  return sciipTrim(value).toLowerCase();
}

function sciipNormalizeWhitespace(value) {
  return sciipTrim(value).replace(/\s+/g, ' ');
}

function sciipNormalizeToken(value) {
  return sciipUpper(value)
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function sciipIsBlank(value) {
  return sciipTrim(value) === '';
}

function sciipCoalesce() {
  for (let i = 0; i < arguments.length; i++) {
    if (!sciipIsBlank(arguments[i])) return arguments[i];
  }
  return '';
}