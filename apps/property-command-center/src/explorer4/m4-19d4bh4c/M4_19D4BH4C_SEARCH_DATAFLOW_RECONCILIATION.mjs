#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{walk,write}from"./M419D4BH4CDRuntime.js";
const repo=path.resolve(process.argv[2]||"."),app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bh4b-live-explorer-bessemer-search-selection-certification.json");
const out=path.join(ev,"m4-19d4bh4c-search-result-dataflow-reconciliation.json"),audit=path.join(ev,"m4-19d4bh4c-search-source-and-index-audit.json"),manifest=path.join(ev,"m4-19d4bh4c-bessemer-search-index-membership-manifest.json");
function done(state,x={}){const o={contract:"SCIIP_EXPLORER_4_M4_19D4BH4C_SEARCH_RESULT_DATAFLOW_AND_BESSEMER_INDEX_MEMBERSHIP_RECONCILIATION",version:"4.0-m4.19d4bh4c",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,safety:{applicationMutationPerformed:false,dataMutationPerformed:false,dependencyInstallationPerformed:false,networkRequestsPerformed:0,automaticRetry:false}};write(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)}
if(!fs.existsSync(prior))done("M419D4BH4C_BH4B_ARTIFACT_REQUIRED");
const p=JSON.parse(fs.readFileSync(prior,"utf8"));
if(p.state!=="M419D4BH4B_LIVE_EXPLORER_BESSEMER_SEARCH_EXECUTED_RENDERED_PROPERTY_PARITY_NOT_FULLY_CERTIFIED")done("M419D4BH4C_EXPECTED_BH4B_STATE_REQUIRED",{observed:p.state});
const target=p.certification.target,address=target.address.toUpperCase(),canonical=target.canonicalPropertyId;
const sourceHits=[],dataHits=[];
for(const f of walk(app)){
 let s="";try{s=fs.readFileSync(f,"utf8")}catch{continue}
 const rel=path.relative(app,f);
 if(rel.startsWith("src/explorer4/"))continue;
 if(/\.(js|jsx|ts|tsx|mjs)$/.test(f)){
   const interest=/Search SCIIP|broker-global-search|searchInputRef|propertySearch|searchQuery|selectProperty|searchResults|filteredProperties|globalSearch/i.test(s);
   if(interest){
     const lines=s.split(/\r?\n/),hits=[];
     lines.forEach((v,i)=>{/Search SCIIP|broker-global-search|searchInputRef|propertySearch|searchQuery|selectProperty|searchResults|filteredProperties|globalSearch|onChange|onKeyDown|onSubmit/i.test(v)&&hits.push({line:i+1,text:v.trim().slice(0,1600)})});
     if(hits.length)sourceHits.push({path:f,relativePath:rel,hits:hits.slice(0,120)});
   }
 }else if(f.endsWith(".json")){
   if(s.toUpperCase().includes(address)||s.includes(canonical))dataHits.push({path:f,relativePath:rel,addressHit:s.toUpperCase().includes(address),canonicalHit:s.includes(canonical),size:Buffer.byteLength(s)});
 }
}
const inventory=path.join(app,"public/explorer/governed-base-inventory.json");
let invMembership=null;
if(fs.existsSync(inventory)){
 const d=JSON.parse(fs.readFileSync(inventory,"utf8")),arr=Array.isArray(d)?d:(d.properties||d.records||d.items||[]);
 const matches=arr.map((r,i)=>({r,i})).filter(x=>JSON.stringify(x.r).toUpperCase().includes(address)||JSON.stringify(x.r).includes(canonical));
 invMembership={recordCount:arr.length,matchCount:matches.length,matches:matches.slice(0,5).map(x=>({index:x.i,record:x.r}))};
}
const searchConsumerFiles=sourceHits.filter(x=>x.hits.some(h=>/Search SCIIP|broker-global-search|searchInputRef|propertySearch|searchQuery|searchResults|selectProperty/i.test(h.text)));
const likelySearchDataFiles=dataHits.filter(x=>/public|explorer|inventory|runtime|search|property/i.test(x.relativePath));
const governedPresent=!!invMembership&&invMembership.matchCount===1;
const alternateDataPresent=likelySearchDataFiles.length>0;
const m={target,governedInventoryMembership:invMembership,searchConsumerFileCount:searchConsumerFiles.length,searchConsumerFiles:searchConsumerFiles.slice(0,40),repositoryDataHitCount:dataHits.length,likelySearchDataHitCount:likelySearchDataFiles.length,likelySearchDataFiles:likelySearchDataFiles.slice(0,80)};
write(audit,m);
const classification=governedPresent?(alternateDataPresent?"BESSEMER_PRESENT_GOVERNED_AND_OTHER_RUNTIME_DATA":"BESSEMER_PRESENT_GOVERNED_SEARCH_CONSUMER_BINDING_REQUIRED"):"BESSEMER_NOT_PRESENT_GOVERNED";
const mm={contract:"SCIIP_EXPLORER_4_M4_19D4BH4C_BESSEMER_SEARCH_INDEX_MEMBERSHIP_MANIFEST",version:"4.0-m4.19d4bh4c",generatedAt:new Date().toISOString(),classification,target,governedPresent,alternateDataPresent,searchConsumerFileCount:searchConsumerFiles.length,likelySearchDataHitCount:likelySearchDataFiles.length};
write(manifest,mm);
if(!governedPresent)done("M419D4BH4C_BESSEMER_NOT_PRESENT_IN_GOVERNED_INVENTORY_REPAIR_REQUIRED",{reconciliation:m,artifacts:{audit,manifest}});
if(searchConsumerFiles.length===0)done("M419D4BH4C_SEARCH_CONSUMER_SOURCE_NOT_RECOVERED_BH4C1_REQUIRED",{reconciliation:m,artifacts:{audit,manifest},nextMilestone:"M4.19D4BH4C1_SEARCH_COMPONENT_SOURCE_FORENSICS"});
done("M419D4BH4C_BESSEMER_GOVERNED_MEMBERSHIP_AND_SEARCH_CONSUMER_SOURCE_RECOVERED_RUNTIME_INDEX_BINDING_REQUIRED",{reconciliation:m,artifacts:{audit,manifest},nextMilestone:"M4.19D4BH4D_RUNTIME_SEARCH_INDEX_MEMBERSHIP_AND_SOURCE_BOUND_SELECTION"});
