import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeAddressLine,
  resolveIdentity,
  createListingConfiguration,
  analyzeAvailabilityConfigurations,
  makeEvent,
  reduceListingEvents,
  applyDailyFeed,
  emptyListingState,
  adaptCurrentAvailabilityRow,
  adaptComparableRow,
  classifySupersheetChange
} from "../core.mjs";

test("address normalization is deterministic",()=>{
  assert.equal(
    normalizeAddressLine("4250 Shirley Avenue"),
    "4250 SHIRLEY AVE"
  );

  assert.equal(
    normalizeAddressLine("4250  Shirley Ave."),
    "4250 SHIRLEY AVE"
  );
});

test("identity resolver does not arbitrarily choose ties",()=>{
  const result=resolveIdentity(
    {
      address:"100 Test St",
      city:"Los Angeles",
      zip:"90001"
    },
    [
      {
        assetId:"A1",
        address:"100 Test Street",
        city:"Los Angeles",
        zip:"90001"
      },
      {
        assetId:"A2",
        address:"100 Test St",
        city:"Los Angeles",
        zip:"90001"
      }
    ]
  );

  assert.equal(result.status,"AMBIGUOUS");
  assert.equal(result.match,null);
});

test("1400 E Olympic B/C/B+C resolves physical union without double counting",()=>{
  const configurations=[
    createListingConfiguration({
      listingId:"B",
      marketedSf:19000,
      spaceIds:["B"]
    }),
    createListingConfiguration({
      listingId:"C",
      marketedSf:21500,
      spaceIds:["C"]
    }),
    createListingConfiguration({
      listingId:"BC",
      marketedSf:40500,
      spaceIds:["B","C"]
    })
  ];

  const result=analyzeAvailabilityConfigurations({
    buildingSf:65025,
    configurations,
    physicalSpaces:[
      {spaceId:"B",sf:19000},
      {spaceId:"C",sf:21500}
    ]
  });

  assert.equal(
    result.marketedConfigurationSfSum,
    81000
  );

  assert.equal(
    result.uniqueAvailableSf,
    40500
  );

  assert.equal(
    result.overlapStatus,
    "RESOLVED_OVERLAP"
  );

  assert.equal(
    result.uniqueExceedsBuilding,
    false
  );
});

test("4250 Shirley overlap is preserved unresolved rather than clamped or guessed",()=>{
  const configurations=[
    createListingConfiguration({
      listingId:"L1",
      marketedSf:194807
    }),
    createListingConfiguration({
      listingId:"L2",
      marketedSf:363417
    }),
    createListingConfiguration({
      listingId:"L3",
      marketedSf:168610
    })
  ];

  const result=analyzeAvailabilityConfigurations({
    buildingSf:663100,
    configurations
  });

  assert.equal(
    result.marketedConfigurationSfSum,
    726834
  );

  assert.equal(
    result.marketedExceedsBuilding,
    true
  );

  assert.equal(
    result.uniqueAvailableSf,
    null
  );

  assert.equal(
    result.overlapStatus,
    "OVERLAP_UNRESOLVED"
  );
});

test("Available and Vacant=false remain distinct states",()=>{
  const row=adaptCurrentAvailabilityRow({
    "Listing #":"45717245",
    "Available SF":"100,000",
    "Bldg SF":"205,435",
    "Is Vacant":false,
    "Listing Status":"AVAILABLE"
  });

  assert.equal(row.marketedSf,100000);
  assert.equal(row.buildingSf,205435);
  assert.equal(row.vacant,false);
  assert.equal(row.status,"AVAILABLE");
});

test("Supersheet absence does not withdraw listing",()=>{
  const before=new Map([
    [
      "L1",
      {
        ...emptyListingState("L1"),
        status:"AVAILABLE",
        appliedEventIds:[]
      }
    ]
  ]);

  const after=applyDailyFeed(before,[]);

  assert.equal(
    after.get("L1").status,
    "AVAILABLE"
  );
});

test("event replay is idempotent",()=>{
  const event=makeEvent({
    listingId:"L1",
    eventType:"RATE_CHANGED",
    effectiveDate:"2026-10-14",
    payload:{rate:"$1.10 G"}
  });

  const once=reduceListingEvents(
    "L1",
    [event]
  );

  const twice=reduceListingEvents(
    "L1",
    [event,event]
  );

  assert.deepEqual(twice,once);
});

test("comparable lease does not mutate current listing state",()=>{
  const initial={
    ...emptyListingState("L1"),
    status:"AVAILABLE",
    rate:"$1.25 NNN",
    appliedEventIds:[]
  };

  const transaction=makeEvent({
    listingId:"L1",
    eventType:"TRANSACTION_LEASE_RECORDED",
    effectiveDate:"2026-10-14",
    payload:{rate:"$0.75 NNN"}
  });

  const after=reduceListingEvents(
    "L1",
    [transaction],
    initial
  );

  assert.equal(after.status,"AVAILABLE");
  assert.equal(after.rate,"$1.25 NNN");
});

test("comparable adapter marks transaction as non-mutating",()=>{
  const comp=adaptComparableRow({
    transactionType:"LEASE",
    Address:"100 Test St",
    "Comp SF":50000,
    Rate:"$1.00 NNN"
  });

  assert.equal(
    comp.mutatesCurrentAvailability,
    false
  );
});

test("Supersheet classifier retains explicit event meanings",()=>{
  assert.equal(
    classifySupersheetChange("Leased").eventType,
    "LISTING_LEASED"
  );

  assert.equal(
    classifySupersheetChange("Sold").eventType,
    "LISTING_SOLD"
  );

  assert.equal(
    classifySupersheetChange("Rate Reduced").eventType,
    "RATE_CHANGED"
  );

  assert.equal(
    classifySupersheetChange("Something New").eventType,
    "UNCLASSIFIED"
  );
});
