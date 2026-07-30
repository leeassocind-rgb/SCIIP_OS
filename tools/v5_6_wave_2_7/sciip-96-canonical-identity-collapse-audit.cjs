'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,key,tokens,jaccard,first,num,root,prior,load,canonicalText,evidenceIndex,resolve,report}=require('./sciip-v5-6-wave-2-7-common.cjs');
const FRAMEWORK='SCIIP_V5_6_CANONICAL_IDENTITY_COLLAPSE_AUDIT',VERSION='196.96.0';
function run(repo){
const reg=readJson(path.join(repo,'reports','release-5.6','wave-2.6','canonical-property-registry.json'),{properties:[]});
const suspicious=reg.properties.filter(x=>num(x.aliasCount,0)>10).map(x=>({canonicalPropertyId:x.canonicalPropertyId,address:x.address,city:x.city,aliasCount:x.aliasCount,sourcePropertyIds:x.sourcePropertyIds||[]}));
writeJson(path.join(root(repo),'canonical-identity-collapse-review.json'),{generatedAt:now(),queue:suspicious});
return report(FRAMEWORK,VERSION,{canonicalProperties:reg.properties.length,suspiciousCollapseGroups:suspicious.length,thresholdAliases:10,humanReviewRequired:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(root(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
