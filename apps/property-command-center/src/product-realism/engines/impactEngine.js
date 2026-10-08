import{createAssignmentImpact}from'../domain.js';
export function computeAssignmentImpacts(input,events){const impacts=[];
 for(const assignment of input.assignments){for(const event of events){let classification=null,score=0,explanation='';
 const directProperty=event.entityIds.some(id=>assignment.propertyIds?.includes(id)||assignment.competitorPropertyIds?.includes(id));
 const directRequirement=event.entityIds.some(id=>assignment.requirementIds?.includes(id));
 if(directProperty||directRequirement){classification='DIRECT';score=directProperty?92:95;explanation=`${event.title} directly intersects the assignment property, competitor, or requirement set.`}
 else if(event.submarket===assignment.submarket){classification='INDIRECT';score=72;explanation=`${event.title} changes the assignment's submarket context and may affect positioning or urgency.`}
 else if(['LEASE_COMPARABLE_ADDED','SALE_COMPARABLE_ADDED','REQUIREMENT_CREATED'].includes(event.type)){classification='INDIRECT';score=58;explanation=`${event.title} may influence broader pricing, demand, or client expectations.`}
 if(classification)impacts.push(createAssignmentImpact({id:`IMP-${assignment.id}-${event.id}`,assignmentId:assignment.id,eventId:event.id,classification,relevanceScore:score,explanation,strategyEffect:event.severity==='HIGH'?'REVIEW_BEFORE_NEXT_CALL':'MONITOR',evidenceIds:event.evidenceIds}))}}
 return Object.freeze(impacts.sort((a,b)=>b.relevanceScore-a.relevanceScore))}
