
export const V56_CAPABILITIES = [
  { id: 'executive', label: 'Executive', route: '/v5-6/executive', lazy: true },
  { id: 'property', label: 'Digital Twin', route: '/v5-6/property', lazy: true },
  { id: 'graph', label: 'Knowledge Graph', route: '/v5-6/graph', lazy: true },
  { id: 'gis', label: 'GIS Studio', route: '/v5-6/gis', lazy: true },
  { id: 'market', label: 'Market Intelligence', route: '/v5-6/market', lazy: true },
];
export function getCapability(id) { return V56_CAPABILITIES.find(x => x.id === id) || null; }
