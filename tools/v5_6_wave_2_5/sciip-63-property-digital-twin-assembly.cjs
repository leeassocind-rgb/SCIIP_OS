'use strict';
const fs=require('fs');const path=require('path');
const {readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport}=require('./sciip-v5-6-wave-2-5-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PROPERTY_DIGITAL_TWIN_ASSEMBLY', VERSION='196.63.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const r=loadRepository(repo);
const relBy=new Map(); for(const e of r.relationships){for(const id of [e.from,e.to]){if(!relBy.has(id))relBy.set(id,[]);relBy.get(id).push(e)}}
const evBy=new Map(); for(const e of r.events){if(e.propertyId){if(!evBy.has(e.propertyId))evBy.set(e.propertyId,[]);evBy.get(e.propertyId).push(e)}}
const compBy=new Map(); for(const c of r.comparables){if(c.propertyId){if(!compBy.has(c.propertyId))compBy.set(c.propertyId,[]);compBy.get(c.propertyId).push(c)}}
const recBy=new Map(); for(const x of r.recommendations){if(x.propertyId){if(!recBy.has(x.propertyId))recBy.set(x.propertyId,[]);recBy.get(x.propertyId).push(x)}}
const twins=r.properties.map(p=>({twinId:stableId('TWIN',p.propertyId),propertyId:p.propertyId,address:p.address,city:p.city,
 location:p.latitude!==null&&p.longitude!==null?{latitude:p.latitude,longitude:p.longitude}:null,
 relationships:relBy.get(p.propertyId)||[],events:evBy.get(p.propertyId)||[],comparables:compBy.get(p.propertyId)||[],
 recommendations:recBy.get(p.propertyId)||[],eventSourced:true,revision:1}));
writeJson(path.join(reportRoot(repo),'property-digital-twins.json'),{generatedAt:now(),twins});
return baseReport(FRAMEWORK,VERSION,{digitalTwins:twins.length,populatedTwins:twins.filter(t=>t.relationships.length||t.events.length||t.comparables.length||t.recommendations.length).length,eventSourced:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const report=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),report);console.log(JSON.stringify(report,null,2));if(report.status!=='PASSED')process.exitCode=1;}
module.exports={run,FRAMEWORK,VERSION};
