import crypto from "node:crypto";

export const NULLABLE = value => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
};

export function finiteNumberOrNull(value) {
  const v = NULLABLE(value);
  if (v === null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[$,%\s,]/g, "");
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function stableJson(value) {
  if (Array.isArray(value))
    return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value).sort()
      .map(k => `${JSON.stringify(k)}:${stableJson(value[k])}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

export function deterministicId(prefix, payload) {
  const hash = crypto.createHash("sha256")
    .update(stableJson(payload))
    .digest("hex")
    .slice(0,24)
    .toUpperCase();
  return `${prefix}-${hash}`;
}

/* ---------- source provenance ---------- */

export function createSourceDocument({
  sourceSystem,
  sourceKind,
  effectiveDate=null,
  originalName,
  contentSha256,
  metadata={}
}) {
  const identity = {
    sourceSystem,
    sourceKind,
    effectiveDate,
    originalName,
    contentSha256:String(contentSha256).toLowerCase()
  };

  return Object.freeze({
    sourceDocumentId:deterministicId("SRCDOC",identity),
    ...identity,
    metadata:Object.freeze({...metadata})
  });
}

export function createSourceObservation({
  sourceDocumentId,
  recordLocator,
  observedObjectType,
  rawRecord,
  effectiveDate=null,
  sourceKey=null
}) {
  const raw = structuredClone(rawRecord ?? {});
  const identity = {
    sourceDocumentId,
    recordLocator:String(recordLocator),
    observedObjectType,
    sourceKey,
    rawRecord:raw
  };

  return Object.freeze({
    sourceObservationId:deterministicId("OBS",identity),
    ...identity,
    effectiveDate,
    rawRecord:Object.freeze(raw)
  });
}

export function dedupeObservations(observations) {
  const seen=new Set();
  return observations.filter(obs => {
    if (seen.has(obs.sourceObservationId)) return false;
    seen.add(obs.sourceObservationId);
    return true;
  });
}

/* ---------- identity ---------- */

const SUFFIX = new Map([
  ["STREET","ST"],["ST","ST"],
  ["AVENUE","AVE"],["AVE","AVE"],
  ["BOULEVARD","BLVD"],["BLVD","BLVD"],
  ["ROAD","RD"],["RD","RD"],
  ["DRIVE","DR"],["DR","DR"],
  ["PARKWAY","PKWY"],["PKWY","PKWY"],
  ["CIRCLE","CIR"],["CIR","CIR"],
  ["COURT","CT"],["CT","CT"],
  ["LANE","LN"],["LN","LN"]
]);

export function normalizeAddressLine(line) {
  if (line === undefined || line === null) return null;
  let s=String(line).toUpperCase().trim().replace(/\s+/g," ");
  if (!s) return null;
  const parts=s.split(" ")
    .map(t=>t.replace(/[.,#]/g,""))
    .filter(Boolean);
  const last=parts[parts.length-1];
  if (SUFFIX.has(last)) parts[parts.length-1]=SUFFIX.get(last);
  return parts.join(" ");
}

export function normalizeCity(city) {
  const v=NULLABLE(city);
  return v===null ? null : String(v).toUpperCase().trim().replace(/\s+/g," ");
}

export function normalizeZip(zip) {
  const m=String(zip ?? "").match(/\b(\d{5})\b/);
  return m ? m[1] : null;
}

export function buildingIdentityKey({address,city,zip}) {
  const a=normalizeAddressLine(address);
  const c=normalizeCity(city);
  const z=normalizeZip(zip);
  if (!a || !c) return null;
  return `${a}|${c}|${z ?? ""}`;
}

export function parcelIdentityKey(apn) {
  const v=NULLABLE(apn);
  if (v===null) return null;
  const n=String(v).toUpperCase().replace(/[^A-Z0-9]/g,"");
  return n ? `APN|${n}` : null;
}

export function resolveIdentity(observation,candidates,{minimumScore=100}={}) {
  const ranked=candidates.map(candidate=>{
    let score=0;
    const reasons=[];

    if (
      buildingIdentityKey(observation) &&
      buildingIdentityKey(observation)===buildingIdentityKey(candidate)
    ) {
      score+=100;
      reasons.push("EXACT_NORMALIZED_ADDRESS_CITY_ZIP");
    }

    if (
      parcelIdentityKey(observation.apn) &&
      parcelIdentityKey(observation.apn)===parcelIdentityKey(candidate.apn)
    ) {
      score+=120;
      reasons.push("EXACT_APN");
    }

    return {candidate,score,reasons};
  }).filter(x=>x.score>=minimumScore)
    .sort((a,b)=>b.score-a.score ||
      String(a.candidate.assetId ?? "")
        .localeCompare(String(b.candidate.assetId ?? "")));

  if (!ranked.length)
    return {status:"UNRESOLVED",match:null,candidates:[]};

  const tied=ranked.filter(x=>x.score===ranked[0].score);
  if (tied.length!==1)
    return {status:"AMBIGUOUS",match:null,candidates:tied};

  return {status:"RESOLVED",match:ranked[0],candidates:ranked};
}

/* ---------- listing configurations ---------- */

export function createListingConfiguration({
  listingId,
  label=null,
  marketedSf=null,
  spaceIds=[],
  sourceObservationId=null
}) {
  const sf=finiteNumberOrNull(marketedSf);
  if (sf!==null && sf<0) throw new Error("marketedSf must be non-negative");

  const ids=[...new Set(spaceIds.filter(Boolean).map(String))].sort();

  const identity={
    listingId,
    label,
    marketedSf:sf,
    spaceIds:ids,
    sourceObservationId
  };

  return Object.freeze({
    listingConfigurationId:deterministicId("LSTCFG",identity),
    ...identity
  });
}

export function analyzeAvailabilityConfigurations({
  buildingSf=null,
  configurations=[],
  physicalSpaces=[]
}) {
  const bsf=finiteNumberOrNull(buildingSf);

  const marketedConfigurationSfSum=configurations.reduce(
    (sum,c)=>sum+(finiteNumberOrNull(c.marketedSf) ?? 0),0
  );

  const spaceMap=new Map();
  for (const space of physicalSpaces) {
    const sf=finiteNumberOrNull(space.sf);
    if (space.spaceId && sf!==null)
      spaceMap.set(String(space.spaceId),sf);
  }

  let resolvable=configurations.length>0;
  const referenced=new Set();

  for (const cfg of configurations) {
    if (!cfg.spaceIds?.length) {
      resolvable=false;
      continue;
    }

    for (const id of cfg.spaceIds) {
      if (!spaceMap.has(String(id))) {
        resolvable=false;
      } else {
        referenced.add(String(id));
      }
    }
  }

  const uniqueAvailableSf=resolvable
    ? [...referenced].reduce((sum,id)=>sum+spaceMap.get(id),0)
    : null;

  let overlapStatus="NO_EVIDENCE_OF_OVERLAP";

  if (!configurations.length)
    overlapStatus="NO_CONFIGURATIONS";
  else if (
    uniqueAvailableSf!==null &&
    marketedConfigurationSfSum>uniqueAvailableSf
  )
    overlapStatus="RESOLVED_OVERLAP";
  else if (
    bsf!==null &&
    marketedConfigurationSfSum>bsf &&
    uniqueAvailableSf===null
  )
    overlapStatus="OVERLAP_UNRESOLVED";

  return {
    buildingSf:bsf,
    marketedConfigurationSfSum,
    uniqueAvailableSf,
    marketedExceedsBuilding:
      bsf!==null && marketedConfigurationSfSum>bsf,
    uniqueExceedsBuilding:
      bsf!==null && uniqueAvailableSf!==null && uniqueAvailableSf>bsf,
    overlapStatus
  };
}

/* ---------- Supersheet event semantics ---------- */

const EVENT_RULES=[
  [/^NEW LISTING$/i,"LISTING_CREATED"],
  [/^FOR LEASE$/i,"LISTING_OFFERED_FOR_LEASE"],
  [/^FOR SALE$/i,"LISTING_OFFERED_FOR_SALE"],
  [/^FOR LEASE & SALE$/i,"LISTING_OFFERED_FOR_LEASE_AND_SALE"],
  [/^FOR SUBLEASE$/i,"LISTING_OFFERED_FOR_SUBLEASE"],
  [/^RATE REDUCED$/i,"RATE_CHANGED"],
  [/^NEW RATE$/i,"RATE_CHANGED"],
  [/^PRICE REDUCED$/i,"PRICE_CHANGED"],
  [/^RATE & PRICE REDUCED$/i,"RATE_AND_PRICE_CHANGED"],
  [/^UPDATED INFORMATION$/i,"LISTING_INFORMATION_UPDATED"],
  [/^UPDATED PROPERTY INFORMATION$/i,"LISTING_INFORMATION_UPDATED"],
  [/^NEW SIZE$/i,"LISTING_SIZE_CHANGED"],
  [/^BACK ON MARKET$/i,"BACK_ON_MARKET"],
  [/^LEASED$/i,"LISTING_LEASED"],
  [/^SOLD$/i,"LISTING_SOLD"],
  [/^IN ESCROW$/i,"LISTING_IN_ESCROW"]
];

export function classifySupersheetChange(label) {
  const sourceLabel=String(label ?? "").trim();
  for (const [pattern,eventType] of EVENT_RULES)
    if (pattern.test(sourceLabel))
      return {eventType,sourceLabel};

  return {eventType:"UNCLASSIFIED",sourceLabel};
}

export function makeEvent({
  listingId,
  eventType,
  effectiveDate=null,
  payload={},
  sourceObservationIds=[]
}) {
  const identity={
    listingId,
    eventType,
    effectiveDate,
    payload,
    sourceObservationIds:[...sourceObservationIds].sort()
  };

  return {
    eventId:deterministicId("EVT",identity),
    ...identity
  };
}

export function emptyListingState(listingId) {
  return {
    listingId,
    status:"UNKNOWN",
    rate:null,
    price:null,
    marketedSf:null,
    vacant:null,
    possession:null,
    lastEventDate:null,
    appliedEventIds:[]
  };
}

export function applyListingEvent(state,event) {
  const current=state
    ? structuredClone(state)
    : emptyListingState(event.listingId);

  current.appliedEventIds=[...(current.appliedEventIds ?? [])];

  if (current.appliedEventIds.includes(event.eventId))
    return current;

  // Comparable events remain transaction history only.
  if (String(event.eventType ?? "").startsWith("TRANSACTION_")) {
    current.appliedEventIds.push(event.eventId);
    return current;
  }

  switch(event.eventType) {
    case "LISTING_CREATED":
    case "LISTING_OFFERED_FOR_LEASE":
    case "LISTING_OFFERED_FOR_SALE":
    case "LISTING_OFFERED_FOR_LEASE_AND_SALE":
    case "LISTING_OFFERED_FOR_SUBLEASE":
    case "BACK_ON_MARKET":
      current.status="AVAILABLE";
      break;

    case "LISTING_LEASED":
      current.status="LEASED";
      break;

    case "LISTING_SOLD":
      current.status="SOLD";
      break;

    case "LISTING_IN_ESCROW":
      current.status="IN_ESCROW";
      break;

    case "RATE_CHANGED":
      if ("rate" in (event.payload ?? {}))
        current.rate=event.payload.rate ?? null;
      break;

    case "PRICE_CHANGED":
      if ("price" in (event.payload ?? {}))
        current.price=event.payload.price ?? null;
      break;

    case "RATE_AND_PRICE_CHANGED":
      if ("rate" in (event.payload ?? {}))
        current.rate=event.payload.rate ?? null;
      if ("price" in (event.payload ?? {}))
        current.price=event.payload.price ?? null;
      break;

    case "LISTING_SIZE_CHANGED":
      if ("marketedSf" in (event.payload ?? {}))
        current.marketedSf=event.payload.marketedSf ?? null;
      break;

    case "LISTING_INFORMATION_UPDATED":
      for (const key of [
        "rate","price","marketedSf","vacant","possession"
      ]) {
        if (key in (event.payload ?? {}))
          current[key]=event.payload[key] ?? null;
      }
      break;
  }

  current.lastEventDate=event.effectiveDate ?? current.lastEventDate;
  current.appliedEventIds.push(event.eventId);
  return current;
}

export function reduceListingEvents(listingId,events,initialState=null) {
  const sorted=[...events].sort((a,b)=>
    String(a.effectiveDate ?? "").localeCompare(
      String(b.effectiveDate ?? "")
    ) ||
    String(a.eventId).localeCompare(String(b.eventId))
  );

  return sorted.reduce(
    (state,event)=>applyListingEvent(state,event),
    initialState ?? emptyListingState(listingId)
  );
}

// Critical governance rule:
// absence from a daily Supersheet is a NO-OP, not withdrawal.
export function applyDailyFeed(stateByListingId,dailyEvents) {
  const output=new Map(
    stateByListingId instanceof Map
      ? stateByListingId
      : Object.entries(stateByListingId ?? {})
  );

  const grouped=new Map();

  for (const event of dailyEvents) {
    if (!grouped.has(event.listingId))
      grouped.set(event.listingId,[]);
    grouped.get(event.listingId).push(event);
  }

  for (const [listingId,events] of grouped)
    output.set(
      listingId,
      reduceListingEvents(
        listingId,
        events,
        output.get(listingId) ?? null
      )
    );

  return output;
}

/* ---------- adapters ---------- */

function first(row,names) {
  for (const name of names)
    if (Object.prototype.hasOwnProperty.call(row,name))
      return row[name];
  return null;
}

export function adaptAirBaseRow(row) {
  const address=NULLABLE(first(row,[
    "Property Address","Address","address"
  ]));
  const city=NULLABLE(first(row,["City","city"]));
  const zip=NULLABLE(first(row,["Zip","ZIP","Zip Code","zip"]));

  return {
    authority:"AIR_BASE_INVENTORY",
    address,
    city,
    zip,
    identityKey:buildingIdentityKey({address,city,zip}),
    physical:{
      buildingSf:finiteNumberOrNull(
        first(row,["Building SF","Bldg SF","buildingSf"])
      ),
      landAcres:finiteNumberOrNull(
        first(row,["Land Acres","landAcres"])
      ),
      yearBuilt:finiteNumberOrNull(
        first(row,["Year Built","yearBuilt"])
      ),
      zoning:NULLABLE(first(row,["Zoning","zoning"])),
      amps:finiteNumberOrNull(
        first(row,["Amps","Power","amps"])
      )
    },
    sourceMarketObservation:{
      totalAvailableSpace:finiteNumberOrNull(
        first(row,[
          "Total Available Space",
          "Available SF",
          "availableSf"
        ])
      ),
      warning:
        "AIR Total Available Space may contain overlapping marketing configurations."
    },
    raw:structuredClone(row)
  };
}

export function adaptCurrentAvailabilityRow(row) {
  const listingNumber=NULLABLE(
    row.listingNumber ??
    row["Listing #"] ??
    row.listing_no
  );

  return {
    authority:"AIR_CURRENT_AVAILABILITY_RECONCILIATION_SNAPSHOT",
    listingId:listingNumber
      ? `AIR-LISTING-${String(listingNumber).trim()}`
      : null,
    listingNumber,
    marketedSf:finiteNumberOrNull(
      row.availableSf ?? row["Available SF"]
    ),
    buildingSf:finiteNumberOrNull(
      row.buildingSf ?? row["Bldg SF"]
    ),
    vacant:
      row.vacant ??
      row["Is Vacant"] ??
      null,
    status:NULLABLE(
      row.status ?? row["Listing Status"]
    ),
    rate:NULLABLE(
      row.rate ?? row["Rate/SF"]
    ),
    possession:NULLABLE(
      row.possession ?? row.Possession
    ),
    raw:structuredClone(row)
  };
}

export function adaptComparableRow(row) {
  const transactionType=String(
    row.transactionType ??
    row.type ??
    row["Transaction Type"] ??
    ""
  ).toUpperCase().trim() || "UNKNOWN";

  const payload={
    transactionType,
    address:NULLABLE(row.address ?? row.Address),
    city:NULLABLE(row.city ?? row.City),
    transactionDate:NULLABLE(row.date ?? row.Date),
    compSf:finiteNumberOrNull(
      row.compSf ?? row["Comp SF"] ?? row.sf
    ),
    rate:NULLABLE(row.rate ?? row.Rate),
    price:finiteNumberOrNull(row.price ?? row.Price),
    tenant:NULLABLE(row.tenant ?? row.Tenant),
    buyer:NULLABLE(row.buyer ?? row.Buyer),
    seller:NULLABLE(row.seller ?? row.Seller)
  };

  return {
    authority:"COMPARABLE_TRANSACTION_HISTORY",
    transactionId:deterministicId("TXN",payload),
    ...payload,
    mutatesCurrentAvailability:false,
    raw:structuredClone(row)
  };
}

/* ---------- reconciliation ---------- */

export function reconcileListingState({
  derivedStateByListingId,
  snapshotRows
}) {
  const derived=derivedStateByListingId instanceof Map
    ? derivedStateByListingId
    : new Map(Object.entries(derivedStateByListingId ?? {}));

  const results=[];

  for (const row of snapshotRows) {
    const state=derived.get(row.listingId) ?? null;
    const differences=[];

    if (!state) {
      differences.push({
        field:"listingId",
        kind:"MISSING_DERIVED_LISTING"
      });
    } else {
      for (const field of [
        "status","rate","price",
        "marketedSf","vacant","possession"
      ]) {
        if (
          field in row &&
          row[field] !== undefined &&
          row[field] !== state[field]
        ) {
          differences.push({
            field,
            kind:"VALUE_MISMATCH",
            snapshot:row[field],
            derived:state[field]
          });
        }
      }
    }

    results.push({
      listingId:row.listingId,
      matched:differences.length===0,
      differences
    });
  }

  return {
    rowsCompared:snapshotRows.length,
    matchedRows:results.filter(r=>r.matched).length,
    mismatchedRows:results.filter(r=>!r.matched).length,
    results
  };
}

/* ---------- governed geography ---------- */

export function createGeographyAuthority(rows) {
  const records=rows.map((r,index)=>({
    geographyId:r.geographyId ?? `AIR-GEO-${index+1}`,
    market:r.market ?? null,
    submarket:r.submarket ?? null,
    city:r.city ?? null
  }));

  return {
    records,
    resolveExact({market,submarket,city}) {
      const matches=records.filter(r=>
        r.market===market &&
        r.submarket===submarket &&
        r.city===city
      );

      if (matches.length===1)
        return {status:"RESOLVED",match:matches[0]};

      if (!matches.length)
        return {status:"UNRESOLVED",match:null};

      return {
        status:"AMBIGUOUS",
        match:null,
        candidates:matches
      };
    }
  };
}
