import{appendCollaborationEntry,readCollaborationLedger}from'./collaborationLedger.js';
const normalizeMentions=text=>[...new Set((String(text).match(/@[a-zA-Z0-9._-]+/g)||[]).map(v=>v.slice(1).toLowerCase()))].sort();
export function createComment({assignmentId,resourceType='ASSIGNMENT',resourceId,text,authorId='current-user'}){const body=String(text||'').trim();if(!assignmentId||!resourceId||!body)throw new Error('assignmentId, resourceId, and text are required');return appendCollaborationEntry('COMMENT_CREATED',{resourceType:String(resourceType),resourceId:String(resourceId),text:body,mentions:normalizeMentions(body)},{assignmentId,actorId:authorId})}
export function listComments({assignmentId,resourceId}={}){return readCollaborationLedger({assignmentId,type:'COMMENT_CREATED'}).filter(e=>!resourceId||e.payload.resourceId===String(resourceId))}
export{normalizeMentions};
