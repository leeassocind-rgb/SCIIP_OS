const STORAGE_KEY = 'sciip.production.source-registry.v1';
const BATCH_KEY = 'sciip.production.batch-registry.v1';

export function createMemoryRegistryAdapter(seed = {}) {
  let state = { sources: [...(seed.sources || [])], batches: [...(seed.batches || [])] };
  return {
    read() { return structuredClone(state); },
    write(next) { state = structuredClone(next); },
    clear() { state = { sources: [], batches: [] }; }
  };
}

export function createBrowserRegistryAdapter(storage = globalThis.localStorage) {
  return {
    read() {
      if (!storage) return { sources: [], batches: [] };
      try {
        return {
          sources: JSON.parse(storage.getItem(STORAGE_KEY) || '[]'),
          batches: JSON.parse(storage.getItem(BATCH_KEY) || '[]')
        };
      } catch {
        return { sources: [], batches: [] };
      }
    },
    write(next) {
      if (!storage) return;
      storage.setItem(STORAGE_KEY, JSON.stringify(next.sources || []));
      storage.setItem(BATCH_KEY, JSON.stringify(next.batches || []));
    },
    clear() {
      storage?.removeItem(STORAGE_KEY);
      storage?.removeItem(BATCH_KEY);
    }
  };
}

export function createSourceRegistry(adapter = createBrowserRegistryAdapter()) {
  const snapshot = () => adapter.read();
  const persist = state => { adapter.write(state); return state; };
  return Object.freeze({
    snapshot,
    findByFingerprint(fingerprint) {
      return snapshot().sources.find(source => source.fingerprint === fingerprint) || null;
    },
    getSource(sourceId) {
      return snapshot().sources.find(source => source.sourceId === sourceId) || null;
    },
    registerBatch(batch) {
      const state = snapshot();
      if (state.batches.some(item => item.batchId === batch.batchId)) return batch;
      persist({ ...state, batches: [batch, ...state.batches] });
      return batch;
    },
    upsertSource(source) {
      const state = snapshot();
      const index = state.sources.findIndex(item => item.sourceId === source.sourceId);
      const sources = [...state.sources];
      if (index >= 0) sources[index] = source;
      else sources.unshift(source);
      persist({ ...state, sources });
      return source;
    },
    updateBatch(batchId, patch) {
      const state = snapshot();
      const batches = state.batches.map(batch => batch.batchId === batchId ? { ...batch, ...patch } : batch);
      persist({ ...state, batches });
      return batches.find(batch => batch.batchId === batchId) || null;
    },
    clear() { adapter.clear(); }
  });
}
