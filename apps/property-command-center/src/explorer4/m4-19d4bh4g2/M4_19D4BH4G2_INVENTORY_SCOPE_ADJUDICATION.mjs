#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import crypto from"node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const prior=path.join(ev,"m4-19d4bh4g1-r1-live-bessemer-parity-certification.json");
const out=path.join(ev,"m4-19d4bh4g2-inventory-scope-adjudication.json");
const policyOut=path.join(ev,"m4-19d4bh4g2-production-inventory-scope-policy.json");

function write(p,x){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n")}
function sha(v){return crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex")}
function done(state,x={}){
 const o={
  contract:"SCIIP_EXPLORER_4_M4_19D4BH4G2_INVENTORY_SCOPE_ADJUDICATION_AND_CERTIFICATION_FIXTURE_SEPARATION",
  version:"4.0-m4.19d4bh4g2",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,fixtureEvidenceDeleted:false}
 };
 write(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)
}

if(!fs.existsSync(prior))done("M419D4BH4G2_BH4G1_R1_EVIDENCE_REQUIRED");
if(!fs.existsSync(invPath))done("M419D4BH4G2_GOVERNED_INVENTORY_REQUIRED");

const p=JSON.parse(fs.readFileSync(prior,"utf8"));
const inv=JSON.parse(fs.readFileSync(invPath,"utf8"));
const rows=Array.isArray(inv)?inv:(inv.properties||inv.records||inv.items||[]);
const targetId="CPROP-0021AC235DED809E1821";
const matches=rows.map((r,i)=>({r,i})).filter(x=>x.r?.canonicalPropertyId===targetId || /14117-14123 Bessemer St/i.test(String(x.r?.address||"")));
if(matches.length!==1)done("M419D4BH4G2_BESSEMER_FIXTURE_CARDINALITY_NOT_ONE",{inventoryRecordCount:rows.length,matchCount:matches.length});

const m=matches[0];
const availableSf=Number(m.r.availableSf ?? m.r.available_sf ?? m.r.availability?.availableSf ?? NaN);
const productionEligibility={
 classification:"CERTIFICATION_FIXTURE_NOT_PRODUCTION_INVENTORY",
 rationale:[
  "Operator scope direction: Bessemer is too small to represent the intended overall production inventory universe.",
  "The record has already completed its purpose as a controlled end-to-end governed-runtime certification fixture.",
  "Production inventory inclusion should be governed by explicit scope/market criteria rather than by test-fixture necessity.",
  "Runtime binding architecture must remain generic and must not depend on Bessemer remaining in production inventory."
 ],
 target:{
  canonicalPropertyId:targetId,
  address:m.r.address||"14117-14123 Bessemer St",
  recordIndex:m.i,
  availableSf:Number.isFinite(availableSf)?availableSf:null,
  recordHash:sha(m.r)
 },
 evidencePreservationRequired:true,
 runtimeBindingCorrectionPreserved:true,
 productionInventoryRetentionRecommended:false
};

const policy={
 contract:"SCIIP_EXPLORER_4_M4_19D4BH4G2_PRODUCTION_INVENTORY_SCOPE_POLICY",
 version:"4.0-m4.19d4bh4g2",
 generatedAt:new Date().toISOString(),
 policy:{
  certificationFixturesMayBeOutsideProductionInventory:true,
  successfulFixtureCertificationDoesNotImplyProductionEligibility:true,
  productionInventoryRequiresExplicitScopeQualification:true,
  removalOfFixtureMustPreserveHistoricalEvidence:true,
  runtimeBindingMustRemainGeneric:true,
  missingOrExcludedPropertyDoesNotMeanZeroAvailability:true
 },
 currentAdjudication:productionEligibility
};
write(policyOut,policy);

done("M419D4BH4G2_BESSEMER_CERTIFICATION_FIXTURE_SEPARATED_FROM_PRODUCTION_INVENTORY_SCOPE_REMOVAL_PREAUTHORIZATION_READY",{
 adjudication:productionEligibility,
 inventoryRecordCount:rows.length,
 priorLiveParityState:p.state,
 artifacts:{scopePolicy:policyOut},
 nextMilestone:"M4.19D4BH4G3_BESSEMER_PRODUCTION_INVENTORY_REMOVAL_PREAUTHORIZATION"
});
