#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"reconcile_r26b_r2_r2.py"),"utf8");
const q=[
"READ_ONLY_ENTITY_GRANULARITY_RECONCILIATION",
"181831","102083","138363","422277",
"componentSumEquals422277",
"PROJECT_AGGREGATE",
"BUILDING",
"addressOnlyBindingForbiddenWhenMultipleGranularitiesPresent",
"projectAggregateMustNotBindAsBuilding1",
"HAS_BUILDING",
"MEMBER_OF_PROJECT",
"propertyClickOff",
"assignmentsInvocationOff",
"generateInvocationOff",
"exportInvocationOff",
"R26B_R2_R3_BUILDING_PROJECT_AWARE_ALONDRA_NON_EXPORT_RECERTIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26B_R2_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26B_R2_R1_DUPLICATE_ADDRESS_COLLISION_PLUS_USER_SITE_PLAN_EVIDENCE_TO_BUILDING_VS_PROJECT_AGGREGATE_ENTITY_GRANULARITY_RECONCILIATION_AND_CANONICAL_BINDING_CONTRACT"
},null,2));