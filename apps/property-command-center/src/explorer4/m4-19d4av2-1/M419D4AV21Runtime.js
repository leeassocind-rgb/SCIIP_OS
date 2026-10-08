import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AV2_1_BOUNDED_CANONICAL_TO_INVENTORY_IDENTITY_LINEAGE_RECOVERY";
export const VERSION="4.0-m4.19d4av2.1";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const norm=x=>String(x??"").trim().toUpperCase().replace(/[.,]/g,"").replace(/\s+/g," ");
export function flatten(obj,p="$",out=[]){
 if(obj&&typeof obj==="object"){
  if(Array.isArray(obj)) obj.forEach((v,i)=>flatten(v,`${p}[${i}]`,out));
  else for(const [k,v] of Object.entries(obj)){const q=`${p}.${k}`;out.push({path:q,key:k,value:v});flatten(v,q,out)}
 }
 return out;
}
export function admissiblePath(p=""){
 const s=p.toLowerCase();
 if(s.includes("/node_modules/")||s.includes("/.git/")||s.includes("/dist/")||s.includes("/build/")||s.includes("/coverage/")) return false;
 if(s.includes("/src/explorer4/")) return false;
 return /(canonical|identity|decision|temporal|manifest|mapping|inventory|property-current|property_current|asset-relationship|asset_relationship|evidence)/i.test(s);
}
