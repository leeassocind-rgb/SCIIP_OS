const freeze=v=>Object.freeze(v);

export function buildExecutiveOperatingRhythm({meetings=[],decisions=[],actions=[]}={}) {
  const rows=meetings.map(meeting=>{
    const linkedDecisions=decisions.filter(d=>d.meetingId===meeting.meetingId);
    const linkedActions=actions.filter(a=>a.meetingId===meeting.meetingId);
    const openActions=linkedActions.filter(a=>a.status!=='COMPLETE').length;
    return freeze({
      ...meeting,
      decisionCount:linkedDecisions.length,
      actionCount:linkedActions.length,
      openActions,
      status:openActions?'FOLLOW_UP_REQUIRED':'CURRENT'
    });
  });

  return freeze({
    meetings:freeze(rows),
    total:rows.length,
    followUpRequired:rows.filter(m=>m.status==='FOLLOW_UP_REQUIRED').length,
    decisionHistoryPreserved:true,
    actionAccountabilityVisible:true,
    executiveReviewRequired:true,
    autonomousDecisionClosureAllowed:false
  });
}
