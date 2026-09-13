import { Position, InternalNode, Node } from '@xyflow/react';

function getNodeIntersection(
  intersectionNode: InternalNode<Node>,
  targetNode: InternalNode<Node>
) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
    intersectionNode.measured;
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;
  if (
    !intersectionNodeWidth ||
    !intersectionNodeHeight ||
    !targetNode.measured.width ||
    !targetNode.measured.height
  )
    return { x: 0, y: 0 };

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNode.measured.width / 2;
  const y1 = targetPosition.y + targetNode.measured.height / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(
  node: InternalNode<Node>,
  intersectionPoint: { x: number; y: number }
) {
  const n = { ...node.internals.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }

  if (n.measured?.width && px >= nx + n?.measured?.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (n.measured.height && py >= n.y + n.measured.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

export function getEdgeParams(
  source: InternalNode<Node>,
  target: InternalNode<Node>
) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

export function createNodesAndEdges() {
  const nodes = [];
  const edges = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  nodes.push({
    id: 'target',
    type: 'textUpdater',
    data: { label: 'Target' },
    position: center,
  });

/*
  nodes.push({
    id: '10',
    type: 'textUpdater',
    data: { label: 'Solto' },
    position: center,
  });

  for (let i = 0; i < 10; i++) {
    const degrees = i * (360 / 10);
    const radians = degrees * (Math.PI / 180);
    const x = 550 * Math.cos(radians) + center.x;
    const y = 550 * Math.sin(radians) + center.y;

    nodes.push({
      id: `${i}`,
      type: 'textUpdater',
      data: {
        label:
          'lorem ipsum dolor sit amet lorem ipsum dolor lorem ipsum dolor sit amet lorem ipsum dolor lorem ipsum dolor sit amet lorem ipsum dolor lorem ipsum dolor sit amet lorem ipsum dolor lorem ipsum dolor sit amet lorem ipsum dolor',
      },
      position: { x, y },
    });

    edges.push({
      id: `edge-${i}`,
      target: 'target',
      source: `${i}`,
      type: 'floating',
    });
  }
*/
  edges.push({
    id: 'edge-conect',
    target: '8',
    source: '10',
    type: 'floating',
  });
  console.log(nodes);
  console.log(edges);

  return { nodes, edges };
}
