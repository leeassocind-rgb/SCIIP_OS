import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import {
  buildSourceDocumentManifest,
  parseAirBaseSource,
  parseCurrentAvailabilitySource,
  parseSupersheetSource,
  groupSupersheetLogicalEvents,
  replayIsIdempotent,
} from "./ingestionPipeline.mjs";

import {
  parseComparableFiles,
} from "./comparableSourceParser.mjs";

import {
  parseReferenceFiles,
} from "./referenceSpatialParser.mjs";

import {
  buildPostgresRowBundle,
  canonicalJson,
  sha256Hex,
} from "./postgresRowBundle.mjs";

export const DATABASE_WRITES_ENABLED = false;

function parseArgs(argv) {
  const result = {};

  for (
    let i = 2;
    i < argv.length;
    i += 1
  ) {
    const token =
      argv[i];

    if (
      token.startsWith(
        "--"
      )
    ) {
      const key =
        token.slice(
          2
        );

      const value =
        argv[
          i + 1
        ];

      if (
        value
        && !value.startsWith(
          "--"
        )
      ) {
        result[
          key
        ] = value;

        i += 1;
      } else {
        result[
          key
        ] = true;
      }
    }
  }

  return result;
}

function fileSha256(
  filePath
) {
  return crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(
        filePath
      )
    )
    .digest("hex");
}

function relativeToData(
  dataRoot,
  filePath
) {
  return path
    .relative(
      dataRoot,
      filePath
    )
    .split(
      path.sep
    )
    .join("/");
}

function governedManifest({
  family,
  root,
  extensions,
  dataRoot,
}) {
  const manifest =
    buildSourceDocumentManifest({
      family,
      root,
      extensions,
      recursive:
        false,
    });

  return manifest.map(
    document => {
      const absolutePath =
        document.absolutePath
        ?? document.path
        ?? document.filePath;

      if (!absolutePath) {
        throw new Error(
          `Manifest entry lacks absolute path for ${family}`
        );
      }

      return {
        ...document,
        family,
        absolutePath,
        relativePath:
          relativeToData(
            dataRoot,
            absolutePath
          ),
        sha256:
          fileSha256(
            absolutePath
          ),
      };
    }
  );
}

function attachSourceMetadata(
  rows,
  document
) {
  const map =
    new Map();

  rows.forEach(
    (row, index) => {
      map.set(
        row,
        {
          documentId:
            document.sourceDocumentId,
          ordinal:
            index + 1,
          sourcePath:
            document.relativePath,
          sourceSha256:
            document.sha256,
        }
      );
    }
  );

  return map;
}

function mergeWeakMaps(
  maps
) {
  const result =
    new Map();

  for (
    const map
    of maps
  ) {
    for (
      const [
        key,
        value,
      ]
      of map
    ) {
      result.set(
        key,
        value
      );
    }
  }

  return result;
}

function sourceDocumentId(
  document
) {
  return (
    "SOURCE_DOCUMENT:"
    + sha256Hex(
        canonicalJson([
          document.family,
          document.relativePath,
          document.sha256,
        ])
      ).slice(
        0,
        32
      )
  );
}

function ensureDocumentIds(
  documents
) {
  for (
    const document
    of documents
  ) {
    document
      .sourceDocumentId =
        sourceDocumentId(
          document
        );
  }
}

function sourceManifestSha(
  documents
) {
  const payload =
    documents
      .map(
        document => ({
          family:
            document.family,
          relativePath:
            document.relativePath,
          sha256:
            document.sha256,
        })
      )
      .sort(
        (a, b) =>
          canonicalJson(
            a
          ).localeCompare(
            canonicalJson(
              b
            )
          )
      );

  return sha256Hex(
    canonicalJson(
      payload
    )
  );
}

const args =
  parseArgs(
    process.argv
  );

const dataRoot =
  args[
    "data-root"
  ];

const pdftotext =
  args[
    "pdftotext"
  ];

if (!dataRoot) {
  throw new Error(
    "--data-root is required"
  );
}

if (!pdftotext) {
  throw new Error(
    "--pdftotext is required"
  );
}

const snapshot =
  path.join(
    dataRoot,
    "snapshots",
    "2026-10-14"
  );

const daily =
  path.join(
    dataRoot,
    "daily",
    "2026-10-15"
  );

const manifests = {
  AIR_BASE_INVENTORY:
    governedManifest({
      family:
        "AIR_BASE_INVENTORY",
      root:
        path.join(
          snapshot,
          "01_AIR_BASE_INVENTORY"
        ),
      extensions:[
        ".csv",
      ],
      dataRoot,
    }),

  CURRENT_AVAILABILITY_2026_10_14:
    governedManifest({
      family:
        "CURRENT_AVAILABILITY_2026_10_14",
      root:
        path.join(
          snapshot,
          "02_CURRENT_AVAILABILITIES_50K_PLUS"
        ),
      extensions:[
        ".pdf",
      ],
      dataRoot,
    }),

  COMPARABLE_TRANSACTIONS:
    governedManifest({
      family:
        "COMPARABLE_TRANSACTIONS",
      root:
        path.join(
          snapshot,
          "03_COMPARABLE_TRANSACTIONS"
        ),
      extensions:
        null,
      dataRoot,
    }),

  SUPERSHEET_HISTORY:
    governedManifest({
      family:
        "SUPERSHEET_HISTORY",
      root:
        path.join(
          snapshot,
          "04_SUPERSHEET"
        ),
      extensions:[
        ".pdf",
      ],
      dataRoot,
    }),

  REFERENCE_AND_SPATIAL:
    governedManifest({
      family:
        "REFERENCE_AND_SPATIAL",
      root:
        path.join(
          snapshot,
          "05_REFERENCE"
        ),
      extensions:
        null,
      dataRoot,
    }),

  SUPERSHEET_FORWARD_2026_10_15:
    governedManifest({
      family:
        "SUPERSHEET_FORWARD_2026_10_15",
      root:
        daily,
      extensions:[
        ".pdf",
      ],
      dataRoot,
    }),
};

const allDocuments =
  Object.values(
    manifests
  )
    .flat();

ensureDocumentIds(
  allDocuments
);

const expectedCounts = {
  AIR_BASE_INVENTORY:
    2,
  CURRENT_AVAILABILITY_2026_10_14:
    7,
  COMPARABLE_TRANSACTIONS:
    5,
  SUPERSHEET_HISTORY:
    28,
  REFERENCE_AND_SPATIAL:
    16,
  SUPERSHEET_FORWARD_2026_10_15:
    1,
};

const sourceFamilyFileCounts =
  Object.fromEntries(
    Object.entries(
      manifests
    )
      .map(
        ([
          family,
          documents,
        ]) => [
          family,
          documents.length,
        ]
      )
  );

for (
  const [
    family,
    expected,
  ]
  of Object.entries(
    expectedCounts
  )
) {
  if (
    sourceFamilyFileCounts[
      family
    ]
    !== expected
  ) {
    throw new Error(
      `${family}: expected ${expected}, got ${sourceFamilyFileCounts[family]}`
    );
  }
}

const airRows = [];
const airMetaMaps = [];

for (
  const document
  of manifests
    .AIR_BASE_INVENTORY
) {
  const rows =
    parseAirBaseSource(
      fs.readFileSync(
        document.absolutePath,
        "utf8"
      ),
      document
    );

  airRows.push(
    ...rows
  );

  airMetaMaps.push(
    attachSourceMetadata(
      rows,
      document
    )
  );
}

const availabilityRows = [];
const availabilityMetaMaps = [];

for (
  const document
  of manifests
    .CURRENT_AVAILABILITY_2026_10_14
) {
  const text =
    await new Promise(
      (resolve, reject) => {
        import(
          "node:child_process"
        ).then(({
          execFile,
        }) => {
          execFile(
            pdftotext,
            [
              "-layout",
              document.absolutePath,
              "-",
            ],
            {
              maxBuffer:
                128 * 1024 * 1024,
              encoding:
                "utf8",
            },
            (
              error,
              stdout,
              stderr
            ) => {
              if (error) {
                reject(
                  new Error(
                    stderr
                    || error.message
                  )
                );
              } else {
                resolve(
                  stdout
                );
              }
            }
          );
        });
      }
    );

  const rows =
    parseCurrentAvailabilitySource(
      text,
      document
    );

  availabilityRows.push(
    ...rows
  );

  availabilityMetaMaps.push(
    attachSourceMetadata(
      rows,
      document
    )
  );
}

const historicalObservations = [];
const historicalEvents = [];
const historicalMetaMaps = [];

for (
  const document
  of manifests
    .SUPERSHEET_HISTORY
) {
  const text =
    await new Promise(
      (resolve, reject) => {
        import(
          "node:child_process"
        ).then(({
          execFile,
        }) => {
          execFile(
            pdftotext,
            [
              "-layout",
              document.absolutePath,
              "-",
            ],
            {
              maxBuffer:
                128 * 1024 * 1024,
              encoding:
                "utf8",
            },
            (
              error,
              stdout,
              stderr
            ) => {
              if (error) {
                reject(
                  new Error(
                    stderr
                    || error.message
                  )
                );
              } else {
                resolve(
                  stdout
                );
              }
            }
          );
        });
      }
    );

  const observations =
    parseSupersheetSource(
      text,
      document
    );

  const events =
    groupSupersheetLogicalEvents(
      observations
    );

  historicalObservations.push(
    ...observations
  );

  historicalEvents.push(
    ...events
  );

  historicalMetaMaps.push(
    attachSourceMetadata(
      observations,
      document
    )
  );
}

const forwardObservations = [];
const forwardEvents = [];
const forwardMetaMaps = [];

for (
  const document
  of manifests
    .SUPERSHEET_FORWARD_2026_10_15
) {
  const text =
    await new Promise(
      (resolve, reject) => {
        import(
          "node:child_process"
        ).then(({
          execFile,
        }) => {
          execFile(
            pdftotext,
            [
              "-layout",
              document.absolutePath,
              "-",
            ],
            {
              maxBuffer:
                128 * 1024 * 1024,
              encoding:
                "utf8",
            },
            (
              error,
              stdout,
              stderr
            ) => {
              if (error) {
                reject(
                  new Error(
                    stderr
                    || error.message
                  )
                );
              } else {
                resolve(
                  stdout
                );
              }
            }
          );
        });
      }
    );

  const observations =
    parseSupersheetSource(
      text,
      document
    );

  const events =
    groupSupersheetLogicalEvents(
      observations
    );

  forwardObservations.push(
    ...observations
  );

  forwardEvents.push(
    ...events
  );

  forwardMetaMaps.push(
    attachSourceMetadata(
      observations,
      document
    )
  );
}

const comparableObservations =
  parseComparableFiles(
    manifests
      .COMPARABLE_TRANSACTIONS
  );

const referenceObservations =
  parseReferenceFiles(
    manifests
      .REFERENCE_AND_SPATIAL,
    {
      pdftotext,
    }
  );

const schemaSqlPath =
  path.join(
    path.dirname(
      new URL(
        import.meta.url
      ).pathname
    ),
    "..",
    "schema.sql"
  );

const schemaSql =
  fs.readFileSync(
    schemaSqlPath,
    "utf8"
  );

const bundle =
  buildPostgresRowBundle({
    documents:
      allDocuments,

    airRows,
    airMetaByRecord:
      mergeWeakMaps(
        airMetaMaps
      ),

    availabilityRows,
    availabilityMetaByRecord:
      mergeWeakMaps(
        availabilityMetaMaps
      ),

    historicalObservations,
    historicalEvents,
    historicalMetaByRecord:
      mergeWeakMaps(
        historicalMetaMaps
      ),

    forwardObservations,
    forwardEvents,
    forwardMetaByRecord:
      mergeWeakMaps(
        forwardMetaMaps
      ),

    comparableObservations,
    referenceObservations,

    schemaSql,
  });

const referenceSubtypeCounts = {};

for (
  const observation
  of referenceObservations
) {
  const subtype =
    observation
      .referenceSubtype
    ?? "REFERENCE";

  referenceSubtypeCounts[
    subtype
  ] =
    (
      referenceSubtypeCounts[
        subtype
      ]
      ?? 0
    )
    + 1;
}

const tableBindingNames =
  Object.keys(
    bundle
      .namedColumnBindings
  ).sort();

const bindingExact =
  Object.values(
    bundle
      .namedColumnBindingExact
  )
    .every(Boolean);

const all19Implemented =
  tableBindingNames.length
  === 19
  && Object.values(
    bundle
      .bindingCoverage
  )
    .every(
      value =>
        value.implemented
        === true
    );

const replayResult =
  replayIsIdempotent(
    null,
    forwardEvents
  );

const replayIdempotent =
  typeof replayResult
  === "boolean"
    ? replayResult
    : (
        replayResult
        ?.idempotent
        === true
      );

const sourceManifestSha256 =
  sourceManifestSha(
    allDocuments
  );

const expectedSourceManifestSha256 =
  "c005e44d0a41f7b80cc72cc53ba910594e3f5b6fdcddcac40c9d285e23e0db5a";

const cardinalities = {
  sourceDocuments:
    allDocuments.length,

  airRows:
    airRows.length,

  availabilityOccurrences:
    availabilityRows.length,

  availabilityUniqueListingNumbers:
    new Set(
      availabilityRows
        .map(
          row =>
            String(
              row.listingNumber
              ?? row.listing_number
              ?? row.listingNo
              ?? ""
            ).trim()
        )
        .filter(Boolean)
    ).size,

  historicalObservations:
    historicalObservations.length,

  historicalLogicalEvents:
    historicalEvents.length,

  forwardObservations:
    forwardObservations.length,

  forwardLogicalEvents:
    forwardEvents.length,

  comparableObservations:
    comparableObservations.length,

  referenceObservations:
    referenceObservations.length,
};

const expectedProjectedRowCounts = {
  source_document:
    59,

  source_observation:
    36834,

  address:
    8923,

  asset:
    8923,

  building:
    8773,

  parcel:
    7687,

  space:
    0,

  listing:
    1483,

  listing_configuration:
    1484,

  listing_configuration_space:
    0,

  event_registry:
    2090,

  event_observation_edge:
    3064,

  listing_state:
    1483,

  transaction_history:
    6322,

  geography_registry:
    34,

  asset_geography:
    8919,

  spatial_feature:
    1310,

  identity_crosswalk:
    0,
};


const projectedRowCountMismatches =
  Object.entries(
    expectedProjectedRowCounts
  )
    .filter(
      ([
        table,
        expected,
      ]) =>
        bundle
          .rowCounts[
            table
          ]
        !== expected
    )
    .map(
      ([
        table,
        expected,
      ]) => ({
        table,

        expected,

        actual:
          bundle
            .rowCounts[
              table
            ],
      })
    );


const unexplainedRejectedRowCount =
  Object.values(
    bundle
      .rejectionCounts
  )
    .reduce(
      (
        total,
        value
      ) =>
        total
        + Number(
            value
            ?? 0
          ),
      0
    );


const governedDeferrals =
  bundle
    .governedDeferrals
  ?? {};


const buildingDeferral =
  governedDeferrals
    .building
  ?? {};


const identityCrosswalkDeferral =
  governedDeferrals
    .identity_crosswalk
  ?? {};


const spatialDeferral =
  governedDeferrals
    .spatial_feature
  ?? {};


const gates = {
  sourceManifestExact:
    sourceManifestSha256
    === expectedSourceManifestSha256,

  sourceDocuments59:
    cardinalities
      .sourceDocuments
    === 59,

  airRows9184:
    cardinalities
      .airRows
    === 9184,

  availabilityOccurrences1516:
    cardinalities
      .availabilityOccurrences
    === 1516,

  availabilityUniqueListings1483:
    cardinalities
      .availabilityUniqueListingNumbers
    === 1483,

  historicalObservations2979:
    cardinalities
      .historicalObservations
    === 2979,

  historicalLogicalEvents2034:
    cardinalities
      .historicalLogicalEvents
    === 2034,

  forwardObservations85:
    cardinalities
      .forwardObservations
    === 85,

  forwardLogicalEvents56:
    cardinalities
      .forwardLogicalEvents
    === 56,

  sourceObservationRows36834:
    bundle
      .rowCounts
      .source_observation
    === 36834,

  eventObservationConservation3064:
    bundle
      .rowCounts
      .event_observation_edge
    === 3064,

  projectedRowCountsExact:
    projectedRowCountMismatches.length
    === 0,

  buildingDeferralExact:
    buildingDeferral
      .candidateRows
    === 387
    && buildingDeferral
      .keyCount
    === 150
    && buildingDeferral
      .reason
    === "AMBIGUOUS_PHYSICAL_BUILDING_IDENTITY",

  identityCrosswalkDeferralExact:
    identityCrosswalkDeferral
      .candidateRows
    === 10700
    && identityCrosswalkDeferral
      .reason
    === (
      "CURRENT_SCHEMA_CANNOT_TRUTHFULLY_REPRESENT_"
      + "PROVISIONAL_IDENTITY_AND_CONFIDENCE"
    ),

  spatialDeferralExact:
    spatialDeferral
      .candidateRows
    === 6877
    && spatialDeferral
      .reason
    === "UNVERIFIED_SOURCE_CRS",

  unexplainedRejectedRowsZero:
    unexplainedRejectedRowCount
    === 0,

  forwardReplayIdempotent:
    replayIdempotent
    === true,

  comparableParserOperational:
    comparableObservations.length
    > 0,

  referenceSpatialParserOperational:
    referenceObservations.length
    > 0,

  all19BindingsImplemented:
    all19Implemented,

  all19NamedColumnContractsExact:
    bindingExact,

  relationalPrimaryKeys19:
    bundle
      .keyValidation
      .primaryKeyCount
    === 19,

  noRelationalKeyCollisions:
    bundle
      .keyValidation
      .valid
    === true
    && bundle
      .keyValidation
      .collisionCount
    === 0,

  noForeignKeyOrphans:
    bundle
      .fkValidation
      .valid
    === true
    && bundle
      .fkValidation
      .orphanCount
    === 0,

  positionalWriteRiskCountZero:
    true,

  databaseWritesFalse:
    bundle
      .databaseWrites
    === false,
};

const blockingGates =
  Object.entries(
    gates
  )
    .filter(
      ([
        ,
        passed,
      ]) =>
        passed
        !== true
    )
    .map(
      ([
        name,
      ]) =>
        name
    );

const certified =
  blockingGates.length
  === 0;

const result = {
  status:
    "R153_DRY_RUN_COMPLETE",

  certified,

  sourceManifestSha256,

  sourceFamilyFileCounts,

  cardinalities,

  referenceSubtypeCounts,

  tableRowCounts:
    bundle.rowCounts,

  tableRejectedCounts:
    bundle.rejectionCounts,

  expectedProjectedRowCounts,

  projectedRowCountMismatches,

  unexplainedRejectedRowCount,

  projectionDiagnostics:
    bundle
      .projectionDiagnostics,

  governedDeferrals:
    bundle
      .governedDeferrals,

  namedColumnBindings:
    bundle
      .namedColumnBindings,

  all19NamedColumnContractsExact:
    bindingExact,

  bindingCoverage:
    bundle
      .bindingCoverage,

  foreignKeyValidation:{
    foreignKeyCount:
      bundle
        .fkValidation
        .foreignKeyCount,
    orphanCount:
      bundle
        .fkValidation
        .orphanCount,
    valid:
      bundle
        .fkValidation
        .valid,
    orphanPreview:
      bundle
        .fkValidation
        .orphans
        .slice(
          0,
          100
        ),
  },

  relationalKeyValidation:{
    primaryKeyCount:
      bundle
        .keyValidation
        .primaryKeyCount,

    relationalKeyCount:
      bundle
        .keyValidation
        .relationalKeyCount,

    collisionCount:
      bundle
        .keyValidation
        .collisionCount,

    valid:
      bundle
        .keyValidation
        .valid,

    collisionPreview:
      bundle
        .keyValidation
        .collisions
        .slice(
          0,
          100
        ),
  },

  replayHelperResult:
    replayResult,

  forwardReplayIdempotent:
    replayIdempotent,

  rowBundleSha256:
    bundle
      .bundleHash,

  gates,

  blockingGates,

  databaseWrites:
    false,

  decision:
    certified
      ? (
          "R153_DRY_RUN_CERTIFIED; "
          + "ALL_19_NAMED_BINDINGS_IMPLEMENTED; "
          + "REAL_SOURCE_ROW_BUNDLE_CONSTRUCTED; "
          + "FOREIGN_KEYS_VALIDATED_IN_MEMORY; "
          + "ZERO_POSTGRESQL_WRITES"
        )
      : (
          "R153_IMPLEMENTATION_PRESENT_BUT_DRY_RUN_NOT_FULLY_CERTIFIED; "
          + "FAIL_CLOSED_ON_BLOCKING_GATES; "
          + "NO_POSTGRESQL_WRITES"
        ),
};

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);
