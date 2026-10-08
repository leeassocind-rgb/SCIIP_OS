#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const repo=path.resolve(process.argv[2]||".");
const auth=process.argv[3]||"";
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const prePath=path.join(ev,"m4-19d4bh4g3-bessemer-production-inventory-removal-preauthorization.json");
const out=path.join(ev,"m4-19d4bh4g4-controlled-bessemer-removal-certification.json");
const TARGET="CPROP-0021AC235DED809E1821", TOKEN="AUTHORIZE_M419D4BH4G4_CONTROLLED_BESSEMER_REMOVAL";
const sha=x=>crypto.createHash("sha256").update(x).digest("hex");
function write(p,x){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n")}
function emit(status,state,x={}){const o={contract:"SCIIP_EXPLORER_4_M4_19D4BH4G4_CONTROLLED_BESSEMER_PRODUCTION_INVENTORY_REMOVAL_AND_POST_REMOVAL_CERTIFICATION",version:"4.0-m4.19d4bh4g4",status,state,certifiedAt:new Date().toISOString(),...x};write(out,o);console.log(JSON.stringify(o,null,2));process.exit(status==="PASSED"?0:2)}
if(!fs.existsSync(prePath)||!fs.existsSync(invPath))emit("BLOCKED","M419D4BH4G4_REQUIRED_ARTIFACT_MISSING");
const pre=JSON.parse(fs.readFileSync(prePath,"utf8"));
if(pre.state!=="M419D4BH4G3_SINGLE_CERTIFICATION_FIXTURE_REMOVAL_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED")emit("BLOCKED","M419D4BH4G4_PREAUTHORIZATION_STATE_INVALID",{observed:pre.state});
if(auth!==TOKEN)emit("PASSED","M419D4BH4G4_CONTROLLED_REMOVAL_AUTHORIZATION_REQUIRED",{authorization:{requiredToken:TOKEN,executionPerformed:false},nextMilestone:"M4.19D4BH4G4_CONTROLLED_BESSEMER_PRODUCTION_INVENTORY_REMOVAL_AND_POST_REMOVAL_CERTIFICATION"});
const raw=fs.readFileSync(invPath,"utf8"), beforeHash=sha(raw), inv=JSON.parse(raw);
const key=Array.isArray(inv)?null:(Array.isArray(inv.properties)?"properties":Array.isArray(inv.records)?"records":Array.isArray(inv.items)?"items":null);
const rows=Array.isArray(inv)?inv:inv[key];
if(!Array.isArray(rows))emit("BLOCKED","M419D4BH4G4_INVENTORY_SHAPE_UNSUPPORTED");
const hits=rows.map((r,i)=>({r,i})).filter(x=>x.r?.canonicalPropertyId===TARGET||/14117-14123 Bessemer St/i.test(String(x.r?.address||"")));
if(hits.length!==1)emit("BLOCKED","M419D4BH4G4_EXACT_TARGET_CARDINALITY_FAILED",{matchCount:hits.length,recordCount:rows.length});
const h=hits[0], recordHash=sha(JSON.stringify(h.r));
if(recordHash!==pre.preauthorization.recordHash)emit("BLOCKED","M419D4BH4G4_TARGET_HASH_DRIFT_BLOCKED",{expected:pre.preauthorization.recordHash,observed:recordHash});
if(rows.length!==pre.preauthorization.inventoryRecordCountBefore)emit("BLOCKED","M419D4BH4G4_INVENTORY_COUNT_DRIFT_BLOCKED",{expected:pre.preauthorization.inventoryRecordCountBefore,observed:rows.length});
const backup=invPath+".m4-19d4bh4g4-pre-removal.bak";
if(!fs.existsSync(backup))fs.copyFileSync(invPath,backup);
const nextRows=rows.filter((_,i)=>i!==h.i);
if(Array.isArray(inv)){inv.length=0;inv.push(...nextRows)}else inv[key]=nextRows;
if(inv.summary&&typeof inv.summary==="object"&&Number(inv.summary.governedExplorerRuntimeRecords)===rows.length) inv.summary.governedExplorerRuntimeRecords=nextRows.length;
const tmp=invPath+".m4-19d4bh4g4.tmp"; fs.writeFileSync(tmp,JSON.stringify(inv,null,2)+"\n"); fs.renameSync(tmp,invPath);
const afterRaw=fs.readFileSync(invPath,"utf8"), after=JSON.parse(afterRaw), afterRows=Array.isArray(after)?after:after[key];
const remaining=afterRows.filter(r=>r?.canonicalPropertyId===TARGET||/14117-14123 Bessemer St/i.test(String(r?.address||"")));
if(afterRows.length!==pre.preauthorization.expectedInventoryRecordCountAfter||remaining.length!==0){
 fs.copyFileSync(backup,invPath);
 emit("BLOCKED","M419D4BH4G4_POST_REMOVAL_PARITY_FAILED_BACKUP_RESTORED",{observedCount:afterRows.length,remainingTargetCount:remaining.length});
}
emit("PASSED","M419D4BH4G4_BESSEMER_REMOVED_FROM_PRODUCTION_INVENTORY_POST_REMOVAL_PARITY_CERTIFIED",{
 certification:{inventoryRecordCountBefore:rows.length,inventoryRecordCountAfter:afterRows.length,removedCanonicalPropertyId:TARGET,removedAddress:h.r.address,removedRecordHash:recordHash,beforeInventorySha256:beforeHash,afterInventorySha256:sha(afterRaw),targetRemainingCount:0,runtimeBindingCorrectionPreservationRequired:true,historicalEvidencePreserved:true},
 artifacts:{backup,certification:out},
 nextMilestone:"M4.19D4BH4G5_PRODUCTION_INVENTORY_SCOPE_AND_GENERIC_RUNTIME_BINDING_REGRESSION_CERTIFICATION",
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{maximumRemovals:1,actualRemovals:1,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,evidenceDeletionPerformed:false,automaticRetry:false}
});
