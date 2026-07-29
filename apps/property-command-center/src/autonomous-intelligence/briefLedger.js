const ledger=[];const clone=v=>JSON.parse(JSON.stringify(v));
export function publishBrief(brief,{actorId}={}){if(!actorId)throw new Error('actorId is required');if(!brief?.briefId)throw new Error('brief is required');const key=`${brief.briefId}:${brief.assignmentId}`;const existing=ledger.find(x=>x.key===key);if(existing)return clone(existing);const row={key,briefId:brief.briefId,assignmentId:brief.assignmentId,publishedAt:new Date().toISOString(),actorId,brief:clone(brief)};ledger.push(Object.freeze(row));return clone(row)}
export function readBriefLedger({assignmentId}={}){return clone(assignmentId?ledger.filter(x=>x.assignmentId===assignmentId):ledger)}
export function resetBriefLedger(){ledger.length=0}
