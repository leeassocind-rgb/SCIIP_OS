export function buildMarketPositionTimeline(events=[]){
 return [...events].map(e=>({effectiveAt:new Date(e.effectiveAt).toISOString(),askingRate:Number(e.askingRate)||null,vacancyPct:Number(e.vacancyPct)||null,marketRank:Number(e.marketRank)||null,evidenceId:e.evidenceId||null})).sort((a,b)=>new Date(a.effectiveAt)-new Date(b.effectiveAt));
}
export function currentMarketPosition(timeline=[]){return timeline.length?timeline[timeline.length-1]:null;}
