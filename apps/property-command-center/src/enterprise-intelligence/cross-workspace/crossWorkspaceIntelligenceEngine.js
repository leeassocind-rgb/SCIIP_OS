const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function correlateCrossWorkspaceIntelligence({
  marketEvents=[],
  graphSignals=[],
  gisSignals=[],
  digitalTwinSignals=[],
  workflowSignals=[],
  minimumEvidence=2
}={}) {
  const grouped=new Map();

  const ingest=(source,signals)=>{
    for(const signal of signals){
      const subjectId=signal.subjectId||signal.propertyId||signal.entityId;
      if(!subjectId)continue;
      if(!grouped.has(subjectId))grouped.set(subjectId,[]);
      grouped.get(subjectId).push(freeze({
        ...clone(signal),
        source,
        subjectId
      }));
    }
  };

  ingest('MARKET',marketEvents);
  ingest('KNOWLEDGE_GRAPH',graphSignals);
  ingest('GIS',gisSignals);
  ingest('DIGITAL_TWIN',digitalTwinSignals);
  ingest('WORKFLOW',workflowSignals);

  const recommendations=[];
  for(const [subjectId,evidence] of grouped.entries()){
    const sources=[...new Set(evidence.map(item=>item.source))];
    const positive=evidence.filter(item=>Number(item.score||item.signal||0)>0).length;
    const negative=evidence.filter(item=>Number(item.score||item.signal||0)<0).length;
    const confidence=Math.min(0.98,Number((0.45+sources.length*0.08+Math.min(evidence.length,5)*0.04).toFixed(2)));
    const type=positive>=negative?'OPPORTUNITY':'RISK';

    recommendations.push(freeze({
      recommendationId:`XWI-${recommendations.length+1}`,
      subjectId,
      type,
      confidence,
      evidence:freeze(evidence),
      evidenceCount:evidence.length,
      sourceCount:sources.length,
      sources:freeze(sources),
      status:evidence.length>=minimumEvidence?'RECOMMENDED':'INSUFFICIENT_EVIDENCE',
      rationale:`${type} detected from ${sources.length} enterprise sources and ${evidence.length} governed signals.`,
      approvalRequired:true,
      executionAuthorized:false
    }));
  }

  recommendations.sort((a,b)=>b.confidence-a.confidence||b.evidenceCount-a.evidenceCount);

  return freeze({
    recommendations:freeze(recommendations),
    total:recommendations.length,
    recommended:recommendations.filter(item=>item.status==='RECOMMENDED').length,
    correlatedSources:freeze(['MARKET','KNOWLEDGE_GRAPH','GIS','DIGITAL_TWIN','WORKFLOW']),
    unifiedEvidenceLayer:true,
    crossWorkspace:true,
    approvalRequired:true,
    executionAuthorized:false
  });
}
