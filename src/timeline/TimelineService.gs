/* ==========================================================
   SCIIP_OS
   Module: Timeline
   File: TimelineService.gs

   Purpose:
   Builds and maintains SCIIP Asset Timelines.

   Asset timelines are generated from the Event Store.

   Nothing is overwritten.

   Everything becomes history.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_TIMELINE_SHEET =
  'ASSET_TIMELINE';

/**
 * Returns timeline sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function sciipGetTimelineSheet() {
  return sciipGetOrCreateSheet(
    SCIIP_TIMELINE_SHEET
  );
}

/**
 * Initializes timeline table.
 */
function sciipInitializeTimelineSheet() {
  const sheet =
    sciipGetTimelineSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Timeline_ID',
    'Asset_ID',
    'Event_ID',
    'Event_Type',
    'Summary',
    'Created_At'
  ]);
}

/**
 * Appends an event to an asset timeline.
 *
 * @param {Object} event
 * @returns {Object}
 */
function sciipTimelineAppend(
  event
) {
  sciipInitializeTimelineSheet();

  const timelineId =
    'TIMELINE_' +
    sciipUuid()
      .replace(/-/g, '')
      .substring(0, 16)
      .toUpperCase();

  const summary =
    sciipBuildTimelineSummary(
      event
    );

  sciipAppendRow(
    SCIIP_TIMELINE_SHEET,
    [
      timelineId,
      event.assetId || '',
      event.eventId || '',
      event.eventType || '',
      summary,
      sciipNowIso()
    ]
  );

  return {
    timelineId:
      timelineId,
    assetId:
      event.assetId,
    eventId:
      event.eventId
  };
}

/**
 * Creates a timeline summary.
 *
 * @param {Object} event
 * @returns {string}
 */
function sciipBuildTimelineSummary(
  event
) {
  return [
    event.eventType,
    event.assetId || ''
  ].join(' | ');
}

/**
 * Returns all timeline records
 * for an asset.
 *
 * @param {string} assetId
 * @returns {Array}
 */
function sciipGetAssetTimeline(
  assetId
) {
  const rows =
    sciipGetSheetValues(
      SCIIP_TIMELINE_SHEET
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
 * Rebuilds a timeline from events.
 *
 * Placeholder implementation.
 *
 * @param {string} assetId
 * @returns {Object}
 */
function sciipRebuildTimeline(
  assetId
) {
  const events =
    sciipGetAssetEvents(
      assetId
    );

  return {
    assetId:
      assetId,
    eventCount:
      events.length,
    status:
      'REBUILD_PENDING'
  };
}

/**
 * Timeline statistics.
 *
 * @returns {Object}
 */
function sciipTimelineStats() {
  const rows =
    sciipGetSheetValues(
      SCIIP_TIMELINE_SHEET
    );

  return {
    timelineRecords:
      rows.length > 0
        ? rows.length - 1
        : 0,

    generatedAt:
      sciipNowIso()
  };
}