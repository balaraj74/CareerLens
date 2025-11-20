'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { Star, TrendingUp } from 'lucide-react';

interface CareerNode {
  id: string;
  label: string;
  type: string;
  score?: number;
  summary?: string;
  metadata?: any;
  actions?: any;
}

interface CareerTreeCanvasProps {
  nodes: CareerNode[];
  edges: Array<{ from: string; to: string; type?: string; label?: string }>;
  onNodeClick: (node: CareerNode) => void;
  selectedNodeId?: string;
}

const nodeColors: Record<string, { bg: string; border: string; glow: string }> = {
  root: { bg: 'hsl(var(--chart-1))', border: 'hsl(var(--chart-1))', glow: 'hsl(var(--chart-1))' },
  stream: { bg: 'hsl(var(--chart-2))', border: 'hsl(var(--chart-2))', glow: 'hsl(var(--chart-2))' },
  subject: { bg: 'hsl(var(--chart-3))', border: 'hsl(var(--chart-3))', glow: 'hsl(var(--chart-3))' },
  exam: { bg: 'hsl(var(--chart-4))', border: 'hsl(var(--chart-4))', glow: 'hsl(var(--chart-4))' },
  degree: { bg: 'hsl(var(--chart-5))', border: 'hsl(var(--chart-5))', glow: 'hsl(var(--chart-5))' },
  career: { bg: 'hsl(var(--chart-1))', border: 'hsl(var(--chart-1))', glow: 'hsl(var(--chart-1))' },
  course: { bg: 'hsl(var(--chart-2))', border: 'hsl(var(--chart-2))', glow: 'hsl(var(--chart-2))' },
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, ranksep: window.innerWidth < 768 ? 100 : 150, nodesep: window.innerWidth < 768 ? 80 : 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: window.innerWidth < 768 ? 200 : 250, height: window.innerWidth < 768 ? 100 : 120 });
  });  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 60,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function CareerTreeCanvas({
  nodes: careerNodes,
  edges: careerEdges,
  onNodeClick,
  selectedNodeId,
}: CareerTreeCanvasProps) {
  // Convert career nodes to ReactFlow nodes with better styling
  const flowNodes: Node[] = useMemo(() => {
    return careerNodes.map((node) => {
      const colors = nodeColors[node.type] || { bg: '#6b7280', border: '#9ca3af', glow: '#6b7280' };
      const isSelected = node.id === selectedNodeId;
      const hasHighScore = (node.score || 0) >= 80;
      
      return {
        id: node.id,
        type: 'default',
        position: { x: 0, y: 0 }, // Will be set by dagre
        data: {
          label: (
            <div className="relative w-full h-full">
              {/* Score badge */}
              {node.score && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                    hasHighScore ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'
                  }`}>
                    <Star className={`w-3 h-3 ${hasHighScore ? 'fill-gray-900' : 'fill-gray-500'}`} />
                    {node.score}
                  </div>
                </div>
              )}
              
              {/* Main content */}
              <div className="flex flex-col items-center justify-center h-full px-4 py-3">
                <div className="text-center mb-2">
                  <div className="text-sm font-bold mb-1 leading-tight">{node.label}</div>
                  <div className="text-[10px] uppercase font-semibold opacity-70 tracking-wide">
                    {node.type}
                  </div>
                </div>
                
                {/* Metadata badges */}
                <div className="flex flex-wrap gap-1 justify-center mt-1">
                  {node.metadata?.demand === 'high' && (
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 text-[9px] font-semibold">
                      <TrendingUp className="w-2.5 h-2.5" />
                      High Demand
                    </div>
                  )}
                  {node.metadata?.durationYears && (
                    <div className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-semibold">
                      {node.metadata.durationYears}y
                    </div>
                  )}
                </div>
              </div>
            </div>
          ),
        },
        style: {
          background: isSelected 
            ? `linear-gradient(135deg, ${colors.bg} 0%, ${colors.border} 100%)`
            : `linear-gradient(135deg, ${colors.bg}dd 0%, ${colors.bg}99 100%)`,
          color: '#fff',
          border: isSelected ? `3px solid ${colors.border}` : `2px solid ${colors.border}80`,
          borderRadius: '16px',
          padding: 0,
          boxShadow: isSelected
            ? `0 0 30px ${colors.glow}99, 0 8px 16px rgba(0,0,0,0.4)`
            : `0 4px 12px rgba(0,0,0,0.3)`,
          width: window.innerWidth < 768 ? 200 : 250,
          height: window.innerWidth < 768 ? 100 : 120,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
    });
  }, [careerNodes, selectedNodeId]);

  // Convert career edges to ReactFlow edges with better styling
  const flowEdges: Edge[] = useMemo(() => {
    return careerEdges.map((edge, index) => {
      const sourceNode = careerNodes.find((n) => n.id === edge.from);
      const targetNode = careerNodes.find((n) => n.id === edge.to);
      const colors = nodeColors[targetNode?.type || 'default'];
      
      return {
        id: `edge-${index}`,
        source: edge.from,
        target: edge.to,
        label: edge.label || '',
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: colors?.border || 'hsl(var(--border))',
          strokeWidth: 2.5,
        },
        labelStyle: {
          fill: '#e2e8f0',
          fontSize: 10,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: '#1e293b',
          fillOpacity: 0.8,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: colors?.border || '#94a3b8',
          width: 20,
          height: 20,
        },
      };
    });
  }, [careerEdges, careerNodes]);

  // Apply dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(flowNodes, flowEdges),
    [flowNodes, flowEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Update nodes when layout changes
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const careerNode = careerNodes.find((n) => n.id === node.id);
      if (careerNode) {
        onNodeClick(careerNode);
      }
    },
    [careerNodes, onNodeClick]
  );

  return (
    <div className="w-full h-full bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
        minZoom={0.3}
        maxZoom={2}
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20"
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#475569" gap={20} size={1.5} />
        <Controls className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl" />
        <MiniMap
          className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
          nodeColor={(node) => {
            const careerNode = careerNodes.find((n) => n.id === node.id);
            return nodeColors[careerNode?.type || 'default']?.bg || '#6b7280';
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}
