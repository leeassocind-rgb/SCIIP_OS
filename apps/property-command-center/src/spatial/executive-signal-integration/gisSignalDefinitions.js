import { registerExecutiveSignalType } from '../../executive-signals/executiveSignalRegistry.js';

export const GIS_SIGNAL_TYPES = Object.freeze({
  PROXIMITY_OPPORTUNITY: 'GIS_PROXIMITY_OPPORTUNITY',
  SITE_SHORTLIST_READY: 'GIS_SITE_SHORTLIST_READY',
  SPATIAL_DATA_REVIEW_REQUIRED: 'GIS_SPATIAL_DATA_REVIEW_REQUIRED'
});

export function registerGisSignalTypes() {
  return Object.freeze([
    {
      type: GIS_SIGNAL_TYPES.PROXIMITY_OPPORTUNITY,
      source: 'gis',
      description: 'Nearby properties or infrastructure create an executive spatial opportunity.',
      defaultSeverity: 'MEDIUM',
      schemaVersion: '1.0.0',
      assignmentScoped: true,
      propertyScoped: true,
      consequential: false
    },
    {
      type: GIS_SIGNAL_TYPES.SITE_SHORTLIST_READY,
      source: 'gis',
      description: 'GIS site-selection ranking produced a governed executive shortlist.',
      defaultSeverity: 'INFO',
      schemaVersion: '1.0.0',
      assignmentScoped: true,
      propertyScoped: true,
      consequential: false
    },
    {
      type: GIS_SIGNAL_TYPES.SPATIAL_DATA_REVIEW_REQUIRED,
      source: 'gis',
      description: 'Spatial analysis requires human review because coordinates or candidate coverage are incomplete.',
      defaultSeverity: 'HIGH',
      schemaVersion: '1.0.0',
      assignmentScoped: true,
      propertyScoped: true,
      consequential: false
    }
  ].map(registerExecutiveSignalType));
}
