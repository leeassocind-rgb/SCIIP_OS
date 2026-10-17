import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  adaptAvailabilityParsedRecords,
  adaptComparableRecords,
  assertObservationConservation,
  buildAirIdentityIndex,
  buildDryRunBundle,
  buildListingIdentityIndex,
  buildSourceDocumentManifest,
  countStructuralRecords,
  getPermanentParserInventory,
  getSchemaContract,
  groupSupersheetLogicalEvents,
  missingToNull,
  parseAirBaseSource,
  parseBooleanNullable,
  parseNumberNullable,
  reduceListingState,
  replayIsIdempotent,
  resolveAirAssetIdentity,
  resolveListingIdentity,
  stableId,
  validateTargetRow,
  validateTargetTableCoverage,
} from "../ingestion/ingestionPipeline.mjs";

test(
  "R150 schema contract is the certified 19-table data plane",
  () => {
    const contract =
      getSchemaContract();

    assert.equal(
      contract.tableCount,
      19
    );

    assert.ok(
      contract
        .tables
        .geography_registry
    );

    assert.equal(
      contract
        .tables
        .geography,
      undefined
    );
  }
);

test(
  "source manifest excludes hidden metadata and supports governed extension scope",
  () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          "sciip-r150-c4-"
        )
      );

    fs.writeFileSync(
      path.join(
        root,
        "one.pdf"
      ),
      "pdf"
    );

    fs.writeFileSync(
      path.join(
        root,
        "one.xls"
      ),
      "xls"
    );

    fs.writeFileSync(
      path.join(
        root,
        "one.kmz"
      ),
      "kmz"
    );

    fs.writeFileSync(
      path.join(
        root,
        ".DS_Store"
      ),
      "metadata"
    );

    const all =
      buildSourceDocumentManifest({
        family:
          "TEST",
        root,
      });

    assert.equal(
      all.length,
      3
    );

    const pdfOnly =
      buildSourceDocumentManifest({
        family:
          "TEST",
        root,
        extensions:[
          ".pdf",
        ],
      });

    assert.equal(
      pdfOnly.length,
      1
    );

    assert.equal(
      pdfOnly[0]
        .relativePath,
      "one.pdf"
    );
  }
);

test(
  "missing is not zero",
  () => {
    assert.equal(
      missingToNull(""),
      null
    );

    assert.equal(
      parseNumberNullable(""),
      null
    );

    assert.equal(
      parseNumberNullable(null),
      null
    );

    assert.equal(
      parseNumberNullable("0"),
      0
    );

    assert.equal(
      parseNumberNullable(0),
      0
    );
  }
);

test(
  "AIR parser delegates to permanent parser with provenance",
  () => {
    const headers = [
      "Address",
      "Submarket",
      "Type",
      "Sub Type",
      "Building Status",
      "Building Size / SF",
      "Total Available Space",
      "Total Available Space (Unit)",
      "Land Size / Acres",
      "Clear Height Min / FT",
      "Clear Height Max / FT",
      "Dock High Doors",
      "Grade Level Doors",
      "Year Built",
      "Building Class",
      "True Owner Company",
      "Zoning",
      "Number of Buildings",
      "True Owner Title",
      "True Owner Street Address",
      "True Owner Phone",
      "AMPs",
      "Postal Code",
      "Legal Owner Company",
      "Total Parking",
    ];

    const values =
      Array(
        headers.length
      ).fill("");

    values[
      headers.indexOf(
        "Address"
      )
    ] = "123 TEST ST";

    values[
      headers.indexOf(
        "Building Size / SF"
      )
    ] = "100000";

    values[
      headers.indexOf(
        "Total Available Space"
      )
    ] = "125000";

    values[
      headers.indexOf(
        "Postal Code"
      )
    ] = "90000";

    const text =
      headers.join(",")
      + "\n"
      + values.join(",")
      + "\n";

    const rows =
      parseAirBaseSource(
        text,
        {
          relativePath:
            "air.csv",

          contentSha256:
            "ABC",
        }
      );

    assert.equal(
      rows.length,
      1
    );

    assert.equal(
      rows[0]
        .sourceFile,
      "air.csv"
    );

    assert.equal(
      rows[0]
        .sourceSha256,
      "ABC"
    );

    assert.equal(
      rows[0]
        .buildingSf,
      100000
    );

    assert.equal(
      rows[0]
        .totalAvailableSpace,
      125000
    );
  }
);

test(
  "availability is not vacancy and marketed SF is never clamped",
  () => {
    const result =
      adaptAvailabilityParsedRecords(
        [
          {
            observationId:
              "OBS_1",

            listingId:
              "AIR-LISTING-1",

            listingNumber:
              "1",

            address:
              "4250 Shirley Ave",

            buildingSf:
              663100,

            availableSf:
              726834,

            vacant:
              false,
          },
        ]
      );

    assert.equal(
      result[0]
        .marketedAvailableSf,
      726834
    );

    assert.equal(
      result[0]
        .buildingSf,
      663100
    );

    assert.equal(
      result[0]
        .isVacant,
      false
    );

    assert.equal(
      result[0]
        .overlapPossible,
      true
    );
  }
);

test(
  "permanent identity graph bindings operate on row collections",
  () => {
    const airRows = [
      {
        airRowId:
          "AIR_1",

        address:
          "123 TEST ST",

        zip:
          "90000",

        buildingSf:
          100000,
      },
    ];

    const airIndex =
      buildAirIdentityIndex(
        airRows
      );

    assert.equal(
      airIndex
        .rows
        .length,
      1
    );

    const assetResolution =
      resolveAirAssetIdentity(
        airRows[0],
        airIndex
      );

    assert.ok(
      assetResolution
    );

    const listingRows = [
      {
        listingId:
          "AIR-LISTING-1",

        listingNumber:
          "1",

        address:
          "123 TEST ST",

        availableSf:
          50000,
      },
    ];

    const listingIndex =
      buildListingIdentityIndex(
        listingRows
      );

    assert.equal(
      listingIndex
        .byListingNumber
        .size,
      1
    );

    const listingResolution =
      resolveListingIdentity(
        listingRows[0],
        listingIndex
      );

    assert.ok(
      listingResolution
    );
  }
);

test(
  "permanent logical-event grouping conserves observations and structural grain",
  () => {
    const observations = [
      {
        observationId:
          "OBS_A",

        sourceFile:
          "feed.pdf",

        sourceSha256:
          "SHA",

        sourceRecordOrdinal:
          1,

        sourceRecordAnchor:
          "REC_1",

        eventType:
          "RATE_CHANGE",

        effectiveDate:
          "2026-10-15",

        address:
          "123 TEST ST",

        zip:
          "90000",
      },

      {
        observationId:
          "OBS_B",

        sourceFile:
          "feed.pdf",

        sourceSha256:
          "SHA",

        sourceRecordOrdinal:
          1,

        sourceRecordAnchor:
          "REC_1",

        eventType:
          "AVAILABLE_SF_CHANGE",

        effectiveDate:
          "2026-10-15",

        address:
          "123 TEST ST",

        zip:
          "90000",
      },
    ];

    assert.equal(
      countStructuralRecords(
        observations
      ),
      1
    );

    const events =
      groupSupersheetLogicalEvents(
        observations
      );

    assert.equal(
      events.length,
      1
    );

    const conservation =
      assertObservationConservation(
        observations,
        events
      );

    assert.equal(
      conservation
        .conserved,
      true
    );
  }
);

test(
  "permanent reducer contract accepts an event array and replay is idempotent",
  () => {
    const observations = [
      {
        observationId:
          "OBS_1",

        sourceFile:
          "feed.pdf",

        sourceSha256:
          "SHA",

        sourceRecordOrdinal:
          1,

        eventType:
          "RATE_CHANGE",

        effectiveDate:
          "2026-10-15",

        address:
          "123 TEST ST",

        zip:
          "90000",
      },
    ];

    const events =
      groupSupersheetLogicalEvents(
        observations
      );

    const reduced =
      reduceListingState(
        null,
        events
      );

    assert.ok(
      reduced
    );

    assert.ok(
      Object.prototype
        .hasOwnProperty
        .call(
          reduced,
          "state"
        )
    );

    const replay =
      replayIsIdempotent(
        null,
        events
      );

    assert.equal(
      replay
        .idempotent,
      true
    );
  }
);

test(
  "comparables emit no current-state mutations",
  () => {
    const result =
      adaptComparableRecords(
        [
          {
            Type:
              "Sale",

            Date:
              "2026-01-01",
          },
        ],
        {
          sourceDocument:{
            sourceDocumentId:
              "DOC_COMP",
          },
        }
      );

    assert.deepEqual(
      result
        .currentStateMutations,
      []
    );

    assert.equal(
      result
        .transactionHistory
        .length,
      1
    );
  }
);

test(
  "target-table coverage and row validation fail closed",
  () => {
    const coverage =
      validateTargetTableCoverage([
        "asset",
        "building",
        "geography_registry",
      ]);

    assert.equal(
      coverage.valid,
      true
    );

    const unknown =
      validateTargetRow(
        "asset",
        {
          definitely_not_a_column:
            "x",
        }
      );

    assert.equal(
      unknown.valid,
      false
    );

    assert.deepEqual(
      unknown
        .unknownColumns,
      [
        "definitely_not_a_column",
      ]
    );
  }
);

test(
  "permanent modules remain visible through R150 inventory",
  () => {
    const inventory =
      getPermanentParserInventory();

    assert.ok(
      inventory
        .realSourceParser
        .includes(
          "parseAirBaseCsv"
        )
    );

    assert.ok(
      inventory
        .identityGraph
        .includes(
          "resolveAirAsset"
        )
    );

    assert.ok(
      inventory
        .logicalEventResolver
        .includes(
          "replayIsIdempotent"
        )
    );
  }
);

test(
  "deterministic IDs and dry-run hashes replay exactly",
  () => {
    const a =
      stableId(
        "OBS",
        "DOC_X",
        1,
        {
          address:
            "123 Main St",
        }
      );

    const b =
      stableId(
        "OBS",
        "DOC_X",
        1,
        {
          address:
            "123 Main St",
        }
      );

    assert.equal(
      a,
      b
    );

    const one =
      buildDryRunBundle({
        b:
          2,
        a:
          1,
      });

    const two =
      buildDryRunBundle({
        a:
          1,
        b:
          2,
      });

    assert.equal(
      one
        .payloadSha256,
      two
        .payloadSha256
    );

    assert.equal(
      one
        .databaseWrites,
      false
    );
  }
);

test(
  "nullable boolean parser does not manufacture vacancy",
  () => {
    assert.equal(
      parseBooleanNullable(
        null
      ),
      null
    );

    assert.equal(
      parseBooleanNullable(
        ""
      ),
      null
    );

    assert.equal(
      parseBooleanNullable(
        "No"
      ),
      false
    );

    assert.equal(
      parseBooleanNullable(
        "Yes"
      ),
      true
    );
  }
);
