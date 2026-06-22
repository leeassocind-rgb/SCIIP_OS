/* ==========================================================
   SCIIP_OS
   Module: Events
   File: EventFactory.gs

   Purpose:
   Creates canonical SCIIP events.

   All events should be generated through
   the Event Factory.

   Event vocabulary is governed by:

   SCIIP.VOCABULARY.EVENT_TYPES

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

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

  const data =
    payload || {};

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
 * Uses centralized vocabulary registry.
 *
 * @param {string} eventType
 */
function sciipValidateEventType(
  eventType
) {

  if (
    !Object.values(
      SCIIP.VOCABULARY.EVENT_TYPES
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

  return SCIIP.VOCABULARY.EVENT_TYPES;
}

/**
 * Returns event factory statistics.
 *
 * @returns {Object}
 */
function sciipEventFactoryStats() {

  return {

    eventTypes:
      Object.keys(
        SCIIP.VOCABULARY.EVENT_TYPES
      ).length,

    generatedAt:
      sciipNowIso()
  };
}