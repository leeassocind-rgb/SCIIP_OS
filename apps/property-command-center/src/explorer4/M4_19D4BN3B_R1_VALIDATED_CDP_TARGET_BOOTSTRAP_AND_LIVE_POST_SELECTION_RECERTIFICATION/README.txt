SCIIP Explorer 4.0
M4.19D4BN3B-R1
VALIDATED CDP TARGET BOOTSTRAP + LIVE POST-SELECTION RECERTIFICATION

PREREQUISITE
------------
BN3B static certification PASSED, but live execution returned:

STATUS: BLOCKED
DIAGNOSIS: BLOCKED_CDP_BOOTSTRAP_FAILED

The prior command reused CDP port 9222 because /json/version responded. That is
insufficient. A CDP endpoint may be alive while containing no eligible SCIIP page.

R1 therefore changes only the browser-target bootstrap contract:

REUSE a CDP port ONLY IF:
- /json returns at least one type=page target
- target URL is localhost or 127.0.0.1
- target is not chrome-extension://
- target DOM contains SCIIP shell
- target DOM contains Search SCIIP control

Otherwise:
- choose a fresh supported CDP port
- launch an isolated Chrome profile
- navigate directly to the detected SCIIP app URL
- wait until the SCIIP page target is verified
- run the same exact-ten BN3B live observation

NO APPLICATION SOURCE MUTATION.
NO GOVERNED DATA MUTATION.
NO PIXEL EVIDENCE.
