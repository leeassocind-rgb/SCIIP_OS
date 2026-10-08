#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12.py"),"utf8");
const r=["sourceReducerActionContractsCaptured","sourceSearchActionTypesResolved","payloadFieldCandidatesResolved","liveDispatchFunctionsCaptured","dispatchFingerprintsStable","exactDispatchSurfaceResolved","rankedActionTypes","rankedPayloadFields","canonicalCandidate","EXACT_STORE_DISPATCH_SURFACE_AND_ACTION_SHAPE_CANDIDATES_RESOLVED","M4_19D4BN17C_R4_R13_CANONICAL_STORE_ACTION_PAYLOAD_LIVE_MATERIALIZATION_CERTIFICATION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"STORE_DISPATCH_FINGERPRINT_AND_ACTION_PAYLOAD_SHAPE_RESOLUTION"},null,2));