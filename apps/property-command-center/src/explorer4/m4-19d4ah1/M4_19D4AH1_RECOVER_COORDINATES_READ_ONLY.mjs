#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {CONTRACT,VERSION,coordPairsNear} from "./M419D4AH1RecoveryRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4ah-single-record-coordinate-binding-corrected-enrich-preauthorization.json");
const oldManifest=path.join(ev,"m4-19d4ad-single-record-enrich-read-preauthorization-manifest.json");
const resultPath=path.join(ev,"m4-19d4ah1-source-backed-coordinate-recovery-forensics.json");
const auditPath=path.join(ev,"m4-19d4ah1-source-backed-coordinate-recovery-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const sha=x=>crypto.createHash("sha256").update(x).digest("hex");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,oldManifest]) if(!fs.existsSync(p)) block("M419D4AH1_PREREQUISITE_MISSING",{path:p});
const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4AH_SOURCE_BACKED_COORDINATES_NOT_FOUND")
  block("M419D4AH1_EXPECTED_D4AH_COORDINATE_NOT_FOUND_STATE",{observed:pdoc?.state??null});

const manifest=JSON.parse(fs.readFileSync(oldManifest,"utf8"));
const canonicalId=manifest?.sample?.canonicalPropertyId;
const sourceId=manifest?.sample?.sourcePropertyId;
if(!canonicalId||!sourceId) block("M419D4AH1_BOUND_SAMPLE_IDENTITY_REQUIRED");

const roots=[
  app,
  path.join(repo,"tools")
].filter(fs.existsSync);

const allowedExt=new Set([".json",".js",".mjs",".cjs",".ts",".tsx",".jsx",".csv",".tsv",".txt",".md",".geojson"]);
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules",".git","dist","build","coverage",".vite"].includes(ent.name)) continue;
      walk(p);
    } else if(allowedExt.has(path.extname(ent.name).toLowerCase())) files.push(p);
  }
}
for(const r of roots) walk(r);

const hits=[];
for(const p of files){
  let text;
  try{
    const st=fs.statSync(p);
    if(st.size>25*1024*1024) continue;
    text=fs.readFileSync(p,"utf8");
  }catch{continue}
  let idx=0;
  while(true){
    const a=text.indexOf(canonicalId,idx);
    const b=text.indexOf(sourceId,idx);
    let hit=-1,kind=null;
    if(a<0&&b<0) break;
    if(a>=0&&(b<0||a<=b)){hit=a;kind="CANONICAL_ID"}else{hit=b;kind="SOURCE_ID"}
    const coords=coordPairsNear(text,hit,3500);
    if(coords.length){
      hits.push({
        file:p,
        identityKind:kind,
        identityIndex:hit,
        fileSha256:sha(text),
        coordinates:coords
      });
    }
    idx=hit+1;
  }
}

const flattened=[];
for(const h of hits){
  for(const c of h.coordinates){
    flattened.push({
      file:h.file,
      identityKind:h.identityKind,
      lat:c.lat,lng:c.lng,
      snippet:c.snippet,
      fileSha256:h.fileSha256
    });
  }
}

const uniq=new Map();
for(const h of flattened){
  const key=`${h.lat.toFixed(6)},${h.lng.toFixed(6)}`;
  if(!uniq.has(key)) uniq.set(key,{lat:h.lat,lng:h.lng,evidence:[]});
  uniq.get(key).evidence.push({file:h.file,identityKind:h.identityKind,fileSha256:h.fileSha256,snippet:h.snippet});
}
const candidates=[...uniq.values()];

let classification,next;
if(candidates.length===1){
  classification="ONE_SOURCE_BACKED_COORDINATE_PAIR_RECOVERED";
  next="M4.19D4AH2_RECOVERED_COORDINATE_CERTIFICATION_AND_CORRECTED_ENRICH_PREAUTHORIZATION";
}else if(candidates.length>1){
  classification="MULTIPLE_SOURCE_BACKED_COORDINATE_PAIRS_RECOVERED_RECONCILIATION_REQUIRED";
  next="M4.19D4AH2_COORDINATE_EVIDENCE_RECONCILIATION";
}else{
  classification="NO_SOURCE_BACKED_COORDINATES_RECOVERED_FROM_REPOSITORY_TEXT";
  next="M4.19D4AH2_OPERATOR_OR_EXTERNAL_SOURCE_COORDINATE_EVIDENCE_POLICY";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH1_SOURCE_BACKED_COORDINATE_RECOVERY_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  canonicalPropertyId:canonicalId,
  sourcePropertyId:sourceId,
  filesScanned:files.length,
  identityBearingFilesWithCoordinateHits:hits.length,
  uniqueCoordinateCandidates:candidates,
  classification,
  networkRequestsPerformed:0,
  sourceMutationPerformed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4AH1_SOURCE_BACKED_COORDINATE_RECOVERY_FORENSICS_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  forensics:{
    classification,
    filesScanned:files.length,
    identityBearingFilesWithCoordinateHits:hits.length,
    uniqueCoordinateCandidateCount:candidates.length,
    candidates:candidates.map(c=>({
      lat:c.lat,lng:c.lng,
      evidenceFiles:[...new Set(c.evidence.map(e=>e.file))]
    })),
    networkRequestsPerformed:0,
    sourceMutationPerformed:false
  },
  policy:{
    sourceBackedCoordinatesRequired:true,
    syntheticCoordinatesProhibited:true,
    multipleCandidatesRequireReconciliation:true,
    noBlindRetry:true
  },
  artifacts:{coordinateRecoveryAudit:auditPath},
  safety:{
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false
  },
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
  nextMilestone:next
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
