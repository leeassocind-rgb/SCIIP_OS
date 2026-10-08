const freeze=value=>Object.freeze(value);

export const MARKER_TYPES=freeze({
  ASSIGNMENT:'ASSIGNMENT',
  AVAILABLE:'AVAILABLE',
  UNDER_CONSTRUCTION:'UNDER_CONSTRUCTION',
  LEASE_COMPARABLE:'LEASE_COMPARABLE',
  SALE_COMPARABLE:'SALE_COMPARABLE',
  REQUIREMENT:'REQUIREMENT',
  PROSPECT:'PROSPECT'
});

export const MARKER_DEFINITIONS=freeze({
  [MARKER_TYPES.ASSIGNMENT]:freeze({
    label:'Assignments',
    shortLabel:'Assignment',
    colorToken:'assignment',
    shape:'star-pin',
    minZoom:5,
    priority:100
  }),
  [MARKER_TYPES.AVAILABLE]:freeze({
    label:'Available Properties',
    shortLabel:'Available',
    colorToken:'available',
    shape:'pin',
    minZoom:5,
    priority:90
  }),
  [MARKER_TYPES.UNDER_CONSTRUCTION]:freeze({
    label:'Under Construction',
    shortLabel:'Construction',
    colorToken:'construction',
    shape:'striped-pin',
    minZoom:6,
    priority:80
  }),
  [MARKER_TYPES.REQUIREMENT]:freeze({
    label:'Tenant Requirements',
    shortLabel:'Requirement',
    colorToken:'requirement',
    shape:'target',
    minZoom:6,
    priority:85
  }),
  [MARKER_TYPES.LEASE_COMPARABLE]:freeze({
    label:'Lease Comparables',
    shortLabel:'Lease Comp',
    colorToken:'lease',
    shape:'square',
    minZoom:8,
    priority:60
  }),
  [MARKER_TYPES.SALE_COMPARABLE]:freeze({
    label:'Sale Comparables',
    shortLabel:'Sale Comp',
    colorToken:'sale',
    shape:'diamond',
    minZoom:8,
    priority:60
  }),
  [MARKER_TYPES.PROSPECT]:freeze({
    label:'Prospect Properties',
    shortLabel:'Prospect',
    colorToken:'prospect',
    shape:'ring',
    minZoom:9,
    priority:40
  })
});

export function filterMarkersForZoom(items=[],zoom=8){
  return freeze(
    items
      .filter(item=>{
        const definition=MARKER_DEFINITIONS[item.type];
        return definition&&zoom>=definition.minZoom;
      })
      .sort((a,b)=>{
        const aDefinition=MARKER_DEFINITIONS[a.type];
        const bDefinition=MARKER_DEFINITIONS[b.type];
        return bDefinition.priority-aDefinition.priority;
      })
  );
}

export function buildMarkerCounts(items=[]){
  const counts={};
  for(const type of Object.values(MARKER_TYPES)){
    counts[type]=0;
  }
  for(const item of items){
    if(item?.type in MARKER_DEFINITIONS){
      counts[item.type]+=1;
    }
  }
  return freeze(counts);
}

export function buildMarkerClusters(items=[],{
  zoom=8,
  threshold=18
}={}){
  if(zoom>=12){
    return freeze(items.map(item=>freeze({
      id:`single-${item.id}`,
      type:'SINGLE',
      count:1,
      items:freeze([item]),
      lat:item.lat,
      lng:item.lng
    })));
  }

  const clusters=[];
  const consumed=new Set();

  for(const item of items){
    if(consumed.has(item.id))continue;

    const clusterItems=[item];
    consumed.add(item.id);

    for(const candidate of items){
      if(consumed.has(candidate.id))continue;

      const distance=Math.hypot(
        (candidate.lat-item.lat)*100,
        (candidate.lng-item.lng)*100
      );

      if(distance<=threshold){
        clusterItems.push(candidate);
        consumed.add(candidate.id);
      }
    }

    const lat=clusterItems.reduce((sum,row)=>sum+row.lat,0)/clusterItems.length;
    const lng=clusterItems.reduce((sum,row)=>sum+row.lng,0)/clusterItems.length;

    clusters.push(freeze({
      id:`cluster-${clusterItems.map(row=>row.id).join('-')}`,
      type:clusterItems.length===1?'SINGLE':'CLUSTER',
      count:clusterItems.length,
      items:freeze(clusterItems),
      lat,
      lng
    }));
  }

  return freeze(clusters);
}

export function validateMarkerDesignSystem(){
  const errors=[];
  const definitions=Object.values(MARKER_DEFINITIONS);

  if(definitions.length!==7){
    errors.push('Expected seven marker definitions');
  }

  const shapes=definitions.map(item=>item.shape);
  for(const required of[
    'star-pin',
    'pin',
    'striped-pin',
    'square',
    'diamond',
    'target',
    'ring'
  ]){
    if(!shapes.includes(required)){
      errors.push(`Missing marker shape: ${required}`);
    }
  }

  const priorities=definitions.map(item=>item.priority);
  if(Math.max(...priorities)!==100){
    errors.push('Assignment marker must have highest priority');
  }

  return freeze({
    valid:errors.length===0,
    errors:freeze(errors),
    markerTypes:definitions.length,
    zoomAware:true,
    clusteringReady:true
  });
}
