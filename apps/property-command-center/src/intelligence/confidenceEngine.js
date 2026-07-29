export function confidenceBand(score){const n=Number(score)||0;return n>=.85?'HIGH':n>=.65?'MEDIUM':'LOW'}
export function scoreConfidence({evidenceConfidence=0,completeness=0,recency=0,agreement=0}={}){const score=.4*evidenceConfidence+.25*completeness+.2*recency+.15*agreement;return{score:Number(Math.max(0,Math.min(1,score)).toFixed(4)),band:confidenceBand(score)}}
