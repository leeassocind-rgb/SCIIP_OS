#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,nonEmpty,extractRouteBlocks} from "./M419D4ANRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const amResultPath=path.join(ev,"m4-19d4am-lightbox-address-identifier-resolution-contract-forensics.json");
const amPlanPath=path.join(ev,"m4-19d4am-lightbox-resolution-preauthorization-plan.json");
const locatorPath=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const resultPath=path.join(ev,"m4-19d4an-lightbox-address-resolution-single-read-preauthorization.json");
const manifestPath=path.join(ev,"m4-19d4an-lightbox-address-resolution-single-read-preauthorization-manifest.json");
const auditPath=path.join(ev,"m4-19d4an-address-resolution-route-binding-audit.json");

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
      networkRequestsPerformed:0,addressResolutionRequestsPerformed:0,enrichmentRequestsPerformed:0,
      sourceMutationPerformed:false,processMutationPerformed:false,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      secretValuesExposed:false
    }
  };
  write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(code);
};

for(const p of [amResultPath,amPlanPath,locatorPath,proxyPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AN_PREREQUISITE_MISSING",{path:p},3);
}

const am=JSON.parse(fs.readFileSync(amResultPath,"utf8"));
if(am?.state!=="M419D4AM_LIGHTBOX_ADDRESS_RESOLUTION_REQUEST_RESPONSE_CONTRACT_CERTIFIED_PREAUTHORIZATION_READY"){
  finish("BLOCKED","M419D4AN_AM_ADDRESS_CONTRACT_STATE_REQUIRED",{observed:am?.state??null},3);
}
const amPlan=JSON.parse(fs.readFileSync(amPlanPath,"utf8"));
const locator=JSON.parse(fs.readFileSync(locatorPath,"utf8"));
const address=locator?.locator?.address;
const normalizedAddress=locator?.locator?.normalizedAddress;
const canonicalPropertyId=locator?.boundIdentity?.canonicalPropertyId;
const sourcePropertyId=locator?.boundIdentity?.sourcePropertyId;

if(![address,canonicalPropertyId,sourcePropertyId].every(nonEmpty)){
  finish("BLOCKED","M419D4AN_CERTIFIED_LOCATOR_BINDING_INCOMPLETE",{},3);
}

const proxy=fs.readFileSync(proxyPath,"utf8");
const blocks=extractRouteBlocks(proxy);

// Candidate route must be POST and expose a body/subject path.
// Prefer a parcel-resolution route over generic enrich if address semantics are present.
const candidates=blocks.filter(b=>
  b.method==="POST" &&
  /\/api\/lightbox\/(?:parcel\/resolve|resolve|enrich)$/i.test(b.route)
).map(b=>({
  ...b,
  hasBody:/readJsonBody\(req\)|body\./.test(b.text),
  hasSubject:/body\.subject|const\s+subject\s*=\s*body\.subject/.test(b.text),
  hasAddress:/subject\.address|body\.address|address\b/i.test(b.text),
  hasCoordinates:/subject\.lat|subject\.lng|INVALID_COORDINATES/i.test(b.text),
  hasId:/subject\.id|SUBJECT_REQUIRED/i.test(b.text)
}));

const exactAddressCandidates=candidates.filter(c=>c.hasBody&&c.hasAddress);
exactAddressCandidates.sort((a,b)=>{
  const rank=x=>/parcel\/resolve$/i.test(x.route)?0:(/resolve$/i.test(x.route)?1:2);
  return rank(a)-rank(b);
});

if(exactAddressCandidates.length===0){
  const audit={
    contract:"SCIIP_EXPLORER_4_M4_19D4AN_ADDRESS_ROUTE_BINDING_AUDIT",
    version:VERSION,
    generatedAt:new Date().toISOString(),
    certifiedAddress:address,
    routeCandidates:candidates.map(c=>({
      route:c.route,method:c.method,hasBody:c.hasBody,hasSubject:c.hasSubject,
      hasAddress:c.hasAddress,hasCoordinates:c.hasCoordinates,hasId:c.hasId,
      startLine:c.startLine,endLine:c.endLine
    })),
    classification:"AM_ADDRESS_SEMANTIC_PROOF_NOT_EXPOSED_AS_DIRECT_PROXY_REQUEST_CONTRACT",
    networkRequestsPerformed:0
  };
  write(auditPath,audit);
  finish("BLOCKED","M419D4AN_DIRECT_ADDRESS_PROXY_REQUEST_CONTRACT_NOT_EXACTLY_BOUND",{
    binding:{
      certifiedAddress:address,
      candidateCount:candidates.length,
      exactAddressCandidateCount:0
    },
    artifacts:{routeBindingAudit:auditPath},
    nextMilestone:"M4.19D4AN1_ADDRESS_RESOLUTION_CALLER_TO_PROXY_REQUEST_SHAPE_FORENSICS"
  },3);
}

const selected=exactAddressCandidates[0];

// Bind the minimum request shape supported by the selected proxy route.
// Keep exact identity alongside address for evidence lineage.
const body={
  subject:{
    id:sourcePropertyId,
    canonicalPropertyId,
    address
  }
};
if(selected.route==="/api/lightbox/enrich") body.requested=["parcels"];

const requestContract={
  endpoint:{
    transport:"LOCAL_LIGHTBOX_PROXY",
    method:selected.method,
    route:selected.route
  },
  body,
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  certifiedAddress:{address,normalizedAddress},
  evidenceRequirements:{
    sourceNativeProviderResponseRequired:true,
    providerIdentityRequired:true,
    observationTimestampRequired:true,
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    exactRequestHashRequired:true,
    addressMatchEvidenceRequired:true,
    sourceNativeCoordinatesOrGeometryRequired:true,
    nullCoordinatesMustBlock:true,
    zeroZeroMustBlock:true,
    contradictoryIdentityOrAddressMustBlock:true
  },
  executionPolicy:{
    maximumAddressResolutionRequests:1,
    automaticRetry:false,
    blindRetry:false,
    executionAuthorized:false,
    explicitAuthorizationRequired:true
  }
};
const requestHash=sha(JSON.stringify(requestContract));

const manifest={
  contract:"SCIIP_EXPLORER_4_M4_19D4AN_LIGHTBOX_ADDRESS_RESOLUTION_SINGLE_READ_PREAUTHORIZATION_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  amContractState:am.state,
  amPreauthorizationPlanPath:amPlanPath,
  locatorManifestPath:locatorPath,
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  certifiedAddress:{address,normalizedAddress},
  selectedRoute:{
    method:selected.method,
    route:selected.route,
    sourceFile:proxyPath,
    sourceLineRange:[selected.startLine,selected.endLine]
  },
  requestContract,
  requestHash,
  executionAuthorized:false,
  maximumAddressResolutionRequests:1,
  automaticRetry:false
};
write(manifestPath,manifest);

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AN_ADDRESS_ROUTE_BINDING_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  certifiedAddress:address,
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  routeCandidates:candidates.map(c=>({
    route:c.route,method:c.method,hasBody:c.hasBody,hasSubject:c.hasSubject,
    hasAddress:c.hasAddress,hasCoordinates:c.hasCoordinates,hasId:c.hasId,
    startLine:c.startLine,endLine:c.endLine
  })),
  selectedRoute:{route:selected.route,method:selected.method,startLine:selected.startLine,endLine:selected.endLine},
  requestHash,
  classification:"EXACT_ADDRESS_PROXY_REQUEST_CONTRACT_BOUND",
  networkRequestsPerformed:0
};
write(auditPath,audit);

finish("PASSED","M419D4AN_LIGHTBOX_ADDRESS_RESOLUTION_SINGLE_READ_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
  binding:{
    canonicalPropertyId,sourcePropertyId,address,normalizedAddress,
    method:selected.method,
    route:selected.route,
    requestHash,
    maximumAddressResolutionRequests:1,
    executionAuthorized:false
  },
  policy:{
    exactProxyRouteBound:true,
    exactRequestBodyBound:true,
    sourceNativeResponseRequired:true,
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    nullCoordinatesMustBlock:true,
    zeroZeroMustBlock:true,
    contradictoryIdentityOrAddressMustBlock:true,
    automaticRetry:false,
    explicitAuthorizationRequired:true
  },
  artifacts:{
    addressResolutionPreauthorizationManifest:manifestPath,
    routeBindingAudit:auditPath
  },
  nextMilestone:"M4.19D4AO_CONTROLLED_SINGLE_LIGHTBOX_ADDRESS_RESOLUTION_EXECUTION_AND_COORDINATE_EVIDENCE_BINDING"
},0);
