"use client";

import React, { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  MarkerType,
  Position,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

type GraphNode = { id: string; label: string; type: string };
type GraphEdge = { id: string; source: string; target: string; label: string };

const nodeWidth = 180;
const nodeHeight = 50;

function layoutCluster(nodes: Node[], edges: Edge[], offsetX: number, offsetY: number) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Automatically adjust layout based on cluster size
  const dynamicSpacing = Math.max(120, nodes.length * 30);

  dagreGraph.setGraph({
    rankdir: "TB", // top-bottom layout
    nodesep: 80,
    ranksep: dynamicSpacing,
  });

  nodes.forEach((n) => dagreGraph.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));

  dagre.layout(dagreGraph);

  nodes.forEach((n) => {
    const pos = dagreGraph.node(n.id);
    n.position = { x: pos.x - nodeWidth / 2 + offsetX, y: pos.y - nodeHeight / 2 + offsetY };
    n.sourcePosition = Position.Bottom;
    n.targetPosition = Position.Top;
  });

  return { nodes, edges };
}

export default function HomePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  useEffect(() => {
    fetch("/data/graphData.json")
      .then((res) => res.json())
      .then((data) => {
        const typeColors: Record<string, string> = {
          person: "#60a5fa", // blue
          email: "#f59e0b", // yellow
          domain: "#22c55e", // green
          company: "#8b5cf6", // purple
          social: "#0ea5e9", // cyan
        };

        // Group by the "person" (source) node
        const groups: Record<string, { nodes: GraphNode[]; edges: GraphEdge[] }> = {};

        data.edges.forEach((e: GraphEdge) => {
          const groupId = e.source;
          if (!groups[groupId]) groups[groupId] = { nodes: [], edges: [] };
          groups[groupId].edges.push(e);
        });

        Object.keys(groups).forEach((gid) => {
          const relatedIds = new Set<string>();
          groups[gid].edges.forEach((e) => {
            relatedIds.add(e.source);
            relatedIds.add(e.target);
          });
          groups[gid].nodes = data.nodes.filter((n: GraphNode) => relatedIds.has(n.id));
        });

        const allNodes: Node[] = [];
        const allEdges: Edge[] = [];

        let offsetX = 0;
        let offsetY = 0;
        let clusterIndex = 0;

        Object.keys(groups).forEach((gid) => {
          const cluster = groups[gid];
          const formattedNodes: Node[] = cluster.nodes.map((n) => {
            const color = typeColors[n.type] || "#9ca3af";
            return {
              id: n.id,
              data: { label: n.label },
              position: { x: 0, y: 0 },
              style: {
                border: `2px solid ${color}`,
                borderRadius: 10,
                background: "#111827",
                color: "#fff",
                padding: 10,
                fontSize: 14,
                width: nodeWidth,
                textAlign: "center",
                boxShadow: `0 0 10px ${color}50`,
              },
            };
          });

          const formattedEdges: Edge[] = cluster.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: "smoothstep",
            label: e.label,
            markerEnd: { type: MarkerType.ArrowClosed, color: "#60a5fa" },
            style: { stroke: "#60a5fa", strokeWidth: 2 },
            labelStyle: { fill: "white", fontWeight: 600, fontSize: 12 },
            labelBgStyle: { fill: "#1f2937", fillOpacity: 0.8, color: "#fff" },
            labelBgPadding: [6, 3],
            labelBgBorderRadius: 4,
          }));

          // Layout with adaptive spacing based on cluster size
          const layouted = layoutCluster(
            formattedNodes,
            formattedEdges,
            offsetX,
            offsetY
          );

          allNodes.push(...layouted.nodes);
          allEdges.push(...layouted.edges);

          offsetX += 450 + layouted.nodes.length * 10; // space between clusters
          offsetY += 300; // vertical spacing between clusters
          clusterIndex++;
        });

        setNodes(allNodes);
        setEdges(allEdges);
      });
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-950 text-white">
      <h1 className="text-center text-3xl font-bold py-4">Dynamic Maltego Graph</h1>

      <div className="w-full h-[90vh]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <MiniMap nodeColor={() => "#60a5fa"} />
          <Controls />
          <Background color="#333" gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
}
