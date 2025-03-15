// PnL Data Standard Structure
const pnlData = {
  metadata: {
    title: "Netflix Profit and Loss Statement - Q2 FY22",
    company: "Netflix",
    period: "Q2 FY22",
    currency: "USD",
    valueFormat: ".1f",
    valueSuffix: "$",
  },
  categories: {
    revenue: {
      name: "Revenue",
      color: "grey",
      flowColor: "rgba(128,128,128,0.4)",
      nodes: [
        "Total Revenue",
        "UCAN Revenue",
        "EMEA Revenue",
        "LATAM Revenue",
        "APAC Revenue",
        "Other Revenue"
      ],
    },
    profit: {
      name: "Profit",
      color: "green",
      flowColor: "rgba(0,255,0,0.4)",
      nodes: [
        "Gross Profit",
        "Operating Profit",
        "Net Profit",
        "Other Income"
      ],
    },
    cost: {
      name: "Cost",
      color: "red",
      flowColor: "rgba(255,0,0,0.4)",
      nodes: [
        "Cost of Revenue",
        "Operating Expenses",
        "Technology & Development",
        "Marketing",
        "General & Admin",
        "Tax"
      ],
    },
    other: {
      name: "Other",
      color: "blue",
      flowColor: "rgba(0,0,255,0.4)",
      nodes: [],
    },
  },
  sankeyData: {
    nodes: [
      { label: "Total Revenue" },
      { label: "UCAN Revenue" },
      { label: "EMEA Revenue" },
      { label: "LATAM Revenue" },
      { label: "APAC Revenue" },
      { label: "Other Revenue" },
      { label: "Cost of Revenue" },
      { label: "Gross Profit" },
      { label: "Operating Expenses" },
      { label: "Operating Profit" },
      { label: "Other Income" },
      { label: "Tax" },
      { label: "Net Profit" },
      { label: "Technology & Development" },
      { label: "Marketing" },
      { label: "General & Admin" }
    ],
    links: [
      { source: 1, target: 0, value: 3500000000 },
      { source: 2, target: 0, value: 2500000000 },
      { source: 3, target: 0, value: 1000000000 },
      { source: 4, target: 0, value: 900000000 },
      { source: 5, target: 0, value: 37000000 },
      { source: 0, target: 6, value: 4700000000 },
      { source: 0, target: 7, value: 3300000000 },
      { source: 7, target: 8, value: 1700000000 },
      { source: 7, target: 9, value: 1600000000 },
      { source: 9, target: 10, value: 45000000 },
      { source: 9, target: 11, value: 200000000 },
      { source: 9, target: 12, value: 1400000000 },
      { source: 8, target: 13, value: 700000000 },
      { source: 8, target: 14, value: 600000000 },
      { source: 8, target: 15, value: 400000000 }
    ],
  },
};

// Export the PnL data
window.ExamplePnL = pnlData;
