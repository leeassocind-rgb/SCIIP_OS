import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const stableId = (prefix, value) =>
  `${prefix}-${crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 20)}`;

const safeStat = file => {
  try { return fs.statSync(file); } catch { return null; }
};

function inspectCsv(file) {
  const fd = fs.openSync(file, 'r');
  const buffer = Buffer.alloc(65536);
  const bytes = fs.readSync(fd, buffer, 0, buffer.length, 0);
  fs.closeSync(fd);
  const text = buffer.subarray(0, bytes).toString('utf8');
  const first = text.split(/\r?\n/)[0] || '';
  const delimiter = first.includes('\t') ? '\t' : first.includes('|') ? '|' : ',';
  return { adapter: 'CSV_SCHEMA_INSPECTOR_V1', columns: first.split(delimiter).map(v => v.trim()).filter(Boolean), sampleBytes: bytes };
}

function inspectPdf(file) {
  const buffer = fs.readFileSync(file);
  const head = buffer.subarray(0, Math.min(buffer.length, 2_000_000)).toString('latin1');
  const pageMarkers = (head.match(/\/Type\s*\/Page\b/g) || []).length;
  return {
    adapter: 'PDF_STRUCTURE_INSPECTOR_V1',
    pdfHeader: head.startsWith('%PDF-'),
    estimatedPages: pageMarkers || null,
    textLayerSignals: (head.match(/\bBT\b/g) || []).length,
    encrypted: /\/Encrypt\b/.test(head)
  };
}

function inspectZipLike(file, adapter) {
  const buffer = fs.readFileSync(file);
  let offset = 0;
  const entries = [];
  while (offset + 30 <= buffer.length && entries.length < 10000) {
    const sig = buffer.readUInt32LE(offset);
    if (sig !== 0x04034b50) { offset += 1; continue; }
    const flags = buffer.readUInt16LE(offset + 6);
    const method = buffer.readUInt16LE(offset + 8);
    const compSize = buffer.readUInt32LE(offset + 18);
    const nameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const name = buffer.subarray(nameStart, nameStart + nameLen).toString('utf8');
    entries.push({ name, compressionMethod: method, flags });
    offset = nameStart + nameLen + extraLen + compSize;
  }
  return { adapter, entries, entryCount: entries.length, truncated: entries.length >= 10000 };
}

function inspectXlsx(file) {
  const result = inspectZipLike(file, 'XLSX_PACKAGE_INSPECTOR_V1');
  const sheets = result.entries.filter(e => /^xl\/worksheets\/sheet\d+\.xml$/i.test(e.name)).map(e => e.name);
  return { ...result, sheets, sheetCount: sheets.length };
}

function inspectLegacyXls(file) {
  const stat = fs.statSync(file);
  return { adapter: 'XLS_BINARY_INSPECTOR_V1', binaryContainer: true, bytes: stat.size, requiresBinaryParser: true };
}

function inspectKml(file) {
  const text = fs.readFileSync(file, 'utf8');
  return {
    adapter: 'KML_STRUCTURE_INSPECTOR_V1',
    placemarkCount: (text.match(/<Placemark\b/gi) || []).length,
    coordinateBlocks: (text.match(/<coordinates\b/gi) || []).length
  };
}

export function inspectSource(source) {
  const file = source.path;
  const stat = safeStat(file);
  const base = {
    extractionId: stableId('EXT', `${source.sha256 || file}|${source.parserId || ''}`),
    sourceId: source.sourceId || stableId('SRC', source.sha256 || file),
    sourcePath: file,
    sourceSha256: source.sha256 || null,
    parserId: source.parserId,
    documentClass: source.documentClass,
    parserVersion: 'v1',
    status: 'INSPECTED',
    inspectedAt: new Date().toISOString(),
    bytes: stat?.size ?? source.size ?? source.bytes ?? null,
    evidenceMode: 'NON_DESTRUCTIVE_STRUCTURE_ONLY'
  };

  if (!stat || !stat.isFile()) return { ...base, status: 'FAILED', error: 'SOURCE_NOT_FOUND' };

  try {
    const ext = String(source.extension || path.extname(file)).toLowerCase();
    let inspection;
    if (ext === '.csv') inspection = inspectCsv(file);
    else if (ext === '.pdf') inspection = inspectPdf(file);
    else if (ext === '.xlsx') inspection = inspectXlsx(file);
    else if (ext === '.xls') inspection = inspectLegacyXls(file);
    else if (ext === '.zip') inspection = inspectZipLike(file, 'ZIP_CONTAINER_INSPECTOR_V1');
    else if (ext === '.kmz') inspection = inspectZipLike(file, 'KMZ_PACKAGE_INSPECTOR_V1');
    else if (ext === '.kml') inspection = inspectKml(file);
    else inspection = { adapter: 'GENERIC_FILE_INSPECTOR_V1' };
    return { ...base, inspection };
  } catch (error) {
    return { ...base, status: 'FAILED', error: String(error?.message || error) };
  }
}

export function inspectSources(sources = []) {
  return sources.map(inspectSource);
}
