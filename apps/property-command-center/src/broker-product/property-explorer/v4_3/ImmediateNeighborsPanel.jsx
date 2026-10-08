import React,{useMemo,useState}from'react';
import{
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Building2,
  CheckCircle2,
  Compass,
  MapPin,
  Sparkles
}from'lucide-react';
import{
  DIRECTIONS,
  buildImmediateNeighbors,
  buildNeighborIntelligence
}from'./immediateNeighborEngine.js';
import'./immediate-neighbors.css';

const ICONS={
  NORTH:ArrowUp,
  EAST:ArrowRight,
  SOUTH:ArrowDown,
  WEST:ArrowLeft
};

export default function ImmediateNeighborsPanel({
  subject,
  properties,
  parcelRelationships=[],
  onSelectNeighbor
}){
  const[expandedDirection,setExpandedDirection]=useState(null);

  const neighbors=useMemo(
    ()=>buildImmediateNeighbors({
      subject,
      properties,
      parcelRelationships,
      maxDistanceMiles:2
    }),
    [subject,properties,parcelRelationships]
  );

  const intelligence=useMemo(
    ()=>buildNeighborIntelligence({subject,neighbors}),
    [subject,neighbors]
  );

  return (
    <section className="immediate-neighbors">
      <header>
        <Compass size={17}/>
        <div>
          <strong>Immediate Neighbors</strong>
          <span>Adjoining parcels first; nearest directional property otherwise</span>
        </div>
      </header>

      <section className="immediate-neighbors__compass">
        {DIRECTIONS.map(direction=>{
          const Icon=ICONS[direction];
          const row=neighbors.primary[direction];
          return (
            <button
              type="button"
              key={direction}
              className={`direction direction--${direction.toLowerCase()} ${row?'has-neighbor':'is-empty'}`}
              onClick={()=>setExpandedDirection(
                expandedDirection===direction?null:direction
              )}
            >
              <Icon size={15}/>
              <span>{direction[0]}</span>
              <strong>{row?.property.address||'No governed neighbor'}</strong>
              {row&&
                <small>
                  {row.relationshipType==='ADJOINING'
                    ?`${row.sharedBoundaryFeet.toLocaleString()} ft shared boundary`
                    :`${row.distanceFeet.toLocaleString()} ft away`
                  }
                </small>
              }
            </button>
          );
        })}

        <div className="direction direction--subject">
          <MapPin size={17}/>
          <span>Subject</span>
          <strong>{subject.address}</strong>
          <small>{subject.buildingSf?.toLocaleString()} SF</small>
        </div>
      </section>

      {expandedDirection&&
        <section className="immediate-neighbors__direction-list">
          <header>
            <strong>{expandedDirection}</strong>
            <span>{neighbors.directions[expandedDirection].length} related propert{neighbors.directions[expandedDirection].length===1?'y':'ies'}</span>
          </header>

          {neighbors.directions[expandedDirection].map(row=>
            <button
              type="button"
              key={row.property.id}
              onClick={()=>onSelectNeighbor?.(row.property)}
            >
              <div>
                <span className={row.relationshipType==='ADJOINING'?'adjoining':'nearest'}>
                  {row.relationshipType==='ADJOINING'?'Adjoining':'Nearest directional'}
                </span>
                <strong>{row.property.address}</strong>
                <small>
                  {row.property.buildingSf?.toLocaleString()||'—'} SF ·
                  {' '}{row.property.owner||'Owner unknown'} ·
                  {' '}{row.property.status||'Status unknown'}
                </small>
              </div>
              <ArrowRight size={15}/>
            </button>
          )}
        </section>
      }

      <section className="immediate-neighbors__intelligence">
        <header>
          <Sparkles size={16}/>
          <strong>Neighbor Intelligence</strong>
        </header>
        <p>{intelligence.summary}</p>
        <div>
          {intelligence.signals.slice(0,6).map(item=>
            <span key={item.id}>
              <CheckCircle2 size={12}/>
              <b>{item.direction}</b>
              {item.message}
            </span>
          )}
        </div>
      </section>

      <footer>
        <Building2 size={15}/>
        <span>{neighbors.relationships.length} spatial relationship record{neighbors.relationships.length===1?'':'s'} ready for the knowledge graph</span>
      </footer>
    </section>
  );
}

export function ImmediateNeighborOverlay({
  subject,
  properties,
  parcelRelationships=[]
}){
  const neighbors=useMemo(
    ()=>buildImmediateNeighbors({
      subject,
      properties,
      parcelRelationships,
      maxDistanceMiles:2
    }),
    [subject,properties,parcelRelationships]
  );

  const positions={
    NORTH:{left:'52%',top:'23%'},
    EAST:{left:'73%',top:'46%'},
    SOUTH:{left:'52%',top:'70%'},
    WEST:{left:'31%',top:'46%'}
  };

  return (
    <section className="immediate-neighbor-overlay">
      {DIRECTIONS.map(direction=>{
        const row=neighbors.primary[direction];
        if(!row)return null;
        return (
          <button
            type="button"
            key={direction}
            className={`neighbor-overlay neighbor-overlay--${direction.toLowerCase()} ${row.relationshipType==='ADJOINING'?'is-adjoining':'is-nearest'}`}
            style={positions[direction]}
            title={`${direction}: ${row.property.address}`}
          >
            <span>{direction[0]}</span>
            <strong>{row.property.address}</strong>
          </button>
        );
      })}
    </section>
  );
}
