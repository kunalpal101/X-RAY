const xray = require("../sdk");

function competitorSelection(products) {

  const run = xray.startRun("competitor_selection");

  const step = run.startStep("price_filter", {
    stepType: "filter",
    inputsSummary: { range: "₹500–₹1500" }
  });

  const filtered = products.filter(p => p.price >= 500 && p.price <= 1500);

  step.recordCandidates(products, {
    reasoning: "Checking each product against price range"
  });

  step.end({
    inputCount: products.length,
    outputCount: filtered.length,
    eliminationRate: 1 - filtered.length / products.length
  });

  run.end();
}

competitorSelection([
  { id:"a", title:"Phone Case", price:299 },
  { id:"b", title:"Laptop Stand", price:1999 }
]);
