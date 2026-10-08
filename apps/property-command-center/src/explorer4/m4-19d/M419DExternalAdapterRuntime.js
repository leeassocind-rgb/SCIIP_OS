import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
export const VERSION="4.0-m4.19d";
export const REQUIRED=["canonicalPropertyId","sourcePropertyId","observationId","observationTimestamp","observedAvailableSf","sourceProvenance","sourceSnapshotEvidence"];
export function sha(x){return crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex")}
export function validateRecord(r){const missing=REQUIRED.filter(k=>r?.[k]===undefined||r?.[k]===null||r?.[k]===""); return {ok:missing.length===0,missing}}
export function stageEvidence(records=[]){const seenObs=new Set(),seenPair=new Set(); let ready=0; const rows=records.map(r=>{const v=validateRecord(r); const pair=`${r?.canonicalPropertyId}|${r?.sourcePropertyId}`; const duplicate=seenObs.has(r?.observationId)||seenPair.has(pair); if(r?.observationId)seenObs.add(r.observationId); if(pair!=="undefined|undefined")seenPair.add(pair); const ok=v.ok&&!duplicate; if(ok)ready++; return {...r,stageValidation:{ok,missing:v.missing,duplicate},evidenceRecordHash:sha(r)} }); return {rows,ready,blocked:rows.length-ready}}
export function loadJson(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
