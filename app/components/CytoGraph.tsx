"use client";

import React, { useEffect, useRef } from "react";
import cytoscape, { Core, LayoutOptions } from "cytoscape";
import dagre from "cytoscape-dagre";

dagre(cytoscape);

type GraphNode = { id: string; label: string; type: string };
type GraphEdge = { id: string; source: string; target: string; label: string };

const typeColor: Record<string, string> = {
  person: "#60a5fa",
  email: "#f59e0b", 
  domain: "#22c55e",
  company: "#8b5cf6",
  social: "#0ea5e9",
};

function getIconEmoji(type: string, label: string): string {
  const lower = label.toLowerCase();
  if (type === "person") return "👤";
  if (type === "email") return "✉️";
  if (type === "company") return "🏢";
  if (type === "domain") return "🌐";
  if (type === "social") {
    if (lower.includes("twitter")) return "🐦";
    if (lower.includes("linkedin")) return "💼";
  }
  return "";
}

function buildElements(nodes: GraphNode[], edges: GraphEdge[]) {
  const nodeElements = nodes.map((n) => ({
    data: { 
      id: n.id, 
      label: `${getIconEmoji(n.type, n.label)} ${n.label}`,
      type: n.type
    },
    selectable: false,
    grabbable: false,
  }));

  const edgeElements = edges.map((e) => ({
    data: { id: e.id, source: e.source, target: e.target, label: e.label },
    selectable: false,
    grabbable: false,
  }));

  return [...nodeElements, ...edgeElements];
}

export default function CytoGraph() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    let destroyed = false;
    (async () => {
      const res = await fetch("/data/graphdata.json");
      const data = await res.json();
      if (destroyed || !containerRef.current) return;

      const cy = cytoscape({
        container: containerRef.current,
        elements: buildElements(data.nodes, data.edges),
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#111827",
              "border-width": 3,
              "border-color": (ele) => typeColor[ele.data("type")] || "#9ca3af",
              "border-opacity": 1,
              width: 180,
              height: 50,
              shape: "round-rectangle",
              color: "#fff",
              "font-size": 14,
              "font-family": "Font Awesome 6 Free, Font Awesome 6 Brands, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
              "text-valign": "center",
              "text-halign": "center",
              label: "data(label)",
              "text-wrap": "wrap",
              "text-max-width": "160px",
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#60a5fa",
              "curve-style": "bezier",
              "target-arrow-color": "#60a5fa",
              "target-arrow-shape": "triangle",
              label: "data(label)",
              color: "#e5e7eb",
              "font-weight": 600,
              "font-size": 11,
              "text-background-opacity": 0.9,
              "text-background-color": "#1f2937",
              "text-background-padding": "3px",
              "text-border-opacity": 0,
              "text-rotation": "autorotate",
            },
          },
        ],
        wheelSensitivity: 0.2,
        minZoom: 0.2,
        maxZoom: 2,
        boxSelectionEnabled: false,
        userPanningEnabled: true,
        userZoomingEnabled: true,
      });

      cyRef.current = cy;

      // Dagre layout for clean hierarchical structure
      cy.layout({
        name: "dagre",
        rankDir: "TB",
        nodeSep: 100,
        rankSep: 120,
        edgeSep: 30,
        padding: 20,
      } as unknown as LayoutOptions).run();

    })();

    return () => {
      destroyed = true;
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "90vh", background: "#0b1220" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}


