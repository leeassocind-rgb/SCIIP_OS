SCIIP Explorer 4.0 — R22B-R2-R5

R22B-R2-R4 proved:
- Vite app reachable on 5173
- Chrome executable valid
- CDP port 9333 already open
- /json/version already valid
- second Chrome launch failed because 9333 was already occupied
- active CDP server had zero page targets

Therefore the correct repair is to reuse the existing DevTools server and create a SCIIP page
target through the Chrome DevTools HTTP endpoint /json/new.

This package:
1. verifies the R22B-R2-R4 classification;
2. reuses the active CDP server on 9333;
3. creates a 127.0.0.1:5173 SCIIP page target if none exists;
4. verifies a WebSocket-debuggable page target is present;
5. restores Explorer-first selection parity;
6. restores source-certified post-publish Report Review unmount;
7. preserves PDF/runtime/Explorer/origin guards;
8. reruns the exact-three-record guarded Export cohort.

Application source mutation OFF.
Governed data mutation OFF.
Pixel evidence OFF.
