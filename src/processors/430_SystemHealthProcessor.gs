/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 430_WorkQueueDigestProcessor
 *
 * WORK_QUEUE → WORK_QUEUE_DIGEST
 *******************************************************/

const WORK_QUEUE_DIGEST_PROCESSOR = '430_WorkQueueDigestProcessor';
const WORK_QUEUE_DIGEST_SOURCE_SHEET = 'WORK_QUEUE';
const WORK_QUEUE_DIGEST_SHEET = 'WORK_QUEUE_DIGEST';

const WORK_QUEUE_DIGEST_HEADERS = [
  'ID',
  'Business_Key',
  'Digest_Date',
  'Work_Items_Reviewed',
  'Open_Items',
  'Completed_Items',
  'Blocked_Items',
  'High_Priority_Items',
  'Overdue_Items',
  'Latest_Work_Item_ID',
  'Digest_Title',
  'Work_Queue_Summary',
  'Risk_Summary',
  'Recommended_Action',
  'Digest_Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunWorkQueueDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: WORK_QUEUE_DIGEST_PROCESSOR,
    action: 'WORK_QUEUE_DIGEST_BUILD',
    sourceSheet: WORK_QUEUE_DIGEST_SOURCE_SHEET,
    targetSheet: WORK_QUEUE_DIGEST_SHEET,
    ledgerSheet: 'WORK_QUEUE_DIGEST_RUNTIME_LEDGER',

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
        summary: 'Work queue digest runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: WORK_QUEUE_DIGEST_PROCESSOR
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Missing WORK_QUEUE sheet.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        WORK_QUEUE_DIGEST_HEADERS
      );

      const workItems = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);
      const today = SCIIP_RUNTIME.getDateKey({});
      const businessKey = 'WORK_QUEUE_DIGEST|' + today;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        businessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: WORK_QUEUE_DIGEST_PROCESSOR,
          businessKey: businessKey,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            workItemsReviewed: workItems.length,
            workQueueDigestsCreated: 0,
            skippedDuplicate: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const digest = sciipBuildWorkQueueDigest_(
        workItems,
        businessKey,
        today
      );

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        WORK_QUEUE_DIGEST_HEADERS,
        digest
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          workItemsReviewed: workItems.length,
          workQueueDigestsCreated: 1,
          businessKey: businessKey,
          transactionId: transaction.transactionId
        },
        message: '430 WorkQueueDigestProcessor migrated runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: WORK_QUEUE_DIGEST_PROCESSOR,
        businessKey: businessKey,
        recordsCreated: 1,
        recordsRead: workItems.length,
        processed: workItems.length,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          workItemsReviewed: workItems.length,
          workQueueDigestsCreated: 1,
          skippedDuplicate: 0,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipBuildWorkQueueDigest_(records, businessKey, today) {
  const now = new Date().toISOString();
  const activeRecords = records.filter(function(r) {
    return String(r.Status || '').toUpperCase() !== 'INACTIVE';
  });

  const openItems = sciipCountWorkQueueStatus_(activeRecords, ['OPEN', 'PENDING', 'QUEUED', 'ACTIVE']);
  const completedItems = sciipCountWorkQueueStatus_(activeRecords, ['DONE', 'COMPLETE', 'COMPLETED']);
  const blockedItems = sciipCountWorkQueueStatus_(activeRecords, ['BLOCKED']);
  const highPriorityItems = activeRecords.filter(function(r) {
    return ['HIGH', 'CRITICAL'].indexOf(String(r.Priority || r.Priority_Level || '').toUpperCase()) !== -1;
  }).length;

  const overdueItems = activeRecords.filter(function(r) {
    return sciipIsWorkQueueItemOverdue_(r);
  }).length;

  const latest = sciipLatestWorkQueueRecord_(activeRecords);

  return {
    ID: sciipGenerateWorkQueueDigestId_(),
    Business_Key: businessKey,
    Digest_Date: today,
    Work_Items_Reviewed: activeRecords.length,
    Open_Items: openItems,
    Completed_Items: completedItems,
    Blocked_Items: blockedItems,
    High_Priority_Items: highPriorityItems,
    Overdue_Items: overdueItems,
    Latest_Work_Item_ID: latest.ID || latest.Work_Item_ID || '',
    Digest_Title: 'SCIIP Work Queue Digest — ' + today,
    Work_Queue_Summary: sciipWorkQueueSummary_(activeRecords.length, openItems, completedItems, blockedItems, highPriorityItems, overdueItems),
    Risk_Summary: sciipWorkQueueRiskSummary_(blockedItems, highPriorityItems, overdueItems),
    Recommended_Action: sciipWorkQueueRecommendedAction_(blockedItems, highPriorityItems, overdueItems),
    Digest_Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: WORK_QUEUE_DIGEST_PROCESSOR,
    Notes: 'Generated from WORK_QUEUE using SCIIP_RuntimeProcessorBase.'
  };
}

function sciipCountWorkQueueStatus_(records, statuses) {
  return records.filter(function(r) {
    const status = String(r.Status || r.Queue_Status || r.Work_Status || '').toUpperCase();
    return statuses.indexOf(status) !== -1;
  }).length;
}

function sciipIsWorkQueueItemOverdue_(record) {
  const due = record.Due_Date || record.Target_Date || record.Required_By;
  if (!due) return false;

  const d = new Date(due);
  if (isNaN(d.getTime())) return false;

  const today = new Date(SCIIP_RUNTIME.getDateKey({}) + 'T00:00:00');
  return d.getTime() < today.getTime() &&
    ['DONE', 'COMPLETE', 'COMPLETED'].indexOf(String(record.Status || '').toUpperCase()) === -1;
}

function sciipLatestWorkQueueRecord_(records) {
  if (!records.length) return {};

  return records.slice().sort(function(a, b) {
    const dateA = new Date(a.Created_At || a.Updated_At || a.Timestamp || 0).getTime();
    const dateB = new Date(b.Created_At || b.Updated_At || b.Timestamp || 0).getTime();
    return dateB - dateA;
  })[0];
}

function sciipWorkQueueSummary_(total, open, completed, blocked, highPriority, overdue) {
  return [
    'Work items reviewed: ' + total,
    'Open items: ' + open,
    'Completed items: ' + completed,
    'Blocked items: ' + blocked,
    'High-priority items: ' + highPriority,
    'Overdue items: ' + overdue
  ].join('\n');
}

function sciipWorkQueueRiskSummary_(blocked, highPriority, overdue) {
  const risks = [];

  if (blocked > 0) risks.push(blocked + ' blocked work item(s) require review.');
  if (overdue > 0) risks.push(overdue + ' overdue work item(s) require follow-up.');
  if (highPriority > 0) risks.push(highPriority + ' high-priority work item(s) remain active.');

  if (!risks.length) risks.push('No material work queue risks identified.');

  return risks.join('\n');
}

function sciipWorkQueueRecommendedAction_(blocked, highPriority, overdue) {
  if (blocked > 0) return 'Review blocked work items and resolve dependencies.';
  if (overdue > 0) return 'Prioritize overdue work items.';
  if (highPriority > 0) return 'Review high-priority work items during next operating cadence.';
  return 'Continue normal work queue monitoring.';
}

function sciipGenerateWorkQueueDigestId_() {
  return 'WORK_QUEUE_DIGEST_' +
    Utilities.getUuid()
      .replace(/-/g, '')
      .slice(0, 16)
      .toUpperCase();
}

function sciipTestWorkQueueDigestProcessor() {
  const result = sciipRunWorkQueueDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestWorkQueueDigestProcessor',
    result: result
  }));

  return result;
}