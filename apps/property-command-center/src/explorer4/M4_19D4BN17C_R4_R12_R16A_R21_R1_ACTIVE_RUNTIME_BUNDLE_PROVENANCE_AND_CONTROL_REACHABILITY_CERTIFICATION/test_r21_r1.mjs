#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"certify_r21_r1.py"),"utf8");
const q=["r21ActivationUnprovenConsumed","runtimeBundlePresenceNotInferredFromDisk","reachableChunkGraphInspected",
"ACTIVE_RUNTIME_PROVENANCE_CERTIFIED_R21_DIST_CANDIDATE_REACHABLE",
"ACTIVE_RUNTIME_SEMANTIC_CONTROL_CHUNK_REACHABLE_R21_FILENAME_PARITY_NOT_ESTABLISHED",
"LIVE_APP_NOT_REACHABLE_PROVENANCE_CERTIFICATION_BLOCKED"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R21_R1_STATIC_TEST",status:"PASSED",assertions:q.length},null,2));