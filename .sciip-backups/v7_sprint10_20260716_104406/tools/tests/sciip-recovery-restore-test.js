#!/usr/bin/env node
"use strict";
const fs=require("fs"),os=require("os"),path=require("path"),cp=require("child_process"),crypto=require("crypto");
const root=path.resolve(__dirname,"../..");
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"sciip-recovery-test-"));
const fixture=path.join(tmp,"repo"),out=path.join(tmp,"checkpoints"),restore=path.join(tmp,"restore");
fs.mkdirSync(path.join(fixture,"src"),{recursive:true});
fs.writeFileSync(path.join(fixture,"src","sample.gs"),'var SCIIP_RECOVERY_FIXTURE = "v6.1";\n');
fs.writeFileSync(path.join(fixture,"package.json"),'{"name":"fixture"}\n');
function sha(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");}
try{
 const env=Object.assign({},process.env,{SCIIP_REPOSITORY_ROOT:fixture});
 const archive=cp.execFileSync("bash",[path.join(root,"scripts/sciip_repository_checkpoint.sh"),out],{env,encoding:"utf8"}).trim();
 const before=sha(path.join(fixture,"src","sample.gs"));
 const restoredRoot=cp.execFileSync("bash",[path.join(root,"scripts/sciip_repository_restore.sh"),archive,restore],{encoding:"utf8"}).trim();
 const after=sha(path.join(restoredRoot,"src","sample.gs"));
 if(before!==after)throw new Error("Restored fixture hash mismatch");
 console.log(JSON.stringify({status:"PASSED",checkpoint:path.basename(archive),hashVerified:true},null,2));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
