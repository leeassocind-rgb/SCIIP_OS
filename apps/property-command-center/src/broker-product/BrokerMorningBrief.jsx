import React,{useMemo,useState}from'react';
import{
  ArrowRight,
  Building2,
  FileText,
  Gauge,
  Ruler,
  Sparkles,
  TrendingDown,
  Users
}from'lucide-react';
import{PRODUCT_REALISM}from'../product-realism/service/productRealismService.js';
import'./morning-brief-v2.css';
import'./morning-brief-v2-1.css';

const FILTERS=Object.freeze([
  {id:'vacancy',label:'Vacancy change',icon:TrendingDown},
  {id:'comparables',label:'New comparables',icon:FileText},
  {id:'requirements',label:'Requirements',icon:Users},
  {id:'rates',label:'Rate changes',icon:Gauge},
  {id:'assignments',label:'Assignments impacted',icon:Building2},
  {id:'recommendations',label:'Recommendations',icon:Sparkles}
]);

const SIZE_RANGES=Object.freeze([
  {id:'all',label:'All sizes',min:0,max:Infinity},
  {id:'under-100',label:'Under 100,000 SF',min:0,max:99999},
  {id:'100-250',label:'100,000–249,999 SF',min:100000,max:249999},
  {id:'250-500',label:'250,000–499,999 SF',min:250000,max:499999},
  {id:'500-plus',label:'500,000+ SF',min:500000,max:Infinity}
]);

const CLEAR_HEIGHT_RANGES=Object.freeze([
  {id:'all',label:'All clear heights',min:0,max:Infinity},
  {id:'under-30',label:'Under 30′',min:0,max:29.99},
  {id:'30-35',label:'30′–35′',min:30,max:35.99},
  {id:'36-39',label:'36′–39′',min:36,max:39.99},
  {id:'40-plus',label:'40′+',min:40,max:Infinity}
]);

export default function BrokerMorningBrief(){
  const submarkets=useMemo(
    ()=>['All Markets',...new Set(PRODUCT_REALISM.snapshots.map(item=>item.submarket))],
    []
  );

  const[selectedSubmarket,setSelectedSubmarket]=useState(
    PRODUCT_REALISM.input.selectedSubmarket||PRODUCT_REALISM.snapshots[0]?.submarket||'All Markets'
  );
  const[selectedSize,setSelectedSize]=useState('all');
  const[selectedClearHeight,setSelectedClearHeight]=useState('all');
  const[activeFilter,setActiveFilter]=useState('all');

  const filteredModel=useMemo(
    ()=>buildFilteredModel({
      submarket:selectedSubmarket,
      sizeRange:SIZE_RANGES.find(item=>item.id===selectedSize),
      clearHeightRange:CLEAR_HEIGHT_RANGES.find(item=>item.id===selectedClearHeight)
    }),
    [selectedSubmarket,selectedSize,selectedClearHeight]
  );

  const metrics=useMemo(
    ()=>buildMetrics(filteredModel),
    [filteredModel]
  );

  const visibleEvents=useMemo(
    ()=>filterEvents(filteredModel.events,activeFilter),
    [filteredModel.events,activeFilter]
  );

  const activeAssignments=useMemo(
    ()=>PRODUCT_REALISM.input.assignments.filter(assignment=>
      filteredModel.assignmentIds.has(assignment.id)
    ),
    [filteredModel]
  );

  const visibleRecommendations=useMemo(
    ()=>PRODUCT_REALISM.recommendations.filter(recommendation=>
      filteredModel.recommendationIds.has(recommendation.id)
    ),
    [filteredModel]
  );

  return (
    <section className="broker-page morning-console">
      <header className="broker-brief-header compact">
        <div>
          <p className="broker-kicker">Today's Morning Brief</p>
          <h1>What changed since yesterday.</h1>
        </div>
        <aside>
          <span>Daily Intelligence Graph</span>
          <strong>{filteredModel.events.length} events</strong>
          <small>{filteredModel.evidenceCount} linked evidence items · Governed intelligence</small>
        </aside>
      </header>

      <section className="morning-filter-bar" aria-label="Morning brief market filters">
        <label>
          <span>Submarket</span>
          <select value={selectedSubmarket} onChange={event=>setSelectedSubmarket(event.target.value)}>
            {submarkets.map(item=><option key={item}>{item}</option>)}
          </select>
        </label>

        <label>
          <span>Building size</span>
          <select value={selectedSize} onChange={event=>setSelectedSize(event.target.value)}>
            {SIZE_RANGES.map(item=><option value={item.id} key={item.id}>{item.label}</option>)}
          </select>
        </label>

        <label>
          <span>Clear height</span>
          <select value={selectedClearHeight} onChange={event=>setSelectedClearHeight(event.target.value)}>
            {CLEAR_HEIGHT_RANGES.map(item=><option value={item.id} key={item.id}>{item.label}</option>)}
          </select>
        </label>

        <button
          type="button"
          onClick={()=>{
            setSelectedSubmarket('All Markets');
            setSelectedSize('all');
            setSelectedClearHeight('all');
            setActiveFilter('all');
          }}
        >
          Clear filters
        </button>
      </section>

      <section className="morning-top-grid">
        <div className="morning-change-grid compact" aria-label="Morning intelligence summary">
          {FILTERS.map(({id,label,icon:Icon})=>{
            const metric=metrics[id];
            const active=activeFilter===id;
            return (
              <button
                type="button"
                className={active?'active':''}
                key={id}
                onClick={()=>setActiveFilter(active?'all':id)}
                aria-pressed={active}
              >
                <div className="morning-change-grid__icon"><Icon size={16}/></div>
                <span>{label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </button>
            );
          })}
        </div>

        <section className="broker-panel morning-events-panel">
          <header>
            <div>
              <p className="broker-kicker">What changed</p>
              <h2>{activeFilter==='all'?'Meaningful market events':FILTERS.find(item=>item.id===activeFilter)?.label}</h2>
            </div>
            {activeFilter!=='all'&&
              <button type="button" className="morning-clear-filter" onClick={()=>setActiveFilter('all')}>
                Clear
              </button>
            }
          </header>

          <div className="broker-list morning-events-list">
            {visibleEvents.length
              ? visibleEvents.slice(0,6).map(event=>
                  <Row
                    key={event.id}
                    title={event.title}
                    detail={`${event.detail} · ${event.confidencePct}% confidence`}
                  />
                )
              : <div className="morning-empty-state">No events match these filters.</div>
            }
          </div>
        </section>
      </section>

      <section className="morning-interpretation">
        <Sparkles size={18}/>
        <p>{buildInterpretation(filteredModel,metrics,selectedSubmarket)}</p>
      </section>

      <section className="morning-bottom-grid">
        <section className="broker-panel">
          <header>
            <div>
              <p className="broker-kicker">Broker impact</p>
              <h2>Assignments requiring attention</h2>
            </div>
          </header>

          <div className="broker-list">
            {activeAssignments.length
              ? activeAssignments.map(assignment=>{
                  const narrative=PRODUCT_REALISM.assignmentNarratives[assignment.id];
                  return (
                    <Row
                      key={assignment.id}
                      title={assignment.name}
                      detail={`${narrative.directCount} direct · ${narrative.indirectCount} indirect impacts`}
                    />
                  );
                })
              : <div className="morning-empty-state">No assignments match these filters.</div>
            }
          </div>
        </section>

        <section className="broker-panel">
          <header>
            <div>
              <p className="broker-kicker">Today's recommended work</p>
              <h2>Highest-value actions</h2>
            </div>
          </header>

          <div className="broker-list">
            {visibleRecommendations.length
              ? visibleRecommendations.slice(0,6).map((recommendation,index)=>
                  <article key={recommendation.id}>
                    <span className="morning-action-index">{index+1}</span>
                    <div>
                      <strong>{recommendation.title}</strong>
                      <small>{recommendation.priority} priority · {recommendation.evidenceIds.length} evidence item{recommendation.evidenceIds.length===1?'':'s'}</small>
                    </div>
                    <ArrowRight size={16}/>
                  </article>
                )
              : <div className="morning-empty-state">No recommendations match these filters.</div>
            }
          </div>
        </section>
      </section>
    </section>
  );
}

function buildFilteredModel({submarket,sizeRange,clearHeightRange}){
  const properties=PRODUCT_REALISM.input.properties.filter(property=>
    matchesSubmarket(property.submarket,submarket)&&
    matchesRange(property.sf,sizeRange)&&
    matchesRange(property.clearHeightFt,clearHeightRange)
  );

  const comparables=PRODUCT_REALISM.input.comparables.filter(comparable=>
    matchesSubmarket(comparable.submarket,submarket)&&
    matchesRange(comparable.buildingSf,sizeRange)&&
    matchesRange(comparable.clearHeightFt,clearHeightRange)
  );

  const requirements=PRODUCT_REALISM.input.requirements.filter(requirement=>
    matchesSubmarket(requirement.submarket,submarket)&&
    rangesOverlap(requirement.minSf,requirement.maxSf,sizeRange)&&
    requirement.minClearHeightFt>=clearHeightRange.min&&
    requirement.minClearHeightFt<=clearHeightRange.max
  );

  const entityIds=new Set([
    ...properties.map(item=>item.id),
    ...comparables.flatMap(item=>[item.id,item.propertyId]),
    ...requirements.map(item=>item.id)
  ]);

  const events=PRODUCT_REALISM.events.filter(event=>
    matchesSubmarket(event.submarket,submarket)&&
    (
      event.entityIds.some(id=>entityIds.has(id))||
      ['OWNERSHIP_RESOLVED'].includes(event.type)
    )
  );

  const eventIds=new Set(events.map(item=>item.id));
  const impacts=PRODUCT_REALISM.impacts.filter(impact=>eventIds.has(impact.eventId));
  const assignmentIds=new Set(impacts.map(item=>item.assignmentId));

  const recommendations=PRODUCT_REALISM.recommendations.filter(recommendation=>
    recommendation.eventIds.some(id=>eventIds.has(id))||
    assignmentIds.has(recommendation.assignmentId)
  );

  return {
    properties,
    comparables,
    requirements,
    events,
    impacts,
    assignmentIds,
    recommendationIds:new Set(recommendations.map(item=>item.id)),
    evidenceCount:new Set(events.flatMap(item=>item.evidenceIds)).size
  };
}

function buildMetrics(model){
  const rateChanges=model.events.filter(event=>event.type==='RATE_CHANGED').length;
  const comparableCount=model.events.filter(event=>event.type.includes('COMPARABLE')).length;
  const requirementCount=model.events.filter(event=>event.type==='REQUIREMENT_CREATED').length;
  const vacancyEvents=model.events.filter(event=>['BUILDING_LEASED','AVAILABILITY_CHANGED'].includes(event.type)).length;

  return {
    vacancy:{
      value:vacancyEvents?`-${(vacancyEvents*0.30).toFixed(2)} pp`:'0.00 pp',
      detail:'Availability-driven change'
    },
    comparables:{
      value:`+${comparableCount}`,
      detail:'Lease and sale evidence'
    },
    requirements:{
      value:`+${requirementCount}`,
      detail:'New active demand'
    },
    rates:{
      value:String(rateChanges),
      detail:'Requires review'
    },
    assignments:{
      value:String(model.assignmentIds.size),
      detail:'Active assignments affected'
    },
    recommendations:{
      value:String(model.recommendationIds.size),
      detail:'Prioritized broker actions'
    }
  };
}

function filterEvents(events,filter){
  if(filter==='all')return events;
  if(filter==='comparables')return events.filter(event=>event.type.includes('COMPARABLE'));
  if(filter==='requirements')return events.filter(event=>event.type==='REQUIREMENT_CREATED');
  if(filter==='rates')return events.filter(event=>event.type==='RATE_CHANGED');
  if(filter==='vacancy')return events.filter(event=>['BUILDING_LEASED','AVAILABILITY_CHANGED'].includes(event.type));
  if(filter==='assignments')return events.filter(event=>
    PRODUCT_REALISM.impacts.some(impact=>impact.eventId===event.id)
  );
  if(filter==='recommendations')return events.filter(event=>
    PRODUCT_REALISM.recommendations.some(recommendation=>recommendation.eventIds.includes(event.id))
  );
  return events;
}

function buildInterpretation(model,metrics,submarket){
  const market=submarket==='All Markets'?'The selected markets':submarket;
  return `${market} produced ${model.events.length} meaningful events. ${metrics.comparables.value.replace('+','')} comparables, ${metrics.requirements.value.replace('+','')} requirements, and ${metrics.rates.value} asking-rate changes affect ${metrics.assignments.value} active assignments.`;
}

function matchesSubmarket(value,selected){
  return selected==='All Markets'||value===selected;
}

function matchesRange(value,range){
  if(value==null)return range.id==='all';
  return value>=range.min&&value<=range.max;
}

function rangesOverlap(min,max,range){
  return max>=range.min&&min<=range.max;
}

function Row({title,detail}){
  return (
    <article>
      <span className="broker-icon"><Building2 size={15}/></span>
      <div><strong>{title}</strong><small>{detail}</small></div>
      <ArrowRight size={16}/>
    </article>
  );
}
