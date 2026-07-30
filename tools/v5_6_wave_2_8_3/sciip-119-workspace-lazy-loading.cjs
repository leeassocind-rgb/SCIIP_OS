#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const repo = path.resolve(process.argv[2] || process.cwd());
const app = path.join(repo, "apps", "property-command-center");
const mainPath = path.join(app, "src", "main.jsx");
const reportDir = path.join(repo, "reports", "release-5.6", "wave-2.8.3");
const reportPath = path.join(reportDir, "197.19.0-workspace-lazy-loading.json");

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}
function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

if (!fs.existsSync(mainPath)) throw new Error(`Missing ${mainPath}`);
const original = fs.readFileSync(mainPath, "utf8");
let source = original;

const componentNames = [
  "SuperSheetIngestion",
  "KnowledgeGraphWorkspace",
  "AIPropertyCopilot",
  "GISIntelligenceWorkspace",
  "OpportunityIntelligenceWorkspace",
  "BrokerActionCenter",
  "ExecutiveCommandCenter",
  "EnterpriseFoundationCenter",
  "EnterpriseCollaborationCenter",
  "IntegrationPlatformCenter",
  "IntelligencePlatformCenter",
  "MarketIntelligenceCenter",
  "PlatformRuntimeCenter",
  "ExecutiveMorningBriefCenter",
  "PropertyDigitalTwinCenter",
  "DecisionIntelligenceCenter",
  "ExecutiveAICommandCenter",
  "EnterpriseOperationsCenter",
  "EnterpriseKnowledgeGraphCenter",
  "RealTimeIntelligenceCenter",
  "ProductionEnterpriseCenter",
  "ProductionDataCertificationCenter",
  "EvidenceCertificationCenter",
  "TemporalPropertyIntelligenceCenter"
];

const missing = [];
const converted = [];

for (const name of componentNames) {
  const patterns = [
    new RegExp(`import\\s+${name}\\s+from\\s*['"]\\.\\/components\\/${name}\\.jsx['"];?`),
    new RegExp(`import\\s+${name}\\s+from\\s*['"]\\.\\/components\\/${name}['"];?`)
  ];
  let matched = false;
  for (const pattern of patterns) {
    if (pattern.test(source)) {
      source = source.replace(
        pattern,
        `const ${name}=lazy(()=>import('./components/${name}.jsx'));`
      );
      matched = true;
      converted.push(name);
      break;
    }
  }
  // Idempotent rerun.
  if (!matched && !new RegExp(`const\\s+${name}\\s*=\\s*lazy\\(`).test(source)) {
    missing.push(name);
  }
}

if (missing.length) {
  throw new Error(`Expected component imports not found: ${missing.join(", ")}`);
}

const reactImport = /import React,\{([^}]+)\}from['"]react['"];/;
const reactMatch = source.match(reactImport);
if (!reactMatch) throw new Error("Expected compact React import was not found");
const hooks = reactMatch[1].split(",").map(x => x.trim()).filter(Boolean);
for (const required of ["lazy", "Suspense"]) {
  if (!hooks.includes(required)) hooks.unshift(required);
}
source = source.replace(reactImport, `import React,{${hooks.join(",")}}from'react';`);

if (!source.includes('className="workspace-loading"')) {
  const target = '<div className="workspace-content" ref={scroller} onScroll={e=>memory.save(assignment.id,{scrollPosition:e.currentTarget.scrollTop})}>{content}</div>';
  const replacement = '<div className="workspace-content" ref={scroller} onScroll={e=>memory.save(assignment.id,{scrollPosition:e.currentTarget.scrollTop})}><Suspense fallback={<div className="workspace-loading" role="status" aria-live="polite">Loading workspace…</div>}>{content}</Suspense></div>';
  if (!source.includes(target)) throw new Error("Workspace content render target was not found");
  source = source.replace(target, replacement);
}

if (!source.includes("workspace-loading")) throw new Error("Suspense fallback was not installed");

if (source !== original) fs.writeFileSync(mainPath, source);

const result = {
  framework: "SCIIP_V5_6_WORKSPACE_LAZY_LOADING",
  version: "197.19.0",
  status: "PASSED",
  generatedAt: new Date().toISOString(),
  result: {
    componentsConverted: converted.length,
    lazyComponents: componentNames.length,
    suspenseInstalled: true,
    idempotent: true,
    sourceChanged: source !== original,
    beforeSha256: sha256(original),
    afterSha256: sha256(source)
  }
};
writeJson(reportPath, result);
console.log(JSON.stringify(result, null, 2));
