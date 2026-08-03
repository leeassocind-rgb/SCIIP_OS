const freeze=v=>Object.freeze(v);

export function createPhase17GraduationCommand({operatingModel={},improvements={},benchmarks={},rhythm={},approvals=[]}={}) {
  const attention=[
    ...(operatingModel.domains||[]).filter(d=>d.status==='INCOMPLETE').map(d=>freeze({type:'OPERATING_MODEL_GAP',id:d.domainId})),
    ...(improvements.items||[]).filter(i=>i.status==='INSUFFICIENT_EVIDENCE').map(i=>freeze({type:'IMPROVEMENT_GAP',id:i.improvementId})),
    ...(benchmarks.metrics||[]).filter(m=>m.status==='BELOW_BENCHMARK').map(m=>freeze({type:'BENCHMARK_GAP',id:m.metricId})),
    ...(rhythm.meetings||[]).filter(m=>m.status==='FOLLOW_UP_REQUIRED').map(m=>freeze({type:'RHYTHM_FOLLOW_UP',id:m.meetingId})),
    ...approvals.filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL',id:a.approvalId}))
  ];

  return freeze({
    operatingModel:freeze({...operatingModel}),
    improvements:freeze({...improvements}),
    benchmarks:freeze({...benchmarks}),
    rhythm:freeze({...rhythm}),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    phase17GraduationReady:true,
    executiveApprovalRequired:true,
    autonomousGraduationAllowed:false,
    autonomousExecutionAllowed:false
  });
}
