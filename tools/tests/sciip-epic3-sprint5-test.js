#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..', '..');
const base = path.join(repo, 'src', 'applications', 'relationship-intelligence');
const files = [
  'SCIIP_Relationship_Intelligence_Engine.gs',
  'SCIIP_Relationship_Intelligence_Persistence.gs',
  'SCIIP_Relationship_Intelligence_AI_Bridge.gs',
  'SCIIP_Relationship_Intelligence_Application.gs',
  'SCIIP_Epic3_Sprint5_Tests.gs'
];

const context = {
  console,
  Date,
  JSON,
  Math,
  Number,
  String,
  Object,
  Array,
  isFinite
};
vm.createContext(context);

for (const file of files) {
  const full = path.join(base, file);
  if (!fs.existsSync(full)) throw new Error(`Missing Sprint 5 file: ${file}`);
  vm.runInContext(fs.readFileSync(full, 'utf8'), context, { filename: file });
}

const result = context.sciipTestV7Epic3Sprint5();
console.log(JSON.stringify(result));
if (result.status !== 'PASSED') process.exit(1);
