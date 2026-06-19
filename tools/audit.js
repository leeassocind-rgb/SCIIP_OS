const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const TARGET_DIRS = ["src", "processors", "dashboard", "tools", "scripts"];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).flatMap(file => {
    const full = path.join(dir, file);
    return fs.statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function findFunctions(content) {
  const matches = [...content.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(/g)];
  return matches.map(m => m[1]);
}

function findGlobals(content) {
  const matches = [...content.matchAll(/\b(?:const|let|var)\s+([A-Z][A-Z0-9_]+)\s*=/g)];
  return matches.map(m => m[1]);
}

const files = TARGET_DIRS
  .flatMap(d => walk(path.join(ROOT, d)))
  .filter(f => /\.(gs|js)$/.test(f));

const functions = {};
const globals = {};

files.forEach(file => {
  const content = read(file);

  findFunctions(content).forEach(fn => {
    functions[fn] = functions[fn] || [];
    functions[fn].push(file);
  });

  findGlobals(content).forEach(g => {
    globals[g] = globals[g] || [];
    globals[g].push(file);
  });
});

const duplicateFunctions = Object.entries(functions).filter(([_, files]) => files.length > 1);
const duplicateGlobals = Object.entries(globals).filter(([_, files]) => files.length > 1);

console.log("");
console.log("SCIIP AUDIT");
console.log("────────────────────────────");
console.log(`Files:                 ${files.length}`);
console.log(`Functions:             ${Object.keys(functions).length}`);
console.log(`Globals:               ${Object.keys(globals).length}`);
console.log(`Duplicate Functions:   ${duplicateFunctions.length}`);
console.log(`Duplicate Globals:     ${duplicateGlobals.length}`);

if (duplicateFunctions.length) {
  console.log("");
  console.log("Duplicate Functions");
  duplicateFunctions.forEach(([name, locations]) => {
    console.log(`- ${name}`);
    locations.forEach(l => console.log(`  ${path.relative(ROOT, l)}`));
  });
}

if (duplicateGlobals.length) {
  console.log("");
  console.log("Duplicate Globals");
  duplicateGlobals.forEach(([name, locations]) => {
    console.log(`- ${name}`);
    locations.forEach(l => console.log(`  ${path.relative(ROOT, l)}`));
  });
}
