/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 440_SystemHealthDigestProcessor
 *
 * SYSTEM_HEALTH → SYSTEM_HEALTH_DIGEST
 *******************************************************/

const SYSTEM_HEALTH_DIGEST_SHEET = 'SYSTEM_HEALTH_DIGEST';

const SYSTEM_HEALTH_DIGEST_HEADERS = [
  'ID',
  'Business_Key',
  'Digest_Date',
  'Health_Records_Reviewed',
  'Latest_System_Health_ID',
  'Latest_Health_Label',
  'Latest_Health_Score',
  'Latest_Operational_Risk',
  'Average_Health_Score',
  'Lowest_Health_Score',
  'Highest_Health_Score',
  'Digest_Title',
  'Health_Summary',
  'Risk_Summary',
  'Recommended_System_Action',
  'Monitoring_Cadence',
  'Digest_Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const SYSTEM_HEALTH_DIGEST_PROCESSOR = '440_SystemHealthDigestProcessor';

function sciipRunSystemHealthDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: SYSTEM_HEALTH_DIGEST_PROCESSOR,
    action: 'SYSTEM_HEALTH_DIGEST_BUILD',
    sourceSheet: 'SYSTEM_HEALTH',
    targetSheet: SYSTEM_HEALTH_DIGEST_SHEET,
    ledgerSheet: 'SYSTEM_HEALTH_DIGEST_RUNTIME_LEDGER',

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
        outputCount: records.length ? 1 : 0,
        summary: 'System health digest runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '440_SystemHealthDigestProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Missing SYSTEM_HEALTH sheet.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        SYSTEM_HEALTH_DIGEST_HEADERS
      );

      const healthRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);
      const today = SCIIP_RUNTIME.getDateKey({});
      const businessKey = 'SYSTEM_HEALTH_DIGEST|' + today;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        businessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: SYSTEM_HEALTH_DIGEST_PROCESSOR,
          businessKey: businessKey,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            healthRecordsReviewed: healthRecords.length,
            systemHealthDigestsCreated: 0,
            skippedDuplicate: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const digest = sciipBuildSystemHealthDigest_(
        healthRecords,
        businessKey,
        today
      );

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        SYSTEM_HEALTH_DIGEST_HEADERS,
        digest
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          healthRecordsReviewed: healthRecords.length,
          systemHealthDigestsCreated: 1,
          businessKey: businessKey,
          transactionId: transaction.transactionId
        },
        message: '440 SystemHealthDigestProcessor migrated runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: SYSTEM_HEALTH_DIGEST_PROCESSOR,
        businessKey: businessKey,
        recordsCreated: 1,
        recordsRead: healthRecords.length,
        processed: healthRecords.length,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          healthRecordsReviewed: healthRecords.length,
          systemHealthDigestsCreated: 1,
          skippedDuplicate: 0,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipBuildSystemHealthDigest_(records, businessKey, today) {
  const now = new Date().toISOString();

  const activeRecords = records.filter(function(r) {
    return String(r.Status || '').toUpperCase() !== 'INACTIVE';
  });

  const latest = sciipLatestSystemHealthRecord_(activeRecords);

  const scores = activeRecords
    .map(function(r) {
      return Number(r.Health_Score || 0);
    })
    .filter(function(n) {
      return !isNaN(n);
    });

  const avg = scores.length
    ? Math.round(scores.reduce(function(a, b) { return a + b; }, 0) / scores.length)
    : 0;

  const low = scores.length ? Math.min.apply(null, scores) : 0;
  const high = scores.length ? Math.max.apply(null, scores) : 0;

  return {
    ID: sciipGenerateSystemHealthDigestId_(),
    Business_Key: businessKey,
    Digest_Date: today,
    Health_Records_Reviewed: activeRecords.length,
    Latest_System_Health_ID: latest.ID || '',
    Latest_Health_Label: latest.Health_Label || 'UNKNOWN',
    Latest_Health_Score: latest.Health_Score || '',
    Latest_Operational_Risk: latest.Operational_Risk || 'UNKNOWN',
    Average_Health_Score: avg,
    Lowest_Health_Score: low,
    Highest_Health_Score: high,
    Digest_Title: 'SCIIP System Health Digest — ' + today,
    Health_Summary: sciipSystemHealthDigestSummary_(latest, avg, low, high),
    Risk_Summary: sciipSystemHealthRiskSummary_(latest),
    Recommended_System_Action: latest.Recommended_System_Action || 'No system action available.',
    Monitoring_Cadence: latest.Monitoring_Cadence || 'Routine',
    Digest_Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SYSTEM_HEALTH_DIGEST_PROCESSOR,
    Notes: 'Generated from SYSTEM_HEALTH using SCIIP_RuntimeProcessorBase.'
  };
}

function sciipLatestSystemHealthRecord_(records) {
  if (!records.length) return {};

  return records.slice().sort(function(a, b) {
    const dateA = new Date(a.Created_At || a.Health_Date || 0).getTime();
    const dateB = new Date(b.Created_At || b.Health_Date || 0).getTime();
    return dateB - dateA;
  })[0];
}

function sciipSystemHealthDigestSummary_(latest, avg, low, high) {
  if (!latest || !latest.ID) {
    return 'No active system health records were available for digest generation.';
  }

  return [
    'Latest health label: ' + (latest.Health_Label || 'UNKNOWN'),
    'Latest health score: ' + (latest.Health_Score || 'UNKNOWN'),
    'Average health score: ' + avg,
    'Lowest health score: ' + low,
    'Highest health score: ' + high,
    '',
    latest.Health_Summary || ''
  ].join('\n');
}

function sciipSystemHealthRiskSummary_(latest) {
  if (!latest || !latest.ID) {
    return 'No operational risk available.';
  }

  return [
    'Operational risk: ' + (latest.Operational_Risk || 'UNKNOWN'),
    'System status: ' + (latest.System_Status || 'UNKNOWN'),
    'Execution posture: ' + (latest.Execution_Posture || 'UNKNOWN'),
    'Escalation level: ' + (latest.Escalation_Level || 'UNKNOWN')
  ].join('\n');
}

function sciipGenerateSystemHealthDigestId_() {
  return 'SYS_HEALTH_DIGEST_' +
    Utilities.getUuid()
      .replace(/-/g, '')
      .slice(0, 16)
      .toUpperCase();
}

function sciipTestSystemHealthDigestProcessor() {
  const result = sciipRunSystemHealthDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestSystemHealthDigestProcessor',
    result: result
  }));

  return result;
}