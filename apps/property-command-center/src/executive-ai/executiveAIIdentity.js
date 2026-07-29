const normalize=v=>String(v??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function createExecutiveAIIdentity({assignmentId,purpose,actorId}){if(!assignmentId||!purpose||!actorId)throw new Error('assignmentId, purpose, and actorId are required');return`EAI-${normalize(assignmentId)}-${normalize(purpose)}-${normalize(actorId)}`.toUpperCase()}
