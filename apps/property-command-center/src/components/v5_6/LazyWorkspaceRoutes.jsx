
import React, { lazy, Suspense } from 'react';

const ExecutiveRoute = lazy(() => import('./routes/ExecutiveRoute.jsx'));
const PropertyDigitalTwinRoute = lazy(() => import('./routes/PropertyDigitalTwinRoute.jsx'));
const KnowledgeGraphRoute = lazy(() => import('./routes/KnowledgeGraphRoute.jsx'));
const GISStudioRoute = lazy(() => import('./routes/GISStudioRoute.jsx'));
const MarketIntelligenceRoute = lazy(() => import('./routes/MarketIntelligenceRoute.jsx'));

const routes = {
  executive: ExecutiveRoute,
  property: PropertyDigitalTwinRoute,
  graph: KnowledgeGraphRoute,
  gis: GISStudioRoute,
  market: MarketIntelligenceRoute,
};

export default function LazyWorkspaceRoutes({ workspace = 'executive', ...props }) {
  const Route = routes[workspace] || ExecutiveRoute;
  return <Suspense fallback={<div role="status">Loading intelligence workspace…</div>}><Route {...props} /></Suspense>;
}
