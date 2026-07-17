/** SCIIP_OS compiled bundle: 11_other_005.gs
 * sources: 83
 * generated: 2026-07-17T17:22:40.580Z
 */
/************************************************************
 * 310_IntelligenceBriefingProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert forecasts, opportunities, actions, and trackers into
 * broker-readable intelligence briefings.
 *
 * Output:
 * - INTELLIGENCE_BRIEFING
 ************************************************************/

const SCIIP_INTELLIGENCE_BRIEFING_PROCESSOR = '310_IntelligenceBriefingProcessor';
const SCIIP_INTELLIGENCE_BRIEFING_SHEET = 'INTELLIGENCE_BRIEFING';

const SCIIP_INTELLIGENCE_BRIEFING_HEADERS = [
  'Briefing_ID',
  'Business_Key',
  'Briefing_Date',
  'Briefing_Type',
  'Market',
  'Submarket',
  'City',
  'Briefing_Title',
  'Briefing_Text',
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

function sciipRunIntelligenceBriefingProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_INTELLIGENCE_BRIEFING_SHEET, SCIIP_INTELLIGENCE_BRIEFING_HEADERS);

  const briefingSheet = ss.getSheetByName(SCIIP_INTELLIGENCE_BRIEFING_SHEET);
  const existingKeys = sciipGetExistingColumnValues_(briefingSheet, 'Business_Key');

  const groups = sciipBuildBriefingGroups_(ss);

  let groupsReviewed = 0;
  let briefingsCreated = 0;
  let skippedEmpty = 0;
  let skippedDuplicate = 0;

  Object.keys(groups).forEach(function(key) {
    const group = groups[key];
    groupsReviewed++;

    if (
      group.forecasts.length === 0 &&
      group.opportunities.length === 0 &&
      group.actions.length === 0
    ) {
      skippedEmpty++;
      return;
    }

    const briefing = sciipCreateIntelligenceBriefing_(group);

    if (existingKeys.has(briefing.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(briefingSheet, SCIIP_INTELLIGENCE_BRIEFING_HEADERS, briefing);
    existingKeys.add(briefing.Business_Key);
    briefingsCreated++;
  });

  const result = {
    processor: SCIIP_INTELLIGENCE_BRIEFING_PROCESSOR,
    status: 'SUCCESS',
    groupsReviewed: groupsReviewed,
    briefingsCreated: briefingsCreated,
    skippedEmpty: skippedEmpty,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * GROUPING
 ************************************************************/

function sciipBuildBriefingGroups_(ss) {
  const groups = {};

  const forecasts = sciipReadOptionalSheet_(ss, 'FORECAST').filter(function(r) {
    return String(r.Status || '').toUpperCase() === 'ACTIVE';
  });

  const opportunities = sciipReadOptionalSheet_(ss, 'OPPORTUNITY').filter(function(r) {
    return String(r.Status || '').toUpperCase() === 'OPEN';
  });

  const actions = sciipReadOptionalSheet_(ss, 'RECOMMENDED_ACTION').filter(function(r) {
    return String(r.Status || '').toUpperCase() === 'OPEN';
  });

  forecasts.forEach(function(f) {
    const group = sciipGetBriefingGroup_(groups, f);
    group.forecasts.push(f);
  });

  opportunities.forEach(function(o) {
    const group = sciipGetBriefingGroup_(groups, o);
    group.opportunities.push(o);
  });

  actions.forEach(function(a) {
    const group = sciipGetBriefingGroup_(groups, a);
    group.actions.push(a);
  });

  return groups;
}

function sciipGetBriefingGroup_(groups, row) {
  const market = row.Market || '';
  const submarket = row.Submarket || '';
  const city = row.City || '';

  const location = city || submarket || market || 'GLOBAL';
  const key = location.toUpperCase();

  if (!groups[key]) {
    groups[key] = {
      Market: market,
      Submarket: submarket,
      City: city,
      Location: location,
      forecasts: [],
      opportunities: [],
      actions: []
    };
  }

  return groups[key];
}

/************************************************************
 * BRIEFING FACTORY
 ************************************************************/

function sciipCreateIntelligenceBriefing_(group) {
  const now = new Date();
  const today = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  const criticalCount =
    sciipCountPriority_(group.opportunities, 'CRITICAL') +
    sciipCountPriority_(group.actions, 'CRITICAL');

  const highCount =
    sciipCountPriority_(group.opportunities, 'HIGH') +
    sciipCountPriority_(group.actions, 'HIGH');

  const title = sciipBuildBriefingTitle_(group);
  const text = sciipBuildBriefingText_(group, criticalCount, highCount);

  const keyBasis = [
    today,
    group.Location,
    group.forecasts.length,
    group.opportunities.length,
    group.actions.length,
    criticalCount,
    highCount
  ].join('|');

  const businessKey = 'INTELLIGENCE_BRIEFING|' + sciipStableHash_(keyBasis);

  return {
    Briefing_ID: 'IB_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Briefing_Date: today,
    Briefing_Type: 'MARKET_INTELLIGENCE_BRIEFING',
    Market: group.Market || '',
    Submarket: group.Submarket || '',
    City: group.City || '',
    Briefing_Title: title,
    Briefing_Text: text,
    Forecast_Count: group.forecasts.length,
    Opportunity_Count: group.opportunities.length,
    Open_Action_Count: group.actions.length,
    Critical_Count: criticalCount,
    High_Count: highCount,
    Status: 'ACTIVE',
    Created_At: now.toISOString(),
    Updated_At: now.toISOString(),
    Processor: SCIIP_INTELLIGENCE_BRIEFING_PROCESSOR,
    Notes: 'Generated from SCIIP autonomous intelligence stack.'
  };
}

/************************************************************
 * TEXT
 ************************************************************/

function sciipBuildBriefingTitle_(group) {
  return 'SCIIP Intelligence Briefing — ' + group.Location;
}

function sciipBuildBriefingText_(group, criticalCount, highCount) {
  const location = group.Location;

  const lines = [];

  lines.push(location + ' intelligence briefing generated from SCIIP autonomous outputs.');
  lines.push('Forecasts: ' + group.forecasts.length + '.');
  lines.push('Open opportunities: ' + group.opportunities.length + '.');
  lines.push('Open recommended actions: ' + group.actions.length + '.');

  if (criticalCount > 0) {
    lines.push('Critical items require immediate review: ' + criticalCount + '.');
  }

  if (highCount > 0) {
    lines.push('High-priority items require near-term follow-up: ' + highCount + '.');
  }

  const topOpportunity = sciipTopPriorityRow_(group.opportunities);
  if (topOpportunity) {
    lines.push('Top opportunity: ' + topOpportunity.Opportunity_Text);
  }

  const topAction = sciipTopPriorityRow_(group.actions);
  if (topAction) {
    lines.push('Recommended next action: ' + topAction.Recommended_Action);
  }

  return lines.join('\n');
}

/************************************************************
 * HELPERS
 ************************************************************/

function sciipReadOptionalSheet_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  return sciipReadSheetAsObjects_(sheet);
}

function sciipCountPriority_(rows, priority) {
  return rows.filter(function(r) {
    return String(r.Priority || '').toUpperCase() === priority;
  }).length;
}

function sciipTopPriorityRow_(rows) {
  if (!rows || !rows.length) return null;

  const rank = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  rows.sort(function(a, b) {
    const ar = rank[String(a.Priority || '').toUpperCase()] || 0;
    const br = rank[String(b.Priority || '').toUpperCase()] || 0;
    return br - ar;
  });

  return rows[0];
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestIntelligenceBriefingProcessor() {
  const result = sciipRunIntelligenceBriefingProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestIntelligenceBriefingProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3110_SuperSheetImportExecutionCompletionProcessor
 *******************************************************/

function sciipGet3110ProcessorName_() {
  return '3110_SuperSheetImportExecutionCompletion';
}

function sciipGet3110SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY';
}

function sciipGet3110TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS';
}

function sciipGet3110Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS';
}

function sciipGet3110Headers_() {
  return [
    'Completion_ID',
    'Business_Key',
    'Completion_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Active_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Completion_Status',
    'Completion_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3110TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3110TargetSheet_(),
    sciipGet3110Headers_()
  );
}

function sciipRun3110_SuperSheetImportExecutionCompletionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3110ProcessorName_(),
    action: sciipGet3110Action_(),
    sourceSheet: sciipGet3110SourceSheet_(),
    targetSheet: sciipGet3110TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution completion runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3110TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3110ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionCompletionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3100_SuperSheetImportExecutionStatusLedgerProcessor after execution status records are available.'
          })
        });
      }

      const completionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const completionBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_COMPLETION|' + completionDate;

      if (sciip3110BusinessKeyExists_(definition.targetSheet, completionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3110ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionCompletionStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            completionBusinessKey: completionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3110CountExecutionCompletionRecords_(sourceRecords);
      const posture = sciip3110ResolveCompletionPosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_' + Utilities.getUuid(),
        completionBusinessKey,
        completionDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.active,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3110ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3110ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionCompletionStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionActiveCount: counts.active,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionCompletionPosture: posture.posture,
          completionBusinessKey: completionBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3120_SuperSheetImportExecutionCompletionLedgerProcessor'
        })
      });
    }
  });
}

function sciip3110BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3110CountExecutionCompletionRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_STATUS_LEDGER_ACTIVE') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_ACTIVE') !== -1 ||
      statusText.indexOf('EXECUTION_ACTIVE') !== -1
    ) {
      counts.active += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { active: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3110ResolveCompletionPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_COMPLETION_BLOCKED',
      posture: 'IMPORT_EXECUTION_COMPLETION_BLOCKED',
      summary: 'SuperSheet import execution completion blocked by execution status ledger conditions.',
      nextAction: 'Review blocked execution status ledger records before completion.'
    };
  }

  if (counts.active > 0 && counts.active === total) {
    return {
      status: 'EXECUTION_COMPLETION_READY',
      posture: 'IMPORT_EXECUTION_COMPLETION_READY',
      summary: 'SuperSheet import execution is ready for completion.',
      nextAction: 'Proceed to SuperSheet import execution completion ledger summary.'
    };
  }

  if (counts.active > 0) {
    return {
      status: 'EXECUTION_COMPLETION_PARTIAL_READY',
      posture: 'IMPORT_EXECUTION_COMPLETION_REVIEW_REQUIRED',
      summary: 'Some execution status ledger records are active, but completion requires review.',
      nextAction: 'Review execution status ledger records before completion ledger summary.'
    };
  }

  return {
    status: 'EXECUTION_COMPLETION_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_COMPLETION_REVIEW_REQUIRED',
    summary: 'No active execution status ledger records were found for completion.',
    nextAction: 'Run upstream execution status ledger processor with active execution inputs.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3110_SuperSheetImportExecutionCompletionProcessor() {
  const result = sciipRun3110_SuperSheetImportExecutionCompletionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3110_SuperSheetImportExecutionCompletionProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3120_SuperSheetImportExecutionCompletionLedgerProcessor
 *******************************************************/

function sciipGet3120ProcessorName_() {
  return '3120_SuperSheetImportExecutionCompletionLedger';
}

function sciipGet3120SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS';
}

function sciipGet3120TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3120Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3120Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Completion_Ready_Count',
    'Completion_Blocked_Count',
    'Review_Required_Count',
    'Completion_Ledger_Status',
    'Completion_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3120TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3120TargetSheet_(),
    sciipGet3120Headers_()
  );
}

function sciipRun3120_SuperSheetImportExecutionCompletionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3120ProcessorName_(),
    action: sciipGet3120Action_(),
    sourceSheet: sciipGet3120SourceSheet_(),
    targetSheet: sciipGet3120TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution completion ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3120TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3120ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            completionLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3110_SuperSheetImportExecutionCompletionProcessor after 3100 creates execution status ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER|' + ledgerDate;

      if (sciip3120BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3120ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            completionLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3120CountCompletionRecords_(sourceRecords);
      const posture = sciip3120ResolveCompletionLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3120ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3120ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          completionLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          completionReadyCount: counts.ready,
          completionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          completionLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3130_SuperSheetImportExecutionFinalizationProcessor'
        })
      });
    }
  });
}

function sciip3120BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3120CountCompletionRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_COMPLETION_READY') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_COMPLETION_READY') !== -1 ||
      statusText.indexOf('COMPLETION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('COMPLETION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3120ResolveCompletionLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'COMPLETION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_COMPLETION_BLOCKED',
      summary:
        'SuperSheet import execution completion ledger recorded blocking conditions.',
      nextAction:
        'Review blocked completion records before import finalization.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'COMPLETION_LEDGER_READY',
      posture: 'IMPORT_FINALIZATION_READY',
      summary:
        'All SuperSheet import execution completion records are ready for finalization.',
      nextAction:
        'Proceed to SuperSheet import execution finalization.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'COMPLETION_LEDGER_PARTIAL_READY',
      posture: 'IMPORT_FINALIZATION_REVIEW_REQUIRED',
      summary:
        'Some completion records are ready, but finalization requires review.',
      nextAction:
        'Review completion records before import finalization.'
    };
  }

  return {
    status: 'COMPLETION_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_FINALIZATION_REVIEW_REQUIRED',
    summary:
      'No completion-ready SuperSheet import execution records were found.',
    nextAction:
      'Run upstream execution completion processor with active execution ledger input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3120_SuperSheetImportExecutionCompletionLedgerProcessor() {
  const result =
    sciipRun3120_SuperSheetImportExecutionCompletionLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3120_SuperSheetImportExecutionCompletionLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3130_SuperSheetImportExecutionFinalizationProcessor
 *******************************************************/

function sciipGet3130ProcessorName_() {
  return '3130_SuperSheetImportExecutionFinalization';
}

function sciipGet3130SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3130TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATIONS';
}

function sciipGet3130Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATIONS';
}

function sciipGet3130Headers_() {
  return [
    'Finalization_ID',
    'Business_Key',
    'Finalization_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Finalization_Ready_Count',
    'Finalization_Blocked_Count',
    'Review_Required_Count',
    'Finalization_Status',
    'Finalization_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3130TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3130TargetSheet_(),
    sciipGet3130Headers_()
  );
}

function sciipRun3130_SuperSheetImportExecutionFinalizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3130ProcessorName_(),
    action: sciipGet3130Action_(),
    sourceSheet: sciipGet3130SourceSheet_(),
    targetSheet: sciipGet3130TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution finalization runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3130TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3130ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            finalizationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3120_SuperSheetImportExecutionCompletionLedgerProcessor after 3110 creates completion records.'
          })
        });
      }

      const finalizationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const finalizationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION|' + finalizationDate;

      if (sciip3130BusinessKeyExists_(definition.targetSheet, finalizationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3130ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            finalizationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            finalizationBusinessKey: finalizationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3130CountFinalizationRecords_(sourceRecords);
      const posture = sciip3130ResolveFinalizationPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_' + Utilities.getUuid(),
        finalizationBusinessKey,
        finalizationDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3130ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3130ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          finalizationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          finalizationReadyCount: counts.ready,
          finalizationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          finalizationPosture: posture.posture,
          finalizationBusinessKey: finalizationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3140_SuperSheetImportExecutionFinalizationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3130BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3130CountFinalizationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('COMPLETION_LEDGER_READY') !== -1 ||
      statusText.indexOf('IMPORT_FINALIZATION_READY') !== -1 ||
      statusText.indexOf('FINALIZATION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('FINALIZATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3130ResolveFinalizationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FINALIZATION_BLOCKED',
      posture: 'IMPORT_FINALIZATION_BLOCKED',
      summary:
        'SuperSheet import execution finalization is blocked by completion ledger conditions.',
      nextAction:
        'Review blocked completion ledger records before finalization ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FINALIZATION_READY',
      posture: 'IMPORT_FINALIZATION_READY',
      summary:
        'SuperSheet import execution is ready for finalization.',
      nextAction:
        'Proceed to SuperSheet import execution finalization ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FINALIZATION_PARTIAL_READY',
      posture: 'IMPORT_FINALIZATION_REVIEW_REQUIRED',
      summary:
        'Some completion ledger records are ready, but finalization requires review.',
      nextAction:
        'Review completion ledger records before finalization ledger summary.'
    };
  }

  return {
    status: 'FINALIZATION_REVIEW_REQUIRED',
    posture: 'IMPORT_FINALIZATION_REVIEW_REQUIRED',
    summary:
      'No finalization-ready SuperSheet import execution completion ledger records were found.',
    nextAction:
      'Run upstream completion ledger processor with completion-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3130_SuperSheetImportExecutionFinalizationProcessor() {
  const result =
    sciipRun3130_SuperSheetImportExecutionFinalizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3130_SuperSheetImportExecutionFinalizationProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3140_SuperSheetImportExecutionFinalizationLedgerProcessor
 *******************************************************/

function sciipGet3140ProcessorName_() {
  return '3140_SuperSheetImportExecutionFinalizationLedger';
}

function sciipGet3140SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATIONS';
}

function sciipGet3140TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER_SUMMARY';
}

function sciipGet3140Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER_SUMMARY';
}

function sciipGet3140Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Finalization_Ready_Count',
    'Finalization_Blocked_Count',
    'Review_Required_Count',
    'Finalization_Ledger_Status',
    'Finalization_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3140TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3140TargetSheet_(),
    sciipGet3140Headers_()
  );
}

function sciipRun3140_SuperSheetImportExecutionFinalizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3140ProcessorName_(),
    action: sciipGet3140Action_(),
    sourceSheet: sciipGet3140SourceSheet_(),
    targetSheet: sciipGet3140TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution finalization ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3140TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3140ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            finalizationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3130_SuperSheetImportExecutionFinalizationProcessor after 3120 creates finalization-ready ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER|' + ledgerDate;

      if (sciip3140BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3140ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            finalizationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3140CountFinalizationLedgerRecords_(sourceRecords);
      const posture = sciip3140ResolveFinalizationLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3140ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3140ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          finalizationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          finalizationReadyCount: counts.ready,
          finalizationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          finalizationLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3150_SuperSheetImportExecutionArchiveProcessor'
        })
      });
    }
  });
}

function sciip3140BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3140CountFinalizationLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FINALIZATION_READY') !== -1 ||
      statusText.indexOf('IMPORT_FINALIZATION_READY') !== -1 ||
      statusText.indexOf('FINALIZATION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('FINALIZATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3140ResolveFinalizationLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FINALIZATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_ARCHIVE_BLOCKED',
      summary:
        'SuperSheet import execution finalization ledger recorded blocking conditions.',
      nextAction:
        'Review blocked finalization records before archive processing.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FINALIZATION_LEDGER_READY',
      posture: 'IMPORT_ARCHIVE_READY',
      summary:
        'All SuperSheet import execution finalization records are ready for archive processing.',
      nextAction:
        'Proceed to SuperSheet import execution archive processing.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FINALIZATION_LEDGER_PARTIAL_READY',
      posture: 'IMPORT_ARCHIVE_REVIEW_REQUIRED',
      summary:
        'Some finalization records are ready, but archive processing requires review.',
      nextAction:
        'Review finalization records before archive processing.'
    };
  }

  return {
    status: 'FINALIZATION_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_ARCHIVE_REVIEW_REQUIRED',
    summary:
      'No archive-ready SuperSheet import execution finalization records were found.',
    nextAction:
      'Run upstream finalization processor with finalization-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3140_SuperSheetImportExecutionFinalizationLedgerProcessor() {
  const result =
    sciipRun3140_SuperSheetImportExecutionFinalizationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3140_SuperSheetImportExecutionFinalizationLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3150_SuperSheetImportExecutionArchiveProcessor
 *******************************************************/

function sciipGet3150ProcessorName_() {
  return '3150_SuperSheetImportExecutionArchive';
}

function sciipGet3150SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER_SUMMARY';
}

function sciipGet3150TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVES';
}

function sciipGet3150Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVES';
}

function sciipGet3150Headers_() {
  return [
    'Archive_ID',
    'Business_Key',
    'Archive_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Archive_Ready_Count',
    'Archive_Blocked_Count',
    'Review_Required_Count',
    'Archive_Status',
    'Archive_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3150TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3150TargetSheet_(),
    sciipGet3150Headers_()
  );
}

function sciipRun3150_SuperSheetImportExecutionArchiveProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3150ProcessorName_(),
    action: sciipGet3150Action_(),
    sourceSheet: sciipGet3150SourceSheet_(),
    targetSheet: sciipGet3150TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution archive runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3150TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3150ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            archiveStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3140_SuperSheetImportExecutionFinalizationLedgerProcessor after 3130 creates finalization records.'
          })
        });
      }

      const archiveDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const archiveBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE|' + archiveDate;

      if (sciip3150BusinessKeyExists_(definition.targetSheet, archiveBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3150ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            archiveStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            archiveBusinessKey: archiveBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3150CountArchiveRecords_(sourceRecords);
      const posture = sciip3150ResolveArchivePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_' + Utilities.getUuid(),
        archiveBusinessKey,
        archiveDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3150ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3150ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          archiveStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          archiveReadyCount: counts.ready,
          archiveBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          archivePosture: posture.posture,
          archiveBusinessKey: archiveBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3160_SuperSheetImportExecutionArchiveLedgerProcessor'
        })
      });
    }
  });
}

function sciip3150BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3150CountArchiveRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FINALIZATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('IMPORT_ARCHIVE_READY') !== -1 ||
      statusText.indexOf('ARCHIVE_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('ARCHIVE_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3150ResolveArchivePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'ARCHIVE_BLOCKED',
      posture: 'IMPORT_ARCHIVE_BLOCKED',
      summary:
        'SuperSheet import execution archive processing is blocked by finalization ledger conditions.',
      nextAction:
        'Review blocked finalization ledger records before archive ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'ARCHIVE_READY',
      posture: 'IMPORT_ARCHIVE_READY',
      summary:
        'SuperSheet import execution is ready for archive processing.',
      nextAction:
        'Proceed to SuperSheet import execution archive ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'ARCHIVE_PARTIAL_READY',
      posture: 'IMPORT_ARCHIVE_REVIEW_REQUIRED',
      summary:
        'Some finalization ledger records are archive-ready, but archive processing requires review.',
      nextAction:
        'Review finalization ledger records before archive ledger summary.'
    };
  }

  return {
    status: 'ARCHIVE_REVIEW_REQUIRED',
    posture: 'IMPORT_ARCHIVE_REVIEW_REQUIRED',
    summary:
      'No archive-ready SuperSheet import execution finalization ledger records were found.',
    nextAction:
      'Run upstream finalization ledger processor with archive-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3150_SuperSheetImportExecutionArchiveProcessor() {
  const result = sciipRun3150_SuperSheetImportExecutionArchiveProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3150_SuperSheetImportExecutionArchiveProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3160_SuperSheetImportExecutionArchiveLedgerProcessor
 *******************************************************/

function sciipGet3160ProcessorName_() {
  return '3160_SuperSheetImportExecutionArchiveLedger';
}

function sciipGet3160SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVES';
}

function sciipGet3160TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER_SUMMARY';
}

function sciipGet3160Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER_SUMMARY';
}

function sciipGet3160Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Archive_Ready_Count',
    'Archive_Blocked_Count',
    'Review_Required_Count',
    'Archive_Ledger_Status',
    'Archive_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3160TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3160TargetSheet_(),
    sciipGet3160Headers_()
  );
}

function sciipRun3160_SuperSheetImportExecutionArchiveLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3160ProcessorName_(),
    action: sciipGet3160Action_(),
    sourceSheet: sciipGet3160SourceSheet_(),
    targetSheet: sciipGet3160TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution archive ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3160TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3160ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            archiveLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3150_SuperSheetImportExecutionArchiveProcessor after 3140 creates archive-ready finalization ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER|' + ledgerDate;

      if (sciip3160BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3160ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            archiveLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3160CountArchiveLedgerRecords_(sourceRecords);
      const posture = sciip3160ResolveArchiveLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3160ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3160ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          archiveLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          archiveReadyCount: counts.ready,
          archiveBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          archiveLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3170_SuperSheetImportExecutionReconciliationProcessor'
        })
      });
    }
  });
}

function sciip3160BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3160CountArchiveLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('ARCHIVE_READY') !== -1 ||
      statusText.indexOf('IMPORT_ARCHIVE_READY') !== -1 ||
      statusText.indexOf('ARCHIVE_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('ARCHIVE_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3160ResolveArchiveLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'ARCHIVE_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_RECONCILIATION_BLOCKED',
      summary:
        'SuperSheet import execution archive ledger recorded blocking conditions.',
      nextAction:
        'Review blocked archive records before execution reconciliation.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'ARCHIVE_LEDGER_READY',
      posture: 'IMPORT_RECONCILIATION_READY',
      summary:
        'All SuperSheet import execution archive records are ready for reconciliation.',
      nextAction:
        'Proceed to SuperSheet import execution reconciliation.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'ARCHIVE_LEDGER_PARTIAL_READY',
      posture: 'IMPORT_RECONCILIATION_REVIEW_REQUIRED',
      summary:
        'Some archive records are ready, but reconciliation requires review.',
      nextAction:
        'Review archive records before execution reconciliation.'
    };
  }

  return {
    status: 'ARCHIVE_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_RECONCILIATION_REVIEW_REQUIRED',
    summary:
      'No reconciliation-ready SuperSheet import execution archive records were found.',
    nextAction:
      'Run upstream archive processor with archive-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3160_SuperSheetImportExecutionArchiveLedgerProcessor() {
  const result =
    sciipRun3160_SuperSheetImportExecutionArchiveLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3160_SuperSheetImportExecutionArchiveLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3170_SuperSheetImportExecutionReconciliationProcessor
 *******************************************************/

function sciipGet3170ProcessorName_() {
  return '3170_SuperSheetImportExecutionReconciliation';
}

function sciipGet3170SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER_SUMMARY';
}

function sciipGet3170TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATIONS';
}

function sciipGet3170Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATIONS';
}

function sciipGet3170Headers_() {
  return [
    'Reconciliation_ID',
    'Business_Key',
    'Reconciliation_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Reconciliation_Ready_Count',
    'Reconciliation_Blocked_Count',
    'Review_Required_Count',
    'Reconciliation_Status',
    'Reconciliation_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3170TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3170TargetSheet_(),
    sciipGet3170Headers_()
  );
}

function sciipRun3170_SuperSheetImportExecutionReconciliationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3170ProcessorName_(),
    action: sciipGet3170Action_(),
    sourceSheet: sciipGet3170SourceSheet_(),
    targetSheet: sciipGet3170TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution reconciliation runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3170TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3170ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            reconciliationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3160_SuperSheetImportExecutionArchiveLedgerProcessor after 3150 creates archive records.'
          })
        });
      }

      const reconciliationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const reconciliationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION|' + reconciliationDate;

      if (sciip3170BusinessKeyExists_(definition.targetSheet, reconciliationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3170ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            reconciliationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            reconciliationBusinessKey: reconciliationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3170CountReconciliationRecords_(sourceRecords);
      const posture = sciip3170ResolveReconciliationPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_' + Utilities.getUuid(),
        reconciliationBusinessKey,
        reconciliationDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3170ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3170ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          reconciliationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          reconciliationReadyCount: counts.ready,
          reconciliationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          reconciliationPosture: posture.posture,
          reconciliationBusinessKey: reconciliationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3180_SuperSheetImportExecutionReconciliationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3170BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3170CountReconciliationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('ARCHIVE_LEDGER_READY') !== -1 ||
      statusText.indexOf('IMPORT_RECONCILIATION_READY') !== -1 ||
      statusText.indexOf('RECONCILIATION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('RECONCILIATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3170ResolveReconciliationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'RECONCILIATION_BLOCKED',
      posture: 'IMPORT_RECONCILIATION_BLOCKED',
      summary:
        'SuperSheet import execution reconciliation is blocked by archive ledger conditions.',
      nextAction:
        'Review blocked archive ledger records before reconciliation ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'RECONCILIATION_READY',
      posture: 'IMPORT_RECONCILIATION_READY',
      summary:
        'SuperSheet import execution is ready for reconciliation.',
      nextAction:
        'Proceed to SuperSheet import execution reconciliation ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'RECONCILIATION_PARTIAL_READY',
      posture: 'IMPORT_RECONCILIATION_REVIEW_REQUIRED',
      summary:
        'Some archive ledger records are reconciliation-ready, but reconciliation requires review.',
      nextAction:
        'Review archive ledger records before reconciliation ledger summary.'
    };
  }

  return {
    status: 'RECONCILIATION_REVIEW_REQUIRED',
    posture: 'IMPORT_RECONCILIATION_REVIEW_REQUIRED',
    summary:
      'No reconciliation-ready SuperSheet import execution archive ledger records were found.',
    nextAction:
      'Run upstream archive ledger processor with reconciliation-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3170_SuperSheetImportExecutionReconciliationProcessor() {
  const result =
    sciipRun3170_SuperSheetImportExecutionReconciliationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3170_SuperSheetImportExecutionReconciliationProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3180_SuperSheetImportExecutionReconciliationLedgerProcessor
 *******************************************************/

function sciipGet3180ProcessorName_() {
  return '3180_SuperSheetImportExecutionReconciliationLedger';
}

function sciipGet3180SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATIONS';
}

function sciipGet3180TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER_SUMMARY';
}

function sciipGet3180Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER_SUMMARY';
}

function sciipGet3180Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Reconciliation_Ready_Count',
    'Reconciliation_Blocked_Count',
    'Review_Required_Count',
    'Reconciliation_Ledger_Status',
    'Reconciliation_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3180TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3180TargetSheet_(),
    sciipGet3180Headers_()
  );
}

function sciipRun3180_SuperSheetImportExecutionReconciliationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3180ProcessorName_(),
    action: sciipGet3180Action_(),
    sourceSheet: sciipGet3180SourceSheet_(),
    targetSheet: sciipGet3180TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution reconciliation ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3180TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3180ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            reconciliationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3170_SuperSheetImportExecutionReconciliationProcessor after 3160 creates reconciliation-ready archive ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER|' + ledgerDate;

      if (sciip3180BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3180ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            reconciliationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3180CountReconciliationLedgerRecords_(sourceRecords);
      const posture = sciip3180ResolveReconciliationLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3180ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3180ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          reconciliationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          reconciliationReadyCount: counts.ready,
          reconciliationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          reconciliationLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor'
        })
      });
    }
  });
}

function sciip3180BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3180CountReconciliationLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('RECONCILIATION_READY') !== -1 ||
      statusText.indexOf('IMPORT_RECONCILIATION_READY') !== -1 ||
      statusText.indexOf('RECONCILIATION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('RECONCILIATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3180ResolveReconciliationLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'RECONCILIATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'POST_RECONCILIATION_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution reconciliation ledger recorded blocking conditions.',
      nextAction:
        'Review blocked reconciliation records before post-reconciliation certification.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'RECONCILIATION_LEDGER_READY',
      posture: 'POST_RECONCILIATION_CERTIFICATION_READY',
      summary:
        'All SuperSheet import execution reconciliation records are ready for post-reconciliation certification.',
      nextAction:
        'Proceed to SuperSheet import execution post-reconciliation certification.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'RECONCILIATION_LEDGER_PARTIAL_READY',
      posture: 'POST_RECONCILIATION_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some reconciliation records are ready, but post-reconciliation certification requires review.',
      nextAction:
        'Review reconciliation records before post-reconciliation certification.'
    };
  }

  return {
    status: 'RECONCILIATION_LEDGER_REVIEW_REQUIRED',
    posture: 'POST_RECONCILIATION_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No certification-ready SuperSheet import execution reconciliation records were found.',
    nextAction:
      'Run upstream reconciliation processor with reconciliation-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3180_SuperSheetImportExecutionReconciliationLedgerProcessor() {
  const result =
    sciipRun3180_SuperSheetImportExecutionReconciliationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3180_SuperSheetImportExecutionReconciliationLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor
 *******************************************************/

function sciipGet3190ProcessorName_() {
  return '3190_SuperSheetImportExecutionPostReconciliationCertification';
}

function sciipGet3190SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER_SUMMARY';
}

function sciipGet3190TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATIONS';
}

function sciipGet3190Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATIONS';
}

function sciipGet3190Headers_() {
  return [
    'Certification_ID',
    'Business_Key',
    'Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Ready_Count',
    'Certification_Blocked_Count',
    'Review_Required_Count',
    'Certification_Status',
    'Certification_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3190TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3190TargetSheet_(),
    sciipGet3190Headers_()
  );
}

function sciipRun3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3190ProcessorName_(),
    action: sciipGet3190Action_(),
    sourceSheet: sciipGet3190SourceSheet_(),
    targetSheet: sciipGet3190TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution post-reconciliation certification runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3190TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3190ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            certificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3180_SuperSheetImportExecutionReconciliationLedgerProcessor after 3170 creates reconciliation records.'
          })
        });
      }

      const certificationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const certificationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION|' +
        certificationDate;

      if (sciip3190BusinessKeyExists_(definition.targetSheet, certificationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3190ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            certificationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            certificationBusinessKey: certificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3190CountCertificationRecords_(sourceRecords);
      const posture = sciip3190ResolveCertificationPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_' +
          Utilities.getUuid(),
        certificationBusinessKey,
        certificationDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3190ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3190ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          certificationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          certificationReadyCount: counts.ready,
          certificationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          certificationPosture: posture.posture,
          certificationBusinessKey: certificationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3190BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3190CountCertificationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('RECONCILIATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('POST_RECONCILIATION_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('CERTIFICATION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('CERTIFICATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3190ResolveCertificationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_BLOCKED',
      posture: 'POST_RECONCILIATION_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution post-reconciliation certification is blocked by reconciliation ledger conditions.',
      nextAction:
        'Review blocked reconciliation ledger records before certification ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_READY',
      posture: 'POST_RECONCILIATION_CERTIFICATION_READY',
      summary:
        'SuperSheet import execution reconciliation ledger is ready for post-reconciliation certification.',
      nextAction:
        'Proceed to post-reconciliation certification ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_PARTIAL_READY',
      posture: 'POST_RECONCILIATION_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some reconciliation ledger records are certification-ready, but post-reconciliation certification requires review.',
      nextAction:
        'Review reconciliation ledger records before certification ledger summary.'
    };
  }

  return {
    status: 'POST_RECONCILIATION_CERTIFICATION_REVIEW_REQUIRED',
    posture: 'POST_RECONCILIATION_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No certification-ready SuperSheet import execution reconciliation ledger records were found.',
    nextAction:
      'Run upstream reconciliation ledger processor with certification-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor() {
  const result =
    sciipRun3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor
 *******************************************************/

function sciipGet3200ProcessorName_() {
  return '3200_SuperSheetImportExecutionPostReconciliationCertificationLedger';
}

function sciipGet3200SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATIONS';
}

function sciipGet3200TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3200Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3200Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Ready_Count',
    'Certification_Blocked_Count',
    'Review_Required_Count',
    'Certification_Ledger_Status',
    'Certification_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3200TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3200TargetSheet_(),
    sciipGet3200Headers_()
  );
}

function sciipRun3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3200ProcessorName_(),
    action: sciipGet3200Action_(),
    sourceSheet: sciipGet3200SourceSheet_(),
    targetSheet: sciipGet3200TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution post-reconciliation certification ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3200TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3200ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            certificationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor after 3180 creates reconciliation ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER|' +
        ledgerDate;

      if (sciip3200BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3200ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            certificationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3200CountCertificationLedgerRecords_(sourceRecords);
      const posture = sciip3200ResolveCertificationLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER_' +
          Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3200ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3200ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          certificationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          certificationReadyCount: counts.ready,
          certificationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          certificationLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3210_SuperSheetImportExecutionCloseoutProcessor'
        })
      });
    }
  });
}

function sciip3200BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3200CountCertificationLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('POST_RECONCILIATION_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('POST_RECONCILIATION_CERTIFICATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('CERTIFICATION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('CERTIFICATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3200ResolveCertificationLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_CLOSEOUT_BLOCKED',
      summary:
        'SuperSheet import execution post-reconciliation certification ledger recorded blocking conditions.',
      nextAction:
        'Review blocked certification records before import execution closeout.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_LEDGER_READY',
      posture: 'IMPORT_CLOSEOUT_READY',
      summary:
        'All post-reconciliation certification records are ready for import execution closeout.',
      nextAction:
        'Proceed to SuperSheet import execution closeout.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_LEDGER_PARTIAL_READY',
      posture: 'IMPORT_CLOSEOUT_REVIEW_REQUIRED',
      summary:
        'Some post-reconciliation certification records are ready, but import execution closeout requires review.',
      nextAction:
        'Review post-reconciliation certification records before import execution closeout.'
    };
  }

  return {
    status: 'POST_RECONCILIATION_CERTIFICATION_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_CLOSEOUT_REVIEW_REQUIRED',
    summary:
      'No closeout-ready post-reconciliation certification records were found.',
    nextAction:
      'Run upstream post-reconciliation certification processor with certification-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor() {
  const result =
    sciipRun3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor',
    result: result
  }));

  return result;
}

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

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3210_SuperSheetImportExecutionCloseoutProcessor
 *******************************************************/

function sciipGet3210ProcessorName_() {
  return '3210_SuperSheetImportExecutionCloseout';
}

function sciipGet3210SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3210TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUTS';
}

function sciipGet3210Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUTS';
}

function sciipGet3210Headers_() {
  return [
    'Closeout_ID',
    'Business_Key',
    'Closeout_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Closeout_Ready_Count',
    'Closeout_Blocked_Count',
    'Review_Required_Count',
    'Closeout_Status',
    'Closeout_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3210TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3210TargetSheet_(),
    sciipGet3210Headers_()
  );
}

function sciipRun3210_SuperSheetImportExecutionCloseoutProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3210ProcessorName_(),
    action: sciipGet3210Action_(),
    sourceSheet: sciipGet3210SourceSheet_(),
    targetSheet: sciipGet3210TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution closeout runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3210TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3210ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            closeoutStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor after 3190 creates certification records.'
          })
        });
      }

      const closeoutDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const closeoutBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT|' + closeoutDate;

      if (sciip3210BusinessKeyExists_(definition.targetSheet, closeoutBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3210ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            closeoutStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            closeoutBusinessKey: closeoutBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3210CountCloseoutRecords_(sourceRecords);
      const posture = sciip3210ResolveCloseoutPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_' + Utilities.getUuid(),
        closeoutBusinessKey,
        closeoutDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3210ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3210ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          closeoutStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          closeoutReadyCount: counts.ready,
          closeoutBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          closeoutPosture: posture.posture,
          closeoutBusinessKey: closeoutBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3220_SuperSheetImportExecutionCloseoutLedgerProcessor'
        })
      });
    }
  });
}

function sciip3210BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3210CountCloseoutRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('IMPORT_CLOSEOUT_READY') !== -1 ||
      statusText.indexOf('POST_RECONCILIATION_CERTIFICATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('CLOSEOUT_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('CLOSEOUT_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3210ResolveCloseoutPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'CLOSEOUT_BLOCKED',
      posture: 'IMPORT_CLOSEOUT_BLOCKED',
      summary:
        'SuperSheet import execution closeout is blocked by post-reconciliation certification ledger conditions.',
      nextAction:
        'Review blocked certification ledger records before closeout ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'CLOSEOUT_READY',
      posture: 'IMPORT_CLOSEOUT_READY',
      summary:
        'SuperSheet import execution is ready for closeout.',
      nextAction:
        'Proceed to SuperSheet import execution closeout ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'CLOSEOUT_PARTIAL_READY',
      posture: 'IMPORT_CLOSEOUT_REVIEW_REQUIRED',
      summary:
        'Some post-reconciliation certification ledger records are closeout-ready, but closeout requires review.',
      nextAction:
        'Review certification ledger records before closeout ledger summary.'
    };
  }

  return {
    status: 'CLOSEOUT_REVIEW_REQUIRED',
    posture: 'IMPORT_CLOSEOUT_REVIEW_REQUIRED',
    summary:
      'No closeout-ready SuperSheet import execution certification ledger records were found.',
    nextAction:
      'Run upstream post-reconciliation certification ledger processor with closeout-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3210_SuperSheetImportExecutionCloseoutProcessor() {
  const result =
    sciipRun3210_SuperSheetImportExecutionCloseoutProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3210_SuperSheetImportExecutionCloseoutProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3220_SuperSheetImportExecutionCloseoutLedgerProcessor
 *******************************************************/

function sciipGet3220ProcessorName_() {
  return '3220_SuperSheetImportExecutionCloseoutLedger';
}

function sciipGet3220SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUTS';
}

function sciipGet3220TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER_SUMMARY';
}

function sciipGet3220Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER_SUMMARY';
}

function sciipGet3220Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Closeout_Ready_Count',
    'Closeout_Blocked_Count',
    'Review_Required_Count',
    'Closeout_Ledger_Status',
    'Closeout_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3220TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3220TargetSheet_(),
    sciipGet3220Headers_()
  );
}

function sciipRun3220_SuperSheetImportExecutionCloseoutLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3220ProcessorName_(),
    action: sciipGet3220Action_(),
    sourceSheet: sciipGet3220SourceSheet_(),
    targetSheet: sciipGet3220TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution closeout ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3220TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3220ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            closeoutLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3210_SuperSheetImportExecutionCloseoutProcessor after 3200 creates closeout-ready certification ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER|' + ledgerDate;

      if (sciip3220BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3220ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            closeoutLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3220CountCloseoutLedgerRecords_(sourceRecords);
      const posture = sciip3220ResolveCloseoutLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3220ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3220ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          closeoutLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          closeoutReadyCount: counts.ready,
          closeoutBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          closeoutLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3230_SuperSheetImportExecutionFirewallCompletionProcessor'
        })
      });
    }
  });
}

function sciip3220BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3220CountCloseoutLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('CLOSEOUT_READY') !== -1 ||
      statusText.indexOf('IMPORT_CLOSEOUT_READY') !== -1 ||
      statusText.indexOf('CLOSEOUT_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('CLOSEOUT_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3220ResolveCloseoutLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'CLOSEOUT_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'FIREWALL_COMPLETION_BLOCKED',
      summary:
        'SuperSheet import execution closeout ledger recorded blocking conditions.',
      nextAction:
        'Review blocked closeout records before firewall completion.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'CLOSEOUT_LEDGER_READY',
      posture: 'FIREWALL_COMPLETION_READY',
      summary:
        'All SuperSheet import execution closeout records are ready for firewall completion.',
      nextAction:
        'Proceed to SuperSheet import execution firewall completion.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'CLOSEOUT_LEDGER_PARTIAL_READY',
      posture: 'FIREWALL_COMPLETION_REVIEW_REQUIRED',
      summary:
        'Some closeout records are ready, but firewall completion requires review.',
      nextAction:
        'Review closeout records before firewall completion.'
    };
  }

  return {
    status: 'CLOSEOUT_LEDGER_REVIEW_REQUIRED',
    posture: 'FIREWALL_COMPLETION_REVIEW_REQUIRED',
    summary:
      'No firewall-completion-ready SuperSheet import execution closeout records were found.',
    nextAction:
      'Run upstream closeout processor with closeout-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3220_SuperSheetImportExecutionCloseoutLedgerProcessor() {
  const result =
    sciipRun3220_SuperSheetImportExecutionCloseoutLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3220_SuperSheetImportExecutionCloseoutLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3230_SuperSheetImportExecutionFirewallCompletionProcessor
 *******************************************************/

function sciipGet3230ProcessorName_() {
  return '3230_SuperSheetImportExecutionFirewallCompletion';
}

function sciipGet3230SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER_SUMMARY';
}

function sciipGet3230TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETIONS';
}

function sciipGet3230Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETIONS';
}

function sciipGet3230Headers_() {
  return [
    'Firewall_Completion_ID',
    'Business_Key',
    'Firewall_Completion_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Firewall_Completion_Ready_Count',
    'Firewall_Completion_Blocked_Count',
    'Review_Required_Count',
    'Firewall_Completion_Status',
    'Firewall_Completion_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3230TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3230TargetSheet_(),
    sciipGet3230Headers_()
  );
}

function sciipRun3230_SuperSheetImportExecutionFirewallCompletionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3230ProcessorName_(),
    action: sciipGet3230Action_(),
    sourceSheet: sciipGet3230SourceSheet_(),
    targetSheet: sciipGet3230TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution firewall completion runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3230TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3230ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            firewallCompletionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3220_SuperSheetImportExecutionCloseoutLedgerProcessor after 3210 creates closeout records.'
          })
        });
      }

      const firewallCompletionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const firewallCompletionBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION|' +
        firewallCompletionDate;

      if (
        sciip3230BusinessKeyExists_(
          definition.targetSheet,
          firewallCompletionBusinessKey
        )
      ) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3230ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            firewallCompletionStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            firewallCompletionBusinessKey: firewallCompletionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3230CountFirewallCompletionRecords_(sourceRecords);
      const posture = sciip3230ResolveFirewallCompletionPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_' + Utilities.getUuid(),
        firewallCompletionBusinessKey,
        firewallCompletionDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3230ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3230ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          firewallCompletionStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          firewallCompletionReadyCount: counts.ready,
          firewallCompletionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          firewallCompletionPosture: posture.posture,
          firewallCompletionBusinessKey: firewallCompletionBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor'
        })
      });
    }
  });
}

function sciip3230BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3230CountFirewallCompletionRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FIREWALL_COMPLETION_READY') !== -1 ||
      statusText.indexOf('CLOSEOUT_LEDGER_READY') !== -1 ||
      statusText.indexOf('IMPORT_FIREWALL_COMPLETION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('FIREWALL_COMPLETION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3230ResolveFirewallCompletionPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FIREWALL_COMPLETION_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_COMPLETION_BLOCKED',
      summary:
        'SuperSheet import execution firewall completion is blocked by closeout ledger conditions.',
      nextAction:
        'Review blocked closeout ledger records before firewall completion ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FIREWALL_COMPLETION_READY',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_COMPLETION_READY',
      summary:
        'SuperSheet import execution firewall is ready for completion.',
      nextAction:
        'Proceed to SuperSheet import execution firewall completion ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FIREWALL_COMPLETION_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_COMPLETION_REVIEW_REQUIRED',
      summary:
        'Some closeout ledger records are firewall-completion-ready, but firewall completion requires review.',
      nextAction:
        'Review closeout ledger records before firewall completion ledger summary.'
    };
  }

  return {
    status: 'FIREWALL_COMPLETION_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_FIREWALL_COMPLETION_REVIEW_REQUIRED',
    summary:
      'No firewall-completion-ready SuperSheet import execution closeout ledger records were found.',
    nextAction:
      'Run upstream closeout ledger processor with firewall-completion-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3230_SuperSheetImportExecutionFirewallCompletionProcessor() {
  const result =
    sciipRun3230_SuperSheetImportExecutionFirewallCompletionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3230_SuperSheetImportExecutionFirewallCompletionProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor
 *******************************************************/

function sciipGet3240ProcessorName_() {
  return '3240_SuperSheetImportExecutionFirewallCompletionLedger';
}

function sciipGet3240SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETIONS';
}

function sciipGet3240TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3240Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3240Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Firewall_Completion_Ready_Count',
    'Firewall_Completion_Blocked_Count',
    'Review_Required_Count',
    'Firewall_Completion_Ledger_Status',
    'Firewall_Completion_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3240TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3240TargetSheet_(),
    sciipGet3240Headers_()
  );
}

function sciipRun3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3240ProcessorName_(),
    action: sciipGet3240Action_(),
    sourceSheet: sciipGet3240SourceSheet_(),
    targetSheet: sciipGet3240TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution firewall completion ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3240TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3240ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            firewallCompletionLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3230_SuperSheetImportExecutionFirewallCompletionProcessor after 3220 creates firewall-completion-ready closeout ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER|' +
        ledgerDate;

      if (sciip3240BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3240ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            firewallCompletionLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3240CountFirewallCompletionLedgerRecords_(sourceRecords);
      const posture = sciip3240ResolveFirewallCompletionLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER_' +
          Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3240ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3240ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          firewallCompletionLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          firewallCompletionReadyCount: counts.ready,
          firewallCompletionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          firewallCompletionLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor'
        })
      });
    }
  });
}

function sciip3240BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3240CountFirewallCompletionLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FIREWALL_COMPLETION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_FIREWALL_COMPLETION_READY') !== -1 ||
      statusText.indexOf('FIREWALL_COMPLETION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('FIREWALL_COMPLETION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3240ResolveFirewallCompletionLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FIREWALL_COMPLETION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'FIREWALL_FINAL_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution firewall completion ledger recorded blocking conditions.',
      nextAction:
        'Review blocked firewall completion records before final firewall certification.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FIREWALL_COMPLETION_LEDGER_READY',
      posture: 'FIREWALL_FINAL_CERTIFICATION_READY',
      summary:
        'All SuperSheet import execution firewall completion records are ready for final firewall certification.',
      nextAction:
        'Proceed to SuperSheet import execution firewall final certification.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FIREWALL_COMPLETION_LEDGER_PARTIAL_READY',
      posture: 'FIREWALL_FINAL_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some firewall completion records are ready, but final firewall certification requires review.',
      nextAction:
        'Review firewall completion records before final firewall certification.'
    };
  }

  return {
    status: 'FIREWALL_COMPLETION_LEDGER_REVIEW_REQUIRED',
    posture: 'FIREWALL_FINAL_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No final-certification-ready SuperSheet import execution firewall completion records were found.',
    nextAction:
      'Run upstream firewall completion processor with firewall-completion-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor() {
  const result =
    sciipRun3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor
 *******************************************************/

function sciipGet3250ProcessorName_() {
  return '3250_SuperSheetImportExecutionFirewallFinalCertification';
}

function sciipGet3250SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3250TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATIONS';
}

function sciipGet3250Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATIONS';
}

function sciipGet3250Headers_() {
  return [
    'Final_Certification_ID',
    'Business_Key',
    'Final_Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Final_Certification_Ready_Count',
    'Final_Certification_Blocked_Count',
    'Review_Required_Count',
    'Final_Certification_Status',
    'Final_Certification_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3250TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3250TargetSheet_(),
    sciipGet3250Headers_()
  );
}

function sciipRun3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3250ProcessorName_(),
    action: sciipGet3250Action_(),
    sourceSheet: sciipGet3250SourceSheet_(),
    targetSheet: sciipGet3250TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution firewall final certification runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3250TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3250ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            finalCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor after 3230 creates firewall completion records.'
          })
        });
      }

      const certificationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const certificationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION|' +
        certificationDate;

      if (sciip3250BusinessKeyExists_(definition.targetSheet, certificationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3250ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            finalCertificationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            certificationBusinessKey: certificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3250CountFinalCertificationRecords_(sourceRecords);
      const posture = sciip3250ResolveFinalCertificationPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_' +
          Utilities.getUuid(),
        certificationBusinessKey,
        certificationDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3250ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3250ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          finalCertificationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          finalCertificationReadyCount: counts.ready,
          finalCertificationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          finalCertificationPosture: posture.posture,
          certificationBusinessKey: certificationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3250BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3250CountFinalCertificationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FIREWALL_COMPLETION_LEDGER_READY') !== -1 ||
      statusText.indexOf('FIREWALL_FINAL_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('FINAL_CERTIFICATION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('FINAL_CERTIFICATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3250ResolveFinalCertificationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_FINAL_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution firewall final certification is blocked by firewall completion ledger conditions.',
      nextAction:
        'Review blocked firewall completion ledger records before final certification ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_READY',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_FINAL_CERTIFICATION_READY',
      summary:
        'SuperSheet import execution firewall is ready for final certification.',
      nextAction:
        'Proceed to SuperSheet import execution firewall final certification ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_FINAL_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some firewall completion ledger records are final-certification-ready, but final certification requires review.',
      nextAction:
        'Review firewall completion ledger records before final certification ledger summary.'
    };
  }

  return {
    status: 'FIREWALL_FINAL_CERTIFICATION_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_FIREWALL_FINAL_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No final-certification-ready SuperSheet import execution firewall completion ledger records were found.',
    nextAction:
      'Run upstream firewall completion ledger processor with final-certification-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor() {
  const result =
    sciipRun3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor
 *******************************************************/

function sciipGet3260ProcessorName_() {
  return '3260_SuperSheetImportExecutionFirewallFinalCertificationLedger';
}

function sciipGet3260SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATIONS';
}

function sciipGet3260TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3260Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3260Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Final_Certification_Ready_Count',
    'Final_Certification_Blocked_Count',
    'Review_Required_Count',
    'Final_Certification_Ledger_Status',
    'Final_Certification_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3260TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3260TargetSheet_(),
    sciipGet3260Headers_()
  );
}

function sciipRun3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3260ProcessorName_(),
    action: sciipGet3260Action_(),
    sourceSheet: sciipGet3260SourceSheet_(),
    targetSheet: sciipGet3260TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution firewall final certification ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3260TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3260ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            finalCertificationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor after 3240 creates firewall completion ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER|' +
        ledgerDate;

      if (sciip3260BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3260ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            finalCertificationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3260CountFinalCertificationLedgerRecords_(sourceRecords);
      const posture = sciip3260ResolveFinalCertificationLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER_' +
          Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3260ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3260ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          finalCertificationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          finalCertificationReadyCount: counts.ready,
          finalCertificationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          finalCertificationLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3270_SuperSheetImportExecutionProductionHandoffProcessor'
        })
      });
    }
  });
}

function sciip3260BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3260CountFinalCertificationLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FIREWALL_FINAL_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_FIREWALL_FINAL_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('FINAL_CERTIFICATION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('FINAL_CERTIFICATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3260ResolveFinalCertificationLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_HANDOFF_BLOCKED',
      summary:
        'SuperSheet import execution firewall final certification ledger recorded blocking conditions.',
      nextAction:
        'Review blocked final certification records before production handoff.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_LEDGER_READY',
      posture: 'PRODUCTION_HANDOFF_READY',
      summary:
        'All SuperSheet import execution firewall final certification records are ready for production handoff.',
      nextAction:
        'Proceed to SuperSheet import execution production handoff.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_HANDOFF_REVIEW_REQUIRED',
      summary:
        'Some final certification records are ready, but production handoff requires review.',
      nextAction:
        'Review final certification records before production handoff.'
    };
  }

  return {
    status: 'FIREWALL_FINAL_CERTIFICATION_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_HANDOFF_REVIEW_REQUIRED',
    summary:
      'No production-handoff-ready SuperSheet import execution final certification records were found.',
    nextAction:
      'Run upstream final certification processor with final-certification-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor() {
  const result =
    sciipRun3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3270_SuperSheetImportExecutionProductionHandoffProcessor
 *******************************************************/

function sciipGet3270ProcessorName_() {
  return '3270_SuperSheetImportExecutionProductionHandoff';
}

function sciipGet3270SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3270TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFFS';
}

function sciipGet3270Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFFS';
}

function sciipGet3270Headers_() {
  return [
    'Production_Handoff_ID',
    'Business_Key',
    'Production_Handoff_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Production_Handoff_Ready_Count',
    'Production_Handoff_Blocked_Count',
    'Review_Required_Count',
    'Production_Handoff_Status',
    'Production_Handoff_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3270TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3270TargetSheet_(),
    sciipGet3270Headers_()
  );
}

function sciipRun3270_SuperSheetImportExecutionProductionHandoffProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3270ProcessorName_(),
    action: sciipGet3270Action_(),
    sourceSheet: sciipGet3270SourceSheet_(),
    targetSheet: sciipGet3270TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production handoff runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3270TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3270ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionHandoffStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor after 3250 creates final certification records.'
          })
        });
      }

      const handoffDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const handoffBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF|' + handoffDate;

      if (sciip3270BusinessKeyExists_(definition.targetSheet, handoffBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3270ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionHandoffStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            handoffBusinessKey: handoffBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3270CountProductionHandoffRecords_(sourceRecords);
      const posture = sciip3270ResolveProductionHandoffPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_' + Utilities.getUuid(),
        handoffBusinessKey,
        handoffDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3270ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3270ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionHandoffStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          productionHandoffReadyCount: counts.ready,
          productionHandoffBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          productionHandoffPosture: posture.posture,
          handoffBusinessKey: handoffBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor'
        })
      });
    }
  });
}

function sciip3270BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3270CountProductionHandoffRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FIREWALL_FINAL_CERTIFICATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_HANDOFF_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_HANDOFF_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3270ResolveProductionHandoffPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_HANDOFF_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_BLOCKED',
      summary:
        'SuperSheet import execution production handoff is blocked by final certification ledger conditions.',
      nextAction:
        'Review blocked final certification ledger records before production handoff ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_HANDOFF_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_READY',
      summary:
        'SuperSheet import execution is ready for production handoff.',
      nextAction:
        'Proceed to SuperSheet import execution production handoff ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_HANDOFF_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_REVIEW_REQUIRED',
      summary:
        'Some final certification ledger records are production-handoff-ready, but production handoff requires review.',
      nextAction:
        'Review final certification ledger records before production handoff ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_HANDOFF_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_REVIEW_REQUIRED',
    summary:
      'No production-handoff-ready SuperSheet import execution final certification ledger records were found.',
    nextAction:
      'Run upstream final certification ledger processor with production-handoff-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3270_SuperSheetImportExecutionProductionHandoffProcessor() {
  const result =
    sciipRun3270_SuperSheetImportExecutionProductionHandoffProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3270_SuperSheetImportExecutionProductionHandoffProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor
 *******************************************************/

function sciipGet3280ProcessorName_() {
  return '3280_SuperSheetImportExecutionProductionHandoffLedger';
}

function sciipGet3280SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFFS';
}

function sciipGet3280TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet3280Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet3280Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Production_Handoff_Ready_Count',
    'Production_Handoff_Blocked_Count',
    'Review_Required_Count',
    'Production_Handoff_Ledger_Status',
    'Production_Handoff_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3280TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3280TargetSheet_(),
    sciipGet3280Headers_()
  );
}

function sciipRun3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3280ProcessorName_(),
    action: sciipGet3280Action_(),
    sourceSheet: sciipGet3280SourceSheet_(),
    targetSheet: sciipGet3280TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production handoff ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3280TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3280ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionHandoffLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3270_SuperSheetImportExecutionProductionHandoffProcessor after 3260 creates production-handoff-ready final certification ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER|' +
        ledgerDate;

      if (sciip3280BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3280ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionHandoffLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3280CountProductionHandoffLedgerRecords_(sourceRecords);
      const posture = sciip3280ResolveProductionHandoffLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER_' +
          Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3280ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3280ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionHandoffLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          productionHandoffReadyCount: counts.ready,
          productionHandoffBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          productionHandoffLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3290_SuperSheetImportExecutionProductionAcceptanceProcessor'
        })
      });
    }
  });
}

function sciip3280BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3280CountProductionHandoffLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_HANDOFF_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_HANDOFF_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_HANDOFF_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3280ResolveProductionHandoffLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_HANDOFF_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_ACCEPTANCE_BLOCKED',
      summary:
        'SuperSheet import execution production handoff ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production handoff records before production acceptance.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_HANDOFF_LEDGER_READY',
      posture: 'PRODUCTION_ACCEPTANCE_READY',
      summary:
        'All SuperSheet import execution production handoff records are ready for production acceptance.',
      nextAction:
        'Proceed to SuperSheet import execution production acceptance.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_HANDOFF_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_ACCEPTANCE_REVIEW_REQUIRED',
      summary:
        'Some production handoff records are ready, but production acceptance requires review.',
      nextAction:
        'Review production handoff records before production acceptance.'
    };
  }

  return {
    status: 'PRODUCTION_HANDOFF_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_ACCEPTANCE_REVIEW_REQUIRED',
    summary:
      'No production-acceptance-ready SuperSheet import execution production handoff records were found.',
    nextAction:
      'Run upstream production handoff processor with production-handoff-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor() {
  const result =
    sciipRun3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3290_SuperSheetImportExecutionProductionAcceptanceProcessor
 *******************************************************/

function sciipGet3290ProcessorName_() {
  return '3290_SuperSheetImportExecutionProductionAcceptance';
}

function sciipGet3290SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet3290TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCES';
}

function sciipGet3290Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCES';
}

function sciipGet3290Headers_() {
  return [
    'Production_Acceptance_ID',
    'Business_Key',
    'Production_Acceptance_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Production_Acceptance_Ready_Count',
    'Production_Acceptance_Blocked_Count',
    'Review_Required_Count',
    'Production_Acceptance_Status',
    'Production_Acceptance_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3290TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3290TargetSheet_(),
    sciipGet3290Headers_()
  );
}

function sciipRun3290_SuperSheetImportExecutionProductionAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3290ProcessorName_(),
    action: sciipGet3290Action_(),
    sourceSheet: sciipGet3290SourceSheet_(),
    targetSheet: sciipGet3290TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production acceptance runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3290TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3290ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionAcceptanceStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor after 3270 creates production handoff records.'
          })
        });
      }

      const acceptanceDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const acceptanceBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE|' + acceptanceDate;

      if (sciip3290BusinessKeyExists_(definition.targetSheet, acceptanceBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3290ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionAcceptanceStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            acceptanceBusinessKey: acceptanceBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3290CountProductionAcceptanceRecords_(sourceRecords);
      const posture = sciip3290ResolveProductionAcceptancePosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_' + Utilities.getUuid(),
        acceptanceBusinessKey,
        acceptanceDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3290ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3290ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionAcceptanceStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          productionAcceptanceReadyCount: counts.ready,
          productionAcceptanceBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          productionAcceptancePosture: posture.posture,
          acceptanceBusinessKey: acceptanceBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor'
        })
      });
    }
  });
}

function sciip3290BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3290CountProductionAcceptanceRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_HANDOFF_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_ACCEPTANCE_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_ACCEPTANCE_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3290ResolveProductionAcceptancePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_BLOCKED',
      summary:
        'SuperSheet import execution production acceptance is blocked by production handoff ledger conditions.',
      nextAction:
        'Review blocked production handoff ledger records before production acceptance ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_READY',
      summary:
        'SuperSheet import execution is ready for production acceptance.',
      nextAction:
        'Proceed to SuperSheet import execution production acceptance ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_REVIEW_REQUIRED',
      summary:
        'Some production handoff ledger records are production-acceptance-ready, but production acceptance requires review.',
      nextAction:
        'Review production handoff ledger records before production acceptance ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_ACCEPTANCE_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_REVIEW_REQUIRED',
    summary:
      'No production-acceptance-ready SuperSheet import execution production handoff ledger records were found.',
    nextAction:
      'Run upstream production handoff ledger processor with production-acceptance-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3290_SuperSheetImportExecutionProductionAcceptanceProcessor() {
  const result =
    sciipRun3290_SuperSheetImportExecutionProductionAcceptanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3290_SuperSheetImportExecutionProductionAcceptanceProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor
 *******************************************************/

function sciipGet3300ProcessorName_() {
  return '3300_SuperSheetImportExecutionProductionAcceptanceLedger';
}

function sciipGet3300SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCES';
}

function sciipGet3300TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER_SUMMARY';
}

function sciipGet3300Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER_SUMMARY';
}

function sciipGet3300Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Production_Acceptance_Ready_Count',
    'Production_Acceptance_Blocked_Count',
    'Review_Required_Count',
    'Production_Acceptance_Ledger_Status',
    'Production_Acceptance_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3300TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3300TargetSheet_(),
    sciipGet3300Headers_()
  );
}

function sciipRun3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3300ProcessorName_(),
    action: sciipGet3300Action_(),
    sourceSheet: sciipGet3300SourceSheet_(),
    targetSheet: sciipGet3300TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production acceptance ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3300TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3300ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionAcceptanceLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3290_SuperSheetImportExecutionProductionAcceptanceProcessor after 3280 creates production acceptance-ready handoff ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER|' +
        ledgerDate;

      if (sciip3300BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3300ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionAcceptanceLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3300CountProductionAcceptanceLedgerRecords_(sourceRecords);

      const posture =
        sciip3300ResolveProductionAcceptanceLedgerPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER_' +
          Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3300ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3300ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionAcceptanceLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          productionAcceptanceReadyCount: counts.ready,
          productionAcceptanceBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          productionAcceptanceLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3310_SuperSheetImportExecutionEndToEndReadinessProcessor'
        })
      });
    }
  });
}

function sciip3300BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3300CountProductionAcceptanceLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_ACCEPTANCE_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_ACCEPTANCE_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_ACCEPTANCE_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3300ResolveProductionAcceptanceLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'END_TO_END_READINESS_BLOCKED',
      summary:
        'SuperSheet import execution production acceptance ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production acceptance records before end-to-end readiness.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_LEDGER_READY',
      posture: 'END_TO_END_READINESS_READY',
      summary:
        'All SuperSheet import execution production acceptance records are ready for end-to-end readiness certification.',
      nextAction:
        'Proceed to SuperSheet import execution end-to-end readiness.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_LEDGER_PARTIAL_READY',
      posture: 'END_TO_END_READINESS_REVIEW_REQUIRED',
      summary:
        'Some production acceptance records are ready, but end-to-end readiness requires review.',
      nextAction:
        'Review production acceptance records before end-to-end readiness.'
    };
  }

  return {
    status: 'PRODUCTION_ACCEPTANCE_LEDGER_REVIEW_REQUIRED',
    posture: 'END_TO_END_READINESS_REVIEW_REQUIRED',
    summary:
      'No end-to-end readiness SuperSheet import execution production acceptance records were found.',
    nextAction:
      'Run upstream production acceptance processor with production-acceptance-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor() {
  const result =
    sciipRun3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor',
    result: result
  }));

  return result;
}

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

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3310_SuperSheetImportExecutionEndToEndReadinessProcessor
 *******************************************************/

function sciipGet3310ProcessorName_() {
  return '3310_SuperSheetImportExecutionEndToEndReadiness';
}

function sciipGet3310SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER_SUMMARY';
}

function sciipGet3310TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS';
}

function sciipGet3310Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS';
}

function sciipGet3310Headers_() {
  return [
    'End_To_End_Readiness_ID',
    'Business_Key',
    'Readiness_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'End_To_End_Ready_Count',
    'End_To_End_Blocked_Count',
    'Review_Required_Count',
    'End_To_End_Readiness_Status',
    'End_To_End_Readiness_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3310TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3310TargetSheet_(),
    sciipGet3310Headers_()
  );
}

function sciipRun3310_SuperSheetImportExecutionEndToEndReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3310ProcessorName_(),
    action: sciipGet3310Action_(),
    sourceSheet: sciipGet3310SourceSheet_(),
    targetSheet: sciipGet3310TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution end-to-end readiness runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3310TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3310ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            endToEndReadinessStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor after 3290 creates production acceptance records.'
          })
        });
      }

      const readinessDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const readinessBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS|' + readinessDate;

      if (sciip3310BusinessKeyExists_(definition.targetSheet, readinessBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3310ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            endToEndReadinessStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            readinessBusinessKey: readinessBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3310CountEndToEndReadinessRecords_(sourceRecords);
      const posture = sciip3310ResolveEndToEndReadinessPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_' + Utilities.getUuid(),
        readinessBusinessKey,
        readinessDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3310ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3310ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          endToEndReadinessStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          endToEndReadyCount: counts.ready,
          endToEndBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          endToEndReadinessPosture: posture.posture,
          readinessBusinessKey: readinessBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor'
        })
      });
    }
  });
}

function sciip3310BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3310CountEndToEndReadinessRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_ACCEPTANCE_LEDGER_READY') !== -1 ||
      statusText.indexOf('END_TO_END_READINESS_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_END_TO_END_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('END_TO_END_READINESS_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3310ResolveEndToEndReadinessPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'END_TO_END_READINESS_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_END_TO_END_READINESS_BLOCKED',
      summary:
        'SuperSheet import execution end-to-end readiness is blocked by production acceptance ledger conditions.',
      nextAction:
        'Review blocked production acceptance ledger records before end-to-end readiness ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'END_TO_END_READINESS_READY',
      posture: 'SUPERSHEET_IMPORT_END_TO_END_READINESS_READY',
      summary:
        'SuperSheet import execution is ready for the first end-to-end AIR SuperSheet production test.',
      nextAction:
        'Proceed to SuperSheet import execution end-to-end readiness ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'END_TO_END_READINESS_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_END_TO_END_READINESS_REVIEW_REQUIRED',
      summary:
        'Some production acceptance ledger records are end-to-end-ready, but readiness requires review.',
      nextAction:
        'Review production acceptance ledger records before end-to-end readiness ledger summary.'
    };
  }

  return {
    status: 'END_TO_END_READINESS_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_END_TO_END_READINESS_REVIEW_REQUIRED',
    summary:
      'No end-to-end-ready SuperSheet import execution production acceptance ledger records were found.',
    nextAction:
      'Run upstream production acceptance ledger processor with end-to-end-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3310_SuperSheetImportExecutionEndToEndReadinessProcessor() {
  const result =
    sciipRun3310_SuperSheetImportExecutionEndToEndReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3310_SuperSheetImportExecutionEndToEndReadinessProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor
 *******************************************************/

function sciipGet3320ProcessorName_() {
  return '3320_SuperSheetImportExecutionEndToEndReadinessLedger';
}

function sciipGet3320SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS';
}

function sciipGet3320TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER_SUMMARY';
}

function sciipGet3320Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER_SUMMARY';
}

function sciipGet3320Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'End_To_End_Ready_Count',
    'End_To_End_Blocked_Count',
    'Review_Required_Count',
    'End_To_End_Readiness_Ledger_Status',
    'End_To_End_Readiness_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3320TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3320TargetSheet_(),
    sciipGet3320Headers_()
  );
}

function sciipRun3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3320ProcessorName_(),
    action: sciipGet3320Action_(),
    sourceSheet: sciipGet3320SourceSheet_(),
    targetSheet: sciipGet3320TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution end-to-end readiness ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3320TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3320ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            endToEndReadinessLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3310_SuperSheetImportExecutionEndToEndReadinessProcessor after 3300 creates production acceptance ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER|' + ledgerDate;

      if (sciip3320BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3320ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            endToEndReadinessLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3320CountEndToEndReadinessLedgerRecords_(sourceRecords);
      const posture = sciip3320ResolveEndToEndReadinessLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER_' +
          Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3320ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3320ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          endToEndReadinessLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          endToEndReadyCount: counts.ready,
          endToEndBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          endToEndReadinessLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor'
        })
      });
    }
  });
}

function sciip3320BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3320CountEndToEndReadinessLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('END_TO_END_READINESS_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_END_TO_END_READINESS_READY') !== -1 ||
      statusText.indexOf('END_TO_END_READINESS_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('END_TO_END_READINESS_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3320ResolveEndToEndReadinessLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'END_TO_END_READINESS_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_TEST_AUTHORIZATION_BLOCKED',
      summary:
        'SuperSheet import execution end-to-end readiness ledger recorded blocking conditions.',
      nextAction:
        'Review blocked end-to-end readiness records before production test authorization.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'END_TO_END_READINESS_LEDGER_READY',
      posture: 'PRODUCTION_TEST_AUTHORIZATION_READY',
      summary:
        'All SuperSheet import execution end-to-end readiness records are ready for production test authorization.',
      nextAction:
        'Proceed to SuperSheet import execution production test authorization.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'END_TO_END_READINESS_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_TEST_AUTHORIZATION_REVIEW_REQUIRED',
      summary:
        'Some end-to-end readiness records are ready, but production test authorization requires review.',
      nextAction:
        'Review end-to-end readiness records before production test authorization.'
    };
  }

  return {
    status: 'END_TO_END_READINESS_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_TEST_AUTHORIZATION_REVIEW_REQUIRED',
    summary:
      'No production-test-authorization-ready SuperSheet import execution end-to-end readiness records were found.',
    nextAction:
      'Run upstream end-to-end readiness processor with readiness input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor() {
  const result =
    sciipRun3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor
 *******************************************************/

function sciipGet3330ProcessorName_() {
  return '3330_SuperSheetImportExecutionProductionTestAuthorization';
}

function sciipGet3330SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER_SUMMARY';
}

function sciipGet3330TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATIONS';
}

function sciipGet3330Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATIONS';
}

function sciipGet3330Headers_() {
  return [
    'Production_Test_Authorization_ID',
    'Business_Key',
    'Authorization_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Authorization_Ready_Count',
    'Authorization_Blocked_Count',
    'Review_Required_Count',
    'Authorization_Status',
    'Authorization_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3330TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3330TargetSheet_(),
    sciipGet3330Headers_()
  );
}

function sciipRun3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3330ProcessorName_(),
    action: sciipGet3330Action_(),
    sourceSheet: sciipGet3330SourceSheet_(),
    targetSheet: sciipGet3330TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production test authorization runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3330TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3330ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestAuthorizationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor after 3310 creates end-to-end readiness records.'
          })
        });
      }

      const authorizationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const authorizationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION|' +
        authorizationDate;

      if (sciip3330BusinessKeyExists_(definition.targetSheet, authorizationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3330ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestAuthorizationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            authorizationBusinessKey: authorizationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3330CountProductionTestAuthorizationRecords_(sourceRecords);

      const posture =
        sciip3330ResolveProductionTestAuthorizationPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_' +
          Utilities.getUuid(),
        authorizationBusinessKey,
        authorizationDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3330ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3330ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestAuthorizationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          authorizationReadyCount: counts.ready,
          authorizationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          authorizationPosture: posture.posture,
          authorizationBusinessKey: authorizationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3330BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3330CountProductionTestAuthorizationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('END_TO_END_READINESS_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3330ResolveProductionTestAuthorizationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_BLOCKED',
      summary:
        'SuperSheet import execution production test authorization is blocked by end-to-end readiness ledger conditions.',
      nextAction:
        'Review blocked end-to-end readiness ledger records before production test authorization ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_AUTHORIZED',
      summary:
        'SuperSheet import execution is authorized for the first real AIR SuperSheet end-to-end production test.',
      nextAction:
        'Proceed to SuperSheet import execution production test authorization ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_REVIEW_REQUIRED',
      summary:
        'Some end-to-end readiness ledger records are production-test-ready, but authorization requires review.',
      nextAction:
        'Review end-to-end readiness ledger records before production test authorization ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_AUTHORIZATION_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_REVIEW_REQUIRED',
    summary:
      'No production-test-ready SuperSheet import execution end-to-end readiness ledger records were found.',
    nextAction:
      'Run upstream end-to-end readiness ledger processor with production-test-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor() {
  const result =
    sciipRun3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor
 *******************************************************/

function sciipGet3340ProcessorName_() {
  return '3340_SuperSheetImportExecutionProductionTestAuthorizationLedger';
}

function sciipGet3340SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATIONS';
}

function sciipGet3340TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet3340Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet3340Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Authorization_Ready_Count',
    'Authorization_Blocked_Count',
    'Review_Required_Count',
    'Authorization_Ledger_Status',
    'Authorization_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3340TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3340TargetSheet_(),
    sciipGet3340Headers_()
  );
}

function sciipRun3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3340ProcessorName_(),
    action: sciipGet3340Action_(),
    sourceSheet: sciipGet3340SourceSheet_(),
    targetSheet: sciipGet3340TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production test authorization ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3340TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3340ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            authorizationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor after 3320 creates production-test-ready end-to-end readiness ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER|' +
        ledgerDate;

      if (sciip3340BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3340ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            authorizationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3340CountProductionTestAuthorizationLedgerRecords_(sourceRecords);

      const posture =
        sciip3340ResolveProductionTestAuthorizationLedgerPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER_' +
          Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3340ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3340ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          authorizationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          authorizationReadyCount: counts.ready,
          authorizationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          authorizationLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3350_SuperSheetImportExecutionProductionTestLaunchProcessor'
        })
      });
    }
  });
}

function sciip3340BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3340CountProductionTestAuthorizationLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_AUTHORIZED') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3340ResolveProductionTestAuthorizationLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_TEST_LAUNCH_BLOCKED',
      summary:
        'SuperSheet import execution production test authorization ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production test authorization records before production test launch.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_LEDGER_READY',
      posture: 'PRODUCTION_TEST_LAUNCH_READY',
      summary:
        'All SuperSheet import execution production test authorization records are ready for production test launch.',
      nextAction:
        'Proceed to SuperSheet import execution production test launch.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_TEST_LAUNCH_REVIEW_REQUIRED',
      summary:
        'Some production test authorization records are ready, but production test launch requires review.',
      nextAction:
        'Review production test authorization records before production test launch.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_AUTHORIZATION_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_TEST_LAUNCH_REVIEW_REQUIRED',
    summary:
      'No production-test-launch-ready SuperSheet import execution authorization records were found.',
    nextAction:
      'Run upstream production test authorization processor with authorized input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor() {
  const result =
    sciipRun3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3350_SuperSheetImportExecutionProductionTestLaunchProcessor
 *******************************************************/

function sciipGet3350ProcessorName_() {
  return '3350_SuperSheetImportExecutionProductionTestLaunch';
}

function sciipGet3350SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet3350TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCHES';
}

function sciipGet3350Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCHES';
}

function sciipGet3350Headers_() {
  return [
    'Production_Test_Launch_ID',
    'Business_Key',
    'Launch_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Launch_Ready_Count',
    'Launch_Blocked_Count',
    'Review_Required_Count',
    'Launch_Status',
    'Launch_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3350TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3350TargetSheet_(),
    sciipGet3350Headers_()
  );
}

function sciipRun3350_SuperSheetImportExecutionProductionTestLaunchProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3350ProcessorName_(),
    action: sciipGet3350Action_(),
    sourceSheet: sciipGet3350SourceSheet_(),
    targetSheet: sciipGet3350TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production test launch runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3350TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3350ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestLaunchStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor after 3330 creates production test authorization records.'
          })
        });
      }

      const launchDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const launchBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH|' + launchDate;

      if (sciip3350BusinessKeyExists_(definition.targetSheet, launchBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3350ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestLaunchStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            launchBusinessKey: launchBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3350CountProductionTestLaunchRecords_(sourceRecords);

      const posture =
        sciip3350ResolveProductionTestLaunchPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_' +
          Utilities.getUuid(),
        launchBusinessKey,
        launchDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3350ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3350ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestLaunchStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          launchReadyCount: counts.ready,
          launchBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          launchPosture: posture.posture,
          launchBusinessKey: launchBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor'
        })
      });
    }
  });
}

function sciip3350BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3350CountProductionTestLaunchRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_AUTHORIZED') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3350ResolveProductionTestLaunchPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_BLOCKED',
      summary:
        'SuperSheet import execution production test launch is blocked by production test authorization ledger conditions.',
      nextAction:
        'Review blocked production test authorization ledger records before production test launch ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_READY',
      summary:
        'SuperSheet import execution is ready to launch the first real AIR SuperSheet end-to-end production test.',
      nextAction:
        'Proceed to SuperSheet import execution production test launch ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_REVIEW_REQUIRED',
      summary:
        'Some production test authorization ledger records are launch-ready, but production test launch requires review.',
      nextAction:
        'Review production test authorization ledger records before production test launch ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_LAUNCH_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_REVIEW_REQUIRED',
    summary:
      'No production-test-launch-ready SuperSheet import execution authorization ledger records were found.',
    nextAction:
      'Run upstream production test authorization ledger processor with launch-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3350_SuperSheetImportExecutionProductionTestLaunchProcessor() {
  const result =
    sciipRun3350_SuperSheetImportExecutionProductionTestLaunchProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3350_SuperSheetImportExecutionProductionTestLaunchProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor
 *******************************************************/

function sciipGet3360ProcessorName_() {
  return '3360_SuperSheetImportExecutionProductionTestLaunchLedger';
}

function sciipGet3360SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCHES';
}

function sciipGet3360TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER_SUMMARY';
}

function sciipGet3360Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER_SUMMARY';
}

function sciipGet3360Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Launch_Ready_Count',
    'Launch_Blocked_Count',
    'Review_Required_Count',
    'Launch_Ledger_Status',
    'Launch_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3360TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3360TargetSheet_(),
    sciipGet3360Headers_()
  );
}

function sciipRun3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3360ProcessorName_(),
    action: sciipGet3360Action_(),
    sourceSheet: sciipGet3360SourceSheet_(),
    targetSheet: sciipGet3360TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production test launch ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3360TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3360ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestLaunchLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3350_SuperSheetImportExecutionProductionTestLaunchProcessor after 3340 creates launch-ready authorization ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER|' +
        ledgerDate;

      if (sciip3360BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3360ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestLaunchLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3360CountProductionTestLaunchLedgerRecords_(sourceRecords);

      const posture =
        sciip3360ResolveProductionTestLaunchLedgerPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER_' +
          Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3360ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3360ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestLaunchLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          launchReadyCount: counts.ready,
          launchBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          launchLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3370_SuperSheetImportExecutionProductionTestExecutionProcessor'
        })
      });
    }
  });
}

function sciip3360BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3360CountProductionTestLaunchLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3360ResolveProductionTestLaunchLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_TEST_EXECUTION_BLOCKED',
      summary:
        'SuperSheet import execution production test launch ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production test launch records before production test execution.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_LEDGER_READY',
      posture: 'PRODUCTION_TEST_EXECUTION_READY',
      summary:
        'All SuperSheet import execution production test launch records are ready for production test execution.',
      nextAction:
        'Proceed to SuperSheet import execution production test execution.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_TEST_EXECUTION_REVIEW_REQUIRED',
      summary:
        'Some production test launch records are ready, but production test execution requires review.',
      nextAction:
        'Review production test launch records before production test execution.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_LAUNCH_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_TEST_EXECUTION_REVIEW_REQUIRED',
    summary:
      'No production-test-execution-ready SuperSheet import execution launch records were found.',
    nextAction:
      'Run upstream production test launch processor with launch-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor() {
  const result =
    sciipRun3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3370_SuperSheetImportExecutionProductionTestExecutionProcessor
 *******************************************************/

function sciipGet3370ProcessorName_() {
  return '3370_SuperSheetImportExecutionProductionTestExecution';
}

function sciipGet3370SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER_SUMMARY';
}

function sciipGet3370TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTIONS';
}

function sciipGet3370Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTIONS';
}

function sciipGet3370Headers_() {
  return [
    'Production_Test_Execution_ID',
    'Business_Key',
    'Execution_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Ready_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Status',
    'Execution_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3370TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3370TargetSheet_(),
    sciipGet3370Headers_()
  );
}

function sciipRun3370_SuperSheetImportExecutionProductionTestExecutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3370ProcessorName_(),
    action: sciipGet3370Action_(),
    sourceSheet: sciipGet3370SourceSheet_(),
    targetSheet: sciipGet3370TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production test execution runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3370TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3370ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestExecutionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor after 3350 creates production test launch records.'
          })
        });
      }

      const executionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const executionBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION|' +
        executionDate;

      if (sciip3370BusinessKeyExists_(definition.targetSheet, executionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3370ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestExecutionStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            executionBusinessKey: executionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3370CountProductionTestExecutionRecords_(sourceRecords);

      const posture =
        sciip3370ResolveProductionTestExecutionPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_' +
          Utilities.getUuid(),
        executionBusinessKey,
        executionDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3370ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3370ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestExecutionStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionReadyCount: counts.ready,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionPosture: posture.posture,
          executionBusinessKey: executionBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor'
        })
      });
    }
  });
}

function sciip3370BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3370CountProductionTestExecutionRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3370ResolveProductionTestExecutionPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_EXECUTION_BLOCKED',
      summary:
        'SuperSheet import execution production test execution is blocked by production test launch ledger conditions.',
      nextAction:
        'Review blocked production test launch ledger records before production test execution ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_EXECUTION_READY',
      summary:
        'SuperSheet import execution is ready to execute the first real AIR SuperSheet end-to-end production test.',
      nextAction:
        'Proceed to SuperSheet import execution production test execution ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_EXECUTION_REVIEW_REQUIRED',
      summary:
        'Some production test launch ledger records are execution-ready, but production test execution requires review.',
      nextAction:
        'Review production test launch ledger records before production test execution ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_EXECUTION_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_EXECUTION_REVIEW_REQUIRED',
    summary:
      'No production-test-execution-ready SuperSheet import execution launch ledger records were found.',
    nextAction:
      'Run upstream production test launch ledger processor with execution-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3370_SuperSheetImportExecutionProductionTestExecutionProcessor() {
  const result =
    sciipRun3370_SuperSheetImportExecutionProductionTestExecutionProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3370_SuperSheetImportExecutionProductionTestExecutionProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor
 *******************************************************/

function sciipGet3380ProcessorName_() {
  return '3380_SuperSheetImportExecutionProductionTestExecutionLedger';
}

function sciipGet3380SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTIONS';
}

function sciipGet3380TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER_SUMMARY';
}

function sciipGet3380Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER_SUMMARY';
}

function sciipGet3380Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Ready_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Ledger_Status',
    'Execution_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3380TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3380TargetSheet_(),
    sciipGet3380Headers_()
  );
}

function sciipRun3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3380ProcessorName_(),
    action: sciipGet3380Action_(),
    sourceSheet: sciipGet3380SourceSheet_(),
    targetSheet: sciipGet3380TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production test execution ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3380TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3380ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestExecutionLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3370_SuperSheetImportExecutionProductionTestExecutionProcessor after 3360 creates execution-ready launch ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER|' +
        ledgerDate;

      if (sciip3380BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3380ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestExecutionLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3380CountProductionTestExecutionLedgerRecords_(sourceRecords);

      const posture =
        sciip3380ResolveProductionTestExecutionLedgerPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER_' +
          Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3380ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3380ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestExecutionLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionReadyCount: counts.ready,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3390_SuperSheetImportExecutionProductionTestResultProcessor'
        })
      });
    }
  });
}

function sciip3380BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3380CountProductionTestExecutionLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_EXECUTION_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3380ResolveProductionTestExecutionLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_TEST_RESULT_BLOCKED',
      summary:
        'SuperSheet import execution production test execution ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production test execution records before production test result capture.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_LEDGER_READY',
      posture: 'PRODUCTION_TEST_RESULT_CAPTURE_READY',
      summary:
        'All SuperSheet import execution production test execution records are ready for production test result capture.',
      nextAction:
        'Proceed to SuperSheet import execution production test result capture.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_TEST_RESULT_REVIEW_REQUIRED',
      summary:
        'Some production test execution records are ready, but result capture requires review.',
      nextAction:
        'Review production test execution records before production test result capture.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_EXECUTION_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_TEST_RESULT_REVIEW_REQUIRED',
    summary:
      'No production-test-result-ready SuperSheet import execution records were found.',
    nextAction:
      'Run upstream production test execution processor with execution-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor() {
  const result =
    sciipRun3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3390_SuperSheetImportExecutionProductionTestResultProcessor
 *******************************************************/

function sciipGet3390ProcessorName_() {
  return '3390_SuperSheetImportExecutionProductionTestResult';
}

function sciipGet3390SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER_SUMMARY';
}

function sciipGet3390TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULTS';
}

function sciipGet3390Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULTS';
}

function sciipGet3390Headers_() {
  return [
    'Production_Test_Result_ID',
    'Business_Key',
    'Result_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Result_Ready_Count',
    'Result_Blocked_Count',
    'Review_Required_Count',
    'Result_Status',
    'Result_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3390TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3390TargetSheet_(),
    sciipGet3390Headers_()
  );
}

function sciipRun3390_SuperSheetImportExecutionProductionTestResultProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3390ProcessorName_(),
    action: sciipGet3390Action_(),
    sourceSheet: sciipGet3390SourceSheet_(),
    targetSheet: sciipGet3390TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production test result runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3390TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3390ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestResultStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor after 3370 creates production test execution records.'
          })
        });
      }

      const resultDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const resultBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT|' + resultDate;

      if (sciip3390BusinessKeyExists_(definition.targetSheet, resultBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3390ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestResultStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            resultBusinessKey: resultBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3390CountProductionTestResultRecords_(sourceRecords);

      const posture =
        sciip3390ResolveProductionTestResultPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_' +
          Utilities.getUuid(),
        resultBusinessKey,
        resultDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3390ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3390ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestResultStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          resultReadyCount: counts.ready,
          resultBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          resultPosture: posture.posture,
          resultBusinessKey: resultBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor'
        })
      });
    }
  });
}

function sciip3390BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3390CountProductionTestResultRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_RESULT_CAPTURE_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_RESULT_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_RESULT_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3390ResolveProductionTestResultPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_RESULT_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_RESULT_BLOCKED',
      summary:
        'SuperSheet import execution production test result capture is blocked by production test execution ledger conditions.',
      nextAction:
        'Review blocked production test execution ledger records before production test result ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_RESULT_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_RESULT_READY',
      summary:
        'SuperSheet import execution production test result capture is ready.',
      nextAction:
        'Proceed to SuperSheet import execution production test result ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_RESULT_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_RESULT_REVIEW_REQUIRED',
      summary:
        'Some production test execution ledger records are result-ready, but result capture requires review.',
      nextAction:
        'Review production test execution ledger records before production test result ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_RESULT_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_RESULT_REVIEW_REQUIRED',
    summary:
      'No production-test-result-ready SuperSheet import execution records were found.',
    nextAction:
      'Run upstream production test execution ledger processor with result-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3390_SuperSheetImportExecutionProductionTestResultProcessor() {
  const result =
    sciipRun3390_SuperSheetImportExecutionProductionTestResultProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3390_SuperSheetImportExecutionProductionTestResultProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor
 *******************************************************/

function sciipGet3400ProcessorName_() {
  return '3400_SuperSheetImportExecutionProductionTestResultLedger';
}

function sciipGet3400SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULTS';
}

function sciipGet3400TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER_SUMMARY';
}

function sciipGet3400Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER_SUMMARY';
}

function sciipGet3400Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Result_Ready_Count',
    'Result_Blocked_Count',
    'Review_Required_Count',
    'Result_Ledger_Status',
    'Result_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3400TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3400TargetSheet_(),
    sciipGet3400Headers_()
  );
}

function sciipRun3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3400ProcessorName_(),
    action: sciipGet3400Action_(),
    sourceSheet: sciipGet3400SourceSheet_(),
    targetSheet: sciipGet3400TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production test result ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {

      const targetSheet = sciipEnsure3400TargetSheet_();

      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {

        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3400ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            resultLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3390_SuperSheetImportExecutionProductionTestResultProcessor after 3380 creates production test execution ledger summaries.'
          })
        });

      }

      const ledgerDate =
        context.dateKey || SCIIP_RUNTIME.getDateKey({});

      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER|' +
        ledgerDate;

      if (sciip3400BusinessKeyExists_(
            definition.targetSheet,
            ledgerBusinessKey)) {

        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3400ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            resultLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });

      }

      const counts =
        sciip3400CountProductionTestResultLedgerRecords_(sourceRecords);

      const posture =
        sciip3400ResolveProductionTestResultLedgerPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER_' +
          Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3400ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3400ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          resultLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          resultReadyCount: counts.ready,
          resultBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          resultLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3410_SuperSheetImportExecutionProductionCertificationProcessor'
        })
      });

    }
  });
}

function sciip3400BusinessKeyExists_(sheetName, businessKey) {

  const records =
    SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });

}

function sciip3400CountProductionTestResultLedgerRecords_(records) {

  return records.reduce(function(counts, record) {

    const statusText = Object.keys(record)
      .map(function(key) {
        return String(record[key] || '').toUpperCase();
      })
      .join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_RESULT_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_RESULT_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_RESULT_LEDGER_READY') !== -1
    ) {

      counts.ready++;

    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_RESULT_BLOCKED') !== -1
    ) {

      counts.blocked++;

    } else {

      counts.reviewRequired++;

    }

    return counts;

  }, {
    ready: 0,
    blocked: 0,
    reviewRequired: 0
  });

}

function sciip3400ResolveProductionTestResultLedgerPosture_(counts, total) {

  if (counts.blocked > 0) {

    return {
      status: 'PRODUCTION_TEST_RESULT_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution production test result ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production test result records before production certification.'
    };

  }

  if (counts.ready > 0 && counts.ready === total) {

    return {
      status: 'PRODUCTION_TEST_RESULT_LEDGER_READY',
      posture: 'PRODUCTION_CERTIFICATION_READY',
      summary:
        'All production test results are ready for production certification.',
      nextAction:
        'Proceed to production certification.'
    };

  }

  if (counts.ready > 0) {

    return {
      status: 'PRODUCTION_TEST_RESULT_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some production test results are ready, but production certification requires review.',
      nextAction:
        'Review production test results before certification.'
    };

  }

  return {
    status: 'PRODUCTION_TEST_RESULT_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No production-certification-ready production test results were found.',
    nextAction:
      'Run upstream production test result processor with production-ready input.'
  };

}

/*******************************************************
 * Test
 *******************************************************/

function sciipTest3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor() {

  const result =
    sciipRun3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor',
    result: result
  }));

  return result;

}

/*******************************************************
 * SCIIP_OS v4.0
 * 340_DecisionBriefProcessor
 *
 * EXECUTIVE_SUMMARY → DECISION_BRIEF
 *******************************************************/

const DECISION_BRIEF_SHEET = 'DECISION_BRIEF';

const DECISION_BRIEF_HEADERS = [
  'ID',
  'Business_Key',
  'Executive_Summary_ID',
  'Brief_Date',
  'Decision_Audience',
  'Decision_Title',
  'Decision_Context',
  'Decision_Question',
  'Recommended_Decision',
  'Rationale',
  'Risk_Considerations',
  'Next_Actions',
  'Priority',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const DECISION_BRIEF_PROCESSOR = '340_DecisionBriefProcessor';

/**
 * Main processor
 */
function sciipRunDecisionBriefProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const summarySheet = ss.getSheetByName('EXECUTIVE_SUMMARY');
  if (!summarySheet) throw new Error('Missing EXECUTIVE_SUMMARY sheet');

  const briefSheet = sciipEnsureDecisionBriefSheet_();

  const summaries = sciipReadSheetObjects_(summarySheet);
  const existingBriefs = sciipReadSheetObjects_(briefSheet);

  const existingKeys = new Set(
    existingBriefs.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoSummary = 0;

  summaries.forEach(summary => {
    const summaryId = summary.ID || summary.Executive_Summary_ID;

    if (!summaryId) {
      skippedNoSummary++;
      return;
    }

    const businessKey = `DECISION_BRIEF|${summaryId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const brief = sciipBuildDecisionBrief_(summary, businessKey);

    briefSheet.appendRow(DECISION_BRIEF_HEADERS.map(h => brief[h] || ''));

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: DECISION_BRIEF_PROCESSOR,
    status: 'SUCCESS',
    executiveSummariesReviewed: summaries.length,
    decisionBriefsCreated: created,
    skippedDuplicate,
    skippedNoSummary,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory
 */
function sciipBuildDecisionBrief_(summary, businessKey) {
  const now = new Date().toISOString();

  const contextText = [
    summary.Summary_Title,
    summary.Executive_Summary,
    summary.Key_Takeaways,
    summary.Market_Implications,
    summary.Recommended_Focus,
    summary.Notes
  ].filter(Boolean).join('\n\n');

  return {
    ID: sciipGenerateDecisionBriefId_(),
    Business_Key: businessKey,
    Executive_Summary_ID: summary.ID || '',
    Brief_Date: summary.Summary_Date || now,
    Decision_Audience: 'Landlord / Executive',
    Decision_Title: sciipDecisionBriefTitle_(summary),
    Decision_Context: sciipDecisionContext_(contextText),
    Decision_Question: sciipDecisionQuestion_(contextText),
    Recommended_Decision: sciipRecommendedDecision_(contextText),
    Rationale: sciipDecisionRationale_(contextText),
    Risk_Considerations: sciipDecisionRisks_(contextText),
    Next_Actions: sciipDecisionNextActions_(contextText),
    Priority: 'MEDIUM',
    Confidence: summary.Confidence || 'MEDIUM',
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: DECISION_BRIEF_PROCESSOR,
    Notes: 'Generated from EXECUTIVE_SUMMARY'
  };
}

/**
 * Decision logic
 */
function sciipDecisionBriefTitle_(summary) {
  const date =
    summary.Summary_Date ||
    new Date().toISOString().slice(0, 10);

  return `Decision Brief — ${date}`;
}

function sciipDecisionContext_(text) {
  return (
    'SCIIP converted the latest executive summary into a decision-ready brief. ' +
    'This brief is intended to help ownership evaluate whether current market intelligence requires a change in leasing strategy, pricing posture, marketing emphasis, prospect targeting, or follow-up priority.'
  );
}

function sciipDecisionQuestion_(text) {
  return (
    'Does the current intelligence support a near-term ownership decision, strategic adjustment, or focused landlord action?'
  );
}

function sciipRecommendedDecision_(text) {
  return (
    'Continue monitoring current market signals while prioritizing follow-up on opportunities, tenant requirements, competitive changes, or landlord actions identified by SCIIP.'
  );
}

function sciipDecisionRationale_(text) {
  return [
    'SCIIP has identified digest-level intelligence that may affect landlord positioning.',
    'The executive summary indicates themes that should be translated into practical ownership decisions.',
    'Decision briefs allow market intelligence to move from passive reporting into active decision support.'
  ].join('\n');
}

function sciipDecisionRisks_(text) {
  return [
    'Market signals may still be incomplete or early-stage.',
    'Tenant requirements may change before ownership can act.',
    'Competitive positioning may require additional validation from brokers, tours, proposals, or pricing data.'
  ].join('\n');
}

function sciipDecisionNextActions_(text) {
  return [
    'Review related opportunities and recommended actions.',
    'Identify whether any landlord communication should be sent.',
    'Compare current decision brief against prior briefs for recurring themes.',
    'Escalate high-confidence items into action tracking.'
  ].join('\n');
}

/**
 * Sheet setup
 */
function sciipEnsureDecisionBriefSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(DECISION_BRIEF_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(DECISION_BRIEF_SHEET);
    sheet.appendRow(DECISION_BRIEF_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== DECISION_BRIEF_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(DECISION_BRIEF_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateDecisionBriefId_() {
  return 'DEC_BRIEF_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipReadSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Missing SCIIP_SPREADSHEET_ID in Script Properties. Add your SCIIP runtime Google Sheet ID.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Test function
 */
function sciipTestDecisionBriefProcessor() {
  const result = sciipRunDecisionBriefProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestDecisionBriefProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3410_SuperSheetImportExecutionProductionCertificationProcessor
 *******************************************************/

function sciipGet3410ProcessorName_() {
  return '3410_SuperSheetImportExecutionProductionCertification';
}

function sciipGet3410SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER_SUMMARY';
}

function sciipGet3410TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATIONS';
}

function sciipGet3410Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATIONS';
}

function sciipGet3410Headers_() {
  return [
    'Production_Certification_ID',
    'Business_Key',
    'Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Ready_Count',
    'Certification_Blocked_Count',
    'Review_Required_Count',
    'Certification_Status',
    'Certification_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3410TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3410TargetSheet_(),
    sciipGet3410Headers_()
  );
}

function sciipRun3410_SuperSheetImportExecutionProductionCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3410ProcessorName_(),
    action: sciipGet3410Action_(),
    sourceSheet: sciipGet3410SourceSheet_(),
    targetSheet: sciipGet3410TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary:
          'SuperSheet import execution production certification runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3410TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3410ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor after 3390 creates production test result records.'
          })
        });
      }

      const certificationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const certificationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION|' +
        certificationDate;

      if (sciip3410BusinessKeyExists_(definition.targetSheet, certificationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3410ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionCertificationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            certificationBusinessKey: certificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3410CountProductionCertificationRecords_(sourceRecords);
      const posture = sciip3410ResolveProductionCertificationPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_' +
          Utilities.getUuid(),
        certificationBusinessKey,
        certificationDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3410ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3410ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionCertificationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          certificationReadyCount: counts.ready,
          certificationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          certificationPosture: posture.posture,
          certificationBusinessKey: certificationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3420_SuperSheetImportExecutionProductionCertificationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3410BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3410CountProductionCertificationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_RESULT_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_CERTIFICATION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_CERTIFICATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3410ResolveProductionCertificationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_CERTIFICATION_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution production certification is blocked by production test result ledger conditions.',
      nextAction:
        'Review blocked production test result ledger records before production certification ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_CERTIFICATION_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_CERTIFICATION_READY',
      summary:
        'SuperSheet import execution production certification is ready.',
      nextAction:
        'Proceed to SuperSheet import execution production certification ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_CERTIFICATION_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some production test result ledger records are certification-ready, but production certification requires review.',
      nextAction:
        'Review production test result ledger records before production certification ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_CERTIFICATION_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No production-certification-ready SuperSheet import execution test result ledger records were found.',
    nextAction:
      'Run upstream production test result ledger processor with certification-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3410_SuperSheetImportExecutionProductionCertificationProcessor() {
  const result =
    sciipRun3410_SuperSheetImportExecutionProductionCertificationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3410_SuperSheetImportExecutionProductionCertificationProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v4.0
 * 350_StrategicDecisionProcessor
 *
 * DECISION_BRIEF → STRATEGIC_DECISION
 *******************************************************/

const STRATEGIC_DECISION_SHEET = 'STRATEGIC_DECISION';

const STRATEGIC_DECISION_HEADERS = [
  'ID',
  'Business_Key',
  'Decision_Brief_ID',
  'Decision_Date',
  'Decision_Type',
  'Strategic_Decision',
  'Ownership_Posture',
  'Strategic_Rationale',
  'Urgency',
  'Expected_Impact',
  'Execution_Path',
  'Follow_Up_Trigger',
  'Decision_Status',
  'Confidence',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const STRATEGIC_DECISION_PROCESSOR = '350_StrategicDecisionProcessor';

/**
 * Main processor
 */
function sciipRunStrategicDecisionProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const briefSheet = ss.getSheetByName('DECISION_BRIEF');
  if (!briefSheet) throw new Error('Missing DECISION_BRIEF sheet');

  const decisionSheet = sciipEnsureStrategicDecisionSheet_();

  const briefs = sciipReadSheetObjects_(briefSheet);
  const existingDecisions = sciipReadSheetObjects_(decisionSheet);

  const existingKeys = new Set(
    existingDecisions.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoBrief = 0;

  briefs.forEach(brief => {
    const briefId = brief.ID || brief.Decision_Brief_ID;

    if (!briefId) {
      skippedNoBrief++;
      return;
    }

    const businessKey = `STRATEGIC_DECISION|${briefId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const decision = sciipBuildStrategicDecision_(brief, businessKey);

    decisionSheet.appendRow(
      STRATEGIC_DECISION_HEADERS.map(h => decision[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: STRATEGIC_DECISION_PROCESSOR,
    status: 'SUCCESS',
    decisionBriefsReviewed: briefs.length,
    strategicDecisionsCreated: created,
    skippedDuplicate,
    skippedNoBrief,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory
 */
function sciipBuildStrategicDecision_(brief, businessKey) {
  const now = new Date().toISOString();

  const sourceText = [
    brief.Decision_Title,
    brief.Decision_Context,
    brief.Decision_Question,
    brief.Recommended_Decision,
    brief.Rationale,
    brief.Risk_Considerations,
    brief.Next_Actions,
    brief.Notes
  ].filter(Boolean).join('\n\n');

  return {
    ID: sciipGenerateStrategicDecisionId_(),
    Business_Key: businessKey,
    Decision_Brief_ID: brief.ID || '',
    Decision_Date: brief.Brief_Date || now,
    Decision_Type: sciipStrategicDecisionType_(sourceText),
    Strategic_Decision: sciipStrategicDecisionText_(sourceText),
    Ownership_Posture: sciipOwnershipPosture_(sourceText),
    Strategic_Rationale: sciipStrategicRationale_(sourceText),
    Urgency: sciipDecisionUrgency_(brief, sourceText),
    Expected_Impact: sciipExpectedImpact_(sourceText),
    Execution_Path: sciipExecutionPath_(sourceText),
    Follow_Up_Trigger: sciipFollowUpTrigger_(sourceText),
    Decision_Status: 'PROPOSED',
    Confidence: brief.Confidence || 'MEDIUM',
    Created_At: now,
    Updated_At: now,
    Processor: STRATEGIC_DECISION_PROCESSOR,
    Notes: 'Generated from DECISION_BRIEF'
  };
}

/**
 * Decision logic
 */
function sciipStrategicDecisionType_(text) {
  return 'LANDLORD_STRATEGY';
}

function sciipStrategicDecisionText_(text) {
  return (
    'Maintain an active ownership posture and translate current SCIIP intelligence into targeted leasing, marketing, pricing, and prospect follow-up decisions.'
  );
}

function sciipOwnershipPosture_(text) {
  return (
    'Proactive: ownership should remain informed, responsive, and prepared to adjust asset positioning as market intelligence strengthens.'
  );
}

function sciipStrategicRationale_(text) {
  return [
    'SCIIP has elevated intelligence from briefing into decision support.',
    'The decision brief indicates that current market signals may affect landlord positioning or execution.',
    'A strategic decision record preserves the reasoning behind ownership posture and creates a durable link between intelligence and future action.'
  ].join('\n');
}

function sciipDecisionUrgency_(brief, text) {
  const priority = String(brief.Priority || '').toUpperCase();

  if (priority === 'HIGH') return 'HIGH';
  if (priority === 'LOW') return 'LOW';

  return 'MEDIUM';
}

function sciipExpectedImpact_(text) {
  return (
    'Improved landlord alignment, stronger prospect prioritization, better market responsiveness, and clearer connection between intelligence and execution.'
  );
}

function sciipExecutionPath_(text) {
  return [
    'Review the source decision brief.',
    'Confirm whether the decision applies to a specific asset, landlord, market, or tenant requirement.',
    'Convert the decision into one or more executable actions where appropriate.',
    'Track resulting outcomes through SCIIP action and learning processors.'
  ].join('\n');
}

function sciipFollowUpTrigger_(text) {
  return (
    'Trigger follow-up if related opportunities, recommended actions, market signals, tenant requirements, pricing changes, or competitive movements appear in future SCIIP runs.'
  );
}

/**
 * Sheet setup
 */
function sciipEnsureStrategicDecisionSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(STRATEGIC_DECISION_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(STRATEGIC_DECISION_SHEET);
    sheet.appendRow(STRATEGIC_DECISION_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== STRATEGIC_DECISION_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(STRATEGIC_DECISION_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateStrategicDecisionId_() {
  return 'STRAT_DEC_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipReadSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Missing SCIIP_SPREADSHEET_ID in Script Properties. Add your SCIIP runtime Google Sheet ID.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Test function
 */
function sciipTestStrategicDecisionProcessor() {
  const result = sciipRunStrategicDecisionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestStrategicDecisionProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v4.0
 * 360_DecisionExecutionPlanProcessor
 *
 * STRATEGIC_DECISION → DECISION_EXECUTION_PLAN
 *******************************************************/

const DECISION_EXECUTION_PLAN_SHEET = 'DECISION_EXECUTION_PLAN';

const DECISION_EXECUTION_PLAN_HEADERS = [
  'ID',
  'Business_Key',
  'Strategic_Decision_ID',
  'Plan_Date',
  'Execution_Title',
  'Execution_Objective',
  'Execution_Steps',
  'Required_Inputs',
  'Stakeholders',
  'Timing',
  'Success_Criteria',
  'Risks',
  'Escalation_Trigger',
  'Priority',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const DECISION_EXECUTION_PLAN_PROCESSOR = '360_DecisionExecutionPlanProcessor';

/**
 * Main processor
 */
function sciipRunDecisionExecutionPlanProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const decisionSheet = ss.getSheetByName('STRATEGIC_DECISION');
  if (!decisionSheet) throw new Error('Missing STRATEGIC_DECISION sheet');

  const planSheet = sciipEnsureDecisionExecutionPlanSheet_();

  const decisions = sciipReadSheetObjects_(decisionSheet);
  const existingPlans = sciipReadSheetObjects_(planSheet);

  const existingKeys = new Set(
    existingPlans.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoDecision = 0;

  decisions.forEach(decision => {
    const decisionId = decision.ID || decision.Strategic_Decision_ID;

    if (!decisionId) {
      skippedNoDecision++;
      return;
    }

    const businessKey = `DECISION_EXECUTION_PLAN|${decisionId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const plan = sciipBuildDecisionExecutionPlan_(decision, businessKey);

    planSheet.appendRow(
      DECISION_EXECUTION_PLAN_HEADERS.map(h => plan[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: DECISION_EXECUTION_PLAN_PROCESSOR,
    status: 'SUCCESS',
    strategicDecisionsReviewed: decisions.length,
    executionPlansCreated: created,
    skippedDuplicate,
    skippedNoDecision,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory
 */
function sciipBuildDecisionExecutionPlan_(decision, businessKey) {
  const now = new Date().toISOString();

  const sourceText = [
    decision.Strategic_Decision,
    decision.Ownership_Posture,
    decision.Strategic_Rationale,
    decision.Expected_Impact,
    decision.Execution_Path,
    decision.Follow_Up_Trigger,
    decision.Notes
  ].filter(Boolean).join('\n\n');

  return {
    ID: sciipGenerateDecisionExecutionPlanId_(),
    Business_Key: businessKey,
    Strategic_Decision_ID: decision.ID || '',
    Plan_Date: decision.Decision_Date || now,
    Execution_Title: sciipExecutionPlanTitle_(decision),
    Execution_Objective: sciipExecutionObjective_(sourceText),
    Execution_Steps: sciipExecutionSteps_(sourceText),
    Required_Inputs: sciipRequiredInputs_(sourceText),
    Stakeholders: sciipStakeholders_(sourceText),
    Timing: sciipExecutionTiming_(decision),
    Success_Criteria: sciipSuccessCriteria_(sourceText),
    Risks: sciipExecutionRisks_(sourceText),
    Escalation_Trigger: sciipEscalationTrigger_(sourceText),
    Priority: decision.Urgency || 'MEDIUM',
    Confidence: decision.Confidence || 'MEDIUM',
    Status: 'PENDING',
    Created_At: now,
    Updated_At: now,
    Processor: DECISION_EXECUTION_PLAN_PROCESSOR,
    Notes: 'Generated from STRATEGIC_DECISION'
  };
}

/**
 * Execution logic
 */
function sciipExecutionPlanTitle_(decision) {
  const date =
    decision.Decision_Date ||
    new Date().toISOString().slice(0, 10);

  return `Execution Plan — ${date}`;
}

function sciipExecutionObjective_(text) {
  return (
    'Convert the strategic decision into an executable landlord-facing workflow that can be reviewed, assigned, tracked, and evaluated.'
  );
}

function sciipExecutionSteps_(text) {
  return [
    'Review the source strategic decision.',
    'Identify whether the decision applies to a specific asset, landlord, tenant requirement, market, or competitive condition.',
    'Determine whether immediate broker action, landlord communication, pricing review, marketing update, or additional research is required.',
    'Create or update recommended actions where appropriate.',
    'Track execution and outcomes through SCIIP action and learning processors.'
  ].join('\n');
}

function sciipRequiredInputs_(text) {
  return [
    'Source strategic decision',
    'Related decision brief',
    'Relevant market signals',
    'Related opportunities',
    'Recommended actions',
    'Broker judgment or landlord direction where needed'
  ].join('\n');
}

function sciipStakeholders_(text) {
  return [
    'Brokerage team',
    'Landlord / ownership',
    'Asset manager',
    'Prospect or tenant representative where applicable',
    'SCIIP intelligence workflow'
  ].join('\n');
}

function sciipExecutionTiming_(decision) {
  const urgency = String(decision.Urgency || '').toUpperCase();

  if (urgency === 'HIGH') return 'Immediate review recommended';
  if (urgency === 'LOW') return 'Monitor and review during next regular intelligence cycle';

  return 'Review during current or next landlord intelligence cycle';
}

function sciipSuccessCriteria_(text) {
  return [
    'Decision is reviewed by the appropriate stakeholder.',
    'Recommended action is created, updated, or dismissed with rationale.',
    'Relevant landlord communication or broker follow-up is completed where appropriate.',
    'Outcome is captured for future SCIIP learning.'
  ].join('\n');
}

function sciipExecutionRisks_(text) {
  return [
    'Decision may be based on early or incomplete intelligence.',
    'Execution may require human confirmation before landlord communication.',
    'Market conditions may change before action is completed.',
    'Action may not be attributable to a measurable outcome without tracking discipline.'
  ].join('\n');
}

function sciipEscalationTrigger_(text) {
  return (
    'Escalate if the same decision theme appears repeatedly, if urgency increases, if a landlord-facing action is overdue, or if a related opportunity becomes time-sensitive.'
  );
}

/**
 * Sheet setup
 */
function sciipEnsureDecisionExecutionPlanSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(DECISION_EXECUTION_PLAN_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(DECISION_EXECUTION_PLAN_SHEET);
    sheet.appendRow(DECISION_EXECUTION_PLAN_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== DECISION_EXECUTION_PLAN_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(DECISION_EXECUTION_PLAN_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateDecisionExecutionPlanId_() {
  return 'EXEC_PLAN_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipReadSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Missing SCIIP_SPREADSHEET_ID in Script Properties. Add your SCIIP runtime Google Sheet ID.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Test function
 */
function sciipTestDecisionExecutionPlanProcessor() {
  const result = sciipRunDecisionExecutionPlanProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestDecisionExecutionPlanProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v4.0
 * 370_ExecutionTaskProcessor
 *
 * DECISION_EXECUTION_PLAN → EXECUTION_TASK
 *******************************************************/

const EXECUTION_TASK_SHEET = 'EXECUTION_TASK';

const EXECUTION_TASK_HEADERS = [
  'ID',
  'Business_Key',
  'Decision_Execution_Plan_ID',
  'Task_Date',
  'Task_Number',
  'Task_Title',
  'Task_Description',
  'Task_Category',
  'Assigned_Role',
  'Priority',
  'Due_Timing',
  'Completion_Criteria',
  'Dependency',
  'Escalation_Trigger',
  'Task_Status',
  'Confidence',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const EXECUTION_TASK_PROCESSOR = '370_ExecutionTaskProcessor';

/**
 * Main processor
 */
function sciipRunExecutionTaskProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const planSheet = ss.getSheetByName('DECISION_EXECUTION_PLAN');
  if (!planSheet) throw new Error('Missing DECISION_EXECUTION_PLAN sheet');

  const taskSheet = sciipEnsureExecutionTaskSheet_();

  const plans = sciipReadSheetObjects_(planSheet);
  const existingTasks = sciipReadSheetObjects_(taskSheet);

  const existingKeys = new Set(
    existingTasks.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoPlan = 0;

  plans.forEach(plan => {
    const planId = plan.ID || plan.Decision_Execution_Plan_ID;

    if (!planId) {
      skippedNoPlan++;
      return;
    }

    const tasks = sciipBuildExecutionTasks_(plan);

    tasks.forEach(task => {
      const businessKey = `EXECUTION_TASK|${planId}|${task.Task_Number}`;

      if (existingKeys.has(businessKey)) {
        skippedDuplicate++;
        return;
      }

      task.Business_Key = businessKey;

      taskSheet.appendRow(
        EXECUTION_TASK_HEADERS.map(h => task[h] || '')
      );

      existingKeys.add(businessKey);
      created++;
    });
  });

  const result = {
    processor: EXECUTION_TASK_PROCESSOR,
    status: 'SUCCESS',
    executionPlansReviewed: plans.length,
    executionTasksCreated: created,
    skippedDuplicate,
    skippedNoPlan,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory
 */
function sciipBuildExecutionTasks_(plan) {
  const now = new Date().toISOString();
  const planId = plan.ID || '';

  const base = {
    Decision_Execution_Plan_ID: planId,
    Task_Date: plan.Plan_Date || now,
    Priority: plan.Priority || 'MEDIUM',
    Confidence: plan.Confidence || 'MEDIUM',
    Task_Status: 'OPEN',
    Created_At: now,
    Updated_At: now,
    Processor: EXECUTION_TASK_PROCESSOR,
    Notes: 'Generated from DECISION_EXECUTION_PLAN'
  };

  return [
    Object.assign({}, base, {
      ID: sciipGenerateExecutionTaskId_(),
      Business_Key: '',
      Task_Number: 1,
      Task_Title: 'Review Execution Plan',
      Task_Description: 'Review the source decision execution plan and confirm whether action is required.',
      Task_Category: 'REVIEW',
      Assigned_Role: 'Brokerage Team',
      Due_Timing: sciipTaskDueTiming_(plan),
      Completion_Criteria: 'Execution plan reviewed and marked for action, monitoring, or dismissal.',
      Dependency: 'Decision execution plan must exist.',
      Escalation_Trigger: 'Escalate if the plan is high priority or has not been reviewed during the current intelligence cycle.'
    }),

    Object.assign({}, base, {
      ID: sciipGenerateExecutionTaskId_(),
      Business_Key: '',
      Task_Number: 2,
      Task_Title: 'Identify Applicable Asset or Market',
      Task_Description: 'Determine whether the plan applies to a specific asset, landlord, tenant requirement, market, or competitive condition.',
      Task_Category: 'CLASSIFICATION',
      Assigned_Role: 'Brokerage Team / SCIIP Operator',
      Due_Timing: sciipTaskDueTiming_(plan),
      Completion_Criteria: 'Applicable asset, landlord, market, or requirement is identified, or the task is documented as general market intelligence.',
      Dependency: 'Review Execution Plan',
      Escalation_Trigger: 'Escalate if asset-level relevance is unclear but the priority is high.'
    }),

    Object.assign({}, base, {
      ID: sciipGenerateExecutionTaskId_(),
      Business_Key: '',
      Task_Number: 3,
      Task_Title: 'Determine Recommended Action',
      Task_Description: 'Decide whether the plan should result in landlord communication, pricing review, marketing update, prospect follow-up, or additional research.',
      Task_Category: 'ACTION_DECISION',
      Assigned_Role: 'Brokerage Team',
      Due_Timing: sciipTaskDueTiming_(plan),
      Completion_Criteria: 'Recommended next action is selected or documented as no-action with rationale.',
      Dependency: 'Identify Applicable Asset or Market',
      Escalation_Trigger: 'Escalate if the recommended action is time-sensitive or landlord-facing.'
    }),

    Object.assign({}, base, {
      ID: sciipGenerateExecutionTaskId_(),
      Business_Key: '',
      Task_Number: 4,
      Task_Title: 'Create or Update Action Tracker',
      Task_Description: 'Create or update related recommended actions and action tracker records where appropriate.',
      Task_Category: 'TRACKING',
      Assigned_Role: 'SCIIP Operator',
      Due_Timing: sciipTaskDueTiming_(plan),
      Completion_Criteria: 'Relevant action tracker item exists, or no tracker item is needed with rationale.',
      Dependency: 'Determine Recommended Action',
      Escalation_Trigger: 'Escalate if an action is recommended but not tracked.'
    }),

    Object.assign({}, base, {
      ID: sciipGenerateExecutionTaskId_(),
      Business_Key: '',
      Task_Number: 5,
      Task_Title: 'Capture Outcome',
      Task_Description: 'Capture whether the execution plan resulted in a landlord action, broker follow-up, market update, or no-action decision.',
      Task_Category: 'OUTCOME_LEARNING',
      Assigned_Role: 'Brokerage Team / SCIIP Operator',
      Due_Timing: 'After action or next intelligence cycle',
      Completion_Criteria: 'Outcome is captured for future SCIIP learning.',
      Dependency: 'Create or Update Action Tracker',
      Escalation_Trigger: 'Escalate if action occurred but no outcome was recorded.'
    })
  ];
}

/**
 * Task logic
 */
function sciipTaskDueTiming_(plan) {
  const priority = String(plan.Priority || '').toUpperCase();

  if (priority === 'HIGH') return 'Immediate / current cycle';
  if (priority === 'LOW') return 'Next regular review cycle';

  return 'Current or next intelligence cycle';
}

/**
 * Sheet setup
 */
function sciipEnsureExecutionTaskSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(EXECUTION_TASK_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(EXECUTION_TASK_SHEET);
    sheet.appendRow(EXECUTION_TASK_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== EXECUTION_TASK_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(EXECUTION_TASK_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateExecutionTaskId_() {
  return 'EXEC_TASK_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipReadSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Missing SCIIP_SPREADSHEET_ID in Script Properties. Add your SCIIP runtime Google Sheet ID.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Test function
 */
function sciipTestExecutionTaskProcessor() {
  const result = sciipRunExecutionTaskProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestExecutionTaskProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v4.0
 * 380_TaskPrioritizationProcessor
 *
 * EXECUTION_TASK → TASK_PRIORITY_SCORE
 *******************************************************/

const TASK_PRIORITY_SCORE_SHEET = 'TASK_PRIORITY_SCORE';

const TASK_PRIORITY_SCORE_HEADERS = [
  'ID',
  'Business_Key',
  'Execution_Task_ID',
  'Score_Date',
  'Priority_Label',
  'Priority_Score',
  'Urgency_Score',
  'Impact_Score',
  'Confidence_Score',
  'Escalation_Score',
  'Composite_Score',
  'Recommended_Order',
  'Prioritization_Rationale',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const TASK_PRIORITY_SCORE_PROCESSOR = '380_TaskPrioritizationProcessor';

function sciipRunTaskPrioritizationProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const taskSheet = ss.getSheetByName('EXECUTION_TASK');
  if (!taskSheet) throw new Error('Missing EXECUTION_TASK sheet');

  const scoreSheet = sciipEnsureTaskPriorityScoreSheet_();

  const tasks = sciipReadSheetObjects_(taskSheet);
  const existingScores = sciipReadSheetObjects_(scoreSheet);

  const existingKeys = new Set(
    existingScores.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoTask = 0;

  tasks.forEach(task => {
    const taskId = task.ID || task.Execution_Task_ID;

    if (!taskId) {
      skippedNoTask++;
      return;
    }

    const businessKey = `TASK_PRIORITY_SCORE|${taskId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const score = sciipBuildTaskPriorityScore_(task, businessKey);

    scoreSheet.appendRow(
      TASK_PRIORITY_SCORE_HEADERS.map(h => score[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: TASK_PRIORITY_SCORE_PROCESSOR,
    status: 'SUCCESS',
    executionTasksReviewed: tasks.length,
    taskPriorityScoresCreated: created,
    skippedDuplicate,
    skippedNoTask,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildTaskPriorityScore_(task, businessKey) {
  const now = new Date().toISOString();

  const priorityScore = sciipPriorityLabelScore_(task.Priority);
  const urgencyScore = sciipUrgencyScore_(task.Due_Timing);
  const impactScore = sciipImpactScore_(task.Task_Category);
  const confidenceScore = sciipConfidenceScore_(task.Confidence);
  const escalationScore = sciipEscalationScore_(task);

  const compositeScore =
    priorityScore +
    urgencyScore +
    impactScore +
    confidenceScore +
    escalationScore;

  return {
    ID: sciipGenerateTaskPriorityScoreId_(),
    Business_Key: businessKey,
    Execution_Task_ID: task.ID || '',
    Score_Date: now,
    Priority_Label: sciipCompositePriorityLabel_(compositeScore),
    Priority_Score: priorityScore,
    Urgency_Score: urgencyScore,
    Impact_Score: impactScore,
    Confidence_Score: confidenceScore,
    Escalation_Score: escalationScore,
    Composite_Score: compositeScore,
    Recommended_Order: sciipRecommendedOrder_(compositeScore),
    Prioritization_Rationale: sciipPriorityRationale_(task, compositeScore),
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: TASK_PRIORITY_SCORE_PROCESSOR,
    Notes: 'Generated from EXECUTION_TASK'
  };
}

/**
 * Scoring logic
 */
function sciipPriorityLabelScore_(priority) {
  const value = String(priority || '').toUpperCase();

  if (value === 'HIGH') return 30;
  if (value === 'LOW') return 10;

  return 20;
}

function sciipUrgencyScore_(dueTiming) {
  const value = String(dueTiming || '').toUpperCase();

  if (value.indexOf('IMMEDIATE') !== -1) return 30;
  if (value.indexOf('CURRENT') !== -1) return 25;
  if (value.indexOf('NEXT') !== -1) return 15;

  return 10;
}

function sciipImpactScore_(category) {
  const value = String(category || '').toUpperCase();

  if (value === 'ACTION_DECISION') return 25;
  if (value === 'TRACKING') return 20;
  if (value === 'OUTCOME_LEARNING') return 20;
  if (value === 'CLASSIFICATION') return 15;
  if (value === 'REVIEW') return 15;

  return 10;
}

function sciipConfidenceScore_(confidence) {
  const value = String(confidence || '').toUpperCase();

  if (value === 'HIGH') return 15;
  if (value === 'LOW') return 5;

  return 10;
}

function sciipEscalationScore_(task) {
  const trigger = String(task.Escalation_Trigger || '').toUpperCase();
  const status = String(task.Task_Status || '').toUpperCase();

  let score = 0;

  if (trigger) score += 10;
  if (trigger.indexOf('LANDLORD') !== -1) score += 5;
  if (trigger.indexOf('TIME-SENSITIVE') !== -1) score += 5;
  if (status === 'OPEN') score += 5;

  return score;
}

function sciipCompositePriorityLabel_(score) {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 50) return 'MEDIUM';

  return 'LOW';
}

function sciipRecommendedOrder_(score) {
  if (score >= 85) return 1;
  if (score >= 70) return 2;
  if (score >= 50) return 3;

  return 4;
}

function sciipPriorityRationale_(task, score) {
  return [
    `Task "${task.Task_Title || 'Untitled Task'}" received a composite score of ${score}.`,
    `Scoring reflects priority, timing, task category, confidence, escalation language, and current task status.`,
    'Higher scores should be reviewed first during SCIIP execution cycles.'
  ].join('\n');
}

/**
 * Sheet setup
 */
function sciipEnsureTaskPriorityScoreSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(TASK_PRIORITY_SCORE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(TASK_PRIORITY_SCORE_SHEET);
    sheet.appendRow(TASK_PRIORITY_SCORE_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== TASK_PRIORITY_SCORE_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(TASK_PRIORITY_SCORE_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateTaskPriorityScoreId_() {
  return 'TASK_SCORE_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipReadSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Missing SCIIP_SPREADSHEET_ID in Script Properties. Add your SCIIP runtime Google Sheet ID.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Test function
 */
function sciipTestTaskPrioritizationProcessor() {
  const result = sciipRunTaskPrioritizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestTaskPrioritizationProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v4.0
 * 390_WorkQueueProcessor
 *
 * TASK_PRIORITY_SCORE → WORK_QUEUE
 *******************************************************/

const WORK_QUEUE_SHEET = 'WORK_QUEUE';

const WORK_QUEUE_HEADERS = [
  'ID',
  'Business_Key',
  'Task_Priority_Score_ID',
  'Execution_Task_ID',
  'Queue_Date',
  'Queue_Type',
  'Queue_Position',
  'Work_Title',
  'Work_Description',
  'Assigned_Role',
  'Priority_Label',
  'Composite_Score',
  'Recommended_Order',
  'Work_Status',
  'Review_Cadence',
  'Escalation_Trigger',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const WORK_QUEUE_PROCESSOR = '390_WorkQueueProcessor';

function sciipRunWorkQueueProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const scoreSheet = ss.getSheetByName('TASK_PRIORITY_SCORE');
  if (!scoreSheet) throw new Error('Missing TASK_PRIORITY_SCORE sheet');

  const taskSheet = ss.getSheetByName('EXECUTION_TASK');
  if (!taskSheet) throw new Error('Missing EXECUTION_TASK sheet');

  const queueSheet = sciipEnsureWorkQueueSheet_();

  const scores = sciipReadSheetObjects_(scoreSheet);
  const tasks = sciipReadSheetObjects_(taskSheet);
  const existingQueue = sciipReadSheetObjects_(queueSheet);

  const taskById = {};
  tasks.forEach(task => {
    if (task.ID) taskById[String(task.ID).trim()] = task;
  });

  const existingKeys = new Set(
    existingQueue.map(r => String(r.Business_Key || '').trim())
  );

  const activeScores = scores
    .filter(score => String(score.Status || '').toUpperCase() !== 'INACTIVE')
    .sort((a, b) => {
      const scoreB = Number(b.Composite_Score || 0);
      const scoreA = Number(a.Composite_Score || 0);
      return scoreB - scoreA;
    });

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoScore = 0;
  let skippedNoTask = 0;

  activeScores.forEach((score, index) => {
    const scoreId = score.ID || score.Task_Priority_Score_ID;
    const taskId = score.Execution_Task_ID;

    if (!scoreId) {
      skippedNoScore++;
      return;
    }

    if (!taskId || !taskById[String(taskId).trim()]) {
      skippedNoTask++;
      return;
    }

    const businessKey = `WORK_QUEUE|${scoreId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const task = taskById[String(taskId).trim()];
    const queueItem = sciipBuildWorkQueueItem_(score, task, businessKey, index + 1);

    queueSheet.appendRow(
      WORK_QUEUE_HEADERS.map(h => queueItem[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: WORK_QUEUE_PROCESSOR,
    status: 'SUCCESS',
    priorityScoresReviewed: scores.length,
    workQueueItemsCreated: created,
    skippedDuplicate,
    skippedNoScore,
    skippedNoTask,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildWorkQueueItem_(score, task, businessKey, queuePosition) {
  const now = new Date().toISOString();

  return {
    ID: sciipGenerateWorkQueueId_(),
    Business_Key: businessKey,
    Task_Priority_Score_ID: score.ID || '',
    Execution_Task_ID: task.ID || '',
    Queue_Date: now,
    Queue_Type: 'EXECUTION',
    Queue_Position: queuePosition,
    Work_Title: task.Task_Title || 'Untitled Work Item',
    Work_Description: task.Task_Description || '',
    Assigned_Role: task.Assigned_Role || 'SCIIP Operator',
    Priority_Label: score.Priority_Label || 'MEDIUM',
    Composite_Score: score.Composite_Score || '',
    Recommended_Order: score.Recommended_Order || '',
    Work_Status: 'OPEN',
    Review_Cadence: sciipWorkQueueReviewCadence_(score),
    Escalation_Trigger: task.Escalation_Trigger || '',
    Created_At: now,
    Updated_At: now,
    Processor: WORK_QUEUE_PROCESSOR,
    Notes: 'Generated from TASK_PRIORITY_SCORE and EXECUTION_TASK'
  };
}

/**
 * Queue logic
 */
function sciipWorkQueueReviewCadence_(score) {
  const label = String(score.Priority_Label || '').toUpperCase();

  if (label === 'CRITICAL') return 'Immediate';
  if (label === 'HIGH') return 'Current cycle';
  if (label === 'MEDIUM') return 'Next intelligence cycle';

  return 'Routine review';
}

/**
 * Sheet setup
 */
function sciipEnsureWorkQueueSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(WORK_QUEUE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(WORK_QUEUE_SHEET);
    sheet.appendRow(WORK_QUEUE_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== WORK_QUEUE_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(WORK_QUEUE_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateWorkQueueId_() {
  return 'WORK_QUEUE_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipReadSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Missing SCIIP_SPREADSHEET_ID in Script Properties. Add your SCIIP runtime Google Sheet ID.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Test function
 */
function sciipTestWorkQueueProcessor() {
  const result = sciipRunWorkQueueProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestWorkQueueProcessor',
    result
  }));

  return result;
}

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


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 420_CommandCenterProcessor
 *
 * OPERATOR_CONSOLE → COMMAND_CENTER
 *
 * Migration note:
 * Preserves original 420 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const COMMAND_CENTER_PROCESSOR = '420_CommandCenterProcessor';
const COMMAND_CENTER_SOURCE_SHEET = 'OPERATOR_CONSOLE';
const COMMAND_CENTER_SHEET = 'COMMAND_CENTER';

const COMMAND_CENTER_HEADERS = [
  'ID',
  'Business_Key',
  'Operator_Console_ID',
  'Command_Date',
  'Command_Title',
  'System_Status',
  'Execution_Posture',
  'Open_Workload',
  'Escalation_Level',
  'Leadership_Focus',
  'Command_Summary',
  'Priority_Direction',
  'Immediate_Actions',
  'Monitoring_Instructions',
  'Command_Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: COMMAND_CENTER_PROCESSOR,
    action: 'COMMAND_CENTER_BUILD',
    sourceSheet: COMMAND_CENTER_SOURCE_SHEET,
    targetSheet: COMMAND_CENTER_SHEET,
    ledgerSheet: 'COMMAND_CENTER_RUNTIME_LEDGER',

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
        summary: 'Command center runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: COMMAND_CENTER_PROCESSOR
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Missing OPERATOR_CONSOLE sheet. Run 410 first.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        COMMAND_CENTER_HEADERS
      );

      const consoles = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);
      let created = 0;
      let skippedDuplicate = 0;
      let skippedNoConsole = 0;

      consoles.forEach(function(console) {
        const consoleId = console.ID || console.Operator_Console_ID;

        if (!consoleId) {
          skippedNoConsole++;
          return;
        }

        const commandBusinessKey = 'COMMAND_CENTER|' + consoleId;
        const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
          definition.targetSheet,
          commandBusinessKey
        );

        if (existing) {
          skippedDuplicate++;
          return;
        }

        const command = sciipBuildCommandCenter_(console, commandBusinessKey);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          COMMAND_CENTER_HEADERS,
          command
        );

        created++;
      });

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          operatorConsolesReviewed: consoles.length,
          commandCenterRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoConsole: skippedNoConsole,
          transactionId: transaction.transactionId
        },
        message: '420 CommandCenterProcessor runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: COMMAND_CENTER_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: consoles.length,
        processed: consoles.length,
        skippedDuplicate: skippedDuplicate,
        skippedNoInputs: skippedNoConsole,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          operatorConsolesReviewed: consoles.length,
          commandCenterRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoConsole: skippedNoConsole,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipBuildCommandCenter_(console, businessKey) {
  const now = new Date().toISOString();

  return {
    ID: sciipGenerateCommandCenterId_(),
    Business_Key: businessKey,
    Operator_Console_ID: console.ID || '',
    Command_Date: console.Console_Date || now,
    Command_Title: sciipCommandCenterTitle_(console),
    System_Status: sciipCommandSystemStatus_(console),
    Execution_Posture: sciipExecutionPosture_(console),
    Open_Workload: console.Open_Work_Items || 0,
    Escalation_Level: sciipEscalationLevel_(console),
    Leadership_Focus: sciipLeadershipFocus_(console),
    Command_Summary: sciipCommandSummary_(console),
    Priority_Direction: sciipPriorityDirection_(console),
    Immediate_Actions: sciipImmediateActions_(console),
    Monitoring_Instructions: sciipMonitoringInstructions_(console),
    Command_Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: COMMAND_CENTER_PROCESSOR,
    Notes: 'Generated from OPERATOR_CONSOLE'
  };
}

function sciipCommandCenterTitle_(console) {
  const date = console.Console_Date || new Date().toISOString().slice(0, 10);
  return 'SCIIP Command Center — ' + date;
}

function sciipCommandSystemStatus_(console) {
  const status = String(console.Operating_Status || '').toUpperCase();

  if (status === 'ESCALATION_REQUIRED') return 'ATTENTION_REQUIRED';
  if (status === 'ACTIVE_REVIEW') return 'ACTIVE';
  if (status === 'NORMAL_OPERATIONS') return 'STABLE';

  return 'CLEAR';
}

function sciipExecutionPosture_(console) {
  const critical = Number(console.Critical_Count || 0);
  const high = Number(console.High_Count || 0);
  const open = Number(console.Open_Work_Items || 0);

  if (critical > 0) return 'ESCALATE_AND_ACT';
  if (high > 0) return 'PRIORITIZE_CURRENT_CYCLE';
  if (open > 0) return 'MONITOR_AND_EXECUTE';

  return 'NO_ACTIVE_WORKLOAD';
}

function sciipEscalationLevel_(console) {
  const critical = Number(console.Critical_Count || 0);
  const high = Number(console.High_Count || 0);

  if (critical > 0) return 'LEVEL_1';
  if (high > 0) return 'LEVEL_2';

  return 'LEVEL_3';
}

function sciipLeadershipFocus_(console) {
  return console.Primary_Focus || 'No active leadership focus required.';
}

function sciipCommandSummary_(console) {
  return [
    'Open workload: ' + (console.Open_Work_Items || 0),
    'Critical: ' + (console.Critical_Count || 0),
    'High: ' + (console.High_Count || 0),
    'Medium: ' + (console.Medium_Count || 0),
    'Low: ' + (console.Low_Count || 0),
    '',
    console.Primary_Focus || ''
  ].join('\n');
}

function sciipPriorityDirection_(console) {
  const critical = Number(console.Critical_Count || 0);
  const high = Number(console.High_Count || 0);

  if (critical > 0) {
    return 'Review critical items first and determine whether immediate landlord-facing action is required.';
  }

  if (high > 0) {
    return 'Prioritize high-priority queue items during the current execution cycle.';
  }

  return 'Maintain normal execution cadence and continue monitoring for new escalations.';
}

function sciipImmediateActions_(console) {
  return console.Recommended_Operator_Action || 'No immediate action required.';
}

function sciipMonitoringInstructions_(console) {
  return [
    'Monitor future operator console records for escalation changes.',
    'Compare recurring work items against prior command center snapshots.',
    'Escalate repeated themes into strategic decisions or landlord-ready actions where appropriate.'
  ].join('\n');
}

function sciipGenerateCommandCenterId_() {
  return 'COMMAND_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipTestCommandCenterProcessor() {
  const result = sciipRunCommandCenterProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestCommandCenterProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration Repair
 * 430_SystemHealthProcessor
 *
 * COMMAND_CENTER → SYSTEM_HEALTH
 *
 * Repair note:
 * Restores the correct 430 processor behavior after the
 * accidental overwrite with WorkQueueDigest logic.
 * Preserves original 430 business logic and migrates runtime
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const SYSTEM_HEALTH_PROCESSOR = '430_SystemHealthProcessor';
const SYSTEM_HEALTH_SOURCE_SHEET = 'COMMAND_CENTER';
const SYSTEM_HEALTH_SHEET = 'SYSTEM_HEALTH';

const SYSTEM_HEALTH_HEADERS = [
  'ID',
  'Business_Key',
  'Command_Center_ID',
  'Health_Date',
  'System_Status',
  'Execution_Posture',
  'Escalation_Level',
  'Open_Workload',
  'Health_Score',
  'Health_Label',
  'Operational_Risk',
  'Health_Summary',
  'Recommended_System_Action',
  'Monitoring_Cadence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunSystemHealthProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: SYSTEM_HEALTH_PROCESSOR,
    action: 'SYSTEM_HEALTH_BUILD',
    sourceSheet: SYSTEM_HEALTH_SOURCE_SHEET,
    targetSheet: SYSTEM_HEALTH_SHEET,
    ledgerSheet: 'SYSTEM_HEALTH_RUNTIME_LEDGER',

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
        summary: 'System health runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          repairedOverwrite: true,
          originalProcessor: SYSTEM_HEALTH_PROCESSOR
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Missing COMMAND_CENTER sheet. Run 420 first.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        SYSTEM_HEALTH_HEADERS
      );

      const commands = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      let created = 0;
      let skippedDuplicate = 0;
      let skippedNoCommand = 0;

      commands.forEach(function(command) {
        const commandId = command.ID || command.Command_Center_ID;

        if (!commandId) {
          skippedNoCommand++;
          return;
        }

        const businessKey = 'SYSTEM_HEALTH|' + commandId;

        const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
          definition.targetSheet,
          businessKey
        );

        if (existing) {
          skippedDuplicate++;
          return;
        }

        const health = sciipBuildSystemHealth_(command, businessKey);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          SYSTEM_HEALTH_HEADERS,
          health
        );

        created++;
      });

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          commandCenterRecordsReviewed: commands.length,
          systemHealthRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoCommand: skippedNoCommand,
          transactionId: transaction.transactionId
        },
        message: '430 SystemHealthProcessor repaired runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: SYSTEM_HEALTH_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: commands.length,
        processed: commands.length,
        skippedDuplicate: skippedDuplicate,
        skippedNoInputs: skippedNoCommand,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          repairedOverwrite: true,
          commandCenterRecordsReviewed: commands.length,
          systemHealthRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoCommand: skippedNoCommand,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipBuildSystemHealth_(command, businessKey) {
  const now = new Date().toISOString();
  const healthScore = sciipSystemHealthScore_(command);

  return {
    ID: sciipGenerateSystemHealthId_(),
    Business_Key: businessKey,
    Command_Center_ID: command.ID || command.Command_Center_ID || '',
    Health_Date: command.Command_Date || now,
    System_Status: command.System_Status || '',
    Execution_Posture: command.Execution_Posture || '',
    Escalation_Level: command.Escalation_Level || '',
    Open_Workload: command.Open_Workload || 0,
    Health_Score: healthScore,
    Health_Label: sciipSystemHealthLabel_(healthScore),
    Operational_Risk: sciipOperationalRisk_(command),
    Health_Summary: sciipHealthSummary_(command, healthScore),
    Recommended_System_Action: sciipRecommendedSystemAction_(command, healthScore),
    Monitoring_Cadence: sciipHealthMonitoringCadence_(healthScore),
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SYSTEM_HEALTH_PROCESSOR,
    Notes: 'Generated from COMMAND_CENTER using SCIIP_RuntimeProcessorBase.'
  };
}

function sciipSystemHealthScore_(command) {
  const systemStatus = String(command.System_Status || '').toUpperCase();
  const posture = String(command.Execution_Posture || '').toUpperCase();
  const escalation = String(command.Escalation_Level || '').toUpperCase();
  const workload = Number(command.Open_Workload || 0);

  let score = 100;

  if (systemStatus === 'ATTENTION_REQUIRED') score -= 35;
  if (systemStatus === 'ACTIVE') score -= 20;
  if (systemStatus === 'STABLE') score -= 5;

  if (posture === 'ESCALATE_AND_ACT') score -= 25;
  if (posture === 'PRIORITIZE_CURRENT_CYCLE') score -= 15;
  if (posture === 'MONITOR_AND_EXECUTE') score -= 5;

  if (escalation === 'LEVEL_1') score -= 20;
  if (escalation === 'LEVEL_2') score -= 10;

  if (workload >= 10) score -= 10;
  if (workload >= 25) score -= 20;

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return score;
}

function sciipSystemHealthLabel_(score) {
  if (score >= 90) return 'CLEAR';
  if (score >= 75) return 'STABLE';
  if (score >= 55) return 'ACTIVE';
  if (score >= 35) return 'ATTENTION_REQUIRED';

  return 'CRITICAL';
}

function sciipOperationalRisk_(command) {
  const escalation = String(command.Escalation_Level || '').toUpperCase();

  if (escalation === 'LEVEL_1') return 'HIGH';
  if (escalation === 'LEVEL_2') return 'MEDIUM';

  return 'LOW';
}

function sciipHealthSummary_(command, score) {
  return [
    'SCIIP system health score: ' + score,
    'System status: ' + (command.System_Status || 'UNKNOWN'),
    'Execution posture: ' + (command.Execution_Posture || 'UNKNOWN'),
    'Escalation level: ' + (command.Escalation_Level || 'UNKNOWN'),
    'Open workload: ' + (command.Open_Workload || 0)
  ].join('\n');
}

function sciipRecommendedSystemAction_(command, score) {
  if (score < 35) {
    return 'Immediate review required. Escalate command center items and resolve critical workload.';
  }

  if (score < 55) {
    return 'Attention required. Review open command center items and prioritize unresolved escalations.';
  }

  if (score < 75) {
    return 'Active monitoring required. Continue execution cycle and watch for recurring escalation themes.';
  }

  if (score < 90) {
    return 'System stable. Continue normal monitoring and execution cadence.';
  }

  return 'System clear. No immediate action required.';
}

function sciipHealthMonitoringCadence_(score) {
  if (score < 35) return 'Immediate';
  if (score < 55) return 'Current cycle';
  if (score < 75) return 'Next intelligence cycle';

  return 'Routine';
}

function sciipGenerateSystemHealthId_() {
  return 'SYS_HEALTH_' +
    Utilities.getUuid()
      .replace(/-/g, '')
      .slice(0, 16)
      .toUpperCase();
}

function sciipTestSystemHealthProcessor() {
  const result = sciipRunSystemHealthProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestSystemHealthProcessor',
    result: result
  }));

  return result;
}


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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 460_ExecutiveDashboardProcessor
 *
 * PLATFORM_DAILY_REPORT + COMMAND_CENTER + OPERATOR_CONSOLE
 * → EXECUTIVE_DASHBOARD
 *
 * Migration note:
 * Preserves original 460 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const EXECUTIVE_DASHBOARD_PROCESSOR = '460_ExecutiveDashboardProcessor';
const EXECUTIVE_DASHBOARD_SHEET = 'EXECUTIVE_DASHBOARD';

const EXECUTIVE_DASHBOARD_HEADERS = [
  'Dashboard_ID',
  'Business_Key',
  'Dashboard_Date',
  'Dashboard_Type',
  'Platform_Daily_Report_ID',
  'Command_Center_ID',
  'Operator_Console_ID',
  'Executive_Status',
  'Platform_Status',
  'Command_Status',
  'Operator_Status',
  'Executive_Narrative',
  'Critical_Decisions',
  'Key_Risks',
  'Top_Priorities',
  'Recommended_Actions',
  'Decision_Required',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureExecutiveDashboardSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    EXECUTIVE_DASHBOARD_SHEET,
    EXECUTIVE_DASHBOARD_HEADERS
  );
}

function sciipRunExecutiveDashboardProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: EXECUTIVE_DASHBOARD_PROCESSOR,
    action: 'EXECUTIVE_DASHBOARD_BUILD',
    sourceSheet: null,
    targetSheet: EXECUTIVE_DASHBOARD_SHEET,
    ledgerSheet: 'EXECUTIVE_DASHBOARD_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const platformReports = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('PLATFORM_DAILY_REPORT');
      const commandCenters = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('COMMAND_CENTER');
      const operatorConsoles = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('OPERATOR_CONSOLE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: platformReports.length + commandCenters.length + operatorConsoles.length,
        outputCount: 1,
        summary: 'Executive dashboard runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: EXECUTIVE_DASHBOARD_PROCESSOR,
          inputSheets: [
            'PLATFORM_DAILY_REPORT',
            'COMMAND_CENTER',
            'OPERATOR_CONSOLE'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      sciipEnsureExecutiveDashboardSchema();

      const platformReport = sciipGetLatestRuntimeRecordByCreatedAt_('PLATFORM_DAILY_REPORT');
      const commandCenter = sciipGetLatestRuntimeRecordByCreatedAt_('COMMAND_CENTER');
      const operatorConsole = sciipGetLatestRuntimeRecordByCreatedAt_('OPERATOR_CONSOLE');

      if (!platformReport && !commandCenter && !operatorConsole) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: EXECUTIVE_DASHBOARD_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            executiveDashboardsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const dashboardDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const dashboardBusinessKey = 'EXECUTIVE_DASHBOARD|' + dashboardDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        dashboardBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: EXECUTIVE_DASHBOARD_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 3,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            executiveDashboardsCreated: 0,
            skippedDuplicate: 1,
            dashboardBusinessKey: dashboardBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const dashboardRow = sciipCreateExecutiveDashboard_({
        businessKey: dashboardBusinessKey,
        dashboardDate: dashboardDate,
        platformReport: platformReport,
        commandCenter: commandCenter,
        operatorConsole: operatorConsole,
        processor: EXECUTIVE_DASHBOARD_PROCESSOR
      });

      const dashboardObject = sciipExecutiveDashboardRowToObject_(dashboardRow);

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        EXECUTIVE_DASHBOARD_HEADERS,
        dashboardObject
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          platformReportFound: !!platformReport,
          commandCenterFound: !!commandCenter,
          operatorConsoleFound: !!operatorConsole,
          executiveDashboardsCreated: 1,
          skippedDuplicate: 0,
          dashboardBusinessKey: dashboardBusinessKey,
          transactionId: transaction.transactionId
        },
        message: '460 ExecutiveDashboardProcessor runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: EXECUTIVE_DASHBOARD_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 3,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          platformReportFound: !!platformReport,
          commandCenterFound: !!commandCenter,
          operatorConsoleFound: !!operatorConsole,
          executiveDashboardsCreated: 1,
          skippedDuplicate: 0,
          dashboardBusinessKey: dashboardBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipGetLatestRuntimeRecordByCreatedAt_(sheetName) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  records.sort(function(a, b) {
    const aTime = sciipRuntimeRecordTimestamp_(a);
    const bTime = sciipRuntimeRecordTimestamp_(b);
    return aTime - bTime;
  });

  return records[records.length - 1];
}

function sciipRuntimeRecordTimestamp_(record) {
  if (!record) return 0;

  const raw =
    record.Created_At ||
    record.Updated_At ||
    record.Timestamp ||
    record.completedAt ||
    record.Completed_At ||
    '';

  const time = raw ? new Date(raw).getTime() : 0;
  return isNaN(time) ? 0 : time;
}

function sciipExecutiveDashboardRowToObject_(row) {
  const object = {};

  EXECUTIVE_DASHBOARD_HEADERS.forEach(function(header, index) {
    object[header] = row[index];
  });

  return object;
}

function sciipCreateExecutiveDashboard_(args) {
  const now = new Date();

  const platformStatus = sciipExtractFirstAvailable_(args.platformReport, [
    'Platform_Status',
    'Executive_Status',
    'Status'
  ]);

  const commandStatus = sciipExtractFirstAvailable_(args.commandCenter, [
    'Command_Status',
    'Command_Center_Status',
    'Executive_Status',
    'Status'
  ]);

  const operatorStatus = sciipExtractFirstAvailable_(args.operatorConsole, [
    'Operator_Status',
    'Console_Status',
    'Executive_Status',
    'Status'
  ]);

  const executiveNarrative = sciipComposeExecutiveDashboardNarrative_({
    platformReport: args.platformReport,
    commandCenter: args.commandCenter,
    operatorConsole: args.operatorConsole,
    platformStatus,
    commandStatus,
    operatorStatus
  });

  const criticalDecisions = sciipComposeExecutiveCriticalDecisions_({
    platformReport: args.platformReport,
    commandCenter: args.commandCenter,
    operatorConsole: args.operatorConsole
  });

  const keyRisks = sciipComposeExecutiveKeyRisks_({
    platformReport: args.platformReport,
    commandCenter: args.commandCenter,
    operatorConsole: args.operatorConsole
  });

  const topPriorities = sciipComposeExecutiveTopPriorities_({
    platformReport: args.platformReport,
    commandCenter: args.commandCenter,
    operatorConsole: args.operatorConsole
  });

  const recommendedActions = sciipComposeExecutiveRecommendedActions_({
    platformStatus,
    commandStatus,
    operatorStatus,
    criticalDecisions,
    keyRisks,
    topPriorities
  });

  const executiveStatus = sciipInferExecutiveDashboardStatus_({
    platformStatus,
    commandStatus,
    operatorStatus,
    keyRisks,
    criticalDecisions
  });

  const decisionRequired = sciipInferExecutiveDashboardDecisionRequired_({
    executiveStatus,
    criticalDecisions,
    keyRisks
  });

  return [
    sciipGenerateId_('EDB'),
    args.businessKey,
    args.dashboardDate,
    'EXECUTIVE_DASHBOARD',
    sciipExtractFirstAvailable_(args.platformReport, [
      'Report_ID',
      'Platform_Daily_Report_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.commandCenter, [
      'Command_Center_ID',
      'Command_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.operatorConsole, [
      'Operator_Console_ID',
      'Console_ID',
      'Record_ID',
      'ID'
    ]),
    executiveStatus,
    platformStatus,
    commandStatus,
    operatorStatus,
    executiveNarrative,
    criticalDecisions,
    keyRisks,
    topPriorities,
    recommendedActions,
    decisionRequired,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipComposeExecutiveDashboardNarrative_(args) {
  const parts = [];

  const platformSummary = sciipExtractFirstAvailable_(args.platformReport, [
    'Executive_Summary',
    'System_Health_Summary',
    'Work_Queue_Summary',
    'Market_Intelligence_Summary'
  ]);

  const commandSummary = sciipExtractFirstAvailable_(args.commandCenter, [
    'Command_Summary',
    'Executive_Summary',
    'Command_Center_Summary',
    'Summary'
  ]);

  const operatorSummary = sciipExtractFirstAvailable_(args.operatorConsole, [
    'Operator_Summary',
    'Console_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  parts.push(
    `SCIIP executive dashboard status: ${sciipSafeText_(args.platformStatus || 'UNKNOWN')}.`
  );

  if (platformSummary) {
    parts.push(`Platform daily report: ${platformSummary}`);
  }

  if (commandSummary) {
    parts.push(`Command center: ${commandSummary}`);
  }

  if (operatorSummary) {
    parts.push(`Operator console: ${operatorSummary}`);
  }

  if (parts.length === 1) {
    parts.push('No detailed executive narrative was available from current input records.');
  }

  return parts.join('\n\n');
}

function sciipComposeExecutiveCriticalDecisions_(args) {
  const decisions = [];

  const platformDecision = sciipExtractFirstAvailable_(args.platformReport, [
    'Decision_Required',
    'Critical_Decisions',
    'Decision_Items'
  ]);

  const commandDecision = sciipExtractFirstAvailable_(args.commandCenter, [
    'Critical_Decisions',
    'Decision_Required',
    'Decision_Items'
  ]);

  const operatorDecision = sciipExtractFirstAvailable_(args.operatorConsole, [
    'Critical_Decisions',
    'Decision_Required',
    'Decision_Items'
  ]);

  if (platformDecision && String(platformDecision).toUpperCase() !== 'NO') {
    decisions.push(`Platform: ${platformDecision}`);
  }

  if (commandDecision && String(commandDecision).toUpperCase() !== 'NO') {
    decisions.push(`Command Center: ${commandDecision}`);
  }

  if (operatorDecision && String(operatorDecision).toUpperCase() !== 'NO') {
    decisions.push(`Operator Console: ${operatorDecision}`);
  }

  if (decisions.length === 0) {
    decisions.push('No critical executive decisions identified.');
  }

  return decisions.join('\n');
}

function sciipComposeExecutiveKeyRisks_(args) {
  const risks = [];

  const platformRisks = sciipExtractFirstAvailable_(args.platformReport, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  const commandRisks = sciipExtractFirstAvailable_(args.commandCenter, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  const operatorRisks = sciipExtractFirstAvailable_(args.operatorConsole, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  if (platformRisks) risks.push(`Platform: ${platformRisks}`);
  if (commandRisks) risks.push(`Command Center: ${commandRisks}`);
  if (operatorRisks) risks.push(`Operator Console: ${operatorRisks}`);

  if (risks.length === 0) {
    risks.push('No material executive risks identified.');
  }

  return risks.join('\n');
}

function sciipComposeExecutiveTopPriorities_(args) {
  const priorities = [];

  const platformPriorities = sciipExtractFirstAvailable_(args.platformReport, [
    'Priority_Actions',
    'Top_Priorities',
    'Recommended_Actions'
  ]);

  const commandPriorities = sciipExtractFirstAvailable_(args.commandCenter, [
    'Top_Priorities',
    'Priority_Actions',
    'Recommended_Actions'
  ]);

  const operatorPriorities = sciipExtractFirstAvailable_(args.operatorConsole, [
    'Top_Priorities',
    'Priority_Actions',
    'Recommended_Actions'
  ]);

  if (platformPriorities) priorities.push(`Platform: ${platformPriorities}`);
  if (commandPriorities) priorities.push(`Command Center: ${commandPriorities}`);
  if (operatorPriorities) priorities.push(`Operator Console: ${operatorPriorities}`);

  if (priorities.length === 0) {
    priorities.push('Continue normal SCIIP operating cadence.');
  }

  return priorities.join('\n');
}

function sciipComposeExecutiveRecommendedActions_(args) {
  const actions = [];

  const combined = [
    args.platformStatus,
    args.commandStatus,
    args.operatorStatus,
    args.criticalDecisions,
    args.keyRisks,
    args.topPriorities
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    actions.push('Review critical operating issues and assign immediate owner.');
  }

  if (
    combined.includes('decision') &&
    !combined.includes('no critical executive decisions')
  ) {
    actions.push('Escalate decision items for executive review.');
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog')
  ) {
    actions.push('Clear blocked or overdue work queue items.');
  }

  if (actions.length === 0) {
    actions.push('Maintain current platform cadence and monitor next daily cycle.');
  }

  return actions.join('\n');
}

function sciipInferExecutiveDashboardStatus_(args) {
  const combined = [
    args.platformStatus,
    args.commandStatus,
    args.operatorStatus,
    args.keyRisks,
    args.criticalDecisions
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    return 'ATTENTION_REQUIRED';
  }

  if (
    combined.includes('watch') ||
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog') ||
    combined.includes('risk')
  ) {
    return 'WATCH';
  }

  return 'OPERATIONAL';
}

function sciipInferExecutiveDashboardDecisionRequired_(args) {
  const combined = [
    args.executiveStatus,
    args.criticalDecisions,
    args.keyRisks
  ].join(' ').toLowerCase();

  if (
    combined.includes('attention_required') ||
    combined.includes('critical') ||
    combined.includes('executive review') ||
    (
      combined.includes('decision') &&
      !combined.includes('no critical executive decisions')
    )
  ) {
    return 'YES';
  }

  return 'NO';
}

function sciipSafeText_(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return String(value).trim();
}


function sciipExtractFirstAvailable_(record, fieldNames) {
  if (!record || !fieldNames || !fieldNames.length) {
    return '';
  }

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (
      Object.prototype.hasOwnProperty.call(record, fieldName) &&
      record[fieldName] !== null &&
      record[fieldName] !== undefined &&
      String(record[fieldName]).trim() !== ''
    ) {
      return String(record[fieldName]).trim();
    }
  }

  return '';
}

function sciipGenerateId_(prefix) {
  const cleanPrefix = prefix || 'SCIIP';
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');

  return cleanPrefix + '_' + timestamp + '_' + random;
}

function sciipTestExecutiveDashboardProcessor() {
  const result = sciipRunExecutiveDashboardProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestExecutiveDashboardProcessor',
    result
  }));
  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 470_CommandBriefProcessor
 *
 * EXECUTIVE_DASHBOARD + PLATFORM_DAILY_REPORT + STRATEGIC_DECISION
 * → COMMAND_BRIEF
 *
 * Migration note:
 * Preserves original 470 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const COMMAND_BRIEF_PROCESSOR = '470_CommandBriefProcessor';
const COMMAND_BRIEF_SHEET = 'COMMAND_BRIEF';

const COMMAND_BRIEF_HEADERS = [
  'Command_Brief_ID',
  'Business_Key',
  'Brief_Date',
  'Brief_Type',
  'Executive_Dashboard_ID',
  'Platform_Daily_Report_ID',
  'Strategic_Decision_ID',
  'Command_Status',
  'Situation',
  'Mission',
  'Execution',
  'Risks',
  'Decisions',
  'Priority_Actions',
  'Commander_Intent',
  'Decision_Required',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureCommandBriefSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    COMMAND_BRIEF_SHEET,
    COMMAND_BRIEF_HEADERS
  );
}

function sciipRunCommandBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: COMMAND_BRIEF_PROCESSOR,
    action: 'COMMAND_BRIEF_BUILD',
    sourceSheet: null,
    targetSheet: COMMAND_BRIEF_SHEET,
    ledgerSheet: 'COMMAND_BRIEF_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const dashboards = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('EXECUTIVE_DASHBOARD');
      const platformReports = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('PLATFORM_DAILY_REPORT');
      const strategicDecisions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('STRATEGIC_DECISION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: dashboards.length + platformReports.length + strategicDecisions.length,
        outputCount: 1,
        summary: 'Command brief runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: COMMAND_BRIEF_PROCESSOR,
          inputSheets: [
            'EXECUTIVE_DASHBOARD',
            'PLATFORM_DAILY_REPORT',
            'STRATEGIC_DECISION'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      sciipEnsureCommandBriefSchema();

      const dashboard = sciipGetLatestRuntimeRecordByCreatedAt_('EXECUTIVE_DASHBOARD');
      const platformReport = sciipGetLatestRuntimeRecordByCreatedAt_('PLATFORM_DAILY_REPORT');
      const strategicDecision = sciipGetLatestRuntimeRecordByCreatedAt_('STRATEGIC_DECISION');

      if (!dashboard && !platformReport && !strategicDecision) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: COMMAND_BRIEF_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            commandBriefsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const briefDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const commandBriefBusinessKey = 'COMMAND_BRIEF|' + briefDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        commandBriefBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: COMMAND_BRIEF_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 3,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            commandBriefsCreated: 0,
            skippedDuplicate: 1,
            commandBriefBusinessKey: commandBriefBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const commandBrief = sciipCreateCommandBrief_({
        businessKey: commandBriefBusinessKey,
        briefDate: briefDate,
        dashboard: dashboard,
        platformReport: platformReport,
        strategicDecision: strategicDecision,
        processor: COMMAND_BRIEF_PROCESSOR
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        COMMAND_BRIEF_HEADERS,
        commandBrief
      );

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: COMMAND_BRIEF_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 3,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          dashboardFound: !!dashboard,
          platformReportFound: !!platformReport,
          strategicDecisionFound: !!strategicDecision,
          commandBriefsCreated: 1,
          skippedDuplicate: 0,
          commandBriefBusinessKey: commandBriefBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipGetLatestRuntimeRecordByCreatedAt_(sheetName) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  records.sort(function(a, b) {
    const aTime = sciipRuntimeRecordTimestamp_(a);
    const bTime = sciipRuntimeRecordTimestamp_(b);
    return aTime - bTime;
  });

  return records[records.length - 1];
}

function sciipRuntimeRecordTimestamp_(record) {
  if (!record) return 0;

  const raw =
    record.Created_At ||
    record.Updated_At ||
    record.Timestamp ||
    record.completedAt ||
    record.Completed_At ||
    '';

  const time = raw ? new Date(raw).getTime() : 0;
  return isNaN(time) ? 0 : time;
}

function sciipCreateCommandBrief_(args) {
  const now = new Date();

  const commandStatus = sciipInferCommandBriefStatus_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const situation = sciipComposeCommandSituation_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const mission = sciipComposeCommandMission_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const execution = sciipComposeCommandExecution_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const risks = sciipComposeCommandRisks_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const decisions = sciipComposeCommandDecisions_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const priorityActions = sciipComposeCommandPriorityActions_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const commanderIntent = sciipComposeCommanderIntent_({
    commandStatus,
    situation,
    mission,
    execution,
    risks,
    decisions,
    priorityActions
  });

  const decisionRequired = sciipInferCommandBriefDecisionRequired_({
    commandStatus,
    decisions,
    risks
  });

  return [
    sciipGenerateId_('CBR'),
    args.businessKey,
    args.briefDate,
    'DAILY_COMMAND_BRIEF',
    sciipExtractFirstAvailable_(args.dashboard, [
      'Dashboard_ID',
      'Executive_Dashboard_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Report_ID',
      'Platform_Daily_Report_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.strategicDecision, [
      'Strategic_Decision_ID',
      'Decision_ID',
      'Record_ID',
      'ID'
    ]),
    commandStatus,
    situation,
    mission,
    execution,
    risks,
    decisions,
    priorityActions,
    commanderIntent,
    decisionRequired,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipComposeCommandSituation_(args) {
  const parts = [];

  const dashboardNarrative = sciipExtractFirstAvailable_(args.dashboard, [
    'Executive_Narrative',
    'Executive_Summary',
    'Summary'
  ]);

  const platformSummary = sciipExtractFirstAvailable_(args.platformReport, [
    'Executive_Summary',
    'System_Health_Summary',
    'Work_Queue_Summary',
    'Market_Intelligence_Summary'
  ]);

  const decisionSummary = sciipExtractFirstAvailable_(args.strategicDecision, [
    'Strategic_Decision',
    'Decision_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  if (dashboardNarrative) parts.push(`Executive dashboard: ${dashboardNarrative}`);
  if (platformSummary) parts.push(`Platform report: ${platformSummary}`);
  if (decisionSummary) parts.push(`Strategic decision context: ${decisionSummary}`);

  if (parts.length === 0) {
    parts.push('No current situation inputs available.');
  }

  return parts.join('\n\n');
}

function sciipComposeCommandMission_(args) {
  const status = sciipExtractFirstAvailable_(args.dashboard, [
    'Executive_Status',
    'Platform_Status',
    'Status'
  ]);

  if (String(status).toUpperCase() === 'ATTENTION_REQUIRED') {
    return 'Stabilize SCIIP operating layer, resolve executive risks, and restore normal platform cadence.';
  }

  if (String(status).toUpperCase() === 'WATCH') {
    return 'Maintain platform continuity while actively monitoring flagged risks, queue pressure, and decision items.';
  }

  return 'Maintain SCIIP operating cadence and convert daily platform intelligence into actionable execution.';
}

function sciipComposeCommandExecution_(args) {
  const actions = [];

  const dashboardActions = sciipExtractFirstAvailable_(args.dashboard, [
    'Recommended_Actions',
    'Top_Priorities',
    'Priority_Actions'
  ]);

  const platformActions = sciipExtractFirstAvailable_(args.platformReport, [
    'Priority_Actions',
    'Recommended_Actions',
    'Top_Priorities'
  ]);

  const decisionActions = sciipExtractFirstAvailable_(args.strategicDecision, [
    'Recommended_Action',
    'Execution_Action',
    'Priority_Action',
    'Action'
  ]);

  if (dashboardActions) actions.push(`Dashboard actions: ${dashboardActions}`);
  if (platformActions) actions.push(`Platform actions: ${platformActions}`);
  if (decisionActions) actions.push(`Strategic decision actions: ${decisionActions}`);

  if (actions.length === 0) {
    actions.push('Continue normal command cadence. No special execution items identified.');
  }

  return actions.join('\n');
}

function sciipComposeCommandRisks_(args) {
  const risks = [];

  const dashboardRisks = sciipExtractFirstAvailable_(args.dashboard, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  const platformRisks = sciipExtractFirstAvailable_(args.platformReport, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  const decisionRisks = sciipExtractFirstAvailable_(args.strategicDecision, [
    'Risk',
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  if (dashboardRisks) risks.push(`Executive dashboard: ${dashboardRisks}`);
  if (platformRisks) risks.push(`Platform report: ${platformRisks}`);
  if (decisionRisks) risks.push(`Strategic decision: ${decisionRisks}`);

  if (risks.length === 0) {
    risks.push('No material command risks identified.');
  }

  return risks.join('\n');
}

function sciipComposeCommandDecisions_(args) {
  const decisions = [];

  const dashboardDecisions = sciipExtractFirstAvailable_(args.dashboard, [
    'Critical_Decisions',
    'Decision_Required',
    'Decision_Items'
  ]);

  const platformDecisions = sciipExtractFirstAvailable_(args.platformReport, [
    'Decision_Required',
    'Critical_Decisions',
    'Decision_Items'
  ]);

  const strategicDecision = sciipExtractFirstAvailable_(args.strategicDecision, [
    'Strategic_Decision',
    'Decision',
    'Decision_Summary',
    'Recommendation'
  ]);

  if (dashboardDecisions && String(dashboardDecisions).toUpperCase() !== 'NO') {
    decisions.push(`Executive dashboard: ${dashboardDecisions}`);
  }

  if (platformDecisions && String(platformDecisions).toUpperCase() !== 'NO') {
    decisions.push(`Platform report: ${platformDecisions}`);
  }

  if (strategicDecision) {
    decisions.push(`Strategic decision: ${strategicDecision}`);
  }

  if (decisions.length === 0) {
    decisions.push('No command-level decisions required.');
  }

  return decisions.join('\n');
}

function sciipComposeCommandPriorityActions_(args) {
  const priorities = [];

  const dashboardPriorities = sciipExtractFirstAvailable_(args.dashboard, [
    'Top_Priorities',
    'Priority_Actions',
    'Recommended_Actions'
  ]);

  const platformPriorities = sciipExtractFirstAvailable_(args.platformReport, [
    'Priority_Actions',
    'Top_Priorities',
    'Recommended_Actions'
  ]);

  const strategicPriorities = sciipExtractFirstAvailable_(args.strategicDecision, [
    'Priority',
    'Priority_Action',
    'Recommended_Action',
    'Action'
  ]);

  if (dashboardPriorities) priorities.push(`Executive dashboard: ${dashboardPriorities}`);
  if (platformPriorities) priorities.push(`Platform report: ${platformPriorities}`);
  if (strategicPriorities) priorities.push(`Strategic decision: ${strategicPriorities}`);

  if (priorities.length === 0) {
    priorities.push('Continue normal SCIIP operating cadence.');
  }

  return priorities.join('\n');
}

function sciipComposeCommanderIntent_(args) {
  if (args.commandStatus === 'ATTENTION_REQUIRED') {
    return 'Focus command attention on restoring platform confidence, resolving critical decisions, and clearing risk items before expanding autonomous execution.';
  }

  if (args.commandStatus === 'WATCH') {
    return 'Maintain operating tempo while monitoring flagged issues and keeping priority actions visible to the operator.';
  }

  return 'Preserve operating rhythm, keep the intelligence loop active, and convert SCIIP outputs into disciplined execution.';
}

function sciipInferCommandBriefStatus_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.dashboard, ['Executive_Status', 'Platform_Status', 'Status']),
    sciipExtractFirstAvailable_(args.platformReport, ['Platform_Status', 'Status']),
    sciipExtractFirstAvailable_(args.strategicDecision, ['Status', 'Decision_Status']),
    sciipExtractFirstAvailable_(args.dashboard, ['Key_Risks', 'Critical_Decisions']),
    sciipExtractFirstAvailable_(args.platformReport, ['Key_Risks', 'Decision_Required'])
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    return 'ATTENTION_REQUIRED';
  }

  if (
    combined.includes('watch') ||
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog') ||
    combined.includes('risk')
  ) {
    return 'WATCH';
  }

  return 'OPERATIONAL';
}

function sciipInferCommandBriefDecisionRequired_(args) {
  const combined = [
    args.commandStatus,
    args.decisions,
    args.risks
  ].join(' ').toLowerCase();

  if (
    combined.includes('attention_required') ||
    combined.includes('critical') ||
    (
      combined.includes('decision') &&
      !combined.includes('no command-level decisions required')
    )
  ) {
    return 'YES';
  }

  return 'NO';
}


function sciipExtractFirstAvailable_(record, fieldNames) {
  if (!record || !fieldNames || !fieldNames.length) {
    return '';
  }

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (
      Object.prototype.hasOwnProperty.call(record, fieldName) &&
      record[fieldName] !== null &&
      record[fieldName] !== undefined &&
      String(record[fieldName]).trim() !== ''
    ) {
      return String(record[fieldName]).trim();
    }
  }

  return '';
}

function sciipGenerateId_(prefix) {
  const cleanPrefix = prefix || 'SCIIP';
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');

  return cleanPrefix + '_' + timestamp + '_' + random;
}

function sciipTestCommandBriefProcessor() {
  const result = sciipRunCommandBriefProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestCommandBriefProcessor',
    result: result
  }));
  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 480_AutonomousOperationsProcessor
 *
 * COMMAND_BRIEF + EXECUTIVE_DASHBOARD + WORK_QUEUE
 * → AUTONOMOUS_OPERATIONS
 *
 * Migration note:
 * Preserves original 480 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const AUTONOMOUS_OPERATIONS_PROCESSOR = '480_AutonomousOperationsProcessor';
const AUTONOMOUS_OPERATIONS_SHEET = 'AUTONOMOUS_OPERATIONS';

const AUTONOMOUS_OPERATIONS_HEADERS = [
  'Autonomous_Operation_ID',
  'Business_Key',
  'Operation_Date',
  'Operation_Type',
  'Command_Brief_ID',
  'Executive_Dashboard_ID',
  'Work_Queue_ID',
  'Autonomy_Mode',
  'Operation_Status',
  'Command_Intent',
  'Detected_Operating_State',
  'Executable_Directives',
  'Blocked_Items',
  'Recommended_Operator_Actions',
  'Escalation_Required',
  'Human_Review_Status',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousOperationsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    AUTONOMOUS_OPERATIONS_SHEET,
    AUTONOMOUS_OPERATIONS_HEADERS
  );
}

function sciipRunAutonomousOperationsProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: AUTONOMOUS_OPERATIONS_PROCESSOR,
    action: 'AUTONOMOUS_OPERATIONS_BUILD',
    sourceSheet: null,
    targetSheet: AUTONOMOUS_OPERATIONS_SHEET,
    ledgerSheet: 'AUTONOMOUS_OPERATIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const commandBriefs = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('COMMAND_BRIEF');
      const executiveDashboards = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('EXECUTIVE_DASHBOARD');
      const workQueueItems = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('WORK_QUEUE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: commandBriefs.length + executiveDashboards.length + workQueueItems.length,
        outputCount: 1,
        summary: 'Autonomous operations runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: AUTONOMOUS_OPERATIONS_PROCESSOR,
          inputSheets: [
            'COMMAND_BRIEF',
            'EXECUTIVE_DASHBOARD',
            'WORK_QUEUE'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousOperationsSchema();

      const commandBrief = sciipGetLatestRuntimeRecordByCreatedAt_('COMMAND_BRIEF');
      const executiveDashboard = sciipGetLatestRuntimeRecordByCreatedAt_('EXECUTIVE_DASHBOARD');
      const workQueue = sciipGetLatestRuntimeRecordByCreatedAt_('WORK_QUEUE');

      if (!commandBrief && !executiveDashboard && !workQueue) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: AUTONOMOUS_OPERATIONS_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOperationsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const operationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const autonomousOperationsBusinessKey = 'AUTONOMOUS_OPERATIONS|' + operationDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        autonomousOperationsBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: AUTONOMOUS_OPERATIONS_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 3,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOperationsCreated: 0,
            skippedDuplicate: 1,
            autonomousOperationsBusinessKey: autonomousOperationsBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const operation = sciipCreateAutonomousOperation_({
        businessKey: autonomousOperationsBusinessKey,
        operationDate: operationDate,
        commandBrief: commandBrief,
        executiveDashboard: executiveDashboard,
        workQueue: workQueue,
        processor: AUTONOMOUS_OPERATIONS_PROCESSOR
      });

      outputSheet.appendRow(operation);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: AUTONOMOUS_OPERATIONS_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 3,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          commandBriefFound: !!commandBrief,
          executiveDashboardFound: !!executiveDashboard,
          workQueueFound: !!workQueue,
          autonomousOperationsCreated: 1,
          skippedDuplicate: 0,
          autonomousOperationsBusinessKey: autonomousOperationsBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipGetLatestRuntimeRecordByCreatedAt_(sheetName) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  records.sort(function(a, b) {
    const aTime = sciipRuntimeRecordTimestamp_(a);
    const bTime = sciipRuntimeRecordTimestamp_(b);
    return aTime - bTime;
  });

  return records[records.length - 1];
}

function sciipRuntimeRecordTimestamp_(record) {
  if (!record) return 0;

  const raw =
    record.Created_At ||
    record.Updated_At ||
    record.Timestamp ||
    record.completedAt ||
    record.Completed_At ||
    '';

  const time = raw ? new Date(raw).getTime() : 0;
  return isNaN(time) ? 0 : time;
}

function sciipCreateAutonomousOperation_(args) {
  const now = new Date();

  const commandIntent = sciipExtractFirstAvailable_(args.commandBrief, [
    'Commander_Intent',
    'Mission',
    'Execution',
    'Priority_Actions'
  ]);

  const detectedOperatingState = sciipInferAutonomousOperatingState_({
    commandBrief: args.commandBrief,
    executiveDashboard: args.executiveDashboard,
    workQueue: args.workQueue
  });

  const executableDirectives = sciipComposeAutonomousDirectives_({
    commandBrief: args.commandBrief,
    executiveDashboard: args.executiveDashboard,
    workQueue: args.workQueue,
    detectedOperatingState
  });

  const blockedItems = sciipComposeAutonomousBlockedItems_({
    commandBrief: args.commandBrief,
    executiveDashboard: args.executiveDashboard,
    workQueue: args.workQueue
  });

  const recommendedOperatorActions = sciipComposeAutonomousOperatorActions_({
    detectedOperatingState,
    executableDirectives,
    blockedItems
  });

  const escalationRequired = sciipInferAutonomousEscalationRequired_({
    detectedOperatingState,
    blockedItems,
    commandBrief: args.commandBrief,
    executiveDashboard: args.executiveDashboard
  });

  return [
    sciipGenerateId_('AOP'),
    args.businessKey,
    args.operationDate,
    'DAILY_AUTONOMOUS_OPERATIONS_PLAN',
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Command_Brief_ID',
      'Brief_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.executiveDashboard, [
      'Dashboard_ID',
      'Executive_Dashboard_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.workQueue, [
      'Work_Queue_ID',
      'Queue_ID',
      'Record_ID',
      'ID'
    ]),
    'HUMAN_REVIEW_REQUIRED',
    detectedOperatingState,
    commandIntent,
    detectedOperatingState,
    executableDirectives,
    blockedItems,
    recommendedOperatorActions,
    escalationRequired,
    'PENDING_OPERATOR_REVIEW',
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferAutonomousOperatingState_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Command_Status',
      'Commander_Intent',
      'Risks',
      'Decisions',
      'Priority_Actions'
    ]),
    sciipExtractFirstAvailable_(args.executiveDashboard, [
      'Executive_Status',
      'Key_Risks',
      'Critical_Decisions',
      'Top_Priorities'
    ]),
    sciipExtractFirstAvailable_(args.workQueue, [
      'Queue_Status',
      'Priority',
      'Status',
      'Work_Item_Status',
      'Blocked_Reason'
    ])
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    return 'ATTENTION_REQUIRED';
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog') ||
    combined.includes('watch')
  ) {
    return 'WATCH';
  }

  return 'NORMAL_OPERATIONS';
}

function sciipComposeAutonomousDirectives_(args) {
  const directives = [];

  const commandActions = sciipExtractFirstAvailable_(args.commandBrief, [
    'Priority_Actions',
    'Execution',
    'Recommended_Actions'
  ]);

  const dashboardActions = sciipExtractFirstAvailable_(args.executiveDashboard, [
    'Recommended_Actions',
    'Top_Priorities',
    'Priority_Actions'
  ]);

  const workQueueAction = sciipExtractFirstAvailable_(args.workQueue, [
    'Task',
    'Work_Item',
    'Action',
    'Next_Action',
    'Priority_Action'
  ]);

  if (commandActions) {
    directives.push(`Convert command brief priorities into operator-reviewed tasks: ${commandActions}`);
  }

  if (dashboardActions) {
    directives.push(`Maintain executive dashboard priorities: ${dashboardActions}`);
  }

  if (workQueueAction) {
    directives.push(`Advance latest work queue item after operator review: ${workQueueAction}`);
  }

  if (args.detectedOperatingState === 'ATTENTION_REQUIRED') {
    directives.push('Pause autonomous expansion and focus on issue resolution, queue stabilization, and executive escalation.');
  }

  if (args.detectedOperatingState === 'WATCH') {
    directives.push('Monitor queue pressure and prepare follow-up tasks for blocked or overdue items.');
  }

  if (directives.length === 0) {
    directives.push('Maintain normal SCIIP cadence and prepare the next operating cycle.');
  }

  return directives.join('\n');
}

function sciipComposeAutonomousBlockedItems_(args) {
  const blocked = [];

  const commandRisks = sciipExtractFirstAvailable_(args.commandBrief, [
    'Risks',
    'Decisions',
    'Decision_Required'
  ]);

  const dashboardRisks = sciipExtractFirstAvailable_(args.executiveDashboard, [
    'Key_Risks',
    'Critical_Decisions',
    'Decision_Required'
  ]);

  const queueBlocker = sciipExtractFirstAvailable_(args.workQueue, [
    'Blocked_Reason',
    'Blocker',
    'Status',
    'Work_Item_Status'
  ]);

  if (commandRisks && String(commandRisks).toLowerCase().includes('blocked')) {
    blocked.push(`Command brief blocker: ${commandRisks}`);
  }

  if (dashboardRisks && String(dashboardRisks).toLowerCase().includes('blocked')) {
    blocked.push(`Executive dashboard blocker: ${dashboardRisks}`);
  }

  if (
    queueBlocker &&
    (
      String(queueBlocker).toLowerCase().includes('blocked') ||
      String(queueBlocker).toLowerCase().includes('overdue')
    )
  ) {
    blocked.push(`Work queue blocker: ${queueBlocker}`);
  }

  if (blocked.length === 0) {
    blocked.push('No blocked autonomous operations detected.');
  }

  return blocked.join('\n');
}

function sciipComposeAutonomousOperatorActions_(args) {
  const actions = [];

  if (args.detectedOperatingState === 'ATTENTION_REQUIRED') {
    actions.push('Operator should review critical state before allowing additional automation.');
    actions.push('Confirm owner, next action, and resolution path for any failed or blocked item.');
  }

  if (args.detectedOperatingState === 'WATCH') {
    actions.push('Operator should review watch items and clear queue pressure before next daily cycle.');
  }

  actions.push('Review executable directives and approve, defer, or convert them into execution tasks.');

  return actions.join('\n');
}

function sciipInferAutonomousEscalationRequired_(args) {
  const combined = [
    args.detectedOperatingState,
    args.blockedItems,
    sciipExtractFirstAvailable_(args.commandBrief, ['Decision_Required', 'Decisions']),
    sciipExtractFirstAvailable_(args.executiveDashboard, ['Decision_Required', 'Critical_Decisions'])
  ].join(' ').toLowerCase();

  if (
    combined.includes('attention_required') ||
    combined.includes('critical') ||
    combined.includes('blocked') ||
    (
      combined.includes('decision') &&
      !combined.includes('no command-level decisions required') &&
      !combined.includes('no critical executive decisions')
    )
  ) {
    return 'YES';
  }

  return 'NO';
}

function sciipTestAutonomousOperationsProcessor() {
  const result = sciipRunAutonomousOperationsProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOperationsProcessor',
    result: result
  }));
  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 490_SystemLearningProcessor
 *
 * AUTONOMOUS_OPERATIONS + SYSTEM_HEALTH + WORK_QUEUE
 * + PLATFORM_DAILY_REPORT → SYSTEM_LEARNING
 *
 * Migration note:
 * Preserves original 490 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const SYSTEM_LEARNING_PROCESSOR = '490_SystemLearningProcessor';
const SYSTEM_LEARNING_SHEET = 'SYSTEM_LEARNING';

const SYSTEM_LEARNING_HEADERS = [
  'Learning_ID',
  'Business_Key',
  'Learning_Date',
  'Learning_Type',
  'Autonomous_Operation_ID',
  'System_Health_ID',
  'Work_Queue_ID',
  'Platform_Daily_Report_ID',
  'Learning_Status',
  'Operating_Lesson',
  'System_Improvement_Signal',
  'Workflow_Improvement_Signal',
  'Risk_Learning',
  'Automation_Learning',
  'Recommended_System_Adjustment',
  'Confidence',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureSystemLearningSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    SYSTEM_LEARNING_SHEET,
    SYSTEM_LEARNING_HEADERS
  );
}

function sciipRunSystemLearningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: SYSTEM_LEARNING_PROCESSOR,
    action: 'SYSTEM_LEARNING_BUILD',
    sourceSheet: null,
    targetSheet: SYSTEM_LEARNING_SHEET,
    ledgerSheet: 'SYSTEM_LEARNING_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousOperations = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_OPERATIONS');
      const systemHealthRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SYSTEM_HEALTH');
      const workQueueItems = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('WORK_QUEUE');
      const platformReports = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('PLATFORM_DAILY_REPORT');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount:
          autonomousOperations.length +
          systemHealthRecords.length +
          workQueueItems.length +
          platformReports.length,
        outputCount: 1,
        summary: 'System learning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: SYSTEM_LEARNING_PROCESSOR,
          inputSheets: [
            'AUTONOMOUS_OPERATIONS',
            'SYSTEM_HEALTH',
            'WORK_QUEUE',
            'PLATFORM_DAILY_REPORT'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureSystemLearningSchema();

      const autonomousOperation = sciipGetLatestRuntimeRecordByCreatedAt_('AUTONOMOUS_OPERATIONS');
      const systemHealth = sciipGetLatestRuntimeRecordByCreatedAt_('SYSTEM_HEALTH');
      const workQueue = sciipGetLatestRuntimeRecordByCreatedAt_('WORK_QUEUE');
      const platformReport = sciipGetLatestRuntimeRecordByCreatedAt_('PLATFORM_DAILY_REPORT');

      if (!autonomousOperation && !systemHealth && !workQueue && !platformReport) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: SYSTEM_LEARNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            systemLearningsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const learningDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const systemLearningBusinessKey = 'SYSTEM_LEARNING|' + learningDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        systemLearningBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: SYSTEM_LEARNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 4,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            systemLearningsCreated: 0,
            skippedDuplicate: 1,
            systemLearningBusinessKey: systemLearningBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const learning = sciipCreateSystemLearning_({
        businessKey: systemLearningBusinessKey,
        learningDate: learningDate,
        autonomousOperation: autonomousOperation,
        systemHealth: systemHealth,
        workQueue: workQueue,
        platformReport: platformReport,
        processor: SYSTEM_LEARNING_PROCESSOR
      });

      outputSheet.appendRow(learning);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: SYSTEM_LEARNING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 4,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousOperationFound: !!autonomousOperation,
          systemHealthFound: !!systemHealth,
          workQueueFound: !!workQueue,
          platformReportFound: !!platformReport,
          systemLearningsCreated: 1,
          skippedDuplicate: 0,
          systemLearningBusinessKey: systemLearningBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}


function sciipGetLatestRuntimeRecordByCreatedAt_(sheetName) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  records.sort(function(a, b) {
    const aTime = sciipRuntimeRecordTimestamp_(a);
    const bTime = sciipRuntimeRecordTimestamp_(b);
    return aTime - bTime;
  });

  return records[records.length - 1];
}

function sciipRuntimeRecordTimestamp_(record) {
  if (!record) return 0;

  const raw =
    record.Created_At ||
    record.Updated_At ||
    record.Timestamp ||
    record.completedAt ||
    record.Completed_At ||
    '';

  const time = raw ? new Date(raw).getTime() : 0;
  return isNaN(time) ? 0 : time;
}

function sciipCreateSystemLearning_(args) {
  const now = new Date();

  const learningStatus = sciipInferSystemLearningStatus_({
    autonomousOperation: args.autonomousOperation,
    systemHealth: args.systemHealth,
    workQueue: args.workQueue,
    platformReport: args.platformReport
  });

  const operatingLesson = sciipComposeOperatingLesson_({
    autonomousOperation: args.autonomousOperation,
    systemHealth: args.systemHealth,
    workQueue: args.workQueue,
    platformReport: args.platformReport
  });

  const systemImprovementSignal = sciipComposeSystemImprovementSignal_({
    systemHealth: args.systemHealth,
    platformReport: args.platformReport
  });

  const workflowImprovementSignal = sciipComposeWorkflowImprovementSignal_({
    autonomousOperation: args.autonomousOperation,
    workQueue: args.workQueue,
    platformReport: args.platformReport
  });

  const riskLearning = sciipComposeRiskLearning_({
    autonomousOperation: args.autonomousOperation,
    systemHealth: args.systemHealth,
    workQueue: args.workQueue,
    platformReport: args.platformReport
  });

  const automationLearning = sciipComposeAutomationLearning_({
    autonomousOperation: args.autonomousOperation,
    platformReport: args.platformReport
  });

  const recommendedSystemAdjustment = sciipComposeRecommendedSystemAdjustment_({
    learningStatus,
    systemImprovementSignal,
    workflowImprovementSignal,
    riskLearning,
    automationLearning
  });

  const confidence = sciipInferSystemLearningConfidence_({
    autonomousOperation: args.autonomousOperation,
    systemHealth: args.systemHealth,
    workQueue: args.workQueue,
    platformReport: args.platformReport
  });

  return [
    sciipGenerateId_('SLR'),
    args.businessKey,
    args.learningDate,
    'DAILY_SYSTEM_LEARNING',
    sciipExtractFirstAvailable_(args.autonomousOperation, [
      'Autonomous_Operation_ID',
      'Operation_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.systemHealth, [
      'System_Health_ID',
      'Health_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.workQueue, [
      'Work_Queue_ID',
      'Queue_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Report_ID',
      'Platform_Daily_Report_ID',
      'Record_ID',
      'ID'
    ]),
    learningStatus,
    operatingLesson,
    systemImprovementSignal,
    workflowImprovementSignal,
    riskLearning,
    automationLearning,
    recommendedSystemAdjustment,
    confidence,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferSystemLearningStatus_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.autonomousOperation, [
      'Operation_Status',
      'Detected_Operating_State',
      'Escalation_Required',
      'Blocked_Items'
    ]),
    sciipExtractFirstAvailable_(args.systemHealth, [
      'Health_Status',
      'System_Status',
      'Status',
      'Health_Summary'
    ]),
    sciipExtractFirstAvailable_(args.workQueue, [
      'Queue_Status',
      'Status',
      'Blocked_Reason',
      'Priority'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Platform_Status',
      'Key_Risks',
      'Priority_Actions'
    ])
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    return 'LEARNING_FROM_EXCEPTION';
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog') ||
    combined.includes('watch')
  ) {
    return 'LEARNING_FROM_FRICTION';
  }

  return 'LEARNING_FROM_NORMAL_OPERATIONS';
}

function sciipComposeOperatingLesson_(args) {
  const parts = [];

  const operatingState = sciipExtractFirstAvailable_(args.autonomousOperation, [
    'Detected_Operating_State',
    'Operation_Status'
  ]);

  const platformStatus = sciipExtractFirstAvailable_(args.platformReport, [
    'Platform_Status',
    'Executive_Summary'
  ]);

  if (operatingState) {
    parts.push(`Autonomous operating state observed: ${operatingState}.`);
  }

  if (platformStatus) {
    parts.push(`Platform condition observed: ${platformStatus}.`);
  }

  if (parts.length === 0) {
    parts.push('SCIIP completed the cycle without a specific operating exception.');
  }

  return parts.join('\n');
}

function sciipComposeSystemImprovementSignal_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.systemHealth, [
      'Health_Summary',
      'System_Health_Summary',
      'System_Status',
      'Status'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'System_Health_Summary',
      'Key_Risks',
      'Executive_Summary'
    ])
  ].join(' ').toLowerCase();

  if (combined.includes('error') || combined.includes('failed')) {
    return 'Improve processor fault detection, recovery notes, and operator escalation around failed system components.';
  }

  if (combined.includes('critical') || combined.includes('attention_required')) {
    return 'Strengthen daily health checks and make critical system states more visible in command outputs.';
  }

  return 'No major system architecture adjustment detected from today’s health cycle.';
}

function sciipComposeWorkflowImprovementSignal_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.autonomousOperation, [
      'Executable_Directives',
      'Blocked_Items',
      'Recommended_Operator_Actions'
    ]),
    sciipExtractFirstAvailable_(args.workQueue, [
      'Queue_Status',
      'Status',
      'Blocked_Reason',
      'Priority',
      'Task'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Work_Queue_Summary',
      'Priority_Actions'
    ])
  ].join(' ').toLowerCase();

  if (combined.includes('blocked')) {
    return 'Workflow should better expose blockers and require explicit owner, next step, and unblock condition.';
  }

  if (combined.includes('overdue') || combined.includes('backlog')) {
    return 'Workflow prioritization should elevate overdue and backlog items earlier in the daily command cycle.';
  }

  return 'Workflow appears stable; continue current prioritization and review cadence.';
}

function sciipComposeRiskLearning_(args) {
  const risks = [];

  const autoRisk = sciipExtractFirstAvailable_(args.autonomousOperation, [
    'Blocked_Items',
    'Escalation_Required'
  ]);

  const healthRisk = sciipExtractFirstAvailable_(args.systemHealth, [
    'Risk',
    'Key_Risks',
    'Health_Summary',
    'Status'
  ]);

  const platformRisk = sciipExtractFirstAvailable_(args.platformReport, [
    'Key_Risks',
    'Decision_Required'
  ]);

  if (autoRisk) risks.push(`Autonomous operations risk signal: ${autoRisk}`);
  if (healthRisk) risks.push(`System health risk signal: ${healthRisk}`);
  if (platformRisk) risks.push(`Platform report risk signal: ${platformRisk}`);

  if (risks.length === 0) {
    risks.push('No material risk learning identified.');
  }

  return risks.join('\n');
}

function sciipComposeAutomationLearning_(args) {
  const autonomyMode = sciipExtractFirstAvailable_(args.autonomousOperation, [
    'Autonomy_Mode',
    'Human_Review_Status'
  ]);

  const directives = sciipExtractFirstAvailable_(args.autonomousOperation, [
    'Executable_Directives',
    'Recommended_Operator_Actions'
  ]);

  if (autonomyMode || directives) {
    return [
      autonomyMode ? `Autonomy mode observed: ${autonomyMode}.` : '',
      directives ? `Automation directive learning: ${directives}` : '',
      'SCIIP should continue requiring human review before execution while the operating loop matures.'
    ].filter(Boolean).join('\n');
  }

  return 'No autonomous operations learning available for this cycle.';
}

function sciipComposeRecommendedSystemAdjustment_(args) {
  const combined = [
    args.learningStatus,
    args.systemImprovementSignal,
    args.workflowImprovementSignal,
    args.riskLearning,
    args.automationLearning
  ].join(' ').toLowerCase();

  if (combined.includes('failed') || combined.includes('error') || combined.includes('critical')) {
    return 'Add or strengthen recovery logic, exception summaries, and operator-visible diagnostics.';
  }

  if (combined.includes('blocked') || combined.includes('overdue') || combined.includes('backlog')) {
    return 'Improve work queue schema to track blocker owner, unblock condition, and escalation date.';
  }

  return 'No structural system adjustment required; continue collecting daily learning records.';
}

function sciipInferSystemLearningConfidence_(args) {
  let score = 0;

  if (args.autonomousOperation) score++;
  if (args.systemHealth) score++;
  if (args.workQueue) score++;
  if (args.platformReport) score++;

  if (score >= 4) return 'HIGH';
  if (score >= 2) return 'MEDIUM';
  return 'LOW';
}

function sciipTestSystemLearningProcessor() {
  const result = sciipRunSystemLearningProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestSystemLearningProcessor',
    result
  }));
  return result;
}

function sciipExtractFirstAvailable_(record, fieldNames) {
  if (!record || !fieldNames) return '';

  for (var i = 0; i < fieldNames.length; i++) {
    var fieldName = fieldNames[i];
    var value = record[fieldName];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}



/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 500_StrategicIntelligenceProcessor
 *
 * SYSTEM_LEARNING + COMMAND_BRIEF + PLATFORM_DAILY_REPORT
 * + BRIEFING_DIGEST → STRATEGIC_INTELLIGENCE
 *
 * Migration note:
 * Preserves original 500 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const STRATEGIC_INTELLIGENCE_PROCESSOR = '500_StrategicIntelligenceProcessor';
const STRATEGIC_INTELLIGENCE_SHEET = 'STRATEGIC_INTELLIGENCE';

const STRATEGIC_INTELLIGENCE_HEADERS = [
  'Strategic_Intelligence_ID',
  'Business_Key',
  'Intelligence_Date',
  'Intelligence_Type',
  'System_Learning_ID',
  'Command_Brief_ID',
  'Platform_Daily_Report_ID',
  'Briefing_Digest_ID',
  'Strategic_Status',
  'Strategic_Thesis',
  'Market_Intelligence',
  'Platform_Intelligence',
  'Operational_Intelligence',
  'Learning_Intelligence',
  'Strategic_Risks',
  'Strategic_Opportunities',
  'Recommended_Strategic_Actions',
  'Decision_Required',
  'Confidence',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureStrategicIntelligenceSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    STRATEGIC_INTELLIGENCE_SHEET,
    STRATEGIC_INTELLIGENCE_HEADERS
  );
}

function sciipRunStrategicIntelligenceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: STRATEGIC_INTELLIGENCE_PROCESSOR,
    action: 'STRATEGIC_INTELLIGENCE_BUILD',
    sourceSheet: null,
    targetSheet: STRATEGIC_INTELLIGENCE_SHEET,
    ledgerSheet: 'STRATEGIC_INTELLIGENCE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const systemLearnings = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SYSTEM_LEARNING');
      const commandBriefs = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('COMMAND_BRIEF');
      const platformReports = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('PLATFORM_DAILY_REPORT');
      const briefingDigests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('BRIEFING_DIGEST');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount:
          systemLearnings.length +
          commandBriefs.length +
          platformReports.length +
          briefingDigests.length,
        outputCount: 1,
        summary: 'Strategic intelligence runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: STRATEGIC_INTELLIGENCE_PROCESSOR,
          inputSheets: [
            'SYSTEM_LEARNING',
            'COMMAND_BRIEF',
            'PLATFORM_DAILY_REPORT',
            'BRIEFING_DIGEST'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureStrategicIntelligenceSchema();

      const systemLearning = sciipGetLatestRuntimeRecordByCreatedAt_('SYSTEM_LEARNING');
      const commandBrief = sciipGetLatestRuntimeRecordByCreatedAt_('COMMAND_BRIEF');
      const platformReport = sciipGetLatestRuntimeRecordByCreatedAt_('PLATFORM_DAILY_REPORT');
      const briefingDigest = sciipGetLatestRuntimeRecordByCreatedAt_('BRIEFING_DIGEST');

      if (!systemLearning && !commandBrief && !platformReport && !briefingDigest) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: STRATEGIC_INTELLIGENCE_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            strategicIntelligenceCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const intelligenceDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const strategicIntelligenceBusinessKey = 'STRATEGIC_INTELLIGENCE|' + intelligenceDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        strategicIntelligenceBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: STRATEGIC_INTELLIGENCE_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 4,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            strategicIntelligenceCreated: 0,
            skippedDuplicate: 1,
            strategicIntelligenceBusinessKey: strategicIntelligenceBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const intelligence = sciipCreateStrategicIntelligence_({
        businessKey: strategicIntelligenceBusinessKey,
        intelligenceDate: intelligenceDate,
        systemLearning: systemLearning,
        commandBrief: commandBrief,
        platformReport: platformReport,
        briefingDigest: briefingDigest,
        processor: STRATEGIC_INTELLIGENCE_PROCESSOR
      });

      outputSheet.appendRow(intelligence);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: STRATEGIC_INTELLIGENCE_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 4,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          systemLearningFound: !!systemLearning,
          commandBriefFound: !!commandBrief,
          platformReportFound: !!platformReport,
          briefingDigestFound: !!briefingDigest,
          strategicIntelligenceCreated: 1,
          skippedDuplicate: 0,
          strategicIntelligenceBusinessKey: strategicIntelligenceBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipGetLatestRuntimeRecordByCreatedAt_(sheetName) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  records.sort(function(a, b) {
    const aTime = sciipRuntimeRecordTimestamp_(a);
    const bTime = sciipRuntimeRecordTimestamp_(b);
    return aTime - bTime;
  });

  return records[records.length - 1];
}

function sciipRuntimeRecordTimestamp_(record) {
  if (!record) return 0;

  const raw =
    record.Created_At ||
    record.Updated_At ||
    record.Timestamp ||
    record.completedAt ||
    record.Completed_At ||
    '';

  const time = raw ? new Date(raw).getTime() : 0;
  return isNaN(time) ? 0 : time;
}

function sciipCreateStrategicIntelligence_(args) {
  const now = new Date();

  const strategicStatus = sciipInferStrategicIntelligenceStatus_({
    systemLearning: args.systemLearning,
    commandBrief: args.commandBrief,
    platformReport: args.platformReport,
    briefingDigest: args.briefingDigest
  });

  const strategicThesis = sciipComposeStrategicThesis_({
    strategicStatus,
    systemLearning: args.systemLearning,
    commandBrief: args.commandBrief,
    platformReport: args.platformReport,
    briefingDigest: args.briefingDigest
  });

  const marketIntelligence = sciipComposeStrategicMarketIntelligence_({
    briefingDigest: args.briefingDigest,
    platformReport: args.platformReport
  });

  const platformIntelligence = sciipComposeStrategicPlatformIntelligence_({
    platformReport: args.platformReport,
    systemLearning: args.systemLearning
  });

  const operationalIntelligence = sciipComposeStrategicOperationalIntelligence_({
    commandBrief: args.commandBrief,
    platformReport: args.platformReport
  });

  const learningIntelligence = sciipComposeStrategicLearningIntelligence_({
    systemLearning: args.systemLearning
  });

  const strategicRisks = sciipComposeStrategicRisks_({
    systemLearning: args.systemLearning,
    commandBrief: args.commandBrief,
    platformReport: args.platformReport,
    briefingDigest: args.briefingDigest
  });

  const strategicOpportunities = sciipComposeStrategicOpportunities_({
    systemLearning: args.systemLearning,
    commandBrief: args.commandBrief,
    platformReport: args.platformReport,
    briefingDigest: args.briefingDigest
  });

  const recommendedStrategicActions = sciipComposeRecommendedStrategicActions_({
    strategicStatus,
    strategicRisks,
    strategicOpportunities,
    operationalIntelligence,
    learningIntelligence
  });

  const decisionRequired = sciipInferStrategicDecisionRequired_({
    strategicStatus,
    strategicRisks,
    recommendedStrategicActions
  });

  const confidence = sciipInferStrategicIntelligenceConfidence_({
    systemLearning: args.systemLearning,
    commandBrief: args.commandBrief,
    platformReport: args.platformReport,
    briefingDigest: args.briefingDigest
  });

  return [
    sciipGenerateId_('SINT'),
    args.businessKey,
    args.intelligenceDate,
    'DAILY_STRATEGIC_INTELLIGENCE',
    sciipExtractFirstAvailable_(args.systemLearning, [
      'Learning_ID',
      'System_Learning_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Command_Brief_ID',
      'Brief_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Report_ID',
      'Platform_Daily_Report_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.briefingDigest, [
      'Digest_ID',
      'Briefing_Digest_ID',
      'Record_ID',
      'ID'
    ]),
    strategicStatus,
    strategicThesis,
    marketIntelligence,
    platformIntelligence,
    operationalIntelligence,
    learningIntelligence,
    strategicRisks,
    strategicOpportunities,
    recommendedStrategicActions,
    decisionRequired,
    confidence,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferStrategicIntelligenceStatus_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.systemLearning, [
      'Learning_Status',
      'Risk_Learning',
      'Recommended_System_Adjustment'
    ]),
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Command_Status',
      'Risks',
      'Decisions',
      'Decision_Required'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Platform_Status',
      'Key_Risks',
      'Decision_Required'
    ]),
    sciipExtractFirstAvailable_(args.briefingDigest, [
      'Briefing_Summary',
      'Market_Intelligence_Summary',
      'Executive_Summary'
    ])
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    return 'STRATEGIC_ATTENTION_REQUIRED';
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog') ||
    combined.includes('watch') ||
    combined.includes('risk')
  ) {
    return 'STRATEGIC_WATCH';
  }

  return 'STRATEGIC_NORMAL';
}

function sciipComposeStrategicThesis_(args) {
  if (args.strategicStatus === 'STRATEGIC_ATTENTION_REQUIRED') {
    return 'SCIIP is generating strategic intelligence, but current operating signals require executive attention before expanding autonomy or increasing operating tempo.';
  }

  if (args.strategicStatus === 'STRATEGIC_WATCH') {
    return 'SCIIP is operating with usable intelligence flow, but watch items, risks, or workflow friction should remain visible in the strategic cycle.';
  }

  return 'SCIIP is operating normally and converting daily market intelligence, platform status, command intent, and system learning into durable strategic intelligence.';
}

function sciipComposeStrategicMarketIntelligence_(args) {
  const briefingSummary = sciipExtractFirstAvailable_(args.briefingDigest, [
    'Market_Intelligence_Summary',
    'Briefing_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  const platformMarketSummary = sciipExtractFirstAvailable_(args.platformReport, [
    'Market_Intelligence_Summary',
    'Executive_Summary'
  ]);

  if (briefingSummary && platformMarketSummary) {
    return `Briefing digest: ${briefingSummary}\n\nPlatform report market signal: ${platformMarketSummary}`;
  }

  if (briefingSummary) {
    return `Briefing digest: ${briefingSummary}`;
  }

  if (platformMarketSummary) {
    return `Platform report market signal: ${platformMarketSummary}`;
  }

  return 'No market intelligence digest available for this strategic cycle.';
}

function sciipComposeStrategicPlatformIntelligence_(args) {
  const platformSummary = sciipExtractFirstAvailable_(args.platformReport, [
    'Executive_Summary',
    'System_Health_Summary',
    'Work_Queue_Summary',
    'Platform_Status'
  ]);

  const learningSignal = sciipExtractFirstAvailable_(args.systemLearning, [
    'System_Improvement_Signal',
    'Recommended_System_Adjustment',
    'Operating_Lesson'
  ]);

  const parts = [];

  if (platformSummary) parts.push(`Platform condition: ${platformSummary}`);
  if (learningSignal) parts.push(`System learning signal: ${learningSignal}`);

  if (parts.length === 0) {
    parts.push('No platform intelligence signal available.');
  }

  return parts.join('\n\n');
}

function sciipComposeStrategicOperationalIntelligence_(args) {
  const commandSituation = sciipExtractFirstAvailable_(args.commandBrief, [
    'Situation',
    'Mission',
    'Execution',
    'Commander_Intent'
  ]);

  const platformActions = sciipExtractFirstAvailable_(args.platformReport, [
    'Priority_Actions',
    'Recommended_Actions',
    'Executive_Summary'
  ]);

  const parts = [];

  if (commandSituation) parts.push(`Command intelligence: ${commandSituation}`);
  if (platformActions) parts.push(`Platform execution signal: ${platformActions}`);

  if (parts.length === 0) {
    parts.push('No operational intelligence signal available.');
  }

  return parts.join('\n\n');
}

function sciipComposeStrategicLearningIntelligence_(args) {
  const learning = sciipExtractFirstAvailable_(args.systemLearning, [
    'Operating_Lesson',
    'Workflow_Improvement_Signal',
    'Risk_Learning',
    'Automation_Learning',
    'Recommended_System_Adjustment'
  ]);

  if (learning) {
    return learning;
  }

  return 'No system learning intelligence available for this cycle.';
}

function sciipComposeStrategicRisks_(args) {
  const risks = [];

  const learningRisk = sciipExtractFirstAvailable_(args.systemLearning, [
    'Risk_Learning',
    'Recommended_System_Adjustment'
  ]);

  const commandRisk = sciipExtractFirstAvailable_(args.commandBrief, [
    'Risks',
    'Decision_Required'
  ]);

  const platformRisk = sciipExtractFirstAvailable_(args.platformReport, [
    'Key_Risks',
    'Decision_Required'
  ]);

  const marketRisk = sciipExtractFirstAvailable_(args.briefingDigest, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  if (learningRisk) risks.push(`System learning: ${learningRisk}`);
  if (commandRisk) risks.push(`Command brief: ${commandRisk}`);
  if (platformRisk) risks.push(`Platform report: ${platformRisk}`);
  if (marketRisk) risks.push(`Market intelligence: ${marketRisk}`);

  if (risks.length === 0) {
    risks.push('No material strategic risks identified.');
  }

  return risks.join('\n');
}

function sciipComposeStrategicOpportunities_(args) {
  const opportunities = [];

  const marketOpportunity = sciipExtractFirstAvailable_(args.briefingDigest, [
    'Opportunities',
    'Opportunity_Summary',
    'Market_Opportunity',
    'Briefing_Summary',
    'Market_Intelligence_Summary'
  ]);

  const commandOpportunity = sciipExtractFirstAvailable_(args.commandBrief, [
    'Priority_Actions',
    'Commander_Intent',
    'Mission'
  ]);

  const learningOpportunity = sciipExtractFirstAvailable_(args.systemLearning, [
    'System_Improvement_Signal',
    'Workflow_Improvement_Signal',
    'Automation_Learning'
  ]);

  if (marketOpportunity) {
    opportunities.push(`Market opportunity signal: ${marketOpportunity}`);
  }

  if (commandOpportunity) {
    opportunities.push(`Command opportunity signal: ${commandOpportunity}`);
  }

  if (learningOpportunity) {
    opportunities.push(`Learning opportunity signal: ${learningOpportunity}`);
  }

  if (opportunities.length === 0) {
    opportunities.push('No explicit strategic opportunities identified from current inputs.');
  }

  return opportunities.join('\n');
}

function sciipComposeRecommendedStrategicActions_(args) {
  const actions = [];

  const combined = [
    args.strategicStatus,
    args.strategicRisks,
    args.strategicOpportunities,
    args.operationalIntelligence,
    args.learningIntelligence
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    actions.push('Prioritize executive review of critical operating and platform risks.');
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog')
  ) {
    actions.push('Tighten work queue escalation and require owner, blocker, and unblock condition on friction items.');
  }

  if (
    combined.includes('automation') ||
    combined.includes('autonomous')
  ) {
    actions.push('Continue maturing autonomous operations under human-review controls.');
  }

  if (
    combined.includes('market') ||
    combined.includes('opportunity')
  ) {
    actions.push('Translate market intelligence signals into prospecting, asset, or research priorities where applicable.');
  }

  if (actions.length === 0) {
    actions.push('Maintain daily strategic intelligence cadence and continue collecting learning records.');
  }

  return actions.join('\n');
}

function sciipInferStrategicDecisionRequired_(args) {
  const combined = [
    args.strategicStatus,
    args.strategicRisks,
    args.recommendedStrategicActions
  ].join(' ').toLowerCase();

  if (
    combined.includes('strategic_attention_required') ||
    combined.includes('critical') ||
    combined.includes('executive review') ||
    combined.includes('decision_required') ||
    combined.includes('blocked')
  ) {
    return 'YES';
  }

  return 'NO';
}

function sciipInferStrategicIntelligenceConfidence_(args) {
  let score = 0;

  if (args.systemLearning) score++;
  if (args.commandBrief) score++;
  if (args.platformReport) score++;
  if (args.briefingDigest) score++;

  if (score >= 4) return 'HIGH';
  if (score >= 2) return 'MEDIUM';
  return 'LOW';
}


function sciipExtractFirstAvailable_(record, fieldNames) {
  if (!record) return '';

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (record[fieldName] !== undefined && record[fieldName] !== null && record[fieldName] !== '') {
      return record[fieldName];
    }
  }

  return '';
}

function sciipTestStrategicIntelligenceProcessor() {
  const result = sciipRunStrategicIntelligenceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestStrategicIntelligenceProcessor',
    result
  }));
  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 510_IntelligenceRequirementProcessor
 *
 * STRATEGIC_INTELLIGENCE + COMMAND_BRIEF + SYSTEM_LEARNING
 * → INTELLIGENCE_REQUIREMENTS
 *
 * Migration note:
 * Preserves original 510 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const INTELLIGENCE_REQUIREMENT_PROCESSOR = '510_IntelligenceRequirementProcessor';
const INTELLIGENCE_REQUIREMENTS_SHEET = 'INTELLIGENCE_REQUIREMENTS';

const INTELLIGENCE_REQUIREMENTS_HEADERS = [
  'Requirement_ID',
  'Business_Key',
  'Requirement_Date',
  'Requirement_Type',
  'Strategic_Intelligence_ID',
  'Command_Brief_ID',
  'System_Learning_ID',
  'Priority',
  'Requirement_Status',
  'Intelligence_Question',
  'Why_It_Matters',
  'Knowledge_Gap',
  'Research_Direction',
  'Suggested_Sources',
  'Decision_Linkage',
  'Operator_Action',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureIntelligenceRequirementsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    INTELLIGENCE_REQUIREMENTS_SHEET,
    INTELLIGENCE_REQUIREMENTS_HEADERS
  );
}

function sciipRunIntelligenceRequirementProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: INTELLIGENCE_REQUIREMENT_PROCESSOR,
    action: 'INTELLIGENCE_REQUIREMENTS_BUILD',
    sourceSheet: null,
    targetSheet: INTELLIGENCE_REQUIREMENTS_SHEET,
    ledgerSheet: 'INTELLIGENCE_REQUIREMENTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const strategicIntelligenceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('STRATEGIC_INTELLIGENCE');
      const commandBriefRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('COMMAND_BRIEF');
      const systemLearningRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SYSTEM_LEARNING');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount:
          strategicIntelligenceRecords.length +
          commandBriefRecords.length +
          systemLearningRecords.length,
        outputCount: 5,
        summary: 'Intelligence requirements runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: INTELLIGENCE_REQUIREMENT_PROCESSOR,
          inputSheets: [
            'STRATEGIC_INTELLIGENCE',
            'COMMAND_BRIEF',
            'SYSTEM_LEARNING'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureIntelligenceRequirementsSchema();

      const strategicIntelligence = sciipGetLatestRuntimeRecordByCreatedAt_('STRATEGIC_INTELLIGENCE');
      const commandBrief = sciipGetLatestRuntimeRecordByCreatedAt_('COMMAND_BRIEF');
      const systemLearning = sciipGetLatestRuntimeRecordByCreatedAt_('SYSTEM_LEARNING');

      if (!strategicIntelligence && !commandBrief && !systemLearning) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: INTELLIGENCE_REQUIREMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            intelligenceRequirementsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const requirementDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const intelligenceRequirementsBusinessKey = 'INTELLIGENCE_REQUIREMENTS|' + requirementDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        intelligenceRequirementsBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: INTELLIGENCE_REQUIREMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 3,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            intelligenceRequirementsCreated: 0,
            skippedDuplicate: 1,
            intelligenceRequirementsBusinessKey: intelligenceRequirementsBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const requirements = sciipCreateIntelligenceRequirements_({
        businessKey: intelligenceRequirementsBusinessKey,
        requirementDate: requirementDate,
        strategicIntelligence: strategicIntelligence,
        commandBrief: commandBrief,
        systemLearning: systemLearning,
        processor: INTELLIGENCE_REQUIREMENT_PROCESSOR
      });

      requirements.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: INTELLIGENCE_REQUIREMENT_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: requirements.length,
        recordsRead: 3,
        processed: requirements.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          strategicIntelligenceFound: !!strategicIntelligence,
          commandBriefFound: !!commandBrief,
          systemLearningFound: !!systemLearning,
          intelligenceRequirementsCreated: requirements.length,
          skippedDuplicate: 0,
          intelligenceRequirementsBusinessKey: intelligenceRequirementsBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipGetLatestRuntimeRecordByCreatedAt_(sheetName) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  records.sort(function(a, b) {
    const aTime = sciipRuntimeRecordTimestamp_(a);
    const bTime = sciipRuntimeRecordTimestamp_(b);
    return aTime - bTime;
  });

  return records[records.length - 1];
}

function sciipRuntimeRecordTimestamp_(record) {
  if (!record) return 0;

  const raw =
    record.Created_At ||
    record.Updated_At ||
    record.Timestamp ||
    record.completedAt ||
    record.Completed_At ||
    '';

  const time = raw ? new Date(raw).getTime() : 0;
  return isNaN(time) ? 0 : time;
}

function sciipCreateIntelligenceRequirements_(args) {
  const now = new Date();

  const strategicText = [
    sciipExtractFirstAvailable_(args.strategicIntelligence, [
      'Strategic_Thesis',
      'Market_Intelligence',
      'Platform_Intelligence',
      'Operational_Intelligence',
      'Strategic_Risks',
      'Strategic_Opportunities',
      'Recommended_Strategic_Actions'
    ]),
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Situation',
      'Mission',
      'Execution',
      'Risks',
      'Decisions',
      'Commander_Intent'
    ]),
    sciipExtractFirstAvailable_(args.systemLearning, [
      'Operating_Lesson',
      'System_Improvement_Signal',
      'Workflow_Improvement_Signal',
      'Risk_Learning',
      'Automation_Learning'
    ])
  ].join('\n').toLowerCase();

  const requirementSeeds = sciipGenerateRequirementSeeds_(strategicText);

  return requirementSeeds.map(function(seed) {
    return [
      sciipGenerateId_('IRQ'),
      args.businessKey + '|' + seed.key,
      args.requirementDate,
      seed.type,
      sciipExtractFirstAvailable_(args.strategicIntelligence, [
        'Strategic_Intelligence_ID',
        'Record_ID',
        'ID'
      ]),
      sciipExtractFirstAvailable_(args.commandBrief, [
        'Command_Brief_ID',
        'Record_ID',
        'ID'
      ]),
      sciipExtractFirstAvailable_(args.systemLearning, [
        'Learning_ID',
        'System_Learning_ID',
        'Record_ID',
        'ID'
      ]),
      seed.priority,
      'OPEN',
      seed.question,
      seed.why,
      seed.gap,
      seed.direction,
      seed.sources,
      seed.decisionLinkage,
      seed.operatorAction,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });
}

function sciipGenerateRequirementSeeds_(text) {
  const seeds = [];

  seeds.push({
    key: 'MARKET_SIGNAL',
    type: 'MARKET_INTELLIGENCE_REQUIREMENT',
    priority: text.includes('market') || text.includes('opportunity') ? 'HIGH' : 'MEDIUM',
    question: 'What market signals require deeper research or validation today?',
    why: 'SCIIP should convert daily intelligence into specific market questions instead of passive reporting.',
    gap: 'Unvalidated market movement, company activity, tenant demand, capital activity, or asset-level implications.',
    direction: 'Review recent market intelligence, company activity, tenant movement, property events, and strategic opportunities.',
    sources: 'Briefing digests, broker notes, AIR CRE data, company announcements, city records, property records, news sources.',
    decisionLinkage: 'Supports prospecting, asset prioritization, landlord strategy, and research focus.',
    operatorAction: 'Review and convert the strongest market signal into a research mission.'
  });

  seeds.push({
    key: 'KNOWLEDGE_GAP',
    type: 'KNOWLEDGE_GAP_REQUIREMENT',
    priority: text.includes('gap') || text.includes('missing') || text.includes('unknown') ? 'HIGH' : 'MEDIUM',
    question: 'What does SCIIP not know yet that would improve the knowledge graph?',
    why: 'The platform becomes more valuable when uncertainty is converted into explicit research requirements.',
    gap: 'Missing company, property, ownership, tenant, supplier, relationship, timing, or confidence data.',
    direction: 'Identify missing facts that prevent stronger property, company, or market conclusions.',
    sources: 'Property registry, company registry, relationship tables, public records, news, broker intelligence, operator notes.',
    decisionLinkage: 'Improves confidence scoring and prevents weak assumptions from becoming permanent intelligence.',
    operatorAction: 'Select one missing data category and assign it to a research mission.'
  });

  seeds.push({
    key: 'WORKFLOW_FRICTION',
    type: 'OPERATING_SYSTEM_REQUIREMENT',
    priority: text.includes('blocked') || text.includes('overdue') || text.includes('backlog') ? 'HIGH' : 'LOW',
    question: 'Which workflow friction points should be corrected before the next operating cycle?',
    why: 'SCIIP must learn from operational friction and improve its own execution loop.',
    gap: 'Unclear owners, blockers, next actions, escalation logic, or automation readiness.',
    direction: 'Analyze work queue, autonomous operations, system learning, and command brief friction signals.',
    sources: 'WORK_QUEUE, AUTONOMOUS_OPERATIONS, SYSTEM_LEARNING, COMMAND_BRIEF.',
    decisionLinkage: 'Supports better execution discipline and reduces repeated operator intervention.',
    operatorAction: 'If friction exists, create a corrective execution task or schema improvement.'
  });

  seeds.push({
    key: 'STRATEGIC_RISK',
    type: 'STRATEGIC_RISK_REQUIREMENT',
    priority: text.includes('risk') || text.includes('critical') || text.includes('attention_required') ? 'HIGH' : 'MEDIUM',
    question: 'What strategic risk should SCIIP monitor or investigate next?',
    why: 'Strategic risks need to be tracked as durable intelligence requirements, not buried inside daily reports.',
    gap: 'Unconfirmed risk severity, affected assets, affected companies, timing, exposure, or mitigation path.',
    direction: 'Review strategic risks, command decisions, platform risks, and market intelligence warning signals.',
    sources: 'STRATEGIC_INTELLIGENCE, COMMAND_BRIEF, PLATFORM_DAILY_REPORT, SYSTEM_HEALTH, market sources.',
    decisionLinkage: 'Supports executive awareness, landlord advisory, and proactive market positioning.',
    operatorAction: 'Escalate high-priority risk into a research mission or monitoring item.'
  });

  seeds.push({
    key: 'AUTONOMY_IMPROVEMENT',
    type: 'AUTONOMY_REQUIREMENT',
    priority: text.includes('automation') || text.includes('autonomous') ? 'MEDIUM' : 'LOW',
    question: 'What should SCIIP learn before increasing autonomous execution?',
    why: 'Autonomy should expand only where the system has confidence, clear inputs, and human-review controls.',
    gap: 'Insufficient evidence about which tasks are safe to automate, require review, or should remain manual.',
    direction: 'Review system learning, autonomous operations, operator actions, and recurring task patterns.',
    sources: 'AUTONOMOUS_OPERATIONS, SYSTEM_LEARNING, WORK_QUEUE, OPERATOR_CONSOLE.',
    decisionLinkage: 'Supports safe expansion from reporting automation to controlled operational automation.',
    operatorAction: 'Identify one repeatable task that may become automation-ready after additional validation.'
  });

  return seeds;
}

function sciipTestIntelligenceRequirementProcessor() {
  const result = sciipRunIntelligenceRequirementProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestIntelligenceRequirementProcessor',
    result: result
  }));
  return result;
}

function sciipExtractFirstAvailable_(record, fieldNames) {
  if (!record) return '';

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (record[fieldName] !== undefined && record[fieldName] !== null && record[fieldName] !== '') {
      return String(record[fieldName]);
    }
  }

  return '';
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 520_ResearchMissionProcessor
 *
 * INTELLIGENCE_REQUIREMENTS + STRATEGIC_INTELLIGENCE
 * → RESEARCH_MISSIONS
 *
 * Migration note:
 * Preserves original 520 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const RESEARCH_MISSION_PROCESSOR = '520_ResearchMissionProcessor';
const RESEARCH_MISSIONS_SHEET = 'RESEARCH_MISSIONS';

const RESEARCH_MISSIONS_HEADERS = [
  'Research_Mission_ID',
  'Business_Key',
  'Mission_Date',
  'Mission_Type',
  'Requirement_ID',
  'Strategic_Intelligence_ID',
  'Mission_Priority',
  'Mission_Status',
  'Research_Question',
  'Mission_Objective',
  'Research_Scope',
  'Target_Entities',
  'Suggested_Sources',
  'Expected_Output',
  'Decision_Linkage',
  'Assigned_To',
  'Human_Review_Status',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureResearchMissionsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    RESEARCH_MISSIONS_SHEET,
    RESEARCH_MISSIONS_HEADERS
  );
}

function sciipRunResearchMissionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: RESEARCH_MISSION_PROCESSOR,
    action: 'RESEARCH_MISSIONS_BUILD',
    sourceSheet: 'INTELLIGENCE_REQUIREMENTS',
    targetSheet: RESEARCH_MISSIONS_SHEET,
    ledgerSheet: 'RESEARCH_MISSIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const requirements = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('INTELLIGENCE_REQUIREMENTS');
      const strategicIntelligenceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('STRATEGIC_INTELLIGENCE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: requirements.length + strategicIntelligenceRecords.length,
        outputCount: requirements.length || 1,
        summary: 'Research missions runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: RESEARCH_MISSION_PROCESSOR,
          inputSheets: [
            'INTELLIGENCE_REQUIREMENTS',
            'STRATEGIC_INTELLIGENCE'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureResearchMissionsSchema();
      const missionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const researchMissionsBusinessKey = 'RESEARCH_MISSIONS|' + missionDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        researchMissionsBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: RESEARCH_MISSION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            researchMissionsCreated: 0,
            skippedDuplicate: 1,
            researchMissionsBusinessKey: researchMissionsBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const requirements = sciipGetRuntimeRecordsByDate_(
        'INTELLIGENCE_REQUIREMENTS',
        'Requirement_Date',
        missionDate
      );

      const strategicIntelligence = sciipGetLatestRuntimeRecordByCreatedAt_('STRATEGIC_INTELLIGENCE');

      if (requirements.length === 0 && !strategicIntelligence) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: RESEARCH_MISSION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            researchMissionsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const missions = sciipCreateResearchMissions_({
        businessKey: researchMissionsBusinessKey,
        missionDate: missionDate,
        requirements: requirements,
        strategicIntelligence: strategicIntelligence,
        processor: RESEARCH_MISSION_PROCESSOR
      });

      missions.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: RESEARCH_MISSION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: missions.length,
        recordsRead: requirements.length + (strategicIntelligence ? 1 : 0),
        processed: missions.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          intelligenceRequirementsReviewed: requirements.length,
          strategicIntelligenceFound: !!strategicIntelligence,
          researchMissionsCreated: missions.length,
          skippedDuplicate: 0,
          researchMissionsBusinessKey: researchMissionsBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipGetRuntimeRecordsByDate_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];

  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(
      parsed,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  return text;
}

function sciipGetLatestRuntimeRecordByCreatedAt_(sheetName) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  records.sort(function(a, b) {
    const aTime = sciipRuntimeRecordTimestamp_(a);
    const bTime = sciipRuntimeRecordTimestamp_(b);
    return aTime - bTime;
  });

  return records[records.length - 1];
}

function sciipRuntimeRecordTimestamp_(record) {
  if (!record) return 0;

  const raw =
    record.Created_At ||
    record.Updated_At ||
    record.Timestamp ||
    record.completedAt ||
    record.Completed_At ||
    '';

  const time = raw ? new Date(raw).getTime() : 0;
  return isNaN(time) ? 0 : time;
}

function sciipCreateResearchMissions_(args) {
  const now = new Date();

  if (!args.requirements || args.requirements.length === 0) {
    return [
      sciipCreateFallbackResearchMission_(args, now)
    ];
  }

  return args.requirements.map(requirement => {
    const requirementId = sciipExtractFirstAvailable_(requirement, [
      'Requirement_ID',
      'ID'
    ]);

    const requirementType = sciipExtractFirstAvailable_(requirement, [
      'Requirement_Type'
    ]);

    const priority = sciipExtractFirstAvailable_(requirement, [
      'Priority'
    ]) || 'MEDIUM';

    const question = sciipExtractFirstAvailable_(requirement, [
      'Intelligence_Question',
      'Question'
    ]);

    const researchDirection = sciipExtractFirstAvailable_(requirement, [
      'Research_Direction',
      'Knowledge_Gap'
    ]);

    const suggestedSources = sciipExtractFirstAvailable_(requirement, [
      'Suggested_Sources'
    ]);

    const decisionLinkage = sciipExtractFirstAvailable_(requirement, [
      'Decision_Linkage'
    ]);

    const seedKey = sciipNormalizeMissionKey_(requirementType || requirementId || question);

    return [
      sciipGenerateId_('RMS'),
      `${args.businessKey}|${seedKey}`,
      args.missionDate,
      sciipMapRequirementTypeToMissionType_(requirementType),
      requirementId,
      sciipExtractFirstAvailable_(args.strategicIntelligence, [
        'Strategic_Intelligence_ID',
        'Record_ID',
        'ID'
      ]),
      priority,
      'OPEN',
      question,
      sciipComposeMissionObjective_(requirement),
      researchDirection,
      sciipInferMissionTargetEntities_(requirement, args.strategicIntelligence),
      suggestedSources,
      sciipComposeMissionExpectedOutput_(requirementType),
      decisionLinkage,
      'SCIIP_OPERATOR',
      'PENDING_OPERATOR_REVIEW',
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });
}

function sciipCreateFallbackResearchMission_(args, now) {
  return [
    sciipGenerateId_('RMS'),
    `${args.businessKey}|FALLBACK_STRATEGIC_REVIEW`,
    args.missionDate,
    'STRATEGIC_RESEARCH_MISSION',
    '',
    sciipExtractFirstAvailable_(args.strategicIntelligence, [
      'Strategic_Intelligence_ID',
      'Record_ID',
      'ID'
    ]),
    'MEDIUM',
    'OPEN',
    'What strategic intelligence from today requires further research?',
    'Review today’s strategic intelligence and identify one actionable research path.',
    sciipExtractFirstAvailable_(args.strategicIntelligence, [
      'Strategic_Thesis',
      'Strategic_Risks',
      'Strategic_Opportunities',
      'Recommended_Strategic_Actions'
    ]),
    'Market, companies, properties, tenants, ownership, and operating system signals.',
    'STRATEGIC_INTELLIGENCE, BRIEFING_DIGEST, property records, broker notes, public sources.',
    'One validated research finding or one new knowledge gap.',
    'Supports strategic intelligence validation.',
    'SCIIP_OPERATOR',
    'PENDING_OPERATOR_REVIEW',
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipMapRequirementTypeToMissionType_(requirementType) {
  const type = String(requirementType || '').toUpperCase();

  if (type.includes('MARKET')) return 'MARKET_RESEARCH_MISSION';
  if (type.includes('KNOWLEDGE_GAP')) return 'KNOWLEDGE_GAP_RESEARCH_MISSION';
  if (type.includes('OPERATING')) return 'OPERATING_SYSTEM_RESEARCH_MISSION';
  if (type.includes('RISK')) return 'RISK_RESEARCH_MISSION';
  if (type.includes('AUTONOMY')) return 'AUTONOMY_RESEARCH_MISSION';

  return 'GENERAL_RESEARCH_MISSION';
}

function sciipComposeMissionObjective_(requirement) {
  const question = sciipExtractFirstAvailable_(requirement, [
    'Intelligence_Question'
  ]);

  const why = sciipExtractFirstAvailable_(requirement, [
    'Why_It_Matters'
  ]);

  if (question && why) {
    return `Answer the intelligence question and determine whether it should update SCIIP knowledge graph or operating priorities.\n\nWhy it matters: ${why}`;
  }

  if (question) {
    return `Answer the intelligence question and determine whether it should become a knowledge graph update, work item, or monitoring requirement.`;
  }

  return 'Convert intelligence requirement into a validated research finding or durable knowledge gap.';
}

function sciipInferMissionTargetEntities_(requirement, strategicIntelligence) {
  const combined = [
    sciipExtractFirstAvailable_(requirement, [
      'Requirement_Type',
      'Intelligence_Question',
      'Knowledge_Gap',
      'Research_Direction'
    ]),
    sciipExtractFirstAvailable_(strategicIntelligence, [
      'Market_Intelligence',
      'Strategic_Opportunities',
      'Strategic_Risks'
    ])
  ].join(' ').toLowerCase();

  if (combined.includes('company') || combined.includes('tenant') || combined.includes('supplier')) {
    return 'Companies, tenants, suppliers, OEMs, and related industrial occupiers.';
  }

  if (combined.includes('property') || combined.includes('asset') || combined.includes('building')) {
    return 'Properties, assets, buildings, ownership records, and location-based market signals.';
  }

  if (combined.includes('workflow') || combined.includes('automation') || combined.includes('system')) {
    return 'SCIIP processors, workflows, queues, operating records, and automation candidates.';
  }

  if (combined.includes('risk')) {
    return 'Risk signals, affected assets, affected companies, timing, severity, and mitigation paths.';
  }

  return 'Market signals, companies, properties, relationships, and operating intelligence records.';
}

function sciipComposeMissionExpectedOutput_(requirementType) {
  const type = String(requirementType || '').toUpperCase();

  if (type.includes('KNOWLEDGE_GAP')) {
    return 'Validated missing fact, proposed knowledge graph update, or new knowledge gap record.';
  }

  if (type.includes('MARKET')) {
    return 'Validated market finding, source notes, affected entities, and recommended follow-up.';
  }

  if (type.includes('RISK')) {
    return 'Risk summary, affected entities, confidence level, and recommended monitoring or escalation.';
  }

  if (type.includes('AUTONOMY')) {
    return 'Automation readiness finding and recommendation for human-review, defer, or automate-later.';
  }

  if (type.includes('OPERATING')) {
    return 'Workflow improvement recommendation, blocker pattern, or schema enhancement.';
  }

  return 'Research finding, confidence level, source notes, and recommended next action.';
}



function sciipNormalizeMissionKey_(value) {
  return String(value || 'MISSION')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80);
}

function sciipTestResearchMissionProcessor() {
  const result = sciipRunResearchMissionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestResearchMissionProcessor',
    result: result
  }));
  return result;
}

function sciipExtractFirstAvailable_(record, fieldNames) {
  if (!record) return '';

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (record[fieldName] !== undefined && record[fieldName] !== null && record[fieldName] !== '') {
      return String(record[fieldName]);
    }
  }

  return '';
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 530_AutonomousResearchCoordinatorProcessor
 *
 * RESEARCH_MISSIONS + INTELLIGENCE_REQUIREMENTS
 * → AUTONOMOUS_RESEARCH_COORDINATION
 *
 * Migration note:
 * Preserves original 530 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR = '530_AutonomousResearchCoordinatorProcessor';
const AUTONOMOUS_RESEARCH_COORDINATION_SHEET = 'AUTONOMOUS_RESEARCH_COORDINATION';

const AUTONOMOUS_RESEARCH_COORDINATION_HEADERS = [
  'Coordination_ID',
  'Business_Key',
  'Coordination_Date',
  'Coordination_Type',
  'Research_Mission_ID',
  'Requirement_ID',
  'Mission_Type',
  'Mission_Priority',
  'Coordination_Status',
  'Research_Route',
  'Research_Objective',
  'Research_Instructions',
  'Suggested_Sources',
  'Expected_Output',
  'Duplicate_Risk',
  'Human_Review_Status',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousResearchCoordinationSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    AUTONOMOUS_RESEARCH_COORDINATION_SHEET,
    AUTONOMOUS_RESEARCH_COORDINATION_HEADERS
  );
}

function sciipRunAutonomousResearchCoordinatorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR,
    action: 'AUTONOMOUS_RESEARCH_COORDINATION_BUILD',
    sourceSheet: 'RESEARCH_MISSIONS',
    targetSheet: AUTONOMOUS_RESEARCH_COORDINATION_SHEET,
    ledgerSheet: 'AUTONOMOUS_RESEARCH_COORDINATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const missions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('RESEARCH_MISSIONS');
      const requirements = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('INTELLIGENCE_REQUIREMENTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: missions.length + requirements.length,
        outputCount: missions.length || 1,
        summary: 'Autonomous research coordination runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR,
          inputSheets: [
            'RESEARCH_MISSIONS',
            'INTELLIGENCE_REQUIREMENTS'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousResearchCoordinationSchema();
      const coordinationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const coordinationBusinessKey = 'AUTONOMOUS_RESEARCH_COORDINATION|' + coordinationDate;

      if (sciipRuntimeBusinessKeyPrefixExists530_(definition.targetSheet, coordinationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            researchCoordinationsCreated: 0,
            skippedDuplicate: 1,
            coordinationBusinessKey: coordinationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const missions = sciipGetRuntimeRecordsByDate530_(
        'RESEARCH_MISSIONS',
        'Mission_Date',
        coordinationDate
      );

      const requirements = sciipGetRuntimeRecordsByDate530_(
        'INTELLIGENCE_REQUIREMENTS',
        'Requirement_Date',
        coordinationDate
      );

      if (missions.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            researchCoordinationsCreated: 0,
            skippedNoResearchMissions: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const coordinationRows = sciipCreateAutonomousResearchCoordinations_({
        businessKey: coordinationBusinessKey,
        coordinationDate: coordinationDate,
        missions: missions,
        requirements: requirements,
        processor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR
      });

      coordinationRows.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: coordinationRows.length,
        recordsRead: missions.length + requirements.length,
        processed: coordinationRows.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          researchMissionsReviewed: missions.length,
          intelligenceRequirementsReviewed: requirements.length,
          researchCoordinationsCreated: coordinationRows.length,
          skippedDuplicate: 0,
          coordinationBusinessKey: coordinationBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists530_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;

  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate530_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];

  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue530_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue530_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(
      parsed,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  return text;
}

function sciipCreateAutonomousResearchCoordinations_(args) {
  const now = new Date();

  return args.missions.map(function(mission) {
    const missionId = sciipExtractFirstAvailable530_(mission, [
      'Research_Mission_ID',
      'Mission_ID',
      'Record_ID',
      'ID'
    ]);

    const requirementId = sciipExtractFirstAvailable530_(mission, [
      'Requirement_ID'
    ]);

    const missionType = sciipExtractFirstAvailable530_(mission, [
      'Mission_Type'
    ]);

    const missionPriority = sciipExtractFirstAvailable530_(mission, [
      'Mission_Priority',
      'Priority'
    ]) || 'MEDIUM';

    const matchedRequirement = sciipFindRequirementById_(args.requirements, requirementId);
    const researchRoute = sciipInferResearchRoute_(missionType, mission, matchedRequirement);
    const duplicateRisk = sciipInferResearchDuplicateRisk_(mission, args.missions);

    return [
      sciipGenerateId_('ARC'),
      args.businessKey + '|' + sciipNormalizeMissionKey530_(missionId || missionType),
      args.coordinationDate,
      'DAILY_RESEARCH_COORDINATION',
      missionId,
      requirementId,
      missionType,
      missionPriority,
      'QUEUED_FOR_RESEARCH',
      researchRoute,
      sciipExtractFirstAvailable530_(mission, [
        'Mission_Objective',
        'Research_Question'
      ]),
      sciipComposeResearchInstructions_({
        mission: mission,
        matchedRequirement: matchedRequirement,
        researchRoute: researchRoute
      }),
      sciipExtractFirstAvailable530_(mission, [
        'Suggested_Sources'
      ]),
      sciipExtractFirstAvailable530_(mission, [
        'Expected_Output'
      ]),
      duplicateRisk,
      'PENDING_OPERATOR_REVIEW',
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });
}

function sciipFindRequirementById_(requirements, requirementId) {
  if (!requirementId) return null;

  return requirements.find(function(req) {
    return sciipExtractFirstAvailable530_(req, [
      'Requirement_ID',
      'ID'
    ]) === requirementId;
  }) || null;
}

function sciipInferResearchRoute_(missionType, mission, requirement) {
  const combined = [
    missionType,
    sciipExtractFirstAvailable530_(mission, [
      'Research_Question',
      'Mission_Objective',
      'Research_Scope',
      'Target_Entities'
    ]),
    sciipExtractFirstAvailable530_(requirement, [
      'Requirement_Type',
      'Knowledge_Gap',
      'Research_Direction'
    ])
  ].join(' ').toLowerCase();

  if (combined.includes('market')) return 'MARKET_RESEARCH_ROUTE';

  if (
    combined.includes('company') ||
    combined.includes('tenant') ||
    combined.includes('supplier') ||
    combined.includes('oem')
  ) {
    return 'COMPANY_ENTITY_RESEARCH_ROUTE';
  }

  if (
    combined.includes('property') ||
    combined.includes('asset') ||
    combined.includes('building') ||
    combined.includes('ownership')
  ) {
    return 'PROPERTY_ENTITY_RESEARCH_ROUTE';
  }

  if (
    combined.includes('risk') ||
    combined.includes('threat') ||
    combined.includes('critical')
  ) {
    return 'RISK_RESEARCH_ROUTE';
  }

  if (
    combined.includes('workflow') ||
    combined.includes('system') ||
    combined.includes('automation') ||
    combined.includes('autonomous')
  ) {
    return 'OPERATING_SYSTEM_RESEARCH_ROUTE';
  }

  return 'GENERAL_RESEARCH_ROUTE';
}

function sciipComposeResearchInstructions_(args) {
  const question = sciipExtractFirstAvailable530_(args.mission, [
    'Research_Question'
  ]);

  const scope = sciipExtractFirstAvailable530_(args.mission, [
    'Research_Scope'
  ]);

  const targetEntities = sciipExtractFirstAvailable530_(args.mission, [
    'Target_Entities'
  ]);

  const requirementGap = sciipExtractFirstAvailable530_(args.matchedRequirement, [
    'Knowledge_Gap'
  ]);

  const parts = [];

  parts.push('Route: ' + args.researchRoute + '.');

  if (question) parts.push('Answer this question: ' + question);
  if (scope) parts.push('Research scope: ' + scope);
  if (targetEntities) parts.push('Target entities: ' + targetEntities);
  if (requirementGap) parts.push('Knowledge gap to resolve: ' + requirementGap);

  parts.push(
    'Do not overwrite existing knowledge. Produce source-backed findings, confidence level, affected entities, and recommended next action.'
  );

  return parts.join('\n');
}

function sciipInferResearchDuplicateRisk_(mission, allMissions) {
  const missionQuestion = sciipNormalizeComparisonText530_(
    sciipExtractFirstAvailable530_(mission, [
      'Research_Question',
      'Mission_Objective'
    ])
  );

  if (!missionQuestion) return 'UNKNOWN';

  const similarCount = allMissions.filter(function(other) {
    const otherQuestion = sciipNormalizeComparisonText530_(
      sciipExtractFirstAvailable530_(other, [
        'Research_Question',
        'Mission_Objective'
      ])
    );

    return otherQuestion === missionQuestion;
  }).length;

  if (similarCount > 1) return 'POSSIBLE_DUPLICATE';
  return 'LOW';
}

function sciipNormalizeComparisonText530_(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function sciipNormalizeMissionKey530_(value) {
  return String(value || 'MISSION')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80);
}

function sciipExtractFirstAvailable530_(record, fieldNames) {
  if (!record) return '';

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (record[fieldName] !== undefined && record[fieldName] !== null && record[fieldName] !== '') {
      return String(record[fieldName]);
    }
  }

  return '';
}

function sciipTestAutonomousResearchCoordinatorProcessor() {
  const result = sciipRunAutonomousResearchCoordinatorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousResearchCoordinatorProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 540_KnowledgeGapProcessor
 *
 * AUTONOMOUS_RESEARCH_COORDINATION + RESEARCH_MISSIONS
 * + INTELLIGENCE_REQUIREMENTS → KNOWLEDGE_GAPS
 *
 * Migration note:
 * Preserves original 540 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const KNOWLEDGE_GAP_PROCESSOR = '540_KnowledgeGapProcessor';
const KNOWLEDGE_GAPS_SHEET = 'KNOWLEDGE_GAPS';

const KNOWLEDGE_GAPS_HEADERS = [
  'Knowledge_Gap_ID',
  'Business_Key',
  'Gap_Date',
  'Gap_Type',
  'Coordination_ID',
  'Research_Mission_ID',
  'Requirement_ID',
  'Entity_Type',
  'Entity_ID',
  'Gap_Category',
  'Missing_Fact',
  'Why_It_Matters',
  'Suggested_Data_Source',
  'Priority',
  'Confidence',
  'Gap_Status',
  'Discovery_Source',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureKnowledgeGapsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    KNOWLEDGE_GAPS_SHEET,
    KNOWLEDGE_GAPS_HEADERS
  );
}

function sciipRunKnowledgeGapProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: KNOWLEDGE_GAP_PROCESSOR,
    action: 'KNOWLEDGE_GAPS_BUILD',
    sourceSheet: 'AUTONOMOUS_RESEARCH_COORDINATION',
    targetSheet: KNOWLEDGE_GAPS_SHEET,
    ledgerSheet: 'KNOWLEDGE_GAPS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const coordinations = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_RESEARCH_COORDINATION');
      const missions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('RESEARCH_MISSIONS');
      const requirements = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('INTELLIGENCE_REQUIREMENTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: coordinations.length + missions.length + requirements.length,
        outputCount: coordinations.length || missions.length || requirements.length || 1,
        summary: 'Knowledge gap runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: KNOWLEDGE_GAP_PROCESSOR,
          inputSheets: [
            'AUTONOMOUS_RESEARCH_COORDINATION',
            'RESEARCH_MISSIONS',
            'INTELLIGENCE_REQUIREMENTS'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureKnowledgeGapsSchema();
      const gapDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const gapBusinessKey = 'KNOWLEDGE_GAPS|' + gapDate;

      if (sciipRuntimeBusinessKeyPrefixExists540_(definition.targetSheet, gapBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: KNOWLEDGE_GAP_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeGapsCreated: 0,
            skippedDuplicate: 1,
            knowledgeGapsBusinessKey: gapBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const coordinations = sciipGetRuntimeRecordsByDate540_(
        'AUTONOMOUS_RESEARCH_COORDINATION',
        'Coordination_Date',
        gapDate
      );

      const missions = sciipGetRuntimeRecordsByDate540_(
        'RESEARCH_MISSIONS',
        'Mission_Date',
        gapDate
      );

      const requirements = sciipGetRuntimeRecordsByDate540_(
        'INTELLIGENCE_REQUIREMENTS',
        'Requirement_Date',
        gapDate
      );

      if (
        coordinations.length === 0 &&
        missions.length === 0 &&
        requirements.length === 0
      ) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: KNOWLEDGE_GAP_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeGapsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const gapRows = sciipCreateKnowledgeGaps540_({
        businessKey: gapBusinessKey,
        gapDate: gapDate,
        coordinations: coordinations,
        missions: missions,
        requirements: requirements,
        processor: KNOWLEDGE_GAP_PROCESSOR
      });

      gapRows.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: KNOWLEDGE_GAP_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: gapRows.length,
        recordsRead: coordinations.length + missions.length + requirements.length,
        processed: gapRows.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          researchCoordinationsReviewed: coordinations.length,
          researchMissionsReviewed: missions.length,
          intelligenceRequirementsReviewed: requirements.length,
          knowledgeGapsCreated: gapRows.length,
          skippedDuplicate: 0,
          knowledgeGapsBusinessKey: gapBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists540_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;

  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate540_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];

  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue540_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue540_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(
      parsed,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  return text;
}

function sciipCreateKnowledgeGaps540_(args) {
  const now = new Date();
  const rows = [];

  const sourceRecords =
    args.coordinations.length > 0
      ? args.coordinations
      : args.missions.length > 0
        ? args.missions
        : args.requirements;

  sourceRecords.forEach(record => {
    const coordinationId = sciipExtractFirstAvailable540_(record, [
      'Coordination_ID'
    ]);

    const missionId = sciipExtractFirstAvailable540_(record, [
      'Research_Mission_ID'
    ]);

    const requirementId = sciipExtractFirstAvailable540_(record, [
      'Requirement_ID'
    ]);

    const matchedMission =
      sciipFindMissionById540_(args.missions, missionId);

    const matchedRequirement =
      sciipFindRequirementById540_(args.requirements, requirementId);

    const gapProfile =
      sciipInferKnowledgeGapProfile540_(record, matchedMission, matchedRequirement);

    const rowBusinessKey =
      `${args.businessKey}|${gapProfile.entityType}|${gapProfile.gapCategory}|${sciipNormalizeMissionKey540_(missionId || requirementId || gapProfile.missingFact)}`;

    rows.push([
      sciipGenerateId_('KGP'),
      rowBusinessKey,
      args.gapDate,
      'DAILY_KNOWLEDGE_GAP',
      coordinationId,
      missionId,
      requirementId,
      gapProfile.entityType,
      gapProfile.entityId,
      gapProfile.gapCategory,
      gapProfile.missingFact,
      gapProfile.whyItMatters,
      gapProfile.suggestedDataSource,
      gapProfile.priority,
      gapProfile.confidence,
      'OPEN',
      gapProfile.discoverySource,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ]);
  });

  return sciipDeduplicateKnowledgeGapRows540_(rows);
}

function sciipInferKnowledgeGapProfile540_(record, mission, requirement) {
  const combined = [
    sciipExtractFirstAvailable540_(record, [
      'Mission_Type',
      'Research_Route',
      'Research_Objective',
      'Research_Instructions',
      'Expected_Output'
    ]),
    sciipExtractFirstAvailable540_(mission, [
      'Mission_Type',
      'Research_Question',
      'Mission_Objective',
      'Research_Scope',
      'Target_Entities',
      'Expected_Output'
    ]),
    sciipExtractFirstAvailable540_(requirement, [
      'Requirement_Type',
      'Intelligence_Question',
      'Knowledge_Gap',
      'Research_Direction',
      'Why_It_Matters',
      'Suggested_Sources'
    ])
  ].join(' ').toLowerCase();

  let entityType = 'UNKNOWN_ENTITY';
  let gapCategory = 'GENERAL_KNOWLEDGE_GAP';
  let missingFact = 'Missing validated intelligence required to strengthen SCIIP knowledge graph.';
  let suggestedDataSource = 'Research missions, public records, broker notes, company sources, and operator review.';
  let priority = 'MEDIUM';
  let confidence = 'MEDIUM';

  if (
    combined.includes('company') ||
    combined.includes('tenant') ||
    combined.includes('supplier') ||
    combined.includes('oem')
  ) {
    entityType = 'COMPANY';
    gapCategory = 'COMPANY_RELATIONSHIP_OR_ACTIVITY_GAP';
    missingFact = 'Missing company, tenant, supplier, OEM relationship, activity, or expansion intelligence.';
    suggestedDataSource = 'Company websites, press releases, LinkedIn, funding announcements, broker notes, property records.';
  }

  if (
    combined.includes('property') ||
    combined.includes('asset') ||
    combined.includes('building') ||
    combined.includes('ownership')
  ) {
    entityType = 'PROPERTY';
    gapCategory = 'PROPERTY_ATTRIBUTE_OR_OWNERSHIP_GAP';
    missingFact = 'Missing property attribute, ownership, tenant, availability, power, yard, or building-level intelligence.';
    suggestedDataSource = 'Property registry, AIR CRE data, assessor records, broker packages, city records, owner websites.';
  }

  if (
    combined.includes('market') ||
    combined.includes('opportunity')
  ) {
    entityType = entityType === 'UNKNOWN_ENTITY' ? 'MARKET' : entityType;
    gapCategory = 'MARKET_SIGNAL_VALIDATION_GAP';
    missingFact = 'Missing validation of market signal, opportunity, demand driver, timing, affected entities, or strategic relevance.';
    suggestedDataSource = 'Briefing digests, market reports, tenant activity, broker intelligence, public announcements.';
  }

  if (
    combined.includes('risk') ||
    combined.includes('threat') ||
    combined.includes('critical')
  ) {
    gapCategory = 'RISK_VALIDATION_GAP';
    missingFact = 'Missing risk severity, affected entities, timing, confidence, and mitigation path.';
    priority = 'HIGH';
    suggestedDataSource = 'Strategic intelligence, command brief, system health, public records, and monitoring sources.';
  }

  if (
    combined.includes('workflow') ||
    combined.includes('automation') ||
    combined.includes('autonomous') ||
    combined.includes('system')
  ) {
    entityType = 'SCIIP_SYSTEM';
    gapCategory = 'OPERATING_SYSTEM_GAP';
    missingFact = 'Missing operating-system insight about workflow friction, automation readiness, blocker pattern, or process improvement.';
    suggestedDataSource = 'WORK_QUEUE, AUTONOMOUS_OPERATIONS, SYSTEM_LEARNING, OPERATOR_CONSOLE.';
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog')
  ) {
    priority = 'HIGH';
  }

  if (
    combined.includes('unknown') ||
    combined.includes('missing') ||
    combined.includes('gap')
  ) {
    confidence = 'HIGH';
  }

  return {
    entityType,
    entityId: '',
    gapCategory,
    missingFact,
    whyItMatters: sciipInferKnowledgeGapWhyItMatters540_(record, mission, requirement),
    suggestedDataSource,
    priority,
    confidence,
    discoverySource: sciipInferKnowledgeGapDiscoverySource540_(record, mission, requirement)
  };
}

function sciipInferKnowledgeGapWhyItMatters540_(record, mission, requirement) {
  const explicitWhy = sciipExtractFirstAvailable540_(requirement, [
    'Why_It_Matters',
    'Decision_Linkage'
  ]);

  if (explicitWhy) {
    return explicitWhy;
  }

  const missionObjective = sciipExtractFirstAvailable540_(mission, [
    'Mission_Objective',
    'Decision_Linkage'
  ]);

  if (missionObjective) {
    return missionObjective;
  }

  const researchObjective = sciipExtractFirstAvailable540_(record, [
    'Research_Objective',
    'Expected_Output'
  ]);

  if (researchObjective) {
    return researchObjective;
  }

  return 'Closing this gap improves SCIIP confidence, strengthens the knowledge graph, and supports better strategic decisions.';
}

function sciipInferKnowledgeGapDiscoverySource540_(record, mission, requirement) {
  if (record && sciipExtractFirstAvailable540_(record, ['Coordination_ID'])) {
    return 'AUTONOMOUS_RESEARCH_COORDINATION';
  }

  if (mission && sciipExtractFirstAvailable540_(mission, ['Research_Mission_ID'])) {
    return 'RESEARCH_MISSIONS';
  }

  if (requirement && sciipExtractFirstAvailable540_(requirement, ['Requirement_ID'])) {
    return 'INTELLIGENCE_REQUIREMENTS';
  }

  return 'UNKNOWN';
}

function sciipFindMissionById540_(missions, missionId) {
  if (!missionId) return null;

  return missions.find(mission =>
    sciipExtractFirstAvailable540_(mission, [
      'Research_Mission_ID',
      'Mission_ID',
      'ID'
    ]) === missionId
  ) || null;
}

function sciipDeduplicateKnowledgeGapRows540_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}


function sciipFindRequirementById540_(requirements, requirementId) {
  if (!requirementId) return null;

  return requirements.find(function(requirement) {
    return sciipExtractFirstAvailable540_(requirement, [
      'Requirement_ID',
      'Intelligence_Requirement_ID',
      'ID'
    ]) === requirementId;
  }) || null;
}

function sciipNormalizeMissionKey540_(value) {
  return String(value || 'UNKNOWN')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'UNKNOWN';
}

function sciipExtractFirstAvailable540_(record, fieldNames) {
  if (!record) return '';

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    const value = record[fieldName];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return '';
}

function sciipTestKnowledgeGapProcessor() {
  const result = sciipRunKnowledgeGapProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestKnowledgeGapProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 550_KnowledgeGraphEnrichmentProcessor
 *
 * KNOWLEDGE_GAPS + RESEARCH_MISSIONS +
 * AUTONOMOUS_RESEARCH_COORDINATION → KNOWLEDGE_GRAPH_ENRICHMENT
 *
 * Migration note:
 * Preserves original 550 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR = '550_KnowledgeGraphEnrichmentProcessor';
const KNOWLEDGE_GRAPH_ENRICHMENT_SHEET =
  'KNOWLEDGE_GRAPH_ENRICHMENT';

const KNOWLEDGE_GRAPH_ENRICHMENT_HEADERS = [
  'Enrichment_ID',
  'Business_Key',
  'Enrichment_Date',
  'Enrichment_Type',
  'Knowledge_Gap_ID',
  'Research_Mission_ID',
  'Coordination_ID',
  'Target_Entity_Type',
  'Target_Entity_ID',
  'Target_Graph_Object',
  'Proposed_Node_Type',
  'Proposed_Edge_Type',
  'Proposed_Property_Update',
  'Enrichment_Rationale',
  'Source_Record',
  'Confidence',
  'Human_Review_Status',
  'Enrichment_Status',
  'Status',
  'Created_At',
  'Processor'
];


function sciipEnsureKnowledgeGraphEnrichmentSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    KNOWLEDGE_GRAPH_ENRICHMENT_SHEET,
    KNOWLEDGE_GRAPH_ENRICHMENT_HEADERS
  );
}

function sciipRunKnowledgeGraphEnrichmentProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR,
    action: 'KNOWLEDGE_GRAPH_ENRICHMENT_BUILD',
    sourceSheet: 'KNOWLEDGE_GAPS',
    targetSheet: KNOWLEDGE_GRAPH_ENRICHMENT_SHEET,
    ledgerSheet: 'KNOWLEDGE_GRAPH_ENRICHMENT_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const knowledgeGaps = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('KNOWLEDGE_GAPS');
      const researchMissions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('RESEARCH_MISSIONS');
      const coordinations = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_RESEARCH_COORDINATION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: knowledgeGaps.length + researchMissions.length + coordinations.length,
        outputCount: knowledgeGaps.length || researchMissions.length || coordinations.length || 1,
        summary: 'Knowledge graph enrichment runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR,
          inputSheets: [
            'KNOWLEDGE_GAPS',
            'RESEARCH_MISSIONS',
            'AUTONOMOUS_RESEARCH_COORDINATION'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureKnowledgeGraphEnrichmentSchema();
      const enrichmentDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const enrichmentBusinessKey = 'KNOWLEDGE_GRAPH_ENRICHMENT|' + enrichmentDate;

      if (sciipRuntimeBusinessKeyPrefixExists550_(definition.targetSheet, enrichmentBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeGraphEnrichmentsCreated: 0,
            skippedDuplicate: 1,
            enrichmentBusinessKey: enrichmentBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const knowledgeGaps = sciipGetRuntimeRecordsByDate550_(
        'KNOWLEDGE_GAPS',
        'Gap_Date',
        enrichmentDate
      );
      const researchMissions = sciipGetRuntimeRecordsByDate550_(
        'RESEARCH_MISSIONS',
        'Mission_Date',
        enrichmentDate
      );
      const coordinations = sciipGetRuntimeRecordsByDate550_(
        'AUTONOMOUS_RESEARCH_COORDINATION',
        'Coordination_Date',
        enrichmentDate
      );

      if (knowledgeGaps.length === 0 && researchMissions.length === 0 && coordinations.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeGraphEnrichmentsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const enrichmentRows = sciipCreateKnowledgeGraphEnrichments550_({
        businessKey: enrichmentBusinessKey,
        enrichmentDate: enrichmentDate,
        knowledgeGaps: knowledgeGaps,
        researchMissions: researchMissions,
        coordinations: coordinations,
        processor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR
      });

      enrichmentRows.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: enrichmentRows.length,
        recordsRead: knowledgeGaps.length + researchMissions.length + coordinations.length,
        processed: enrichmentRows.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          knowledgeGapsReviewed: knowledgeGaps.length,
          researchMissionsReviewed: researchMissions.length,
          researchCoordinationsReviewed: coordinations.length,
          knowledgeGraphEnrichmentsCreated: enrichmentRows.length,
          skippedDuplicate: 0,
          enrichmentBusinessKey: enrichmentBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists550_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate550_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue550_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue550_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateKnowledgeGraphEnrichments550_(args) {
  const now = new Date();

  const sourceRecords =
    args.knowledgeGaps.length > 0
      ? args.knowledgeGaps
      : args.researchMissions.length > 0
        ? args.researchMissions
        : args.coordinations;

  const rows = sourceRecords.map(record => {
    const knowledgeGapId = sciipExtractFirstAvailable550_(record, [
      'Knowledge_Gap_ID',
      'Gap_ID'
    ]);

    const researchMissionId = sciipExtractFirstAvailable550_(record, [
      'Research_Mission_ID'
    ]);

    const coordinationId = sciipExtractFirstAvailable550_(record, [
      'Coordination_ID'
    ]);

    const matchedMission =
      sciipFindMissionById550_(args.researchMissions, researchMissionId);

    const matchedCoordination =
      sciipFindCoordinationById550_(args.coordinations, coordinationId);

    const profile =
      sciipInferGraphEnrichmentProfile550_(
        record,
        matchedMission,
        matchedCoordination
      );

    const rowKey =
      `${args.businessKey}|${profile.targetEntityType}|${profile.proposedNodeType}|${sciipNormalizeMissionKey550_(knowledgeGapId || researchMissionId || coordinationId || profile.proposedPropertyUpdate)}`;

    return [
      sciipGenerateId_('KGE'),
      rowKey,
      args.enrichmentDate,
      'DAILY_KNOWLEDGE_GRAPH_ENRICHMENT',
      knowledgeGapId,
      researchMissionId,
      coordinationId,
      profile.targetEntityType,
      profile.targetEntityId,
      profile.targetGraphObject,
      profile.proposedNodeType,
      profile.proposedEdgeType,
      profile.proposedPropertyUpdate,
      profile.enrichmentRationale,
      profile.sourceRecord,
      profile.confidence,
      'PENDING_OPERATOR_REVIEW',
      'PROPOSED',
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateKnowledgeGraphEnrichmentRows550_(rows);
}

function sciipInferGraphEnrichmentProfile550_(gap, mission, coordination) {
  const combined = [
    sciipExtractFirstAvailable550_(gap, [
      'Entity_Type',
      'Gap_Category',
      'Missing_Fact',
      'Why_It_Matters',
      'Suggested_Data_Source',
      'Discovery_Source'
    ]),
    sciipExtractFirstAvailable550_(mission, [
      'Mission_Type',
      'Research_Question',
      'Mission_Objective',
      'Target_Entities',
      'Expected_Output'
    ]),
    sciipExtractFirstAvailable550_(coordination, [
      'Research_Route',
      'Research_Objective',
      'Research_Instructions',
      'Expected_Output'
    ])
  ].join(' ').toLowerCase();

  let targetEntityType =
    sciipExtractFirstAvailable550_(gap, ['Entity_Type']) ||
    'UNKNOWN_ENTITY';

  let proposedNodeType = 'KNOWLEDGE_GAP';
  let proposedEdgeType = 'HAS_KNOWLEDGE_GAP';
  let targetGraphObject = 'KNOWLEDGE_GRAPH';
  let proposedPropertyUpdate =
    'Add or update graph metadata describing missing intelligence and research need.';
  let confidence =
    sciipExtractFirstAvailable550_(gap, ['Confidence']) || 'MEDIUM';

  if (
    combined.includes('company') ||
    combined.includes('tenant') ||
    combined.includes('supplier') ||
    combined.includes('oem')
  ) {
    targetEntityType = 'COMPANY';
    proposedNodeType = 'COMPANY_NODE';
    proposedEdgeType = 'HAS_UNRESOLVED_COMPANY_INTELLIGENCE_GAP';
    targetGraphObject = 'COMPANY_KNOWLEDGE_GRAPH';
    proposedPropertyUpdate =
      'Create or update company intelligence gap metadata, including missing activity, tenant movement, supplier relationship, or OEM linkage.';
  }

  if (
    combined.includes('property') ||
    combined.includes('asset') ||
    combined.includes('building') ||
    combined.includes('ownership')
  ) {
    targetEntityType = 'PROPERTY';
    proposedNodeType = 'PROPERTY_NODE';
    proposedEdgeType = 'HAS_UNRESOLVED_PROPERTY_INTELLIGENCE_GAP';
    targetGraphObject = 'PROPERTY_KNOWLEDGE_GRAPH';
    proposedPropertyUpdate =
      'Create or update property intelligence gap metadata, including missing ownership, tenant, building attribute, power, yard, or availability information.';
  }

  if (
    combined.includes('market') ||
    combined.includes('opportunity')
  ) {
    if (targetEntityType === 'UNKNOWN_ENTITY') {
      targetEntityType = 'MARKET';
    }

    proposedNodeType = 'MARKET_SIGNAL_NODE';
    proposedEdgeType = 'REQUIRES_MARKET_SIGNAL_VALIDATION';
    targetGraphObject = 'MARKET_INTELLIGENCE_GRAPH';
    proposedPropertyUpdate =
      'Create market signal validation metadata linking the signal to affected companies, properties, or submarkets once validated.';
  }

  if (
    combined.includes('risk') ||
    combined.includes('threat') ||
    combined.includes('critical')
  ) {
    proposedNodeType = 'RISK_SIGNAL_NODE';
    proposedEdgeType = 'HAS_UNRESOLVED_RISK_SIGNAL';
    targetGraphObject = 'RISK_INTELLIGENCE_GRAPH';
    proposedPropertyUpdate =
      'Create risk signal metadata including severity, affected entities, timing, source confidence, and mitigation pathway.';
    confidence = confidence === 'LOW' ? 'MEDIUM' : confidence;
  }

  if (
    combined.includes('workflow') ||
    combined.includes('automation') ||
    combined.includes('autonomous') ||
    combined.includes('system')
  ) {
    targetEntityType = 'SCIIP_SYSTEM';
    proposedNodeType = 'SYSTEM_LEARNING_NODE';
    proposedEdgeType = 'HAS_OPERATING_SYSTEM_IMPROVEMENT_GAP';
    targetGraphObject = 'SCIIP_OPERATING_GRAPH';
    proposedPropertyUpdate =
      'Create system learning metadata for workflow friction, automation readiness, blocker pattern, or processor improvement.';
  }

  return {
    targetEntityType,
    targetEntityId: sciipExtractFirstAvailable550_(gap, ['Entity_ID']),
    targetGraphObject,
    proposedNodeType,
    proposedEdgeType,
    proposedPropertyUpdate,
    enrichmentRationale: sciipComposeGraphEnrichmentRationale550_(gap, mission, coordination),
    sourceRecord: sciipInferGraphEnrichmentSourceRecord550_(gap, mission, coordination),
    confidence
  };
}

function sciipComposeGraphEnrichmentRationale550_(gap, mission, coordination) {
  const parts = [];

  const missingFact = sciipExtractFirstAvailable550_(gap, [
    'Missing_Fact'
  ]);

  const why = sciipExtractFirstAvailable550_(gap, [
    'Why_It_Matters'
  ]);

  const missionObjective = sciipExtractFirstAvailable550_(mission, [
    'Mission_Objective'
  ]);

  const instructions = sciipExtractFirstAvailable550_(coordination, [
    'Research_Instructions'
  ]);

  if (missingFact) {
    parts.push(`Missing fact: ${missingFact}`);
  }

  if (why) {
    parts.push(`Strategic rationale: ${why}`);
  }

  if (missionObjective) {
    parts.push(`Research mission objective: ${missionObjective}`);
  }

  if (instructions) {
    parts.push(`Research coordination instructions: ${instructions}`);
  }

  if (parts.length === 0) {
    parts.push(
      'This enrichment candidate was generated because SCIIP identified unresolved knowledge that may strengthen the graph.'
    );
  }

  return parts.join('\n');
}

function sciipInferGraphEnrichmentSourceRecord550_(gap, mission, coordination) {
  const gapId = sciipExtractFirstAvailable550_(gap, [
    'Knowledge_Gap_ID'
  ]);

  if (gapId) {
    return `KNOWLEDGE_GAPS:${gapId}`;
  }

  const missionId = sciipExtractFirstAvailable550_(mission, [
    'Research_Mission_ID'
  ]);

  if (missionId) {
    return `RESEARCH_MISSIONS:${missionId}`;
  }

  const coordinationId = sciipExtractFirstAvailable550_(coordination, [
    'Coordination_ID'
  ]);

  if (coordinationId) {
    return `AUTONOMOUS_RESEARCH_COORDINATION:${coordinationId}`;
  }

  return 'UNKNOWN_SOURCE_RECORD';
}

function sciipFindCoordinationById550_(coordinations, coordinationId) {
  if (!coordinationId) return null;

  return coordinations.find(coordination =>
    sciipExtractFirstAvailable550_(coordination, [
      'Coordination_ID',
      'ID'
    ]) === coordinationId
  ) || null;
}

function sciipDeduplicateKnowledgeGraphEnrichmentRows550_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipExtractFirstAvailable550_(record, fieldNames) {
  if (!record) return '';
  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (record[fieldName] !== undefined && record[fieldName] !== null && record[fieldName] !== '') {
      return String(record[fieldName]);
    }
  }
  return '';
}

function sciipNormalizeMissionKey550_(value) {
  return String(value || 'MISSION')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80);
}

function sciipTestKnowledgeGraphEnrichmentProcessor() {
  const result = sciipRunKnowledgeGraphEnrichmentProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestKnowledgeGraphEnrichmentProcessor',
    result: result
  }));
  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 560_HypothesisGenerationProcessor
 *
 * KNOWLEDGE_GRAPH_ENRICHMENT + KNOWLEDGE_GAPS +
 * STRATEGIC_INTELLIGENCE → HYPOTHESES
 *
 * Migration note:
 * Preserves original 560 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const HYPOTHESIS_GENERATION_PROCESSOR = '560_HypothesisGenerationProcessor';
const HYPOTHESES_SHEET = 'HYPOTHESES';

const HYPOTHESES_HEADERS = [
  'Hypothesis_ID',
  'Business_Key',
  'Hypothesis_Date',
  'Hypothesis_Type',
  'Hypothesis_Title',
  'Hypothesis_Statement',
  'Testable_Question',
  'Strategic_Intelligence_ID',
  'Knowledge_Gap_ID',
  'Enrichment_ID',
  'Target_Entity_Type',
  'Target_Entity_ID',
  'Target_Graph_Object',
  'Source_Record',
  'Evidence_Basis',
  'Confidence',
  'Validation_Priority',
  'Validation_Status',
  'Recommended_Validation_Action',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureHypothesesSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    HYPOTHESES_SHEET,
    HYPOTHESES_HEADERS
  );
}

function sciipRunHypothesisGenerationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: HYPOTHESIS_GENERATION_PROCESSOR,
    action: 'HYPOTHESES_BUILD',
    sourceSheet: 'KNOWLEDGE_GRAPH_ENRICHMENT',
    targetSheet: HYPOTHESES_SHEET,
    ledgerSheet: 'HYPOTHESES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const enrichments = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('KNOWLEDGE_GRAPH_ENRICHMENT');
      const knowledgeGaps = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('KNOWLEDGE_GAPS');
      const strategicIntelligence = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('STRATEGIC_INTELLIGENCE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: enrichments.length + knowledgeGaps.length + strategicIntelligence.length,
        outputCount: enrichments.length || knowledgeGaps.length || strategicIntelligence.length || 1,
        summary: 'Hypothesis generation runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: HYPOTHESIS_GENERATION_PROCESSOR,
          inputSheets: [
            'KNOWLEDGE_GRAPH_ENRICHMENT',
            'KNOWLEDGE_GAPS',
            'STRATEGIC_INTELLIGENCE'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureHypothesesSchema();
      const hypothesisDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const hypothesisBusinessKey = 'HYPOTHESIS|' + hypothesisDate;

      if (sciipRuntimeBusinessKeyPrefixExists560_(definition.targetSheet, hypothesisBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: HYPOTHESIS_GENERATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            hypothesesCreated: 0,
            skippedDuplicate: 1,
            hypothesisBusinessKey: hypothesisBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const enrichments = sciipGetRuntimeRecordsByDate560_(
        'KNOWLEDGE_GRAPH_ENRICHMENT',
        'Enrichment_Date',
        hypothesisDate
      );
      const knowledgeGaps = sciipGetRuntimeRecordsByDate560_(
        'KNOWLEDGE_GAPS',
        'Gap_Date',
        hypothesisDate
      );
      const strategicIntelligence = sciipGetRuntimeRecordsByDate560_(
        'STRATEGIC_INTELLIGENCE',
        'Strategic_Intelligence_Date',
        hypothesisDate
      );

      if (enrichments.length === 0 && knowledgeGaps.length === 0 && strategicIntelligence.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: HYPOTHESIS_GENERATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            hypothesesCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const hypothesisRows = sciipCreateHypotheses560_({
        businessKey: hypothesisBusinessKey,
        hypothesisDate: hypothesisDate,
        enrichments: enrichments,
        knowledgeGaps: knowledgeGaps,
        strategicIntelligence: strategicIntelligence,
        processor: HYPOTHESIS_GENERATION_PROCESSOR
      });

      hypothesisRows.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: HYPOTHESIS_GENERATION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: hypothesisRows.length,
        recordsRead: enrichments.length + knowledgeGaps.length + strategicIntelligence.length,
        processed: hypothesisRows.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          enrichmentsReviewed: enrichments.length,
          knowledgeGapsReviewed: knowledgeGaps.length,
          strategicIntelligenceReviewed: strategicIntelligence.length,
          hypothesesCreated: hypothesisRows.length,
          skippedDuplicate: 0,
          hypothesisBusinessKey: hypothesisBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists560_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate560_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue560_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue560_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable560_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey560_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateHypotheses560_(args) {
  const now = new Date();

  const sourceRecords =
    args.enrichments.length > 0
      ? args.enrichments
      : args.knowledgeGaps.length > 0
        ? args.knowledgeGaps
        : args.strategicIntelligence;

  const rows = sourceRecords.map(record => {
    const enrichmentId = sciipExtractFirstAvailable560_(record, [
      'Enrichment_ID',
      'Knowledge_Graph_Enrichment_ID'
    ]);

    const knowledgeGapId = sciipExtractFirstAvailable560_(record, [
      'Knowledge_Gap_ID',
      'Gap_ID'
    ]);

    const strategicIntelligenceId = sciipExtractFirstAvailable560_(record, [
      'Strategic_Intelligence_ID',
      'Intelligence_ID'
    ]);

    const matchedGap = sciipFindKnowledgeGapById560_(
      args.knowledgeGaps,
      knowledgeGapId
    );

    const matchedStrategicIntelligence = sciipFindStrategicIntelligenceById560_(
      args.strategicIntelligence,
      strategicIntelligenceId
    );

    const profile = sciipInferHypothesisProfile560_(
      record,
      matchedGap,
      matchedStrategicIntelligence
    );

    const rowKey =
      `${args.businessKey}|${profile.hypothesisType}|${profile.targetEntityType}|${sciipNormalizeMissionKey560_(enrichmentId || knowledgeGapId || strategicIntelligenceId || profile.hypothesisTitle)}`;

    return [
      sciipGenerateId_('HYP'),
      rowKey,
      args.hypothesisDate,
      profile.hypothesisType,
      profile.hypothesisTitle,
      profile.hypothesisStatement,
      profile.testableQuestion,
      strategicIntelligenceId,
      knowledgeGapId,
      enrichmentId,
      profile.targetEntityType,
      profile.targetEntityId,
      profile.targetGraphObject,
      profile.sourceRecord,
      profile.evidenceBasis,
      profile.confidence,
      profile.validationPriority,
      'UNVALIDATED',
      profile.recommendedValidationAction,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateHypothesisRows560_(rows);
}

function sciipInferHypothesisProfile560_(record, gap, strategicIntelligence) {
  const combined = [
    sciipExtractFirstAvailable560_(record, [
      'Enrichment_Type',
      'Target_Entity_Type',
      'Target_Graph_Object',
      'Proposed_Node_Type',
      'Proposed_Edge_Type',
      'Proposed_Property_Update',
      'Enrichment_Rationale',
      'Source_Record'
    ]),
    sciipExtractFirstAvailable560_(gap, [
      'Entity_Type',
      'Gap_Category',
      'Missing_Fact',
      'Why_It_Matters',
      'Suggested_Data_Source',
      'Discovery_Source'
    ]),
    sciipExtractFirstAvailable560_(strategicIntelligence, [
      'Strategic_Theme',
      'Strategic_Intelligence_Summary',
      'Intelligence_Summary',
      'Signal_Type',
      'Recommended_Action'
    ])
  ].join(' ').toLowerCase();

  let hypothesisType = 'MARKET_HYPOTHESIS';
  let targetEntityType =
    sciipExtractFirstAvailable560_(record, ['Target_Entity_Type']) ||
    sciipExtractFirstAvailable560_(gap, ['Entity_Type']) ||
    'MARKET';

  let targetEntityId =
    sciipExtractFirstAvailable560_(record, ['Target_Entity_ID']) ||
    sciipExtractFirstAvailable560_(gap, ['Entity_ID']);

  let targetGraphObject =
    sciipExtractFirstAvailable560_(record, ['Target_Graph_Object']) ||
    'MARKET_INTELLIGENCE_GRAPH';

  let confidence =
    sciipExtractFirstAvailable560_(record, ['Confidence']) ||
    sciipExtractFirstAvailable560_(gap, ['Confidence']) ||
    'MEDIUM';

  let validationPriority = 'MEDIUM';

  if (
    combined.includes('property') ||
    combined.includes('asset') ||
    combined.includes('building') ||
    combined.includes('parcel') ||
    combined.includes('ownership') ||
    combined.includes('yard') ||
    combined.includes('power')
  ) {
    hypothesisType = 'PROPERTY_HYPOTHESIS';
    targetEntityType = 'PROPERTY';
    targetGraphObject = 'PROPERTY_KNOWLEDGE_GRAPH';
    validationPriority = 'HIGH';
  }

  if (
    combined.includes('company') ||
    combined.includes('tenant') ||
    combined.includes('occupier') ||
    combined.includes('supplier') ||
    combined.includes('oem') ||
    combined.includes('manufacturer')
  ) {
    hypothesisType = 'COMPANY_HYPOTHESIS';
    targetEntityType = 'COMPANY';
    targetGraphObject = 'COMPANY_KNOWLEDGE_GRAPH';
    validationPriority = 'HIGH';
  }

  if (
    combined.includes('risk') ||
    combined.includes('threat') ||
    combined.includes('constraint') ||
    combined.includes('exposure') ||
    combined.includes('delay') ||
    combined.includes('critical')
  ) {
    hypothesisType = 'RISK_HYPOTHESIS';
    targetGraphObject = 'RISK_INTELLIGENCE_GRAPH';
    validationPriority = 'HIGH';
    confidence = confidence === 'LOW' ? 'MEDIUM' : confidence;
  }

  if (
    combined.includes('opportunity') ||
    combined.includes('growth') ||
    combined.includes('expansion') ||
    combined.includes('demand') ||
    combined.includes('advantage') ||
    combined.includes('signal')
  ) {
    hypothesisType = 'OPPORTUNITY_HYPOTHESIS';
    targetGraphObject = 'OPPORTUNITY_INTELLIGENCE_GRAPH';
    validationPriority = 'HIGH';
  }

  if (
    combined.includes('workflow') ||
    combined.includes('automation') ||
    combined.includes('processor') ||
    combined.includes('pipeline') ||
    combined.includes('system') ||
    combined.includes('knowledge graph')
  ) {
    hypothesisType = 'OPERATING_SYSTEM_HYPOTHESIS';
    targetEntityType = 'SCIIP_SYSTEM';
    targetGraphObject = 'SCIIP_OPERATING_GRAPH';
    validationPriority = 'MEDIUM';
  }

  const evidenceBasis = sciipComposeHypothesisEvidenceBasis560_(
    record,
    gap,
    strategicIntelligence
  );

  const hypothesisTitle =
    sciipComposeHypothesisTitle560_(
      hypothesisType,
      targetEntityType,
      targetEntityId
    );

  return {
    hypothesisType,
    hypothesisTitle,
    hypothesisStatement: sciipComposeHypothesisStatement560_(
      hypothesisType,
      targetEntityType,
      targetEntityId,
      evidenceBasis
    ),
    testableQuestion: sciipComposeTestableQuestion560_(
      hypothesisType,
      targetEntityType,
      targetEntityId
    ),
    targetEntityType,
    targetEntityId,
    targetGraphObject,
    sourceRecord: sciipInferHypothesisSourceRecord560_(record, gap, strategicIntelligence),
    evidenceBasis,
    confidence,
    validationPriority,
    recommendedValidationAction:
      sciipRecommendHypothesisValidationAction560_(hypothesisType)
  };
}

function sciipComposeHypothesisTitle560_(type, entityType, entityId) {
  const subject = entityId || entityType || 'MARKET_SIGNAL';
  return `${type}: ${subject}`;
}

function sciipComposeHypothesisStatement560_(type, entityType, entityId, evidenceBasis) {
  const subject = entityId || entityType || 'the observed market signal';

  return `SCIIP hypothesizes that ${subject} represents a testable ${type.toLowerCase().replace(/_/g, ' ')} based on linked intelligence, knowledge gaps, and graph enrichment evidence.\n\nEvidence basis: ${evidenceBasis}`;
}

function sciipComposeTestableQuestion560_(type, entityType, entityId) {
  const subject = entityId || entityType || 'this signal';

  if (type === 'PROPERTY_HYPOTHESIS') {
    return `Can property-level evidence confirm that ${subject} has materially relevant industrial market characteristics?`;
  }

  if (type === 'COMPANY_HYPOTHESIS') {
    return `Can company-level evidence confirm that ${subject} has a current or emerging real estate requirement?`;
  }

  if (type === 'RISK_HYPOTHESIS') {
    return `Can additional evidence confirm that ${subject} presents a measurable market, property, company, or operating risk?`;
  }

  if (type === 'OPPORTUNITY_HYPOTHESIS') {
    return `Can additional evidence confirm that ${subject} represents an actionable industrial market opportunity?`;
  }

  if (type === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return `Can SCIIP workflow evidence confirm that ${subject} should change processor logic, graph structure, or operating behavior?`;
  }

  return `Can additional market evidence confirm that ${subject} reflects a broader industrial market pattern?`;
}

function sciipComposeHypothesisEvidenceBasis560_(record, gap, strategicIntelligence) {
  const parts = [];

  const enrichmentRationale = sciipExtractFirstAvailable560_(record, [
    'Enrichment_Rationale'
  ]);

  const proposedUpdate = sciipExtractFirstAvailable560_(record, [
    'Proposed_Property_Update'
  ]);

  const missingFact = sciipExtractFirstAvailable560_(gap, [
    'Missing_Fact'
  ]);

  const whyItMatters = sciipExtractFirstAvailable560_(gap, [
    'Why_It_Matters'
  ]);

  const strategicSummary = sciipExtractFirstAvailable560_(strategicIntelligence, [
    'Strategic_Intelligence_Summary',
    'Intelligence_Summary',
    'Strategic_Theme'
  ]);

  if (enrichmentRationale) {
    parts.push(`Graph enrichment rationale: ${enrichmentRationale}`);
  }

  if (proposedUpdate) {
    parts.push(`Proposed graph update: ${proposedUpdate}`);
  }

  if (missingFact) {
    parts.push(`Knowledge gap: ${missingFact}`);
  }

  if (whyItMatters) {
    parts.push(`Why it matters: ${whyItMatters}`);
  }

  if (strategicSummary) {
    parts.push(`Strategic intelligence: ${strategicSummary}`);
  }

  if (parts.length === 0) {
    parts.push(
      'SCIIP identified a connected intelligence signal requiring hypothesis testing.'
    );
  }

  return parts.join('\n');
}

function sciipInferHypothesisSourceRecord560_(record, gap, strategicIntelligence) {
  const enrichmentId = sciipExtractFirstAvailable560_(record, [
    'Enrichment_ID'
  ]);

  if (enrichmentId) {
    return `KNOWLEDGE_GRAPH_ENRICHMENT:${enrichmentId}`;
  }

  const gapId = sciipExtractFirstAvailable560_(gap, [
    'Knowledge_Gap_ID',
    'Gap_ID'
  ]);

  if (gapId) {
    return `KNOWLEDGE_GAPS:${gapId}`;
  }

  const strategicId = sciipExtractFirstAvailable560_(strategicIntelligence, [
    'Strategic_Intelligence_ID',
    'Intelligence_ID'
  ]);

  if (strategicId) {
    return `STRATEGIC_INTELLIGENCE:${strategicId}`;
  }

  return 'UNKNOWN_SOURCE_RECORD';
}

function sciipRecommendHypothesisValidationAction560_(type) {
  if (type === 'PROPERTY_HYPOTHESIS') {
    return 'Validate against asset registry, property events, GIS attributes, ownership facts, tenant signals, power, yard, and availability evidence.';
  }

  if (type === 'COMPANY_HYPOTHESIS') {
    return 'Validate through company research, funding events, hiring signals, permits, supplier relationships, OEM linkages, and occupier movement.';
  }

  if (type === 'RISK_HYPOTHESIS') {
    return 'Validate through counterevidence, timing risk, regulatory constraints, vacancy exposure, tenant exposure, and market weakness signals.';
  }

  if (type === 'OPPORTUNITY_HYPOTHESIS') {
    return 'Validate through demand signals, ownership fit, tenant movement, pricing gaps, supply constraints, and market timing.';
  }

  if (type === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return 'Validate through processor outputs, duplicate patterns, missing fields, workflow friction, graph incompleteness, and operator feedback.';
  }

  return 'Validate against recent lease, sale, availability, tenant, capital markets, and absorption signals.';
}

function sciipFindKnowledgeGapById560_(knowledgeGaps, knowledgeGapId) {
  if (!knowledgeGapId) return null;

  return knowledgeGaps.find(gap =>
    sciipExtractFirstAvailable560_(gap, [
      'Knowledge_Gap_ID',
      'Gap_ID',
      'ID'
    ]) === knowledgeGapId
  ) || null;
}

function sciipFindStrategicIntelligenceById560_(strategicIntelligence, strategicIntelligenceId) {
  if (!strategicIntelligenceId) return null;

  return strategicIntelligence.find(intelligence =>
    sciipExtractFirstAvailable560_(intelligence, [
      'Strategic_Intelligence_ID',
      'Intelligence_ID',
      'ID'
    ]) === strategicIntelligenceId
  ) || null;
}

function sciipDeduplicateHypothesisRows560_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}


function sciipTestHypothesisGenerationProcessor() {
  const result = sciipRunHypothesisGenerationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestHypothesisGenerationProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 570_HypothesisValidationPlanningProcessor
 *
 * HYPOTHESES → HYPOTHESIS_VALIDATION_PLANS
 *
 * Migration note:
 * Preserves original 570 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR = '570_HypothesisValidationPlanningProcessor';
const HYPOTHESIS_VALIDATION_PLANS_SHEET = 'HYPOTHESIS_VALIDATION_PLANS';

const HYPOTHESIS_VALIDATION_PLANS_HEADERS = [
  'Validation_Plan_ID',
  'Business_Key',
  'Plan_Date',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Hypothesis_Title',
  'Validation_Objective',
  'Validation_Method',
  'Evidence_Required',
  'Primary_Data_Source',
  'Secondary_Data_Source',
  'Validation_Priority',
  'Expected_Output',
  'Decision_Rule',
  'Confidence_Threshold',
  'Assigned_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureHypothesisValidationPlansSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    HYPOTHESIS_VALIDATION_PLANS_SHEET,
    HYPOTHESIS_VALIDATION_PLANS_HEADERS
  );
}

function sciipRunHypothesisValidationPlanningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR,
    action: 'HYPOTHESIS_VALIDATION_PLANS_BUILD',
    sourceSheet: 'HYPOTHESES',
    targetSheet: HYPOTHESIS_VALIDATION_PLANS_SHEET,
    ledgerSheet: 'HYPOTHESIS_VALIDATION_PLANS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const hypotheses = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('HYPOTHESES');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: hypotheses.length,
        outputCount: hypotheses.length || 1,
        summary: 'Hypothesis validation planning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR,
          inputSheets: ['HYPOTHESES']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureHypothesisValidationPlansSchema();
      const planDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const validationPlanBusinessKey = 'HYPOTHESIS_VALIDATION_PLAN|' + planDate;

      if (sciipRuntimeBusinessKeyPrefixExists570_(definition.targetSheet, validationPlanBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            validationPlansCreated: 0,
            skippedDuplicate: 1,
            validationPlanBusinessKey: validationPlanBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const hypotheses = sciipGetRuntimeRecordsByDate570_(
        'HYPOTHESES',
        'Hypothesis_Date',
        planDate
      );

      if (hypotheses.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            hypothesesReviewed: 0,
            validationPlansCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const plans = sciipCreateHypothesisValidationPlans570_({
        businessKey: validationPlanBusinessKey,
        planDate: planDate,
        hypotheses: hypotheses,
        processor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR
      });

      plans.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: plans.length,
        recordsRead: hypotheses.length,
        processed: plans.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          hypothesesReviewed: hypotheses.length,
          validationPlansCreated: plans.length,
          skippedDuplicate: 0,
          validationPlanBusinessKey: validationPlanBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists570_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate570_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue570_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue570_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable570_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey570_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateHypothesisValidationPlans570_(args) {
  const now = new Date();

  const rows = args.hypotheses.map(function(hypothesis) {
    const hypothesisId = sciipExtractFirstAvailable570_(hypothesis, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable570_(hypothesis, [
      'Hypothesis_Type'
    ]);

    const profile = sciipInferHypothesisValidationPlanProfile570_(hypothesis);

    const rowKey =
      args.businessKey + '|' + hypothesisType + '|' +
      sciipNormalizeMissionKey570_(hypothesisId || profile.validationObjective);

    return [
      sciipGenerateId_('HVP'),
      rowKey,
      args.planDate,
      hypothesisId,
      hypothesisType,
      sciipExtractFirstAvailable570_(hypothesis, ['Hypothesis_Title']),
      profile.validationObjective,
      profile.validationMethod,
      profile.evidenceRequired,
      profile.primaryDataSource,
      profile.secondaryDataSource,
      profile.validationPriority,
      profile.expectedOutput,
      profile.decisionRule,
      profile.confidenceThreshold,
      'PENDING_VALIDATION',
      'HYPOTHESES:' + hypothesisId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateHypothesisValidationPlanRows570_(rows);
}

function sciipInferHypothesisValidationPlanProfile570_(hypothesis) {
  const hypothesisType = sciipExtractFirstAvailable570_(hypothesis, [
    'Hypothesis_Type'
  ]);

  const priority =
    sciipExtractFirstAvailable570_(hypothesis, [
      'Validation_Priority'
    ]) || 'MEDIUM';

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    return {
      validationObjective:
        'Determine whether property-level evidence supports or rejects the hypothesis.',
      validationMethod:
        'Review asset registry, property events, GIS attributes, ownership facts, tenant activity, building characteristics, and broker-observed evidence.',
      evidenceRequired:
        'Verified property facts, current availability, ownership, tenant movement, physical attributes, power, yard, access, lease/sale activity, and market comparables.',
      primaryDataSource:
        'PROPERTY_REGISTRY; PROPERTY_EVENTS; ASSET_NODE; GIS_DATA',
      secondaryDataSource:
        'Broker notes; AIR CRE data; public records; listing materials',
      validationPriority: priority,
      expectedOutput:
        'Validated property hypothesis with supporting evidence, counterevidence, and recommended next action.',
      decisionRule:
        'Validate if two or more independent property-level evidence sources support the hypothesis and no material counterevidence invalidates it.',
      confidenceThreshold: 'MEDIUM_OR_HIGH'
    };
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    return {
      validationObjective:
        'Determine whether company-level evidence supports or rejects the hypothesis.',
      validationMethod:
        'Review company activity, funding, hiring, permits, supplier relationships, OEM linkages, expansion indicators, and occupier movement.',
      evidenceRequired:
        'Company growth signals, operational footprint, real estate requirement indicators, funding events, hiring signals, facility movement, and relevant market activity.',
      primaryDataSource:
        'COMPANY_INTELLIGENCE; RESEARCH_MISSIONS; KNOWLEDGE_GRAPH_ENRICHMENT',
      secondaryDataSource:
        'Company website; news; permits; LinkedIn; broker intelligence',
      validationPriority: priority,
      expectedOutput:
        'Validated company hypothesis with likely requirement, timing, confidence, and recommended pursuit action.',
      decisionRule:
        'Validate if company activity indicates current or emerging industrial real estate demand.',
      confidenceThreshold: 'MEDIUM_OR_HIGH'
    };
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    return {
      validationObjective:
        'Determine whether measurable risk exists and whether the risk affects a property, company, market, or SCIIP workflow.',
      validationMethod:
        'Review counterevidence, negative indicators, timing risk, vacancy exposure, tenant exposure, regulatory constraints, and market weakness signals.',
      evidenceRequired:
        'Risk indicators, affected entities, severity, timing, source confidence, counterevidence, and mitigation path.',
      primaryDataSource:
        'RISK_INTELLIGENCE_GRAPH; PROPERTY_EVENTS; STRATEGIC_INTELLIGENCE',
      secondaryDataSource:
        'Market reports; public records; broker intelligence; operator notes',
      validationPriority: 'HIGH',
      expectedOutput:
        'Validated risk assessment with severity, affected entities, and mitigation recommendation.',
      decisionRule:
        'Validate if risk is supported by credible evidence and has material impact on market, property, company, or system behavior.',
      confidenceThreshold: 'MEDIUM_OR_HIGH'
    };
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    return {
      validationObjective:
        'Determine whether the hypothesis represents an actionable industrial market opportunity.',
      validationMethod:
        'Review demand signals, ownership fit, tenant movement, pricing gaps, supply constraints, timing, and competitive position.',
      evidenceRequired:
        'Demand evidence, actionable target, timing signal, property/company fit, market gap, and pursuit rationale.',
      primaryDataSource:
        'OPPORTUNITY_INTELLIGENCE_GRAPH; STRATEGIC_INTELLIGENCE; HYPOTHESES',
      secondaryDataSource:
        'Broker intelligence; listing data; tenant activity; ownership research',
      validationPriority: 'HIGH',
      expectedOutput:
        'Validated opportunity with target, timing, confidence, and recommended action path.',
      decisionRule:
        'Validate if the opportunity has clear target relevance, market timing, and supporting evidence sufficient for action.',
      confidenceThreshold: 'MEDIUM_OR_HIGH'
    };
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return {
      validationObjective:
        'Determine whether SCIIP workflow evidence supports a change to processor logic, graph structure, or operating behavior.',
      validationMethod:
        'Review processor outputs, duplicate patterns, missing fields, workflow friction, graph incompleteness, operator feedback, and automation readiness.',
      evidenceRequired:
        'System logs, processor results, skipped records, duplicate records, missing fields, graph gaps, and operator-observed friction.',
      primaryDataSource:
        'SYSTEM_HEALTH; PROCESSOR_LOGS; KNOWLEDGE_GRAPH_ENRICHMENT',
      secondaryDataSource:
        'Operator console; command center; daily reports',
      validationPriority: priority,
      expectedOutput:
        'Validated system improvement hypothesis with recommended processor, schema, graph, or workflow change.',
      decisionRule:
        'Validate if repeated system evidence shows that SCIIP behavior should be improved or automated.',
      confidenceThreshold: 'MEDIUM_OR_HIGH'
    };
  }

  return {
    validationObjective:
      'Determine whether market evidence supports or rejects the hypothesis.',
    validationMethod:
      'Review recent lease, sale, availability, tenant, capital markets, pricing, absorption, and broker-observed market evidence.',
    evidenceRequired:
      'Market signals, comparable activity, tenant demand, supply constraints, pricing movement, and counterevidence.',
    primaryDataSource:
      'STRATEGIC_INTELLIGENCE; HYPOTHESES; MARKET_SIGNALS',
    secondaryDataSource:
      'AIR CRE data; broker intelligence; market reports; listing data',
    validationPriority: priority,
    expectedOutput:
      'Validated market hypothesis with supporting evidence, confidence, and recommended next action.',
    decisionRule:
      'Validate if market evidence supports the hypothesis across multiple independent signals.',
    confidenceThreshold: 'MEDIUM_OR_HIGH'
  };
}


function sciipDeduplicateHypothesisValidationPlanRows570_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(function(row) {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestHypothesisValidationPlanningProcessor() {
  const result = sciipRunHypothesisValidationPlanningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestHypothesisValidationPlanningProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 580_EvidenceCollectionProcessor
 *
 * HYPOTHESIS_VALIDATION_PLANS → EVIDENCE_COLLECTION_TASKS
 *
 * Migration note:
 * Preserves original 580 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const EVIDENCE_COLLECTION_PROCESSOR = '580_EvidenceCollectionProcessor';
const EVIDENCE_COLLECTION_TASKS_SHEET = 'EVIDENCE_COLLECTION_TASKS';

const EVIDENCE_COLLECTION_TASKS_HEADERS = [
  'Evidence_Task_ID',
  'Business_Key',
  'Task_Date',
  'Validation_Plan_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Evidence_Task_Type',
  'Evidence_Objective',
  'Evidence_Required',
  'Primary_Data_Source',
  'Secondary_Data_Source',
  'Collection_Method',
  'Collection_Priority',
  'Expected_Evidence_Output',
  'Evidence_Status',
  'Assigned_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureEvidenceCollectionTasksSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    EVIDENCE_COLLECTION_TASKS_SHEET,
    EVIDENCE_COLLECTION_TASKS_HEADERS
  );
}

function sciipRunEvidenceCollectionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: EVIDENCE_COLLECTION_PROCESSOR,
    action: 'EVIDENCE_COLLECTION_TASKS_BUILD',
    sourceSheet: 'HYPOTHESIS_VALIDATION_PLANS',
    targetSheet: EVIDENCE_COLLECTION_TASKS_SHEET,
    ledgerSheet: 'EVIDENCE_COLLECTION_TASKS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const validationPlans = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('HYPOTHESIS_VALIDATION_PLANS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: validationPlans.length,
        outputCount: validationPlans.length || 1,
        summary: 'Evidence collection runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: EVIDENCE_COLLECTION_PROCESSOR,
          inputSheets: ['HYPOTHESIS_VALIDATION_PLANS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureEvidenceCollectionTasksSchema();
      const taskDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const evidenceTaskBusinessKey = 'EVIDENCE_COLLECTION_TASK|' + taskDate;

      if (sciipRuntimeBusinessKeyPrefixExists580_(definition.targetSheet, evidenceTaskBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: EVIDENCE_COLLECTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            evidenceTasksCreated: 0,
            skippedDuplicate: 1,
            evidenceTaskBusinessKey: evidenceTaskBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const validationPlans = sciipGetRuntimeRecordsByDate580_(
        'HYPOTHESIS_VALIDATION_PLANS',
        'Plan_Date',
        taskDate
      );

      if (validationPlans.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: EVIDENCE_COLLECTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            validationPlansReviewed: 0,
            evidenceTasksCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const tasks = sciipCreateEvidenceCollectionTasks580_({
        businessKey: evidenceTaskBusinessKey,
        taskDate: taskDate,
        validationPlans: validationPlans,
        processor: EVIDENCE_COLLECTION_PROCESSOR
      });

      tasks.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: EVIDENCE_COLLECTION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: tasks.length,
        recordsRead: validationPlans.length,
        processed: tasks.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          validationPlansReviewed: validationPlans.length,
          evidenceTasksCreated: tasks.length,
          skippedDuplicate: 0,
          evidenceTaskBusinessKey: evidenceTaskBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists580_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate580_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue580_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue580_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable580_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey580_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateEvidenceCollectionTasks580_(args) {
  const now = new Date();

  const rows = args.validationPlans.map(function(plan) {
    const validationPlanId = sciipExtractFirstAvailable580_(plan, [
      'Validation_Plan_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable580_(plan, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable580_(plan, [
      'Hypothesis_Type'
    ]);

    const profile = sciipInferEvidenceCollectionProfile580_(plan);

    const rowKey =
      args.businessKey + '|' + hypothesisType + '|' +
      sciipNormalizeMissionKey580_(validationPlanId || hypothesisId || profile.evidenceObjective);

    return [
      sciipGenerateId_('ECT'),
      rowKey,
      args.taskDate,
      validationPlanId,
      hypothesisId,
      hypothesisType,
      profile.evidenceTaskType,
      profile.evidenceObjective,
      profile.evidenceRequired,
      profile.primaryDataSource,
      profile.secondaryDataSource,
      profile.collectionMethod,
      profile.collectionPriority,
      profile.expectedEvidenceOutput,
      'NOT_COLLECTED',
      'PENDING_COLLECTION',
      'HYPOTHESIS_VALIDATION_PLANS:' + validationPlanId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateEvidenceCollectionTaskRows580_(rows);
}

function sciipInferEvidenceCollectionProfile580_(plan) {
  const hypothesisType = sciipExtractFirstAvailable580_(plan, [
    'Hypothesis_Type'
  ]);

  const validationPriority =
    sciipExtractFirstAvailable580_(plan, [
      'Validation_Priority'
    ]) || 'MEDIUM';

  const evidenceRequired =
    sciipExtractFirstAvailable580_(plan, [
      'Evidence_Required'
    ]);

  const primaryDataSource =
    sciipExtractFirstAvailable580_(plan, [
      'Primary_Data_Source'
    ]);

  const secondaryDataSource =
    sciipExtractFirstAvailable580_(plan, [
      'Secondary_Data_Source'
    ]);

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    return {
      evidenceTaskType: 'PROPERTY_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect property-level evidence required to validate or reject the hypothesis.',
      evidenceRequired: evidenceRequired,
      primaryDataSource: primaryDataSource,
      secondaryDataSource: secondaryDataSource,
      collectionMethod:
        'Query property registry, property events, asset nodes, GIS attributes, ownership records, availability data, and broker notes.',
      collectionPriority: validationPriority,
      expectedEvidenceOutput:
        'Structured property evidence packet with supporting facts, counterevidence, source records, and confidence notes.'
    };
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    return {
      evidenceTaskType: 'COMPANY_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect company-level evidence required to validate or reject the hypothesis.',
      evidenceRequired: evidenceRequired,
      primaryDataSource: primaryDataSource,
      secondaryDataSource: secondaryDataSource,
      collectionMethod:
        'Research company activity, funding, hiring, permits, facility footprint, supplier relationships, OEM linkages, and occupier movement.',
      collectionPriority: validationPriority,
      expectedEvidenceOutput:
        'Structured company evidence packet with growth indicators, real estate signals, timing indicators, and confidence notes.'
    };
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    return {
      evidenceTaskType: 'RISK_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect evidence needed to measure risk severity, affected entities, timing, and counterevidence.',
      evidenceRequired: evidenceRequired,
      primaryDataSource: primaryDataSource,
      secondaryDataSource: secondaryDataSource,
      collectionMethod:
        'Review negative indicators, counterevidence, market weakness, vacancy exposure, tenant exposure, regulatory constraints, and timing risk.',
      collectionPriority: 'HIGH',
      expectedEvidenceOutput:
        'Structured risk evidence packet with risk severity, affected entities, timing, mitigation path, and confidence notes.'
    };
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    return {
      evidenceTaskType: 'OPPORTUNITY_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect evidence needed to determine whether the hypothesis represents an actionable opportunity.',
      evidenceRequired: evidenceRequired,
      primaryDataSource: primaryDataSource,
      secondaryDataSource: secondaryDataSource,
      collectionMethod:
        'Review demand signals, target fit, ownership fit, tenant activity, pricing gaps, competitive supply, and timing evidence.',
      collectionPriority: 'HIGH',
      expectedEvidenceOutput:
        'Structured opportunity evidence packet with actionable target, timing, rationale, confidence, and recommended pursuit path.'
    };
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return {
      evidenceTaskType: 'SYSTEM_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect SCIIP operating evidence needed to validate or reject the system improvement hypothesis.',
      evidenceRequired: evidenceRequired,
      primaryDataSource: primaryDataSource,
      secondaryDataSource: secondaryDataSource,
      collectionMethod:
        'Review processor logs, system health records, skipped records, duplicates, missing fields, graph gaps, workflow friction, and operator feedback.',
      collectionPriority: validationPriority,
      expectedEvidenceOutput:
        'Structured system evidence packet with processor evidence, workflow evidence, graph evidence, and recommended system improvement.'
    };
  }

  return {
    evidenceTaskType: 'MARKET_EVIDENCE_COLLECTION',
    evidenceObjective:
      'Collect market evidence required to validate or reject the hypothesis.',
    evidenceRequired: evidenceRequired,
    primaryDataSource: primaryDataSource,
    secondaryDataSource: secondaryDataSource,
    collectionMethod:
      'Review recent lease, sale, availability, tenant, pricing, absorption, capital markets, and broker-observed market signals.',
    collectionPriority: validationPriority,
    expectedEvidenceOutput:
      'Structured market evidence packet with supporting signals, counterevidence, source records, and confidence notes.'
  };
}

function sciipDeduplicateEvidenceCollectionTaskRows580_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(function(row) {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestEvidenceCollectionProcessor() {
  const result = sciipRunEvidenceCollectionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestEvidenceCollectionProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 590_EvidenceAssessmentProcessor
 *
 * EVIDENCE_COLLECTION_TASKS → EVIDENCE_ASSESSMENTS
 *
 * Migration note:
 * Preserves original 590 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const EVIDENCE_ASSESSMENT_PROCESSOR = '590_EvidenceAssessmentProcessor';
const EVIDENCE_ASSESSMENTS_SHEET = 'EVIDENCE_ASSESSMENTS';

const EVIDENCE_ASSESSMENTS_HEADERS = [
  'Evidence_Assessment_ID',
  'Business_Key',
  'Assessment_Date',
  'Evidence_Task_ID',
  'Validation_Plan_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Assessment_Type',
  'Assessment_Objective',
  'Evidence_Reviewed',
  'Supporting_Evidence',
  'Counter_Evidence',
  'Evidence_Gaps',
  'Assessment_Finding',
  'Validation_Implication',
  'Assessment_Confidence',
  'Recommended_Next_Action',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureEvidenceAssessmentsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    EVIDENCE_ASSESSMENTS_SHEET,
    EVIDENCE_ASSESSMENTS_HEADERS
  );
}

function sciipRunEvidenceAssessmentProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: EVIDENCE_ASSESSMENT_PROCESSOR,
    action: 'EVIDENCE_ASSESSMENTS_BUILD',
    sourceSheet: 'EVIDENCE_COLLECTION_TASKS',
    targetSheet: EVIDENCE_ASSESSMENTS_SHEET,
    ledgerSheet: 'EVIDENCE_ASSESSMENTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const evidenceTasks = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('EVIDENCE_COLLECTION_TASKS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: evidenceTasks.length,
        outputCount: evidenceTasks.length || 1,
        summary: 'Evidence assessment runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: EVIDENCE_ASSESSMENT_PROCESSOR,
          inputSheets: ['EVIDENCE_COLLECTION_TASKS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureEvidenceAssessmentsSchema();
      const assessmentDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const evidenceAssessmentBusinessKey = 'EVIDENCE_ASSESSMENT|' + assessmentDate;

      if (sciipRuntimeBusinessKeyPrefixExists590_(definition.targetSheet, evidenceAssessmentBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: EVIDENCE_ASSESSMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            evidenceAssessmentsCreated: 0,
            skippedDuplicate: 1,
            evidenceAssessmentBusinessKey: evidenceAssessmentBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const evidenceTasks = sciipGetRuntimeRecordsByDate590_(
        'EVIDENCE_COLLECTION_TASKS',
        'Task_Date',
        assessmentDate
      );

      if (evidenceTasks.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: EVIDENCE_ASSESSMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            evidenceTasksReviewed: 0,
            evidenceAssessmentsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const assessments = sciipCreateEvidenceAssessments590_({
        businessKey: evidenceAssessmentBusinessKey,
        assessmentDate: assessmentDate,
        evidenceTasks: evidenceTasks,
        processor: EVIDENCE_ASSESSMENT_PROCESSOR
      });

      assessments.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: EVIDENCE_ASSESSMENT_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: assessments.length,
        recordsRead: evidenceTasks.length,
        processed: assessments.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          evidenceTasksReviewed: evidenceTasks.length,
          evidenceAssessmentsCreated: assessments.length,
          skippedDuplicate: 0,
          evidenceAssessmentBusinessKey: evidenceAssessmentBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists590_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate590_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue590_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue590_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable590_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey590_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateEvidenceAssessments590_(args) {
  const now = new Date();

  const rows = args.evidenceTasks.map(task => {
    const evidenceTaskId = sciipExtractFirstAvailable590_(task, [
      'Evidence_Task_ID'
    ]);

    const validationPlanId = sciipExtractFirstAvailable590_(task, [
      'Validation_Plan_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable590_(task, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable590_(task, [
      'Hypothesis_Type'
    ]);

    const profile =
      sciipInferEvidenceAssessmentProfile590_(task);

    const rowKey =
      `${args.businessKey}|${hypothesisType}|${sciipNormalizeMissionKey590_(evidenceTaskId || validationPlanId || hypothesisId || profile.assessmentObjective)}`;

    return [
      sciipGenerateId_('EVA'),
      rowKey,
      args.assessmentDate,
      evidenceTaskId,
      validationPlanId,
      hypothesisId,
      hypothesisType,
      profile.assessmentType,
      profile.assessmentObjective,
      profile.evidenceReviewed,
      profile.supportingEvidence,
      profile.counterEvidence,
      profile.evidenceGaps,
      profile.assessmentFinding,
      profile.validationImplication,
      profile.assessmentConfidence,
      profile.recommendedNextAction,
      `EVIDENCE_COLLECTION_TASKS:${evidenceTaskId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateEvidenceAssessmentRows590_(rows);
}

function sciipInferEvidenceAssessmentProfile590_(task) {
  const hypothesisType = sciipExtractFirstAvailable590_(task, [
    'Hypothesis_Type'
  ]);

  const evidenceTaskType = sciipExtractFirstAvailable590_(task, [
    'Evidence_Task_Type'
  ]);

  const evidenceRequired = sciipExtractFirstAvailable590_(task, [
    'Evidence_Required'
  ]);

  const primaryDataSource = sciipExtractFirstAvailable590_(task, [
    'Primary_Data_Source'
  ]);

  const secondaryDataSource = sciipExtractFirstAvailable590_(task, [
    'Secondary_Data_Source'
  ]);

  const expectedOutput = sciipExtractFirstAvailable590_(task, [
    'Expected_Evidence_Output'
  ]);

  const collectionPriority =
    sciipExtractFirstAvailable590_(task, [
      'Collection_Priority'
    ]) || 'MEDIUM';

  const evidenceReviewed =
    `Evidence task reviewed: ${evidenceTaskType || 'GENERAL_EVIDENCE_COLLECTION'}\n` +
    `Evidence required: ${evidenceRequired || 'No specific evidence requirement recorded.'}\n` +
    `Primary source: ${primaryDataSource || 'Not specified.'}\n` +
    `Secondary source: ${secondaryDataSource || 'Not specified.'}`;

  let assessmentType = 'MARKET_EVIDENCE_ASSESSMENT';
  let assessmentObjective =
    'Assess whether collected or requested market evidence is sufficient to advance hypothesis validation.';
  let supportingEvidence =
    'Evidence collection task defines the required market evidence, sources, and expected output needed for validation.';
  let counterEvidence =
    'No counterevidence has been collected by this processor. Counterevidence remains pending until source-specific collection is completed.';
  let evidenceGaps =
    'Actual source-level evidence has not yet been attached. Additional collection is required before final validation.';
  let assessmentFinding =
    'EVIDENCE_REQUIREMENTS_DEFINED';
  let validationImplication =
    'READY_FOR_PRELIMINARY_VALIDATION_REVIEW';
  let assessmentConfidence =
    collectionPriority === 'HIGH' ? 'MEDIUM' : 'LOW';
  let recommendedNextAction =
    'Collect source-specific evidence and compare supporting evidence against counterevidence before final validation.';

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    assessmentType = 'PROPERTY_EVIDENCE_ASSESSMENT';
    assessmentObjective =
      'Assess whether property-level evidence requirements are sufficient to validate the property hypothesis.';
    supportingEvidence =
      'The task identifies property registry, property events, GIS attributes, ownership, tenant activity, physical characteristics, and broker evidence as required inputs.';
    recommendedNextAction =
      'Gather property facts, GIS attributes, ownership records, availability status, tenant signals, and comparable market evidence.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    assessmentType = 'COMPANY_EVIDENCE_ASSESSMENT';
    assessmentObjective =
      'Assess whether company-level evidence requirements are sufficient to validate the company hypothesis.';
    supportingEvidence =
      'The task identifies company activity, funding, hiring, permits, facility footprint, OEM relationships, supplier linkages, and occupier movement as required inputs.';
    recommendedNextAction =
      'Gather company growth signals, footprint evidence, hiring/funding indicators, permit activity, and real estate movement evidence.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    assessmentType = 'RISK_EVIDENCE_ASSESSMENT';
    assessmentObjective =
      'Assess whether risk evidence requirements are sufficient to measure severity, timing, affected entities, and mitigation pathway.';
    supportingEvidence =
      'The task identifies negative indicators, counterevidence, vacancy exposure, tenant exposure, regulatory constraints, timing risk, and market weakness as required inputs.';
    validationImplication =
      'HIGH_PRIORITY_VALIDATION_REVIEW_REQUIRED';
    assessmentConfidence = 'MEDIUM';
    recommendedNextAction =
      'Collect source-specific risk evidence and determine severity, timing, affected entities, and mitigation options.';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    assessmentType = 'OPPORTUNITY_EVIDENCE_ASSESSMENT';
    assessmentObjective =
      'Assess whether opportunity evidence requirements are sufficient to determine actionability.';
    supportingEvidence =
      'The task identifies demand signals, target fit, ownership fit, tenant movement, pricing gaps, competitive supply, and timing evidence as required inputs.';
    validationImplication =
      'HIGH_PRIORITY_VALIDATION_REVIEW_REQUIRED';
    assessmentConfidence = 'MEDIUM';
    recommendedNextAction =
      'Collect demand evidence, target fit evidence, timing indicators, ownership fit, and pursuit rationale.';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    assessmentType = 'SYSTEM_EVIDENCE_ASSESSMENT';
    assessmentObjective =
      'Assess whether SCIIP operating evidence requirements are sufficient to validate a system improvement hypothesis.';
    supportingEvidence =
      'The task identifies processor logs, system health records, skipped records, duplicates, missing fields, graph gaps, workflow friction, and operator feedback as required inputs.';
    recommendedNextAction =
      'Gather processor logs, skipped/duplicate patterns, missing field evidence, graph incompleteness evidence, and operator feedback.';
  }

  return {
    assessmentType,
    assessmentObjective,
    evidenceReviewed,
    supportingEvidence,
    counterEvidence,
    evidenceGaps,
    assessmentFinding,
    validationImplication,
    assessmentConfidence,
    recommendedNextAction
  };
}

function sciipDeduplicateEvidenceAssessmentRows590_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}


function sciipTestEvidenceAssessmentProcessor() {
  const result = sciipRunEvidenceAssessmentProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestEvidenceAssessmentProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 600_HypothesisValidationDecisionProcessor
 *
 * EVIDENCE_ASSESSMENTS → HYPOTHESIS_VALIDATION_DECISIONS
 *
 * Migration note:
 * Preserves original 600 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const HYPOTHESIS_VALIDATION_DECISION_PROCESSOR = '600_HypothesisValidationDecisionProcessor';
const HYPOTHESIS_VALIDATION_DECISIONS_SHEET = 'HYPOTHESIS_VALIDATION_DECISIONS';

const HYPOTHESIS_VALIDATION_DECISIONS_HEADERS = [
  'Validation_Decision_ID',
  'Business_Key',
  'Decision_Date',
  'Evidence_Assessment_ID',
  'Evidence_Task_ID',
  'Validation_Plan_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Validation_Decision',
  'Decision_Rationale',
  'Supporting_Evidence',
  'Counter_Evidence',
  'Evidence_Gaps',
  'Decision_Confidence',
  'Validation_Status',
  'Recommended_Next_Action',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureHypothesisValidationDecisionsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    HYPOTHESIS_VALIDATION_DECISIONS_SHEET,
    HYPOTHESIS_VALIDATION_DECISIONS_HEADERS
  );
}

function sciipRunHypothesisValidationDecisionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR,
    action: 'HYPOTHESIS_VALIDATION_DECISIONS_BUILD',
    sourceSheet: 'EVIDENCE_ASSESSMENTS',
    targetSheet: HYPOTHESIS_VALIDATION_DECISIONS_SHEET,
    ledgerSheet: 'HYPOTHESIS_VALIDATION_DECISIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const evidenceAssessments = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('EVIDENCE_ASSESSMENTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: evidenceAssessments.length,
        outputCount: evidenceAssessments.length || 1,
        summary: 'Hypothesis validation decision runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR,
          inputSheets: ['EVIDENCE_ASSESSMENTS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureHypothesisValidationDecisionsSchema();
      const decisionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const validationDecisionBusinessKey = 'HYPOTHESIS_VALIDATION_DECISION|' + decisionDate;

      if (sciipRuntimeBusinessKeyPrefixExists600_(definition.targetSheet, validationDecisionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            validationDecisionsCreated: 0,
            skippedDuplicate: 1,
            validationDecisionBusinessKey: validationDecisionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const evidenceAssessments = sciipGetRuntimeRecordsByDate600_(
        'EVIDENCE_ASSESSMENTS',
        'Assessment_Date',
        decisionDate
      );

      if (evidenceAssessments.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            evidenceAssessmentsReviewed: 0,
            validationDecisionsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const decisions = sciipCreateHypothesisValidationDecisions600_({
        businessKey: validationDecisionBusinessKey,
        decisionDate: decisionDate,
        evidenceAssessments: evidenceAssessments,
        processor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR
      });

      decisions.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: decisions.length,
        recordsRead: evidenceAssessments.length,
        processed: decisions.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          evidenceAssessmentsReviewed: evidenceAssessments.length,
          validationDecisionsCreated: decisions.length,
          skippedDuplicate: 0,
          validationDecisionBusinessKey: validationDecisionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists600_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate600_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue600_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue600_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable600_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey600_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateHypothesisValidationDecisions600_(args) {
  const now = new Date();

  const rows = args.evidenceAssessments.map(function(assessment) {
    const evidenceAssessmentId = sciipExtractFirstAvailable600_(assessment, [
      'Evidence_Assessment_ID'
    ]);

    const evidenceTaskId = sciipExtractFirstAvailable600_(assessment, [
      'Evidence_Task_ID'
    ]);

    const validationPlanId = sciipExtractFirstAvailable600_(assessment, [
      'Validation_Plan_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable600_(assessment, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable600_(assessment, [
      'Hypothesis_Type'
    ]);

    const profile = sciipInferHypothesisValidationDecisionProfile600_(assessment);

    const rowKey =
      args.businessKey + '|' + hypothesisType + '|' +
      sciipNormalizeMissionKey600_(evidenceAssessmentId || evidenceTaskId || validationPlanId || hypothesisId);

    return [
      sciipGenerateId_('HVD'),
      rowKey,
      args.decisionDate,
      evidenceAssessmentId,
      evidenceTaskId,
      validationPlanId,
      hypothesisId,
      hypothesisType,
      profile.validationDecision,
      profile.decisionRationale,
      profile.supportingEvidence,
      profile.counterEvidence,
      profile.evidenceGaps,
      profile.decisionConfidence,
      profile.validationStatus,
      profile.recommendedNextAction,
      'EVIDENCE_ASSESSMENTS:' + evidenceAssessmentId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateHypothesisValidationDecisionRows600_(rows);
}

function sciipInferHypothesisValidationDecisionProfile600_(assessment) {
  const hypothesisType = sciipExtractFirstAvailable600_(assessment, [
    'Hypothesis_Type'
  ]);

  const assessmentFinding = sciipExtractFirstAvailable600_(assessment, [
    'Assessment_Finding'
  ]);

  const validationImplication = sciipExtractFirstAvailable600_(assessment, [
    'Validation_Implication'
  ]);

  const assessmentConfidence =
    sciipExtractFirstAvailable600_(assessment, [
      'Assessment_Confidence'
    ]) || 'LOW';

  const supportingEvidence = sciipExtractFirstAvailable600_(assessment, [
    'Supporting_Evidence'
  ]);

  const counterEvidence = sciipExtractFirstAvailable600_(assessment, [
    'Counter_Evidence'
  ]);

  const evidenceGaps = sciipExtractFirstAvailable600_(assessment, [
    'Evidence_Gaps'
  ]);

  let validationDecision = 'NEEDS_MORE_EVIDENCE';
  let validationStatus = 'PENDING_ADDITIONAL_EVIDENCE';
  let decisionConfidence = assessmentConfidence;
  let decisionRationale =
    'Evidence assessment defines the evidence requirements, but source-level evidence remains incomplete. Hypothesis cannot be fully validated or rejected yet.';
  let recommendedNextAction =
    'Continue source-specific evidence collection before final validation.';

  const combined = [
    assessmentFinding,
    validationImplication,
    supportingEvidence,
    counterEvidence,
    evidenceGaps
  ].join(' ').toLowerCase();

  if (
    combined.includes('counterevidence') &&
    !combined.includes('no counterevidence')
  ) {
    validationDecision = 'CONTESTED';
    validationStatus = 'REQUIRES_OPERATOR_REVIEW';
    decisionConfidence = 'MEDIUM';
    decisionRationale =
      'Assessment references counterevidence or unresolved conflicting evidence. The hypothesis requires operator review before validation.';
    recommendedNextAction =
      'Review supporting evidence and counterevidence, then determine whether to validate, reject, or revise the hypothesis.';
  }

  if (
    combined.includes('actual source-level evidence has not yet been attached') ||
    combined.includes('additional collection is required') ||
    combined.includes('not yet been attached')
  ) {
    validationDecision = 'NEEDS_MORE_EVIDENCE';
    validationStatus = 'PENDING_ADDITIONAL_EVIDENCE';
    decisionConfidence = assessmentConfidence === 'HIGH' ? 'MEDIUM' : assessmentConfidence;
    decisionRationale =
      'The assessment confirms that evidence requirements are defined, but actual source-level evidence has not yet been attached.';
    recommendedNextAction =
      'Collect and attach source-level evidence, then rerun validation decisioning.';
  }

  if (
    combined.includes('high_priority_validation_review_required')
  ) {
    validationDecision = 'READY_FOR_OPERATOR_REVIEW';
    validationStatus = 'PENDING_OPERATOR_REVIEW';
    decisionConfidence = 'MEDIUM';
    decisionRationale =
      'The hypothesis has high-priority validation implications and should be reviewed after evidence collection is completed.';
    recommendedNextAction =
      sciipRecommendHypothesisValidationDecisionNextAction600_(hypothesisType);
  }

  return {
    validationDecision: validationDecision,
    decisionRationale: decisionRationale,
    supportingEvidence: supportingEvidence,
    counterEvidence: counterEvidence,
    evidenceGaps: evidenceGaps,
    decisionConfidence: decisionConfidence,
    validationStatus: validationStatus,
    recommendedNextAction: recommendedNextAction
  };
}

function sciipRecommendHypothesisValidationDecisionNextAction600_(hypothesisType) {
  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    return 'Operator should review property facts, GIS evidence, ownership, tenant signals, availability, and comparable activity before final validation.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    return 'Operator should review company activity, funding, hiring, facility movement, permits, and real estate demand signals before final validation.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    return 'Operator should review risk severity, affected entities, timing, counterevidence, and mitigation path before final validation.';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    return 'Operator should review demand evidence, target fit, timing, actionability, and pursuit rationale before final validation.';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return 'Operator should review processor logs, skipped records, duplicate patterns, missing fields, graph gaps, and workflow friction before approving system changes.';
  }

  return 'Operator should review market evidence, supporting signals, counterevidence, and confidence before final validation.';
}

function sciipDeduplicateHypothesisValidationDecisionRows600_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(function(row) {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestHypothesisValidationDecisionProcessor() {
  const result = sciipRunHypothesisValidationDecisionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestHypothesisValidationDecisionProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 610_ValidatedLearningProcessor
 *
 * HYPOTHESIS_VALIDATION_DECISIONS → VALIDATED_LEARNINGS
 *
 * Migration note:
 * Preserves original 610 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const VALIDATED_LEARNING_PROCESSOR = '610_ValidatedLearningProcessor';
const VALIDATED_LEARNINGS_SHEET = 'VALIDATED_LEARNINGS';

const VALIDATED_LEARNINGS_HEADERS = [
  'Learning_ID',
  'Business_Key',
  'Learning_Date',
  'Validation_Decision_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Validation_Decision',
  'Learning_Type',
  'Learning_Title',
  'Learning_Statement',
  'What_SCIIP_Learned',
  'Graph_Update_Recommendation',
  'Processor_Update_Recommendation',
  'Future_Signal_Weighting',
  'Learning_Confidence',
  'Learning_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureValidatedLearningsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    VALIDATED_LEARNINGS_SHEET,
    VALIDATED_LEARNINGS_HEADERS
  );
}

function sciipRunValidatedLearningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: VALIDATED_LEARNING_PROCESSOR,
    action: 'VALIDATED_LEARNINGS_BUILD',
    sourceSheet: 'HYPOTHESIS_VALIDATION_DECISIONS',
    targetSheet: VALIDATED_LEARNINGS_SHEET,
    ledgerSheet: 'VALIDATED_LEARNINGS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const validationDecisions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('HYPOTHESIS_VALIDATION_DECISIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: validationDecisions.length,
        outputCount: validationDecisions.length || 1,
        summary: 'Validated learning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: VALIDATED_LEARNING_PROCESSOR,
          inputSheets: ['HYPOTHESIS_VALIDATION_DECISIONS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureValidatedLearningsSchema();
      const learningDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const learningBusinessKey = 'VALIDATED_LEARNING|' + learningDate;

      if (sciipRuntimeBusinessKeyPrefixExists610_(definition.targetSheet, learningBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: VALIDATED_LEARNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            learningsCreated: 0,
            skippedDuplicate: 1,
            learningBusinessKey: learningBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const validationDecisions = sciipGetRuntimeRecordsByDate610_(
        'HYPOTHESIS_VALIDATION_DECISIONS',
        'Decision_Date',
        learningDate
      );

      if (validationDecisions.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: VALIDATED_LEARNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            validationDecisionsReviewed: 0,
            learningsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const learnings = sciipCreateValidatedLearnings610_({
        businessKey: learningBusinessKey,
        learningDate: learningDate,
        validationDecisions: validationDecisions,
        processor: VALIDATED_LEARNING_PROCESSOR
      });

      learnings.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: VALIDATED_LEARNING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: learnings.length,
        recordsRead: validationDecisions.length,
        processed: learnings.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          validationDecisionsReviewed: validationDecisions.length,
          learningsCreated: learnings.length,
          skippedDuplicate: 0,
          learningBusinessKey: learningBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists610_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate610_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue610_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue610_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable610_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey610_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateValidatedLearnings610_(args) {
  const now = new Date();

  const rows = args.validationDecisions.map(decision => {
    const validationDecisionId = sciipExtractFirstAvailable610_(decision, [
      'Validation_Decision_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable610_(decision, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable610_(decision, [
      'Hypothesis_Type'
    ]);

    const validationDecision = sciipExtractFirstAvailable610_(decision, [
      'Validation_Decision'
    ]);

    const profile =
      sciipInferValidatedLearningProfile610_(decision);

    const rowKey =
      `${args.businessKey}|${hypothesisType}|${sciipNormalizeMissionKey610_(validationDecisionId || hypothesisId || profile.learningTitle)}`;

    return [
      sciipGenerateId_('LRN'),
      rowKey,
      args.learningDate,
      validationDecisionId,
      hypothesisId,
      hypothesisType,
      validationDecision,
      profile.learningType,
      profile.learningTitle,
      profile.learningStatement,
      profile.whatSciipLearned,
      profile.graphUpdateRecommendation,
      profile.processorUpdateRecommendation,
      profile.futureSignalWeighting,
      profile.learningConfidence,
      profile.learningStatus,
      `HYPOTHESIS_VALIDATION_DECISIONS:${validationDecisionId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateValidatedLearningRows610_(rows);
}

function sciipInferValidatedLearningProfile610_(decision) {
  const hypothesisType = sciipExtractFirstAvailable610_(decision, [
    'Hypothesis_Type'
  ]);

  const validationDecision = sciipExtractFirstAvailable610_(decision, [
    'Validation_Decision'
  ]);

  const decisionRationale = sciipExtractFirstAvailable610_(decision, [
    'Decision_Rationale'
  ]);

  const supportingEvidence = sciipExtractFirstAvailable610_(decision, [
    'Supporting_Evidence'
  ]);

  const counterEvidence = sciipExtractFirstAvailable610_(decision, [
    'Counter_Evidence'
  ]);

  const evidenceGaps = sciipExtractFirstAvailable610_(decision, [
    'Evidence_Gaps'
  ]);

  const decisionConfidence =
    sciipExtractFirstAvailable610_(decision, [
      'Decision_Confidence'
    ]) || 'LOW';

  let learningType = 'MARKET_LEARNING';
  let learningTitle = `Learning from ${hypothesisType || 'hypothesis'} decision`;
  let learningStatement =
    'SCIIP captured a hypothesis validation decision as permanent learning history.';
  let whatSciipLearned =
    'SCIIP learned that the hypothesis requires additional evidence before it can become validated knowledge.';
  let graphUpdateRecommendation =
    'Preserve the hypothesis, validation decision, evidence gaps, and source linkage in the knowledge graph.';
  let processorUpdateRecommendation =
    'No processor change required. Continue routing similar hypotheses through evidence collection and validation.';
  let futureSignalWeighting =
    'MAINTAIN_CURRENT_WEIGHT';
  let learningStatus =
    'PENDING_ADDITIONAL_EVIDENCE';

  const decisionText = String(validationDecision || '').toUpperCase();

  if (decisionText === 'VALIDATED') {
    whatSciipLearned =
      'SCIIP learned that the hypothesis is supported by sufficient evidence and should strengthen future pattern recognition.';
    graphUpdateRecommendation =
      'Promote the hypothesis into validated graph knowledge and link it to supporting source evidence.';
    futureSignalWeighting =
      'INCREASE_WEIGHT';
    learningStatus =
      'VALIDATED_LEARNING';
  }

  if (decisionText === 'REJECTED') {
    whatSciipLearned =
      'SCIIP learned that the hypothesis was not supported and similar future signals should be treated with caution.';
    graphUpdateRecommendation =
      'Preserve rejected hypothesis history and link rejection rationale to future counter-signal recognition.';
    futureSignalWeighting =
      'DECREASE_WEIGHT';
    learningStatus =
      'REJECTED_LEARNING';
  }

  if (decisionText === 'CONTESTED') {
    whatSciipLearned =
      'SCIIP learned that the hypothesis contains conflicting evidence and requires human or additional validation.';
    graphUpdateRecommendation =
      'Preserve both supporting evidence and counterevidence as unresolved graph knowledge.';
    futureSignalWeighting =
      'FLAG_FOR_REVIEW';
    learningStatus =
      'CONTESTED_LEARNING';
  }

  if (decisionText === 'READY_FOR_OPERATOR_REVIEW') {
    whatSciipLearned =
      'SCIIP learned that the hypothesis has enough structure to require operator review but not enough final evidence for autonomous validation.';
    graphUpdateRecommendation =
      'Route the hypothesis and evidence assessment to operator review while preserving traceability.';
    futureSignalWeighting =
      'REVIEW_BEFORE_WEIGHT_CHANGE';
    learningStatus =
      'OPERATOR_REVIEW_REQUIRED';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    learningType = 'PROPERTY_LEARNING';
    processorUpdateRecommendation =
      'Use this learning to improve property hypothesis generation, property evidence collection, and asset-level confidence scoring.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    learningType = 'COMPANY_LEARNING';
    processorUpdateRecommendation =
      'Use this learning to improve company signal detection, occupier movement inference, and company requirement scoring.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    learningType = 'RISK_LEARNING';
    processorUpdateRecommendation =
      'Use this learning to improve risk detection, severity scoring, and counterevidence routing.';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    learningType = 'OPPORTUNITY_LEARNING';
    processorUpdateRecommendation =
      'Use this learning to improve opportunity detection, actionability scoring, and pursuit prioritization.';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    learningType = 'OPERATING_SYSTEM_LEARNING';
    processorUpdateRecommendation =
      'Use this learning to improve processor logic, schema design, graph completeness, or workflow automation.';
  }

  learningStatement =
    [
      `Validation decision: ${validationDecision || 'UNKNOWN'}.`,
      `Decision rationale: ${decisionRationale || 'No rationale recorded.'}`,
      `Supporting evidence: ${supportingEvidence || 'No supporting evidence recorded.'}`,
      `Counterevidence: ${counterEvidence || 'No counterevidence recorded.'}`,
      `Evidence gaps: ${evidenceGaps || 'No evidence gaps recorded.'}`
    ].join('\n');

  return {
    learningType,
    learningTitle,
    learningStatement,
    whatSciipLearned,
    graphUpdateRecommendation,
    processorUpdateRecommendation,
    futureSignalWeighting,
    learningConfidence: decisionConfidence,
    learningStatus
  };
}

function sciipDeduplicateValidatedLearningRows610_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestValidatedLearningProcessor() {
  const result = sciipRunValidatedLearningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestValidatedLearningProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 620_KnowledgeEvolutionProcessor
 *
 * VALIDATED_LEARNINGS → KNOWLEDGE_EVOLUTION
 *
 * Migration note:
 * Preserves original 620 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const KNOWLEDGE_EVOLUTION_PROCESSOR = '620_KnowledgeEvolutionProcessor';
const KNOWLEDGE_EVOLUTION_SHEET = 'KNOWLEDGE_EVOLUTION';

const KNOWLEDGE_EVOLUTION_HEADERS = [
  'Evolution_ID',
  'Business_Key',
  'Evolution_Date',
  'Learning_ID',
  'Validation_Decision_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Learning_Type',
  'Evolution_Type',
  'Evolution_Title',
  'Graph_Update_Action',
  'Entity_Confidence_Adjustment',
  'Relationship_Strength_Adjustment',
  'Signal_Weight_Adjustment',
  'Processor_Evolution_Action',
  'Reasoning_Improvement',
  'Evolution_Rationale',
  'Evolution_Priority',
  'Evolution_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureKnowledgeEvolutionSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    KNOWLEDGE_EVOLUTION_SHEET,
    KNOWLEDGE_EVOLUTION_HEADERS
  );
}

function sciipRunKnowledgeEvolutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: KNOWLEDGE_EVOLUTION_PROCESSOR,
    action: 'KNOWLEDGE_EVOLUTION_BUILD',
    sourceSheet: 'VALIDATED_LEARNINGS',
    targetSheet: KNOWLEDGE_EVOLUTION_SHEET,
    ledgerSheet: 'KNOWLEDGE_EVOLUTION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const learnings = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('VALIDATED_LEARNINGS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: learnings.length,
        outputCount: learnings.length || 1,
        summary: 'Knowledge evolution runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: KNOWLEDGE_EVOLUTION_PROCESSOR,
          inputSheets: ['VALIDATED_LEARNINGS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureKnowledgeEvolutionSchema();
      const evolutionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const evolutionBusinessKey = 'KNOWLEDGE_EVOLUTION|' + evolutionDate;

      if (sciipRuntimeBusinessKeyPrefixExists620_(definition.targetSheet, evolutionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: KNOWLEDGE_EVOLUTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeEvolutionsCreated: 0,
            skippedDuplicate: 1,
            evolutionBusinessKey: evolutionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const learnings = sciipGetRuntimeRecordsByDate620_(
        'VALIDATED_LEARNINGS',
        'Learning_Date',
        evolutionDate
      );

      if (learnings.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: KNOWLEDGE_EVOLUTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            learningsReviewed: 0,
            knowledgeEvolutionsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const evolutions = sciipCreateKnowledgeEvolutions620_({
        businessKey: evolutionBusinessKey,
        evolutionDate: evolutionDate,
        learnings: learnings,
        processor: KNOWLEDGE_EVOLUTION_PROCESSOR
      });

      evolutions.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: KNOWLEDGE_EVOLUTION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: evolutions.length,
        recordsRead: learnings.length,
        processed: evolutions.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          learningsReviewed: learnings.length,
          knowledgeEvolutionsCreated: evolutions.length,
          skippedDuplicate: 0,
          evolutionBusinessKey: evolutionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists620_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate620_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue620_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue620_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable620_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey620_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateKnowledgeEvolutions620_(args) {
  const now = new Date();

  const rows = args.learnings.map(function(learning) {
    const learningId = sciipExtractFirstAvailable620_(learning, [
      'Learning_ID'
    ]);

    const validationDecisionId = sciipExtractFirstAvailable620_(learning, [
      'Validation_Decision_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable620_(learning, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable620_(learning, [
      'Hypothesis_Type'
    ]);

    const learningType = sciipExtractFirstAvailable620_(learning, [
      'Learning_Type'
    ]);

    const profile =
      sciipInferKnowledgeEvolutionProfile620_(learning);

    const rowKey =
      args.businessKey + '|' + learningType + '|' +
      sciipNormalizeMissionKey620_(learningId || validationDecisionId || hypothesisId || profile.evolutionTitle);

    return [
      sciipGenerateId_('KNE'),
      rowKey,
      args.evolutionDate,
      learningId,
      validationDecisionId,
      hypothesisId,
      hypothesisType,
      learningType,
      profile.evolutionType,
      profile.evolutionTitle,
      profile.graphUpdateAction,
      profile.entityConfidenceAdjustment,
      profile.relationshipStrengthAdjustment,
      profile.signalWeightAdjustment,
      profile.processorEvolutionAction,
      profile.reasoningImprovement,
      profile.evolutionRationale,
      profile.evolutionPriority,
      'PROPOSED',
      'VALIDATED_LEARNINGS:' + learningId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateKnowledgeEvolutionRows620_(rows);
}

function sciipInferKnowledgeEvolutionProfile620_(learning) {
  const hypothesisType = sciipExtractFirstAvailable620_(learning, [
    'Hypothesis_Type'
  ]);

  const learningType = sciipExtractFirstAvailable620_(learning, [
    'Learning_Type'
  ]);

  const validationDecision = sciipExtractFirstAvailable620_(learning, [
    'Validation_Decision'
  ]);

  const whatSciipLearned = sciipExtractFirstAvailable620_(learning, [
    'What_SCIIP_Learned'
  ]);

  const graphRecommendation = sciipExtractFirstAvailable620_(learning, [
    'Graph_Update_Recommendation'
  ]);

  const processorRecommendation = sciipExtractFirstAvailable620_(learning, [
    'Processor_Update_Recommendation'
  ]);

  const futureSignalWeighting = sciipExtractFirstAvailable620_(learning, [
    'Future_Signal_Weighting'
  ]);

  const learningConfidence =
    sciipExtractFirstAvailable620_(learning, [
      'Learning_Confidence'
    ]) || 'LOW';

  let evolutionType = 'GENERAL_KNOWLEDGE_EVOLUTION';
  let evolutionTitle = 'Knowledge evolution from ' + (learningType || 'validated learning');
  let graphUpdateAction =
    graphRecommendation || 'Preserve learning and source linkage in the knowledge graph.';
  let entityConfidenceAdjustment = 'NO_CHANGE';
  let relationshipStrengthAdjustment = 'NO_CHANGE';
  let signalWeightAdjustment = futureSignalWeighting || 'MAINTAIN_CURRENT_WEIGHT';
  let processorEvolutionAction =
    processorRecommendation || 'No processor update required.';
  let reasoningImprovement =
    'Use this learning to improve future hypothesis generation, evidence routing, and confidence reasoning.';
  let evolutionPriority = 'MEDIUM';

  const decisionText = String(validationDecision || '').toUpperCase();

  if (decisionText === 'VALIDATED') {
    evolutionType = 'PATTERN_REINFORCEMENT';
    entityConfidenceAdjustment = 'INCREASE_CONFIDENCE';
    relationshipStrengthAdjustment = 'STRENGTHEN_RELATED_EDGES';
    signalWeightAdjustment = 'INCREASE_WEIGHT';
    evolutionPriority = 'HIGH';
    reasoningImprovement =
      'Reinforce similar future signals because this hypothesis pattern was validated.';
  }

  if (decisionText === 'REJECTED') {
    evolutionType = 'PATTERN_SUPPRESSION';
    entityConfidenceAdjustment = 'DECREASE_CONFIDENCE';
    relationshipStrengthAdjustment = 'WEAKEN_RELATED_EDGES';
    signalWeightAdjustment = 'DECREASE_WEIGHT';
    evolutionPriority = 'HIGH';
    reasoningImprovement =
      'Suppress or downgrade similar future signals because this hypothesis pattern was rejected.';
  }

  if (decisionText === 'CONTESTED') {
    evolutionType = 'CONFLICT_PRESERVATION';
    entityConfidenceAdjustment = 'FLAG_CONFIDENCE_CONFLICT';
    relationshipStrengthAdjustment = 'FLAG_EDGE_CONFLICT';
    signalWeightAdjustment = 'FLAG_FOR_REVIEW';
    evolutionPriority = 'HIGH';
    reasoningImprovement =
      'Preserve conflict structure so future reasoning can distinguish supporting evidence from counterevidence.';
  }

  if (decisionText === 'READY_FOR_OPERATOR_REVIEW') {
    evolutionType = 'OPERATOR_REVIEW_ROUTING';
    entityConfidenceAdjustment = 'NO_CHANGE_PENDING_REVIEW';
    relationshipStrengthAdjustment = 'NO_CHANGE_PENDING_REVIEW';
    signalWeightAdjustment = 'REVIEW_BEFORE_WEIGHT_CHANGE';
    evolutionPriority = 'HIGH';
    reasoningImprovement =
      'Route similar high-priority unresolved hypotheses to operator review before autonomous graph confidence changes.';
  }

  if (decisionText === 'NEEDS_MORE_EVIDENCE') {
    evolutionType = 'EVIDENCE_GAP_REINFORCEMENT';
    entityConfidenceAdjustment = 'NO_CHANGE_PENDING_EVIDENCE';
    relationshipStrengthAdjustment = 'NO_CHANGE_PENDING_EVIDENCE';
    signalWeightAdjustment = 'MAINTAIN_CURRENT_WEIGHT';
    evolutionPriority = learningConfidence === 'MEDIUM' ? 'MEDIUM' : 'LOW';
    reasoningImprovement =
      'Increase awareness of evidence gaps before drawing stronger conclusions from similar future signals.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    evolutionType = 'PROPERTY_' + evolutionType;
    evolutionTitle = 'Property knowledge evolution';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    evolutionType = 'COMPANY_' + evolutionType;
    evolutionTitle = 'Company knowledge evolution';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    evolutionType = 'RISK_' + evolutionType;
    evolutionTitle = 'Risk knowledge evolution';
    evolutionPriority = 'HIGH';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    evolutionType = 'OPPORTUNITY_' + evolutionType;
    evolutionTitle = 'Opportunity knowledge evolution';
    evolutionPriority = 'HIGH';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    evolutionType = 'SYSTEM_' + evolutionType;
    evolutionTitle = 'Operating system knowledge evolution';
    processorEvolutionAction =
      processorRecommendation ||
      'Review processor logic, schema design, graph completeness, and workflow automation for possible improvement.';
  }

  const evolutionRationale = [
    'Validation decision: ' + (validationDecision || 'UNKNOWN') + '.',
    'Learning type: ' + (learningType || 'UNKNOWN') + '.',
    'What SCIIP learned: ' + (whatSciipLearned || 'No learning statement recorded.'),
    'Graph recommendation: ' + graphUpdateAction,
    'Processor recommendation: ' + processorEvolutionAction,
    'Future signal weighting: ' + signalWeightAdjustment
  ].join('\n');

  return {
    evolutionType: evolutionType,
    evolutionTitle: evolutionTitle,
    graphUpdateAction: graphUpdateAction,
    entityConfidenceAdjustment: entityConfidenceAdjustment,
    relationshipStrengthAdjustment: relationshipStrengthAdjustment,
    signalWeightAdjustment: signalWeightAdjustment,
    processorEvolutionAction: processorEvolutionAction,
    reasoningImprovement: reasoningImprovement,
    evolutionRationale: evolutionRationale,
    evolutionPriority: evolutionPriority
  };
}

function sciipDeduplicateKnowledgeEvolutionRows620_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(function(row) {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestKnowledgeEvolutionProcessor() {
  const result =
    sciipRunKnowledgeEvolutionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestKnowledgeEvolutionProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 630_SignalWeightOptimizationProcessor
 *
 * KNOWLEDGE_EVOLUTION → SIGNAL_WEIGHT_OPTIMIZATION
 *
 * Migration note:
 * Preserves original 630 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR = '630_SignalWeightOptimizationProcessor';
const SIGNAL_WEIGHT_OPTIMIZATION_SHEET = 'SIGNAL_WEIGHT_OPTIMIZATION';

const SIGNAL_WEIGHT_OPTIMIZATION_HEADERS = [
  'Signal_Weight_ID',
  'Business_Key',
  'Optimization_Date',
  'Evolution_ID',
  'Learning_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Learning_Type',
  'Evolution_Type',
  'Signal_Category',
  'Current_Weight_Assumption',
  'Recommended_Weight_Action',
  'Recommended_Weight_Direction',
  'Recommended_Weight_Magnitude',
  'Optimization_Rationale',
  'Affected_Processor',
  'Affected_Graph_Object',
  'Implementation_Status',
  'Optimization_Priority',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureSignalWeightOptimizationSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    SIGNAL_WEIGHT_OPTIMIZATION_SHEET,
    SIGNAL_WEIGHT_OPTIMIZATION_HEADERS
  );
}

function sciipRunSignalWeightOptimizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR,
    action: 'SIGNAL_WEIGHT_OPTIMIZATION_BUILD',
    sourceSheet: 'KNOWLEDGE_EVOLUTION',
    targetSheet: SIGNAL_WEIGHT_OPTIMIZATION_SHEET,
    ledgerSheet: 'SIGNAL_WEIGHT_OPTIMIZATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const evolutions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('KNOWLEDGE_EVOLUTION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: evolutions.length,
        outputCount: evolutions.length || 1,
        summary: 'Signal weight optimization runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR,
          inputSheets: ['KNOWLEDGE_EVOLUTION']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureSignalWeightOptimizationSchema();
      const optimizationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const optimizationBusinessKey = 'SIGNAL_WEIGHT_OPTIMIZATION|' + optimizationDate;

      if (sciipRuntimeBusinessKeyPrefixExists630_(definition.targetSheet, optimizationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            signalWeightsOptimized: 0,
            skippedDuplicate: 1,
            optimizationBusinessKey: optimizationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const evolutions = sciipGetRuntimeRecordsByDate630_(
        'KNOWLEDGE_EVOLUTION',
        'Evolution_Date',
        optimizationDate
      );

      if (evolutions.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeEvolutionsReviewed: 0,
            signalWeightsOptimized: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const optimizations = sciipCreateSignalWeightOptimizations630_({
        businessKey: optimizationBusinessKey,
        optimizationDate: optimizationDate,
        evolutions: evolutions,
        processor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR
      });

      optimizations.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: optimizations.length,
        recordsRead: evolutions.length,
        processed: optimizations.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          knowledgeEvolutionsReviewed: evolutions.length,
          signalWeightsOptimized: optimizations.length,
          skippedDuplicate: 0,
          optimizationBusinessKey: optimizationBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists630_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate630_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue630_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue630_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable630_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey630_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateSignalWeightOptimizations630_(args) {
  const now = new Date();

  const rows = args.evolutions.map(evolution => {
    const evolutionId = sciipExtractFirstAvailable630_(evolution, [
      'Evolution_ID'
    ]);

    const learningId = sciipExtractFirstAvailable630_(evolution, [
      'Learning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable630_(evolution, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable630_(evolution, [
      'Hypothesis_Type'
    ]);

    const learningType = sciipExtractFirstAvailable630_(evolution, [
      'Learning_Type'
    ]);

    const evolutionType = sciipExtractFirstAvailable630_(evolution, [
      'Evolution_Type'
    ]);

    const profile =
      sciipInferSignalWeightOptimizationProfile630_(evolution);

    const rowKey =
      `${args.businessKey}|${profile.signalCategory}|${sciipNormalizeMissionKey630_(evolutionId || learningId || hypothesisId || profile.signalCategory)}`;

    return [
      sciipGenerateId_('SWO'),
      rowKey,
      args.optimizationDate,
      evolutionId,
      learningId,
      hypothesisId,
      hypothesisType,
      learningType,
      evolutionType,
      profile.signalCategory,
      profile.currentWeightAssumption,
      profile.recommendedWeightAction,
      profile.recommendedWeightDirection,
      profile.recommendedWeightMagnitude,
      profile.optimizationRationale,
      profile.affectedProcessor,
      profile.affectedGraphObject,
      'PROPOSED',
      profile.optimizationPriority,
      `KNOWLEDGE_EVOLUTION:${evolutionId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateSignalWeightOptimizationRows630_(rows);
}

function sciipInferSignalWeightOptimizationProfile630_(evolution) {
  const hypothesisType = sciipExtractFirstAvailable630_(evolution, [
    'Hypothesis_Type'
  ]);

  const learningType = sciipExtractFirstAvailable630_(evolution, [
    'Learning_Type'
  ]);

  const evolutionType = sciipExtractFirstAvailable630_(evolution, [
    'Evolution_Type'
  ]);

  const signalWeightAdjustment = sciipExtractFirstAvailable630_(evolution, [
    'Signal_Weight_Adjustment'
  ]);

  const evolutionPriority =
    sciipExtractFirstAvailable630_(evolution, [
      'Evolution_Priority'
    ]) || 'MEDIUM';

  const evolutionRationale = sciipExtractFirstAvailable630_(evolution, [
    'Evolution_Rationale'
  ]);

  let signalCategory = 'GENERAL_MARKET_SIGNAL';
  let affectedProcessor = '560_HypothesisGenerationProcessor';
  let affectedGraphObject = 'MARKET_INTELLIGENCE_GRAPH';
  let currentWeightAssumption = 'BASELINE_WEIGHT';
  let recommendedWeightAction = 'MAINTAIN_SIGNAL_WEIGHT';
  let recommendedWeightDirection = 'NO_CHANGE';
  let recommendedWeightMagnitude = 'NONE';
  let optimizationPriority = evolutionPriority;

  const adjustment = String(signalWeightAdjustment || '').toUpperCase();
  const combined = [
    hypothesisType,
    learningType,
    evolutionType,
    signalWeightAdjustment,
    evolutionRationale
  ].join(' ').toLowerCase();

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    signalCategory = 'PROPERTY_SIGNAL';
    affectedProcessor = '560_HypothesisGenerationProcessor';
    affectedGraphObject = 'PROPERTY_KNOWLEDGE_GRAPH';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    signalCategory = 'COMPANY_SIGNAL';
    affectedProcessor = '560_HypothesisGenerationProcessor';
    affectedGraphObject = 'COMPANY_KNOWLEDGE_GRAPH';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    signalCategory = 'RISK_SIGNAL';
    affectedProcessor = '560_HypothesisGenerationProcessor';
    affectedGraphObject = 'RISK_INTELLIGENCE_GRAPH';
    optimizationPriority = 'HIGH';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    signalCategory = 'OPPORTUNITY_SIGNAL';
    affectedProcessor = '250_OpportunityDetectionProcessor';
    affectedGraphObject = 'OPPORTUNITY_INTELLIGENCE_GRAPH';
    optimizationPriority = 'HIGH';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    signalCategory = 'SYSTEM_SIGNAL';
    affectedProcessor = '490_SystemLearningProcessor';
    affectedGraphObject = 'SCIIP_OPERATING_GRAPH';
  }

  if (
    adjustment === 'INCREASE_WEIGHT' ||
    combined.includes('pattern_reinforcement') ||
    combined.includes('increase_weight')
  ) {
    recommendedWeightAction = 'INCREASE_SIGNAL_WEIGHT';
    recommendedWeightDirection = 'UP';
    recommendedWeightMagnitude =
      optimizationPriority === 'HIGH' ? 'MODERATE' : 'LOW';
  }

  if (
    adjustment === 'DECREASE_WEIGHT' ||
    combined.includes('pattern_suppression') ||
    combined.includes('decrease_weight')
  ) {
    recommendedWeightAction = 'DECREASE_SIGNAL_WEIGHT';
    recommendedWeightDirection = 'DOWN';
    recommendedWeightMagnitude =
      optimizationPriority === 'HIGH' ? 'MODERATE' : 'LOW';
  }

  if (
    adjustment === 'FLAG_FOR_REVIEW' ||
    adjustment === 'REVIEW_BEFORE_WEIGHT_CHANGE' ||
    combined.includes('conflict') ||
    combined.includes('operator_review')
  ) {
    recommendedWeightAction = 'FLAG_WEIGHT_FOR_OPERATOR_REVIEW';
    recommendedWeightDirection = 'REVIEW';
    recommendedWeightMagnitude = 'PENDING_REVIEW';
    optimizationPriority = 'HIGH';
  }

  if (
    adjustment === 'MAINTAIN_CURRENT_WEIGHT' ||
    combined.includes('needs_more_evidence') ||
    combined.includes('pending_evidence')
  ) {
    recommendedWeightAction = 'MAINTAIN_SIGNAL_WEIGHT';
    recommendedWeightDirection = 'NO_CHANGE';
    recommendedWeightMagnitude = 'NONE';
  }

  const optimizationRationale = [
    `Signal category: ${signalCategory}.`,
    `Hypothesis type: ${hypothesisType || 'UNKNOWN'}.`,
    `Learning type: ${learningType || 'UNKNOWN'}.`,
    `Evolution type: ${evolutionType || 'UNKNOWN'}.`,
    `Knowledge evolution recommended signal adjustment: ${signalWeightAdjustment || 'UNKNOWN'}.`,
    `Recommended action: ${recommendedWeightAction}.`,
    `Rationale: ${evolutionRationale || 'No evolution rationale recorded.'}`
  ].join('\n');

  return {
    signalCategory,
    currentWeightAssumption,
    recommendedWeightAction,
    recommendedWeightDirection,
    recommendedWeightMagnitude,
    optimizationRationale,
    affectedProcessor,
    affectedGraphObject,
    optimizationPriority
  };
}

function sciipDeduplicateSignalWeightOptimizationRows630_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestSignalWeightOptimizationProcessor() {
  const result =
    sciipRunSignalWeightOptimizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestSignalWeightOptimizationProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 640_AutonomousModelCalibrationProcessor
 *
 * SIGNAL_WEIGHT_OPTIMIZATION → AUTONOMOUS_MODEL_CALIBRATION
 *
 * Migration note:
 * Preserves original 640 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR = '640_AutonomousModelCalibrationProcessor';
const AUTONOMOUS_MODEL_CALIBRATION_SHEET = 'AUTONOMOUS_MODEL_CALIBRATION';

const AUTONOMOUS_MODEL_CALIBRATION_HEADERS = [
  'Calibration_ID',
  'Business_Key',
  'Calibration_Date',
  'Signal_Weight_ID',
  'Evolution_ID',
  'Learning_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Affected_Processor',
  'Affected_Graph_Object',
  'Calibration_Type',
  'Calibration_Action',
  'Calibration_Direction',
  'Calibration_Magnitude',
  'Calibration_Rationale',
  'Expected_Model_Effect',
  'Implementation_Status',
  'Calibration_Priority',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousModelCalibrationSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    AUTONOMOUS_MODEL_CALIBRATION_SHEET,
    AUTONOMOUS_MODEL_CALIBRATION_HEADERS
  );
}

function sciipRunAutonomousModelCalibrationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR,
    action: 'AUTONOMOUS_MODEL_CALIBRATION_BUILD',
    sourceSheet: 'SIGNAL_WEIGHT_OPTIMIZATION',
    targetSheet: AUTONOMOUS_MODEL_CALIBRATION_SHEET,
    ledgerSheet: 'AUTONOMOUS_MODEL_CALIBRATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const signalWeights = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SIGNAL_WEIGHT_OPTIMIZATION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: signalWeights.length,
        outputCount: signalWeights.length || 1,
        summary: 'Autonomous model calibration runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR,
          inputSheets: ['SIGNAL_WEIGHT_OPTIMIZATION']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousModelCalibrationSchema();
      const calibrationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const calibrationBusinessKey = 'AUTONOMOUS_MODEL_CALIBRATION|' + calibrationDate;

      if (sciipRuntimeBusinessKeyPrefixExists640_(definition.targetSheet, calibrationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            calibrationsCreated: 0,
            skippedDuplicate: 1,
            calibrationBusinessKey: calibrationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const signalWeights = sciipGetRuntimeRecordsByDate640_(
        'SIGNAL_WEIGHT_OPTIMIZATION',
        'Optimization_Date',
        calibrationDate
      );

      if (signalWeights.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            signalWeightsReviewed: 0,
            calibrationsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const calibrations = sciipCreateAutonomousModelCalibrations640_({
        businessKey: calibrationBusinessKey,
        calibrationDate: calibrationDate,
        signalWeights: signalWeights,
        processor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR
      });

      calibrations.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: calibrations.length,
        recordsRead: signalWeights.length,
        processed: calibrations.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          signalWeightsReviewed: signalWeights.length,
          calibrationsCreated: calibrations.length,
          skippedDuplicate: 0,
          calibrationBusinessKey: calibrationBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists640_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate640_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue640_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue640_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable640_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey640_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateAutonomousModelCalibrations640_(args) {
  const now = new Date();

  const rows = args.signalWeights.map(function(signalWeight) {
    const signalWeightId = sciipExtractFirstAvailable640_(signalWeight, [
      'Signal_Weight_ID'
    ]);

    const evolutionId = sciipExtractFirstAvailable640_(signalWeight, [
      'Evolution_ID'
    ]);

    const learningId = sciipExtractFirstAvailable640_(signalWeight, [
      'Learning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable640_(signalWeight, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable640_(signalWeight, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable640_(signalWeight, [
      'Signal_Category'
    ]);

    const profile =
      sciipInferAutonomousModelCalibrationProfile640_(signalWeight);

    const rowKey =
      args.businessKey + '|' + signalCategory + '|' + sciipNormalizeMissionKey640_(signalWeightId || evolutionId || learningId || hypothesisId || profile.calibrationType);

    return [
      sciipGenerateId_('CAL'),
      rowKey,
      args.calibrationDate,
      signalWeightId,
      evolutionId,
      learningId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      profile.affectedProcessor,
      profile.affectedGraphObject,
      profile.calibrationType,
      profile.calibrationAction,
      profile.calibrationDirection,
      profile.calibrationMagnitude,
      profile.calibrationRationale,
      profile.expectedModelEffect,
      'PROPOSED',
      profile.calibrationPriority,
      'SIGNAL_WEIGHT_OPTIMIZATION:' + signalWeightId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateAutonomousModelCalibrationRows640_(rows);
}

function sciipInferAutonomousModelCalibrationProfile640_(signalWeight) {
  const hypothesisType = sciipExtractFirstAvailable640_(signalWeight, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable640_(signalWeight, [
    'Signal_Category'
  ]);

  const affectedProcessor =
    sciipExtractFirstAvailable640_(signalWeight, [
      'Affected_Processor'
    ]) || '560_HypothesisGenerationProcessor';

  const affectedGraphObject =
    sciipExtractFirstAvailable640_(signalWeight, [
      'Affected_Graph_Object'
    ]) || 'MARKET_INTELLIGENCE_GRAPH';

  const recommendedWeightAction = sciipExtractFirstAvailable640_(signalWeight, [
    'Recommended_Weight_Action'
  ]);

  const recommendedWeightDirection = sciipExtractFirstAvailable640_(signalWeight, [
    'Recommended_Weight_Direction'
  ]);

  const recommendedWeightMagnitude = sciipExtractFirstAvailable640_(signalWeight, [
    'Recommended_Weight_Magnitude'
  ]);

  const optimizationRationale = sciipExtractFirstAvailable640_(signalWeight, [
    'Optimization_Rationale'
  ]);

  const optimizationPriority =
    sciipExtractFirstAvailable640_(signalWeight, [
      'Optimization_Priority'
    ]) || 'MEDIUM';

  let calibrationType = 'SIGNAL_WEIGHT_CALIBRATION';
  let calibrationAction = 'MAINTAIN_MODEL_BEHAVIOR';
  let calibrationDirection = 'NO_CHANGE';
  let calibrationMagnitude = 'NONE';
  let calibrationPriority = optimizationPriority;
  let expectedModelEffect =
    'Future model behavior should remain stable until more validated learning is available.';

  const action = String(recommendedWeightAction || '').toUpperCase();
  const direction = String(recommendedWeightDirection || '').toUpperCase();

  if (
    action === 'INCREASE_SIGNAL_WEIGHT' ||
    direction === 'UP'
  ) {
    calibrationAction = 'CALIBRATE_MODEL_TO_PRIORITIZE_SIGNAL';
    calibrationDirection = 'INCREASE_SENSITIVITY';
    calibrationMagnitude = recommendedWeightMagnitude || 'LOW';
    expectedModelEffect =
      'Future hypothesis generation and signal interpretation should become more sensitive to this signal category.';
  }

  if (
    action === 'DECREASE_SIGNAL_WEIGHT' ||
    direction === 'DOWN'
  ) {
    calibrationAction = 'CALIBRATE_MODEL_TO_DOWNWEIGHT_SIGNAL';
    calibrationDirection = 'DECREASE_SENSITIVITY';
    calibrationMagnitude = recommendedWeightMagnitude || 'LOW';
    expectedModelEffect =
      'Future hypothesis generation and signal interpretation should become less sensitive to this signal category.';
  }

  if (
    action === 'FLAG_WEIGHT_FOR_OPERATOR_REVIEW' ||
    direction === 'REVIEW'
  ) {
    calibrationAction = 'ROUTE_CALIBRATION_TO_OPERATOR_REVIEW';
    calibrationDirection = 'PENDING_REVIEW';
    calibrationMagnitude = 'PENDING_REVIEW';
    calibrationPriority = 'HIGH';
    expectedModelEffect =
      'No autonomous calibration should be applied until operator review resolves the signal weighting recommendation.';
  }

  if (
    action === 'MAINTAIN_SIGNAL_WEIGHT' ||
    direction === 'NO_CHANGE'
  ) {
    calibrationAction = 'MAINTAIN_MODEL_BEHAVIOR';
    calibrationDirection = 'NO_CHANGE';
    calibrationMagnitude = 'NONE';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    calibrationType = 'PROPERTY_MODEL_CALIBRATION';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    calibrationType = 'COMPANY_MODEL_CALIBRATION';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    calibrationType = 'RISK_MODEL_CALIBRATION';
    calibrationPriority = 'HIGH';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    calibrationType = 'OPPORTUNITY_MODEL_CALIBRATION';
    calibrationPriority = 'HIGH';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    calibrationType = 'SYSTEM_MODEL_CALIBRATION';
  }

  const calibrationRationale = [
    'Signal category: ' + (signalCategory || 'UNKNOWN') + '.',
    'Hypothesis type: ' + (hypothesisType || 'UNKNOWN') + '.',
    'Affected processor: ' + affectedProcessor + '.',
    'Affected graph object: ' + affectedGraphObject + '.',
    'Recommended weight action: ' + (recommendedWeightAction || 'UNKNOWN') + '.',
    'Recommended direction: ' + (recommendedWeightDirection || 'UNKNOWN') + '.',
    'Recommended magnitude: ' + (recommendedWeightMagnitude || 'UNKNOWN') + '.',
    'Optimization rationale: ' + (optimizationRationale || 'No rationale recorded.')
  ].join('\n');

  return {
    affectedProcessor: affectedProcessor,
    affectedGraphObject: affectedGraphObject,
    calibrationType: calibrationType,
    calibrationAction: calibrationAction,
    calibrationDirection: calibrationDirection,
    calibrationMagnitude: calibrationMagnitude,
    calibrationRationale: calibrationRationale,
    expectedModelEffect: expectedModelEffect,
    calibrationPriority: calibrationPriority
  };
}

function sciipDeduplicateAutonomousModelCalibrationRows640_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(function(row) {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestAutonomousModelCalibrationProcessor() {
  const result =
    sciipRunAutonomousModelCalibrationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousModelCalibrationProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 650_StrategicMemoryConsolidationProcessor
 *
 * AUTONOMOUS_MODEL_CALIBRATION → STRATEGIC_MEMORY
 *
 * Migration note:
 * Preserves original 650 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR = '650_StrategicMemoryConsolidationProcessor';
const STRATEGIC_MEMORY_SHEET = 'STRATEGIC_MEMORY';

const STRATEGIC_MEMORY_HEADERS = [
  'Memory_ID',
  'Business_Key',
  'Memory_Date',
  'Calibration_ID',
  'Signal_Weight_ID',
  'Evolution_ID',
  'Learning_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Memory_Type',
  'Memory_Title',
  'Memory_Statement',
  'Strategic_Principle',
  'Pattern_To_Reinforce',
  'Pattern_To_Suppress',
  'Reasoning_Instruction',
  'Future_Use_Case',
  'Memory_Confidence',
  'Memory_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureStrategicMemorySchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    STRATEGIC_MEMORY_SHEET,
    STRATEGIC_MEMORY_HEADERS
  );
}

function sciipRunStrategicMemoryConsolidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR,
    action: 'STRATEGIC_MEMORY_BUILD',
    sourceSheet: 'AUTONOMOUS_MODEL_CALIBRATION',
    targetSheet: STRATEGIC_MEMORY_SHEET,
    ledgerSheet: 'STRATEGIC_MEMORY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const calibrations = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_MODEL_CALIBRATION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: calibrations.length,
        outputCount: calibrations.length || 1,
        summary: 'Strategic memory consolidation runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR,
          inputSheets: ['AUTONOMOUS_MODEL_CALIBRATION']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureStrategicMemorySchema();
      const memoryDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const memoryBusinessKey = 'STRATEGIC_MEMORY|' + memoryDate;

      if (sciipRuntimeBusinessKeyPrefixExists650_(definition.targetSheet, memoryBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            memoriesCreated: 0,
            skippedDuplicate: 1,
            memoryBusinessKey: memoryBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const calibrations = sciipGetRuntimeRecordsByDate650_(
        'AUTONOMOUS_MODEL_CALIBRATION',
        'Calibration_Date',
        memoryDate
      );

      if (calibrations.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            calibrationsReviewed: 0,
            memoriesCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const memories = sciipCreateStrategicMemories650_({
        businessKey: memoryBusinessKey,
        memoryDate: memoryDate,
        calibrations: calibrations,
        processor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR
      });

      memories.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: STRATEGIC_MEMORY_CONSOLIDATION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: memories.length,
        recordsRead: calibrations.length,
        processed: memories.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          calibrationsReviewed: calibrations.length,
          memoriesCreated: memories.length,
          skippedDuplicate: 0,
          memoryBusinessKey: memoryBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists650_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate650_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue650_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue650_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable650_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey650_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateStrategicMemories650_(args) {
  const now = new Date();

  const rows = args.calibrations.map(calibration => {
    const calibrationId = sciipExtractFirstAvailable650_(calibration, [
      'Calibration_ID'
    ]);

    const signalWeightId = sciipExtractFirstAvailable650_(calibration, [
      'Signal_Weight_ID'
    ]);

    const evolutionId = sciipExtractFirstAvailable650_(calibration, [
      'Evolution_ID'
    ]);

    const learningId = sciipExtractFirstAvailable650_(calibration, [
      'Learning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable650_(calibration, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable650_(calibration, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable650_(calibration, [
      'Signal_Category'
    ]);

    const profile =
      sciipInferStrategicMemoryProfile650_(calibration);

    const rowKey =
      `${args.businessKey}|${profile.memoryType}|${sciipNormalizeMissionKey650_(calibrationId || signalWeightId || evolutionId || learningId || hypothesisId || profile.memoryTitle)}`;

    return [
      sciipGenerateId_('MEM'),
      rowKey,
      args.memoryDate,
      calibrationId,
      signalWeightId,
      evolutionId,
      learningId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      profile.memoryType,
      profile.memoryTitle,
      profile.memoryStatement,
      profile.strategicPrinciple,
      profile.patternToReinforce,
      profile.patternToSuppress,
      profile.reasoningInstruction,
      profile.futureUseCase,
      profile.memoryConfidence,
      'CONSOLIDATED',
      `AUTONOMOUS_MODEL_CALIBRATION:${calibrationId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateStrategicMemoryRows650_(rows);
}

function sciipInferStrategicMemoryProfile650_(calibration) {
  const hypothesisType = sciipExtractFirstAvailable650_(calibration, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable650_(calibration, [
    'Signal_Category'
  ]);

  const calibrationType = sciipExtractFirstAvailable650_(calibration, [
    'Calibration_Type'
  ]);

  const calibrationAction = sciipExtractFirstAvailable650_(calibration, [
    'Calibration_Action'
  ]);

  const calibrationDirection = sciipExtractFirstAvailable650_(calibration, [
    'Calibration_Direction'
  ]);

  const calibrationMagnitude = sciipExtractFirstAvailable650_(calibration, [
    'Calibration_Magnitude'
  ]);

  const calibrationRationale = sciipExtractFirstAvailable650_(calibration, [
    'Calibration_Rationale'
  ]);

  const expectedModelEffect = sciipExtractFirstAvailable650_(calibration, [
    'Expected_Model_Effect'
  ]);

  const calibrationPriority =
    sciipExtractFirstAvailable650_(calibration, [
      'Calibration_Priority'
    ]) || 'MEDIUM';

  let memoryType = 'GENERAL_STRATEGIC_MEMORY';
  let memoryTitle = `Strategic memory: ${signalCategory || 'general signal'}`;
  let strategicPrinciple =
    'Preserve validated calibration history so future SCIIP reasoning can improve without overwriting prior evidence.';
  let patternToReinforce = 'NONE';
  let patternToSuppress = 'NONE';
  let reasoningInstruction =
    'Use this memory as context when generating future hypotheses, weighing evidence, and routing validation work.';
  let futureUseCase =
    'Future autonomous reasoning, hypothesis generation, evidence prioritization, and graph confidence adjustment.';
  let memoryConfidence =
    calibrationPriority === 'HIGH' ? 'MEDIUM' : 'LOW';

  const action = String(calibrationAction || '').toUpperCase();
  const direction = String(calibrationDirection || '').toUpperCase();

  if (
    action === 'CALIBRATE_MODEL_TO_PRIORITIZE_SIGNAL' ||
    direction === 'INCREASE_SENSITIVITY'
  ) {
    memoryType = 'REINFORCEMENT_MEMORY';
    patternToReinforce =
      `${signalCategory || 'This signal category'} should receive greater attention in future reasoning.`;
    reasoningInstruction =
      'When similar signals appear again, raise their priority during hypothesis generation and evidence routing.';
    memoryConfidence =
      calibrationMagnitude === 'MODERATE' ? 'MEDIUM' : memoryConfidence;
  }

  if (
    action === 'CALIBRATE_MODEL_TO_DOWNWEIGHT_SIGNAL' ||
    direction === 'DECREASE_SENSITIVITY'
  ) {
    memoryType = 'SUPPRESSION_MEMORY';
    patternToSuppress =
      `${signalCategory || 'This signal category'} should receive reduced weight unless supported by stronger evidence.`;
    reasoningInstruction =
      'When similar signals appear again, require stronger evidence before escalating them into high-priority hypotheses.';
    memoryConfidence =
      calibrationMagnitude === 'MODERATE' ? 'MEDIUM' : memoryConfidence;
  }

  if (
    action === 'ROUTE_CALIBRATION_TO_OPERATOR_REVIEW' ||
    direction === 'PENDING_REVIEW'
  ) {
    memoryType = 'OPERATOR_REVIEW_MEMORY';
    strategicPrinciple =
      'SCIIP should preserve unresolved calibration conflicts and route similar future cases to operator review.';
    reasoningInstruction =
      'Do not autonomously change confidence or signal weighting for similar cases until operator review resolves the conflict.';
    futureUseCase =
      'Operator review routing, conflict-aware reasoning, and calibration governance.';
    memoryConfidence = 'MEDIUM';
  }

  if (
    action === 'MAINTAIN_MODEL_BEHAVIOR' ||
    direction === 'NO_CHANGE'
  ) {
    memoryType = 'STABILITY_MEMORY';
    strategicPrinciple =
      'SCIIP should preserve this signal history but avoid changing future model behavior until stronger validated evidence exists.';
    reasoningInstruction =
      'Maintain baseline reasoning behavior for similar future signals unless additional validated learning accumulates.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    memoryTitle = 'Property strategic memory';
    futureUseCase =
      'Future property hypothesis generation, asset confidence scoring, GIS evidence routing, and property graph enrichment.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    memoryTitle = 'Company strategic memory';
    futureUseCase =
      'Future company signal detection, occupier movement inference, supplier/OEM analysis, and company graph enrichment.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    memoryTitle = 'Risk strategic memory';
    futureUseCase =
      'Future risk detection, severity scoring, counterevidence routing, and mitigation prioritization.';
    memoryConfidence = 'MEDIUM';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    memoryTitle = 'Opportunity strategic memory';
    futureUseCase =
      'Future opportunity detection, actionability scoring, pursuit prioritization, and market timing reasoning.';
    memoryConfidence = 'MEDIUM';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    memoryTitle = 'Operating system strategic memory';
    futureUseCase =
      'Future processor improvement, graph completeness review, schema evolution, workflow automation, and autonomous reasoning calibration.';
  }

  const memoryStatement = [
    `Calibration type: ${calibrationType || 'UNKNOWN'}.`,
    `Calibration action: ${calibrationAction || 'UNKNOWN'}.`,
    `Calibration direction: ${calibrationDirection || 'UNKNOWN'}.`,
    `Calibration magnitude: ${calibrationMagnitude || 'UNKNOWN'}.`,
    `Expected model effect: ${expectedModelEffect || 'No expected effect recorded.'}`,
    `Rationale: ${calibrationRationale || 'No calibration rationale recorded.'}`
  ].join('\n');

  return {
    memoryType,
    memoryTitle,
    memoryStatement,
    strategicPrinciple,
    patternToReinforce,
    patternToSuppress,
    reasoningInstruction,
    futureUseCase,
    memoryConfidence
  };
}

function sciipDeduplicateStrategicMemoryRows650_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestStrategicMemoryConsolidationProcessor() {
  const result =
    sciipRunStrategicMemoryConsolidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestStrategicMemoryConsolidationProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 660_AutonomousReasoningProcessor
 *
 * STRATEGIC_MEMORY → AUTONOMOUS_REASONING
 *
 * Migration note:
 * Preserves original 660 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const AUTONOMOUS_REASONING_PROCESSOR = '660_AutonomousReasoningProcessor';
const AUTONOMOUS_REASONING_SHEET = 'AUTONOMOUS_REASONING';

const AUTONOMOUS_REASONING_HEADERS = [
  'Reasoning_ID',
  'Business_Key',
  'Reasoning_Date',
  'Memory_ID',
  'Calibration_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Memory_Type',
  'Reasoning_Type',
  'Reasoning_Title',
  'Reasoning_Statement',
  'Strategic_Interpretation',
  'Future_Implication',
  'Recommended_Intelligence_Action',
  'Recommended_Operating_Action',
  'Next_Strategic_Question',
  'Reasoning_Confidence',
  'Reasoning_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousReasoningSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    AUTONOMOUS_REASONING_SHEET,
    AUTONOMOUS_REASONING_HEADERS
  );
}

function sciipRunAutonomousReasoningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: AUTONOMOUS_REASONING_PROCESSOR,
    action: 'AUTONOMOUS_REASONING_BUILD',
    sourceSheet: 'STRATEGIC_MEMORY',
    targetSheet: AUTONOMOUS_REASONING_SHEET,
    ledgerSheet: 'AUTONOMOUS_REASONING_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const memories = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('STRATEGIC_MEMORY');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: memories.length,
        outputCount: memories.length || 1,
        summary: 'Autonomous reasoning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: AUTONOMOUS_REASONING_PROCESSOR,
          inputSheets: ['STRATEGIC_MEMORY']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousReasoningSchema();
      const reasoningDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const reasoningBusinessKey = 'AUTONOMOUS_REASONING|' + reasoningDate;

      if (sciipRuntimeBusinessKeyPrefixExists660_(definition.targetSheet, reasoningBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: AUTONOMOUS_REASONING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            reasoningOutputsCreated: 0,
            skippedDuplicate: 1,
            reasoningBusinessKey: reasoningBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const memories = sciipGetRuntimeRecordsByDate660_(
        'STRATEGIC_MEMORY',
        'Memory_Date',
        reasoningDate
      );

      if (memories.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: AUTONOMOUS_REASONING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            memoriesReviewed: 0,
            reasoningOutputsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const reasoningOutputs = sciipCreateAutonomousReasoningOutputs660_({
        businessKey: reasoningBusinessKey,
        reasoningDate: reasoningDate,
        memories: memories,
        processor: AUTONOMOUS_REASONING_PROCESSOR
      });

      reasoningOutputs.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: AUTONOMOUS_REASONING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: reasoningOutputs.length,
        recordsRead: memories.length,
        processed: reasoningOutputs.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          memoriesReviewed: memories.length,
          reasoningOutputsCreated: reasoningOutputs.length,
          skippedDuplicate: 0,
          reasoningBusinessKey: reasoningBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists660_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate660_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue660_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue660_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable660_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey660_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateAutonomousReasoningOutputs660_(args) {
  const now = new Date();

  const rows = args.memories.map(function(memory) {
    const memoryId = sciipExtractFirstAvailable660_(memory, [
      'Memory_ID'
    ]);

    const calibrationId = sciipExtractFirstAvailable660_(memory, [
      'Calibration_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable660_(memory, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable660_(memory, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable660_(memory, [
      'Signal_Category'
    ]);

    const memoryType = sciipExtractFirstAvailable660_(memory, [
      'Memory_Type'
    ]);

    const profile =
      sciipInferAutonomousReasoningProfile660_(memory);

    const rowKey =
      args.businessKey + '|' + profile.reasoningType + '|' + sciipNormalizeMissionKey660_(memoryId || calibrationId || hypothesisId || profile.reasoningTitle);

    return [
      sciipGenerateId_('RSN'),
      rowKey,
      args.reasoningDate,
      memoryId,
      calibrationId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      memoryType,
      profile.reasoningType,
      profile.reasoningTitle,
      profile.reasoningStatement,
      profile.strategicInterpretation,
      profile.futureImplication,
      profile.recommendedIntelligenceAction,
      profile.recommendedOperatingAction,
      profile.nextStrategicQuestion,
      profile.reasoningConfidence,
      'GENERATED',
      'STRATEGIC_MEMORY:' + memoryId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateAutonomousReasoningRows660_(rows);
}

function sciipInferAutonomousReasoningProfile660_(memory) {
  const hypothesisType = sciipExtractFirstAvailable660_(memory, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable660_(memory, [
    'Signal_Category'
  ]);

  const memoryType = sciipExtractFirstAvailable660_(memory, [
    'Memory_Type'
  ]);

  const memoryStatement = sciipExtractFirstAvailable660_(memory, [
    'Memory_Statement'
  ]);

  const strategicPrinciple = sciipExtractFirstAvailable660_(memory, [
    'Strategic_Principle'
  ]);

  const patternToReinforce = sciipExtractFirstAvailable660_(memory, [
    'Pattern_To_Reinforce'
  ]);

  const patternToSuppress = sciipExtractFirstAvailable660_(memory, [
    'Pattern_To_Suppress'
  ]);

  const reasoningInstruction = sciipExtractFirstAvailable660_(memory, [
    'Reasoning_Instruction'
  ]);

  const futureUseCase = sciipExtractFirstAvailable660_(memory, [
    'Future_Use_Case'
  ]);

  const memoryConfidence =
    sciipExtractFirstAvailable660_(memory, [
      'Memory_Confidence'
    ]) || 'LOW';

  let reasoningType = 'GENERAL_AUTONOMOUS_REASONING';
  let reasoningTitle = 'Autonomous reasoning from ' + (signalCategory || 'strategic memory');
  let strategicInterpretation =
    'SCIIP should preserve this memory as context for future hypothesis generation, evidence prioritization, and graph reasoning.';
  let futureImplication =
    'Future intelligence outputs should consider this memory when similar signals appear.';
  let recommendedIntelligenceAction =
    'Use this memory to inform future intelligence requirements, hypotheses, and validation plans.';
  let recommendedOperatingAction =
    'No immediate operating action required. Preserve the reasoning output for downstream scenario and prediction processors.';
  let nextStrategicQuestion =
    'What future signals would confirm that this memory should materially influence SCIIP reasoning?';
  let reasoningConfidence = memoryConfidence;

  const memoryTypeText = String(memoryType || '').toUpperCase();

  if (memoryTypeText === 'REINFORCEMENT_MEMORY') {
    reasoningType = 'REINFORCEMENT_REASONING';
    strategicInterpretation =
      'SCIIP has identified a pattern that should receive greater attention in future reasoning.';
    futureImplication =
      patternToReinforce || 'Similar signals should be more likely to influence future hypothesis generation.';
    recommendedIntelligenceAction =
      'Create or prioritize future intelligence requirements when similar reinforced signals appear.';
    recommendedOperatingAction =
      'Increase reasoning attention to this signal category in future autonomous processing.';
    nextStrategicQuestion =
      'Where else is this reinforced pattern appearing across properties, companies, markets, or system workflows?';
  }

  if (memoryTypeText === 'SUPPRESSION_MEMORY') {
    reasoningType = 'SUPPRESSION_REASONING';
    strategicInterpretation =
      'SCIIP has identified a pattern that should receive less weight unless stronger evidence is present.';
    futureImplication =
      patternToSuppress || 'Similar signals should be treated cautiously in future reasoning.';
    recommendedIntelligenceAction =
      'Require stronger corroborating evidence before escalating similar signals.';
    recommendedOperatingAction =
      'Reduce autonomous escalation of similar weak or previously rejected signals.';
    nextStrategicQuestion =
      'What evidence threshold should be required before this suppressed pattern becomes actionable again?';
  }

  if (memoryTypeText === 'OPERATOR_REVIEW_MEMORY') {
    reasoningType = 'GOVERNED_REASONING';
    strategicInterpretation =
      'SCIIP has identified a reasoning pattern that should not be autonomously resolved without operator review.';
    futureImplication =
      'Similar unresolved or contested signals should be routed to operator review before confidence or weighting changes.';
    recommendedIntelligenceAction =
      'Prepare concise operator-review packets when similar evidence conflicts arise.';
    recommendedOperatingAction =
      'Maintain governance over autonomous calibration and graph confidence changes.';
    nextStrategicQuestion =
      'What operator decision would allow SCIIP to safely automate this reasoning path in the future?';
    reasoningConfidence = 'MEDIUM';
  }

  if (memoryTypeText === 'STABILITY_MEMORY') {
    reasoningType = 'STABILITY_REASONING';
    strategicInterpretation =
      'SCIIP should preserve the signal history but avoid changing model behavior until stronger validated evidence accumulates.';
    futureImplication =
      'Similar future signals should remain at baseline priority unless additional evidence strengthens them.';
    recommendedIntelligenceAction =
      'Continue monitoring similar signals but do not escalate automatically.';
    recommendedOperatingAction =
      'Maintain baseline processor behavior.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    reasoningTitle = 'Property autonomous reasoning';
    nextStrategicQuestion =
      'Which property-level facts or GIS signals would make this reasoning more actionable?';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    reasoningTitle = 'Company autonomous reasoning';
    nextStrategicQuestion =
      'Which company movement, funding, hiring, permit, or facility signals would confirm this reasoning?';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    reasoningTitle = 'Risk autonomous reasoning';
    recommendedIntelligenceAction =
      'Prioritize risk-related intelligence requirements and counterevidence review.';
    recommendedOperatingAction =
      'Route high-impact risk reasoning into future alerting, briefing, or scenario processors.';
    reasoningConfidence = memoryConfidence === 'LOW' ? 'MEDIUM' : memoryConfidence;
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    reasoningTitle = 'Opportunity autonomous reasoning';
    recommendedIntelligenceAction =
      'Prioritize opportunity-related intelligence requirements, target validation, and actionability review.';
    recommendedOperatingAction =
      'Route high-priority opportunity reasoning into future scenario, briefing, or action recommendation processors.';
    reasoningConfidence = memoryConfidence === 'LOW' ? 'MEDIUM' : memoryConfidence;
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    reasoningTitle = 'Operating system autonomous reasoning';
    recommendedOperatingAction =
      'Evaluate whether processor logic, schema design, graph completeness, or workflow automation should be improved.';
    nextStrategicQuestion =
      'What operating-system change would most improve future SCIIP reasoning quality?';
  }

  const reasoningStatement = [
    'Memory type: ' + (memoryType || 'UNKNOWN') + '.',
    'Signal category: ' + (signalCategory || 'UNKNOWN') + '.',
    'Strategic principle: ' + (strategicPrinciple || 'No strategic principle recorded.'),
    'Reasoning instruction: ' + (reasoningInstruction || 'No reasoning instruction recorded.'),
    'Future use case: ' + (futureUseCase || 'No future use case recorded.'),
    'Memory basis: ' + (memoryStatement || 'No memory statement recorded.')
  ].join('\n');

  return {
    reasoningType: reasoningType,
    reasoningTitle: reasoningTitle,
    reasoningStatement: reasoningStatement,
    strategicInterpretation: strategicInterpretation,
    futureImplication: futureImplication,
    recommendedIntelligenceAction: recommendedIntelligenceAction,
    recommendedOperatingAction: recommendedOperatingAction,
    nextStrategicQuestion: nextStrategicQuestion,
    reasoningConfidence: reasoningConfidence
  };
}

function sciipDeduplicateAutonomousReasoningRows660_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(function(row) {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestAutonomousReasoningProcessor() {
  const result =
    sciipRunAutonomousReasoningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousReasoningProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 670_PredictiveScenarioProcessor
 *
 * AUTONOMOUS_REASONING → PREDICTIVE_SCENARIOS
 *
 * Migration note:
 * Preserves original 670 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const PREDICTIVE_SCENARIO_PROCESSOR = '670_PredictiveScenarioProcessor';
const PREDICTIVE_SCENARIOS_SHEET = 'PREDICTIVE_SCENARIOS';

const PREDICTIVE_SCENARIOS_HEADERS = [
  'Scenario_ID',
  'Business_Key',
  'Scenario_Date',
  'Reasoning_ID',
  'Memory_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Reasoning_Type',
  'Scenario_Type',
  'Scenario_Title',
  'Scenario_Statement',
  'Scenario_Driver',
  'Expected_Direction',
  'Probability_Assessment',
  'Strategic_Implication',
  'Market_Implication',
  'Operating_Implication',
  'Early_Indicators',
  'Monitoring_Action',
  'Scenario_Confidence',
  'Scenario_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsurePredictiveScenariosSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    PREDICTIVE_SCENARIOS_SHEET,
    PREDICTIVE_SCENARIOS_HEADERS
  );
}

function sciipRunPredictiveScenarioProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: PREDICTIVE_SCENARIO_PROCESSOR,
    action: 'PREDICTIVE_SCENARIO_BUILD',
    sourceSheet: 'AUTONOMOUS_REASONING',
    targetSheet: PREDICTIVE_SCENARIOS_SHEET,
    ledgerSheet: 'PREDICTIVE_SCENARIOS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const reasoningOutputs = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_REASONING');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: reasoningOutputs.length,
        outputCount: reasoningOutputs.length || 1,
        summary: 'Predictive scenario runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: PREDICTIVE_SCENARIO_PROCESSOR,
          inputSheets: ['AUTONOMOUS_REASONING']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsurePredictiveScenariosSchema();
      const scenarioDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const scenarioBusinessKey = 'PREDICTIVE_SCENARIO|' + scenarioDate;

      if (sciipRuntimeBusinessKeyPrefixExists670_(definition.targetSheet, scenarioBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: PREDICTIVE_SCENARIO_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            scenariosCreated: 0,
            skippedDuplicate: 1,
            scenarioBusinessKey: scenarioBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const reasoningOutputs = sciipGetRuntimeRecordsByDate670_(
        'AUTONOMOUS_REASONING',
        'Reasoning_Date',
        scenarioDate
      );

      if (reasoningOutputs.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: PREDICTIVE_SCENARIO_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            reasoningOutputsReviewed: 0,
            scenariosCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const scenarios = sciipCreatePredictiveScenarios670_({
        businessKey: scenarioBusinessKey,
        scenarioDate: scenarioDate,
        reasoningOutputs: reasoningOutputs,
        processor: PREDICTIVE_SCENARIO_PROCESSOR
      });

      scenarios.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: PREDICTIVE_SCENARIO_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: scenarios.length,
        recordsRead: reasoningOutputs.length,
        processed: scenarios.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          reasoningOutputsReviewed: reasoningOutputs.length,
          scenariosCreated: scenarios.length,
          skippedDuplicate: 0,
          scenarioBusinessKey: scenarioBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists670_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate670_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue670_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue670_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable670_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey670_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreatePredictiveScenarios670_(args) {
  const now = new Date();

  const rows = args.reasoningOutputs.map(function(reasoning) {
    const reasoningId = sciipExtractFirstAvailable670_(reasoning, [
      'Reasoning_ID'
    ]);

    const memoryId = sciipExtractFirstAvailable670_(reasoning, [
      'Memory_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable670_(reasoning, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable670_(reasoning, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable670_(reasoning, [
      'Signal_Category'
    ]);

    const reasoningType = sciipExtractFirstAvailable670_(reasoning, [
      'Reasoning_Type'
    ]);

    const profile =
      sciipInferPredictiveScenarioProfile670_(reasoning);

    const rowKey =
      args.businessKey + '|' + profile.scenarioType + '|' + sciipNormalizeMissionKey670_(reasoningId || memoryId || hypothesisId || profile.scenarioTitle);

    return [
      sciipGenerateId_('SCN'),
      rowKey,
      args.scenarioDate,
      reasoningId,
      memoryId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      reasoningType,
      profile.scenarioType,
      profile.scenarioTitle,
      profile.scenarioStatement,
      profile.scenarioDriver,
      profile.expectedDirection,
      profile.probabilityAssessment,
      profile.strategicImplication,
      profile.marketImplication,
      profile.operatingImplication,
      profile.earlyIndicators,
      profile.monitoringAction,
      profile.scenarioConfidence,
      'ACTIVE_SCENARIO',
      'AUTONOMOUS_REASONING:' + reasoningId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicatePredictiveScenarioRows670_(rows);
}

function sciipInferPredictiveScenarioProfile670_(reasoning) {
  const hypothesisType = sciipExtractFirstAvailable670_(reasoning, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable670_(reasoning, [
    'Signal_Category'
  ]);

  const reasoningType = sciipExtractFirstAvailable670_(reasoning, [
    'Reasoning_Type'
  ]);

  const strategicInterpretation = sciipExtractFirstAvailable670_(reasoning, [
    'Strategic_Interpretation'
  ]);

  const futureImplication = sciipExtractFirstAvailable670_(reasoning, [
    'Future_Implication'
  ]);

  const recommendedIntelligenceAction = sciipExtractFirstAvailable670_(reasoning, [
    'Recommended_Intelligence_Action'
  ]);

  const recommendedOperatingAction = sciipExtractFirstAvailable670_(reasoning, [
    'Recommended_Operating_Action'
  ]);

  const nextStrategicQuestion = sciipExtractFirstAvailable670_(reasoning, [
    'Next_Strategic_Question'
  ]);

  const reasoningConfidence =
    sciipExtractFirstAvailable670_(reasoning, [
      'Reasoning_Confidence'
    ]) || 'LOW';

  let scenarioType = 'GENERAL_MARKET_SCENARIO';
  let scenarioTitle = 'Predictive scenario: ' + (signalCategory || 'general signal');
  let scenarioDriver =
    signalCategory || 'General SCIIP intelligence signal';
  let expectedDirection = 'UNCERTAIN';
  let probabilityAssessment = 'POSSIBLE';
  let strategicImplication =
    futureImplication || 'This scenario may affect future SCIIP reasoning and intelligence prioritization.';
  let marketImplication =
    'Market implication is not yet specific enough for autonomous conclusion.';
  let operatingImplication =
    recommendedOperatingAction || 'Continue monitoring through future SCIIP processors.';
  let earlyIndicators =
    'Additional related signals, repeated evidence patterns, stronger source confirmation, or operator validation.';
  let monitoringAction =
    recommendedIntelligenceAction || 'Monitor for additional evidence and related signals.';
  let scenarioConfidence = reasoningConfidence;

  const reasoningTypeText = String(reasoningType || '').toUpperCase();

  if (reasoningTypeText === 'REINFORCEMENT_REASONING') {
    scenarioType = 'REINFORCED_PATTERN_SCENARIO';
    expectedDirection = 'INCREASING_RELEVANCE';
    probabilityAssessment = reasoningConfidence === 'MEDIUM' ? 'LIKELY' : 'POSSIBLE';
    marketImplication =
      'The underlying signal pattern may become more important if repeated across additional properties, companies, or market events.';
    earlyIndicators =
      'Repeated matching signals, stronger corroborating evidence, additional related hypotheses, or increased confidence from future validation.';
  }

  if (reasoningTypeText === 'SUPPRESSION_REASONING') {
    scenarioType = 'WEAKENED_PATTERN_SCENARIO';
    expectedDirection = 'DECREASING_RELEVANCE';
    probabilityAssessment = 'POSSIBLE';
    marketImplication =
      'The underlying signal pattern may be less reliable unless stronger supporting evidence appears.';
    earlyIndicators =
      'Repeated weak signals without corroboration, rejected hypotheses, contradictory evidence, or declining confidence.';
  }

  if (reasoningTypeText === 'GOVERNED_REASONING') {
    scenarioType = 'OPERATOR_REVIEW_SCENARIO';
    expectedDirection = 'PENDING_OPERATOR_DECISION';
    probabilityAssessment = 'REQUIRES_REVIEW';
    strategicImplication =
      'SCIIP should not autonomously resolve this scenario until operator review clarifies the proper reasoning path.';
    operatingImplication =
      'Route similar future cases to operator review before changing confidence, weight, or graph structure.';
    earlyIndicators =
      'Conflicting evidence, contested validation outcomes, high-priority unresolved reasoning, or repeated review flags.';
    monitoringAction =
      'Prepare operator-review packets and preserve supporting evidence and counterevidence.';
    scenarioConfidence = 'MEDIUM';
  }

  if (reasoningTypeText === 'STABILITY_REASONING') {
    scenarioType = 'STABILITY_SCENARIO';
    expectedDirection = 'BASELINE_CONTINUITY';
    probabilityAssessment = 'POSSIBLE';
    strategicImplication =
      'SCIIP should preserve the signal but avoid changing future model behavior until stronger evidence accumulates.';
    operatingImplication =
      'Maintain baseline processor behavior while monitoring for new evidence.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    scenarioTitle = 'Property predictive scenario';
    scenarioDriver = 'Property-level intelligence signal';
    marketImplication =
      'The scenario may affect property-level opportunity, risk, availability, tenant movement, asset confidence, or GIS-based reasoning.';
    earlyIndicators =
      'New property events, ownership changes, tenant activity, listing changes, GIS attribute updates, power/yard changes, or comparable activity.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    scenarioTitle = 'Company predictive scenario';
    scenarioDriver = 'Company-level intelligence signal';
    marketImplication =
      'The scenario may indicate future occupier movement, expansion, contraction, supplier activity, OEM linkage, or real estate demand.';
    earlyIndicators =
      'Funding, hiring, permits, facility movement, supplier announcements, OEM relationships, lease activity, or operational expansion.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    scenarioTitle = 'Risk predictive scenario';
    scenarioDriver = 'Risk intelligence signal';
    scenarioType = 'RISK_' + scenarioType;
    probabilityAssessment =
      probabilityAssessment === 'REQUIRES_REVIEW' ? probabilityAssessment : 'POSSIBLE';
    strategicImplication =
      'This scenario may expose a measurable risk that should be monitored for severity, timing, affected entities, and mitigation pathway.';
    operatingImplication =
      'Route into risk monitoring, counterevidence collection, and future alerting if repeated or strengthened.';
    earlyIndicators =
      'Negative market signals, vacancy exposure, tenant exposure, regulatory constraints, timing delays, contradictory evidence, or broker-observed weakness.';
    scenarioConfidence = reasoningConfidence === 'LOW' ? 'MEDIUM' : reasoningConfidence;
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    scenarioTitle = 'Opportunity predictive scenario';
    scenarioDriver = 'Opportunity intelligence signal';
    scenarioType = 'OPPORTUNITY_' + scenarioType;
    strategicImplication =
      'This scenario may indicate an actionable opportunity if demand, timing, ownership fit, pricing, and target relevance are confirmed.';
    operatingImplication =
      'Route into opportunity monitoring, target validation, and future action recommendation if strengthened.';
    earlyIndicators =
      'Tenant demand, pricing gaps, ownership fit, limited supply, expansion signals, off-market movement, or repeated opportunity hypotheses.';
    scenarioConfidence = reasoningConfidence === 'LOW' ? 'MEDIUM' : reasoningConfidence;
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    scenarioTitle = 'Operating system predictive scenario';
    scenarioDriver = 'SCIIP operating-system signal';
    scenarioType = 'SYSTEM_' + scenarioType;
    marketImplication =
      'Market implication is indirect; the scenario primarily affects SCIIP reasoning quality and operating performance.';
    operatingImplication =
      'Evaluate whether processor logic, schema design, graph completeness, workflow automation, or operator routing should change.';
    earlyIndicators =
      'Repeated processor friction, skipped records, duplicate patterns, missing fields, graph gaps, failed validation paths, or operator feedback.';
  }

  const scenarioStatement = [
    'SCIIP generated a forward-looking scenario from autonomous reasoning.',
    'Reasoning type: ' + (reasoningType || 'UNKNOWN') + '.',
    'Signal category: ' + (signalCategory || 'UNKNOWN') + '.',
    'Strategic interpretation: ' + (strategicInterpretation || 'No strategic interpretation recorded.'),
    'Future implication: ' + (futureImplication || 'No future implication recorded.'),
    'Next strategic question: ' + (nextStrategicQuestion || 'No next strategic question recorded.')
  ].join('\n');

  return {
    scenarioType: scenarioType,
    scenarioTitle: scenarioTitle,
    scenarioStatement: scenarioStatement,
    scenarioDriver: scenarioDriver,
    expectedDirection: expectedDirection,
    probabilityAssessment: probabilityAssessment,
    strategicImplication: strategicImplication,
    marketImplication: marketImplication,
    operatingImplication: operatingImplication,
    earlyIndicators: earlyIndicators,
    monitoringAction: monitoringAction,
    scenarioConfidence: scenarioConfidence
  };
}

function sciipDeduplicatePredictiveScenarioRows670_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(function(row) {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestPredictiveScenarioProcessor() {
  const result =
    sciipRunPredictiveScenarioProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestPredictiveScenarioProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 680_ScenarioMonitoringProcessor
 *
 * PREDICTIVE_SCENARIOS → SCENARIO_MONITORING
 *
 * Migration note:
 * Preserves original 680 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const SCENARIO_MONITORING_PROCESSOR = '680_ScenarioMonitoringProcessor';
const SCENARIO_MONITORING_SHEET = 'SCENARIO_MONITORING';

const SCENARIO_MONITORING_HEADERS = [
  'Monitoring_ID',
  'Business_Key',
  'Monitoring_Date',
  'Scenario_ID',
  'Reasoning_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Scenario_Type',
  'Monitoring_Type',
  'Monitoring_Title',
  'Monitoring_Objective',
  'Trigger_Condition',
  'Early_Indicators',
  'Primary_Monitoring_Source',
  'Secondary_Monitoring_Source',
  'Escalation_Condition',
  'Recommended_Response',
  'Monitoring_Frequency',
  'Monitoring_Priority',
  'Monitoring_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureScenarioMonitoringSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    SCENARIO_MONITORING_SHEET,
    SCENARIO_MONITORING_HEADERS
  );
}

function sciipRunScenarioMonitoringProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: SCENARIO_MONITORING_PROCESSOR,
    action: 'SCENARIO_MONITORING_BUILD',
    sourceSheet: 'PREDICTIVE_SCENARIOS',
    targetSheet: SCENARIO_MONITORING_SHEET,
    ledgerSheet: 'SCENARIO_MONITORING_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const scenarios = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('PREDICTIVE_SCENARIOS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: scenarios.length,
        outputCount: scenarios.length || 1,
        summary: 'Scenario monitoring runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: SCENARIO_MONITORING_PROCESSOR,
          inputSheets: ['PREDICTIVE_SCENARIOS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureScenarioMonitoringSchema();
      const monitoringDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const monitoringBusinessKey = 'SCENARIO_MONITORING|' + monitoringDate;

      if (sciipRuntimeBusinessKeyPrefixExists680_(definition.targetSheet, monitoringBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: SCENARIO_MONITORING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            monitoringRequirementsCreated: 0,
            skippedDuplicate: 1,
            monitoringBusinessKey: monitoringBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const scenarios = sciipGetRuntimeRecordsByDate680_(
        'PREDICTIVE_SCENARIOS',
        'Scenario_Date',
        monitoringDate
      );

      if (scenarios.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: SCENARIO_MONITORING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            scenariosReviewed: 0,
            monitoringRequirementsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const monitoringRequirements = sciipCreateScenarioMonitoringRequirements680_({
        businessKey: monitoringBusinessKey,
        monitoringDate: monitoringDate,
        scenarios: scenarios,
        processor: SCENARIO_MONITORING_PROCESSOR
      });

      monitoringRequirements.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: SCENARIO_MONITORING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: monitoringRequirements.length,
        recordsRead: scenarios.length,
        processed: monitoringRequirements.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          scenariosReviewed: scenarios.length,
          monitoringRequirementsCreated: monitoringRequirements.length,
          skippedDuplicate: 0,
          monitoringBusinessKey: monitoringBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists680_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate680_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue680_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue680_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable680_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey680_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateScenarioMonitoringRequirements680_(args) {
  const now = new Date();

  const rows = args.scenarios.map(function(scenario) {
    const scenarioId = sciipExtractFirstAvailable680_(scenario, [
      'Scenario_ID'
    ]);

    const reasoningId = sciipExtractFirstAvailable680_(scenario, [
      'Reasoning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable680_(scenario, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable680_(scenario, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable680_(scenario, [
      'Signal_Category'
    ]);

    const scenarioType = sciipExtractFirstAvailable680_(scenario, [
      'Scenario_Type'
    ]);

    const profile =
      sciipInferScenarioMonitoringProfile680_(scenario);

    const rowKey =
      `${args.businessKey}|${profile.monitoringType}|${sciipNormalizeMissionKey680_(scenarioId || reasoningId || hypothesisId || profile.monitoringTitle)}`;

    return [
      sciipGenerateId_('MON'),
      rowKey,
      args.monitoringDate,
      scenarioId,
      reasoningId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      scenarioType,
      profile.monitoringType,
      profile.monitoringTitle,
      profile.monitoringObjective,
      profile.triggerCondition,
      profile.earlyIndicators,
      profile.primaryMonitoringSource,
      profile.secondaryMonitoringSource,
      profile.escalationCondition,
      profile.recommendedResponse,
      profile.monitoringFrequency,
      profile.monitoringPriority,
      'ACTIVE_MONITORING_REQUIREMENT',
      `PREDICTIVE_SCENARIOS:${scenarioId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateScenarioMonitoringRows680_(rows);
}

function sciipInferScenarioMonitoringProfile680_(scenario) {
  const hypothesisType = sciipExtractFirstAvailable680_(scenario, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable680_(scenario, [
    'Signal_Category'
  ]);

  const scenarioType = sciipExtractFirstAvailable680_(scenario, [
    'Scenario_Type'
  ]);

  const scenarioTitle = sciipExtractFirstAvailable680_(scenario, [
    'Scenario_Title'
  ]);

  const probabilityAssessment = sciipExtractFirstAvailable680_(scenario, [
    'Probability_Assessment'
  ]);

  const strategicImplication = sciipExtractFirstAvailable680_(scenario, [
    'Strategic_Implication'
  ]);

  const marketImplication = sciipExtractFirstAvailable680_(scenario, [
    'Market_Implication'
  ]);

  const operatingImplication = sciipExtractFirstAvailable680_(scenario, [
    'Operating_Implication'
  ]);

  const earlyIndicators =
    sciipExtractFirstAvailable680_(scenario, [
      'Early_Indicators'
    ]) || 'Repeated signals, corroborating evidence, counterevidence, or operator-confirmed changes.';

  const monitoringAction =
    sciipExtractFirstAvailable680_(scenario, [
      'Monitoring_Action'
    ]) || 'Monitor for additional evidence and related signals.';

  const scenarioConfidence =
    sciipExtractFirstAvailable680_(scenario, [
      'Scenario_Confidence'
    ]) || 'LOW';

  let monitoringType = 'GENERAL_SCENARIO_MONITORING';
  let monitoringTitle = `Monitor scenario: ${scenarioTitle || signalCategory || 'general scenario'}`;
  let monitoringObjective =
    'Monitor whether the predictive scenario strengthens, weakens, or requires operator review.';
  let triggerCondition =
    'Trigger review when matching signals repeat, confidence increases, or new source evidence materially changes the scenario.';
  let primaryMonitoringSource =
    'PREDICTIVE_SCENARIOS; AUTONOMOUS_REASONING; STRATEGIC_MEMORY';
  let secondaryMonitoringSource =
    'Broker intelligence; property events; company research; market observations; operator notes';
  let escalationCondition =
    'Escalate when evidence moves the scenario from possible to likely, when risk/opportunity impact becomes material, or when conflicting evidence requires review.';
  let recommendedResponse =
    monitoringAction;
  let monitoringFrequency = 'DAILY';
  let monitoringPriority =
    scenarioConfidence === 'MEDIUM' ? 'MEDIUM' : 'LOW';

  const scenarioTypeText = String(scenarioType || '').toUpperCase();
  const probabilityText = String(probabilityAssessment || '').toUpperCase();

  if (
    scenarioTypeText.includes('REINFORCED') ||
    probabilityText === 'LIKELY'
  ) {
    monitoringType = 'REINFORCED_PATTERN_MONITORING';
    monitoringObjective =
      'Monitor whether the reinforced pattern continues to appear across new intelligence records.';
    triggerCondition =
      'Trigger escalation when two or more new related signals support the same reinforced pattern.';
    escalationCondition =
      'Escalate into intelligence requirement or opportunity/risk review if the reinforced pattern repeats with credible evidence.';
    monitoringPriority = 'HIGH';
  }

  if (
    scenarioTypeText.includes('WEAKENED') ||
    scenarioTypeText.includes('SUPPRESSION')
  ) {
    monitoringType = 'WEAKENED_PATTERN_MONITORING';
    monitoringObjective =
      'Monitor whether a weakened or suppressed pattern remains weak or is revived by stronger evidence.';
    triggerCondition =
      'Trigger review only when stronger corroborating evidence appears against the previously weakened pattern.';
    escalationCondition =
      'Escalate only if new source evidence is materially stronger than the evidence that caused suppression.';
    monitoringPriority = 'MEDIUM';
  }

  if (
    scenarioTypeText.includes('OPERATOR_REVIEW') ||
    probabilityText === 'REQUIRES_REVIEW'
  ) {
    monitoringType = 'OPERATOR_REVIEW_MONITORING';
    monitoringObjective =
      'Monitor unresolved or governed scenarios that require operator review before autonomous escalation.';
    triggerCondition =
      'Trigger operator review when conflicting evidence, contested validation, or high-priority unresolved reasoning appears.';
    escalationCondition =
      'Escalate directly to operator review before changing graph confidence, signal weights, or processor behavior.';
    recommendedResponse =
      'Prepare operator-review packet with scenario, reasoning, memory, evidence basis, and monitoring indicators.';
    monitoringPriority = 'HIGH';
  }

  if (scenarioTypeText.includes('STABILITY')) {
    monitoringType = 'STABILITY_MONITORING';
    monitoringObjective =
      'Monitor stable scenarios without changing processor behavior unless stronger evidence appears.';
    triggerCondition =
      'Trigger review only when new evidence materially changes scenario probability or confidence.';
    escalationCondition =
      'Escalate only after repeated corroborating evidence accumulates.';
    monitoringFrequency = 'DAILY';
    monitoringPriority = 'LOW';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    monitoringType = `PROPERTY_${monitoringType}`;
    monitoringTitle = 'Property scenario monitoring';
    primaryMonitoringSource =
      'PROPERTY_REGISTRY; PROPERTY_EVENTS; ASSET_NODE; GIS_DATA';
    secondaryMonitoringSource =
      'Broker notes; AIR CRE data; public records; listing materials; ownership records';
    triggerCondition =
      'Trigger review when property events, ownership changes, tenant activity, availability, GIS attributes, power, yard, or comparable activity changes.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    monitoringType = `COMPANY_${monitoringType}`;
    monitoringTitle = 'Company scenario monitoring';
    primaryMonitoringSource =
      'COMPANY_INTELLIGENCE; RESEARCH_MISSIONS; KNOWLEDGE_GRAPH_ENRICHMENT';
    secondaryMonitoringSource =
      'Company website; news; permits; LinkedIn; funding data; broker intelligence';
    triggerCondition =
      'Trigger review when company funding, hiring, permits, facility movement, supplier relationships, OEM linkages, or occupier signals change.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    monitoringType = `RISK_${monitoringType}`;
    monitoringTitle = 'Risk scenario monitoring';
    primaryMonitoringSource =
      'RISK_INTELLIGENCE_GRAPH; PROPERTY_EVENTS; STRATEGIC_INTELLIGENCE';
    secondaryMonitoringSource =
      'Market reports; public records; broker intelligence; operator notes';
    escalationCondition =
      'Escalate immediately when severity, affected entities, timing risk, or mitigation urgency becomes material.';
    recommendedResponse =
      'Route into risk review, counterevidence collection, and possible alerting.';
    monitoringPriority = 'HIGH';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    monitoringType = `OPPORTUNITY_${monitoringType}`;
    monitoringTitle = 'Opportunity scenario monitoring';
    primaryMonitoringSource =
      'OPPORTUNITY_INTELLIGENCE_GRAPH; STRATEGIC_INTELLIGENCE; HYPOTHESES';
    secondaryMonitoringSource =
      'Broker intelligence; listing data; tenant activity; ownership research';
    escalationCondition =
      'Escalate when demand, timing, target fit, ownership fit, or pricing gap becomes actionable.';
    recommendedResponse =
      'Route into opportunity review, target validation, and possible action recommendation.';
    monitoringPriority = 'HIGH';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    monitoringType = `SYSTEM_${monitoringType}`;
    monitoringTitle = 'Operating system scenario monitoring';
    primaryMonitoringSource =
      'SYSTEM_HEALTH; PROCESSOR_LOGS; AUTONOMOUS_MODEL_CALIBRATION';
    secondaryMonitoringSource =
      'Operator console; command center; daily reports; processor execution logs';
    triggerCondition =
      'Trigger review when processor friction, skipped records, duplicate patterns, missing fields, graph gaps, or operator feedback repeats.';
    recommendedResponse =
      'Route into processor improvement, schema review, workflow automation, or graph completeness review.';
  }

  const monitoringObjectiveText = [
    monitoringObjective,
    `Strategic implication: ${strategicImplication || 'No strategic implication recorded.'}`,
    `Market implication: ${marketImplication || 'No market implication recorded.'}`,
    `Operating implication: ${operatingImplication || 'No operating implication recorded.'}`
  ].join('\n');

  return {
    monitoringType,
    monitoringTitle,
    monitoringObjective: monitoringObjectiveText,
    triggerCondition,
    earlyIndicators,
    primaryMonitoringSource,
    secondaryMonitoringSource,
    escalationCondition,
    recommendedResponse,
    monitoringFrequency,
    monitoringPriority
  };
}

function sciipDeduplicateScenarioMonitoringRows680_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(function(row) {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestScenarioMonitoringProcessor() {
  const result =
    sciipRunScenarioMonitoringProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestScenarioMonitoringProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 690_MonitoringSignalDetectionProcessor
 *
 * SCENARIO_MONITORING → MONITORING_SIGNALS
 *
 * Migration note:
 * Preserves original 690 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const MONITORING_SIGNAL_DETECTION_PROCESSOR = '690_MonitoringSignalDetectionProcessor';
const MONITORING_SIGNALS_SHEET =
  'MONITORING_SIGNALS';

const MONITORING_SIGNALS_HEADERS = [
  'Monitoring_Signal_ID',
  'Business_Key',
  'Signal_Date',
  'Monitoring_ID',
  'Scenario_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Monitoring_Type',
  'Detected_Signal_Type',
  'Detected_Signal_Title',
  'Detected_Signal_Statement',
  'Detection_Basis',
  'Trigger_Condition',
  'Trigger_State',
  'Escalation_Readiness',
  'Recommended_Action_Route',
  'Signal_Confidence',
  'Signal_Priority',
  'Signal_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];


function sciipEnsureMonitoringSignalsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    MONITORING_SIGNALS_SHEET,
    MONITORING_SIGNALS_HEADERS
  );
}

function sciipRunMonitoringSignalDetectionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: MONITORING_SIGNAL_DETECTION_PROCESSOR,
    action: 'MONITORING_SIGNAL_DETECTION_BUILD',
    sourceSheet: 'SCENARIO_MONITORING',
    targetSheet: MONITORING_SIGNALS_SHEET,
    ledgerSheet: 'MONITORING_SIGNAL_DETECTION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const monitoringRequirements = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCENARIO_MONITORING');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: monitoringRequirements.length,
        outputCount: monitoringRequirements.length || 1,
        summary: 'Monitoring signal detection runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: MONITORING_SIGNAL_DETECTION_PROCESSOR,
          inputSheets: ['SCENARIO_MONITORING']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureMonitoringSignalsSchema();
      const signalDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const monitoringSignalBusinessKey = 'MONITORING_SIGNAL|' + signalDate;

      if (sciipRuntimeBusinessKeyPrefixExists690_(definition.targetSheet, monitoringSignalBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: MONITORING_SIGNAL_DETECTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            monitoringSignalsCreated: 0,
            skippedDuplicate: 1,
            monitoringSignalBusinessKey: monitoringSignalBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const monitoringRequirements = sciipGetRuntimeRecordsByDate690_(
        'SCENARIO_MONITORING',
        'Monitoring_Date',
        signalDate
      );

      if (monitoringRequirements.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: MONITORING_SIGNAL_DETECTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            monitoringRequirementsReviewed: 0,
            monitoringSignalsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const signals = sciipCreateMonitoringSignals690_({
        businessKey: monitoringSignalBusinessKey,
        signalDate: signalDate,
        monitoringRequirements: monitoringRequirements,
        processor: MONITORING_SIGNAL_DETECTION_PROCESSOR
      });

      signals.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: MONITORING_SIGNAL_DETECTION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: signals.length,
        recordsRead: monitoringRequirements.length,
        processed: signals.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          monitoringRequirementsReviewed: monitoringRequirements.length,
          monitoringSignalsCreated: signals.length,
          skippedDuplicate: 0,
          monitoringSignalBusinessKey: monitoringSignalBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists690_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate690_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue690_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue690_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable690_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey690_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateMonitoringSignals690_(args) {
  const now = new Date();

  const rows = args.monitoringRequirements.map(monitoring => {
    const monitoringId = sciipExtractFirstAvailable690_(monitoring, [
      'Monitoring_ID'
    ]);

    const scenarioId = sciipExtractFirstAvailable690_(monitoring, [
      'Scenario_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable690_(monitoring, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable690_(monitoring, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable690_(monitoring, [
      'Signal_Category'
    ]);

    const monitoringType = sciipExtractFirstAvailable690_(monitoring, [
      'Monitoring_Type'
    ]);

    const profile =
      sciipInferMonitoringSignalProfile690_(monitoring);

    const rowKey =
      `${args.businessKey}|${profile.detectedSignalType}|${sciipNormalizeMissionKey690_(monitoringId || scenarioId || hypothesisId || profile.detectedSignalTitle)}`;

    return [
      sciipGenerateId_('MSG'),
      rowKey,
      args.signalDate,
      monitoringId,
      scenarioId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      monitoringType,
      profile.detectedSignalType,
      profile.detectedSignalTitle,
      profile.detectedSignalStatement,
      profile.detectionBasis,
      profile.triggerCondition,
      profile.triggerState,
      profile.escalationReadiness,
      profile.recommendedActionRoute,
      profile.signalConfidence,
      profile.signalPriority,
      'DETECTED_MONITORING_SIGNAL',
      `SCENARIO_MONITORING:${monitoringId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateMonitoringSignalRows690_(rows);
}

function sciipInferMonitoringSignalProfile690_(monitoring) {
  const hypothesisType = sciipExtractFirstAvailable690_(monitoring, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable690_(monitoring, [
    'Signal_Category'
  ]);

  const monitoringType = sciipExtractFirstAvailable690_(monitoring, [
    'Monitoring_Type'
  ]);

  const monitoringTitle = sciipExtractFirstAvailable690_(monitoring, [
    'Monitoring_Title'
  ]);

  const monitoringObjective = sciipExtractFirstAvailable690_(monitoring, [
    'Monitoring_Objective'
  ]);

  const triggerCondition = sciipExtractFirstAvailable690_(monitoring, [
    'Trigger_Condition'
  ]);

  const earlyIndicators = sciipExtractFirstAvailable690_(monitoring, [
    'Early_Indicators'
  ]);

  const escalationCondition = sciipExtractFirstAvailable690_(monitoring, [
    'Escalation_Condition'
  ]);

  const recommendedResponse = sciipExtractFirstAvailable690_(monitoring, [
    'Recommended_Response'
  ]);

  const monitoringPriority =
    sciipExtractFirstAvailable690_(monitoring, [
      'Monitoring_Priority'
    ]) || 'MEDIUM';

  let detectedSignalType = 'EXPECTED_MONITORING_SIGNAL';
  let detectedSignalTitle = `Monitoring signal: ${monitoringTitle || signalCategory || 'general signal'}`;
  let triggerState = 'WATCHING';
  let escalationReadiness = 'NOT_READY';
  let recommendedActionRoute = 'CONTINUE_MONITORING';
  let signalConfidence = monitoringPriority === 'HIGH' ? 'MEDIUM' : 'LOW';
  let signalPriority = monitoringPriority;

  const monitoringTypeText = String(monitoringType || '').toUpperCase();

  if (monitoringTypeText.includes('REINFORCED')) {
    detectedSignalType = 'REINFORCED_PATTERN_SIGNAL';
    triggerState = 'WATCHING_FOR_REPEAT_CONFIRMATION';
    escalationReadiness = 'READY_IF_REPEATED';
    recommendedActionRoute = 'ROUTE_TO_INTELLIGENCE_REQUIREMENT_IF_CONFIRMED';
    signalPriority = 'HIGH';
  }

  if (monitoringTypeText.includes('WEAKENED')) {
    detectedSignalType = 'WEAKENED_PATTERN_SIGNAL';
    triggerState = 'WATCHING_FOR_STRONGER_CORROBORATION';
    escalationReadiness = 'NOT_READY';
    recommendedActionRoute = 'REQUIRE_STRONGER_EVIDENCE_BEFORE_ESCALATION';
  }

  if (monitoringTypeText.includes('OPERATOR_REVIEW')) {
    detectedSignalType = 'OPERATOR_REVIEW_SIGNAL';
    triggerState = 'REVIEW_REQUIRED_IF_CONFLICT_REPEATS';
    escalationReadiness = 'READY_FOR_OPERATOR_REVIEW';
    recommendedActionRoute = 'ROUTE_TO_OPERATOR_REVIEW';
    signalConfidence = 'MEDIUM';
    signalPriority = 'HIGH';
  }

  if (monitoringTypeText.includes('STABILITY')) {
    detectedSignalType = 'STABILITY_SIGNAL';
    triggerState = 'BASELINE_MONITORING';
    escalationReadiness = 'NOT_READY';
    recommendedActionRoute = 'CONTINUE_BASELINE_MONITORING';
    signalPriority = 'LOW';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    detectedSignalType = `PROPERTY_${detectedSignalType}`;
    detectedSignalTitle = 'Property monitoring signal';
    recommendedActionRoute =
      'ROUTE_TO_PROPERTY_REVIEW_IF_TRIGGERED';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    detectedSignalType = `COMPANY_${detectedSignalType}`;
    detectedSignalTitle = 'Company monitoring signal';
    recommendedActionRoute =
      'ROUTE_TO_COMPANY_RESEARCH_IF_TRIGGERED';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    detectedSignalType = `RISK_${detectedSignalType}`;
    detectedSignalTitle = 'Risk monitoring signal';
    escalationReadiness = 'READY_FOR_RISK_REVIEW';
    recommendedActionRoute =
      'ROUTE_TO_RISK_REVIEW_OR_ALERTING';
    signalPriority = 'HIGH';
    signalConfidence = signalConfidence === 'LOW' ? 'MEDIUM' : signalConfidence;
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    detectedSignalType = `OPPORTUNITY_${detectedSignalType}`;
    detectedSignalTitle = 'Opportunity monitoring signal';
    escalationReadiness = 'READY_FOR_OPPORTUNITY_REVIEW';
    recommendedActionRoute =
      'ROUTE_TO_OPPORTUNITY_REVIEW_OR_ACTION_RECOMMENDATION';
    signalPriority = 'HIGH';
    signalConfidence = signalConfidence === 'LOW' ? 'MEDIUM' : signalConfidence;
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    detectedSignalType = `SYSTEM_${detectedSignalType}`;
    detectedSignalTitle = 'Operating system monitoring signal';
    recommendedActionRoute =
      'ROUTE_TO_SYSTEM_IMPROVEMENT_REVIEW';
  }

  const detectionBasis = [
    `Monitoring type: ${monitoringType || 'UNKNOWN'}.`,
    `Signal category: ${signalCategory || 'UNKNOWN'}.`,
    `Monitoring objective: ${monitoringObjective || 'No monitoring objective recorded.'}`,
    `Early indicators: ${earlyIndicators || 'No early indicators recorded.'}`,
    `Escalation condition: ${escalationCondition || 'No escalation condition recorded.'}`,
    `Recommended response: ${recommendedResponse || 'No recommended response recorded.'}`
  ].join('\n');

  const detectedSignalStatement = [
    'SCIIP generated a monitoring signal from an active scenario monitoring requirement.',
    `Detected signal type: ${detectedSignalType}.`,
    `Trigger state: ${triggerState}.`,
    `Escalation readiness: ${escalationReadiness}.`,
    `Recommended action route: ${recommendedActionRoute}.`
  ].join('\n');

  return {
    detectedSignalType,
    detectedSignalTitle,
    detectedSignalStatement,
    detectionBasis,
    triggerCondition,
    triggerState,
    escalationReadiness,
    recommendedActionRoute,
    signalConfidence,
    signalPriority
  };
}

function sciipDeduplicateMonitoringSignalRows690_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}


function sciipTestMonitoringSignalDetectionProcessor() {
  const result =
    sciipRunMonitoringSignalDetectionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestMonitoringSignalDetectionProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 700_AutonomousActionRoutingProcessor
 *
 * MONITORING_SIGNALS → AUTONOMOUS_ACTION_ROUTING
 *
 * Migration note:
 * Preserves original 700 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const AUTONOMOUS_ACTION_ROUTING_PROCESSOR = '700_AutonomousActionRoutingProcessor';
const AUTONOMOUS_ACTION_ROUTING_HEADERS = [
  'Action_Route_ID',
  'Business_Key',
  'Route_Date',
  'Monitoring_Signal_ID',
  'Monitoring_ID',
  'Scenario_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Detected_Signal_Type',
  'Recommended_Action_Route',
  'Action_Route_Type',
  'Action_Route_Title',
  'Action_Route_Objective',
  'Destination_Workflow',
  'Routing_Reason',
  'Routing_Priority',
  'Escalation_Status',
  'Assigned_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousActionRoutingSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_ACTION_ROUTING',
    AUTONOMOUS_ACTION_ROUTING_HEADERS
  );
}

function sciipRunAutonomousActionRoutingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR,
    action: 'AUTONOMOUS_ACTION_ROUTING_BUILD',
    sourceSheet: 'MONITORING_SIGNALS',
    targetSheet: 'AUTONOMOUS_ACTION_ROUTING',
    ledgerSheet: 'AUTONOMOUS_ACTION_ROUTING_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const monitoringSignals = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('MONITORING_SIGNALS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: monitoringSignals.length,
        outputCount: monitoringSignals.length || 1,
        summary: 'Autonomous action routing runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR,
          inputSheets: ['MONITORING_SIGNALS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousActionRoutingSchema();
      const routeDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const autonomousActionRoutingBusinessKey = 'AUTONOMOUS_ACTION_ROUTING|' + routeDate;

      if (sciipRuntimeBusinessKeyPrefixExists700_(definition.targetSheet, autonomousActionRoutingBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionRoutesCreated: 0,
            skippedDuplicate: 1,
            autonomousActionRoutingBusinessKey: autonomousActionRoutingBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const monitoringSignals = sciipGetRuntimeRecordsByDate700_(
        'MONITORING_SIGNALS',
        'Signal_Date',
        routeDate
      );

      if (monitoringSignals.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            monitoringSignalsReviewed: 0,
            actionRoutesCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const routes = sciipCreateAutonomousActionRoutes700_({
        businessKey: autonomousActionRoutingBusinessKey,
        routeDate: routeDate,
        monitoringSignals: monitoringSignals,
        processor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR
      });

      routes.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: routes.length,
        recordsRead: monitoringSignals.length,
        processed: routes.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          monitoringSignalsReviewed: monitoringSignals.length,
          actionRoutesCreated: routes.length,
          skippedDuplicate: 0,
          autonomousActionRoutingBusinessKey: autonomousActionRoutingBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists700_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate700_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue700_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue700_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable700_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey700_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipGenerateId700_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipCreateAutonomousActionRoutes700_(args) {
  const now = new Date();

  const rows = args.monitoringSignals.map(signal => {
    const monitoringSignalId = sciipExtractFirstAvailable700_(signal, [
      'Monitoring_Signal_ID'
    ]);

    const monitoringId = sciipExtractFirstAvailable700_(signal, [
      'Monitoring_ID'
    ]);

    const scenarioId = sciipExtractFirstAvailable700_(signal, [
      'Scenario_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable700_(signal, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable700_(signal, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable700_(signal, [
      'Signal_Category'
    ]);

    const detectedSignalType = sciipExtractFirstAvailable700_(signal, [
      'Detected_Signal_Type'
    ]);

    const recommendedActionRoute = sciipExtractFirstAvailable700_(signal, [
      'Recommended_Action_Route'
    ]);

    const profile =
      sciipInferAutonomousActionRouteProfile700_(signal);

    const rowKey =
      `${args.businessKey}|${profile.actionRouteType}|${sciipNormalizeMissionKey700_(monitoringSignalId || monitoringId || scenarioId || hypothesisId || profile.actionRouteTitle)}`;

    return [
      sciipGenerateId700_('ART'),
      rowKey,
      args.routeDate,
      monitoringSignalId,
      monitoringId,
      scenarioId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      detectedSignalType,
      recommendedActionRoute,
      profile.actionRouteType,
      profile.actionRouteTitle,
      profile.actionRouteObjective,
      profile.destinationWorkflow,
      profile.routingReason,
      profile.routingPriority,
      profile.escalationStatus,
      'PENDING_ROUTE_REVIEW',
      `MONITORING_SIGNALS:${monitoringSignalId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateAutonomousActionRoutingRows700_(rows);
}

function sciipInferAutonomousActionRouteProfile700_(signal) {
  const hypothesisType = sciipExtractFirstAvailable700_(signal, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable700_(signal, [
    'Signal_Category'
  ]);

  const detectedSignalType = sciipExtractFirstAvailable700_(signal, [
    'Detected_Signal_Type'
  ]);

  const detectedSignalStatement = sciipExtractFirstAvailable700_(signal, [
    'Detected_Signal_Statement'
  ]);

  const detectionBasis = sciipExtractFirstAvailable700_(signal, [
    'Detection_Basis'
  ]);

  const triggerState = sciipExtractFirstAvailable700_(signal, [
    'Trigger_State'
  ]);

  const escalationReadiness = sciipExtractFirstAvailable700_(signal, [
    'Escalation_Readiness'
  ]);

  const recommendedActionRoute = sciipExtractFirstAvailable700_(signal, [
    'Recommended_Action_Route'
  ]);

  const signalConfidence =
    sciipExtractFirstAvailable700_(signal, [
      'Signal_Confidence'
    ]) || 'LOW';

  const signalPriority =
    sciipExtractFirstAvailable700_(signal, [
      'Signal_Priority'
    ]) || 'MEDIUM';

  let actionRouteType = 'MONITORING_CONTINUATION_ROUTE';
  let actionRouteTitle = 'Continue monitoring route';
  let actionRouteObjective =
    'Continue monitoring the signal until stronger evidence or trigger conditions appear.';
  let destinationWorkflow = 'SCENARIO_MONITORING';
  let escalationStatus = 'NOT_ESCALATED';
  let routingPriority = signalPriority;

  const routeText = String(recommendedActionRoute || '').toUpperCase();
  const signalText = String(detectedSignalType || '').toUpperCase();
  const escalationText = String(escalationReadiness || '').toUpperCase();

  if (
    routeText.includes('OPERATOR_REVIEW') ||
    signalText.includes('OPERATOR_REVIEW') ||
    escalationText.includes('OPERATOR')
  ) {
    actionRouteType = 'OPERATOR_REVIEW_ROUTE';
    actionRouteTitle = 'Operator review route';
    actionRouteObjective =
      'Route signal to operator review before autonomous confidence, graph, signal weight, or processor behavior changes are made.';
    destinationWorkflow = 'OPERATOR_CONSOLE';
    escalationStatus = 'ESCALATED_TO_OPERATOR_REVIEW';
    routingPriority = 'HIGH';
  }

  if (
    routeText.includes('INTELLIGENCE_REQUIREMENT') ||
    routeText.includes('INTELLIGENCE')
  ) {
    actionRouteType = 'INTELLIGENCE_REQUIREMENT_ROUTE';
    actionRouteTitle = 'Intelligence requirement route';
    actionRouteObjective =
      'Route signal into a new or prioritized intelligence requirement for further research and validation.';
    destinationWorkflow = 'INTELLIGENCE_REQUIREMENTS';
    escalationStatus = 'ESCALATED_TO_INTELLIGENCE_REQUIREMENT';
  }

  if (
    routeText.includes('PROPERTY_REVIEW') ||
    hypothesisType === 'PROPERTY_HYPOTHESIS'
  ) {
    actionRouteType = 'PROPERTY_REVIEW_ROUTE';
    actionRouteTitle = 'Property review route';
    actionRouteObjective =
      'Route signal into property review for asset facts, GIS data, ownership, tenant activity, availability, and comparable evidence.';
    destinationWorkflow = 'PROPERTY_REVIEW_QUEUE';
  }

  if (
    routeText.includes('COMPANY_RESEARCH') ||
    hypothesisType === 'COMPANY_HYPOTHESIS'
  ) {
    actionRouteType = 'COMPANY_RESEARCH_ROUTE';
    actionRouteTitle = 'Company research route';
    actionRouteObjective =
      'Route signal into company research for funding, hiring, permits, supplier/OEM relationships, occupier movement, and real estate demand evidence.';
    destinationWorkflow = 'COMPANY_RESEARCH_QUEUE';
  }

  if (
    routeText.includes('RISK') ||
    hypothesisType === 'RISK_HYPOTHESIS'
  ) {
    actionRouteType = 'RISK_REVIEW_ROUTE';
    actionRouteTitle = 'Risk review route';
    actionRouteObjective =
      'Route signal into risk review, counterevidence collection, severity assessment, and potential alerting.';
    destinationWorkflow = 'RISK_REVIEW_QUEUE';
    escalationStatus = 'ESCALATED_TO_RISK_REVIEW';
    routingPriority = 'HIGH';
  }

  if (
    routeText.includes('OPPORTUNITY') ||
    hypothesisType === 'OPPORTUNITY_HYPOTHESIS'
  ) {
    actionRouteType = 'OPPORTUNITY_REVIEW_ROUTE';
    actionRouteTitle = 'Opportunity review route';
    actionRouteObjective =
      'Route signal into opportunity review, target validation, timing review, and possible action recommendation.';
    destinationWorkflow = 'OPPORTUNITY_REVIEW_QUEUE';
    escalationStatus = 'ESCALATED_TO_OPPORTUNITY_REVIEW';
    routingPriority = 'HIGH';
  }

  if (
    routeText.includes('SYSTEM_IMPROVEMENT') ||
    hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS'
  ) {
    actionRouteType = 'SYSTEM_IMPROVEMENT_ROUTE';
    actionRouteTitle = 'System improvement route';
    actionRouteObjective =
      'Route signal into processor improvement, schema review, workflow automation, or graph completeness review.';
    destinationWorkflow = 'SYSTEM_IMPROVEMENT_QUEUE';
  }

  if (
    routeText.includes('CONTINUE') ||
    routeText.includes('BASELINE')
  ) {
    actionRouteType = 'MONITORING_CONTINUATION_ROUTE';
    actionRouteTitle = 'Continue monitoring route';
    actionRouteObjective =
      'Keep this signal under active monitoring without escalation until stronger evidence appears.';
    destinationWorkflow = 'SCENARIO_MONITORING';
    escalationStatus = 'NOT_ESCALATED';
  }

  const routingReason = [
    `Detected signal type: ${detectedSignalType || 'UNKNOWN'}.`,
    `Signal category: ${signalCategory || 'UNKNOWN'}.`,
    `Trigger state: ${triggerState || 'UNKNOWN'}.`,
    `Escalation readiness: ${escalationReadiness || 'UNKNOWN'}.`,
    `Recommended action route: ${recommendedActionRoute || 'UNKNOWN'}.`,
    `Signal confidence: ${signalConfidence}.`,
    `Detection basis: ${detectionBasis || 'No detection basis recorded.'}`,
    `Signal statement: ${detectedSignalStatement || 'No signal statement recorded.'}`
  ].join('\n');

  return {
    actionRouteType,
    actionRouteTitle,
    actionRouteObjective,
    destinationWorkflow,
    routingReason,
    routingPriority,
    escalationStatus
  };
}

function sciipDeduplicateAutonomousActionRoutingRows700_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestAutonomousActionRoutingProcessor() {
  const result =
    sciipRunAutonomousActionRoutingProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousActionRoutingProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 710_ActionQueueProcessor
 *
 * AUTONOMOUS_ACTION_ROUTING → ACTION_QUEUE
 *
 * Migration note:
 * Preserves original 710 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetActionQueueProcessorName710_() {
  return '710_ActionQueueProcessor';
}

function sciipGetActionQueueHeaders710_() {
  return [
    'Action_Item_ID',
    'Business_Key',
    'Queue_Date',
    'Action_Route_ID',
    'Monitoring_Signal_ID',
    'Scenario_ID',
    'Hypothesis_ID',
    'Hypothesis_Type',
    'Action_Route_Type',
    'Destination_Workflow',
    'Action_Item_Type',
    'Action_Title',
    'Action_Objective',
    'Execution_Instructions',
    'Required_Input',
    'Expected_Output',
    'Priority',
    'Due_Status',
    'Queue_Status',
    'Assigned_Owner',
    'Source_Record',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureActionQueueSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'ACTION_QUEUE',
    sciipGetActionQueueHeaders710_()
  );
}

function sciipRunActionQueueProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetActionQueueProcessorName710_(),
    action: 'ACTION_QUEUE_BUILD',
    sourceSheet: 'AUTONOMOUS_ACTION_ROUTING',
    targetSheet: 'ACTION_QUEUE',
    ledgerSheet: 'ACTION_QUEUE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const actionRoutes = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_ACTION_ROUTING');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: actionRoutes.length,
        outputCount: actionRoutes.length || 1,
        summary: 'Action queue runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetActionQueueProcessorName710_(),
          inputSheets: ['AUTONOMOUS_ACTION_ROUTING']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureActionQueueSchema();
      const queueDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const actionQueueBusinessKey = 'ACTION_QUEUE|' + queueDate;

      if (sciipRuntimeBusinessKeyPrefixExists710_(definition.targetSheet, actionQueueBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetActionQueueProcessorName710_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionItemsCreated: 0,
            skippedDuplicate: 1,
            actionQueueBusinessKey: actionQueueBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const actionRoutes = sciipGetRuntimeRecordsByDate710_(
        'AUTONOMOUS_ACTION_ROUTING',
        'Route_Date',
        queueDate
      );

      if (actionRoutes.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetActionQueueProcessorName710_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionRoutesReviewed: 0,
            actionItemsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const actionItems = sciipCreateActionQueueItems710_({
        businessKey: actionQueueBusinessKey,
        queueDate: queueDate,
        actionRoutes: actionRoutes,
        processor: sciipGetActionQueueProcessorName710_()
      });

      actionItems.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetActionQueueProcessorName710_(),
        businessKey: context.businessKey,
        recordsCreated: actionItems.length,
        recordsRead: actionRoutes.length,
        processed: actionItems.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          actionRoutesReviewed: actionRoutes.length,
          actionItemsCreated: actionItems.length,
          skippedDuplicate: 0,
          actionQueueBusinessKey: actionQueueBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists710_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate710_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue710_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue710_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable710_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey710_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipGenerateId710_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipCreateActionQueueItems710_(args) {
  const now = new Date();

  const rows = args.actionRoutes.map(route => {
    const actionRouteId = sciipExtractFirstAvailable710_(route, [
      'Action_Route_ID'
    ]);

    const monitoringSignalId = sciipExtractFirstAvailable710_(route, [
      'Monitoring_Signal_ID'
    ]);

    const scenarioId = sciipExtractFirstAvailable710_(route, [
      'Scenario_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable710_(route, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable710_(route, [
      'Hypothesis_Type'
    ]);

    const actionRouteType = sciipExtractFirstAvailable710_(route, [
      'Action_Route_Type'
    ]);

    const destinationWorkflow = sciipExtractFirstAvailable710_(route, [
      'Destination_Workflow'
    ]);

    const profile =
      sciipInferActionQueueProfile710_(route);

    const rowKey =
      `${args.businessKey}|${profile.actionItemType}|${sciipNormalizeMissionKey710_(actionRouteId || monitoringSignalId || scenarioId || hypothesisId || profile.actionTitle)}`;

    return [
      sciipGenerateId710_('AQI'),
      rowKey,
      args.queueDate,
      actionRouteId,
      monitoringSignalId,
      scenarioId,
      hypothesisId,
      hypothesisType,
      actionRouteType,
      destinationWorkflow,
      profile.actionItemType,
      profile.actionTitle,
      profile.actionObjective,
      profile.executionInstructions,
      profile.requiredInput,
      profile.expectedOutput,
      profile.priority,
      profile.dueStatus,
      'QUEUED',
      profile.assignedOwner,
      `AUTONOMOUS_ACTION_ROUTING:${actionRouteId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateActionQueueRows710_(rows);
}

function sciipInferActionQueueProfile710_(route) {
  const hypothesisType = sciipExtractFirstAvailable710_(route, [
    'Hypothesis_Type'
  ]);

  const actionRouteType = sciipExtractFirstAvailable710_(route, [
    'Action_Route_Type'
  ]);

  const actionRouteTitle = sciipExtractFirstAvailable710_(route, [
    'Action_Route_Title'
  ]);

  const actionRouteObjective = sciipExtractFirstAvailable710_(route, [
    'Action_Route_Objective'
  ]);

  const destinationWorkflow = sciipExtractFirstAvailable710_(route, [
    'Destination_Workflow'
  ]);

  const routingReason = sciipExtractFirstAvailable710_(route, [
    'Routing_Reason'
  ]);

  const routingPriority =
    sciipExtractFirstAvailable710_(route, [
      'Routing_Priority'
    ]) || 'MEDIUM';

  let actionItemType = 'GENERAL_ACTION_ITEM';
  let actionTitle = actionRouteTitle || 'Review routed SCIIP action';
  let actionObjective =
    actionRouteObjective || 'Review routed action and determine next step.';
  let executionInstructions =
    'Review the routed signal, source record, routing reason, and determine whether additional research, review, or escalation is required.';
  let requiredInput =
    'Action route record, source monitoring signal, scenario context, and routing reason.';
  let expectedOutput =
    'Completed review with decision, notes, and next action.';
  let priority = routingPriority;
  let dueStatus = routingPriority === 'HIGH' ? 'DUE_NOW' : 'NORMAL';
  let assignedOwner = 'OPERATOR';

  const routeText = String(actionRouteType || '').toUpperCase();
  const workflowText = String(destinationWorkflow || '').toUpperCase();

  if (
    routeText.includes('OPERATOR_REVIEW') ||
    workflowText.includes('OPERATOR')
  ) {
    actionItemType = 'OPERATOR_REVIEW_ACTION';
    actionTitle = 'Operator review required';
    executionInstructions =
      'Review the routed signal before SCIIP changes graph confidence, signal weights, processor behavior, or action recommendations.';
    expectedOutput =
      'Operator decision: approve, reject, defer, or request additional evidence.';
    priority = 'HIGH';
    dueStatus = 'DUE_NOW';
    assignedOwner = 'OPERATOR';
  }

  if (
    routeText.includes('INTELLIGENCE_REQUIREMENT') ||
    workflowText.includes('INTELLIGENCE')
  ) {
    actionItemType = 'INTELLIGENCE_REQUIREMENT_ACTION';
    actionTitle = 'Create or prioritize intelligence requirement';
    executionInstructions =
      'Convert the routed signal into a new or prioritized intelligence requirement for research and validation.';
    expectedOutput =
      'New or updated intelligence requirement linked to the originating signal.';
    assignedOwner = 'SCIIP_INTELLIGENCE_PIPELINE';
  }

  if (
    routeText.includes('PROPERTY_REVIEW') ||
    hypothesisType === 'PROPERTY_HYPOTHESIS'
  ) {
    actionItemType = 'PROPERTY_REVIEW_ACTION';
    actionTitle = 'Property review action';
    executionInstructions =
      'Review property registry, property events, GIS data, ownership, tenant activity, availability, power, yard, and comparable evidence.';
    expectedOutput =
      'Property review result with updated facts, evidence notes, and recommended graph update.';
    assignedOwner = 'PROPERTY_REVIEW_QUEUE';
  }

  if (
    routeText.includes('COMPANY_RESEARCH') ||
    hypothesisType === 'COMPANY_HYPOTHESIS'
  ) {
    actionItemType = 'COMPANY_RESEARCH_ACTION';
    actionTitle = 'Company research action';
    executionInstructions =
      'Research company funding, hiring, permits, facility movement, supplier/OEM relationships, occupier activity, and real estate demand signals.';
    expectedOutput =
      'Company research result with evidence, confidence, and recommended follow-up.';
    assignedOwner = 'COMPANY_RESEARCH_QUEUE';
  }

  if (
    routeText.includes('RISK') ||
    hypothesisType === 'RISK_HYPOTHESIS'
  ) {
    actionItemType = 'RISK_REVIEW_ACTION';
    actionTitle = 'Risk review action';
    executionInstructions =
      'Assess risk severity, affected entities, timing, counterevidence, mitigation options, and whether alerting is required.';
    expectedOutput =
      'Risk review result with severity, affected entities, mitigation path, and alert recommendation.';
    priority = 'HIGH';
    dueStatus = 'DUE_NOW';
    assignedOwner = 'RISK_REVIEW_QUEUE';
  }

  if (
    routeText.includes('OPPORTUNITY') ||
    hypothesisType === 'OPPORTUNITY_HYPOTHESIS'
  ) {
    actionItemType = 'OPPORTUNITY_REVIEW_ACTION';
    actionTitle = 'Opportunity review action';
    executionInstructions =
      'Assess demand, timing, target fit, ownership fit, pricing gap, actionability, and recommended pursuit path.';
    expectedOutput =
      'Opportunity review result with target, timing, confidence, and recommended action.';
    priority = 'HIGH';
    dueStatus = 'DUE_NOW';
    assignedOwner = 'OPPORTUNITY_REVIEW_QUEUE';
  }

  if (
    routeText.includes('SYSTEM_IMPROVEMENT') ||
    hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS'
  ) {
    actionItemType = 'SYSTEM_IMPROVEMENT_ACTION';
    actionTitle = 'System improvement review';
    executionInstructions =
      'Review processor logic, schema design, graph completeness, workflow automation, duplicate patterns, skipped records, and operator feedback.';
    expectedOutput =
      'System improvement recommendation with affected processor, schema, or workflow.';
    assignedOwner = 'SYSTEM_IMPROVEMENT_QUEUE';
  }

  if (
    routeText.includes('MONITORING_CONTINUATION')
  ) {
    actionItemType = 'MONITORING_CONTINUATION_ACTION';
    actionTitle = 'Continue monitoring action';
    executionInstructions =
      'Keep the signal under monitoring and do not escalate until stronger evidence or trigger conditions appear.';
    expectedOutput =
      'Monitoring retained with no escalation.';
    priority = 'LOW';
    dueStatus = 'MONITOR';
    assignedOwner = 'SCENARIO_MONITORING';
  }

  requiredInput = [
    requiredInput,
    `Destination workflow: ${destinationWorkflow || 'UNKNOWN'}.`,
    `Routing reason: ${routingReason || 'No routing reason recorded.'}`
  ].join('\n');

  return {
    actionItemType,
    actionTitle,
    actionObjective,
    executionInstructions,
    requiredInput,
    expectedOutput,
    priority,
    dueStatus,
    assignedOwner
  };
}

function sciipDeduplicateActionQueueRows710_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestActionQueueProcessor() {
  const result =
    sciipRunActionQueueProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionQueueProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 720_ActionDigestProcessor
 *
 * ACTION_QUEUE → ACTION_DIGESTS
 *
 * Migration note:
 * Preserves original 720 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetActionDigestProcessorName720_() {
  return '720_ActionDigestProcessor';
}

function sciipGetActionDigestHeaders720_() {
  return [
    'Action_Digest_ID',
    'Business_Key',
    'Digest_Date',
    'Actions_Reviewed',
    'High_Priority_Count',
    'Medium_Priority_Count',
    'Low_Priority_Count',
    'Due_Now_Count',
    'Operator_Review_Count',
    'Risk_Action_Count',
    'Opportunity_Action_Count',
    'Property_Action_Count',
    'Company_Action_Count',
    'System_Action_Count',
    'Digest_Title',
    'Digest_Summary',
    'Top_Action_Focus',
    'Recommended_Operator_Response',
    'Digest_Status',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureActionDigestsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'ACTION_DIGESTS',
    sciipGetActionDigestHeaders720_()
  );
}

function sciipRunActionDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetActionDigestProcessorName720_(),
    action: 'ACTION_DIGEST_BUILD',
    sourceSheet: 'ACTION_QUEUE',
    targetSheet: 'ACTION_DIGESTS',
    ledgerSheet: 'ACTION_DIGESTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const actionItems = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('ACTION_QUEUE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: actionItems.length,
        outputCount: actionItems.length ? 1 : 0,
        summary: 'Action digest runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetActionDigestProcessorName720_(),
          inputSheets: ['ACTION_QUEUE']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureActionDigestsSchema();
      const digestDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const actionDigestBusinessKey = 'ACTION_DIGEST|' + digestDate;

      if (sciipRuntimeBusinessKeyPrefixExists720_(definition.targetSheet, actionDigestBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetActionDigestProcessorName720_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionsReviewed: 0,
            actionDigestsCreated: 0,
            skippedDuplicate: 1,
            actionDigestBusinessKey: actionDigestBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const actionItems = sciipGetRuntimeRecordsByDate720_(
        'ACTION_QUEUE',
        'Queue_Date',
        digestDate
      );

      if (actionItems.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetActionDigestProcessorName720_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionsReviewed: 0,
            actionDigestsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const digest = sciipCreateActionDigest720_({
        businessKey: actionDigestBusinessKey,
        digestDate: digestDate,
        actionItems: actionItems,
        processor: sciipGetActionDigestProcessorName720_()
      });

      outputSheet.appendRow(digest);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetActionDigestProcessorName720_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: actionItems.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          actionsReviewed: actionItems.length,
          actionDigestsCreated: 1,
          skippedDuplicate: 0,
          actionDigestBusinessKey: actionDigestBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists720_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate720_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue720_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue720_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable720_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipGenerateId720_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipCreateActionDigest720_(args) {
  const now = new Date();

  const profile = sciipInferActionDigestProfile720_(args.actionItems);

  return [
    sciipGenerateId720_('ADG'),
    args.businessKey,
    args.digestDate,
    args.actionItems.length,
    profile.highPriorityCount,
    profile.mediumPriorityCount,
    profile.lowPriorityCount,
    profile.dueNowCount,
    profile.operatorReviewCount,
    profile.riskActionCount,
    profile.opportunityActionCount,
    profile.propertyActionCount,
    profile.companyActionCount,
    profile.systemActionCount,
    profile.digestTitle,
    profile.digestSummary,
    profile.topActionFocus,
    profile.recommendedOperatorResponse,
    'GENERATED',
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferActionDigestProfile720_(actionItems) {
  let highPriorityCount = 0;
  let mediumPriorityCount = 0;
  let lowPriorityCount = 0;
  let dueNowCount = 0;
  let operatorReviewCount = 0;
  let riskActionCount = 0;
  let opportunityActionCount = 0;
  let propertyActionCount = 0;
  let companyActionCount = 0;
  let systemActionCount = 0;

  const topItems = [];

  actionItems.forEach(function(item) {
    const priority = String(
      sciipExtractFirstAvailable720_(item, ['Priority'])
    ).toUpperCase();

    const dueStatus = String(
      sciipExtractFirstAvailable720_(item, ['Due_Status'])
    ).toUpperCase();

    const actionType = String(
      sciipExtractFirstAvailable720_(item, ['Action_Item_Type'])
    ).toUpperCase();

    const title = sciipExtractFirstAvailable720_(item, [
      'Action_Title'
    ]);

    const objective = sciipExtractFirstAvailable720_(item, [
      'Action_Objective'
    ]);

    if (priority === 'HIGH') highPriorityCount++;
    else if (priority === 'LOW') lowPriorityCount++;
    else mediumPriorityCount++;

    if (dueStatus === 'DUE_NOW') dueNowCount++;

    if (actionType.indexOf('OPERATOR') !== -1) operatorReviewCount++;
    if (actionType.indexOf('RISK') !== -1) riskActionCount++;
    if (actionType.indexOf('OPPORTUNITY') !== -1) opportunityActionCount++;
    if (actionType.indexOf('PROPERTY') !== -1) propertyActionCount++;
    if (actionType.indexOf('COMPANY') !== -1) companyActionCount++;
    if (actionType.indexOf('SYSTEM') !== -1) systemActionCount++;

    if (
      priority === 'HIGH' ||
      dueStatus === 'DUE_NOW' ||
      actionType.indexOf('RISK') !== -1 ||
      actionType.indexOf('OPPORTUNITY') !== -1 ||
      actionType.indexOf('OPERATOR') !== -1
    ) {
      topItems.push(
        '- ' + (title || actionType) + ': ' + (objective || 'No objective recorded.')
      );
    }
  });

  let digestTitle = 'Daily Action Digest';
  let topActionFocus =
    'Review queued action items and prioritize high-priority or due-now work.';
  let recommendedOperatorResponse =
    'Review the action queue, complete high-priority items first, and update queue status after review.';

  if (dueNowCount > 0 || highPriorityCount > 0) {
    digestTitle = 'Daily Action Digest — High Priority Review Required';
    topActionFocus =
      'High-priority or due-now action items require operator attention.';
    recommendedOperatorResponse =
      'Start with due-now and high-priority action items, especially risk, opportunity, and operator-review routes.';
  }

  if (riskActionCount > 0) {
    topActionFocus =
      'Risk-related actions are present and should be reviewed for severity, affected entities, timing, and mitigation path.';
  }

  if (opportunityActionCount > 0 && riskActionCount === 0) {
    topActionFocus =
      'Opportunity-related actions are present and should be reviewed for timing, target fit, ownership fit, and actionability.';
  }

  if (operatorReviewCount > 0) {
    recommendedOperatorResponse =
      'Resolve operator-review items before SCIIP applies autonomous confidence, weighting, graph, or processor changes.';
  }

  const digestSummary = [
    'SCIIP reviewed ' + actionItems.length + ' queued action item(s).',
    'Priority mix: ' + highPriorityCount + ' high, ' + mediumPriorityCount + ' medium, ' + lowPriorityCount + ' low.',
    'Due now: ' + dueNowCount + '.',
    'Workflow mix: ' + operatorReviewCount + ' operator review, ' + riskActionCount + ' risk, ' + opportunityActionCount + ' opportunity, ' + propertyActionCount + ' property, ' + companyActionCount + ' company, ' + systemActionCount + ' system.',
    '',
    'Top action items:',
    topItems.length ? topItems.join('\n') : '- No high-priority action items identified.'
  ].join('\n');

  return {
    highPriorityCount: highPriorityCount,
    mediumPriorityCount: mediumPriorityCount,
    lowPriorityCount: lowPriorityCount,
    dueNowCount: dueNowCount,
    operatorReviewCount: operatorReviewCount,
    riskActionCount: riskActionCount,
    opportunityActionCount: opportunityActionCount,
    propertyActionCount: propertyActionCount,
    companyActionCount: companyActionCount,
    systemActionCount: systemActionCount,
    digestTitle: digestTitle,
    digestSummary: digestSummary,
    topActionFocus: topActionFocus,
    recommendedOperatorResponse: recommendedOperatorResponse
  };
}

function sciipTestActionDigestProcessor() {
  const result = sciipRunActionDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionDigestProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 730_OperatorBriefingProcessor
 *
 * ACTION_DIGESTS → OPERATOR_BRIEFINGS
 *
 * Migration note:
 * Preserves original 730 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetOperatorBriefingProcessorName730_() {
  return '730_OperatorBriefingProcessor';
}

function sciipGetOperatorBriefingsHeaders730_() {
  return [
    'Operator_Briefing_ID',
    'Business_Key',
    'Briefing_Date',
    'Action_Digest_ID',
    'Actions_Reviewed',
    'High_Priority_Count',
    'Due_Now_Count',
    'Operator_Review_Count',
    'Risk_Action_Count',
    'Opportunity_Action_Count',
    'Briefing_Title',
    'Executive_Brief',
    'Priority_Assessment',
    'Operator_Decision_Focus',
    'Recommended_Operating_Posture',
    'Command_Center_Message',
    'Next_Best_Action',
    'Briefing_Status',
    'Source_Record',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureOperatorBriefingsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'OPERATOR_BRIEFINGS',
    sciipGetOperatorBriefingsHeaders730_()
  );
}

function sciipRunOperatorBriefingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetOperatorBriefingProcessorName730_(),
    action: 'OPERATOR_BRIEFING_BUILD',
    sourceSheet: 'ACTION_DIGESTS',
    targetSheet: 'OPERATOR_BRIEFINGS',
    ledgerSheet: 'OPERATOR_BRIEFINGS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const actionDigests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('ACTION_DIGESTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: actionDigests.length,
        outputCount: actionDigests.length ? 1 : 0,
        summary: 'Operator briefing runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetOperatorBriefingProcessorName730_(),
          inputSheets: ['ACTION_DIGESTS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureOperatorBriefingsSchema();
      const briefingDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const operatorBriefingBusinessKey = 'OPERATOR_BRIEFING|' + briefingDate;

      if (sciipRuntimeBusinessKeyPrefixExists730_(definition.targetSheet, operatorBriefingBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetOperatorBriefingProcessorName730_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionDigestsReviewed: 0,
            operatorBriefingsCreated: 0,
            skippedDuplicate: 1,
            operatorBriefingBusinessKey: operatorBriefingBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const actionDigests = sciipGetRuntimeRecordsByDate730_(
        'ACTION_DIGESTS',
        'Digest_Date',
        briefingDate
      );

      if (actionDigests.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetOperatorBriefingProcessorName730_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionDigestsReviewed: 0,
            operatorBriefingsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const briefing = sciipCreateOperatorBriefing730_({
        businessKey: operatorBriefingBusinessKey,
        briefingDate: briefingDate,
        actionDigest: actionDigests[0],
        processor: sciipGetOperatorBriefingProcessorName730_()
      });

      outputSheet.appendRow(briefing);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetOperatorBriefingProcessorName730_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: actionDigests.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          actionDigestsReviewed: actionDigests.length,
          operatorBriefingsCreated: 1,
          skippedDuplicate: 0,
          operatorBriefingBusinessKey: operatorBriefingBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists730_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate730_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue730_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue730_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable730_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipGenerateId730_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipCreateOperatorBriefing730_(args) {
  const now = new Date();
  const digest = args.actionDigest;

  const actionDigestId = sciipExtractFirstAvailable730_(digest, [
    'Action_Digest_ID'
  ]);

  const profile = sciipInferOperatorBriefingProfile730_(digest);

  return [
    sciipGenerateId730_('OBR'),
    args.businessKey,
    args.briefingDate,
    actionDigestId,
    sciipExtractFirstAvailable730_(digest, ['Actions_Reviewed']),
    sciipExtractFirstAvailable730_(digest, ['High_Priority_Count']),
    sciipExtractFirstAvailable730_(digest, ['Due_Now_Count']),
    sciipExtractFirstAvailable730_(digest, ['Operator_Review_Count']),
    sciipExtractFirstAvailable730_(digest, ['Risk_Action_Count']),
    sciipExtractFirstAvailable730_(digest, ['Opportunity_Action_Count']),
    profile.briefingTitle,
    profile.executiveBrief,
    profile.priorityAssessment,
    profile.operatorDecisionFocus,
    profile.recommendedOperatingPosture,
    profile.commandCenterMessage,
    profile.nextBestAction,
    'GENERATED',
    'ACTION_DIGESTS:' + actionDigestId,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferOperatorBriefingProfile730_(digest) {
  const actionsReviewed = Number(
    sciipExtractFirstAvailable730_(digest, ['Actions_Reviewed']) || 0
  );

  const highPriorityCount = Number(
    sciipExtractFirstAvailable730_(digest, ['High_Priority_Count']) || 0
  );

  const dueNowCount = Number(
    sciipExtractFirstAvailable730_(digest, ['Due_Now_Count']) || 0
  );

  const operatorReviewCount = Number(
    sciipExtractFirstAvailable730_(digest, ['Operator_Review_Count']) || 0
  );

  const riskActionCount = Number(
    sciipExtractFirstAvailable730_(digest, ['Risk_Action_Count']) || 0
  );

  const opportunityActionCount = Number(
    sciipExtractFirstAvailable730_(digest, ['Opportunity_Action_Count']) || 0
  );

  const digestSummary = sciipExtractFirstAvailable730_(digest, [
    'Digest_Summary'
  ]);

  const topActionFocus = sciipExtractFirstAvailable730_(digest, [
    'Top_Action_Focus'
  ]);

  const recommendedOperatorResponse = sciipExtractFirstAvailable730_(digest, [
    'Recommended_Operator_Response'
  ]);

  let briefingTitle = 'SCIIP Operator Briefing';
  let priorityAssessment =
    'Normal operating posture. Review queued actions in priority order.';
  let operatorDecisionFocus =
    'Determine whether any queued actions require manual review, escalation, or additional evidence.';
  let recommendedOperatingPosture =
    'CONTINUE_NORMAL_OPERATIONS';
  let commandCenterMessage =
    'SCIIP has generated an operator briefing from the daily action digest.';
  let nextBestAction =
    'Review the action queue and update action statuses after completion.';

  if (highPriorityCount > 0 || dueNowCount > 0) {
    briefingTitle = 'SCIIP Operator Briefing — Priority Actions Required';
    priorityAssessment =
      highPriorityCount + ' high-priority action(s) and ' + dueNowCount + ' due-now action(s) require attention.';
    recommendedOperatingPosture =
      'PRIORITY_REVIEW_MODE';
    nextBestAction =
      'Review due-now and high-priority action items before lower-priority monitoring items.';
  }

  if (operatorReviewCount > 0) {
    operatorDecisionFocus =
      'Operator-review items must be resolved before SCIIP applies autonomous graph confidence, signal weighting, calibration, or processor behavior changes.';
    recommendedOperatingPosture =
      'OPERATOR_GOVERNANCE_MODE';
    nextBestAction =
      'Resolve operator-review items first, then proceed to risk, opportunity, property, company, or system queues.';
  }

  if (riskActionCount > 0) {
    priorityAssessment =
      'Risk-related action items are present and should be reviewed for severity, timing, affected entities, and mitigation path.';
    recommendedOperatingPosture =
      'RISK_REVIEW_MODE';
  }

  if (opportunityActionCount > 0 && riskActionCount === 0) {
    priorityAssessment =
      'Opportunity-related action items are present and should be reviewed for timing, target fit, ownership fit, pricing gap, and actionability.';
    recommendedOperatingPosture =
      'OPPORTUNITY_REVIEW_MODE';
  }

  const executiveBrief = [
    'SCIIP reviewed ' + actionsReviewed + ' action item(s) from the daily action digest.',
    'High-priority: ' + highPriorityCount + '. Due now: ' + dueNowCount + '. Operator review: ' + operatorReviewCount + '.',
    'Risk actions: ' + riskActionCount + '. Opportunity actions: ' + opportunityActionCount + '.',
    '',
    'Digest focus: ' + (topActionFocus || 'No focus recorded.'),
    '',
    'Recommended response: ' + (recommendedOperatorResponse || 'No response recorded.'),
    '',
    'Digest summary:\n' + (digestSummary || 'No digest summary recorded.')
  ].join('\n');

  commandCenterMessage = [
    commandCenterMessage,
    'Operating posture: ' + recommendedOperatingPosture + '.',
    'Operating posture: ' + recommendedOperatingPosture + '.',
    'Decision focus: ' + operatorDecisionFocus,
    'Next best action: ' + nextBestAction
  ].join('\n');

  return {
    briefingTitle: briefingTitle,
    executiveBrief: executiveBrief,
    priorityAssessment: priorityAssessment,
    operatorDecisionFocus: operatorDecisionFocus,
    recommendedOperatingPosture: recommendedOperatingPosture,
    commandCenterMessage: commandCenterMessage,
    nextBestAction: nextBestAction
  };
}

function sciipTestOperatorBriefingProcessor() {
  const result = sciipRunOperatorBriefingProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestOperatorBriefingProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 740_CommandCenterUpdateProcessor
 *
 * OPERATOR_BRIEFINGS → COMMAND_CENTER_UPDATES
 *
 * Migration note:
 * Preserves original 740 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetCommandCenterUpdateProcessorName740_() {
  return '740_CommandCenterUpdateProcessor';
}

function sciipGetCommandCenterUpdatesHeaders740_() {
  return [
    'Command_Update_ID',
    'Business_Key',
    'Update_Date',
    'Operator_Briefing_ID',
    'Briefing_Title',
    'Recommended_Operating_Posture',
    'Priority_Assessment',
    'Operator_Decision_Focus',
    'Next_Best_Action',
    'Update_Type',
    'Update_Title',
    'Command_Status',
    'Command_Message',
    'Primary_Focus',
    'Required_Operator_Action',
    'Visibility_Level',
    'Update_Priority',
    'Update_Status',
    'Source_Record',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureCommandCenterUpdatesSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'COMMAND_CENTER_UPDATES',
    sciipGetCommandCenterUpdatesHeaders740_()
  );
}

function sciipRunCommandCenterUpdateProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetCommandCenterUpdateProcessorName740_(),
    action: 'COMMAND_CENTER_UPDATE_BUILD',
    sourceSheet: 'OPERATOR_BRIEFINGS',
    targetSheet: 'COMMAND_CENTER_UPDATES',
    ledgerSheet: 'COMMAND_CENTER_UPDATES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const operatorBriefings = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('OPERATOR_BRIEFINGS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: operatorBriefings.length,
        outputCount: operatorBriefings.length ? 1 : 0,
        summary: 'Command center update runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetCommandCenterUpdateProcessorName740_(),
          inputSheets: ['OPERATOR_BRIEFINGS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureCommandCenterUpdatesSchema();
      const updateDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const commandCenterUpdateBusinessKey = 'COMMAND_CENTER_UPDATE|' + updateDate;

      if (sciipRuntimeBusinessKeyPrefixExists740_(definition.targetSheet, commandCenterUpdateBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetCommandCenterUpdateProcessorName740_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            operatorBriefingsReviewed: 0,
            commandCenterUpdatesCreated: 0,
            skippedDuplicate: 1,
            commandCenterUpdateBusinessKey: commandCenterUpdateBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const operatorBriefings = sciipGetRuntimeRecordsByDate740_(
        'OPERATOR_BRIEFINGS',
        'Briefing_Date',
        updateDate
      );

      if (operatorBriefings.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetCommandCenterUpdateProcessorName740_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            operatorBriefingsReviewed: 0,
            commandCenterUpdatesCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const update = sciipCreateCommandCenterUpdate740_({
        businessKey: commandCenterUpdateBusinessKey,
        updateDate: updateDate,
        operatorBriefing: operatorBriefings[0],
        processor: sciipGetCommandCenterUpdateProcessorName740_()
      });

      outputSheet.appendRow(update);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetCommandCenterUpdateProcessorName740_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: operatorBriefings.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          operatorBriefingsReviewed: operatorBriefings.length,
          commandCenterUpdatesCreated: 1,
          skippedDuplicate: 0,
          commandCenterUpdateBusinessKey: commandCenterUpdateBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists740_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate740_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue740_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue740_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable740_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipGenerateId740_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipCreateCommandCenterUpdate740_(args) {
  const now = new Date();

  const briefing = args.operatorBriefing;

  const operatorBriefingId = sciipExtractFirstAvailable740_(briefing, [
    'Operator_Briefing_ID'
  ]);

  const profile = sciipInferCommandCenterUpdateProfile740_(briefing);

  return [
    sciipGenerateId740_('CCU'),
    args.businessKey,
    args.updateDate,
    operatorBriefingId,
    sciipExtractFirstAvailable740_(briefing, ['Briefing_Title']),
    sciipExtractFirstAvailable740_(briefing, ['Recommended_Operating_Posture']),
    sciipExtractFirstAvailable740_(briefing, ['Priority_Assessment']),
    sciipExtractFirstAvailable740_(briefing, ['Operator_Decision_Focus']),
    sciipExtractFirstAvailable740_(briefing, ['Next_Best_Action']),
    profile.updateType,
    profile.updateTitle,
    profile.commandStatus,
    profile.commandMessage,
    profile.primaryFocus,
    profile.requiredOperatorAction,
    profile.visibilityLevel,
    profile.updatePriority,
    'PUBLISHED_TO_COMMAND_CENTER',
    'OPERATOR_BRIEFINGS:' + operatorBriefingId,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferCommandCenterUpdateProfile740_(briefing) {
  const briefingTitle = sciipExtractFirstAvailable740_(briefing, [
    'Briefing_Title'
  ]);

  const operatingPosture = sciipExtractFirstAvailable740_(briefing, [
    'Recommended_Operating_Posture'
  ]);

  const priorityAssessment = sciipExtractFirstAvailable740_(briefing, [
    'Priority_Assessment'
  ]);

  const operatorDecisionFocus = sciipExtractFirstAvailable740_(briefing, [
    'Operator_Decision_Focus'
  ]);

  const commandCenterMessage = sciipExtractFirstAvailable740_(briefing, [
    'Command_Center_Message'
  ]);

  const nextBestAction = sciipExtractFirstAvailable740_(briefing, [
    'Next_Best_Action'
  ]);

  let updateType = 'STANDARD_COMMAND_UPDATE';
  let updateTitle = briefingTitle || 'SCIIP Command Center Update';
  let commandStatus = 'NORMAL';
  let primaryFocus =
    'Review current action queue and continue normal SCIIP operations.';
  let requiredOperatorAction =
    nextBestAction || 'Review command center update and action queue.';
  let visibilityLevel = 'OPERATOR';
  let updatePriority = 'MEDIUM';

  const postureText = String(operatingPosture || '').toUpperCase();

  if (postureText.includes('PRIORITY_REVIEW')) {
    updateType = 'PRIORITY_COMMAND_UPDATE';
    commandStatus = 'PRIORITY_REVIEW_REQUIRED';
    primaryFocus =
      'High-priority or due-now action items require operator attention.';
    updatePriority = 'HIGH';
  }

  if (postureText.includes('OPERATOR_GOVERNANCE')) {
    updateType = 'GOVERNANCE_COMMAND_UPDATE';
    commandStatus = 'OPERATOR_GOVERNANCE_REQUIRED';
    primaryFocus =
      'Operator-review items must be resolved before SCIIP changes confidence, weights, graph structure, or processor behavior.';
    updatePriority = 'HIGH';
  }

  if (postureText.includes('RISK_REVIEW')) {
    updateType = 'RISK_COMMAND_UPDATE';
    commandStatus = 'RISK_REVIEW_REQUIRED';
    primaryFocus =
      'Risk-related actions require review for severity, timing, affected entities, and mitigation path.';
    updatePriority = 'HIGH';
  }

  if (postureText.includes('OPPORTUNITY_REVIEW')) {
    updateType = 'OPPORTUNITY_COMMAND_UPDATE';
    commandStatus = 'OPPORTUNITY_REVIEW_REQUIRED';
    primaryFocus =
      'Opportunity-related actions require review for timing, target fit, ownership fit, pricing gap, and actionability.';
    updatePriority = 'HIGH';
  }

  if (postureText.includes('CONTINUE_NORMAL')) {
    updateType = 'NORMAL_COMMAND_UPDATE';
    commandStatus = 'NORMAL_OPERATIONS';
    updatePriority = 'MEDIUM';
  }

  const commandMessage = [
    commandCenterMessage || 'SCIIP generated a command center update from the operator briefing.',
    '',
    'Command status: ' + commandStatus + '.',
    'Operating posture: ' + (operatingPosture || 'UNKNOWN') + '.',
    'Priority assessment: ' + (priorityAssessment || 'No priority assessment recorded.'),
    'Operator decision focus: ' + (operatorDecisionFocus || 'No decision focus recorded.'),
    'Next best action: ' + requiredOperatorAction
  ].join('\n');

  return {
    updateType: updateType,
    updateTitle: updateTitle,
    commandStatus: commandStatus,
    commandMessage: commandMessage,
    primaryFocus: primaryFocus,
    requiredOperatorAction: requiredOperatorAction,
    visibilityLevel: visibilityLevel,
    updatePriority: updatePriority
  };
}

function sciipTestCommandCenterUpdateProcessor() {
  const result = sciipRunCommandCenterUpdateProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestCommandCenterUpdateProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 750_AutonomousOpsDigestProcessor
 *
 * COMMAND_CENTER_UPDATES → AUTONOMOUS_OPS_DIGESTS
 *
 * Migration note:
 * Preserves original 750 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousOpsDigestProcessorName750_() {
  return '750_AutonomousOpsDigestProcessor';
}

function sciipGetAutonomousOpsDigestsHeaders750_() {
  return [
    'Digest_ID',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Digest_Title',
    'Digest_Text',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousOpsDigestSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_OPS_DIGESTS',
    sciipGetAutonomousOpsDigestsHeaders750_()
  );
}

function sciipRunAutonomousOpsDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousOpsDigestProcessorName750_(),
    action: 'AUTONOMOUS_OPS_DIGEST_BUILD',
    sourceSheet: 'COMMAND_CENTER_UPDATES',
    targetSheet: 'AUTONOMOUS_OPS_DIGESTS',
    ledgerSheet: 'AUTONOMOUS_OPS_DIGESTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const commandCenterUpdates = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('COMMAND_CENTER_UPDATES');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: commandCenterUpdates.length,
        outputCount: commandCenterUpdates.length ? 1 : 0,
        summary: 'Autonomous operations digest runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousOpsDigestProcessorName750_(),
          inputSheets: ['COMMAND_CENTER_UPDATES']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousOpsDigestSchema();
      const digestDate =
        sciipResolveLatestRuntimeProcessingDate750_('COMMAND_CENTER_UPDATES', 'Update_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousOpsDigestBusinessKey = 'AUTONOMOUS_OPS_DIGEST|' + digestDate;

      if (sciipRuntimeBusinessKeyPrefixExists750_(definition.targetSheet, autonomousOpsDigestBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousOpsDigestProcessorName750_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            commandCenterUpdatesReviewed: 0,
            autonomousOpsDigestsCreated: 0,
            skippedDuplicate: 1,
            autonomousOpsDigestBusinessKey: autonomousOpsDigestBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const commandCenterUpdates = sciipGetRuntimeRecordsByDate750_(
        'COMMAND_CENTER_UPDATES',
        'Update_Date',
        digestDate
      );

      if (commandCenterUpdates.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousOpsDigestProcessorName750_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            commandCenterUpdatesReviewed: 0,
            autonomousOpsDigestsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const digest = sciipCreateAutonomousOpsDigest750_({
        businessKey: autonomousOpsDigestBusinessKey,
        digestDate: digestDate,
        sourceRows: commandCenterUpdates,
        processor: sciipGetAutonomousOpsDigestProcessorName750_()
      });

      outputSheet.appendRow(digest);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousOpsDigestProcessorName750_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: commandCenterUpdates.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          commandCenterUpdatesReviewed: commandCenterUpdates.length,
          autonomousOpsDigestsCreated: 1,
          skippedDuplicate: 0,
          autonomousOpsDigestBusinessKey: autonomousOpsDigestBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists750_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate750_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue750_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate750_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue750_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue750_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateAutonomousOpsDigest750_(args) {
  return [
    sciipGenerateId750_('AUTONOMOUS_OPS_DIGEST'),
    args.businessKey,
    args.digestDate,
    'COMMAND_CENTER_UPDATES',
    args.sourceRows.length,
    'Autonomous Operations Digest — ' + args.digestDate,
    sciipCreateAutonomousOpsDigestText750_(args.digestDate, args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousOpsDigestText750_(digestDate, sourceRows) {
  const lines = [];

  lines.push('Autonomous Operations Digest for ' + digestDate);
  lines.push('');
  lines.push('Source Records Reviewed: ' + sourceRows.length);
  lines.push('');

  sourceRows.forEach(function(row, index) {
    lines.push('Update ' + (index + 1) + ':');

    const preferredFields = [
      'Update_Title',
      'Update_Text',
      'Command_Update',
      'Summary',
      'Status',
      'Processor',
      'Business_Key'
    ];

    preferredFields.forEach(function(field) {
      if (row[field]) {
        lines.push(field + ': ' + row[field]);
      }
    });

    lines.push('');
  });

  return lines.join('\n').trim();
}

function sciipGenerateId750_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipTestAutonomousOpsDigestProcessor() {
  const result = sciipRunAutonomousOpsDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOpsDigestProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 760_AutonomousOpsLearningProcessor
 *
 * AUTONOMOUS_OPS_DIGESTS → AUTONOMOUS_OPS_LEARNINGS
 *
 * Migration note:
 * Preserves original 760 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousOpsLearningProcessorName760_() {
  return '760_AutonomousOpsLearningProcessor';
}

function sciipGetAutonomousOpsLearningsHeaders760_() {
  return [
    'Learning_ID',
    'Business_Key',
    'Learning_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Learning_Title',
    'Operational_Learning',
    'Recommended_Adjustment',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousOpsLearningSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_OPS_LEARNINGS',
    sciipGetAutonomousOpsLearningsHeaders760_()
  );
}

function sciipRunAutonomousOpsLearningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousOpsLearningProcessorName760_(),
    action: 'AUTONOMOUS_OPS_LEARNING_BUILD',
    sourceSheet: 'AUTONOMOUS_OPS_DIGESTS',
    targetSheet: 'AUTONOMOUS_OPS_LEARNINGS',
    ledgerSheet: 'AUTONOMOUS_OPS_LEARNINGS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousOpsDigests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_OPS_DIGESTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousOpsDigests.length,
        outputCount: autonomousOpsDigests.length ? 1 : 0,
        summary: 'Autonomous operations learning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousOpsLearningProcessorName760_(),
          inputSheets: ['AUTONOMOUS_OPS_DIGESTS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousOpsLearningSchema();
      const learningDate =
        sciipResolveLatestRuntimeProcessingDate760_('AUTONOMOUS_OPS_DIGESTS', 'Digest_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousOpsLearningBusinessKey = 'AUTONOMOUS_OPS_LEARNING|' + learningDate;

      if (sciipRuntimeBusinessKeyPrefixExists760_(definition.targetSheet, autonomousOpsLearningBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousOpsLearningProcessorName760_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOpsDigestsReviewed: 0,
            autonomousOpsLearningsCreated: 0,
            skippedDuplicate: 1,
            autonomousOpsLearningBusinessKey: autonomousOpsLearningBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousOpsDigests = sciipGetRuntimeRecordsByDate760_(
        'AUTONOMOUS_OPS_DIGESTS',
        'Digest_Date',
        learningDate
      );

      if (!autonomousOpsDigests.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousOpsLearningProcessorName760_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOpsDigestsReviewed: 0,
            autonomousOpsLearningsCreated: 0,
            skippedNoInputs: 1,
            learningDate: learningDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const learning = sciipCreateAutonomousOpsLearning760_({
        businessKey: autonomousOpsLearningBusinessKey,
        learningDate: learningDate,
        sourceRows: autonomousOpsDigests,
        processor: sciipGetAutonomousOpsLearningProcessorName760_()
      });

      outputSheet.appendRow(learning);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousOpsLearningProcessorName760_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousOpsDigests.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousOpsDigestsReviewed: autonomousOpsDigests.length,
          autonomousOpsLearningsCreated: 1,
          skippedDuplicate: 0,
          autonomousOpsLearningBusinessKey: autonomousOpsLearningBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists760_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate760_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue760_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate760_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue760_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue760_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateAutonomousOpsLearning760_(args) {
  return [
    sciipGenerateId760_('AUTONOMOUS_OPS_LEARNING'),
    args.businessKey,
    args.learningDate,
    'AUTONOMOUS_OPS_DIGESTS',
    args.sourceRows.length,
    'Autonomous Operations Learning — ' + args.learningDate,
    sciipCreateAutonomousOpsLearningText760_(args.sourceRows),
    sciipCreateAutonomousOpsAdjustmentText760_(args.sourceRows),
    args.sourceRows.length > 0 ? 'MEDIUM' : 'LOW',
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousOpsLearningText760_(sourceRows) {
  const digestCount = sourceRows.length;

  const totalSourceRecords = sourceRows.reduce(function(sum, row) {
    const count = Number(row.Source_Record_Count || 0);
    return sum + count;
  }, 0);

  return [
    'SCIIP completed an autonomous operations digest cycle using ' + digestCount + ' digest record(s).',
    'The operating loop reviewed ' + totalSourceRecords + ' upstream command center update record(s).',
    'The system successfully converted operational activity into durable learning history.'
  ].join(' ');
}

function sciipCreateAutonomousOpsAdjustmentText760_(sourceRows) {
  if (!sourceRows.length) {
    return 'No adjustment recommended because no source digest records were available.';
  }

  return [
    'Continue routing completed autonomous operating loops into durable learning records.',
    'Use these learnings to support future memory consolidation, reasoning calibration, and strategic feedback processors.'
  ].join(' ');
}

function sciipGenerateId760_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousOpsLearningProcessor() {
  const result = sciipRunAutonomousOpsLearningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOpsLearningProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 770_AutonomousImprovementPlanProcessor
 *
 * AUTONOMOUS_OPS_LEARNINGS → AUTONOMOUS_IMPROVEMENT_PLANS
 *
 * Migration note:
 * Preserves original 770 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementPlanProcessorName770_() {
  return '770_AutonomousImprovementPlanProcessor';
}

function sciipGetAutonomousImprovementPlanHeaders770_() {
  return [
    'Improvement_Plan_ID',
    'Business_Key',
    'Plan_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Plan_Title',
    'Improvement_Objective',
    'Improvement_Actions',
    'Expected_System_Impact',
    'Priority',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementPlanSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_PLANS',
    sciipGetAutonomousImprovementPlanHeaders770_()
  );
}

function sciipRunAutonomousImprovementPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementPlanProcessorName770_(),
    action: 'AUTONOMOUS_IMPROVEMENT_PLAN_BUILD',
    sourceSheet: 'AUTONOMOUS_OPS_LEARNINGS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_PLANS',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_PLANS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousOpsLearnings = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_OPS_LEARNINGS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousOpsLearnings.length,
        outputCount: autonomousOpsLearnings.length ? 1 : 0,
        summary: 'Autonomous improvement plan runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementPlanProcessorName770_(),
          inputSheets: ['AUTONOMOUS_OPS_LEARNINGS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousImprovementPlanSchema();
      const planDate =
        sciipResolveLatestRuntimeProcessingDate770_('AUTONOMOUS_OPS_LEARNINGS', 'Learning_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementPlanBusinessKey = 'AUTONOMOUS_IMPROVEMENT_PLAN|' + planDate;

      if (sciipRuntimeBusinessKeyPrefixExists770_(definition.targetSheet, autonomousImprovementPlanBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementPlanProcessorName770_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOpsLearningsReviewed: 0,
            autonomousImprovementPlansCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementPlanBusinessKey: autonomousImprovementPlanBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousOpsLearnings = sciipGetRuntimeRecordsByDate770_(
        'AUTONOMOUS_OPS_LEARNINGS',
        'Learning_Date',
        planDate
      );

      if (!autonomousOpsLearnings.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementPlanProcessorName770_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOpsLearningsReviewed: 0,
            autonomousImprovementPlansCreated: 0,
            skippedNoInputs: 1,
            planDate: planDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const plan = sciipCreateAutonomousImprovementPlan770_({
        businessKey: autonomousImprovementPlanBusinessKey,
        planDate: planDate,
        sourceRows: autonomousOpsLearnings,
        processor: sciipGetAutonomousImprovementPlanProcessorName770_()
      });

      outputSheet.appendRow(plan);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementPlanProcessorName770_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousOpsLearnings.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousOpsLearningsReviewed: autonomousOpsLearnings.length,
          autonomousImprovementPlansCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementPlanBusinessKey: autonomousImprovementPlanBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists770_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate770_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue770_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate770_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue770_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue770_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateAutonomousImprovementPlan770_(args) {
  return [
    sciipGenerateId770_('AUTONOMOUS_IMPROVEMENT_PLAN'),
    args.businessKey,
    args.planDate,
    'AUTONOMOUS_OPS_LEARNINGS',
    args.sourceRows.length,
    'Autonomous Improvement Plan — ' + args.planDate,
    sciipCreateAutonomousImprovementObjective770_(args.sourceRows),
    sciipCreateAutonomousImprovementActions770_(args.sourceRows),
    sciipCreateAutonomousImprovementImpact770_(args.sourceRows),
    'MEDIUM',
    'PROPOSED',
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementObjective770_(sourceRows) {
  return [
    'Convert ' + sourceRows.length + ' autonomous operations learning record(s) into an actionable improvement plan.',
    'Strengthen SCIIP_OS by ensuring operational feedback becomes permanent system improvement history.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementActions770_(sourceRows) {
  const actions = [
    'Review autonomous learning records for recurring system patterns.',
    'Identify whether routing, digesting, memory consolidation, or reasoning calibration should be adjusted.',
    'Preserve the improvement recommendation as a durable operating-system record.',
    'Make the improvement plan available to downstream prioritization and execution processors.'
  ];

  return actions.join('\n');
}

function sciipCreateAutonomousImprovementImpact770_(sourceRows) {
  return [
    'Expected impact is improved autonomous loop closure, stronger processor accountability, and better continuity between system activity, learning, and execution.',
    'This plan was generated from ' + sourceRows.length + ' validated upstream learning record(s).'
  ].join(' ');
}

function sciipGenerateId770_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementPlanProcessor() {
  const result = sciipRunAutonomousImprovementPlanProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementPlanProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 780_AutonomousImprovementTaskProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_PLANS → AUTONOMOUS_IMPROVEMENT_TASKS
 *
 * Migration note:
 * Preserves original 780 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementTaskProcessorName780_() {
  return '780_AutonomousImprovementTaskProcessor';
}

function sciipGetAutonomousImprovementTaskHeaders780_() {
  return [
    'Task_ID',
    'Business_Key',
    'Task_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Task_Title',
    'Task_Description',
    'Task_Type',
    'Priority',
    'Status',
    'Execution_Owner',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementTaskSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_TASKS',
    sciipGetAutonomousImprovementTaskHeaders780_()
  );
}

function sciipRunAutonomousImprovementTaskProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
    action: 'AUTONOMOUS_IMPROVEMENT_TASK_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_PLANS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_TASKS',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_TASKS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementPlans = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_PLANS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementPlans.length,
        outputCount: autonomousImprovementPlans.length ? 1 : 0,
        summary: 'Autonomous improvement task runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementTaskProcessorName780_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_PLANS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousImprovementTaskSchema();
      const taskDate =
        sciipResolveLatestRuntimeProcessingDate780_('AUTONOMOUS_IMPROVEMENT_PLANS', 'Plan_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementTaskBusinessKey = 'AUTONOMOUS_IMPROVEMENT_TASK|' + taskDate;

      if (sciipRuntimeBusinessKeyPrefixExists780_(definition.targetSheet, autonomousImprovementTaskBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementPlansReviewed: 0,
            autonomousImprovementTasksCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementTaskBusinessKey: autonomousImprovementTaskBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementPlans = sciipGetRuntimeRecordsByDate780_(
        'AUTONOMOUS_IMPROVEMENT_PLANS',
        'Plan_Date',
        taskDate
      );

      if (!autonomousImprovementPlans.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementPlansReviewed: 0,
            autonomousImprovementTasksCreated: 0,
            skippedNoInputs: 1,
            taskDate: taskDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const task = sciipCreateAutonomousImprovementTask780_({
        businessKey: autonomousImprovementTaskBusinessKey,
        taskDate: taskDate,
        sourceRows: autonomousImprovementPlans,
        processor: sciipGetAutonomousImprovementTaskProcessorName780_()
      });

      outputSheet.appendRow(task);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementPlans.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementPlansReviewed: autonomousImprovementPlans.length,
          autonomousImprovementTasksCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementTaskBusinessKey: autonomousImprovementTaskBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists780_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate780_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue780_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate780_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue780_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue780_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateAutonomousImprovementTask780_(args) {
  return [
    sciipGenerateId780_('AUTONOMOUS_IMPROVEMENT_TASK'),
    args.businessKey,
    args.taskDate,
    'AUTONOMOUS_IMPROVEMENT_PLANS',
    args.sourceRows.length,
    'Execute Autonomous Improvement Plan — ' + args.taskDate,
    sciipCreateAutonomousImprovementTaskDescription780_(args.sourceRows),
    'AUTONOMOUS_SYSTEM_IMPROVEMENT',
    sciipResolveAutonomousImprovementTaskPriority780_(args.sourceRows),
    'PENDING',
    'SCIIP_OS',
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementTaskDescription780_(sourceRows) {
  return [
    'Create an execution task from ' + sourceRows.length + ' autonomous improvement plan record(s).',
    'Review the proposed improvement objective, actions, and expected system impact.',
    'Route the improvement into downstream execution tracking so SCIIP_OS can close the loop from learning to action.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementTaskPriority780_(sourceRows) {
  const hasHighPriorityPlan = sourceRows.some(function(row) {
    return String(row.Priority || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighPriorityPlan ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId780_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementTaskProcessor() {
  const result = sciipRunAutonomousImprovementTaskProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementTaskProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 790_AutonomousImprovementExecutionProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_TASKS → AUTONOMOUS_IMPROVEMENT_EXECUTIONS
 *
 * Migration note:
 * Preserves original 790 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementExecutionProcessorName790_() {
  return '790_AutonomousImprovementExecutionProcessor';
}

function sciipGetAutonomousImprovementExecutionHeaders790_() {
  return [
    'Execution_ID',
    'Business_Key',
    'Execution_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Title',
    'Execution_Summary',
    'Execution_Status',
    'Execution_Result',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementExecutionSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    sciipGetAutonomousImprovementExecutionHeaders790_()
  );
}

function sciipRunAutonomousImprovementExecutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
    action: 'AUTONOMOUS_IMPROVEMENT_EXECUTION_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_TASKS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementTasks = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_TASKS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementTasks.length,
        outputCount: autonomousImprovementTasks.length ? 1 : 0,
        summary: 'Autonomous improvement execution runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_TASKS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousImprovementExecutionSchema();
      const executionDate =
        sciipResolveLatestRuntimeProcessingDate790_('AUTONOMOUS_IMPROVEMENT_TASKS', 'Task_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementExecutionBusinessKey = 'AUTONOMOUS_IMPROVEMENT_EXECUTION|' + executionDate;

      if (sciipRuntimeBusinessKeyPrefixExists790_(definition.targetSheet, autonomousImprovementExecutionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementTasksReviewed: 0,
            autonomousImprovementExecutionsCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementExecutionBusinessKey: autonomousImprovementExecutionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementTasks = sciipGetRuntimeRecordsByDate790_(
        'AUTONOMOUS_IMPROVEMENT_TASKS',
        'Task_Date',
        executionDate
      );

      if (!autonomousImprovementTasks.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementTasksReviewed: 0,
            autonomousImprovementExecutionsCreated: 0,
            skippedNoInputs: 1,
            executionDate: executionDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const execution = sciipCreateAutonomousImprovementExecution790_({
        businessKey: autonomousImprovementExecutionBusinessKey,
        executionDate: executionDate,
        sourceRows: autonomousImprovementTasks,
        processor: sciipGetAutonomousImprovementExecutionProcessorName790_()
      });

      outputSheet.appendRow(execution);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementTasks.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementTasksReviewed: autonomousImprovementTasks.length,
          autonomousImprovementExecutionsCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementExecutionBusinessKey: autonomousImprovementExecutionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists790_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate790_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue790_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate790_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue790_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue790_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateAutonomousImprovementExecution790_(args) {
  return [
    sciipGenerateId790_('AUTONOMOUS_IMPROVEMENT_EXECUTION'),
    args.businessKey,
    args.executionDate,
    'AUTONOMOUS_IMPROVEMENT_TASKS',
    args.sourceRows.length,
    'Autonomous Improvement Execution — ' + args.executionDate,
    sciipCreateAutonomousImprovementExecutionSummary790_(args.sourceRows),
    'RECORDED',
    sciipCreateAutonomousImprovementExecutionResult790_(args.sourceRows),
    sciipCreateAutonomousImprovementExecutionNextAction790_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementExecutionSummary790_(sourceRows) {
  return [
    'SCIIP_OS recorded execution tracking for ' + sourceRows.length + ' autonomous improvement task record(s).',
    'This preserves the transition from proposed system improvement into an execution-stage operating record.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementExecutionResult790_(sourceRows) {
  const pendingCount = sourceRows.filter(function(row) {
    return String(row.Status || '').trim().toUpperCase() === 'PENDING';
  }).length;

  return [
    pendingCount + ' source task record(s) were pending at execution-record creation.',
    'Execution has been recorded for downstream monitoring and outcome learning.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementExecutionNextAction790_(sourceRows) {
  return [
    'Monitor execution outcome.',
    'Route completed execution records into autonomous improvement outcome learning.',
    'Preserve result history without overwriting the original improvement task.'
  ].join(' ');
}

function sciipGenerateId790_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementExecutionProcessor() {
  const result = sciipRunAutonomousImprovementExecutionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementExecutionProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 800_AutonomousImprovementOutcomeProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_EXECUTIONS → AUTONOMOUS_IMPROVEMENT_OUTCOMES
 *
 * Migration note:
 * Preserves original 800 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementOutcomeProcessorName800_() {
  return '800_AutonomousImprovementOutcomeProcessor';
}

function sciipGetAutonomousImprovementOutcomeHeaders800_() {
  return [
    'Outcome_ID',
    'Business_Key',
    'Outcome_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Outcome_Title',
    'Outcome_Summary',
    'Learning_Captured',
    'System_Adjustment_Recommendation',
    'Outcome_Status',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementOutcomeSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    sciipGetAutonomousImprovementOutcomeHeaders800_()
  );
}

function sciipRunAutonomousImprovementOutcomeProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
    action: 'AUTONOMOUS_IMPROVEMENT_OUTCOME_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_OUTCOMES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementExecutions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_EXECUTIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementExecutions.length,
        outputCount: autonomousImprovementExecutions.length ? 1 : 0,
        summary: 'Autonomous improvement outcome runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_EXECUTIONS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousImprovementOutcomeSchema();
      const outcomeDate =
        sciipResolveLatestRuntimeProcessingDate800_('AUTONOMOUS_IMPROVEMENT_EXECUTIONS', 'Execution_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementOutcomeBusinessKey = 'AUTONOMOUS_IMPROVEMENT_OUTCOME|' + outcomeDate;

      if (sciipRuntimeBusinessKeyPrefixExists800_(definition.targetSheet, autonomousImprovementOutcomeBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementExecutionsReviewed: 0,
            autonomousImprovementOutcomesCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementOutcomeBusinessKey: autonomousImprovementOutcomeBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementExecutions = sciipGetRuntimeRecordsByDate800_(
        'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
        'Execution_Date',
        outcomeDate
      );

      if (!autonomousImprovementExecutions.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementExecutionsReviewed: 0,
            autonomousImprovementOutcomesCreated: 0,
            skippedNoInputs: 1,
            outcomeDate: outcomeDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outcome = sciipCreateAutonomousImprovementOutcome800_({
        businessKey: autonomousImprovementOutcomeBusinessKey,
        outcomeDate: outcomeDate,
        sourceRows: autonomousImprovementExecutions,
        processor: sciipGetAutonomousImprovementOutcomeProcessorName800_()
      });

      outputSheet.appendRow(outcome);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementExecutions.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementExecutionsReviewed: autonomousImprovementExecutions.length,
          autonomousImprovementOutcomesCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementOutcomeBusinessKey: autonomousImprovementOutcomeBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists800_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate800_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue800_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate800_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue800_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue800_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateAutonomousImprovementOutcome800_(args) {
  return [
    sciipGenerateId800_('AUTONOMOUS_IMPROVEMENT_OUTCOME'),
    args.businessKey,
    args.outcomeDate,
    'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    args.sourceRows.length,
    'Autonomous Improvement Outcome — ' + args.outcomeDate,
    sciipCreateAutonomousImprovementOutcomeSummary800_(args.sourceRows),
    sciipCreateAutonomousImprovementOutcomeLearning800_(args.sourceRows),
    sciipCreateAutonomousImprovementOutcomeRecommendation800_(args.sourceRows),
    'CAPTURED',
    sciipResolveAutonomousImprovementOutcomeConfidence800_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementOutcomeSummary800_(sourceRows) {
  return [
    'SCIIP_OS captured outcome learning from ' + sourceRows.length + ' autonomous improvement execution record(s).',
    'This completes the improvement loop from learning, to plan, to task, to execution, to outcome history.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementOutcomeLearning800_(sourceRows) {
  const recordedCount = sourceRows.filter(function(row) {
    return String(row.Execution_Status || '').trim().toUpperCase() === 'RECORDED';
  }).length;

  return [
    recordedCount + ' execution record(s) reached RECORDED status.',
    'The system successfully preserved execution-stage activity as permanent downstream learning.',
    'Future processors can now use this outcome layer to improve calibration, prioritization, and autonomous routing.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementOutcomeRecommendation800_(sourceRows) {
  return [
    'Continue using latest completed processing dates for downstream autonomous processors.',
    'Preserve all improvement-loop outputs as event-sourced history.',
    'Route captured outcomes into future strategic memory consolidation and model calibration processors.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementOutcomeConfidence800_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasRecordedExecution = sourceRows.some(function(row) {
    return String(row.Execution_Status || '').trim().toUpperCase() === 'RECORDED';
  });

  return hasRecordedExecution ? 'MEDIUM' : 'LOW';
}

function sciipGenerateId800_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementOutcomeProcessor() {
  const result = sciipRunAutonomousImprovementOutcomeProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementOutcomeProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 810_AutonomousImprovementMemoryProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_OUTCOMES → AUTONOMOUS_IMPROVEMENT_MEMORY
 *
 * Migration note:
 * Preserves original 810 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementMemoryProcessorName810_() {
  return '810_AutonomousImprovementMemoryProcessor';
}

function sciipGetAutonomousImprovementMemoryHeaders810_() {
  return [
    'Memory_ID',
    'Business_Key',
    'Memory_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Memory_Title',
    'Memory_Type',
    'Memory_Summary',
    'Reusable_Learning',
    'Future_Use_Case',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementMemorySchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_MEMORY',
    sciipGetAutonomousImprovementMemoryHeaders810_()
  );
}

function sciipRunAutonomousImprovementMemoryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
    action: 'AUTONOMOUS_IMPROVEMENT_MEMORY_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_MEMORY',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_MEMORY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementOutcomes = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_OUTCOMES');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementOutcomes.length,
        outputCount: autonomousImprovementOutcomes.length ? 1 : 0,
        summary: 'Autonomous improvement memory runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_OUTCOMES']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousImprovementMemorySchema();
      const memoryDate =
        sciipResolveLatestRuntimeProcessingDate810_('AUTONOMOUS_IMPROVEMENT_OUTCOMES', 'Outcome_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementMemoryBusinessKey = 'AUTONOMOUS_IMPROVEMENT_MEMORY|' + memoryDate;

      if (sciipRuntimeBusinessKeyPrefixExists810_(definition.targetSheet, autonomousImprovementMemoryBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementOutcomesReviewed: 0,
            autonomousImprovementMemoryCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementMemoryBusinessKey: autonomousImprovementMemoryBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementOutcomes = sciipGetRuntimeRecordsByDate810_(
        'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
        'Outcome_Date',
        memoryDate
      );

      if (!autonomousImprovementOutcomes.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementOutcomesReviewed: 0,
            autonomousImprovementMemoryCreated: 0,
            skippedNoInputs: 1,
            memoryDate: memoryDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const memory = sciipCreateAutonomousImprovementMemory810_({
        businessKey: autonomousImprovementMemoryBusinessKey,
        memoryDate: memoryDate,
        sourceRows: autonomousImprovementOutcomes,
        processor: sciipGetAutonomousImprovementMemoryProcessorName810_()
      });

      outputSheet.appendRow(memory);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementOutcomes.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementOutcomesReviewed: autonomousImprovementOutcomes.length,
          autonomousImprovementMemoryCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementMemoryBusinessKey: autonomousImprovementMemoryBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists810_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate810_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue810_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate810_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue810_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue810_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateAutonomousImprovementMemory810_(args) {
  return [
    sciipGenerateId810_('AUTONOMOUS_IMPROVEMENT_MEMORY'),
    args.businessKey,
    args.memoryDate,
    'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    args.sourceRows.length,
    'Autonomous Improvement Memory — ' + args.memoryDate,
    'AUTONOMOUS_OPERATING_LOOP_LEARNING',
    sciipCreateAutonomousImprovementMemorySummary810_(args.sourceRows),
    sciipCreateAutonomousImprovementReusableLearning810_(args.sourceRows),
    sciipCreateAutonomousImprovementFutureUseCase810_(args.sourceRows),
    sciipResolveAutonomousImprovementMemoryConfidence810_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementMemorySummary810_(sourceRows) {
  return [
    'SCIIP_OS converted ' + sourceRows.length + ' autonomous improvement outcome record(s) into durable system memory.',
    'The system preserved the full loop from operations, learning, improvement planning, task creation, execution tracking, outcome capture, and memory consolidation.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementReusableLearning810_(sourceRows) {
  return [
    'Downstream processors should consume the latest completed processing date from upstream sheets instead of assuming the current execution date.',
    'Idempotent business keys must preserve one durable record per processing batch.',
    'Autonomous improvement loops should terminate in reusable memory so future processors can avoid repeating known failures.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementFutureUseCase810_(sourceRows) {
  return [
    'Use this memory when designing future autonomous processors.',
    'Use this memory when diagnosing SKIPPED_NO_INPUTS caused by date mismatch.',
    'Use this memory when routing completed operating-loop outcomes into calibration, prioritization, or strategic reasoning layers.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementMemoryConfidence810_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasCapturedOutcome = sourceRows.some(function(row) {
    return String(row.Outcome_Status || '').trim().toUpperCase() === 'CAPTURED';
  });

  return hasCapturedOutcome ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId810_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementMemoryProcessor() {
  const result = sciipRunAutonomousImprovementMemoryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementMemoryProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 820_AutonomousCalibrationSignalProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_MEMORY → AUTONOMOUS_CALIBRATION_SIGNALS
 *
 * Migration note:
 * Preserves original 820 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousCalibrationSignalProcessorName820_() {
  return '820_AutonomousCalibrationSignalProcessor';
}

function sciipGetAutonomousCalibrationSignalHeaders820_() {
  return [
    'Calibration_Signal_ID',
    'Business_Key',
    'Signal_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Signal_Title',
    'Signal_Type',
    'Calibration_Finding',
    'Calibration_Recommendation',
    'Affected_System_Area',
    'Priority',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousCalibrationSignalSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_CALIBRATION_SIGNALS',
    sciipGetAutonomousCalibrationSignalHeaders820_()
  );
}

function sciipRunAutonomousCalibrationSignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
    action: 'AUTONOMOUS_CALIBRATION_SIGNAL_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_MEMORY',
    targetSheet: 'AUTONOMOUS_CALIBRATION_SIGNALS',
    ledgerSheet: 'AUTONOMOUS_CALIBRATION_SIGNALS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementMemory = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_MEMORY');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementMemory.length,
        outputCount: autonomousImprovementMemory.length ? 1 : 0,
        summary: 'Autonomous calibration signal runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_MEMORY']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousCalibrationSignalSchema();
      const signalDate =
        sciipResolveLatestRuntimeProcessingDate820_('AUTONOMOUS_IMPROVEMENT_MEMORY', 'Memory_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousCalibrationSignalBusinessKey = 'AUTONOMOUS_CALIBRATION_SIGNAL|' + signalDate;

      if (sciipRuntimeBusinessKeyPrefixExists820_(definition.targetSheet, autonomousCalibrationSignalBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementMemoryReviewed: 0,
            autonomousCalibrationSignalsCreated: 0,
            skippedDuplicate: 1,
            autonomousCalibrationSignalBusinessKey: autonomousCalibrationSignalBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementMemory = sciipGetRuntimeRecordsByDate820_(
        'AUTONOMOUS_IMPROVEMENT_MEMORY',
        'Memory_Date',
        signalDate
      );

      if (!autonomousImprovementMemory.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementMemoryReviewed: 0,
            autonomousCalibrationSignalsCreated: 0,
            skippedNoInputs: 1,
            signalDate: signalDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const signal = sciipCreateAutonomousCalibrationSignal820_({
        businessKey: autonomousCalibrationSignalBusinessKey,
        signalDate: signalDate,
        sourceRows: autonomousImprovementMemory,
        processor: sciipGetAutonomousCalibrationSignalProcessorName820_()
      });

      outputSheet.appendRow(signal);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementMemory.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementMemoryReviewed: autonomousImprovementMemory.length,
          autonomousCalibrationSignalsCreated: 1,
          skippedDuplicate: 0,
          autonomousCalibrationSignalBusinessKey: autonomousCalibrationSignalBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists820_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate820_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue820_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate820_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue820_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue820_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateAutonomousCalibrationSignal820_(args) {
  return [
    sciipGenerateId820_('AUTONOMOUS_CALIBRATION_SIGNAL'),
    args.businessKey,
    args.signalDate,
    'AUTONOMOUS_IMPROVEMENT_MEMORY',
    args.sourceRows.length,
    'Autonomous Calibration Signal — ' + args.signalDate,
    'PROCESSING_DATE_STANDARD',
    sciipCreateAutonomousCalibrationFinding820_(args.sourceRows),
    sciipCreateAutonomousCalibrationRecommendation820_(args.sourceRows),
    'DOWNSTREAM_PROCESSOR_DATE_RESOLUTION',
    'HIGH',
    sciipResolveAutonomousCalibrationSignalConfidence820_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousCalibrationFinding820_(sourceRows) {
  return [
    'SCIIP_OS reviewed ' + sourceRows.length + ' autonomous improvement memory record(s).',
    'The durable memory confirms that downstream processors must resolve the latest completed upstream processing date instead of assuming the current execution date.',
    'This prevents false SKIPPED_NO_INPUTS results when processors run after midnight or on a later calendar date.'
  ].join(' ');
}

function sciipCreateAutonomousCalibrationRecommendation820_(sourceRows) {
  return [
    'Adopt sciipResolveLatestProcessingDate_(sheetName, dateColumnName) as the standard date resolver for downstream processors.',
    'Use the resolved upstream date in business keys, source-row filters, and test expectations.',
    'Continue using sciipBusinessKeyPrefixExists_() for multi-row or batch-oriented processors.'
  ].join(' ');
}

function sciipResolveAutonomousCalibrationSignalConfidence820_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasHighMemory = sourceRows.some(function(row) {
    return String(row.Confidence || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighMemory ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId820_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousCalibrationSignalProcessor() {
  const result = sciipRunAutonomousCalibrationSignalProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousCalibrationSignalProcessor',
    result: result
  }));

  return result;
}
