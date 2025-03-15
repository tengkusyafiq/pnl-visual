// Data processing and visualization configuration
const PnLProcessor = {
  getNodeCategory(label, pnlData, nodeIndex = null) {
    // First check if the node is explicitly categorized
    for (const [category, config] of Object.entries(pnlData.categories)) {
      if (config.nodes.includes(label)) {
        return category;
      }
    }

    // If not explicitly categorized and we have a node index, check parent's category
    if (nodeIndex !== null) {
      const parentLinks = pnlData.sankeyData.links.filter(
        (link) => link.target === nodeIndex
      );
      if (parentLinks.length > 0) {
        // Get the first parent's label (assuming single parent, but could be modified for multiple)
        const parentNode = pnlData.sankeyData.nodes[parentLinks[0].source];
        const parentCategory = this.getNodeCategory(parentNode.label, pnlData);

        // If parent is a cost node, inherit that category
        if (parentCategory === "cost") {
          return "cost";
        }
      }
    }

    return "other";
  },

  getNodeColor(label, pnlData, nodeIndex = null) {
    const category = this.getNodeCategory(label, pnlData, nodeIndex);
    return pnlData.categories[category].color;
  },

  getFlowColor(label, pnlData, nodeIndex = null) {
    const category = this.getNodeCategory(label, pnlData, nodeIndex);
    return pnlData.categories[category].flowColor;
  },

  processData(pnlData) {
    // Calculate total values for each node
    const nodeValues = new Array(pnlData.sankeyData.nodes.length).fill(0);

    // Sum up all incoming values for each node
    pnlData.sankeyData.links.forEach((link) => {
      nodeValues[link.target] += link.value;
    });

    // Sum up all outgoing values for source nodes that don't have incoming links
    pnlData.sankeyData.links.forEach((link) => {
      if (!pnlData.sankeyData.links.some((l) => l.target === link.source)) {
        nodeValues[link.source] = link.value;
      }
    });

    // Calculate number of children for each node
    const childCount = new Array(pnlData.sankeyData.nodes.length).fill(0);
    pnlData.sankeyData.links.forEach((link) => {
      childCount[link.source]++;
    });

    const sankeyData = {
      data: [
        {
          type: "sankey",
          domain: { x: [0, 1], y: [0, 1] },
          orientation: "h",
          valueformat: pnlData.metadata.valueFormat,
          valuesuffix: pnlData.metadata.valueSuffix,
          hoverlabel: { align: "left" },
          node: {
            pad: 15,
            thickness: 15,
            line: { width: 0.5 },
            label: pnlData.sankeyData.nodes.map((n) => n.label),
            color: pnlData.sankeyData.nodes.map((node, index) =>
              this.getNodeColor(node.label, pnlData, index)
            ),
            customdata: childCount,
            hovertemplate:
              "%{label}<br>$%{value:,.0f}<br>Items: %{customdata}<extra></extra>",
          },
          link: {
            source: pnlData.sankeyData.links.map((link) => link.source),
            target: pnlData.sankeyData.links.map((link) => link.target),
            value: pnlData.sankeyData.links.map((link) => link.value),
            color: pnlData.sankeyData.links.map((link) => {
              const sourceNode = pnlData.sankeyData.nodes[link.source];
              return this.getFlowColor(sourceNode.label, pnlData, link.source);
            }),
            hovertemplate: "$%{value:,.0f}<extra></extra>",
          },
        },
      ],
      layout: {
        title: pnlData.metadata.title,
        width: 1118,
        height: 772,
        font: { size: 10 },
        updatemenus: [
          {
            y: 1,
            buttons: [
              {
                label: "Light",
                method: "relayout",
                args: ["paper_bgcolor", "white"],
              },
              {
                label: "Dark",
                method: "relayout",
                args: ["paper_bgcolor", "black"],
              },
            ],
          },
          {
            y: 0.9,
            buttons: [
              {
                label: "Thick",
                method: "restyle",
                args: ["nodethickness", 15],
              },
              {
                label: "Thin",
                method: "restyle",
                args: ["nodethickness", 8],
              },
            ],
          },
          {
            y: 0.8,
            buttons: [
              {
                label: "Small gap",
                method: "restyle",
                args: ["nodepad", 15],
              },
              {
                label: "Large gap",
                method: "restyle",
                args: ["nodepad", 20],
              },
            ],
          },
          {
            y: 0.7,
            buttons: [
              {
                label: "Snap",
                method: "restyle",
                args: ["arrangement", "snap"],
              },
              {
                label: "Perpendicular",
                method: "restyle",
                args: ["arrangement", "perpendicular"],
              },
              {
                label: "Freeform",
                method: "restyle",
                args: ["arrangement", "freeform"],
              },
              {
                label: "Fixed",
                method: "restyle",
                args: ["arrangement", "fixed"],
              },
            ],
          },
          {
            y: 0.6,
            buttons: [
              {
                label: "Horizontal",
                method: "restyle",
                args: ["orientation", "h"],
              },
              {
                label: "Vertical",
                method: "restyle",
                args: ["orientation", "v"],
              },
            ],
          },
        ],
      },
    };
    return sankeyData;
  },
};

// Export the processor
window.PnLViewer = PnLProcessor;
