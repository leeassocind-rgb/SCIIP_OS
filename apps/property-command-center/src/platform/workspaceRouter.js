const DEFAULT_ROUTE = Object.freeze({ nav: 'Assignments', assignmentId: '', tab: 'Executive Summary', propertyId: '' });

function clean(value) { return typeof value === 'string' ? value.trim() : ''; }

export function parseWorkspaceRoute(locationLike) {
  const search = locationLike?.search || '';
  const hash = locationLike?.hash || '';
  const params = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#\??/, ''));
  const read = key => clean(params.get(key) || hashParams.get(key) || '');
  return {
    nav: read('nav') || DEFAULT_ROUTE.nav,
    assignmentId: read('assignment') || DEFAULT_ROUTE.assignmentId,
    tab: read('tab') || DEFAULT_ROUTE.tab,
    propertyId: read('property') || DEFAULT_ROUTE.propertyId
  };
}

export function serializeWorkspaceRoute(route = {}) {
  const next = { ...DEFAULT_ROUTE, ...route };
  const params = new URLSearchParams();
  if (next.nav && next.nav !== DEFAULT_ROUTE.nav) params.set('nav', next.nav);
  if (next.assignmentId) params.set('assignment', next.assignmentId);
  if (next.tab && next.tab !== DEFAULT_ROUTE.tab) params.set('tab', next.tab);
  if (next.propertyId) params.set('property', next.propertyId);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function replaceWorkspaceRoute(route, historyLike, locationLike) {
  if (!historyLike?.replaceState || !locationLike) return serializeWorkspaceRoute(route);
  const query = serializeWorkspaceRoute(route);
  const nextUrl = `${locationLike.pathname || ''}${query}${locationLike.hash || ''}`;
  historyLike.replaceState({ sciipWorkspace: route }, '', nextUrl);
  return nextUrl;
}

export { DEFAULT_ROUTE };
