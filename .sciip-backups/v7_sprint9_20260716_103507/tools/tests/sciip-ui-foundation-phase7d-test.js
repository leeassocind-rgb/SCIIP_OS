#!/usr/bin/env node
'use strict';const cp=require('child_process'),path=require('path');const root=process.cwd();cp.execFileSync(process.execPath,[path.join(root,'tools/sciip-ui-certification.js')],{cwd:root,stdio:'inherit'});console.log('SCIIP UI foundation regression: PASSED');
