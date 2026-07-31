import React,{useMemo} from 'react';
import {Database,FileCheck2,Fingerprint,GitMerge,MapPinned,ShieldCheck} from 'lucide-react';
import {createProductionCorpusService} from '../production-operations/productionCorpusService.js';
const demo=[
 {name:'AIR-CRE-SuperSheets-SoCal-Research-Listings-All-Regions-7-28-2026.pdf',bytes:594944},
 {name:'current-air-100000-199999.csv',bytes:211204},
 {name:'baseline-industrial.xlsx',bytes:450122},
 {name:'baseline-properties.kmz',bytes:112882}
];
export default function ProductionCorpusOperations(){
 const model=useMemo(()=>{const service=createProductionCorpusService();const corpus=service.register(demo,{batchId:'PRODUCTION-CORPUS'});service.ingestObservation({sourceId:corpus.sources[0].sourceId,property:{address:'2125 W Lowell St',city:'Rialto',state:'CA'},facts:{availableSf:664859,clearHeightFt:42,powerAmps:4000},observedAt:'2026-07-28'});return{corpus,metrics:service.metrics()};},[]);
 const cards=[[Database,'Registered sources',model.metrics.registeredSources],[Fingerprint,'Unique fingerprints',model.corpus.uniqueSources],[GitMerge,'Canonical properties',model.metrics.canonicalProperties],[FileCheck2,'Observations',model.metrics.observations],[ShieldCheck,'Evidence records',model.metrics.evidenceRecords],[MapPinned,'GIS sources',model.corpus.counts.GIS_KMZ||0]];
 return <div className="production-corpus-operations"><div className="pc-hero"><div><span>PRODUCTION OPERATIONS · BATCH 2</span><h2>Corpus Discovery & Property Identity</h2><p>Immutable inventory, source fingerprinting, canonical identity, temporal observations, and field-level evidence.</p></div><strong>OPERATIONAL</strong></div><div className="pc-metrics">{cards.map(([Icon,label,value])=><article key={label}><Icon size={18}/><span>{label}</span><strong>{value}</strong></article>)}</div><section className="pc-table"><header><h3>Discovered production corpus</h3><span>{model.corpus.supportedCount} supported sources</span></header><table><thead><tr><th>Source</th><th>Family</th><th>Type</th><th>Status</th></tr></thead><tbody>{model.corpus.sources.map(s=><tr key={s.sourceId}><td>{s.name}</td><td>{s.family}</td><td>{s.type}</td><td><span className="pc-status">{s.status}</span></td></tr>)}</tbody></table></section></div>;
}
