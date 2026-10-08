import fs from 'node:fs';
import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_63S_EXPLICIT_PUBLIC_PARITY_REPAIR_POST_REPAIR_QUIESCENCE';
export const VERSION='3.0-m3.63s';
export const AUTH='AUTHORIZE_M363S_PUBLIC_PARITY_REPAIR';
export const SAMPLE_INTERVAL_MS=3000;
export const QUIESCENT_SAMPLES=4;

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}
export function fsha(p){return sha(fs.readFileSync(p))}
export function read(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
export function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
