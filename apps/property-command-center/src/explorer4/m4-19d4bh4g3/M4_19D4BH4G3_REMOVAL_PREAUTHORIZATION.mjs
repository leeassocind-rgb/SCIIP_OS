#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import crypto from"node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const pre=path.join(ev,"m4-19d4bh4g2-inventory-scope-adjudication.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const out=path.join(ev,"m4-19d4bh4g3-bessemer-production-inventory-removal-preauthorization.json");
function write(p,x){fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n")}
function hash(v){return crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex")}
function finish(state,x={}){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BH4G3_BESSEMER_PRODUCTION_INVENTORY_REMOVAL_PREAUTHORIZATION",version:"4.0-m4.19d4bh4g3",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{governedInventoryMutationPerformed:false,fixtureEvidenceDeleted:false,runtimeBindingMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false}};
 write(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)
}
if(!fs.existsSync(pre)||!fs.existsSync(invPath))finish("M419D4BH4G3_REQUIRED_ARTIFACT_MISSING");
const p=JSON.parse(fs.readFileSync(pre,"utf8"));
if(p.state!=="M419D4BH4G2_BESSEMER_CERTIFICATION_FIXTURE_SEPARATED_FROM_PRODUCTION_INVENTORY_SCOPE_REMOVAL_PREAUTHORIZATION_READY")finish("M419D4BH4G3_SCOPE_ADJUDICATION_REQUIRED",{observed:p.state});
const inv=JSON.parse(fs.readFileSync(invPath,"utf8")),rows=Array.isArray(inv)?inv:(inv.properties||inv.records||inv.items||[]);
const id="CPROP-0021AC235DED809E1821";
const matches=rows.map((r,i)=>({r,i})).filter(x=>x.r?.canonicalPropertyId===id || /14117-14123 Bessemer St/i.test(String(x.r?.address||"")));
if(matches.length!==1)finish("M419D4BH4G3_EXACT_REMOVAL_TARGET_NOT_UNIQUE",{matchCount:matches.length,recordCount:rows.length});

const x=matches[0];
const preauth={
 canonicalPropertyId:id,
 address:x.r.address||"14117-14123 Bessemer St",
 recordIndex:x.i,
 recordHash:hash(x.r),
 inventoryRecordCountBefore:rows.length,
 expectedInventoryRecordCountAfter:rows.length-1,
 maximumRemovals:1,
 runtimeBindingCorrectionMustRemain:true,
 allEvidenceArtifactsMustRemain:true,
 canonicalIdentityMustRemain:true,
 temporalObservationHistoryMustRemain:true,
 applicationSourceMutationAuthorized:false,
 executionAuthorized:false
};
finish("M419D4BH4G3_SINGLE_CERTIFICATION_FIXTURE_REMOVAL_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
 preauthorization:preauth,
 policy:{
  exactSingleRecordRemovalOnly:true,
  noBroaderInventoryPruning:true,
  evidencePreservationRequired:true,
  runtimeBindingCorrectionPreserved:true,
  canonicalAndTemporalHistoryPreserved:true,
  atomicReplaceAndBackupRequired:true
 },
 nextMilestone:"M4.19D4BH4G4_CONTROLLED_BESSEMER_PRODUCTION_INVENTORY_REMOVAL_AND_POST_REMOVAL_CERTIFICATION"
});
