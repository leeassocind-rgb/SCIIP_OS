/** SCIIP_OS v7 — Epic 1 Industrial Data Platform. */
var SCIIP_IDP_V7 = SCIIP_IDP_V7 || {};
SCIIP_IDP_V7.VERSION = 'v7.0-epic1-foundation.0';
SCIIP_IDP_V7.SCHEMA = {
  PROPERTY: {
    required: ['address','city'],
    fields: ['address','city','state','zip','apn','buildingSf','availableSf','landAcres','clearHeight','dockHigh','gradeLevel','powerAmps','askingRate','salePrice','status','dealType','owner','tenant','latitude','longitude','source','notes']
  }
};
SCIIP_IDP_V7.ALIASES = {
  address:['address','property address','street address','site address'], city:['city','municipality'], state:['state','st'], zip:['zip','zipcode','zip code','postal code'], apn:['apn','parcel','parcel number'],
  buildingSf:['building sf','building size','building square feet','total sf'], availableSf:['available sf','availability sf','vacant sf'], landAcres:['land acres','acres','site acres'], clearHeight:['clear height','clear ht','clear'], dockHigh:['dock high','dh','dock doors'], gradeLevel:['grade level','gl','gl doors'], powerAmps:['power amps','amps','power'], askingRate:['rate','asking rate','lease rate'], salePrice:['sale price','price'], status:['status','availability status'], dealType:['deal type','transaction type'], owner:['owner','ownership'], tenant:['tenant','occupant'], latitude:['latitude','lat'], longitude:['longitude','lng','lon'], source:['source','data source'], notes:['notes','comments','remarks']
};
