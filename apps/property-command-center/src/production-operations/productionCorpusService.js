import {discoverCorpus} from './corpusDiscovery.js';
import {attachFingerprint} from './sourceFingerprint.js';
import {createPropertyIdentityService} from './propertyIdentity.js';
import {createEvidenceLedger} from './evidenceLedger.js';
import {createObservationStore} from './observationStore.js';
export function createProductionCorpusService(options={}) {
  const identity=options.identityService||createPropertyIdentityService();
  const evidence=options.evidenceLedger||createEvidenceLedger();
  const observations=options.observationStore||createObservationStore();
  const sourceByFingerprint=new Map(); let seq=0;
  return Object.freeze({
    register(entries=[],meta={}) {
      const corpus=discoverCorpus(entries,meta); let duplicates=0;
      const sources=corpus.sources.map(raw=>{
        const source=attachFingerprint(raw); const existing=sourceByFingerprint.get(source.fingerprint);
        if(existing){duplicates++; return {...existing,duplicate:true};}
        const record={...source,sourceId:`SRC-${String(++seq).padStart(8,'0')}`,status:source.supported?'REGISTERED':'REVIEW_REQUIRED',duplicate:false};
        sourceByFingerprint.set(record.fingerprint,record); return {...record};
      });
      return {...corpus,sources,duplicates,uniqueSources:sources.length-duplicates};
    },
    ingestObservation(input={}) {
      const resolved=identity.resolve(input.property||input.facts||{});
      if(!resolved.propertyId) return {status:'REVIEW_REQUIRED',identity:resolved};
      const evidenceIds=[];
      for(const [field,value] of Object.entries(input.facts||{})) evidenceIds.push(evidence.append({sourceId:input.sourceId,field,value,locator:input.locators?.[field]||null,confidence:input.confidence?.[field]??input.confidence??1}).evidenceId);
      const result=observations.append({sourceId:input.sourceId,propertyId:resolved.propertyId,kind:input.kind,facts:input.facts,evidenceIds,observedAt:input.observedAt,idempotencyKey:input.idempotencyKey});
      return {status:result.duplicate?'DUPLICATE':'INGESTED',identity:resolved,observation:result.observation,evidenceIds};
    },
    metrics(){return {registeredSources:sourceByFingerprint.size,canonicalProperties:identity.count(),observations:observations.count(),evidenceRecords:evidence.size()};},
    identity,evidence,observations
  });
}
