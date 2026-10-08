import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_69C4_EXPLICIT_GOVERNED_11_RECORD_RECOVERY_EXECUTION';
export const VERSION='3.0-m3.69c4';
export const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
