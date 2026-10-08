#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"design_bn13.py"),"utf8");
const req=[
"M419D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSED",
"EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"deepLinkPrimitivesPresent",
"contextRestorePrimitivesPresent",
"selectedPropertyContextPresent",
"remainingConsumerResolvedDeepLinkContextRestore",
"DEEP_LINK_CONTEXT_RESTORE",
"M419D4BN13_DEEP_LINK_CONTEXT_RESTORE_READINESS_CERTIFIED",
"POST_BN12_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_PARITY_CERTIFICATION_READY",
"M4_19D4BN13A_EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY_CERTIFICATION",
"READ_ONLY_ARCHITECTURE_DESIGN",
"noMutationAuthority"
];

for(const x of req){
  if(!t.includes(x)){
    console.error("FAIL",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_BN13_STATIC_TEST",
  status:"PASSED",
  assertions:req.length
},null,2));
