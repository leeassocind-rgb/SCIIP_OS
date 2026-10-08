import React,{useMemo,useState}from'react';
import{
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  Megaphone,
  Search,
  Sparkles,
  Target,
  Users
}from'lucide-react';
import{
  SAMPLE_PROPERTY_FEED,
  buildPropertyIntelligenceFeed,
  summarizePropertyFeed
}from'./propertyIntelligenceFeedEngine.js';
import'./property-intelligence-feed.css';

const CATEGORY_OPTIONS=[
  ['ALL','All activity'],
  ['COMPETITION','Competition'],
  ['COMPARABLES','Comparables'],
  ['REQUIREMENTS','Requirements'],
  ['INQUIRIES','Inquiries'],
  ['MARKETING','Marketing'],
  ['PROPERTY','Property']
];

export default function PropertyIntelligenceFeed({
  propertyId='P-IEW-201',
  assignmentId='A-BROOKFIELD'
}){
  const[category,setCategory]=useState('ALL');
  const[assignmentOnly,setAssignmentOnly]=useState(false);
  const[minimumConfidence,setMinimumConfidence]=useState(0);
  const[expandedId,setExpandedId]=useState(null);

  const feed=useMemo(()=>buildPropertyIntelligenceFeed({
    propertyId,
    events:SAMPLE_PROPERTY_FEED,
    filters:{
      categories:category==='ALL'?[]:[category],
      assignmentOnly,
      minimumConfidencePct:minimumConfidence
    }
  }),[propertyId,category,assignmentOnly,minimumConfidence]);

  const summary=useMemo(()=>summarizePropertyFeed(feed),[feed]);

  return (
    <section className="property-intelligence-feed">
      <header className="property-feed-header">
        <div>
          <p className="property-feed-kicker">Property intelligence feed</p>
          <h2>What changed, why it matters, and what to do next.</h2>
          <p>{summary.headline} · {summary.evidenceCount} evidence items</p>
        </div>
        <div className="property-feed-summary">
          <article><strong>{feed.counts.new}</strong><span>New</span></article>
          <article><strong>{feed.counts.updated}</strong><span>Updated</span></article>
          <article><strong>{feed.counts.assignmentRelevant}</strong><span>Assignment relevant</span></article>
        </div>
      </header>

      <section className="property-feed-controls">
        <div className="property-feed-categories">
          {CATEGORY_OPTIONS.map(([id,label])=>
            <button
              type="button"
              key={id}
              className={category===id?'active':''}
              onClick={()=>setCategory(id)}
            >
              {label}
            </button>
          )}
        </div>

        <div className="property-feed-filter-actions">
          <label>
            <input
              type="checkbox"
              checked={assignmentOnly}
              onChange={event=>setAssignmentOnly(event.target.checked)}
            />
            <span>Assignment relevant only</span>
          </label>

          <label>
            <span>Confidence</span>
            <select
              value={minimumConfidence}
              onChange={event=>setMinimumConfidence(Number(event.target.value))}
            >
              <option value="0">All</option>
              <option value="80">80%+</option>
              <option value="90">90%+</option>
              <option value="95">95%+</option>
            </select>
          </label>
        </div>
      </section>

      <div className="property-feed-list">
        {feed.events.length
          ? feed.events.map(event=>
              <FeedCard
                key={event.id}
                event={event}
                expanded={expandedId===event.id}
                onToggle={()=>setExpandedId(expandedId===event.id?null:event.id)}
                assignmentId={assignmentId}
              />
            )
          : <section className="property-feed-empty">
              <Filter size={22}/>
              <h3>No intelligence matches these filters.</h3>
              <p>Adjust the category, assignment relevance, or confidence threshold.</p>
            </section>
        }
      </div>
    </section>
  );
}

function FeedCard({event,expanded,onToggle,assignmentId}){
  const icon=iconFor(event.category);

  return (
    <article className={`property-feed-card ${event.status.toLowerCase()}`}>
      <div className="property-feed-card__rail">
        <span>{icon}</span>
        <div/>
      </div>

      <div className="property-feed-card__content">
        <header>
          <div>
            <div className="property-feed-card__meta">
              <span className={`property-feed-status ${event.status.toLowerCase()}`}>
                {event.status}
              </span>
              <span>{event.category}</span>
              <span>{formatTime(event.occurredAt)}</span>
            </div>
            <h3>{event.title}</h3>
            <p>{event.summary}</p>
          </div>

          <div className="property-feed-confidence">
            <strong>{event.confidencePct}%</strong>
            <span>{event.confidence} confidence</span>
          </div>
        </header>

        <section className="property-feed-implication">
          <Sparkles size={16}/>
          <div>
            <strong>Why it matters</strong>
            <p>{event.whyItMatters}</p>
          </div>
        </section>

        <section className="property-feed-recommendation">
          <Target size={16}/>
          <div>
            <strong>Recommended action</strong>
            <p>{event.recommendation}</p>
          </div>
        </section>

        {expanded&&
          <section className="property-feed-evidence">
            <div>
              <strong>Evidence</strong>
              {(event.evidenceIds||[]).map(id=><span key={id}>{id}</span>)}
            </div>
            <div>
              <strong>Assignment relevance</strong>
              {(event.assignmentIds||[]).length
                ? event.assignmentIds.map(id=><span key={id}>{id===assignmentId?'Brookfield listing':id}</span>)
                : <span>Property only</span>
              }
            </div>
            {event.fitScore&&
              <div>
                <strong>Fit score</strong>
                <span>{event.fitScore}%</span>
              </div>
            }
          </section>
        }

        <footer>
          <button type="button" onClick={onToggle}>
            {expanded?'Hide evidence':'Review evidence'}
            <ArrowRight size={14}/>
          </button>

          <div>
            {event.category==='REQUIREMENTS'&&
              <button type="button"><Search size={14}/> Open requirement</button>
            }
            {event.category==='INQUIRIES'&&
              <button type="button"><Users size={14}/> Open inquiry</button>
            }
            {event.assignmentIds?.length>0&&
              <button type="button"><Building2 size={14}/> Open assignment</button>
            }
            <button type="button"><FileText size={14}/> Add to property package</button>
          </div>
        </footer>
      </div>
    </article>
  );
}

function iconFor(category){
  const props={size:16};
  if(category==='COMPETITION')return <Building2 {...props}/>;
  if(category==='COMPARABLES')return <FileText {...props}/>;
  if(category==='REQUIREMENTS')return <Target {...props}/>;
  if(category==='INQUIRIES')return <Users {...props}/>;
  if(category==='MARKETING')return <Megaphone {...props}/>;
  return <CheckCircle2 {...props}/>;
}

function formatTime(value){
  const date=new Date(value);
  const now=new Date('2026-08-06T09:00:00-07:00');
  const diff=now-date;
  if(diff>=0&&diff<24*60*60*1000){
    return date.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
  }
  return date.toLocaleDateString(undefined,{month:'short',day:'numeric'});
}
