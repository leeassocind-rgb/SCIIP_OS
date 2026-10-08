SCIIP Explorer 4.0 — M4.19D4BN17A-R6
Platform-Neutral Controlled-Input Reset + Live Search Enumeration

R5 proved CDP input delivery reached the search control, but also exposed a concrete
Mac keyboard-modifier defect: the attempted select-all did not clear the field.
Every query was appended to the previous value, so no controlled input match or
result-state transition could occur.

R6 removes reliance on OS-specific modifier bits. For every query it:
1. focuses the actual visible Explorer search input,
2. sends repeated Backspace/Delete key events until the controlled input reports empty,
3. verifies EMPTY before typing,
4. uses CDP Input.insertText for the new query,
5. verifies the controlled input equals the intended query exactly,
6. sends Enter through CDP,
7. waits for a live result-state transition,
8. harvests live-searchable property identities only after a verified activation.

Read-only. No application-source mutation. No governed-data mutation.
