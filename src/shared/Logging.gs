/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Logging.gs
========================================================== */

function sciipLog(level, message, payload) {
  const entry = {
    timestamp: sciipNowIso(),
    level: sciipNormalizeToken(level || 'INFO'),
    message: sciipString(message),
    payload: payload || null
  };

  console.log(JSON.stringify(entry));
  return entry;
}

function sciipInfo(message, payload) {
  return sciipLog('INFO', message, payload);
}

function sciipWarn(message, payload) {
  return sciipLog('WARN', message, payload);
}

function sciipError(message, payload) {
  return sciipLog('ERROR', message, payload);
}