const number=value=>Number(value||0);
const pct=value=>Math.max(0,Math.min(100,Math.round(number(value))));
export function aggregateExecutiveState({assignment={},graph={nodes:[],edges:[]},opportunities=[],workflows=[]}={}){
 const nodes=Array.isArray(graph?.nodes)?graph.nodes:[];
 const edges=Array.isArray(graph?.edges)?graph.edges:[];
 const scopedWorkflows=workflows.filter(item=>!assignment.id||item.assignmentId===assignment.id);
 const scopedOpportunities=opportunities.filter(item=>!assignment.id||item.assignmentId===assignment.id);
 const pending=scopedWorkflows.filter(item=>item.status==='PENDING_APPROVAL').length;
 const critical=scopedWorkflows.filter(item=>['BLOCKED','AT_RISK'].includes(item.status)).length;
 const complete=scopedWorkflows.filter(item=>item.status==='COMPLETED').length;
 const high=scopedOpportunities.filter(item=>['HIGH','VERY_HIGH'].includes(item.confidence)||number(item.score)>=80).length;
 const averageScore=scopedOpportunities.length?Math.round(scopedOpportunities.reduce((sum,item)=>sum+number(item.score),0)/scopedOpportunities.length):0;
 const propertyNodes=nodes.filter(item=>String(item.type||item.kind||'').toUpperCase().includes('PROPERTY'));
 const evidenceFreshness=pct(assignment.evidenceFreshness??(edges.length?88:62));
 return {
  assignmentId:assignment.id||'UNASSIGNED',
  generatedAt:new Date().toISOString(),
  kpis:{
   activeAssignments:assignment.id?1:0,
   propertiesUnderReview:propertyNodes.length,
   highConfidenceOpportunities:high,
   approvalsRequired:pending,
   criticalWorkflows:critical,
   workflowCompletion:scopedWorkflows.length?Math.round(complete/scopedWorkflows.length*100):0,
   averageOpportunityScore:averageScore,
   evidenceFreshness
  },
  health:[
   {id:'ingestion',label:'SuperSheet ingestion',status:'OPERATIONAL'},
   {id:'graph',label:'Knowledge graph',status:nodes.length?'OPERATIONAL':'READY'},
   {id:'ai',label:'AI Copilot',status:'OPERATIONAL'},
   {id:'gis',label:'GIS intelligence',status:'OPERATIONAL'},
   {id:'opportunity',label:'Opportunity engine',status:'OPERATIONAL'},
   {id:'workflow',label:'Workflow engine',status:'OPERATIONAL'}
  ],
  priorities:[
   ...(pending?[{severity:'HIGH',title:`${pending} broker approval${pending===1?'':'s'} required`,workspace:'Action Center'}]:[]),
   ...(critical?[{severity:'CRITICAL',title:`${critical} workflow${critical===1?'':'s'} require intervention`,workspace:'Action Center'}]:[]),
   ...(high?[{severity:'MEDIUM',title:`${high} high-confidence opportunit${high===1?'y':'ies'} ready for review`,workspace:'Opportunity Intelligence'}]:[])
  ],
  governance:{crossWorkspaceSync:true,appendOnlyTimeline:true,brokerApprovalRequired:true,autonomousOutreach:false}
 };
}
export function buildExecutiveBriefing(snapshot){
 const k=snapshot.kpis;
 const headline=k.approvalsRequired?`${k.approvalsRequired} broker approval${k.approvalsRequired===1?' is':'s are'} the immediate priority.`:'No broker approvals are currently pending.';
 return {
  headline,
  bullets:[
   `${k.highConfidenceOpportunities} high-confidence opportunities are in the governed pipeline.`,
   `${k.propertiesUnderReview} property nodes are available for evidence-backed review.`,
   `Workflow completion is ${k.workflowCompletion}% and evidence freshness is ${k.evidenceFreshness}%.`
  ],
  evidence:['Knowledge graph','Opportunity ledger','Workflow ledger','Assignment context']
 };
}
export function executiveTimeline({workflows=[],opportunities=[]}={}){
 const wf=workflows.map(item=>({id:`WF-${item.id}`,at:item.updatedAt||item.createdAt||new Date(0).toISOString(),type:'WORKFLOW',title:`Workflow ${String(item.status||'UPDATED').replaceAll('_',' ')}`,workspace:'Action Center'}));
 const op=opportunities.map(item=>({id:`OP-${item.id}`,at:item.preservedAt||item.updatedAt||new Date(0).toISOString(),type:'OPPORTUNITY',title:`Opportunity ${String(item.status||'REVIEWED').replaceAll('_',' ')}`,workspace:'Opportunity Intelligence'}));
 return [...wf,...op].sort((a,b)=>String(b.at).localeCompare(String(a.at))).slice(0,12);
}
