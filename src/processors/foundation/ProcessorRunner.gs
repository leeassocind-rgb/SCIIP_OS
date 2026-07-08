/* ==========================================================
   SCIIP_OS
   Module: Processors
   File: ProcessorRunner.gs

   Purpose:
   Executes SCIIP processors against queued work.

   Processor Runner is responsible for:

   - Reading WORK_QUEUE
   - Resolving Processor
   - Executing Processor
   - Recording Results

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Runs all pending queue items.
 *
 * @returns {Object}
 */
function sciipRunQueue() {

  const pendingTasks =
    sciipQueuePending();

  const results = [];

  pendingTasks.forEach(function(task) {

    const result =
      sciipRunTask(task);

    results.push(result);

  });

  return {
    tasksProcessed:
      results.length,
    results: results,
    completedAt:
      sciipNowIso()
  };
}

/**
 * Runs a single queue task.
 *
 * @param {Object} task
 * @returns {Object}
 */
function sciipRunTask(task) {

  const processor =
    sciipFindProcessorForTask(
      task.Task_Type
    );

  if (!processor) {

    return {
      queueId:
        task.Queue_ID,
      status:
        'NO_PROCESSOR'
    };
  }

  try {

    const fn =
      this[
        processor.functionName
      ];

    if (
      typeof fn !==
      'function'
    ) {

      return {
        queueId:
          task.Queue_ID,
        status:
          'MISSING_FUNCTION',
        processor:
          processor.functionName
      };
    }

    const result =
      fn({
        queueTask: task
      });

    sciipMarkQueueComplete(
      task.Queue_ID
    );

    return {
      queueId:
        task.Queue_ID,
      status:
        'SUCCESS',
      processor:
        processor.id,
      result:
        result
    };

  } catch (error) {

    return {
      queueId:
        task.Queue_ID,
      status:
        'ERROR',
      error:
        String(error)
    };
  }
}

/**
 * Finds a processor for a task.
 *
 * Initial implementation:
 * Event Type → Processor
 *
 * Future:
 * Vocabulary driven routing.
 *
 * @param {string} taskType
 * @returns {Object|null}
 */
function sciipFindProcessorForTask(
  taskType
) {

  const processors =
    sciipGetEnabledProcessors();

  if (
    !processors.length
  ) {
    return null;
  }

  return processors[0];
}

/**
 * Marks queue item complete.
 *
 * @param {string} queueId
 */
function sciipMarkQueueComplete(
  queueId
) {

  const sheet =
    sciipGetWorkQueueSheet();

  const values =
    sheet
      .getDataRange()
      .getValues();

  const headers =
    values[0];

  const queueIndex =
    headers.indexOf(
      'Queue_ID'
    );

  const statusIndex =
    headers.indexOf(
      'Status'
    );

  const completedIndex =
    headers.indexOf(
      'Completed_At'
    );

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    if (
      values[i][queueIndex] ===
      queueId
    ) {

      sheet
        .getRange(
          i + 1,
          statusIndex + 1
        )
        .setValue(
          'COMPLETE'
        );

      sheet
        .getRange(
          i + 1,
          completedIndex + 1
        )
        .setValue(
          sciipNowIso()
        );

      return;
    }
  }
}

/**
 * Processor Runner statistics.
 *
 * @returns {Object}
 */
function sciipProcessorRunnerStats() {

  const queueStats =
    sciipQueueStats();

  return {
    queueRecords:
      queueStats.queueRecords,

    pendingTasks:
      queueStats.pendingTasks,

    generatedAt:
      sciipNowIso()
  };
}