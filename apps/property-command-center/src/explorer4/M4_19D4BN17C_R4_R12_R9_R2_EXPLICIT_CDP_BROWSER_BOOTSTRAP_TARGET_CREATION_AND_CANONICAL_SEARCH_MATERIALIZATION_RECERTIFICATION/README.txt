SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R9-R2
Explicit CDP Browser Bootstrap + Target Creation + Canonical Search Materialization Recertification

R9-R1 proved:
- Explorer HTTP target is ready;
- Chrome process launch succeeds;
- passive page-target discovery after bootstrap fails.

R9-R2 repairs the bootstrap contract itself:
1. prefer an existing SCIIP CDP page target;
2. otherwise launch Chrome in a unique isolated headless debugging profile;
3. explicitly verify the browser debugging endpoint at /json/version;
4. explicitly create an Explorer page target using PUT /json/new?http://127.0.0.1:5173/;
5. wait for that exact target to become available;
6. attach via the self-contained websocket client;
7. execute the bounded three-record canonical search materialization recertification.

No normal Chrome profile is touched.
No application source mutation.
No governed data mutation.
No selected-property activation.
No downstream workflow actions.
Pixel evidence OFF.
