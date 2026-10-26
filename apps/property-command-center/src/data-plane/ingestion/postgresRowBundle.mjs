import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import {
  buildAirIdentityIndex,
  buildListingIdentityIndex,
  resolveAirAssetIdentity,
  resolveListingIdentity,
  reduceListingState as r150ReduceListingState,
} from "./ingestionPipeline.mjs";

export const DATABASE_WRITES_ENABLED = false;

const HERE =
  path.dirname(
    fileURLToPath(
      import.meta.url
    )
  );

const CONTRACT_PATH =
  path.join(
    HERE,
    "schemaContract.json"
  );

export function canonicalJson(value) {
  if (
    value === null
    || typeof value
      !== "object"
  ) {
    return JSON.stringify(
      value
    );
  }

  if (
    Array.isArray(
      value
    )
  ) {
    return (
      "["
      + value
        .map(
          canonicalJson
        )
        .join(",")
      + "]"
    );
  }

  const keys =
    Object.keys(
      value
    ).sort();

  return (
    "{"
    + keys
      .map(
        key =>
          JSON.stringify(
            key
          )
          + ":"
          + canonicalJson(
              value[
                key
              ]
            )
      )
      .join(",")
    + "}"
  );
}

export function sha256Hex(value) {
  return crypto
    .createHash("sha256")
    .update(
      Buffer.isBuffer(
        value
      )
        ? value
        : String(
            value
          )
    )
    .digest("hex");
}

export function deterministicId(
  prefix,
  ...parts
) {
  return (
    prefix
    + ":"
    + sha256Hex(
        canonicalJson(
          parts
        )
      ).slice(
        0,
        32
      )
  );
}

export function normalizeKey(value) {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      ""
    );
}

export function normalizeText(value) {
  if (
    value === null
    || value === undefined
  ) {
    return null;
  }

  const text =
    String(
      value
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  return (
    text === ""
      ? null
      : text
  );
}

export function numberOrNull(value) {
  if (
    value === null
    || value === undefined
    || value === ""
  ) {
    return null;
  }

  if (
    typeof value
    === "number"
  ) {
    return (
      Number.isFinite(
        value
      )
        ? value
        : null
    );
  }

  const cleaned =
    String(
      value
    )
      .replace(
        /[$,%]/g,
        ""
      )
      .replace(
        /,/g,
        ""
      )
      .trim();

  const match =
    cleaned.match(
      /-?\d+(?:\.\d+)?/
    );

  if (!match) {
    return null;
  }

  const number =
    Number(
      match[0]
    );

  return (
    Number.isFinite(
      number
    )
      ? number
      : null
  );
}

export function booleanOrNull(value) {
  if (
    value === null
    || value === undefined
    || value === ""
  ) {
    return null;
  }

  if (
    typeof value
    === "boolean"
  ) {
    return value;
  }

  const text =
    String(
      value
    )
      .trim()
      .toLowerCase();

  if (
    [
      "true",
      "yes",
      "y",
      "1",
    ].includes(
      text
    )
  ) {
    return true;
  }

  if (
    [
      "false",
      "no",
      "n",
      "0",
    ].includes(
      text
    )
  ) {
    return false;
  }

  return null;
}

export function dateOrNull(value) {
  if (
    value === null
    || value === undefined
    || value === ""
  ) {
    return null;
  }

  if (
    typeof value
    === "number"
    && Number.isFinite(
      value
    )
    && value > 10000
    && value < 100000
  ) {
    const epoch =
      Date.UTC(
        1899,
        11,
        30
      );

    const millis =
      epoch
      + value
        * 86400000;

    return new Date(
      millis
    )
      .toISOString()
      .slice(
        0,
        10
      );
  }

  const text =
    normalizeText(
      value
    );

  if (!text) {
    return null;
  }

  const iso =
    text.match(
      /\b(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})\b/
    );

  if (iso) {
    const year =
      iso[1];

    const month =
      String(
        iso[2]
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        iso[3]
      ).padStart(
        2,
        "0"
      );

    return (
      `${year}-${month}-${day}`
    );
  }

  const us =
    text.match(
      /\b(\d{1,2})[-\/](\d{1,2})[-\/](20\d{2})\b/
    );

  if (us) {
    return (
      String(
        us[3]
      )
      + "-"
      + String(
          us[1]
        ).padStart(
          2,
          "0"
        )
      + "-"
      + String(
          us[2]
        ).padStart(
          2,
          "0"
        )
    );
  }

  const parsed =
    Date.parse(
      text
    );

  if (
    Number.isFinite(
      parsed
    )
  ) {
    return new Date(
      parsed
    )
      .toISOString()
      .slice(
        0,
        10
      );
  }

  return null;
}

function flattenObject(
  value,
  prefix = "",
  output = {},
  depth = 0
) {
  if (
    value === null
    || value === undefined
  ) {
    return output;
  }

  if (
    depth > 4
  ) {
    return output;
  }

  if (
    Array.isArray(
      value
    )
  ) {
    return output;
  }

  if (
    typeof value
    !== "object"
  ) {
    if (prefix) {
      output[
        normalizeKey(
          prefix
        )
      ] = value;
    }

    return output;
  }

  for (
    const [
      key,
      child,
    ]
    of Object.entries(
      value
    )
  ) {
    const joined =
      prefix
        ? (
            prefix
            + "_"
            + key
          )
        : key;

    if (
      child !== null
      && typeof child
        === "object"
      && !Array.isArray(
        child
      )
    ) {
      flattenObject(
        child,
        joined,
        output,
        depth + 1
      );
    } else {
      output[
        normalizeKey(
          key
        )
      ] = child;

      output[
        normalizeKey(
          joined
        )
      ] = child;
    }
  }

  return output;
}

export function pickValue(
  record,
  aliases
) {
  const flat =
    flattenObject(
      record
    );

  for (
    const alias
    of aliases
  ) {
    const key =
      normalizeKey(
        alias
      );

    if (
      Object.prototype
        .hasOwnProperty
        .call(
          flat,
          key
        )
    ) {
      const value =
        flat[
          key
        ];

      if (
        value !== null
        && value !== undefined
        && (
          typeof value
          !== "string"
          || value.trim()
          !== ""
        )
      ) {
        return value;
      }
    }
  }

  return null;
}

export function loadSchemaContract() {
  return JSON.parse(
    fs.readFileSync(
      CONTRACT_PATH,
      "utf8"
    )
  );
}

function contractColumns(
  contract,
  table
) {
  return (
    contract
      .tables[
        table
      ]
      .columns
      .map(
        column =>
          column.name
      )
  );
}

function inferredRequiredColumns(
  contract,
  table
) {
  const tableContract =
    contract
      .tables[
        table
      ];

  const explicit =
    tableContract
      .requiredColumns;

  if (
    Array.isArray(
      explicit
    )
  ) {
    return [
      ...explicit,
    ];
  }

  return tableContract
    .columns
    .filter(column => {
      const nullable =
        column.nullable
        ?? column.isNullable
        ?? column.is_nullable;

      const notNull =
        column.notNull
        ?? column.not_null
        ?? false;

      const hasDefault =
        column.default !== null
        && column.default !== undefined
        && column.default !== "";

      return (
        notNull === true
        || nullable === false
        || nullable === "NO"
      )
      && !hasDefault;
    })
    .map(
      column =>
        column.name
    );
}

function candidateMap(
  candidates
) {
  const map = {};

  for (
    const [
      key,
      value,
    ]
    of Object.entries(
      candidates
      ?? {}
    )
  ) {
    map[
      key
    ] = value;

    map[
      normalizeKey(
        key
      )
    ] = value;
  }

  return map;
}

export function buildNamedRow(
  contract,
  table,
  candidates,
  {
    context = null,
  } = {}
) {
  const columns =
    contractColumns(
      contract,
      table
    );

  const required =
    inferredRequiredColumns(
      contract,
      table
    );

  const candidate =
    candidateMap(
      candidates
    );

  const row = {};

  for (
    const column
    of columns
  ) {
    if (
      Object.prototype
        .hasOwnProperty
        .call(
          candidate,
          column
        )
    ) {
      row[
        column
      ] =
        candidate[
          column
        ];

      continue;
    }

    const normalized =
      normalizeKey(
        column
      );

    if (
      Object.prototype
        .hasOwnProperty
        .call(
          candidate,
          normalized
        )
    ) {
      row[
        column
      ] =
        candidate[
          normalized
        ];

      continue;
    }

    row[
      column
    ] = null;
  }

  const missingRequired =
    required.filter(
      column =>
        row[
          column
        ] === null
        || row[
          column
        ] === undefined
        || row[
          column
        ] === ""
    );

  return {
    row,
    valid:
      missingRequired.length
      === 0,
    missingRequired,
    context,
  };
}

function pushBuiltRow(
  tables,
  rejected,
  contract,
  table,
  candidates,
  context
) {
  const built =
    buildNamedRow(
      contract,
      table,
      candidates,
      {
        context,
      }
    );

  if (
    built.valid
  ) {
    tables[
      table
    ].push(
      built.row
    );

    return built.row;
  }

  rejected[
    table
  ].push({
    missingRequired:
      built.missingRequired,
    context:
      built.context,
  });

  return null;
}

function deduplicateRows(
  rows
) {
  const map =
    new Map();

  for (
    const row
    of rows
  ) {
    const key =
      canonicalJson(
        row
      );

    if (
      !map.has(
        key
      )
    ) {
      map.set(
        key,
        row
      );
    }
  }

  return [
    ...map.values(),
  ];
}

function sortRows(
  rows
) {
  return [
    ...rows,
  ].sort(
    (a, b) =>
      canonicalJson(
        a
      ).localeCompare(
        canonicalJson(
          b
        )
      )
  );
}


function normalizeKeyColumns(
  keyColumns
) {
  return Array.isArray(
    keyColumns
  )
    ? keyColumns
    : [
        keyColumns,
      ];
}


function rowKey(
  row,
  keyColumns
) {
  const columns =
    normalizeKeyColumns(
      keyColumns
    );

  return canonicalJson(
    columns.map(
      column =>
        row[
          column
        ]
    )
  );
}


function valueVariants(
  rows,
  column
) {
  const values =
    new Map();

  for (
    const row
    of rows
  ) {
    const key =
      canonicalJson(
        row[
          column
        ]
      );

    if (
      !values.has(
        key
      )
    ) {
      values.set(
        key,
        row[
          column
        ]
      );
    }
  }

  return [
    ...values.values(),
  ];
}


function groupRowsByKey(
  rows,
  keyColumns
) {
  const groups =
    new Map();

  for (
    const row
    of rows
  ) {
    const key =
      rowKey(
        row,
        keyColumns
      );

    if (
      !groups.has(
        key
      )
    ) {
      groups.set(
        key,
        []
      );
    }

    groups.get(
      key
    ).push(
      row
    );
  }

  return groups;
}


function differingColumns(
  rows,
  keyColumns
) {
  const keys =
    new Set(
      normalizeKeyColumns(
        keyColumns
      )
    );

  const columns =
    [
      ...new Set(
        rows.flatMap(
          row =>
            Object.keys(
              row
            )
        )
      ),
    ].sort();

  return columns.filter(
    column =>
      !keys.has(
        column
      )
      && valueVariants(
           rows,
           column
         ).length
         > 1
  );
}


function coalesceCertifiedRows(
  rows,
  keyColumns,
  {
    allowedDifferingColumns = [],
    label = "ROW",
  } = {}
) {
  const columns =
    normalizeKeyColumns(
      keyColumns
    );

  const groups =
    groupRowsByKey(
      rows,
      columns
    );

  const allowed =
    new Set(
      allowedDifferingColumns
    );

  const output = [];

  let collisionKeyCount = 0;
  let excessRows = 0;

  for (
    const group
    of groups.values()
  ) {
    if (
      group.length
      === 1
    ) {
      output.push(
        group[0]
      );

      continue;
    }

    collisionKeyCount += 1;

    excessRows += (
      group.length
      - 1
    );

    const differences =
      differingColumns(
        group,
        columns
      );

    const forbidden =
      differences.filter(
        column =>
          !allowed.has(
            column
          )
      );

    if (
      forbidden.length
      > 0
    ) {
      throw new Error(
        label
        + ": substantive collision for "
        + columns.join(
            "+"
          )
        + "="
        + rowKey(
            group[0],
            columns
          )
        + "; differing="
        + forbidden.join(
            ","
          )
      );
    }

    output.push(
      group[0]
    );
  }

  return {
    rows:
      output,

    collisionKeyCount,

    excessRows,
  };
}


function normalizeAddressDisplay(
  value
) {
  const text =
    normalizeText(
      value
    );

  if (
    !text
  ) {
    return null;
  }

  return text
    .toUpperCase()
    .replace(
      /[^A-Z0-9]+/g,
      ""
    );
}


function coalesceCertifiedAddressRows(
  rows
) {
  const groups =
    groupRowsByKey(
      rows,
      [
        "address_id",
      ]
    );

  const output = [];

  let collisionKeyCount = 0;
  let excessRows = 0;

  for (
    const group
    of groups.values()
  ) {
    if (
      group.length
      === 1
    ) {
      output.push(
        group[0]
      );

      continue;
    }

    collisionKeyCount += 1;

    excessRows += (
      group.length
      - 1
    );

    const differences =
      differingColumns(
        group,
        [
          "address_id",
        ]
      );

    const forbidden =
      differences.filter(
        column =>
          column
          !== "address_line1"
      );

    if (
      forbidden.length
      > 0
    ) {
      throw new Error(
        "ADDRESS_COLLISION_NOT_DISPLAY_ONLY:"
        + forbidden.join(
            ","
          )
      );
    }

    const displays =
      new Set(
        group.map(
          row =>
            normalizeAddressDisplay(
              row.address_line1
            )
        )
      );

    if (
      displays.size
      !== 1
    ) {
      throw new Error(
        "ADDRESS_DISPLAY_VARIANTS_NOT_EQUIVALENT:"
        + String(
            group[0]
              .address_id
          )
      );
    }

    output.push(
      group[0]
    );
  }

  return {
    rows:
      output,

    collisionKeyCount,

    excessRows,
  };
}


function deferAmbiguousBuildings(
  rows
) {
  const groups =
    groupRowsByKey(
      rows,
      [
        "building_id",
      ]
    );

  const output = [];
  const deferredRows = [];
  const deferredIds =
    new Set();

  for (
    const group
    of groups.values()
  ) {
    if (
      group.length
      === 1
    ) {
      output.push(
        group[0]
      );

      continue;
    }

    const sfValues =
      new Set(
        group.map(
          row =>
            canonicalJson(
              row.building_sf
            )
        )
      );

    if (
      sfValues.size
      > 1
    ) {
      for (
        const row
        of group
      ) {
        deferredRows.push(
          row
        );
      }

      deferredIds.add(
        group[0]
          .building_id
      );

      continue;
    }

    throw new Error(
      "UNCLASSIFIED_BUILDING_KEY_COLLISION:"
      + String(
          group[0]
            .building_id
        )
    );
  }

  return {
    rows:
      output,

    deferredRows,

    deferredIds,
  };
}


function clearDeferredBuildingReferences(
  rows,
  deferredIds
) {
  return rows.map(
    row => {
      if (
        Object.prototype
          .hasOwnProperty
          .call(
            row,
            "building_id"
          )
        && deferredIds.has(
          row.building_id
        )
      ) {
        return {
          ...row,
          building_id:
            null,
        };
      }

      return row;
    }
  );
}


function hasUnverifiedRawXY(
  observation
) {
  if (
    geometryCandidate(
      observation
    )
    !== null
  ) {
    return false;
  }

  const x =
    numberOrNull(
      pickValue(
        observation,
        [
          "x",
        ]
      )
    );

  const y =
    numberOrNull(
      pickValue(
        observation,
        [
          "y",
        ]
      )
    );

  return (
    x !== null
    && y !== null
  );
}


function applyGovernedProjectionPolicies(
  tables,
  rejected,
  referenceObservations
) {
  const diagnostics = {};


  const address =
    coalesceCertifiedAddressRows(
      tables.address
    );

  tables.address =
    address.rows;

  diagnostics.address = {
    collisionKeyCount:
      address.collisionKeyCount,

    excessRows:
      address.excessRows,

    projectedRows:
      tables.address.length,
  };


  const building =
    deferAmbiguousBuildings(
      tables.building
    );

  tables.building =
    building.rows;

  tables.listing =
    clearDeferredBuildingReferences(
      tables.listing,
      building.deferredIds
    );

  tables.space =
    clearDeferredBuildingReferences(
      tables.space,
      building.deferredIds
    );

  diagnostics.building = {
    deferredKeyCount:
      building
        .deferredIds
        .size,

    deferredCandidateRows:
      building
        .deferredRows
        .length,

    projectedRows:
      tables.building.length,
  };


  const listing =
    coalesceCertifiedRows(
      tables.listing,
      [
        "listing_id",
      ],
      {
        allowedDifferingColumns:[
          "source_observation_id",
        ],

        label:
          "LISTING",
      }
    );

  tables.listing =
    listing.rows;

  diagnostics.listing = {
    collisionKeyCount:
      listing.collisionKeyCount,

    excessRows:
      listing.excessRows,

    projectedRows:
      tables.listing.length,
  };


  const configuration =
    coalesceCertifiedRows(
      tables
        .listing_configuration,
      [
        "listing_configuration_id",
      ],
      {
        allowedDifferingColumns:[
          "source_observation_id",
        ],

        label:
          "LISTING_CONFIGURATION",
      }
    );

  tables.listing_configuration =
    configuration.rows;

  diagnostics.listing_configuration = {
    collisionKeyCount:
      configuration
        .collisionKeyCount,

    excessRows:
      configuration
        .excessRows,

    projectedRows:
      tables
        .listing_configuration
        .length,
  };


  const geography =
    coalesceCertifiedRows(
      tables
        .geography_registry,
      [
        "geography_id",
      ],
      {
        allowedDifferingColumns:[
          "source_observation_id",
        ],

        label:
          "GEOGRAPHY_REGISTRY",
      }
    );

  tables.geography_registry =
    geography.rows;

  diagnostics.geography_registry = {
    collisionKeyCount:
      geography
        .collisionKeyCount,

    excessRows:
      geography
        .excessRows,

    projectedRows:
      tables
        .geography_registry
        .length,
  };


  const assetGeography =
    coalesceCertifiedRows(
      tables
        .asset_geography,
      [
        "asset_id",
        "geography_id",
      ],
      {
        allowedDifferingColumns:[
          "source_observation_id",
        ],

        label:
          "ASSET_GEOGRAPHY",
      }
    );

  tables.asset_geography =
    assetGeography.rows;

  diagnostics.asset_geography = {
    collisionKeyCount:
      assetGeography
        .collisionKeyCount,

    excessRows:
      assetGeography
        .excessRows,

    projectedRows:
      tables
        .asset_geography
        .length,
  };


  const identityCrosswalkCandidateRows =
    (
      tables
        .identity_crosswalk
        .length
      + rejected
          .identity_crosswalk
          .length
    );

  tables.identity_crosswalk = [];
  rejected.identity_crosswalk = [];


  const deferredSpatialRows =
    referenceObservations.filter(
      hasUnverifiedRawXY
    ).length;


  if (
    rejected
      .spatial_feature
      .length
    !== 0
  ) {
    throw new Error(
      "UNEXPECTED_SPATIAL_FEATURE_REJECTIONS:"
      + String(
          rejected
            .spatial_feature
            .length
        )
    );
  }


  if (
    deferredSpatialRows
    !== 6877
  ) {
    throw new Error(
      "UNVERIFIED_CRS_DEFERRAL_COUNT_DRIFT:"
      + String(
          deferredSpatialRows
        )
      + "!=6877"
    );
  }


  diagnostics.deferrals = {
    building:{
      candidateRows:
        building
          .deferredRows
          .length,

      keyCount:
        building
          .deferredIds
          .size,

      reason:
        "AMBIGUOUS_PHYSICAL_BUILDING_IDENTITY",
    },

    identity_crosswalk:{
      candidateRows:
        identityCrosswalkCandidateRows,

      reason:
        (
          "CURRENT_SCHEMA_CANNOT_TRUTHFULLY_REPRESENT_"
          + "PROVISIONAL_IDENTITY_AND_CONFIDENCE"
        ),
    },

    spatial_feature:{
      candidateRows:
        deferredSpatialRows,

      reason:
        "UNVERIFIED_SOURCE_CRS",
    },
  };

  return diagnostics;
}


function sourceEffectiveDate(
  family,
  sourcePath
) {
  if (
    family
    === "CURRENT_AVAILABILITY_2026_10_14"
  ) {
    return "2026-10-14";
  }

  if (
    family
    === "SUPERSHEET_FORWARD_2026_10_15"
  ) {
    return "2026-10-15";
  }

  const text =
    String(
      sourcePath
      ?? ""
    );

  const ymd =
    text.match(
      /(20\d{2})[-_](\d{1,2})[-_](\d{1,2})/
    );

  if (ymd) {
    return (
      ymd[1]
      + "-"
      + String(
          ymd[2]
        ).padStart(
          2,
          "0"
        )
      + "-"
      + String(
          ymd[3]
        ).padStart(
          2,
          "0"
        )
    );
  }

  const mdy =
    text.match(
      /(\d{1,2})[-_](\d{1,2})[-_](20\d{2})/
    );

  if (mdy) {
    return (
      mdy[3]
      + "-"
      + String(
          mdy[1]
        ).padStart(
          2,
          "0"
        )
      + "-"
      + String(
          mdy[2]
        ).padStart(
          2,
          "0"
        )
    );
  }

  return null;
}

function sourceDocumentCandidates(
  document
) {
  const id =
    document.sourceDocumentId
    ?? deterministicId(
      "SOURCE_DOCUMENT",
      document.family,
      document.relativePath,
      document.sha256
    );

  const effectiveDate =
    sourceEffectiveDate(
      document.family,
      document.relativePath
    );

  return {
    source_document_id:
      id,
    document_id:
      id,
    source_id:
      id,
    source_family:
      document.family,
    family:
      document.family,
    source_type:
      document.family,
    source_system:
      document.family,
    source_kind:
      path
        .extname(
          document.relativePath
          ?? ""
        )
        .replace(
          /^\./,
          ""
        )
        .toLowerCase(),
    original_name:
      path.basename(
        document.relativePath
        ?? ""
      ),
    source_path:
      document.relativePath,
    relative_path:
      document.relativePath,
    file_path:
      document.relativePath,
    source_file:
      document.relativePath,
    file_name:
      path.basename(
        document.relativePath
      ),
    source_sha256:
      document.sha256,
    sha256:
      document.sha256,
    content_sha256:
      document.sha256,
    effective_date:
      effectiveDate,
    source_date:
      effectiveDate,
    metadata:
      {
        family:
          document.family,
        relativePath:
          document.relativePath,
        sha256:
          document.sha256,
      },
    metadata_json:
      {
        family:
          document.family,
        relativePath:
          document.relativePath,
        sha256:
          document.sha256,
      },
  };
}

function observationId(
  observation,
  family,
  documentId,
  ordinal
) {
  return (
    pickValue(
      observation,
      [
        "observation_id",
        "source_observation_id",
        "observationId",
        "sourceObservationId",
      ]
    )
    ?? deterministicId(
      "SOURCE_OBSERVATION",
      family,
      documentId,
      ordinal,
      observation
    )
  );
}

function sourceObservationCandidates(
  observation,
  family,
  documentId,
  ordinal,
  sourcePath,
  sourceSha256
) {
  const id =
    observationId(
      observation,
      family,
      documentId,
      ordinal
    );

  const effectiveDate =
    dateOrNull(
      pickValue(
        observation,
        [
          "effective_date",
          "event_date",
          "date",
          "source_date",
          "effectiveDate",
        ]
      )
    )
    ?? sourceEffectiveDate(
        family,
        sourcePath
      );

  const sourceRowNumber =
    pickValue(
      observation,
      [
        "sourceRowNumber",
        "row_number",
        "sourceLine",
        "source_line",
      ]
    );

  const sourcePageNumber =
    pickValue(
      observation,
      [
        "pageNumber",
        "page_number",
        "sourcePage",
        "source_page",
      ]
    );

  const recordLocator =
    sourcePageNumber !== null
    && sourcePageNumber !== undefined
    && sourceRowNumber !== null
    && sourceRowNumber !== undefined
      ? (
          "page:"
          + String(
              sourcePageNumber
            )
          + ";row:"
          + String(
              sourceRowNumber
            )
        )
      : (
          sourcePageNumber !== null
          && sourcePageNumber !== undefined
            ? (
                "page:"
                + String(
                    sourcePageNumber
                  )
              )
            : (
                sourceRowNumber !== null
                && sourceRowNumber !== undefined
                  ? (
                      "row:"
                      + String(
                          sourceRowNumber
                        )
                    )
                  : (
                      "ordinal:"
                      + String(
                          ordinal
                        )
                    )
              )
        );

  const observedObjectType =
    normalizeText(
      pickValue(
        observation,
        [
          "observationKind",
          "observation_kind",
          "kind",
        ]
      )
    )
    ?? (
      String(
        family
      )
      + "_OBSERVATION"
    );

  return {
    source_observation_id:
      id,
    observation_id:
      id,
    source_document_id:
      documentId,
    document_id:
      documentId,
    source_family:
      family,
    family:
      family,
    source_record_ordinal:
      ordinal,
    record_ordinal:
      ordinal,
    row_number:
      sourceRowNumber,
    page_number:
      sourcePageNumber,
    record_locator:
      recordLocator,
    observed_object_type:
      observedObjectType,
    raw_record:
      observation,
    source_path:
      sourcePath,
    source_sha256:
      sourceSha256,
    effective_date:
      effectiveDate,
    raw_payload:
      observation,
    payload:
      observation,
    observation_payload:
      observation,
    raw_json:
      observation,
    content_sha256:
      sha256Hex(
        canonicalJson(
          observation
        )
      ),
  };
}

function addressParts(
  record
) {
  return {
    address:
      normalizeText(
        pickValue(
          record,
          [
            "address",
            "property_address",
            "street_address",
            "address_1",
            "address1",
            "site_address",
            "propertyaddress",
          ]
        )
      ),
    city:
      normalizeText(
        pickValue(
          record,
          [
            "city",
            "property_city",
            "municipality",
          ]
        )
      ),
    state:
      normalizeText(
        pickValue(
          record,
          [
            "state",
            "property_state",
          ]
        )
      ),
    postalCode:
      normalizeText(
        pickValue(
          record,
          [
            "zip",
            "zipcode",
            "zip_code",
            "postal_code",
            "postalcode",
          ]
        )
      ),
  };
}

function normalizedAddressKey(
  record
) {
  const parts =
    addressParts(
      record
    );

  if (!parts.address) {
    return null;
  }

  return [
    normalizeKey(
      parts.address
    ),
    normalizeKey(
      parts.city
    ),
    normalizeKey(
      parts.postalCode
    ),
  ].join("|");
}

function listingNumber(
  record
) {
  return normalizeText(
    pickValue(
      record,
      [
        "listing_number",
        "listing_no",
        "listing_num",
        "listing",
        "listing_id",
        "listingnumber",
        "listingid",
      ]
    )
  );
}

function listingIdentityKey(
  record
) {
  const number =
    listingNumber(
      record
    );

  if (number) {
    return (
      "LISTING_NUMBER|"
      + normalizeKey(
          number
        )
    );
  }

  const address =
    normalizedAddressKey(
      record
    );

  const sf =
    numberOrNull(
      pickValue(
        record,
        [
          "available_sf",
          "marketed_sf",
          "sf",
          "square_feet",
          "comp_sf",
          "building_sf",
        ]
      )
    );

  if (
    address
    && sf !== null
  ) {
    return (
      "ADDRESS_SF|"
      + address
      + "|"
      + String(
          sf
        )
    );
  }

  if (address) {
    return (
      "ADDRESS|"
      + address
    );
  }

  return null;
}

function assetIdentityFromAir(
  record
) {
  const explicit =
    normalizeText(
      pickValue(
        record,
        [
          "asset_id",
          "resolved_asset_id",
          "canonical_asset_id",
        ]
      )
    );

  if (explicit) {
    return {
      assetId:
        explicit,
      identityStatus:
        "CANONICAL_OR_SOURCE",
    };
  }

  const address =
    normalizedAddressKey(
      record
    );

  if (!address) {
    return {
      assetId:
        null,
      identityStatus:
        "UNRESOLVED",
    };
  }

  return {
    assetId:
      deterministicId(
        "ASSET_PROVISIONAL",
        address
      ),
    identityStatus:
      "PROVISIONAL",
  };
}

function listingIdentity(
  record
) {
  const explicit =
    normalizeText(
      pickValue(
        record,
        [
          "resolved_listing_id",
          "canonical_listing_id",
          "listing_id",
        ]
      )
    );

  if (explicit) {
    return {
      listingId:
        explicit,
      identityStatus:
        "CANONICAL_OR_SOURCE",
    };
  }

  const key =
    listingIdentityKey(
      record
    );

  if (!key) {
    return {
      listingId:
        null,
      identityStatus:
        "UNRESOLVED",
    };
  }

  return {
    listingId:
      deterministicId(
        "LISTING_PROVISIONAL",
        key
      ),
    identityStatus:
      "PROVISIONAL",
  };
}

function explicitSpaceEvidence(
  record
) {
  const value =
    normalizeText(
      pickValue(
        record,
        [
          "suite",
          "suite_number",
          "unit",
          "unit_number",
          "space",
          "space_number",
          "space_id",
          "suite_no",
          "unit_no",
        ]
      )
    );

  return value;
}

function eventId(
  event,
  sourceFamily
) {
  return (
    normalizeText(
      pickValue(
        event,
        [
          "event_id",
          "logical_event_id",
          "eventId",
          "logicalEventId",
        ]
      )
    )
    ?? deterministicId(
      "EVENT",
      sourceFamily,
      event
    )
  );
}

function eventType(
  event
) {
  const plural =
    pickValue(
      event,
      [
        "eventTypes",
        "event_types",
      ]
    );

  if (
    Array.isArray(
      plural
    )
  ) {
    const values =
      [
        ...new Set(
          plural
            .map(
              normalizeText
            )
            .filter(Boolean)
        ),
      ].sort();

    if (
      values.length
      > 0
    ) {
      return values.join(
        "|"
      );
    }
  }

  return normalizeText(
    pickValue(
      event,
      [
        "event_type",
        "eventType",
        "type",
        "change_type",
        "changeType",
        "action",
      ]
    )
  );
}

function eventDate(
  event,
  fallback
) {
  return (
    dateOrNull(
      pickValue(
        event,
        [
          "effective_date",
          "event_date",
          "eventDate",
          "effectiveDate",
          "date",
          "processing_date",
        ]
      )
    )
    ?? fallback
    ?? null
  );
}

function recursivelyCollectOrdinals(
  value,
  output = new Set(),
  depth = 0
) {
  if (
    value === null
    || value === undefined
    || depth > 7
  ) {
    return output;
  }

  if (
    Array.isArray(
      value
    )
  ) {
    for (
      const child
      of value
    ) {
      recursivelyCollectOrdinals(
        child,
        output,
        depth + 1
      );
    }

    return output;
  }

  if (
    typeof value
    !== "object"
  ) {
    return output;
  }

  for (
    const [
      key,
      child,
    ]
    of Object.entries(
      value
    )
  ) {
    const normalized =
      normalizeKey(
        key
      );

    if (
      [
        "sourcerecordordinal",
        "recordordinal",
        "observationordinal",
        "sourceordinal",
      ].includes(
        normalized
      )
    ) {
      const number =
        Number(
          child
        );

      if (
        Number.isFinite(
          number
        )
      ) {
        output.add(
          number
        );
      }
    }

    recursivelyCollectOrdinals(
      child,
      output,
      depth + 1
    );
  }

  return output;
}

function transactionType(
  record
) {
  return normalizeText(
    pickValue(
      record,
      [
        "listing_type",
        "transaction_type",
        "type",
        "lease_type",
        "comp_type",
        "deal_type",
      ]
    )
  );
}

function transactionDate(
  record
) {
  return dateOrNull(
    pickValue(
      record,
      [
        "date",
        "transaction_date",
        "lease_date",
        "sale_date",
        "close_date",
        "comp_date",
      ]
    )
  );
}

function geometryCandidate(
  observation
) {
  return (
    observation.geometry
    ?? pickValue(
      observation,
      [
        "geometry",
        "geom",
        "wkt",
      ]
    )
    ?? null
  );
}

function latLon(
  observation
) {
  const lat =
    numberOrNull(
      pickValue(
        observation,
        [
          "latitude",
          "lat",
        ]
      )
    );

  const lon =
    numberOrNull(
      pickValue(
        observation,
        [
          "longitude",
          "lon",
          "lng",
        ]
      )
    );

  return {
    lat,
    lon,
  };
}

function initializeTables(
  contract
) {
  return Object.fromEntries(
    Object.keys(
      contract.tables
    )
      .sort()
      .map(
        table => [
          table,
          [],
        ]
      )
  );
}

function initializeRejected(
  contract
) {
  return Object.fromEntries(
    Object.keys(
      contract.tables
    )
      .sort()
      .map(
        table => [
          table,
          [],
        ]
      )
  );
}

function sourceObservationRecord(
  tables,
  rejected,
  contract,
  {
    observation,
    family,
    documentId,
    ordinal,
    sourcePath,
    sourceSha256,
  }
) {
  const candidates =
    sourceObservationCandidates(
      observation,
      family,
      documentId,
      ordinal,
      sourcePath,
      sourceSha256
    );

  const row =
    pushBuiltRow(
      tables,
      rejected,
      contract,
      "source_observation",
      candidates,
      {
        family,
        documentId,
        ordinal,
      }
    );

  return {
    row,
    observationId:
      candidates
        .source_observation_id,
  };
}

function makeIdentityCrosswalk(
  tables,
  rejected,
  contract,
  {
    sourceFamily,
    sourceKey,
    targetType,
    targetId,
    identityStatus,
    sourceObservationId = null,
  }
) {
  if (
    !sourceKey
    || !targetId
  ) {
    return null;
  }

  const crosswalkId =
    deterministicId(
      "IDENTITY_CROSSWALK",
      sourceFamily,
      sourceKey,
      targetType,
      targetId
    );

  return pushBuiltRow(
    tables,
    rejected,
    contract,
    "identity_crosswalk",
    {
      identity_crosswalk_id:
        crosswalkId,
      crosswalk_id:
        crosswalkId,
      source_family:
        sourceFamily,
      source_type:
        sourceFamily,
      source_key:
        sourceKey,
      external_id:
        sourceKey,
      object_type:
        targetType,
      target_type:
        targetType,
      canonical_id:
        identityStatus
        === "PROVISIONAL"
          ? null
          : targetId,
      target_id:
        targetId,
      provisional_id:
        identityStatus
        === "PROVISIONAL"
          ? targetId
          : null,
      identity_status:
        identityStatus,
      status:
        identityStatus,
      source_observation_id:
        sourceObservationId,
    },
    {
      sourceFamily,
      sourceKey,
      targetType,
      targetId,
    }
  );
}

function collectAirFoundation(
  tables,
  rejected,
  contract,
  airRows,
  sourceMetaByRecord
) {
  const assetByAddress =
    new Map();

  let ordinal = 0;

  for (
    const record
    of airRows
  ) {
    ordinal += 1;

    const meta =
      sourceMetaByRecord.get(
        record
      )
      ?? {};

    const documentId =
      meta.documentId
      ?? deterministicId(
        "SOURCE_DOCUMENT_FALLBACK",
        "AIR_BASE_INVENTORY",
        ordinal
      );

    const observation =
      sourceObservationRecord(
        tables,
        rejected,
        contract,
        {
          observation:
            record,
          family:
            "AIR_BASE_INVENTORY",
          documentId,
          ordinal:
            meta.ordinal
            ?? ordinal,
          sourcePath:
            meta.sourcePath
            ?? null,
          sourceSha256:
            meta.sourceSha256
            ?? null,
        }
      );

    const parts =
      addressParts(
        record
      );

    const addressKey =
      normalizedAddressKey(
        record
      );

    if (!addressKey) {
      continue;
    }

    const addressId =
      deterministicId(
        "ADDRESS",
        addressKey
      );

    pushBuiltRow(
      tables,
      rejected,
      contract,
      "address",
      {
        address_id:
          addressId,
        street_address:
          parts.address,
        address_line1:
          parts.address,
        address:
          parts.address,
        city:
          parts.city,
        state:
          parts.state,
        postal_code:
          parts.postalCode,
        zip:
          parts.postalCode,
        zip_code:
          parts.postalCode,
        normalized_address:
          addressKey,
        source_observation_id:
          observation
            .observationId,
      },
      {
        addressKey,
      }
    );

    const assetIdentity =
      assetIdentityFromAir(
        record
      );

    if (
      !assetIdentity
        .assetId
    ) {
      continue;
    }

    const assetId =
      assetIdentity
        .assetId;

    pushBuiltRow(
      tables,
      rejected,
      contract,
      "asset",
      {
        asset_id:
          assetId,
        address_id:
          addressId,
        primary_address_id:
          addressId,
        asset_type:
          normalizeText(
            pickValue(
              record,
              [
                "asset_type",
                "property_type",
              ]
            )
          ),
        property_type:
          normalizeText(
            pickValue(
              record,
              [
                "property_type",
                "asset_type",
              ]
            )
          ),
        source_observation_id:
          observation
            .observationId,
        identity_status:
          assetIdentity
            .identityStatus,
      },
      {
        assetId,
        addressKey,
      }
    );

    const buildingId =
      normalizeText(
        pickValue(
          record,
          [
            "building_id",
            "air_building_id",
          ]
        )
      )
      ?? deterministicId(
        "BUILDING",
        assetId
      );

    const buildingSf =
      numberOrNull(
        pickValue(
          record,
          [
            "building_sf",
            "building_size",
            "building_square_feet",
            "rba",
            "rentable_building_area",
            "square_feet",
            "sf",
          ]
        )
      );

    pushBuiltRow(
      tables,
      rejected,
      contract,
      "building",
      {
        building_id:
          buildingId,
        asset_id:
          assetId,
        address_id:
          addressId,
        building_sf:
          buildingSf,
        rba:
          buildingSf,
        square_feet:
          buildingSf,
        source_observation_id:
          observation
            .observationId,
      },
      {
        assetId,
        buildingId,
      }
    );

    assetByAddress.set(
      addressKey,
      {
        assetId,
        addressId,
        buildingId,
      }
    );

    makeIdentityCrosswalk(
      tables,
      rejected,
      contract,
      {
        sourceFamily:
          "AIR_BASE_INVENTORY",
        sourceKey:
          addressKey,
        targetType:
          "ASSET",
        targetId:
          assetId,
        identityStatus:
          assetIdentity
            .identityStatus,
        sourceObservationId:
          observation
            .observationId,
      }
    );

    const market =
      normalizeText(
        pickValue(
          record,
          [
            "market",
            "air_market",
          ]
        )
      );

    const submarket =
      normalizeText(
        pickValue(
          record,
          [
            "submarket",
            "air_submarket",
          ]
        )
      );

    const geographies = [];

    if (market) {
      geographies.push({
        level:
          "MARKET",
        name:
          market,
        parent:
          null,
      });
    }

    if (submarket) {
      geographies.push({
        level:
          "SUBMARKET",
        name:
          submarket,
        parent:
          market,
      });
    }

    for (
      const geo
      of geographies
    ) {
      const geographyId =
        deterministicId(
          "GEOGRAPHY",
          geo.level,
          geo.name,
          geo.parent
        );

      pushBuiltRow(
        tables,
        rejected,
        contract,
        "geography_registry",
        {
          geography_id:
            geographyId,
          geo_id:
            geographyId,
          geography_type:
            geo.level,
          level:
            geo.level,
          name:
            geo.name,
          geography_name:
            geo.name,
          parent_name:
            geo.parent,
          authority_source:
            "AIR_BASE_INVENTORY",
          source_observation_id:
            observation
              .observationId,
        },
        {
          geographyId,
          geo,
        }
      );

      const edgeId =
        deterministicId(
          "ASSET_GEOGRAPHY",
          assetId,
          geographyId
        );

      pushBuiltRow(
        tables,
        rejected,
        contract,
        "asset_geography",
        {
          asset_geography_id:
            edgeId,
          edge_id:
            edgeId,
          asset_id:
            assetId,
          geography_id:
            geographyId,
          assignment_method:
            "DIRECT_AIR_SUBMARKET_FIELD",
          source_observation_id:
            observation
              .observationId,
        },
        {
          assetId,
          geographyId,
        }
      );
    }
  }

  return {
    assetByAddress,
  };
}

function collectAvailability(
  tables,
  rejected,
  contract,
  availabilityRows,
  sourceMetaByRecord,
  assetByAddress
) {
  const listingByKey =
    new Map();

  const listingStateById =
    new Map();

  let ordinal = 0;

  for (
    const record
    of availabilityRows
  ) {
    ordinal += 1;

    const meta =
      sourceMetaByRecord.get(
        record
      )
      ?? {};

    const observation =
      sourceObservationRecord(
        tables,
        rejected,
        contract,
        {
          observation:
            record,
          family:
            "CURRENT_AVAILABILITY_2026_10_14",
          documentId:
            meta.documentId,
          ordinal:
            meta.ordinal
            ?? ordinal,
          sourcePath:
            meta.sourcePath,
          sourceSha256:
            meta.sourceSha256,
        }
      );

    const identity =
      listingIdentity(
        record
      );

    if (
      !identity
        .listingId
    ) {
      continue;
    }

    const listingId =
      identity
        .listingId;

    const key =
      listingIdentityKey(
        record
      );

    const addressKey =
      normalizedAddressKey(
        record
      );

    const assetMatch =
      addressKey
        ? (
            assetByAddress.get(
              addressKey
            )
            ?? null
          )
        : null;

    const assetId =
      assetMatch
        ?.assetId
      ?? normalizeText(
          pickValue(
            record,
            [
              "asset_id",
              "resolved_asset_id",
            ]
          )
        );

    const listingNo =
      listingNumber(
        record
      );

    const marketedSf =
      numberOrNull(
        pickValue(
          record,
          [
            "marketed_sf",
            "available_sf",
            "availability_sf",
            "sf",
            "square_feet",
          ]
        )
      );

    const status =
      normalizeText(
        pickValue(
          record,
          [
            "status",
            "listing_status",
            "availability_status",
          ]
        )
      )
      ?? "AVAILABLE";

    pushBuiltRow(
      tables,
      rejected,
      contract,
      "listing",
      {
        listing_id:
          listingId,
        asset_id:
          assetId,
        building_id:
          assetMatch
            ?.buildingId
          ?? null,
        listing_number:
          listingNo,
        source_listing_id:
          listingNo,
        listing_type:
          normalizeText(
            pickValue(
              record,
              [
                "listing_type",
                "type",
              ]
            )
          ),
        source_system:
          "CURRENT_AVAILABILITY_2026_10_14",
        status:
          status,
        source_observation_id:
          observation
            .observationId,
        identity_status:
          identity
            .identityStatus,
      },
      {
        listingId,
        key,
      }
    );

    const configurationId =
      deterministicId(
        "LISTING_CONFIGURATION",
        listingId,
        marketedSf,
        pickValue(
          record,
          [
            "rate",
            "asking_rate",
          ]
        ),
        explicitSpaceEvidence(
          record
        )
    );

    pushBuiltRow(
      tables,
      rejected,
      contract,
      "listing_configuration",
      {
        listing_configuration_id:
          configurationId,
        configuration_id:
          configurationId,
        listing_id:
          listingId,
        marketed_sf:
          marketedSf,
        available_sf:
          marketedSf,
        rate:
          pickValue(
            record,
            [
              "rate",
              "asking_rate",
              "lease_rate",
            ]
          ),
        price:
          numberOrNull(
            pickValue(
              record,
              [
                "price",
                "asking_price",
              ]
            )
          ),
        source_observation_id:
          observation
            .observationId,
      },
      {
        listingId,
        configurationId,
      }
    );

    const explicitSpace =
      explicitSpaceEvidence(
        record
      );

    if (
      explicitSpace
    ) {
      const spaceId =
        deterministicId(
          "SPACE",
          assetId,
          listingId,
          explicitSpace
        );

      const spaceRow =
        pushBuiltRow(
          tables,
          rejected,
          contract,
          "space",
          {
            space_id:
              spaceId,
            asset_id:
              assetId,
            building_id:
              assetMatch
                ?.buildingId
              ?? null,
            space_name:
              explicitSpace,
            suite:
              explicitSpace,
            unit:
              explicitSpace,
            source_observation_id:
              observation
                .observationId,
          },
          {
            listingId,
            explicitSpace,
          }
        );

      if (
        spaceRow
      ) {
        const junctionId =
          deterministicId(
            "LISTING_CONFIGURATION_SPACE",
            configurationId,
            spaceId
          );

        pushBuiltRow(
          tables,
          rejected,
          contract,
          "listing_configuration_space",
          {
            listing_configuration_space_id:
              junctionId,
            edge_id:
              junctionId,
            listing_configuration_id:
              configurationId,
            configuration_id:
              configurationId,
            space_id:
              spaceId,
            source_observation_id:
              observation
                .observationId,
          },
          {
            configurationId,
            spaceId,
          }
        );
      }
    }

    const stateCandidates = {
      listing_id:
        listingId,
      status:
        status,
      rate:
        pickValue(
          record,
          [
            "rate",
            "asking_rate",
            "lease_rate",
          ]
        ),
      price:
        numberOrNull(
          pickValue(
            record,
            [
              "price",
              "asking_price",
            ]
          )
        ),
      marketed_sf:
        marketedSf,

      // Missing unique/vacant evidence remains null.
      unique_available_sf:
        numberOrNull(
          pickValue(
            record,
            [
              "unique_available_sf",
            ]
          )
        ),
      vacant_sf:
        numberOrNull(
          pickValue(
            record,
            [
              "vacant_sf",
            ]
          )
        ),
      vacant:
        booleanOrNull(
          pickValue(
            record,
            [
              "vacant",
              "is_vacant",
            ]
          )
        ),
      possession:
        normalizeText(
          pickValue(
            record,
            [
              "possession",
            ]
          )
        ),
      overlap_status:
        normalizeText(
          pickValue(
            record,
            [
              "overlap_status",
            ]
          )
        ),
      last_event_id:
        null,
      last_event_date:
        "2026-10-14",
    };

    const existing =
      listingStateById.get(
        listingId
      );

    if (!existing) {
      listingStateById.set(
        listingId,
        stateCandidates
      );
    }

    if (key) {
      listingByKey.set(
        key,
        {
          listingId,
          assetId,
          configurationId,
        }
      );
    }

    makeIdentityCrosswalk(
      tables,
      rejected,
      contract,
      {
        sourceFamily:
          "CURRENT_AVAILABILITY_2026_10_14",
        sourceKey:
          key,
        targetType:
          "LISTING",
        targetId:
          listingId,
        identityStatus:
          identity
            .identityStatus,
        sourceObservationId:
          observation
            .observationId,
      }
    );
  }

  return {
    listingByKey,
    listingStateById,
  };
}

function collectSupersheet(
  tables,
  rejected,
  contract,
  {
    observations,
    events,
    sourceFamily,
    sourceMetaByRecord,
    listingByKey,
    listingStateById,
  }
) {
  const observationIdsByOrdinal =
    new Map();

  const observationIdsByExternal =
    new Map();

  let ordinal = 0;

  for (
    const observation
    of observations
  ) {
    ordinal += 1;

    const meta =
      sourceMetaByRecord.get(
        observation
      )
      ?? {};

    const built =
      sourceObservationRecord(
        tables,
        rejected,
        contract,
        {
          observation,
          family:
            sourceFamily,
          documentId:
            meta.documentId,
          ordinal:
            meta.ordinal
            ?? ordinal,
          sourcePath:
            meta.sourcePath,
          sourceSha256:
            meta.sourceSha256,
        }
      );

    observationIdsByOrdinal.set(
      meta.ordinal
      ?? ordinal,
      built
        .observationId
    );

    observationIdsByExternal.set(
      built.observationId,
      built.observationId
    );

    const externalObservationId =
      normalizeText(
        pickValue(
          observation,
          [
            "observation_id",
            "source_observation_id",
            "observationId",
            "sourceObservationId",
          ]
        )
      );

    if (
      externalObservationId
    ) {
      observationIdsByExternal.set(
        externalObservationId,
        built.observationId
      );
    }
  }

  let eventOrdinal = 0;

  for (
    const event
    of events
  ) {
    eventOrdinal += 1;

    const fallbackDate =
      sourceFamily
      === "SUPERSHEET_FORWARD_2026_10_15"
        ? "2026-10-15"
        : null;

    const id =
      eventId(
        event,
        sourceFamily
      );

    const type =
      eventType(
        event
      );

    const date =
      eventDate(
        event,
        fallbackDate
      );

    const listingKey =
      listingIdentityKey(
        event
      );

    const knownListing =
      listingKey
        ? (
            listingByKey.get(
              listingKey
            )
            ?? null
          )
        : null;

    const eventListingIdentity =
      listingIdentity(
        event
      );

    const listingId =
      knownListing
        ?.listingId
      ?? (
          eventListingIdentity
            .identityStatus
          === "CANONICAL_OR_SOURCE"
            ? eventListingIdentity
                .listingId
            : null
        );

    const eventRow =
      pushBuiltRow(
        tables,
        rejected,
        contract,
        "event_registry",
        {
          event_id:
            id,
          logical_event_id:
            id,
          listing_id:
            listingId,
          asset_id:
            knownListing
              ?.assetId
            ?? null,
          event_type:
            type,
          type:
            type,
          effective_date:
            date,
          event_date:
            date,
          source_family:
            sourceFamily,
          payload:
            event,
          event_payload:
            event,
        },
        {
          eventId:
            id,
          sourceFamily,
          eventOrdinal,
        }
      );

    const explicitObservationIds =
      Array.isArray(
        event.observationIds
      )
        ? event.observationIds
            .map(
              value =>
                normalizeText(
                  value
                )
            )
            .filter(Boolean)
        : [];

    const embeddedObservationIds =
      Array.isArray(
        event.sourceObservations
      )
        ? event.sourceObservations
            .map(
              observation =>
                normalizeText(
                  pickValue(
                    observation,
                    [
                      "observation_id",
                      "source_observation_id",
                      "observationId",
                      "sourceObservationId",
                    ]
                  )
                )
            )
            .filter(Boolean)
        : [];

    const explicitSet =
      new Set(
        explicitObservationIds
      );

    const embeddedSet =
      new Set(
        embeddedObservationIds
      );

    if (
      explicitSet.size
      !== embeddedSet.size
      || [
           ...explicitSet,
         ].some(
           observationId =>
             !embeddedSet.has(
               observationId
             )
         )
    ) {
      throw new Error(
        "EVENT_OBSERVATION_MEMBERSHIP_CHANNEL_MISMATCH:"
        + String(
            id
          )
      );
    }

    if (
      explicitSet.size
      === 0
    ) {
      throw new Error(
        "EVENT_WITHOUT_EXPLICIT_OBSERVATION_MEMBERSHIP:"
        + String(
            id
          )
      );
    }

    for (
      const externalObservationId
      of [
        ...explicitSet,
      ].sort()
    ) {
      const sourceObservationId =
        observationIdsByExternal.get(
          externalObservationId
        );

      if (
        !sourceObservationId
      ) {
        throw new Error(
          "UNRESOLVED_EXPLICIT_EVENT_OBSERVATION:"
          + String(
              id
            )
          + ":"
          + String(
              externalObservationId
            )
        );
      }

      if (
        !eventRow
      ) {
        throw new Error(
          "EVENT_ROW_NOT_PROJECTED_FOR_MEMBERSHIP:"
          + String(
              id
            )
        );
      }

      const edgeId =
        deterministicId(
          "EVENT_OBSERVATION_EDGE",
          id,
          sourceObservationId
        );

      pushBuiltRow(
        tables,
        rejected,
        contract,
        "event_observation_edge",
        {
          event_observation_edge_id:
            edgeId,
          edge_id:
            edgeId,
          event_id:
            id,
          source_observation_id:
            sourceObservationId,
          observation_id:
            sourceObservationId,
        },
        {
          eventId:
            id,
          sourceObservationId,
        }
      );
    }

    if (
      !listingId
      || !eventRow
    ) {
      continue;
    }

    const current =
      listingStateById.get(
        listingId
      );

    if (!current) {
      continue;
    }

    const upperType =
      String(
        type
        ?? ""
      )
        .toUpperCase();

    // SALE is transaction history, not current lease/listing state.
    if (
      upperType.includes(
        "SALE"
      )
    ) {
      continue;
    }

    const currentDate =
      dateOrNull(
        current
          .last_event_date
      );

    if (
      date
      && currentDate
      && date < currentDate
    ) {
      // Older events never overwrite newer effective state.
      continue;
    }

    const nextStatus =
      normalizeText(
        pickValue(
          event,
          [
            "new_status",
            "after_status",
            "status_after",
            "status",
          ]
        )
      );

    const nextRate =
      pickValue(
        event,
        [
          "new_rate",
          "after_rate",
          "rate_after",
          "rate",
        ]
      );

    const nextPrice =
      numberOrNull(
        pickValue(
          event,
          [
            "new_price",
            "after_price",
            "price_after",
            "price",
          ]
        )
      );

    const nextMarketedSf =
      numberOrNull(
        pickValue(
          event,
          [
            "new_marketed_sf",
            "after_marketed_sf",
            "marketed_sf",
          ]
        )
      );

    const updated = {
      ...current,
      status:
        nextStatus
        ?? current.status,
      rate:
        nextRate
        ?? current.rate,
      price:
        nextPrice
        ?? current.price,
      marketed_sf:
        nextMarketedSf
        ?? current.marketed_sf,
      last_event_id:
        id,
      last_event_date:
        date
        ?? current.last_event_date,
    };

    listingStateById.set(
      listingId,
      updated
    );
  }
}

function explicitTransactionParties(
  record
) {
  const parties = {};

  for (
    const [
      role,
      aliases,
    ]
    of [
      [
        "buyer",
        [
          "buyer",
        ],
      ],
      [
        "seller",
        [
          "seller",
        ],
      ],
      [
        "tenant",
        [
          "tenant",
        ],
      ],
      [
        "landlord",
        [
          "landlord",
        ],
      ],
    ]
  ) {
    const value =
      normalizeText(
        pickValue(
          record,
          aliases
        )
      );

    if (
      value
    ) {
      parties[
        role
      ] = value;
    }
  }

  return parties;
}


function collectComparableTransactions(
  tables,
  rejected,
  contract,
  comparableObservations,
  comparableMeta,
  assetByAddress
) {
  let ordinal = 0;

  for (
    const observation
    of comparableObservations
  ) {
    ordinal += 1;

    const documentId =
      observation
        .sourceDocumentId
      ?? comparableMeta
        .documentIdByPath
        .get(
          observation
            .sourcePath
        )
      ?? deterministicId(
          "SOURCE_DOCUMENT_COMPARABLE",
          observation
            .sourcePath
      );

    const sourceObservation =
      sourceObservationRecord(
        tables,
        rejected,
        contract,
        {
          observation,
          family:
            "COMPARABLE_TRANSACTIONS",
          documentId,
          ordinal:
            observation
              .sourceRecordOrdinal
            ?? ordinal,
          sourcePath:
            observation
              .sourcePath,
          sourceSha256:
            observation
              .sourceSha256,
        }
      );

    const addressKey =
      normalizedAddressKey(
        observation
      );

    const asset =
      addressKey
        ? (
            assetByAddress.get(
              addressKey
            )
            ?? null
          )
        : null;

    const type =
      transactionType(
        observation
      );

    const date =
      transactionDate(
        observation
      );

    const transactionId =
      deterministicId(
        "TRANSACTION",
        observation
          .sourceSha256,
        observation
          .sourceSheet,
        observation
          .sourceRowNumber,
        observation
          .fields
      );

    pushBuiltRow(
      tables,
      rejected,
      contract,
      "transaction_history",
      {
        transaction_id:
          transactionId,
        asset_id:
          asset
            ?.assetId
          ?? null,
        transaction_type:
          type,
        type:
          type,
        transaction_date:
          date,
        date:
          date,
        parties:
          explicitTransactionParties(
            observation
          ),
        comp_sf:
          numberOrNull(
            pickValue(
              observation,
              [
                "comp_sf",
                "sf",
                "square_feet",
                "building_sf",
              ]
            )
          ),
        square_feet:
          numberOrNull(
            pickValue(
              observation,
              [
                "comp_sf",
                "sf",
                "square_feet",
                "building_sf",
              ]
            )
          ),
        price:
          numberOrNull(
            pickValue(
              observation,
              [
                "price",
                "sale_price",
              ]
            )
          ),
        rate:
          pickValue(
            observation,
            [
              "rate",
              "lease_rate",
            ]
          ),
        tenant:
          normalizeText(
            pickValue(
              observation,
              [
                "tenant",
              ]
            )
          ),
        landlord:
          normalizeText(
            pickValue(
              observation,
              [
                "landlord",
              ]
            )
          ),
        buyer:
          normalizeText(
            pickValue(
              observation,
              [
                "buyer",
              ]
            )
          ),
        seller:
          normalizeText(
            pickValue(
              observation,
              [
                "seller",
              ]
            )
          ),
        source_observation_id:
          sourceObservation
            .observationId,
        source_document_id:
          documentId,
        payload:
          observation,
      },
      {
        transactionId,
        sourcePath:
          observation
            .sourcePath,
      }
    );
  }
}

function collectReferenceEvidence(
  tables,
  rejected,
  contract,
  referenceObservations,
  referenceMeta,
  assetByAddress
) {
  let ordinal = 0;

  for (
    const observation
    of referenceObservations
  ) {
    ordinal += 1;

    const documentId =
      observation
        .sourceDocumentId
      ?? referenceMeta
        .documentIdByPath
        .get(
          observation
            .sourcePath
        )
      ?? deterministicId(
          "SOURCE_DOCUMENT_REFERENCE",
          observation
            .sourcePath
      );

    const sourceObservation =
      sourceObservationRecord(
        tables,
        rejected,
        contract,
        {
          observation,
          family:
            "REFERENCE_AND_SPATIAL",
          documentId,
          ordinal:
            observation
              .sourceRecordOrdinal
            ?? ordinal,
          sourcePath:
            observation
              .sourcePath,
          sourceSha256:
            observation
              .sourceSha256,
        }
      );

    const subtype =
      observation
        .referenceSubtype
      ?? "REFERENCE";

    const apn =
      normalizeText(
        pickValue(
          observation,
          [
            "apn",
            "parcel_number",
            "parcel_id",
            "assessor_parcel_number",
          ]
        )
      );

    if (apn) {
      const parcelId =
        deterministicId(
          "PARCEL",
          apn
        );

      const parcelRow =
        pushBuiltRow(
          tables,
          rejected,
          contract,
          "parcel",
          {
            parcel_id:
              parcelId,
            apn:
              apn,
            parcel_number:
              apn,
            assessor_parcel_number:
              apn,
            source_observation_id:
              sourceObservation
                .observationId,
          },
          {
            parcelId,
            apn,
          }
        );

      const addressKey =
        normalizedAddressKey(
          observation
        );

      const asset =
        addressKey
          ? (
              assetByAddress.get(
                addressKey
              )
              ?? null
            )
          : null;

      if (
        parcelRow
        && asset
      ) {
        const edgeId =
          deterministicId(
            "ASSET_PARCEL_EDGE",
            asset.assetId,
            parcelId
          );

        pushBuiltRow(
          tables,
          rejected,
          contract,
          "asset_parcel_edge",
          {
            asset_parcel_edge_id:
              edgeId,
            edge_id:
              edgeId,
            asset_id:
              asset.assetId,
            parcel_id:
              parcelId,
            source_observation_id:
              sourceObservation
                .observationId,
          },
          {
            edgeId,
            assetId:
              asset.assetId,
            parcelId,
          }
        );
      }
    }

    const geometry =
      geometryCandidate(
        observation
      );

    const {
      lat,
      lon,
    } =
      latLon(
        observation
      );

    const hasGeometry =
      geometry !== null;

    if (
      hasGeometry
    ) {
      const featureId =
        deterministicId(
          "SPATIAL_FEATURE",
          observation
            .sourcePath,
          observation
            .sourceArchiveMember
            ?? null,
          observation
            .sourceRecordOrdinal
            ?? ordinal,
          geometry,
          lat,
          lon
        );

      pushBuiltRow(
        tables,
        rejected,
        contract,
        "spatial_feature",
        {
          spatial_feature_id:
            featureId,
          feature_id:
            featureId,
          feature_type:
            subtype,
          spatial_type:
            subtype,
          name:
            normalizeText(
              observation.name
              ?? pickValue(
                  observation,
                  [
                    "name",
                    "facility",
                    "location",
                  ]
                )
            ),
          geometry:
            geometry,
          geom:
            geometry,
          latitude:
            lat,
          longitude:
            lon,
          srid:
            4326,
          source_observation_id:
            sourceObservation
              .observationId,
          source_document_id:
            observation
              .sourceDocumentId,
          attributes:
            observation[
              Symbol.for(
                "SCIIP_SOURCE_NATIVE_ATTRIBUTES"
              )
            ]
            ?? observation
              .fields
            ?? {},
          properties:
            observation
              .fields
            ?? {},
          payload:
            observation,
        },
        {
          featureId,
          subtype,
        }
      );
    }
  }
}

export function extractForeignKeysFromSchemaSql(
  schemaSql
) {
  const tables = {};

  const createPattern =
    /CREATE\s+TABLE\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*?)\n\);/gi;

  for (
    const match
    of schemaSql.matchAll(
      createPattern
    )
  ) {
    tables[
      match[1]
    ] =
      match[2];
  }

  const foreignKeys = [];

  for (
    const [
      table,
      body,
    ]
    of Object.entries(
      tables
    )
  ) {
    const inline =
      /(?:^|\n)\s*([A-Za-z_][A-Za-z0-9_]*)\s+[^,\n]*?\bREFERENCES\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/gi;

    for (
      const match
      of body.matchAll(
        inline
      )
    ) {
      foreignKeys.push({
        sourceTable:
          table,
        sourceColumns:[
          match[1],
        ],
        targetTable:
          match[2],
        targetColumns:[
          match[3],
        ],
      });
    }

    const tableLevel =
      /FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]+)\)/gi;

    for (
      const match
      of body.matchAll(
        tableLevel
      )
    ) {
      foreignKeys.push({
        sourceTable:
          table,
        sourceColumns:
          match[1]
            .split(",")
            .map(
              value =>
                value.trim()
            ),
        targetTable:
          match[2],
        targetColumns:
          match[3]
            .split(",")
            .map(
              value =>
                value.trim()
            ),
      });
    }
  }

  const unique =
    new Map();

  for (
    const fk
    of foreignKeys
  ) {
    unique.set(
      canonicalJson(
        fk
      ),
      fk
    );
  }

  return [
    ...unique.values(),
  ];
}

export function validateForeignKeysInMemory(
  tables,
  foreignKeys
) {
  const orphans = [];

  for (
    const fk
    of foreignKeys
  ) {
    const childRows =
      tables[
        fk.sourceTable
      ]
      ?? [];

    const parentRows =
      tables[
        fk.targetTable
      ]
      ?? [];

    const parentKeys =
      new Set(
        parentRows.map(
          row =>
            canonicalJson(
              fk.targetColumns.map(
                column =>
                  row[
                    column
                  ]
              )
            )
        )
      );

    for (
      let index = 0;
      index < childRows.length;
      index += 1
    ) {
      const row =
        childRows[index];

      const values =
        fk.sourceColumns.map(
          column =>
            row[
              column
            ]
        );

      if (
        values.some(
          value =>
            value === null
            || value === undefined
            || value === ""
        )
      ) {
        continue;
      }

      const key =
        canonicalJson(
          values
        );

      if (
        !parentKeys.has(
          key
        )
      ) {
        orphans.push({
          sourceTable:
            fk.sourceTable,
          sourceColumns:
            fk.sourceColumns,
          sourceRowIndex:
            index,
          values,
          targetTable:
            fk.targetTable,
          targetColumns:
            fk.targetColumns,
        });
      }
    }
  }

  return {
    foreignKeyCount:
      foreignKeys.length,
    orphanCount:
      orphans.length,
    orphans,
    valid:
      orphans.length
      === 0,
  };
}


export function extractRelationalKeysFromSchemaSql(
  schemaSql
) {
  const tableBodies = {};

  const createPattern =
    /CREATE\s+TABLE\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*?)\n\);/gi;

  for (
    const match
    of schemaSql.matchAll(
      createPattern
    )
  ) {
    tableBodies[
      match[1]
    ] =
      match[2];
  }

  const keys = [];

  for (
    const [
      table,
      body,
    ]
    of Object.entries(
      tableBodies
    )
  ) {
    const inlinePrimary =
      /(?:^|\n)\s*([A-Za-z_][A-Za-z0-9_]*)\s+[^,\n]*?\bPRIMARY\s+KEY\b/gi;

    for (
      const match
      of body.matchAll(
        inlinePrimary
      )
    ) {
      keys.push({
        table,
        type:
          "PRIMARY_KEY",
        columns:[
          match[1],
        ],
      });
    }

    const tablePrimary =
      /PRIMARY\s+KEY\s*\(([^)]+)\)/gi;

    for (
      const match
      of body.matchAll(
        tablePrimary
      )
    ) {
      keys.push({
        table,
        type:
          "PRIMARY_KEY",
        columns:
          match[1]
            .split(",")
            .map(
              value =>
                value.trim()
            ),
      });
    }

    const inlineUnique =
      /(?:^|\n)\s*([A-Za-z_][A-Za-z0-9_]*)\s+[^,\n]*?\bUNIQUE\b/gi;

    for (
      const match
      of body.matchAll(
        inlineUnique
      )
    ) {
      keys.push({
        table,
        type:
          "UNIQUE",
        columns:[
          match[1],
        ],
      });
    }

    const tableUnique =
      /(?:CONSTRAINT\s+[A-Za-z_][A-Za-z0-9_]*\s+)?UNIQUE\s*\(([^)]+)\)/gi;

    for (
      const match
      of body.matchAll(
        tableUnique
      )
    ) {
      keys.push({
        table,
        type:
          "UNIQUE",
        columns:
          match[1]
            .split(",")
            .map(
              value =>
                value.trim()
            ),
      });
    }
  }

  const unique =
    new Map();

  for (
    const key
    of keys
  ) {
    unique.set(
      canonicalJson(
        key
      ),
      key
    );
  }

  return [
    ...unique.values(),
  ];
}


export function validateRelationalKeysInMemory(
  tables,
  relationalKeys
) {
  const collisions = [];

  for (
    const key
    of relationalKeys
  ) {
    const rows =
      tables[
        key.table
      ]
      ?? [];

    const seen =
      new Map();

    for (
      let index = 0;
      index < rows.length;
      index += 1
    ) {
      const row =
        rows[
          index
        ];

      const values =
        key.columns.map(
          column =>
            row[
              column
            ]
        );

      if (
        key.type
        === "UNIQUE"
        && values.some(
          value =>
            value === null
            || value === undefined
        )
      ) {
        continue;
      }

      const canonical =
        canonicalJson(
          values
        );

      if (
        seen.has(
          canonical
        )
      ) {
        collisions.push({
          table:
            key.table,

          type:
            key.type,

          columns:
            key.columns,

          values,

          firstRowIndex:
            seen.get(
              canonical
            ),

          duplicateRowIndex:
            index,
        });
      }

      else {
        seen.set(
          canonical,
          index
        );
      }
    }
  }

  const primaryKeyCount =
    relationalKeys.filter(
      key =>
        key.type
        === "PRIMARY_KEY"
    ).length;

  return {
    primaryKeyCount,

    relationalKeyCount:
      relationalKeys.length,

    collisionCount:
      collisions.length,

    collisions,

    valid:
      collisions.length
      === 0,
  };
}


export function buildPostgresRowBundle({
  documents,
  airRows,
  airMetaByRecord,
  availabilityRows,
  availabilityMetaByRecord,
  historicalObservations,
  historicalEvents,
  historicalMetaByRecord,
  forwardObservations,
  forwardEvents,
  forwardMetaByRecord,
  comparableObservations,
  referenceObservations,
  schemaSql,
} = {}) {
  const contract =
    loadSchemaContract();

  const tables =
    initializeTables(
      contract
    );

  const rejected =
    initializeRejected(
      contract
    );

  const documentIdByPath =
    new Map();

  for (
    const document
    of documents
  ) {
    const candidates =
      sourceDocumentCandidates(
        document
      );

    const row =
      pushBuiltRow(
        tables,
        rejected,
        contract,
        "source_document",
        candidates,
        {
          family:
            document.family,
          relativePath:
            document.relativePath,
        }
      );

    document
      .sourceDocumentId =
        candidates
          .source_document_id;

    documentIdByPath.set(
      document.relativePath,
      candidates
        .source_document_id
    );

    documentIdByPath.set(
      document.absolutePath,
      candidates
        .source_document_id
    );

    if (!row) {
      continue;
    }
  }

  const {
    assetByAddress,
  } =
    collectAirFoundation(
      tables,
      rejected,
      contract,
      airRows,
      airMetaByRecord
    );

  const {
    listingByKey,
    listingStateById,
  } =
    collectAvailability(
      tables,
      rejected,
      contract,
      availabilityRows,
      availabilityMetaByRecord,
      assetByAddress
    );

  collectSupersheet(
    tables,
    rejected,
    contract,
    {
      observations:
        historicalObservations,
      events:
        historicalEvents,
      sourceFamily:
        "SUPERSHEET_HISTORY",
      sourceMetaByRecord:
        historicalMetaByRecord,
      listingByKey,
      listingStateById,
    }
  );

  collectSupersheet(
    tables,
    rejected,
    contract,
    {
      observations:
        forwardObservations,
      events:
        forwardEvents,
      sourceFamily:
        "SUPERSHEET_FORWARD_2026_10_15",
      sourceMetaByRecord:
        forwardMetaByRecord,
      listingByKey,
      listingStateById,
    }
  );

  collectComparableTransactions(
    tables,
    rejected,
    contract,
    comparableObservations,
    {
      documentIdByPath,
    },
    assetByAddress
  );

  collectReferenceEvidence(
    tables,
    rejected,
    contract,
    referenceObservations,
    {
      documentIdByPath,
    },
    assetByAddress
  );

  for (
    const [
      listingId,
      state,
    ]
    of listingStateById
  ) {
    pushBuiltRow(
      tables,
      rejected,
      contract,
      "listing_state",
      {
        ...state,
        listing_id:
          listingId,
      },
      {
        listingId,
      }
    );
  }

  for (
    const table
    of Object.keys(
      tables
    )
  ) {
    tables[
      table
    ] =
      deduplicateRows(
        tables[
          table
        ]
      );
  }

  const projectionDiagnostics =
    applyGovernedProjectionPolicies(
      tables,
      rejected,
      referenceObservations
    );

  for (
    const table
    of Object.keys(
      tables
    )
  ) {
    tables[
      table
    ] =
      sortRows(
        deduplicateRows(
          tables[
            table
          ]
        )
      );
  }

  const namedColumnBindings =
    Object.fromEntries(
      Object.keys(
        contract.tables
      )
        .sort()
        .map(
          table => [
            table,
            contractColumns(
              contract,
              table
            ),
          ]
        )
    );

  const namedColumnBindingExact =
    Object.fromEntries(
      Object.entries(
        namedColumnBindings
      )
        .map(
          ([
            table,
            columns,
          ]) => [
            table,
            canonicalJson(
              columns
            )
            === canonicalJson(
              contractColumns(
                contract,
                table
              )
            ),
          ]
        )
    );

  const foreignKeys =
    extractForeignKeysFromSchemaSql(
      schemaSql
    );

  const fkValidation =
    validateForeignKeysInMemory(
      tables,
      foreignKeys
    );

  const relationalKeys =
    extractRelationalKeysFromSchemaSql(
      schemaSql
    );

  const keyValidation =
    validateRelationalKeysInMemory(
      tables,
      relationalKeys
    );

  const rowCounts =
    Object.fromEntries(
      Object.entries(
        tables
      )
        .map(
          ([
            table,
            rows,
          ]) => [
            table,
            rows.length,
          ]
        )
    );

  const rejectionCounts =
    Object.fromEntries(
      Object.entries(
        rejected
      )
        .map(
          ([
            table,
            rows,
          ]) => [
            table,
            rows.length,
          ]
        )
    );

  const bindingCoverage =
    Object.fromEntries(
      Object.keys(
        contract.tables
      )
        .sort()
        .map(
          table => [
            table,
            {
              implemented:
                true,
              namedColumns:
                namedColumnBindings[
                  table
                ],
              exact:
                namedColumnBindingExact[
                  table
                ],
              rowCount:
                rowCounts[
                  table
                ],
              rejectedCount:
                rejectionCounts[
                  table
                ],
            },
          ]
        )
    );

  const bundleHash =
    sha256Hex(
      canonicalJson({
        namedColumnBindings,
        rowCounts,
        rejectionCounts,
        projectionDiagnostics,
        tables,
      })
    );

  return {
    tables,
    rejected,
    rowCounts,
    rejectionCounts,
    namedColumnBindings,
    namedColumnBindingExact,
    bindingCoverage,
    foreignKeys,
    fkValidation,
    relationalKeys,
    keyValidation,
    projectionDiagnostics,
    governedDeferrals:
      projectionDiagnostics
        .deferrals,
    bundleHash,
    databaseWrites:
      false,
  };
}
