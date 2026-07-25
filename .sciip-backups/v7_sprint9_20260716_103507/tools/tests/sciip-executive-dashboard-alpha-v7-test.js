#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=process.cwd();
const required=['src/ui/SCIIP_ExecutiveDashboard.gs','src/ui/SCIIP_ExecutiveDashboard_Tests.gs','src/ui/SCIIP_Desktop.gs','src/ui/SCIIP_UI_App.html','src/ui/SCIIP_UI_Styles.html'];
const missing=required.filter(f=>!fs.existsSync(path.join(root,f)));
const read=f=>missing.length?'':fs.readFileSync(path.join(root,f),'utf8');
const dashboard=read('src/ui/SCIIP_ExecutiveDashboard.gs'),desktop=read('src/ui/SCIIP_Desktop.gs'),app=read('src/ui/SCIIP_UI_App.html'),styles=read('src/ui/SCIIP_UI_Styles.html');
const checks={files:missing.length===0,version:/v7\.0-alpha\.1/.test(dashboard),snapshot:/function snapshot\(\)/.test(dashboard),fourKpis:/kpis:\[/.test(dashboard),certifiedDomains:/CERTIFIED_DOMAINS/.test(dashboard)&&/Knowledge Graph/.test(dashboard),serviceBinding:/SCIIP_SERVICE_CONTAINER/.test(dashboard),storageBinding:/SCIIP_STORAGE_BACKEND/.test(dashboard),storageActiveName:/getActiveName/.test(dashboard),storageHealthCheck:/SCIIP_STORAGE_BACKEND\.healthCheck/.test(dashboard),noLegacyGetDefault:!/getDefault/.test(dashboard),apiBinding:/SCIIP_API/.test(dashboard),desktopBinding:/executiveDashboard:/.test(desktop),clientRenderer:/renderExecutiveDashboard/.test(app),responsive:/dashboard-kpi-grid/.test(styles)};
const failures=Object.keys(checks).filter(k=>!checks[k]);
const out={framework:'SCIIP_EXECUTIVE_DASHBOARD_ALPHA_CERTIFICATION',version:'v7.0-alpha.1',status:failures.length?'FAILED':'PASSED',checks,missing,failures};
console.log(JSON.stringify(out,null,2));
if(failures.length)process.exit(1);
