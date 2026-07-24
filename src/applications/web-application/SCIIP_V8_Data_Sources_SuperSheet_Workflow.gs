var SCIIP_V8_DATA_SOURCES_SUPERSHEET_WORKFLOW = (function () {
  'use strict';

  var VERSION = 'v8.0-sprint2.0';
  var FRAMEWORK = 'SCIIP_V8_SPRINT2_DATA_SOURCES_SUPERSHEET_UPLOAD_SCHEMA_MAPPING';
  var STAGES = [
    'READY_FOR_UPLOAD',
    'SOURCE_REGISTERED',
    'SOURCE_RECOGNIZED',
    'SCHEMA_DETECTED',
    'MAPPING_READY',
    'VALIDATION_PREVIEW_READY',
    'REVIEW_REQUIRED'
  ];

  var CANONICAL_FIELDS = [
    { field: 'property_id', label: 'Property ID', type: 'STRING', required: false, aliases: ['property id', 'property_id', 'building id', 'asset id'] },
    { field: 'address', label: 'Address', type: 'STRING', required: true, aliases: ['address', 'property address', 'street address', 'site address'] },
    { field: 'city', label: 'City', type: 'STRING', required: true, aliases: ['city', 'municipality'] },
    { field: 'state', label: 'State', type: 'STRING', required: false, aliases: ['state', 'province'] },
    { field: 'zip', label: 'ZIP', type: 'STRING', required: false, aliases: ['zip', 'zip code', 'postal code'] },
    { field: 'available_sf', label: 'Available SF', type: 'NUMBER', required: false, aliases: ['available sf', 'available_sf', 'vacant sf', 'size sf', 'square feet'] },
    { field: 'building_sf', label: 'Building SF', type: 'NUMBER', required: false, aliases: ['building sf', 'building_sf', 'total sf', 'building size'] },
    { field: 'clear_height', label: 'Clear Height', type: 'NUMBER', required: false, aliases: ['clear height', 'clear ht', 'clear_height'] },
    { field: 'dock_high_doors', label: 'Dock High Doors', type: 'NUMBER', required: false, aliases: ['dh', 'dock high', 'dock high doors', 'dock doors'] },
    { field: 'power_amps', label: 'Power Amps', type: 'NUMBER', required: false, aliases: ['power amps', 'power', 'amps', 'power_amps'] },
    { field: 'latitude', label: 'Latitude', type: 'NUMBER', required: false, aliases: ['latitude', 'lat'] },
    { field: 'longitude', label: 'Longitude', type: 'NUMBER', required: false, aliases: ['longitude', 'lng', 'lon'] },
    { field: 'status', label: 'Status', type: 'STRING', required: false, aliases: ['status', 'availability status'] },
    { field: 'company_name', label: 'Company', type: 'STRING', required: false, aliases: ['company', 'company name', 'tenant', 'occupant'] }
  ];

  function clone_(value) { return JSON.parse(JSON.stringify(value)); }
  function now_() { return new Date().toISOString(); }
  function normalize_(value) {
    return String(value || '').toLowerCase().replace(/[_\-]+/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  }
  function token_(prefix, value) {
    return prefix + '-' + String(value || now_()).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  }
  function stageIndex_(stage) { return STAGES.indexOf(stage); }

  function createWorkflow() {
    return {
      framework: FRAMEWORK,
      version: VERSION,
      workflowId: token_('WORKFLOW', now_()),
      stage: 'READY_FOR_UPLOAD',
      revision: 1,
      source: null,
      recognition: null,
      schema: null,
      mapping: null,
      validation: null,
      reviewRequired: true,
      destructiveCommitEnabled: false,
      lineagePreserved: true,
      createdAt: now_(),
      updatedAt: now_()
    };
  }

  function advance_(workflow, stage) {
    var next = clone_(workflow || createWorkflow());
    if (stageIndex_(stage) < stageIndex_(next.stage)) throw new Error('Workflow stage regression blocked.');
    next.stage = stage;
    next.revision += 1;
    next.updatedAt = now_();
    return next;
  }

  function registerSource(workflow, upload) {
    upload = upload || {};
    if (!upload.filename) throw new Error('filename is required');
    var next = advance_(workflow, 'SOURCE_REGISTERED');
    next.source = {
      sourceId: upload.sourceId || token_('SOURCE', upload.filename),
      batchId: upload.batchId || token_('BATCH', upload.filename + '-' + now_()),
      filename: upload.filename,
      mimeType: upload.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sizeBytes: Number(upload.sizeBytes || 0),
      sheetNames: clone_(upload.sheetNames || ['Sheet1']),
      headers: clone_(upload.headers || []),
      sampleRows: clone_(upload.sampleRows || []),
      rowsDiscovered: Number(upload.rowsDiscovered || 0),
      uploadedAt: upload.uploadedAt || now_(),
      checksum: upload.checksum || token_('CHECKSUM', upload.filename + '-' + upload.sizeBytes),
      status: 'REGISTERED'
    };
    return next;
  }

  function recognizeSource(workflow) {
    if (!workflow || !workflow.source) throw new Error('Source must be registered first.');
    var filename = normalize_(workflow.source.filename);
    var headers = workflow.source.headers.map(normalize_);
    var propertySignals = ['address', 'city', 'building sf', 'available sf', 'clear height'];
    var companySignals = ['company', 'tenant', 'industry', 'contact'];
    var propertyHits = propertySignals.filter(function (x) { return headers.indexOf(x) >= 0; }).length;
    var companyHits = companySignals.filter(function (x) { return headers.indexOf(x) >= 0; }).length;
    var sourceType = propertyHits >= companyHits ? 'PROPERTY_SUPERSHEET' : 'COMPANY_SUPERSHEET';
    if (filename.indexOf('comp') >= 0) sourceType = 'COMPARABLES_SUPERSHEET';
    var confidence = Math.min(0.99, 0.55 + Math.max(propertyHits, companyHits) * 0.08);
    var next = advance_(workflow, 'SOURCE_RECOGNIZED');
    next.recognition = {
      sourceType: sourceType,
      confidence: Number(confidence.toFixed(2)),
      evidence: { propertySignals: propertyHits, companySignals: companyHits, filenameSignal: filename },
      automatic: confidence >= 0.7,
      reviewRequired: confidence < 0.85
    };
    return next;
  }

  function detectSchema(workflow) {
    if (!workflow || !workflow.recognition) throw new Error('Source must be recognized first.');
    var headers = workflow.source.headers || [];
    var sampleRows = workflow.source.sampleRows || [];
    var columns = headers.map(function (header, index) {
      var samples = sampleRows.map(function (row) { return row[index]; }).filter(function (v) { return v !== null && v !== ''; });
      var numeric = samples.length > 0 && samples.every(function (v) { return !isNaN(Number(String(v).replace(/[$,%]/g, '').replace(/,/g, ''))); });
      return {
        index: index,
        sourceHeader: header,
        normalizedHeader: normalize_(header),
        inferredType: numeric ? 'NUMBER' : 'STRING',
        sampleValues: samples.slice(0, 3),
        nullRate: sampleRows.length ? Number(((sampleRows.length - samples.length) / sampleRows.length).toFixed(3)) : 0
      };
    });
    var next = advance_(workflow, 'SCHEMA_DETECTED');
    next.schema = {
      columns: columns,
      columnCount: columns.length,
      sampleRowCount: sampleRows.length,
      detectedAt: now_()
    };
    return next;
  }

  function suggestMapping(workflow) {
    if (!workflow || !workflow.schema) throw new Error('Schema must be detected first.');
    var mappings = workflow.schema.columns.map(function (column) {
      var best = null;
      var bestScore = 0;
      CANONICAL_FIELDS.forEach(function (field) {
        var source = column.normalizedHeader;
        field.aliases.forEach(function (alias) {
          var normalizedAlias = normalize_(alias);
          var score = source === normalizedAlias ? 1 : (source.indexOf(normalizedAlias) >= 0 || normalizedAlias.indexOf(source) >= 0 ? 0.82 : 0);
          if (score > bestScore) { bestScore = score; best = field; }
        });
      });
      return {
        sourceHeader: column.sourceHeader,
        canonicalField: best ? best.field : null,
        canonicalLabel: best ? best.label : 'Unmapped',
        confidence: Number(bestScore.toFixed(2)),
        inferredType: column.inferredType,
        targetType: best ? best.type : null,
        status: bestScore >= 0.8 ? 'AUTO_MAPPED' : 'REVIEW_REQUIRED'
      };
    });
    var mapped = mappings.filter(function (m) { return m.canonicalField; }).length;
    var next = advance_(workflow, 'MAPPING_READY');
    next.mapping = {
      mappings: mappings,
      mappedColumns: mapped,
      unmappedColumns: mappings.length - mapped,
      coveragePct: mappings.length ? Number((mapped / mappings.length * 100).toFixed(2)) : 0,
      canonicalFields: clone_(CANONICAL_FIELDS),
      manualReviewCount: mappings.filter(function (m) { return m.status === 'REVIEW_REQUIRED'; }).length
    };
    return next;
  }

  function validatePreview(workflow) {
    if (!workflow || !workflow.mapping) throw new Error('Mapping must be ready first.');
    var mappedFields = workflow.mapping.mappings.filter(function (m) { return m.canonicalField; }).map(function (m) { return m.canonicalField; });
    var missingRequired = CANONICAL_FIELDS.filter(function (f) { return f.required && mappedFields.indexOf(f.field) < 0; }).map(function (f) { return f.field; });
    var warnings = [];
    if (workflow.mapping.unmappedColumns) warnings.push('UNMAPPED_COLUMNS');
    if (workflow.mapping.manualReviewCount) warnings.push('LOW_CONFIDENCE_MAPPING');
    if (missingRequired.length) warnings.push('MISSING_REQUIRED_FIELDS');
    var next = advance_(workflow, 'VALIDATION_PREVIEW_READY');
    next.validation = {
      status: missingRequired.length ? 'BLOCKED' : (warnings.length ? 'REVIEW_REQUIRED' : 'PASSED'),
      rowsDiscovered: workflow.source.rowsDiscovered,
      rowsPreviewed: workflow.source.sampleRows.length,
      missingRequiredFields: missingRequired,
      warningCodes: warnings,
      errors: missingRequired.length,
      destructiveCommitEnabled: false,
      commitStatus: 'BLOCKED_PENDING_REVIEW'
    };
    next = advance_(next, 'REVIEW_REQUIRED');
    return next;
  }

  function processUpload(upload) {
    var workflow = createWorkflow();
    workflow = registerSource(workflow, upload);
    workflow = recognizeSource(workflow);
    workflow = detectSchema(workflow);
    workflow = suggestMapping(workflow);
    workflow = validatePreview(workflow);
    return workflow;
  }

  function getWorkspaceModel() {
    return {
      framework: FRAMEWORK,
      version: VERSION,
      workspace: 'data-sources',
      title: 'Data Sources',
      stages: clone_(STAGES),
      acceptedFormats: ['XLSX', 'CSV', 'GOOGLE_SHEET'],
      maximumPreviewRows: 100,
      capabilities: {
        dragAndDropUpload: true,
        sourceRegistration: true,
        automaticSourceRecognition: true,
        schemaDetection: true,
        mappingSuggestions: true,
        manualMapping: true,
        validationPreview: true,
        lineageCapture: true,
        destructiveCommit: false
      }
    };
  }

  function certify() {
    var failures = [];
    var upload = {
      filename: 'Industrial_Property_Supersheet.xlsx',
      sizeBytes: 58423,
      rowsDiscovered: 240,
      sheetNames: ['Properties'],
      headers: ['Property ID', 'Address', 'City', 'Available SF', 'Building SF', 'Clear Ht', 'DH', 'Power Amps', 'Latitude', 'Longitude', 'Status', 'Broker Notes'],
      sampleRows: [
        ['P-100', '100 Logistics Way', 'Rialto', 250000, 500000, 36, 42, 4000, 34.1, -117.3, 'Available', 'Call broker'],
        ['P-101', '200 Commerce Ave', 'Perris', 180000, 340000, 32, 28, 2000, 33.8, -117.2, 'Planned', 'New construction']
      ]
    };
    var result = processUpload(upload);
    var checks = [
      ['WorkspaceModel', getWorkspaceModel().workspace === 'data-sources'],
      ['SourceRegistration', result.source.status === 'REGISTERED'],
      ['SourceRecognition', result.recognition.sourceType === 'PROPERTY_SUPERSHEET'],
      ['RecognitionConfidence', result.recognition.confidence >= 0.7],
      ['SchemaDetection', result.schema.columnCount === 12],
      ['AutomaticMapping', result.mapping.mappedColumns >= 10],
      ['MappingCoverage', result.mapping.coveragePct >= 80],
      ['ValidationPreview', result.validation.rowsDiscovered === 240],
      ['ReviewGate', result.stage === 'REVIEW_REQUIRED'],
      ['GovernanceBlock', result.destructiveCommitEnabled === false && result.validation.commitStatus === 'BLOCKED_PENDING_REVIEW'],
      ['LineagePreserved', result.lineagePreserved === true],
      ['RevisionProgression', result.revision === 7]
    ];
    checks.forEach(function (check) { if (!check[1]) failures.push(check[0]); });
    return {
      framework: FRAMEWORK,
      version: VERSION,
      status: failures.length ? 'FAILED' : 'PASSED',
      testsRun: checks.length,
      failures: failures,
      result: {
        workspace: 'data-sources',
        workflowStatus: 'REVIEW_READY',
        stage: result.stage,
        sourceType: result.recognition.sourceType,
        recognitionConfidence: result.recognition.confidence,
        rowsDiscovered: result.source.rowsDiscovered,
        columnsDetected: result.schema.columnCount,
        mappedColumns: result.mapping.mappedColumns,
        mappingCoveragePct: result.mapping.coveragePct,
        unmappedColumns: result.mapping.unmappedColumns,
        validationStatus: result.validation.status,
        reviewRequired: result.reviewRequired,
        lineagePreserved: result.lineagePreserved,
        destructiveCommitEnabled: result.destructiveCommitEnabled
      }
    };
  }

  return {
    version: VERSION,
    framework: FRAMEWORK,
    createWorkflow: createWorkflow,
    registerSource: registerSource,
    recognizeSource: recognizeSource,
    detectSchema: detectSchema,
    suggestMapping: suggestMapping,
    validatePreview: validatePreview,
    processUpload: processUpload,
    getWorkspaceModel: getWorkspaceModel,
    certify: certify
  };
})();

function sciipV8GetDataSourcesWorkspaceModel() {
  return SCIIP_V8_DATA_SOURCES_SUPERSHEET_WORKFLOW.getWorkspaceModel();
}

function sciipV8ProcessSuperSheetUpload(upload) {
  return SCIIP_V8_DATA_SOURCES_SUPERSHEET_WORKFLOW.processUpload(upload || {});
}

function sciipTestV8Sprint2DataSourcesSuperSheetUploadSchemaMapping() {
  var output = SCIIP_V8_DATA_SOURCES_SUPERSHEET_WORKFLOW.certify();
  Logger.log(JSON.stringify(output));
  return output;
}
