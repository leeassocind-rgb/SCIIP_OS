import { fingerprintFile } from './sourceFingerprint.js';
import { transitionSource } from './batchStateMachine.js';

const extension = name => String(name || '').split('.').pop()?.toUpperCase() || 'UNKNOWN';
const sourceId = (fingerprint, name) => `SRC-${fingerprint.slice(0, 12)}-${String(name || 'SOURCE').replace(/[^A-Z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 28).toUpperCase()}`;
const batchId = () => `BAT-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export function createBatchOrchestrator({ registry, parse, normalize, validate, actor = 'SCIIP_OPERATOR' }) {
  if (!registry) throw new Error('Source registry is required');
  return Object.freeze({
    async registerFiles(files, context = {}) {
      const createdAt = new Date().toISOString();
      const batch = Object.freeze({
        batchId: batchId(),
        assignmentId: context.assignmentId || null,
        label: context.label || `Production intake ${createdAt.slice(0, 10)}`,
        createdAt,
        updatedAt: createdAt,
        status: 'ACTIVE',
        sourceIds: []
      });
      registry.registerBatch(batch);
      const sources = [];
      for (const file of [...files]) {
        const fingerprint = await fingerprintFile(file);
        const duplicate = registry.findByFingerprint(fingerprint);
        let source = Object.freeze({
          sourceId: sourceId(fingerprint, file.name),
          batchId: batch.batchId,
          assignmentId: context.assignmentId || null,
          fileName: file.name,
          sourceType: extension(file.name),
          sizeBytes: Number(file.size || 0),
          fingerprint,
          reportDate: context.reportDate || null,
          status: 'REGISTERED',
          createdAt,
          updatedAt: createdAt,
          rowCount: 0,
          exceptionCount: 0,
          reviewStatus: 'NOT_STARTED',
          promotionStatus: 'NOT_READY',
          evidenceId: `EVD-${fingerprint.slice(0, 16)}`,
          events: Object.freeze([])
        });
        source = transitionSource(source, 'FINGERPRINTED', { actor });
        if (duplicate) {
          source = transitionSource(source, 'DUPLICATE', { actor, reason: `Matches ${duplicate.sourceId}`, patch: { duplicateOf: duplicate.sourceId } });
        }
        registry.upsertSource(source);
        sources.push(source);
      }
      registry.updateBatch(batch.batchId, { sourceIds: sources.map(source => source.sourceId), updatedAt: new Date().toISOString() });
      return { batch: registry.snapshot().batches.find(item => item.batchId === batch.batchId), sources };
    },

    async processSource(sourceId, file) {
      let source = registry.getSource(sourceId);
      if (!source) throw new Error(`Unknown source ${sourceId}`);
      if (source.status === 'DUPLICATE') return source;
      try {
        const parsed = await parse(file);
        source = transitionSource(source, 'EXTRACTED', { actor, patch: { rowCount: parsed.rows?.length || 0, schemaHeaders: parsed.headers || [] } });
        registry.upsertSource(source);
        const normalized = normalize(parsed.rows || [], parsed.mapping || parsed.headers || []);
        source = transitionSource(source, 'NORMALIZED', { actor, patch: { normalizedCount: normalized.length } });
        registry.upsertSource(source);
        const validation = validate(normalized);
        source = transitionSource(source, 'VALIDATED', { actor, patch: { exceptionCount: validation.exceptions.length, validationSummary: validation.summary } });
        registry.upsertSource(source);
        source = transitionSource(source, validation.exceptions.length ? 'REVIEW_REQUIRED' : 'CERTIFIED', {
          actor,
          patch: { reviewStatus: validation.exceptions.length ? 'OPEN' : 'NOT_REQUIRED', exceptions: validation.exceptions }
        });
        registry.upsertSource(source);
        if (source.status === 'CERTIFIED') {
          source = transitionSource(source, 'PROMOTION_READY', { actor, patch: { promotionStatus: 'READY' } });
          registry.upsertSource(source);
        }
        return source;
      } catch (error) {
        if (source.status !== 'FAILED') {
          source = transitionSource(source, 'FAILED', { actor, reason: error.message, patch: { lastError: error.message } });
          registry.upsertSource(source);
        }
        return source;
      }
    },

    resolveReview(sourceId, decision = {}) {
      let source = registry.getSource(sourceId);
      if (!source || source.status !== 'REVIEW_REQUIRED') throw new Error('Source is not awaiting review');
      source = transitionSource(source, 'CERTIFIED', {
        actor: decision.actor || actor,
        reason: decision.reason || 'Broker review completed',
        patch: { reviewStatus: 'RESOLVED', reviewDecision: decision }
      });
      registry.upsertSource(source);
      source = transitionSource(source, 'PROMOTION_READY', { actor, patch: { promotionStatus: 'READY' } });
      return registry.upsertSource(source);
    },

    promote(sourceId, details = {}) {
      let source = registry.getSource(sourceId);
      if (!source || source.status !== 'PROMOTION_READY') throw new Error('Source is not promotion ready');
      source = transitionSource(source, 'PROMOTED', {
        actor: details.actor || actor,
        reason: details.reason || 'Explicit broker-approved promotion',
        patch: { promotionStatus: 'PROMOTED', promotedAt: new Date().toISOString(), projection: details.projection || null }
      });
      return registry.upsertSource(source);
    },

    metrics() {
      const state = registry.snapshot();
      const sources = state.sources;
      return {
        batches: state.batches.length,
        sources: sources.length,
        awaitingReview: sources.filter(source => source.status === 'REVIEW_REQUIRED').length,
        promotionReady: sources.filter(source => source.status === 'PROMOTION_READY').length,
        promoted: sources.filter(source => source.status === 'PROMOTED').length,
        duplicates: sources.filter(source => source.status === 'DUPLICATE').length,
        failed: sources.filter(source => source.status === 'FAILED').length
      };
    }
  });
}
