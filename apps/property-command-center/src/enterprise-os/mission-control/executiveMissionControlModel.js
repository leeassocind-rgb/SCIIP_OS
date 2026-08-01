const freeze=value=>Object.freeze(value);

export function createExecutiveMissionControlModel({
  twin,
  commandBus,
  stateSync,
  portfolio,
  workflows=[],
  recommendations=[],
  approvals=[],
  risks=[],
  opportunities=[],
  capital={}
}={}) {
  const criticalRisks=risks.filter(item=>['CRITICAL','HIGH'].includes(item.severity)&&item.status!=='CLOSED');
  const pendingApprovals=approvals.filter(item=>!['APPROVED','REJECTED','COMPLETED'].includes(item.status));
  const activeWorkflows=workflows.filter(item=>!['COMPLETED','CANCELLED'].includes(item.status));
  const topRecommendations=[...recommendations].sort((a,b)=>Number(b.confidence||b.score||0)-Number(a.confidence||a.score||0)).slice(0,5);

  return freeze({
    health:criticalRisks.length?'WATCH':'OPERATIONAL',
    enterpriseTwinStatus:twin?.status||'UNKNOWN',
    commandBusStatus:commandBus?.status||'UNKNOWN',
    synchronizationStatus:stateSync?.status||'UNKNOWN',
    portfolioAssets:Number(portfolio?.assets||portfolio?.selectedCount||0),
    capitalAvailable:Number(capital.available||0),
    capitalAllocated:Number(capital.allocated||0),
    activeWorkflows:activeWorkflows.length,
    pendingApprovals:pendingApprovals.length,
    criticalRisks:criticalRisks.length,
    activeOpportunities:opportunities.filter(item=>item.status!=='CLOSED').length,
    recommendations:freeze(topRecommendations),
    evidenceBacked:true,
    executiveReady:true,
    productionExecutionAuthorized:false
  });
}
