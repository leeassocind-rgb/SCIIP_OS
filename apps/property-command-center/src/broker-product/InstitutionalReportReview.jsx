import React,{useMemo,useState}from'react';
import{CheckCircle2,Download,FilePenLine,X}from'lucide-react';
import{
  buildInstitutionalReportModel,
  downloadInstitutionalReport
}from'../product-realism/assignment/institutionalReportEngine.js';
import'./institutional-report-review.css';

export default function InstitutionalReportReview({view,onClose,onPublish}){
  const initial=useMemo(()=>buildInstitutionalReportModel(view),[view]);
  const[marketIntelligence,setMarketIntelligence]=useState(initial.marketIntelligence);
  const[executiveNotes,setExecutiveNotes]=useState(initial.executiveNotes);
  const[exporting,setExporting]=useState(false);

  const model=useMemo(()=>({
    ...initial,
    marketIntelligence,
    executiveNotes
  }),[initial,marketIntelligence,executiveNotes]);

  function exportReport(){
    setExporting(true);
    try{const filename=downloadInstitutionalReport(model);onPublish?.({model,filename});}
    finally{window.setTimeout(()=>setExporting(false),400);}
  }

  return (
    <div className="ire-backdrop">
      <section className="ire-review">
        <header>
          <div>
            <p className="broker-kicker">Institutional Reporting Engine</p>
            <h2>Review Client Listing Report</h2>
            <span>{model.clientDisplayName} · {model.assignment.name}</span>
          </div>
          <button type="button" onClick={onClose}><X size={18}/></button>
        </header>

        <div className="ire-review__body">
          <section className="ire-review__status">
            <div><CheckCircle2 size={18}/><span>Complete inquiry history loaded</span></div>
            <div><FilePenLine size={18}/><span>Changes measured against last published report</span></div>
          </section>

          <label>
            <span>Market Intelligence</span>
            <textarea value={marketIntelligence} onChange={event=>setMarketIntelligence(event.target.value)}/>
            <small>AI-drafted from current and previous published assignment snapshots.</small>
          </label>

          <label>
            <span>Executive Notes</span>
            <textarea value={executiveNotes} onChange={event=>setExecutiveNotes(event.target.value)}/>
            <small>Edit this narrative before sending the report to ownership.</small>
          </label>

          <section className="ire-report-preview">
            <strong>Concise recurring report</strong>
            <span>Page 1: market intelligence, marketing activity, tenant requirements, executive notes</span>
            <span>Page 2: complete inquiry history, competition changes, comparable changes</span><span>Publishing creates the next comparison baseline.</span>
          </section>
        </div>

        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" className="ire-primary" onClick={exportReport} disabled={exporting}>
            <Download size={16}/>{exporting?'Generating PDF...':'Download Client Listing Report'}
          </button>
        </footer>
      </section>
    </div>
  );
}
