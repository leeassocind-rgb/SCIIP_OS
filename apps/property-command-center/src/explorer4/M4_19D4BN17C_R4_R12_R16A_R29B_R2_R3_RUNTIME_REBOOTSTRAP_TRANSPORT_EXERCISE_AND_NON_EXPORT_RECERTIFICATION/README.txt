R29B-R2-R3 addresses the post-syntax condition where the repaired R29B runner is valid but 127.0.0.1:5173 is not listening.

This package does not mutate the R29B runner.

It:
- confirms node syntax,
- confirms the RawWebSocket transport, HTTP/1.1 101 repair, and absence of the literal-newline artifact,
- records app/CDP pre-state,
- starts Property Command Center only if port 5173 is unavailable,
- requires HTTP 200 on app and CDP,
- hashes the runner before/after to prove no further mutation,
- reruns authoritative R29B to exercise the repaired transport,
- preserves Export OFF.

No governed-data mutation.
