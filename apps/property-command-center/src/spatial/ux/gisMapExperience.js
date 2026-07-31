const freeze=value=>Object.freeze(value);
const safe=value=>Array.isArray(value)?value:[];
export function createGisMapExperience({subject=null,ranked=[],mode='nearest',radius=25}={}){
 const shortlist=safe(ranked).slice(0,10).map((item,index)=>freeze({
  id:item.id,
  rank:index+1,
  label:item.label||item.id,
  city:item.attributes?.city||item.attributes?.market||'Unknown',
  buildingSf:Number(item.buildingSf||0),
  powerAmps:Number(item.powerAmps||0),
  clearHeight:Number(item.clearHeight||0),
  distanceMiles:Number(item.distanceMiles||0),
  score:Number(mode==='sites'?item.siteScore?.score:mode==='comparables'?item.comparison?.score:item.distanceMiles||0),
  explanation:freeze([...(item.siteScore?.explanation||[])])
 }));
 return freeze({
  mode,
  radius:Number(radius||0),
  subject:subject?freeze({id:subject.id,label:subject.label,coordinates:subject.coordinates}):null,
  shortlist:freeze(shortlist),
  shortlistCount:shortlist.length,
  nearestDistance:shortlist.length?Math.min(...shortlist.map(item=>item.distanceMiles)):null,
  averageScore:shortlist.length?Number((shortlist.reduce((sum,item)=>sum+item.score,0)/shortlist.length).toFixed(1)):0,
  mapReady:Boolean(subject?.coordinates),
  deterministicMath:true,
  assignmentScoped:true,
  brokerControlled:true
 });
}
