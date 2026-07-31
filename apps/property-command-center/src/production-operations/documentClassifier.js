const normalize = (value = '') => String(value).toLowerCase();

const CLASSIFIERS = [
  {
    documentClass: 'GIS_REFERENCE_DATASET',
    parserId: 'GIS_REFERENCE_PARSER_V1',
    test: ({ name, path, extension }) =>
      ['.csv', '.xls', '.xlsx'].includes(normalize(extension)) &&
      /(egis|address[_ -]?points?|addressing|geocod|parcel[_ -]?points?)/i.test(`${path} ${name}`),
    confidence: 0.98,
    reason: 'GIS/address reference dataset pattern'
  },
  {
    documentClass: 'MASTER_DATASET',
    parserId: 'MASTER_DATASET_PARSER_V1',
    test: ({ name, path, extension }) =>
      ['.csv', '.xls', '.xlsx'].includes(normalize(extension)) &&
      /(industrial[_ -]?db|master[_ -]?(data|database)|canonical[_ -]?properties|property[_ -]?master)/i.test(`${path} ${name}`),
    confidence: 0.98,
    reason: 'Master/canonical dataset pattern'
  },
  {
    documentClass: 'SUPERSHEET_DAILY',
    parserId: 'AIR_SUPERSHEET_PARSER_V1',
    test: ({ name, path }) =>
      /(air-cre|daily).*supersheets?.*(all-regions|research-listings)/i.test(`${path} ${name}`),
    confidence: 0.99,
    reason: 'AIR/DAILY SuperSheet filename pattern'
  },
  {
    documentClass: 'MARKET_REPORT',
    parserId: 'MARKET_INTELLIGENCE_PARSER_V1',
    test: ({ name, path }) =>
      /market[_ -]?reports?|market insight|industrial market report|insights.*industrial/i.test(`${path} ${name}`),
    confidence: 0.98,
    reason: 'Market-report filename/folder pattern'
  },
  {
    documentClass: 'PROPERTY_BROCHURE',
    parserId: 'PROPERTY_BROCHURE_PARSER_V1',
    test: ({ name, path }) =>
      /brochure|offering memorandum|\bom\b|flyer/i.test(`${path} ${name}`),
    confidence: 0.95,
    reason: 'Brochure/OM filename pattern'
  },
  {
    documentClass: 'SITE_SURVEY',
    parserId: 'SITE_SURVEY_PARSER_V1',
    test: ({ name, path }) =>
      /survey|property comparison|short[- ]?list/i.test(`${path} ${name}`),
    confidence: 0.94,
    reason: 'Survey/comparison filename pattern'
  },
  {
    documentClass: 'PROPERTY_EXPORT',
    parserId: 'PROPERTY_TABULAR_PARSER_V1',
    test: ({ name, path, extension }) =>
      ['.csv', '.xls', '.xlsx'].includes(normalize(extension)) &&
      /property|availability|inventory|comp|report|export|bridge/i.test(`${path} ${name}`),
    confidence: 0.92,
    reason: 'Tabular property/export filename pattern'
  },
  {
    documentClass: 'GEOSPATIAL_EXPORT',
    parserId: 'GEOSPATIAL_PARSER_V1',
    test: ({ extension }) => ['.kmz', '.kml'].includes(normalize(extension)),
    confidence: 0.99,
    reason: 'KMZ/KML extension'
  },
  {
    documentClass: 'ARCHIVE_CONTAINER',
    parserId: 'ARCHIVE_EXPANSION_PARSER_V1',
    test: ({ extension }) => normalize(extension) === '.zip',
    confidence: 0.99,
    reason: 'ZIP extension'
  },
  {
    documentClass: 'RESEARCH_REPORT',
    parserId: 'RESEARCH_REPORT_PARSER_V1',
    test: ({ extension, name, path }) =>
      normalize(extension) === '.pdf' && /research|economic|treasury|white paper/i.test(`${path} ${name}`),
    confidence: 0.85,
    reason: 'Research/economic PDF pattern'
  }
];

const DEFAULT_BY_EXTENSION = {
  '.pdf': {
    documentClass: 'UNCLASSIFIED_PDF',
    parserId: 'PDF_REVIEW_PARSER_V1',
    confidence: 0.50,
    reason: 'PDF without a recognized semantic pattern'
  },
  '.csv': {
    documentClass: 'UNCLASSIFIED_TABULAR',
    parserId: 'PROPERTY_TABULAR_PARSER_V1',
    confidence: 0.55,
    reason: 'CSV without a recognized semantic pattern'
  },
  '.xls': {
    documentClass: 'UNCLASSIFIED_TABULAR',
    parserId: 'PROPERTY_TABULAR_PARSER_V1',
    confidence: 0.55,
    reason: 'XLS without a recognized semantic pattern'
  },
  '.xlsx': {
    documentClass: 'UNCLASSIFIED_TABULAR',
    parserId: 'PROPERTY_TABULAR_PARSER_V1',
    confidence: 0.55,
    reason: 'XLSX without a recognized semantic pattern'
  }
};

export function classifyDocument(source = {}) {
  const candidate = {
    ...source,
    name: source.name || String(source.path || '').split('/').pop() || '',
    extension: normalize(source.extension || '')
  };

  const match = CLASSIFIERS.find(rule => rule.test(candidate));
  const result = match || DEFAULT_BY_EXTENSION[candidate.extension] || {
    documentClass: 'UNKNOWN',
    parserId: 'MANUAL_REVIEW',
    confidence: 0.10,
    reason: 'No semantic or extension rule matched'
  };

  return {
    documentClass: result.documentClass,
    parserId: result.parserId,
    classificationConfidence: result.confidence,
    classificationReason: result.reason,
    reviewRequired: result.confidence < 0.80
  };
}

export function classifySources(sources = []) {
  return sources.map(source => ({ ...source, ...classifyDocument(source) }));
}

export function summarizeClassifications(sources = []) {
  return sources.reduce((summary, source) => {
    const key = source.documentClass || 'UNKNOWN';
    summary[key] = (summary[key] || 0) + 1;
    return summary;
  }, {});
}
