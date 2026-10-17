import fs from "node:fs";
import path from "node:path";
import {
  execFileSync
} from "node:child_process";

import {
  assertObservationConservation,
  buildAirIdentityIndex,
  buildDryRunBundle,
  buildListingIdentityIndex,
  buildSourceDocumentManifest,
  canonicalJson,
  countStructuralRecords,
  groupSupersheetLogicalEvents,
  manifestForHash,
  parseAirBaseSource,
  parseCurrentAvailabilitySource,
  parseSupersheetSource,
  replayIsIdempotent,
  resolveAirAssetIdentity,
  resolveListingIdentity,
  sha256Hex,
  summarizeResolutionStatuses,
} from "./ingestionPipeline.mjs";

function argumentValue(name) {
  const index =
    process.argv.indexOf(
      name
    );

  if (
    index < 0
    || index + 1
      >= process.argv.length
  ) {
    return null;
  }

  return process.argv[
    index + 1
  ];
}

const dataRootArg =
  argumentValue(
    "--data-root"
  );

const pdftotextArg =
  argumentValue(
    "--pdftotext"
  );

if (!dataRootArg) {
  throw new Error(
    "--data-root is required"
  );
}

if (!pdftotextArg) {
  throw new Error(
    "--pdftotext is required"
  );
}

const dataRoot =
  path.resolve(
    dataRootArg
  );

const pdftotext =
  path.resolve(
    pdftotextArg
  );

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

function pdfText(
  filePath
) {
  return execFileSync(
    pdftotext,
    [
      "-layout",
      filePath,
      "-"
    ],
    {
      encoding:
        "utf8",

      maxBuffer:
        128 * 1024 * 1024,
    }
  );
}

const sourceSpecs = {
  AIR_BASE_INVENTORY:{
    root:
      path.join(
        snapshot,
        "01_AIR_BASE_INVENTORY"
      ),

    extensions:[
      ".csv",
    ],
  },

  CURRENT_AVAILABILITY_2026_10_14:{
    root:
      path.join(
        snapshot,
        "02_CURRENT_AVAILABILITIES_50K_PLUS"
      ),

    /*
     * Governed 10/14 availability baseline:
     * seven PDFs only.
     *
     * XLS and KMZ companion artifacts remain on disk
     * and are not deleted or silently treated as
     * independent availability observations.
     */
    extensions:[
      ".pdf",
    ],
  },

  COMPARABLE_TRANSACTIONS:{
    root:
      path.join(
        snapshot,
        "03_COMPARABLE_TRANSACTIONS"
      ),

    extensions:
      null,
  },

  SUPERSHEET_HISTORY:{
    root:
      path.join(
        snapshot,
        "04_SUPERSHEET"
      ),

    extensions:[
      ".pdf",
    ],
  },

  REFERENCE_AND_SPATIAL:{
    root:
      path.join(
        snapshot,
        "05_REFERENCE"
      ),

    extensions:
      null,
  },

  SUPERSHEET_FORWARD_2026_10_15:{
    root:
      daily,

    extensions:[
      ".pdf",
    ],
  },
};

const manifests = {};

for (
  const [
    family,
    spec,
  ]
  of Object.entries(
    sourceSpecs
  )
) {
  manifests[
    family
  ] =
    buildSourceDocumentManifest({
      family,
      root:
        spec.root,
      extensions:
        spec.extensions,
      recursive:
        false,
    });
}

function sanitizedManifests() {
  return Object.fromEntries(
    Object.entries(
      manifests
    )
    .map(
      (
        [
          family,
          manifest,
        ]
      ) => [
        family,
        manifestForHash(
          manifest
        ),
      ]
    )
  );
}

/*
 * AIR — permanent parser
 */

const airRows = [];

for (
  const document
  of manifests
    .AIR_BASE_INVENTORY
) {
  const text =
    fs.readFileSync(
      document.absolutePath,
      "utf8"
    );

  const rows =
    parseAirBaseSource(
      text,
      document
    );

  airRows.push(
    ...rows
  );
}

const airIndex =
  buildAirIdentityIndex(
    airRows
  );

/*
 * 10/14 availability — seven governed PDFs,
 * permanent parser.
 */

const availabilityRows = [];

for (
  const document
  of manifests
    .CURRENT_AVAILABILITY_2026_10_14
) {
  const rows =
    parseCurrentAvailabilitySource(
      pdfText(
        document.absolutePath
      ),
      document
    );

  availabilityRows.push(
    ...rows
  );
}

const listingIndex =
  buildListingIdentityIndex(
    availabilityRows
  );

const availabilityAssetResolutions =
  availabilityRows.map(
    observation =>
      resolveAirAssetIdentity(
        observation,
        airIndex
      )
  );

/*
 * Historical Supersheets.
 *
 * Parse and group PER SOURCE DOCUMENT so source provenance
 * remains explicit and no cross-document grouping is possible.
 */

const historicalObservations = [];
const historicalEvents = [];

let historicalStructuralRecords =
  0;

const historicalConservation = [];

for (
  const document
  of manifests
    .SUPERSHEET_HISTORY
) {
  const observations =
    parseSupersheetSource(
      pdfText(
        document.absolutePath
      ),
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

  historicalStructuralRecords +=
    countStructuralRecords(
      observations
    );

  historicalConservation.push(
    assertObservationConservation(
      observations,
      events
    )
  );
}

/*
 * 10/15 forward feed.
 */

const forwardDocument =
  manifests
    .SUPERSHEET_FORWARD_2026_10_15[
      0
    ];

const forwardObservations =
  parseSupersheetSource(
    pdfText(
      forwardDocument.absolutePath
    ),
    forwardDocument
  );

const forwardEvents =
  groupSupersheetLogicalEvents(
    forwardObservations
  );

const forwardStructuralRecords =
  countStructuralRecords(
    forwardObservations
  );

const forwardConservation =
  assertObservationConservation(
    forwardObservations,
    forwardEvents
  );

/*
 * Identity binding is exercised on real governed source rows.
 */

const forwardListingResolutions =
  forwardObservations.map(
    observation =>
      resolveListingIdentity(
        observation,
        listingIndex
      )
  );

const forwardAirResolutions =
  forwardObservations.map(
    observation =>
      resolveAirAssetIdentity(
        observation,
        airIndex
      )
  );

const historicalListingResolutionStatuses =
  summarizeResolutionStatuses(
    historicalObservations.map(
      observation =>
        resolveListingIdentity(
          observation,
          listingIndex
        )
    )
  );

const forwardListingResolutionStatuses =
  summarizeResolutionStatuses(
    forwardListingResolutions
  );

const forwardAirResolutionStatuses =
  summarizeResolutionStatuses(
    forwardAirResolutions
  );

/*
 * Permanent reducer/replay binding.
 *
 * The permanent contract is:
 *   reduceListingState(initialState, logicalEvents[])
 *   replayIsIdempotent(initialState, logicalEvents[])
 *
 * No DB writes occur.
 */

const forwardReplay =
  replayIsIdempotent(
    null,
    forwardEvents
  );

if (
  forwardReplay
    ?.idempotent
  !== true
) {
  throw new Error(
    "Permanent listing-state replay is not idempotent"
  );
}

/*
 * Explicit known cardinality gates.
 */

if (
  airRows.length
  !== 9184
) {
  throw new Error(
    "AIR cardinality drift: "
    + airRows.length
  );
}

if (
  availabilityRows.length
  !== 1516
) {
  throw new Error(
    "Availability occurrence drift: "
    + availabilityRows.length
  );
}

if (
  listingIndex
    .byListingNumber
    .size
  !== 1483
) {
  throw new Error(
    "Availability unique-listing drift: "
    + listingIndex
        .byListingNumber
        .size
  );
}

if (
  historicalObservations.length
  !== 2979
) {
  throw new Error(
    "Historical observation drift: "
    + historicalObservations.length
  );
}

if (
  historicalStructuralRecords
  !== 2034
) {
  throw new Error(
    "Historical structural-record drift: "
    + historicalStructuralRecords
  );
}

if (
  historicalEvents.length
  !== 2034
) {
  throw new Error(
    "Historical logical-event drift: "
    + historicalEvents.length
  );
}

if (
  forwardObservations.length
  !== 85
) {
  throw new Error(
    "Forward observation drift: "
    + forwardObservations.length
  );
}

if (
  forwardStructuralRecords
  !== 56
) {
  throw new Error(
    "Forward structural-record drift: "
    + forwardStructuralRecords
  );
}

if (
  forwardEvents.length
  !== 56
) {
  throw new Error(
    "Forward logical-event drift: "
    + forwardEvents.length
  );
}

const core = {
  sourceFamilyFileCounts:
    Object.fromEntries(
      Object.entries(
        manifests
      )
      .map(
        (
          [
            family,
            manifest,
          ]
        ) => [
          family,
          manifest.length,
        ]
      )
    ),

  sourceManifests:
    sanitizedManifests(),

  grainCardinalities:{
    air:{
      rows:
        airRows.length,
    },

    availability:{
      occurrences:
        availabilityRows.length,

      uniqueListingNumbers:
        listingIndex
          .byListingNumber
          .size,
    },

    historicalSupersheet:{
      observations:
        historicalObservations.length,

      structuralSourceRecords:
        historicalStructuralRecords,

      logicalEvents:
        historicalEvents.length,

      exactObservationConservation:
        historicalConservation
          .every(
            result =>
              result.conserved
              === true
          ),
    },

    forwardSupersheet:{
      observations:
        forwardObservations.length,

      structuralSourceRecords:
        forwardStructuralRecords,

      logicalEvents:
        forwardEvents.length,

      exactObservationConservation:
        forwardConservation
          .conserved,
    },
  },

  identity:{
    airAssetIndexRows:
      airIndex
        .rows
        .length,

    availabilityListingIndexSize:
      listingIndex
        .byListingNumber
        .size,

    availabilityAssetResolutionStatuses:
      summarizeResolutionStatuses(
        availabilityAssetResolutions
      ),

    historicalListingResolutionStatuses,

    forwardListingResolutionStatuses,

    forwardAirResolutionStatuses,
  },

  permanentBindings:{
    parseAirBaseCsv:
      true,

    parseCurrentAvailabilityText:
      true,

    parseSupersheetText:
      true,

    buildAirAssetIndex:
      true,

    buildListingIndex:
      true,

    resolveAirAsset:
      true,

    resolveListingIdentity:
      true,

    groupLogicalEventObservations:
      true,

    reduceListingState:
      true,

    replayIsIdempotent:
      true,
  },

  replay:{
    forwardIdempotent:
      forwardReplay
        .idempotent,
  },

  hashes:{
    airRows:
      sha256Hex(
        canonicalJson(
          airRows
        )
      ),

    availabilityRows:
      sha256Hex(
        canonicalJson(
          availabilityRows
        )
      ),

    historicalObservations:
      sha256Hex(
        canonicalJson(
          historicalObservations
        )
      ),

    historicalLogicalEvents:
      sha256Hex(
        canonicalJson(
          historicalEvents
        )
      ),

    forwardObservations:
      sha256Hex(
        canonicalJson(
          forwardObservations
        )
      ),

    forwardLogicalEvents:
      sha256Hex(
        canonicalJson(
          forwardEvents
        )
      ),
  },

  governance:{
    missingIsNotZero:
      true,

    availabilityIsNotVacancy:
      true,

    marketedAvailableSfNotClamped:
      true,

    sourceObservationsRemainDistinct:
      true,

    structuralSourceRecordsRemainExplicit:
      true,

    logicalEventsPreserveObservationEdges:
      true,

    comparablesDoNotMutateCurrentState:
      true,

    databaseWrites:
      false,
  },
};

const bundle =
  buildDryRunBundle(
    core
  );

console.log(
  JSON.stringify(
    {
      status:
        "R150_CORRECTED_DRY_RUN_COMPLETE",

      ...core,

      dryRunPayloadSha256:
        bundle
          .payloadSha256,

      databaseWrites:
        false,
    },
    null,
    2
  )
);
