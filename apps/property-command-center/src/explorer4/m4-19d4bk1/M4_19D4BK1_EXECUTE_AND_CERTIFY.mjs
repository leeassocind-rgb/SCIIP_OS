#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const repo=path.resolve(process.argv[2]||"."); const token=process.argv[3]||"";
const AUTH="AUTHORIZE_M419D4BK1_CONTROLLED_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTION";
if(token!==AUTH) throw new Error("fresh explicit BK1 authorization token required");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const bk=path.join(ev,"m4-19d4bk-five-property-canonical-identity-downstream-binding-and-runtime-visibility-preauthorization.json");
if(!fs.existsSync(bk)) throw new Error("BK evidence missing");
const B=JSON.parse(fs.readFileSync(bk,"utf8"));
if(B.state!=="M419D4BK_FIVE_PROPERTY_DOWNSTREAM_BINDING_AND_RUNTIME_VISIBILITY_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED") throw new Error("BK state mismatch");
if(!B.preauthorization?.ready||B.preauthorization?.maximumProperties!==5) throw new Error("BK preauthorization not ready");
const canonical=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const publicCanonical=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const inventory=path.join(app,"public/explorer/governed-base-inventory.json");
const events=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");
const cohort=B.cohort.records;
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const before={canonical:sha(canonical),events:sha(events),publicCanonical:fs.existsSync(publicCanonical)?sha(publicCanonical):null,inventory:sha(inventory)};
const source=JSON.parse(fs.readFileSync(canonical,"utf8"));
const rows=Array.isArray(source)?source:(source.records||source.properties||source.data);
if(!Array.isArray(rows)) throw new Error("canonical dataset rows unresolved");
const target=new Map(cohort.map(x=>[x.sourcePropertyId,x.canonicalPropertyId]));
const canonicalBySource=new Map();
for(const r of rows){ const s=r.sourcePropertyId||r.sourceId||r.propertyId; if(target.has(s)) canonicalBySource.set(s,r); }
if(canonicalBySource.size!==5) throw new Error("not all five canonical rows resolved");
const pub=JSON.parse(fs.readFileSync(publicCanonical,"utf8"));
const pubRows=Array.isArray(pub)?pub:(pub.records||pub.properties||pub.data);
if(!Array.isArray(pubRows)) throw new Error("public canonical mirror rows unresolved");
const preserved=pubRows.filter(r=>!target.has(r.sourcePropertyId||r.sourceId||r.propertyId));
for(const c of cohort){
 const r=canonicalBySource.get(c.sourcePropertyId);
 if((r.canonicalPropertyId||r.canonicalId)!==c.canonicalPropertyId) throw new Error("canonical binding mismatch "+c.sourcePropertyId);
 preserved.push(JSON.parse(JSON.stringify(r)));
}
const shape=Array.isArray(pub)?preserved:{...pub,[Array.isArray(pub.records)?"records":Array.isArray(pub.properties)?"properties":"data"]:preserved};
const tmp=publicCanonical+".bk1.tmp"; fs.writeFileSync(tmp,JSON.stringify(shape,null,2)+"\n"); fs.renameSync(tmp,publicCanonical);
const after={canonical:sha(canonical),events:sha(events),publicCanonical:sha(publicCanonical),inventory:sha(inventory)};
const reread=JSON.parse(fs.readFileSync(publicCanonical,"utf8")); const rr=Array.isArray(reread)?reread:(reread.records||reread.properties||reread.data);
const cert=cohort.map(c=>{const m=rr.filter(r=>(r.sourcePropertyId||r.sourceId||r.propertyId)===c.sourcePropertyId&&(r.canonicalPropertyId||r.canonicalId)===c.canonicalPropertyId);return {...c,runtimeMirrorMatches:m.length};});
const checks={
 exactFiveBound:cert.length===5&&cert.every(x=>x.runtimeMirrorMatches===1),
 noDuplicateRuntimeVisibility:cert.every(x=>x.runtimeMirrorMatches===1),
 canonicalStoreUnchanged:before.canonical===after.canonical,
 eventStoreUnchanged:before.events===after.events,
 governedBaseInventoryUnchanged:before.inventory===after.inventory,
 runtimeMirrorChanged:before.publicCanonical!==after.publicCanonical,
 bindingHashPreserved:B.preauthorization.bindingHash==="dc0039dec1f603148831f3832fa8943f0dda52af483ae39c9d739849a4b266cd"
};
const ok=Object.values(checks).every(Boolean);
const R={contract:"SCIIP_EXPLORER_4_M4_19D4BK1_CONTROLLED_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTION_AND_RUNTIME_PARITY_CERTIFICATION",version:"4.0-m4.19d4bk1",status:ok?"PASSED":"BLOCKED",state:ok?"M419D4BK1_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTED_RUNTIME_PARITY_CERTIFIED_BROWSER_VISIBILITY_CERTIFICATION_READY":"M419D4BK1_RUNTIME_PARITY_BLOCKED",certifiedAt:new Date().toISOString(),authorization:{tokenAccepted:true,maximumProperties:5,bindingHash:B.preauthorization.bindingHash},execution:{target:"public/production-validation-data/canonical-property-identity-data.json",recordsBound:5,certification:cert},storageHashes:{before,after},checks,policy:{canonicalAuthorityUnchanged:true,eventAuditAuthorityUnchanged:true,runtimeMirrorIsReadOnlyConsumer:true,temporalMutationNotAuthorized:true,governedInventoryMutationNotAuthorized:true,automaticRetry:false},nextMilestone:ok?"M4.19D4BK2_FIVE_PROPERTY_BROWSER_RUNTIME_VISIBILITY_AND_EXPLORER_READ_PATH_CERTIFICATION":"M4.19D4BK1R_RUNTIME_PARITY_RECONCILIATION",authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,propagationAuthority:false,automaticRetry:false},safety:{networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionEventMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,downstreamRuntimeMirrorMutationPerformed:true,automaticRetry:false}};
fs.writeFileSync(path.join(ev,"m4-19d4bk1-controlled-five-property-downstream-binding-execution-and-runtime-parity-certification.json"),JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2)); if(!ok) process.exit(2);
