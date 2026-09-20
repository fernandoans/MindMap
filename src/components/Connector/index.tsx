import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useMindMap } from '../../context/MindMapContext';

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
  selected?: boolean;
}

function TextUpdaterNode({ id, data, selected }: TextUpdaterNodeProps) {
  const { addChildNode, deleteNode, updateNodeLabel } = useMindMap();

  const onDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  const onCreate = useCallback(() => {
    addChildNode(id);
  }, [id, addChildNode]);

  const onEdit = useCallback(() => {
    const newLabel = window.prompt('Digite o novo texto para o nó:', data?.label);

    if (newLabel !== null && newLabel.trim() !== '') {
      updateNodeLabel(id, newLabel);
    }
  }, [id, data?.label, updateNodeLabel]);

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
      <div
        className={`w-max min-w-[120px] max-w-[400px] flex items-center justify-between gap-3 px-6 py-3 rounded-full bg-white border-2 shadow-md hover:shadow-lg transition-all ${
          selected
            ? 'border-blue-600 ring-4 ring-blue-100 shadow-blue-200'
            : 'border-slate-700'
        }`}
      >
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
              Novo Filho (Tab)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir (Del)
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