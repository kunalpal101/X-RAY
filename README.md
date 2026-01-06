# X-RAY

Small local service for ingesting and querying pipeline run events.

## Prerequisites

- Node.js (v14+ recommended)

## Install

Install dependencies:

```bash
npm install
```

## Run the application server

Start the API server (listens on port 3000):

```bash
node api/server.js
```

The server exposes an ingest endpoint and several query endpoints documented below.

## Run the demo

There are two demo scripts under the `demo/` folder. They send sample events to the server's ingest endpoint (`http://localhost:3000/ingest`). Run either while the server is running:

```bash
node demo/demo.js
# or
node demo/demo_1.js
```

### Demo summaries

- `demo/demo.js`: Runs a single `competitor_selection` run with one `price_filter` step. It records the input candidate list, filters products to the ₹500–₹1500 range, records candidates and ends the step with metrics (input/output counts and eliminationRate), then ends the run.
- `demo/demo_1.js`: Simulates a multi-step pipeline (`keyword_generation` → `catalog_retrieval` → `price_filter` → `relevance_ranking` → `final_selection`). It fakes generated keywords and candidate retrieval, records candidate lists at multiple steps, computes/filter metrics, simulates ranking/scoring, selects a final item, and ends the run (with some randomness to illustrate non-deterministic outputs).

## Ingest API

POST /ingest

- Body JSON shape: `{ type, payload }`
- `type` can be one of: `run`, `step`, `step_end`, `candidates`, `run_end`.

Example (create a run):

```bash
curl -X POST http://localhost:3000/ingest \
  -H "Content-Type: application/json" \
  -d '{"type":"run","payload":{"runId":"r1","pipelineName":"my-pipeline","createdAt":1650000000000}}'
```

Example (add a step):

```bash
curl -X POST http://localhost:3000/ingest \
  -H "Content-Type: application/json" \
  -d '{"type":"step","payload":{"stepId":"s1","runId":"r1","stepName":"step-1","stepType":"variant-test"}}'
```

## Query APIs

All query endpoints are under `GET /query`.

- GET `/query/steps`
  - Optional query params: `stepType`, `minEliminationRate`
  - Example:

```bash
curl "http://localhost:3000/query/steps?stepType=variant-test&minEliminationRate=0.5"
```

Response items include: `runId`, `pipelineName`, `stepId`, `stepName`, `metrics`.

- GET `/query/runs/:runId`
  - Returns the run object with its `steps` expanded to step objects.
  - Example:

```bash
curl http://localhost:3000/query/runs/r1
```

- GET `/query/candidates`
  - Optional query param: `stepType`
  - Example:

```bash
curl "http://localhost:3000/query/candidates?stepType=variant-test"
```

## Notes

- The server stores data in-memory (no persistence). Restarting the process clears all stored runs, steps, and candidate events.
- Demo scripts assume the API server is running on `http://localhost:3000`.

