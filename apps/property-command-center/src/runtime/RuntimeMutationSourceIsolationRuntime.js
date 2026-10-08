import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const CONTRACT='SCIIP_EXPLORER_3_M3_63X_RUNTIME_MUTATION_SOURCE_ISOLATION_QUIESCENCE_CERTIFICATION';
export const VERSION='3.0-m3.63x';
export const SAMPLE_INTERVAL_MS=5000;
export const REQUIRED_QUIESCENT_SAMPLES=6;

export function shaFile(p){
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}
export function statSnapshot(p){
  const s=fs.statSync(p);
  return {
    path:p,
    size:s.size,
    mtimeMs:s.mtimeMs,
    ctimeMs:s.ctimeMs,
    ino:s.ino
  };
}
export function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
export function safeExec(cmd,args=[]){
  try{
    return execFileSync(cmd,args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  }catch{
    return '';
  }
}
export function processSnapshot(){
  const ps=safeExec('/bin/ps',['-axo','pid,ppid,lstart,command']);
  return ps.split('\n').filter(Boolean).filter(line=>
    /node|npm|vite|clasp|python|SCIIP|property-command-center|production-validation|watch|sync/i.test(line)
  ).slice(0,300);
}
export function lsofSnapshot(paths){
  const out=[];
  for(const p of paths){
    const r=safeExec('/usr/sbin/lsof',[p]);
    if(r) out.push({path:p,output:r.split('\n').slice(0,100)});
  }
  return out;
}
export function gitStatus(repo){
  return safeExec('/usr/bin/git',['-C',repo,'status','--short','--untracked-files=no']).split('\n').filter(Boolean).slice(0,300);
}
