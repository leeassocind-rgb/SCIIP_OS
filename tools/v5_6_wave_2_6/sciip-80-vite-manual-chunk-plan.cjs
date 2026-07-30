'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_VITE_MANUAL_CHUNK_PLAN',VERSION='196.80.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const plan={vendor:['react','react-dom'],graph:['d3','cytoscape','vis-network'],gis:['mapbox-gl','leaflet','@arcgis/core'],ui:['lucide-react','@radix-ui'],data:['papaparse','xlsx']};
writeJson(path.join(reportRoot(repo),'vite-manual-chunk-plan.json'),{generatedAt:now(),plan});
return baseReport(FRAMEWORK,VERSION,{chunkGroups:Object.keys(plan).length,manualChunkReady:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
