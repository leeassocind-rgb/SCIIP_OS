SCIIP Explorer 4.0 — R22B-R2

R22B-R1 certified that Report Review intentionally closes after successful publication:
the parent onPublish callback appends the report record and then calls setShowReportReview(false).

Therefore R22B's first record was a successful Export incorrectly rejected by an obsolete
continuity requirement.

R22B-R2:
1. consumes the certified R22B-R1 causal diagnosis;
2. repairs only the certification guard;
3. does NOT mutate application source;
4. requires Report Review to be unmounted after successful publish;
5. preserves Explorer continuity, same-origin, zero-error, PDF artifact, and one-click guards;
6. reruns the exact three-record cohort sequentially with a fresh Explorer page per record.

Application source mutation OFF.
Governed data mutation OFF.
Network authority OFF.
Pixel evidence OFF.
