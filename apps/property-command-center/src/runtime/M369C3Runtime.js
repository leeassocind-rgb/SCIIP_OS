import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_69C3_PUBLIC_PARITY_REPAIR_FRESH_11_RECORD_RECOVERY_PREAUTHORIZATION';
export const VERSION='3.0-m3.69c3';
export function sha(v){return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex')}
export function token(){return crypto.randomBytes(24).toString('hex')}
