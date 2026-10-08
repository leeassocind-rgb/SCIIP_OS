#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname),t=fs.readFileSync(path.join(d,"trace_exact_import_and_handoff.py"),"utf8");
const r=["broker-product/BrokerDestination.jsx","sciip:global-property-search","sciip.globalSearchQuery","resolveGlobalPropertySearch","applicationSourceMutation","governedDataMutation","networkAuthority"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R4_R2_R3_STATIC_TEST",status:"PASSED",assertions:r.length},null,2));
