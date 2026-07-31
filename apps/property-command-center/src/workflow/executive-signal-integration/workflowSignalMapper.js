import { createExecutiveSignal } from '../../executive-signals/signalContract.js';
import { WORKFLOW_SIGNAL_TYPES } from './workflowSignalDefinitions.js';

export function mapWorkflowToExecutiveSignals({ sourceSignal, workflow, created, occurredAt }) {
  const common = {
    source: 'workflow-engine',
    assignmentId: workflow.assignmentId,
    propertyId: sourceSignal.propertyId || null,
    correlationId: sourceSignal.correlationId || sourceSignal.id,
    occurredAt,
    metadata: {
      workflowId: workflow.id,
      sourceSignalId: sourceSignal.id,
      requiresApproval: workflow.requiresApproval,
      autonomousExecution: workflow.autonomousExecution
    }
  };
  const signals = [];
  if (created) {
    signals.push(createExecutiveSignal({
      ...common,
      id: `workflow:${workflow.id}:draft-created`,
      type: WORKFLOW_SIGNAL_TYPES.DRAFT_CREATED,
      severity: 'INFO',
      title: 'Draft workflow created',
      summary: `${workflow.title} was created in DRAFT status.`,
      metrics: { taskCount: workflow.tasks.length, status: workflow.status },
      evidence: [{ id: sourceSignal.id, type: 'SOURCE_EXECUTIVE_SIGNAL', source: sourceSignal.source }]
    }));
  }
  if (workflow.requiresApproval) {
    signals.push(createExecutiveSignal({
      ...common,
      id: `workflow:${workflow.id}:approval-required`,
      type: WORKFLOW_SIGNAL_TYPES.APPROVAL_REQUIRED,
      severity: 'HIGH',
      title: 'Workflow approval required',
      summary: 'Explicit human approval is required before this workflow can proceed.',
      metrics: { status: workflow.status, approvalRequired: true },
      evidence: [{ id: workflow.id, type: 'WORKFLOW_DRAFT', source: 'workflow-engine' }],
      actions: [{ type: 'HUMAN_WORKFLOW_APPROVAL', autonomous: false }]
    }));
  }
  return Object.freeze(signals);
}
