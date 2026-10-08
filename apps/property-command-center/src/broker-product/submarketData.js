export const SUBMARKETS = Object.freeze([
  'All Markets','South Bay','San Gabriel Valley','San Fernando Valley',
  'Inland Empire West','Inland Empire East','Orange County','Long Beach / Mid-Counties'
]);

const base = {
  updatedAt:'8:14 AM', confidencePct:98.4,
  vacancyRate:{value:'5.6%',delta:'↓ 10 bps',period:'vs. prior quarter',interpretation:'Market continues to tighten.'},
  availableInventory:{value:'38.4M SF',delta:'↓ 1.2M SF',period:'since prior update',interpretation:'Fewer alternatives are available.'},
  netAbsorption:{value:'+2.4M SF',delta:'↑ 18%',period:'quarter to date',interpretation:'Demand is outpacing move-outs.'},
  grossAbsorption:{value:'8.9M SF',delta:'↑ 11%',period:'quarter to date',interpretation:'Leasing activity is accelerating.'},
  askingRate:{value:'$1.47 NNN',delta:'↑ $0.03',period:'since prior quarter',interpretation:'Landlords retain pricing leverage.'},
  salePrice:{value:'$267/SF',delta:'↑ 4.1%',period:'trailing 90 days',interpretation:'Investor pricing remains firm.'}
};

const overrides = {
  'All Markets': {summary:'Across the portfolio, vacancy edged lower, leasing velocity improved, and four active assignments were affected by new market evidence.'},
  'South Bay': {
    summary:'Since yesterday, two South Bay properties changed, one aerospace requirement entered the market, and two active assignments were affected.',
    vacancyRate:{value:'4.8%',delta:'↓ 30 bps',period:'vs. prior quarter',interpretation:'Market continues to tighten.'},
    availableInventory:{value:'6.2M SF',delta:'↓ 420K SF',period:'since prior update',interpretation:'Fewer large blocks remain available.'},
    netAbsorption:{value:'+1.1M SF',delta:'↑ 24%',period:'quarter to date',interpretation:'Occupancy growth remains positive.'},
    grossAbsorption:{value:'3.8M SF',delta:'↑ 16%',period:'quarter to date',interpretation:'Leasing velocity is improving.'},
    askingRate:{value:'$1.62 NNN',delta:'↑ $0.04',period:'since prior quarter',interpretation:'Class A pricing remains resilient.'},
    salePrice:{value:'$284/SF',delta:'↑ 5.6%',period:'trailing 90 days',interpretation:'Sale pricing is strengthening.'}
  },
  'San Gabriel Valley': {summary:'San Gabriel Valley conditions remained stable, with one new comparable and modest improvement in net absorption.'},
  'San Fernando Valley': {summary:'The San Fernando Valley softened slightly as vacancy increased and average asking rates held flat.',vacancyRate:{value:'6.7%',delta:'↑ 20 bps',period:'vs. prior quarter',interpretation:'Availability is increasing modestly.'}},
  'Inland Empire West': {summary:'Inland Empire West improved as gross absorption accelerated and available inventory declined.',vacancyRate:{value:'7.8%',delta:'↓ 20 bps',period:'vs. prior quarter',interpretation:'Conditions are gradually tightening.'},askingRate:{value:'$1.18 NNN',delta:'↑ $0.02',period:'since prior quarter',interpretation:'Pricing has stabilized.'}},
  'Inland Empire East': {summary:'Inland Empire East remained balanced, with steady vacancy and moderate positive absorption.',vacancyRate:{value:'8.4%',delta:'→ unchanged',period:'vs. prior quarter',interpretation:'Supply and demand remain balanced.'}},
  'Orange County': {summary:'Orange County tightened as vacancy declined and sale pricing continued to rise.',vacancyRate:{value:'3.9%',delta:'↓ 20 bps',period:'vs. prior quarter',interpretation:'The market remains supply constrained.'},salePrice:{value:'$312/SF',delta:'↑ 6.3%',period:'trailing 90 days',interpretation:'Investor demand remains strong.'}},
  'Long Beach / Mid-Counties': {summary:'Long Beach and Mid-Counties strengthened after a new lease comparable and improved leasing velocity.',vacancyRate:{value:'5.2%',delta:'↓ 10 bps',period:'vs. prior quarter',interpretation:'Availability is tightening gradually.'}}
};

export const SUBMARKET_DATA = Object.freeze(Object.fromEntries(SUBMARKETS.map(name=>[
  name,Object.freeze({...base,...overrides[name]})
])));
export const getSubmarketData=name=>SUBMARKET_DATA[name]||SUBMARKET_DATA['All Markets'];
