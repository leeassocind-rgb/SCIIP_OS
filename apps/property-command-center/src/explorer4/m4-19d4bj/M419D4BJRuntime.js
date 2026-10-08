import fs from"node:fs";import path from"node:path";import crypto from"node:crypto";

export function readJson(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
export function writeJson(p,x){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n")}
export function shaJson(x){return crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex")}
export function norm(v){return String(v??"").trim()}
export function num(...vals){for(const v of vals){const n=Number(v);if(Number.isFinite(n))return n}return null}
export function pick(o,paths){
 for(const p of paths){
  const parts=p.split(".");let x=o;
  for(const k of parts){if(x==null){x=undefined;break}x=x[k]}
  if(x!==undefined&&x!==null&&x!=="")return x;
 }
 return null
}
export function haversine(a,b){
 const R=6371,rad=x=>x*Math.PI/180;
 const dlat=rad(b.lat-a.lat),dlon=rad(b.lng-a.lng);
 const q=Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlon/2)**2;
 return 2*R*Math.asin(Math.sqrt(q));
}
