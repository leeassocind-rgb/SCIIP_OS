/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Dates.gs
========================================================== */

function sciipNow() {
  return new Date();
}

function sciipTodayIso() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}

function sciipTimestampIso(dateValue) {
  const date = dateValue ? new Date(dateValue) : new Date();
  return date.toISOString();
}

function sciipDateKey(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function sciipSafeDate(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? null : date;
}