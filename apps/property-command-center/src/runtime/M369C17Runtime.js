import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_69C17_CURRENT_LEDGER_DIVERGENCE_FORENSICS';
export const VERSION='3.0-m3.69c17';
export function sha(b){return crypto.createHash('sha256').update(b).digest('hex')}
export function eventKey(e){return JSON.stringify(e)}
