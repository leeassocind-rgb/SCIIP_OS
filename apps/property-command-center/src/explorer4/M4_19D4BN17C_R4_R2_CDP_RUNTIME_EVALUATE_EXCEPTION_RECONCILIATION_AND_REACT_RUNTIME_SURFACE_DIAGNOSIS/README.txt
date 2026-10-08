SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R2
CDP Runtime Evaluate Exception Reconciliation + React Runtime Surface Diagnosis

R4-R1 completed without crashing but all 18 runtime activation probes normalized to
NULL_RUNTIME_RESULT. Because the same null occurred for Selection, Compare, Command,
Analyze, Present, and Export across all three micro-cohort properties, R4-R2 treats
this first as a CDP Runtime.evaluate observability problem, not as six independent
application-action failures.

R4-R2:
- consumes R4-R1 evidence;
- inspects full Runtime.evaluate responses rather than only result.value;
- records exceptionDetails, subtype, description, unserializableValue, and value;
- runs progressively more complex JavaScript probes;
- inventories React internal keys (__reactProps$, __reactFiber$, __reactContainer$);
- captures serializable metadata from React event-bearing nodes without invoking actions;
- determines whether the prior NULL_RUNTIME_RESULT came from JS exceptions, serialization,
  or absence of accessible React runtime surfaces.

Read-only diagnosis only.
Application source mutation: OFF
Governed data mutation: OFF
Network authority: OFF
Pixel evidence: OFF
