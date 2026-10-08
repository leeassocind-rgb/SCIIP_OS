// SCIIP Explorer 3.0 — M3.14
// Governed Property-Domain Field Semantics & Canary Eligibility Classification Runtime

import fs from'node:fs';
import path from'node:path';
import crypto from'node:crypto';

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
function id(parts,p='G314'){return `${p}-${sha(parts.join('|')).slice(0,16).toUpperCase()}`;}

const CLASSIFICATIONS=Object.freeze([
  'PROPERTY_MUTABLE',
  'IDENTITY',
  'EVIDENCE_METADATA',
  'PROVENANCE',
  'SYSTEM_METADATA',
  'UNKNOWN'
]);

const DEFAULT_ALLOWLIST=Object.freeze([
  /^askingRate$/i,
  /^asking_rate$/i,
  /^leaseRate$/i,
  /^lease_rate$/i,
  /^clearHeight$/i,
  /^clear_height$/i,
  /^buildingSF$/i,
  /^building_sf$/i,
  /^availableSF$/i,
  /^available_sf$/i,
  /^landAcres$/i,
  /^land_acres$/i,
  /^coveragePct$/i,
  /^coverage_pct$/i,
  /^powerAmps$/i,
  /^power_amps$/i,
  /^autoParking$/i,
  /^auto_parking$/i,
  /^trailerParking$/i,
  /^trailer_parking$/i,
  /^truckCourt$/i,
  /^truck_court$/i,
  /^dockHighDoors$/i,
  /^dock_high_doors$/i
]);

function any(regexes,value){return regexes.some(r=>r.test(value));}

export function buildGovernedPropertyDomainFieldSemanticsCanaryEligibilityClassificationRuntime(){
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_14_GOVERNED_PROPERTY_DOMAIN_FIELD_SEMANTICS_CANARY_ELIGIBILITY_CLASSIFICATION_RUNTIME',
  version:'3.0-m3.14',
  status:'READY',
  m313EvidenceRequired:true,
  explicitSemanticClassificationRequired:true,
  propertyMutableAllowlistRequired:true,
  evidenceMetadataRejected:true,
  identityFieldsRejected:true,
  provenanceFieldsRejected:true,
  systemMetadataRejected:true,
  unknownFieldsRejected:true,
  semanticGatePrecedesM307Qualification:true,
  deterministicClassificationRequired:true,
  explicitNoSemanticallyEligibleCandidateOutcomeRequired:true,
  canonicalMutationAllowed:false,
  installerExecutesWrite:false,
  certificationExecutesWrite:false,
  liveWriteExecuted:false,
  automaticCommit:false,
  automaticRetryAllowed:false,
  generalizedWriteAuthority:false,
  bulkWritesAllowed:false,
  multiPropertyWritesAllowed:false,
  persistentWriteAuthority:false,
  canonicalCommittedCount:0
 });
}

export function classifyFieldSemantics(fieldPath,{propertyMutableAllowlist=DEFAULT_ALLOWLIST}={}){
  const field=clean(fieldPath);
  const lower=field.toLowerCase();

  let classification='UNKNOWN';
  let reason='NO_EXPLICIT_SEMANTIC_MATCH';

  if(field==='UNAVAILABLE'){
    classification='UNKNOWN'; reason='FIELD_UNAVAILABLE';
  }else if(
    /^evidence(\.|$)/i.test(field) ||
    /(^|\.)(page|pageNumber|page_number|sourcePage|source_page|citation|evidenceId|evidence_id)$/i.test(field)
  ){
    classification='EVIDENCE_METADATA'; reason='EVIDENCE_NAMESPACE_OR_EVIDENCE_METADATA_FIELD';
  }else if(
    /(^|\.)(propertyId|property_id|eventId|event_id|canonicalPropertyId|canonical_property_id|assetId|asset_id|buildingId|building_id|id)$/i.test(field)
  ){
    classification='IDENTITY'; reason='IDENTITY_FIELD';
  }else if(
    /(^|\.)(source|sourceId|source_id|provenance|origin|originId|origin_id|lineage|dataset|datasetId|dataset_id)$/i.test(field)
  ){
    classification='PROVENANCE'; reason='PROVENANCE_FIELD';
  }else if(
    /(^|\.)(hash|sha256|version|revision|sequence|timestamp|createdAt|created_at|updatedAt|updated_at|eventType|event_type|statusCode|status_code)$/i.test(field)
  ){
    classification='SYSTEM_METADATA'; reason='SYSTEM_METADATA_FIELD';
  }else if(any(propertyMutableAllowlist,field)){
    classification='PROPERTY_MUTABLE'; reason='EXPLICIT_PROPERTY_MUTABLE_ALLOWLIST';
  }

  return Object.freeze({
    fieldPath:field,
    classification,
    eligibleForCanary:classification==='PROPERTY_MUTABLE',
    reason
  });
}

export function buildSemanticClassificationManifest({schemaManifest={},projectedCandidates=[]}={}){
  if(schemaManifest?.status!=='PROFILED'){
    return Object.freeze({status:'BLOCKED',state:'M3_13_SCHEMA_MANIFEST_NOT_PROFILED'});
  }

  const schemaFields=Array.isArray(schemaManifest?.fields)?schemaManifest.fields:[];
  const allFieldPaths=new Set(schemaFields.map(x=>x.field).filter(Boolean));
  for(const c of projectedCandidates||[]) if(c?.fieldPath) allFieldPaths.add(c.fieldPath);

  const classifications=[...allFieldPaths].sort().map(fieldPath=>classifyFieldSemantics(fieldPath));
  const counts={};
  for(const c of CLASSIFICATIONS) counts[c]=classifications.filter(x=>x.classification===c).length;

  const manifestId=id([
    clean(schemaManifest?.manifestId),
    clean(schemaManifest?.schemaHash),
    JSON.stringify(classifications)
  ],'G3SC');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_14_PROPERTY_DOMAIN_SEMANTIC_CLASSIFICATION_MANIFEST',
    version:'3.0-m3.14',
    status:'CLASSIFIED',
    state:'PROPERTY_DOMAIN_FIELD_SEMANTICS_CLASSIFIED',
    manifestId,
    sourceSchemaManifestId:clean(schemaManifest?.manifestId),
    sourceSchemaHash:clean(schemaManifest?.schemaHash),
    classifications:Object.freeze(classifications),
    counts:Object.freeze(counts),
    eligibleFieldCount:counts.PROPERTY_MUTABLE||0,
    ineligibleFieldCount:classifications.length-(counts.PROPERTY_MUTABLE||0),
    readOnly:true,
    canonicalMutationAllowed:false
  });
}

export function gateProjectedCandidatesBySemantics({projection={},semanticManifest={}}={}){
  if(projection?.status!=='PROJECTED'){
    return Object.freeze({status:'BLOCKED',state:'M3_13_PROJECTION_NOT_READY'});
  }
  if(semanticManifest?.status!=='CLASSIFIED'){
    return Object.freeze({status:'BLOCKED',state:'SEMANTIC_MANIFEST_NOT_CLASSIFIED'});
  }

  const classByField=new Map(
    semanticManifest.classifications.map(x=>[x.fieldPath,x])
  );

  const eligible=[];
  const rejected=[];

  for(const candidate of projection.candidates||[]){
    const semantic=classByField.get(candidate.fieldPath)||classifyFieldSemantics(candidate.fieldPath);
    if(semantic.eligibleForCanary===true){
      eligible.push(Object.freeze({
        ...clone(candidate),
        semanticClassification:semantic.classification,
        semanticEligibilityReason:semantic.reason
      }));
    }else{
      rejected.push(Object.freeze({
        propertyId:clean(candidate?.propertyId),
        fieldPath:clean(candidate?.fieldPath),
        semanticClassification:semantic.classification,
        rejectionReason:semantic.reason
      }));
    }
  }

  const state=eligible.length
    ?'SEMANTICALLY_ELIGIBLE_PROPERTY_CANDIDATES_READY'
    :'NO_SEMANTICALLY_ELIGIBLE_CANARY_CANDIDATE';

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_14_SEMANTIC_CANARY_ELIGIBILITY_GATE',
    version:'3.0-m3.14',
    status:'GATED',
    state,
    eligibleCount:eligible.length,
    rejectedCount:rejected.length,
    eligibleCandidates:Object.freeze(eligible),
    rejectedCandidates:Object.freeze(rejected),
    explicitNoSemanticallyEligibleCandidate:eligible.length===0,
    readOnly:true,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function qualifySemanticallyEligibleCandidates({semanticGate={},m307Runtime}={}){
  if(semanticGate?.status!=='GATED'){
    return Object.freeze({status:'BLOCKED',state:'SEMANTIC_GATE_NOT_READY'});
  }

  if(semanticGate.explicitNoSemanticallyEligibleCandidate===true){
    return Object.freeze({
      status:'EXECUTED',
      state:'NO_SEMANTICALLY_ELIGIBLE_CANARY_CANDIDATE',
      evaluatedCount:0,
      qualifiedCount:0,
      selectedCandidate:null,
      explicitNoSemanticallyEligibleCandidate:true,
      readOnly:true,
      liveWriteExecuted:false,
      mutationPerformed:false,
      canonicalCommitted:false,
      canonicalCommittedCount:0
    });
  }

  if(typeof m307Runtime?.discoverAndRankProductionCandidates!=='function'){
    return Object.freeze({status:'BLOCKED',state:'M3_07_RUNTIME_MISSING'});
  }

  const result=m307Runtime.discoverAndRankProductionCandidates(semanticGate.eligibleCandidates||[]);
  const winner=result?.winner||null;

  return Object.freeze({
    status:'EXECUTED',
    state:winner?'SEMANTICALLY_ELIGIBLE_CANARY_CANDIDATE_QUALIFIED':'NO_SEMANTICALLY_ELIGIBLE_CANARY_CANDIDATE',
    evaluatedCount:Array.isArray(result?.evaluated)?result.evaluated.length:(semanticGate.eligibleCandidates||[]).length,
    qualifiedCount:Number(result?.qualifiedCount||0),
    selectedCandidate:winner?Object.freeze(clone(winner)):null,
    explicitNoSemanticallyEligibleCandidate:!winner,
    readOnly:true,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function persistSemanticEligibilityEvidence({semanticManifest,semanticGate,qualification,outputPath}={}){
  if(semanticManifest?.status!=='CLASSIFIED'||semanticGate?.status!=='GATED'||qualification?.status!=='EXECUTED'){
    return Object.freeze({status:'BLOCKED',state:'SEMANTIC_ELIGIBILITY_EVIDENCE_NOT_READY'});
  }

  const evidence=Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_14_SEMANTIC_CANARY_ELIGIBILITY_EVIDENCE',
    version:'3.0-m3.14',
    status:'CERTIFIED',
    state:'PROPERTY_DOMAIN_SEMANTIC_CANARY_ELIGIBILITY_EVIDENCE_CERTIFIED',
    evidenceId:id([
      clean(semanticManifest?.manifestId),
      semanticGate.state,
      String(semanticGate.eligibleCount),
      String(semanticGate.rejectedCount),
      qualification.state,
      clean(qualification?.selectedCandidate?.propertyId),
      clean(qualification?.selectedCandidate?.fieldPath)
    ],'G3SE'),
    semanticManifest,
    semanticGateSummary:Object.freeze({
      state:semanticGate.state,
      eligibleCount:semanticGate.eligibleCount,
      rejectedCount:semanticGate.rejectedCount,
      explicitNoSemanticallyEligibleCandidate:semanticGate.explicitNoSemanticallyEligibleCandidate
    }),
    qualification,
    immutable:true,
    readOnly:true,
    canonicalMutationAllowed:false,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });

  const target=path.resolve(outputPath);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const body=JSON.stringify(evidence,null,2)+'\n';
  fs.writeFileSync(target,body,{flag:'w',mode:0o444});

  return Object.freeze({
    status:'PERSISTED',
    state:'PROPERTY_DOMAIN_SEMANTIC_CANARY_ELIGIBILITY_EVIDENCE_PERSISTED',
    outputPath:target,
    sha256:sha(body),
    evidence
  });
}
