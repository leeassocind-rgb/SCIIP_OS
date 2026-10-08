export const MAP_PROVIDER_IDS=Object.freeze({
  GOOGLE:'google',
  MAPBOX:'mapbox',
  ESRI:'esri'
});

export class MapProvider{
  constructor(options={}){
    this.options=options;
    this.map=null;
  }

  async initialize(){throw new Error('MapProvider.initialize must be implemented');}
  setProperties(){throw new Error('MapProvider.setProperties must be implemented');}
  setSelectedProperty(){throw new Error('MapProvider.setSelectedProperty must be implemented');}
  setSpotlight(){throw new Error('MapProvider.setSpotlight must be implemented');}
  setNeighborRelationships(){throw new Error('MapProvider.setNeighborRelationships must be implemented');}
  setMapType(){throw new Error('MapProvider.setMapType must be implemented');}
  setSpatialContext(){}
  focusSelectedProperty(){}
  fitSelectedContext(){}
  resize(){}
  destroy(){this.map=null;}
}

export function assertMapProvider(provider){
  const methods=['initialize','setProperties','setSelectedProperty','setSpotlight','setNeighborRelationships','setMapType','destroy'];
  for(const method of methods){
    if(typeof provider?.[method]!=='function')throw new TypeError(`Invalid map provider: missing ${method}()`);
  }
  return provider;
}
