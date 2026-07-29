import{listPlugins,registerPlugin}from'./pluginRegistry.js';import{BUILTIN_CONNECTORS}from'./connectorCatalog.js';import{readSyncLedger}from'./syncLedger.js';
export function initializeIntegrationRuntime(){BUILTIN_CONNECTORS.forEach(registerPlugin);return integrationSnapshot()}
export function integrationSnapshot({organizationId='default'}={}){const events=readSyncLedger({organizationId});return{status:'INTEGRATION_PLATFORM_OPERATIONAL',plugins:listPlugins().length,events:events.length,governance:'BROKER_APPROVAL_REQUIRED',secrets:'EXTERNAL_ONLY',autonomousOutreach:'BLOCKED'}}
