const F=v=>Object.freeze(v);
export function validateSuperSheetProduction({sheets=[]}={}){
 const r=sheets.map(s=>{const h=s.headers||[],req=s.requiredHeaders||[],m=req.filter(x=>!h.includes(x)),passed=m.length===0&&Number(s.errorRows||0)===0;return F({sheetId:s.sheetId,name:s.name,rowCount:Number(s.rowCount||0),duplicateRows:Number(s.duplicateRows||0),errorRows:Number(s.errorRows||0),missingHeaders:F(m),passed,status:passed?'VALID':'BLOCKED'})});
 return F({sheets:F(r),total:r.length,valid:r.filter(x=>x.passed).length,blocked:r.filter(x=>!x.passed).length,totalRows:r.reduce((a,b)=>a+b.rowCount,0),duplicateSafe:true,destructiveWritesAllowed:false});
}
