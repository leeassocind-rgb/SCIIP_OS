import{MapProvider}from'../MapProvider.js';
import{buildSpatialClusters,propertyIdsInClusters,spatialBandForZoom}from'../spatialClusterEngine.js';
import{statusSymbol}from'../../v6/governedSpatialEngine.js';

const DEFAULT_CENTER={lat:34.0522,lng:-118.2437};
let googleMapsPromise=null;

export class GoogleMapsAdapter extends MapProvider{
  constructor(options={}){
    super(options);
    this.markers=new Map();
    this.clusterMarkers=new Map();
    this.relationshipLines=[];
    this.boundaryPolygons=[];
    this.externalParcelPolygon=null;
    this.externalParcelOverlay=null;
    this.spotlightCircle=null;
    this.selectionRing=null;
    this.properties=[];
    this.selectedProperty=null;
    this.spatialContext={mode:'market',highlightedPropertyIds:[],cohortPropertyIds:[]};
    this.zoomListener=null;
    this.onSelectProperty=options.onSelectProperty;
  }

  async initialize(container){
    if(!container)throw new Error('Google Maps container is required');
    const google=await loadGoogleMaps({apiKey:this.options.apiKey,language:this.options.language,region:this.options.region});
    this.google=google;
    this.map=new google.maps.Map(container,{
      center:this.options.center||DEFAULT_CENTER,
      zoom:this.options.zoom||10,
      mapTypeId:'hybrid',
      mapTypeControl:false,
      streetViewControl:true,
      fullscreenControl:true,
      rotateControl:true,
      scaleControl:true,
      gestureHandling:'greedy',
      clickableIcons:false,
      restriction:undefined,
      ...this.options.mapOptions
    });
    this.zoomListener=this.map.addListener('zoom_changed',()=>this.#renderSpatialState());
    return this;
  }

  setProperties(properties=[]){
    this.properties=properties;
    const activeIds=new Set();
    for(const property of properties){
      if(!hasCoordinates(property))continue;
      activeIds.add(property.id);
      let marker=this.markers.get(property.id);
      if(!marker){
        marker=createPropertyOverlay({
          google:this.google,
          map:this.map,
          property,
          onSelect:()=>this.onSelectProperty?.(property.id)
        });
        this.markers.set(property.id,marker);
      }
      marker.update(property,{selected:property.id===this.selectedProperty?.id});
    }
    for(const[id,marker]of this.markers){
      if(!activeIds.has(id)){marker.setMap(null);this.markers.delete(id);}
    }
    this.#renderPropertyBoundaries();
    this.#renderSpatialState();
  }

  setSelectedProperty(property,{animate=true}={}){
    this.selectedProperty=property||null;
    this.#renderSpatialState();
    this.#renderPropertyBoundaries();
    if(!hasCoordinates(property)||!this.map)return;
    const center={lat:Number(property.lat),lng:Number(property.lng)};
    if(animate)this.map.panTo(center);else this.map.setCenter(center);
    if(this.map.getZoom()<13)this.map.setZoom(13);
    this.#renderSelectionRing(center);
  }

  setSpatialContext(context={}){
    this.spatialContext={
      mode:context.mode||'market',
      highlightedPropertyIds:Array.isArray(context.highlightedPropertyIds)?context.highlightedPropertyIds:[],
      cohortPropertyIds:Array.isArray(context.cohortPropertyIds)?context.cohortPropertyIds:[]
    };
    this.#renderSpatialState();
    this.#renderPropertyBoundaries();
  }

  focusSelectedProperty({zoom=15}={}){
    if(!hasCoordinates(this.selectedProperty)||!this.map)return;
    if(Array.isArray(this.selectedProperty.boundaryPath)&&this.selectedProperty.boundaryPath.length>=3){
      const bounds=new this.google.maps.LatLngBounds();
      for(const point of this.selectedProperty.boundaryPath){
        const lat=Array.isArray(point)?Number(point[1]):Number(point.lat);
        const lng=Array.isArray(point)?Number(point[0]):Number(point.lng);
        if(Number.isFinite(lat)&&Number.isFinite(lng))bounds.extend({lat,lng});
      }
      this.map.fitBounds(bounds,88);
      return;
    }
    const center={lat:Number(this.selectedProperty.lat),lng:Number(this.selectedProperty.lng)};
    this.map.panTo(center);
    this.map.setZoom(Math.max(Number(zoom)||15,13));
  }

  focusProperty(propertyId,{zoom=16}={}){
    const property=this.properties.find(item=>item.id===propertyId);
    if(!hasCoordinates(property)||!this.map)return;
    this.map.panTo({lat:Number(property.lat),lng:Number(property.lng)});
    this.map.setZoom(Math.max(Number(zoom)||16,13));
  }

  fitSelectedContext(relationships=[],properties=this.properties){
    if(!hasCoordinates(this.selectedProperty)||!this.map)return;
    const bounds=new this.google.maps.LatLngBounds();
    bounds.extend({lat:Number(this.selectedProperty.lat),lng:Number(this.selectedProperty.lng)});
    let points=1;
    for(const relationship of relationships){
      const neighbor=properties.find(item=>item.id===relationship.neighborPropertyId);
      if(!hasCoordinates(neighbor))continue;
      bounds.extend({lat:Number(neighbor.lat),lng:Number(neighbor.lng)});
      points+=1;
    }
    if(points>1)this.map.fitBounds(bounds,80);
    else this.focusSelectedProperty({zoom:14});
  }

  setSpotlight(property,radiusMiles=5){
    this.spotlightCircle?.setMap(null);
    this.spotlightCircle=null;
    if(!hasCoordinates(property)||!this.map)return;
    this.spotlightCircle=new this.google.maps.Circle({
      map:this.map,
      center:{lat:Number(property.lat),lng:Number(property.lng)},
      radius:Number(radiusMiles||0)*1609.344,
      strokeColor:'#6f4a8e',
      strokeOpacity:.72,
      strokeWeight:2,
      fillColor:'#6f4a8e',
      fillOpacity:.035,
      clickable:false
    });
  }

  setNeighborRelationships(selected,relationships=[],properties=this.properties){
    for(const line of this.relationshipLines)line.setMap(null);
    this.relationshipLines=[];
    if(!hasCoordinates(selected))return;
    for(const relationship of relationships){
      const neighbor=properties.find(item=>item.id===relationship.neighborPropertyId);
      if(!hasCoordinates(neighbor))continue;
      const adjoining=relationship.relationshipType==='ADJOINING';
      const line=new this.google.maps.Polyline({
        map:this.map,
        path:[
          {lat:Number(selected.lat),lng:Number(selected.lng)},
          {lat:Number(neighbor.lat),lng:Number(neighbor.lng)}
        ],
        strokeColor:adjoining?'#315f49':'#5f7f91',
        strokeOpacity:this.spatialContext.mode==='neighbors'?.9:.58,
        strokeWeight:adjoining?3:2,
        icons:adjoining?undefined:[{icon:{path:'M 0,-1 0,1',strokeOpacity:1,scale:2},offset:'0',repeat:'12px'}],
        clickable:false,
        zIndex:80
      });
      this.relationshipLines.push(line);
    }
  }

  setMapType(mapType='hybrid'){
    const allowed=new Set(['roadmap','satellite','hybrid','terrain']);
    this.map?.setMapTypeId(allowed.has(mapType)?mapType:'hybrid');
  }

  resize(){
    if(this.map&&this.google)this.google.maps.event.trigger(this.map,'resize');
  }

  destroy(){
    this.zoomListener?.remove?.();
    for(const marker of this.markers.values())marker.setMap(null);
    for(const marker of this.clusterMarkers.values())marker.setMap(null);
    for(const line of this.relationshipLines)line.setMap(null);
    for(const polygon of this.boundaryPolygons)polygon.setMap(null);
    this.spotlightCircle?.setMap(null);
    this.selectionRing?.setMap(null);
    this.markers.clear();
    this.clusterMarkers.clear();
    this.relationshipLines=[];
    this.boundaryPolygons=[];
    this.spotlightCircle=null;
    this.selectionRing=null;
    super.destroy();
  }

  #renderSpatialState(){
    if(!this.map||!this.google)return;
    const zoom=Number(this.map.getZoom()||10);
    const band=spatialBandForZoom(zoom);
    const clusters=buildSpatialClusters(this.properties,zoom,{selectedPropertyId:this.selectedProperty?.id});
    const clusteredIds=propertyIdsInClusters(clusters);
    const highlighted=new Set(this.spatialContext.highlightedPropertyIds||[]);
    const cohort=new Set(this.spatialContext.cohortPropertyIds||[]);
    const hasHighlight=highlighted.size>0;

    const liveClusterIds=new Set();
    for(const cluster of clusters){
      liveClusterIds.add(cluster.id);
      let overlay=this.clusterMarkers.get(cluster.id);
      if(!overlay){
        overlay=createClusterOverlay({google:this.google,map:this.map,cluster,onClick:()=>this.#zoomIntoCluster(cluster)});
        this.clusterMarkers.set(cluster.id,overlay);
      }
      overlay.update(cluster,{band});
      overlay.setVisible(true);
    }
    for(const[id,overlay]of this.clusterMarkers){
      if(!liveClusterIds.has(id)){overlay.setMap(null);this.clusterMarkers.delete(id);}
    }

    for(const[propertyId,marker]of this.markers){
      const property=this.properties.find(item=>item.id===propertyId);
      if(!property)continue;
      const selected=propertyId===this.selectedProperty?.id;
      const hiddenByCluster=clusteredIds.has(propertyId)&&!selected;
      const highlightedRecord=highlighted.has(propertyId);
      const inCohort=!cohort.size||cohort.has(propertyId)||selected;
      const dimmed=!selected&&((hasHighlight&&!highlightedRecord)||!inCohort);
      marker.setVisible(!hiddenByCluster);
      marker.update(property,{selected,dimmed,highlighted:highlightedRecord,band});
    }
  }

  #zoomIntoCluster(cluster){
    if(!this.map)return;
    this.map.panTo({lat:Number(cluster.lat),lng:Number(cluster.lng)});
    this.map.setZoom(Math.min(15,Number(this.map.getZoom()||10)+2));
  }


setExternalParcelOverlay(overlay){
  this.externalParcelOverlay=overlay||null;
  this.#renderExternalParcelOverlay();
}

#renderExternalParcelOverlay(){
  if(this.externalParcelPolygon){
    this.externalParcelPolygon.setMap(null);
    this.externalParcelPolygon=null;
  }
  const overlay=this.externalParcelOverlay;
  if(!this.map||!this.google||!overlay?.verified||!Array.isArray(overlay.boundary)||overlay.boundary.length<3)return;
  this.externalParcelPolygon=new this.google.maps.Polygon({
    map:this.map,
    paths:overlay.boundary,
    strokeColor:'#111827',
    strokeOpacity:.95,
    strokeWeight:3,
    fillColor:'#ffffff',
    fillOpacity:.06,
    clickable:false,
    zIndex:110
  });
}

#renderPropertyBoundaries(){
  for(const polygon of this.boundaryPolygons)polygon.setMap(null);
  this.boundaryPolygons=[];
  if(!this.map||!this.google)return;
  const selectedId=this.selectedProperty?.id;
  const highlighted=new Set(this.spatialContext.highlightedPropertyIds||[]);
  const neighborMode=this.spatialContext.mode==='neighbors';
  const zoom=Number(this.map.getZoom()||10);
  const parcelZoom=zoom>=15;
  for(const property of this.properties){
    if(!Array.isArray(property.boundaryPath)||property.boundaryPath.length<3)continue;
    const selected=property.id===selectedId;
    const highlightedRecord=highlighted.has(property.id);
    if(!selected&&!highlightedRecord&&!neighborMode&&!parcelZoom)continue;
    const symbol=statusSymbol(property);
    const palette={
      selected:['#ffffff','#0f4c66'],
      available:['#0f6f7a','#0f6f7a'],
      comparable:['#6e55a6','#6e55a6'],
      construction:['#b07a22','#b07a22'],
      assignment:['#8a5b16','#8a5b16'],
      base:['#60727f','#60727f']
    };
    const [stroke,fill]=selected?palette.selected:(palette[symbol]||palette.base);
    const polygon=new this.google.maps.Polygon({
      map:this.map,
      paths:property.boundaryPath,
      strokeColor:stroke,
      strokeOpacity:selected?.98:(highlightedRecord?.9:(parcelZoom?.62:.72)),
      strokeWeight:selected?4:(highlightedRecord?3:1.25),
      fillColor:fill,
      fillOpacity:selected?.16:(highlightedRecord?.10:(parcelZoom?.025:.05)),
      clickable:true,
      zIndex:selected?95:(highlightedRecord?80:55)
    });
    polygon.addListener('click',()=>this.onSelectProperty?.(property.id));
    polygon.addListener('mouseover',()=>polygon.setOptions({strokeWeight:selected?4:2.5,fillOpacity:selected?.16:.09}));
    polygon.addListener('mouseout',()=>polygon.setOptions({strokeWeight:selected?4:(highlightedRecord?3:1.25),fillOpacity:selected?.16:(highlightedRecord?.10:(parcelZoom?.025:.05))}));
    this.boundaryPolygons.push(polygon);
  }
}
  #renderSelectionRing(center){
    this.selectionRing?.setMap(null);
    this.selectionRing=new this.google.maps.Circle({
      map:this.map,
      center,
      radius:120,
      strokeColor:'#ffffff',
      strokeOpacity:.95,
      strokeWeight:2,
      fillColor:'#153f57',
      fillOpacity:.08,
      clickable:false,
      zIndex:90
    });
  }
}

export async function loadGoogleMaps({apiKey,language='en',region='US'}={}){
  if(globalThis.google?.maps)return globalThis.google;
  if(!apiKey)throw new Error('Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY.');
  if(googleMapsPromise)return googleMapsPromise;
  googleMapsPromise=new Promise((resolve,reject)=>{
    const callback=`__sciipGoogleMapsReady_${Date.now()}`;
    const timeout=setTimeout(()=>reject(new Error('Google Maps loading timed out')),15000);
    globalThis[callback]=()=>{
      clearTimeout(timeout);
      delete globalThis[callback];
      resolve(globalThis.google);
    };
    const script=document.createElement('script');
    const params=new URLSearchParams({key:apiKey,callback,loading:'async',v:'weekly',language,region});
    script.src=`https://maps.googleapis.com/maps/api/js?${params}`;
    script.async=true;
    script.defer=true;
    script.onerror=()=>{
      clearTimeout(timeout);
      delete globalThis[callback];
      googleMapsPromise=null;
      reject(new Error('Google Maps failed to load'));
    };
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

function createPropertyOverlay({google,map,property,onSelect}){
  const OverlayView=google.maps.OverlayView;
  class PropertyOverlay extends OverlayView{
    constructor(){super();this.property=property;this.selected=false;this.dimmed=false;this.highlighted=false;this.band='market';this.root=null;this.visible=true;this.setMap(map);}
    onAdd(){
      this.root=document.createElement('button');
      this.root.type='button';
      this.root.className='sciip-property-marker';
      this.root.addEventListener('click',event=>{event.stopPropagation();onSelect?.();});
      this.getPanes().overlayMouseTarget.appendChild(this.root);
      this.#render();
    }
    draw(){
      if(!this.root)return;
      const point=this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(Number(this.property.lat),Number(this.property.lng)));
      if(!point)return;
      this.root.style.left=`${point.x}px`;
      this.root.style.top=`${point.y}px`;
    }
    onRemove(){this.root?.remove();this.root=null;}
    setVisible(visible){this.visible=Boolean(visible);if(this.root)this.root.style.display=this.visible?'flex':'none';}
    update(next,{selected=false,dimmed=false,highlighted=false,band='market'}={}){this.property=next;this.selected=selected;this.dimmed=dimmed;this.highlighted=highlighted;this.band=band;this.#render();this.draw();}
    #render(){
      if(!this.root)return;
      const p=this.property;
      const label=p.address||p.name||p.id;
      this.root.style.setProperty('--marker-color',markerColor(p));
      this.root.classList.toggle('is-selected',this.selected);
      this.root.classList.toggle('is-dimmed',this.dimmed);
      this.root.classList.toggle('is-highlighted',this.highlighted);
      this.root.dataset.spatialBand=this.band;
      this.root.dataset.propertyStatus=statusSymbol(p);
      this.root.style.display=this.visible?'flex':'none';
      this.root.setAttribute('aria-label',`Select ${label}`);
      this.root.innerHTML=`<span class="sciip-property-marker__dot"></span>${this.selected?`<span class="sciip-property-marker__label">${escapeHtml(label)}</span>`:''}<span class="sciip-property-marker__card"><b>${escapeHtml(label)}</b><em>${escapeHtml(p.status||'PROPERTY')} · ${formatSf(p.buildingSf)}</em><small>${escapeHtml(p.owner||'Owner unavailable')}</small>${p.clearHeightFt?`<small>${Number(p.clearHeightFt)}' clear</small>`:''}${p.powerAmps?`<small>${Number(p.powerAmps).toLocaleString()} A power</small>`:''}</span>`;
    }
  }
  return new PropertyOverlay();
}

function createClusterOverlay({google,map,cluster,onClick}){
  const OverlayView=google.maps.OverlayView;
  class ClusterOverlay extends OverlayView{
    constructor(){super();this.cluster=cluster;this.band='regional';this.root=null;this.visible=true;this.setMap(map);}
    onAdd(){
      this.root=document.createElement('button');
      this.root.type='button';
      this.root.className='sciip-property-cluster';
      this.root.addEventListener('click',event=>{event.stopPropagation();onClick?.();});
      this.getPanes().overlayMouseTarget.appendChild(this.root);
      this.#render();
    }
    draw(){
      if(!this.root)return;
      const point=this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(Number(this.cluster.lat),Number(this.cluster.lng)));
      if(!point)return;
      this.root.style.left=`${point.x}px`;
      this.root.style.top=`${point.y}px`;
    }
    onRemove(){this.root?.remove();this.root=null;}
    setVisible(visible){this.visible=Boolean(visible);if(this.root)this.root.style.display=this.visible?'grid':'none';}
    update(cluster,{band='regional'}={}){this.cluster=cluster;this.band=band;this.#render();this.draw();}
    #render(){
      if(!this.root)return;
      const c=this.cluster;
      this.root.dataset.spatialBand=this.band;
      this.root.dataset.propertyStatus=statusSymbol(p);
      this.root.style.display=this.visible?'grid':'none';
      this.root.setAttribute('aria-label',`Zoom to ${c.count} industrial properties`);
      this.root.innerHTML=`<strong>${c.count}</strong><span>${compactSf(c.totalSf)}</span><small>${c.availableCount?`${c.availableCount} avail`:c.comparableCount?`${c.comparableCount} comps`:'properties'}</small>`;
    }
  }
  return new ClusterOverlay();
}

function hasCoordinates(property){return Number.isFinite(Number(property?.lat))&&Number.isFinite(Number(property?.lng));}
function formatSf(value){const sf=Number(value)||0;return sf?`${sf.toLocaleString()} SF`:'Land / site';}
function compactSf(value){const n=Number(value)||0;if(n>=1_000_000)return`${(n/1_000_000).toFixed(1).replace(/\.0$/,'')}M SF`;if(n>=1_000)return`${Math.round(n/1_000)}K SF`;return`${n.toLocaleString()} SF`;}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
function markerColor(property){
  if(property.assignment)return'#b58a2f';
  if(property.status==='UNDER CONSTRUCTION')return'#2f7f7a';
  if(property.status==='AVAILABLE')return'#1f6f9f';
  if(property.recordType==='LEASE_COMPARABLE'||property.type==='LEASE_COMPARABLE')return'#7250a8';
  if(property.recordType==='SALE_COMPARABLE'||property.type==='SALE_COMPARABLE')return'#c46b2b';
  if(property.type==='REQUIREMENT')return'#b53d4a';
  return'#388b5a';
}
