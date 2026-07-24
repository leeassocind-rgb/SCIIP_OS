#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');const root=process.argv[2]||process.cwd(),p=path.join(root,'package.json');const j=JSON.parse(fs.readFileSync(p,'utf8'));j.scripts=j.scripts||{};
j.scripts['test:v8:4:supersheet']='node tools/tests/sciip-v8-4-row-aware-cross-edition-identity-test.js';
j.scripts['patch:v8:4:supersheet']='node tools/patches/patch-v8-4-supersheet-compiled-certification.js';
j.scripts['verify:v8:4:supersheet']='grep -R "function sciipTestV84RowAwareCrossEditionIdentity" dist/apps-script';
j.scripts['certify:v8:4:supersheet']='npm run test:v8:4:supersheet && npm run deployment:compile && npm run patch:v8:4:supersheet && npm run verify:v8:4:supersheet';
fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');console.log('Updated package.json for SCIIP v8.4 row-aware cross-edition identity.');
