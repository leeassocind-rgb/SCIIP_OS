import crypto from "node:crypto";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const norm=x=>String(x??"").trim().toUpperCase().replace(/[.,]/g,"").replace(/\s+/g," ");
export function recordsOf(doc){
 if(Array.isArray(doc)) return doc;
 for(const k of ["records","properties","items","features","inventory","data"]) if(Array.isArray(doc?.[k])) return doc[k];
 const arr=Object.values(doc||{}).filter(Array.isArray);
 return arr.length===1?arr[0]:[];
}
export function flatten(obj,p="$",out=[]){
 if(obj&&typeof obj==="object"){
  if(Array.isArray(obj)) obj.forEach((v,i)=>flatten(v,`${p}[${i}]`,out));
  else for(const [k,v] of Object.entries(obj)){const q=`${p}.${k}`;out.push({path:q,key:k,value:v});flatten(v,q,out)}
 }
 return out;
}
export function recoverCoordinatePair(...docs){
 const candidates=[];
 for(const d of docs){
  if(!d||typeof d!=="object") continue;
  const flat=flatten(d);
  const lats=flat.filter(e=>/^latitude$/i.test(e.key)||/^lat$/i.test(e.key));
  const lngs=flat.filter(e=>/^(longitude|lng|lon)$/i.test(e.key));
  for(const a of lats) for(const b of lngs){
   const av=Number(a.value), bv=Number(b.value);
   if(Number.isFinite(av)&&Number.isFinite(bv)&&av>=-90&&av<=90&&bv>=-180&&bv<=180&&!(av===0&&bv===0)){
    const prefixA=a.path.split(".").slice(0,-1).join(".");
    const prefixB=b.path.split(".").slice(0,-1).join(".");
    candidates.push({latitude:av,longitude:bv,latitudePath:a.path,longitudePath:b.path,
      sameContainer:prefixA===prefixB,score:(prefixA===prefixB?100:0)+(/qualification|coordinate|location/i.test(prefixA+prefixB)?20:0)});
   }
  }
 }
 candidates.sort((x,y)=>y.score-x.score);
 return candidates[0]??null;
}
