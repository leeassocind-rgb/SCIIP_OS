import { registerExecutiveSignalType } from '../../executive-signals/executiveSignalRegistry.js';

export const PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES = Object.freeze({
  HEALTH_CHANGED: 'PROPERTY_DIGITAL_TWIN_HEALTH_CHANGED',
  SYNCHRONIZATION_REVIEW_REQUIRED: 'PROPERTY_DIGITAL_TWIN_SYNCHRONIZATION_REVIEW_REQUIRED',
  INFRASTRUCTURE_RISK: 'PROPERTY_DIGITAL_TWIN_INFRASTRUCTURE_RISK'
});

export function registerPropertyDigitalTwinSignalTypes() {
  return Object.freeze([
    {
      type: PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.HEALTH_CHANGED,
      source: 'property-digital-twin',
      description: 'Property Digital Twin health status changed or requires executive attention.',
      defaultSeverity: 'MEDIUM',
      schemaVersion: '1.0.0',
      assignmentScoped: true,
      propertyScoped: true,
      consequential: false
    },
    {
      type: PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.SYNCHRONIZATION_REVIEW_REQUIRED,
      source: 'property-digital-twin',
      description: 'Property Digital Twin synchronization rejected one or more source records.',
      defaultSeverity: 'HIGH',
      schemaVersion: '1.0.0',
      assignmentScoped: true,
      propertyScoped: true,
      consequential: false
    },
    {
      type: PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.INFRASTRUCTURE_RISK,
      source: 'property-digital-twin',
      description: 'Property Digital Twin contains infrastructure dependencies requiring review.',
      defaultSeverity: 'HIGH',
      schemaVersion: '1.0.0',
      assignmentScoped: true,
      propertyScoped: true,
      consequential: false
    }
  ].map(registerExecutiveSignalType));
}
