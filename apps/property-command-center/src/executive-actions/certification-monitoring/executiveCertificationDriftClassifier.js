import{freezeDeep}from'./_shared.js';

export function classifyExecutiveCertificationDrift(detection={}){
  const counts={CRITICAL:0,HIGH:0,MEDIUM:0,LOW:0};
  for(const drift of detection.drifts||[])counts[drift.severity]=(counts[drift.severity]||0)+1;
  const status=counts.CRITICAL?'CERTIFICATION_AT_RISK':
    counts.HIGH?'REVIEW_REQUIRED':
    counts.MEDIUM?'WATCH':
    detection.hasDrift?'INFORMATIONAL':'STABLE';
  const recertificationRecommended=counts.CRITICAL>0||counts.HIGH>=2;
  return freezeDeep({
    status,
    counts,
    recertificationRecommended,
    humanReviewRequired:status!=='STABLE'&&status!=='INFORMATIONAL',
    certificationRevocationAllowed:false
  });
}
