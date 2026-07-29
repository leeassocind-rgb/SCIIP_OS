import{normalizePropertyIdentity}from'./digitalTwinIdentity.js';
const num=v=>Number.isFinite(Number(v))?Number(v):null;
export function buildTwinProfile(property={}){
 const identity=normalizePropertyIdentity(property);
 return Object.freeze({...identity,physical:Object.freeze({buildingSf:num(property.buildingSf??property.sf),landAcres:num(property.landAcres),clearHeightFt:num(property.clearHeightFt??property.clearHeight),dockHighDoors:num(property.dockHighDoors),powerAmps:num(property.powerAmps),yearBuilt:num(property.yearBuilt)}),ownership:Object.freeze({owner:property.owner??null,ownershipEntity:property.ownershipEntity??null}),location:Object.freeze({latitude:num(property.latitude),longitude:num(property.longitude),submarket:property.submarket??null}),profileVersion:'1.0'});
}
