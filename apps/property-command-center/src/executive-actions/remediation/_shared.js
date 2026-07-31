export const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);for(const v of Object.values(value))freeze(v)}return value};
export const asArray=value=>Array.isArray(value)?value:[];
export const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
export const unique=items=>[...new Set(items.filter(Boolean))];
