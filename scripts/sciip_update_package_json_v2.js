const fs=require('fs');const p='package.json';const j=JSON.parse(fs.readFileSync(p));j.scripts=j.scripts||{};
j.scripts['deployment:compile']='node tools/sciip-deployment-compiler-v2.js';
j.scripts['deployment:compile:full']='node tools/sciip-deployment-compiler-v2.js --force';
j.scripts['deployment:compile:test']='node tools/tests/sciip-deployment-compiler-v2-test.js';
j.scripts['deployment:push']='bash scripts/sciip_deploy_compiled_v2.sh';
fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');
