R29B-R1-R1 consumes the explicit post-syntax failure:
ECONNREFUSED 127.0.0.1:5173 before record 401.

It:
- re-certifies the already repaired R29B runner with node --check,
- captures app/CDP pre-recovery state,
- starts the Property Command Center runtime only if 5173 is unavailable,
- requires app HTTP 200 and reusable CDP 9333,
- preserves the authoritative R29B runner byte-for-byte,
- reruns R29B unchanged,
- inspects structured R29B evidence to distinguish full qualification from a later guarded residual.

No governed-data mutation or Export invocation is performed by this wrapper. R29B itself remains non-export.
