import fs from'node:fs';
import path from'node:path';
const app=process.argv[2];
const data=JSON.parse(fs.readFileSync(path.join(app,'public/explorer/governed-base-inventory.json'),'utf8'));
const rows=Array.isArray(data.properties)?data.properties:[];
const blocked=status=>{
  const s=String(status||'').toUpperCase();
  return s.includes('PROPOSED')||s.includes('PLANNED')||s.includes('CONSTRUCTION')||s.includes('FUTURE');
};
const scored=rows
  .filter(r=>!blocked(r.status)&&Number.isFinite(Number(r.lat))&&Number.isFinite(Number(r.lng)))
  .map(r=>{
    let score=0;
    if(r.parcelId)score+=40;
    if(Array.isArray(r.boundaryPath)&&r.boundaryPath.length>=3)score+=30;
    if(Number(r.yearBuilt)>1900)score+=15;
    if(Number(r.buildingSf)>=100000)score+=10;
    if(['RIALTO','FONTANA','SAN BERNARDINO','ONTARIO','BLOOMINGTON'].includes(String(r.city||'').toUpperCase()))score+=10;
    return{score,id:r.id,address:r.address,city:r.city,status:r.status,buildingSf:r.buildingSf,parcelId:r.parcelId,lat:r.lat,lng:r.lng};
  })
  .sort((a,b)=>b.score-a.score||String(a.address).localeCompare(String(b.address)))
  .slice(0,10);
console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_STABLE_LIGHTBOX_VALIDATION_CANDIDATES',
  status:'READY',
  rule:'Existing/stabilized property, governed coordinates, prefer parcel+boundary+year built, then large-format Inland Empire.',
  candidates:scored
},null,2));
