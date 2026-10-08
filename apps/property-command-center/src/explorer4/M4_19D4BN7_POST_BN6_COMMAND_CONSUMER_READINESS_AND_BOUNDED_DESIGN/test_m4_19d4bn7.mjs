#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"design_bn7.py"),"utf8");
const req=[
"M419D4BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSED",
"ExplorerCommandPalette","runCommand","setPaletteOpen(true)",
"propertyCommandRoute","marketCommandRoute","neighborsCommandRoute","compareCommandRoute","explainCommandRoute",
"POST_BN6_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFICATION_READY",
"M4_19D4BN7A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFICATION",
"applicationSourceMutation"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN7_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
