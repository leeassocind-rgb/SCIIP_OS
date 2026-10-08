import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AD_CONTROLLED_SINGLE_RECORD_ENRICH_READ_PREAUTHORIZATION";
export const VERSION="4.0-m4.19d4ad";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function hashRecord(record){
  return sha(JSON.stringify(record));
}

export function validateSample(sample){
  const errors=[];
  if(!sample || typeof sample!=="object") errors.push("SAMPLE_OBJECT_REQUIRED");
  if(!sample?.canonicalPropertyId) errors.push("CANONICAL_PROPERTY_ID_REQUIRED");
  if(!sample?.sourcePropertyId) errors.push("SOURCE_PROPERTY_ID_REQUIRED");
  if(!sample?.subject || typeof sample.subject!=="object") errors.push("SUBJECT_REQUIRED");
  if(!sample?.subject?.id) errors.push("SUBJECT_ID_REQUIRED");
  return errors;
}
