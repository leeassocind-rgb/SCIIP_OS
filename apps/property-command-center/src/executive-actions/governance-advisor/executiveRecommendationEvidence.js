import{freezeDeep,uniq,normalize}from'./_shared.js';

export function buildExecutiveRecommendationEvidence(input={}){
  const evidence=(input.evidence||[]).map(item=>freezeDeep({
    id:String(item.id),
    type:normalize(item.type||'UNKNOWN'),
    status:normalize(item.status||'VERIFIED'),
    source:String(item.source||'UNKNOWN'),
    checksum:item.checksum||null,
    sourceSignalIds:uniq(item.sourceSignalIds)
  }));
  return freezeDeep({
    evidence,
    evidenceIds:evidence.map(item=>item.id),
    verifiedEvidenceIds:evidence.filter(item=>item.status==='VERIFIED').map(item=>item.id),
    sourceSignalIds:uniq(evidence.flatMap(item=>item.sourceSignalIds)),
    complete:evidence.length>0&&evidence.every(item=>item.status==='VERIFIED')
  });
}
