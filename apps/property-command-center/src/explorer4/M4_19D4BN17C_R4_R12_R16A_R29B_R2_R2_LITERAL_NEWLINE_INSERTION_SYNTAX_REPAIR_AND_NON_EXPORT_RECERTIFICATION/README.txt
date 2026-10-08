R29B-R2-R2 repairs the exact syntax defect exposed by R29B-R2-R1:

  \nclass CDP {

The R29B-R2 generator inserted a literal backslash-n sequence between RawWebSocket and class CDP rather than an actual newline.

This package:
- replaces only that literal sequence with an actual newline,
- preserves the RawWebSocket transport,
- preserves the HTTP/1.1 101 startsWith repair,
- preserves masked frames, large-frame handling, ping/pong handling,
- runs node --check,
- preserves fresh-page, strict-sequential, halt-on-first-failure, and Export-OFF contracts,
- reruns authoritative R29B only after syntax certification.

No governed-data mutation and no Export invocation.
