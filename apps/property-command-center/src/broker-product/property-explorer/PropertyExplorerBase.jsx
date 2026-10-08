import React,{useMemo,useState}from'react';
import{
  Bookmark,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Layers3,
  List,
  Map,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  X
}from'lucide-react';
import{
  DEFAULT_EXPLORER_FILTERS,
  PROPERTY_EXPLORER_DATA,
  buildCompareSet,
  buildLayerCounts,
  buildPropertyDrawerModel,
  interpretExplorerQuery,
  searchExplorerProperties
}from'./propertyExplorerEngine.js';
import'./property-explorer.css';

const LAYERS=[
  ['ALL','All properties'],
  ['AVAILABLE','Available'],
  ['UNDER_CONSTRUCTION','Under construction'],
  ['OFF_MARKET','Off market'],
  ['ASSIGNMENT','Assignment properties'],
  ['LEASE_COMPARABLE','Lease comparables'],
  ['SALE_COMPARABLE','Sale comparables']
];

export default function PropertyExplorer(){
  const[input,setInput]=useState('');
  const[filters,setFilters]=useState(DEFAULT_EXPLORER_FILTERS);
  const[chips,setChips]=useState([]);
  const[selectedId,setSelectedId]=useState(null);
  const[hoveredId,setHoveredId]=useState(null);
  const[compareIds,setCompareIds]=useState([]);
  const[savedSearches,setSavedSearches]=useState([]);
  const[showFilters,setShowFilters]=useState(false);
  const[showLayers,setShowLayers]=useState(true);
  const[mobileView,setMobileView]=useState('LIST');

  const results=useMemo(()=>searchExplorerProperties(PROPERTY_EXPLORER_DATA,filters),[filters]);
  const layerCounts=useMemo(()=>buildLayerCounts(PROPERTY_EXPLORER_DATA),[]);
  const selectedProperty=PROPERTY_EXPLORER_DATA.find(item=>item.id===selectedId)||null;
  const drawer=useMemo(()=>buildPropertyDrawerModel(selectedProperty),[selectedProperty]);
  const compareSet=useMemo(()=>buildCompareSet(compareIds),[compareIds]);

  function submit(event){
    event.preventDefault();
    const interpreted=interpretExplorerQuery(input);
    setFilters(interpreted.filters);
    setChips(interpreted.chips);
  }

  function setLayer(layer){
    const next={...filters,layer};
    setFilters(next);
    setChips(buildChips(next));
  }

  function saveSearch(){
    if(!chips.length)return;
    setSavedSearches(current=>[
      ...current,
      {
        id:`SEARCH-${Date.now()}`,
        name:chips.map(item=>item.label).join(' · '),
        filters
      }
    ]);
  }

  function toggleCompare(id){
    setCompareIds(current=>
      current.includes(id)
        ?current.filter(item=>item!==id)
        :current.length<4?[...current,id]:current
    );
  }

  return (
    <section className="property-explorer">
      <header className="property-explorer__topbar">
        <form onSubmit={submit}>
          <Search size={18}/>
          <input
            value={input}
            onChange={event=>setInput(event.target.value)}
            placeholder="Search address, owner, tenant, city, or criteria..."
          />
          <button type="submit">Search</button>
        </form>

        <div className="property-explorer__top-actions">
          <button type="button" onClick={()=>setShowFilters(!showFilters)}>
            <SlidersHorizontal size={15}/> Filters
          </button>
          <button type="button" onClick={saveSearch}>
            <Bookmark size={15}/> Save Search
          </button>
          <button type="button">
            <Download size={15}/> Export
          </button>
        </div>
      </header>

      <section className="property-explorer__chips">
        {chips.map(item=>
          <button
            type="button"
            key={`${item.key}-${item.label}`}
            onClick={()=>{
              const next=removeChipFilter(filters,item.key);
              setFilters(next);
              setChips(buildChips(next));
            }}
          >
            {item.label}<X size={12}/>
          </button>
        )}
        {chips.length>0&&
          <button
            type="button"
            className="clear"
            onClick={()=>{
              setInput('');
              setFilters(DEFAULT_EXPLORER_FILTERS);
              setChips([]);
            }}
          >
            Clear all
          </button>
        }
      </section>

      {showFilters&&
        <AdvancedFilters
          filters={filters}
          onApply={next=>{
            setFilters(next);
            setChips(buildChips(next));
            setShowFilters(false);
          }}
        />
      }

      <section className="property-explorer__mobile-toggle">
        <button
          type="button"
          className={mobileView==='LIST'?'active':''}
          onClick={()=>setMobileView('LIST')}
        >
          <List size={15}/> List
        </button>
        <button
          type="button"
          className={mobileView==='MAP'?'active':''}
          onClick={()=>setMobileView('MAP')}
        >
          <Map size={15}/> Map
        </button>
      </section>

      <section className="property-explorer__workspace">
        <aside className={`property-explorer__results ${mobileView==='MAP'?'mobile-hidden':''}`}>
          <header>
            <div>
              <strong>{results.all.length} properties</strong>
              <span>{results.summary.confirmedCount} confirmed · {results.summary.possibleCount} possible</span>
            </div>
            <button type="button" onClick={()=>setShowLayers(!showLayers)}>
              <Layers3 size={15}/>
            </button>
          </header>

          <div className="property-explorer__result-scroll">
            {results.all.map(row=>
              <PropertyCard
                key={row.property.id}
                row={row}
                selected={selectedId===row.property.id}
                hovered={hoveredId===row.property.id}
                comparing={compareIds.includes(row.property.id)}
                onSelect={()=>setSelectedId(row.property.id)}
                onHover={setHoveredId}
                onCompare={()=>toggleCompare(row.property.id)}
              />
            )}
          </div>
        </aside>

        <main className={`property-explorer__map ${mobileView==='LIST'?'mobile-hidden':''}`}>
          <MapCanvas
            results={results.all}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={setSelectedId}
            onHover={setHoveredId}
          />

          {showLayers&&
            <LayerControl
              activeLayer={filters.layer}
              counts={layerCounts}
              onSelect={setLayer}
              savedSearches={savedSearches}
              onLoadSaved={saved=>{
                setFilters(saved.filters);
                setChips(buildChips(saved.filters));
              }}
            />
          }

          {compareSet.length>0&&
            <CompareTray
              properties={compareSet}
              onRemove={toggleCompare}
            />
          }
        </main>

        {drawer&&
          <PropertyDrawer
            model={drawer}
            onClose={()=>setSelectedId(null)}
          />
        }
      </section>
    </section>
  );
}

function PropertyCard({row,selected,hovered,comparing,onSelect,onHover,onCompare}){
  const property=row.property;
  return (
    <article
      className={`property-explorer-card ${selected?'selected':''} ${hovered?'hovered':''}`}
      onClick={onSelect}
      onMouseEnter={()=>onHover(property.id)}
      onMouseLeave={()=>onHover(null)}
    >
      <header>
        <div>
          <strong>{property.address}</strong>
          <span>{property.city} · {property.submarket}</span>
        </div>
        <span className={`property-match ${row.matchType.toLowerCase()}`}>{row.matchType}</span>
      </header>

      <div className="property-explorer-card__facts">
        <span>{property.buildingSf.toLocaleString()} SF</span>
        <span>{property.clearHeightFt==null?'Clear unknown':`${property.clearHeightFt}′ clear`}</span>
        <span>{property.status}</span>
      </div>

      <div className="property-explorer-card__owner">
        <strong>{property.ownerParent}</strong>
        <span>{property.tenant||'Tenant unknown'}</span>
      </div>

      {row.reasons.length>0&&
        <div className="property-explorer-card__reasons">
          {row.reasons.slice(0,3).map(reason=>
            <span key={reason}><Check size={11}/>{reason}</span>
          )}
        </div>
      }

      <footer>
        <button
          type="button"
          className={comparing?'active':''}
          onClick={event=>{event.stopPropagation();onCompare();}}
        >
          {comparing?'Added to compare':'Compare'}
        </button>
        <button type="button" onClick={event=>event.stopPropagation()}>
          Save
        </button>
      </footer>
    </article>
  );
}

function MapCanvas({results,selectedId,hoveredId,onSelect,onHover}){
  const bounds=calculateBounds(results.map(row=>row.property));
  return (
    <section className="property-map-canvas">
      <div className="property-map-grid"/>
      <div className="property-map-label north">N</div>
      <div className="property-map-label south">S</div>
      <div className="property-map-label west">W</div>
      <div className="property-map-label east">E</div>

      {results.map(row=>{
        const property=row.property;
        const point=projectPoint(property,bounds);
        const active=selectedId===property.id||hoveredId===property.id;
        return (
          <button
            type="button"
            key={property.id}
            className={`property-map-marker ${active?'active':''} ${row.matchType.toLowerCase()}`}
            style={{left:`${point.x}%`,top:`${point.y}%`}}
            onClick={()=>onSelect(property.id)}
            onMouseEnter={()=>onHover(property.id)}
            onMouseLeave={()=>onHover(null)}
            title={`${property.address} · ${property.buildingSf.toLocaleString()} SF`}
          >
            <MapPin size={active?23:18}/>
            {active&&
              <span>
                <strong>{property.address}</strong>
                <small>{property.buildingSf.toLocaleString()} SF · {property.status}</small>
              </span>
            }
          </button>
        );
      })}

      <footer>
        <span>Map-ready governed property results</span>
        <button type="button">Search this area</button>
      </footer>
    </section>
  );
}

function LayerControl({activeLayer,counts,onSelect,savedSearches,onLoadSaved}){
  return (
    <section className="property-layer-control">
      <header>
        <Layers3 size={16}/>
        <strong>Layers</strong>
      </header>
      {LAYERS.map(([id,label])=>
        <button
          type="button"
          key={id}
          className={activeLayer===id?'active':''}
          onClick={()=>onSelect(id)}
        >
          <span>{label}</span>
          <small>{counts[id]||0}</small>
        </button>
      )}

      {savedSearches.length>0&&
        <div className="property-layer-saved">
          <strong>Saved searches</strong>
          {savedSearches.map(saved=>
            <button type="button" key={saved.id} onClick={()=>onLoadSaved(saved)}>
              <Bookmark size={12}/>{saved.name}
            </button>
          )}
        </div>
      }
    </section>
  );
}

function PropertyDrawer({model,onClose}){
  return (
    <aside className="property-detail-drawer">
      <header>
        <button type="button" onClick={onClose}><ChevronRight size={18}/></button>
        <div>
          <p>Property profile</p>
          <h2>{model.title}</h2>
          <span>{model.subtitle}</span>
        </div>
      </header>

      <section className="property-detail-drawer__ownership">
        <span>Ownership</span>
        <strong>{model.ownership.parent}</strong>
        <small>{model.ownership.legal}</small>
      </section>

      <section className="property-detail-drawer__specs">
        {model.specs.map(([label,value])=>
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        )}
      </section>

      <section className="property-detail-drawer__change">
        <span>Recent change</span>
        <strong>{model.recentChange}</strong>
      </section>

      {model.assignmentIds.length>0&&
        <section className="property-detail-drawer__assignment">
          <span>Related assignment</span>
          <strong>Brookfield — Locust Gateway</strong>
          <button type="button">Open Assignment</button>
        </section>
      }

      <footer>
        <button type="button"><Plus size={14}/> Create Assignment</button>
        <button type="button"><Bookmark size={14}/> Save Property</button>
        <button type="button"><FileText size={14}/> Generate Property Package</button>
      </footer>
    </aside>
  );
}

function CompareTray({properties,onRemove}){
  return (
    <section className="property-compare-tray">
      <header>
        <strong>Compare properties</strong>
        <span>{properties.length}/4</span>
      </header>
      <div>
        {properties.map(property=>
          <article key={property.id}>
            <span>{property.address}</span>
            <button type="button" onClick={()=>onRemove(property.id)}><X size={12}/></button>
          </article>
        )}
      </div>
      <button type="button" disabled={properties.length<2}>Open Comparison</button>
    </section>
  );
}

function AdvancedFilters({filters,onApply}){
  const[local,setLocal]=useState(filters);
  return (
    <section className="property-explorer-filters">
      <div>
        <label>
          <span>Submarket</span>
          <select value={local.submarket} onChange={event=>setLocal({...local,submarket:event.target.value})}>
            <option value="">All submarkets</option>
            <option>South Bay</option>
            <option>Inland Empire West</option>
            <option>Inland Empire East</option>
          </select>
        </label>
        <label>
          <span>Owner</span>
          <input value={local.owner} onChange={event=>setLocal({...local,owner:event.target.value})}/>
        </label>
        <label>
          <span>Minimum SF</span>
          <input type="number" value={local.minBuildingSf} onChange={event=>setLocal({...local,minBuildingSf:event.target.value})}/>
        </label>
        <label>
          <span>Maximum SF</span>
          <input type="number" value={local.maxBuildingSf} onChange={event=>setLocal({...local,maxBuildingSf:event.target.value})}/>
        </label>
        <label>
          <span>Minimum clear height</span>
          <input type="number" value={local.minClearHeightFt} onChange={event=>setLocal({...local,minClearHeightFt:event.target.value})}/>
        </label>
        <label>
          <span>Minimum power</span>
          <input type="number" value={local.minPowerAmps} onChange={event=>setLocal({...local,minPowerAmps:event.target.value})}/>
        </label>
      </div>
      <footer>
        <button type="button" onClick={()=>onApply(local)}>Apply Filters</button>
      </footer>
    </section>
  );
}

function calculateBounds(properties){
  const lats=properties.map(item=>item.latitude);
  const lngs=properties.map(item=>item.longitude);
  return {
    minLat:Math.min(...lats),
    maxLat:Math.max(...lats),
    minLng:Math.min(...lngs),
    maxLng:Math.max(...lngs)
  };
}

function projectPoint(property,bounds){
  const lngRange=bounds.maxLng-bounds.minLng||1;
  const latRange=bounds.maxLat-bounds.minLat||1;
  return {
    x:8+((property.longitude-bounds.minLng)/lngRange)*84,
    y:8+((bounds.maxLat-property.latitude)/latRange)*84
  };
}

function buildChips(filters){
  const chips=[];
  if(filters.submarket)chips.push({key:'submarket',label:filters.submarket});
  if(filters.city)chips.push({key:'city',label:filters.city});
  if(filters.owner)chips.push({key:'owner',label:filters.owner});
  if(filters.minBuildingSf)chips.push({key:'minBuildingSf',label:`${Number(filters.minBuildingSf).toLocaleString()} SF+`});
  if(filters.maxBuildingSf)chips.push({key:'maxBuildingSf',label:`Up to ${Number(filters.maxBuildingSf).toLocaleString()} SF`});
  if(filters.minClearHeightFt)chips.push({key:'minClearHeightFt',label:`${filters.minClearHeightFt}′ Clear+`});
  if(filters.minPowerAmps)chips.push({key:'minPowerAmps',label:`${Number(filters.minPowerAmps).toLocaleString()} Amps+`});
  if((filters.statuses||[]).length)chips.push({key:'statuses',label:'Available'});
  if(filters.layer&&filters.layer!=='ALL')chips.push({key:'layer',label:LAYERS.find(item=>item[0]===filters.layer)?.[1]||filters.layer});
  return chips;
}

function removeChipFilter(filters,key){
  if(key==='statuses')return {...filters,statuses:[]};
  if(key==='layer')return {...filters,layer:'ALL'};
  return {...filters,[key]:''};
}
