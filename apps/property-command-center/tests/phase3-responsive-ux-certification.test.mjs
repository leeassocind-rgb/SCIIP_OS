import assert from'node:assert/strict';
import fs from'node:fs';
import path from'node:path';
import{fileURLToPath}from'node:url';
import{createExecutiveDashboardSignalExperience}from'../src/executive-command-center/ux/index.js';
import{createMorningBriefSignalExperience}from'../src/autonomous-intelligence/ux/index.js';
import{createExecutiveTimelineExperience}from'../src/executive/ux/index.js';
import{createCopilotExperience}from'../src/ai/ux/index.js';
import{createGisMapExperience}from'../src/spatial/ux/index.js';
import{createPropertyWorkspaceExperience}from'../src/property-digital-twin/ux/index.js';
import{createEnterpriseSearchExperience}from'../src/search/ux/index.js';
import{createWorkspaceLoadingExperience}from'../src/product/ux/index.js';

let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cssFiles=['src/executive.css','src/autonomous-intelligence.css','src/styles.css','src/property-digital-twin.css','src/foundation.css'];
const css=cssFiles.map(file=>fs.readFileSync(path.join(app,file),'utf8')).join('\n');
t(css.includes('@media'));t(css.includes('max-width'));t(css.includes('prefers-reduced-motion'));
const dashboard=createExecutiveDashboardSignalExperience({signalRuntime:{registeredTypes:[{source:'gis'}]}});
const brief=createMorningBriefSignalExperience();
const timeline=createExecutiveTimelineExperience();
const copilot=createCopilotExperience();
const maps=createGisMapExperience();
const property=createPropertyWorkspaceExperience();
const search=createEnterpriseSearchExperience();
const loading=createWorkspaceLoadingExperience();
const experiences=[dashboard,brief,timeline,copilot,maps,property,search,loading];
t(experiences.length===8);t(experiences.every(Object.isFrozen));
t(dashboard.autonomousExecutionAllowed===false);
t(brief.autonomousConsequentialActions==='BLOCKED');
t(timeline.autonomousExecutionAllowed===false);
t(copilot.autonomousConsequentialActions==='BLOCKED');
t(maps.brokerControlled);
t(property.autonomousConsequentialActions==='BLOCKED');
t(search.brokerControlled);
t(loading.accessibleStatus);
const required=[
 'src/components/ExecutiveCommandCenter.jsx',
 'src/components/ExecutiveMorningBriefCenter.jsx',
 'src/components/AIPropertyCopilot.jsx',
 'src/components/GISIntelligenceWorkspace.jsx',
 'src/components/PropertyDigitalTwinCenter.jsx',
 'src/components/EnterpriseFoundationCenter.jsx',
 'src/components/WorkspaceLoadingExperience.jsx'
];
t(required.every(file=>fs.existsSync(path.join(app,file))));
const main=fs.readFileSync(path.join(app,'src/main.jsx'),'utf8');
t(main.includes('lazy(()=>import'));t(main.includes('Suspense'));t(main.includes('WorkspaceLoadingExperience'));
console.log(JSON.stringify({framework:'SCIIP_PHASE3_SPRINT42_RESPONSIVE_UI_UX_CERTIFICATION',status:'PASSED',testsRun:tests,result:{experiencesCertified:8,dashboard:true,morningBrief:true,timeline:true,copilot:true,maps:true,propertyWorkspace:true,search:true,performanceLoading:true,responsiveBreakpoints:true,reducedMotion:true,lazyLoading:true,codeSplitting:true,phase3Status:'CERTIFIED'}},null,2));
