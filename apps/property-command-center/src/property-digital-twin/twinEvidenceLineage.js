export function buildEvidenceLineage({twinId,claims=[]}){
 if(!twinId)throw new Error('twinId required');
 const normalized=claims.map((c,i)=>Object.freeze({claimId:c.claimId||`${twinId}-CLAIM-${i+1}`,field:c.field,value:c.value,evidenceId:c.evidenceId||null,source:c.source||null,confidence:Math.max(0,Math.min(1,Number(c.confidence??0)))}));
 return Object.freeze({twinId,claims:Object.freeze(normalized),evidenceRequired:normalized.some(x=>!x.evidenceId),minimumConfidence:normalized.length?Math.min(...normalized.map(x=>x.confidence)):0});
}
