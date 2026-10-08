import fs from 'node:fs';
import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_63Y_FRESH_REBIND_IMMEDIATE_CANARY_HANDOFF';
export const VERSION='3.0-m3.63y';

export function sha(p){
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}
export function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
export function writeJson(p,v){ fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n'); }
export function must(cond,state,extra={}){
  if(!cond){
    console.error(JSON.stringify({contract:CONTRACT,version:VERSION,status:'BLOCKED',state,...extra},null,2));
    process.exit(2);
  }
}
