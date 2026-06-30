/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 410_OperatorConsoleProcessor
 *
 * WORK_QUEUE_DIGEST → OPERATOR_CONSOLE
 *
 * Migration note:
 * Preserves original 410 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const OPERATOR_CONSOLE_PROCESSOR = '410_OperatorConsoleProcessor';
const OPERATOR_CONSOLE_SOURCE_SHEET = 'WORK_QUEUE_DIGEST';
const OPERATOR_CONSOLE_SHEET = 'OPERATOR_CONSOLE';

const OPERATOR_CONSOLE_HEADERS = [
  'ID',
  'Business_Key',
  'Work_Queue_Digest_ID',
  'Console_Date',
  'Console_Title',
  'Operating_Status',
  'Open_Work_Items',
  'Critical_Count',
  'High_Count',
  'Medium_Count',
  'Low_Count',
  'Primary_Focus',
  'Top_Items',
  'Escalations',
  'Recommended_Operator_Action',
  'Console_Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunOperatorConsoleProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: OPERATOR_CONSOLE_PROCESSOR,
    action: 'OPERATOR_CONSOLE_BUILD',
    sourceSheet: OPERATOR_CONSOLE_SOURCE_SHEET,
    targetSheet: OPERATOR_CONSOLE_SHEET,
    ledgerSheet: 'OPERATOR_CONSOLE_RUNTIME_LEDGER',

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
        summary: 'Operator console runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: OPERATOR_CONSOLE_PROCESSOR
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Missing WORK_QUEUE_DIGEST sheet. Run 400 first.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        OPERATOR_CONSOLE_HEADERS
      );

      const digests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);
      let created = 0;
      let skippedDuplicate = 0;
      let skippedNoDigest = 0;

      digests.forEach(function(digest) {
        const digestId = digest.ID || digest.Work_Queue_Digest_ID;

        if (!digestId) {
          skippedNoDigest++;
          return;
        }

        const consoleBusinessKey = 'OPERATOR_CONSOLE|' + digestId;
        const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
          definition.targetSheet,
          consoleBusinessKey
        );

        if (existing) {
          skippedDuplicate++;
          return;
        }

        const console = sciipBuildOperatorConsole_(digest, consoleBusinessKey);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          OPERATOR_CONSOLE_HEADERS,
          console
        );

        created++;
      });

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          workQueueDigestsReviewed: digests.length,
          operatorConsolesCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoDigest: skippedNoDigest,
          transactionId: transaction.transactionId
        },
        message: '410 OperatorConsoleProcessor runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: OPERATOR_CONSOLE_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: digests.length,
        processed: digests.length,
        skippedDuplicate: skippedDuplicate,
        skippedNoInputs: skippedNoDigest,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          workQueueDigestsReviewed: digests.length,
          operatorConsolesCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoDigest: skippedNoDigest,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipBuildOperatorConsole_(digest, businessKey) {
  const now = new Date().toISOString();

  return {
    ID: sciipGenerateOperatorConsoleId_(),
    Business_Key: businessKey,
    Work_Queue_Digest_ID: digest.ID || '',
    Console_Date: digest.Digest_Date || now,
    Console_Title: sciipOperatorConsoleTitle_(digest),
    Operating_Status: sciipOperatingStatus_(digest),
    Open_Work_Items: digest.Open_Items || 0,
    Critical_Count: digest.Critical_Items || 0,
    High_Count: digest.High_Items || 0,
    Medium_Count: digest.Medium_Items || 0,
    Low_Count: digest.Low_Items || 0,
    Primary_Focus: digest.Execution_Focus || '',
    Top_Items: digest.Top_Work_Items || '',
    Escalations: digest.Escalation_Summary || '',
    Recommended_Operator_Action: digest.Recommended_Next_Step || '',
    Console_Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: OPERATOR_CONSOLE_PROCESSOR,
    Notes: 'Generated from WORK_QUEUE_DIGEST'
  };
}

function sciipOperatorConsoleTitle_(digest) {
  const date = digest.Digest_Date || new Date().toISOString().slice(0, 10);
  return 'SCIIP Operator Console — ' + date;
}

function sciipOperatingStatus_(digest) {
  const critical = Number(digest.Critical_Items || 0);
  const high = Number(digest.High_Items || 0);
  const open = Number(digest.Open_Items || 0);

  if (critical > 0) return 'ESCALATION_REQUIRED';
  if (high > 0) return 'ACTIVE_REVIEW';
  if (open > 0) return 'NORMAL_OPERATIONS';

  return 'CLEAR';
}

function sciipGenerateOperatorConsoleId_() {
  return 'OP_CONSOLE_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipTestOperatorConsoleProcessor() {
  const result = sciipRunOperatorConsoleProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestOperatorConsoleProcessor',
    result: result
  }));

  return result;
}
