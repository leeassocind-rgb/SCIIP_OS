import { createExecutiveApprovalRecord } from './executiveApprovalRecord.js';

export function createExecutiveApprovalLedger(options = {}) {
  const maxRecords = Math.max(1, Number(options.maxRecords || 500));
  const records = [];
  const byProposal = new Map();
  let decisionsRecorded = 0;
  let duplicateDecisionsIgnored = 0;
  let conflictingDecisionsBlocked = 0;
  let invalidDecisionsBlocked = 0;

  const decide = (proposal, decision, decisionOptions = {}) => {
    try {
      const candidate = createExecutiveApprovalRecord(proposal, decision, decisionOptions);
      const existing = byProposal.get(candidate.proposalId);
      if (existing) {
        if (existing.outcome === candidate.outcome && existing.decidedBy === candidate.decidedBy) {
          duplicateDecisionsIgnored += 1;
          return Object.freeze({ status: 'DUPLICATE_IGNORED', record: existing });
        }
        conflictingDecisionsBlocked += 1;
        return Object.freeze({ status: 'CONFLICT_BLOCKED', record: existing });
      }
      records.push(candidate);
      byProposal.set(candidate.proposalId, candidate);
      while (records.length > maxRecords) records.shift();
      decisionsRecorded += 1;
      return Object.freeze({ status: candidate.outcome, record: candidate });
    } catch (error) {
      invalidDecisionsBlocked += 1;
      return Object.freeze({ status: 'INVALID_DECISION_BLOCKED', message: error.message, record: null });
    }
  };

  return Object.freeze({
    decide,
    approve: (proposal, decision = {}, opts = {}) => decide(proposal, { ...decision, outcome: 'APPROVED' }, opts),
    reject: (proposal, decision = {}, opts = {}) => decide(proposal, { ...decision, outcome: 'REJECTED' }, opts),
    getByProposalId: proposalId => byProposal.get(proposalId) || null,
    getRecords: () => Object.freeze([...records]),
    isApproved: proposalId => byProposal.get(proposalId)?.outcome === 'APPROVED',
    snapshot: () => Object.freeze({
      status: 'OPERATIONAL',
      retainedRecords: records.length,
      maxRecords,
      decisionsRecorded,
      duplicateDecisionsIgnored,
      conflictingDecisionsBlocked,
      invalidDecisionsBlocked,
      humanApprovalRequired: true,
      autonomousDecisionAllowed: false
    })
  });
}
