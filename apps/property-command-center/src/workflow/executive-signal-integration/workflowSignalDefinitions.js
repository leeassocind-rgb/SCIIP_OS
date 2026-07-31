import { registerExecutiveSignalType } from '../../executive-signals/executiveSignalRegistry.js';

export const WORKFLOW_SIGNAL_TYPES = Object.freeze({
  DRAFT_CREATED: 'WORKFLOW_DRAFT_CREATED',
  APPROVAL_REQUIRED: 'WORKFLOW_APPROVAL_REQUIRED',
  STATUS_CHANGED: 'WORKFLOW_STATUS_CHANGED'
});

export function registerWorkflowSignalTypes() {
  return Object.freeze([
    { type: WORKFLOW_SIGNAL_TYPES.DRAFT_CREATED, source: 'workflow-engine', description: 'A governed draft workflow was created from an executive signal.', defaultSeverity: 'INFO', schemaVersion: '1.0.0', assignmentScoped: true, propertyScoped: true, consequential: false },
    { type: WORKFLOW_SIGNAL_TYPES.APPROVAL_REQUIRED, source: 'workflow-engine', description: 'A workflow requires explicit human approval before execution.', defaultSeverity: 'HIGH', schemaVersion: '1.0.0', assignmentScoped: true, propertyScoped: true, consequential: false },
    { type: WORKFLOW_SIGNAL_TYPES.STATUS_CHANGED, source: 'workflow-engine', description: 'A governed workflow changed status.', defaultSeverity: 'MEDIUM', schemaVersion: '1.0.0', assignmentScoped: true, propertyScoped: true, consequential: false }
  ].map(registerExecutiveSignalType));
}
