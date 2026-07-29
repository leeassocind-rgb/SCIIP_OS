const metadata=new Map();
const key=(organizationId,connectorId)=>`${organizationId||'default'}::${connectorId}`;
export function storeCredentialMetadata({organizationId='default',connectorId,provider,scopes=[],expiresAt=null,status='CONFIGURED'}){if(!connectorId||!provider)throw new Error('connectorId and provider required');const record=Object.freeze({organizationId,connectorId,provider,scopes:[...new Set(scopes)].sort(),expiresAt,status,secretStoredExternally:true,updatedAt:new Date().toISOString()});metadata.set(key(organizationId,connectorId),record);return record}
export function getCredentialMetadata({organizationId='default',connectorId}){return metadata.get(key(organizationId,connectorId))||null}
export function revokeCredentialMetadata({organizationId='default',connectorId}){const current=getCredentialMetadata({organizationId,connectorId});if(!current)return null;return storeCredentialMetadata({...current,status:'REVOKED'});}
export function resetCredentialVault(){metadata.clear()}
