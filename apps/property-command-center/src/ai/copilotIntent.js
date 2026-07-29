const norm=value=>String(value??'').trim().toLowerCase();
export function detectIntent(question=''){
 const q=norm(question);
 if(/summari[sz]e|brief|overview|what do we know/.test(q))return'ASSIGNMENT_SUMMARY';
 if(/comparable|\bcomp\b|support/.test(q))return'COMPARABLE_SUPPORT';
 if(/why|rank|above|below|better|stronger/.test(q))return'EXPLAIN_RANKING';
 if(/market|vacancy|rate|absorption|pipeline/.test(q))return'MARKET_SUMMARY';
 if(/show|find|which|building|property|available|sf|square feet|amps|clear height/.test(q))return'PROPERTY_SEARCH';
 return'GRAPH_QUESTION';
}
export function extractConstraints(question=''){
 const q=norm(question);const constraints={};
 const sf=q.match(/(?:over|above|at least|minimum|min\.?|>=?)\s*([\d,.]+)\s*(?:sf|square feet)/);if(sf)constraints.minSf=Number(sf[1].replace(/,/g,''));
 const amps=q.match(/(?:over|above|at least|minimum|min\.?|>=?)\s*([\d,.]+)\s*(?:amps?|a\b)/);if(amps)constraints.minAmps=Number(amps[1].replace(/,/g,''));
 const clear=q.match(/(?:over|above|at least|minimum|min\.?|>=?)\s*([\d.]+)\s*(?:feet|ft|')\s*(?:clear|clear height)?/);if(clear)constraints.minClearHeight=Number(clear[1]);
 if(/available/.test(q))constraints.status='available';
 const market=q.match(/\b(inland empire|south bay|san gabriel valley|san fernando valley|orange county|los angeles|ie west|ie east)\b/);if(market)constraints.market=market[1];
 return constraints;
}
