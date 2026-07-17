/** SCIIP_OS v7.0 Knowledge Graph Viewer Alpha */
var SCIIP_KNOWLEDGE_GRAPH_VIEWER = (function () {
  'use strict';

  var VERSION = 'v7.0-alpha.1';
  var MAX_NODES = 250;
  var MAX_EDGES = 750;
  var NODE_SHEETS = ['GRAPH_NODES', 'KNOWLEDGE_GRAPH_NODES', 'ASSET_GRAPH_NODES'];
  var EDGE_SHEETS = ['GRAPH_EDGES', 'KNOWLEDGE_GRAPH_EDGES', 'ASSET_RELATIONSHIPS'];

  var FALLBACK_NODES = [
    {id:'PROP-RIALTO-2125-LOWELL',label:'2125 W Lowell St',type:'Property',status:'Planned',city:'Rialto',description:'664,859 SF industrial development'},
    {id:'COMP-BROOKFIELD',label:'Brookfield',type:'Company',status:'Active',city:'',description:'Industrial owner and developer'},
    {id:'PROP-SB-2765-LEXINGTON',label:'2765 Lexington Way',type:'Property',status:'Existing',city:'San Bernardino',description:'129,850 SF industrial property'},
    {id:'COMP-REALTERM',label:'Realterm',type:'Company',status:'Active',city:'',description:'Industrial real estate owner'},
    {id:'PROP-LB-2400-ARTESIA',label:'2400 E Artesia Blvd',type:'Property',status:'Existing',city:'Long Beach',description:'415,312 SF industrial property'},
    {id:'MARKET-INLAND-EMPIRE',label:'Inland Empire',type:'Market',status:'Active',city:'',description:'Southern California industrial market'},
    {id:'EVENT-V61-CERT',label:'v6.1 Production Certification',type:'Event',status:'Certified',city:'',description:'SCIIP_OS production-ready certification event'}
  ];
  var FALLBACK_EDGES = [
    {id:'EDGE-1',source:'COMP-BROOKFIELD',target:'PROP-RIALTO-2125-LOWELL',type:'OWNS',label:'owns'},
    {id:'EDGE-2',source:'COMP-REALTERM',target:'PROP-SB-2765-LEXINGTON',type:'OWNS',label:'owns'},
    {id:'EDGE-3',source:'PROP-RIALTO-2125-LOWELL',target:'MARKET-INLAND-EMPIRE',type:'LOCATED_IN',label:'located in'},
    {id:'EDGE-4',source:'PROP-SB-2765-LEXINGTON',target:'MARKET-INLAND-EMPIRE',type:'LOCATED_IN',label:'located in'},
    {id:'EDGE-5',source:'PROP-LB-2400-ARTESIA',target:'MARKET-INLAND-EMPIRE',type:'RELATED_MARKET',label:'related market'},
    {id:'EDGE-6',source:'EVENT-V61-CERT',target:'COMP-BROOKFIELD',type:'PLATFORM_CONTEXT',label:'platform context'}
  ];

  function safe_(fn, fallback) { try { return fn(); } catch (error) { return typeof fallback === 'function' ? fallback(error) : fallback; } }
  function normalize_(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function index_(headers) { var out={}; for(var i=0;i<headers.length;i+=1) out[normalize_(headers[i])]=i; return out; }
  function cell_(row, idx, aliases, fallback) { for(var i=0;i<aliases.length;i+=1){var key=normalize_(aliases[i]);if(Object.prototype.hasOwnProperty.call(idx,key)){var v=row[idx[key]];if(v!==''&&v!==null&&typeof v!=='undefined')return v;}}return fallback; }
  function findSheet_(ss, names) { for(var i=0;i<names.length;i+=1){var sheet=ss.getSheetByName(names[i]);if(sheet)return sheet;}return null; }

  function fromSheets_() {
    return safe_(function () {
      if (typeof SpreadsheetApp === 'undefined') return null;
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (!ss) return null;
      var nodeSheet = findSheet_(ss, NODE_SHEETS);
      var edgeSheet = findSheet_(ss, EDGE_SHEETS);
      if (!nodeSheet || nodeSheet.getLastRow() < 2) return null;
      var nv=nodeSheet.getDataRange().getValues(), ni=index_(nv[0]), nodes=[];
      for(var r=1;r<nv.length&&nodes.length<MAX_NODES;r+=1){
        var row=nv[r], id=String(cell_(row,ni,['Node ID','Node_ID','ID','Asset ID','Property ID'],'')).trim();
        if(!id) continue;
        nodes.push({id:id,label:String(cell_(row,ni,['Label','Name','Address','Title'],id)),type:String(cell_(row,ni,['Node Type','Type','Entity Type'],'Entity')),status:String(cell_(row,ni,['Status'],'Unknown')),city:String(cell_(row,ni,['City'],'')),description:String(cell_(row,ni,['Description','Notes','Summary'],''))});
      }
      var edges=[];
      if(edgeSheet&&edgeSheet.getLastRow()>=2){
        var ev=edgeSheet.getDataRange().getValues(), ei=index_(ev[0]);
        for(var e=1;e<ev.length&&edges.length<MAX_EDGES;e+=1){
          var er=ev[e], source=String(cell_(er,ei,['Source','Source ID','From','From ID'],'')).trim(), target=String(cell_(er,ei,['Target','Target ID','To','To ID'],'')).trim();
          if(!source||!target)continue;
          var type=String(cell_(er,ei,['Relationship Type','Edge Type','Type'],'RELATED_TO'));
          edges.push({id:String(cell_(er,ei,['Edge ID','ID'],'EDGE-'+e)),source:source,target:target,type:type,label:String(cell_(er,ei,['Label','Relationship'],type))});
        }
      }
      return nodes.length?{nodes:nodes,edges:edges,source:'SPREADSHEET:'+nodeSheet.getName()+(edgeSheet?'/'+edgeSheet.getName():'')}:null;
    }, null);
  }

  function catalog_() { return fromSheets_() || {nodes:FALLBACK_NODES.slice(),edges:FALLBACK_EDGES.slice(),source:'CERTIFIED_FALLBACK'}; }
  function nodeMap_(nodes){var out={};for(var i=0;i<nodes.length;i+=1)out[nodes[i].id]=nodes[i];return out;}
  function matchesNode_(n, filters){filters=filters||{};var q=String(filters.query||'').toLowerCase().trim();if(q){var h=[n.id,n.label,n.type,n.status,n.city,n.description].join(' ').toLowerCase();if(h.indexOf(q)===-1)return false;}if(filters.type&&String(n.type).toLowerCase()!==String(filters.type).toLowerCase())return false;return true;}
  function unique_(items){var seen={},out=[];for(var i=0;i<items.length;i+=1){var v=items[i];if(v&&!seen[v]){seen[v]=true;out.push(v);}}return out.sort();}

  function snapshot(filters) {
    filters=filters||{};
    var c=catalog_(), matched=[];
    for(var i=0;i<c.nodes.length;i+=1) if(matchesNode_(c.nodes[i],filters)) matched.push(c.nodes[i]);
    var allowed=nodeMap_(matched), edges=[];
    for(var e=0;e<c.edges.length;e+=1){var edge=c.edges[e];if(allowed[edge.source]&&allowed[edge.target])edges.push(edge);}
    var degree={};for(var d=0;d<edges.length;d+=1){degree[edges[d].source]=(degree[edges[d].source]||0)+1;degree[edges[d].target]=(degree[edges[d].target]||0)+1;}
    matched=matched.map(function(n){var copy={};for(var k in n)if(Object.prototype.hasOwnProperty.call(n,k))copy[k]=n[k];copy.degree=degree[n.id]||0;return copy;});
    return {version:VERSION,generatedAt:new Date().toISOString(),status:'AVAILABLE',source:c.source,totalNodes:c.nodes.length,totalEdges:c.edges.length,nodeCount:matched.length,edgeCount:edges.length,nodes:matched,edges:edges,facets:{types:unique_(c.nodes.map(function(n){return n.type;})),relationships:unique_(c.edges.map(function(x){return x.type;}))},filters:filters};
  }

  function neighbors(nodeId) {
    var c=catalog_(), map=nodeMap_(c.nodes), edges=[], ids={};
    ids[nodeId]=true;
    for(var i=0;i<c.edges.length;i+=1){var edge=c.edges[i];if(edge.source===nodeId||edge.target===nodeId){edges.push(edge);ids[edge.source]=true;ids[edge.target]=true;}}
    var nodes=[];for(var id in ids)if(Object.prototype.hasOwnProperty.call(ids,id)&&map[id])nodes.push(map[id]);
    return {version:VERSION,status:'AVAILABLE',source:c.source,focusNodeId:nodeId,nodes:nodes,edges:edges,nodeCount:nodes.length,edgeCount:edges.length};
  }

  return {VERSION:VERSION,snapshot:snapshot,neighbors:neighbors};
})();

function sciipKnowledgeGraphSnapshot(filters) { return SCIIP_KNOWLEDGE_GRAPH_VIEWER.snapshot(filters || {}); }
function sciipKnowledgeGraphNeighbors(nodeId) { return SCIIP_KNOWLEDGE_GRAPH_VIEWER.neighbors(String(nodeId || '')); }
