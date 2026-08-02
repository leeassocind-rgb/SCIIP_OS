const freeze=v=>Object.freeze(v);

export function prepareAssignmentDelivery({assignmentId,sections=[],evidence=[],audience='CLIENT'}={}) {
  if(!assignmentId) throw new Error('assignmentId is required');
  const ids=new Set(evidence.map(item=>item.evidenceId));

  const prepared=sections.map(section=>{
    const refs=[...(section.evidenceIds||[])];
    const supported=refs.length===0||refs.every(id=>ids.has(id));
    return freeze({
      ...section,
      supported,
      status:supported?'READY':'BLOCKED',
      brokerEditable:true
    });
  });

  return freeze({
    assignmentId,
    audience,
    sections:freeze(prepared),
    total:prepared.length,
    ready:prepared.filter(item=>item.supported).length,
    complete:prepared.every(item=>item.supported),
    evidencePreserved:true,
    brokerReviewRequired:true,
    autonomousPublishingAllowed:false
  });
}
