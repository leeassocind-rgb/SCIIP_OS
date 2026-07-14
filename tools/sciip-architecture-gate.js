#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const REPORT_DIR = path.join(ROOT, "governance");
const BASELINE_PATH = path.join(REPORT_DIR, "architecture-baseline.json");
const REPORT_PATH = path.join(REPORT_DIR, "architecture-report.json");

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

function collectDefinitions(files) {
  const functions = new Map();
  const globals = new Map();

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const clean = stripCommentsAndStrings(source);

    for (const match of clean.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
      const name = match[1];
      if (!functions.has(name)) functions.set(name, []);
      functions.get(name).push(rel(file));
    }
    for (const match of clean.matchAll(/^\s*var\s+([A-Za-z_$][\w$]*)\s*=/gm)) {
      const name = match[1];
      if (!globals.has(name)) globals.set(name, []);
      globals.get(name).push(rel(file));
    }
  }

  return { functions, globals };
}

function duplicates(map) {
  return [...map.entries()]
    .filter(([, locations]) => new Set(locations).size > 1)
    .map(([name, locations]) => ({ name, locations: [...new Set(locations)].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const files = walk(SRC).filter((f) => f.endsWith(".gs"));
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
    const number = processorMatch[1];
    if (!processorNumbers.has(number)) processorNumbers.set(number, []);
    processorNumbers.get(number).push(rel(file));
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
const duplicateProcessorNumbers = duplicates(processorNumbers);

const report = {
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
  details: {
    syntaxErrors,
    duplicateFunctions,
    duplicateGlobals,
    duplicateProcessorNumbers,
    placeholders,
    unboundedRanges,
  },
};

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

const mode = process.argv.includes("--strict") ? "strict" : "baseline";
const baseline = fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"))
  : null;

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
    if (report.metrics[key] > baseline.metrics[key]) {
      failures.push(`${key} regressed ${baseline.metrics[key]} -> ${report.metrics[key]}`);
    }
  }
}

console.log(JSON.stringify(report.metrics, null, 2));
if (failures.length) {
  console.error(`ARCHITECTURE GATE FAILED: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`ARCHITECTURE GATE PASSED (${mode})`);
