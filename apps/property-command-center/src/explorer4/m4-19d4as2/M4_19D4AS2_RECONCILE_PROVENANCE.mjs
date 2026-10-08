#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,walk,looksDerived,looksInventory} from "./M419D4AS2Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const as1Path=path.join(ev,"m4-19d4as1-market-availability-source-precedence-reconciliation.json");
const resultPath=path.join(ev,"m4-19d4as2-data-bearing-market-availability-candidate-exact-provenance-reconciliation.json");
const auditPath=path.join(ev,"m4-19d4as2-exact-provenance-reconciliation-audit.json");
const manifestPath=path.join(ev,"m4-19d4as2-market-availability-authority-candidate-manifest.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function finish(status,state,extra={},code=0){
 const o={contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,sourceMutationPerformed:false,canonicalMutationPerformed:false,temporalMutationPerformed:false,identityMutationPerformed:false,operationalIngestionPerformed:false,availabilityObservationIngested:false,automaticRetry:false}};
 write(resultPath,o); console.log(JSON.stringify(o,null,2)); process.exit(code);
}

if(!fs.existsSync(as1Path)) finish("BLOCKED","M419D4AS2_AS1_RESULT_REQUIRED",{},3);
const as1=JSON.parse(fs.readFileSync(as1Path,"utf8"));
if(as1.state!=="M419D4AS1_FALSE_POSITIVE_AUTHORITY_CANDIDATES_REMOVED_MULTIPLE_DATA_BEARING_CANDIDATES_REQUIRE_EXACT_PROVENANCE_RECONCILIATION")
 finish("BLOCKED","M419D4AS2_AS1_MULTIPLE_DATA_BEARING_STATE_REQUIRED",{observed:as1.state},3);

const cands=as1?.reconciliation?.eligibleCandidates||[];
if(cands.length<2) finish("BLOCKED","M419D4AS2_MULTIPLE_CANDIDATES_REQUIRED",{candidateCount:cands.length},3);

const inspected=[];
for(const c of cands){
  if(!fs.existsSync(c.path)){
    inspected.push({...c,exists:false});
    continue;
  }
  const text=fs.readFileSync(c.path,"utf8");
  let doc=null; try{doc=JSON.parse(text)}catch{}
  const entries=doc?walk(doc):[];
  const avail=entries.filter(e=>/^availableSf$/i.test(e.key));
  const timestamp=entries.filter(e=>/timestamp|observedAt|observationTimestamp|updatedAt|asOf|effectiveDate/i.test(e.key));
  const provenance=entries.filter(e=>/provider|source|provenance|sourceRecord|sourceId|sourceType/i.test(e.key));
  const identity=entries.filter(e=>/canonicalPropertyId|propertyId|address|sourcePropertyId/i.test(e.key));
  const derived=looksDerived(c.path,text.slice(0,20000));
  const inventory=looksInventory(c.path,text.slice(0,20000));

  inspected.push({
    ...c,exists:true,sha256Actual:sha(text),
    jsonParseable:!!doc,
    availableSfOccurrences:avail.length,
    availableSfSamplePaths:avail.slice(0,20).map(x=>x.path),
    timestampEvidenceCount:timestamp.length,
    timestampSamplePaths:timestamp.slice(0,20).map(x=>x.path),
    provenanceEvidenceCount:provenance.length,
    provenanceSamplePaths:provenance.slice(0,20).map(x=>x.path),
    identityEvidenceCount:identity.length,
    identitySamplePaths:identity.slice(0,20).map(x=>x.path),
    derivedOrMaterializedSignalsPresent:derived,
    governedInventorySignalsPresent:inventory
  });
}

const scored=inspected.map(x=>{
 let score=0, reasons=[];
 if(x.exists&&x.jsonParseable){score+=2;reasons.push("parseable data-bearing JSON")}
 if(x.availableSfOccurrences>0){score+=4;reasons.push("contains availableSf observations")}
 if(x.provenanceEvidenceCount>0){score+=3;reasons.push("contains provenance/source metadata")}
 if(x.timestampEvidenceCount>0){score+=3;reasons.push("contains freshness/timestamp metadata")}
 if(x.identityEvidenceCount>0){score+=2;reasons.push("contains property identity linkage")}
 if(x.governedInventorySignalsPresent){score+=2;reasons.push("governed inventory semantics")}
 if(x.derivedOrMaterializedSignalsPresent){score-=5;reasons.push("derived/materialized semantics reduce source authority")}
 return {...x,provenanceScore:score,reasons};
}).sort((a,b)=>b.provenanceScore-a.provenanceScore);

const top=scored[0], second=scored[1];
const uniqueWinner=top && second && top.provenanceScore>second.provenanceScore;
const sourceNativeReady=!!(top&&top.availableSfOccurrences>0&&top.provenanceEvidenceCount>0&&top.timestampEvidenceCount>0&&top.identityEvidenceCount>0&&!top.derivedOrMaterializedSignalsPresent);

write(auditPath,{
 contract:"SCIIP_EXPLORER_4_M4_19D4AS2_EXACT_PROVENANCE_RECONCILIATION_AUDIT",
 version:VERSION,generatedAt:new Date().toISOString(),
 candidates:scored,
 scoringPolicy:{
  parseableJson:2,availableSf:4,provenanceMetadata:3,timestampMetadata:3,identityLinkage:2,governedInventorySemantics:2,derivedMaterializedPenalty:-5
 },
 uniqueWinner,sourceNativeReady
});

let state,next,classification;
if(uniqueWinner&&sourceNativeReady){
 state="M419D4AS2_SINGLE_SOURCE_NATIVE_MARKET_AVAILABILITY_AUTHORITY_CANDIDATE_PROVEN_EXACT_BINDING_PREAUTHORIZATION_READY";
 next="M4.19D4AT_MARKET_AVAILABILITY_SOURCE_CANDIDATE_EXACT_BINDING_AND_OBSERVATION_PREAUTHORIZATION";
 classification="SINGLE_SOURCE_NATIVE_AUTHORITY_CANDIDATE_PROVEN";
}else if(uniqueWinner){
 state="M419D4AS2_SINGLE_PREFERRED_DATA_BEARING_CANDIDATE_IDENTIFIED_BUT_SOURCE_NATIVE_PROVENANCE_INCOMPLETE";
 next="M4.19D4AS3_PREFERRED_MARKET_AVAILABILITY_CANDIDATE_SOURCE_NATIVE_PROVENANCE_COMPLETION";
 classification="PREFERRED_CANDIDATE_PROVENANCE_INCOMPLETE";
}else{
 state="M419D4AS2_DATA_BEARING_CANDIDATES_REMAIN_PROVENANCE_AMBIGUOUS_OPERATOR_OR_SOURCE_CONTRACT_REQUIRED";
 next="M4.19D4AS3_MARKET_AVAILABILITY_AUTHORITY_OPERATOR_OR_SOURCE_CONTRACT_BINDING";
 classification="PROVENANCE_AMBIGUOUS";
}

const manifest={
 contract:"SCIIP_EXPLORER_4_M4_19D4AS2_MARKET_AVAILABILITY_AUTHORITY_CANDIDATE_MANIFEST",
 version:VERSION,generatedAt:new Date().toISOString(),
 classification,
 selectedCandidate:uniqueWinner?{
  path:top.path,sha256:top.sha256Actual,provenanceScore:top.provenanceScore,
  availableSfOccurrences:top.availableSfOccurrences,
  provenanceEvidenceCount:top.provenanceEvidenceCount,
  timestampEvidenceCount:top.timestampEvidenceCount,
  identityEvidenceCount:top.identityEvidenceCount,
  derivedOrMaterializedSignalsPresent:top.derivedOrMaterializedSignalsPresent
 }:null,
 executionAuthorized:false
};
write(manifestPath,manifest);

finish("PASSED",state,{
 reconciliation:{
  classification,
  candidateCount:scored.length,
  rankedCandidates:scored.map(x=>({
   path:x.path,provenanceScore:x.provenanceScore,
   availableSfOccurrences:x.availableSfOccurrences,
   provenanceEvidenceCount:x.provenanceEvidenceCount,
   timestampEvidenceCount:x.timestampEvidenceCount,
   identityEvidenceCount:x.identityEvidenceCount,
   derivedOrMaterializedSignalsPresent:x.derivedOrMaterializedSignalsPresent,
   governedInventorySignalsPresent:x.governedInventorySignalsPresent,
   reasons:x.reasons
  })),
  uniquePreferredCandidate:uniqueWinner?top.path:null,
  sourceNativeAuthorityReady:sourceNativeReady
 },
 policy:{
  materializedOrDerivedDataCannotOutrankItsSource:true,
  sourceNativeProvenanceRequired:true,
  freshnessEvidenceRequired:true,
  identityBindingRequired:true,
  noNetworkRequest:true,
  automaticSelectionRequiresUniqueProvenanceWinner:true
 },
 artifacts:{exactProvenanceAudit:auditPath,authorityCandidateManifest:manifestPath},
 nextMilestone:next
});
