
import {
  createHash,
} from "node:crypto";

function cleanSpaces(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}


export function splitSourceLines(text) {
  /*
   * pdftotext emits form-feed characters between PDF pages.
   *
   * Canonicalize every supported line separator before
   * source-line / source-record provenance is assigned.
   *
   * This prevents page boundaries from changing record
   * identity depending on host-language split semantics.
   */
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u2029/g, "\n")
    .split("\n");
}


function nullableString(value) {
  const s = cleanSpaces(value);
  return s ? s : null;
}

function nullableNumber(value) {
  if (
    value === null
    || value === undefined
  ) {
    return null;
  }

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

export function deterministicId(
  prefix,
  payload
) {
  const hash = createHash("sha256")
    .update(
      JSON.stringify(
        payload,
        Object.keys(payload).sort()
      )
    )
    .digest("hex")
    .slice(0, 24)
    .toUpperCase();

  return `${prefix}-${hash}`;
}

export function parseCsvText(text) {
  const rows = [];

  let row = [];
  let field = "";
  let quoted = false;

  const source = String(text ?? "");

  for (
    let i = 0;
    i < source.length;
    i += 1
  ) {
    const ch = source[i];

    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }

      continue;
    }

    if (ch === '"') {
      quoted = true;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\n") {
      row.push(
        field.endsWith("\r")
          ? field.slice(0, -1)
          : field
      );

      rows.push(row);

      row = [];
      field = "";
      continue;
    }

    field += ch;
  }

  if (
    field.length
    || row.length
  ) {
    row.push(
      field.endsWith("\r")
        ? field.slice(0, -1)
        : field
    );

    rows.push(row);
  }

  return rows;
}

export function parseAirBaseCsv(
  text,
  {
    sourceFile = null,
    sourceSha256 = null,
  } = {}
) {
  const rows = parseCsvText(text);

  if (!rows.length) return [];

  const header = rows[0];

  const index = new Map(
    header.map(
      (name, i) => [
        cleanSpaces(name),
        i,
      ]
    )
  );

  const value = (
    row,
    name
  ) => {
    const i = index.get(name);

    return i === undefined
      ? null
      : row[i];
  };

  const result = [];

  for (
    let i = 1;
    i < rows.length;
    i += 1
  ) {
    const row = rows[i];

    if (
      row.length === 1
      && !cleanSpaces(row[0])
    ) {
      continue;
    }

    const sourceRow = i + 1;

    const address = nullableString(
      value(row, "Address")
    );

    const postalCode = nullableString(
      value(row, "Postal Code")
    );

    const buildingSf = nullableNumber(
      value(
        row,
        "Building Size / SF"
      )
    );

    const totalAvailableSpace =
      nullableNumber(
        value(
          row,
          "Total Available Space"
        )
      );

    const identity = {
      sourceFile,
      sourceRow,
      address,
      postalCode,
      buildingSf,
    };

    const observationId =
      deterministicId(
        "AIR-OBS",
        identity
      );

    result.push({
      observationId,
      airRowId: observationId,

      sourceFile,
      sourceSha256,
      sourceRow,

      address,
      zip: postalCode,

      submarket:
        nullableString(
          value(row, "Submarket")
        ),

      type:
        nullableString(
          value(row, "Type")
        ),

      subType:
        nullableString(
          value(row, "Sub Type")
        ),

      buildingStatus:
        nullableString(
          value(
            row,
            "Building Status"
          )
        ),

      buildingSf,

      totalAvailableSpace,

      totalAvailableSpaceUnit:
        nullableString(
          value(
            row,
            "Total Available Space (Unit)"
          )
        ),

      landAcres:
        nullableNumber(
          value(
            row,
            "Land Size / Acres"
          )
        ),

      clearHeightMinFt:
        nullableNumber(
          value(
            row,
            "Clear Height Min / FT"
          )
        ),

      clearHeightMaxFt:
        nullableNumber(
          value(
            row,
            "Clear Height Max / FT"
          )
        ),

      dockHighDoors:
        nullableNumber(
          value(
            row,
            "Dock High Doors"
          )
        ),

      gradeLevelDoors:
        nullableNumber(
          value(
            row,
            "Grade Level Doors"
          )
        ),

      yearBuilt:
        nullableNumber(
          value(
            row,
            "Year Built"
          )
        ),

      buildingClass:
        nullableString(
          value(
            row,
            "Building Class"
          )
        ),

      trueOwnerCompany:
        nullableString(
          value(
            row,
            "True Owner Company"
          )
        ),

      zoning:
        nullableString(
          value(
            row,
            "Zoning"
          )
        ),

      amps:
        nullableNumber(
          value(
            row,
            "AMPs"
          )
        ),

      legalOwnerCompany:
        nullableString(
          value(
            row,
            "Legal Owner Company"
          )
        ),

      totalParking:
        nullableNumber(
          value(
            row,
            "Total Parking"
          )
        ),

      raw: Object.fromEntries(
        header.map(
          (name, col) => [
            name,
            row[col] ?? null,
          ]
        )
      ),
    });
  }

  return result;
}

const CITY_RE =
  /([A-Za-z .'\-/]+),\s*CA\s+(\d{5})/i;

const ADDRESS_RE =
  /\b(\d{1,6}(?:\s*-\s*\d{1,6})?\s+(?:[NSEW]\s+)?[A-Za-z0-9.'’&/\-\s]+?\b(?:ST|STREET|AVE|AVENUE|BLVD|BOULEVARD|RD|ROAD|DR|DRIVE|WAY|PKWY|PARKWAY|HWY|HIGHWAY|CIR|CIRCLE|CT|COURT|LN|LANE|PL|PLACE)\b(?:\s*,?\s*(?:UNIT|SUITE|STE|BLDG|BUILDING)\s*[A-Za-z0-9&/\-]+)?)/i;

const LISTING_RE =
  /Listing\s*#:\s*(\d+)/ig;

const VACANT_RE =
  /Is\s+Vacant:\s*(Yes|No|N\/A)/i;

const SF_RE =
  /\b(\d{1,3}(?:,\d{3})+|\d{4,7})\s*SF\b/ig;

export const EVENT_LABELS = Object.freeze({
  "NEW LISTING":
    "LISTING_CREATED",

  "FOR LEASE & SALE":
    "LISTING_OFFERED_FOR_LEASE_AND_SALE",

  "FOR SUBLEASE":
    "LISTING_OFFERED_FOR_SUBLEASE",

  "FOR LEASE":
    "LISTING_OFFERED_FOR_LEASE",

  "FOR SALE":
    "LISTING_OFFERED_FOR_SALE",

  "RATE & PRICE REDUCED":
    "RATE_AND_PRICE_CHANGED",

  "RATE REDUCED":
    "RATE_CHANGED",

  "NEW RATE":
    "RATE_CHANGED",

  "PRICE REDUCED":
    "PRICE_CHANGED",

  "NEW PRICE":
    "PRICE_CHANGED",

  "UPDATED PROPERTY INFORMATION":
    "LISTING_INFORMATION_UPDATED",

  "UPDATED INFORMATION":
    "LISTING_INFORMATION_UPDATED",

  "NEW SIZE":
    "LISTING_SIZE_CHANGED",

  "BACK ON MARKET":
    "BACK_ON_MARKET",

  "LEASED":
    "LISTING_LEASED",

  "SOLD":
    "LISTING_SOLD",

  "IN ESCROW":
    "LISTING_IN_ESCROW",
});

function sfValues(line) {
  const values = [];

  for (
    const match
    of String(line ?? "")
      .matchAll(SF_RE)
  ) {
    const n = nullableNumber(
      match[1]
    );

    if (n !== null) {
      values.push(n);
    }
  }

  return values;
}

export function extractAirRecordContext(
  lines,
  anchorIndex
) {
  const low = Math.max(
    0,
    anchorIndex - 22
  );

  let cityIndex = null;
  let city = null;
  let zip = null;

  for (
    let i = anchorIndex;
    i >= low;
    i -= 1
  ) {
    const match =
      String(lines[i] ?? "")
        .match(CITY_RE);

    if (match) {
      cityIndex = i;
      city = cleanSpaces(match[1]);
      zip = match[2];
      break;
    }
  }

  let addressIndex = null;
  let address = null;

  if (cityIndex !== null) {
    for (
      let i = cityIndex;
      i >= Math.max(
        low,
        cityIndex - 7
      );
      i -= 1
    ) {
      const match =
        String(lines[i] ?? "")
          .match(ADDRESS_RE);

      if (match) {
        addressIndex = i;
        address = cleanSpaces(
          match[1]
        );
        break;
      }
    }
  }

  if (!address) {
    for (
      let i = anchorIndex;
      i >= low;
      i -= 1
    ) {
      const match =
        String(lines[i] ?? "")
          .match(ADDRESS_RE);

      if (match) {
        addressIndex = i;
        address = cleanSpaces(
          match[1]
        );
        break;
      }
    }
  }

  let availableSf = null;

  if (addressIndex !== null) {
    const checks = [
      addressIndex - 2,
      addressIndex - 1,
      addressIndex,
      addressIndex + 1,
    ];

    for (const i of checks) {
      if (
        i < 0
        || i >= lines.length
      ) {
        continue;
      }

      const values = sfValues(
        lines[i]
      );

      if (values.length) {
        availableSf = values[0];
        break;
      }
    }
  }

  /*
   * AIR SuperSheet semantic rule:
   *
   * city line commonly contains:
   *
   *   Office SF   Bldg SF
   *
   * therefore:
   *   first SF = office
   *   last SF  = building
   *
   * Current-availability PDFs commonly carry only
   * Building SF on that line, so first == last there.
   *
   * Missing remains null.
   */
  let officeSf = null;
  let buildingSf = null;

  if (cityIndex !== null) {
    const citySf = sfValues(
      lines[cityIndex]
    );

    if (citySf.length === 1) {
      buildingSf = citySf[0];
    } else if (citySf.length >= 2) {
      officeSf = citySf[0];
      buildingSf =
        citySf[
          citySf.length - 1
        ];
    }
  }

  const contextStart = Math.max(
    0,
    (
      addressIndex !== null
        ? addressIndex
        : anchorIndex
    ) - 3
  );

  const contextEnd = Math.min(
    lines.length,
    anchorIndex + 5
  );

  const context = lines
    .slice(
      contextStart,
      contextEnd
    )
    .join("\n");

  let vacant = null;

  const vacantMatch =
    context.match(
      VACANT_RE
    );

  if (vacantMatch) {
    const raw =
      vacantMatch[1]
        .toUpperCase();

    if (raw === "YES") {
      vacant = true;
    } else if (raw === "NO") {
      vacant = false;
    }
  }

  /*
   * Cardinality identity belongs to the source record,
   * not to mutable/derived business fields.
   *
   * AIR event labels underneath the same listing record
   * resolve back to the same address line. This anchor
   * therefore preserves paired observations such as:
   *
   *   New Listing
   *   For Lease
   *
   * as two immutable observations attached to one
   * logical source record.
   */
  const sourceRecordAnchor =
    addressIndex
    ?? cityIndex
    ?? anchorIndex;

  return {
    address,
    city,
    zip,

    availableSf,

    officeSf,
    buildingSf,

    vacant,

    sourceRecordAnchor,
    addressLineIndex:
      addressIndex,
    cityLineIndex:
      cityIndex,

    context,
  };
}

export function parseCurrentAvailabilityText(
  text,
  {
    sourceFile = null,
    sourceSha256 = null,
  } = {}
) {
  const lines =
    splitSourceLines(text);

  const records = [];

  for (
    let i = 0;
    i < lines.length;
    i += 1
  ) {
    const line = lines[i];

    LISTING_RE.lastIndex = 0;

    let match;

    while (
      (
        match =
          LISTING_RE.exec(line)
      ) !== null
    ) {
      const listingNumber =
        match[1];

      const context =
        extractAirRecordContext(
          lines,
          i
        );

      const observationId =
        deterministicId(
          "CURRENT-OBS",
          {
            sourceFile,
            sourceSha256,
            sourceLine: i,
            listingNumber,
          }
        );

      records.push({
        observationId,

        sourceFile,
        sourceSha256,
        sourceLine: i,

        listingNumber,

        listingId:
          `AIR-LISTING-${listingNumber}`,

        ...context,
      });
    }
  }

  return records;
}


/*
 * AIR SuperSheet structural record boundary.
 *
 * A record begins at a numbered row carrying the record's
 * Available SF. Event labels below that row belong to that
 * numbered source record until the next numbered row.
 *
 * The source-line index is used rather than the printed row
 * number because row numbers can restart by market/page.
 */
const SUPER_RECORD_START_RE =
  /^\s*\d{1,4}\s+(?=.*\b(?:\d{1,3}(?:,\d{3})+|\d{4,7})\s*SF\b)/i;

function findSupersheetRecordAnchor(
  lines,
  eventLineIndex
) {
  /*
   * AIR event annotations follow their source record closely.
   * Keep the search bounded so a malformed observation cannot
   * accidentally attach to a distant prior record.
   */
  const low = Math.max(
    0,
    eventLineIndex - 80
  );

  for (
    let i = eventLineIndex;
    i >= low;
    i -= 1
  ) {
    if (
      SUPER_RECORD_START_RE.test(
        String(lines[i] ?? "")
      )
    ) {
      return i;
    }
  }

  return null;
}

function supersheetRecordOrdinal(
  lines,
  anchor
) {
  if (!Number.isInteger(anchor)) {
    return null;
  }

  let ordinal = 0;

  for (
    let i = 0;
    i <= anchor;
    i += 1
  ) {
    if (
      SUPER_RECORD_START_RE.test(
        String(lines[i] ?? "")
      )
    ) {
      ordinal += 1;
    }
  }

  return ordinal || null;
}

export function parseSupersheetText(
  text,
  {
    sourceFile = null,
    sourceSha256 = null,
    effectiveDate = null,
  } = {}
) {
  const lines =
    splitSourceLines(text);

  const labels = Object.entries(
    EVENT_LABELS
  ).sort(
    (a, b) =>
      b[0].length
      - a[0].length
  );

  const observations = [];

  for (
    let i = 0;
    i < lines.length;
    i += 1
  ) {
    const normalized =
      cleanSpaces(
        lines[i]
      ).toUpperCase();

    if (!normalized) continue;

    let sourceLabel = null;
    let eventType = null;

    for (
      const [
        label,
        classified
      ]
      of labels
    ) {
      if (
        normalized === label
        || normalized.startsWith(
          label + " "
        )
      ) {
        sourceLabel = label;
        eventType = classified;
        break;
      }
    }

    if (!eventType) continue;

    const context =
      extractAirRecordContext(
        lines,
        i
      );

    const structuralRecordAnchor =
      findSupersheetRecordAnchor(
        lines,
        i
      );

    const sourceRecordOrdinal =
      supersheetRecordOrdinal(
        lines,
        structuralRecordAnchor
      );

    const observationId =
      deterministicId(
        "SUPER-OBS",
        {
          sourceFile,
          sourceSha256,
          sourceLine: i,
          effectiveDate,
          eventType,
          address:
            context.address,
          availableSf:
            context.availableSf,
        }
      );

    observations.push({
      observationId,

      sourceFile,
      sourceSha256,
      sourceLine: i,

      effectiveDate,

      sourceLabel,
      eventType,

      ...context,

      /*
       * Structural source-record identity takes precedence
       * over contextual address/city line anchors.
       */
      sourceRecordAnchor:
        structuralRecordAnchor
        ?? context.sourceRecordAnchor
        ?? null,

      sourceRecordOrdinal:
        sourceRecordOrdinal
        ?? null,
    });
  }

  return observations;
}
