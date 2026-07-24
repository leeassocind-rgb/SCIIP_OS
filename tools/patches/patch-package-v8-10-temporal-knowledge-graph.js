#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'); const repo=process.argv[2]||process.cwd(); const p=path.join(repo,'package.json'); const d=JSON.parse(fs.readFileSync(p,'utf8')); d.scripts=d.scripts||{};
d.scripts['supersheets:v8:10:temporal']='node tools/supersheets/sciip-v8-10-temporal-knowledge-graph.js';
d.scripts['test:v8:10:temporal']='node tools/tests/sciip-v8-10-temporal-knowledge-graph-test.js';
d.scripts['certify:v8:10:temporal']='npm run test:v8:10:temporal'; fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
