import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  Connection,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import { createNodesAndEdges } from '../utils';

interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
}

interface MindMapContextType {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  onReconnect: (oldEdge: any, newConnection: Connection) => void;
  onNodeDragStop: () => void;
  addChildNode: (explicitParentId?: string) => void;
  addSiblingNode: (explicitNodeId?: string) => void;
  deleteSelected: () => void;
  deleteNode: (nodeId: string) => void;
  updateNodeLabel: (nodeId: string, newLabel: string) => void;
  updateEdgeColor: (edgeId: string, color: string) => void;
  deleteEdge: (edgeId: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  mapTitle: string;
  setMapTitle: (title: string) => void;
  loadFlow: (newNodes: Node[], newEdges: Edge[]) => void;
  takeSnapshot: (nodes: Node[], edges: Edge[]) => void;
}

const MindMapContext = createContext<MindMapContextType | null>(null);

export const useMindMap = () => {
  const context = useContext(MindMapContext);
  if (!context) {
    throw new Error('useMindMap deve ser usado dentro de um MindMapProvider');
  }
  return context;
};

const isInputElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable ||
    target.closest('[role="dialog"]') !== null ||
    target.closest('.fixed') !== null
  );
};

const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges();

export const MindMapProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [mapTitle, setMapTitle] = useState('Meu Mapa Mental');

  // Referências para evitar problemas com closures assíncronas no listener global de teclado
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  // Histórico de estados para Undo / Redo
  const historyRef = useRef<HistorySnapshot[]>([
    {
      nodes: JSON.parse(JSON.stringify(initialNodes)),
      edges: JSON.parse(JSON.stringify(initialEdges)),
    },
  ]);
  const historyIndexRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Registra um novo snapshot no histórico
  const takeSnapshot = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    const currentIndex = historyIndexRef.current;
    const truncatedHistory = historyRef.current.slice(0, currentIndex + 1);

    const clonedNodes = JSON.parse(JSON.stringify(newNodes));
    const clonedEdges = JSON.parse(JSON.stringify(newEdges));

    truncatedHistory.push({
      nodes: clonedNodes,
      edges: clonedEdges,
    });

    if (truncatedHistory.length > 50) {
      truncatedHistory.shift();
    }

    historyRef.current = truncatedHistory;
    historyIndexRef.current = truncatedHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // Desfazer (Undo)
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;

    const newIndex = historyIndexRef.current - 1;
    historyIndexRef.current = newIndex;
    const snapshot = historyRef.current[newIndex];

    setNodes(JSON.parse(JSON.stringify(snapshot.nodes)));
    setEdges(JSON.parse(JSON.stringify(snapshot.edges)));
    setCanUndo(newIndex > 0);
    setCanRedo(true);
  }, [setNodes, setEdges]);

  // Refazer (Redo)
  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;

    const newIndex = historyIndexRef.current + 1;
    historyIndexRef.current = newIndex;
    const snapshot = historyRef.current[newIndex];

    setNodes(JSON.parse(JSON.stringify(snapshot.nodes)));
    setEdges(JSON.parse(JSON.stringify(snapshot.edges)));
    setCanUndo(true);
    setCanRedo(newIndex < historyRef.current.length - 1);
  }, [setNodes, setEdges]);

  // Carregar um novo fluxo
  const loadFlow = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      setNodes(newNodes);
      setEdges(newEdges);
      historyRef.current = [
        {
          nodes: JSON.parse(JSON.stringify(newNodes)),
          edges: JSON.parse(JSON.stringify(newEdges)),
        },
      ];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    },
    [setNodes, setEdges]
  );

  // Conectar nós
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: 'floating',
      };
      const nextEdges = addEdge<Edge>(newEdge, edgesRef.current);
      setEdges(nextEdges);
      takeSnapshot(nodesRef.current, nextEdges);
    },
    [setEdges, takeSnapshot]
  );

  // Reconectar nós
  const onReconnect = useCallback(
    (oldEdge: any, newConnection: Connection) => {
      const nextEdges = reconnectEdge(oldEdge, newConnection, edgesRef.current);
      setEdges(nextEdges);
      takeSnapshot(nodesRef.current, nextEdges);
    },
    [setEdges, takeSnapshot]
  );

  // Salvar snapshot ao terminar de arrastar um nó
  const onNodeDragStop = useCallback(() => {
    takeSnapshot(nodesRef.current, edgesRef.current);
  }, [takeSnapshot]);

  // Criar Nó Filho (Tab)
  const addChildNode = useCallback(
    (explicitParentId?: string) => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      let parentNode: Node | undefined;
      if (explicitParentId) {
        parentNode = currentNodes.find((n) => n.id === explicitParentId);
      } else {
        parentNode = currentNodes.find((n) => n.selected);
        if (!parentNode && currentNodes.length === 1) {
          parentNode = currentNodes[0];
        }
      }

      if (!parentNode) return;

      const newNodeId = `node_${Date.now()}`;
      const parentId = parentNode.id;

      // Filhos existentes do nó pai
      const childEdges = currentEdges.filter((e) => e.source === parentId);
      const childIds = new Set(childEdges.map((e) => e.target));
      const existingChildren = currentNodes.filter((n) => childIds.has(n.id));

      let x = parentNode.position.x;
      let y = parentNode.position.y + 130;

      if (existingChildren.length > 0) {
        const maxX = Math.max(...existingChildren.map((c) => c.position.x));
        x = maxX + 180;
        y = existingChildren[0].position.y;
      }

      const newNode: Node = {
        id: newNodeId,
        type: parentNode.type || 'textUpdater',
        position: { x, y },
        data: {
          label: `Novo Subtópico`,
        },
        selected: true,
      };

      const newEdge = {
        id: `edge_${parentId}_to_${newNodeId}`,
        source: parentId,
        target: newNodeId,
        type: 'floating',
      };

      const nextNodes: Node[] = [
        ...currentNodes.map((n) => ({ ...n, selected: false })),
        newNode,
      ];

      const nextEdges = [...currentEdges, newEdge];

      setNodes(nextNodes);
      setEdges(nextEdges);
      takeSnapshot(nextNodes, nextEdges);
    },
    [setNodes, setEdges, takeSnapshot]
  );

  // Criar Nó Irmão (Enter)
  const addSiblingNode = useCallback(
    (explicitNodeId?: string) => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      let selectedNode: Node | undefined;
      if (explicitNodeId) {
        selectedNode = currentNodes.find((n) => n.id === explicitNodeId);
      } else {
        selectedNode = currentNodes.find((n) => n.selected);
        if (!selectedNode && currentNodes.length === 1) {
          selectedNode = currentNodes[0];
        }
      }

      if (!selectedNode) return;

      // Verifica se o nó selecionado possui pai (aresta de entrada)
      const incomingEdge = currentEdges.find(
        (e) => e.target === selectedNode.id
      );

      if (incomingEdge) {
        const parentId = incomingEdge.source;
        const newNodeId = `node_${Date.now()}`;

        // Todos os irmãos sob o mesmo pai
        const siblingEdges = currentEdges.filter((e) => e.source === parentId);
        const siblingIds = new Set(siblingEdges.map((e) => e.target));
        const siblingNodes = currentNodes.filter((n) => siblingIds.has(n.id));

        const maxX = Math.max(...siblingNodes.map((s) => s.position.x));
        const x = maxX + 180;
        const y = selectedNode.position.y;

        const newNode: Node = {
          id: newNodeId,
          type: selectedNode.type || 'textUpdater',
          position: { x, y },
          data: {
            label: `Novo Tópico`,
          },
          selected: true,
        };

        const newEdge = {
          id: `edge_${parentId}_to_${newNodeId}`,
          source: parentId,
          target: newNodeId,
          type: 'floating',
        };

        const nextNodes: Node[] = [
          ...currentNodes.map((n) => ({ ...n, selected: false })),
          newNode,
        ];

        const nextEdges = [...currentEdges, newEdge];

        setNodes(nextNodes);
        setEdges(nextEdges);
        takeSnapshot(nextNodes, nextEdges);
      } else {
        // Se não possui pai (nó raiz), teclar Enter cria um subtópico
        addChildNode(selectedNode.id);
      }
    },
    [setNodes, setEdges, takeSnapshot, addChildNode]
  );

  // Excluir nós/edges selecionados (Delete / Backspace)
  const deleteSelected = useCallback(() => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;

    const selectedNodeIds = new Set(
      currentNodes.filter((n) => n.selected).map((n) => n.id)
    );
    const selectedEdgeIds = new Set(
      currentEdges.filter((e) => e.selected).map((e) => e.id)
    );

    if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) return;

    const nextNodes = currentNodes.filter((n) => !selectedNodeIds.has(n.id));
    const nextEdges = currentEdges.filter(
      (e) =>
        !selectedEdgeIds.has(e.id) &&
        !selectedNodeIds.has(e.source) &&
        !selectedNodeIds.has(e.target)
    );

    setNodes(nextNodes);
    setEdges(nextEdges);
    takeSnapshot(nextNodes, nextEdges);
  }, [setNodes, setEdges, takeSnapshot]);

  // Excluir um nó específico (via menu do nó)
  const deleteNode = useCallback(
    (nodeId: string) => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      const nextNodes = currentNodes.filter((n) => n.id !== nodeId);
      const nextEdges = currentEdges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );

      setNodes(nextNodes);
      setEdges(nextEdges);
      takeSnapshot(nextNodes, nextEdges);
    },
    [setNodes, setEdges, takeSnapshot]
  );

  // Atualizar o texto de um nó
  const updateNodeLabel = useCallback(
    (nodeId: string, newLabel: string) => {
      const currentNodes = nodesRef.current;
      const nextNodes = currentNodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
            },
          };
        }
        return node;
      });

      setNodes(nextNodes);
      takeSnapshot(nextNodes, edgesRef.current);
    },
    [setNodes, takeSnapshot]
  );

  // Atualizar a cor de uma aresta
  const updateEdgeColor = useCallback(
    (edgeId: string, color: string) => {
      const currentEdges = edgesRef.current;
      const nextEdges = currentEdges.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            style: {
              ...edge.style,
              stroke: color,
            },
          };
        }
        return edge;
      });

      setEdges(nextEdges);
      takeSnapshot(nodesRef.current, nextEdges);
    },
    [setEdges, takeSnapshot]
  );

  // Excluir uma aresta específica
  const deleteEdge = useCallback(
    (edgeId: string) => {
      const currentEdges = edgesRef.current;
      const nextEdges = currentEdges.filter((e) => e.id !== edgeId);

      setEdges(nextEdges);
      takeSnapshot(nodesRef.current, nextEdges);
    },
    [setEdges, takeSnapshot]
  );

  // Ouvinte global para os atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputElement(e.target)) {
        return;
      }

      // Undo: Ctrl+Z / Cmd+Z (sem Shift)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === 'z' &&
        !e.shiftKey
      ) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y / Cmd+Y OU Ctrl+Shift+Z / Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Tab: Novo Nó Filho
      if (e.key === 'Tab') {
        e.preventDefault();
        addChildNode();
        return;
      }

      // Enter: Novo Nó Irmão
      if (e.key === 'Enter') {
        e.preventDefault();
        addSiblingNode();
        return;
      }

      // Delete ou Backspace: Excluir nós/edges selecionados
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const hasSelection =
          nodesRef.current.some((n) => n.selected) ||
          edgesRef.current.some((e) => e.selected);

        if (hasSelection) {
          e.preventDefault();
          deleteSelected();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, addChildNode, addSiblingNode, deleteSelected]);

  return (
    <MindMapContext.Provider
      value={{
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onReconnect,
        onNodeDragStop,
        addChildNode,
        addSiblingNode,
        deleteSelected,
        deleteNode,
        updateNodeLabel,
        updateEdgeColor,
        deleteEdge,
        undo,
        redo,
        canUndo,
        canRedo,
        mapTitle,
        setMapTitle,
        loadFlow,
        takeSnapshot,
      }}
    >
      {children}
    </MindMapContext.Provider>
  );
};
