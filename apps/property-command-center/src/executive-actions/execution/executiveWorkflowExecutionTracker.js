import { createExecutiveWorkflowExecutionSnapshot } from './executiveWorkflowExecutionSnapshot.js';
import { createExecutiveExecutionEvidence } from './executiveExecutionEvidence.js';
import { reconstructExecutiveExecutionTimeline, executionDurationMs } from './executiveExecutionTimeline.js';

const ALLOWED = Object.freeze({
  ACCEPTED: new Set(['RUNNING','CANCELLED','FAILED']),
  RUNNING: new Set(['PAUSED','COMPLETED','FAILED','CANCELLED']),
  PAUSED: new Set(['RUNNING','FAILED','CANCELLED']),
  COMPLETED: new Set(), FAILED: new Set(), CANCELLED: new Set()
});

export function createExecutiveWorkflowExecutionTracker(options = {}) {
  const maxEvents = Math.max(1, Number(options.maxEvents || 500));
  const streams = new Map();
  const seenEventIds = new Set();
  let startedAt = null, eventsRecorded = 0, duplicatesIgnored = 0, invalidTransitionsBlocked = 0, evidenceAttached = 0, failures = 0;
  const ensure = id => { if (!streams.has(id)) streams.set(id,{snapshots:[],evidence:[]}); return streams.get(id); };
  const current = id => ensure(id).snapshots.at(-1) || null;
  const trim = stream => { while (stream.snapshots.length > maxEvents) stream.snapshots.shift(); };
  const record = input => {
    try {
      const eventId = input.eventId || `${input.workflowRequestId}:${input.status}:${input.occurredAt || ''}`;
      if (seenEventIds.has(eventId)) { duplicatesIgnored++; return Object.freeze({status:'DUPLICATE_IGNORED',snapshot:current(input.workflowRequestId)}); }
      const previous = current(input.workflowRequestId);
      const nextStatus = String(input.status || 'ACCEPTED').toUpperCase();
      if (!previous && nextStatus !== 'ACCEPTED') { invalidTransitionsBlocked++; return Object.freeze({status:'INVALID_TRANSITION_BLOCKED',from:null,to:nextStatus}); }
      if (previous && !ALLOWED[previous.status].has(nextStatus)) { invalidTransitionsBlocked++; return Object.freeze({status:'INVALID_TRANSITION_BLOCKED',from:previous.status,to:nextStatus}); }
      const stream = ensure(input.workflowRequestId);
      const snapshot = createExecutiveWorkflowExecutionSnapshot({...input,status:nextStatus,sequence:(previous?.sequence || 0)+1,evidenceIds:input.evidenceIds || previous?.evidenceIds || []});
      stream.snapshots.push(snapshot); trim(stream); seenEventIds.add(eventId); eventsRecorded++;
      return snapshot;
    } catch (error) { failures++; return Object.freeze({status:'TRACKING_FAILED',message:error.message}); }
  };
  const attachEvidence = input => {
    try {
      const stream = ensure(input.workflowRequestId);
      if (!stream.snapshots.length) throw new Error('Workflow must be accepted before evidence is attached');
      const evidence = createExecutiveExecutionEvidence(input);
      if (stream.evidence.some(item => item.evidenceId === evidence.evidenceId)) { duplicatesIgnored++; return Object.freeze({status:'DUPLICATE_IGNORED',evidence}); }
      stream.evidence.push(evidence); evidenceAttached++;
      return evidence;
    } catch (error) { failures++; return Object.freeze({status:'EVIDENCE_FAILED',message:error.message}); }
  };
  const timeline = id => reconstructExecutiveExecutionTimeline(ensure(id).snapshots, ensure(id).evidence);
  return Object.freeze({
    start(){ startedAt ||= new Date().toISOString(); return this.snapshot(); },
    stop(){ return this.snapshot('STOPPED'); },
    record, attachEvidence,
    accept: input => record({...input,status:'ACCEPTED'}),
    startExecution: input => record({...input,status:'RUNNING'}),
    pause: input => record({...input,status:'PAUSED'}),
    resume: input => record({...input,status:'RUNNING'}),
    complete: input => record({...input,status:'COMPLETED'}),
    fail: input => record({...input,status:'FAILED'}),
    cancel: input => record({...input,status:'CANCELLED'}),
    getCurrent: current,
    getTimeline: timeline,
    getEvidence: id => Object.freeze([...ensure(id).evidence]),
    getExecutionSummary(id){ const line=timeline(id); const last=line.at(-1)||null; return Object.freeze({workflowRequestId:id,status:last?.status||'NOT_TRACKED',terminal:Boolean(last?.terminal),eventCount:line.length,evidenceCount:ensure(id).evidence.length,durationMs:executionDurationMs(line),sourceSignalIds:Object.freeze([...(last?.sourceSignalIds||[])])}); },
    snapshot(forced){ return Object.freeze({status:forced || (startedAt?'OPERATIONAL':'READY'),startedAt,trackedWorkflows:streams.size,eventsRecorded,retainedEvents:[...streams.values()].reduce((n,s)=>n+s.snapshots.length,0),maxEvents,duplicatesIgnored,invalidTransitionsBlocked,evidenceAttached,failures,immutableHistory:true,autonomousExecutionAllowed:false}); }
  });
}
