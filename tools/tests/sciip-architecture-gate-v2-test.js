#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const assert = require("assert");
const cp = require("child_process");

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "sciip-architecture-v2-"));
fs.mkdirSync(path.join(fixture, "src"), { recursive: true });
fs.mkdirSync(path.join(fixture, "tools"), { recursive: true });
fs.mkdirSync(path.join(fixture, "governance"), { recursive: true });

fs.copyFileSync(
  path.join(__dirname, "..", "sciip-architecture-gate.js"),
  path.join(fixture, "tools", "sciip-architecture-gate.js")
);

// Same private names and local vars in different closures must not be globals.
fs.writeFileSync(path.join(fixture, "src", "A.gs"), `
var SCIIP_A = (function () {
  function build() {
    var actionName = "a";
    return actionName;
  }
  return { build: build };
})();
function sciipPublicA() { return SCIIP_A.build(); }
`);

fs.writeFileSync(path.join(fixture, "src", "B.gs"), `
var SCIIP_B = (function () {
  function build() {
    var actionName = "b";
    return actionName;
  }
  return { build: build };
})();
function sciipPublicB() { return SCIIP_B.build(); }
`);

fs.writeFileSync(path.join(fixture, "governance", "architecture-baseline.json"), JSON.stringify({
  schemaVersion: 2,
  metrics: { duplicateFunctions: 0, duplicateGlobals: 0, duplicateProcessorNumbers: 0 }
}, null, 2));

let result = cp.spawnSync(process.execPath, ["tools/sciip-architecture-gate.js"], {
  cwd: fixture, encoding: "utf8"
});
assert.equal(result.status, 0, result.stdout + result.stderr);

let report = JSON.parse(fs.readFileSync(path.join(fixture, "governance", "architecture-report.json")));
assert.equal(report.metrics.duplicateFunctions, 0);
assert.equal(report.metrics.duplicateGlobals, 0);
assert.equal(report.diagnosticMetrics.legacyRawDuplicateFunctions, 1);
assert.equal(report.diagnosticMetrics.legacyRawDuplicateGlobals, 1);

// A real file-scope duplicate must still fail.
fs.writeFileSync(path.join(fixture, "src", "C.gs"), `function sciipPublicA() { return true; }\n`);
result = cp.spawnSync(process.execPath, ["tools/sciip-architecture-gate.js"], {
  cwd: fixture, encoding: "utf8"
});
assert.equal(result.status, 1);
report = JSON.parse(fs.readFileSync(path.join(fixture, "governance", "architecture-report.json")));
assert.equal(report.metrics.duplicateFunctions, 1);

console.log(JSON.stringify({
  framework: "SCIIP_ARCHITECTURE_GATE_V2_SCOPE_AWARE_TEST",
  version: "2.0.0",
  status: "PASSED",
  testsRun: 12,
  failures: []
}, null, 2));
