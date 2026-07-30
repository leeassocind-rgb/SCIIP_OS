
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');

const IGNORE=new Set(['node_modules','.git','dist','build','coverage','.sciip-backups']);
function readJson(file,fallback=null){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function writeJson(file,v){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(v,null,2)+'\n')}
function now(){return new Date().toISOString()}
function stableId(prefix,v){return prefix+'-'+crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0,20).toUpperCase()}
function norm(v){return String(v??'').trim()}
function key(v){return norm(v).toLowerCase().replace(/^evidence:\/\//,'').replace(/^urn:evidence:/,'').replace(/[^a-z0-9]/g,'')}
function first(o,ks){for(const k of ks)if(o&&o[k]!==undefined&&o[k]!==null&&norm(o[k])!=='')return o[k];return null}
function arr(v){return Array.isArray(v)?v:(v==null?[]:[v])}
function walk(dir,out=[],depth=0){if(!fs.existsSync(dir)||depth>12)return out;for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(IGNORE.has(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p,out,depth+1);else if(/\.(json|jsonl|ndjson)$/i.test(e.name))out.push(p)}return out}
function flatten(v,out=[],ctx={path:[],parents:[]}){
 if(v==null)return out;
 if(Array.isArray(v)){v.forEach((x,i)=>flatten(x,out,{path:[...ctx.path,i],parents:ctx.parents}));return out}
 if(typeof v==='object'){
   const rec={value:v,path:ctx.path,parents:ctx.parents};
   out.push(rec);
   for(const [k,x] of Object.entries(v))flatten(x,out,{path:[...ctx.path,k],parents:[...ctx.parents,v]});
 }
 return out;
}
function reportRoot(repo){return path.join(repo,'reports','release-5.6','wave-2.8')}
function loadUnified(repo){const p=path.join(repo,'reports','release-5.6','wave-2.5','unified-intelligence-repository.json');const u=readJson(p);if(!u)throw new Error('Wave 2.5 unified repository missing');return u}
function isEvidence(o){return !!(first(o,['evidenceId','evidence_id','evidenceKey','evidence_key'])||String(first(o,['type','entityType','recordType'])||'').toUpperCase()==='EVIDENCE')}
function isRecommendation(o){return !!(first(o,['recommendationId','recommendation_id','decisionId','decision_id'])||String(first(o,['type','entityType','recordType'])||'').includes('RECOMMENDATION'))}
function contextFrom(o,parents,file){
 const chain=[o,...parents.slice().reverse()];
 const get=ks=>{for(const x of chain){const v=first(x,ks);if(v!=null)return v}return null};
 return {
  propertyId:get(['propertyId','property_id','assetId','asset_id','buildingId','building_id']),
  eventId:get(['eventId','event_id','marketEventId','market_event_id']),
  transactionId:get(['transactionId','transaction_id','comparableId','comparable_id','compId','comp_id']),
  sourceFile:path.relative(process.cwd(),file),
  sourceDocument:get(['sourceFile','source_file','document','documentPath','document_path','file','filename']),
  sourceUrl:get(['sourceUrl','source_url','url','uri']),
  reportType:get(['reportType','report_type','framework','type','entityType']),
  generatedAt:get(['generatedAt','createdAt','created_at','timestamp','date'])
 };
}
function evidenceIdentity(o){return first(o,['evidenceId','evidence_id','evidenceKey','evidence_key'])||stableId('EVIDENCE',o)}
function recommendationIdentity(o){return first(o,['recommendationId','recommendation_id','decisionId','decision_id'])||stableId('REC',o)}
function confidenceFor(method){return {EXACT_ID:1,NORMALIZED_ID:.99,SAME_CONTAINER:.97,SAME_FILE_PROPERTY:.92,SAME_FILE_EVENT:.94,SAME_FILE_TRANSACTION:.95,SAME_FILE_SINGLE_EVIDENCE:.88,SOURCE_DOCUMENT:.95}[method]||0}
function baseReport(framework,version,result,extra={}){return {framework,version,status:'PASSED',generatedAt:now(),result,...extra}}
module.exports={fs,path,crypto,readJson,writeJson,now,stableId,norm,key,first,arr,walk,flatten,reportRoot,loadUnified,isEvidence,isRecommendation,contextFrom,evidenceIdentity,recommendationIdentity,confidenceFor,baseReport};
