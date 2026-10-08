import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_69C7_EXPLICIT_GOVERNED_9_RECORD_RECOVERY_EXECUTION';
export const VERSION='3.0-m3.69c7';
export const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
