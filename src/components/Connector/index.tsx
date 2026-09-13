import { useCallback } from 'react';
import { Handle, Position, useReactFlow, Node } from '@xyflow/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  EllipsisVertical,
  Folder,
  Pencil,
  Trash2,
} from 'lucide-react';

interface TextUpdaterNodeProps {
  id: string;
  data: {
    label: string;
  };
}

function TextUpdaterNode({ id, data }: TextUpdaterNodeProps) {
  const { setNodes, setEdges, getNode } = useReactFlow();

  const onDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) =>
      edges.filter((edge) => edge.source !== id && edge.target !== id)
    );
  }, [id, setNodes, setEdges]);

const onCreate = useCallback(() => {
    const currentNode = getNode(id);
    if (!currentNode) return;

    const newNodeId = `node_${Date.now()}`;

    // 1. Criação do Novo Nó Filho
    const newNode: Node = {
      id: newNodeId,
      type: currentNode.type || 'textUpdater',
      position: {
        x: currentNode.position.x,
        y: currentNode.position.y + 120, // Posiciona logo abaixo do pai
      },
      data: {
        label: `Novo Nó (${newNodeId.slice(-4)})`,
      },
    };

    // 2. Criação do Edge amarrando o nó pai ao filho com o tipo 'floating'
    const newEdge = {
      id: `edge_${id}_to_${newNodeId}`,
      source: id,
      target: newNodeId,
      type: 'floating', // <--- Isso garante que usará o seu FloatingEdge
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
  }, [id, getNode, setNodes, setEdges]);

  const onEdit = useCallback(() => {
    const newLabel = window.prompt('Digite o novo texto para o nó:', data?.label);

    if (newLabel !== null && newLabel.trim() !== '') {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                label: newLabel,
              },
            };
          }
          return node;
        })
      );
    }
  }, [id, data?.label, setNodes]);

  return (
    <>
      <Handle
        position={Position.Top}
        type="target"
        style={{
          width: 8,
          height: 8,
          border: '1px solid black',
          background: '#fff',
        }}
      />

      {/* Container ovalado e dinâmico */}
      <div className="w-max min-w-[120px] max-w-[400px] flex items-center justify-between gap-3 px-6 py-3 rounded-full bg-white border-2 border-slate-700 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center justify-center font-medium text-slate-800 text-sm whitespace-pre-wrap break-words">
          {data?.label}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none opacity-70 hover:opacity-100 transition-opacity">
            <EllipsisVertical className="w-4 h-4 text-slate-600" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onCreate}>
              <Folder className="mr-2 h-4 w-4" />
              Novo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Handle
        style={{
          width: 8,
          height: 8,
          border: '1px solid black',
          background: '#fff',
        }}
        type="source"
        position={Position.Bottom}
        id="a"
      />
    </>
  );
}

export default TextUpdaterNode;