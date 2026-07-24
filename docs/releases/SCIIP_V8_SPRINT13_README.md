# SCIIP_OS v8.0 Sprint 13

## Enterprise Administration, Identity, Roles & Security Governance

Sprint 13 adds the governed enterprise administration plane for identities, RBAC, workspace permissions, groups, approval authorities, security policies, sessions, access reviews, security events, organization settings, and API/service permissions.

### Governance contract

- Deny by default.
- Privileged assignments require approval authority.
- Access decisions are explainable and evidence linked.
- Administrative activity is append-only and auditable.
- Destructive actions remain disabled by default.
- Session operations enter governed commit rather than mutating history directly.

### Certification

```bash
node tools/tests/sciip-v8-sprint13-enterprise-administration-test.js
npm run deployment:compile
node tools/patches/patch-v8-sprint13-compiled-certification.js
grep -R "function sciipTestV8Sprint13EnterpriseAdministrationIdentityRolesSecurityGovernance" dist/apps-script
```

Apps Script public certification function:

```javascript
sciipTestV8Sprint13EnterpriseAdministrationIdentityRolesSecurityGovernance()
```

Expected status: `PASSED` with 35 tests.
