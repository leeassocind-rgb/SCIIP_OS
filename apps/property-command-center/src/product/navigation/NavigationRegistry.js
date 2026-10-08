const freeze=value=>Object.freeze(value);

export const NAVIGATION_REGISTRY_VERSION='1.1.0';

export const CANONICAL_NAVIGATION=freeze([
  freeze({
    id:'Home',
    label:'Home',
    icon:'LayoutDashboard',
    purpose:'Executive overview',
    priority:1
  }),
  freeze({
    id:'Morning Brief',
    label:'Morning Brief',
    icon:'Sunrise',
    purpose:'What changed since yesterday',
    priority:2
  }),
  freeze({
    id:'Assignments',
    label:'Assignments',
    icon:'BriefcaseBusiness',
    purpose:'Client execution and reporting',
    priority:3
  }),
  freeze({
    id:'Explorer',
    label:'Explorer',
    icon:'Map',
    purpose:'Property research, mapping, and prospecting',
    priority:4
  }),
  freeze({
    id:'Copilot',
    label:'Copilot',
    icon:'Sparkles',
    purpose:'AI analysis and workflow assistance',
    priority:5
  })
]);

export const NAVIGATION_ALIASES=freeze({
  home:'Home',
  executive:'Home',
  morning:'Morning Brief',
  'morning brief':'Morning Brief',
  assignment:'Assignments',
  assignments:'Assignments',
  explorer:'Explorer',
  properties:'Explorer',
  property:'Explorer',
  map:'Explorer',
  maps:'Explorer',
  search:'Explorer',
  copilot:'Copilot',
  ai:'Copilot'
});

export const HIDDEN_ADVANCED_DESTINATIONS=freeze([
  'Timeline',
  'Search',
  'Platform Runtime',
  'Production Operations',
  'Enterprise Foundation',
  'Certification Center',
  'Pilot Operations',
  'Canary Operations',
  'Promotion Pipeline',
  'Go-Live Readiness Center',
  'Production Activation Center',
  'SCIIP Design System Foundations'
]);

export function createNavigationForSurface(surface='broker'){
  const normalized=String(surface||'broker').toLowerCase();
  const supported=['broker','product-shell','phase19','phase20'];
  if(!supported.includes(normalized)){
    throw new Error(`Unsupported navigation surface: ${surface}`);
  }
  return freeze(CANONICAL_NAVIGATION.map(item=>freeze({...item})));
}

export function resolveNavigationId(value){
  const raw=String(value||'').trim();
  if(!raw)return 'Home';

  const direct=CANONICAL_NAVIGATION.find(
    item=>item.id===raw||item.label===raw
  );
  if(direct)return direct.id;

  return NAVIGATION_ALIASES[raw.toLowerCase()]||'Home';
}

export function assertNavigationRegistry(navigation=CANONICAL_NAVIGATION){
  const errors=[];
  const ids=navigation.map(item=>item.id);
  const labels=navigation.map(item=>item.label);
  const expected=['Home','Morning Brief','Assignments','Explorer','Copilot'];

  if(navigation.length!==5){
    errors.push('Expected exactly 5 broker destinations');
  }
  if(new Set(ids).size!==ids.length){
    errors.push('Duplicate navigation ids');
  }
  if(new Set(labels).size!==labels.length){
    errors.push('Duplicate navigation labels');
  }

  for(const label of expected){
    if(!labels.includes(label)){
      errors.push(`Missing navigation destination: ${label}`);
    }
  }

  for(const hidden of HIDDEN_ADVANCED_DESTINATIONS){
    if(labels.includes(hidden)){
      errors.push(`Hidden destination exposed: ${hidden}`);
    }
  }

  return freeze({
    valid:errors.length===0,
    errors:freeze(errors),
    destinationCount:navigation.length,
    registryVersion:NAVIGATION_REGISTRY_VERSION,
    technicalWorkspacesHidden:true,
    explorerConsolidated:true
  });
}
