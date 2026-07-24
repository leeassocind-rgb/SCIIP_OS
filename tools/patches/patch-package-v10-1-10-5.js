#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');const root=process.argv[2]||process.cwd(),p=path.join(root,'package.json');if(!fs.existsSync(p))process.exit(0);const j=JSON.parse(fs.readFileSync(p,'utf8'));j.scripts=j.scripts||{};j.scripts['sciip:v10.1-10.5:certify']='node tools/platform/sciip-v10-1-10-5-enterprise-application-integration.js';fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');
