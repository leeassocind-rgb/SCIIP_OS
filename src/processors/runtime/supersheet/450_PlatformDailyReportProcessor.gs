/************************************************************
 * 450_PlatformDailyReportProcessor.gs
 * SCIIP_OS v5.3.2 Runtime Migration
 *
 * Inputs:
 * - SYSTEM_HEALTH_DIGEST
 * - WORK_QUEUE_DIGEST
 * - BRIEFING_DIGEST
 *
 * Output:
 * - PLATFORM_DAILY_REPORT
 ************************************************************/

const PLATFORM_DAILY_REPORT_PROCESSOR = '450_PlatformDailyReportProcessor';
const PLATFORM_DAILY_REPORT_SHEET = 'PLATFORM_DAILY_REPORT';

const PLATFORM_DAILY_REPORT_HEADERS = [
  'Report_ID',
  'Business_Key',
  'Report_Date',
  'Report_Type',
  'System_Health_Digest_ID',
  'Work_Queue_Digest_ID',
  'Briefing_Digest_ID',
  'Platform_Status',
  'Executive_Summary',
  'System_Health_Summary',
  'Work_Queue_Summary',
  'Market_Intelligence_Summary',
  'Key_Risks',
  'Priority_Actions',
  'Decision_Required',
  'Status',
  'Created_At',
  'Processor'
];

function sciipRunPlatformDailyReportProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: PLATFORM_DAILY_REPORT_PROCESSOR,
    action: 'PLATFORM_DAILY_REPORT_BUILD',
    targetSheet: PLATFORM_DAILY_REPORT_SHEET,
    ledgerSheet: 'PLATFORM_DAILY_REPORT_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const inputs = sciipGetPlatformDailyReportInputs_();

      const inputCount = [
        inputs.healthDigest,
        inputs.workQueueDigest,
        inputs.briefingDigest
      ].filter(Boolean).length;

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: inputCount,
        outputCount: inputCount > 0 ? 1 : 0,
        summary: 'Platform daily report runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '450_PlatformDailyReportProcessor'
        }
      });
    },

    execute: function(payload, context, transaction, definition) {
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        PLATFORM_DAILY_REPORT_HEADERS
      );

      const inputs = sciipGetPlatformDailyReportInputs_();

      if (!inputs.healthDigest && !inputs.workQueueDigest && !inputs.briefingDigest) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: PLATFORM_DAILY_REPORT_PROCESSOR,
          businessKey: context.businessKey,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            platformDailyReportsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const reportDate = SCIIP_RUNTIME.getDateKey({});
      const businessKey = 'PLATFORM_DAILY_REPORT|' + reportDate;

      const existingReport = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        businessKey
      );

      if (existingReport) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: PLATFORM_DAILY_REPORT_PROCESSOR,
          businessKey: businessKey,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            platformDailyReportsCreated: 0,
            skippedDuplicate: 1,
            businessKey: businessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const report = sciipCreatePlatformDailyReportObject_({
        businessKey: businessKey,
        reportDate: reportDate,
        healthDigest: inputs.healthDigest,
        workQueueDigest: inputs.workQueueDigest,
        briefingDigest: inputs.briefingDigest,
        processor: PLATFORM_DAILY_REPORT_PROCESSOR
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        PLATFORM_DAILY_REPORT_HEADERS,
        report
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          platformDailyReportsCreated: 1,
          businessKey: businessKey,
          transactionId: transaction.transactionId
        },
        message: '450 PlatformDailyReportProcessor migrated runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: PLATFORM_DAILY_REPORT_PROCESSOR,
        businessKey: businessKey,
        recordsCreated: 1,
        processed: 1,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          platformDailyReportsCreated: 1,
          skippedDuplicate: 0,
          businessKey: businessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipGetPlatformDailyReportInputs_() {
  return {
    healthDigest: sciipGetLatestRuntimeRecordByCreatedAt450_('SYSTEM_HEALTH_DIGEST'),
    workQueueDigest: sciipGetLatestRuntimeRecordByCreatedAt450_('WORK_QUEUE_DIGEST'),
    briefingDigest: sciipGetLatestRuntimeRecordByCreatedAt450_('BRIEFING_DIGEST')
  };
}

function sciipCreatePlatformDailyReportObject_(args) {
  const now = new Date();

  const healthSummary = sciipExtractFirstAvailable450_(args.healthDigest, [
    'Health_Summary',
    'System_Health_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  const workQueueSummary = sciipExtractFirstAvailable450_(args.workQueueDigest, [
    'Work_Queue_Summary',
    'Queue_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  const marketSummary = sciipExtractFirstAvailable450_(args.briefingDigest, [
    'Briefing_Summary',
    'Market_Intelligence_Summary',
    'Executive_Summary',
    'Summary',
    'Digest_Text'
  ]);

  const platformStatus = sciipInferPlatformStatus450_(
    healthSummary,
    workQueueSummary
  );

  const executiveSummary = sciipComposePlatformExecutiveSummary450_({
    platformStatus: platformStatus,
    healthSummary: healthSummary,
    workQueueSummary: workQueueSummary,
    marketSummary: marketSummary
  });

  const keyRisks = sciipComposePlatformRisks450_({
    platformStatus: platformStatus,
    healthSummary: healthSummary,
    workQueueSummary: workQueueSummary,
    marketSummary: marketSummary
  });

  const priorityActions = sciipComposePlatformActions450_({
    platformStatus: platformStatus,
    healthSummary: healthSummary,
    workQueueSummary: workQueueSummary,
    marketSummary: marketSummary
  });

  const decisionRequired = sciipInferDecisionRequired450_(
    platformStatus,
    keyRisks
  );

  return {
    Report_ID: sciipGeneratePlatformDailyReportId450_(),
    Business_Key: args.businessKey,
    Report_Date: args.reportDate,
    Report_Type: 'DAILY_PLATFORM_REPORT',
    System_Health_Digest_ID: sciipExtractFirstAvailable450_(args.healthDigest, [
      'Digest_ID',
      'System_Health_Digest_ID',
      'Record_ID',
      'ID'
    ]),
    Work_Queue_Digest_ID: sciipExtractFirstAvailable450_(args.workQueueDigest, [
      'Digest_ID',
      'Work_Queue_Digest_ID',
      'Record_ID',
      'ID'
    ]),
    Briefing_Digest_ID: sciipExtractFirstAvailable450_(args.briefingDigest, [
      'Digest_ID',
      'Briefing_Digest_ID',
      'Record_ID',
      'ID'
    ]),
    Platform_Status: platformStatus,
    Executive_Summary: executiveSummary,
    System_Health_Summary: healthSummary,
    Work_Queue_Summary: workQueueSummary,
    Market_Intelligence_Summary: marketSummary,
    Key_Risks: keyRisks,
    Priority_Actions: priorityActions,
    Decision_Required: decisionRequired,
    Status: 'ACTIVE',
    Created_At: now.toISOString(),
    Processor: args.processor
  };
}

function sciipGetLatestRuntimeRecordByCreatedAt450_(sheetName) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  records.sort(function(a, b) {
    const aDate = new Date(
      a.Created_At ||
      a.Completed_At ||
      a.Report_Date ||
      a.Digest_Date ||
      0
    ).getTime();

    const bDate = new Date(
      b.Created_At ||
      b.Completed_At ||
      b.Report_Date ||
      b.Digest_Date ||
      0
    ).getTime();

    return bDate - aDate;
  });

  return records[0];
}

function sciipExtractFirstAvailable450_(record, fields) {
  if (!record) return '';

  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      return String(value).trim();
    }
  }

  return '';
}

function sciipComposePlatformExecutiveSummary450_(args) {
  const parts = [];

  parts.push('SCIIP platform daily status: ' + args.platformStatus + '.');

  if (args.healthSummary) {
    parts.push('System health: ' + args.healthSummary);
  }

  if (args.workQueueSummary) {
    parts.push('Work queue: ' + args.workQueueSummary);
  }

  if (args.marketSummary) {
    parts.push('Market intelligence: ' + args.marketSummary);
  }

  return parts.join('\n\n');
}

function sciipComposePlatformRisks450_(args) {
  const risks = [];

  const combined = [
    args.platformStatus,
    args.healthSummary,
    args.workQueueSummary,
    args.marketSummary
  ].join(' ').toLowerCase();

  if (
    combined.indexOf('error') !== -1 ||
    combined.indexOf('failed') !== -1 ||
    combined.indexOf('critical') !== -1
  ) {
    risks.push('Potential platform reliability issue requires operator review.');
  }

  if (
    combined.indexOf('backlog') !== -1 ||
    combined.indexOf('overdue') !== -1 ||
    combined.indexOf('blocked') !== -1
  ) {
    risks.push('Work queue contains backlog, overdue, or blocked execution items.');
  }

  if (
    combined.indexOf('urgent') !== -1 ||
    combined.indexOf('risk') !== -1 ||
    combined.indexOf('decision') !== -1
  ) {
    risks.push('Market intelligence or operating workflow may require executive attention.');
  }

  if (risks.length === 0) {
    risks.push('No material platform risks identified from current digests.');
  }

  return risks.join('\n');
}

function sciipComposePlatformActions450_(args) {
  const actions = [];

  const combined = [
    args.platformStatus,
    args.healthSummary,
    args.workQueueSummary,
    args.marketSummary
  ].join(' ').toLowerCase();

  if (
    combined.indexOf('error') !== -1 ||
    combined.indexOf('failed') !== -1 ||
    combined.indexOf('critical') !== -1
  ) {
    actions.push('Review failed processors and confirm recovery path.');
  }

  if (
    combined.indexOf('backlog') !== -1 ||
    combined.indexOf('overdue') !== -1 ||
    combined.indexOf('blocked') !== -1
  ) {
    actions.push('Prioritize blocked or overdue work queue items.');
  }

  if (combined.indexOf('decision') !== -1) {
    actions.push('Escalate decision items to operator console or command center.');
  }

  if (actions.length === 0) {
    actions.push('Continue normal SCIIP operating cadence.');
  }

  return actions.join('\n');
}

function sciipInferPlatformStatus450_(healthSummary, workQueueSummary) {
  const text = [healthSummary, workQueueSummary].join(' ').toLowerCase();

  if (
    text.indexOf('critical') !== -1 ||
    text.indexOf('failed') !== -1 ||
    text.indexOf('error') !== -1
  ) {
    return 'ATTENTION_REQUIRED';
  }

  if (
    text.indexOf('blocked') !== -1 ||
    text.indexOf('overdue') !== -1 ||
    text.indexOf('backlog') !== -1
  ) {
    return 'WATCH';
  }

  return 'OPERATIONAL';
}

function sciipInferDecisionRequired450_(platformStatus, keyRisks) {
  const text = [platformStatus, keyRisks].join(' ').toLowerCase();

  if (
    text.indexOf('attention_required') !== -1 ||
    text.indexOf('critical') !== -1 ||
    text.indexOf('blocked') !== -1 ||
    text.indexOf('executive attention') !== -1
  ) {
    return 'YES';
  }

  return 'NO';
}

function sciipGeneratePlatformDailyReportId450_() {
  return 'PDR_' + Utilities.getUuid();
}

function sciipTestPlatformDailyReportProcessor() {
  const result = sciipRunPlatformDailyReportProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestPlatformDailyReportProcessor',
    result: result
  }));

  return result;
}