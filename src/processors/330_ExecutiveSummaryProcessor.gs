/*******************************************************
 * SCIIP_OS v5.3.2
 * 330_ExecutiveSummaryProcessor
 *
 * BRIEFING_DIGEST → EXECUTIVE_SUMMARY
 *
 * Migrated to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const EXECUTIVE_SUMMARY_SHEET = 'EXECUTIVE_SUMMARY';
const EXECUTIVE_SUMMARY_SOURCE_SHEET = 'BRIEFING_DIGEST';

const EXECUTIVE_SUMMARY_HEADERS = [
  'ID',
  'Business_Key',
  'Digest_ID',
  'Summary_Date',
  'Audience',
  'Summary_Title',
  'Executive_Summary',
  'Key_Takeaways',
  'Market_Implications',
  'Recommended_Focus',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const EXECUTIVE_SUMMARY_PROCESSOR = '330_ExecutiveSummaryProcessor';

function sciipRunExecutiveSummaryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: EXECUTIVE_SUMMARY_PROCESSOR,
    action: 'EXECUTIVE_SUMMARY_BUILD',
    sourceSheet: EXECUTIVE_SUMMARY_SOURCE_SHEET,
    targetSheet: EXECUTIVE_SUMMARY_SHEET,
    ledgerSheet: 'EXECUTIVE_SUMMARY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: records.length,
        outputCount: records.length,
        summary: 'Executive summary runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '330_ExecutiveSummaryProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Missing BRIEFING_DIGEST sheet. Run 320 first.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        EXECUTIVE_SUMMARY_HEADERS
      );

      const digests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      let created = 0;
      let skippedDuplicate = 0;
      let skippedNoDigest = 0;

      digests.forEach(function(digest) {
        const digestId = digest.ID || digest.Digest_ID;

        if (!digestId) {
          skippedNoDigest++;
          return;
        }

        const summaryDate =
          digest.Digest_Date ||
          digest.Briefing_Date ||
          digest.Created_At ||
          new Date();

        const businessKey = 'EXECUTIVE_SUMMARY|' + digestId;

        const existingSummary = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
          definition.targetSheet,
          businessKey
        );

        if (existingSummary) {
          skippedDuplicate++;
          return;
        }

        const summary = sciipBuildExecutiveSummary_(
          digest,
          businessKey,
          summaryDate
        );

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          EXECUTIVE_SUMMARY_HEADERS,
          summary
        );

        created++;
      });

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          digestsReviewed: digests.length,
          executiveSummariesCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoDigest: skippedNoDigest,
          transactionId: transaction.transactionId
        },
        message: '330 ExecutiveSummaryProcessor migrated runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: EXECUTIVE_SUMMARY_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: digests.length,
        processed: digests.length,
        skippedDuplicate: skippedDuplicate,
        skippedNoInputs: skippedNoDigest,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          digestsReviewed: digests.length,
          executiveSummariesCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoDigest: skippedNoDigest,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipBuildExecutiveSummary_(digest, businessKey, summaryDate) {
  const now = new Date().toISOString();

  const digestText = [
    digest.Digest_Title,
    digest.Digest_Summary,
    digest.Key_Themes,
    digest.Briefing_Count,
    digest.Notes
  ].filter(Boolean).join('\n\n');

  return {
    ID: sciipGenerateExecutiveSummaryId_(),
    Business_Key: businessKey,
    Digest_ID: digest.ID || digest.Digest_ID || '',
    Summary_Date: summaryDate,
    Audience: 'Landlord / Executive',
    Summary_Title: sciipExecutiveSummaryTitle_(digest),
    Executive_Summary: sciipExecutiveSummaryNarrative_(digestText),
    Key_Takeaways: sciipExecutiveKeyTakeaways_(digestText),
    Market_Implications: sciipExecutiveMarketImplications_(digestText),
    Recommended_Focus: sciipExecutiveRecommendedFocus_(digestText),
    Confidence: 'MEDIUM',
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: EXECUTIVE_SUMMARY_PROCESSOR,
    Notes: 'Generated from BRIEFING_DIGEST using SCIIP_RuntimeProcessorBase.'
  };
}

function sciipExecutiveSummaryTitle_(digest) {
  const date =
    digest.Digest_Date ||
    digest.Briefing_Date ||
    new Date().toISOString().slice(0, 10);

  return 'Executive Market Summary — ' + date;
}

function sciipExecutiveSummaryNarrative_(text) {
  if (!text) {
    return 'SCIIP reviewed the latest intelligence digest. No material market narrative was available.';
  }

  return (
    'SCIIP reviewed the latest briefing digest and identified current market intelligence relevant to landlord decision-making, asset positioning, tenant demand, competitive conditions, and near-term opportunity detection. ' +
    'The intelligence should be used to guide leasing strategy, market messaging, prospect prioritization, and follow-up actions.'
  );
}

function sciipExecutiveKeyTakeaways_(text) {
  return [
    'Current market intelligence has been consolidated into an executive-ready summary.',
    'Digest-level signals should be reviewed for leasing, pricing, positioning, and tenant demand implications.',
    'Any recurring themes should be monitored as potential market theses or opportunity triggers.'
  ].join('\n');
}

function sciipExecutiveMarketImplications_(text) {
  return [
    'Landlords should evaluate whether recent activity strengthens or weakens asset-level positioning.',
    'Market signals may indicate changes in tenant urgency, competitive supply, pricing pressure, or strategic demand.',
    'SCIIP should continue comparing digest themes against historical asset, event, GIS, and thesis data.'
  ].join('\n');
}

function sciipExecutiveRecommendedFocus_(text) {
  return [
    'Review active opportunities generated by SCIIP.',
    'Compare current digest themes against open recommended actions.',
    'Prioritize landlord communication where market signals support urgency or differentiated positioning.'
  ].join('\n');
}

function sciipGenerateExecutiveSummaryId_() {
  return 'EXEC_SUM_' +
    Utilities.getUuid()
      .replace(/-/g, '')
      .slice(0, 16)
      .toUpperCase();
}

function sciipTestExecutiveSummaryProcessor() {
  const result = sciipRunExecutiveSummaryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestExecutiveSummaryProcessor',
    result: result
  }));

  return result;
}