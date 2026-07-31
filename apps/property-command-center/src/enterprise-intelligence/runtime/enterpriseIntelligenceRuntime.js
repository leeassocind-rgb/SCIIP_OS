import { searchKnowledgeGraph } from '../semantic-search/index.js';
import { reasonAcrossGraph } from '../reasoning/index.js';
import { generateEvidenceBackedRecommendations } from '../recommendations/index.js';
import { groundExecutiveCopilot } from '../copilot/index.js';
import { detectAutonomousOpportunities } from '../opportunities/index.js';

const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createMemoryEnterpriseIntelligenceStorage(seed={}) {
  const store=new Map(Object.entries(seed).map(([key,value])=>[key,clone(value)]));
  return freeze({
    get:key=>clone(store.get(key)),
    set:(key,value)=>{store.set(key,clone(value));return clone(value)},
    remove:key=>store.delete(key)
  });
}

export function createEnterpriseIntelligenceRuntime({
  storage=createMemoryEnterpriseIntelligenceStorage(),
  storageKey='sciip.phase6.enterprise-intelligence.v1'
}={}) {
  let state=storage.get(storageKey)||{
    revision:0,updatedAt:null,graph:{nodes:[],edges:[]},
    search:{query:'',results:[],total:0},
    reasoning:{findings:[],findingCount:0},
    recommendations:{recommendations:[],total:0,recommended:0},
    copilot:{question:'',answer:'',grounded:false,citations:[]},
    opportunities:{opportunities:[],detected:0},
    productionExecutionAuthorized:false
  };
  const listeners=new Set();
  const emit=()=>listeners.forEach(listener=>listener());
  const persist=next=>{
    state={...next,revision:Number(state.revision||0)+1,updatedAt:new Date().toISOString()};
    storage.set(storageKey,state);emit();return freeze(clone(state));
  };

  return freeze({
    hydrateGraph:({nodes=[],edges=[]}={})=>persist({...state,graph:{nodes:clone(nodes),edges:clone(edges)}}),
    runSearch:({query,limit=10}={})=>persist({...state,search:clone(searchKnowledgeGraph({query,nodes:state.graph.nodes,edges:state.graph.edges,limit}))}),
    runReasoning:({startNodeId,targetType,maximumHops=3}={})=>persist({...state,reasoning:clone(reasonAcrossGraph({startNodeId,targetType,maximumHops,nodes:state.graph.nodes,edges:state.graph.edges}))}),
    runRecommendations:({signals=[]}={})=>persist({...state,recommendations:clone(generateEvidenceBackedRecommendations({signals}))}),
    runOpportunities:({properties=[],marketSignals=[],threshold=70}={})=>persist({...state,opportunities:clone(detectAutonomousOpportunities({properties,marketSignals,threshold}))}),
    runCopilot:({question}={})=>persist({...state,copilot:clone(groundExecutiveCopilot({
      question,
      searchResults:state.search.results||[],
      reasoningFindings:state.reasoning.findings||[],
      recommendations:state.recommendations.recommendations||[]
    }))}),
    getSnapshot:()=>freeze(clone(state)),
    subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener)},
    snapshot:()=>freeze({
      status:'OPERATIONAL',revision:state.revision,persistent:true,
      graphNodes:state.graph.nodes.length,graphEdges:state.graph.edges.length,
      productionExecutionAuthorized:false
    })
  });
}
