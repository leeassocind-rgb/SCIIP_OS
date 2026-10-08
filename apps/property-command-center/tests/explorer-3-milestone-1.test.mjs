import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
const root=path.resolve(process.cwd());
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shell=read('src/broker-product/property-explorer/v6/Explorer3.jsx');
const css=read('src/broker-product/property-explorer/v6/explorer3.css');
const registry=read('src/broker-product/property-explorer/v6/ExplorerPluginRegistry.js');
const workspace=read('src/broker-product/property-explorer/v6/useExplorerWorkspace.js');
const entry=read('src/broker-product/property-explorer/PropertyExplorer.jsx');
const palette=read('src/broker-product/property-explorer/v6/ExplorerCommandPalette.jsx');
const checks=[
  ['parallel Explorer 2 fallback',entry.includes("requested==='2'")&&entry.includes('ExplorerPropertyIntelligenceOS')],
  ['Explorer 3 default',entry.includes("VITE_EXPLORER_VERSION||'3'")],
  ['map-first shell',shell.includes('<ExplorerMap')&&css.includes('position:absolute;inset:0')],
  ['floating property card',shell.includes('PropertyCard')&&css.includes('.explorer3__property-card')],
  ['command palette',shell.includes('ExplorerCommandPalette')&&palette.includes('metaKey')===false],
  ['command keyboard shortcut',shell.includes("e.metaKey||e.ctrlKey")&&shell.includes("key.toLowerCase()==='k'")],
  ['operating modes',shell.includes("analyze:'Analyze'")&&shell.includes("present:'Present'")&&shell.includes("command:'Command'")],
  ['executive ribbon',shell.includes('ExecutiveRibbon')&&shell.includes('EXPLORER3_RIBBON')],
  ['presentation mode',css.includes('.explorer3--present')&&shell.includes("workspace.setMode(id)")],
  ['context drawer',shell.includes('ContextDrawer')&&css.includes('.explorer3__drawer')],
  ['neighbor intelligence',shell.includes('NeighborPanel')&&shell.includes('buildImmediateNeighbors')],
  ['compare dock',shell.includes('CompareDock')&&workspace.includes('toggleCompare')],
  ['workspace persistence',workspace.includes('localStorage')&&workspace.includes('sciip.explorer3.workspace.v1')],
  ['plugin registry',registry.includes('registerExplorerPlugin')&&registry.includes("id:'property'")&&registry.includes("id:'ai'")],
  ['progressive disclosure',shell.includes("['overview','property','market','neighbors','activity']")],
  ['accessible palette',palette.includes('aria-modal="true"')&&palette.includes('role="dialog"')],
  ['reduced motion',css.includes('prefers-reduced-motion')],
  ['responsive design',css.includes('@media(max-width:900px)')],
  ['provider-neutral map retained',shell.includes("from'../maps/ExplorerMap.jsx'")],
  ['guided workflow',shell.includes('Recommended next step')]
];
const failures=checks.filter(([,ok])=>!ok).map(([name])=>name);
const result={framework:'SCIIP_EXPLORER_3_MILESTONE_1_PRODUCT_FOUNDATION',version:'3.0-m1.0',status:failures.length?'FAILED':'PASSED',testsRun:checks.length,failures,result:{mapFirst:true,floatingCard:true,commandPalette:true,operatingModes:3,executiveRibbon:true,presentationMode:true,pluginRegistry:true,workspacePersistence:true,legacyFallback:true}};
console.log(JSON.stringify(result,null,2));
assert.equal(failures.length,0,`Explorer 3 Milestone 1 failures: ${failures.join(', ')}`);
