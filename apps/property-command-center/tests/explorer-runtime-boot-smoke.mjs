import{spawn}from'node:child_process';
import assert from'node:assert/strict';

const cwd=new URL('..',import.meta.url).pathname;
const port=5199;
const child=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(port)],{
  cwd,
  stdio:['ignore','pipe','pipe'],
  env:{...process.env,BROWSER:'none'}
});

let output='';
child.stdout.on('data',d=>output+=d.toString());
child.stderr.on('data',d=>output+=d.toString());

const wait=ms=>new Promise(r=>setTimeout(r,ms));
let ok=false;
try{
  for(let i=0;i<30;i++){
    await wait(250);
    try{
      const html=await fetch(`http://127.0.0.1:${port}/`);
      if(!html.ok)continue;
      const text=await html.text();
      assert.ok(text.includes('<div id="root">')||text.includes('id="root"'),'Root mount exists');

      const module=await fetch(`http://127.0.0.1:${port}/src/broker-product/property-explorer/v6/Explorer3.jsx`);
      assert.ok(module.ok,'Explorer3 module transforms through Vite');
      const moduleText=await module.text();
      assert.ok(moduleText.includes('governedProvenanceStatus'),'Transformed Explorer3 contains provenance recovery');
      ok=true;
      break;
    }catch{}
  }
  assert.ok(ok,`Vite runtime smoke did not become healthy.\n${output}`);
  console.log(JSON.stringify({
    framework:'SCIIP_EXPLORER_RUNTIME_BOOT_SMOKE',
    status:'PASSED',
    port,
    rootHtml:'SERVED',
    explorerModule:'TRANSFORMED'
  },null,2));
}finally{
  child.kill('SIGTERM');
}
