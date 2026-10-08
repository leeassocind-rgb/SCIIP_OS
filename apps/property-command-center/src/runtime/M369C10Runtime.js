import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_69C10_EXPLICIT_GOVERNED_8_RECORD_RECOVERY_EXECUTION';
export const VERSION='3.0-m3.69c10';
export const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
