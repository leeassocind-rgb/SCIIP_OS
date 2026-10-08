import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_69C9_PUBLIC_PARITY_REPAIR_FRESH_8_RECORD_RECOVERY_PREAUTHORIZATION';
export const VERSION='3.0-m3.69c9';
export const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
export const token=()=>crypto.randomBytes(24).toString('hex');
