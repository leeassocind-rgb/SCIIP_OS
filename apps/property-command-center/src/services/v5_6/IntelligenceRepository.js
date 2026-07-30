
const DATA_ROOT = '/reports/release-5.6/wave-2.5';

async function loadJson(name) {
  const response = await fetch(`${DATA_ROOT}/${name}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to load ${name}: ${response.status}`);
  return response.json();
}

let cachePromise = null;

export function loadIntelligenceRepository({ force = false } = {}) {
  if (!cachePromise || force) cachePromise = loadJson('unified-intelligence-repository.json');
  return cachePromise;
}

export async function loadExecutiveDashboard() {
  return loadJson('executive-dashboard-live.json');
}
export async function loadKnowledgeGraph() {
  return loadJson('knowledge-graph-live.json');
}
export async function loadDigitalTwins() {
  return loadJson('property-digital-twins.json');
}
export async function loadGisLayers() {
  return loadJson('gis-live-layers.json');
}
export async function loadMarketIntelligence() {
  return loadJson('market-intelligence-live.json');
}
export async function loadDecisionQueue() {
  return loadJson('decision-queue-live.json');
}
