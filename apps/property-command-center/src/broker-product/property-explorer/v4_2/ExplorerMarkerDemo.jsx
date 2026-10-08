import React,{useMemo,useState}from'react';
import{
  ExplorerLegend,
  ExplorerMarker,
  MARKER_TYPES,
  filterMarkersForZoom
}from'./ExplorerMarkerDesignSystem.jsx';

const ITEMS=[
  {
    id:'assignment-1',
    type:MARKER_TYPES.ASSIGNMENT,
    label:'2125 W Lowell St',
    secondary:'664,859 SF · Active Listing',
    left:'51%',
    top:'46%'
  },
  {
    id:'available-1',
    type:MARKER_TYPES.AVAILABLE,
    label:'10800 Slover Ave',
    secondary:'720,000 SF · Available',
    left:'39%',
    top:'54%'
  },
  {
    id:'construction-1',
    type:MARKER_TYPES.UNDER_CONSTRUCTION,
    label:'North Rialto Distribution Center',
    secondary:'650,000 SF · Under Construction',
    left:'62%',
    top:'34%'
  },
  {
    id:'lease-1',
    type:MARKER_TYPES.LEASE_COMPARABLE,
    label:'Lease Comparable',
    secondary:'712,000 SF',
    left:'46%',
    top:'38%'
  },
  {
    id:'sale-1',
    type:MARKER_TYPES.SALE_COMPARABLE,
    label:'Sale Comparable',
    secondary:'680,000 SF',
    left:'58%',
    top:'58%'
  },
  {
    id:'requirement-1',
    type:MARKER_TYPES.REQUIREMENT,
    label:'Aerospace Requirement',
    secondary:'600,000–750,000 SF',
    left:'50%',
    top:'29%'
  },
  {
    id:'prospect-1',
    type:MARKER_TYPES.PROSPECT,
    label:'Prospect Property',
    secondary:'Off-market owner target',
    left:'33%',
    top:'42%'
  }
];

export default function ExplorerMarkerDemo(){
  const[zoom,setZoom]=useState(9);
  const[selectedId,setSelectedId]=useState('assignment-1');
  const[hoveredId,setHoveredId]=useState(null);
  const[enabledTypes,setEnabledTypes]=useState(
    new Set(Object.values(MARKER_TYPES))
  );

  const visibleItems=useMemo(
    ()=>filterMarkersForZoom(
      ITEMS.filter(item=>enabledTypes.has(item.type)),
      zoom
    ),
    [enabledTypes,zoom]
  );

  function toggleType(type){
    setEnabledTypes(current=>{
      const next=new Set(current);
      next.has(type)?next.delete(type):next.add(type);
      return next;
    });
  }

  return (
    <section className="explorer-marker-demo">
      <div className="explorer-marker-demo__map">
        <div className="explorer-marker-demo__grid"/>
        <div className="explorer-marker-demo__spotlight"/>

        {visibleItems.map(item=>
          <div
            key={item.id}
            onMouseEnter={()=>setHoveredId(item.id)}
            onMouseLeave={()=>setHoveredId(null)}
          >
            <ExplorerMarker
              type={item.type}
              label={item.label}
              secondary={item.secondary}
              selected={selectedId===item.id}
              hovered={hoveredId===item.id}
              spotlighted={selectedId==='assignment-1'&&item.id!=='assignment-1'}
              faded={selectedId==='assignment-1'&&item.type===MARKER_TYPES.PROSPECT}
              assignmentBadge={item.type===MARKER_TYPES.ASSIGNMENT}
              onClick={()=>setSelectedId(item.id)}
              style={{left:item.left,top:item.top}}
            />
          </div>
        )}


        <ExplorerLegend
          items={ITEMS}
          enabledTypes={enabledTypes}
          onToggle={toggleType}
        />

        <section className="explorer-marker-demo__zoom">
          <span>Zoom {zoom}</span>
          <input
            type="range"
            min="5"
            max="14"
            value={zoom}
            onChange={event=>setZoom(Number(event.target.value))}
          />
        </section>
      </div>
    </section>
  );
}
