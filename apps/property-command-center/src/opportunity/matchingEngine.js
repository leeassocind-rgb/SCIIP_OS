const number=value=>{const parsed=Number(String(value??'').replace(/[^0-9.-]/g,''));return Number.isFinite(parsed)?parsed:0};
const text=value=>String(value??'').trim();
const norm=value=>text(value).toLowerCase();
const clamp=value=>Math.max(0,Math.min(100,value));

export const DEFAULT_MATCH_WEIGHTS=Object.freeze({
  buildingSf:.26,
  geography:.18,
  powerAmps:.14,
  clearHeight:.12,
  availability:.12,
  evidence:.10,
  relationship:.08
});

export function requirementFromAssignment(assignment={}){
  const source=assignment.requirement||assignment.criteria||assignment;
  return Object.freeze({
    assignmentId:text(assignment.id),
    assignmentType:text(assignment.type),
    buildingSf:number(source.buildingSf??source.minSf??source.size),
    maxBuildingSf:number(source.maxBuildingSf??source.maxSf),
    powerAmps:number(source.powerAmps??source.minPowerAmps),
    clearHeight:number(source.clearHeight??source.minClearHeight),
    geography:text(source.geography??source.location??assignment.location),
    requiredStatus:text(source.requiredStatus||'available'),
    targetUse:text(source.targetUse??source.use),
    maxDistanceMiles:number(source.maxDistanceMiles||50)
  });
}

function scoreMinimum(actual,required){
  if(!required)return 75;
  if(!actual)return 0;
  return clamp(actual/required*100);
}
function scoreSize(actual,min,max){
  if(!min&&!max)return 75;
  if(!actual)return 0;
  if(min&&actual<min)return clamp(actual/min*100);
  if(max&&actual>max)return clamp(max/actual*100);
  const target=max&&min?(min+max)/2:min||max;
  return clamp(100-Math.abs(actual-target)/Math.max(target,1)*35);
}
function scoreGeography(property,requirement){
  const target=norm(requirement.geography);
  if(!target)return 75;
  const values=[property.attributes?.city,property.attributes?.market,property.attributes?.submarket,property.attributes?.county,property.label].map(norm);
  return values.some(value=>value&&target.includes(value)||value&&value.includes(target))?100:45;
}
function scoreAvailability(property,requirement){
  const status=norm(property.status??property.attributes?.status);
  const required=norm(requirement.requiredStatus);
  if(!required)return 75;
  if(status.includes(required))return 100;
  if(/available|existing|direct|sublease/.test(status))return 85;
  if(/under construction|planned|future/.test(status))return 55;
  return 35;
}
function evidenceScore(property){
  const count=number(property.evidenceCount??property.attributes?.evidenceCount??property.evidence?.length);
  return count?clamp(55+count*9):55;
}
function relationshipScore(property){
  const strength=number(property.relationshipStrength??property.attributes?.relationshipStrength);
  return strength?clamp(strength):60;
}

export function scorePropertyMatch(property,requirement,weights=DEFAULT_MATCH_WEIGHTS){
  const metrics={
    buildingSf:scoreSize(number(property.buildingSf??property.attributes?.buildingSf??property.attributes?.availableSf),requirement.buildingSf,requirement.maxBuildingSf),
    geography:scoreGeography(property,requirement),
    powerAmps:scoreMinimum(number(property.powerAmps??property.attributes?.powerAmps),requirement.powerAmps),
    clearHeight:scoreMinimum(number(property.clearHeight??property.attributes?.clearHeight),requirement.clearHeight),
    availability:scoreAvailability(property,requirement),
    evidence:evidenceScore(property),
    relationship:relationshipScore(property)
  };
  const score=Object.entries(weights).reduce((sum,[key,weight])=>sum+(metrics[key]||0)*weight,0);
  const strengths=Object.entries(metrics).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([key,value])=>({key,value:Math.round(value)}));
  const gaps=Object.entries(metrics).filter(([,value])=>value<65).sort((a,b)=>a[1]-b[1]).slice(0,3).map(([key,value])=>({key,value:Math.round(value)}));
  return Object.freeze({score:Number(score.toFixed(1)),metrics:Object.freeze(metrics),strengths:Object.freeze(strengths),gaps:Object.freeze(gaps)});
}

export function rankPropertyMatches(properties=[],requirement={},options={}){
  const limit=Number(options.limit||25);
  return properties.map(property=>Object.freeze({...property,match:scorePropertyMatch(property,requirement,options.weights||DEFAULT_MATCH_WEIGHTS)})).sort((a,b)=>b.match.score-a.match.score||String(a.id).localeCompare(String(b.id))).slice(0,limit);
}
