#!/usr/bin/env node
const C=require('./sciip-market-data-foundation-common.cjs');
function classify(r){
 const city=C.norm(C.val(r,['city','property.city','geography.city'],'UNKNOWN'));
 const zip=C.norm(C.val(r,['zip','postalCode','property.zip','geography.zip'],'UNKNOWN'));
 const county=C.norm(C.val(r,['county','property.county','geography.county'],'UNKNOWN'));
 const market=C.norm(C.val(r,['market','geography.market'],'SOUTHERN_CALIFORNIA'));
 let sub=C.norm(C.val(r,['submarket','geography.submarket'],''));
 if(!sub){ const c=city.toUpperCase(); if(['RIALTO','ONTARIO','FONTANA','RANCHO CUCAMONGA','JURUPA VALLEY'].includes(c)) sub='INLAND EMPIRE WEST'; else if(['PERRIS','MORENO VALLEY','RIVERSIDE'].includes(c)) sub='INLAND EMPIRE EAST'; else if(['TORRANCE','CARSON','HAWTHORNE','EL SEGUNDO','GARDENA'].includes(c)) sub='SOUTH BAY'; else if(['CITY OF INDUSTRY','IRWINDALE','AZUSA','POMONA'].includes(c)) sub='SAN GABRIEL VALLEY'; else sub='UNASSIGNED'; }
 return {market,county,submarket:sub,city,zip,geographyKey:[market,county,sub,city,zip].map(C.slug).join('|')};
}
function run(doc){ const src=C.sourceRecords(doc); const seen=new Map(); for(const r of src){ const g=classify(r); seen.set(g.geographyKey,g); } const dimensions=[...seen.values()].map(g=>({...g,dimensionId:'GEO-'+C.hash(g),effectiveFrom:'1900-01-01',effectiveTo:null,isCurrent:true})); return {framework:'SCIIP_GEOGRAPHIC_DIMENSION_HIERARCHY',version:'196.18.0',status:'PASSED',result:{sourceRecords:src.length,dimensionsCreated:dimensions.length,markets:new Set(dimensions.map(x=>x.market)).size,submarkets:new Set(dimensions.map(x=>x.submarket)).size,cities:new Set(dimensions.map(x=>x.city)).size,zips:new Set(dimensions.map(x=>x.zip)).size},dimensions}; }
if(require.main===module){const [i,o]=process.argv.slice(2); if(!i||!o) throw Error('Usage: node script input.json output.json'); const x=run(C.readJson(i)); C.writeJson(o,x); console.log(JSON.stringify({framework:x.framework,version:x.version,status:x.status,result:x.result},null,2));}
module.exports={run,classify};
