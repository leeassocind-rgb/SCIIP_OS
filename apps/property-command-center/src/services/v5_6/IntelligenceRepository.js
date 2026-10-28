
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

// SCIIP_A10Y3_R1_POSTGRES_READ_BRIDGE
const SCIIP_POSTGRES_READ_API_DEFAULT = "http://127.0.0.1:43154";

function sciipPostgresReadApiBaseUrl() {
  const configured = import.meta.env?.VITE_SCIIP_POSTGRES_READ_API_URL;
  return String(configured || SCIIP_POSTGRES_READ_API_DEFAULT).replace(/\/+$/, "");
}

async function sciipPostgresRead(collection, { limit = 100, offset = 0, signal } = {}) {
  const baseUrl = sciipPostgresReadApiBaseUrl();
  const url = new URL(`/api/postgres/${collection}`, `${baseUrl}/`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SCIIP PostgreSQL read failed (${response.status}): ${body}`);
  }
  return response.json();
}

export async function readPostgresHealth({ signal } = {}) {
  const response = await fetch(`${sciipPostgresReadApiBaseUrl()}/health`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SCIIP PostgreSQL health check failed (${response.status}): ${body}`);
  }
  return response.json();
}

export function readPostgresAssets(options = {}) {
  return sciipPostgresRead("assets", options);
}

export function readPostgresBuildings(options = {}) {
  return sciipPostgresRead("buildings", options);
}

export function readPostgresListings(options = {}) {
  return sciipPostgresRead("listings", options);
}
