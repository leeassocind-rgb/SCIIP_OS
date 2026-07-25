/** SCIIP_OS v7.0 Property Explorer Alpha */
var SCIIP_PROPERTY_EXPLORER = (function () {
  'use strict';

  var VERSION = 'v7.0-alpha.1';
  var MAX_RESULTS = 100;
  var REGISTRY_SHEETS = ['PROPERTY_REGISTRY', 'PROPERTY_CURRENT', 'ASSET_REGISTRY'];
  var FALLBACK_PROPERTIES = [
    {propertyId:'PROP-RIALTO-2125-LOWELL',address:'2125 W Lowell St',city:'Rialto',state:'CA',propertyType:'Industrial',buildingSf:664859,landAcres:39.89,clearHeight:42,dockHigh:82,powerAmps:4000,status:'Planned',latitude:34.1063,longitude:-117.4103,source:'CERTIFIED_FALLBACK'},
    {propertyId:'PROP-SB-2765-LEXINGTON',address:'2765 Lexington Way',city:'San Bernardino',state:'CA',propertyType:'Industrial',buildingSf:129850,landAcres:18.34,clearHeight:18,dockHigh:34,powerAmps:3000,status:'Existing',latitude:34.0828,longitude:-117.3107,source:'CERTIFIED_FALLBACK'},
    {propertyId:'PROP-LB-2400-ARTESIA',address:'2400 E Artesia Blvd',city:'Long Beach',state:'CA',propertyType:'Industrial',buildingSf:415312,landAcres:17.23,clearHeight:36,dockHigh:53,powerAmps:2000,status:'Existing',latitude:33.8733,longitude:-118.1647,source:'CERTIFIED_FALLBACK'},
    {propertyId:'PROP-IRWINDALE-5517-AYON',address:'5517 Ayon Ave',city:'Irwindale',state:'CA',propertyType:'Industrial Land',buildingSf:0,landAcres:1.66,clearHeight:0,dockHigh:0,powerAmps:0,status:'Land',latitude:34.1067,longitude:-117.9382,source:'CERTIFIED_FALLBACK'},
    {propertyId:'PROP-PERRIS-20123-HARVILL',address:'20123 Harvill Ave',city:'Perris',state:'CA',propertyType:'Industrial',buildingSf:0,landAcres:0,clearHeight:0,dockHigh:0,powerAmps:0,status:'Pending Comparable',latitude:33.8466,longitude:-117.2582,source:'CERTIFIED_FALLBACK'}
  ];

  function safe_(fn, fallback) {
    try { return fn(); } catch (error) { return typeof fallback === 'function' ? fallback(error) : fallback; }
  }

  function normalizeHeader_(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function value_(row, index, aliases, fallback) {
    for (var i = 0; i < aliases.length; i += 1) {
      var key = normalizeHeader_(aliases[i]);
      if (Object.prototype.hasOwnProperty.call(index, key)) {
        var cell = row[index[key]];
        if (cell !== '' && cell !== null && typeof cell !== 'undefined') return cell;
      }
    }
    return fallback;
  }

  function number_(value) {
    if (typeof value === 'number') return isFinite(value) ? value : 0;
    var parsed = Number(String(value || '').replace(/[$,%\s,]/g, ''));
    return isFinite(parsed) ? parsed : 0;
  }

  function fromSheet_() {
    return safe_(function () {
      if (typeof SpreadsheetApp === 'undefined') return null;
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (!ss) return null;
      var sheet = null;
      for (var i = 0; i < REGISTRY_SHEETS.length; i += 1) {
        sheet = ss.getSheetByName(REGISTRY_SHEETS[i]);
        if (sheet) break;
      }
      if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 1) return null;
      var values = sheet.getDataRange().getValues();
      var headers = values[0];
      var index = {};
      for (var h = 0; h < headers.length; h += 1) index[normalizeHeader_(headers[h])] = h;
      var rows = [];
      for (var r = 1; r < values.length && rows.length < 5000; r += 1) {
        var row = values[r];
        var address = value_(row,index,['Address','Property Address','Site Address'],'');
        var city = value_(row,index,['City'],'');
        if (!address && !city) continue;
        rows.push({
          propertyId:String(value_(row,index,['Property ID','Property_ID','Asset ID','Building ID'],'PROP-'+r)),
          address:String(address), city:String(city), state:String(value_(row,index,['State'],'CA')),
          propertyType:String(value_(row,index,['Property Type','Asset Type','Type'],'Industrial')),
          buildingSf:number_(value_(row,index,['Building SF','Building_SF','Available SF','SF'],0)),
          landAcres:number_(value_(row,index,['Land Acres','Acres','Lot Acres'],0)),
          clearHeight:number_(value_(row,index,['Clear Ht','Clear Height'],0)),
          dockHigh:number_(value_(row,index,['DH','Dock High','Dock Doors'],0)),
          powerAmps:number_(value_(row,index,['Power Amps','Power','Amps'],0)),
          status:String(value_(row,index,['Status'],'Unknown')),
          latitude:number_(value_(row,index,['Latitude','Lat'],0)),
          longitude:number_(value_(row,index,['Longitude','Lng','Lon'],0)),
          source:'SPREADSHEET:'+sheet.getName()
        });
      }
      return rows.length ? {records:rows, source:'SPREADSHEET:'+sheet.getName()} : null;
    }, null);
  }

  function catalog_() {
    var live = fromSheet_();
    if (live) return live;
    return {records:FALLBACK_PROPERTIES.slice(), source:'CERTIFIED_FALLBACK'};
  }

  function matches_(property, filters) {
    filters = filters || {};
    var query = String(filters.query || '').toLowerCase().trim();
    if (query) {
      var haystack = [property.propertyId,property.address,property.city,property.state,property.propertyType,property.status].join(' ').toLowerCase();
      if (haystack.indexOf(query) === -1) return false;
    }
    if (filters.city && String(property.city).toLowerCase() !== String(filters.city).toLowerCase()) return false;
    if (filters.status && String(property.status).toLowerCase() !== String(filters.status).toLowerCase()) return false;
    if (number_(filters.minSf) && property.buildingSf < number_(filters.minSf)) return false;
    if (number_(filters.minAcres) && property.landAcres < number_(filters.minAcres)) return false;
    return true;
  }

  function facets_(records) {
    var cities = {}, statuses = {};
    for (var i = 0; i < records.length; i += 1) {
      if (records[i].city) cities[records[i].city] = true;
      if (records[i].status) statuses[records[i].status] = true;
    }
    return {cities:Object.keys(cities).sort(), statuses:Object.keys(statuses).sort()};
  }

  function search(filters) {
    var catalog = catalog_();
    var matched = [];
    for (var i = 0; i < catalog.records.length && matched.length < MAX_RESULTS; i += 1) {
      if (matches_(catalog.records[i], filters || {})) matched.push(catalog.records[i]);
    }
    return {
      version:VERSION,
      generatedAt:new Date().toISOString(),
      status:'AVAILABLE',
      source:catalog.source,
      totalCatalog:catalog.records.length,
      resultCount:matched.length,
      results:matched,
      facets:facets_(catalog.records),
      mapReady:matched.filter(function (p) { return p.latitude && p.longitude; }).length,
      filters:filters || {}
    };
  }

  function snapshot() { return search({}); }

  return {VERSION:VERSION, snapshot:snapshot, search:search};
})();

function sciipPropertyExplorerSnapshot() { return SCIIP_PROPERTY_EXPLORER.snapshot(); }
function sciipPropertyExplorerSearch(filters) { return SCIIP_PROPERTY_EXPLORER.search(filters || {}); }
