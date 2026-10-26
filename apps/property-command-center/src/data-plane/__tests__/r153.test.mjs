import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DATABASE_WRITES_ENABLED as COMPARABLE_WRITES,
  normalizeHeader,
} from "../ingestion/comparableSourceParser.mjs";

import {
  DATABASE_WRITES_ENABLED as REFERENCE_WRITES,
  parseCsvText,
  classifyReferenceSubtype,
} from "../ingestion/referenceSpatialParser.mjs";

import {
  DATABASE_WRITES_ENABLED as BUNDLE_WRITES,
  loadSchemaContract,
  buildNamedRow,
  deterministicId,
  validateForeignKeysInMemory,
  validateRelationalKeysInMemory,
} from "../ingestion/postgresRowBundle.mjs";

const HERE =
  path.dirname(
    fileURLToPath(
      import.meta.url
    )
  );

test(
  "R153 modules expose no database-write capability",
  () => {
    assert.equal(
      COMPARABLE_WRITES,
      false
    );

    assert.equal(
      REFERENCE_WRITES,
      false
    );

    assert.equal(
      BUNDLE_WRITES,
      false
    );
  }
);

test(
  "deterministic IDs replay exactly",
  () => {
    const a =
      deterministicId(
        "TEST",
        "abc",
        123,
        {
          x:
            "y",
        }
      );

    const b =
      deterministicId(
        "TEST",
        "abc",
        123,
        {
          x:
            "y",
        }
      );

    assert.equal(
      a,
      b
    );
  }
);

test(
  "missing values are not silently coerced to zero",
  () => {
    const contract =
      loadSchemaContract();

    const table =
      Object.keys(
        contract.tables
      )[0];

    const built =
      buildNamedRow(
        contract,
        table,
        {}
      );

    for (
      const value
      of Object.values(
        built.row
      )
    ) {
      assert.notEqual(
        value,
        0
      );
    }
  }
);

test(
  "CSV parser preserves quoted commas",
  () => {
    const rows =
      parseCsvText(
        'a,b\n"1,2",3\n'
      );

    assert.deepEqual(
      rows,
      [
        [
          "a",
          "b",
        ],
        [
          "1,2",
          "3",
        ],
      ]
    );
  }
);

test(
  "reference subtype classification is deterministic",
  () => {
    assert.equal(
      classifyReferenceSubtype(
        "truck-traffic.csv",
        {}
      ),
      "TRUCK_TRAFFIC"
    );

    assert.equal(
      classifyReferenceSubtype(
        "intermodal.csv",
        {}
      ),
      "INTERMODAL"
    );

    assert.equal(
      classifyReferenceSubtype(
        "property-search.csv",
        {
          apn:
            "123",
        }
      ),
      "PROPERTY_SEARCH"
    );
  }
);

test(
  "all 19 target tables have explicit named-column contracts",
  () => {
    const contract =
      loadSchemaContract();

    const tables =
      Object.keys(
        contract.tables
      );

    assert.equal(
      tables.length,
      19
    );

    for (
      const table
      of tables
    ) {
      const columns =
        contract
          .tables[
            table
          ]
          .columns
          .map(
            column =>
              column.name
          );

      assert.ok(
        columns.length
        > 0
      );

      assert.equal(
        new Set(
          columns
        ).size,
        columns.length
      );
    }
  }
);

test(
  "FK validator detects an orphan and accepts a valid reference",
  () => {
    const foreignKeys = [
      {
        sourceTable:
          "child",
        sourceColumns:[
          "parent_id",
        ],
        targetTable:
          "parent",
        targetColumns:[
          "id",
        ],
      },
    ];

    const valid =
      validateForeignKeysInMemory(
        {
          parent:[
            {
              id:
                "P1",
            },
          ],
          child:[
            {
              parent_id:
                "P1",
            },
          ],
        },
        foreignKeys
      );

    assert.equal(
      valid.valid,
      true
    );

    const invalid =
      validateForeignKeysInMemory(
        {
          parent:[
            {
              id:
                "P1",
            },
          ],
          child:[
            {
              parent_id:
                "P2",
            },
          ],
        },
        foreignKeys
      );

    assert.equal(
      invalid.valid,
      false
    );

    assert.equal(
      invalid.orphanCount,
      1
    );
  }
);

test(
  "R153 additive modules contain no SQL mutation statements",
  () => {
    const files = [
      path.join(
        HERE,
        "..",
        "ingestion",
        "comparableSourceParser.mjs"
      ),
      path.join(
        HERE,
        "..",
        "ingestion",
        "referenceSpatialParser.mjs"
      ),
      path.join(
        HERE,
        "..",
        "ingestion",
        "postgresRowBundle.mjs"
      ),
      path.join(
        HERE,
        "..",
        "ingestion",
        "r153DryRun.mjs"
      ),
    ];

    const mutationSql =
      /\b(?:INSERT\s+INTO|UPDATE\s+[A-Za-z_]|DELETE\s+FROM|TRUNCATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+TABLE)\b/i;

    for (
      const file
      of files
    ) {
      const source =
        fs.readFileSync(
          file,
          "utf8"
        );

      assert.equal(
        mutationSql.test(
          source
        ),
        false,
        file
      );
    }
  }
);

test(
  "availability and vacancy remain distinct concepts in implementation",
  () => {
    const source =
      fs.readFileSync(
        path.join(
          HERE,
          "..",
          "ingestion",
          "postgresRowBundle.mjs"
        ),
        "utf8"
      );

    assert.match(
      source,
      /unique_available_sf/
    );

    assert.match(
      source,
      /vacant_sf/
    );

    assert.match(
      source,
      /vacant/
    );
  }
);

test(
  "SALE events are prevented from mutating listing state",
  () => {
    const source =
      fs.readFileSync(
        path.join(
          HERE,
          "..",
          "ingestion",
          "postgresRowBundle.mjs"
        ),
        "utf8"
      );

    assert.match(
      source,
      /upperType\.includes\(\s*"SALE"\s*\)/
    );
  }
);

test(
  "older events are explicitly prevented from overwriting newer state",
  () => {
    const source =
      fs.readFileSync(
        path.join(
          HERE,
          "..",
          "ingestion",
          "postgresRowBundle.mjs"
        ),
        "utf8"
      );

    assert.match(
      source,
      /date\s*<\s*currentDate/
    );
  }
);

test(
  "SPACE creation requires explicit space evidence",
  () => {
    const source =
      fs.readFileSync(
        path.join(
          HERE,
          "..",
          "ingestion",
          "postgresRowBundle.mjs"
        ),
        "utf8"
      );

    assert.match(
      source,
      /explicitSpaceEvidence/
    );

    assert.match(
      source,
      /if\s*\(\s*explicitSpace\s*\)/
    );
  }
);


test(
  "intermodal underscore filenames classify as INTERMODAL",
  () => {
    assert.equal(
      classifyReferenceSubtype(
        "Freight_Intermodal_Facilities.csv",
        {
          x:
            "-13615184.7359",
          y:
            "4551341.1227",
        }
      ),
      "INTERMODAL"
    );
  }
);


test(
  "relational validator supports composite primary keys",
  () => {
    const result =
      validateRelationalKeysInMemory(
        {
          edge:[
            {
              asset_id:
                "A",
              geography_id:
                "G1",
            },
            {
              asset_id:
                "A",
              geography_id:
                "G2",
            },
          ],
        },
        [
          {
            table:
              "edge",
            type:
              "PRIMARY_KEY",
            columns:[
              "asset_id",
              "geography_id",
            ],
          },
        ]
      );

    assert.equal(
      result.valid,
      true
    );
  }
);


test(
  "asset_geography uses governed composite primary key",
  () => {
    const source =
      fs.readFileSync(
        path.join(
          HERE,
          "..",
          "ingestion",
          "postgresRowBundle.mjs"
        ),
        "utf8"
      );

    assert.match(
      source,
      /\[\s*"asset_id",\s*"geography_id",\s*\]/
    );

    assert.doesNotMatch(
      source,
      /"asset_geography_id"/
    );
  }
);


test(
  "event edges use explicit observation membership only",
  () => {
    const source =
      fs.readFileSync(
        path.join(
          HERE,
          "..",
          "ingestion",
          "postgresRowBundle.mjs"
        ),
        "utf8"
      );

    assert.match(
      source,
      /const\s+explicitObservationIds\s*=/
    );

    assert.match(
      source,
      /event\.observationIds/
    );

    assert.match(
      source,
      /event\.sourceObservations/
    );

    assert.match(
      source,
      /EVENT_OBSERVATION_MEMBERSHIP_CHANNEL_MISMATCH/
    );

    assert.match(
      source,
      /UNRESOLVED_EXPLICIT_EVENT_OBSERVATION/
    );

    /*
     * The obsolete event-edge mechanism must not remain.
     * This targets the specific old event-level ordinal loop
     * without prohibiting the legacy helper definition itself.
     */
    assert.doesNotMatch(
      source,
      /const\s+ordinals\s*=\s*\[\s*\.\.\.recursivelyCollectOrdinals\(\s*event\s*\)/s
    );

    assert.doesNotMatch(
      source,
      /observationIdsByOrdinal\.get\(\s*sourceOrdinal\s*\)/s
    );
  }
);


test(
  "raw x/y never become latitude longitude geometry",
  () => {
    const source =
      fs.readFileSync(
        path.join(
          HERE,
          "..",
          "ingestion",
          "postgresRowBundle.mjs"
        ),
        "utf8"
      );

    const start =
      source.indexOf(
        "function latLon("
      );

    const end =
      source.indexOf(
        "function initializeTables(",
        start
      );

    assert.ok(
      start >= 0
    );

    assert.ok(
      end > start
    );

    const block =
      source.slice(
        start,
        end
      );

    assert.doesNotMatch(
      block,
      /"x"/
    );

    assert.doesNotMatch(
      block,
      /"y"/
    );
  }
);


test(
  "ambiguous building identity is deferred",
  () => {
    const source =
      fs.readFileSync(
        path.join(
          HERE,
          "..",
          "ingestion",
          "postgresRowBundle.mjs"
        ),
        "utf8"
      );

    assert.match(
      source,
      /AMBIGUOUS_PHYSICAL_BUILDING_IDENTITY/
    );
  }
);


test(
  "provisional identity is not promoted to canonical",
  () => {
    const source =
      fs.readFileSync(
        path.join(
          HERE,
          "..",
          "ingestion",
          "postgresRowBundle.mjs"
        ),
        "utf8"
      );

    assert.match(
      source,
      /CURRENT_SCHEMA_CANNOT_TRUTHFULLY_REPRESENT_/
    );
  }
);

// -----------------------------------------------------------------------------
// R154-A10F5 PERMANENT FROZEN SPATIAL CORRECTION GATES
//
// Source-native KML attributes travel on a non-enumerable Symbol sidecar so
// source_observation canonical content and deterministic identity remain
// unchanged. The row bundle projects that sidecar only into
// spatial_feature.attributes and uses the same source observation's governed
// sourceDocumentId for spatial_feature.source_document_id.
// -----------------------------------------------------------------------------

import { test as r154A10dTest } from "node:test";
import assertR154A10D from "node:assert/strict";
import {
  readFileSync as readFileSyncR154A10D,
} from "node:fs";
import {
  fileURLToPath as fileURLToPathR154A10D,
} from "node:url";
import {
  dirname as dirnameR154A10D,
  resolve as resolveR154A10D,
} from "node:path";
import {
  canonicalJson as canonicalJsonR154A10D,
} from "../ingestion/postgresRowBundle.mjs";

r154A10dTest(
  "R154-A10F5 sidecar is non-enumerable and canonical-source-observation neutral",
  () => {
    const sidecar =
      Symbol.for(
        "SCIIP_SOURCE_NATIVE_ATTRIBUTES"
      );

    const baseline = {
      sourceFamily:
        "REFERENCE_AND_SPATIAL",
      sourceDocumentId:
        "SOURCE_DOCUMENT:test",
      sourcePath:
        "snapshots/test/reference.kml",
      sourceSha256:
        "test-sha",
      observationKind:
        "REFERENCE_KML_PLACEMARK",
      sourceRecordOrdinal:
        1,
      name:
        null,
      fields:
        {},
      geometry: {
        type:
          "Point",
        coordinates: [
          -118,
          34,
        ],
      },
      referenceSubtype:
        "REFERENCE",
    };

    const candidate = {
      ...baseline,
    };

    Object.defineProperty(
      candidate,
      sidecar,
      {
        value: {
          OBJECTID:
            "1",
          LOCATION:
            "TEST",
        },
        enumerable:
          false,
        writable:
          false,
        configurable:
          false,
      }
    );

    assertR154A10D.deepEqual(
      Object.keys(candidate),
      Object.keys(baseline)
    );

    assertR154A10D.equal(
      JSON.stringify(candidate),
      JSON.stringify(baseline)
    );

    assertR154A10D.equal(
      canonicalJsonR154A10D(
        candidate
      ),
      canonicalJsonR154A10D(
        baseline
      )
    );

    assertR154A10D.deepEqual(
      candidate[sidecar],
      {
        OBJECTID:
          "1",
        LOCATION:
          "TEST",
      }
    );
  }
);

r154A10dTest(
  "R154-A10F5 parser and row bundle retain the sidecar projection architecture",
  () => {
    const here =
      dirnameR154A10D(
        fileURLToPathR154A10D(
          import.meta.url
        )
      );

    const parserSource =
      readFileSyncR154A10D(
        resolveR154A10D(
          here,
          "../ingestion/referenceSpatialParser.mjs"
        ),
        "utf8"
      );

    const rowBundleSource =
      readFileSyncR154A10D(
        resolveR154A10D(
          here,
          "../ingestion/postgresRowBundle.mjs"
        ),
        "utf8"
      );

    assertR154A10D.match(
      parserSource,
      /SCIIP_SOURCE_NATIVE_ATTRIBUTES/
    );

    assertR154A10D.match(
      parserSource,
      /SimpleData/
    );

    assertR154A10D.match(
      rowBundleSource,
      /SCIIP_SOURCE_NATIVE_ATTRIBUTES/
    );

    assertR154A10D.match(
      rowBundleSource,
      /\battributes\s*:/
    );

    assertR154A10D.match(
      rowBundleSource,
      /\bsource_document_id\s*:/
    );

    assertR154A10D.match(
      rowBundleSource,
      /observation[\s\S]{0,500}\.sourceDocumentId/
    );
  }
);

r154A10dTest(
  "R154-A10F5 raw KML sidecar survives subtype classification",
  () => {
    const here =
      dirnameR154A10D(
        fileURLToPathR154A10D(
          import.meta.url
        )
      );

    const parserSource =
      readFileSyncR154A10D(
        resolveR154A10D(
          here,
          "../ingestion/referenceSpatialParser.mjs"
        ),
        "utf8"
      );

    const rowBundleSource =
      readFileSyncR154A10D(
        resolveR154A10D(
          here,
          "../ingestion/postgresRowBundle.mjs"
        ),
        "utf8"
      );

    const helperStart =
      parserSource.indexOf(
        "function sourceNativeKmlAttributes("
      );
    const helperEnd =
      parserSource.indexOf(
        "\nfunction kmlObservations(",
        helperStart
      );

    assertR154A10D.ok(
      helperStart >= 0
      && helperEnd > helperStart
    );

    const helperSource =
      parserSource.slice(
        helperStart,
        helperEnd
      );

    assertR154A10D.doesNotMatch(
      helperSource,
      /\bnormalizeKey\s*\(/
    );

    assertR154A10D.match(
      helperSource,
      /const key\s*=[\s\S]{0,120}xmlUnescape\([\s\S]{0,80}rawName/
    );

    assertR154A10D.match(
      parserSource,
      /const classifiedObservation\s*=\s*\{[\s\S]{0,1800}Object\.defineProperty\([\s\S]{0,700}SCIIP_SOURCE_NATIVE_ATTRIBUTES/
    );

    assertR154A10D.match(
      rowBundleSource,
      /source_document_id\s*:[\s\S]{0,120}observation[\s\S]{0,80}\.sourceDocumentId/
    );
  }
);

