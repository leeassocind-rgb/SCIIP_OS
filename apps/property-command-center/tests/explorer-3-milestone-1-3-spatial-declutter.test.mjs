import fs from'node:fs';import path from'node:path';
const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const jsx=read('src/broker-product/property-explorer/v6/Explorer3.jsx');
const css=read('src/broker-product/property-explorer/v6/explorer3.css');
const checks=[];const test=(name,ok)=>{checks.push({name,status:ok?'PASSED':'FAILED'});if(!ok)throw new Error(name);};

test('redundant property summary card removed',!jsx.includes('<PropertyCard property='));
test('property card implementation removed',!jsx.includes('function PropertyCard'));
test('collapsible property section component',jsx.includes('function DisclosureSection')&&jsx.includes('<details className="explorer3__disclosure"'));
test('building and site collapsible',jsx.includes('title="Building & Site"')&&jsx.includes('defaultOpen'));
test('ownership collapsible',jsx.includes('title="Ownership & Occupancy"'));
test('availability collapsible',jsx.includes('title="Availability"')&&jsx.includes('Current offering'));
test('lease comparable collapsible',jsx.includes('title="Lease Comparable"'));
test('sale comparable collapsible',jsx.includes('title="Sale Comparable"'));
test('evidence collapsible',jsx.includes('title="Evidence"'));
test('show on map has collapsible state',jsx.includes('visibilityOpen')&&jsx.includes('onOpenChange'));
test('vertical map data control',css.includes('.explorer3__visibility-toggle')&&css.includes('flex-direction:column!important'));
test('direct checkboxes preserved',jsx.includes('type="checkbox"')&&jsx.includes("available:'Available'"));
test('search remains bottom center',css.includes('.explorer3__search-dock,.explorer3__search-collapsed{bottom:18px!important}'));
test('basemap moved away from search',css.includes('.explorer3 .explorer-v5__map-tools{top:112px!important')&&css.includes('bottom:auto!important'));
test('drawer clears basemap lane',css.includes('.explorer3--drawer-open .explorer-v5__map-tools{right:424px!important}'));
test('map rail separated from search',css.includes('.explorer3__map-rail{top:170px!important'));
test('legend remains independently collapsible',jsx.includes('function MapLegend')&&jsx.includes('aria-expanded={open}'));
test('responsive control relocation',css.includes('@media(max-width:900px)')&&css.includes('top:112px!important'));

console.log(JSON.stringify({framework:'SCIIP_EXPLORER_3_MILESTONE_1_3_SPATIAL_DECLUTTER_PROGRESSIVE_PROPERTY_INTELLIGENCE',version:'explorer-3.0-m1.3',status:'PASSED',testsRun:checks.length,checks},null,2));
