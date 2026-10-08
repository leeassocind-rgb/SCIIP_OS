SCIIP Explorer 4.0 — M4.19D4BN9B
Exact-Ten Live Governed Analyze + Present Consumer Observation

Live, read-only observation of Analyze and Present consumer surfaces for the
established exact-ten governed cohort. Reuses the validated SCIIP CDP target
pattern and a self-contained WebSocket client (no external websocket package).

No application-source mutation. No governed-data mutation. Pixel evidence OFF.

BN9B-R1 REPAIR
--------------
The original BN9B package used CommonJS require() inside an .mjs static test.
Because the Explorer Node environment runs ES modules, certification stopped before
the live observer executed.

R1 converts BOTH the static test and live observer to native ESM. This prevents
the same module-system defect from recurring after the static test.

No application source mutation.
No governed data mutation.
