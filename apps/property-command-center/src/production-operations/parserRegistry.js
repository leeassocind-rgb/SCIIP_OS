const PARSER_REGISTRY = Object.freeze({
  AIR_SUPERSHEET_PARSER_V1: { formats: ['.pdf'], status: 'ROUTABLE', outputModel: ['PROPERTY_CANDIDATE','LISTING_OBSERVATION','EVIDENCE'] },
  MARKET_INTELLIGENCE_PARSER_V1: { formats: ['.pdf'], status: 'ROUTABLE', outputModel: ['MARKET_EVENT','MARKET_METRIC','EVIDENCE'] },
  PROPERTY_BROCHURE_PARSER_V1: { formats: ['.pdf'], status: 'ROUTABLE', outputModel: ['PROPERTY_CANDIDATE','PROPERTY_ATTRIBUTE','EVIDENCE'] },
  SITE_SURVEY_PARSER_V1: { formats: ['.pdf','.xlsx'], status: 'ROUTABLE', outputModel: ['SURVEY','PROPERTY_CANDIDATE','EVIDENCE'] },
  PROPERTY_TABULAR_PARSER_V1: { formats: ['.csv','.xls','.xlsx'], status: 'ROUTABLE', outputModel: ['PROPERTY_CANDIDATE','LISTING_OBSERVATION','COMPARABLE','EVIDENCE'] },
  MASTER_DATASET_PARSER_V1: { formats: ['.csv','.xls','.xlsx'], status: 'ROUTABLE', outputModel: ['CANONICAL_PROPERTY','REFERENCE_ENTITY','EVIDENCE'] },
  GIS_REFERENCE_PARSER_V1: { formats: ['.csv','.xls','.xlsx'], status: 'ROUTABLE', outputModel: ['ADDRESS_POINT','GEOMETRY','REFERENCE_ENTITY','EVIDENCE'] },
  GEOSPATIAL_PARSER_V1: { formats: ['.kmz','.kml'], status: 'ROUTABLE', outputModel: ['GEOMETRY','PROPERTY_CANDIDATE','EVIDENCE'] },
  ARCHIVE_EXPANSION_PARSER_V1: { formats: ['.zip'], status: 'CONTAINER_ONLY', outputModel: ['CHILD_SOURCE'] },
  RESEARCH_REPORT_PARSER_V1: { formats: ['.pdf'], status: 'ROUTABLE', outputModel: ['RESEARCH_FACT','EVIDENCE'] },
  PDF_REVIEW_PARSER_V1: { formats: ['.pdf'], status: 'REVIEW_REQUIRED', outputModel: ['EVIDENCE'] },
  MANUAL_REVIEW: { formats: [], status: 'REVIEW_REQUIRED', outputModel: ['EVIDENCE'] }
});

export function getParserRoute(source = {}) {
  const parserId = source.parserId || 'MANUAL_REVIEW';
  const route = PARSER_REGISTRY[parserId] || PARSER_REGISTRY.MANUAL_REVIEW;
  return { parserId, ...route };
}
export function routeSources(sources = []) {
  return sources.map(source => ({ ...source, parserRoute: getParserRoute(source) }));
}
export function getParserRegistry() { return PARSER_REGISTRY; }
