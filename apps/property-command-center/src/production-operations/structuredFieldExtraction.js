import crypto from 'node:crypto';

const stableId = (prefix, value) =>
  `${prefix}-${crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 20)}`;

const FIELD_SCHEMAS = Object.freeze({
  SUPERSHEET_DAILY: [
    'address','city','state','postalCode','availableSf','buildingSf','landAcres',
    'clearHeightFt','dockHighDoors','gradeLevelDoors','powerAmps','askingRate',
    'availabilityDate','brokerName','brokerPhone'
  ],
  MARKET_REPORT: [
    'market','submarket','period','vacancyPct','availabilityPct','netAbsorptionSf',
    'underConstructionSf','deliveriesSf','askingRate','marketCommentary'
  ],
  PROPERTY_EXPORT: [
    'address','city','state','postalCode','apn','buildingSf','availableSf',
    'landAcres','clearHeightFt','dockHighDoors','gradeLevelDoors','powerAmps',
    'askingRate','latitude','longitude'
  ],
  MASTER_DATASET: [
    'address','city','state','postalCode','apn','buildingSf','landAcres',
    'latitude','longitude','canonicalPropertyId'
  ],
  GIS_REFERENCE_DATASET: [
    'address','city','state','postalCode','latitude','longitude','parcelId'
  ],
  GEOSPATIAL_EXPORT: [
    'name','latitude','longitude','geometryType'
  ]
});

export function getFieldSchema(documentClass) {
  return FIELD_SCHEMAS[documentClass] || [];
}

export function extractStructuredFields(evidenceRecord = {}) {
  const schema = getFieldSchema(evidenceRecord.documentClass);
  const inspection = evidenceRecord.inspection || {};
  const fields = [];

  if (Array.isArray(inspection.columns)) {
    const normalizedColumns = new Map(
      inspection.columns.map(column => [
        String(column).toLowerCase().replace(/[^a-z0-9]/g, ''),
        column
      ])
    );

    for (const fieldName of schema) {
      const key = fieldName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedColumns.has(key)) {
        fields.push({
          fieldEvidenceId: stableId('FLD', `${evidenceRecord.evidenceId}|${fieldName}`),
          fieldName,
          rawValue: null,
          normalizedValue: null,
          sourceLocator: {
            type: 'COLUMN',
            value: normalizedColumns.get(key)
          },
          extractionStatus: 'SCHEMA_MATCHED_VALUE_NOT_YET_PARSED',
          confidence: 0.75
        });
      }
    }
  }

  return {
    extractionRecordId: stableId('SFE', evidenceRecord.evidenceId),
    evidenceId: evidenceRecord.evidenceId,
    documentClass: evidenceRecord.documentClass,
    parserId: evidenceRecord.parserId,
    schemaVersion: 'v1',
    schema,
    matchedFieldCount: fields.length,
    fields,
    status: fields.length > 0 ? 'PARTIALLY_EXTRACTED' : 'SCHEMA_REGISTERED'
  };
}

export function extractAllStructuredFields(evidenceRecords = []) {
  return evidenceRecords.map(extractStructuredFields);
}
