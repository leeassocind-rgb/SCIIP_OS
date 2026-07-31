export const EXECUTIVE_ONTOLOGY=Object.freeze([
{term:'ExecutiveDecision',kind:'ENTITY',version:'1.0.0'},
{term:'ExecutiveRecommendation',kind:'ENTITY',version:'1.0.0'},
{term:'ExecutionOutcome',kind:'ENTITY',version:'1.0.0'},
{term:'EvidenceArtifact',kind:'ENTITY',version:'1.0.0'},
{term:'SUPPORTED_BY',kind:'RELATIONSHIP',version:'1.0.0'},
{term:'PRODUCED_OUTCOME',kind:'RELATIONSHIP',version:'1.0.0'},
{term:'RECOMMENDS',kind:'RELATIONSHIP',version:'1.0.0'},
{term:'DERIVED_FROM_SIGNAL',kind:'RELATIONSHIP',version:'1.0.0'}]);
export function registerExecutiveDecisionOntology(registry){if(!registry?.register)throw new Error('ontology registry required');return Object.freeze(EXECUTIVE_ONTOLOGY.map(term=>registry.register(term)));}
