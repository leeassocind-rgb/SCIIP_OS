
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');

function readJson(file,fallback=null){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function writeJson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n')}
function now(){return new Date().toISOString()}
function stableId(prefix,value){return prefix+'-'+crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,20).toUpperCase()}
function norm(v){return String(v??'').trim()}
function first(o,keys){for(const k of keys)if(o&&o[k]!==undefined&&o[k]!==null&&norm(o[k])!=='')return o[k];return null}
function waveRoot(repo){return path.join(repo,'reports','release-5.6','wave-2.8.1')}
function unifiedPath(repo){return path.join(repo,'reports','release-5.6','wave-2.5','unified-intelligence-repository.json')}
function loadUnified(repo){const u=readJson(unifiedPath(repo));if(!u)throw new Error('Unified intelligence repository missing');return u}
function propertyFromEvidence(e){
 const s=e?.source||{};
 const candidates=[
  e?.propertyId,s.propertyId,s.property_id,
  typeof s.from==='string'&&s.from.startsWith('PROPERTY-')?s.from:null,
  typeof s.to==='string'&&s.to.startsWith('PROPERTY-')?s.to:null
 ].filter(Boolean);
 return candidates[0]||null;
}
function evidenceQuality(e){
 let score=0;
 if(e?.sourceType==='SUPPORTED_BY')score+=40;
 if(e?.source?.edgeId)score+=20;
 if(e?.source?.type==='SUPPORTED_BY')score+=20;
 if(Number(e?.confidence)>=.8)score+=10;
 if(propertyFromEvidence(e))score+=10;
 return score;
}
function base(framework,version,result,extra={}){return {framework,version,status:'PASSED',generatedAt:now(),result,...extra}}
module.exports={fs,path,readJson,writeJson,now,stableId,norm,first,waveRoot,unifiedPath,loadUnified,propertyFromEvidence,evidenceQuality,base};
