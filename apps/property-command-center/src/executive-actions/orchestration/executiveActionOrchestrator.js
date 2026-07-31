import { mapExecutiveStateToActionProposal } from './executiveActionProposalMapper.js';

export function createExecutiveActionOrchestrator(options = {}) {
  const maxProposals = Math.max(1, Number(options.maxProposals || 100));
  const proposals = [];
  const proposalIds = new Set();
  const listeners = new Set();
  let commandCenterAdapter = null;
  let unsubscribe = null;
  let startedAt = null;
  let proposalsCreated = 0;
  let duplicatesIgnored = 0;
  let noActionIgnored = 0;
  let proposalFailures = 0;
  let dispatchAttemptsBlocked = 0;

  const notify = proposal => {
    for (const listener of [...listeners]) {
      try { listener(proposal); } catch { /* isolate workflow consumers */ }
    }
  };

  const propose = state => {
    try {
      const proposal = mapExecutiveStateToActionProposal(state || {});
      if (proposal.status === 'NO_ACTION_REQUIRED') {
        noActionIgnored += 1;
        return Object.freeze({ status: 'NO_ACTION_REQUIRED', proposal });
      }
      if (proposalIds.has(proposal.proposalId)) {
        duplicatesIgnored += 1;
        return Object.freeze({ status: 'DUPLICATE_IGNORED', proposal });
      }
      proposalIds.add(proposal.proposalId);
      proposals.push(proposal);
      while (proposals.length > maxProposals) proposals.shift();
      proposalsCreated += 1;
      notify(proposal);
      return Object.freeze({ status: 'PROPOSED', proposal });
    } catch (error) {
      proposalFailures += 1;
      return Object.freeze({ status: 'PROPOSAL_FAILED', message: error.message, proposal: null });
    }
  };

  return Object.freeze({
    start(nextCommandCenterAdapter, startOptions = {}) {
      if (!nextCommandCenterAdapter || typeof nextCommandCenterAdapter.getState !== 'function') {
        throw new Error('Executive Command Center Signal Adapter is required');
      }
      if (commandCenterAdapter) return this.snapshot();
      commandCenterAdapter = nextCommandCenterAdapter;
      startedAt ||= new Date().toISOString();
      if (startOptions.evaluateInitial !== false) propose(commandCenterAdapter.getState());
      if (typeof commandCenterAdapter.subscribe === 'function') {
        unsubscribe = commandCenterAdapter.subscribe(state => propose(state));
      }
      return this.snapshot();
    },
    stop() {
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      commandCenterAdapter = null;
      return this.snapshot();
    },
    propose,
    subscribe(listener) {
      if (typeof listener !== 'function') throw new Error('Listener must be a function');
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch() {
      dispatchAttemptsBlocked += 1;
      return Object.freeze({
        status: 'BLOCKED_PENDING_HUMAN_APPROVAL',
        autonomousExecutionAllowed: false
      });
    },
    getProposals: () => Object.freeze([...proposals]),
    getLatestProposal: () => proposals.at(-1) || null,
    snapshot() {
      return Object.freeze({
        status: commandCenterAdapter ? 'OPERATIONAL' : startedAt ? 'STOPPED' : 'READY',
        startedAt,
        proposalsCreated,
        retainedProposals: proposals.length,
        maxProposals,
        duplicatesIgnored,
        noActionIgnored,
        proposalFailures,
        dispatchAttemptsBlocked,
        humanApprovalRequired: true,
        autonomousExecutionAllowed: false,
        listenerCount: listeners.size
      });
    }
  });
}
