/** Product application registration and routing contract. */
var SCIIP_EPIC5_PROPERTY_COMMAND_APPLICATION_V7 = SCIIP_EPIC5_PROPERTY_COMMAND_APPLICATION_V7 || {};
SCIIP_EPIC5_PROPERTY_COMMAND_APPLICATION_V7.describe=function(){return {id:'property-command-center',label:'Property Command',version:SCIIP_PROPERTY_COMMAND_V7.VERSION,route:'/property-command-center',primaryInput:'SUPERSHEET_INGESTION',capabilities:['PROPERTY_CONTEXT','INGESTION_READINESS','DIGITAL_TWIN','GIS','KNOWLEDGE_GRAPH','AI_BRIEFING','MARKET_INTELLIGENCE','GOVERNED_ACTIONS'],productionMode:'VERTICAL_SLICE',reviewRequired:true,destructiveCommitEnabled:false};};
function sciipGetEpic5PropertyCommandApplication(){return SCIIP_EPIC5_PROPERTY_COMMAND_APPLICATION_V7.describe();}
