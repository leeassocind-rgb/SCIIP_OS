import React,{useMemo,useState}from'react';
import{
  ArrowRight,
  Bookmark,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers3,
  ListFilter,
  MapPin,
  Search,
  Sparkles,
  Target,
  Users,
  X
}from'lucide-react';
import'./explorer-map-first.css';

const PROPERTIES=[
  {
    id:'P-IEW-701',
    address:'10800 Slover Ave',
    city:'Fontana',
    submarket:'Inland Empire West',
    owner:'Institutional Owner',
    buildingSf:720000,
    clearHeightFt:40,
    powerAmps:4000,
    status:'AVAILABLE',
    lat:34.0632,
    lng:-117.5041,
    assignment:null,
    vacancy:7.8,
    competitors:4,
    comparables:3,
    requirements:2,
    recentChange:'Asking rate reduced'
  },
  {
    id:'P-SB-ARES-101',
    address:'19500 S Vermont Ave',
    city:'Torrance',
    submarket:'South Bay',
    owner:'Ares Management',
    buildingSf:145000,
    clearHeightFt:32,
    powerAmps:2000,
    status:'AVAILABLE',
    lat:33.8512,
    lng:-118.2928,
    assignment:null,
    vacancy:3.4,
    competitors:9,
    comparables:6,
    requirements:1,
    recentChange:'Availability confirmed'
  },
  {
    id:'P-SB-ARES-103',
    address:'1800 E 223rd St',
    city:'Carson',
    submarket:'South Bay',
    owner:'Ares Management',
    buildingSf:118000,
    clearHeightFt:null,
    powerAmps:1600,
    status:'AVAILABLE',
    lat:33.8240,
    lng:-118.2420,
    assignment:null,
    vacancy:3.4,
    competitors:7,
    comparables:4,
    requirements:1,
    recentChange:'Clear height requires confirmation'
  },
  {
    id:'P-IEW-201',
    address:'2125 W Lowell St',
    city:'Rialto',
    submarket:'Inland Empire West',
    owner:'Brookfield Properties',
    buildingSf:664859,
    clearHeightFt:42,
    powerAmps:8000,
    status:'UNDER CONSTRUCTION',
    lat:34.1069,
    lng:-117.4112,
    assignment:{
      id:'A-BROOKFIELD',
      client:'Brookfield Properties',
      type:'Active Listing'
    },
    vacancy:7.8,
    competitors:11,
    comparables:5,
    requirements:2,
    recentChange:'Power confirmed at up to 8,000 amps'
  }
];

const LAYERS=[
  'Available Properties',
  'Assignment Properties',
  'Lease Comparables',
  'Sale Comparables',
  'Tenant Requirements',
  'Under Construction',
  'Power Infrastructure',
  'Ports & Airports'
];

export default function ExplorerMapFirst(){
  const[query,setQuery]=useState('');
  const[selectedId,setSelectedId]=useState('P-IEW-201');
  const[resultsOpen,setResultsOpen]=useState(false);
  const[drawerOpen,setDrawerOpen]=useState(true);
  const[layersOpen,setLayersOpen]=useState(false);
  const[activeLayers,setActiveLayers]=useState(new Set(['Available Properties','Assignment Properties']));
  const[filtersOpen,setFiltersOpen]=useState(false);

  const selected=PROPERTIES.find(item=>item.id===selectedId)||null;

  const filtered=useMemo(()=>{
    const normalized=query.trim().toLowerCase();
    if(!normalized)return PROPERTIES;
    return PROPERTIES.filter(property=>
      [
        property.address,
        property.city,
        property.submarket,
        property.owner,
        property.status,
        String(property.buildingSf),
        property.clearHeightFt?`${property.clearHeightFt} clear`:'',
        property.powerAmps?`${property.powerAmps} amps`:''
      ].join(' ').toLowerCase().includes(normalized)
    );
  },[query]);

  function toggleLayer(label){
    setActiveLayers(current=>{
      const next=new Set(current);
      next.has(label)?next.delete(label):next.add(label);
      return next;
    });
  }

  return (
    <section className="explorer-v3">
      <header className="explorer-v3__toolbar">
        <form onSubmit={event=>event.preventDefault()}>
          <Search size={17}/>
          <input
            value={query}
            onChange={event=>setQuery(event.target.value)}
            placeholder="Search properties, owners, tenants, cities, or ask a market question..."
          />
          <button type="submit">Search</button>
        </form>

        <div>
          <button type="button" onClick={()=>setFiltersOpen(!filtersOpen)}>
            <ListFilter size={15}/> Filters
          </button>
          <button type="button">
            <Bookmark size={15}/> Save Search
          </button>
        </div>
      </header>

      {filtersOpen&&
        <section className="explorer-v3__filters">
          <button>South Bay</button>
          <button>100,000 SF+</button>
          <button>32′ Clear+</button>
          <button>Owner: Ares</button>
          <button>Available</button>
        </section>
      }

      <main className="explorer-v3__canvas">
        <MapSurface
          properties={filtered}
          selectedId={selectedId}
          onSelect={id=>{
            setSelectedId(id);
            setDrawerOpen(true);
          }}
        />

        <button
          type="button"
          className="explorer-v3__results-toggle"
          onClick={()=>setResultsOpen(!resultsOpen)}
        >
          {resultsOpen?<ChevronLeft size={16}/>:<ChevronRight size={16}/>}
          <span>{filtered.length} properties</span>
        </button>

        {resultsOpen&&
          <aside className="explorer-v3__results-rail">
            <header>
              <div>
                <span>Search results</span>
                <strong>{filtered.length} properties</strong>
              </div>
              <button type="button" onClick={()=>setResultsOpen(false)}>
                <X size={15}/>
              </button>
            </header>

            <div>
              {filtered.map(property=>
                <button
                  type="button"
                  key={property.id}
                  className={selectedId===property.id?'active':''}
                  onClick={()=>{
                    setSelectedId(property.id);
                    setDrawerOpen(true);
                  }}
                >
                  <strong>{property.address}</strong>
                  <span>{property.city} · {property.submarket}</span>
                  <small>
                    {property.buildingSf.toLocaleString()} SF ·
                    {' '}{property.clearHeightFt==null?'Clear unknown':`${property.clearHeightFt}′ clear`} ·
                    {' '}{property.status}
                  </small>
                </button>
              )}
            </div>
          </aside>
        }

        <button
          type="button"
          className="explorer-v3__layers-button"
          onClick={()=>setLayersOpen(!layersOpen)}
        >
          <Layers3 size={16}/> Layers
        </button>

        {layersOpen&&
          <section className="explorer-v3__layers">
            <header>
              <strong>Map Layers</strong>
              <button type="button" onClick={()=>setLayersOpen(false)}>
                <X size={14}/>
              </button>
            </header>
            {LAYERS.map(layer=>
              <label key={layer}>
                <input
                  type="checkbox"
                  checked={activeLayers.has(layer)}
                  onChange={()=>toggleLayer(layer)}
                />
                <span>{layer}</span>
              </label>
            )}
          </section>
        }

        {drawerOpen&&selected&&
          <PropertyDrawer
            property={selected}
            onClose={()=>setDrawerOpen(false)}
          />
        }

        {!drawerOpen&&selected&&
          <button
            type="button"
            className="explorer-v3__drawer-launcher"
            onClick={()=>setDrawerOpen(true)}
          >
            <Building2 size={16}/>
            {selected.address}
          </button>
        }

        <footer className="explorer-v3__status">
          <span>Map-first governed property intelligence</span>
          <button type="button">Search this area</button>
        </footer>
      </main>
    </section>
  );
}

function MapSurface({properties,selectedId,onSelect}){
  const bounds=calculateBounds(properties);

  return (
    <section className="explorer-v3__map">
      <div className="explorer-v3__map-grid"/>
      <div className="explorer-v3__road r1"/>
      <div className="explorer-v3__road r2"/>
      <div className="explorer-v3__road r3"/>
      <div className="explorer-v3__road r4"/>
      <span className="explorer-v3__city c1">South Bay</span>
      <span className="explorer-v3__city c2">Inland Empire West</span>

      {properties.map(property=>{
        const point=project(property,bounds);
        const selected=selectedId===property.id;
        return (
          <button
            type="button"
            key={property.id}
            className={`explorer-v3__marker ${selected?'active':''} ${property.assignment?'assignment':''}`}
            style={{left:`${point.x}%`,top:`${point.y}%`}}
            onClick={()=>onSelect(property.id)}
            title={`${property.address} · ${property.buildingSf.toLocaleString()} SF`}
          >
            <MapPin size={selected?26:20}/>
            {property.assignment&&<span className="assignment-dot">★</span>}
            {selected&&
              <em>
                <strong>{property.address}</strong>
                <small>{property.buildingSf.toLocaleString()} SF · {property.status}</small>
              </em>
            }
          </button>
        );
      })}
    </section>
  );
}

function PropertyDrawer({property,onClose}){
  return (
    <aside className="explorer-v3__drawer">
      <header>
        <button type="button" onClick={onClose}>
          <ChevronRight size={18}/>
        </button>
        <div>
          <span>Property</span>
          <h2>{property.address}</h2>
          <p>{property.city} · {property.submarket}</p>
        </div>
      </header>

      <section className="explorer-v3__drawer-hero">
        <div>
          <strong>{property.buildingSf.toLocaleString()} SF</strong>
          <span>{property.status}</span>
        </div>
        <small>{property.owner}</small>
      </section>

      <section className="explorer-v3__specs">
        <div><span>Clear height</span><strong>{property.clearHeightFt==null?'Unknown':`${property.clearHeightFt}′`}</strong></div>
        <div><span>Power</span><strong>{property.powerAmps.toLocaleString()} amps</strong></div>
        <div><span>Ownership</span><strong>{property.owner}</strong></div>
        <div><span>Recent change</span><strong>{property.recentChange}</strong></div>
      </section>

      <section className="explorer-v3__market-context">
        <header>
          <Sparkles size={16}/>
          <strong>Market Context</strong>
        </header>
        <div>
          <article><span>Vacancy</span><strong>{property.vacancy}%</strong></article>
          <article><span>Competitors</span><strong>{property.competitors}</strong></article>
          <article><span>Comparables</span><strong>{property.comparables}</strong></article>
          <article><span>Tenant matches</span><strong>{property.requirements}</strong></article>
        </div>
      </section>

      <section className="explorer-v3__intelligence">
        <BrainSummary property={property}/>
      </section>

      {property.assignment&&
        <section className="explorer-v3__assignment">
          <span>Related assignment</span>
          <strong>{property.assignment.client}</strong>
          <small>{property.assignment.type}</small>
          <button type="button">
            Open Assignment <ArrowRight size={14}/>
          </button>
        </section>
      }

      <footer>
        <button type="button"><Target size={14}/> Compare</button>
        <button type="button"><Users size={14}/> Save Property</button>
        <button type="button" className="primary">
          <FileText size={14}/>
          {property.assignment?'Open Assignment':'Create Assignment'}
        </button>
      </footer>
    </aside>
  );
}

function BrainSummary({property}){
  return (
    <>
      <header>
        <Sparkles size={16}/>
        <strong>AI Market Summary</strong>
      </header>
      <p>
        {property.address} is positioned within {property.submarket}.
        {' '}{property.competitors} active competitors and {property.comparables} recent comparables
        define the current market context. The property currently matches {property.requirements}
        tenant requirement{property.requirements===1?'':'s'}.
      </p>
    </>
  );
}

function calculateBounds(properties){
  const lats=properties.map(item=>item.lat);
  const lngs=properties.map(item=>item.lng);
  return{
    minLat:Math.min(...lats),
    maxLat:Math.max(...lats),
    minLng:Math.min(...lngs),
    maxLng:Math.max(...lngs)
  };
}

function project(property,bounds){
  const lngRange=bounds.maxLng-bounds.minLng||1;
  const latRange=bounds.maxLat-bounds.minLat||1;
  return{
    x:10+((property.lng-bounds.minLng)/lngRange)*80,
    y:10+((bounds.maxLat-property.lat)/latRange)*80
  };
}
