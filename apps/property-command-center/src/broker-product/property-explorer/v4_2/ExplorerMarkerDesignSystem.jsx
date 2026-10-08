import React,{useMemo,useState}from'react';
import{
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Layers3
}from'lucide-react';
import{
  MARKER_DEFINITIONS,
  MARKER_TYPES,
  buildMarkerClusters,
  filterMarkersForZoom
}from'./explorerMarkerEngine.js';
import'./explorer-marker-design-system.css';

export function ExplorerMarker({
  type,
  selected=false,
  hovered=false,
  spotlighted=false,
  faded=false,
  assignmentBadge=false,
  label,
  secondary,
  onClick,
  style
}){
  const def=MARKER_DEFINITIONS[type]||MARKER_DEFINITIONS[MARKER_TYPES.AVAILABLE];

  return (
    <button
      type="button"
      className={[
        'explorer-marker',
        `explorer-marker--${def.colorToken}`,
        `explorer-marker--${def.shape}`,
        selected?'is-selected':'',
        hovered?'is-hovered':'',
        spotlighted?'is-spotlighted':'',
        faded?'is-faded':''
      ].filter(Boolean).join(' ')}
      style={style}
      onClick={onClick}
      aria-label={label||def.shortLabel}
    >
      <span className="explorer-marker__shape">
        {def.shape==='star-pin'&&<span className="explorer-marker__glyph">★</span>}
        {def.shape==='square'&&<span className="explorer-marker__glyph">L</span>}
        {def.shape==='diamond'&&<span className="explorer-marker__glyph">S</span>}
        {def.shape==='target'&&<span className="explorer-marker__glyph">◎</span>}
        {def.shape==='ring'&&<span className="explorer-marker__glyph">○</span>}
        {def.shape==='pin'&&<span className="explorer-marker__glyph">●</span>}
        {def.shape==='striped-pin'&&<span className="explorer-marker__glyph">▨</span>}
      </span>

      {assignmentBadge&&
        <span className="explorer-marker__badge">A</span>
      }

      {(selected||hovered)&&
        <span className="explorer-marker__label">
          <strong>{label}</strong>
          {secondary&&<small>{secondary}</small>}
        </span>
      }
    </button>
  );
}

export function ExplorerLegend({
  items=[],
  enabledTypes,
  onToggle,
  collapsedInitially=false
}){
  const[collapsed,setCollapsed]=useState(collapsedInitially);

  const counts=useMemo(()=>{
    const map=new Map();
    for(const item of items){
      map.set(item.type,(map.get(item.type)||0)+1);
    }
    return map;
  },[items]);

  const ordered=Object.entries(MARKER_DEFINITIONS)
    .sort(([,a],[,b])=>b.priority-a.priority);

  return (
    <section className={`explorer-legend ${collapsed?'is-collapsed':''}`}>
      <header>
        <div>
          <Layers3 size={15}/>
          <strong>Map Legend</strong>
        </div>
        <button
          type="button"
          onClick={()=>setCollapsed(!collapsed)}
          aria-label={collapsed?'Expand legend':'Collapse legend'}
        >
          {collapsed?<ChevronUp size={15}/>:<ChevronDown size={15}/>}
        </button>
      </header>

      {!collapsed&&
        <div className="explorer-legend__rows">
          {ordered.map(([type,def])=>{
            const enabled=enabledTypes.has(type);
            const count=counts.get(type)||0;
            return (
              <button
                type="button"
                key={type}
                className={`explorer-legend__row ${enabled?'is-enabled':'is-disabled'}`}
                onClick={()=>onToggle(type)}
              >
                <span className={`explorer-legend__symbol explorer-legend__symbol--${def.colorToken} explorer-legend__symbol--${def.shape}`}>
                  {def.shape==='star-pin'?'★':
                   def.shape==='square'?'L':
                   def.shape==='diamond'?'S':
                   def.shape==='target'?'◎':
                   def.shape==='ring'?'○':
                   def.shape==='striped-pin'?'▨':'●'}
                </span>
                <span className="explorer-legend__label">{def.label}</span>
                <span className="explorer-legend__count">{count}</span>
                <span className="explorer-legend__visibility">
                  {enabled?<Eye size={13}/>:<EyeOff size={13}/>}
                </span>
              </button>
            );
          })}
        </div>
      }
    </section>
  );
}
export{
  MARKER_DEFINITIONS,
  MARKER_TYPES,
  buildMarkerClusters,
  filterMarkersForZoom
};
