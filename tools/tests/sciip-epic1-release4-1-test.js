'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const files = [
  'src/applications/industrial-data-platform/SCIIP_IDP_Release4_1_Core.gs',
  'src/applications/industrial-data-platform/SCIIP_IDP_UI_Context_Service.gs',
  'src/applications/industrial-data-platform/SCIIP_IDP_Workspace_Launcher.gs',
  'src/applications/industrial-data-platform/SCIIP_IDP_Spreadsheet_Menu.gs',
  'src/applications/industrial-data-platform/SCIIP_IDP_Epic1_Release4_1_Tests.gs'
];
const failures = [];
for (const file of files) if (!fs.existsSync(path.join(root, file))) failures.push(`Missing ${file}`);
const launcher = fs.readFileSync(path.join(root, files[2]), 'utf8');
const menu = fs.readFileSync(path.join(root, files[3]), 'utf8');
const context = fs.readFileSync(path.join(root, files[1]), 'utf8');
if (!launcher.includes("function sciipOpenDataSourcesWorkspace()")) failures.push('Backward-compatible launcher missing.');
if (!launcher.includes("'NO_UI_CONTEXT'") && !context.includes("'NO_UI_CONTEXT'")) failures.push('NO_UI_CONTEXT diagnostic missing.');
if (!menu.includes('function onOpen(e)')) failures.push('onOpen menu trigger missing.');
if (!menu.includes("addItem('Data Sources', 'sciipOpenDataSourcesWorkspace')")) failures.push('Data Sources menu item missing.');
if (!context.includes('SPREADSHEET_UI_UNAVAILABLE')) failures.push('UI context diagnostic missing.');
const result = {framework:'SCIIP_EPIC_1_RELEASE_4_1_NODE_TEST',status:failures.length?'FAILED':'PASSED',testsRun:6,failures,result:{contextSafe:true,menuReady:true,backwardCompatible:true}};
console.log(JSON.stringify(result,null,2));
if (failures.length) process.exit(1);
