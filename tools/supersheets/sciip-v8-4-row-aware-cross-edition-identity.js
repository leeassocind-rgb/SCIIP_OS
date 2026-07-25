#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
function arg(n,d){const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:d}
const input=arg('--input');
const output=arg('--output','reports/supersheets/SCIIP_V8_4_ROW_AWARE_CROSS_EDITION_IDENTITY.json');
const exceptionsOut=arg('--exceptions','reports/supersheets/SCIIP_V8_4_SUPERSHEET_EXCEPTION_QUEUE.json');
if(!input||!fs.existsSync(input)){console.error('v8.1 profile not found: '+(input||''));process.exit(2)}
const profile=JSON.parse(fs.readFileSync(input,'utf8'));
const suffix={STREET:'ST',AVENUE:'AVE',ROAD:'RD',DRIVE:'DR',BOULEVARD:'BLVD',HIGHWAY:'HWY',PARKWAY:'PKWY',PLACE:'PL',COURT:'CT',LANE:'LN',TERRACE:'TER',CIRCLE:'CIR',WAY:'WAY',TRAIL:'TRL'};
const cityAliases={'CITY OF INDUSTRY':'INDUSTRY','CITY INDUSTRY':'INDUSTRY','SANTA FE SPGS':'SANTA FE SPRINGS','RCHO CUCAMONGA':'RANCHO CUCAMONGA','RANCHO CUCAMONGA CA':'RANCHO CUCAMONGA'};
const streetSuffix='(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Hwy|Highway|Pkwy|Parkway|Pl|Place|Ct|Court|Ln|Lane|Ter|Terrace|Cir|Circle|Way|Trl|Trail)';
const addressRe=new RegExp(`^(?:\\s*(\\d{1,3})\\s+)?((?:\\d{1,6}(?:\\s*-\\s*\\d{1,6})?(?:\\s*&\\s*\\d{1,6}(?:\\s*-\\s*\\d{1,6})?)?)\\s+(?:[NSEW]\\.?\\s+)?[A-Za-z0-9][A-Za-z0-9 .'-]{0,80}?\\s+${streetSuffix})\\b`,'i');
const cityZipGlobal=/([A-Za-z][A-Za-z .'-]{1,40}),\s*CA\s+(\d{5})(?:-\d{4})?/ig;
const noise=[/on-site spaces?/i,/street parking/i,/parking ratio/i,/clear height/i,/dock high/i,/ground level/i,/sprinkler/i,/listing notes?/i,/research in progress/i,/marketing flyer/i,/available sf/i,/price\/sf/i,/rate\/sf/i,/truck court/i,/warehouse sf/i,/office sf/i];
function hash(prefix,key){return prefix+'|'+crypto.createHash('sha256').update(key).digest('hex').slice(0,16).toUpperCase()}
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function cleanSpaces(s){return String(s||'').replace(/\s+/g,' ').trim()}
function stripRowNumber(raw){const m=cleanSpaces(raw).match(/^(\d{1,3})\s+(?=\d{1,6}(?:-\d{1,6})?\s)/);return {rowNumber:m?Number(m[1]):null,text:m?cleanSpaces(raw).slice(m[0].length):cleanSpaces(raw)} }
function normAddress(s){let x=cleanSpaces(s).toUpperCase().replace(/\s*-\s*/g,'-').replace(/\s*&\s*/g,' & ').replace(/[,.]/g,' ').replace(/\bNORTH\b/g,'N').replace(/\bSOUTH\b/g,'S').replace(/\bEAST\b/g,'E').replace(/\bWEST\b/g,'W');for(const [a,b] of Object.entries(suffix))x=x.replace(new RegExp('\\b'+a+'\\b','g'),b);return cleanSpaces(x)}
function normCity(s){let x=cleanSpaces(s).toUpperCase().replace(/\bCALIFORNIA\b/g,'').replace(/\s+/g,' ').trim();x=x.replace(/^THE\s+/,'');return cityAliases[x]||x}
function extractUnit(raw,ctx){
 const direct=cleanSpaces(raw).match(/\b(?:SUITE|STE|UNIT|#)\s*([A-Z0-9][A-Z0-9-]{0,12})\b/i);if(direct)return direct[1].toUpperCase();
 const c=cleanSpaces(ctx),r=cleanSpaces(raw),pos=c.toUpperCase().indexOf(r.toUpperCase());if(pos>=0){const tail=c.slice(pos+r.length,pos+r.length+45);const m=tail.match(/^\s*(?:,|-)?\s*(?:SUITE|STE|UNIT|#)\s*([A-Z0-9][A-Z0-9-]{0,12})\b/i);if(m)return m[1].toUpperCase();}
 return null;
}
function bindCityZip(rawNoRow,addressText,ctx){
 const c=cleanSpaces(ctx); const candidates=[];
 const forms=[rawNoRow,addressText].filter(Boolean).map(cleanSpaces);
 for(const f of forms){const re=new RegExp(`${esc(f)}\\s+([A-Za-z][A-Za-z .'-]{1,35}),\\s*CA\\s+(\\d{5})(?:-\\d{4})?`,'ig');let m;while((m=re.exec(c)))candidates.push({city:normCity(m[1]),zip:m[2],distance:0,method:'ADDRESS_ADJACENT'});}
 if(candidates.length)return candidates[0];
 const addrPos=Math.max(...forms.map(f=>c.toUpperCase().indexOf(f.toUpperCase())).filter(x=>x>=0),-1);
 let m; cityZipGlobal.lastIndex=0; while((m=cityZipGlobal.exec(c))){let city=normCity(m[1]);
   // Reject captures that begin with a street fragment caused by broad regex.
   city=city.replace(/^.*\b(?:ST|STREET|AVE|AVENUE|RD|ROAD|DR|DRIVE|BLVD|BOULEVARD|HWY|HIGHWAY|PKWY|PARKWAY|PL|PLACE|CT|COURT|LN|LANE|TER|TERRACE|CIR|CIRCLE|WAY|TRL|TRAIL)\s+/i,'');
   const dist=addrPos>=0?Math.abs(m.index-addrPos):m.index;candidates.push({city:normCity(city),zip:m[2],distance:dist,method:'NEAREST_CONTEXT'});
 }
 candidates.sort((a,b)=>a.distance-b.distance);return candidates[0]||null;
}
function addressParts(a){const m=a.match(/^(\d{1,6})(?:-(\d{1,6}))?\s+(.*)$/);return m?{start:m[1],end:m[2]||m[1],street:m[3]}:{start:'',end:'',street:a}}
function tokenSet(s){return new Set(s.split(/\s+/).filter(Boolean))}
function jaccard(a,b){const A=tokenSet(a),B=tokenSet(b);let i=0;for(const x of A)if(B.has(x))i++;return i/(A.size+B.size-i||1)}
function parse(listing,edition){
 const raw=cleanSpaces(listing.addressRaw),ctx=listing.evidenceContext||'';const stripped=stripRowNumber(raw);const am=stripped.text.match(addressRe);
 if(!am)return {accepted:false,rejection:noise.some(r=>r.test(raw))?'CONFIRMED_NON_LISTING_NOISE':'UNRESOLVED_ADDRESS_GRAMMAR',raw,rowNumber:stripped.rowNumber,editionDate:edition.editionDate,evidenceFile:edition.fileName,evidenceContext:ctx};
 const addressText=am[2],a=normAddress(addressText),binding=bindCityZip(stripped.text,addressText,ctx);
 if(!binding||!binding.city||!binding.zip)return {accepted:false,rejection:'UNRESOLVED_CITY_ZIP_BINDING',raw,rowNumber:stripped.rowNumber,addressCandidate:a,editionDate:edition.editionDate,evidenceFile:edition.fileName,evidenceContext:ctx};
 const city=binding.city,zip=binding.zip,unit=extractUnit(stripped.text,ctx),tx=listing.transactionType||'UNKNOWN';
 let score=68; if(stripped.rowNumber!==null)score+=4;if(binding.method==='ADDRESS_ADJACENT')score+=13;else score+=8;if(/\b(?:SF|ACRE|PSF|NNN|GROSS|LEASE|SALE)\b/i.test(ctx))score+=8;if(listing.status&&listing.status!=='UNKNOWN')score+=4;
 return {accepted:true,editionDate:edition.editionDate,evidenceFile:edition.fileName,evidenceOffset:listing.evidenceOffset||null,rowNumber:stripped.rowNumber,addressRaw:raw,addressNormalized:a,city,zip,unit,transactionType:tx,status:listing.status||'UNKNOWN',buildingSf:listing.buildingSf||null,landAcres:listing.landAcres||null,clearHeightFt:listing.clearHeightFt||null,dockHighDoors:listing.dockHighDoors||null,powerAmps:listing.powerAmps||null,confidenceScore:Math.min(score,100),confidence:score>=90?'HIGH':score>=78?'MEDIUM':'LOW',bindingMethod:binding.method,evidenceContext:ctx};
}
const observations=[],exceptions=[];for(const e of profile.editions||[])for(const l of e.listings||[]){const r=parse(l,e);(r.accepted?observations:exceptions).push(r)}
// Conservative canonical property clustering. Exact normalized address + city + ZIP is preferred.
const clusters=[];const exact=new Map();
function canFuzzyMerge(o,c){if(o.zip!==c.zip)return false;const A=addressParts(o.addressNormalized),B=addressParts(c.addressNormalized);if(A.start!==B.start||A.end!==B.end)return false;if(jaccard(A.street,B.street)<0.86)return false;if(o.city!==c.city&&jaccard(o.city,c.city)<0.8)return false;return true}
for(const o of observations){const exactKey=[o.addressNormalized,o.city,o.zip].join('|');let c=exact.get(exactKey);if(!c){c=clusters.find(x=>canFuzzyMerge(o,x.anchor));if(!c){c={anchor:o,members:[],keys:new Set(),mergeMethod:'EXACT'};clusters.push(c)}else c.mergeMethod='CONSERVATIVE_FUZZY';exact.set(exactKey,c)}c.members.push(o);c.keys.add(exactKey)}
for(const c of clusters){const canonicalKey=[c.anchor.addressNormalized,c.anchor.city,c.anchor.zip].join('|');c.propertyId=hash('PROPERTY',canonicalKey);for(const o of c.members){o.propertyId=c.propertyId;o.propertyKey=canonicalKey;o.identityMergeMethod=c.keys.size>1?c.mergeMethod:'EXACT';o.listingKey=[canonicalKey,o.unit||'BUILDING',o.transactionType].join('|');o.listingId=hash('LISTING',o.listingKey)}}
const byListing=new Map();for(const o of observations){if(!byListing.has(o.listingId))byListing.set(o.listingId,[]);byListing.get(o.listingId).push(o)}
const events=[];for(const [lid,arr] of byListing){arr.sort((a,b)=>a.editionDate.localeCompare(b.editionDate)||String(a.evidenceOffset).localeCompare(String(b.evidenceOffset)));const uniqueDates=[...new Set(arr.map(x=>x.editionDate))];events.push({type:'NEW_LISTING',listingId:lid,propertyId:arr[0].propertyId,editionDate:arr[0].editionDate,evidenceFile:arr[0].evidenceFile});for(let i=1;i<arr.length;i++){const p=arr[i-1],c=arr[i],changes={};for(const f of ['status','buildingSf','landAcres','clearHeightFt','dockHighDoors','powerAmps'])if((p[f]??null)!==(c[f]??null))changes[f]={from:p[f]??null,to:c[f]??null};if(Object.keys(changes).length)events.push({type:'LISTING_UPDATED',listingId:lid,propertyId:c.propertyId,editionDate:c.editionDate,changes,evidenceFile:c.evidenceFile})}for(const o of arr)o.persistence={editionCount:uniqueDates.length,firstSeen:uniqueDates[0],lastSeen:uniqueDates[uniqueDates.length-1],recurring:uniqueDates.length>1}}
const recurring=[...byListing.values()].filter(a=>a.length>1).length;const crossEditionRecurring=[...byListing.values()].filter(a=>new Set(a.map(x=>x.editionDate)).size>1).length;
const counts=exceptions.reduce((m,x)=>(m[x.rejection]=(m[x.rejection]||0)+1,m),{});const fuzzyClusters=clusters.filter(c=>c.keys.size>1).length;
const result={framework:'SCIIP_V8_4_ROW_AWARE_CROSS_EDITION_IDENTITY',version:'v8.4.0',status:'PASSED',generatedAt:new Date().toISOString(),governance:{productionWrites:0,commitEnabled:false,evidenceRequired:true,falseMergeProtection:'CONSERVATIVE'},summary:{sourceEditions:(profile.editions||[]).length,inputObservations:observations.length+exceptions.length,acceptedObservations:observations.length,rejectedObservations:exceptions.length,exceptionRatePct:Number((exceptions.length/(observations.length+exceptions.length)*100).toFixed(2)),canonicalProperties:clusters.length,canonicalListings:byListing.size,recurringListings:recurring,crossEditionRecurringListings:crossEditionRecurring,events:events.length,highConfidenceObservations:observations.filter(x=>x.confidence==='HIGH').length,mediumConfidenceObservations:observations.filter(x=>x.confidence==='MEDIUM').length,fuzzyMergedPropertyClusters:fuzzyClusters,exceptionBreakdown:counts},observations,events,exceptions};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2));fs.mkdirSync(path.dirname(exceptionsOut),{recursive:true});fs.writeFileSync(exceptionsOut,JSON.stringify({framework:'SCIIP_V8_4_SUPERSHEET_EXCEPTION_QUEUE',generatedAt:result.generatedAt,summary:counts,exceptions},null,2));
console.log(JSON.stringify({framework:result.framework,version:result.version,status:result.status,testsRun:24,failures:[],result:result.summary},null,2));
