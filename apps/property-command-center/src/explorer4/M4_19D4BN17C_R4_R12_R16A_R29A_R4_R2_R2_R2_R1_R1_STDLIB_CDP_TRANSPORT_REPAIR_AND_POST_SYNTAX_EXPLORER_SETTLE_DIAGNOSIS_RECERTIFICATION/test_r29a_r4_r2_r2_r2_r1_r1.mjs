import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29a_r4_r2_r2_r2_r1_r1.py",import.meta.url),"utf8");
const req=[
"class WS:","socket.create_connection","Sec-WebSocket-Key","PYTHON_STDLIB_RAW_WEBSOCKET",
"External Python packages required: NONE","Page.navigate","Runtime.evaluate",
"FIRST_UNIQUE_EXPLORER_SECONDS","UNIQUE_EXPLORER_WITHIN_TWO_SECONDS","STABLE_AT_OR_AFTER_2S",
"priorWebsocketDependencyBlockConsumed","externalWebsocketPackageNotRequired",
"noExplorerClickPerformed","noPropertyClickPerformed","assignmentsInvocationOff","generateInvocationOff",
"exportInvocationOff","applicationMutationOff","governedMutationOff",
"FRESH_PAGE_EXPLORER_SETTLE_RETRY_HARDENING_AND_CANDIDATE_SELECTION_RECERTIFICATION"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R1_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);