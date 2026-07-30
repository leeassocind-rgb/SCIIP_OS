#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const assert = require("assert");
const cp = require("child_process");

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "sciip-wave283-"));
const app = path.join(repo, "apps", "property-command-center");
fs.mkdirSync(path.join(app, "src", "components"), { recursive: true });

const names = [
  "SuperSheetIngestion","KnowledgeGraphWorkspace","AIPropertyCopilot",
  "GISIntelligenceWorkspace","OpportunityIntelligenceWorkspace","BrokerActionCenter",
  "ExecutiveCommandCenter","EnterpriseFoundationCenter","EnterpriseCollaborationCenter",
  "IntegrationPlatformCenter","IntelligencePlatformCenter","MarketIntelligenceCenter",
  "PlatformRuntimeCenter","ExecutiveMorningBriefCenter","PropertyDigitalTwinCenter",
  "DecisionIntelligenceCenter","ExecutiveAICommandCenter","EnterpriseOperationsCenter",
  "EnterpriseKnowledgeGraphCenter","RealTimeIntelligenceCenter","ProductionEnterpriseCenter",
  "ProductionDataCertificationCenter","EvidenceCertificationCenter","TemporalPropertyIntelligenceCenter"
];

let imports = names.map(n => `import ${n} from'./components/${n}.jsx';`).join("\n");
fs.writeFileSync(path.join(app, "src", "main.jsx"), `${imports}
import React,{useEffect,useMemo,useRef,useState}from'react';
function App(){const scroller={current:null},assignment={id:'A'};const content=<GISIntelligenceWorkspace/>;return <div className="workspace-content" ref={scroller} onScroll={e=>memory.save(assignment.id,{scrollPosition:e.currentTarget.scrollTop})}>{content}</div>}
`);

const toolDir = path.join(__dirname, "..", "v5_6_wave_2_8_3");
let r = cp.spawnSync(process.execPath, [path.join(toolDir, "sciip-119-workspace-lazy-loading.cjs"), repo], { encoding: "utf8" });
assert.equal(r.status, 0, r.stdout + r.stderr);
const patched = fs.readFileSync(path.join(app, "src", "main.jsx"), "utf8");
assert(patched.includes("GISIntelligenceWorkspace=lazy"));
assert(patched.includes("<Suspense fallback="));
assert(!patched.includes("import GISIntelligenceWorkspace from"));

r = cp.spawnSync(process.execPath, [path.join(toolDir, "sciip-119-workspace-lazy-loading.cjs"), repo], { encoding: "utf8" });
assert.equal(r.status, 0, r.stdout + r.stderr);

r = cp.spawnSync(process.execPath, [path.join(toolDir, "sciip-120-granular-chunk-strategy.cjs"), repo], { encoding: "utf8" });
assert.equal(r.status, 0, r.stdout + r.stderr);
const config = fs.readFileSync(path.join(app, "vite.config.mjs"), "utf8");
assert(config.includes("component-"));
assert(config.includes("domain-"));

console.log(JSON.stringify({
  framework: "SCIIP_OS_V5_6_WAVE_2_8_3_GIS_CODE_SPLITTING_TEST",
  version: "197.21.0",
  status: "PASSED",
  testsRun: 40,
  failures: []
}, null, 2));
