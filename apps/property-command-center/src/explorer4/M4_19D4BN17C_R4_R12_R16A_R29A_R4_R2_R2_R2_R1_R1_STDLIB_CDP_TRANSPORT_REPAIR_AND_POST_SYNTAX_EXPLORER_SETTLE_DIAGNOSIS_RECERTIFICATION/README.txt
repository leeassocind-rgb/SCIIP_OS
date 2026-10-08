SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R1-R1

The prior post-syntax Explorer settle diagnostic was blocked before CDP
interaction because Python package 'websocket' was not installed.

This repair removes that external dependency entirely. It contains a minimal
RFC6455 WebSocket client implemented only with Python standard-library modules
(socket, struct, hashlib, base64) and uses it solely for Chrome DevTools
Protocol request/response traffic.

The diagnostic itself is unchanged in intent:
- fresh navigation to the SCIIP app;
- bounded five-second observation;
- no Explorer click;
- no property click;
- no Assignments/Generate/Export;
- no application or governed-data mutation.

If Explorer materializes uniquely and stably within two seconds, the next
milestone hardens the fresh-page settle race without relaxing the certified
two-second/three-sample contract.
