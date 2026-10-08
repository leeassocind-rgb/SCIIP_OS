import{useEffect,useMemo,useState}from'react';
import{GOVERNED_ASSIGNMENT_PROPERTIES}from'./governedAssignmentSeed.js';
import{dedupeGovernedProperties,gateProductionProperties}from'./provenanceGate.js';
import{evaluateRuntimeShadow as sciipEvaluateRuntimeShadow}from'./../../../explorer4/runtime/MarketAvailabilityRuntimeShadowSidecar.mjs';
import{stageAirRowsInMemory}from'../../../explorer4/runtime/AirMarketStagingRuntimeAdapter.mjs';

const DATA_URL='/explorer/governed-base-inventory.json';

export function useGovernedExplorerData(){
/* K6Y_GUARDED_FIXTURE_ONLY_BEGIN */
const __sciipK6YFixtureEnabled =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_SCIIP_K6Y_FIXTURE_ONLY === "YES";

if (__sciipK6YFixtureEnabled) {
  const __sciipK6YInventory = [{
    canonicalPropertyId:"BASE-9538697DF7DFA649",
    propertyId:"BASE-9538697DF7DFA649",
    id:"BASE-9538697DF7DFA649",
    address:"9400 Holly Rd",
    city:"Adelanto",
    state:"CA",
    postalCode:"92301",
    availableSf:68163
  }];
  const __sciipK6YMetadata = {
    source:"AIR_SUPERSHEET",
    observationDate:"2026-08-28",
    geography:"K6Y_FIXTURE_ONLY",
    minimumSf:50000,
    transactionScope:"LEASE_OR_SALE",
    completenessCertification:"FIXTURE_ONLY_NOT_PRODUCTION",
    sourceFileHash:"K6Y_IN_MEMORY_FIXTURE_ONLY"
  };
  const __sciipK6YRows = [
    {
      source:"AIR_SUPERSHEET",
      observationDate:"2026-08-28",
      sourceFileHash:"K6Y_IN_MEMORY_FIXTURE_ONLY",
      sourceRowNumber:1,
      address:"9400 Holly Rd",
      city:"Adelanto",
      state:"CA",
      postalCode:"92301",
      availableSf:65000,
      askingRent:1.25,
      eventType:"AVAILABILITY_CHANGE",
      changeType:"AVAILABILITY_CHANGE"
    },
    {
      source:"AIR_SUPERSHEET",
      observationDate:"2026-08-28",
      sourceFileHash:"K6Y_IN_MEMORY_FIXTURE_ONLY",
      sourceRowNumber:2,
      address:"999999 Unknown Industrial Way",
      city:"Adelanto",
      state:"CA",
      postalCode:"92301",
      availableSf:50000,
      eventType:"NEW_AVAILABILITY",
      changeType:"NEW_AVAILABILITY"
    }
  ];
  const __sciipK6YResult = stageAirRowsInMemory({
    inventory:__sciipK6YInventory,
    metadata:__sciipK6YMetadata,
    rows:__sciipK6YRows
  });
  if (typeof globalThis !== "undefined") {
    globalThis.__SCIIP_K6Y_FIXTURE_RESULT__ = __sciipK6YResult;
  }
}
/* K6Y_GUARDED_FIXTURE_ONLY_END */

  const[baseInventory,setBaseInventory]=useState([]);
  const[dataStatus,setDataStatus]=useState({state:'LOADING',loaded:0,rejected:0,error:null});

  useEffect(()=>{
    let active=true;
    fetch(DATA_URL,{cache:'no-store'})
      .then(response=>{if(!response.ok)throw new Error(`Base inventory request failed: ${response.status}`);return response.json();})
      .then(payload=>{
        if(!active)return;
        const rows=Array.isArray(payload?.properties)?payload.properties:[];
// SCIIP_G2X5_LIVE_AVAILABILITY_RUNTIME_SHADOW_BINDING
try{
  const sciipG2X5ShadowObservation=sciipEvaluateRuntimeShadow(
    {rows:Array.isArray(rows)?structuredClone(rows):[],source:'governed-base-inventory',mode:'LIVE_RUNTIME_SHADOW_ONLY'},
    input=>({decision:'OBSERVE_GOVERNED_BASE_INVENTORY_ROWS',rowCount:input.rows.length,source:input.source})
  );
  void sciipG2X5ShadowObservation;
  // SCIIP_G2X11_EPHEMERAL_SHADOW_EVIDENCE_CHANNEL
  if(typeof window!=='undefined'&&typeof window.dispatchEvent==='function'&&typeof CustomEvent==='function'){
    window.dispatchEvent(new CustomEvent('sciip:market-availability-shadow-observation',{detail:{
      rowCount:Array.isArray(rows)?rows.length:0,
      source:'governed-base-inventory',
      mode:'LIVE_RUNTIME_SHADOW_ONLY',
      timestamp:new Date().toISOString()
    }}));
  }
}catch(sciipG2X5ShadowFailure){
  void sciipG2X5ShadowFailure; // FAIL OPEN TO EXISTING PRODUCTION PATH; SHADOW HAS NO CONTROL AUTHORITY
}
        setBaseInventory(rows);
        setDataStatus({state:'READY',loaded:rows.length,rejected:0,error:null});
      })
      .catch(error=>{
        if(!active)return;
        setBaseInventory([]);
        setDataStatus({state:'DEGRADED',loaded:0,rejected:0,error:String(error?.message||error)});
      });
    return()=>{active=false;};
  },[]);

  const result=useMemo(()=>{
    const merged=dedupeGovernedProperties([...GOVERNED_ASSIGNMENT_PROPERTIES,...baseInventory]);
    const gate=gateProductionProperties(merged,{allowSynthetic:false});
    return{
      properties:gate.accepted,
      relationships:[],
      dataStatus:{...dataStatus,rejected:gate.rejected.length}
    };
  },[baseInventory,dataStatus]);

  return result;
}
