export const freezeDeep=value=>{
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.freeze(value);
    for(const key of Object.keys(value))freezeDeep(value[key]);
  }
  return value;
};
export const uniq=values=>[...new Set((values||[]).filter(Boolean))];
export const normalize=value=>String(value||'').trim().toUpperCase();
export const round=(value,digits=2)=>{
  const factor=10**digits;
  return Math.round((Number(value)||0)*factor)/factor;
};
