R29B-R2-R3-R2-R1 consumes the exact state:
- Raw WebSocket/CDP transport certified
- authoritative R29B exits 13
- evidence remains RUNNING
- no record-401 outcome emitted

The diagnosis is read-only with respect to the record workflow. It:
1. maps exit-code 13 to R29B source context,
2. captures relevant fresh-page/navigation/settle source lines,
3. bootstraps the app if needed,
4. creates one fresh CDP page,
5. records its immediate URL/origin,
6. explicitly Page.navigate's that probe page to the SCIIP app,
7. observes URL/origin/readyState/Explorer count for two seconds,
8. closes the probe page.

No Explorer click, property click, Assignments, Generate, or Export.
