// DEVELOPMENT FIXTURES ONLY. DO NOT IMPORT FROM THE PRODUCTION EXPLORER RUNTIME.
// Synthetic records are intentionally isolated by the Production Data Integrity & Provenance Gate.
export const EXPLORER3_DATA_CLASSIFICATION='DEVELOPMENT_FIXTURE';
export const EXPLORER3_PROPERTIES=[
  {
    id:'P-IEW-201',address:'2125 W Lowell St',city:'Rialto',submarket:'Inland Empire West',owner:'Brookfield Properties',tenant:'—',
    buildingSf:664859,landAcres:38.2,coveragePct:40.0,clearHeightFt:42,powerAmps:8000,yearBuilt:2027,dockHighDoors:82,gradeLevelDoors:2,autoParking:265,trailerParking:398,truckCourtFt:185,sprinkler:'ESFR',zoning:'Industrial',
    status:'UNDER CONSTRUCTION',recordType:'BASE_INVENTORY',source:'DEMO',mapLayers:['base','supersheet'],askingRate:1.34,opex:0.34,availabilityDate:'Q2 2027',lat:34.1069,lng:-117.4112,
    assignment:{id:'A-BROOKFIELD',client:'Brookfield Properties',type:'LISTING'}
  },
  {
    id:'P-IEW-701',address:'10800 Slover Ave',city:'Fontana',submarket:'Inland Empire West',owner:'Institutional Owner',tenant:'Available',
    buildingSf:720000,landAcres:34.6,coveragePct:47.8,clearHeightFt:40,powerAmps:4000,yearBuilt:2024,dockHighDoors:110,gradeLevelDoors:4,autoParking:320,trailerParking:210,truckCourtFt:185,sprinkler:'ESFR',zoning:'Industrial',
    status:'AVAILABLE',recordType:'AVAILABLE',source:'DEMO',mapLayers:['available','supersheet'],askingRate:1.22,opex:0.31,availableSf:720000,divisibleSf:360000,availabilityDate:'Immediate',term:'5–10 years',lat:34.0632,lng:-117.5041
  },
  {
    id:'P-IEW-702',address:'North Rialto Distribution Center',city:'Rialto',submarket:'Inland Empire West',owner:'Institutional Owner',tenant:'—',
    buildingSf:650000,landAcres:31.5,coveragePct:47.4,clearHeightFt:40,powerAmps:4000,yearBuilt:2026,dockHighDoors:96,gradeLevelDoors:4,autoParking:280,trailerParking:180,truckCourtFt:185,sprinkler:'ESFR',zoning:'Industrial',
    status:'UNDER CONSTRUCTION',recordType:'BASE_INVENTORY',source:'CANONICAL',mapLayers:['base'],lat:34.1265,lng:-117.38
  },
  {
    id:'P-IEW-703',address:'West Lowell Industrial Land',city:'Rialto',submarket:'Inland Empire West',owner:'Brookfield Properties',tenant:'Vacant',
    buildingSf:0,landAcres:8.4,status:'VACANT',recordType:'BASE_INVENTORY',source:'CANONICAL',mapLayers:['base'],zoning:'Industrial',lat:34.1069,lng:-117.428
  },
  {
    id:'P-IEW-704',address:'1450 N Alder Ave',city:'Rialto',submarket:'Inland Empire West',owner:'Rexford Industrial',tenant:'Advanced Manufacturer',
    buildingSf:412500,landAcres:20.2,clearHeightFt:36,powerAmps:6000,yearBuilt:2019,dockHighDoors:58,gradeLevelDoors:2,autoParking:190,trailerParking:88,truckCourtFt:170,sprinkler:'ESFR',
    status:'LEASE COMP',recordType:'LEASE_COMPARABLE',source:'DEMO',mapLayers:['comparable','supersheet'],compRate:1.38,compTerm:'84 months',compDate:'Jul 2026',concessions:'2 months free',tiAllowance:'$12/SF',lat:34.1194,lng:-117.4188
  },
  {
    id:'P-IEW-705',address:'925 W Renaissance Pkwy',city:'Rialto',submarket:'Inland Empire West',owner:'Private Seller',tenant:'Logistics User',
    buildingSf:355000,landAcres:17.4,clearHeightFt:36,powerAmps:3000,yearBuilt:2017,dockHighDoors:48,gradeLevelDoors:2,autoParking:145,trailerParking:72,truckCourtFt:165,sprinkler:'ESFR',
    status:'SALE COMP',recordType:'SALE_COMPARABLE',source:'CANONICAL',mapLayers:['comparable'],salePrice:74550000,pricePerSf:210,compDate:'Jun 2026',buyer:'Institutional Buyer',seller:'Private Seller',capRate:'4.9%',lat:34.1162,lng:-117.3972
  }
];

export const EXPLORER3_RELATIONSHIPS=[
  {subjectPropertyId:'P-IEW-201',neighborPropertyId:'P-IEW-703',direction:'WEST',relationshipType:'ADJOINING',distanceFeet:0,sharedBoundaryFeet:684,bearingDegrees:270,confidence:'HIGH',evidenceIds:['PARCEL-WEST']},
  {subjectPropertyId:'P-IEW-201',neighborPropertyId:'P-IEW-704',direction:'NORTHWEST',relationshipType:'NEARBY',distanceFeet:2100,bearingDegrees:320,confidence:'HIGH',evidenceIds:['GIS-NEARBY-704']},
  {subjectPropertyId:'P-IEW-201',neighborPropertyId:'P-IEW-705',direction:'NORTHEAST',relationshipType:'NEARBY',distanceFeet:1850,bearingDegrees:45,confidence:'HIGH',evidenceIds:['GIS-NEARBY-705']}
];

export const EXPLORER3_RIBBON=[
  {id:'leases',label:'New leases',value:'3',tone:'positive',details:[
    {title:'1450 N Alder Ave',meta:'412,500 SF · $1.38 NNN · Jul 2026',propertyId:'P-IEW-704'},
    {title:'Inland Empire West lease',meta:'318,000 SF · institutional tenant'},
    {title:'Fontana logistics lease',meta:'265,000 SF · new occupancy'}
  ]},
  {id:'sales',label:'New sales',value:'1',tone:'neutral',details:[
    {title:'925 W Renaissance Pkwy',meta:'$74.55M · $210/SF · Jun 2026',propertyId:'P-IEW-705'}
  ]},
  {id:'expansions',label:'Aerospace expansions',value:'2',tone:'positive',details:[
    {title:'Advanced manufacturer expansion',meta:'Rialto · 412,500 SF',propertyId:'P-IEW-704'},
    {title:'Aerospace requirement',meta:'IE West · 250,000–400,000 SF'}
  ]},
  {id:'matches',label:'Assignment matches',value:'4',tone:'positive',details:[
    {title:'2125 W Lowell St',meta:'Brookfield listing · high-confidence match',propertyId:'P-IEW-201'},
    {title:'10800 Slover Ave',meta:'Available · 720,000 SF',propertyId:'P-IEW-701'},
    {title:'North Rialto Distribution Center',meta:'Construction · 650,000 SF',propertyId:'P-IEW-702'},
    {title:'West Lowell Industrial Land',meta:'Expansion parcel',propertyId:'P-IEW-703'}
  ]},
  {id:'power',label:'Power updates',value:'1',tone:'attention',details:[
    {title:'2125 W Lowell St',meta:'Up to 8,000 A tracked in governed property record',propertyId:'P-IEW-201'}
  ]},
  {id:'opportunities',label:'AI opportunities',value:'3',tone:'positive',details:[
    {title:'Lowell: advanced manufacturing fit',meta:'High-capacity power + institutional scale',propertyId:'P-IEW-201'},
    {title:'Slover: immediate large-block availability',meta:'720,000 SF available',propertyId:'P-IEW-701'},
    {title:'West Lowell: expansion optionality',meta:'Adjacent 8.4-acre parcel',propertyId:'P-IEW-703'}
  ]}
];
