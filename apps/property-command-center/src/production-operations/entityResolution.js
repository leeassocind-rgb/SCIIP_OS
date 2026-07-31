import crypto from 'node:crypto';
import { propertyIdentityCandidate } from './evidenceNormalizer.js';

const stableId = (prefix, value) =>
  `${prefix}-${crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 20)}`;

export function resolvePropertyCandidate(input = {}) {
  const identity = propertyIdentityCandidate(input);
  const confidence =
    identity.identityBasis === 'APN' ? 0.99 :
    identity.identityBasis === 'ADDRESS' ? 0.92 :
    identity.identityBasis === 'COORDINATE' ? 0.80 : 0.10;

  return {
    resolutionId: stableId('RES', JSON.stringify(identity)),
    ...identity,
    resolutionConfidence: confidence,
    resolutionStatus: identity.candidatePropertyId ? 'CANDIDATE_RESOLVED' : 'UNRESOLVED',
    canonicalCommitStatus: 'NOT_COMMITTED'
  };
}

export function clusterPropertyCandidates(candidates = []) {
  const groups = new Map();

  for (const candidate of candidates) {
    const resolved = resolvePropertyCandidate(candidate);
    const key = resolved.candidatePropertyId || stableId('UNRESOLVED', JSON.stringify(candidate));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ input: candidate, resolved });
  }

  return [...groups.entries()].map(([candidatePropertyId, members]) => ({
    clusterId: stableId('CLUSTER', candidatePropertyId),
    candidatePropertyId,
    memberCount: members.length,
    members,
    status: 'STAGED_FOR_REVIEW'
  }));
}
