#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const file = path.join(root, 'package.json');
const p = JSON.parse(fs.readFileSync(file, 'utf8'));
p.scripts = p.scripts || {};
p.scripts['test:v8:native-supersheet'] = 'node tools/tests/sciip-v8-1-native-supersheet-parser-test.js';
p.scripts['profile:v8:native-supersheet'] = 'node tools/supersheets/sciip-native-supersheet-parser.js';
p.scripts['patch:v8:native-supersheet'] = 'node tools/patches/patch-v8-1-native-supersheet-compiled-certification.js';
p.scripts['verify:v8:native-supersheet'] = 'grep -R "function sciipTestV81NativeSuperSheetParser" dist/apps-script';
p.scripts['certify:v8:native-supersheet'] = 'npm run test:v8:native-supersheet && npm run deployment:compile && npm run patch:v8:native-supersheet && npm run verify:v8:native-supersheet';
fs.writeFileSync(file, JSON.stringify(p, null, 2) + '\n');
console.log('Updated package.json for SCIIP v8.1 native SuperSheet parser.');
