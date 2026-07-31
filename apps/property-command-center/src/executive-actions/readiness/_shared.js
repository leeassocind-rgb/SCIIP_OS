export const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
export const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);for(const item of Object.values(value))freeze(item)}return value};
export const uniq=items=>[...new Set((items||[]).filter(Boolean))];
