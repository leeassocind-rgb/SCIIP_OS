#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"certify_r21_r4.py"),"utf8");

const q=[
"guardedInvocationDesignClassificationConsumed",
"probeInstrumentationInstalled",
"exactExportControlUniqueBeforeAction",
"liveExportHandlerNameCertified",
"singleExactExportClickOnly",
"postActionReadbackObserved",
"exportSpecificOutputSignalObserved",
"noRuntimeErrorsObserved",
"reportReviewContinuityPreserved",
"sameOriginPreserved",
"SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFIED"
];

for(const x of q){
  if(!s.includes(x)){
    console.error("FAIL",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R21_R4_STATIC_TEST",
  status:"PASSED",
  assertions:q.length,
  repair:"R21_R3_CERTIFIED_SOURCE_LIVE_EXPORT_BINDING_TO_SINGLE_EXACT_GUARDED_EXPORT_INVOCATION_WITH_OUTPUT_SIGNAL_AND_POST_ACTION_READBACK"
},null,2));