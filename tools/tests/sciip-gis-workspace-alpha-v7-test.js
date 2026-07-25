#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const required=['src/ui/SCIIP_GISWorkspace.gs','src/ui/SCIIP_GISWorkspace_Tests.gs','src/ui/SCIIP_UI_App.html','src/ui/SCIIP_GISWorkspace_Styles.html'];
const failures=[];
for(const f of required){if(!fs.existsSync(path.join(root,f)))failures.push('Missing '+f);}
function has(f,s){return fs.existsSync(path.join(root,f))&&fs.readFileSync(path.join(root,f),'utf8').includes(s);}
if(!has('src/ui/SCIIP_GISWorkspace.gs','sciipGisWorkspaceSnapshot'))failures.push('GIS snapshot entry point missing');
if(!has('src/ui/SCIIP_GISWorkspace.gs','sciipGisWorkspaceFeature'))failures.push('GIS feature entry point missing');
if(!has('src/ui/SCIIP_UI_App.html','renderGisWorkspace'))failures.push('GIS client renderer missing');
if(!has('src/ui/SCIIP_UI_App.html','gisMarker'))failures.push('GIS marker renderer missing');
if(!has('src/ui/SCIIP_GISWorkspace_Tests.gs','sciipTestGisWorkspaceAlphaV7'))failures.push('Apps Script test missing');
const result={framework:'SCIIP_GIS_WORKSPACE_ALPHA_CERTIFICATION',version:'v7.0-alpha.1',status:failures.length?'FAILED':'PASSED',checks:{files:required.every(f=>fs.existsSync(path.join(root,f))),snapshot:has('src/ui/SCIIP_GISWorkspace.gs','snapshot:snapshot'),featureLookup:has('src/ui/SCIIP_GISWorkspace.gs','feature:feature'),coordinateValidation:has('src/ui/SCIIP_GISWorkspace.gs','isValidCoordinate:validCoordinate_'),clientRendering:has('src/ui/SCIIP_UI_App.html','renderGisWorkspace'),responsive:has('src/ui/SCIIP_GISWorkspace_Styles.html','@media')},failures};
console.log(JSON.stringify(result,null,2));if(failures.length)process.exit(1);
