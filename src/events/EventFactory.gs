/* ==========================================================
   SCIIP_OS
   Module: Events
   File: EventFactory.gs

   Purpose:
   Creates canonical SCIIP events.

   All events should be generated through
   the Event Factory.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Canonical SCIIP event types.
 */
const SCIIP_EVENT_TYPES = {

  ASSET_CREATED:
    'ASSET_CREATED',

  ASSET_UPDATED:
    'ASSET_UPDATED',

  ASSET_MERGED:
    'ASSET_MERGED',

  CANDIDATE_CREATED:
    'CANDIDATE_CREATED',

  ALIAS_CREATED:
    'ALIAS_CREATED',

  GRAPH_NODE_CREATED:
    'GRAPH_NODE_CREATED',

  GRAPH_EDGE_CREATED:
    'GRAPH_EDGE_CREATED',

  PROPERTY_OBSERVED:
    'PROPERTY_OBSERVED'
};

/**
 * Creates a canonical event.
 *
 * @param {string} eventType
 * @param {Object} payload
 * @returns {Object}
 */
function sciipCreateEvent(
  eventType,
  payload
) {
  sciipValidateEventType(
    eventType
  );

  const data = payload || {};

  return {
    eventId:
      'EVENT_' +
      sciipUuid()
        .replace(/-/g, '')
        .substring(0, 16)
        .toUpperCase(),

    eventType:
      eventType,

    assetId:
      data.assetId || '',

    businessKey:
      data.businessKey || '',

    source:
      data.source || 'SCIIP',

    payload:
      data,

    createdAt:
      sciipNowIso()
  };
}

/**
 * Creates and records an event.
 *
 * @param {string} eventType
 * @param {Object} payload
 * @returns {Object}
 */
function sciipCreateAndRecordEvent(
  eventType,
  payload
) {
  const event =
    sciipCreateEvent(
      eventType,
      payload
    );

  sciipRecordEvent(
    event
  );

  return event;
}

/**
 * Validates event type.
 *
 * @param {string} eventType
 */
function sciipValidateEventType(
  eventType
) {
  if (
    !Object.values(
      SCIIP_EVENT_TYPES
    ).includes(eventType)
  ) {
    throw new Error(
      'Invalid Event Type: ' +
      eventType
    );
  }
}

/**
 * Returns all event types.
 *
 * @returns {Object}
 */
function sciipGetEventTypes() {
  return SCIIP_EVENT_TYPES;
}

/**
 * Returns event factory stats.
 *
 * @returns {Object}
 */
function sciipEventFactoryStats() {
  return {
    eventTypes:
      Object.keys(
        SCIIP_EVENT_TYPES
      ).length,

    generatedAt:
      sciipNowIso()
  };
}