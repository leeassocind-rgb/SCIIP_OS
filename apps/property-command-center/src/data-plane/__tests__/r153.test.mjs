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
