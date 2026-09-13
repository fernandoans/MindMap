import {
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useInternalNode,
  useReactFlow,
} from '@xyflow/react';

import { getEdgeParams } from '../../utils.js';

import { Ellipsis, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useRef, useState } from 'react';

function FloatingEdge({ id, source, target, markerEnd, style }: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [color, setColor] = useState('#818181');
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  const onEdgeDeleteClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 900);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* 1. O path agora é fechado corretamente como elemento SVG */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: color, ...style }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* 2. O HTML customizado fica fora da tag path */}
      {isHovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* 3. Estrutura completa do DropdownMenu com Trigger */}
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-gray-600 p-1 rounded-full text-white hover:bg-gray-700 transition-colors">
                <Ellipsis className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-2">
                <div className="text-xs font-semibold text-gray-500 mb-1 px-2">
                  Selecionar Cor
                </div>
                <div className="flex gap-1 p-1">
                  {[
                    '#818181',
                    '#ef4444',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                  ].map((c) => (
                    <button
                      key={c}
                      style={{ backgroundColor: c }}
                      className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={onEdgeDeleteClick}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default FloatingEdge;