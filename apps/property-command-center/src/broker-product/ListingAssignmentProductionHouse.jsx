import React,{useMemo,useState}from'react';
import{
  ArrowRight,Building2,Download,ExternalLink,Eye,FileDown,FilePenLine,FileText,Plus,Search,Users
}from'lucide-react';
import{
  LOCUST_ASSIGNMENT_VIEW,createInquiry,evaluateListingAssignment,SAMPLE_ASSIGNMENT_INPUT
}from'../product-realism/assignment/listingAssignmentEngine.js';
import InstitutionalReportReview from'./InstitutionalReportReview.jsx';
import ReportHistoryPanel from'./ReportHistoryPanel.jsx';
import{INITIAL_REPORT_HISTORY,appendReportRecord,buildReportSnapshotId,createReportRecord}from'../product-realism/assignment/reportHistoryEngine.js';
import'./listing-assignment-production-house.css';
import'./client-call-report.css';
import'./institutional-report-review.css';
import'./report-workflow.css';

export default function ListingAssignmentProductionHouse(){
  const[data,setData]=useState(LOCUST_ASSIGNMENT_VIEW);
  const[showInquiry,setShowInquiry]=useState(false);
  const[showReportReview,setShowReportReview]=useState(false);
  const[showBuildingSpecs,setShowBuildingSpecs]=useState(false);
  const[reportHistory,setReportHistory]=useState([...INITIAL_REPORT_HISTORY]);
  const a=data.assignment;
  
  const specs=[
    ['Building size',`${a.buildingSf.toLocaleString()} SF`],['Clear height',`${a.clearHeightFt}′`],
    ['Dock-high doors',a.dockHighDoors],['Trailer parking',a.trailerParking],
    ['Truck court',`${a.truckCourtFt}′`],['Power',`Up to ${a.powerAmps.toLocaleString()} amps`],
    ['Status',a.constructionStatus],['Delivery',a.year]
  ];

  return <section className="broker-page listing-house">
    <header className="listing-hero">
      <div>
        <p className="broker-kicker">Listing assignment production house</p>
        <h1>{a.name}</h1>
        <p>{a.address}, {a.city}, {a.state} · {a.client} · {a.status}</p>
      </div>
      <div className="listing-hero__actions">
        
        <button
          type="button"
          className="building-specifications-button"
          onClick={()=>setShowBuildingSpecs(true)}
        >
          <Building2 size={16}/> Specs
        </button>
        <a href={a.brochureUrl} target="_blank" rel="noreferrer"><Download size={16}/> Brochure</a>
        <a href={a.websiteUrl} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Website</a>
      </div>
    </header>

    <section className="assignment-report-actionbar"><div className="assignment-report-actionbar__identity"><strong>{a.client}</strong><span>Assignment Status: {a.status}</span></div><div className="assignment-report-actionbar__actions"><button type="button" onClick={()=>setShowInquiry(true)}><Plus size={15}/> Add Inquiry</button><button type="button"><FilePenLine size={15}/> Edit Assignment</button><button type="button" onClick={()=>setShowReportReview(true)}><Eye size={15}/> </button><button type="button" className="primary" onClick={()=>setShowReportReview(true)}><Download size={15}/> Generate Client Listing Report</button></div></section>

    <section className="client-report-readiness">
      <div><span>Client report</span><strong>Ready to export</strong><small>Inquiry pipeline, competition, comparables, and AI market summary</small></div>
      <div><span>Report data</span><strong>Daily governed</strong><small>Current working sets generated from assignment criteria</small></div>
      <div><span>Aerial</span><strong>Future enhancement</strong><small>Reserved for subject, competition, and comparable mapping</small></div>
    </section>

    
    <section className="listing-status-strip">
      <div><span>Competitive set</span><strong>{data.counts.competition}</strong><small>600,000–800,000 SF · governed daily</small></div>
      <div><span>Relevant comparables</span><strong>{data.counts.comparables}</strong><small>Size, geography, transaction type</small></div>
      <div><span>Matching requirements</span><strong>{data.counts.requirements}</strong><small>Size, clear height, power</small></div>
      <div><span>Active inquiries</span><strong>{data.counts.inquiries}</strong><small>Broker and tenant demand</small></div>
    </section>

    <div className="listing-main-grid"><main>
      <ProductionPanel kicker="Competition" title="Automatically maintained competitive set" action="Review criteria">
        <Criteria text="600,000–800,000 SF · Available or under construction · Direct or sublease · Inland Empire"/>
        {data.competition.map(p=><Record key={p.id} icon={<Building2 size={15}/>} title={p.name} detail={`${p.address} · ${p.sf.toLocaleString()} SF · ${p.status} · ${p.askingRate?`$${p.askingRate.toFixed(2)} NNN`:'Rate TBD'}`}/>) }
      </ProductionPanel>

      <ProductionPanel kicker="Comparables" title="Relevant transaction evidence" action="Review criteria">
        {data.relevantComparables.map(c=><Record key={c.id} icon={<FileText size={15}/>} title={`${c.type} comparable · ${c.buildingSf.toLocaleString()} SF`} detail={c.type==='LEASE'?`$${c.rate.toFixed(2)} NNN · Closed ${c.closedAt}`:`$${c.salePricePsf}/SF · Closed ${c.closedAt}`}/>) }
      </ProductionPanel>

      <ProductionPanel kicker="Demand" title="Matching requirements and inquiries" action="Open pipeline">
        {data.matchingRequirements.map(r=><Record key={r.id} icon={<Search size={15}/>} title={r.company} detail={`${r.minSf.toLocaleString()}–${r.maxSf.toLocaleString()} SF · ${r.minClearHeightFt}′ clear · ${r.minPowerAmps.toLocaleString()} amps · Fit ${r.fitScore}`}/>) }
        {data.inquiries.map(i=><Record key={i.id} icon={<Users size={15}/>} title={`${i.company} · ${i.stage}`} detail={`${i.contactName} · ${i.minSf.toLocaleString()}–${i.maxSf.toLocaleString()} SF · ${i.timing}`}/>) }
      </ProductionPanel>
    </main><aside>
      <section className="broker-panel"><header><div><p className="broker-kicker">Client reporting</p><h2>Recurring owner package</h2></div></header><div className="client-report-summary"><strong>Ready for broker review</strong><p>Market intelligence, marketing activity, tenant requirements, complete inquiry history, and tracked changes to competition and comparables.</p><small>The published report becomes the next comparison baseline.</small></div></section>
      <section className="broker-panel"><header><div><p className="broker-kicker">Daily automation</p><h2>SuperSheet assignment evaluation</h2></div></header><div className="listing-automation"><p>Every ingestion reevaluates competition, comparables, requirements, report updates, and client-call preparation against assignment criteria.</p><ol><li>Normalize new records</li><li>Evaluate governed criteria</li><li>Add, update, or remove working-list records</li><li>Create evidence-backed assignment impacts</li><li>Queue report and call-preparation tasks</li></ol></div></section>
      <section className="broker-panel"><header><div><p className="broker-kicker">Inquiry pipeline</p><h2>Broker and tenant inquiries</h2></div><button type="button" onClick={()=>setShowInquiry(!showInquiry)}><Plus size={15}/> Add inquiry</button></header>{showInquiry&&<InquiryForm onSave={inq=>{const input={...SAMPLE_ASSIGNMENT_INPUT,inquiries:[...SAMPLE_ASSIGNMENT_INPUT.inquiries,inq]};setData(evaluateListingAssignment(input));setShowInquiry(false)}}/>}<div className="listing-inquiry-stages">{['NEW','QUALIFIED','TOUR','PROPOSAL','NEGOTIATION'].map(stage=><div key={stage}><span>{stage}</span><strong>{data.inquiries.filter(i=>i.stage===stage).length}</strong></div>)}</div></section>
    </aside></div>
    <ReportHistoryPanel history={reportHistory} onGenerate={()=>setShowReportReview(true)}/>
    <BuildingSpecsModal
      open={showBuildingSpecs}
      assignment={a}
      onClose={()=>setShowBuildingSpecs(false)}
    />

    {showReportReview&&<InstitutionalReportReview view={data} onClose={()=>setShowReportReview(false)} onPublish={({model,filename})=>{const publishedAt=new Date().toISOString();const snapshotId=buildReportSnapshotId(a.id,publishedAt);const record=createReportRecord({assignmentId:a.id,title:model.reportTitle,filename,snapshotId,publishedAt,generatedBy:'Spencer Casement',history:reportHistory});setReportHistory(current=>appendReportRecord(current,record));setShowReportReview(false)}}/>}
  </section>;
}

function BuildingSpecsModal({open,assignment,onClose}){
  if(!open||!assignment)return null;

  const highlights=[
    ['Building size',`${Number(assignment.buildingSf||0).toLocaleString()} SF`],
    ['Clear height',`${assignment.clearHeightFt||'—'}′`],
    ['Dock-high doors',assignment.dockHighDoors??'—'],
    ['Trailer parking',assignment.trailerParking??'—'],
    ['Truck court',assignment.truckCourtFt?`${assignment.truckCourtFt}′`:'—'],
    ['Power',assignment.powerAmps
      ?`Up to ${Number(assignment.powerAmps).toLocaleString()} amps`
      :'—'
    ],
    ['Status',String(assignment.constructionStatus||assignment.status||'—')
      .replaceAll('_',' ')
    ],
    ['Delivery',assignment.year||'—']
  ];

  return (
    <div
      className="building-specifications-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="building-specifications-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="building-highlights-title"
        onMouseDown={event=>event.stopPropagation()}
      >
        <header>
          <div>
            <p className="broker-kicker">Subject property</p>
            <h2 id="building-highlights-title">Building Highlights</h2>
            <span>
              {assignment.name} · {assignment.address}, {assignment.city}, {assignment.state}
            </span>
          </div>

          <button
            type="button"
            aria-label="Close building highlights"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="building-specifications-modal__grid">
          {highlights.map(([label,value])=>
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          )}
        </div>

        <footer>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

function ProductionPanel({kicker,title,action,children}){return <section className="broker-panel listing-production-panel"><header><div><p className="broker-kicker">{kicker}</p><h2>{title}</h2></div><button type="button">{action}</button></header><div>{children}</div></section>}
function Criteria({text}){return <div className="listing-criteria"><strong>Governed criteria</strong><span>{text}</span></div>}
function Record({icon,title,detail}){return <article className="listing-record"><span className="broker-icon">{icon}</span><div><strong>{title}</strong><small>{detail}</small></div><ArrowRight size={16}/></article>}
function InquiryForm({onSave}){const[f,setF]=useState({company:'',contactName:'',assignmentId:'A-BROOKFIELD',stage:'NEW',minSf:600000,maxSf:800000,minClearHeightFt:36,minPowerAmps:0,timing:'',notes:''});return <form className="listing-inquiry-form" onSubmit={e=>{e.preventDefault();onSave(createInquiry(f))}}>{[['company','Company'],['contactName','Broker / contact'],['timing','Timing'],['notes','Notes']].map(([k,l])=><label key={k}><span>{l}</span><input value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} required={k==='company'||k==='contactName'}/></label>)}<label><span>Stage</span><select value={f.stage} onChange={e=>setF({...f,stage:e.target.value})}>{['NEW','QUALIFIED','TOUR','PROPOSAL','NEGOTIATION','WON','LOST'].map(x=><option key={x}>{x}</option>)}</select></label><button type="submit">Save inquiry</button></form>}
