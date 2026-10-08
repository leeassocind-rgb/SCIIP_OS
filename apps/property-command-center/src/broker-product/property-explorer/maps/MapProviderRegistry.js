import{MAP_PROVIDER_IDS,assertMapProvider}from'./MapProvider.js';
import{GoogleMapsAdapter}from'./adapters/GoogleMapsAdapter.js';
import{MapboxAdapter}from'./adapters/MapboxAdapter.js';
import{EsriAdapter}from'./adapters/EsriAdapter.js';

const factories=new Map([
  [MAP_PROVIDER_IDS.GOOGLE,options=>new GoogleMapsAdapter(options)],
  [MAP_PROVIDER_IDS.MAPBOX,options=>new MapboxAdapter(options)],
  [MAP_PROVIDER_IDS.ESRI,options=>new EsriAdapter(options)]
]);

export function registerMapProvider(id,factory){
  if(!id||typeof factory!=='function')throw new TypeError('Map provider id and factory are required');
  factories.set(id,factory);
}
export function createMapProvider(id=MAP_PROVIDER_IDS.GOOGLE,options={}){
  const factory=factories.get(id);
  if(!factory)throw new Error(`Unknown map provider: ${id}`);
  return assertMapProvider(factory(options));
}
export function listMapProviders(){return[...factories.keys()];}
