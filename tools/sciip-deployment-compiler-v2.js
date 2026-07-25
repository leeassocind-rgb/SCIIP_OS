#!/usr/bin/env node
'use strict';
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const ROOT=process.cwd();
const POLICY=JSON.parse(fs.readFileSync(path.join(ROOT,'governance/deployment-compiler-policy.json'),'utf8'));
const SRC=path.join(ROOT,'src'); const OUT=path.join(ROOT,POLICY.outputDir); const CACHE=path.join(ROOT,'.sciip-cache','deployment-compiler-v2.json');
const args=new Set(process.argv.slice(2)); const force=args.has('--force');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
function rel(p){return p.replace(ROOT+path.sep,'').split(path.sep).join('/');}
function sha(s){return crypto.createHash('sha256').update(s).digest('hex');}
function globMatch(file,pat){
  let r=pat.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*\*/g,'§§').replace(/\*/g,'[^/]*').replace(/§§/g,'.*');
  return new RegExp('^'+r+'$').test(file);
}
function domainFor(f){for(const d of POLICY.domains){if(d.patterns.some(p=>globMatch(f,p))) return d.name;} return '11_other';}
function ensure(){fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(path.dirname(CACHE),{recursive:true});}
function loadCache(){try{return JSON.parse(fs.readFileSync(CACHE,'utf8'));}catch{return {files:{},bundles:{}};}}
function header(name,items){return `/** SCIIP_OS compiled bundle: ${name}\n * sources: ${items.length}\n * generated: ${new Date().toISOString()}\n */\n`}
if(!fs.existsSync(SRC)) throw new Error('src directory not found'); ensure();
const all=walk(SRC).filter(p=>fs.statSync(p).isFile());
const gs=all.filter(p=>p.endsWith('.gs')).map(rel).sort();
const html=all.filter(p=>p.endsWith('.html')).map(rel).sort();
const manifestPath='src/appsscript.json'; if(!fs.existsSync(path.join(ROOT,manifestPath))) throw new Error('src/appsscript.json missing');
const groups={}; for(const f of gs){(groups[domainFor(f)]??=[]).push(f);} 
const cache=loadCache(), newCache={files:{},bundles:{}}; const bundleManifest=[]; let bundleCount=0, rebuilt=0, reused=0;
for(const domain of Object.keys(groups).sort()){
  let current=[], bytes=0, index=1;
  const flush=()=>{if(!current.length)return; const name=`${domain}_${String(index++).padStart(3,'0')}.gs`; const parts=current.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')); const body=header(name,current)+parts.join('\n\n'); const hash=sha(body); const outPath=path.join(OUT,name);
    if(!force && cache.bundles[name]===hash && fs.existsSync(outPath)){reused++;} else {fs.writeFileSync(outPath,body);rebuilt++;}
    newCache.bundles[name]=hash; current.forEach(f=>newCache.files[f]=sha(fs.readFileSync(path.join(ROOT,f))));
    bundleManifest.push({file:name,domain,sources:current.slice(),bytes:Buffer.byteLength(body),sha256:hash}); bundleCount++; current=[];bytes=0;};
  for(const f of groups[domain]){const b=fs.statSync(path.join(ROOT,f)).size; if(current.length && bytes+b>POLICY.maxBundleBytes) flush(); current.push(f); bytes+=b;} flush();
}
for(const f of fs.readdirSync(OUT)){if(f.endsWith('.gs')&&!bundleManifest.some(b=>b.file===f)) fs.unlinkSync(path.join(OUT,f));}
for(const f of html){fs.copyFileSync(path.join(ROOT,f),path.join(OUT,path.basename(f)));}
fs.copyFileSync(path.join(ROOT,manifestPath),path.join(OUT,'appsscript.json'));
const claspSrc=path.join(ROOT,'.clasp.json'); if(fs.existsSync(claspSrc)){const c=JSON.parse(fs.readFileSync(claspSrc));c.rootDir='.';fs.writeFileSync(path.join(OUT,'.clasp.json'),JSON.stringify(c,null,2)+'\n');}
const deployable=gs.length+html.length+1; const compiled=bundleManifest.reduce((n,b)=>n+b.sources.length,0)+html.length+1;
if(compiled!==deployable) throw new Error(`integrity mismatch: deployable=${deployable} compiled=${compiled}`);
const deploymentFiles=bundleCount+html.length+1; if(deploymentFiles>POLICY.maxDeploymentFiles) throw new Error(`deployment file ceiling exceeded: ${deploymentFiles}>${POLICY.maxDeploymentFiles}`);
const mf={status:'PASSED',version:POLICY.version,sourceFiles:all.length,sourceGsFiles:gs.length,sourceHtmlFiles:html.length,bundleFiles:bundleCount,deploymentFiles,reductionPercent:Number(((1-deploymentFiles/all.length)*100).toFixed(2)),rebuiltBundles:rebuilt,reusedBundles:reused,incremental:!force,bundles:bundleManifest};
fs.writeFileSync(path.join(OUT,'deployment-manifest.json'),JSON.stringify(mf,null,2)); fs.writeFileSync(CACHE,JSON.stringify(newCache,null,2)); console.log(JSON.stringify({...mf,bundles:undefined,output:POLICY.outputDir},null,2));
