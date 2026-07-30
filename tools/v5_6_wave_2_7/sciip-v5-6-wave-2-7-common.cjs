
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');

function readJson(file,fallback=null){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function writeJson(file,v){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(v,null,2)+'\n')}
function now(){return new Date().toISOString()}
function stableId(prefix,v){return prefix+'-'+crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0,20).toUpperCase()}
function norm(v){return String(v??'').trim()}
function key(v){return norm(v).toLowerCase().replace(/^evidence:\/\//,'').replace(/^urn:evidence:/,'').replace(/[^a-z0-9]/g,'')}
function tokens(v){return new Set(norm(v).toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>2))}
function jaccard(a,b){if(!a.size||!b.size)return 0;let i=0;for(const x of a)if(b.has(x))i++;return i/(a.size+b.size-i)}
function first(o,ks){for(const k of ks)if(o&&o[k]!==undefined&&o[k]!==null&&norm(o[k])!=='')return o[k];return null}
function num(v,f=0){const n=Number(v);return Number.isFinite(n)?n:f}
function root(repo){return path.join(repo,'reports','release-5.6','wave-2.7')}
function prior(repo){return path.join(repo,'reports','release-5.6','wave-2.5','unified-intelligence-repository.json')}
function load(repo){const u=readJson(prior(repo));if(!u)throw new Error('Wave 2.5 repository missing');return u}
function canonicalText(o){
 return [
  first(o,['evidenceId','evidence_id','recommendationId','recommendation_id','decisionId','decision_id']),
  first(o,['sourceFile','source_file','document','file','title','summary','reason','rationale','explanation','description']),
  first(o,['propertyId','property_id','eventId','event_id','transactionId','transaction_id']),
  JSON.stringify(o||{})
 ].filter(Boolean).join(' ');
}
function evidenceIndex(u){
 const byExact=new Map(),byKey=new Map(),bySource=new Map(),byProperty=new Map(),byEvent=new Map(),byTransaction=new Map();
 const all=[];
 for(const e of u.evidence||[]){
   const src=e.source||e;
   const id=e.evidenceId||first(src,['evidenceId','evidence_id']);
   const rec={...e,evidenceId:id||stableId('EVIDENCE',e),_text:canonicalText(src),_tokens:tokens(canonicalText(src))};
   all.push(rec);
   byExact.set(String(rec.evidenceId),rec);byKey.set(key(rec.evidenceId),rec);
   const sf=first(src,['sourceFile','source_file','document','file']);if(sf)bySource.set(key(sf),rec);
   const pid=first(src,['propertyId','property_id']);if(pid){if(!byProperty.has(String(pid)))byProperty.set(String(pid),[]);byProperty.get(String(pid)).push(rec)}
   const eid=first(src,['eventId','event_id']);if(eid){if(!byEvent.has(String(eid)))byEvent.set(String(eid),[]);byEvent.get(String(eid)).push(rec)}
   const tid=first(src,['transactionId','transaction_id']);if(tid){if(!byTransaction.has(String(tid)))byTransaction.set(String(tid),[]);byTransaction.get(String(tid)).push(rec)}
 }
 return {all,byExact,byKey,bySource,byProperty,byEvent,byTransaction};
}
function resolve(rec,idx){
 const src=rec.source||rec;
 const candidateIds=[
  rec.evidenceId,first(src,['evidenceId','evidence_id','sourceEvidenceId','source_evidence_id','supportingEvidenceId','supporting_evidence_id']),
  first(src,['ledgerEvidenceId','ledger_evidence_id','runtimeEvidenceId','runtime_evidence_id'])
 ].filter(Boolean);
 for(const id of candidateIds){
   if(idx.byExact.has(String(id)))return {evidence:idx.byExact.get(String(id)),method:'EXACT_ID',confidence:1};
   const k=key(id);if(idx.byKey.has(k))return {evidence:idx.byKey.get(k),method:'NORMALIZED_ID',confidence:.98};
 }
 const sf=first(src,['sourceFile','source_file','document','file']);
 if(sf&&idx.bySource.has(key(sf)))return {evidence:idx.bySource.get(key(sf)),method:'SOURCE_FILE',confidence:.95};
 const pid=rec.propertyId||first(src,['propertyId','property_id']);
 const eid=first(src,['eventId','event_id']);
 const tid=first(src,['transactionId','transaction_id']);
 const candidates=[];
 if(pid&&idx.byProperty.has(String(pid)))candidates.push(...idx.byProperty.get(String(pid)).map(e=>({e,boost:.35,method:'PROPERTY_CONTEXT'})));
 if(eid&&idx.byEvent.has(String(eid)))candidates.push(...idx.byEvent.get(String(eid)).map(e=>({e,boost:.5,method:'EVENT_CONTEXT'})));
 if(tid&&idx.byTransaction.has(String(tid)))candidates.push(...idx.byTransaction.get(String(tid)).map(e=>({e,boost:.55,method:'TRANSACTION_CONTEXT'})));
 const rt=tokens(canonicalText(src));
 const pool=candidates.length?candidates:idx.all.map(e=>({e,boost:0,method:'SEMANTIC_TEXT'}));
 let best=null;
 for(const c of pool){
   const sim=jaccard(rt,c.e._tokens);
   const score=Math.min(1,sim+c.boost);
   if(!best||score>best.score)best={...c,score};
 }
 if(best&&best.score>=.42)return {evidence:best.e,method:best.method,confidence:Number(best.score.toFixed(4))};
 return {evidence:null,method:'UNRESOLVED',confidence:0};
}
function report(framework,version,result,extra={}){return {framework,version,status:'PASSED',generatedAt:now(),result,...extra}}
module.exports={fs,path,readJson,writeJson,now,stableId,norm,key,tokens,jaccard,first,num,root,prior,load,canonicalText,evidenceIndex,resolve,report};
