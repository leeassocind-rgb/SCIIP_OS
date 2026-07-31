import { createExecutiveSignal } from '../../executive-signals/signalContract.js';
import { PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES } from './propertyDigitalTwinSignalDefinitions.js';

const evidence = (twin, type) => Object.freeze([Object.freeze({
  id: `${twin.twinId}:${type}`,
  type,
  source: 'property-digital-twin',
  twinId: twin.twinId,
  profileVersion: twin.profileVersion || null
})]);

export function mapPropertyDigitalTwinToExecutiveSignals({
  twin,
  synchronization = null,
  assignmentId = null,
  correlationId = null,
  occurredAt = new Date().toISOString()
} = {}) {
  if (!twin?.twinId) throw new Error('Projected Property Digital Twin is required');

  const signals = [];
  const common = {
    source: 'property-digital-twin',
    assignmentId,
    propertyId: twin.profile?.propertyId || twin.propertyId || twin.id || twin.twinId,
    correlationId: correlationId || twin.twinId,
    occurredAt,
    metadata: {
      twinId: twin.twinId,
      appendOnlyStateHistory: true,
      evidenceLineageRequired: true,
      autonomousConsequentialActions: 'BLOCKED'
    }
  };

  const health = twin.health || {};
  signals.push(createExecutiveSignal({
    ...common,
    id: `property-digital-twin:${twin.twinId}:health`,
    type: PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.HEALTH_CHANGED,
    severity: health.status === 'ATTENTION_REQUIRED' ? 'HIGH' : health.status === 'WATCH' ? 'MEDIUM' : 'INFO',
    title: `Property Digital Twin health: ${health.status || 'UNKNOWN'}`,
    summary: `Twin health score is ${health.score ?? 0}.`,
    metrics: {
      healthScore: health.score ?? 0,
      freshnessDays: health.freshnessDays ?? null,
      conflictCount: health.conflictCount ?? 0
    },
    evidence: evidence(twin, 'TWIN_HEALTH')
  }));

  if (synchronization?.status === 'REVIEW_REQUIRED' || Number(synchronization?.rejectedSources || 0) > 0) {
    signals.push(createExecutiveSignal({
      ...common,
      id: `property-digital-twin:${twin.twinId}:synchronization-review`,
      type: PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.SYNCHRONIZATION_REVIEW_REQUIRED,
      severity: 'HIGH',
      title: 'Property Digital Twin synchronization review required',
      summary: `${synchronization.rejectedSources || 0} source records were rejected during synchronization.`,
      metrics: {
        acceptedSources: synchronization.acceptedSources || 0,
        rejectedSources: synchronization.rejectedSources || 0
      },
      evidence: evidence(twin, 'TWIN_SYNCHRONIZATION'),
      actions: [{ type: 'HUMAN_SOURCE_REVIEW', autonomous: false }]
    }));
  }

  const infrastructure = twin.infrastructure || {};
  const dependencies = infrastructure.dependencies || infrastructure.items || [];
  const critical = Array.isArray(dependencies)
    ? dependencies.filter(item => ['CRITICAL', 'HIGH', 'AT_RISK', 'BLOCKED'].includes(String(item.severity || item.status || '').toUpperCase()))
    : [];
  if (critical.length || infrastructure.status === 'AT_RISK' || infrastructure.status === 'BLOCKED') {
    signals.push(createExecutiveSignal({
      ...common,
      id: `property-digital-twin:${twin.twinId}:infrastructure-risk`,
      type: PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.INFRASTRUCTURE_RISK,
      severity: critical.some(item => String(item.severity || '').toUpperCase() === 'CRITICAL') ? 'CRITICAL' : 'HIGH',
      title: 'Property Digital Twin infrastructure risk',
      summary: `${critical.length || 1} infrastructure dependencies require review.`,
      metrics: {
        criticalDependencies: critical.length,
        infrastructureStatus: infrastructure.status || 'AT_RISK'
      },
      evidence: evidence(twin, 'TWIN_INFRASTRUCTURE'),
      actions: [{ type: 'HUMAN_INFRASTRUCTURE_REVIEW', autonomous: false }]
    }));
  }

  return Object.freeze(signals);
}
