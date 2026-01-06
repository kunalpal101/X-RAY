const { sendEvent } = require("./client");
const { generateId, now } = require("./utils");

function startRun(pipelineName, options = {}) {
  const runId = generateId();
  const startedAt = now();

  sendEvent("run", {
    runId,
    pipelineName,
    pipelineVersion: options.version || "v1",
    metadata: options.metadata || {},
    startedAt,
  });

  function startStep(stepName, config = {}) {
    const stepId = generateId();
    const stepStartedAt = now();

    sendEvent("step", {
      stepId,
      runId,
      stepName,
      stepType: config.stepType,
      inputsSummary: config.inputsSummary || {},
      startedAt: stepStartedAt,
    });

    return {
      end(metrics = {}, outcomeSummary = {}) {
        sendEvent("step_end", {
          stepId,
          runId,
          metrics,
          outcomeSummary,
          completedAt: now(),
        });
      },
      recordCandidates(candidates, opts = {}) {
        sendEvent("candidates", {
          stepId,
          runId,
          stepType: config.stepType,
          sample: candidates.slice(0, opts.limit || 50),
          reasoning: opts.reasoning || null,
        });
      },
    };
  }
  return {
    startStep,
    end() {
      sendEvent("run_end", {
        runId,
        completedAt: now(),
      });
    },
  };
}

module.exports = { startRun };
