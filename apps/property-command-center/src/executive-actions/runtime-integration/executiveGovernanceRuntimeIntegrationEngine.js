import{freezeDeep}from'./_shared.js';
import{createExecutiveGovernanceRuntimeSignal}from'./executiveGovernanceRuntimeSignal.js';
import{registerExecutiveGovernanceSignal}from'./executiveGovernanceSignalRegistryAdapter.js';
import{publishExecutiveGovernanceSignal}from'./executiveGovernanceSignalBusAdapter.js';
import{createExecutiveGovernanceRuntimeProjection,projectExecutiveGovernanceRuntime}from'./executiveGovernanceRuntimeProjection.js';
import{createExecutiveGovernanceInsight,exposeExecutiveGovernanceInsight}from'./executiveGovernanceInsightAdapter.js';
import{createExecutiveGovernanceCommandCenterState,updateExecutiveGovernanceCommandCenter}from'./executiveGovernanceCommandCenterAdapter.js';
import{createExecutiveGovernanceWorkflowHandoff,submitExecutiveGovernanceWorkflowHandoff}from'./executiveGovernanceWorkflowHandoff.js';
import{createExecutiveGovernanceGraphProjection,projectExecutiveGovernanceKnowledgeGraph}from'./executiveGovernanceKnowledgeGraphAdapter.js';
import{createExecutiveGovernanceRuntimeIntegrationLedger}from'./executiveGovernanceRuntimeIntegrationLedger.js';

export function createExecutiveGovernanceRuntimeIntegrationEngine({ports={},maxEntries=100,clock}={}){
  const ledger=createExecutiveGovernanceRuntimeIntegrationLedger({maxEntries});
  let started=true;
  return Object.freeze({
    integrate(input={}){
      if(!started)throw new Error('Runtime integration engine is stopped');
      if(!input.id)throw new Error('Runtime integration id is required');
      if(!input.submission?.id)throw new Error('Sprint 24 orchestration submission is required');
      const existing=ledger.get(input.id)||ledger.getBySubmission(input.submission.id);
      if(existing)return{duplicate:true,integration:existing};

      const signal=createExecutiveGovernanceRuntimeSignal({submission:input.submission,clock});
      const registry=registerExecutiveGovernanceSignal({signalRegistry:ports.signalRegistry,signal});
      const signalBus=publishExecutiveGovernanceSignal({signalBus:ports.signalBus,signal});
      const projection=createExecutiveGovernanceRuntimeProjection({signal,submission:input.submission});
      const runtime=projectExecutiveGovernanceRuntime({executiveRuntime:ports.executiveRuntime,projection});
      const insight=createExecutiveGovernanceInsight({signal,projection});
      const insightResult=exposeExecutiveGovernanceInsight({executiveInsight:ports.executiveInsight,insight});
      const commandState=createExecutiveGovernanceCommandCenterState({signal,projection,insight});
      const commandCenter=updateExecutiveGovernanceCommandCenter({commandCenter:ports.commandCenter,state:commandState});
      const workflowHandoff=createExecutiveGovernanceWorkflowHandoff({submission:input.submission,signal});
      const workflow=submitExecutiveGovernanceWorkflowHandoff({workflowEngine:ports.workflowEngine,handoff:workflowHandoff});
      const graphProjection=createExecutiveGovernanceGraphProjection({signal,submission:input.submission});
      const knowledgeGraph=projectExecutiveGovernanceKnowledgeGraph({knowledgeGraph:ports.knowledgeGraph,projection:graphProjection});

      const connectedPorts=[registry.registered,signalBus.published,runtime.projected,insightResult.exposed,commandCenter.updated,workflow.submitted,knowledgeGraph.projected]
        .filter(Boolean).length;
      const integration=freezeDeep({
        id:String(input.id),
        submissionId:input.submission.id,
        signal,
        registry,
        signalBus,
        projection,
        runtime,
        insight,
        insightResult,
        commandState,
        commandCenter,
        workflowHandoff,
        workflow,
        graphProjection,
        knowledgeGraph,
        connectedPorts,
        totalPorts:7,
        integrationStatus:connectedPorts===7?'FULLY_INTEGRATED':
          connectedPorts>0?'PARTIALLY_INTEGRATED':'ADAPTERS_READY_NO_PORTS_CONNECTED',
        executionAuthorized:false,
        workflowMutationAllowed:false,
        autonomousExecutionAllowed:false
      });
      const appended=ledger.append(integration);
      return{duplicate:false,integration:appended.entry};
    },
    getIntegrations:()=>ledger.list(),
    getStatus:()=>freezeDeep({
      status:started?'OPERATIONAL':'STOPPED',
      integrations:ledger.list().length,
      appendOnly:true,
      dependencyInjection:true,
      executionAuthorized:false,
      workflowMutationAllowed:false,
      autonomousExecutionAllowed:false
    }),
    stop(){started=false},
    start(){started=true}
  });
}
