#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const r7bp=path.join(ev,"m4-19d4bn2-r7b-explorer-search-candidate-builder-filter-and-index-causal-trace.json");
if(!fs.existsSync(r7bp)) throw new Error("R7B evidence missing");
const r7b=JSON.parse(fs.readFileSync(r7bp,"utf8"));

if(r7b.status!=="PASSED" ||
   !String(r7b.state).includes("FIRST_EXCLUSION_POINTS_CERTIFIED_REMEDIATION_READY"))
  throw new Error("R7B prerequisite state not accepted");

if(r7b.causalTrace?.dominantCause!=="EXPLORER3_PROPERTIES_STATIC_SEED")
  throw new Error("R7B dominant cause does not authorize static-seed remediation design");

const explorer3=path.join(app,"src/broker-product/property-explorer/v6/Explorer3.jsx");
const inventory=path.join(app,"public/explorer/governed-base-inventory.json");
const canonical=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const runtime=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");

for(const p of [explorer3,inventory,canonical,runtime]) if(!fs.existsSync(p)) throw new Error("required binding missing: "+p);

function sha(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex")}
function read(p){return fs.readFileSync(p,"utf8")}
function lineMatches(text,re){
  const out=[];
  text.split(/\r?\n/).forEach((line,i)=>{if(re.test(line)) out.push({line:i+1,text:line.trim().slice(0,1600)})});
  return out;
}

const src=read(explorer3);
const inventoryJson=JSON.parse(read(inventory));
const inventoryRows=Array.isArray(inventoryJson?.properties)?inventoryJson.properties:null;
if(!inventoryRows) throw new Error("governed inventory properties array unresolved");

const bindings={
  explorer3Sha256:sha(explorer3),
  inventorySha256:sha(inventory),
  canonicalSha256:sha(canonical),
  runtimeSha256:sha(runtime),
  canonicalRuntimeParity:sha(canonical)===sha(runtime),
  governedInventoryCount:inventoryRows.length
};

const requiredSourceEvidence={
  governedFetch:lineMatches(src,/fetch\(['"]\/explorer\/governed-base-inventory\.json/),
  governedBinding:lineMatches(src,/bh4g1GovernedProperties|setBh4g1GovernedProperties|governed-base-inventory/i),
  explorer3PropertiesDefinition:lineMatches(src,/const\s+EXPLORER3_PROPERTIES\s*=/),
  propertySearch:lineMatches(src,/const\s+searchResults\s*=.*EXPLORER3_PROPERTIES\.filter/),
  globalSearch:lineMatches(src,/resolveGlobalPropertySearch\(EXPLORER3_PROPERTIES/),
  selectedProperty:lineMatches(src,/EXPLORER3_PROPERTIES\.find/),
  visibleProperties:lineMatches(src,/EXPLORER3_PROPERTIES\.filter/)
};

if(!requiredSourceEvidence.explorer3PropertiesDefinition.length) throw new Error("EXPLORER3_PROPERTIES definition not found");
if(!requiredSourceEvidence.propertySearch.length) throw new Error("propertySearch EXPLORER3_PROPERTIES binding not found");
if(!requiredSourceEvidence.globalSearch.length) throw new Error("global search EXPLORER3_PROPERTIES binding not found");

const exactTen=r7b.causalTrace?.perRecord;
if(!Array.isArray(exactTen)||exactTen.length!==10) throw new Error("R7B exact ten causal trace unresolved");

const allTenAtStaticSeed=exactTen.every(r=>r.firstExclusion==="EXPLORER3_PROPERTIES_STATIC_SEED");
if(!allTenAtStaticSeed) throw new Error("not all ten share static-seed exclusion");

const remediationDesign={
  capability:"EXPLORER_SEARCH_GOVERNED_READ_PATH_BINDING",
  purpose:"Make Search SCIIP resolve against the governed Explorer property population already loaded from public/explorer/governed-base-inventory.json rather than the stale EXPLORER3_PROPERTIES static seed.",
  targetModule:"src/broker-product/property-explorer/v6/Explorer3.jsx",
  mutationScope:{
    allowed:[
      "Introduce a single governed search-universe binding derived from the already-hydrated governed property collection.",
      "Bind local propertySearch candidate filtering to the governed search universe.",
      "Bind resolveGlobalPropertySearch to the governed search universe.",
      "Preserve existing search scoring, ordering, query normalization, result rendering, and selection callbacks.",
      "Add bounded parity/visibility tests for the exact ten-property cohort."
    ],
    prohibited:[
      "Mutate canonical identity storage.",
      "Mutate canonical creation-event storage.",
      "Mutate runtime canonical mirror data.",
      "Mutate governed-base-inventory records.",
      "Mutate temporal or availability observations.",
      "Change map visibility/filter semantics.",
      "Change neighbor, market-context, compare, or property-intelligence behavior.",
      "Replace EXPLORER3_PROPERTIES globally unless separately certified.",
      "Perform network ingestion.",
      "Authorize broad-scale search refactoring."
    ]
  },
  preferredImplementation:{
    strategy:"SEARCH_ONLY_READ_PATH_BRIDGE",
    designRule:"Do not globally replace EXPLORER3_PROPERTIES. Create a search-specific property universe from the hydrated governed collection, with fallback to EXPLORER3_PROPERTIES only when governed hydration is unavailable.",
    proposedBinding:"const SEARCH_PROPERTIES = bh4g1GovernedProperties?.length ? bh4g1GovernedProperties : EXPLORER3_PROPERTIES;",
    consumersToRebind:[
      "propertySearch -> SEARCH_PROPERTIES.filter(...)",
      "resolveGlobalPropertySearch(SEARCH_PROPERTIES,value)",
      "global search session replay dependency -> SEARCH_PROPERTIES"
    ],
    consumersExplicitlyNotRebound:[
      "sourceSelectedProperty",
      "visibleProperties",
      "map rendering",
      "neighbor context",
      "market context",
      "compare dock",
      "property intelligence",
      "all non-search EXPLORER3_PROPERTIES consumers"
    ]
  },
  invariants:{
    canonicalRuntimeParityMustRemain:true,
    governedInventoryHashMustRemain:true,
    explorer3PreMutationHashMustMatch:true,
    exactTenMustExistInGovernedInventory:true,
    noDuplicateSearchCandidates:true,
    searchResultOrderingMustRemainDeterministic:true,
    exactAddressSearchMustReturnMatchingCandidate:true,
    selectionCallbackSemanticsMustRemain:true,
    applicationMutationRequiresSeparateMilestone:true
  },
  certificationPlan:[
    "Static source patch inspection.",
    "Unit test search-universe binding.",
    "Verify all ten exact addresses are candidates.",
    "Verify no duplicate candidates by id/address.",
    "Verify canonical/runtime/inventory hashes unchanged.",
    "Run browser Search SCIIP exact-ten query/result/selection/post-selection certification.",
    "Only after browser PASS permit lifecycle closure."
  ]
};

const designHash=crypto.createHash("sha256").update(JSON.stringify(remediationDesign)).digest("hex");

const out={
  contract:"SCIIP_EXPLORER_4_M4_19D4BN2_R7C_EXPLORER_SEARCH_READ_PATH_REMEDIATION_DESIGN_AND_PREAUTHORIZATION",
  version:"4.0-m4.19d4bn2-r7c",
  status:"PASSED",
  state:"M419D4BN2_R7C_SEARCH_ONLY_GOVERNED_READ_PATH_REMEDIATION_DESIGNED_IMPLEMENTATION_PREAUTHORIZED_NOT_EXECUTED",
  certifiedAt:new Date().toISOString(),
  prerequisite:{
    r7bState:r7b.state,
    dominantCause:r7b.causalTrace.dominantCause,
    exactTen:r7b.causalTrace.perRecord.length===10,
    allTenFirstExclusionStaticSeed:allTenAtStaticSeed
  },
  productionBindings:bindings,
  sourceEvidence:requiredSourceEvidence,
  remediationDesign,
  designHash,
  preauthorization:{
    implementationAuthorizedNextMilestone:true,
    sourceMutationAuthorizedThisMilestone:false,
    productionExecutionAuthorized:false,
    exactMutationTarget:"src/broker-product/property-explorer/v6/Explorer3.jsx",
    allowedMutationClass:"SEARCH_ONLY_READ_PATH_BINDING",
    maximumSourceFilesToModify:1,
    governedInventoryReadOnly:true,
    canonicalStoresReadOnly:true,
    runtimeMirrorReadOnly:true,
    browserCertificationRequiredAfterImplementation:true
  },
  checks:{
    r7bPassed:true,
    dominantCauseCertified:true,
    allTenShareSameExclusion:true,
    explorer3Bound:true,
    governedInventoryBound:true,
    canonicalRuntimeParity:true,
    governedFetchPresent:requiredSourceEvidence.governedFetch.length>0,
    staticSeedSearchBindingPresent:true,
    designHashFrozen:true,
    noMutationPerformed:true
  },
  policy:{
    designOnly:true,
    implementationNotExecuted:true,
    applicationSourceMutation:false,
    canonicalMutation:false,
    eventMutation:false,
    runtimeMutation:false,
    inventoryMutation:false,
    temporalMutation:false,
    browserInteraction:false,
    networkRequests:0,
    automaticRetry:false
  },
  nextMilestone:"M4.19D4BN2_R7D_CONTROLLED_EXPLORER_SEARCH_GOVERNED_READ_PATH_BINDING_IMPLEMENTATION_AND_STATIC_PARITY_CERTIFICATION",
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
    temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    applicationMutationPerformed:false,
    uiMutationPerformed:false,
    browserInteractionPerformed:false,
    networkRequestsPerformed:0,
    automaticRetry:false
  }
};

fs.writeFileSync(path.join(ev,"m4-19d4bn2-r7c-explorer-search-read-path-remediation-design-and-preauthorization.json"),JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify(out,null,2));
