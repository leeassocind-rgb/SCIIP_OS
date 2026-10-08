import crypto from "node:crypto";

const freeze = x => Object.freeze(x);

function stableStringify(value){
  if(value === null || typeof value !== "object") return JSON.stringify(value);
  if(Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
}

function sha256(value){
  return crypto.createHash("sha256").update(typeof value === "string" ? value : stableStringify(value)).digest("hex");
}

function normalizeAddress(value){
  const s=String(value??"").trim().replace(/\s+/g," ");
  if(!s) throw new Error("NORMALIZED_ADDRESS_REQUIRED");
  return s;
}

function requireText(value, code){
  const s=String(value??"").trim();
  if(!s) throw new Error(code);
  return s;
}

export function buildGovernedCanonicalIdentityFirstInsertPrimitive({
  canonicalIdAuthority,
  canonicalStore,
  clock=()=>new Date().toISOString()
}={}){
  if(!canonicalIdAuthority || typeof canonicalIdAuthority.resolveCanonicalPropertyId!=="function"){
    throw new Error("GOVERNED_CANONICAL_ID_AUTHORITY_REQUIRED");
  }
  if(!canonicalStore ||
     typeof canonicalStore.lookupBySourcePropertyId!=="function" ||
     typeof canonicalStore.lookupByCanonicalPropertyId!=="function" ||
     typeof canonicalStore.atomicInsert!=="function" ||
     typeof canonicalStore.readAfterWrite!=="function"){
    throw new Error("GOVERNED_CANONICAL_STORE_FIRST_INSERT_CONTRACT_REQUIRED");
  }

  async function preflight(input={}){
    const sourcePropertyId=requireText(input.sourcePropertyId,"SOURCE_PROPERTY_ID_REQUIRED");
    const normalizedAddress=normalizeAddress(input.normalizedAddress);
    if(!input.sourceProvenance) throw new Error("SOURCE_PROVENANCE_REQUIRED");
    if(!input.identityEvidence) throw new Error("IDENTITY_EVIDENCE_REQUIRED");

    const existingBySource=await canonicalStore.lookupBySourcePropertyId(sourcePropertyId);
    if(existingBySource?.found){
      return freeze({
        ready:false,
        state:"DUPLICATE_SOURCE_PROPERTY_ID",
        sourcePropertyId,
        normalizedAddress,
        existingCanonicalPropertyId:existingBySource.canonicalPropertyId??null
      });
    }

    const authorityResult=await canonicalIdAuthority.resolveCanonicalPropertyId({
      sourcePropertyId,
      normalizedAddress,
      sourceProvenance:input.sourceProvenance,
      identityEvidence:input.identityEvidence
    });

    const canonicalPropertyId=requireText(authorityResult?.canonicalPropertyId,"GOVERNED_CANONICAL_PROPERTY_ID_REQUIRED");
    if(authorityResult?.synthetic===true) throw new Error("SYNTHETIC_CANONICAL_ID_PROHIBITED");
    if(authorityResult?.deterministic!==true) throw new Error("DETERMINISTIC_CANONICAL_ID_REQUIRED");
    if(!authorityResult?.authorityReference) throw new Error("CANONICAL_ID_AUTHORITY_REFERENCE_REQUIRED");

    const existingByCanonical=await canonicalStore.lookupByCanonicalPropertyId(canonicalPropertyId);
    if(existingByCanonical?.found){
      return freeze({
        ready:false,
        state:"DUPLICATE_CANONICAL_PROPERTY_ID",
        sourcePropertyId,
        normalizedAddress,
        canonicalPropertyId
      });
    }

    const idempotencyKey=`CANONICAL_FIRST_INSERT:${sha256({
      sourcePropertyId,
      normalizedAddress,
      canonicalPropertyId,
      authorityReference:authorityResult.authorityReference
    })}`;

    return freeze({
      ready:true,
      state:"FIRST_INSERT_PREFLIGHT_READY",
      sourcePropertyId,
      normalizedAddress,
      canonicalPropertyId,
      canonicalIdAuthorityReference:authorityResult.authorityReference,
      idempotencyKey,
      sourceProvenance:input.sourceProvenance,
      identityEvidence:input.identityEvidence
    });
  }

  async function executeFirstInsert(input={}, {authorizationToken}={}){
    if(authorizationToken!=="AUTHORIZE_GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT"){
      return freeze({committed:false,state:"EXECUTION_NOT_AUTHORIZED"});
    }

    const pf=await preflight(input);
    if(!pf.ready) return freeze({committed:false,...pf});

    // Immediate duplicate recheck before write.
    const sourceAgain=await canonicalStore.lookupBySourcePropertyId(pf.sourcePropertyId);
    if(sourceAgain?.found) return freeze({committed:false,state:"DUPLICATE_SOURCE_PROPERTY_ID_PREWRITE"});
    const canonicalAgain=await canonicalStore.lookupByCanonicalPropertyId(pf.canonicalPropertyId);
    if(canonicalAgain?.found) return freeze({committed:false,state:"DUPLICATE_CANONICAL_PROPERTY_ID_PREWRITE"});

    const observationTimestamp=clock();
    const creationEvent=freeze({
      eventType:"CANONICAL_IDENTITY_CREATED",
      canonicalPropertyId:pf.canonicalPropertyId,
      sourcePropertyId:pf.sourcePropertyId,
      normalizedAddress:pf.normalizedAddress,
      sourceProvenance:pf.sourceProvenance,
      identityEvidence:pf.identityEvidence,
      canonicalIdAuthorityReference:pf.canonicalIdAuthorityReference,
      idempotencyKey:pf.idempotencyKey,
      observationTimestamp
    });

    const insert=await canonicalStore.atomicInsert({
      canonicalPropertyId:pf.canonicalPropertyId,
      sourcePropertyId:pf.sourcePropertyId,
      normalizedAddress:pf.normalizedAddress,
      event:creationEvent,
      idempotencyKey:pf.idempotencyKey
    });

    if(insert?.committed!==true){
      return freeze({committed:false,state:insert?.state??"ATOMIC_FIRST_INSERT_FAILED"});
    }

    const verify=await canonicalStore.readAfterWrite({
      canonicalPropertyId:pf.canonicalPropertyId,
      sourcePropertyId:pf.sourcePropertyId,
      idempotencyKey:pf.idempotencyKey
    });

    if(verify?.verified!==true){
      return freeze({committed:false,state:"READ_AFTER_WRITE_VERIFICATION_FAILED"});
    }

    return freeze({
      committed:true,
      state:"GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT_COMMITTED",
      canonicalPropertyId:pf.canonicalPropertyId,
      sourcePropertyId:pf.sourcePropertyId,
      normalizedAddress:pf.normalizedAddress,
      idempotencyKey:pf.idempotencyKey,
      eventType:"CANONICAL_IDENTITY_CREATED",
      observationTimestamp,
      readAfterWriteVerified:true
    });
  }

  return freeze({
    preflight,
    executeFirstInsert,
    contract:freeze({
      capability:"GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT",
      directSyntheticCPROPGeneration:false,
      deterministicCanonicalIdAuthorityRequired:true,
      duplicateRecheckImmediatelyBeforeInsert:true,
      appendOnlyCreationEvent:true,
      atomicCanonicalFirstInsert:true,
      readAfterWriteRequired:true,
      idempotencyRequired:true,
      strictSequentialExecutionRequiredByCaller:true,
      availabilityOrTemporalMutation:false,
      downstreamPropagationAuthority:false
    })
  });
}
