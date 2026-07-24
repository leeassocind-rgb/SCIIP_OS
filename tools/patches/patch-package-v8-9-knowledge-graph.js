#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'); const repo=process.argv[2]||process.cwd(); const p=path.join(repo,'package.json');
const j=JSON.parse(fs.readFileSync(p,'utf8')); j.scripts=j.scripts||{};
j.scripts['test:v8:9:knowledge-graph']='node tools/tests/sciip-v8-9-knowledge-graph-population-test.js';
j.scripts['certify:v8:9:knowledge-graph']='npm run test:v8:9:knowledge-graph';
fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');
console.log('Patched package.json for v8.9 knowledge graph certification.');
