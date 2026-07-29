export const ASSIGNMENT_TYPES = Object.freeze({
  LISTING: 'Listing',
  BUYER_REQUIREMENT: 'Buyer Requirement',
  LEASE_REQUIREMENT: 'Lease Requirement',
  DEVELOPMENT: 'Development',
  CONSULTING: 'Consulting',
  RESEARCH: 'Research'
});

const common = ['Platform Runtime','Market Intelligence','Intelligence Platform','Integration Platform','Enterprise Collaboration','Enterprise Foundation','Executive Command Center','Executive Summary','Morning Brief','Property Digital Twin','Assignment Health','Production Data Certification','Evidence Inspector','Temporal Intelligence','SuperSheet Ingestion','Knowledge Graph','GIS Intelligence','Opportunity Intelligence','Decision Intelligence','Executive AI','Enterprise Operations','Enterprise Knowledge Graph','Real-Time Intelligence','Enterprise Production'];
const close = ['Relationships','Documents','Timeline','AI Assistant','Action Center'];

const workspace = (type, focus, tabs, capabilities) => Object.freeze({
  type, focus, tabs: Object.freeze(tabs), capabilities: Object.freeze(capabilities)
});

export const WORKSPACE_REGISTRY = Object.freeze({
  [ASSIGNMENT_TYPES.LISTING]: workspace(
    ASSIGNMENT_TYPES.LISTING,
    'Market positioning, property intelligence, and execution',
    [...common,'Property Overview','Competition','Comparable Transactions','Available Properties',...close.slice(0,1),'Marketing',...close.slice(1)],
    ['property','competition','comparables','availability','marketing','relationships']
  ),
  [ASSIGNMENT_TYPES.BUYER_REQUIREMENT]: workspace(
    ASSIGNMENT_TYPES.BUYER_REQUIREMENT,
    'Acquisition discovery, screening, and decision support',
    [...common,'Requirement Criteria','Matching Properties','Comparable Transactions','Market Analysis',...close],
    ['criteria','matching','comparables','market','relationships']
  ),
  [ASSIGNMENT_TYPES.LEASE_REQUIREMENT]: workspace(
    ASSIGNMENT_TYPES.LEASE_REQUIREMENT,
    'Occupancy discovery, property matching, and lease decision support',
    [...common,'Requirement Criteria','Matching Properties','Comparable Transactions','Market Analysis',...close],
    ['criteria','matching','comparables','market','relationships']
  ),
  [ASSIGNMENT_TYPES.DEVELOPMENT]: workspace(
    ASSIGNMENT_TYPES.DEVELOPMENT,
    'Site, entitlement, feasibility, delivery, and market intelligence',
    [...common,'Project Overview','Site & Entitlements','Feasibility','Market Analysis','Comparable Transactions','Development Pipeline','Relationships','Documents','Timeline','AI Assistant','Action Center'],
    ['site','entitlements','feasibility','pipeline','comparables','relationships']
  ),
  [ASSIGNMENT_TYPES.CONSULTING]: workspace(
    ASSIGNMENT_TYPES.CONSULTING,
    'Structured analysis, evidence, recommendations, and delivery',
    [...common,'Engagement Scope','Analysis','Evidence Library','Recommendations','Relationships','Documents','Timeline','AI Assistant','Action Center'],
    ['scope','analysis','evidence','recommendations','relationships']
  ),
  [ASSIGNMENT_TYPES.RESEARCH]: workspace(
    ASSIGNMENT_TYPES.RESEARCH,
    'Question-driven research, evidence synthesis, and institutional memory',
    [...common,'Research Question','Market Analysis','Evidence Library','Findings','Relationships','Documents','Timeline','AI Assistant','Action Center'],
    ['question','market','evidence','findings','relationships']
  )
});

export function getWorkspaceDefinition(type) {
  const definition = WORKSPACE_REGISTRY[type];
  if (!definition) throw new Error(`Unknown assignment type: ${type}`);
  return definition;
}

export function assertWorkspaceRegistry() {
  const required = Object.values(ASSIGNMENT_TYPES);
  const errors = [];
  required.forEach(type => {
    const entry = WORKSPACE_REGISTRY[type];
    if (!entry) errors.push(`Missing workspace: ${type}`);
    if (!entry?.tabs?.length) errors.push(`Workspace has no tabs: ${type}`);
    if (new Set(entry?.tabs || []).size !== (entry?.tabs || []).length) errors.push(`Duplicate tabs: ${type}`);
    ['Executive Summary','Morning Brief','Assignment Health','AI Assistant','Action Center'].forEach(tab => {
      if (!entry?.tabs?.includes(tab)) errors.push(`${type} missing required tab: ${tab}`);
    });
  });
  const serialized = JSON.stringify(WORKSPACE_REGISTRY);
  if (serialized.includes('Tenant Requirement')) errors.push('Legacy Tenant Requirement terminology remains');
  return { valid: errors.length === 0, errors, workspaceCount: required.length };
}

export const canonicalPropertyIdentityWorkspace = { id: "canonical-property-identity", label: "Property Identity", group: "Intelligence" };

export const identityReviewGovernanceWorkspace = { id: "identity-review-governance", label: "Identity Review", group: "Intelligence" };
