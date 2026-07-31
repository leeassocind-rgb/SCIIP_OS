import { createDeterministicIdentifier, BROWSER_HASH_CAPABILITIES } from './deterministicBrowserHash.js';
const freeze = value => Object.freeze(value);
export const PROMOTION_STAGES = Object.freeze(['DEVELOPMENT','CANARY','STAGING','PRODUCTION']);
export function createPromotionPipeline() {
  const certificates = [];
  const promote = ({from,to,artifactDigest,gates={},approvedBy,productionEnabled=false}={}) => {
    if (PROMOTION_STAGES.indexOf(to) !== PROMOTION_STAGES.indexOf(from) + 1) throw new Error('Promotion stages must be sequential');
    if (!artifactDigest || !approvedBy) throw new Error('Artifact digest and approver required');
    if (!Object.values(gates).every(Boolean)) throw new Error('Promotion gates failed');
    if (to === 'PRODUCTION' && !productionEnabled) return freeze({status:'PRODUCTION_PROMOTION_BLOCKED',from,to,committed:false});
    const certificate = freeze({
      certificateId:createDeterministicIdentifier('PC',[from,to,artifactDigest,approvedBy],20),
      from,to,artifactDigest,approvedBy,gates:freeze({...gates}),committed:true,
      rollbackCheckpoint:createDeterministicIdentifier('PRB',[from,artifactDigest],20)
    });
    certificates.push(certificate);
    return freeze({status:'PROMOTED',certificate,committed:true});
  };
  return Object.freeze({
    promote,
    certificates:()=>freeze([...certificates]),
    snapshot:()=>freeze({stages:PROMOTION_STAGES,certificates:certificates.length,sequential:true,gated:true,productionDefaultDenied:true,rollbackCheckpoints:true,browserHash:BROWSER_HASH_CAPABILITIES})
  });
}
