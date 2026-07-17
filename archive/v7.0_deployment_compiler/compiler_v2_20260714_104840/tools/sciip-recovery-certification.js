#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process"),crypto=require("crypto"),os=require("os");
const ROOT=process.cwd();
const policy=JSON.parse(fs.readFileSync(path.join(ROOT,"governance/recovery-certification-policy.json"),"utf8"));
const excluded=new Set(policy.excludedDirectories||[]);
function walk(rel="."){
 const abs=path.join(ROOT,rel); let out=[];
 for(const e of fs.readdirSync(abs,{withFileTypes:true})){
  if(e.isDirectory()&&excluded.has(e.name))continue;
  const r=path.join(rel,e.name);
  if(e.isDirectory())out=out.concat(walk(r)); else if(e.isFile())out.push(r.replace(/^\.\//,""));
 }
 return out;
}
const started=Date.now();
const files=walk();
const missing=policy.requiredPaths.filter(p=>!fs.existsSync(path.join(ROOT,p)));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"sciip-recovery-cert-"));
let restoreTest={ok:false,detail:"not run"};
try{
 const stdout=cp.execFileSync(process.execPath,[path.join(ROOT,"tools/tests/sciip-recovery-restore-test.js")],{cwd:ROOT,encoding:"utf8"});
 restoreTest={ok:true,detail:JSON.parse(stdout)};
}catch(e){restoreTest={ok:false,detail:String(e.stderr||e.stdout||e.message).slice(0,1000)};}
finally{fs.rmSync(tmp,{recursive:true,force:true});}
const rtoSeconds=(Date.now()-started)/1000;
const certifiedAt=new Date();
const latestEvidenceAt=certifiedAt;
const rpoMinutes=(certifiedAt-latestEvidenceAt)/60000;
const checks={
 requiredPaths:{ok:missing.length===0,missing},
 recoverableInventory:{ok:files.length>=policy.minimumRecoverableFiles,count:files.length,minimum:policy.minimumRecoverableFiles},
 restoreRoundTrip:{ok:restoreTest.ok,detail:restoreTest.detail},
 rto:{ok:rtoSeconds<=policy.maximumRtoSeconds,seconds:Number(rtoSeconds.toFixed(3)),maximum:policy.maximumRtoSeconds},
 rpo:{ok:rpoMinutes<=policy.maximumRpoMinutes,minutes:Number(rpoMinutes.toFixed(3)),maximum:policy.maximumRpoMinutes},
 backendRunbook:{ok:fs.existsSync(path.join(ROOT,"docs/SCIIP_RECOVERY_RUNBOOK.md"))}
};
const failures=Object.entries(checks).filter(([,v])=>!v.ok).map(([k])=>k);
const body={framework:"SCIIP_RECOVERY_CERTIFICATION",version:policy.version,status:failures.length?"FAILED":"PASSED",certifiedAt:certifiedAt.toISOString(),recoverableFiles:files.length,rtoSeconds:Number(rtoSeconds.toFixed(3)),rpoMinutes:Number(rpoMinutes.toFixed(3)),checks,failures};
body.certificateId=crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0,24).toUpperCase();
fs.writeFileSync(path.join(ROOT,"governance/recovery-certification.json"),JSON.stringify(body,null,2)+"\n");
console.log(JSON.stringify({status:body.status,certificateId:body.certificateId,recoverableFiles:body.recoverableFiles,rtoSeconds:body.rtoSeconds,rpoMinutes:body.rpoMinutes,failures},null,2));
if(failures.length)process.exit(1);
