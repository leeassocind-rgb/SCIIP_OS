export function deepFreeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}
export function clone(value){return JSON.parse(JSON.stringify(value));}
export function required(value,name){if(value===undefined||value===null||value==='')throw new Error(`${name} is required`);return value;}
