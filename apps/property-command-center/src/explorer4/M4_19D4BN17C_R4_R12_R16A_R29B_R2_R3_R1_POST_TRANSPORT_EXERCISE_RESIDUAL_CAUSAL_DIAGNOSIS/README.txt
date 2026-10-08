R29B-R2-R3-R1 diagnoses the first residual after runtime bootstrap and RawWebSocket installation.

The prior run reached an authoritative R29B state of RUNNING and then exited nonzero before emitting record-401 outcome logs. This diagnosis does NOT replay the New-400 qualification.

It performs one bounded read-only fresh-page CDP probe:
1. verify app HTTP,
2. verify CDP version endpoint,
3. PUT /json/new for a fresh app page,
4. perform RFC6455 WebSocket handshake,
5. issue Runtime.enable,
6. issue Page.enable,
7. issue a read-only Runtime.evaluate,
8. close the fresh page.

Explorer click, property click, Assignments, Generate, and Export all remain OFF.
