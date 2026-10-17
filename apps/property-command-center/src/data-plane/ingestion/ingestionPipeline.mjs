import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import * as realSourceParser
  from "../realSourceParser.mjs";

import * as identityGraph
  from "../identityGraph.mjs";

import * as logicalEventResolver
  from "../logicalEventResolver.mjs";

const schemaContract = JSON.parse(
  fs.readFileSync(
    new URL(
      "./schemaContract.json",
      import.meta.url
    ),
    "utf8"
  )
);

export function getSchemaContract() {
  return structuredClone(
    schemaContract
  );
}

export function getPermanentParserInventory() {
  return {
    realSourceParser:
      Object.keys(
        realSourceParser
      ).sort(),

    identityGraph:
      Object.keys(
        identityGraph
      ).sort(),

    logicalEventResolver:
      Object.keys(
        logicalEventResolver
      ).sort(),
  };
}

function canonicalValue(value) {
  if (
    value === null
    || value === undefined
  ) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map(
      canonicalValue
    );
  }

  if (
    typeof value === "object"
  ) {
    const out = {};

    for (
      const key
      of Object.keys(value).sort()
    ) {
      out[key] =
        canonicalValue(
          value[key]
        );
    }

    return out;
  }

  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(
    canonicalValue(value)
  );
}

export function sha256Hex(value) {
  const data =
    Buffer.isBuffer(value)
      ? value
      : Buffer.from(
          String(value),
          "utf8"
        );

  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

export function stableId(
  prefix,
  ...parts
) {
  return (
    String(prefix)
      .replace(
        /[^A-Za-z0-9_]/g,
        "_"
      )
      .toUpperCase()
    + "_"
    + sha256Hex(
        canonicalJson(parts)
      ).slice(0, 24)
  );
}

export function missingToNull(value) {
  if (
    value === undefined
    || value === null
  ) {
    return null;
  }

  if (
    typeof value === "string"
    && value.trim() === ""
  ) {
    return null;
  }

  return value;
}

export function normalizeText(value) {
  const v =
    missingToNull(value);

  if (v === null) {
    return null;
  }

  return String(v)
    .replace(/\s+/g, " ")
    .trim();
}

export function parseNumberNullable(value) {
  const v =
    missingToNull(value);

  if (v === null) {
    return null;
  }

  if (
    typeof v === "number"
  ) {
    return Number.isFinite(v)
      ? v
      : null;
  }

  let text =
    String(v).trim();

  if (!text) {
    return null;
  }

  let negative = false;

  if (
    text.startsWith("(")
    && text.endsWith(")")
  ) {
    negative = true;

    text = text.slice(
      1,
      -1
    );
  }

  text = text
    .replace(/[$,%]/g, "")
    .replace(/,/g, "")
    .trim();

  if (
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/
      .test(text)
  ) {
    return null;
  }

  const number =
    Number(text);

  if (
    !Number.isFinite(number)
  ) {
    return null;
  }

  return negative
    ? -number
    : number;
}

export function parseBooleanNullable(value) {
  const v =
    missingToNull(value);

  if (v === null) {
    return null;
  }

  if (
    typeof v === "boolean"
  ) {
    return v;
  }

  const normalized =
    String(v)
      .trim()
      .toLowerCase();

  if (
    [
      "yes",
      "y",
      "true",
      "1",
    ].includes(normalized)
  ) {
    return true;
  }

  if (
    [
      "no",
      "n",
      "false",
      "0",
    ].includes(normalized)
  ) {
    return false;
  }

  return null;
}

function normalizeExtensions(
  extensions
) {
  if (
    !extensions
  ) {
    return null;
  }

  const source =
    Array.isArray(
      extensions
    )
      ? extensions
      : [extensions];

  return new Set(
    source.map(
      extension => {
        const text =
          String(extension)
            .trim()
            .toLowerCase();

        return text.startsWith(".")
          ? text
          : "." + text;
      }
    )
  );
}

function hasHiddenComponent(
  root,
  filePath
) {
  const relative =
    path.relative(
      root,
      filePath
    );

  return relative
    .split(path.sep)
    .some(
      part =>
        part.startsWith(".")
    );
}

export function enumerateSourceFiles(
  root,
  {
    recursive = false,
    extensions = null,
  } = {}
) {
  const absoluteRoot =
    path.resolve(root);

  const allowedExtensions =
    normalizeExtensions(
      extensions
    );

  const output = [];

  function walk(directory) {
    const entries =
      fs.readdirSync(
        directory,
        {
          withFileTypes:
            true,
        }
      )
      .sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

    for (
      const entry
      of entries
    ) {
      const absolute =
        path.join(
          directory,
          entry.name
        );

      if (
        entry.name.startsWith(".")
      ) {
        continue;
      }

      if (
        entry.isDirectory()
      ) {
        if (recursive) {
          walk(absolute);
        }

        continue;
      }

      if (
        !entry.isFile()
      ) {
        continue;
      }

      if (
        hasHiddenComponent(
          absoluteRoot,
          absolute
        )
      ) {
        continue;
      }

      if (
        allowedExtensions
        && !allowedExtensions.has(
          path.extname(
            absolute
          ).toLowerCase()
        )
      ) {
        continue;
      }

      output.push(
        absolute
      );
    }
  }

  walk(
    absoluteRoot
  );

  return output.sort();
}

export function manifestFile(
  filePath,
  {
    family,
    root,
  }
) {
  const absolute =
    path.resolve(filePath);

  const absoluteRoot =
    path.resolve(root);

  const bytes =
    fs.readFileSync(
      absolute
    );

  const relativePath =
    path.relative(
      absoluteRoot,
      absolute
    )
    .split(path.sep)
    .join("/");

  if (
    relativePath
      .split("/")
      .some(
        component =>
          component.startsWith(".")
      )
  ) {
    throw new Error(
      "Hidden metadata cannot be manifested: "
      + relativePath
    );
  }

  const contentSha256 =
    sha256Hex(bytes);

  return {
    family,

    relativePath,

    absolutePath:
      absolute,

    byteLength:
      bytes.byteLength,

    contentSha256,

    sourceDocumentId:
      stableId(
        "DOC",
        family,
        relativePath,
        contentSha256
      ),
  };
}

export function buildSourceDocumentManifest(
  {
    family,
    root,
    recursive = false,
    extensions = null,
  }
) {
  return enumerateSourceFiles(
    root,
    {
      recursive,
      extensions,
    }
  ).map(
    filePath =>
      manifestFile(
        filePath,
        {
          family,
          root,
        }
      )
  );
}

export function manifestForHash(
  manifest
) {
  return manifest.map(
    item => ({
      family:
        item.family,

      relativePath:
        item.relativePath,

      byteLength:
        item.byteLength,

      contentSha256:
        item.contentSha256,

      sourceDocumentId:
        item.sourceDocumentId,
    })
  );
}

function parserOptions(
  sourceDocument,
  extra = {}
) {
  return {
    sourceFile:
      sourceDocument
        ?.relativePath
      ?? null,

    sourceSha256:
      sourceDocument
        ?.contentSha256
      ?? null,

    ...extra,
  };
}

/*
 * PERMANENT PARSER BINDINGS
 *
 * These are deliberate delegation wrappers. R150 does not
 * carry a second AIR / availability / Supersheet parser.
 */

export function parseAirBaseSource(
  text,
  sourceDocument
) {
  return realSourceParser
    .parseAirBaseCsv(
      text,
      parserOptions(
        sourceDocument
      )
    );
}

export function parseCurrentAvailabilitySource(
  text,
  sourceDocument
) {
  return realSourceParser
    .parseCurrentAvailabilityText(
      text,
      parserOptions(
        sourceDocument
      )
    );
}

export function parseSupersheetSource(
  text,
  sourceDocument,
  {
    effectiveDate = null,
  } = {}
) {
  return realSourceParser
    .parseSupersheetText(
      text,
      parserOptions(
        sourceDocument,
        {
          effectiveDate,
        }
      )
    );
}

export function buildAirIdentityIndex(
  rows
) {
  return identityGraph
    .buildAirAssetIndex(
      rows
    );
}

export function buildListingIdentityIndex(
  rows
) {
  return identityGraph
    .buildListingIndex(
      rows
    );
}

export function resolveAirAssetIdentity(
  observation,
  indexOrRows
) {
  return identityGraph
    .resolveAirAsset(
      observation,
      indexOrRows
    );
}

export function resolveListingIdentity(
  observation,
  indexOrRows
) {
  return identityGraph
    .resolveListingIdentity(
      observation,
      indexOrRows
    );
}

export function groupSupersheetLogicalEvents(
  observations
) {
  return logicalEventResolver
    .groupLogicalEventObservations(
      observations
    );
}

export function reduceListingState(
  initialState,
  logicalEvents
) {
  return logicalEventResolver
    .reduceListingState(
      initialState,
      logicalEvents
    );
}

export function replayIsIdempotent(
  initialState,
  logicalEvents
) {
  return logicalEventResolver
    .replayIsIdempotent(
      initialState,
      logicalEvents
    );
}

export function structuralRecordKey(
  observation,
  fallbackIndex = 0
) {
  const sourceFile =
    observation
      ?.sourceFile
    ?? "<UNKNOWN_SOURCE>";

  if (
    observation
      ?.sourceRecordOrdinal
    !== undefined
    && observation
      ?.sourceRecordOrdinal
    !== null
  ) {
    return (
      sourceFile
      + "|ORDINAL|"
      + String(
          observation
            .sourceRecordOrdinal
        )
    );
  }

  if (
    observation
      ?.sourceRecordAnchor
  ) {
    return (
      sourceFile
      + "|ANCHOR|"
      + String(
          observation
            .sourceRecordAnchor
        )
    );
  }

  return (
    sourceFile
    + "|OBS|"
    + String(
        observation
          ?.observationId
        ?? fallbackIndex
      )
  );
}

export function countStructuralRecords(
  observations
) {
  return new Set(
    (observations ?? [])
      .map(
        (
          observation,
          index
        ) =>
          structuralRecordKey(
            observation,
            index
          )
      )
  ).size;
}

export function assertObservationConservation(
  observations,
  logicalEvents
) {
  const sourceIds =
    (observations ?? [])
      .map(
        observation =>
          observation
            ?.observationId
      );

  if (
    sourceIds.some(
      id =>
        !id
    )
  ) {
    throw new Error(
      "Source observation missing observationId"
    );
  }

  if (
    new Set(sourceIds).size
    !== sourceIds.length
  ) {
    throw new Error(
      "Duplicate source observation IDs"
    );
  }

  const groupedIds = [];

  for (
    const event
    of logicalEvents ?? []
  ) {
    const ids =
      Array.isArray(
        event.observationIds
      )
        ? event.observationIds
        : (
            Array.isArray(
              event.sourceObservations
            )
              ? event
                  .sourceObservations
                  .map(
                    observation =>
                      observation
                        .observationId
                  )
              : []
          );

    groupedIds.push(
      ...ids
    );
  }

  if (
    groupedIds.length
    !== sourceIds.length
  ) {
    throw new Error(
      "Observation conservation cardinality failure"
    );
  }

  if (
    new Set(groupedIds).size
    !== groupedIds.length
  ) {
    throw new Error(
      "Observation appears in more than one logical event"
    );
  }

  const sourceSet =
    new Set(sourceIds);

  for (
    const id
    of groupedIds
  ) {
    if (
      !sourceSet.has(id)
    ) {
      throw new Error(
        "Logical event contains unknown observation: "
        + id
      );
    }
  }

  return {
    conserved:
      true,

    sourceObservationCount:
      sourceIds.length,

    groupedObservationCount:
      groupedIds.length,
  };
}

export function summarizeResolutionStatuses(
  results
) {
  const counts = {};

  for (
    const result
    of results ?? []
  ) {
    const status =
      result
        ?.status
      ?? "UNKNOWN";

    counts[status] =
      (
        counts[status]
        ?? 0
      )
      + 1;
  }

  return Object.fromEntries(
    Object.entries(counts)
      .sort(
        (
          [a],
          [b]
        ) =>
          a.localeCompare(b)
      )
  );
}

export function adaptAvailabilityParsedRecords(
  records,
  {
    sourceDocument = null,
  } = {}
) {
  return (
    records
    ?? []
  ).map(
    (
      record,
      index
    ) => {
      const buildingSf =
        parseNumberNullable(
          record
            ?.buildingSf
        );

      const marketedAvailableSf =
        parseNumberNullable(
          record
            ?.availableSf
        );

      return {
        family:
          "CURRENT_AVAILABILITY",

        sourceDocumentId:
          sourceDocument
            ?.sourceDocumentId
          ?? null,

        sourceObservationId:
          record
            ?.observationId
          ?? stableId(
              "OBS",
              sourceDocument
                ?.sourceDocumentId
              ?? "UNKNOWN",
              index + 1
            ),

        listingId:
          normalizeText(
            record
              ?.listingId
          ),

        listingNumber:
          normalizeText(
            record
              ?.listingNumber
          ),

        address:
          normalizeText(
            record
              ?.address
          ),

        buildingSf,

        marketedAvailableSf,

        /*
         * Availability is not vacancy.
         * Only an explicit source vacancy value is carried.
         */
        isVacant:
          parseBooleanNullable(
            record
              ?.vacant
          ),

        /*
         * Never clamp marketed SF to building SF.
         */
        overlapPossible:
          (
            buildingSf
              !== null
            && marketedAvailableSf
              !== null
            && marketedAvailableSf
              > buildingSf
          ),

        raw:
          structuredClone(
            record
          ),
      };
    }
  );
}

export function adaptComparableRecords(
  records,
  {
    sourceDocument,
  }
) {
  return {
    family:
      "COMPARABLE_TRANSACTIONS",

    sourceDocumentId:
      sourceDocument
        ?.sourceDocumentId
      ?? null,

    transactionHistory:
      (records ?? [])
        .map(
          (
            record,
            index
          ) => ({
            transactionId:
              record
                ?.transactionId
              ?? stableId(
                  "TXN",
                  sourceDocument
                    ?.sourceDocumentId
                  ?? "UNKNOWN",
                  index + 1,
                  record
                ),

            transactionType:
              normalizeText(
                record
                  ?.transactionType
                ?? record
                  ?.type
                ?? record
                  ?.Type
              ),

            transactionDate:
              normalizeText(
                record
                  ?.transactionDate
                ?? record
                  ?.date
                ?? record
                  ?.Date
              ),

            raw:
              structuredClone(
                record
              ),
          })
        ),

    /*
     * Comparables never mutate the current listing state.
     */
    currentStateMutations:
      [],
  };
}

export function adaptGeographyRecords(
  records,
  {
    sourceDocument,
  }
) {
  return (
    records
    ?? []
  ).map(
    (
      record,
      index
    ) => ({
      semanticObject:
        "GEOGRAPHY",

      physicalRelation:
        "geography_registry",

      sourceDocumentId:
        sourceDocument
          ?.sourceDocumentId
        ?? null,

      geographyId:
        record
          ?.geographyId
        ?? stableId(
            "GEO",
            sourceDocument
              ?.sourceDocumentId
            ?? "UNKNOWN",
            index + 1,
            record
          ),

      market:
        normalizeText(
          record
            ?.market
          ?? record
            ?.Market
        ),

      submarket:
        normalizeText(
          record
            ?.submarket
          ?? record
            ?.Submarket
        ),

      raw:
        structuredClone(
          record
        ),
    })
  );
}

export function validateTargetRow(
  table,
  values
) {
  const tableContract =
    schemaContract
      .tables[
        table
      ];

  if (!tableContract) {
    return {
      valid:
        false,

      table,

      reason:
        "UNKNOWN_TABLE",

      unknownColumns:
        Object.keys(
          values
        ),

      missingRequiredColumns:
        [],
    };
  }

  const knownColumns =
    new Set(
      tableContract
        .columns
        .map(
          column =>
            column.name
        )
    );

  const unknownColumns =
    Object.keys(values)
      .filter(
        column =>
          !knownColumns.has(
            column
          )
      )
      .sort();

  const missingRequiredColumns =
    tableContract
      .requiredColumns
      .filter(
        column =>
          (
            !Object.prototype
              .hasOwnProperty
              .call(
                values,
                column
              )
            || values[column]
              === null
            || values[column]
              === undefined
          )
      )
      .sort();

  return {
    valid:
      (
        unknownColumns.length
          === 0
        && missingRequiredColumns
          .length === 0
      ),

    table,

    unknownColumns,

    missingRequiredColumns,
  };
}

export function validateTargetTableCoverage(
  targetTables
) {
  const live =
    new Set(
      Object.keys(
        schemaContract.tables
      )
    );

  const missing =
    [...targetTables]
      .filter(
        table =>
          !live.has(
            table
          )
      )
      .sort();

  return {
    valid:
      missing.length
        === 0,

    missing,
  };
}

export function buildDryRunBundle(
  payload
) {
  const canonicalPayload =
    canonicalValue(
      payload
    );

  return {
    payload:
      canonicalPayload,

    payloadSha256:
      sha256Hex(
        canonicalJson(
          canonicalPayload
        )
      ),

    databaseWrites:
      false,
  };
}
