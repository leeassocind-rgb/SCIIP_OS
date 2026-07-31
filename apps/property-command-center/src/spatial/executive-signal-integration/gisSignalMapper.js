import { createExecutiveSignal } from '../../executive-signals/signalContract.js';
import { GIS_SIGNAL_TYPES } from './gisSignalDefinitions.js';

const evidence = (analysis, type) => Object.freeze([Object.freeze({
  id: `gis:${analysis.operationId}:${type}`,
  type,
  source: 'gis',
  operationId: analysis.operationId
})]);

export function mapGisAnalysisToExecutiveSignals(analysis) {
  const common = {
    source: 'gis',
    assignmentId: analysis.assignmentId || null,
    propertyId: analysis.subject?.attributes?.propertyId || analysis.subject?.id || null,
    correlationId: analysis.correlationId || analysis.operationId,
    occurredAt: analysis.occurredAt,
    metadata: {
      operationId: analysis.operationId,
      geospatialMathReused: true,
      mapContextReady: true,
      autonomousConsequentialActions: 'BLOCKED'
    }
  };
  const signals = [];

  if (analysis.nearest.length > 0) {
    const closest = analysis.nearest[0];
    signals.push(createExecutiveSignal({
      ...common,
      id: `gis:${analysis.operationId}:proximity-opportunity`,
      type: GIS_SIGNAL_TYPES.PROXIMITY_OPPORTUNITY,
      severity: closest.distanceMiles <= 5 ? 'HIGH' : 'MEDIUM',
      title: 'GIS proximity opportunity detected',
      summary: `${analysis.nearest.length} nearby properties were identified; closest is ${closest.distanceMiles.toFixed(2)} miles away.`,
      metrics: {
        nearbyCount: analysis.nearest.length,
        closestDistanceMiles: Number(closest.distanceMiles.toFixed(2)),
        radiusMiles: analysis.radiusMiles
      },
      evidence: evidence(analysis, 'GIS_PROXIMITY_ANALYSIS'),
      actions: [{ type: 'REVIEW_MAP_CONTEXT', autonomous: false }]
    }));
  }

  if (analysis.rankedSites.length > 0) {
    const top = analysis.rankedSites[0];
    signals.push(createExecutiveSignal({
      ...common,
      id: `gis:${analysis.operationId}:site-shortlist`,
      type: GIS_SIGNAL_TYPES.SITE_SHORTLIST_READY,
      severity: top.siteScore.score >= 80 ? 'MEDIUM' : 'INFO',
      title: 'GIS site shortlist ready',
      summary: `${analysis.rankedSites.length} candidate sites were ranked; top score is ${top.siteScore.score}.`,
      metrics: {
        candidateCount: analysis.rankedSites.length,
        topScore: top.siteScore.score,
        topPropertyId: top.id
      },
      evidence: evidence(analysis, 'GIS_SITE_SELECTION'),
      actions: [{ type: 'HUMAN_SITE_REVIEW', autonomous: false }]
    }));
  }

  if (!analysis.subject?.coordinates || analysis.invalidPropertyCount > 0 || analysis.rankedSites.length === 0) {
    signals.push(createExecutiveSignal({
      ...common,
      id: `gis:${analysis.operationId}:data-review`,
      type: GIS_SIGNAL_TYPES.SPATIAL_DATA_REVIEW_REQUIRED,
      severity: 'HIGH',
      title: 'GIS spatial data review required',
      summary: `${analysis.invalidPropertyCount} properties lack valid coordinates or no ranked sites were available.`,
      metrics: {
        invalidPropertyCount: analysis.invalidPropertyCount,
        rankedSiteCount: analysis.rankedSites.length
      },
      evidence: evidence(analysis, 'GIS_DATA_QUALITY'),
      actions: [{ type: 'HUMAN_SPATIAL_DATA_REVIEW', autonomous: false }]
    }));
  }

  return Object.freeze(signals);
}
