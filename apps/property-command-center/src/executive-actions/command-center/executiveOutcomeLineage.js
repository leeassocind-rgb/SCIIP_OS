export function createExecutiveOutcomeLineage(viewModel = {}) {
  return Object.freeze({
    outcomeId:viewModel.id || null,
    proposalId:viewModel.proposalId || null,
    approvalId:viewModel.approvalId || null,
    workflowRequestId:viewModel.workflowRequestId || null,
    workflowId:viewModel.workflowId || null,
    sourceSignalIds:Object.freeze([...(viewModel.sourceSignalIds || [])]),
    complete:Boolean(viewModel.id && viewModel.proposalId && viewModel.approvalId && viewModel.workflowRequestId),
    immutable:true
  });
}
