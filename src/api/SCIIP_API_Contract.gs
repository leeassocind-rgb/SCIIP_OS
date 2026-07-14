/** Public contract metadata used by certification and future clients. */
var SCIIP_API_CONTRACT = Object.freeze({
  API_VERSION: 'v1',
  PLATFORM_VERSION: 'v6.1',
  ENVELOPE: ['apiVersion', 'status', 'requestId', 'timestamp', 'data', 'error', 'httpStatus'],
  METHODS: ['GET', 'POST'],
  AUTHENTICATION: 'INJECTED_PROVIDER_FAIL_CLOSED',
  DEFAULT_ROUTES: ['/health', '/version', '/routes']
});
