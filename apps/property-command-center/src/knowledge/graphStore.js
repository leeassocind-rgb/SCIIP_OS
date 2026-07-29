import{mergeGraph}from'./graphProjection.js';
const KEY='sciip.property-command-center.knowledge-graph.v1';
const EMPTY=Object.freeze({version:'release-1-sprint-5.0',nodes:[],edges:[],history:[],updatedAt:null});
export function readGraph(){try{const raw=globalThis.localStorage?.getItem(KEY);return raw?{...EMPTY,...JSON.parse(raw)}:{...EMPTY}}catch{return{...EMPTY}}}
export function writeGraph(graph){globalThis.localStorage?.setItem(KEY,JSON.stringify(graph));return graph}
export function promoteProjection(projection){const next=mergeGraph(readGraph(),projection);writeGraph(next);return next}
export function clearGraph(){globalThis.localStorage?.removeItem(KEY);return{...EMPTY}}
export const GRAPH_STORAGE_KEY=KEY;
