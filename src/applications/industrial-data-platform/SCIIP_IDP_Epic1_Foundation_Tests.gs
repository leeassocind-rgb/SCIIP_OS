function sciipTestV7Epic1IndustrialDataPlatformFoundation(){
  var values=[['Property Address','City','Building SF','Land Acres','Clear Ht','APN','Latitude','Longitude'],['2125 W Lowell St','Rialto','664,859','40.2','42','0132-101-01','34.1001','-117.3801'],['18012 Slover Ave','Bloomington','300000','15','36','','','']];
  var p=SCIIP_IDP_PREVIEW_V7.preview(values,{}), failures=[];
  if(p.status!=='READY_FOR_REVIEW')failures.push('Preview not ready.'); if(p.rows!==2)failures.push('Expected 2 records.'); if(p.counts.newRecords!==2)failures.push('Expected 2 new records.'); if(!p.mapping.mapping.buildingSf)failures.push('Building SF mapping missing.'); if(p.counts.errors!==0)failures.push('Unexpected validation errors.'); if(p.counts.warnings<2)failures.push('Expected missing APN/coordinates warnings.');
  var result={framework:'SCIIP_V7_EPIC_1_INDUSTRIAL_DATA_PLATFORM_FOUNDATION',version:SCIIP_IDP_V7.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:6,failures:failures,preview:{source:p.source.sourceType,confidence:p.source.confidence,rows:p.rows,newRecords:p.counts.newRecords,warnings:p.counts.warnings,commitAllowed:p.commitAllowed}};
  Logger.log(JSON.stringify(result)); if(failures.length)throw new Error(failures.join(' | ')); return result;
}
