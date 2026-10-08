#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const here = path.dirname(new URL(import.meta.url).pathname);
const analyzer = path.join(here, "analyze_search_state_causal_chain.py");
const required = [
  "SCIIPBrokerApp.jsx",
  "sciip:global-property-search",
  "sciip.globalSearchQuery",
  "BrokerDestination",
  "resolveGlobalPropertySearch",
  "GLOBAL_SEARCH_EVENT_DISPATCH_BEFORE_EXPLORER_LISTENER_MOUNT",
  "SESSION_QUERY_WRITTEN_BUT_NOT_CONSUMED",
  "SEARCH_RESOLVER_NOT_BOUND_TO_LIVE_EXPLORER",
  "canonicalWriteAuthority",
  "networkAuthority"
];

if (!fs.existsSync(analyzer)) {
  console.error("FAIL: analyzer missing");
  process.exit(1);
}
const text = fs.readFileSync(analyzer, "utf8");
let passed = 0;
for (const token of required) {
  if (!text.includes(token)) {
    console.error(`FAIL: analyzer missing required token: ${token}`);
    process.exit(1);
  }
  passed++;
}
if (!text.includes('"applicationSourceMutation":False')) {
  console.error("FAIL: diagnostic mutation boundary missing");
  process.exit(1);
}
passed++;
const sha = crypto.createHash("sha256").update(text).digest("hex");
console.log(JSON.stringify({
  framework: "SCIIP_EXPLORER_4_R4_R2_PACKAGE_STATIC_TEST",
  status: "PASSED",
  assertions: passed,
  analyzerSha256: sha
}, null, 2));
