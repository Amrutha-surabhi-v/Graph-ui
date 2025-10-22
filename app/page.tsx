"use client";

import React, { useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  MarkerType,
  Node,
  Edge
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import CustomNode from "./CustomNode";

const nodeWidth = 180;
const nodeHeight = 80;

export default function Page() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  useEffect(() => {
    fetch("/data/graphData.json")
      .then((res) => res.json())
      .then((data) => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ rankdir: "TB", nodesep: 120, ranksep: 150 });

        type GraphNode = { id: string; label: string; type: string };
        type GraphEdge = { id: string; source: string; target: string; label: string };

        const formattedNodes: Node[] = (data.nodes as GraphNode[]).map((n) => ({
          id: n.id,
          type: "customNode",
          data: { label: n.label, type: n.type },
          position: { x: 0, y: 0 }
        }));

        const formattedEdges: Edge[] = (data.edges as GraphEdge[]).map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#38bdf8" },
          style: { stroke: "#38bdf8", strokeWidth: 2 },
          labelStyle: {
            fill: "#ffffff",           // pure white text
            fontSize: 14,              // slightly larger
            fontWeight: 700,           // bold
            background: "#00000080",   // translucent black background for contrast
            padding: 4,
            borderRadius: 4,
          },
          labelBgStyle: { fill: "#000000", fillOpacity: 0.6 }, // optional background
          labelBgPadding: [6, 3],
          labelBgBorderRadius: 4,
        }));
        

        formattedNodes.forEach((n) =>
          dagreGraph.setNode(n.id, { width: nodeWidth, height: nodeHeight })
        );
        formattedEdges.forEach((e) => dagreGraph.setEdge(e.source, e.target));
        dagre.layout(dagreGraph);

        formattedNodes.forEach((n) => {
          const pos = dagreGraph.node(n.id);
          n.position = { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 };
        });

        setNodes(formattedNodes);
        setEdges(formattedEdges);
      });
  }, [setNodes, setEdges]);

  return (
    <div className="w-screen h-screen bg-gray-950">
      <h1 className="text-center text-white text-3xl font-bold py-4">Maltego Graph</h1>
      <ReactFlow
        nodeTypes={{ customNode: CustomNode }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background color="#333" gap={20} />
      </ReactFlow>
    </div>
  );
}
