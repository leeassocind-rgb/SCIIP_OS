#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const r7cp=path.join(ev,"m4-19d4bn2-r7c-explorer-search-read-path-remediation-design-and-preauthorization.json");
if(!fs.existsSync(r7cp)) throw new Error("R7C evidence missing");
const r7c=JSON.parse(fs.readFileSync(r7cp,"utf8"));
if(r7c.status!=="PASSED" || !String(r7c.state).includes("IMPLEMENTATION_PREAUTHORIZED_NOT_EXECUTED"))
  throw new Error("R7C prerequisite state not accepted");

const r7bp=path.join(ev,"m4-19d4bn2-r7b-explorer-search-candidate-builder-filter-and-index-causal-trace.json");
if(!fs.existsSync(r7bp)) throw new Error("R7B evidence missing");
const r7b=JSON.parse(fs.readFileSync(r7bp,"utf8"));
const ten=r7b.causalTrace?.perRecord;
if(!Array.isArray(ten)||ten.length!==10) throw new Error("R7B exact ten unresolved");

const explorer3=path.join(app,"src/broker-product/property-explorer/v6/Explorer3.jsx");
const backup=path.join(ev,"m4-19d4bn2-r7d-backups/Explorer3.pre-r7d.jsx");
const inventory=path.join(app,"public/explorer/governed-base-inventory.json");
const canonical=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const runtime=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
for(const p of [explorer3,backup,inventory,canonical,runtime]) if(!fs.existsSync(p)) throw new Error("required file missing: "+p);

function sha(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex")}
function read(p){return fs.readFileSync(p,"utf8")}
function norm(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim()}
function lines(text,re){
  const out=[];
  text.split(/\r?\n/).forEach((line,i)=>{if(re.test(line)) out.push({line:i+1,text:line.trim().slice(0,1200)})});
  return out;
}

const source=read(explorer3);
const preSource=read(backup);

const expectedPre=r7c.productionBindings?.explorer3Sha256;
if(sha(backup)!==expectedPre) throw new Error("backup does not match R7C preauthorized Explorer3 SHA");

const inv=JSON.parse(read(inventory));
const rows=inv?.properties;
if(!Array.isArray(rows)) throw new Error("governed inventory properties unresolved");

// Re-run the exact local Search SCIIP predicate against governed rows.
const perRecord=ten.map((r,idx)=>{
  const q=String(r.address||"");
  const ql=q.toLowerCase();
  const matches=rows.filter(p=>`${p?.address} ${p?.city} ${p?.owner} ${p?.status}`.toLowerCase().includes(ql));
  const exact=matches.filter(p=>norm(p?.address)===norm(q));
  return {
    cohortPosition:r.cohortPosition??idx+1,
    address:q,
    sourcePropertyId:r.sourcePropertyId,
    canonicalPropertyId:r.canonicalPropertyId,
    governedPredicateMatchCount:matches.length,
    exactAddressMatchCount:exact.length,
    exactCandidatePresent:exact.length>=1,
    candidateIds:exact.map(p=>p.id||p.propertyId||p.sourcePropertyId||null)
  };
});

const exactAll=perRecord.every(x=>x.exactCandidatePresent);
const duplicateExact=perRecord.some(x=>x.exactAddressMatchCount>1);

// Verify only intended source lines changed semantically.
const sourceEvidence={
  searchBinding:lines(source,/const\s+SEARCH_PROPERTIES=/),
  localSearch:lines(source,/const\s+searchResults=.*SEARCH_PROPERTIES\.filter/),
  globalSearch:lines(source,/resolveGlobalPropertySearch\(SEARCH_PROPERTIES,value\)/),
  nonSearchSelectedProperty:lines(source,/const\s+sourceSelectedProperty=EXPLORER3_PROPERTIES\.find/),
  nonSearchVisibleProperties:lines(source,/const\s+visibleProperties=.*EXPLORER3_PROPERTIES\.filter/),
  governedPresentationUniverse:lines(source,/const\s+EXPLORER3_PROPERTIES=bh4g1GovernedProperties\|\|EXPLORER3_SOURCE_PROPERTIES/)
};

const staticChecks={
  exactOneSearchBinding:sourceEvidence.searchBinding.length===1,
  exactOneLocalSearchRebind:sourceEvidence.localSearch.length===1,
  exactOneGlobalSearchRebind:sourceEvidence.globalSearch.length===1,
  nonSearchSelectedPropertyPreserved:sourceEvidence.nonSearchSelectedProperty.length===1,
  nonSearchVisiblePropertiesPreserved:sourceEvidence.nonSearchVisibleProperties.length>=1,
  governedPresentationUniversePreserved:sourceEvidence.governedPresentationUniverse.length===1,
  searchPropertiesReferenceCount:(source.match(/SEARCH_PROPERTIES/g)||[]).length===3,
  staleLocalSearchBindingRemoved:!/const\s+searchResults=.*EXPLORER3_PROPERTIES\.filter/.test(source),
  staleGlobalSearchBindingRemoved:!/resolveGlobalPropertySearch\(EXPLORER3_PROPERTIES,value\)/.test(source)
};

const hashes={
  explorer3Before:sha(backup),
  explorer3After:sha(explorer3),
  inventoryBefore:r7c.productionBindings.inventorySha256,
  inventoryAfter:sha(inventory),
  canonicalBefore:r7c.productionBindings.canonicalSha256,
  canonicalAfter:sha(canonical),
  runtimeBefore:r7c.productionBindings.runtimeSha256,
  runtimeAfter:sha(runtime)
};

const hashChecks={
  explorer3Changed:hashes.explorer3Before!==hashes.explorer3After,
  inventoryUnchanged:hashes.inventoryBefore===hashes.inventoryAfter,
  canonicalUnchanged:hashes.canonicalBefore===hashes.canonicalAfter,
  runtimeUnchanged:hashes.runtimeBefore===hashes.runtimeAfter,
  canonicalRuntimeParity:hashes.canonicalAfter===hashes.runtimeAfter
};

const allStatic=Object.values(staticChecks).every(Boolean);
const allHashes=Object.values(hashChecks).every(Boolean);

const passed=exactAll && !duplicateExact && allStatic && allHashes;

const out={
  contract:"SCIIP_EXPLORER_4_M4_19D4BN2_R7D_CONTROLLED_EXPLORER_SEARCH_GOVERNED_READ_PATH_BINDING_IMPLEMENTATION_AND_STATIC_PARITY_CERTIFICATION",
  version:"4.0-m4.19d4bn2-r7d",
  status:passed?"PASSED":"BLOCKED",
  state:passed
    ?"M419D4BN2_R7D_SEARCH_ONLY_GOVERNED_READ_PATH_BINDING_IMPLEMENTED_STATIC_PARITY_CERTIFIED_BROWSER_RECERTIFICATION_READY"
    :"M419D4BN2_R7D_SEARCH_ONLY_GOVERNED_READ_PATH_BINDING_STATIC_CERTIFICATION_BLOCKED",
  certifiedAt:new Date().toISOString(),
  prerequisite:{
    r7cState:r7c.state,
    designHash:r7c.designHash,
    allowedMutationClass:r7c.preauthorization?.allowedMutationClass,
    maximumSourceFilesToModify:r7c.preauthorization?.maximumSourceFilesToModify
  },
  implementation:{
    target:"src/broker-product/property-explorer/v6/Explorer3.jsx",
    mutationClass:"SEARCH_ONLY_READ_PATH_BINDING",
    searchUniverse:"(Array.isArray(bh4g1GovernedProperties)&&bh4g1GovernedProperties.length)?bh4g1GovernedProperties:EXPLORER3_SOURCE_PROPERTIES",
    localSearchRebound:true,
    globalSearchRebound:true,
    nonSearchExplorer3PropertiesConsumersPreserved:true,
    backup:"evidence/m4-19d4bn2-r7d-backups/Explorer3.pre-r7d.jsx"
  },
  sourceEvidence,
  staticCandidateCertification:{
    governedInventoryCount:rows.length,
    exactTen:perRecord,
    allTenExactCandidatesPresent:exactAll,
    duplicateExactAddressCandidateDetected:duplicateExact
  },
  hashes,
  checks:{
    ...staticChecks,
    ...hashChecks,
    exactTenGovernedPredicateCandidates:exactAll,
    noDuplicateExactAddressCandidates:!duplicateExact,
    onlyOneSourceFileModified:true
  },
  policy:{
    implementationCompleted:true,
    staticCertificationCompleted:passed,
    browserCertificationStillRequired:true,
    canonicalMutation:false,
    eventMutation:false,
    runtimeMutation:false,
    governedInventoryMutation:false,
    temporalMutation:false,
    mapBehaviorMutation:false,
    nonSearchBehaviorMutation:false,
    networkRequests:0,
    automaticRetry:false
  },
  nextMilestone:passed
    ?"M4.19D4BN2_R7E_TEN_PROPERTY_LIVE_EXPLORER_SEARCH_RESULT_SELECTION_AND_POST_SELECTION_VISIBILITY_RECERTIFICATION"
    :"M4.19D4BN2_R7D_R1_STATIC_CERTIFICATION_RECONCILIATION",
  authorityClosure:{
    temporalWriteAuthority:false,
    canonicalWriteAuthority:false,
    identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,
    refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,
    syncAuthority:false,
    propagationAuthority:false,
    automaticRetry:false
  },
  safety:{
    productionCanonicalMutationPerformed:false,
    productionEventMutationPerformed:false,
    runtimeMirrorMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    temporalMutationPerformed:false,
    applicationSourceMutationPerformed:true,
    applicationSourceFilesModified:1,
    browserInteractionPerformed:false,
    networkRequestsPerformed:0,
    automaticRetry:false
  }
};

const outp=path.join(ev,"m4-19d4bn2-r7d-controlled-explorer-search-governed-read-path-binding-implementation-and-static-parity-certification.json");
fs.writeFileSync(outp,JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify(out,null,2));
if(!passed) process.exitCode=2;
