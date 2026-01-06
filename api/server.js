const express = require("express");
const app = express();
app.use(express.json());

const runs = new Map();
const steps = new Map();
const candidateEvents = [];

// INGEST API
 
app.post("/ingest", (req, res) => {
  const { type, payload } = req.body;

  try {
    switch (type) {
      case "run":
        runs.set(payload.runId, { ...payload, steps: [] });
        break;

      case "step":
        steps.set(payload.stepId, payload);
        const run = runs.get(payload.runId);
        if (run) run.steps.push(payload.stepId);
        break;

      case "step_end":
        const step = steps.get(payload.stepId);
        if (step) Object.assign(step, payload);
        break;

      case "candidates":
        candidateEvents.push(payload);
        break;

      case "run_end":
        const r = runs.get(payload.runId);
        if (r) r.completedAt = payload.completedAt;
        break;
    }
  } catch (_) {
    // swallow all errors
  }

  res.json({ status: "ok" });
});

// QUERY API

app.get("/query/steps", (req, res) => {
    
  const { stepType, minEliminationRate } = req.query;  

  let results = Array.from(steps.values());
  

  if (stepType) {
    results = results.filter(s => s.stepType === stepType);
  }

  if (minEliminationRate) {
    results = results.filter(
      s => s.metrics && s.metrics.eliminationRate >= Number(minEliminationRate)
    );    
  }  

  res.json(
    results.map(step => {
      const run = runs.get(step.runId);
      return {
        runId: step.runId,
        pipelineName: run?.pipelineName,
        stepId: step.stepId,
        stepName: step.stepName,
        metrics: step.metrics
      };
    })
  );
});

app.get("/query/runs/:runId", (req, res) => {  
  const run = runs.get(req.params.runId);  
  if (!run) return res.status(404).json({ error: "Run not found" });

  const runSteps = run.steps.map(id => steps.get(id)).filter(Boolean);
  res.json({ ...run, steps: runSteps });
});

// Query candidates with optional filtering
app.get("/query/candidates", (req, res) => {

  const { stepType } = req.query;

  let result = candidateEvents;

  if (stepType) {
    result = result.filter(e => e.stepType === stepType);
  }

  res.json(result);
});

app.listen(3000, () => {
  console.log("X-Ray API running on port 3000");
});
