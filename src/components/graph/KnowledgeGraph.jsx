import React, { useState, useRef, useEffect } from 'react';
import { useVault } from '../../context/VaultContext';
import { Tag, FileText, Key, Code, Bookmark, Network, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export default function KnowledgeGraph() {
  const { items, allTags, setSelectedTag, setActiveCategory } = useVault();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);

  // Build Graph Nodes & Edges layout
  useEffect(() => {
    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    // Tag Hub Nodes
    const tagNodes = allTags.map((tag, i) => {
      const angle = (i / (allTags.length || 1)) * 2 * Math.PI;
      const radius = 160;
      return {
        id: `tag-${tag}`,
        label: tag,
        type: 'tag',
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        color: 'var(--accent-cyan)'
      };
    });

    // Vault Item Nodes
    const itemNodes = items.map((item, i) => {
      // Find connected tag nodes
      const connectedTag = item.tags && item.tags[0];
      const tagNode = tagNodes.find(tn => tn.label === connectedTag);
      
      const baseX = tagNode ? tagNode.x : centerX;
      const baseY = tagNode ? tagNode.y : centerY;
      const angle = Math.random() * 2 * Math.PI;
      const radius = 70 + Math.random() * 40;

      return {
        id: item.id,
        label: item.title,
        category: item.category,
        type: 'item',
        tags: item.tags || [],
        x: Math.max(50, Math.min(width - 50, baseX + radius * Math.cos(angle))),
        y: Math.max(50, Math.min(height - 50, baseY + radius * Math.sin(angle))),
        color: item.category === 'credentials' ? 'var(--accent-rose)' : item.category === 'snippets' ? '#c084fc' : item.category === 'bookmarks' ? 'var(--accent-emerald)' : 'var(--accent-blue)'
      };
    });

    // Graph Edges linking items to tag hubs
    const graphEdges = [];
    itemNodes.forEach(itemNode => {
      itemNode.tags.forEach(t => {
        const targetTagNode = tagNodes.find(tn => tn.label === t);
        if (targetTagNode) {
          graphEdges.push({
            id: `edge-${itemNode.id}-${targetTagNode.id}`,
            source: itemNode.id,
            target: targetTagNode.id
          });
        }
      });
    });

    setNodes([...tagNodes, ...itemNodes]);
    setEdges(graphEdges);
  }, [items, allTags]);

  // Handle Dragging
  const handleMouseDown = (e, node) => {
    e.stopPropagation();
    setDraggingNodeId(node.id);
    const svgRect = svgRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - svgRect.left - node.x,
      y: e.clientY - svgRect.top - node.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const newX = e.clientX - svgRect.left - dragOffset.x;
    const newY = e.clientY - svgRect.top - dragOffset.y;

    setNodes(prev => prev.map(node => {
      if (node.id === draggingNodeId) {
        return { ...node, x: newX, y: newY };
      }
      return node;
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleNodeClick = (node) => {
    if (node.type === 'tag') {
      setSelectedTag(node.label);
      setActiveCategory('all');
    }
  };

  return (
    <div className="glass-panel graph-panel" style={{ padding: '24px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Controls */}
      <div className="graph-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="graph-heading" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={22} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#fff' }}>Interactive Personal Knowledge Graph</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Drag nodes to rearrange. Click tag hubs to filter vault data. Hover to highlight connections.
            </p>
          </div>
        </div>

        {/* Legend Pills */}
        <div className="graph-legend" style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>Tag Hubs</span>
          <span className="badge badge-rose" style={{ fontSize: '0.68rem' }}>Credentials</span>
          <span className="badge badge-violet" style={{ fontSize: '0.68rem' }}>Snippets</span>
          <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>Bookmarks</span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="graph-canvas" style={{
        flex: 1,
        background: 'rgba(8, 11, 16, 0.9)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 500"
          onPointerMove={handleMouseMove}
          onPointerUp={handleMouseUp}
          style={{ cursor: draggingNodeId ? 'grabbing' : 'default' }}
        >
          {/* Edges */}
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const isHighlighted = hoveredNodeId === edge.source || hoveredNodeId === edge.target;

            return (
              <line
                key={edge.id}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isHighlighted ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.12)'}
                strokeWidth={isHighlighted ? 2.5 : 1}
                strokeDasharray={isHighlighted ? 'none' : '4 4'}
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const isTag = node.type === 'tag';
            const isHovered = hoveredNodeId === node.id;
            const radius = isTag ? 22 : 14;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onPointerDown={(e) => handleMouseDown(e, node)}
                onClick={() => handleNodeClick(node)}
                onPointerEnter={() => setHoveredNodeId(node.id)}
                onPointerLeave={() => setHoveredNodeId(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={radius}
                  fill={isTag ? 'rgba(0, 242, 254, 0.2)' : 'rgba(18, 24, 36, 0.9)'}
                  stroke={node.color}
                  strokeWidth={isHovered ? 3 : 2}
                  shadow="var(--shadow-sm)"
                />

                {/* Node Label */}
                <text
                  y={radius + 14}
                  textAnchor="middle"
                  fill={isHovered ? '#fff' : 'var(--text-secondary)'}
                  fontSize={isTag ? '11px' : '9px'}
                  fontWeight={isTag ? '700' : '400'}
                  fontFamily="var(--font-sans)"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
