const fs=require('fs'),path=require('path'),crypto=require('crypto');
function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function writeJson(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');}
function arr(v){if(Array.isArray(v))return v;if(!v||typeof v!=='object')return[];for(const k of ['records','items','events','inferences','priorities','cells','dimensions','enrichedRecords','entities','relationships','sites','tenants','portfolio'])if(Array.isArray(v[k]))return v[k];return[];}
function sourceRecords(...docs){return docs.flatMap(d=>arr(d).length?arr(d):(d&&typeof d==='object'?[d]:[]));}
function val(o,keys,d=null){for(const k of keys){let x=o;for(const p of k.split('.'))x=x&&x[p];if(x!==undefined&&x!==null&&x!=='')return x;}return d;}
function norm(v){return String(v??'').trim();} function slug(v){return norm(v).toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,'')||'UNKNOWN';}
function num(v,d=0){const n=Number(String(v??'').replace(/[$,% ,]/g,''));return Number.isFinite(n)?n:d;}
function hash(v){return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0,20);}
function now(){return new Date().toISOString();}
function clamp(n,a=0,b=100){return Math.max(a,Math.min(b,n));}
function uniq(a,key=x=>JSON.stringify(x)){const m=new Map();for(const x of a)m.set(key(x),x);return [...m.values()];}
module.exports={readJson,writeJson,arr,sourceRecords,val,norm,slug,num,hash,now,clamp,uniq};
