
import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAirAssetIndex,
  buildListingIndex,
  canonicalListingAddress,
  parseStreetAddress,
  resolveAirAsset,
  resolveListingIdentity,
} from "../identityGraph.mjs";

import {
  extractAirRecordContext,
  parseAirBaseCsv,
  parseCurrentAvailabilityText,
  parseSupersheetText,
} from "../realSourceParser.mjs";

import {
  groupLogicalEventObservations,
  replayIsIdempotent,
} from "../logicalEventResolver.mjs";

test(
  "spaced AIR range address contains point listing address",
  () => {
    const rows = [
      {
        airRowId: "ASSET-SHIRLEY",
        address:
          "4200 - 4250 Shirley Ave, El Monte, CA",
        zip: "91731",
        buildingSf: 663100,
      },

      {
        airRowId: "ASSET-SHIRLEY-4300",
        address:
          "4300 Shirley Ave, El Monte, CA",
        zip: "91731",
        buildingSf: 572240,
      },
    ];

    const parsed =
      parseStreetAddress(
        rows[0].address
      );

    assert.equal(
      parsed.lowNumber,
      4200
    );

    assert.equal(
      parsed.highNumber,
      4250
    );

    assert.equal(
      parsed.streetName,
      "SHIRLEY AVE"
    );

    const resolution =
      resolveAirAsset(
        {
          address:
            "4250 Shirley Ave",
          zip: "91731",
          buildingSf: 663100,
        },
        buildAirAssetIndex(rows)
      );

    assert.equal(
      resolution.status,
      "RESOLVED"
    );

    assert.equal(
      resolution.assetId,
      "ASSET-SHIRLEY"
    );
  }
);

test(
  "exact controls resolve without fuzzy matching",
  () => {
    const rows = [
      {
        airRowId: "VERNON",
        address:
          "3305 E Vernon Ave, Vernon, CA",
        zip: "90058",
        buildingSf: 103633,
      },

      {
        airRowId: "WHITTIER",
        address:
          "12252 Whittier Blvd, Whittier, CA",
        zip: "90606",
        buildingSf: 161610,
      },
    ];

    const index =
      buildAirAssetIndex(rows);

    assert.equal(
      resolveAirAsset(
        {
          address:
            "3305 E Vernon Ave",
          zip: "90058",
          buildingSf: 103633,
        },
        index
      ).assetId,
      "VERNON"
    );

    assert.equal(
      resolveAirAsset(
        {
          address:
            "12252 Whittier Blvd",
          zip: "90606",
          buildingSf: 161610,
        },
        index
      ).assetId,
      "WHITTIER"
    );
  }
);

test(
  "building below base threshold is classified outside universe",
  () => {
    const resolution =
      resolveAirAsset(
        {
          address:
            "100 Example St",
          zip: "90001",
          buildingSf: 42000,
        },
        buildAirAssetIndex([])
      );

    assert.equal(
      resolution.status,
      "OUTSIDE_BASE_UNIVERSE"
    );
  }
);

test(
  "missing building SF does not become zero or forced asset match",
  () => {
    const resolution =
      resolveAirAsset(
        {
          address:
            "999 Missing St",
          zip: "90001",
          buildingSf: null,
        },
        buildAirAssetIndex([])
      );

    assert.equal(
      resolution.status,
      "UNRESOLVED_INSUFFICIENT_IDENTITY_EVIDENCE"
    );
  }
);

test(
  "Supersheet parser separates Office SF from Building SF",
  () => {
    const lines = [
      "2 Goodman Logistics Center 194,807 SF TBD 28/0 Existing 36'",
      "4250 Shirley Ave Yes NFS ESFR Available 3200/4000",
      "El Monte, CA 91731 1,820 SF 663,100 SF Fncd/Pvd Now",
      "Marketing Flyer",
      "JLL - broker",
      "",
      "New Listing Class A Distribution Building",
      "For Lease",
    ];

    const ctx =
      extractAirRecordContext(
        lines,
        6
      );

    assert.equal(
      ctx.availableSf,
      194807
    );

    assert.equal(
      ctx.officeSf,
      1820
    );

    assert.equal(
      ctx.buildingSf,
      663100
    );
  }
);

test(
  "AIR Total Available Space is preserved even when greater than building SF",
  () => {
    const csv = [
      "Address,Submarket,Building Size / SF,Total Available Space,Postal Code",
      "\"4200 - 4250 Shirley Ave, El Monte, CA\",AIR - West SGV,\"663,100\",\"726,834\",91731",
    ].join("\n");

    const rows =
      parseAirBaseCsv(
        csv,
        {
          sourceFile:
            "fixture.csv",
        }
      );

    assert.equal(
      rows.length,
      1
    );

    assert.equal(
      rows[0].buildingSf,
      663100
    );

    assert.equal(
      rows[0].totalAvailableSpace,
      726834
    );
  }
);

test(
  "listing configuration identity remains separate at one physical asset",
  () => {
    const rows = [
      {
        listingId: "B",
        listingNumber: "1001",
        address:
          "1400 E Olympic Blvd, Unit B",
        availableSf: 19000,
      },

      {
        listingId: "C",
        listingNumber: "1002",
        address:
          "1400 E Olympic Blvd, Unit C",
        availableSf: 21500,
      },

      {
        listingId: "BC",
        listingNumber: "1003",
        address:
          "1400 E Olympic Blvd, Unit B & C",
        availableSf: 40500,
      },
    ];

    const index =
      buildListingIndex(rows);

    const b =
      resolveListingIdentity(
        {
          address:
            "1400 E Olympic Blvd, Unit B",
          availableSf: 19000,
        },
        index
      );

    const c =
      resolveListingIdentity(
        {
          address:
            "1400 E Olympic Blvd, Unit C",
          availableSf: 21500,
        },
        index
      );

    const bc =
      resolveListingIdentity(
        {
          address:
            "1400 E Olympic Blvd, Unit B & C",
          availableSf: 40500,
        },
        index
      );

    assert.equal(
      b.listingId,
      "B"
    );

    assert.equal(
      c.listingId,
      "C"
    );

    assert.equal(
      bc.listingId,
      "BC"
    );

    assert.notEqual(
      canonicalListingAddress(
        rows[0].address
      ),
      canonicalListingAddress(
        rows[1].address
      )
    );

    assert.equal(
      19000 + 21500 + 40500,
      81000
    );
  }
);

test(
  "paired source labels become one logical record while preserving observations",
  () => {
    const text = [
      "1 194,807 SF TBD 28/0 Existing 36'",
      "4250 Shirley Ave Yes NFS ESFR Available",
      "El Monte, CA 91731 1,820 SF 663,100 SF",
      "Marketing Flyer",
      "Broker",
      "",
      "New Listing Class A Distribution Building",
      "For Lease",
    ].join("\n");

    const observations =
      parseSupersheetText(
        text,
        {
          sourceFile:
            "fixture.pdf",

          sourceSha256:
            "abc",

          effectiveDate:
            "2026-10-15",
        }
      );

    assert.equal(
      observations.length,
      2
    );

    const logical =
      groupLogicalEventObservations(
        observations
      );

    assert.equal(
      logical.length,
      1
    );

    assert.equal(
      logical[0].observationCount,
      2
    );

    assert.equal(
      logical[0].observationIds.length,
      2
    );
  }
);

test(
  "current availability parser preserves AIR listing number",
  () => {
    const text = [
      "1 194,807 SF TBD 28/0 Existing 36'",
      "4250 Shirley Ave 1,820 SF NFS ESFR Available",
      "El Monte, CA 91731 663,100 SF",
      "AIR - West SGV Is Vacant: Yes",
      "Call broker Listing #: 45764817 Mos on Mkt: 0",
    ].join("\n");

    const rows =
      parseCurrentAvailabilityText(
        text,
        {
          sourceFile:
            "fixture.pdf",
        }
      );

    assert.equal(
      rows.length,
      1
    );

    assert.equal(
      rows[0].listingNumber,
      "45764817"
    );

    assert.equal(
      rows[0].buildingSf,
      663100
    );
  }
);

test(
  "logical replay is idempotent and empty feed is a no-op",
  () => {
    const state = {
      "AIR-LISTING-1": {
        listingId:
          "AIR-LISTING-1",

        status:
          "AVAILABLE",

        marketedSf:
          50000,

        appliedLogicalEventIds:
          [],
      },
    };

    const events = [
      {
        logicalEventId:
          "LOGICAL-1",

        listingId:
          "AIR-LISTING-1",

        effectiveDate:
          "2026-10-15",

        eventTypes: [
          "LISTING_LEASED",
        ],
      },
    ];

    const replay =
      replayIsIdempotent(
        state,
        events
      );

    assert.equal(
      replay.idempotent,
      true
    );

    assert.equal(
      replay.first.state[
        "AIR-LISTING-1"
      ].status,
      "LEASED"
    );

    const empty =
      replayIsIdempotent(
        state,
        []
      );

    assert.equal(
      empty.idempotent,
      true
    );

    assert.deepEqual(
      empty.first.state,
      state
    );
  }
);


test(
  "separate source records at same address remain separate logical events",
  () => {
    const observations = [
      {
        observationId: "OBS-A1",
        sourceFile: "fixture.pdf",
        sourceSha256: "abc",
        sourceLine: 10,
        sourceRecordAnchor: 4,
        effectiveDate: "2026-10-15",
        address: "4250 Shirley Ave",
        zip: "91731",
        availableSf: 194807,
        eventType: "LISTING_CREATED",
        sourceLabel: "NEW LISTING",
      },

      {
        observationId: "OBS-A2",
        sourceFile: "fixture.pdf",
        sourceSha256: "abc",
        sourceLine: 11,
        sourceRecordAnchor: 4,
        effectiveDate: "2026-10-15",
        address: "4250 Shirley Ave",
        zip: "91731",
        availableSf: 194807,
        eventType: "LISTING_OFFERED_FOR_LEASE",
        sourceLabel: "FOR LEASE",
      },

      {
        observationId: "OBS-B1",
        sourceFile: "fixture.pdf",
        sourceSha256: "abc",
        sourceLine: 22,
        sourceRecordAnchor: 16,
        effectiveDate: "2026-10-15",
        address: "4250 Shirley Ave",
        zip: "91731",
        availableSf: 168610,
        eventType: "LISTING_CREATED",
        sourceLabel: "NEW LISTING",
      },

      {
        observationId: "OBS-B2",
        sourceFile: "fixture.pdf",
        sourceSha256: "abc",
        sourceLine: 23,
        sourceRecordAnchor: 16,
        effectiveDate: "2026-10-15",
        address: "4250 Shirley Ave",
        zip: "91731",
        availableSf: 168610,
        eventType: "LISTING_OFFERED_FOR_LEASE",
        sourceLabel: "FOR LEASE",
      },
    ];

    const logical =
      groupLogicalEventObservations(
        observations
      );

    assert.equal(
      logical.length,
      2
    );

    assert.deepEqual(
      logical
        .map(
          (x) =>
            x.observationCount
        )
        .sort(),
      [2, 2]
    );
  }
);


test(
  "Supersheet structural row anchor binds paired labels and separates adjacent records",
  () => {
    const text = [
      "1 194,807 SF TBD 28/0 Existing 36'",
      "4250 Shirley Ave Yes NFS ESFR Available",
      "El Monte, CA 91731 1,820 SF 663,100 SF",
      "Marketing Flyer",
      "",
      "New Listing Class A Distribution Building",
      "For Lease",
      "",
      "2 168,610 SF TBD 17/1 Existing 36'",
      "4250 Shirley Ave Yes NFS ESFR Available",
      "El Monte, CA 91731 9,176 SF 663,100 SF",
      "Marketing Flyer",
      "",
      "New Listing Class A Distribution Building",
      "For Lease",
    ].join("\n");

    const observations =
      parseSupersheetText(
        text,
        {
          sourceFile:
            "fixture.pdf",

          sourceSha256:
            "abc",

          effectiveDate:
            "2026-10-15",
        }
      );

    assert.equal(
      observations.length,
      4
    );

    assert.equal(
      observations[0].sourceRecordAnchor,
      observations[1].sourceRecordAnchor
    );

    assert.equal(
      observations[2].sourceRecordAnchor,
      observations[3].sourceRecordAnchor
    );

    assert.notEqual(
      observations[0].sourceRecordAnchor,
      observations[2].sourceRecordAnchor
    );

    const logical =
      groupLogicalEventObservations(
        observations
      );

    assert.equal(
      logical.length,
      2
    );

    assert.deepEqual(
      logical
        .map(
          (x) =>
            x.observationCount
        )
        .sort(),
      [2, 2]
    );
  }
);


test(
  "PDF form feeds do not change Supersheet structural record ordinals",
  () => {
    const page1 = [
      "1 194,807 SF TBD 28/0 Existing 36'",
      "4250 Shirley Ave Yes NFS ESFR Available",
      "El Monte, CA 91731 1,820 SF 663,100 SF",
      "Marketing Flyer",
      "",
      "New Listing Class A Distribution Building",
      "For Lease",
    ].join("\n");

    const page2 = [
      "2 168,610 SF TBD 17/1 Existing 36'",
      "4250 Shirley Ave Yes NFS ESFR Available",
      "El Monte, CA 91731 9,176 SF 663,100 SF",
      "Marketing Flyer",
      "",
      "New Listing Class A Distribution Building",
      "For Lease",
    ].join("\n");

    const observations =
      parseSupersheetText(
        page1 + "\f" + page2,
        {
          sourceFile:
            "fixture.pdf",

          sourceSha256:
            "abc",

          effectiveDate:
            "2026-10-15",
        }
      );

    assert.equal(
      observations.length,
      4
    );

    assert.deepEqual(
      observations.map(
        (x) =>
          x.sourceRecordOrdinal
      ),
      [1, 1, 2, 2]
    );

    const logical =
      groupLogicalEventObservations(
        observations
      );

    assert.equal(
      logical.length,
      2
    );

    assert.deepEqual(
      logical
        .map(
          (x) =>
            x.observationCount
        )
        .sort(),
      [2, 2]
    );
  }
);
