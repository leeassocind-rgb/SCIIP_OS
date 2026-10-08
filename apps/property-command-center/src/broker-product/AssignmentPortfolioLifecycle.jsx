import React,{useMemo,useState}from'react';
import{
  Archive,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CirclePlus,
  Clock3,
  FolderArchive,
  Search,
  X
}from'lucide-react';
import ListingAssignmentProductionHouse from'./ListingAssignmentProductionHouse.jsx';
import{
  ASSIGNMENT_TYPES,
  INITIAL_ASSIGNMENT_PORTFOLIO,
  buildArchivedAnalytics,
  createAssignment,
  previewActivation,
  transitionAssignment
}from'../product-realism/assignment/assignmentPortfolioEngine.js';
import'./assignment-portfolio-lifecycle.css';

const STATUS_TABS=[
  ['ACTIVE','Active'],
  ['DRAFT','Draft'],
  ['CLOSED','Closed'],
  ['ARCHIVED','Archived']
];

export default function AssignmentPortfolioLifecycle(){
  const[assignments,setAssignments]=useState([...INITIAL_ASSIGNMENT_PORTFOLIO]);
  const[status,setStatus]=useState('ACTIVE');
  const[selectedId,setSelectedId]=useState('A-BROOKFIELD');
  const[query,setQuery]=useState('');
  const[showWizard,setShowWizard]=useState(false);
  const[showArchive,setShowArchive]=useState(false);

  const visible=useMemo(()=>assignments.filter(item=>
    item.status===status&&
    `${item.name} ${item.client} ${item.city} ${item.submarket}`.toLowerCase().includes(query.toLowerCase())
  ),[assignments,status,query]);

  const selected=assignments.find(item=>item.id===selectedId)||visible[0]||assignments[0];
  const analytics=useMemo(()=>buildArchivedAnalytics(assignments),[assignments]);

  function saveAssignment(input){
    const created=createAssignment(input);
    setAssignments(current=>[...current,created]);
    setStatus('DRAFT');
    setSelectedId(created.id);
    setShowWizard(false);
  }

  function changeStatus(toStatus,metadata={}){
    const result=transitionAssignment(selected,toStatus,metadata);
    setAssignments(current=>current.map(item=>item.id===selected.id?result.assignment:item));
    setStatus(toStatus);
  }

  return (
    <section className="broker-page assignment-portfolio">
      <header className="assignment-command">
        <div>
          <p className="broker-kicker">Assignment portfolio</p>
          <h1>Client production house</h1>
        </div>
        <button type="button" className="assignment-add" onClick={()=>setShowWizard(true)}>
          <CirclePlus size={16}/> New Assignment
        </button>
      </header>

      <nav className="assignment-status-tabs" aria-label="Assignment lifecycle">
        {STATUS_TABS.map(([id,label])=>
          <button
            type="button"
            key={id}
            className={status===id?'active':''}
            onClick={()=>setStatus(id)}
          >
            {label}
            <span>{assignments.filter(item=>item.status===id).length}</span>
          </button>
        )}
      </nav>

      <section className="assignment-toolbar">
        <label className="assignment-search">
          <Search size={15}/>
          <input
            value={query}
            onChange={event=>setQuery(event.target.value)}
            placeholder="Search assignments, clients, cities…"
          />
        </label>

        <label className="assignment-switcher">
          <span>Current assignment</span>
          <select value={selected?.id||''} onChange={event=>setSelectedId(event.target.value)}>
            {visible.map(item=>
              <option value={item.id} key={item.id}>
                {item.name} — {item.client}
              </option>
            )}
          </select>
          <ChevronDown size={15}/>
        </label>

        {selected&&
          <div className="assignment-lifecycle-actions">
            {selected.status==='DRAFT'&&
              <button type="button" onClick={()=>changeStatus('ACTIVE')}>Activate</button>
            }
            {selected.status==='ACTIVE'&&
              <button type="button" onClick={()=>setShowArchive(true)}>Close assignment</button>
            }
            {selected.status==='CLOSED'&&
              <button type="button" onClick={()=>changeStatus('ARCHIVED')}>Archive</button>
            }
            {selected.status==='ARCHIVED'&&
              <button type="button" onClick={()=>changeStatus('ACTIVE',{reason:'Reopened'})}>Reopen</button>
            }
          </div>
        }
      </section>

      {status==='ARCHIVED'
        ? <ArchiveAnalytics analytics={analytics} assignments={visible} onSelect={setSelectedId}/>
        : selected?.id==='A-BROOKFIELD'&&selected.status==='ACTIVE'
          ? <ListingAssignmentProductionHouse/>
          : <AssignmentSummary assignment={selected}/>
      }

      {showWizard&&
        <NewAssignmentWizard onClose={()=>setShowWizard(false)} onSave={saveAssignment}/>
      }

      {showArchive&&selected&&
        <CloseAssignmentDialog
          assignment={selected}
          onClose={()=>setShowArchive(false)}
          onConfirm={metadata=>{
            changeStatus('CLOSED',metadata);
            setShowArchive(false);
          }}
        />
      }
    </section>
  );
}

function AssignmentSummary({assignment}){
  if(!assignment)return <section className="assignment-empty">No assignments match this view.</section>;
  const preview=previewActivation(assignment,{
    competitionCount:2,
    comparableCount:2,
    matchingRequirements:1
  });

  return (
    <section className="assignment-summary">
      <header>
        <div>
          <p className="broker-kicker">{assignment.status} · {assignment.type.replaceAll('_',' ')}</p>
          <h2>{assignment.name}</h2>
          <p>{assignment.client} · {[assignment.city,assignment.submarket].filter(Boolean).join(' · ')||'Location not configured'}</p>
        </div>
      </header>

      <div className="assignment-summary-grid">
        <article><span>Unread changes</span><strong>{assignment.unreadChanges||0}</strong></article>
        <article><span>Open tasks</span><strong>{assignment.openTasks||0}</strong></article>
        <article><span>Criteria version</span><strong>{assignment.criteriaVersion||0}</strong></article>
        <article><span>Activation</span><strong>{preview.ready?'Ready':'Needs setup'}</strong></article>
      </div>

      {assignment.status==='DRAFT'&&
        <section className="assignment-activation-preview">
          <div>
            <p className="broker-kicker">Activation preview</p>
            <h3>{preview.ready?'Ready to activate':'Complete setup before activation'}</h3>
          </div>
          <div className="activation-counts">
            <span>{preview.competitionCount} initial competitors</span>
            <span>{preview.comparableCount} initial comparables</span>
            <span>{preview.matchingRequirements} matching requirements</span>
          </div>
          {preview.missingFields.length>0&&
            <ul>{preview.missingFields.map(item=><li key={item}>{item}</li>)}</ul>
          }
        </section>
      }
    </section>
  );
}

function ArchiveAnalytics({analytics,assignments,onSelect}){
  return (
    <section className="archive-analytics">
      <div className="archive-metric-grid">
        <article><span>Archived / closed</span><strong>{analytics.assignmentCount}</strong></article>
        <article><span>Transaction volume</span><strong>{analytics.transactionSf.toLocaleString()} SF</strong></article>
        <article><span>Average days active</span><strong>{analytics.averageDaysActive}</strong></article>
        <article><span>Inquiry → tour</span><strong>{analytics.inquiryToTourPct}%</strong></article>
        <article><span>Tour → proposal</span><strong>{analytics.tourToProposalPct}%</strong></article>
      </div>

      <section className="broker-panel">
        <header>
          <div><p className="broker-kicker">Institutional history</p><h2>Archived assignments</h2></div>
        </header>
        <div className="broker-list">
          {assignments.map(item=>
            <article key={item.id} onClick={()=>onSelect(item.id)}>
              <span className="broker-icon"><FolderArchive size={15}/></span>
              <div>
                <strong>{item.name}</strong>
                <small>{item.client} · {item.outcome||'Archived'} · {item.transactionSf?.toLocaleString()||0} SF</small>
              </div>
              <ArrowRight size={16}/>
            </article>
          )}
        </div>
      </section>
    </section>
  );
}

function NewAssignmentWizard({onClose,onSave}){
  const[step,setStep]=useState(1);
  const[form,setForm]=useState({
    name:'',
    client:'',
    type:'LISTING',
    leadBroker:'',
    city:'',
    submarket:'Inland Empire West',
    propertyId:'',
    nextCallAt:'',
    reportCadence:'BIWEEKLY',
    competitionCriteria:{minSf:600000,maxSf:800000,statuses:['AVAILABLE','UNDER CONSTRUCTION']},
    comparableCriteria:{minSf:450000,maxSf:900000,monthsBack:36}
  });

  const preview=previewActivation(createAssignment({...form,id:'PREVIEW'}),{
    competitionCount:2,
    comparableCount:2,
    matchingRequirements:1
  });

  return (
    <div className="assignment-modal-backdrop">
      <section className="assignment-wizard">
        <header>
          <div><p className="broker-kicker">New assignment</p><h2>Guided setup</h2></div>
          <button type="button" onClick={onClose}><X size={17}/></button>
        </header>

        <div className="wizard-steps">
          {['Identity','Property','Criteria','Cadence','Activate'].map((label,index)=>
            <span className={step===index+1?'active':''} key={label}>{index+1}. {label}</span>
          )}
        </div>

        <div className="wizard-body">
          {step===1&&
            <div className="wizard-grid">
              <Field label="Assignment name" value={form.name} onChange={value=>setForm({...form,name:value})}/>
              <Field label="Client" value={form.client} onChange={value=>setForm({...form,client:value})}/>
              <label><span>Type</span><select value={form.type} onChange={event=>setForm({...form,type:event.target.value})}>{ASSIGNMENT_TYPES.map(item=><option key={item}>{item}</option>)}</select></label>
              <Field label="Lead broker" value={form.leadBroker} onChange={value=>setForm({...form,leadBroker:value})}/>
            </div>
          }

          {step===2&&
            <div className="wizard-grid">
              <Field label="Property ID" value={form.propertyId} onChange={value=>setForm({...form,propertyId:value})} placeholder="Search or enter governed property ID"/>
              <Field label="City" value={form.city} onChange={value=>setForm({...form,city:value})}/>
              <Field label="Submarket" value={form.submarket} onChange={value=>setForm({...form,submarket:value})}/>
            </div>
          }

          {step===3&&
            <div className="wizard-grid">
              <NumberField label="Competition min SF" value={form.competitionCriteria.minSf} onChange={value=>setForm({...form,competitionCriteria:{...form.competitionCriteria,minSf:value}})}/>
              <NumberField label="Competition max SF" value={form.competitionCriteria.maxSf} onChange={value=>setForm({...form,competitionCriteria:{...form.competitionCriteria,maxSf:value}})}/>
              <NumberField label="Comparable min SF" value={form.comparableCriteria.minSf} onChange={value=>setForm({...form,comparableCriteria:{...form.comparableCriteria,minSf:value}})}/>
              <NumberField label="Comparable max SF" value={form.comparableCriteria.maxSf} onChange={value=>setForm({...form,comparableCriteria:{...form.comparableCriteria,maxSf:value}})}/>
              <NumberField label="Comparable lookback months" value={form.comparableCriteria.monthsBack} onChange={value=>setForm({...form,comparableCriteria:{...form.comparableCriteria,monthsBack:value}})}/>
            </div>
          }

          {step===4&&
            <div className="wizard-grid">
              <label><span>Report cadence</span><select value={form.reportCadence} onChange={event=>setForm({...form,reportCadence:event.target.value})}><option>WEEKLY</option><option>BIWEEKLY</option><option>MONTHLY</option></select></label>
              <label><span>Next client call</span><input type="datetime-local" value={form.nextCallAt} onChange={event=>setForm({...form,nextCallAt:event.target.value})}/></label>
            </div>
          }

          {step===5&&
            <section className="wizard-preview">
              <CheckCircle2 size={24}/>
              <h3>{preview.ready?'Ready for activation':'Save as draft'}</h3>
              <p>{preview.competitionCount} competitors · {preview.comparableCount} comparables · {preview.matchingRequirements} requirements</p>
              {preview.missingFields.length>0&&<ul>{preview.missingFields.map(item=><li key={item}>{item}</li>)}</ul>}
            </section>
          }
        </div>

        <footer>
          <button type="button" disabled={step===1} onClick={()=>setStep(step-1)}>Back</button>
          {step<5
            ? <button type="button" className="primary" onClick={()=>setStep(step+1)}>Continue</button>
            : <button type="button" className="primary" onClick={()=>onSave(form)}>Save assignment</button>
          }
        </footer>
      </section>
    </div>
  );
}

function CloseAssignmentDialog({assignment,onClose,onConfirm}){
  const[outcome,setOutcome]=useState('LEASED');
  const[reason,setReason]=useState('');
  return (
    <div className="assignment-modal-backdrop">
      <section className="close-dialog">
        <header><div><p className="broker-kicker">Close assignment</p><h2>{assignment.name}</h2></div><button type="button" onClick={onClose}><X size={17}/></button></header>
        <label><span>Outcome</span><select value={outcome} onChange={event=>setOutcome(event.target.value)}>{['LEASED','SOLD','WON','LOST','WITHDRAWN','EXPIRED','TRANSFERRED'].map(item=><option key={item}>{item}</option>)}</select></label>
        <label><span>Closing notes</span><textarea value={reason} onChange={event=>setReason(event.target.value)}/></label>
        <footer><button type="button" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={()=>onConfirm({outcome,closeReason:reason})}>Close assignment</button></footer>
      </section>
    </div>
  );
}

function Field({label,value,onChange,placeholder=''}){return <label><span>{label}</span><input value={value} placeholder={placeholder} onChange={event=>onChange(event.target.value)}/></label>}
function NumberField({label,value,onChange}){return <label><span>{label}</span><input type="number" value={value} onChange={event=>onChange(Number(event.target.value))}/></label>}
