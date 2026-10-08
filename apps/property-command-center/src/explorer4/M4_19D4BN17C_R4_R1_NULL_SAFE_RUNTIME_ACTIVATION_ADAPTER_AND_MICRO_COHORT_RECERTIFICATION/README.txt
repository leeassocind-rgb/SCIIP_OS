SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R1
Null-Safe Runtime Activation Adapter + Micro-Cohort Recertification

R4 failed before substantive certification because invoke_runtime_action() could
return null/None from Runtime.evaluate, while the observer assumed a dict and
dereferenced selection.get(...).

R4-R1 repairs only that runtime adapter contract:
- every activation probe is normalized to a deterministic result object;
- null / undefined / non-object runtime returns become
  {invoked:false, score:0, meta:null, diagnostic:"NULL_RUNTIME_RESULT"};
- activation exceptions are preserved as evidence instead of terminating execution;
- the same bounded 3-record micro-cohort is rerun;
- no workflow requirement is weakened.

Application source mutation: OFF
Governed data mutation: OFF
Network authority: OFF
Pixel evidence: OFF
