'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SkillNode } from '@/lib/types';

interface SkillGraphProps {
  skills: SkillNode[];
  onNodeClick?: (skill: SkillNode) => void;
}

const CATEGORY_COLORS = {
  technical: '#8B5CF6', // violet
  soft: '#10B981', // emerald
  domain: '#F59E0B', // amber
  tool: '#3B82F6', // blue
  language: '#EF4444', // red
};

export function SkillGraph({ skills, onNodeClick }: SkillGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Node positions (calculated using force-directed layout simulation)
  const nodePositions = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(
    new Map()
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize node positions if not already set
    if (nodePositions.current.size === 0) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      skills.forEach((skill, index) => {
        const angle = (index / skills.length) * 2 * Math.PI;
        const radius = 150 + Math.random() * 100;
        nodePositions.current.set(skill.id, {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
        });
      });
    }

    // Force-directed layout simulation
    let animationId: number;
    const simulate = () => {
      // Apply forces
      applyForces();
      
      // Render
      render(ctx, canvas.width, canvas.height);
      
      animationId = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [skills, zoom, offset, selectedNode]);

  const applyForces = () => {
    const alpha = 0.02; // Simulation strength
    const centerX = (canvasRef.current?.width || 800) / 2;
    const centerY = (canvasRef.current?.height || 600) / 2;

    skills.forEach((skill) => {
      const pos = nodePositions.current.get(skill.id);
      if (!pos) return;

      // 1. Repulsion from other nodes
      skills.forEach((otherSkill) => {
        if (skill.id === otherSkill.id) return;
        const otherPos = nodePositions.current.get(otherSkill.id);
        if (!otherPos) return;

        const dx = pos.x - otherPos.x;
        const dy = pos.y - otherPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        if (distance < 200) {
          const force = 100 / (distance * distance);
          pos.vx += (dx / distance) * force;
          pos.vy += (dy / distance) * force;
        }
      });

      // 2. Attraction along connections
      skill.connections.forEach((connId) => {
        const connPos = nodePositions.current.get(connId);
        if (!connPos) return;

        const dx = connPos.x - pos.x;
        const dy = connPos.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const force = distance * 0.001;
        pos.vx += (dx / distance) * force;
        pos.vy += (dy / distance) * force;
      });

      // 3. Gravity toward center
      const dx = centerX - pos.x;
      const dy = centerY - pos.y;
      pos.vx += dx * 0.0001;
      pos.vy += dy * 0.0001;

      // 4. Apply velocity with damping
      pos.vx *= 0.9;
      pos.vy *= 0.9;
      pos.x += pos.vx * alpha * 10;
      pos.y += pos.vy * alpha * 10;

      // Keep nodes within bounds
      const margin = 50;
      pos.x = Math.max(margin, Math.min((canvasRef.current?.width || 800) - margin, pos.x));
      pos.y = Math.max(margin, Math.min((canvasRef.current?.height || 600) - margin, pos.y));
    });
  };

  const render = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    
    // Apply zoom and pan
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw connections
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    skills.forEach((skill) => {
      const pos = nodePositions.current.get(skill.id);
      if (!pos) return;

      skill.connections.forEach((connId) => {
        const connPos = nodePositions.current.get(connId);
        if (!connPos) return;

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(connPos.x, connPos.y);
        ctx.stroke();
      });
    });

    // Draw nodes
    skills.forEach((skill) => {
      const pos = nodePositions.current.get(skill.id);
      if (!pos) return;

      const radius = 5 + (skill.weight / 100) * 20; // Size based on proficiency
      const color = CATEGORY_COLORS[skill.category];
      const isSelected = selectedNode?.id === skill.id;

      // Glow effect for selected node
      if (isSelected) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Border for high-weight skills
      if (skill.weight > 70) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Draw label for significant or selected skills
      if (skill.weight > 60 || isSelected) {
        ctx.fillStyle = 'white';
        ctx.font = isSelected ? 'bold 14px system-ui' : '12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(skill.name, pos.x, pos.y - radius - 10);
      }
    });

    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    // Find clicked node
    let clickedNode: SkillNode | null = null;
    let minDistance = Infinity;

    skills.forEach((skill) => {
      const pos = nodePositions.current.get(skill.id);
      if (!pos) return;

      const radius = 5 + (skill.weight / 100) * 20;
      const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);

      if (distance < radius && distance < minDistance) {
        minDistance = distance;
        clickedNode = skill;
      }
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      onNodeClick?.(clickedNode);
    } else {
      setSelectedNode(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z / 1.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Network className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold">Skill Connection Graph</h3>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="border-white/20 hover:bg-white/10"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="border-white/20 hover:bg-white/10"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
            className="border-white/20 hover:bg-white/10"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative bg-black/20 rounded-2xl border border-white/10 overflow-hidden"
        style={{ height: '500px' }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-grab active:cursor-grabbing"
        />

        {/* Selected Node Info */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category] }}
                  />
                  <h4 className="text-white font-semibold">{selectedNode.name}</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Proficiency:</span>
                    <span className="text-white ml-1">{selectedNode.weight}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white ml-1 capitalize">{selectedNode.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Practice Count:</span>
                    <span className="text-white ml-1">{selectedNode.frequency}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Practiced:</span>
                    <span className="text-white ml-1">
                      {selectedNode.recency < 1
                        ? 'Today'
                        : `${Math.floor(selectedNode.recency)} days ago`}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-gray-400">Categories:</span>
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <div key={category} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-300 capitalize">{category}</span>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400 bg-black/20 rounded-lg p-3 border border-white/10">
        💡 <strong>Tip:</strong> Click on nodes to view details. Drag to pan, use zoom controls to explore. 
        Node size represents proficiency level, connections show related skills practiced together.
      </div>
    </div>
  );
}
