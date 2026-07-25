/** SCIIP_OS v7.0 GIS Workspace Alpha */
var SCIIP_GIS_WORKSPACE = (function () {
  'use strict';

  var VERSION = 'v7.0-alpha.1';
  var MAX_FEATURES = 500;
  var PROPERTY_SHEETS = ['PROPERTY_REGISTRY','PROPERTY_CURRENT','ASSET_REGISTRY'];
  var GRAPH_NODE_SHEETS = ['GRAPH_NODES','KNOWLEDGE_GRAPH_NODES','ASSET_GRAPH_NODES'];

  var FALLBACK_FEATURES = [
    {id:'PROP-RIALTO-2125-LOWELL',label:'2125 W Lowell St',layer:'Properties',type:'Industrial',status:'Planned',city:'Rialto',latitude:34.1063,longitude:-117.4103,detail:'664,859 SF · 39.89 AC · 42 FT clear'},
    {id:'PROP-SB-2765-LEXINGTON',label:'2765 Lexington Way',layer:'Properties',type:'Industrial',status:'Existing',city:'San Bernardino',latitude:34.0828,longitude:-117.3107,detail:'129,850 SF · 18.34 AC · 3,000 A'},
    {id:'PROP-LB-2400-ARTESIA',label:'2400 E Artesia Blvd',layer:'Properties',type:'Industrial',status:'Existing',city:'Long Beach',latitude:33.8733,longitude:-118.1647,detail:'415,312 SF · 17.23 AC · 36 FT clear'},
    {id:'PROP-IRWINDALE-5517-AYON',label:'5517 Ayon Ave',layer:'Properties',type:'Industrial Land',status:'Land',city:'Irwindale',latitude:34.1067,longitude:-117.9382,detail:'1.66 AC industrial land'},
    {id:'PROP-PERRIS-20123-HARVILL',label:'20123 Harvill Ave',layer:'Properties',type:'Industrial',status:'Pending Comparable',city:'Perris',latitude:33.8466,longitude:-117.2582,detail:'Pending comparable property'},
    {id:'MARKET-INLAND-EMPIRE',label:'Inland Empire',layer:'Markets',type:'Industrial Market',status:'Active',city:'',latitude:34.0000,longitude:-117.4500,detail:'Southern California industrial market'},
    {id:'COMP-BROOKFIELD',label:'Brookfield',layer:'Companies',type:'Owner / Developer',status:'Active',city:'',latitude:34.1063,longitude:-117.4103,detail:'Linked to 2125 W Lowell St'},
    {id:'COMP-REALTERM',label:'Realterm',layer:'Companies',type:'Owner',status:'Active',city:'',latitude:34.0828,longitude:-117.3107,detail:'Linked to 2765 Lexington Way'}
  ];

  function safe_(fn, fallback) { try { return fn(); } catch (error) { return typeof fallback === 'function' ? fallback(error) : fallback; } }
  function normalize_(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function index_(headers) { var out={}; for(var i=0;i<headers.length;i+=1) out[normalize_(headers[i])]=i; return out; }
  function cell_(row, idx, aliases, fallback) { for(var i=0;i<aliases.length;i+=1){var key=normalize_(aliases[i]);if(Object.prototype.hasOwnProperty.call(idx,key)){var v=row[idx[key]];if(v!==''&&v!==null&&typeof v!=='undefined')return v;}}return fallback; }
  function number_(value) { var n=Number(String(value==null?'':value).replace(/[^0-9.\-]/g,'')); return isFinite(n)?n:0; }
  function validCoordinate_(lat,lng) { return isFinite(lat)&&isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180&&!(lat===0&&lng===0); }
  function findSheet_(ss,names){for(var i=0;i<names.length;i+=1){var s=ss.getSheetByName(names[i]);if(s)return s;}return null;}

  function propertyFeatures_() {
    return safe_(function(){
      if(typeof SpreadsheetApp==='undefined') return null;
      var ss=SpreadsheetApp.getActiveSpreadsheet(); if(!ss) return null;
      var sheet=findSheet_(ss,PROPERTY_SHEETS); if(!sheet||sheet.getLastRow()<2) return null;
      var values=sheet.getDataRange().getValues(), idx=index_(values[0]), out=[];
      for(var r=1;r<values.length&&out.length<MAX_FEATURES;r+=1){
        var row=values[r];
        var lat=number_(cell_(row,idx,['Latitude','Lat'],0)), lng=number_(cell_(row,idx,['Longitude','Lng','Long'],0));
        if(!validCoordinate_(lat,lng)) continue;
        var id=String(cell_(row,idx,['Property ID','Property_ID','Asset ID','ID'],'PROP-'+r)).trim();
        var address=String(cell_(row,idx,['Address','Property Address','Site Address'],id));
        var city=String(cell_(row,idx,['City'],'')).trim();
        var sf=number_(cell_(row,idx,['Building SF','Building_SF','SF','Available SF'],0));
        var acres=number_(cell_(row,idx,['Land Acres','Acres','Site Acres'],0));
        out.push({id:id,label:address,layer:'Properties',type:String(cell_(row,idx,['Property Type','Type','Asset Type'],'Industrial')),status:String(cell_(row,idx,['Status'],'Unknown')),city:city,latitude:lat,longitude:lng,detail:(sf?sf.toLocaleString()+' SF':'')+(sf&&acres?' · ':'')+(acres?acres+' AC':'')});
      }
      return out.length?{features:out,source:'SPREADSHEET:'+sheet.getName()}:null;
    },null);
  }

  function graphFeatures_() {
    return safe_(function(){
      if(typeof SpreadsheetApp==='undefined') return null;
      var ss=SpreadsheetApp.getActiveSpreadsheet(); if(!ss) return null;
      var sheet=findSheet_(ss,GRAPH_NODE_SHEETS); if(!sheet||sheet.getLastRow()<2) return null;
      var values=sheet.getDataRange().getValues(), idx=index_(values[0]), out=[];
      for(var r=1;r<values.length&&out.length<MAX_FEATURES;r+=1){
        var row=values[r], lat=number_(cell_(row,idx,['Latitude','Lat'],0)), lng=number_(cell_(row,idx,['Longitude','Lng','Long'],0));
        if(!validCoordinate_(lat,lng)) continue;
        var id=String(cell_(row,idx,['Node ID','Node_ID','ID'],'NODE-'+r)).trim();
        out.push({id:id,label:String(cell_(row,idx,['Label','Name','Address'],id)),layer:'Graph Nodes',type:String(cell_(row,idx,['Node Type','Type'],'Entity')),status:String(cell_(row,idx,['Status'],'Unknown')),city:String(cell_(row,idx,['City'],'')),latitude:lat,longitude:lng,detail:String(cell_(row,idx,['Description','Notes','Summary'],''))});
      }
      return out.length?{features:out,source:'SPREADSHEET:'+sheet.getName()}:null;
    },null);
  }

  function catalog_(){
    var property=propertyFeatures_(), graph=graphFeatures_(), features=[], sources=[];
    if(property){features=features.concat(property.features);sources.push(property.source);}
    if(graph){features=features.concat(graph.features);sources.push(graph.source);}
    if(features.length) return {features:features,source:sources.join(' + ')};
    return {features:FALLBACK_FEATURES.slice(),source:'CERTIFIED_FALLBACK'};
  }
  function unique_(items){var seen={},out=[];for(var i=0;i<items.length;i+=1){var v=items[i];if(v&&!seen[v]){seen[v]=true;out.push(v);}}return out.sort();}
  function matches_(f,filters){filters=filters||{};var q=String(filters.query||'').toLowerCase().trim();if(q&&[f.id,f.label,f.layer,f.type,f.status,f.city,f.detail].join(' ').toLowerCase().indexOf(q)===-1)return false;if(filters.layer&&String(f.layer).toLowerCase()!==String(filters.layer).toLowerCase())return false;if(filters.status&&String(f.status).toLowerCase()!==String(filters.status).toLowerCase())return false;return true;}
  function bounds_(features){if(!features.length)return null;var minLat=90,maxLat=-90,minLng=180,maxLng=-180;for(var i=0;i<features.length;i+=1){minLat=Math.min(minLat,features[i].latitude);maxLat=Math.max(maxLat,features[i].latitude);minLng=Math.min(minLng,features[i].longitude);maxLng=Math.max(maxLng,features[i].longitude);}return {minLatitude:minLat,maxLatitude:maxLat,minLongitude:minLng,maxLongitude:maxLng,centerLatitude:(minLat+maxLat)/2,centerLongitude:(minLng+maxLng)/2};}
  function snapshot(filters){
    filters=filters||{};var c=catalog_(), features=[];
    for(var i=0;i<c.features.length;i+=1)if(matches_(c.features[i],filters))features.push(c.features[i]);
    return {version:VERSION,generatedAt:new Date().toISOString(),status:'AVAILABLE',source:c.source,totalCatalog:c.features.length,featureCount:features.length,mapReady:features.length,features:features,bounds:bounds_(features),facets:{layers:unique_(c.features.map(function(f){return f.layer;})),statuses:unique_(c.features.map(function(f){return f.status;})),cities:unique_(c.features.map(function(f){return f.city;}))},filters:filters};
  }
  function feature(id){var c=catalog_();for(var i=0;i<c.features.length;i+=1)if(c.features[i].id===id)return c.features[i];return null;}

  return {VERSION:VERSION,snapshot:snapshot,feature:feature,isValidCoordinate:validCoordinate_};
})();

function sciipGisWorkspaceSnapshot(filters){return SCIIP_GIS_WORKSPACE.snapshot(filters||{});}
function sciipGisWorkspaceFeature(featureId){return SCIIP_GIS_WORKSPACE.feature(String(featureId||''));}
