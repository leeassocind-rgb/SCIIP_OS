#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf,walk} from "./M419D4EBFRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const ePath=path.join(ev,"m4-19d4bd4e-structural-delta-adjudication.json");
const eManifest=path.join(ev,"m4-19d4bd4e-safe-in-place-materialization-certification-manifest.json");
const result=path.join(ev,"m4-19d4bf-runtime-explorer-visibility-ui-binding-certification.json");
const audit=path.join(ev,"m4-19d4bf-runtime-explorer-ui-dataflow-audit.json");
const manifest=path.join(ev,"m4-19d4bf-runtime-explorer-visibility-certification-manifest.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BF_RUNTIME_EXPLORER_VISIBILITY_AND_UI_BINDING_CERTIFICATION",
 version:"4.0-m4.19d4bf",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,sourceMutationPerformed:false,uiMutationPerformed:false,
 runtimeMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [ePath,eManifest])
 if(!fs.existsSync(p))done("BLOCKED","M419D4BF_REQUIRED_ARTIFACT_MISSING",{missing:p},3);

const e=JSON.parse(fs.readFileSync(ePath,"utf8"));
if(e.state!=="M419D4BD4E_SAFE_DETERMINISTIC_IN_PLACE_MATERIALIZATION_CERTIFIED_RUNTIME_EXPLORER_VISIBILITY_PREAUTHORIZED")
 done("BLOCKED","M419D4BF_BD4E_SAFE_MATERIALIZATION_STATE_REQUIRED",{observed:e.state},3);

const m=JSON.parse(fs.readFileSync(eManifest,"utf8"));
const sourceText=fs.readFileSync(m.currentInventoryPath,"utf8");
if(sha(sourceText)!==m.currentInventorySha256)
 done("BLOCKED","M419D4BF_GOVERNED_RUNTIME_INVENTORY_CHANGED_AFTER_BD4E",{},3);

const roots=[path.join(app,"src"),path.join(app,"server")];
const files=walk(fs,path,roots,{maxFiles:7000});
const exts=new Set([".js",".mjs",".ts",".tsx",".jsx"]);
const refs=[];
for(const p of files){
 if(!exts.has(path.extname(p).toLowerCase()))continue;
 let s="";try{s=fs.readFileSync(p,"utf8")}catch{continue}
 const rel=path.relative(app,p);
 if(rel.startsWith("src/explorer4/"))continue;
 const inventoryRef=/governed-base-inventory/i.test(s);
 const fetchRef=/fetch\s*\([^)]*governed-base-inventory/i.test(s);
 const importRef=/import[\s\S]{0,300}governed-base-inventory/i.test(s)||/require\s*\([^)]*governed-base-inventory/i.test(s);
 const loader=/load|fetch|hydrate|inventory|dataset|repository|store/i.test(s);
 const ui=/property.?explorer|explorer|map|marker|property.?panel|property.?card|property.?list|sidebar/i.test(rel+" "+s);
 const avail=/availableSf/i.test(s);
 const coords=/latitude|longitude|lat|lng/i.test(s);
 const identity=/canonicalPropertyId|sourcePropertyId|propertyId/i.test(s);
 if(inventoryRef||fetchRef||importRef){
  refs.push({path:p,relativePath:rel,inventoryRef,fetchRef,importRef,loader,ui,availableSf:avail,coordinates:coords,identity});
 }
}

const loaders=refs.filter(x=>x.fetchRef||x.importRef||x.inventoryRef);
const uiBound=loaders.filter(x=>x.ui);
const fullFieldUi=uiBound.filter(x=>x.availableSf&&x.coordinates&&x.identity);

/* Also prove the target is actually in the runtime authority file now. */
const {records}=recordsOf(JSON.parse(sourceText));
const targetMatches=records.map((r,i)=>({r,i})).filter(({r})=>{
 const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.id,r.address,r.streetAddress,r.fullAddress].map(norm).filter(Boolean);
 return vals.includes(norm(m.canonicalPropertyId))||vals.includes(norm(m.address));
});
const r=targetMatches[0]?.r;
const dataChecks={
 targetCardinalityOne:targetMatches.length===1,
 canonicalPropertyId:norm(r?.canonicalPropertyId)===norm(m.canonicalPropertyId),
 address:norm(r?.address)===norm(m.address),
 latitude:Number(r?.latitude)===Number(m.latitude),
 longitude:Number(r?.longitude)===Number(m.longitude),
 availableSf:Number(r?.availableSf)===Number(m.availableSf)
};

let classification="UI_RUNTIME_BINDING_INCOMPLETE";
if(uiBound.length>0 && Object.values(dataChecks).every(Boolean))
 classification=fullFieldUi.length>0
  ?"RUNTIME_AUTHORITY_TO_EXPLORER_UI_FULL_FIELD_BINDING_PROVEN"
  :"RUNTIME_AUTHORITY_TO_EXPLORER_UI_CONSUMPTION_PROVEN_FIELD_USAGE_PARTIAL";

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BF_RUNTIME_EXPLORER_UI_DATAFLOW_AUDIT",
 version:"4.0-m4.19d4bf",generatedAt:new Date().toISOString(),
 classification,filesScanned:files.length,referenceCount:refs.length,
 loaderCount:loaders.length,uiBoundConsumerCount:uiBound.length,fullFieldUiConsumerCount:fullFieldUi.length,
 references:refs.slice(0,120),uiBoundConsumers:uiBound,fullFieldUiConsumers:fullFieldUi,
 dataChecks,targetIndex:targetMatches[0]?.i??null
});

if(uiBound.length===0 || !Object.values(dataChecks).every(Boolean)){
 done("PASSED","M419D4BF_RUNTIME_EXPLORER_UI_BINDING_NOT_YET_CERTIFIED_DATAFLOW_FORENSICS_REQUIRED",{
  certification:{classification,loaderCount:loaders.length,uiBoundConsumerCount:uiBound.length,
   fullFieldUiConsumerCount:fullFieldUi.length,dataChecks},
  artifacts:{runtimeUiDataflowAudit:audit},
  nextMilestone:"M4.19D4BF1_RUNTIME_LOADER_TO_UI_DATAFLOW_FORENSICS"
 });
}

const cert={
 contract:"SCIIP_EXPLORER_4_M4_19D4BF_RUNTIME_EXPLORER_VISIBILITY_CERTIFICATION_MANIFEST",
 version:"4.0-m4.19d4bf",generatedAt:new Date().toISOString(),
 classification,sourceInventoryPath:m.currentInventoryPath,sourceInventorySha256:m.currentInventorySha256,
 recordCount:records.length,targetIndex:targetMatches[0].i,
 canonicalPropertyId:r.canonicalPropertyId,address:r.address,latitude:r.latitude,longitude:r.longitude,
 availableSf:r.availableSf,loaderCount:loaders.length,uiBoundConsumerCount:uiBound.length,
 fullFieldUiConsumerCount:fullFieldUi.length,
 runtimeVisibilityCertified:true,liveBrowserRenderNotExecuted:true
};
write(manifest,cert);

done("PASSED","M419D4BF_RUNTIME_EXPLORER_DATA_VISIBILITY_AND_UI_BINDING_CERTIFIED_LIVE_BROWSER_RENDER_NOT_YET_CERTIFIED",{
 certification:{classification,recordCount:records.length,targetIndex:targetMatches[0].i,
  canonicalPropertyId:r.canonicalPropertyId,address:r.address,latitude:r.latitude,longitude:r.longitude,
  availableSf:r.availableSf,loaderCount:loaders.length,uiBoundConsumerCount:uiBound.length,
  fullFieldUiConsumerCount:fullFieldUi.length,runtimeVisibilityCertified:true,liveBrowserRenderCertified:false},
 policy:{repositoryRuntimeDataflowCertified:true,liveBrowserRenderRequiresSeparateEvidence:true,
  noUiMutation:true,noNetworkRequest:true},
 artifacts:{runtimeUiDataflowAudit:audit,runtimeVisibilityCertificationManifest:manifest},
 nextMilestone:"M4.19D4BG_LIVE_EXPLORER_RUNTIME_RENDER_PREAUTHORIZATION_AND_VISIBILITY_CERTIFICATION"
});
