const freeze=value=>Object.freeze(value);
export const PROPERTY_SEARCH_DATA=freeze([
  freeze({id:'P-SB-ARES-101',address:'19500 S Vermont Ave',city:'Torrance',submarket:'South Bay',ownerLegal:'South Bay Industrial Owner LLC',ownerParent:'Ares Management',ownerAliases:freeze(['Ares','Ares Industrial','Ares Management']),tenant:'Vacant',buildingSf:145000,clearHeightFt:32,powerAmps:2000,status:'AVAILABLE',latitude:33.8512,longitude:-118.2928,yearBuilt:2004}),
  freeze({id:'P-SB-ARES-102',address:'20200 S Western Ave',city:'Torrance',submarket:'South Bay',ownerLegal:'Western Industrial Holdings LLC',ownerParent:'Ares Management',ownerAliases:freeze(['Ares','Ares Commercial Real Estate']),tenant:'Aerospace User',buildingSf:218000,clearHeightFt:36,powerAmps:4000,status:'OFF MARKET',latitude:33.8461,longitude:-118.3092,yearBuilt:2012}),
  freeze({id:'P-SB-ARES-103',address:'1800 E 223rd St',city:'Carson',submarket:'South Bay',ownerLegal:'Carson Logistics Owner LLC',ownerParent:'Ares Management',ownerAliases:freeze(['Ares','Ares Industrial']),tenant:'Vacant',buildingSf:118000,clearHeightFt:null,powerAmps:1600,status:'AVAILABLE',latitude:33.8240,longitude:-118.2420,yearBuilt:1998}),
  freeze({id:'P-SB-OTHER-201',address:'19000 S Alameda St',city:'Rancho Dominguez',submarket:'South Bay',ownerLegal:'Prologis LP',ownerParent:'Prologis',ownerAliases:freeze(['Prologis']),tenant:'3PL User',buildingSf:256000,clearHeightFt:36,powerAmps:3000,status:'LEASED',latitude:33.8601,longitude:-118.2304,yearBuilt:2016}),
  freeze({id:'P-IEW-201',address:'2125 W Lowell St',city:'Rialto',submarket:'Inland Empire West',ownerLegal:'Brookfield Logistics Owner LLC',ownerParent:'Brookfield Properties',ownerAliases:freeze(['Brookfield','Brookfield Properties']),tenant:'Vacant',buildingSf:664859,clearHeightFt:42,powerAmps:8000,status:'UNDER CONSTRUCTION',latitude:34.1069,longitude:-117.4112,yearBuilt:2027})
]);
export const DEFAULT_FILTERS=freeze({query:'',submarket:'',city:'',owner:'',tenant:'',minBuildingSf:'',maxBuildingSf:'',minClearHeightFt:'',minPowerAmps:'',status:'',assignmentOnly:false,availableOnly:false});
export function interpretPropertyQuery(input=''){
 const text=String(input).trim(),filters={...DEFAULT_FILTERS,query:text},chips=[],lower=text.toLowerCase();
 for(const market of ['South Bay','Inland Empire West','Inland Empire East','San Gabriel Valley','Orange County']){if(lower.includes(market.toLowerCase())){filters.submarket=market;chips.push({key:'submarket',label:market});break;}}
 const owner=text.match(/owned by\s+([a-z0-9 &.-]+)/i);if(owner){filters.owner=owner[1].trim();chips.push({key:'owner',label:filters.owner});}else if(/\bares\b/i.test(text)){filters.owner='Ares';chips.push({key:'owner',label:'Ares'});}
 const minSf=text.match(/(?:over|above|at least|minimum|min)\s+([\d,]+)\s*(?:sf|square feet)?/i);if(minSf){filters.minBuildingSf=Number(minSf[1].replaceAll(',',''));chips.push({key:'minBuildingSf',label:`${Number(filters.minBuildingSf).toLocaleString()} SF+`});}
 const clear=text.match(/(?:clear height(?: minimum)?|minimum clear height|at least)\s*(?:of\s*)?(\d{2})\s*(?:feet|ft|')?/i)||text.match(/(\d{2})\s*(?:feet|ft|')\s*clear/i);if(clear){filters.minClearHeightFt=Number(clear[1]);chips.push({key:'minClearHeightFt',label:`${filters.minClearHeightFt}′ Clear+`});}
 if(/\bavailable\b/i.test(text)){filters.availableOnly=true;chips.push({key:'availableOnly',label:'Available'});}
 return freeze({raw:text,filters:freeze(filters),chips:freeze(chips),mode:chips.length?'STRUCTURED':'DIRECT'});
}
export function searchProperties(properties=PROPERTY_SEARCH_DATA,filters=DEFAULT_FILTERS){
 const owner=String(filters.owner||'').toLowerCase().trim(),query=String(filters.query||'').toLowerCase().trim(),confirmed=[],possible=[];
 for(const p of properties){const reasons=[];let missing=false;
  if(filters.submarket){if(p.submarket!==filters.submarket)continue;reasons.push(`Submarket: ${p.submarket}`);} if(filters.city&&p.city.toLowerCase()!==String(filters.city).toLowerCase())continue;
  if(owner){const h=[p.ownerLegal,p.ownerParent,...(p.ownerAliases||[])].join(' ').toLowerCase();if(!h.includes(owner))continue;reasons.push(`Owner family: ${p.ownerParent}`);}
  if(filters.minBuildingSf){if(Number(p.buildingSf)<Number(filters.minBuildingSf))continue;reasons.push(`Building size: ${Number(p.buildingSf).toLocaleString()} SF`);} if(filters.maxBuildingSf&&Number(p.buildingSf)>Number(filters.maxBuildingSf))continue;
  if(filters.minClearHeightFt){if(p.clearHeightFt==null)missing=true;else if(Number(p.clearHeightFt)<Number(filters.minClearHeightFt))continue;else reasons.push(`Clear height: ${p.clearHeightFt}′`);} if(filters.minPowerAmps){if(p.powerAmps==null)missing=true;else if(Number(p.powerAmps)<Number(filters.minPowerAmps))continue;else reasons.push(`Power: ${Number(p.powerAmps).toLocaleString()} amps`);}
  if(filters.status&&p.status!==filters.status)continue;if(filters.availableOnly&&!['AVAILABLE','UNDER CONSTRUCTION'].includes(p.status))continue;
  if(query&&!filters.submarket&&!filters.owner&&!filters.minBuildingSf&&!filters.minClearHeightFt&&!filters.minPowerAmps&&!filters.status&&!filters.availableOnly){const h=[p.address,p.city,p.id,p.ownerParent,p.ownerLegal,p.tenant,...(p.ownerAliases||[])].join(' ').toLowerCase();if(!h.includes(query))continue;reasons.push('Direct text match');}
  const row=freeze({property:p,reasons:freeze(reasons),matchType:missing?'POSSIBLE':'CONFIRMED'});(missing?possible:confirmed).push(row);
 }
 const sort=a=>[...a].sort((x,y)=>y.property.buildingSf-x.property.buildingSf);
 return freeze({confirmed:freeze(sort(confirmed)),possible:freeze(sort(possible)),count:confirmed.length+possible.length,summary:freeze({confirmedCount:confirmed.length,possibleCount:possible.length,totalBuildingSf:confirmed.reduce((s,r)=>s+r.property.buildingSf,0),availableCount:confirmed.filter(r=>['AVAILABLE','UNDER CONSTRUCTION'].includes(r.property.status)).length})});
}
export function buildGovernedQuery(f){const c=[];if(f.submarket)c.push(`submarket = "${f.submarket}"`);if(f.owner)c.push(`owner_family CONTAINS "${f.owner}"`);if(f.minBuildingSf)c.push(`building_sf >= ${f.minBuildingSf}`);if(f.minClearHeightFt)c.push(`clear_height_ft >= ${f.minClearHeightFt}`);if(f.minPowerAmps)c.push(`power_amps >= ${f.minPowerAmps}`);if(f.status)c.push(`status = "${f.status}"`);if(f.availableOnly)c.push('status IN ["AVAILABLE","UNDER CONSTRUCTION"]');return c.length?c.join('\nAND '):'DIRECT_LOOKUP';}
