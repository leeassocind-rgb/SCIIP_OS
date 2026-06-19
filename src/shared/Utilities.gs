/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Utilities.gs
========================================================== */

function sciipUuid() {
  return Utilities.getUuid();
}

function sciipHash(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    sciipString(value)
  );

  return bytes.map(function(byte) {
    const v = (byte < 0 ? byte + 256 : byte).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function sciipObjectClone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

function sciipSafeJson(value) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function sciipRequire(value, message) {
  if (sciipIsBlank(value)) {
    throw new Error(message || 'Required value is missing.');
  }
  return value;
}