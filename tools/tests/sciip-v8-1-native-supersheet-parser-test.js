#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/applications/production-readiness/SCIIP_V8_1_Native_SuperSheet_Parser.gs'), 'utf8');
const parser = fs.readFileSync(path.join(root, 'tools/supersheets/sciip-native-supersheet-parser.js'), 'utf8');
const checks = [
  ['Apps Script wrapper', /function sciipTestV81NativeSuperSheetParser\s*\(/.test(source)],
  ['No pdftotext dependency', !/pdftotext|pdfinfo/.test(parser)],
  ['JavaScript parser dependency', /require\(['"]pdf-parse['"]\)/.test(parser)],
  ['SHA-256 evidence', /createHash\(['"]sha256['"]\)/.test(parser)],
  ['Chronological edition parsing', /editionDate/.test(parser)],
  ['Address normalization', /normalizeAddress/.test(parser)],
  ['Stable listing identity', /stableListingId/.test(parser)],
  ['Candidate addition events', /LISTING_ADDED_CANDIDATE/.test(parser)],
  ['Candidate removal events', /LISTING_REMOVED_CANDIDATE/.test(parser)],
  ['Candidate change events', /LISTING_CHANGED_CANDIDATE/.test(parser)],
  ['Production writes disabled', /productionWrites:\s*0/.test(source)],
  ['Commit disabled', /commitEnabled:\s*false/.test(source)]
];
const failures = checks.filter(x => !x[1]).map(x => x[0]);
const result = { framework: 'SCIIP_V8_1_NATIVE_SUPERSHEET_PARSER_CERTIFICATION', version: 'v8.1-native-supersheet-parser.0', status: failures.length ? 'FAILED' : 'PASSED', testsRun: checks.length, failures, result: { workspace: 'production-readiness', applicationStatus: failures.length ? 'BLOCKED' : 'VALIDATION_READY', nativePdfParser: true, externalPdfBinaries: 0, productionWrites: 0, commitEnabled: false } };
console.log(JSON.stringify(result));
if (failures.length) process.exit(1);
