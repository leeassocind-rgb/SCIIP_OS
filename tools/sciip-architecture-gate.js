#!/usr/bin/env node
"use strict";

/**
 * SCIIP Architecture Gate v2
 *
 * v1 counted every named function and every `var` assignment in every lexical
 * scope as an Apps Script global. That produced false regressions whenever
 * modules added private functions or local variables inside closures.
 *
 * v2 records only declarations visible at Apps Script file scope (brace depth
 * zero after comments and strings are neutralized). It reports the legacy raw
 * counts separately for migration/audit visibility.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const REPORT_DIR = path.join(ROOT, "governance");
const BASELINE_PATH = path.join(REPORT_DIR, "architecture-baseline.json");
const REPORT_PATH = path.join(REPORT_DIR, "architecture-report.json");
const SCHEMA_VERSION = 2;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function stripCommentsAndStrings(source) {
  let out = "";
  let i = 0;
  let state = "code";
  let quote = null;
  while (i < source.length) {
    const ch = source[i];
    const nx = source[i + 1];

    if (state === "code") {
      if (ch === "/" && nx === "/") { state = "lineComment"; out += "  "; i += 2; continue; }
      if (ch === "/" && nx === "*") { state = "blockComment"; out += "  "; i += 2; continue; }
      if (ch === "'" || ch === '"' || ch === "`") { state = "string"; quote = ch; out += " "; i++; continue; }
      out += ch; i++; continue;
    }
    if (state === "lineComment") {
      if (ch === "\n") { state = "code"; out += "\n"; } else out += " ";
      i++; continue;
    }
    if (state === "blockComment") {
      if (ch === "*" && nx === "/") { state = "code"; out += "  "; i += 2; }
      else { out += ch === "\n" ? "\n" : " "; i++; }
      continue;
    }
    if (state === "string") {
      if (ch === "\\") { out += "  "; i += 2; continue; }
      if (ch === quote) { state = "code"; quote = null; out += " "; i++; continue; }
      out += ch === "\n" ? "\n" : " "; i++; continue;
    }
  }
  return out;
}

function braceDepths(clean) {
  const depths = new Int32Array(clean.length);
  let depth = 0;
  for (let i = 0; i < clean.length; i++) {
    depths[i] = depth;
    if (clean[i] === "{") depth++;
    else if (clean[i] === "}") depth = Math.max(0, depth - 1);
  }
  return depths;
}

function add(map, name, file) {
  if (!map.has(name)) map.set(name, []);
  map.get(name).push(file);
}

function collectDefinitions(files) {
  const functions = new Map();
  const globals = new Map();
  const rawFunctions = new Map();
  const rawGlobals = new Map();

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const clean = stripCommentsAndStrings(source);
    const depths = braceDepths(clean);
    const location = rel(file);

    for (const match of clean.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
      add(rawFunctions, match[1], location);
      if (depths[match.index] === 0) add(functions, match[1], location);
    }

    // Apps Script globals declared with `var` are only global at file scope.
    // The legacy gate treated every local `var` as a global.
    for (const match of clean.matchAll(/(^|[;\n])\s*var\s+([A-Za-z_$][\w$]*)\s*(?:=|;|,)/gm)) {
      const declarationIndex = match.index + (match[1] ? match[1].length : 0);
      add(rawGlobals, match[2], location);
      if (depths[declarationIndex] === 0) add(globals, match[2], location);
    }
  }

  return { functions, globals, rawFunctions, rawGlobals };
}

function duplicates(map) {
  return [...map.entries()]
    .filter(([, locations]) => new Set(locations).size > 1)
    .map(([name, locations]) => ({ name, locations: [...new Set(locations)].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function parseBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  const value = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
  if (!value || !value.metrics) return null;
  return value;
}

const files = walk(SRC).filter((file) => file.endsWith(".gs"));
const syntaxErrors = [];
const placeholders = [];
const unboundedRanges = [];
const processorNumbers = new Map();
let storageProcessorFiles = 0;
let storageRuntimeBaseFiles = 0;
let storageWriteFiles = 0;
let lockServiceFiles = 0;

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const clean = stripCommentsAndStrings(source);

  try {
    new vm.Script(source, { filename: rel(file) });
  } catch (error) {
    syntaxErrors.push({ file: rel(file), error: String(error.message || error) });
  }

  if (/Implement using the established|TODO\s*:\s*implement|throw new Error\(['"]Implement/.test(source)) {
    placeholders.push(rel(file));
  }
  if (/\bSCIIP_TEST\.runRange\s*\(\s*\)/.test(clean)) {
    unboundedRanges.push(rel(file));
  }

  const base = path.basename(file);
  const processorMatch = base.match(/^(\d+)_.*Processor\.gs$/);
  if (processorMatch && /src\/processors\//.test(rel(file))) {
    add(processorNumbers, processorMatch[1], rel(file));
  }

  if (/src\/processors\/runtime\/storage\//.test(rel(file)) && /Processor\.gs$/.test(base)) {
    storageProcessorFiles++;
    if (source.includes("SCIIP_RUNTIME_PROCESSOR_BASE")) storageRuntimeBaseFiles++;
    if (/\b(setValue|setValues|appendRow|insertRows|deleteRows|clearContent)\s*\(/.test(clean)) storageWriteFiles++;
  }
  if (source.includes("LockService")) lockServiceFiles++;
}

const defs = collectDefinitions(files);
const duplicateFunctions = duplicates(defs.functions);
const duplicateGlobals = duplicates(defs.globals);
const rawDuplicateFunctions = duplicates(defs.rawFunctions);
const rawDuplicateGlobals = duplicates(defs.rawGlobals);
const duplicateProcessorNumbers = duplicates(processorNumbers);

const report = {
  schemaVersion: SCHEMA_VERSION,
  analyzer: "SCOPE_AWARE_APPS_SCRIPT_FILE_SCOPE",
  generatedAt: new Date().toISOString(),
  metrics: {
    files: files.length,
    syntaxErrors: syntaxErrors.length,
    duplicateFunctions: duplicateFunctions.length,
    duplicateGlobals: duplicateGlobals.length,
    duplicateProcessorNumbers: duplicateProcessorNumbers.length,
    placeholders: placeholders.length,
    unboundedTestRanges: unboundedRanges.length,
    storageProcessorFiles,
    storageRuntimeBaseFiles,
    storageWriteFiles,
    lockServiceFiles,
  },
  diagnosticMetrics: {
    legacyRawDuplicateFunctions: rawDuplicateFunctions.length,
    legacyRawDuplicateGlobals: rawDuplicateGlobals.length,
    localFunctionCollisionsExcluded: rawDuplicateFunctions.length - duplicateFunctions.length,
    localVariableCollisionsExcluded: rawDuplicateGlobals.length - duplicateGlobals.length,
  },
  details: {
    syntaxErrors,
    duplicateFunctions,
    duplicateGlobals,
    duplicateProcessorNumbers,
    placeholders,
    unboundedRanges,
    legacyRawDuplicateFunctions: rawDuplicateFunctions,
    legacyRawDuplicateGlobals: rawDuplicateGlobals,
  },
};

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

if (process.argv.includes("--write-baseline")) {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    analyzer: report.analyzer,
    generatedAt: report.generatedAt,
    metrics: {
      duplicateFunctions: report.metrics.duplicateFunctions,
      duplicateGlobals: report.metrics.duplicateGlobals,
      duplicateProcessorNumbers: report.metrics.duplicateProcessorNumbers,
    },
  }, null, 2) + "\n");
  console.log(JSON.stringify(report.metrics, null, 2));
  console.log("ARCHITECTURE BASELINE WRITTEN (schema v2)");
  process.exit(0);
}

const mode = process.argv.includes("--strict") ? "strict" : "baseline";
const baseline = parseBaseline();
const failures = [];

if (report.metrics.syntaxErrors) failures.push(`syntaxErrors=${report.metrics.syntaxErrors}`);
if (report.metrics.placeholders) failures.push(`placeholders=${report.metrics.placeholders}`);
if (report.metrics.unboundedTestRanges) failures.push(`unboundedTestRanges=${report.metrics.unboundedTestRanges}`);

if (mode === "strict") {
  if (report.metrics.duplicateFunctions) failures.push(`duplicateFunctions=${report.metrics.duplicateFunctions}`);
  if (report.metrics.duplicateGlobals) failures.push(`duplicateGlobals=${report.metrics.duplicateGlobals}`);
  if (report.metrics.duplicateProcessorNumbers) failures.push(`duplicateProcessorNumbers=${report.metrics.duplicateProcessorNumbers}`);
} else if (baseline && baseline.metrics) {
  for (const key of ["duplicateFunctions", "duplicateGlobals", "duplicateProcessorNumbers"]) {
    if (report.metrics[key] > Number(baseline.metrics[key] || 0)) {
      failures.push(`${key} regressed ${baseline.metrics[key]} -> ${report.metrics[key]}`);
    }
  }
}

console.log(JSON.stringify({
  ...report.metrics,
  ...report.diagnosticMetrics,
}, null, 2));

if (failures.length) {
  console.error(`ARCHITECTURE GATE FAILED: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`ARCHITECTURE GATE PASSED (${mode}, schema v2)`);
