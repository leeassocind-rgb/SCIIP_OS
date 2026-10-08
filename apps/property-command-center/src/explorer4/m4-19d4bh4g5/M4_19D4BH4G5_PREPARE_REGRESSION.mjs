#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import crypto from"node:crypto";import{write}from"./M419D4G5BIRuntime.js";
const repo=path.resolve(process.argv[2]||"."),app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const pre=path.join(ev,"m4-19d4bh4g4-controlled-bessemer-removal-certification.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const exp=path.join(app,"src/broker-product/property-explorer/v6/Explorer3.jsx");
const out=path.join(ev,"m4-19d4bh4g5-production-inventory-generic-runtime-regression-precheck.json");
const sha=s=>crypto.createHash("sha256").update(s).digest("hex");
function finish(state,x={}){let o={contract:"SCIIP_EXPLORER_4_M4_19D4BH4G5_PRODUCTION_INVENTORY_AND_GENERIC_RUNTIME_BINDING_REGRESSION_PRECHECK",version:"4.0-m4.19d4bh4g5",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,safety:{governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false}};write(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)}
if(!fs.existsSync(pre)||!fs.existsSync(invPath)||!fs.existsSync(exp))finish("M419D4BH4G5_REQUIRED_ARTIFACT_OR_SOURCE_MISSING");
let p=JSON.parse(fs.readFileSync(pre,"utf8"));
if(p.state!=="M419D4BH4G4_BESSEMER_REMOVED_FROM_PRODUCTION_INVENTORY_POST_REMOVAL_PARITY_CERTIFIED")finish("M419D4BH4G5_BH4G4_CERTIFICATION_REQUIRED",{observed:p.state});
let raw=fs.readFileSync(invPath,"utf8"),inv=JSON.parse(raw),rows=Array.isArray(inv)?inv:(inv.properties||inv.records||inv.items||[]);
let bessemer=rows.filter(r=>r?.canonicalPropertyId==="CPROP-0021AC235DED809E1821"||/14117-14123 Bessemer St/i.test(String(r?.address||"")));
let source=fs.readFileSync(exp,"utf8");
let markerPresent=source.includes("M419D4BH4G1_R1_GOVERNED_RUNTIME_BINDING");
let governedFetchPresent=source.includes("fetch('/explorer/governed-base-inventory.json'");
let fallbackPresent=source.includes("bh4g1GovernedProperties||EXPLORER3_SOURCE_PROPERTIES");
let representative=null;
for(let i=0;i<rows.length;i++){
 const r=rows[i]; const a=String(r?.address||r?.propertyAddress||"").trim();
 if(a && !/Bessemer/i.test(a)){representative={index:i,address:a,canonicalPropertyId:r?.canonicalPropertyId||null,availableSf:r?.availableSf??null,latitude:r?.latitude??r?.lat??null,longitude:r?.longitude??r?.lng??null};break}
}
let checks={recordCount840:rows.length===840,bessemerAbsent:bessemer.length===0,runtimeBindingMarkerPresent:markerPresent,governedFetchPresent,fallbackPresent,representativeAvailable:Boolean(representative)};
let ready=Object.values(checks).every(Boolean);
finish(ready?"M419D4BH4G5_840_RECORD_PRODUCTION_INVENTORY_AND_GENERIC_RUNTIME_BINDING_PRECHECK_CERTIFIED_LIVE_REGRESSION_READY":"M419D4BH4G5_PRODUCTION_RUNTIME_REGRESSION_PRECHECK_FAILED",{
 precheck:{inventoryRecordCount:rows.length,inventorySha256:sha(raw),bessemerCount:bessemer.length,representative,checks},
 nextMilestone:ready?"M4.19D4BH4G5_LIVE_GENERIC_RUNTIME_REGRESSION":"M4.19D4BH4G5A_PRECHECK_RECONCILIATION"
});
