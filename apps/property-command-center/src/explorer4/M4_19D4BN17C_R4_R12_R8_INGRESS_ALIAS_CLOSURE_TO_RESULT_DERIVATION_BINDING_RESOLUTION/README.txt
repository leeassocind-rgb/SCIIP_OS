SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R8
Ingress Alias / Closure -> Result Derivation Binding Resolution

R7 certified:
- ingress symbol j;
- downstream symbol a;
- ingress argument contract EVENT_OBJECT_WITH_TARGET_VALUE;
- downstream argument contract QUERY_VALUE_OR_QUERY_STATE;
- direct j -> a edge is absent;
- indirect alias / closure binding remains.

R8 resolves:
1. symbols called from j;
2. aliases assigned from those symbols;
3. closures capturing query state;
4. wrapper functions forwarding value/query arguments;
5. the shortest symbol path from j to a;
6. argument transformation at each hop;
7. the canonical bound execution path for live certification.

Read-only:
- application source mutation OFF
- governed data mutation OFF
- network authority OFF
- pixel evidence OFF
- runtime function invocation OFF
