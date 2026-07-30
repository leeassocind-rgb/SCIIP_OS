const fs=require('fs'),path=require('path'),crypto=require('crypto');
function read(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function write(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');}
function arr(v){return Array.isArray(v)?v:[];}
function records(d){for(const k of ['enrichedRecords','records','events','entities','sites','assessments','recommendations'])if(Array.isArray(d[k]))return d[k]; return [];}
function id(prefix,...parts){return prefix+'-'+crypto.createHash('sha256').update(parts.map(x=>String(x??'')).join('|')).digest('hex').slice(0,20).toUpperCase();}
function num(v){const n=Number(String(v??'').replace(/[$,% ,]/g,''));return Number.isFinite(n)?n:0;}
function text(v){return String(v??'').trim();}
function prop(r){return text(r.propertyId||r.property_id||r.canonicalPropertyId||r.assetId||r.siteId||r.id||r.recordId);}
function evidence(r){return text(r.sourceEvidenceId||r.recordId||r.eventId||r.id)||id('EVID',JSON.stringify(r));}
function uniq(a,key=x=>JSON.stringify(x)){const m=new Map();for(const x of a)m.set(key(x),x);return [...m.values()];}
function stamp(framework,version,result,extra={}){return {framework,version,status:'PASSED',generatedAt:new Date().toISOString(),result,...extra};}
module.exports={read,write,arr,records,id,num,text,prop,evidence,uniq,stamp};