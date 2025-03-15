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
    const sankeyData = {
      data: [
        {
          type: "sankey",
          domain: { x: [0, 1], y: [0, 1] },
          orientation: "h",
          nodepad: 15,
          nodethickness: 15,
          valueformat: pnlData.metadata.valueFormat,
          valuesuffix: pnlData.metadata.valueSuffix,
          nodes: pnlData.sankeyData.nodes.map((node, index) => ({
            ...node,
            color: this.getNodeColor(node.label, pnlData, index),
          })),
          links: pnlData.sankeyData.links.map((link) => {
            const sourceNode = pnlData.sankeyData.nodes[link.source];
            return {
              ...link,
              color: this.getFlowColor(sourceNode.label, pnlData, link.source),
            };
          }),
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
