#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const p=fs.readFileSync(path.join(d,"native_new_fifty_runner_patched.py"),"utf8");
const i=fs.readFileSync(path.join(d,"install_r26d_r2_r2_r2.py"),"utf8");
const r=fs.readFileSync(path.join(d,"recertify_alondra_nonexport.py"),"utf8");
const q=["112 W Alondra Blvd|181831","ALONDRA_PROJECT_AGGREGATE_SF=422277","wait_alondra_building1_binding","click_alondra_building1",
"wait_alondra_selected_building1","ALONDRA_BUILDING_PROJECT_AWARE_HIDDEN_CARD_181831","MAX_EXPORT_CLICKS_PER_RECORD=1","STRICT_SEQUENTIAL=True",
"HALT_ON_FIRST_FAILURE=True","SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED"];
for(const x of q)if(!p.includes(x)){console.error("FAIL patched runner",x);process.exit(1)}
for(const x of ["R26D_R2_R2_R2_ALONDRA_NATIVE_TARGET_BINDING_AND_ENTITY_GRANULARITY_REPAIR","Export invocation: OFF"])if(!i.includes(x)){console.error("FAIL installer",x);process.exit(1)}
for(const x of ["Export invocation: OFF","181[, ]?831","422[, ]?277","exportReport"])if(!r.includes(x)){console.error("FAIL recert",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R26D_R2_R2_R2_STATIC_TEST",status:"PASSED",assertions:q.length+6,
repair:"R26D_R2_R2_R1_ALONDRA_PRESELECTION_BINDING_FAILURE_TO_NATIVE_BUILDING_PROJECT_AWARE_BINDING_PATCH_AND_NON_EXPORT_RECERTIFICATION"},null,2));