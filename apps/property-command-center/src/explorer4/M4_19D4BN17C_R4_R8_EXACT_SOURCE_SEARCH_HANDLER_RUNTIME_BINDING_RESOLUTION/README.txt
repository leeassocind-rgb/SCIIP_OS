SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R8
Exact Source Search Handler Runtime Binding Resolution

R4-R7 proved:
- source-side search result derivation and result setters exist;
- standard DOM/input/submit trigger variants do not invalidate live result state;
- BASE_ARRAY_SIGNATURE_COUNT is 0 on the search input owner chain;
- therefore the live search result collection is owned elsewhere.

R4-R8 resolves the exact source-defined search handler and its runtime owner.

Read-only scope:
- application source mutation: OFF
- governed data mutation: OFF
- network authority: OFF
- pixel evidence: OFF

R4-R8:
1. consumes R4-R7 evidence;
2. identifies concrete source files/handlers that bind search input to result derivation;
3. ranks exact source handler candidates using co-occurrence of query state, result setters,
   key/change handlers, and result render references;
4. fingerprints live React fiber/component owners and event prop functions;
5. maps source component/handler names to live component owners where possible;
6. records live handler function names / source strings safely;
7. determines whether the true search execution path is:
   - a parent-owned callback,
   - dispatcher/action route,
   - context/store action,
   - effect-driven selector,
   - or an alternate search provider;
8. produces a single exact next milestone based on the resolved runtime binding.

No search selection or downstream workflow recertification is attempted here.
