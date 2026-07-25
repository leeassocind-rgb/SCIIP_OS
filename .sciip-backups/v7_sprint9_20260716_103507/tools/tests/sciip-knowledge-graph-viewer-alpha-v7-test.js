#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const required=['src/ui/SCIIP_KnowledgeGraphViewer.gs','src/ui/SCIIP_KnowledgeGraphViewer_Tests.gs','src/ui/SCIIP_UI_App.html','src/ui/SCIIP_KnowledgeGraphViewer_Styles.html'];
const failures=[];
for(const f of required){if(!fs.existsSync(path.join(root,f)))failures.push('Missing '+f);}
function has(f,s){return fs.existsSync(path.join(root,f))&&fs.readFileSync(path.join(root,f),'utf8').includes(s);}
if(!has('src/ui/SCIIP_KnowledgeGraphViewer.gs','sciipKnowledgeGraphSnapshot'))failures.push('Graph snapshot entry point missing');
if(!has('src/ui/SCIIP_KnowledgeGraphViewer.gs','sciipKnowledgeGraphNeighbors'))failures.push('Graph neighbors entry point missing');
if(!has('src/ui/SCIIP_UI_App.html','renderKnowledgeGraph'))failures.push('Knowledge Graph client renderer missing');
if(!has('src/ui/SCIIP_KnowledgeGraphViewer_Tests.gs','sciipTestKnowledgeGraphViewerAlphaV7'))failures.push('Apps Script test missing');
const result={framework:'SCIIP_KNOWLEDGE_GRAPH_VIEWER_ALPHA_CERTIFICATION',version:'v7.0-alpha.1',status:failures.length?'FAILED':'PASSED',checks:{files:required.every(f=>fs.existsSync(path.join(root,f))),snapshot:has('src/ui/SCIIP_KnowledgeGraphViewer.gs','snapshot:snapshot'),neighbors:has('src/ui/SCIIP_KnowledgeGraphViewer.gs','neighbors:neighbors'),clientRendering:has('src/ui/SCIIP_UI_App.html','renderKnowledgeGraph'),responsive:has('src/ui/SCIIP_KnowledgeGraphViewer_Styles.html','@media')},failures};
console.log(JSON.stringify(result,null,2));if(failures.length)process.exit(1);
