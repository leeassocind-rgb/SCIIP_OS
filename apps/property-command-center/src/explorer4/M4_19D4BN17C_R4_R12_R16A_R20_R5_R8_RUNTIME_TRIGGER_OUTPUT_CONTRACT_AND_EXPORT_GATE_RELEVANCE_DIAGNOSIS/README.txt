SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R16A-R20-R5-R8
Runtime Trigger Output Contract + Export-Gate Relevance Diagnosis

R5-R7 certified:
- component-platformruntimecenter imports runtime export b as r
- r() is invoked once with no arguments
- source PlatformRuntimeCenter calls bootstrapPlatformRuntime()
- bootstrapPlatformRuntime(extra=[]) therefore validly accepts the zero-argument invocation

This milestone determines whether that runtime bootstrap is actually causally relevant to the
missing Export/Presentation control. It inspects:
- bootstrap return/output shape
- fields consumed by PlatformRuntimeCenter
- source-wide bootstrap references
- Export/Presentation gate candidates
- any direct correlation between runtime output fields and Export gate predicates

If no causal correlation is found, the branch explicitly refocuses away from platform-runtime
bootstrap and back onto the true Export gate owner.

Read-only only. All operational authority remains OFF.
