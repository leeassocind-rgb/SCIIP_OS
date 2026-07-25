#!/usr/bin/env node
"use strict";
const assert = require("assert");
const { topLevelFunctionNames, topLevelVarDeclarations } = require("../lib/sciip-js-scope");

const source = `
var SCIIP_RUNTIME = SCIIP_RUNTIME || {};
function publicEntry() {
  var localState = {};
  function countWhere(rows) { return rows.length; }
  return countWhere([]);
}
function secondPublicEntry() { return true; }
`;

assert.deepStrictEqual(topLevelFunctionNames(source), ["publicEntry", "secondPublicEntry"]);
assert.deepStrictEqual(topLevelVarDeclarations(source), [
  { name: "SCIIP_RUNTIME", expression: "SCIIP_RUNTIME || {}" }
]);
console.log("SCIIP architecture scope regression: PASSED");
