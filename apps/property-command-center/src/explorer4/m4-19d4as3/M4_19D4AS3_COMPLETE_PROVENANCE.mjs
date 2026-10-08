#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,walk,norm} from "./M419D4AS3Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const as2Path=path.join(ev,"m4-19d4as2-data-bearing-market-availability-candidate-exact-provenance-reconciliation.json");
const candidatePath=path.join(app,"public/explorer/governed-base-inventory.json");
const resultPath=path.join(ev,"m4-19d4as3-preferred-market-availability-candidate-source-native-provenance-completion.json");
const auditPath=path.join(ev,"m4-19d4as3-governed-base-inventory-upstream-provenance-audit.json");
const manifestPath=path.join(ev,"m4-19d4as3-governed-base-inventory-provenance-completion-manifest.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function finish(status,state,extra={},code=0){
 const o={contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,sourceMutationPerformed:false,canonicalMutationPerformed:false,temporalMutationPerformed:false,identityMutationPerformed:false,operationalIngestionPerformed:false,availabilityObservationIngested:false,syntheticTimestampUsed:false,materializationTimeUsedAsObservationTime:false,automaticRetry:false}};
 write(resultPath,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
if(!fs.existsSync(as2Path)||!fs.existsSync(candidatePath)) finish("BLOCKED","M419D4AS3_PREREQUISITE_MISSING",{},3);
const as2=JSON.parse(fs.readFileSync(as2Path,"utf8"));
if(as2.state!=="M419D4AS2_SINGLE_PREFERRED_DATA_BEARING_CANDIDATE_IDENTIFIED_BUT_SOURCE_NATIVE_PROVENANCE_INCOMPLETE")
 finish("BLOCKED","M419D4AS3_AS2_PREFERRED_INCOMPLETE_STATE_REQUIRED",{observed:as2.state},3);

const candidateText=fs.readFileSync(candidatePath,"utf8");
const candidate=JSON.parse(candidateText);
const entries=walk(candidate);
const avail=entries.filter(e=>/^availableSf$/i.test(e.key));

const ids=new Set(), addresses=new Set(), sources=new Set();
for(const e of entries){
 if(/canonicalPropertyId|propertyId|sourcePropertyId/i.test(e.key)&&typeof e.value==="string") ids.add(norm(e.value));
 if(/address/i.test(e.key)&&typeof e.value==="string") addresses.add(norm(e.value));
 if(/provider|sourceName|sourceType|sourceSystem|provenance/i.test(e.key)&&typeof e.value==="string") sources.add(norm(e.value));
}

const roots=[path.join(app,"src"),path.join(app,"public"),path.join(app,"server"),path.join(app,"data")].filter(fs.existsSync);
const allowed=new Set([".json",".js",".mjs",".ts",".tsx",".jsx",".csv",".tsv",".txt"]);
const hits=[];

function scan(dir){
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,ent.name);
  if(ent.isDirectory()){
   if(["node_modules",".git","dist","build","coverage","explorer4"].includes(ent.name))continue;
   scan(p);
  } else if(allowed.has(path.extname(ent.name).toLowerCase()) && p!==candidatePath){
   let text="";
   try{if(fs.statSync(p).size>6*1024*1024)continue;text=fs.readFileSync(p,"utf8")}catch{continue}
   if(!/(availableSf|governed-base-inventory|base inventory|sourcePropertyId|canonicalPropertyId|observationTimestamp|observedAt|updatedAt|asOf|effectiveDate)/i.test(text))continue;

   let score=0;
   const matchedIds=[...ids].filter(x=>x && text.toUpperCase().includes(x)).slice(0,20);
   const matchedAddresses=[...addresses].filter(x=>x && text.toUpperCase().includes(x)).slice(0,20);
   const timestampRefs=[...text.matchAll(/\b(observationTimestamp|observedAt|updatedAt|asOf|effectiveDate|sourceTimestamp|capturedAt)\b/gi)].map(m=>m[1]);
   const sourceRefs=[...text.matchAll(/\b(provider|sourceName|sourceType|sourceSystem|provenance|sourceRecordId|sourceReference)\b/gi)].map(m=>m[1]);
   const availRefs=[...text.matchAll(/\bavailableSf\b/gi)].length;
   const derivesInventory=/governed-base-inventory|base inventory/i.test(text);
   if(matchedIds.length)score+=4;
   if(matchedAddresses.length)score+=2;
   if(timestampRefs.length)score+=3;
   if(sourceRefs.length)score+=3;
   if(availRefs)score+=2;
   if(derivesInventory)score+=2;
   if(/materiali[sz]|cube|aggregate|projection|rollup/i.test(p+" "+text.slice(0,10000)))score-=3;
   hits.push({
    path:p,sha256:sha(text),score,
    matchedIdentityCount:matchedIds.length,
    matchedAddressCount:matchedAddresses.length,
    timestampReferences:[...new Set(timestampRefs)].slice(0,20),
    provenanceReferences:[...new Set(sourceRefs)].slice(0,20),
    availableSfReferenceCount:availRefs,
    governedInventoryReference:derivesInventory
   });
  }
 }
}
for(const r of roots)scan(r);
hits.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));

const strong=hits.filter(h=>h.score>=7);
const freshnessStrong=strong.filter(h=>h.timestampReferences.length>0);
const provenanceStrong=strong.filter(h=>h.provenanceReferences.length>0);
const exactCompletionCandidates=strong.filter(h=>h.timestampReferences.length>0&&h.provenanceReferences.length>0&&(h.matchedIdentityCount>0||h.governedInventoryReference));

write(auditPath,{
 contract:"SCIIP_EXPLORER_4_M4_19D4AS3_GOVERNED_BASE_INVENTORY_UPSTREAM_PROVENANCE_AUDIT",
 version:VERSION,generatedAt:new Date().toISOString(),
 candidate:{path:candidatePath,sha256:sha(candidateText),availableSfOccurrences:avail.length,identityCount:ids.size,addressCount:addresses.size},
 filesInspected:hits.length,strongCandidateCount:strong.length,
 freshnessCandidateCount:freshnessStrong.length,provenanceCandidateCount:provenanceStrong.length,
 exactCompletionCandidateCount:exactCompletionCandidates.length,
 exactCompletionCandidates:exactCompletionCandidates.slice(0,50),
 topCandidates:hits.slice(0,50)
});

let state,next,classification;
if(exactCompletionCandidates.length===1){
 state="M419D4AS3_SINGLE_UPSTREAM_PROVENANCE_AND_FRESHNESS_PATH_RECOVERED_EXACT_BINDING_REQUIRED";
 next="M4.19D4AT_MARKET_AVAILABILITY_SOURCE_CANDIDATE_EXACT_BINDING_AND_OBSERVATION_PREAUTHORIZATION";
 classification="SINGLE_UPSTREAM_PROVENANCE_PATH_RECOVERED";
}else if(exactCompletionCandidates.length>1){
 state="M419D4AS3_MULTIPLE_UPSTREAM_PROVENANCE_AND_FRESHNESS_PATHS_REQUIRE_LINEAGE_RECONCILIATION";
 next="M4.19D4AS4_GOVERNED_BASE_INVENTORY_UPSTREAM_LINEAGE_RECONCILIATION";
 classification="MULTIPLE_UPSTREAM_PROVENANCE_PATHS";
}else{
 state="M419D4AS3_GOVERNED_BASE_INVENTORY_SOURCE_NATIVE_FRESHNESS_NOT_RECOVERED_OPERATOR_OR_REFRESH_SOURCE_REQUIRED";
 next="M4.19D4AS4_MARKET_AVAILABILITY_REFRESH_SOURCE_AND_FRESHNESS_CONTRACT_DEFINITION";
 classification="SOURCE_NATIVE_FRESHNESS_NOT_RECOVERED";
}

const manifest={
 contract:"SCIIP_EXPLORER_4_M4_19D4AS3_GOVERNED_BASE_INVENTORY_PROVENANCE_COMPLETION_MANIFEST",
 version:VERSION,generatedAt:new Date().toISOString(),
 preferredCandidate:candidatePath,
 classification,
 availableSfOccurrences:avail.length,
 sourceNativeFreshnessRecovered:exactCompletionCandidates.length>0,
 candidateUpstreamPaths:exactCompletionCandidates.slice(0,50),
 policy:{
  fileMtimeCannotBeObservationTimestamp:true,
  materializationTimestampCannotBeObservationTimestampUnlessSourceContractExplicitlyDefinesIt:true,
  syntheticTimestampProhibited:true,
  currentAvailabilityRequiresFreshSourceObservation:true
 },
 executionAuthorized:false
};
write(manifestPath,manifest);

finish("PASSED",state,{
 completion:{
  classification,
  preferredCandidate:candidatePath,
  availableSfOccurrences:avail.length,
  repositoryFilesWithRelevantEvidence:hits.length,
  strongUpstreamCandidateCount:strong.length,
  exactCompletionCandidateCount:exactCompletionCandidates.length,
  exactCompletionCandidates:exactCompletionCandidates.slice(0,20),
  sourceNativeFreshnessRecovered:exactCompletionCandidates.length>0
 },
 policy:{
  governedBaseInventoryRemainsPreferredCandidate:true,
  freshnessRequiredBeforeAuthority:true,
  fileModificationTimeCannotSupplyFreshness:true,
  materializationTimeCannotSupplyFreshnessByDefault:true,
  syntheticTimestampProhibited:true,
  noNetworkRequest:true
 },
 artifacts:{upstreamProvenanceAudit:auditPath,provenanceCompletionManifest:manifestPath},
 nextMilestone:next
});
