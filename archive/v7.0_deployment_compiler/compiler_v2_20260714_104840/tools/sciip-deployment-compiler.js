#!/usr/bin/env node
'use strict';
const fs=require('fs'); const path=require('path'); const crypto=require('crypto');
const root=path.resolve(process.cwd());
const src=path.join(root,'src');
const distRoot=path.join(root,'dist');
const out=path.join(distRoot,'apps-script');
const reports=path.join(distRoot,'reports');
const maxBytes=Number(process.env.SCIIP_BUNDLE_MAX_BYTES||500000);
if(!fs.existsSync(src)) throw new Error('src directory not found: '+src);
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});}
function rel(p){return path.relative(root,p).split(path.sep).join('/');}
function bucket(r){
 if(r==='src/appsscript.json') return null;
 const p=r.replace(/^src\//,'');
 if(p.endsWith('.html')) return 'html';
 if(p.startsWith('processors/')){const a=p.split('/'); return 'processors_'+(a[1]||'other')+'_'+(a[2]||'root');}
 if(p.startsWith('tests/')) return 'tests';
 return (p.split('/')[0]||'root').replace(/[^A-Za-z0-9_]/g,'_');
}
function sha(s){return crypto.createHash('sha256').update(s).digest('hex');}
fs.rmSync(distRoot,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true}); fs.mkdirSync(reports,{recursive:true});
const all=walk(src).filter(p=>fs.statSync(p).isFile()).sort((a,b)=>rel(a).localeCompare(rel(b)));
const gs=all.filter(p=>p.endsWith('.gs')); const html=all.filter(p=>p.endsWith('.html'));
const groups=new Map();
for(const f of gs){const b=bucket(rel(f)); if(!groups.has(b))groups.set(b,[]);groups.get(b).push(f);}
const manifest={version:'v7.0-deployment-compiler.1',generatedAt:new Date().toISOString(),sourceFiles:all.length,sourceGsFiles:gs.length,sourceHtmlFiles:html.length,maxBundleBytes:maxBytes,bundles:[],copied:[]};
for(const [name,files] of [...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){let chunk=[];let size=0;let idx=1;
 const flush=()=>{if(!chunk.length)return; const filename=`SCIIP_${name}_${String(idx).padStart(3,'0')}.gs`; const body=chunk.map(f=>`// ===== SOURCE: ${rel(f)} =====\n${fs.readFileSync(f,'utf8').trim()}\n`).join('\n'); fs.writeFileSync(path.join(out,filename),body+'\n'); manifest.bundles.push({file:filename,bucket:name,bytes:Buffer.byteLength(body),sha256:sha(body),sources:chunk.map(rel)}); idx++;chunk=[];size=0;};
 for(const f of files){const text=fs.readFileSync(f,'utf8');const n=Buffer.byteLength(text)+80;if(chunk.length&&size+n>maxBytes)flush();chunk.push(f);size+=n;} flush();}
for(const f of html){const name=path.basename(f);fs.copyFileSync(f,path.join(out,name));manifest.copied.push({file:name,source:rel(f),sha256:sha(fs.readFileSync(f))});}
const app=path.join(src,'appsscript.json'); if(!fs.existsSync(app)) throw new Error('src/appsscript.json missing'); fs.copyFileSync(app,path.join(out,'appsscript.json'));manifest.copied.push({file:'appsscript.json',source:'src/appsscript.json',sha256:sha(fs.readFileSync(app))});
const clasp=path.join(root,'.clasp.json'); if(fs.existsSync(clasp)){const j=JSON.parse(fs.readFileSync(clasp,'utf8'));j.rootDir='.';fs.writeFileSync(path.join(out,'.clasp.json'),JSON.stringify(j,null,2)+'\n');}
fs.writeFileSync(path.join(out,'.claspignore'),'deployment-manifest.json\n');
fs.writeFileSync(path.join(out,'deployment-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(reports,'deployment-compiler-report.json'),JSON.stringify(manifest,null,2)+'\n');
const compiledCount=manifest.bundles.reduce((n,b)=>n+b.sources.length,0)+manifest.copied.length;
const deployableSourceCount=gs.length+html.length+1;
const excludedSourceFiles=all
  .filter(p=>!p.endsWith('.gs')&&!p.endsWith('.html')&&rel(p)!=='src/appsscript.json')
  .map(rel);
manifest.deployableSourceFiles=deployableSourceCount;
manifest.excludedSourceFiles=excludedSourceFiles;
if(compiledCount!==deployableSourceCount) {
  throw new Error(`integrity mismatch: deployable=${deployableSourceCount} compiled=${compiledCount}`);
}
console.log(JSON.stringify({status:'PASSED',sourceFiles:all.length,sourceGsFiles:gs.length,sourceHtmlFiles:html.length,bundleFiles:manifest.bundles.length,deploymentFiles:manifest.bundles.length+html.length+1,reductionPercent:Number((100*(1-(manifest.bundles.length+html.length+1)/all.length)).toFixed(2)),output:'dist/apps-script'},null,2));
