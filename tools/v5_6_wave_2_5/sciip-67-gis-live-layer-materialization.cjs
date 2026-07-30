'use strict';
const fs=require('fs');const path=require('path');
const {readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport}=require('./sciip-v5-6-wave-2-5-common.cjs');
const FRAMEWORK='SCIIP_V5_6_GIS_LIVE_LAYER_MATERIALIZATION', VERSION='196.67.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const r=loadRepository(repo);
const layers={properties:r.gis.map(g=>({type:'Feature',geometry:{type:'Point',coordinates:[g.longitude,g.latitude]},properties:{featureId:g.featureId,propertyId:g.propertyId,address:g.address,city:g.city}})),
 comparables:r.comparables.filter(c=>{const p=r.properties.find(p=>p.propertyId===c.propertyId);return p&&p.latitude!==null&&p.longitude!==null}).map(c=>{const p=r.properties.find(p=>p.propertyId===c.propertyId);return {type:'Feature',geometry:{type:'Point',coordinates:[p.longitude,p.latitude]},properties:{comparableId:c.comparableId,transactionType:c.transactionType}}})};
writeJson(path.join(reportRoot(repo),'gis-live-layers.json'),{type:'FeatureCollections',generatedAt:now(),layers});
return baseReport(FRAMEWORK,VERSION,{propertyFeatures:layers.properties.length,comparableFeatures:layers.comparables.length,vectorLayers:true,liveData:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const report=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),report);console.log(JSON.stringify(report,null,2));if(report.status!=='PASSED')process.exitCode=1;}
module.exports={run,FRAMEWORK,VERSION};
