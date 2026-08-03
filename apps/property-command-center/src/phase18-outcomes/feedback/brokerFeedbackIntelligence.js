const freeze=v=>Object.freeze(v);

export function evaluateBrokerFeedback({feedback=[]}={}) {
  const rows=feedback.map(item=>{
    const score=Number(item.score||0);
    const actionable=Boolean(item.category)&&Boolean(item.comment);
    return freeze({
      ...item,
      score,
      actionable,
      sentiment:score>=4?'POSITIVE':score>=3?'NEUTRAL':'NEGATIVE',
      status:actionable?'READY_FOR_REVIEW':'INCOMPLETE'
    });
  });

  return freeze({
    feedback:freeze(rows),
    total:rows.length,
    actionable:rows.filter(r=>r.actionable).length,
    positive:rows.filter(r=>r.sentiment==='POSITIVE').length,
    negative:rows.filter(r=>r.sentiment==='NEGATIVE').length,
    brokerControlled:true,
    autonomousFeedbackRewritingAllowed:false
  });
}
