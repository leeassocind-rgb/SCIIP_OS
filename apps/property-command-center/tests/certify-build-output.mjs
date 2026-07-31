import path from 'node:path';
import {
  analyzeBuildAssets,
  evaluateBuildAssetBudget,
  writeBuildAssetManifest
} from '../src/production-hardening/build/index.js';

const app = process.cwd();
const analysis = analyzeBuildAssets({ distDirectory: path.join(app, 'dist') });
const certification = evaluateBuildAssetBudget(analysis);
const outputFile = path.resolve(app, '../../reports/production-hardening/build-asset-manifest.json');
writeBuildAssetManifest({ analysis, certification, outputFile });

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE4_SPRINT47_BUILD_OUTPUT_CERTIFICATION',
  status: certification.passed ? 'PASSED' : 'FAILED',
  result: { outputFile, ...certification.metrics, gates: certification.gates }
}, null, 2));

if (!certification.passed) process.exit(1);
