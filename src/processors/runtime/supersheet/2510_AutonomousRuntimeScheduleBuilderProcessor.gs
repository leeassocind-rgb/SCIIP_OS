/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Schedule Builder Processor
 * File: 2510_AutonomousRuntimeScheduleBuilderProcessor.gs
 *
 * Processor: 2510_AutonomousRuntimeScheduleBuilder
 *
 * Purpose:
 * Reads the autonomous runtime load index and produces a dynamic
 * execution schedule for dispatch-eligible processors.
 */

function sciipRun2510_AutonomousRuntimeScheduleBuilderProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2510_AutonomousRuntimeScheduleBuilder',
    action: 'AUTONOMOUS_RUNTIME_SCHEDULE_BUILD',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE_LEDGER',

    buildPayload: function(context, definition) {
      var loadRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: loadRecords.length,
        outputCount: 0,
        summary: 'Autonomous runtime schedule builder payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2500_AutonomousRuntimeLoader',
          runtimeVersion: 'v5.3'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing load index source sheet.');
      if (!definition.targetSheet) errors.push('Missing runtime schedule target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing runtime schedule ledger sheet.');

      var loadRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!loadRecords || loadRecords.length === 0) {
        errors.push('No runtime load index records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var loadRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var scheduleHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Schedule_Date',
        'Schedule_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Default_Priority',
        'Default_Cadence',
        'Depends_On',
        'Produces',
        'Schedule_Status',
        'Dispatch_Eligible',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Load_Records_Read',
        'Schedule_Items_Created',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        scheduleHeaders
      );

      var scheduleDate = SCIIP_RUNTIME.getDateKey({});
      var scheduled = [];

      loadRecords.forEach(function(record) {
        var loadStatus =
          String(record.Load_Status || '').toUpperCase();

        var dispatchEligible =
          String(record.Dispatch_Eligible || '').toUpperCase() === 'YES';

        var shouldSchedule =
          loadStatus === 'LOADED' && dispatchEligible;

        if (!shouldSchedule) return;

        var scheduleKey = SCIIP_RUNTIME.makeBusinessKey([
          'SCHEDULE',
          record.Processor_Id,
          record.Processor_Name,
          scheduleDate
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          scheduleHeaders,
          {
            Timestamp: new Date(),
            Runtime_Version: record.Runtime_Version || 'v5.3',
            Schedule_Date: scheduleDate,
            Schedule_Key: scheduleKey,
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Default_Priority: record.Default_Priority || '',
            Default_Cadence: record.Default_Cadence || '',
            Depends_On: record.Depends_On || '',
            Produces: record.Produces || '',
            Schedule_Status: 'SCHEDULED',
            Dispatch_Eligible: record.Dispatch_Eligible || '',
            Source_Business_Key: context.businessKey
          }
        );

        scheduled.push(record);
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: scheduled.length,
        recordsRead: loadRecords.length,
        processed: loadRecords.length,
        message: JSON.stringify({
          runtimeScheduleStatus: 'SCHEDULE_BUILT',
          runtimeVersion: 'v5.3',
          loadRecordsRead: loadRecords.length,
          scheduleItemsCreated: scheduled.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2520_AutonomousRuntimeDispatchQueue'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'SCHEDULE_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Load_Records_Read: loadRecords.length,
          Schedule_Items_Created: scheduled.length,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          loadRecordsRead: loadRecords.length,
          scheduleItemsCreated: scheduled.length,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime schedule built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2510_AutonomousRuntimeScheduleBuilderProcessor() {
  var result = sciipRun2510_AutonomousRuntimeScheduleBuilderProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2510_AutonomousRuntimeScheduleBuilderProcessor',
    result: result
  }));

  return result;
}