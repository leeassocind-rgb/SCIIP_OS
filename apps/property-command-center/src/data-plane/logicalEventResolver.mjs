
import {
  createHash,
} from "node:crypto";

import {
  canonicalListingAddress,
  toNullableNumber,
} from "./identityGraph.mjs";

function stableId(
  prefix,
  payload
) {
  const text = JSON.stringify(
    payload,
    Object.keys(payload).sort()
  );

  const hash =
    createHash("sha256")
      .update(text)
      .digest("hex")
      .slice(0, 24)
      .toUpperCase();

  return `${prefix}-${hash}`;
}

function logicalKey(
  observation
) {
  /*
   * Primary event-cardinality identity:
   *
   *   source document
   *   + effective date
   *   + deterministic source-record anchor
   *
   * This is stronger than address + available SF because
   * those are parsed business fields and can legitimately
   * differ across observations belonging to the same source
   * record.
   *
   * It also prevents separate records at the same address
   * from collapsing merely because their marketed values
   * happen to match.
   */
  if (
    observation.sourceFile
    && Number.isInteger(
      observation.sourceRecordOrdinal
    )
  ) {
    return [
      "SOURCE_RECORD",

      observation.sourceSha256
        ?? observation.sourceFile,

      observation.effectiveDate
        ?? null,

      observation.sourceRecordOrdinal,
    ];
  }

  /*
   * Backward-compatible deterministic fallback for governed
   * observations created before source-record ordinal support.
   */
  if (
    observation.sourceFile
    && Number.isInteger(
      observation.sourceRecordAnchor
    )
  ) {
    return [
      "SOURCE_RECORD_LINE_FALLBACK",

      observation.sourceSha256
        ?? observation.sourceFile,

      observation.effectiveDate
        ?? null,

      observation.sourceRecordAnchor,
    ];
  }

  /*
   * Semantic fallback is retained for governed observations
   * produced by adapters that do not expose source-line
   * provenance.
   */
  const address =
    canonicalListingAddress(
      observation.address
    );

  const sf =
    toNullableNumber(
      observation.availableSf
      ?? observation.marketedSf
    );

  if (address) {
    return [
      "SEMANTIC_FALLBACK",

      observation.effectiveDate
        ?? null,

      address,

      observation.zip
        ?? null,

      sf,
    ];
  }

  /*
   * No-address observations remain bounded to a local
   * source-line bucket and are never globally collapsed.
   */
  return [
    "NO_ADDRESS_FALLBACK",

    observation.effectiveDate
      ?? null,

    observation.sourceFile
      ?? null,

    Math.floor(
      Number(
        observation.sourceLine
        ?? 0
      ) / 10
    ),
  ];
}

export function groupLogicalEventObservations(
  observations
) {
  const groups = new Map();

  for (
    const observation
    of observations ?? []
  ) {
    const keyParts =
      logicalKey(
        observation
      );

    const key =
      JSON.stringify(
        keyParts
      );

    if (!groups.has(key)) {
      groups.set(
        key,
        {
          keyParts,
          observations: [],
        }
      );
    }

    groups.get(key)
      .observations
      .push(observation);
  }

  const output = [];

  for (
    const {
      keyParts,
      observations: rows,
    }
    of groups.values()
  ) {
    const first = rows[0];

    const eventTypes = [
      ...new Set(
        rows.map(
          (x) => x.eventType
        )
      ),
    ].sort();

    const observationIds =
      rows.map(
        (x) => x.observationId
      );

    const logicalEventId =
      stableId(
        "LOGICAL-EVT",
        {
          keyParts,
          eventTypes,
          observationIds:
            [...observationIds]
              .sort(),
        }
      );

    output.push({
      logicalEventId,

      effectiveDate:
        first.effectiveDate
        ?? null,

      address:
        first.address
        ?? null,

      zip:
        first.zip
        ?? null,

      availableSf:
        toNullableNumber(
          first.availableSf
        ),

      officeSf:
        toNullableNumber(
          first.officeSf
        ),

      buildingSf:
        toNullableNumber(
          first.buildingSf
        ),

      vacant:
        first.vacant
        ?? null,

      eventTypes,

      sourceLabels:
        rows.map(
          (x) => x.sourceLabel
        ),

      observationCount:
        rows.length,

      observationIds,

      sourceObservations:
        rows,
    });
  }

  return output.sort(
    (a, b) =>
      a.logicalEventId
        .localeCompare(
          b.logicalEventId
        )
  );
}

function cloneState(state) {
  return JSON.parse(
    JSON.stringify(
      state ?? {}
    )
  );
}

export function reduceListingState(
  initialState,
  logicalEvents
) {
  const state =
    cloneState(
      initialState
    );

  const unresolved = [];

  for (
    const logicalEvent
    of logicalEvents ?? []
  ) {
    const listingId =
      logicalEvent.listingId
      ?? null;

    if (!listingId) {
      unresolved.push({
        logicalEventId:
          logicalEvent.logicalEventId,

        reason:
          "NO_RESOLVED_LISTING_ID",
      });

      continue;
    }

    const row =
      state[listingId];

    if (!row) {
      unresolved.push({
        logicalEventId:
          logicalEvent.logicalEventId,

        listingId,

        reason:
          "LISTING_NOT_PRESENT_IN_STATE",
      });

      continue;
    }

    const applied =
      row.appliedLogicalEventIds
      ?? [];

    if (
      applied.includes(
        logicalEvent.logicalEventId
      )
    ) {
      continue;
    }

    const eventTypes =
      new Set(
        logicalEvent.eventTypes
        ?? []
      );

    if (
      eventTypes.has(
        "LISTING_LEASED"
      )
    ) {
      row.status = "LEASED";

    } else if (
      eventTypes.has(
        "LISTING_SOLD"
      )
    ) {
      row.status = "SOLD";

    } else if (
      eventTypes.has(
        "LISTING_IN_ESCROW"
      )
    ) {
      row.status = "IN_ESCROW";

    } else if (
      eventTypes.has(
        "BACK_ON_MARKET"
      )
      || eventTypes.has(
        "LISTING_CREATED"
      )
      || eventTypes.has(
        "LISTING_OFFERED_FOR_LEASE"
      )
      || eventTypes.has(
        "LISTING_OFFERED_FOR_SALE"
      )
      || eventTypes.has(
        "LISTING_OFFERED_FOR_LEASE_AND_SALE"
      )
      || eventTypes.has(
        "LISTING_OFFERED_FOR_SUBLEASE"
      )
    ) {
      row.status = "AVAILABLE";
    }

    if (
      eventTypes.has(
        "LISTING_SIZE_CHANGED"
      )
      && logicalEvent.availableSf
        !== null
      && logicalEvent.availableSf
        !== undefined
    ) {
      row.marketedSf =
        logicalEvent.availableSf;
    }

    row.lastEventDate =
      logicalEvent.effectiveDate
      ?? row.lastEventDate
      ?? null;

    row.lastEventTypes = [
      ...eventTypes,
    ].sort();

    row.appliedLogicalEventIds = [
      ...applied,
      logicalEvent.logicalEventId,
    ];
  }

  return {
    state,
    unresolved,
  };
}

export function replayIsIdempotent(
  initialState,
  logicalEvents
) {
  const first =
    reduceListingState(
      initialState,
      logicalEvents
    );

  const second =
    reduceListingState(
      first.state,
      logicalEvents
    );

  return {
    idempotent:
      JSON.stringify(first.state)
      === JSON.stringify(second.state),

    first,
    second,
  };
}
