/** Grounded market-intelligence retrieval bridge for SCIIP AI Copilot. */
function sciipMarketIntelligenceAnswerContext(question,events,properties){
  var q=String(question||'').toLowerCase(),filter={};
  if(q.indexOf('today')>=0)filter.since=new Date(new Date().setHours(0,0,0,0)).toISOString();
  else if(q.indexOf('week')>=0)filter.since=new Date(Date.now()-7*86400000).toISOString();
  var rows=SCIIP_MARKET_INTELLIGENCE.timeline(events||[],filter),summary=SCIIP_MARKET_INTELLIGENCE.summarize(rows),opps=SCIIP_MARKET_INTELLIGENCE.opportunities(rows,properties||[]);
  return {intent:q.indexOf('opportun')>=0?'MARKET_OPPORTUNITIES':'MARKET_CHANGES',groundedOnly:true,summary:summary,evidence:rows.slice(0,20),opportunities:opps.slice(0,10),actions:[{type:'OPEN_WORKSPACE',workspace:'market-intelligence'}]};
}
