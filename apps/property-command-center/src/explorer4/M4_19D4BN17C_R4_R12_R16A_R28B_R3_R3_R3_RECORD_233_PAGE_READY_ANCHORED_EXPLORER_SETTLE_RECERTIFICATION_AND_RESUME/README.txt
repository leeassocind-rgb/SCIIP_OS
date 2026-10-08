SCIIP Explorer 4.0 — R28B-R3-R3-R3
Record 233 Page-Ready-Anchored Explorer Settle Recertification + Resume

Evidence:
- R28B-R3 preserved 32 certified records (201-232).
- R28B-R3-R3-R1 proved record 233 failed only at Explorer settle after fresh page creation.
- R28B-R3-R3-R2 observed the unique visible/enabled Explorer control at 1.0 second,
  inside the existing 2.0-second policy bound, with stable late-window behavior.

Repair:
- preserve records 201-232 without replay.
- recertify record 233 from a fresh page.
- anchor the 2.0-second Explorer settle window only after:
  * document.readyState == complete
  * total button DOM > 0
  * origin == http://127.0.0.1:5173
- require 3 consecutive valid Explorer samples within that unchanged 2.0-second bound.
- if record 233 passes, continue 234-400 strict sequentially.
- halt on first failure.

Non-export qualification:
- Download Client Listing Report may materialize and be certified.
- It is never clicked.
- Export invocation remains OFF for every executed record.
