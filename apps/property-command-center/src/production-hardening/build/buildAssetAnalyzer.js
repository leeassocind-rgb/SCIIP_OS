import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const freeze = value => Object.freeze(value);

const walk = directory => {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
};

const gzipBytes = file => zlib.gzipSync(fs.readFileSync(file), { level: 9 }).byteLength;

export function analyzeBuildAssets({ distDirectory, generatedAt = new Date().toISOString() } = {}) {
  if (!distDirectory) throw new Error('Build distribution directory is required');
  if (!fs.existsSync(distDirectory)) throw new Error(`Build directory not found: ${distDirectory}`);

  const assets = walk(distDirectory)
    .map(file => {
      const relativePath = path.relative(distDirectory, file).replaceAll('\\', '/');
      const bytes = fs.statSync(file).size;
      const extension = path.extname(file).toLowerCase();
      const kind =
        extension === '.js' ? 'JAVASCRIPT' :
        extension === '.css' ? 'CSS' :
        extension === '.html' ? 'HTML' : 'ASSET';
      return freeze({ file: relativePath, kind, bytes, gzipBytes: gzipBytes(file) });
    })
    .sort((a, b) => b.bytes - a.bytes || a.file.localeCompare(b.file));

  const javascript = assets.filter(item => item.kind === 'JAVASCRIPT');
  const css = assets.filter(item => item.kind === 'CSS');
  const html = assets.filter(item => item.kind === 'HTML');
  const signatures = new Map();

  for (const item of assets) {
    const signature = `${item.bytes}:${item.gzipBytes}`;
    if (!signatures.has(signature)) signatures.set(signature, []);
    signatures.get(signature).push(item.file);
  }

  const duplicateContent = [...signatures.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([signature, files]) => freeze({ signature, files: freeze(files) }));

  return freeze({
    generatedAt,
    distDirectory,
    assets: freeze(assets),
    counts: freeze({
      total: assets.length,
      javascript: javascript.length,
      css: css.length,
      html: html.length,
      other: assets.length - javascript.length - css.length - html.length
    }),
    totals: freeze({
      bytes: assets.reduce((sum, item) => sum + item.bytes, 0),
      gzipBytes: assets.reduce((sum, item) => sum + item.gzipBytes, 0),
      javascriptBytes: javascript.reduce((sum, item) => sum + item.bytes, 0),
      javascriptGzipBytes: javascript.reduce((sum, item) => sum + item.gzipBytes, 0),
      cssBytes: css.reduce((sum, item) => sum + item.bytes, 0),
      cssGzipBytes: css.reduce((sum, item) => sum + item.gzipBytes, 0),
      shellGzipBytes: assets.filter(item => ['JAVASCRIPT','CSS','HTML'].includes(item.kind)).reduce((sum, item) => sum + item.gzipBytes, 0),
      staticAssetGzipBytes: assets.filter(item => item.kind === 'ASSET').reduce((sum, item) => sum + item.gzipBytes, 0)
    }),
    largestAssets: freeze(assets.slice(0, 10)),
    duplicateContent: freeze(duplicateContent),
    manifestVersion: '1.0.0'
  });
}

export function evaluateBuildAssetBudget(analysis, {
  maximumShellGzipKb = 220,
  maximumStaticAssetGzipKb = 10240,
  maximumEntryGzipKb = 80,
  maximumVendorReactGzipKb = 75,
  maximumCssGzipKb = 20,
  maximumDuplicateGroups = 20,
  minimumJavaScriptChunks = 12
} = {}) {
  const kb = bytes => bytes / 1024;
  const entry = analysis.assets.find(item => item.kind === 'JAVASCRIPT' && item.file.startsWith('assets/index-'));
  const vendorReact = analysis.assets.find(item => item.file.includes('vendor-react'));
  const gates = freeze({
    shellGzip: kb(analysis.totals.shellGzipBytes) <= maximumShellGzipKb,
    staticAssetGzip: kb(analysis.totals.staticAssetGzipBytes) <= maximumStaticAssetGzipKb,
    entryGzip: !entry || kb(entry.gzipBytes) <= maximumEntryGzipKb,
    vendorReactGzip: !vendorReact || kb(vendorReact.gzipBytes) <= maximumVendorReactGzipKb,
    cssGzip: kb(analysis.totals.cssGzipBytes) <= maximumCssGzipKb,
    duplicateGroups: analysis.duplicateContent.length <= maximumDuplicateGroups,
    codeSplitting: analysis.counts.javascript >= minimumJavaScriptChunks
  });
  const passed = Object.values(gates).every(Boolean);

  return freeze({
    passed,
    status: passed ? 'BUILD_OPTIMIZATION_CERTIFIED' : 'BUILD_BUDGET_EXCEEDED',
    gates,
    metrics: freeze({
      shellGzipKb: Number(kb(analysis.totals.shellGzipBytes).toFixed(2)),
      staticAssetGzipKb: Number(kb(analysis.totals.staticAssetGzipBytes).toFixed(2)),
      totalGzipKb: Number(kb(analysis.totals.gzipBytes).toFixed(2)),
      entryGzipKb: Number(kb(entry?.gzipBytes || 0).toFixed(2)),
      vendorReactGzipKb: Number(kb(vendorReact?.gzipBytes || 0).toFixed(2)),
      cssGzipKb: Number(kb(analysis.totals.cssGzipBytes).toFixed(2)),
      duplicateGroups: analysis.duplicateContent.length,
      javascriptChunks: analysis.counts.javascript
    })
  });
}

export function writeBuildAssetManifest({ analysis, certification, outputFile } = {}) {
  if (!outputFile) throw new Error('Build asset manifest output file is required');
  const manifest = freeze({
    framework: 'SCIIP_BUILD_ASSET_MANIFEST',
    version: '1.0.0',
    generatedAt: analysis.generatedAt,
    certification,
    analysis
  });
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
