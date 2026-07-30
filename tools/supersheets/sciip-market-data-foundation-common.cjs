const fs = require('fs');
const crypto = require('crypto');
function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function writeJson(p,v){ fs.mkdirSync(require('path').dirname(p),{recursive:true}); fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n'); }
function arr(v){ if(Array.isArray(v)) return v; if(!v||typeof v!=='object') return []; for(const k of ['records','items','events','inferences','priorities','cells','result']) if(Array.isArray(v[k])) return v[k]; return []; }
function val(o, keys, d=null){ for(const k of keys){ const parts=k.split('.'); let x=o; for(const p of parts) x=x&&x[p]; if(x!==undefined&&x!==null&&x!=='') return x; } return d; }
function norm(s){ return String(s??'').trim(); }
function slug(s){ return norm(s).toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,'')||'UNKNOWN'; }
function num(v,d=0){ const n=Number(String(v??'').replace(/[$,% ,]/g,'')); return Number.isFinite(n)?n:d; }
function hash(v){ return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0,20); }
function dateOf(r){ const raw=val(r,['period','eventDate','observedAt','date','createdAt','timestamp'],new Date().toISOString()); const d=new Date(raw); return Number.isNaN(d.getTime())?new Date():d; }
function month(d){ return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`; }
function quarter(d){ return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth()/3)+1}`; }
function week(d){ const t=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())); const day=t.getUTCDay()||7; t.setUTCDate(t.getUTCDate()+4-day); const y=new Date(Date.UTC(t.getUTCFullYear(),0,1)); const w=Math.ceil((((t-y)/86400000)+1)/7); return `${t.getUTCFullYear()}-W${String(w).padStart(2,'0')}`; }
function sourceRecords(doc){ const a=arr(doc); if(a.length) return a; if(doc && typeof doc==='object') return [doc]; return []; }
module.exports={readJson,writeJson,arr,val,norm,slug,num,hash,dateOf,month,quarter,week,sourceRecords};
