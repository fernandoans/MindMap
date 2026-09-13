import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  BackgroundVariant,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Connection,
  reconnectEdge
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import TextUpdaterNode from './components/Connector';
import ButtonAdd from './components/ButtonAdd';
import { createNodesAndEdges } from './utils';
import FloatingEdge from './components/FloatingEdge';
import FloatingConnectionLine from './components/FloatingConnectionLine';
import SaveLoadPanel from './components/SaveLoadPanel'; // Importação do novo painel

const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges();

const edgeTypes = {
  floating: FloatingEdge,
};

const nodeTypes = { textUpdater: TextUpdaterNode };

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: `${params.source}-${params.target}`,
            type: 'floating',
          },
          eds
        )
      ),
    [setEdges]
  );

  // Permite arrastar uma linha de conexão já existente para outro handle/nó
  const onReconnect = useCallback(
    (oldEdge: any, newConnection: Connection) =>
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [setEdges]
  );

  return (
    <ReactFlowProvider>
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
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
          connectionLineComponent={FloatingConnectionLine}
          fitView
        >
          <Controls />
          <Background color="#ccc" variant={BackgroundVariant.Dots} />
        </ReactFlow>
      </div>
      <ButtonAdd />
    </ReactFlowProvider>
  );
}
