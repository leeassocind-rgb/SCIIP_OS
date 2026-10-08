import { designTokens } from '../tokens/index.js';
import { accessibilityStandards } from '../accessibility/accessibility.js';

export const SCIIP_DESIGN_SYSTEM = Object.freeze({
  id: 'sciip-design-system',
  version: '1.0.0-foundations',
  status: 'FOUNDATION_READY',
  tokens: designTokens,
  accessibility: accessibilityStandards,
  components: Object.freeze([
    'Badge',
    'Button',
    'Card',
    'EmptyState',
    'Skeleton',
    'TextField'
  ]),
  layouts: Object.freeze([
    'Page',
    'Stack',
    'Cluster'
  ]),
  migrationPrinciples: Object.freeze([
    'Daily workflows first',
    'Progressive migration',
    'No visual redesign without usability measurement',
    'No component duplication without governance review',
    'Accessibility is a release gate'
  ])
});

export function assertDesignSystemRegistry() {
  const errors = [];
  if (!SCIIP_DESIGN_SYSTEM.version) errors.push('Missing design system version');
  if (SCIIP_DESIGN_SYSTEM.components.length < 6) errors.push('Insufficient foundation components');
  if (SCIIP_DESIGN_SYSTEM.layouts.length < 3) errors.push('Insufficient layout primitives');
  if (SCIIP_DESIGN_SYSTEM.accessibility.minimumTouchTargetPx < 44) {
    errors.push('Minimum touch target is below 44px');
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    componentCount: SCIIP_DESIGN_SYSTEM.components.length,
    layoutPrimitiveCount: SCIIP_DESIGN_SYSTEM.layouts.length
  });
}
