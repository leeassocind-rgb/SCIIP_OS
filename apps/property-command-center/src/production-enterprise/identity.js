import{required}from'./immutable.js';
export function stableId(prefix,...parts){required(prefix,'prefix');const raw=parts.flat().map(v=>String(v??'').trim().toLowerCase()).join('|');let h=2166136261;for(const ch of raw){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return `${prefix}-${(h>>>0).toString(16).padStart(8,'0')}`;}
