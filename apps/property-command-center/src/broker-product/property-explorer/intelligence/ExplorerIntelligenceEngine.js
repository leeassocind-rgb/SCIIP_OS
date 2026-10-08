const F=v=>Object.freeze(v);
export const EXPLORER_INTELLIGENCE_VERSION='2.0.0';
export function interpretExplorerCommand(input=''){
 const raw=String(input).trim(),lower=raw.toLowerCase();
 const c={raw,objective:'RESEARCH',submarket:'',owner:'',minBuildingSf:null,minClearHeightFt:null,minPowerAmps:null,statuses:[]};const chips=[];
 for(const m of['South Bay','Inland Empire West','Inland Empire East','San Gabriel Valley','Orange County'])if(lower.includes(m.toLowerCase())){c.submarket=m;chips.push({key:'submarket',label:m});break;}
 const o=raw.match(/owned by\s+([a-z0-9 &.-]+)/i);if(o){c.owner=o[1].trim();chips.push({key:'owner',label:c.owner});}
 const sf=raw.match(/(?:over|above|at least|minimum|min)\s+([\d,]+)\s*(?:sf|square feet)?/i);if(sf){c.minBuildingSf=Number(sf[1].replaceAll(',',''));chips.push({key:'minBuildingSf',label:`${c.minBuildingSf.toLocaleString()} SF+`});}
 const ch=raw.match(/(\d{2})\s*(?:feet|ft|')\s*clear/i);if(ch){c.minClearHeightFt=Number(ch[1]);chips.push({key:'minClearHeightFt',label:`${c.minClearHeightFt}′ Clear+`});}
 const pw=raw.match(/([\d,]+)\s*\+?\s*amps?/i);if(pw){c.minPowerAmps=Number(pw[1].replaceAll(',',''));chips.push({key:'minPowerAmps',label:`${c.minPowerAmps.toLocaleString()} Amps+`});}
 if(/available/i.test(raw)){c.statuses=['AVAILABLE','UNDER CONSTRUCTION'];chips.push({key:'statuses',label:'Available'});}
 if(/compete|competition|competitor/i.test(raw))c.objective='LISTING_COMPETITION';
 return F({raw,criteria:F(c),chips:F(chips),governedQuery:query(c)});
}
export function createExplorerIntelligenceEngine({properties=[],requirements=[],comparables=[],assignments=[],marketMetrics={},layerRegistry}={}){
 const s={properties:F([...properties]),requirements:F([...requirements]),comparables:F([...comparables]),assignments:F([...assignments]),marketMetrics:F({...marketMetrics}),layerRegistry};
 return F({version:EXPLORER_INTELLIGENCE_VERSION,search:interpretExplorerCommand,rank:c=>rankProperties(s.properties,c,s),context:id=>context(id,s),explain:(id,c)=>explain(id,c,s),assignmentAwareness:id=>awareness(id,s),layers:()=>layerRegistry?.list?.()||F([])});
}
export function rankProperties(properties=[],c={},s={}){return F(properties.map(p=>({property:p,...score(p,c,s)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).map(F));}
function score(p,c,s){let total=10;const reasons=[],warnings=[];
 if(c.submarket){if(p.submarket!==c.submarket)return {score:0,reasons:F([]),warnings:F(['Outside target submarket'])};total+=20;reasons.push(`Matches ${c.submarket}`);}
 if(c.owner){const t=[p.ownerParent,p.ownerLegal,...(p.ownerAliases||[])].filter(Boolean).join(' ').toLowerCase();if(!t.includes(c.owner.toLowerCase()))return {score:0,reasons:F([]),warnings:F(['Owner mismatch'])};total+=15;reasons.push(`Owned by ${p.ownerParent}`);}
 if(c.minBuildingSf){if((p.buildingSf||0)<c.minBuildingSf)return {score:0,reasons:F([]),warnings:F(['Below minimum size'])};total+=15;reasons.push('Meets size requirement');}
 if(c.minClearHeightFt){if(p.clearHeightFt==null)warnings.push('Clear height missing');else if(p.clearHeightFt<c.minClearHeightFt)return {score:0,reasons:F([]),warnings:F(['Below clear-height minimum'])};else{total+=12;reasons.push('Meets clear-height requirement');}}
 if(c.minPowerAmps){if(p.powerAmps==null)warnings.push('Power missing');else if(p.powerAmps<c.minPowerAmps)return {score:0,reasons:F([]),warnings:F(['Below power minimum'])};else{total+=12;reasons.push('Meets power requirement');}}
 if(c.statuses?.length){if(!c.statuses.includes(p.status))return {score:0,reasons:F([]),warnings:F(['Status mismatch'])};total+=10;reasons.push(`Status: ${p.status}`);}
 const a=s.assignments?.filter(x=>x.propertyId===p.id)||[];if(a.length){total+=8;reasons.push('Related active assignment');}
 const r=s.requirements?.filter(x=>matchReq(p,x))||[];if(r.length){total+=Math.min(8,r.length*4);reasons.push(`${r.length} matching requirement${r.length===1?'':'s'}`);}
 return {score:Math.min(100,total),reasons:F(reasons),warnings:F(warnings)};
}
function context(id,s){const p=s.properties.find(x=>x.id===id);if(!p)return null;const m=s.properties.filter(x=>x.submarket===p.submarket);const a=m.filter(x=>['AVAILABLE','UNDER CONSTRUCTION'].includes(x.status));const r=s.requirements.filter(x=>matchReq(p,x));const c=s.comparables.filter(x=>x.submarket===p.submarket);const metric=s.marketMetrics[p.submarket]||{};return F({propertyId:id,submarket:p.submarket,vacancyRate:metric.vacancyRate??null,askingRateYoY:metric.askingRateYoY??null,competingProperties:Math.max(0,a.length-1),recentComparables:c.length,matchingRequirements:r.length,powerPercentile:Math.round((m.filter(x=>(x.powerAmps||0)<=(p.powerAmps||0)).length/Math.max(1,m.length))*100),summary:`${p.address} is positioned within ${p.submarket}. ${Math.max(0,a.length-1)} competing properties, ${c.length} recent comparables, and ${r.length} matching requirements provide current market context.`});}
function explain(id,c,s){const p=s.properties.find(x=>x.id===id);if(!p)return null;const sc=score(p,c,s);return F({propertyId:id,score:sc.score,headline:`Why ${p.address} ranked here`,reasons:sc.reasons,warnings:sc.warnings,evidence:F([`PROPERTY:${id}`,...(p.sourceEvidenceIds||[])])});}
function awareness(id,s){const a=s.assignments.filter(x=>x.propertyId===id);return F({propertyId:id,hasAssignment:a.length>0,assignments:F(a),primaryAction:a.length?'OPEN_ASSIGNMENT':'CREATE_ASSIGNMENT'});}
function matchReq(p,r){return (!r.submarket||r.submarket===p.submarket)&&(!r.minSf||p.buildingSf>=r.minSf)&&(!r.maxSf||p.buildingSf<=r.maxSf)&&(!r.minClearHeightFt||p.clearHeightFt>=r.minClearHeightFt)&&(!r.minPowerAmps||p.powerAmps>=r.minPowerAmps);}
function query(c){const q=[];if(c.submarket)q.push(`submarket = "${c.submarket}"`);if(c.owner)q.push(`owner_family CONTAINS "${c.owner}"`);if(c.minBuildingSf)q.push(`building_sf >= ${c.minBuildingSf}`);if(c.minClearHeightFt)q.push(`clear_height_ft >= ${c.minClearHeightFt}`);if(c.minPowerAmps)q.push(`power_amps >= ${c.minPowerAmps}`);if(c.statuses?.length)q.push(`status IN ${JSON.stringify(c.statuses)}`);q.push(`objective = "${c.objective}"`);return q.join('\nAND ');}
