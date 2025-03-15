// Data processing and visualization configuration
const PnLProcessor = {
  // Add new helper functions for color generation
  generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
    const lightness = 45 + Math.floor(Math.random() * 10); // 45-55%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  },

  // Convert any color format to RGBA with specified opacity
  toRGBA(color, opacity = 0.3) {
    // Adjusted transparency to 0.3 for better visibility
    // Create a temporary element to compute the RGB values
    const temp = document.createElement("div");
    temp.style.color = color;
    document.body.appendChild(temp);
    const computedColor = window.getComputedStyle(temp).color;
    document.body.removeChild(temp);

    // Extract RGB values
    const rgb = computedColor.match(/\d+/g).map(Number);
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
  },

  // Cache for consistent random colors
  colorCache: new Map(),

  // Default colors for special categories
  defaultColors: {
    revenue: "#666666", // Updated grey
    cost: "#cc0001", // Updated red
    profit: "#2ba02d", // Updated green
  },

  // Get category config with fallback to random colors
  getCategoryConfig(category, pnlData) {
    const config = pnlData.categories[category];
    if (!config.color) {
      // Use default colors for revenue, cost and profit, random for others
      if (category in this.defaultColors) {
        config.color = this.defaultColors[category];
      } else {
        // Use cached color or generate new one for other categories
        if (!this.colorCache.has(category)) {
          this.colorCache.set(category, this.generateRandomColor());
        }
        config.color = this.colorCache.get(category);
      }
    }
    if (!config.flowColor) {
      config.flowColor = this.toRGBA(config.color, 0.4);
    }
    return config;
  },

  // Helper function to format large numbers
  formatLargeNumber(value) {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    }
    return value.toLocaleString();
  },

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
    return this.getCategoryConfig(category, pnlData).color;
  },

  getFlowColor(
    sourceLabel,
    targetLabel,
    pnlData,
    sourceIndex = null,
    targetIndex = null
  ) {
    // For flows going into cost or profit nodes, use the target node's flowColor
    const targetCategory = this.getNodeCategory(
      targetLabel,
      pnlData,
      targetIndex
    );
    if (targetCategory === "cost" || targetCategory === "profit") {
      return this.getCategoryConfig(targetCategory, pnlData).flowColor;
    }

    // For other cases, use the source node's category flowColor
    const sourceCategory = this.getNodeCategory(
      sourceLabel,
      pnlData,
      sourceIndex
    );
    return this.getCategoryConfig(sourceCategory, pnlData).flowColor;
  },

  processData(pnlData) {
    // Calculate total values for each node
    const nodeValues = new Array(pnlData.sankeyData.nodes.length).fill(0);
    const childCount = new Array(pnlData.sankeyData.nodes.length).fill(0);

    // Sum up all incoming values for each node
    pnlData.sankeyData.links.forEach((link) => {
      nodeValues[link.target] += link.value;
    });

    // Count outgoing flows (children) for each node
    pnlData.sankeyData.links.forEach((link) => {
      childCount[link.source]++;
    });

    // Sum up all outgoing values for source nodes that don't have incoming links
    pnlData.sankeyData.links.forEach((link) => {
      if (!pnlData.sankeyData.links.some((l) => l.target === link.source)) {
        nodeValues[link.source] = link.value;
      }
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
            pad: 30,
            thickness: 30,
            line: { width: 0 },
            label: pnlData.sankeyData.nodes.map(
              (n, i) =>
                `${n.label}<br>$${this.formatLargeNumber(nodeValues[i])}`
            ),
            color: pnlData.sankeyData.nodes.map((node, index) =>
              this.getNodeColor(node.label, pnlData, index)
            ),
            customdata: nodeValues.map((value, index) => ({
              value: value,
              subItems: childCount[index],
              formattedValue: this.formatLargeNumber(value),
            })),
            hovertemplate:
              "%{label}<br>Sub-items: %{customdata.subItems}<extra></extra>",
            textposition: "center",
            text: pnlData.sankeyData.nodes.map(
              (n, i) =>
                `${n.label}<br>$${this.formatLargeNumber(nodeValues[i])}`
            ),
            textfont: {
              size: 12,
              family:
                "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              weight: 600,
            },
          },
          link: {
            source: pnlData.sankeyData.links.map((link) => link.source),
            target: pnlData.sankeyData.links.map((link) => link.target),
            value: pnlData.sankeyData.links.map((link) => link.value),
            color: pnlData.sankeyData.links.map((link) => {
              const sourceNode = pnlData.sankeyData.nodes[link.source];
              const targetNode = pnlData.sankeyData.nodes[link.target];
              return this.getFlowColor(
                sourceNode.label,
                targetNode.label,
                pnlData,
                link.source,
                link.target
              );
            }),
            hoverinfo: "skip",
          },
        },
      ],
      layout: {
        title: {
          text: pnlData.metadata.title,
          y: 0.98,
          x: 0.5,
          xanchor: "center",
          yanchor: "top",
          font: {
            family:
              "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            size: 16,
            weight: 700,
          },
        },
        autosize: true,
        font: {
          family:
            "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          size: 12,
          weight: 600,
        },
        margin: { l: 50, r: 50, t: 80, b: 50 }, // Increased top margin for labels
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
