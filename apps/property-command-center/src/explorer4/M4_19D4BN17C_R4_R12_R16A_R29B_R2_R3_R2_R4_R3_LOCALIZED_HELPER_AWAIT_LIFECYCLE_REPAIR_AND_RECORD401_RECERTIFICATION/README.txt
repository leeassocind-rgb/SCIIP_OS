R29B-R2-R3-R2-R4-R3 consumes the exact R4-R2 localization:
- exit code 13
- no CDP call entered
- last async helper entered: httpOk
- authoritative runner restored after diagnosis

This milestone narrowly repairs only the R29B httpOk helper with a Node-20-safe bounded fetch lifecycle.

The repaired helper uses AbortController, a 2-second bound, false-on-failure semantics, and a finally block that always clears its timer. It then revalidates/starts the SCIIP app runtime if necessary and reruns authoritative R29B.

Governed data mutation remains OFF.
Export remains OFF.
Strict sequential and halt-on-first-failure remain ON.
