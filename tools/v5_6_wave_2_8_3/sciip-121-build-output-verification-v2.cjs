#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const repo = path.resolve(process.argv[2] || process.cwd());
const app = path.join(repo, "apps", "property-command-center");
const assets = path.join(app, "dist", "assets");
const out = path.join(repo, "reports", "release-5.6", "wave-2.8.3", "197.21.0-build-output-verification-v2.json");

if (!fs.existsSync(assets)) throw new Error("dist/assets missing after build");

const files = fs.readdirSync(assets)
  .filter(name => name.endsWith(".js"))
  .map(name => ({ name, bytes: fs.statSync(path.join(assets, name)).size }))
  .sort((a, b) => b.bytes - a.bytes);

const largest = files[0]?.bytes || 0;
const limit = 1.5 * 1024 * 1024;
const workspaceChunks = files.filter(x =>
  /^(component-|domain-|workspace-|feature-)/.test(x.name)
);
const failures = [];
if (files.length < 10) failures.push("INSUFFICIENT_CODE_SPLITTING");
if (workspaceChunks.length < 8) failures.push("INSUFFICIENT_WORKSPACE_CHUNKS");
if (largest > limit) failures.push("LARGEST_CHUNK_EXCEEDS_1_5_MIB");
if (files.some(x => x.name.startsWith("workspace-property-gis-") && x.bytes > limit)) {
  failures.push("MONOLITHIC_PROPERTY_GIS_CHUNK_REMAINS");
}

const result = {
  framework: "SCIIP_V5_6_BUILD_OUTPUT_VERIFICATION_V2",
  version: "197.21.0",
  status: failures.length ? "FAILED" : "PASSED",
  generatedAt: new Date().toISOString(),
  result: {
    javascriptChunks: files.length,
    workspaceChunks: workspaceChunks.length,
    largestChunkBytes: largest,
    largestChunkMiB: Number((largest / 1048576).toFixed(3)),
    policyLimitMiB: 1.5,
    failures,
    certified: failures.length === 0
  },
  files
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
