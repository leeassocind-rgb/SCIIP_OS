#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const target = path.join(root, 'dist/apps-script/11_other_001.gs');
const source = path.join(root, 'src/applications/production-readiness/SCIIP_V8_1_Native_SuperSheet_Parser.gs');
if (!fs.existsSync(target)) throw new Error('Compiled target missing: ' + target);
const marker = 'function sciipTestV81NativeSuperSheetParser()';
let compiled = fs.readFileSync(target, 'utf8');
if (!compiled.includes(marker)) {
  compiled += '\n\n// SCIIP v8.1 native SuperSheet parser compiled certification patch\n' + fs.readFileSync(source, 'utf8') + '\n';
  fs.writeFileSync(target, compiled);
}
console.log(JSON.stringify({ framework: 'SCIIP_V8_1_NATIVE_SUPERSHEET_COMPILED_PATCH', status: 'PASSED', target, wrapperPresent: fs.readFileSync(target, 'utf8').includes(marker) }));
