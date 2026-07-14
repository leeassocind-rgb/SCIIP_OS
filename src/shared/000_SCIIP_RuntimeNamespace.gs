/**
 * SCIIP_OS v6.1
 * Canonical Runtime Namespace Bootstrap
 *
 * This is the single top-level owner of SCIIP_RUNTIME. Runtime modules extend
 * this object but must not redeclare or replace it.
 */
var SCIIP_RUNTIME = (typeof SCIIP_RUNTIME !== 'undefined' && SCIIP_RUNTIME)
  ? SCIIP_RUNTIME
  : {};

SCIIP_RUNTIME.NAMESPACE_VERSION = 'v6.1';
SCIIP_RUNTIME.NAMESPACE_OWNER = '000_SCIIP_RuntimeNamespace';
