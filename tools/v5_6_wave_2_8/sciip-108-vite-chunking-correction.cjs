'use strict';
const {fs,path,crypto,readJson,writeJson,now,stableId,norm,key,first,arr,walk,flatten,reportRoot,loadUnified,isEvidence,isRecommendation,contextFrom,evidenceIdentity,recommendationIdentity,confidenceFor,baseReport}=require('./sciip-v5-6-wave-2-8-common.cjs');
const FRAMEWORK='SCIIP_V5_6_VITE_CHUNKING_CORRECTION',VERSION='197.08.0';
function run(repo){
const app=path.join(repo,'apps','property-command-center'), candidates=['vite.config.js','vite.config.mjs','vite.config.ts'].map(x=>path.join(app,x));
const config=candidates.find(fs.existsSync),out={applied:false,config:config?path.relative(repo,config):null,reason:null};
if(!config){out.reason='VITE_CONFIG_NOT_FOUND'}
else{
 const src=fs.readFileSync(config,'utf8');
 if(src.includes('sciipVendorChunk')){
   out.applied=true;out.reason='ALREADY_APPLIED';
 }else{
   const helper=`\n// SCIIP_OS v5.6 Wave 2.8 governed chunk strategy\nconst sciipVendorChunk = (id) => {\n  if (!id.includes('node_modules')) return undefined;\n  if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';\n  if (id.includes('mapbox') || id.includes('leaflet') || id.includes('@arcgis')) return 'vendor-gis';\n  if (id.includes('d3') || id.includes('cytoscape') || id.includes('vis-network')) return 'vendor-graph';\n  if (id.includes('xlsx') || id.includes('papaparse')) return 'vendor-data';\n  return 'vendor-core';\n};\n`;
   let patched=src;
   if(/defineConfig\s*\(\s*\{/.test(src)){
     patched=helper+src.replace(/defineConfig\s*\(\s*\{/,m=>m+`\n  build: {\n    chunkSizeWarningLimit: 750,\n    rollupOptions: { output: { manualChunks: sciipVendorChunk } }\n  },`);
   }else if(/export\s+default\s+\{/.test(src)){
     patched=helper+src.replace(/export\s+default\s+\{/,m=>m+`\n  build: {\n    chunkSizeWarningLimit: 750,\n    rollupOptions: { output: { manualChunks: sciipVendorChunk } }\n  },`);
   }else{out.reason='UNSUPPORTED_CONFIG_SHAPE'}
   if(patched!==src){fs.writeFileSync(config,patched);out.applied=true;out.reason='PATCHED'}
 }
}
writeJson(path.join(reportRoot(repo),'vite-chunking-correction.json'),{generatedAt:now(),...out});
return baseReport(FRAMEWORK,VERSION,{...out});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
