R6 discovered two r29bR4CertifyExplorerEntry(w) callsites, repaired one,
then correctly blocked because one undefined-w invocation remained. This package consumes
that exact partial state, replaces every remaining exact explorer-entry `(w)` call with
the per-record `cdp` binding, syntax-checks the authoritative runner, and reruns R29B.

Governed data mutation OFF. Export invocation OFF. Strict sequential ON.
