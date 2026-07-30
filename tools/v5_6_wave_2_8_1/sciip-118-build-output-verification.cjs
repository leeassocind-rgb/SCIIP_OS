
'use strict';
const fs=require('fs'),path=require('path');
const repo=process.argv[2]||process.cwd(),app=path.join(repo,'apps','property-command-center'),dist=path.join(app,'dist','assets');
if(!fs.existsSync(dist))throw new Error('Vite dist/assets missing after build');
const files=fs.readdirSync(dist).filter(x=>x.endsWith('.js')).map(name=>({name,bytes:fs.statSync(path.join(dist,name)).size})).sort((a,b)=>b.bytes-a.bytes);
const largest=files[0]?.bytes||0,failures=[];
if(files.length<3)failures.push('INSUFFICIENT_CODE_SPLITTING');
if(largest>1572864)failures.push('LARGEST_CHUNK_EXCEEDS_1_5_MIB');
const result={framework:'SCIIP_V5_6_BUILD_OUTPUT_VERIFICATION',version:'197.18.0',status:failures.length?'FAILED':'PASSED',generatedAt:new Date().toISOString(),result:{javascriptChunks:files.length,largestChunkBytes:largest,largestChunkMiB:Number((largest/1048576).toFixed(3)),failures,certified:failures.length===0},files};
const out=path.join(repo,'reports','release-5.6','wave-2.8.1','197.18.0-sciip_v5_6_build_output_verification.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(result.status!=='PASSED')process.exit(1);
