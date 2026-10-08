// SCIIP Explorer 3.0 — M2.34
// Governed Market Context Anchor Migration
//
// Market Context/radius anchor only.
// Inventory-wide datasets and aggregate calculation logic remain unchanged.
//
// Authority:
// M2.33 sourceSelectedProperty -> governed selected property -> market anchor

import{resolveGovernedSelectedPropertyMapRuntime}from'./GovernedSelectedPropertyMapRuntime.js';

const freeze=x=>Object.freeze(x);

export function resolveGovernedMarketContextAnchor(property,model=null){
  const selected=resolveGovernedSelectedPropertyMapRuntime(property,model);

  if(!selected||selected.status!=='ACTIVE'||!selected.mapProperty){
    return freeze({
      status:'NO_PROPERTY',
      milestone:'M2.34',
      sourceProperty:property||null,
      anchorProperty:property||null,
      propertyKey:null,
      projectionId:null,
      canonicalState:'NO_PROPERTY',
      invariants:freeze({
        selectedAnchorOnly:true,
        inventoryMutation:false,
        aggregateLogicMutation:false,
        automaticCanonicalWrites:false
      })
    });
  }

  return freeze({
    status:'ACTIVE',
    milestone:'M2.34',
    sourceProperty:property,
    anchorProperty:selected.mapProperty,
    propertyKey:selected.propertyKey,
    projectionId:selected.projectionId,
    canonicalState:selected.canonicalState,
    governedRuntime:selected.governedRuntime,
    invariants:freeze({
      selectedAnchorOnly:true,
      governedSelectedPropertyAuthoritative:true,
      propertyIntelligenceParity:true,
      mapSelectionParity:true,
      rollbackAware:true,
      inventoryMutation:false,
      aggregateLogicMutation:false,
      sourceMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false
    })
  });
}

export function marketContextAnchorProperty(property,model=null){
  return resolveGovernedMarketContextAnchor(property,model).anchorProperty||property;
}
