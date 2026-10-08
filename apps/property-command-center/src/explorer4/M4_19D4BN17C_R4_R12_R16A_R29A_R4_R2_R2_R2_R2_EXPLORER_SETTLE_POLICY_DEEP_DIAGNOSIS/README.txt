R29A-R4-R2-R2-R2-R2 deep diagnosis.

R1-R1 proved the missing websocket dependency was repaired, but its samples all
landed on chrome-error://chromewebdata/. Therefore FIRST_UNIQUE_EXPLORER=None
does not yet prove an Explorer timing-policy failure: the browser never loaded
the SCIIP document.

This milestone explicitly separates:
1. SCIIP HTTP runtime reachability at 127.0.0.1:5173;
2. existence/state of the CDP page target;
3. Page.navigate response;
4. persistence of chrome-error://chromewebdata/;
5. Explorer control materialization.

It performs no application/governed-data mutation and invokes no product UI controls.
