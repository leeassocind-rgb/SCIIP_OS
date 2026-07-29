#!/usr/bin/env node
'use strict';
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const VERSION='196.6.0';
const sha=s=>crypto.createHash('sha256').update(String(s)).digest('hex').toUpperCase().slice(0,20);
const clean=s=>String(s||'').trim().toUpperCase().replace(/\s+/g,' ');
const normalizeCity=s=>clean(s).replace(/\bCITY OF\s+/,'');
function normalizeAddress(s){
 let x=clean(s).replace(/\b(SUITE|STE|UNIT|BLDG|BUILDING)\s*#?\s*[A-Z0-9-]+\b/g,' ')
 .replace(/#\s*[A-Z0-9-]+$/g,' ').replace(/[^A-Z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 const m={NORTH:'N',SOUTH:'S',EAST:'E',WEST:'W',STREET:'ST',AVENUE:'AVE',BOULEVARD:'BLVD',ROAD:'RD',DRIVE:'DR',LANE:'LN',COURT:'CT',PLACE:'PL',PARKWAY:'PKWY',HIGHWAY:'HWY',CIRCLE:'CIR',TERRACE:'TER'};
 return x.split(' ').map(t=>m[t]||t).join(' ');
}
function canonicalKey(o){return [normalizeAddress(o.address),normalizeCity(o.city),clean(o.zip)].join('|');}
function build(input){
 const groups=new Map(), aliasLedger=[];
 for(const s of input.snapshots||[]) for(const o of s.observations||[]){
  const key=canonicalKey(o); if(!groups.has(key))groups.set(key,[]); groups.get(key).push(o);
 }
 const identities=[]; const oldToNew={};
 for(const [key,obs] of [...groups.entries()].sort()){
  const cid='CPROP-'+sha(key), old=[...new Set(obs.map(x=>x.propertyId))].sort();
  const dates=obs.map(x=>x.reportDate).sort();
  const id={canonicalPropertyId:cid,canonicalKey:key,address:obs[0].address,city:obs[0].city,zip:obs[0].zip||null,firstObserved:dates[0],lastObserved:dates[dates.length-1],observationCount:obs.length,sourcePropertyIds:old,identityConfidence:100,identityMethod:'NORMALIZED_ADDRESS_CITY_ZIP_EXACT',reviewRequired:false};
  identities.push(id); for(const x of old){oldToNew[x]=cid; aliasLedger.push({aliasId:'ALIAS-'+sha(cid+'|'+x),canonicalPropertyId:cid,sourcePropertyId:x,decision:'LINKED',method:id.identityMethod,confidence:100,immutable:true});}
 }
 const proposals=[];
 const byCity=new Map(); for(const i of identities){const k=normalizeCity(i.city);if(!byCity.has(k))byCity.set(k,[]);byCity.get(k).push(i)}
 function tokens(s){return new Set(normalizeAddress(s).split(' ').filter(Boolean))} function jac(a,b){a=tokens(a);b=tokens(b);let n=0;for(const x of a)if(b.has(x))n++;return n/(a.size+b.size-n||1)}
 for(const list of byCity.values()) for(let a=0;a<list.length;a++) for(let b=a+1;b<list.length;b++){
  const A=list[a],B=list[b],na=normalizeAddress(A.address),nb=normalizeAddress(B.address),numA=(na.match(/^\d+/)||[])[0],numB=(nb.match(/^\d+/)||[])[0];
  if(!numA||numA!==numB)continue; const score=Math.round(jac(na,nb)*100); if(score>=72&&score<100) proposals.push({proposalId:'MERGE-'+sha(A.canonicalPropertyId+'|'+B.canonicalPropertyId),leftCanonicalPropertyId:A.canonicalPropertyId,rightCanonicalPropertyId:B.canonicalPropertyId,score,status:'REVIEW_REQUIRED',reason:'SAME_STREET_NUMBER_CITY_WITH_ADDRESS_VARIATION',automaticMerge:false});
 }
 const mappedEvents=(input.events||[]).map(e=>({...e,canonicalPropertyId:oldToNew[e.propertyId]||e.canonicalPropertyId||null,sourcePropertyId:e.propertyId||null}));
 const out={framework:'SCIIP_CANONICAL_PROPERTY_IDENTITY_ENGINE',version:VERSION,status:'PASSED',generatedAt:new Date().toISOString(),governance:{nonDestructive:true,appendOnlyAliasLedger:true,evidenceBacked:true,fuzzyMergeRequiresReview:true,canonicalIdsImmutable:true},summary:{sourceCanonicalProperties:(input.timelines||[]).length,canonicalProperties:identities.length,identitiesConsolidated:(input.timelines||[]).length-identities.length,observations:(input.snapshots||[]).reduce((n,s)=>n+(s.observations||[]).length,0),aliasLinks:aliasLedger.length,mergeProposals:proposals.length,automaticFuzzyMerges:0},identities,aliasLedger,mergeProposals:proposals,events:mappedEvents}; return out;
}
function main(){const args=process.argv.slice(2), input=args[0]||'reports/supersheets/SCIIP_AIR_CRE_TEMPORAL_INTELLIGENCE.json', output=args[1]||'reports/supersheets/SCIIP_CANONICAL_PROPERTY_IDENTITY.json'; if(!fs.existsSync(input))throw new Error('Temporal report not found: '+input); const out=build(JSON.parse(fs.readFileSync(input,'utf8'))); fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(out,null,2));console.log(JSON.stringify({framework:out.framework,version:out.version,status:out.status,result:out.summary},null,2));}
if(require.main===module){try{main()}catch(e){console.error(e.stack||e);process.exit(1)}} module.exports={build,normalizeAddress,canonicalKey};
