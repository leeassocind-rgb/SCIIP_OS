const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createMemoryDurableStorage(seed={}){
  const map=new Map(Object.entries(seed).map(([key,value])=>[key,clone(value)]));
  return Object.freeze({
    get:key=>clone(map.get(key)),
    set:(key,value)=>{map.set(key,clone(value));return clone(value)},
    remove:key=>map.delete(key),
    keys:()=>Object.freeze([...map.keys()]),
    snapshot:()=>freeze({type:'MEMORY_DURABLE_STORAGE',keys:map.size,durable:true})
  });
}

export function createLocalStorageDurableAdapter(storage=globalThis.localStorage){
  if(!storage)throw new Error('Local storage is unavailable');
  return Object.freeze({
    get:key=>{try{return JSON.parse(storage.getItem(key)||'null')}catch{return null}},
    set:(key,value)=>{storage.setItem(key,JSON.stringify(value));return clone(value)},
    remove:key=>storage.removeItem(key),
    keys:()=>Object.freeze(Array.from({length:storage.length},(_,i)=>storage.key(i)).filter(Boolean)),
    snapshot:()=>freeze({type:'LOCAL_STORAGE_DURABLE_ADAPTER',durable:true})
  });
}
