SCIIP Explorer 4.0 — R22B-R2-R4

R22B-R2-R3 failed before recertification because a local Chrome/CDP context never materialized.

This milestone is diagnostic only. It does not invoke Export and does not interact with the
SCIIP workflow.

It separately inspects:
1. whether http://127.0.0.1:5173/ is reachable;
2. which Chrome/Chromium executable is available;
3. whether port 9333 is open before launch;
4. whether /json/version is served before launch;
5. an exact Chrome launch using a dedicated non-default profile;
6. whether port 9333 binds after launch;
7. whether /json/version becomes available;
8. whether a SCIIP page target for 127.0.0.1:5173 appears;
9. Chrome stdout/stderr for launch-policy or profile errors.

The output selects a bounded next milestone based on the exact causal classification.

Application source mutation OFF.
Governed data mutation OFF.
Export invocation OFF.
Workflow interaction OFF.
Pixel evidence OFF.
