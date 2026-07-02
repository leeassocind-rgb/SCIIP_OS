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
