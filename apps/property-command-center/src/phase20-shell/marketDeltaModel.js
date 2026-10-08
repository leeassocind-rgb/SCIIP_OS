const freeze=v=>Object.freeze(v);
export function createMarketDelta({pulseId='MP-428',generatedAt='2026-08-03T08:14:00-07:00',confidencePct=98.4,direction='STRENGTHENING',changes=[],impactedAssignments=[],recommendations=[],evidenceTimeline=[]}={}){
 const significant=changes.filter(x=>x.significant!==false),groups={};
 significant.forEach(x=>{const k=x.category||'Other';groups[k]||=[];groups[k].push(freeze({...x}))});
 return freeze({pulseId,generatedAt,confidencePct,direction,significantChanges:significant.length,categories:freeze(Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,freeze(v)]))),impactedAssignments:freeze(impactedAssignments.map(x=>freeze({...x}))),impactedAssignmentCount:impactedAssignments.length,recommendations:freeze(recommendations.map(x=>freeze({...x}))),recommendationCount:recommendations.length,evidenceTimeline:freeze(evidenceTimeline.map(x=>freeze({...x}))),source:'SUPERSHEET_DELTA',permanentHistory:true});
}
export const SAMPLE_MARKET_DELTA=createMarketDelta({
 changes:[
 {id:'CHG-1',category:'Explorer',title:'Brookfield asking rate reduced',detail:'Competitive positioning improved relative to the active listing set.',impact:'Pricing strategy should be reviewed.',evidenceId:'EV-1001'},
 {id:'CHG-2',category:'Market',title:'New South Bay lease comparable added',detail:'Recent aerospace lease supports stronger Class A pricing.',impact:'Three active assignments are affected.',evidenceId:'EV-1002'},
 {id:'CHG-3',category:'Requirements',title:'New 4,000 amp requirement entered the market',detail:'Aerospace and advanced manufacturing demand expanded.',impact:'Two explorer moved into the recommended shortlist.',evidenceId:'EV-1003'},
 {id:'CHG-4',category:'Relationships',title:'Ownership relationship resolved',detail:'A previously ambiguous ownership record was linked.',impact:'One outreach path is now available.',evidenceId:'EV-1004'}],
 impactedAssignments:[
 {assignmentId:'A-LOWELL',name:'Lowell Logistics Center',impact:'Revisit pricing and competitive positioning',severity:'HIGH'},
 {assignmentId:'A-BROOKFIELD',name:'Brookfield Industrial',impact:'Refresh competition and client brief',severity:'HIGH'},
 {assignmentId:'A-MEROLA',name:'Merola Tile Requirement',impact:'Add two qualified explorer to shortlist',severity:'MEDIUM'}],
 recommendations:[
 {id:'REC-1',title:'Update Brookfield pricing strategy',reason:'Competitive asking rate changed',evidenceIds:['EV-1001']},
 {id:'REC-2',title:'Refresh the South Bay market brief',reason:'New lease evidence changed market positioning',evidenceIds:['EV-1002']},
 {id:'REC-3',title:'Add two high-power buildings to the shortlist',reason:'New 4,000 amp requirement entered the market',evidenceIds:['EV-1003']}],
 evidenceTimeline:[
 {time:'08:02',label:'SuperSheet ingestion completed'},{time:'08:03',label:'Normalization and identity resolution completed'},
 {time:'08:04',label:'Knowledge graph updated'},{time:'08:05',label:'Three assignments impacted'},
 {time:'08:06',label:'Recommendations generated for review'}]
});
