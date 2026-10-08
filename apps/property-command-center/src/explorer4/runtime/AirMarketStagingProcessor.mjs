
export const AIR_STAGING_PROCESSOR_VERSION = "AIR_STAGING_PROCESSOR_V1";
export const WRITE_DISPOSITION = "PROPOSE_ONLY";

const blank = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const text = (v) => blank(v) ? null : String(v).trim();
const upper = (v) => text(v)?.toUpperCase() ?? null;
const compact = (v) => upper(v)?.replace(/[.,#]/g, "").replace(/\s+/g, " ").trim() ?? null;

function normalizeAddress(v) {
  const s = compact(v);
  if (!s) return null;
  return s
    .replace(/\bSTREET\b/g,"ST").replace(/\bROAD\b/g,"RD").replace(/\bAVENUE\b/g,"AVE")
    .replace(/\bBOULEVARD\b/g,"BLVD").replace(/\bDRIVE\b/g,"DR").replace(/\bLANE\b/g,"LN")
    .replace(/\bHIGHWAY\b/g,"HWY").replace(/\bPARKWAY\b/g,"PKWY").replace(/\bPLACE\b/g,"PL")
    .replace(/\bCOURT\b/g,"CT").replace(/\bCIRCLE\b/g,"CIR").replace(/\bTERRACE\b/g,"TER");
}
function numberOrNull(v) {
  if (blank(v)) return null;
  const n = Number(String(v).replace(/[$,%\s,]/g,""));
  return Number.isFinite(n) ? n : null;
}
function bool(v) {
  if (v === true || v === false) return v;
  const s = upper(v);
  return ["YES","Y","TRUE","1","LEASED","SOLD"].includes(s ?? "");
}
export function normalizeAirRow(rawRow = {}) {
  const n = {
    address: text(rawRow.address),
    normalizedAddress: normalizeAddress(rawRow.address),
    city: text(rawRow.city),
    normalizedCity: upper(rawRow.city),
    state: upper(rawRow.state),
    postalCode: text(rawRow.postalCode)?.replace(/\D/g,"").slice(0,5) ?? null,
    latitude: numberOrNull(rawRow.latitude),
    longitude: numberOrNull(rawRow.longitude),
    APN: text(rawRow.APN ?? rawRow.apn),
    sourcePropertyId: text(rawRow.sourcePropertyId),
    availableSf: numberOrNull(rawRow.availableSf),
    buildingSf: numberOrNull(rawRow.buildingSf),
    askingRent: numberOrNull(rawRow.askingRent),
    askingSalePrice: numberOrNull(rawRow.askingSalePrice),
    leaseSaleStatus: text(rawRow.leaseSaleStatus),
    listingStatus: text(rawRow.listingStatus),
    availabilityDate: text(rawRow.availabilityDate),
    listingBroker: text(rawRow.listingBroker),
    listingCompany: text(rawRow.listingCompany),
    explicitLeaseSignal: bool(rawRow.explicitLeaseSignal),
    explicitSaleSignal: bool(rawRow.explicitSaleSignal)
  };
  return n;
}
export function normalizedIdentity(n) {
  return [n.normalizedAddress, n.normalizedCity, n.postalCode].filter(Boolean).join("|");
}
function __sciipR12rotr(n,x){return (x>>>n)|(x<<(32-n));}
const __SCIIP_R12_SHA256_K=[
0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
export function sha256(s){
 const bytes=new TextEncoder().encode(String(s)),bitLen=BigInt(bytes.length)*8n,total=Math.ceil((bytes.length+9)/64)*64;
 const b=new Uint8Array(total);b.set(bytes);b[bytes.length]=0x80;
 for(let i=0;i<8;i++)b[total-1-i]=Number((bitLen>>BigInt(i*8))&255n);
 const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],w=new Uint32Array(64);
 for(let o=0;o<total;o+=64){
  for(let i=0;i<16;i++){const j=o+i*4;w[i]=((b[j]<<24)|(b[j+1]<<16)|(b[j+2]<<8)|b[j+3])>>>0;}
  for(let i=16;i<64;i++){const x=w[i-15],y=w[i-2],s0=(__sciipR12rotr(7,x)^__sciipR12rotr(18,x)^(x>>>3))>>>0,s1=(__sciipR12rotr(17,y)^__sciipR12rotr(19,y)^(y>>>10))>>>0;w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;}
  let A=h[0],B=h[1],C=h[2],D=h[3],E=h[4],F=h[5],G=h[6],H=h[7];
  for(let i=0;i<64;i++){const S1=(__sciipR12rotr(6,E)^__sciipR12rotr(11,E)^__sciipR12rotr(25,E))>>>0,ch=((E&F)^((~E)&G))>>>0,t1=(H+S1+ch+__SCIIP_R12_SHA256_K[i]+w[i])>>>0,S0=(__sciipR12rotr(2,A)^__sciipR12rotr(13,A)^__sciipR12rotr(22,A))>>>0,maj=((A&B)^(A&C)^(B&C))>>>0,t2=(S0+maj)>>>0;H=G;G=F;F=E;E=(D+t1)>>>0;D=C;C=B;B=A;A=(t1+t2)>>>0;}
  h[0]=(h[0]+A)>>>0;h[1]=(h[1]+B)>>>0;h[2]=(h[2]+C)>>>0;h[3]=(h[3]+D)>>>0;h[4]=(h[4]+E)>>>0;h[5]=(h[5]+F)>>>0;h[6]=(h[6]+G)>>>0;h[7]=(h[7]+H)>>>0;
 }
 return h.map(x=>x.toString(16).padStart(8,"0")).join("");
}
export function makeSourceRecordKey({sourceFileHash, sourceRowNumber, normalizedRow, observationDate}) {
  return sha256([sourceFileHash, sourceRowNumber, normalizedIdentity(normalizedRow), observationDate].join("|"));
}
function inventoryFields(r) {
  const address = r.address ?? r.propertyAddress ?? r.streetAddress;
  const city = r.city;
  const postalCode = r.postalCode ?? r.zip ?? r.zipCode;
  return {
    id: r.id ?? r.canonicalPropertyId,
    address, normalizedAddress: normalizeAddress(address),
    city, normalizedCity: upper(city),
    postalCode: text(postalCode)?.replace(/\D/g,"").slice(0,5) ?? null,
    latitude: numberOrNull(r.latitude), longitude: numberOrNull(r.longitude),
    APN: text(r.APN ?? r.apn), sourcePropertyId: text(r.sourcePropertyId)
  };
}
function distanceMeters(a,b) {
  if (![a.latitude,a.longitude,b.latitude,b.longitude].every(Number.isFinite)) return Infinity;
  const R=6371000, rad=x=>x*Math.PI/180, dLat=rad(b.latitude-a.latitude), dLon=rad(b.longitude-a.longitude);
  const x=Math.sin(dLat/2)**2+Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
export function reconcileCanonicalIdentity(normalizedRow, inventory = []) {
  const rows = inventory.map(inventoryFields);
  const exactId = normalizedRow.canonicalPropertyId &&
    rows.filter(r=>r.id===normalizedRow.canonicalPropertyId);
  if (exactId?.length===1) return {disposition:"MATCHED", method:"EXACT_CERTIFIED_CANONICAL_ID", canonicalPropertyId:exactId[0].id};

  const addrCity = rows.filter(r=>r.normalizedAddress===normalizedRow.normalizedAddress && r.normalizedCity===normalizedRow.normalizedCity);
  if (normalizedRow.postalCode) {
    const withPostal=addrCity.filter(r=>r.postalCode===normalizedRow.postalCode);
    if (withPostal.length===1) return {disposition:"MATCHED", method:"EXACT_NORMALIZED_ADDRESS_CITY_POSTAL", canonicalPropertyId:withPostal[0].id};
    if (withPostal.length>1) return {disposition:"QUARANTINE", reason:"AMBIGUOUS_EXACT_ADDRESS_CITY_POSTAL"};
  }
  if (addrCity.length===1) return {disposition:"MATCHED", method:"EXACT_NORMALIZED_ADDRESS_CITY", canonicalPropertyId:addrCity[0].id};
  if (addrCity.length>1) return {disposition:"QUARANTINE", reason:"AMBIGUOUS_EXACT_ADDRESS_CITY"};

  if (normalizedRow.normalizedAddress && normalizedRow.normalizedCity &&
      Number.isFinite(normalizedRow.latitude) && Number.isFinite(normalizedRow.longitude)) {
    const prox=rows.filter(r=>r.normalizedAddress===normalizedRow.normalizedAddress && r.normalizedCity===normalizedRow.normalizedCity)
      .map(r=>({r,d:distanceMeters(normalizedRow,r)})).filter(x=>x.d<=100).sort((a,b)=>a.d-b.d);
    if (prox.length===1) return {disposition:"MATCHED", method:"COORDINATE_PROXIMITY_WITH_ADDRESS_CORROBORATION", canonicalPropertyId:prox[0].r.id};
  }
  if (normalizedRow.APN) {
    const apn=rows.filter(r=>r.APN && compact(r.APN)===compact(normalizedRow.APN));
    if (apn.length===1 && normalizedRow.normalizedAddress===apn[0].normalizedAddress)
      return {disposition:"MATCHED", method:"APN_WITH_ADDRESS_CORROBORATION", canonicalPropertyId:apn[0].id};
    if (apn.length>1) return {disposition:"QUARANTINE", reason:"AMBIGUOUS_APN"};
  }
  return {disposition:"QUARANTINE", reason:"NO_MATCH"};
}
export function proposeSuperSheetEvents({rawRow, normalizedRow, identity, source, sourceFileHash, sourceRowNumber, observationDate}) {
  if (identity.disposition !== "MATCHED") return [];
  const sourceRecordKey=makeSourceRecordKey({sourceFileHash,sourceRowNumber,normalizedRow,observationDate});
  const base={source,sourceFileHash,sourceRowNumber,sourceRecordKey,canonicalPropertyId:identity.canonicalPropertyId,observationDate,
    rawRow,provenance:{processor:AIR_STAGING_PROCESSOR_VERSION},confidence:"SOURCE_BACKED",disposition:WRITE_DISPOSITION};
  const events=[];
  const add=(eventType,facts)=>events.push({...base,eventType,normalizedFacts:facts,eventId:sha256([source,sourceFileHash,sourceRowNumber,identity.canonicalPropertyId,observationDate,eventType,JSON.stringify(facts)].join("|"))});
  if (normalizedRow.explicitLeaseSignal) add("LEASE",{explicitLeaseSignal:true});
  if (normalizedRow.explicitSaleSignal) add("SALE",{explicitSaleSignal:true});
  if (!blank(rawRow.askingRent) || !blank(rawRow.priorAskingRent)) {
    const before=numberOrNull(rawRow.priorAskingRent), after=normalizedRow.askingRent;
    if (before!==null && after!==null && before!==after) add("RATE_CHANGE",{before,after});
  }
  if (!blank(rawRow.availableSf) || !blank(rawRow.priorAvailableSf)) {
    const before=numberOrNull(rawRow.priorAvailableSf), after=normalizedRow.availableSf;
    if (before!==null && after!==null && before!==after) add("AVAILABILITY_CHANGE",{before,after});
  }
  if (!blank(rawRow.listingStatus) && !blank(rawRow.priorListingStatus) && text(rawRow.listingStatus)!==text(rawRow.priorListingStatus))
    add("LISTING_STATUS_CHANGE",{before:text(rawRow.priorListingStatus),after:text(rawRow.listingStatus)});
  if (bool(rawRow.sourceCorrection)) add("SOURCE_CORRECTION",{sourceCorrection:true});
  if (bool(rawRow.newAvailability)) add("NEW_AVAILABILITY",{availableSf:normalizedRow.availableSf});
  return events;
}
export function stageAirRow({rawRow, inventory, metadata}) {
  const normalizedRow=normalizeAirRow(rawRow);
  const identity=reconcileCanonicalIdentity(normalizedRow,inventory);
  const sourceRecordKey=makeSourceRecordKey({sourceFileHash:metadata.sourceFileHash,sourceRowNumber:metadata.sourceRowNumber,normalizedRow,observationDate:metadata.observationDate});
  const eventProposals=proposeSuperSheetEvents({rawRow,normalizedRow,identity,...metadata});
  return {processor:AIR_STAGING_PROCESSOR_VERSION,normalizedRow,identity,sourceRecordKey,eventProposals,disposition:WRITE_DISPOSITION,writesPerformed:false};
}
