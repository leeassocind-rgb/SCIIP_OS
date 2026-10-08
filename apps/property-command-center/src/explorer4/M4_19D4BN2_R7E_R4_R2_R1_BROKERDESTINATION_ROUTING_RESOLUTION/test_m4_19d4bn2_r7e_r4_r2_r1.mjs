#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const here=path.dirname(new URL(import.meta.url).pathname);
const p=path.join(here,"resolve_broker_destination.py");
const t=fs.readFileSync(p,"utf8");
const required=[
 "BrokerDestination",
 "BROKER_DESTINATION_ROUTE_RESOLVED",
 "BROKER_DESTINATION_ROUTE_MULTIPLE_CANDIDATES",
 "BROKER_DESTINATION_SYMBOL_PRESENT_NONSTANDARD_BINDING",
 "applicationSourceMutation",
 "canonicalWriteAuthority",
 "networkAuthority",
 "destination",
 "Explorer",
 "resolvedCandidateFiles"
];
for (const x of required) {
  if (!t.includes(x)) {
    console.error("FAIL missing token:",x);
    process.exit(1);
  }
}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R4_R2_R1_STATIC_TEST",
 status:"PASSED",
 assertions:required.length
},null,2));
