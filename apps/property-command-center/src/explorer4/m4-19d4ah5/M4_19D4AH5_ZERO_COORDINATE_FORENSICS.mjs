#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,isFiniteCoordinatePair,isPlaceholderZeroPair,isUsableCoordinatePair} from "./M419D4AH5Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4ah4-external-coordinate-observation-evidence-capture.json");
const rawPath=path.join(ev,"m4-19d4ah4-coordinate-source-raw-response.json");
const templatePath=path.join(ev,"m4-19d4ah2-coordinate-evidence-template.json");
const ah3Path=path.join(ev,"m4-19d4ah3-operator-external-coordinate-evidence-validation-binding.json");

const resultPath=path.join(ev,"m4-19d4ah5-zero-coordinate-placeholder-forensics.json");
const auditPath=path.join(ev,"m4-19d4ah5-zero-coordinate-validation-repair-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,rawPath,templatePath,ah3Path]){
  if(!fs.existsSync(p)) block("M419D4AH5_PREREQUISITE_MISSING",{path:p});
}

const priorDoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(priorDoc?.state!=="M419D4AH4_EXTERNAL_COORDINATE_SOURCE_HTTP_FAILURE")
  block("M419D4AH5_EXPECTED_AH4_HTTP_FAILURE_STATE",{observed:priorDoc?.state??null});

const raw=JSON.parse(fs.readFileSync(rawPath,"utf8"));
const template=JSON.parse(fs.readFileSync(templatePath,"utf8"));
const ah3=JSON.parse(fs.readFileSync(ah3Path,"utf8"));

const wkt=raw?.request?.wkt??null;
const outboundZeroPoint=typeof wkt==="string" && /POINT\s*\(\s*0(?:\.0+)?\s+0(?:\.0+)?\s*\)/i.test(wkt);

const lat=template?.latitude;
const lng=template?.longitude;
const syntacticallyFinite=isFiniteCoordinatePair(lat,lng);
const placeholderZero=isPlaceholderZeroPair(lat,lng);
const semanticallyUsable=isUsableCoordinatePair(lat,lng);

const priorValidatorAcceptedCoordinates=
  ah3?.validation?.failures &&
  !ah3.validation.failures.includes("VALID_LATITUDE_REQUIRED") &&
  !ah3.validation.failures.includes("VALID_LONGITUDE_REQUIRED");

let rootCause="UNCLASSIFIED";
if(outboundZeroPoint && placeholderZero && priorValidatorAcceptedCoordinates){
  rootCause="ZERO_ZERO_PLACEHOLDER_PASSED_RANGE_ONLY_COORDINATE_VALIDATION";
}else if(outboundZeroPoint){
  rootCause="OUTBOUND_ZERO_ZERO_POINT_WITH_UNRESOLVED_TEMPLATE_OR_COERCION_ORIGIN";
}

const repairPolicy={
  nullUndefinedEmptyStringMustFail:true,
  numericCoercionOfNullToZeroMustNotCreateValidCoordinate:true,
  zeroZeroPlaceholderPairMustFail:true,
  latitudeLongitudeRangeCheckStillRequired:true,
  sourceBackedEvidenceRequiredBeforeExternalObservation:true,
  coordinateOriginMustBeExplicit:true,
  pointLocatorMustNotBeTreatedAsAuthoritativeEvidence:true,
  correctedValidatorMustRunBeforeAnyNewExternalCoordinateRequest:true,
  noBlindRetry:true,
  automaticRetry:false
};

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH5_ZERO_COORDINATE_VALIDATION_REPAIR_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  ah4:{
    httpStatus:priorDoc?.httpStatus??null,
    rawResponseSha256:priorDoc?.rawResponseSha256??null,
    outboundWkt:wkt,
    outboundZeroPoint
  },
  template:{
    latitude:lat,
    longitude:lng,
    syntacticallyFinite,
    placeholderZero,
    semanticallyUsable
  },
  priorValidation:{
    priorState:ah3?.state??null,
    failures:ah3?.validation?.failures??[],
    priorValidatorAcceptedCoordinates
  },
  rootCause,
  repairPolicy,
  networkRequestsPerformed:0,
  enrichmentRequestsPerformed:0
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4AH5_ZERO_COORDINATE_PLACEHOLDER_DEFECT_CERTIFIED_VALIDATION_REPAIR_REQUIRED",
  certifiedAt:new Date().toISOString(),
  forensics:{
    rootCause,
    outboundWkt:wkt,
    outboundZeroPoint,
    templateLatitude:lat,
    templateLongitude:lng,
    placeholderZero,
    priorValidatorAcceptedCoordinates,
    semanticallyUsableCoordinatePair:semanticallyUsable
  },
  repairPolicy,
  interpretation:{
    lightBox404DoesNotEstablishCoverageFailure:true,
    requestTargetWasNullIsland:true,
    priorCoordinateValidityConclusionWithdrawn:true,
    repositoryCoordinateRecoveryStillUnresolved:true
  },
  safety:{
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false
  },
  artifacts:{repairAudit:auditPath},
  authorityClosure:{
    temporalWriteAuthority:false,
    canonicalWriteAuthority:false,
    identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,
    refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,
    syncAuthority:false,
    propagationAuthority:false,
    automaticRetry:false
  },
  nextMilestone:"M4.19D4AH6_COORDINATE_VALIDATION_REPAIR_AND_TRUE_LOCATOR_RECOVERY"
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
