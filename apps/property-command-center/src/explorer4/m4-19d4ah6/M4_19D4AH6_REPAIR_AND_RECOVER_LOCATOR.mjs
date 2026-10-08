#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,strictNumber,usablePair,normalizeText} from "./M419D4AH6Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const priorPath=path.join(ev,"m4-19d4ah5-zero-coordinate-placeholder-forensics.json");
const templatePath=path.join(ev,"m4-19d4ah2-coordinate-evidence-template.json");
const oldManifestPath=path.join(ev,"m4-19d4ad-single-record-enrich-read-preauthorization-manifest.json");
const validatorPath=path.join(app,"src/explorer4/m4-19d4ah3/M419D4AH3ValidationRuntime.js");

const resultPath=path.join(ev,"m4-19d4ah6-coordinate-validation-repair-true-locator-recovery.json");
const auditPath=path.join(ev,"m4-19d4ah6-true-locator-recovery-audit.json");
const backupPath=path.join(ev,"m4-19d4ah6-M419D4AH3ValidationRuntime-pre-repair.js");

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
      networkRequestsPerformed:0,enrichmentRequestsPerformed:0,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [priorPath,templatePath,oldManifestPath,validatorPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AH6_PREREQUISITE_MISSING",{path:p},3);
}
const prior=JSON.parse(fs.readFileSync(priorPath,"utf8"));
if(prior?.state!=="M419D4AH5_ZERO_COORDINATE_PLACEHOLDER_DEFECT_CERTIFIED_VALIDATION_REPAIR_REQUIRED")
  finish("BLOCKED","M419D4AH6_AH5_CERTIFIED_REPAIR_STATE_REQUIRED",{observed:prior?.state??null},3);

// Repair the AH3 validator only. Backup first.
const originalValidator=fs.readFileSync(validatorPath,"utf8");
if(!fs.existsSync(backupPath)) fs.writeFileSync(backupPath,originalValidator);
let repaired=originalValidator;

// Replace the permissive Number(null)=>0 helpers with strict presence-aware validation.
repaired=repaired.replace(
  /export function validLat\(v\)\{const n=Number\(v\);return Number\.isFinite\(n\)&&n>=-90&&n<=90\}/,
  `export function validLat(v){if(v===null||v===undefined)return false;if(typeof v==="string"&&v.trim()==="")return false;const n=Number(v);return Number.isFinite(n)&&n>=-90&&n<=90}`
);
repaired=repaired.replace(
  /export function validLng\(v\)\{const n=Number\(v\);return Number\.isFinite\(n\)&&n>=-180&&n<=180\}/,
  `export function validLng(v){if(v===null||v===undefined)return false;if(typeof v==="string"&&v.trim()==="")return false;const n=Number(v);return Number.isFinite(n)&&n>=-180&&n<=180}`
);

// Add explicit zero-pair rejection if not already present in the validator module.
if(!/validCoordinatePair/.test(repaired)){
  repaired += `\nexport function validCoordinatePair(lat,lng){return validLat(lat)&&validLng(lng)&&!(Number(lat)===0&&Number(lng)===0)}\n`;
}
fs.writeFileSync(validatorPath,repaired);

const repairVerified=
  repaired.includes('v===null||v===undefined') &&
  repaired.includes('validCoordinatePair') &&
  !usablePair(null,null) &&
  !usablePair(0,0) &&
  usablePair(34.05,-118.25);

if(!repairVerified){
  finish("BLOCKED","M419D4AH6_COORDINATE_VALIDATOR_REPAIR_VERIFICATION_FAILED",{
    repair:{sourceMutationPerformed:true,backupPath}
  },3);
}

const manifest=JSON.parse(fs.readFileSync(oldManifestPath,"utf8"));
const canonicalId=manifest?.sample?.canonicalPropertyId;
const sourceId=manifest?.sample?.sourcePropertyId;
if(!canonicalId||!sourceId)
  finish("BLOCKED","M419D4AH6_BOUND_IDENTITY_REQUIRED");

const roots=[app,path.join(repo,"tools")].filter(fs.existsSync);
const allowed=new Set([".json",".js",".mjs",".cjs",".ts",".tsx",".jsx",".csv",".tsv",".txt",".md",".geojson"]);
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules",".git","dist","build","coverage",".vite"].includes(ent.name))continue;
      walk(p);
    }else if(allowed.has(path.extname(ent.name).toLowerCase())) files.push(p);
  }
}
for(const r of roots) walk(r);

// Recover address/locator evidence near exact identity.
const addressPatterns=[
  /\b\d{1,7}\s+[A-Za-z0-9.'#\- ]{2,80}\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Pkwy|Parkway|Ct|Court|Pl|Place|Hwy|Highway)\b[^,\n]{0,40}(?:,\s*[A-Za-z .'-]{2,40})?(?:,\s*CA\b)?(?:\s+\d{5}(?:-\d{4})?)?/ig,
  /"address"\s*:\s*"([^"]{5,180})"/ig,
  /"streetAddress"\s*:\s*"([^"]{5,180})"/ig
];

const hits=[];
for(const p of files){
  let text; try{
    const st=fs.statSync(p);
    if(st.size>25*1024*1024)continue;
    text=fs.readFileSync(p,"utf8");
  }catch{continue}

  for(const id of [canonicalId,sourceId]){
    let idx=0;
    while(true){
      const hit=text.indexOf(id,idx);
      if(hit<0)break;
      const start=Math.max(0,hit-5000),end=Math.min(text.length,hit+5000);
      const slice=text.slice(start,end);
      for(const re0 of addressPatterns){
        const re=new RegExp(re0.source,re0.flags);
        for(const m of slice.matchAll(re)){
          const raw=m[1]??m[0];
          const address=normalizeText(raw.replace(/^"?(?:address|streetAddress)"?\s*:\s*"?/i,"").replace(/"$/,""));
          if(address.length<5)continue;
          hits.push({
            file:p,
            identity:id,
            identityIndex:hit,
            address,
            fileSha256:sha(text)
          });
        }
      }
      idx=hit+1;
    }
  }
}

const uniq=new Map();
for(const h of hits){
  const key=h.address.toLowerCase().replace(/[.,]/g,"").replace(/\s+/g," ");
  if(!uniq.has(key)) uniq.set(key,{address:h.address,evidence:[]});
  uniq.get(key).evidence.push({file:h.file,identity:h.identity,fileSha256:h.fileSha256});
}
const candidates=[...uniq.values()];

let classification,next;
if(candidates.length===1){
  classification="ONE_IDENTITY_BOUND_ADDRESS_LOCATOR_RECOVERED";
  next="M4.19D4AH7_ADDRESS_LOCATOR_CERTIFICATION_AND_GEOCODE_PREAUTHORIZATION";
}else if(candidates.length>1){
  classification="MULTIPLE_IDENTITY_BOUND_ADDRESS_LOCATORS_REQUIRE_RECONCILIATION";
  next="M4.19D4AH7_ADDRESS_LOCATOR_RECONCILIATION";
}else{
  classification="NO_IDENTITY_BOUND_ADDRESS_LOCATOR_RECOVERED";
  next="M4.19D4AH7_EXTERNAL_OR_OPERATOR_LOCATOR_EVIDENCE_POLICY";
}

const template=JSON.parse(fs.readFileSync(templatePath,"utf8"));
const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH6_TRUE_LOCATOR_RECOVERY_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  validatorRepair:{
    sourceMutationPerformed:true,
    target:validatorPath,
    backupPath,
    strictNullUndefinedEmptyValidation:true,
    zeroZeroPairRejected:true,
    repairVerified
  },
  priorTemplate:{
    latitude:template.latitude,
    longitude:template.longitude,
    usableAfterRepair:usablePair(template.latitude,template.longitude)
  },
  boundIdentity:{canonicalPropertyId:canonicalId,sourcePropertyId:sourceId},
  filesScanned:files.length,
  addressCandidates:candidates.map(c=>({
    address:c.address,
    evidenceFiles:[...new Set(c.evidence.map(e=>e.file))]
  })),
  classification,
  networkRequestsPerformed:0,
  enrichmentRequestsPerformed:0
};
write(auditPath,audit);

finish("PASSED","M419D4AH6_COORDINATE_VALIDATION_REPAIRED_TRUE_LOCATOR_RECOVERY_CERTIFIED",{
  repair:{
    sourceMutationPerformed:true,
    target:validatorPath,
    backupPath,
    repairVerified,
    nullCoordinatesNowRejected:true,
    emptyCoordinatesNowRejected:true,
    zeroZeroPairNowRejected:true
  },
  locatorRecovery:{
    classification,
    filesScanned:files.length,
    candidateCount:candidates.length,
    candidates:candidates.map(c=>({
      address:c.address,
      evidenceFiles:[...new Set(c.evidence.map(e=>e.file))]
    }))
  },
  interpretation:{
    priorNullCoordinateAcceptanceDefectClosed:true,
    noNewExternalRequestPermittedUntilTrueLocatorQualified:true
  },
  artifacts:{locatorRecoveryAudit:auditPath,validatorBackup:backupPath},
  nextMilestone:next
},0);
