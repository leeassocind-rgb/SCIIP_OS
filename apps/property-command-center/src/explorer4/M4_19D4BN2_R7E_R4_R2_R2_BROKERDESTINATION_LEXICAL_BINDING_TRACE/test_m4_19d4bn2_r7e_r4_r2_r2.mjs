#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const here=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(here,"trace_broker_destination_binding.py"),"utf8");
const req=[
 "functionParameter","arrowParameter","destructuredParameter","objectDestructure",
 "BROKER_DESTINATION_LEXICAL_BINDING_IDENTIFIED",
 "BROKER_DESTINATION_ENCLOSING_SCOPE_IDENTIFIED_BINDING_STILL_INDIRECT",
 "applicationSourceMutation","canonicalWriteAuthority","networkAuthority",
 "EXACT BrokerDestination TOKEN CONTEXT"
];
for (const x of req) if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R4_R2_R2_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
