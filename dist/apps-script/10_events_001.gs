/** SCIIP_OS compiled bundle: 10_events_001.gs
 * sources: 2
 * generated: 2026-07-17T18:43:23.227Z
 */
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
 * Event type validation and enumeration are provided by
 * src/config/SCIIP_VOCABULARY.gs.
 */

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

/* ==========================================================
   SCIIP_OS
   Module: Events
   File: EventStore.gs

   Purpose:
   SCIIP Event Store

   SCIIP is event sourced.

   Nothing is overwritten.

   Every observation becomes an event.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_EVENT_SHEET =
  'PROPERTY_EVENTS';

/**
 * Returns event sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function sciipGetEventSheet() {
  return sciipGetOrCreateSheet(
    SCIIP_EVENT_SHEET
  );
}

/**
 * Initializes event store.
 */
function sciipInitializeEventStore() {
  const sheet =
    sciipGetEventSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Event_ID',
    'Event_Type',
    'Asset_ID',
    'Business_Key',
    'Source',
    'Payload',
    'Created_At'
  ]);
}

/**
 * Records an event.
 *
 * @param {Object} event
 * @returns {Object}
 */
function sciipRecordEvent(event) {
  sciipInitializeEventStore();

  const eventId =
    event.eventId ||
    ('EVENT_' +
      sciipUuid()
        .replace(/-/g, '')
        .substring(0, 16)
        .toUpperCase());

  sciipAppendRow(
    SCIIP_EVENT_SHEET,
    [
      eventId,
      event.eventType,
      event.assetId || '',
      event.businessKey || '',
      event.source || 'SCIIP',
      sciipSafeJson(
        event.payload || {}
      ),
      sciipNowIso()
    ]
  );

  return {
    eventId: eventId,
    eventType: event.eventType,
    assetId: event.assetId || '',
    createdAt: sciipNowIso()
  };
}

/**
 * Returns events for an asset.
 *
 * @param {string} assetId
 * @returns {Array}
 */
function sciipGetAssetEvents(
  assetId
) {
  const rows =
    sciipGetSheetValues(
      SCIIP_EVENT_SHEET
    );

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];

  const assetIndex =
    headers.indexOf(
      'Asset_ID'
    );

  return rows
    .slice(1)
    .filter(function(row) {
      return (
        row[assetIndex] ===
        assetId
      );
    })
    .map(function(row) {

      const obj = {};

      headers.forEach(
        function(header, index) {
          obj[header] =
            row[index];
        }
      );

      return obj;
    });
}

/**
 * Returns event store stats.
 *
 * @returns {Object}
 */
function sciipEventStoreStats() {
  const rows =
    sciipGetSheetValues(
      SCIIP_EVENT_SHEET
    );

  return {
    eventCount:
      rows.length > 0
        ? rows.length - 1
        : 0,
    generatedAt:
      sciipNowIso()
  };
}