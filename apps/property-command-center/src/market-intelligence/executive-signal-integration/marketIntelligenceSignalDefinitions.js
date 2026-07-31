import { registerExecutiveSignalType } from '../../executive-signals/executiveSignalRegistry.js';
export const MARKET_INTELLIGENCE_SIGNAL_TYPES=Object.freeze({TIGHTENING:'MARKET_TIGHTENING_DETECTED',INFRASTRUCTURE:'MARKET_INFRASTRUCTURE_PRIORITY',REVIEW:'MARKET_BROKER_REVIEW_REQUIRED'});
export function registerMarketIntelligenceSignalTypes(){return Object.freeze([
 registerExecutiveSignalType({type:MARKET_INTELLIGENCE_SIGNAL_TYPES.TIGHTENING,source:'market-intelligence',description:'Rent and vacancy trends indicate market tightening',defaultSeverity:'HIGH',assignmentScoped:true,consequential:true}),
 registerExecutiveSignalType({type:MARKET_INTELLIGENCE_SIGNAL_TYPES.INFRASTRUCTURE,source:'market-intelligence',description:'Priority infrastructure signal detected',defaultSeverity:'HIGH',assignmentScoped:true,consequential:true}),
 registerExecutiveSignalType({type:MARKET_INTELLIGENCE_SIGNAL_TYPES.REVIEW,source:'market-intelligence',description:'Market intelligence requires broker review',defaultSeverity:'MEDIUM',assignmentScoped:true,consequential:false})
]);}
