
'use strict';
const fs=require('fs'), path=require('path'), crypto=require('crypto');

const IGNORE=new Set(['node_modules','.git','dist','build','.sciip-backups','coverage']);
function readJson(file,fallback=null){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function writeJson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n')}
function now(){return new Date().toISOString()}
function stableId(prefix,value){return prefix+'-'+crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,20).toUpperCase()}
function norm(v){return String(v??'').trim()}
function normKey(v){return norm(v).toLowerCase().replace(/[^a-z0-9]/g,'')}
function num(v,fallback=null){if(typeof v==='string')v=v.replace(/[$,%\s,]/g,'');const n=Number(v);return Number.isFinite(n)?n:fallback}
function first(o,keys){for(const k of keys)if(o&&o[k]!==undefined&&o[k]!==null&&norm(o[k])!=='')return o[k];return null}
function reportRoot(repo){return path.join(repo,'reports','release-5.6','wave-2.6')}
function priorRoot(repo){return path.join(repo,'reports','release-5.6','wave-2.5')}
function walk(dir,out=[],depth=0){if(!fs.existsSync(dir)||depth>10)return out;for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(IGNORE.has(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p,out,depth+1);else if(e.name.endsWith('.json'))out.push(p)}return out}
function flatten(v,out=[],seen=new Set()){if(v==null)return out;if(Array.isArray(v)){for(const x of v)flatten(x,out,seen);return out}if(typeof v==='object'){if(seen.has(v))return out;seen.add(v);out.push(v);for(const x of Object.values(v))flatten(x,out,seen)}return out}
function uniqueBy(items,keyFn){const m=new Map();for(const x of items){const k=keyFn(x);if(k!==null&&k!==undefined&&k!=='')m.set(String(k),x)}return [...m.values()]}
function loadPrior(repo){
 const u=readJson(path.join(priorRoot(repo),'unified-intelligence-repository.json'),null);
 if(!u)throw new Error('Wave 2.5 unified repository not found. Apply Wave 2.5 first.');
 return u;
}
function normalizeAddress(v){
 return norm(v).toUpperCase()
 .replace(/\bSTREET\b/g,'ST').replace(/\bAVENUE\b/g,'AVE').replace(/\bBOULEVARD\b/g,'BLVD')
 .replace(/\bROAD\b/g,'RD').replace(/\bDRIVE\b/g,'DR').replace(/\bLANE\b/g,'LN')
 .replace(/\bHIGHWAY\b/g,'HWY').replace(/\bPARKWAY\b/g,'PKWY').replace(/\bCOURT\b/g,'CT')
 .replace(/[.,#]/g,' ').replace(/\s+/g,' ').trim();
}
function canonicalPropertyKey(p){
 const apn=first(p.source||p,['apn','APN','parcelNumber','parcel_number','parcelId','parcel_id']);
 if(apn)return 'APN:'+normKey(apn);
 const address=normalizeAddress(p.address||first(p.source||p,['address','Address','propertyAddress','property_address']));
 const city=norm(first(p.source||p,['city','City'])||p.city).toUpperCase();
 const zip=norm(first(p.source||p,['zip','zipcode','postalCode','postal_code']));
 if(address)return 'ADDR:'+address+'|'+city+'|'+zip;
 const lat=num(p.latitude??first(p.source||p,['latitude','Latitude','lat']),null);
 const lon=num(p.longitude??first(p.source||p,['longitude','Longitude','lng','lon']),null);
 if(lat!==null&&lon!==null)return 'GEO:'+lat.toFixed(5)+'|'+lon.toFixed(5);
 return 'SRC:'+norm(p.propertyId||stableId('PROPERTY',p));
}
function buildCanonical(u){
 const groups=new Map();
 for(const p of u.properties||[]){const k=canonicalPropertyKey(p);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p)}
 const registry=[], aliases=[], sourceToCanonical=new Map();
 for(const [key,items] of groups){
   const ranked=[...items].sort((a,b)=>{
     const sa=(a.address?3:0)+(a.city?1:0)+(a.latitude!=null&&a.longitude!=null?3:0)+(a.buildingSf?1:0);
     const sb=(b.address?3:0)+(b.city?1:0)+(b.latitude!=null&&b.longitude!=null?3:0)+(b.buildingSf?1:0);
     return sb-sa;
   });
   const best=ranked[0];
   const canonicalId=stableId('CPROP',key);
   const rec={canonicalPropertyId:canonicalId,canonicalKey:key,address:best.address||null,city:best.city||null,
      latitude:num(best.latitude,null),longitude:num(best.longitude,null),buildingSf:best.buildingSf||null,
      aliasCount:items.length,sourcePropertyIds:items.map(x=>x.propertyId).filter(Boolean)};
   registry.push(rec);
   for(const item of items){if(item.propertyId)sourceToCanonical.set(String(item.propertyId),canonicalId);aliases.push({canonicalPropertyId:canonicalId,sourcePropertyId:item.propertyId||null,address:item.address||null,city:item.city||null})}
 }
 return {registry,aliases,sourceToCanonical};
}
function collectCoordinateIndex(repo,u,canonical){
 const idx=new Map();
 const add=(keys,lat,lon,source)=>{
   lat=num(lat,null);lon=num(lon,null);
   if(lat===null||lon===null||Math.abs(lat)>90||Math.abs(lon)>180)return;
   for(const k of keys.filter(Boolean))if(!idx.has(k))idx.set(k,{latitude:lat,longitude:lon,source});
 };
 for(const p of u.properties||[]){
   const cid=canonical.sourceToCanonical.get(String(p.propertyId||''));
   add([cid,p.propertyId,canonicalPropertyKey(p)],p.latitude,p.longitude,'wave-2.5-property');
 }
 const files=[...walk(path.join(repo,'data')), ...walk(path.join(repo,'reports'))];
 for(const file of files){
   if(file.includes(path.join('release-5.6','wave-2.6')))continue;
   const data=readJson(file,null);if(!data)continue;const objs=[];flatten(data,objs);
   for(const o of objs){
     const lat=first(o,['latitude','Latitude','lat','Lat','y','centroidLatitude','centroid_latitude']);
     const lon=first(o,['longitude','Longitude','lng','lon','Long','x','centroidLongitude','centroid_longitude']);
     const pid=first(o,['propertyId','property_id','Property_ID','assetId','asset_id','buildingId','building_id']);
     const address=first(o,['address','Address','propertyAddress','property_address','streetAddress']);
     const city=first(o,['city','City']); const zip=first(o,['zip','zipcode','postalCode','postal_code']);
     const keys=[];
     if(pid){keys.push(String(pid));const cid=canonical.sourceToCanonical.get(String(pid));if(cid)keys.push(cid)}
     if(address)keys.push('ADDR:'+normalizeAddress(address)+'|'+norm(city).toUpperCase()+'|'+norm(zip));
     add(keys,lat,lon,path.relative(repo,file));
   }
 }
 return idx;
}
function baseReport(framework,version,result,extra={}){return {framework,version,status:'PASSED',generatedAt:now(),result,...extra}}
module.exports={fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport};
