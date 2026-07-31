import {evaluateExecutiveConstraints} from './executiveConstraintEvaluator.js';
import {calculateEvidenceStrength,normalizeRecommendationEvidence} from './executiveRecommendationEvidence.js';
const clamp=n=>Math.max(0,Math.min(100,Math.round(n*100)/100));
export function analyzeExecutiveAlternative(alternative={},constraints={}){
  const constraint=evaluateExecutiveConstraints(alternative,constraints); const evidence=normalizeRecommendationEvidence(alternative.evidence||[]); const strength=calculateEvidenceStrength(evidence);
  const benefit=Number(alternative.expectedBenefitScore||0), risk=Number(alternative.riskScore||0), confidence=strength.averageConfidence*100;
  const utility=clamp(benefit*.55+(100-risk)*.25+confidence*.2-(constraint.feasible?0:40));
  return Object.freeze({...alternative,evidence,constraint,evidenceStrength:strength,utilityScore:utility,eligible:constraint.feasible&&evidence.length>0});
}
export function analyzeExecutiveAlternatives(alternatives=[],constraints={}){return Object.freeze(alternatives.map(row=>analyzeExecutiveAlternative(row,constraints)));}
