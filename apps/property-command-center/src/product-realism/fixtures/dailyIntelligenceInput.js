export const DAILY_INTELLIGENCE_INPUT=Object.freeze({
  generatedAt:'2026-08-04T07:00:00-07:00',
  comparisonStart:'2026-08-03T07:00:00-07:00',
  comparisonEnd:'2026-08-04T07:00:00-07:00',
  selectedSubmarket:'South Bay',

  properties:Object.freeze([
    Object.freeze({
      id:'P-SB-101',submarket:'South Bay',sf:248000,clearHeightFt:32,
      available:true,askingRate:1.62,previousAskingRate:1.66,powerAmps:4000,
      status:'AVAILABLE',previousStatus:'AVAILABLE'
    }),
    Object.freeze({
      id:'P-SB-102',submarket:'South Bay',sf:315000,clearHeightFt:36,
      available:false,askingRate:1.58,previousAskingRate:1.58,powerAmps:3000,
      status:'LEASED',previousStatus:'AVAILABLE'
    }),
    Object.freeze({
      id:'P-SB-103',submarket:'South Bay',sf:182000,clearHeightFt:30,
      available:true,askingRate:1.68,previousAskingRate:1.68,powerAmps:5000,
      status:'AVAILABLE',previousStatus:'AVAILABLE'
    }),
    Object.freeze({
      id:'P-IEW-201',submarket:'Inland Empire West',sf:664859,clearHeightFt:42,
      available:true,askingRate:1.18,previousAskingRate:1.18,powerAmps:8000,
      status:'AVAILABLE',previousStatus:'AVAILABLE'
    })
  ]),

  marketStats:Object.freeze([
    Object.freeze({
      submarket:'South Bay',inventorySf:129000000,availableSf:6192000,
      previousAvailableSf:6579000,netAbsorptionSf:1100000,grossAbsorptionSf:3800000,
      askingRate:1.62,previousAskingRate:1.58,salePricePsf:284,previousSalePricePsf:269
    }),
    Object.freeze({
      submarket:'Inland Empire West',inventorySf:165000000,availableSf:12870000,
      previousAvailableSf:13200000,netAbsorptionSf:740000,grossAbsorptionSf:4200000,
      askingRate:1.18,previousAskingRate:1.16,salePricePsf:228,previousSalePricePsf:222
    })
  ]),

  comparables:Object.freeze([
    Object.freeze({
      id:'COMP-LEASE-1',submarket:'South Bay',type:'LEASE',
      closedAt:'2026-08-03T15:30:00-07:00',buildingSf:221000,clearHeightFt:32,
      rate:1.64,propertyId:'P-SB-104'
    }),
    Object.freeze({
      id:'COMP-SALE-1',submarket:'South Bay',type:'SALE',
      closedAt:'2026-08-03T16:00:00-07:00',buildingSf:195000,clearHeightFt:30,
      salePricePsf:292,propertyId:'P-SB-105'
    })
  ]),

  requirements:Object.freeze([
    Object.freeze({
      id:'REQ-AERO-1',submarket:'South Bay',createdAt:'2026-08-03T14:15:00-07:00',
      industry:'Aerospace',minSf:150000,maxSf:300000,minPowerAmps:4000,
      minClearHeightFt:30,status:'ACTIVE'
    })
  ]),

  relationships:Object.freeze([
    Object.freeze({
      id:'REL-OWNER-1',type:'OWNERSHIP_RESOLVED',
      createdAt:'2026-08-03T13:20:00-07:00',
      propertyId:'P-SB-103',companyId:'COMPANY-OWNER-7'
    })
  ]),

  assignments:Object.freeze([
    Object.freeze({
      id:'A-BROOKFIELD',name:'Brookfield Industrial',
      submarket:'Inland Empire West',propertyIds:['P-IEW-201'],
      competitorPropertyIds:['P-SB-101'],
      nextCallAt:'2026-08-06T10:00:00-07:00',
      reportSections:['Competition','Comparable Transactions','Marketing']
    }),
    Object.freeze({
      id:'A-LOWELL',name:'Lowell Logistics Center',
      submarket:'Inland Empire West',propertyIds:['P-IEW-201'],
      competitorPropertyIds:['P-SB-101'],
      nextCallAt:'2026-08-05T14:00:00-07:00',
      reportSections:['Market Summary','Competition','Recommendations']
    }),
    Object.freeze({
      id:'A-MEROLA',name:'Merola Tile Requirement',
      submarket:'South Bay',propertyIds:['P-SB-101','P-SB-103'],
      competitorPropertyIds:[],requirementIds:['REQ-AERO-1'],
      nextCallAt:'2026-08-07T09:30:00-07:00',
      reportSections:['Shortlist','Availability','Market Conditions']
    })
  ])
});
