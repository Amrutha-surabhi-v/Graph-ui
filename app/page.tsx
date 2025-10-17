"use client";

import React, { useEffect, useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

type GraphNode = {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

export default function HomePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  useEffect(() => {
    fetch("/data/graphdata.json")
      .then(async (res) => {
        const contentType = res.headers.get("content-type") || "";
        const statusInfo = `${res.status} ${res.statusText}`;
        const bodyText = await res.text();

        if (!res.ok) {
          console.error("Graph data fetch failed:", { statusInfo, contentType, bodyPreview: bodyText.slice(0, 200) });
          throw new Error(`Failed to load graph data: ${statusInfo}`);
        }

        try {
          return JSON.parse(bodyText);
        } catch (err) {
          console.error("Failed to parse graph JSON:", { contentType, statusInfo, bodyPreview: bodyText.slice(0, 200) });
          throw err;
        }
      })
      .then((data) => {
        const typeStyles: Record<string, { color: string; icon: string }> = {
          person: { color: "#60a5fa", icon: "👤" },
          email: { color: "#f59e0b", icon: "📧" },
          domain: { color: "#22c55e", icon: "🌐" },
          social: { color: "#0ea5e9", icon: "💬" },
          risk: { color: "#ef4444", icon: "⚠️" }
        };

        const formattedNodes: Node[] = data.nodes.map((n: GraphNode) => {
          const style = typeStyles[n.type] || { color: "#9ca3af", icon: "🔘" };
          return {
            id: n.id,
            type: "default",
            position: { x: n.x, y: n.y },
            data: { label: `${style.icon} ${n.label}` },
            style: {
              border: `2px solid ${style.color}`,
              borderRadius: 12,
              background: "#111827",
              color: "#fff",
              padding: 10,
              fontSize: 14,
              width: 150,
              textAlign: "center",
              boxShadow: `0 0 10px ${style.color}50`,
            },
          };
        });

        const formattedEdges: Edge[] = data.edges.map((e: GraphEdge) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: "smoothstep",
          label: e.label,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#60a5fa" },
          style: { stroke: "#60a5fa", strokeWidth: 2 },
          labelStyle: { fill: "white", fontWeight: 600, fontSize: 12 },
          labelBgStyle: {
            fill: "#1f2937",
            fillOpacity: 0.8,
            color: "#fff",
          },
          labelBgPadding: [6, 3],
          labelBgBorderRadius: 4,
        }));

        setNodes(formattedNodes);
        setEdges(formattedEdges);
      })
      .catch((err) => {
        console.error("Error fetching graph data:", err);
      });
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params }, eds)), // ❌ No animation
    [setEdges]
  );

  return (
    <div className="w-screen h-screen bg-gray-950 text-white">
      <h1 className="text-center text-3xl font-bold p-4">
        🕸️ Multi-Person Maltego Graph
      </h1>

      <div className="w-full h-[90vh]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          nodesDraggable
        >
          <MiniMap nodeColor={() => "#60a5fa"} />
          <Controls />
          <Background color="#333" gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
}
