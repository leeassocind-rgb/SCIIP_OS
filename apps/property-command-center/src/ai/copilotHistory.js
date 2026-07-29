const KEY='sciip.property-command-center.ai-copilot.history.v1';
export function readCopilotHistory(){try{return JSON.parse(globalThis.localStorage?.getItem(KEY)||'[]')}catch{return[]}}
export function preserveCopilotResponse(response){const history=[{...response,preservedAt:new Date().toISOString()},...readCopilotHistory().filter(item=>item.requestId!==response.requestId)].slice(0,100);globalThis.localStorage?.setItem(KEY,JSON.stringify(history));return history}
export function clearCopilotHistory(){globalThis.localStorage?.removeItem(KEY);return[]}
export const COPILOT_HISTORY_KEY=KEY;
