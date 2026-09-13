import { getBezierPath, ConnectionLineComponentProps, InternalNode } from '@xyflow/react';

import { getEdgeParams } from '../../utils.js';

function FloatingConnectionLine({
  toX,
  toY,
  fromPosition,
  toPosition,
  fromNode,
}: ConnectionLineComponentProps) {
  if (!fromNode) {
    return null;
  }

  const targetNode = {
    id: 'connection-target',
    position: { x: toX, y: toY },
    data: {},
    measured: {
      width: 1,
      height: 1,
    },
    internals: {
      positionAbsolute: { x: toX, y: toY },
    },
  };

  // Ajuste com casting de tipo para satisfazer o TypeScript
  const { sx, sy } = getEdgeParams(fromNode, targetNode as unknown as InternalNode);
  
  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path
        fill="none"
        stroke="#222"
        strokeWidth={1.5}
        className="animated"
        d={edgePath}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke="#222"
        strokeWidth={1.5}
      />
    </g>
  );
}

export default FloatingConnectionLine;