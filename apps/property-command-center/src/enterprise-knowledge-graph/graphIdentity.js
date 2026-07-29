const norm=v=>String(v??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function createGraphIdentity(type,key){if(!type||!key)throw new Error('type and key required');return Object.freeze({id:`kg-${norm(type)}-${norm(key)}`,type:String(type),key:String(key)});}
