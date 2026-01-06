const xray = require("../sdk");

const products = [
  { id: "a", title: "Phone Case", price: 299 },
  { id: "b", title: "Laptop Stand", price: 1999 },
  { id: "c", title: "Phone Charger", price: 1899 }
];

function competitorSelection(products) {
  // ───────── RUN START ─────────
  const run = xray.startRun("competitor_selection");

  // ───────── STEP 1: GENERATION (pretend LLM keywords) ─────────
  const genStep = run.startStep("keyword_generation", {
    stepType: "generate",
    inputsSummary: { title: products.map(p => p.title) }
  });

  // fake non-deterministic output
  const keywords =
    Math.random() > 0.5
      ? ["phone", "accessories"]
      : ["stand", "holder"];   // intentionally bad path

  genStep.end({}, { generatedKeywords: keywords });

  // ───────── STEP 2: RETRIEVAL (API-like step) ─────────
  const retrieveStep = run.startStep("catalog_retrieval", {
    stepType: "retrieve",
    inputsSummary: { keywords }
  });

  // pretend these came from some external catalog
  const candidates = [
    { id: "1", title: "Laptop Stand", price: 999 },
    { id: "2", title: "Phone Charger", price: 899 },
    { id: "3", title: "Headphones", price: 1200 }
  ];

  retrieveStep.recordCandidates?.(candidates, {
    reasoning: "Retrieved based on generated keywords"
  });

  retrieveStep.end(
    { inputCount: 0, outputCount: candidates.length },
    { candidates }
  );

  // ───────── STEP 3: FILTERING ─────────
  const filterStep = run.startStep("price_filter", {
    stepType: "filter",
    inputsSummary: { range: "₹500–₹1500" }
  });

  const filtered = products.filter(
    p => p.price >= 500 && p.price <= 1500
  );

  filterStep.recordCandidates?.(
    products.map(p => ({
      id: p.id,
      price: p.price,
      title: p.title,
      withinRange: p.price >= 500 && p.price <= 1500
    })),
    {
      reasoning: "Range based elimination"
    }
  );

  filterStep.end({
    inputCount: products.length,
    outputCount: filtered.length,
    eliminationRate: 1 - filtered.length / products.length
  });

  // ───────── STEP 4: RANKING ─────────
  const rankStep = run.startStep("relevance_ranking", {
    stepType: "rank",
    inputsSummary: { filteredCount: filtered.length }
  });

  const ranked = filtered.map(p => ({
    id: p.id,
    score: Math.random(),
    reason:
      p.title.includes("Stand")
        ? "Possible hallucinated relevance"
        : "Direct phone accessory"
  }));

  rankStep.recordCandidates?.(ranked, {
    reasoning: "LLM-like scoring simulated"
  });

  rankStep.end({}, { ranked });

  // ───────── STEP 5: SELECTION ─────────
  const selectStep = run.startStep("final_selection", {
    stepType: "select",
    inputsSummary: { rankedCount: ranked.length }
  });

  const selected = ranked[0] || null;

  selectStep.end({}, { selected });

  // ───────── RUN END ─────────
  run.end();
}

// execute
competitorSelection(products);
