SCIIP Explorer 4.0 — R22A-R1
Assignments Navigation Source-Owner Correlation + Target Qualification Recertification

R22A blocked because one source precondition was too narrow:
  brokerAssignmentsNavBinding = false

The other certified source contracts remained true:
- Generate Client Listing Report binding
- InstitutionalReportReview mount gate
- Download Client Listing Report / exportReport binding

R22A-R1 does NOT modify application source.

It repairs the qualification logic by searching the active source tree for the actual owner of
the Assignments navigation contract instead of assuming that the binding must exist in one
specific SCIIPBrokerApp.jsx file.

After resolving the source owner, it repeats the exact-three-record qualification:
1. 2 Musick
2. 2701 Carrier Ave
3. 8700 - 8750 Rex Rd

Policy remains:
- same certified browser context
- fresh Explorer page target per record
- strict sequential execution
- halt on first failure
- exact selected-property readback
- Assignments entry
- Generate Client Listing Report materialization
- report-review entry
- Download Client Listing Report materialization
- exact live exportReport handler parity

Export invocation remains OFF.
