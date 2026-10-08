import React,{useEffect,useMemo,useRef}from'react';
import L from'leaflet';
import'leaflet/dist/leaflet.css';
import'./explorer-v5.css';

export default function LiveLeafletMap({
  properties=[],
  selectedPropertyId,
  onSelectProperty,
  spotlightRadiusMiles=5,
  neighborRelationships=[]
}){
  const containerRef=useRef(null);
  const mapRef=useRef(null);
  const layerRef=useRef(null);

  const selected=useMemo(
    ()=>properties.find(item=>item.id===selectedPropertyId)||properties[0]||null,
    [properties,selectedPropertyId]
  );

  useEffect(()=>{
    if(!containerRef.current||mapRef.current)return;

    const map=L.map(containerRef.current,{
      zoomControl:true,
      attributionControl:true,
      preferCanvas:true
    });

    const satellite=L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom:20,
        maxNativeZoom:19,
        attribution:'Tiles &copy; Esri'
      }
    );

    const labels=L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom:20,
        pane:'overlayPane',
        opacity:.9,
        attribution:'Labels &copy; Esri'
      }
    );

    const streets=L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom:19,
        attribution:'&copy; OpenStreetMap contributors'
      }
    );

    satellite.addTo(map);
    labels.addTo(map);

    L.control.layers(
      {
        'Satellite':satellite,
        'Streets':streets
      },
      {
        'Hybrid Labels':labels
      },
      {
        position:'topleft',
        collapsed:true
      }
    ).addTo(map);

    layerRef.current=L.layerGroup().addTo(map);
    mapRef.current=map;

    if(selected?.lat!=null&&selected?.lng!=null){
      map.setView([selected.lat,selected.lng],11);
    }else{
      map.setView([34.0522,-118.2437],9);
    }

    return()=>{
      map.remove();
      mapRef.current=null;
      layerRef.current=null;
    };
  },[]);

  useEffect(()=>{
    const map=mapRef.current;
    const group=layerRef.current;
    if(!map||!group)return;

    group.clearLayers();

    for(const property of properties){
      if(property.lat==null||property.lng==null)continue;
      const selectedMarker=property.id===selected?.id;
      const marker=L.circleMarker([property.lat,property.lng],{
        radius:selectedMarker?10:7,
        color:selectedMarker?'#ffffff':'#ffffff',
        weight:selectedMarker?4:2,
        fillColor:markerColor(property),
        fillOpacity:1,
        className:'sciip-satellite-marker'
      });

      marker.bindTooltip(
        `<strong>${escapeHtml(property.address||property.name||property.id)}</strong><br/>${Number(property.buildingSf||0).toLocaleString()} SF · ${escapeHtml(property.status||'Unknown')}`,
        {direction:'top',offset:[0,-8],opacity:.96}
      );

      marker.on('click',()=>onSelectProperty?.(property.id));
      marker.addTo(group);
    }

    if(selected?.lat!=null&&selected?.lng!=null){
      L.circle([selected.lat,selected.lng],{
        radius:spotlightRadiusMiles*1609.344,
        color:'#7a3c9b',
        weight:2,
        fillColor:'#7a3c9b',
        fillOpacity:.08,
        dashArray:'6 5'
      }).addTo(group);

      L.circleMarker([selected.lat,selected.lng],{
        radius:15,
        color:'#7a3c9b',
        weight:2,
        fillOpacity:0
      }).addTo(group);
    }

    for(const relationship of neighborRelationships){
      const neighbor=properties.find(item=>item.id===relationship.neighborPropertyId);
      if(!selected||!neighbor||neighbor.lat==null||neighbor.lng==null)continue;
      L.polyline(
        [[selected.lat,selected.lng],[neighbor.lat,neighbor.lng]],
        {
          color:relationship.relationshipType==='ADJOINING'?'#3f7f59':'#6e92a5',
          weight:relationship.relationshipType==='ADJOINING'?3:2,
          dashArray:relationship.relationshipType==='ADJOINING'?null:'4 5',
          opacity:.85
        }
      ).addTo(group);
    }
  },[properties,selected,spotlightRadiusMiles,neighborRelationships,onSelectProperty]);

  useEffect(()=>{
    const map=mapRef.current;
    if(!map||!selected||selected.lat==null||selected.lng==null)return;
    map.flyTo([selected.lat,selected.lng],12,{duration:.8});
  },[selected?.id]);

  return <div ref={containerRef} className="explorer-v5__leaflet-map"/>;
}

function markerColor(property){
  if(property.assignment)return '#b58a2f';
  if(property.status==='UNDER CONSTRUCTION')return '#2f7f7a';
  if(property.status==='AVAILABLE')return '#1f6f9f';
  if(property.type==='LEASE_COMPARABLE')return '#7250a8';
  if(property.type==='SALE_COMPARABLE')return '#c46b2b';
  if(property.type==='REQUIREMENT')return '#b53d4a';
  return '#388b5a';
}

function escapeHtml(value){
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}
