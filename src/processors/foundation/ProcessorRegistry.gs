/* ==========================================================
   SCIIP_OS
   Module: Processors
   File: ProcessorRegistry.gs

   Purpose:
   Registers SCIIP processors and controls processor execution order.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Canonical processor registry.
 *
 * Processors are intentionally registered by name first.
 * Implementations may be added progressively during migration.
 */
const SCIIP_PROCESSOR_REGISTRY = [
  {
    id: 'PROPERTY_CANDIDATE_PROCESSOR',
    name: 'Property Candidate Processor',
    module: 'processors',
    functionName: 'sciipRunPropertyCandidateProcessor',
    enabled: true,
    order: 60
  },
  {
    id: 'ASSET_TIMELINE_PROCESSOR',
    name: 'Asset Timeline Processor',
    module: 'processors',
    functionName: 'sciipRunAssetTimelineProcessor',
    enabled: true,
    order: 61
  },
  {
    id: 'PARCEL_PROCESSOR',
    name: 'Parcel Processor',
    module: 'processors',
    functionName: 'sciipRunParcelProcessor',
    enabled: true,
    order: 62
  },
  {
    id: 'CAMPUS_PROCESSOR',
    name: 'Campus Processor',
    module: 'processors',
    functionName: 'sciipRunCampusProcessor',
    enabled: true,
    order: 63
  },
  {
    id: 'ALIAS_PROCESSOR',
    name: 'Alias Processor',
    module: 'identity',
    functionName: 'sciipRunAliasProcessor',
    enabled: true,
    order: 64
  },
  {
    id: 'LAND_PROCESSOR',
    name: 'Land Processor',
    module: 'processors',
    functionName: 'sciipRunLandProcessor',
    enabled: true,
    order: 65
  },
  {
    id: 'MANUAL_REVIEW_PROCESSOR',
    name: 'Manual Review Processor',
    module: 'processors',
    functionName: 'sciipRunManualReviewProcessor',
    enabled: true,
    order: 66
  },
  {
    id: 'DASHBOARD_PROCESSOR',
    name: 'Dashboard Processor',
    module: 'dashboard',
    functionName: 'sciipRunDashboardProcessor',
    enabled: true,
    order: 67
  }
];

/**
 * Returns all registered processors in execution order.
 *
 * @returns {Object[]}
 */
function sciipGetProcessorRegistry() {
  return SCIIP_PROCESSOR_REGISTRY
    .slice()
    .sort(function(a, b) {
      return Number(a.order || 0) - Number(b.order || 0);
    });
}

/**
 * Returns enabled processors only.
 *
 * @returns {Object[]}
 */
function sciipGetEnabledProcessors() {
  return sciipGetProcessorRegistry().filter(function(processor) {
    return processor.enabled === true;
  });
}

/**
 * Finds a processor by ID.
 *
 * @param {string} processorId
 * @returns {Object|null}
 */
function sciipGetProcessorById(processorId) {
  const normalizedId = sciipNormalizeRuntimeToken(processorId);

  const matches = sciipGetProcessorRegistry().filter(function(processor) {
    return processor.id === normalizedId;
  });

  return matches.length ? matches[0] : null;
}

/**
 * Runs all enabled processors that currently exist in the runtime.
 *
 * Missing processor implementations are skipped safely during migration.
 *
 * @param {Object=} context
 * @returns {Object[]}
 */
function sciipRunEnabledProcessors(context) {
  const runtimeContext = context || sciipCreateRuntimeContext();
  const results = [];

  sciipGetEnabledProcessors().forEach(function(processor) {
    results.push(sciipRunProcessor(processor.id, runtimeContext));
  });

  return results;
}

/**
 * Runs a single processor by ID.
 *
 * @param {string} processorId
 * @param {Object=} context
 * @returns {Object}
 */
function sciipRunProcessor(processorId, context) {
  const processor = sciipGetProcessorById(processorId);
  const startedAt = sciipNowIso();

  if (!processor) {
    return {
      processorId: processorId,
      status: 'NOT_FOUND',
      startedAt: startedAt,
      completedAt: sciipNowIso(),
      message: 'Processor is not registered.'
    };
  }

  const fn = this[processor.functionName];

  if (typeof fn !== 'function') {
    return {
      processorId: processor.id,
      processorName: processor.name,
      status: 'SKIPPED',
      startedAt: startedAt,
      completedAt: sciipNowIso(),
      message: 'Processor function is not implemented yet: ' + processor.functionName
    };
  }

  try {
    const result = fn(context || sciipCreateRuntimeContext());

    return {
      processorId: processor.id,
      processorName: processor.name,
      status: 'SUCCESS',
      startedAt: startedAt,
      completedAt: sciipNowIso(),
      result: result || null
    };
  } catch (error) {
    return {
      processorId: processor.id,
      processorName: processor.name,
      status: 'ERROR',
      startedAt: startedAt,
      completedAt: sciipNowIso(),
      error: String(error && error.stack ? error.stack : error)
    };
  }
}