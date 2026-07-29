import{registerService,resolveService}from'./serviceRegistry.js';
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function createDomainServices({graphReader=()=>({nodes:[],edges:[]}),opportunityReader=()=>[],workflowReader=()=>({workflows:[]})}={}){
 const services={
  PropertyService:{list:()=>clone(graphReader().nodes||[]).filter(node=>String(node.type||'').toUpperCase()==='PROPERTY')},
  AssignmentService:{current:assignment=>clone(assignment||null)},
  OpportunityService:{list:assignmentId=>clone(opportunityReader()).filter(item=>!assignmentId||item.assignmentId===assignmentId)},
  WorkflowService:{list:assignmentId=>clone(workflowReader(assignmentId).workflows||[])},
  KnowledgeGraphService:{snapshot:()=>clone(graphReader())}
 };
 Object.entries(services).forEach(([name,service])=>registerService(name,service,{replace:true}));return services
}
export const domainService=name=>resolveService(name);
