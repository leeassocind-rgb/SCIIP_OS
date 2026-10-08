SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R9-R1
Self-Bootstrapping CDP Target + Canonical Bound Search Live Materialization Recertification

R9 was blocked only because no reusable Chrome DevTools Protocol target was active.

R9-R1:
1. checks for an existing SCIIP Explorer CDP target;
2. if absent, launches an isolated Chrome instance with remote debugging on port 9333;
3. opens http://127.0.0.1:5173/ in that isolated debugging profile;
4. waits for the page target to appear;
5. executes the same bounded three-record canonical search materialization certification.

No application source mutation.
No governed data mutation.
No selected-property activation.
No downstream workflow actions.
Pixel evidence OFF.

The isolated Chrome profile is created under:
  /tmp/sciip-explorer-cdp-profile

The script does not modify the user's normal Chrome profile.
