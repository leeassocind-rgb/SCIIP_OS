export function retryDelayMs(attempt,{baseMs=1000,maxMs=60000,jitter=false}={}){const raw=Math.min(maxMs,baseMs*(2**Math.max(0,attempt-1)));return jitter?Math.round(raw*.85):raw}
export function shouldRetry(error,attempt,{maxAttempts=5}={}){if(attempt>=maxAttempts)return false;const status=Number(error?.status||error?.statusCode||0);return status===0||status===408||status===429||status>=500}
