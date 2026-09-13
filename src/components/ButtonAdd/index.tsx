import React, { useCallback } from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { useReactFlow, useStoreApi } from '@xyflow/react';

import { v4 as uuidv4 } from 'uuid';
let currentOverlapOffset = 0;
const OVERLAP_OFFSET = 10;
const NODE_WIDTH = 116;
const NODE_HEIGHT = 28;

const ButtonAdd: React.FC = () => {
  const { addNodes, getNodes } = useReactFlow();
  const store = useStoreApi();

  const onClickAdd = useCallback(() => {
    const {
      height,
      width,
      transform: [transformX, transformY, zoomLevel],
    } = store.getState();
    const zoomMultiplier = 1 / zoomLevel;
    const centerX = -transformX * zoomMultiplier + (width * zoomMultiplier) / 2;
    const centerY =
      -transformY * zoomMultiplier + (height * zoomMultiplier) / 2;
    const nodeWidthOffset = NODE_WIDTH / 2;
    const nodeHeightOffset = NODE_HEIGHT / 2;

    const id = `${++getNodes().length}`;

    const newNode = {
      id: uuidv4(),
      position: {
        x: centerX - nodeWidthOffset + currentOverlapOffset,
        y: centerY - nodeHeightOffset + currentOverlapOffset,
      },
      type: 'textUpdater',
      data: {
        label: `Node ${id}`,
      },
    };
    addNodes(newNode);

    currentOverlapOffset += OVERLAP_OFFSET;
  }, [addNodes, store]);

  return (
    <Button
      onClick={onClickAdd}
      className="fixed right-5 bottom-5 text-white px-7 py-2 rounded "
    >
      <Plus />
    </Button>
  );
};

export default ButtonAdd;
