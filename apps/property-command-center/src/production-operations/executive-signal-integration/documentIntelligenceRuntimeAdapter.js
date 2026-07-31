import { createProductionCorpusService } from '../productionCorpusService.js';
import { classifySources } from '../documentClassifier.js';
import { registerDocumentIntelligenceSignalTypes } from './documentIntelligenceSignalDefinitions.js';
import { mapDocumentIntelligenceToExecutiveSignals } from './documentIntelligenceSignalMapper.js';

export function createDocumentIntelligenceRuntimeAdapter({ signalBus, corpusService = createProductionCorpusService(), maxHistory = 100 } = {}) {
  registerDocumentIntelligenceSignalTypes();
  const history = [];
  const seen = new Set();
  let processed = 0, published = 0, duplicatesIgnored = 0, started = true;

  const process = input => {
    if (!started) throw new Error('Document Intelligence Runtime Adapter is stopped');
    const operationId = input?.operationId || input?.batchId;
    if (!operationId) throw new Error('Document intelligence operation id is required');
    if (seen.has(operationId)) {
      duplicatesIgnored++;
      return Object.freeze({ status: 'DUPLICATE_IGNORED', operationId });
    }
    seen.add(operationId);

    const corpus = corpusService.register(input.entries || [], { batchId: input.batchId || operationId, discoveredAt: input.occurredAt });
    const classifications = classifySources(corpus.sources);
    const evidenceRecords = [];
    for (const extraction of input.extractions || []) {
      const record = corpusService.evidence.append({
        evidenceId: extraction.evidenceId,
        sourceId: extraction.sourceId,
        field: extraction.field,
        value: extraction.value,
        locator: extraction.locator,
        extractionMethod: extraction.extractionMethod || 'PARSER',
        confidence: extraction.confidence,
        parserVersion: extraction.parserVersion,
        recordedAt: extraction.recordedAt
      });
      evidenceRecords.push(record);
    }

    const signals = mapDocumentIntelligenceToExecutiveSignals({
      operationId,
      assignmentId: input.assignmentId || null,
      propertyId: input.propertyId || null,
      occurredAt: input.occurredAt || new Date().toISOString(),
      corpus,
      classifications,
      evidenceRecords
    });
    const publications = signals.map(signal => {
      const publication = signalBus?.publish ? signalBus.publish(signal) : null;
      if (publication) published++;
      return Object.freeze({ status: publication ? 'PUBLISHED' : 'ADAPTER_READY', signal, publication });
    });

    const record = Object.freeze({
      id: `document-intelligence-runtime-adapter:${operationId}`,
      operationId, corpus, classifications: Object.freeze(classifications), evidenceRecords: Object.freeze(evidenceRecords),
      signals, publications, metrics: corpusService.metrics(), readOnly: true, appendOnlyEvidence: true,
      autonomousConsequentialActions: 'BLOCKED'
    });
    history.push(record);
    while (history.length > maxHistory) history.shift();
    processed++;
    return record;
  };

  return Object.freeze({
    process,
    getHistory: () => Object.freeze([...history]),
    snapshot: () => Object.freeze({
      status: started ? 'OPERATIONAL' : 'STOPPED', processed, published, duplicatesIgnored,
      retainedRecords: history.length, signalBusIntegrated: Boolean(signalBus?.publish),
      evidenceLedgerSize: corpusService.evidence.size(), readOnly: true, appendOnlyEvidence: true,
      autonomousConsequentialActions: 'BLOCKED'
    }),
    stop() { started = false; },
    start() { started = true; }
  });
}
