import { useSyncExternalStore } from 'react';
import { productionActivationRuntime } from './productionActivationStateRuntime.js';
export function useProductionActivationState(runtime=productionActivationRuntime){return useSyncExternalStore(runtime.subscribe,runtime.getSnapshot,runtime.getSnapshot);}
