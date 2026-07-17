'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const required=[
  'src/ui/SCIIP_AppState.gs','src/ui/SCIIP_AppEvents.gs','src/ui/SCIIP_WorkspaceSynchronization.gs',
  'src/ui/SCIIP_AppIntegration.gs','src/ui/SCIIP_IntegrationClient.html','src/ui/SCIIP_Integration_Styles.html',
  'src/ui/SCIIP_Integration_Tests.gs'
];
required.forEach(f=>assert(fs.existsSync(path.join(root,f)),`Missing ${f}`));
const ctx={console,Date,JSON,isFinite,SCIIP_PROPERTY_EXPLORER:{snapshot:()=>({properties:[{propertyId:'P-1',address:'1 Test Way',city:'Rialto',latitude:34.1,longitude:-117.4}]})},SCIIP_KNOWLEDGE_GRAPH_VIEWER:{snapshot:()=>({nodes:[{id:'C-1',label:'Test Company',type:'Company'},{id:'M-1',label:'Test Market',type:'Market'}]})},SCIIP_GIS_WORKSPACE:{snapshot:()=>({features:[{id:'F-1',label:'Test Feature',layer:'Properties',latitude:34.1,longitude:-117.4}]})}};
vm.createContext(ctx);
['src/ui/SCIIP_AppState.gs','src/ui/SCIIP_AppEvents.gs','src/ui/SCIIP_WorkspaceSynchronization.gs','src/ui/SCIIP_AppIntegration.gs'].forEach(f=>vm.runInContext(read(f),ctx));
assert.strictEqual(ctx.SCIIP_WORKSPACE_SYNCHRONIZATION.VERSION,'v7.0-integration-sprint-1b');
ctx.SCIIP_APP_STATE.reset();
ctx.SCIIP_APP_EVENTS.publish('PROPERTY_SELECTED',{property:{propertyId:'P-200',address:'200 Test Way',buildingSf:250000,landAcres:12,city:'Rialto',latitude:34.1,longitude:-117.4}});
const gis=ctx.SCIIP_WORKSPACE_SYNCHRONIZATION.get('gis-workspace');
const graph=ctx.SCIIP_WORKSPACE_SYNCHRONIZATION.get('knowledge-graph');
const ai=ctx.SCIIP_WORKSPACE_SYNCHRONIZATION.get('ai-workspace');
const executive=ctx.SCIIP_WORKSPACE_SYNCHRONIZATION.get('executive-dashboard');
assert.strictEqual(gis.focusMode,'FOCUSED_FEATURE');assert(gis.mapExtent);assert.strictEqual(graph.focusMode,'FOCUSED_NODE_AND_NEIGHBORS');assert(ai.grounding.selectedProperty);assert(executive.kpis.length>=2);
const results=ctx.SCIIP_APP_INTEGRATION.search({query:'test',limit:20});assert(results.results.length>=4);assert(results.results.some(r=>r.entityType==='COMPANY'));assert(results.results.some(r=>r.entityType==='MARKET'));
const selection=ctx.SCIIP_APP_INTEGRATION.selectSearchResult(results.results.find(r=>r.entityType==='PROPERTY'),{});assert.strictEqual(selection.workspaceId,'property-explorer');assert.strictEqual(selection.state.currentWorkspace,'property-explorer');assert(selection.focus.focusedEntity);
const envelope=ctx.SCIIP_APP_INTEGRATION.contextEnvelope();assert(envelope.breadcrumbs.length>=2);assert(envelope.workspaceFocus);
const client=read('src/ui/SCIIP_IntegrationClient.html');assert(client.includes('selectSearchResult'));assert(client.includes('ArrowDown'));assert(client.includes('notificationDrawer'));
const shell=read('src/ui/SCIIP_UI_Shell.html');assert(shell.includes('integrationLoading'));assert(shell.includes('integrationError'));
const mobile=read('src/ui/SCIIP_MobileUI.gs');assert(mobile.includes('workspaceFocusContract'));assert(mobile.includes('focusProjection'));
console.log(JSON.stringify({framework:'SCIIP_V7_INTEGRATION_SPRINT_1_WORKSPACE_WIRING_NODE',status:'PASSED',contracts:['workspace-focus','search-selection','context-envelope','notification-state','loading-error-state','mobile-focus-parity'],files:required.length},null,2));
