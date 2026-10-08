#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,classifySource,authorityRank} from "./M419D4ASRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const ar2Path=path.join(ev,"m4-19d4ar2-lightbox-parcel-only-capability-closure-market-availability-source-separation.json");
const handoffPath=path.join(ev,"m4-19d4ar2-market-availability-source-handoff-contract.json");
const resultPath=path.join(ev,"m4-19d4as-market-availability-source-authority-selection-contract-definition.json");
const inventoryPath=path.join(ev,"m4-19d4as-market-availability-source-inventory.json");
const contractPath=path.join(ev,"m4-19d4as-available-sf-authority-contract.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const finish=(status,state,extra={},code=0)=>{
  const out={
    contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{
      temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,
      automaticRetry:false
    },
    safety:{
      networkRequestsPerformed:0,
      sourceMutationPerformed:false,
      processMutationPerformed:false,
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      availabilityObservationIngested:false,
      automaticRetry:false
    }
  };
  write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(code);
};

for(const p of [ar2Path,handoffPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AS_PREREQUISITE_MISSING",{path:p},3);
}
const ar2=JSON.parse(fs.readFileSync(ar2Path,"utf8"));
if(ar2?.state!=="M419D4AR2_LIGHTBOX_PARCEL_ONLY_CAPABILITY_BOUNDARY_CERTIFIED_MARKET_AVAILABILITY_SEPARATE_SOURCE_REQUIRED"){
  finish("BLOCKED","M419D4AS_AR2_BOUNDARY_STATE_REQUIRED",{observed:ar2?.state??null},3);
}
const handoff=JSON.parse(fs.readFileSync(handoffPath,"utf8"));

const roots=[
  path.join(app,"src"),
  path.join(app,"public"),
  path.join(app,"data"),
  path.join(app,"evidence")
].filter(fs.existsSync);

const extOk=new Set([".json",".js",".mjs",".ts",".tsx",".jsx",".csv",".tsv",".txt"]);
const candidates=[];
function scan(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules",".git","dist","build","coverage"].includes(ent.name))continue;
      scan(p);
    }else{
      const ext=path.extname(ent.name).toLowerCase();
      if(!extOk.has(ext))continue;
      let text="";
      try{
        if(fs.statSync(p).size>4*1024*1024)continue;
        text=fs.readFileSync(p,"utf8");
      }catch{continue}
      if(!/(availableSf|availableSF|availability|available[_ -]?sf|askingRate|asking_rate|vacancy|listing|available inventory)/i.test(text))continue;
      const cls=classifySource(p,text.slice(0,10000));
      const refs=[...text.matchAll(/\b(availableSf|availableSF|availability|askingRate|vacancy|listing)\b/gi)].map(m=>m[1]);
      candidates.push({
        path:p,
        sha256:sha(text),
        classification:cls,
        authorityRank:authorityRank[cls]??0,
        semanticReferences:[...new Set(refs)].slice(0,50)
      });
    }
  }
}
for(const r of roots)scan(r);

candidates.sort((a,b)=>b.authorityRank-a.authorityRank||a.path.localeCompare(b.path));
const authoritativeCandidates=candidates.filter(x=>x.authorityRank>=2);
const topRank=authoritativeCandidates.length?Math.max(...authoritativeCandidates.map(x=>x.authorityRank)):0;
const topCandidates=authoritativeCandidates.filter(x=>x.authorityRank===topRank);

const inventory={
  contract:"SCIIP_EXPLORER_4_M4_19D4AS_MARKET_AVAILABILITY_SOURCE_INVENTORY",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  inputIdentity:handoff?.inputIdentity??null,
  sourcesScanned:candidates.length,
  candidates,
  authoritativeCandidateCount:authoritativeCandidates.length,
  highestAuthorityRank:topRank,
  highestAuthorityCandidates:topCandidates
};
write(inventoryPath,inventory);

const contract={
  contract:"SCIIP_EXPLORER_4_M4_19D4AS_AVAILABLE_SF_AUTHORITY_CONTRACT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  semantic:{
    field:"availableSf",
    definition:"Square feet actively available to the market for occupancy or lease at the observation time.",
    excludes:[
      "total building area",
      "gross building area",
      "GLA absent an explicit availability assertion",
      "parcel area",
      "vacant space inferred from occupancy without source assertion",
      "historical availability without a fresh observation"
    ]
  },
  authorityOrder:[
    "OWNER_OR_OPERATOR_SOURCE",
    "MARKET_LISTING_OR_AVAILABILITY_SOURCE",
    "BROKERAGE_OR_INTERNAL_MARKET_SOURCE"
  ],
  nonAuthoritativeForFreshAvailability:[
    "COMPARABLE_TRANSACTION_SOURCE",
    "DERIVED_OR_INTERNAL_STATE",
    "LIGHTBOX_PARCEL_OR_PROPERTY_INTELLIGENCE"
  ],
  requiredObservationFields:[
    "canonicalPropertyId",
    "availableSf",
    "provider",
    "sourceRecordIdOrStableReference",
    "observationTimestamp",
    "sourceNativeFieldPath",
    "rawEvidenceReference",
    "rawEvidenceHash",
    "identityMatchEvidence"
  ],
  conflictPolicy:{
    higherAuthoritySourceWinsOnlyIfObservationIsCurrent:true,
    equalAuthorityConflictsRequireReconciliation:true,
    missingAvailabilityDoesNotMeanZero:true,
    zeroAvailableSfRequiresExplicitSourceAssertion:true,
    staleObservationCannotSilentlyOverrideNewerObservation:true
  },
  executionAuthorized:false
};
write(contractPath,contract);

let state,nextMilestone,classification;
if(topCandidates.length===1){
  state="M419D4AS_SINGLE_HIGHEST_AUTHORITY_MARKET_AVAILABILITY_SOURCE_CANDIDATE_IDENTIFIED_CONTRACT_CERTIFIED";
  nextMilestone="M4.19D4AT_MARKET_AVAILABILITY_SOURCE_CANDIDATE_EXACT_BINDING_AND_OBSERVATION_PREAUTHORIZATION";
  classification="ONE_HIGHEST_AUTHORITY_CANDIDATE";
}else if(topCandidates.length>1){
  state="M419D4AS_MULTIPLE_HIGHEST_AUTHORITY_MARKET_AVAILABILITY_SOURCE_CANDIDATES_REQUIRE_RECONCILIATION";
  nextMilestone="M4.19D4AS1_MARKET_AVAILABILITY_SOURCE_PRECEDENCE_RECONCILIATION";
  classification="MULTIPLE_EQUAL_HIGHEST_AUTHORITY_CANDIDATES";
}else{
  state="M419D4AS_NO_REPOSITORY_MARKET_AVAILABILITY_AUTHORITY_CANDIDATE_OPERATOR_SOURCE_SELECTION_REQUIRED";
  nextMilestone="M4.19D4AS1_OPERATOR_MARKET_AVAILABILITY_SOURCE_SELECTION_AND_BINDING";
  classification="NO_QUALIFIED_REPOSITORY_AVAILABILITY_AUTHORITY";
}

finish("PASSED",state,{
  selection:{
    classification,
    candidatesScanned:candidates.length,
    authoritativeCandidateCount:authoritativeCandidates.length,
    highestAuthorityRank:topRank,
    highestAuthorityCandidateCount:topCandidates.length,
    highestAuthorityCandidates:topCandidates
  },
  contractDefinition:{
    availableSfDefinition:contract.semantic.definition,
    authorityOrder:contract.authorityOrder,
    requiredObservationFields:contract.requiredObservationFields,
    missingAvailabilityDoesNotMeanZero:true,
    zeroAvailableSfRequiresExplicitSourceAssertion:true
  },
  policy:{
    lightBoxAvailabilityAuthorityExcluded:true,
    buildingAreaSubstitutionProhibited:true,
    currentSourceObservationRequired:true,
    automaticAuthoritySelectionAllowedOnlyForSingleHighestCandidate:true,
    networkRequestsPerformed:0
  },
  artifacts:{
    sourceInventory:inventoryPath,
    availableSfAuthorityContract:contractPath
  },
  nextMilestone
},0);
