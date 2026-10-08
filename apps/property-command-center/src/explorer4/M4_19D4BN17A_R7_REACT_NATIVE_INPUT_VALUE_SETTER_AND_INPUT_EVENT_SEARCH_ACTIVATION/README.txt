SCIIP Explorer 4.0 — M4.19D4BN17A-R7
React-Native Input Value Setter + Input-Event Search Activation

R6 established that keyboard Backspace/Delete events do not mutate the Explorer
controlled search input. R7 stops treating this as a keyboard problem.

R7 uses the native HTMLInputElement value setter on the actual visible search input,
then dispatches bubbling input/change events so React receives the value transition.
It verifies the DOM value exactly before Enter activation. This is read-only browser
interaction: no application source mutation and no governed data mutation.

R7 also reloads the live Explorer page once at startup to remove the stale accumulated
R5/R6 query before enumeration.
