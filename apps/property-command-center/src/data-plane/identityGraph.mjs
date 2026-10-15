
const BASE_MIN_BUILDING_SF = 50000;

const SUFFIXES = Object.freeze({
  STREET: "ST",
  AVENUE: "AVE",
  BOULEVARD: "BLVD",
  ROAD: "RD",
  DRIVE: "DR",
  PARKWAY: "PKWY",
  HIGHWAY: "HWY",
  CIRCLE: "CIR",
  COURT: "CT",
  LANE: "LN",
  PLACE: "PL",
});

function cleanSpaces(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export function toNullableNumber(value) {
  if (value === null || value === undefined) return null;

  const s = String(value)
    .replace(/[$,%]/g, "")
    .replace(/,/g, "")
    .trim();

  if (!s) return null;

  const n = Number(s);

  return Number.isFinite(n)
    ? n
    : null;
}

export function normalizeZip(value) {
  const m = String(value ?? "")
    .match(/\b(\d{5})\b/);

  return m
    ? m[1]
    : null;
}

function normalizeSuffixTokens(value) {
  return cleanSpaces(value)
    .split(" ")
    .map((token) => SUFFIXES[token] ?? token)
    .join(" ");
}

function stripCityState(raw) {
  const s = cleanSpaces(raw)
    .toUpperCase()
    .replace(/\./g, "");

  if (!s) return "";

  const parts = s
    .split(",")
    .map((x) => cleanSpaces(x));

  return parts[0] ?? "";
}

function stripAssetUnit(value) {
  return cleanSpaces(value)
    .replace(
      /\s+(?:UNIT|SUITE|STE|BLDG|BUILDING)\s*[A-Z0-9&/\-]+\s*$/i,
      ""
    )
    .trim();
}

export function canonicalStreet(raw) {
  const street = stripAssetUnit(
    stripCityState(raw)
  );

  if (!street) return null;

  return normalizeSuffixTokens(
    street
  ) || null;
}

export function canonicalListingAddress(raw) {
  const s = cleanSpaces(raw)
    .toUpperCase()
    .replace(/\./g, "");

  if (!s) return null;

  const parts = s
    .split(",")
    .map((x) => cleanSpaces(x));

  let address = parts[0] ?? "";

  if (
    parts[1]
    && /^(?:UNIT|SUITE|STE|BLDG|BUILDING)\b/i
      .test(parts[1])
  ) {
    address += " " + parts[1];
  }

  address = normalizeSuffixTokens(
    address
  );

  return address || null;
}

export function parseStreetAddress(raw) {
  const streetFull = canonicalStreet(raw);

  if (!streetFull) return null;

  const match = streetFull.match(
    /^(\d+)\s*(?:-\s*(\d+))?\s+(.+)$/
  );

  if (!match) {
    return {
      streetFull,
      lowNumber: null,
      highNumber: null,
      streetName: streetFull,
    };
  }

  let low = Number(match[1]);
  let high = match[2]
    ? Number(match[2])
    : low;

  if (high < low) {
    [low, high] = [high, low];
  }

  return {
    streetFull,
    lowNumber: low,
    highNumber: high,
    streetName: cleanSpaces(match[3]),
  };
}

export function rangesOverlap(a, b) {
  if (
    !a
    || !b
    || a.lowNumber === null
    || b.lowNumber === null
  ) {
    return false;
  }

  return !(
    a.highNumber < b.lowNumber
    || a.lowNumber > b.highNumber
  );
}

function rowIdentity(row) {
  return (
    row.assetId
    ?? row.airRowId
    ?? row.observationId
    ?? null
  );
}

function mapPush(map, key, value) {
  if (!key) return;

  if (!map.has(key)) {
    map.set(key, []);
  }

  map.get(key).push(value);
}

export function buildAirAssetIndex(rows) {
  const enriched = [];
  const byExactStreetZip = new Map();
  const byStreetNameZip = new Map();

  for (const row of rows ?? []) {
    const parsedStreet = parseStreetAddress(
      row.address
    );

    const zip = normalizeZip(
      row.zip
      ?? row.postalCode
    );

    const buildingSf = toNullableNumber(
      row.buildingSf
    );

    const item = {
      row,
      parsedStreet,
      zip,
      buildingSf,
    };

    enriched.push(item);

    if (parsedStreet && zip) {
      mapPush(
        byExactStreetZip,
        `${parsedStreet.streetFull}|${zip}`,
        item
      );

      mapPush(
        byStreetNameZip,
        `${parsedStreet.streetName}|${zip}`,
        item
      );
    }
  }

  return {
    rows: enriched,
    byExactStreetZip,
    byStreetNameZip,
  };
}

function deterministicCandidateResult(
  candidates,
  buildingSf,
  tier
) {
  let working = [...candidates];

  if (
    working.length > 1
    && buildingSf !== null
  ) {
    const sfMatches = working.filter(
      (x) => x.buildingSf === buildingSf
    );

    if (sfMatches.length === 1) {
      working = sfMatches;
      tier += "_PLUS_BUILDING_SF";
    } else if (sfMatches.length > 1) {
      working = sfMatches;
    }
  }

  if (working.length === 1) {
    const selected = working[0];

    return {
      status: "RESOLVED",
      tier,
      assetId: rowIdentity(selected.row),
      row: selected.row,
      candidateCount: 1,
    };
  }

  return {
    status: "AMBIGUOUS",
    tier,
    assetId: null,
    row: null,
    candidateCount: working.length,
    candidateIds: working
      .map((x) => rowIdentity(x.row))
      .filter(Boolean)
      .sort(),
  };
}

export function resolveAirAsset(
  observation,
  indexOrRows,
  {
    baseMinBuildingSf = BASE_MIN_BUILDING_SF,
  } = {}
) {
  const index = Array.isArray(indexOrRows)
    ? buildAirAssetIndex(indexOrRows)
    : indexOrRows;

  const buildingSf = toNullableNumber(
    observation?.buildingSf
  );

  if (
    buildingSf !== null
    && buildingSf < baseMinBuildingSf
  ) {
    return {
      status: "OUTSIDE_BASE_UNIVERSE",
      tier: "BUILDING_SF_BELOW_BASE_THRESHOLD",
      assetId: null,
      row: null,
      buildingSf,
      baseMinBuildingSf,
    };
  }

  const parsed = parseStreetAddress(
    observation?.address
  );

  const zip = normalizeZip(
    observation?.zip
    ?? observation?.postalCode
  );

  if (!parsed) {
    return {
      status: "UNRESOLVED_NO_ADDRESS",
      tier: null,
      assetId: null,
      row: null,
    };
  }

  if (!zip) {
    return {
      status: "UNRESOLVED_NO_ZIP",
      tier: null,
      assetId: null,
      row: null,
    };
  }

  const exact = (
    index.byExactStreetZip.get(
      `${parsed.streetFull}|${zip}`
    )
    ?? []
  );

  if (exact.length) {
    return deterministicCandidateResult(
      exact,
      buildingSf,
      "EXACT_STREET_PLUS_ZIP"
    );
  }

  const sameStreetName = (
    index.byStreetNameZip.get(
      `${parsed.streetName}|${zip}`
    )
    ?? []
  );

  const rangeMatches = sameStreetName.filter(
    (candidate) =>
      rangesOverlap(
        parsed,
        candidate.parsedStreet
      )
  );

  if (rangeMatches.length) {
    return deterministicCandidateResult(
      rangeMatches,
      buildingSf,
      "STREET_RANGE_OVERLAP_PLUS_ZIP"
    );
  }

  return {
    status:
      buildingSf === null
        ? "UNRESOLVED_INSUFFICIENT_IDENTITY_EVIDENCE"
        : "NO_AIR_ASSET_MATCH",

    tier: null,
    assetId: null,
    row: null,
    candidateCount: 0,
  };
}

export function buildListingIndex(rows) {
  const byListingNumber = new Map();
  const byAddressSf = new Map();
  const byAddress = new Map();
  const byBaseSf = new Map();

  for (const row of rows ?? []) {
    const listingNumber = (
      row.listingNumber
      ?? String(row.listingId ?? "")
        .replace(/^AIR-LISTING-/, "")
        .trim()
    );

    const fullAddress = canonicalListingAddress(
      row.address
    );

    const base = canonicalStreet(
      row.address
    );

    const sf = toNullableNumber(
      row.availableSf
      ?? row.marketedSf
    );

    if (listingNumber) {
      mapPush(
        byListingNumber,
        listingNumber,
        row
      );
    }

    if (fullAddress) {
      mapPush(
        byAddress,
        fullAddress,
        row
      );

      mapPush(
        byAddressSf,
        `${fullAddress}|${sf ?? ""}`,
        row
      );
    }

    if (base) {
      mapPush(
        byBaseSf,
        `${base}|${sf ?? ""}`,
        row
      );
    }
  }

  return {
    byListingNumber,
    byAddressSf,
    byAddress,
    byBaseSf,
  };
}

function resolveUniqueListing(
  rows,
  tier
) {
  const unique = new Map();

  for (const row of rows ?? []) {
    const id = (
      row.listingId
      ?? row.listingNumber
      ?? null
    );

    if (id !== null) {
      unique.set(
        String(id),
        row
      );
    }
  }

  if (unique.size === 1) {
    const [listingId, row] =
      [...unique.entries()][0];

    return {
      status: "RESOLVED",
      tier,
      listingId,
      row,
      candidateCount: 1,
    };
  }

  if (unique.size > 1) {
    return {
      status: "AMBIGUOUS",
      tier,
      listingId: null,
      row: null,
      candidateCount: unique.size,
      candidateIds: [
        ...unique.keys()
      ].sort(),
    };
  }

  return null;
}

export function resolveListingIdentity(
  observation,
  indexOrRows
) {
  const index = Array.isArray(indexOrRows)
    ? buildListingIndex(indexOrRows)
    : indexOrRows;

  const listingNumber = String(
    observation?.listingNumber
    ?? ""
  ).trim();

  if (listingNumber) {
    const exactNumber = resolveUniqueListing(
      index.byListingNumber.get(
        listingNumber
      ),
      "EXACT_LISTING_NUMBER"
    );

    if (exactNumber) {
      return exactNumber;
    }
  }

  const fullAddress = canonicalListingAddress(
    observation?.address
  );

  const base = canonicalStreet(
    observation?.address
  );

  const sf = toNullableNumber(
    observation?.availableSf
    ?? observation?.marketedSf
  );

  if (fullAddress && sf !== null) {
    const exactAddressSf = resolveUniqueListing(
      index.byAddressSf.get(
        `${fullAddress}|${sf}`
      ),
      "EXACT_LISTING_ADDRESS_PLUS_MARKETED_SF"
    );

    if (exactAddressSf) {
      return exactAddressSf;
    }
  }

  if (fullAddress) {
    const exactAddress = resolveUniqueListing(
      index.byAddress.get(
        fullAddress
      ),
      "EXACT_LISTING_ADDRESS"
    );

    if (exactAddress) {
      return exactAddress;
    }
  }

  if (base && sf !== null) {
    const baseSf = resolveUniqueListing(
      index.byBaseSf.get(
        `${base}|${sf}`
      ),
      "BASE_ASSET_ADDRESS_PLUS_MARKETED_SF"
    );

    if (baseSf) {
      return baseSf;
    }
  }

  return {
    status: "NO_BASELINE_LISTING_MATCH",
    tier: null,
    listingId: null,
    row: null,
    candidateCount: 0,
  };
}

export function classifyListingScope(
  observation,
  resolution,
  {
    baselineMinAvailableSf = 50000,
    newOrReturningEventTypes = [],
  } = {}
) {
  if (resolution?.status === "RESOLVED") {
    return "RESOLVED_TO_BASELINE_LISTING";
  }

  const sf = toNullableNumber(
    observation?.availableSf
    ?? observation?.marketedSf
  );

  if (
    sf !== null
    && sf < baselineMinAvailableSf
  ) {
    return "OUTSIDE_CURRENT_LISTING_BASELINE_SCOPE";
  }

  const eventTypes = new Set(
    observation?.eventTypes
    ?? []
  );

  if (
    newOrReturningEventTypes.some(
      (x) => eventTypes.has(x)
    )
  ) {
    return "EXPECTED_NEW_OR_RETURNING_LISTING";
  }

  if (resolution?.status === "AMBIGUOUS") {
    return "AMBIGUOUS_LISTING_IDENTITY";
  }

  return "UNRESOLVED_LISTING_IDENTITY";
}

export {
  BASE_MIN_BUILDING_SF,
};
