/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 400_WorkQueueDigestProcessor
 *
 * WORK_QUEUE → WORK_QUEUE_DIGEST
 *
 * Migration note:
 * Preserves original 400 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const WORK_QUEUE_DIGEST_PROCESSOR = '400_WorkQueueDigestProcessor';
const WORK_QUEUE_DIGEST_SOURCE_SHEET = 'WORK_QUEUE';
const WORK_QUEUE_DIGEST_SHEET = 'WORK_QUEUE_DIGEST';

const WORK_QUEUE_DIGEST_HEADERS = [
  'ID',
  'Business_Key',
  'Digest_Date',
  'Queue_Items_Reviewed',
  'Open_Items',
  'Critical_Items',
  'High_Items',
  'Medium_Items',
  'Low_Items',
  'Top_Work_Items',
  'Execution_Focus',
  'Escalation_Summary',
  'Recommended_Next_Step',
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
        outputCount: 1,
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
        errors.push('Missing WORK_QUEUE sheet. Run 390 first.');
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

      const queueItems = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);
      const today = new Date().toISOString().slice(0, 10);
      const digestBusinessKey = 'WORK_QUEUE_DIGEST|' + today;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        digestBusinessKey
      );

      if (existing) {
        SCIIP_RUNTIME_LOGGING.audit({
          context: context,
          payload: {
            queueItemsReviewed: queueItems.length,
            workQueueDigestsCreated: 0,
            skippedDuplicate: 1,
            digestBusinessKey: digestBusinessKey,
            transactionId: transaction.transactionId
          },
          message: '400 WorkQueueDigestProcessor runtime duplicate skipped.'
        });

        return SCIIP_RUNTIME_RESULT_FACTORY.success({
          processor: WORK_QUEUE_DIGEST_PROCESSOR,
          businessKey: context.businessKey,
          recordsCreated: 0,
          recordsRead: queueItems.length,
          processed: queueItems.length,
          skippedDuplicate: 1,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            queueItemsReviewed: queueItems.length,
            workQueueDigestsCreated: 0,
            skippedDuplicate: 1,
            digestBusinessKey: digestBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const digest = sciipBuildWorkQueueDigest_(queueItems, digestBusinessKey, today);

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        WORK_QUEUE_DIGEST_HEADERS,
        digest
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          queueItemsReviewed: queueItems.length,
          workQueueDigestsCreated: 1,
          skippedDuplicate: 0,
          digestBusinessKey: digestBusinessKey,
          transactionId: transaction.transactionId
        },
        message: '400 WorkQueueDigestProcessor runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: WORK_QUEUE_DIGEST_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: queueItems.length,
        processed: queueItems.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          queueItemsReviewed: queueItems.length,
          workQueueDigestsCreated: 1,
          skippedDuplicate: 0,
          digestBusinessKey: digestBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipBuildWorkQueueDigest_(queueItems, businessKey, today) {
  const now = new Date().toISOString();

  const openItems = queueItems.filter(function(item) {
    return String(item.Work_Status || '').toUpperCase() !== 'CLOSED';
  });

  const critical = sciipFilterQueueByPriority_(openItems, 'CRITICAL');
  const high = sciipFilterQueueByPriority_(openItems, 'HIGH');
  const medium = sciipFilterQueueByPriority_(openItems, 'MEDIUM');
  const low = sciipFilterQueueByPriority_(openItems, 'LOW');

  const sorted = openItems.slice().sort(function(a, b) {
    const scoreB = Number(b.Composite_Score || 0);
    const scoreA = Number(a.Composite_Score || 0);
    return scoreB - scoreA;
  });

  return {
    ID: sciipGenerateWorkQueueDigestId_(),
    Business_Key: businessKey,
    Digest_Date: today,
    Queue_Items_Reviewed: queueItems.length,
    Open_Items: openItems.length,
    Critical_Items: critical.length,
    High_Items: high.length,
    Medium_Items: medium.length,
    Low_Items: low.length,
    Top_Work_Items: sciipTopWorkItems_(sorted),
    Execution_Focus: sciipExecutionFocus_(critical, high, medium, low),
    Escalation_Summary: sciipEscalationSummary_(sorted),
    Recommended_Next_Step: sciipRecommendedQueueNextStep_(critical, high, medium, low),
    Digest_Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: WORK_QUEUE_DIGEST_PROCESSOR,
    Notes: 'Generated from WORK_QUEUE'
  };
}

function sciipFilterQueueByPriority_(items, label) {
  return items.filter(function(item) {
    return String(item.Priority_Label || '').toUpperCase() === label;
  });
}

function sciipTopWorkItems_(sortedItems) {
  if (!sortedItems.length) {
    return 'No open work queue items.';
  }

  return sortedItems.slice(0, 5).map(function(item, i) {
    return [
      (i + 1) + '. ' + (item.Work_Title || 'Untitled Work Item'),
      'Priority: ' + (item.Priority_Label || 'UNKNOWN'),
      'Score: ' + (item.Composite_Score || ''),
      'Assigned: ' + (item.Assigned_Role || 'Unassigned')
    ].join(' | ');
  }).join('\n');
}

function sciipExecutionFocus_(critical, high, medium, low) {
  if (critical.length > 0) {
    return 'Immediate focus should be placed on critical work queue items.';
  }

  if (high.length > 0) {
    return 'Current-cycle focus should be placed on high-priority execution items.';
  }

  if (medium.length > 0) {
    return 'Next-cycle focus should be placed on medium-priority execution items.';
  }

  if (low.length > 0) {
    return 'Routine monitoring is appropriate for low-priority work queue items.';
  }

  return 'No open execution focus required.';
}

function sciipEscalationSummary_(sortedItems) {
  const escalations = sortedItems.filter(function(item) {
    return String(item.Escalation_Trigger || '').trim() !== '';
  });

  if (!escalations.length) {
    return 'No escalation triggers currently identified.';
  }

  return escalations.slice(0, 5).map(function(item, i) {
    return (i + 1) + '. ' + (item.Work_Title || 'Untitled') + ' — ' + item.Escalation_Trigger;
  }).join('\n');
}

function sciipRecommendedQueueNextStep_(critical, high, medium, low) {
  if (critical.length > 0) {
    return 'Review critical queue items immediately and determine whether landlord-facing action is required.';
  }

  if (high.length > 0) {
    return 'Review high-priority queue items during the current execution cycle.';
  }

  if (medium.length > 0) {
    return 'Review medium-priority queue items during the next intelligence cycle.';
  }

  if (low.length > 0) {
    return 'Maintain routine review of low-priority execution items.';
  }

  return 'No open work queue action required.';
}

function sciipGenerateWorkQueueDigestId_() {
  return 'WQ_DIGEST_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipTestWorkQueueDigestProcessor() {
  const result = sciipRunWorkQueueDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestWorkQueueDigestProcessor',
    result: result
  }));

  return result;
}
