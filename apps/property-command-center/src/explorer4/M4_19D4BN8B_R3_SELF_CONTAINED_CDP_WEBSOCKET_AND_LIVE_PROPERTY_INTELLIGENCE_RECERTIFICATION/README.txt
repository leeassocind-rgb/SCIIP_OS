SCIIP Explorer 4.0 — M4.19D4BN8B
Exact-Ten Live Governed Property Intelligence Consumer Observation
Read-only live observation after BN8A. No application/governed-data mutation.
Successful 10/10 observation advances to M4_19D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSURE.

BN8B-R1 REPAIR
--------------
The original BN8B bootstrap successfully found SCIIP on port 9333, then lost that
successful validation result before the observer ran. R1 resolves the validated
CDP port once, captures it as machine-readable JSON, and passes that exact port
directly into the unchanged Property Intelligence live observer.

No application source mutation.
No governed data mutation.

BN8B-R2 REPAIR
--------------
R1 repaired the wrapper but did not successfully patch the observer itself.
R2 makes the contract real: observe_bn8b.py now requires sys.argv[2], treats it
as the already-validated CDP port, queries only that port, and fails closed if
that exact SCIIP target cannot be resolved.

The live Property Intelligence observation logic is otherwise unchanged.

BN8B-R3 REPAIR
--------------
R2 successfully validated and handed off CDP port 9333, then blocked because the
observer depended on the third-party Python websocket module.

R3 removes that dependency completely. The observer now contains its own minimal
RFC6455 WebSocket client and communicates directly with the local Chrome DevTools
Protocol endpoint. This is the same dependency-free approach used successfully
in earlier Explorer live-certification milestones.

Property Intelligence observation semantics remain unchanged.
