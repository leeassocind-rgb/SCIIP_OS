import { stageAirRow, WRITE_DISPOSITION, AIR_STAGING_PROCESSOR_VERSION } from "./AirMarketStagingProcessor.mjs";

export const AIR_STAGING_RUNTIME_ADAPTER_VERSION = "AIR_STAGING_RUNTIME_ADAPTER_V1";
export const ADAPTER_MODE = "PROPOSAL_ONLY_IN_MEMORY";
export const REAL_AIR_FILE_READ_ALLOWED = false;
export const RUNTIME_CALLER_WIRING_ALLOWED = false;
export const WRITES_ALLOWED = false;

function requireArray(v,name){ if(!Array.isArray(v)) throw new TypeError(`${name} must be an array`); return v; }
function clone(v){ return v == null ? v : JSON.parse(JSON.stringify(v)); }

export function stageAirRowsInMemory({ inventory, metadata, rows }) {
  requireArray(inventory,"inventory"); requireArray(rows,"rows");
  if (!metadata || typeof metadata !== "object") throw new TypeError("metadata object required");
  const staged = rows.map((rawRow,i)=>stageAirRow({
    inventory,
    metadata:{...clone(metadata),sourceRowNumber:metadata.sourceRowNumber ?? (i+1)},
    rawRow:clone(rawRow)
  }));
  return Object.freeze({
    adapterVersion:AIR_STAGING_RUNTIME_ADAPTER_VERSION,
    processorVersion:AIR_STAGING_PROCESSOR_VERSION,
    mode:ADAPTER_MODE,
    disposition:WRITE_DISPOSITION,
    inputContract:"IN_MEMORY_FIXTURE_ONLY",
    outputContract:"STAGED_PROPOSALS_ONLY",
    writesPerformed:false,
    realAirFileRead:false,
    runtimeCallerWiring:false,
    staged
  });
}
