import {
  ReactFlow,
  Controls,
  BackgroundVariant,
  Background,
  ReactFlowProvider,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import TextUpdaterNode from './components/Connector';
import FloatingEdge from './components/FloatingEdge';
import FloatingConnectionLine from './components/FloatingConnectionLine';
import SaveLoadPanel from './components/SaveLoadPanel';
import { MindMapProvider, useMindMap } from './context/MindMapContext';

const edgeTypes = {
  floating: FloatingEdge,
};

const nodeTypes = { textUpdater: TextUpdaterNode };

function MindMapFlow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnect,
    onNodeDragStop,
  } = useMindMap();

  return (
    <div
      className="floatingedges"
      style={{ width: '100vw', height: '100vh' }}
    >
      <SaveLoadPanel />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onNodeDragStop={onNodeDragStop}
        onSelectionDragStop={onNodeDragStop}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        connectionLineComponent={FloatingConnectionLine}
        deleteKeyCode={null}
        fitView
      >
        <Controls />
        <Background color="#ccc" variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <MindMapProvider>
        <MindMapFlow />
      </MindMapProvider>
    </ReactFlowProvider>
  );
}
