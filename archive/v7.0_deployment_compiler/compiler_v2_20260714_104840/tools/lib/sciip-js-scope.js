"use strict";

function declarationDepths(source) {
  const depths = new Int32Array(source.length + 1);
  let depth = 0;
  let state = "code";
  let quote = "";
  let escaped = false;

  for (let i = 0; i < source.length; i += 1) {
    depths[i] = depth;
    const ch = source[i];
    const next = source[i + 1];

    if (state === "lineComment") {
      if (ch === "\n") state = "code";
      continue;
    }
    if (state === "blockComment") {
      if (ch === "*" && next === "/") { state = "code"; i += 1; depths[i] = depth; }
      continue;
    }
    if (state === "string") {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === quote) { state = "code"; quote = ""; }
      continue;
    }
    if (state === "template") {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === "`") state = "code";
      continue;
    }

    if (ch === "/" && next === "/") { state = "lineComment"; i += 1; depths[i] = depth; continue; }
    if (ch === "/" && next === "*") { state = "blockComment"; i += 1; depths[i] = depth; continue; }
    if (ch === "'" || ch === '"') { state = "string"; quote = ch; continue; }
    if (ch === "`") { state = "template"; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") depth = Math.max(0, depth - 1);
  }
  depths[source.length] = depth;
  return depths;
}

function topLevelFunctionNames(source) {
  const depths = declarationDepths(source);
  const names = [];
  const re = /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g;
  for (const match of source.matchAll(re)) {
    if (depths[match.index] === 0) names.push(match[1]);
  }
  return names;
}

function topLevelVarDeclarations(source) {
  const depths = declarationDepths(source);
  const declarations = [];
  const re = /^\s*var\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+)/gm;
  for (const match of source.matchAll(re)) {
    const varIndex = match.index + match[0].indexOf("var");
    if (depths[varIndex] === 0) declarations.push({ name: match[1], expression: match[2].trim() });
  }
  return declarations;
}

module.exports = { declarationDepths, topLevelFunctionNames, topLevelVarDeclarations };
