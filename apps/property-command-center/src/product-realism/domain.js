const freeze=value=>Object.freeze(value);
const required=(value,name)=>{if(value===undefined||value===null||value==='')throw new Error(`Missing required field: ${name}`);return value};

export function createEvidence(input){return freeze({
  id:required(input.id,'evidence.id'),sourceType:required(input.sourceType,'evidence.sourceType'),
  sourceName:required(input.sourceName,'evidence.sourceName'),sourceRecordId:required(input.sourceRecordId,'evidence.sourceRecordId'),
  observedAt:required(input.observedAt,'evidence.observedAt'),confidencePct:Number(input.confidencePct??100),
  fields:freeze({...input.fields}),checksum:input.checksum||null
})}

export function createMarketEvent(input){return freeze({
  id:required(input.id,'event.id'),type:required(input.type,'event.type'),submarket:required(input.submarket,'event.submarket'),
  occurredAt:required(input.occurredAt,'event.occurredAt'),title:required(input.title,'event.title'),detail:required(input.detail,'event.detail'),
  severity:input.severity||'MEDIUM',confidencePct:Number(input.confidencePct??90),entityIds:freeze([...(input.entityIds||[])]),
  evidenceIds:freeze([...(input.evidenceIds||[])]),attributes:freeze({...input.attributes}),immutable:true
})}

export function createMarketSnapshot(input){return freeze({
  id:required(input.id,'snapshot.id'),submarket:required(input.submarket,'snapshot.submarket'),generatedAt:required(input.generatedAt,'snapshot.generatedAt'),
  comparisonStart:required(input.comparisonStart,'snapshot.comparisonStart'),comparisonEnd:required(input.comparisonEnd,'snapshot.comparisonEnd'),
  metrics:freeze({...input.metrics}),eventIds:freeze([...(input.eventIds||[])]),evidenceIds:freeze([...(input.evidenceIds||[])]),
  confidencePct:Number(input.confidencePct??0),freshnessMinutes:Number(input.freshnessMinutes??0),summary:input.summary||'',version:Number(input.version??1)
})}

export function createAssignmentImpact(input){return freeze({
  id:required(input.id,'impact.id'),assignmentId:required(input.assignmentId,'impact.assignmentId'),eventId:required(input.eventId,'impact.eventId'),
  classification:required(input.classification,'impact.classification'),relevanceScore:Number(input.relevanceScore??0),
  explanation:required(input.explanation,'impact.explanation'),strategyEffect:input.strategyEffect||'REVIEW',evidenceIds:freeze([...(input.evidenceIds||[])])
})}

export function createRecommendation(input){return freeze({
  id:required(input.id,'recommendation.id'),title:required(input.title,'recommendation.title'),assignmentId:input.assignmentId||null,
  priority:input.priority||'MEDIUM',urgency:input.urgency||'NORMAL',expectedValue:input.expectedValue||'MEDIUM',
  confidencePct:Number(input.confidencePct??0),why:required(input.why,'recommendation.why'),nextStep:required(input.nextStep,'recommendation.nextStep'),
  evidenceIds:freeze([...(input.evidenceIds||[])]),eventIds:freeze([...(input.eventIds||[])]),reportSection:input.reportSection||null,
  owner:input.owner||'Spencer',dueAt:input.dueAt||null,status:input.status||'PENDING',estimatedMinutes:Number(input.estimatedMinutes??5)
})}

export function createBrokerReadiness(input){return freeze({
  id:required(input.id,'readiness.id'),generatedAt:required(input.generatedAt,'readiness.generatedAt'),scorePct:Number(input.scorePct??0),
  totalItems:Number(input.totalItems??0),completedItems:Number(input.completedItems??0),outstandingRecommendationIds:freeze([...(input.outstandingRecommendationIds||[])]),
  estimatedMinutes:Number(input.estimatedMinutes??0),status:input.status||'PREPARATION_REQUIRED'
})}
