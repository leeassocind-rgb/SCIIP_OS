"use strict";

/**
 * SCIIP ILE Sprint 7 — Corpus Validation Framework
 * Runs deterministic differential validation over legacy and ILE evidence.
 */

const { compareEvidence, deepFreeze, stableObject } =
  require("./sciip-ile-integration-adapter");

const VERSION = "ile-v1.0.0-sprint7.0";

function safeDivide(numerator, denominator) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function validateCorpus(cases, options = {}) {
  if (!Array.isArray(cases)) throw new TypeError("Corpus cases must be an array.");

  const caseResults = cases.map((testCase, index) => {
    if (!testCase || typeof testCase !== "object") {
      throw new TypeError(`Corpus case ${index} must be an object.`);
    }

    const comparison = compareEvidence(
      testCase.legacyEvidence || [],
      testCase.ileEvidence || []
    );

    return stableObject({
      caseId: testCase.caseId || `CASE-${index + 1}`,
      documentId: testCase.documentId || null,
      comparison,
      expectedConcepts: [...(testCase.expectedConcepts || [])].sort(),
      metadata: stableObject(testCase.metadata || {})
    });
  });

  const totals = caseResults.reduce((out, item) => {
    const s = item.comparison.summary;
    out.match += s.MATCH || 0;
    out.mismatch += s.MISMATCH || 0;
    out.ileOnly += s.ILE_ONLY || 0;
    out.legacyOnly += s.LEGACY_ONLY || 0;
    out.comparisons += item.comparison.comparisons.length;
    if (item.comparison.reviewRequired) out.reviewCases += 1;
    return out;
  }, {
    cases: caseResults.length,
    comparisons: 0,
    match: 0,
    mismatch: 0,
    ileOnly: 0,
    legacyOnly: 0,
    reviewCases: 0
  });

  const metrics = {
    agreementRate: safeDivide(totals.match, totals.comparisons),
    mismatchRate: safeDivide(totals.mismatch, totals.comparisons),
    ileExpansionRate: safeDivide(totals.ileOnly, totals.comparisons),
    legacyOnlyRate: safeDivide(totals.legacyOnly, totals.comparisons),
    reviewCaseRate: safeDivide(totals.reviewCases, totals.cases)
  };

  const thresholds = {
    minimumAgreementRate: Number(options.minimumAgreementRate ?? 0),
    maximumMismatchRate: Number(options.maximumMismatchRate ?? 1)
  };

  const passed =
    metrics.agreementRate >= thresholds.minimumAgreementRate &&
    metrics.mismatchRate <= thresholds.maximumMismatchRate;

  return deepFreeze(stableObject({
    version: VERSION,
    status: passed ? "PASSED" : "FAILED",
    caseResults,
    totals,
    metrics,
    thresholds,
    governance: {
      diagnosticOnly: true,
      deterministic: true,
      corpusMutation: false,
      productionWrites: 0,
      existingParserAuthoritative: true
    }
  }));
}

function conceptMetrics(report) {
  if (!report || !Array.isArray(report.caseResults)) {
    throw new TypeError("A corpus validation report is required.");
  }

  const map = new Map();
  for (const testCase of report.caseResults) {
    for (const item of testCase.comparison.comparisons) {
      if (!map.has(item.concept)) {
        map.set(item.concept, {
          concept: item.concept,
          total: 0,
          match: 0,
          mismatch: 0,
          ileOnly: 0,
          legacyOnly: 0
        });
      }
      const row = map.get(item.concept);
      row.total += 1;
      if (item.status === "MATCH") row.match += 1;
      if (item.status === "MISMATCH") row.mismatch += 1;
      if (item.status === "ILE_ONLY") row.ileOnly += 1;
      if (item.status === "LEGACY_ONLY") row.legacyOnly += 1;
    }
  }

  return deepFreeze([...map.values()]
    .map(row => ({
      ...row,
      agreementRate: safeDivide(row.match, row.total)
    }))
    .sort((a, b) => a.concept.localeCompare(b.concept)));
}

module.exports = Object.freeze({
  VERSION,
  safeDivide,
  validateCorpus,
  conceptMetrics
});
