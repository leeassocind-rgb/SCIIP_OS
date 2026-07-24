#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'../..'),dist=path.join(root,'dist/apps-script');if(!fs.existsSync(dist)){console.error('Compiled deployment not found: '+dist);process.exit(2)}
const files=fs.readdirSync(dist).filter(f=>f.endsWith('.gs')).sort();if(!files.length){console.error('No compiled .gs files found');process.exit(2)}
let target=files.find(f=>/^11_other_/.test(f))||files[files.length-1];target=path.join(dist,target);let text=fs.readFileSync(target,'utf8');const wrapper='function sciipTestV84RowAwareCrossEditionIdentity(){var r=SCIIP_V8_4_ROW_AWARE_CROSS_EDITION_IDENTITY.certify();Logger.log(JSON.stringify(r));return r;}';if(!text.includes('function sciipTestV84RowAwareCrossEditionIdentity'))fs.appendFileSync(target,'\n'+wrapper+'\n');console.log(JSON.stringify({framework:'SCIIP_V8_4_ROW_AWARE_CROSS_EDITION_IDENTITY_COMPILED_PATCH',status:'PASSED',target,wrapperPresent:true}));
