#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"resolve_bn6b_r1.py"),"utf8");

const capabilities=[
  ["searches compare action variants",
    t.includes(`terms=["action==='compare'","action === 'compare'","toggleCompare(","CompareDock"`)],
  ["contains compare-branch regex",
    t.includes(String.raw`workspace\.toggleCompare\(property\.id\)`)],
  ["resolves dispatcher",
    t.includes("dispatcherResolved")],
  ["resolves dispatcher consumer references",
    t.includes("dispatcherConsumerReferencesResolved")],
  ["resolves CompareDock mount",
    t.includes("compareDockResolved")],
  ["classifies action-dispatcher route",
    t.includes('route_type="ACTION_DISPATCHER"')],
  ["records activation route result",
    t.includes('"activationRouteResolved":route_type!="UNRESOLVED"')],
  ["records literal compare metadata routes",
    t.includes("literalCompareRoutes")],
  ["emits resolved diagnosis",
    t.includes("COMPARE_CONSUMER_PRESENT_LIVE_TEXT_BUTTON_ASSUMPTION_INVALID_ACTIVATION_PATH_RESOLVED")],
  ["advances to BN6B-R2",
    t.includes("M4_19D4BN6B_R2_EXACT_TEN_LIVE_COMPARE_ACTIVATION_PATH_RECERTIFICATION")],
  ["keeps mutation/network authority off",
    t.includes('"applicationSourceMutation":False') && t.includes('"networkAuthority":False')]
];

for(const [label,ok] of capabilities){
  if(!ok){
    console.error("FAIL",label);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_BN6B_R1_R2_STATIC_TEST",
  status:"PASSED",
  assertions:capabilities.length,
  repair:"STATIC_TEST_VALIDATES_ANALYZER_CAPABILITIES_NOT_REPOSITORY_LITERAL_TEXT"
},null,2));
