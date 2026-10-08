import crypto from "node:crypto";

function stable(value){
  if(value===null || typeof value!=="object") return JSON.stringify(value);
  if(Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stable(value[k])}`).join(",")}}`;
}
function sha256(value){
  return crypto.createHash("sha256").update(typeof value==="string"?value:stable(value)).digest("hex").toUpperCase();
}
function req(v,code){
  const s=String(v??"").trim();
  if(!s) throw new Error(code);
  return s;
}

export function inspectCanonicalNamespace(canonicalIds=[]){
  const valid=canonicalIds.filter(x=>typeof x==="string" && /^CPROP-[A-F0-9]+$/i.test(x));
  const lengths=new Map();
  for(const id of valid){
    const n=id.slice(6).length;
    lengths.set(n,(lengths.get(n)||0)+1);
  }
  const ranked=[...lengths.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0]);
  return Object.freeze({
    totalInput:canonicalIds.length,
    validCanonicalIdCount:valid.length,
    observedHexPrefixLengths:[...lengths.keys()].sort((a,b)=>a-b),
    dominantHexPrefixLength:ranked[0]?.[0]??null,
    dominantCount:ranked[0]?.[1]??0,
    namespaceHomogeneous:lengths.size===1 && valid.length>0
  });
}

export function buildGovernedProductionCanonicalIdAuthority({
  existingCanonicalIds=[],
  authorityVersion="SCIIP_CANONICAL_ID_AUTHORITY_V1",
  derivationVersion="SHA256_SOURCE_ADDRESS_PROVENANCE_IDENTITY_V1"
}={}){
  const namespace=inspectCanonicalNamespace(existingCanonicalIds);
  if(!namespace.namespaceHomogeneous) throw new Error("CANONICAL_NAMESPACE_NOT_HOMOGENEOUS");
  const prefixLength=namespace.dominantHexPrefixLength;
  if(!Number.isInteger(prefixLength) || prefixLength<8 || prefixLength>64) throw new Error("CANONICAL_NAMESPACE_PREFIX_LENGTH_INVALID");

  const existing=new Set(existingCanonicalIds.map(x=>String(x).toUpperCase()));

  async function resolveCanonicalPropertyId(input={}){
    const sourcePropertyId=req(input.sourcePropertyId,"SOURCE_PROPERTY_ID_REQUIRED");
    const normalizedAddress=req(input.normalizedAddress,"NORMALIZED_ADDRESS_REQUIRED");
    if(!input.sourceProvenance) throw new Error("SOURCE_PROVENANCE_REQUIRED");
    if(!input.identityEvidence) throw new Error("IDENTITY_EVIDENCE_REQUIRED");

    const derivationMaterial={
      authorityVersion,
      derivationVersion,
      sourcePropertyId,
      normalizedAddress,
      sourceProvenance:input.sourceProvenance,
      identityEvidence:input.identityEvidence
    };
    const derivationHash=sha256(derivationMaterial);
    const canonicalPropertyId=`CPROP-${derivationHash.slice(0,prefixLength)}`;

    return Object.freeze({
      canonicalPropertyId,
      authorityVersion,
      derivationVersion,
      derivationHash,
      resolutionState: existing.has(canonicalPropertyId)
        ? "DERIVED_CANONICAL_ID_COLLIDES_WITH_EXISTING_NAMESPACE"
        : "DERIVED_CANONICAL_ID_AVAILABLE",
      deterministic:true,
      synthetic:false,
      authorityReference:`${authorityVersion}/${derivationVersion}/${prefixLength}`,
      namespacePrefixLength:prefixLength
    });
  }

  return Object.freeze({
    resolveCanonicalPropertyId,
    inspectNamespace:()=>namespace,
    contract:Object.freeze({
      capability:"GOVERNED_PRODUCTION_CANONICAL_ID_AUTHORITY",
      deterministic:true,
      namespaceControlled:true,
      noRandomUuid:true,
      noTimestampDerivedId:true,
      noPersistenceInsideAuthority:true,
      noAvailabilityMutation:true,
      noTemporalMutation:true,
      noPropagation:true
    })
  });
}
