/************************************************************
 * 320_BriefingDigestProcessor.gs
 * SCIIP_OS v5.3.2 Runtime Migration
 *
 * Purpose:
 * Consolidate individual intelligence briefings into one digest.
 *
 * Migrated to:
 * - SCIIP_RuntimeProcessorBase
 * - SCIIP_RuntimePayloadFactory
 * - SCIIP_RuntimeResultFactory
 * - SCIIP_RuntimeSheetFactory
 * - SCIIP_RuntimeLogging
 ************************************************************/

const SCIIP_BRIEFING_DIGEST_PROCESSOR = '320_BriefingDigestProcessor';
const SCIIP_BRIEFING_DIGEST_SHEET = 'BRIEFING_DIGEST';
const SCIIP_BRIEFING_SOURCE_SHEET = 'INTELLIGENCE_BRIEFING';

const SCIIP_BRIEFING_DIGEST_HEADERS = [
  'Digest_ID',
  'Business_Key',
  'Digest_Date',
  'Digest_Type',
  'Digest_Title',
  'Digest_Text',
  'Briefing_Count',
  'Forecast_Count',
  'Opportunity_Count',
  'Open_Action_Count',
  'Critical_Count',
  'High_Count',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunBriefingDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: SCIIP_BRIEFING_DIGEST_PROCESSOR,
    action: 'BRIEFING_DIGEST_DAILY_BUILD',
    sourceSheet: SCIIP_BRIEFING_SOURCE_SHEET,
    targetSheet: SCIIP_BRIEFING_DIGEST_SHEET,
    ledgerSheet: 'BRIEFING_DIGEST_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();
      const briefingSheet = ss.getSheetByName(definition.sourceSheet);

      let briefings = [];

      if (briefingSheet) {
        const today = SCIIP_RUNTIME.getDateKey({});

        briefings = SCIIP_RUNTIME_SHEET_FACTORY
          .getAllRecords(definition.sourceSheet)
          .filter(function(b) {
            return String(b.Status || '').toUpperCase() === 'ACTIVE' &&
              sciipNormalizeDateString_(b.Briefing_Date) === today;
          });
      }

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: briefings.length,
        outputCount: briefings.length ? 1 : 0,
        summary: 'Briefing digest runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '320_BriefingDigestProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Missing INTELLIGENCE_BRIEFING. Run 310 first.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      const today = SCIIP_RUNTIME.getDateKey({});

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        SCIIP_BRIEFING_DIGEST_HEADERS
      );

      const briefings = SCIIP_RUNTIME_SHEET_FACTORY
        .getAllRecords(definition.sourceSheet)
        .filter(function(b) {
          return String(b.Status || '').toUpperCase() === 'ACTIVE' &&
            sciipNormalizeDateString_(b.Briefing_Date) === today;
        });

      let digestsCreated = 0;
      let skippedDuplicate = 0;
      let skippedNoBriefings = 0;

      if (!briefings.length) {
        skippedNoBriefings++;
      } else {
        const digest = sciipCreateBriefingDigest_(briefings, today);

        const existingDigest = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
          definition.targetSheet,
          digest.Business_Key
        );

        if (existingDigest) {
          skippedDuplicate++;
        } else {
          SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
            definition.targetSheet,
            SCIIP_BRIEFING_DIGEST_HEADERS,
            digest
          );

          digestsCreated++;
        }
      }

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          briefingsReviewed: briefings.length,
          digestsCreated: digestsCreated,
          skippedDuplicate: skippedDuplicate,
          skippedNoBriefings: skippedNoBriefings,
          transactionId: transaction.transactionId
        },
        message: '320 BriefingDigestProcessor migrated runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: SCIIP_BRIEFING_DIGEST_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: digestsCreated,
        recordsRead: briefings.length,
        processed: briefings.length,
        skippedDuplicate: skippedDuplicate,
        skippedNoInputs: skippedNoBriefings,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          briefingsReviewed: briefings.length,
          digestsCreated: digestsCreated,
          skippedDuplicate: skippedDuplicate,
          skippedNoBriefings: skippedNoBriefings,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

/************************************************************
 * DIGEST FACTORY
 ************************************************************/

function sciipCreateBriefingDigest_(briefings, today) {
  const now = new Date();

  const forecastCount = sciipSumColumn_(briefings, 'Forecast_Count');
  const opportunityCount = sciipSumColumn_(briefings, 'Opportunity_Count');
  const openActionCount = sciipSumColumn_(briefings, 'Open_Action_Count');
  const criticalCount = sciipSumColumn_(briefings, 'Critical_Count');
  const highCount = sciipSumColumn_(briefings, 'High_Count');

  const title = 'SCIIP Daily Intelligence Digest — ' + today;

  const text = sciipBuildDigestText_(
    briefings,
    forecastCount,
    opportunityCount,
    openActionCount,
    criticalCount,
    highCount
  );

  const keyBasis = [
    today,
    briefings.length,
    forecastCount,
    opportunityCount,
    openActionCount,
    criticalCount,
    highCount
  ].join('|');

  const businessKey = 'BRIEFING_DIGEST|' + sciipStableHash_(keyBasis);

  return {
    Digest_ID: 'BD_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Digest_Date: today,
    Digest_Type: 'DAILY_INTELLIGENCE_DIGEST',
    Digest_Title: title,
    Digest_Text: text,
    Briefing_Count: briefings.length,
    Forecast_Count: forecastCount,
    Opportunity_Count: opportunityCount,
    Open_Action_Count: openActionCount,
    Critical_Count: criticalCount,
    High_Count: highCount,
    Status: 'ACTIVE',
    Created_At: now.toISOString(),
    Updated_At: now.toISOString(),
    Processor: SCIIP_BRIEFING_DIGEST_PROCESSOR,
    Notes: 'Generated from active intelligence briefings using SCIIP_RuntimeProcessorBase.'
  };
}

/************************************************************
 * TEXT
 ************************************************************/

function sciipBuildDigestText_(
  briefings,
  forecastCount,
  opportunityCount,
  openActionCount,
  criticalCount,
  highCount
) {
  const lines = [];

  lines.push('SCIIP Daily Intelligence Digest');
  lines.push('');
  lines.push('Markets / locations covered: ' + briefings.length);
  lines.push('Forecasts: ' + forecastCount);
  lines.push('Open opportunities: ' + opportunityCount);
  lines.push('Open recommended actions: ' + openActionCount);
  lines.push('Critical items: ' + criticalCount);
  lines.push('High-priority items: ' + highCount);
  lines.push('');

  briefings.forEach(function(b) {
    const location = b.City || b.Submarket || b.Market || 'Market';
    lines.push('--- ' + location + ' ---');
    lines.push(b.Briefing_Text || '');
    lines.push('');
  });

  return lines.join('\n');
}

/************************************************************
 * HELPERS
 ************************************************************/

function sciipSumColumn_(rows, columnName) {
  return rows.reduce(function(total, r) {
    return total + Number(r[columnName] || 0);
  }, 0);
}

function sciipNormalizeDateString_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  const s = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const d = new Date(s);

  if (!isNaN(d.getTime())) {
    return Utilities.formatDate(
      d,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  return s;
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestBriefingDigestProcessor() {
  const result = sciipRunBriefingDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestBriefingDigestProcessor',
    result: result
  }));

  return result;
}