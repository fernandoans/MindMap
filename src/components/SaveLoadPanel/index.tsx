import React, { useRef, useCallback } from 'react';
import { useReactFlow, ReactFlowJsonObject } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';

export default function SaveLoadPanel() {
  const { toObject, setNodes, setEdges, setViewport } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. SALVAR EM ARQUIVO JSON
  const onSave = useCallback(() => {
    // Obtém o estado atual contendo { nodes, edges, viewport }
    const flow = toObject();
    const jsonString = JSON.stringify(flow, null, 2);

    // Cria um Blob e dispara o download do arquivo
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flow-state-${Date.now()}.json`;
    link.click();

    // Limpa a URL criada da memória
    URL.revokeObjectURL(url);
  }, [toObject]);

  // 2. RESTAURAR A PARTIR DE UM ARQUIVO JSON
  const onLoad = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow: ReactFlowJsonObject = JSON.parse(
            e.target?.result as string
          );

          if (flow) {
            // Restaura os nós, conexões e a posição do zoom/pan da câmera
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            if (flow.viewport) {
              const { x = 0, y = 0, zoom = 1 } = flow.viewport;
              setViewport({ x, y, zoom });
            }
          }
        } catch (error) {
          alert('Erro ao ler o arquivo JSON. Certifique-se de que é um formato válido.');
          console.error(error);
        }
      };

      reader.readAsText(file);

      // Reseta o input para permitir carregar o mesmo arquivo novamente se necessário
      event.target.value = '';
    },
    [setNodes, setEdges, setViewport]
  );

  return (
    <div className="fixed top-5 right-5 z-10 flex gap-2 bg-white/80 p-2 rounded-lg shadow-md backdrop-blur border border-gray-200">
      <Button onClick={onSave} size="sm" variant="outline" className="flex gap-1 items-center">
        <Download className="w-4 h-4" />
        Salvar
      </Button>

      <Button
        onClick={() => fileInputRef.current?.click()}
        size="sm"
        variant="outline"
        className="flex gap-1 items-center"
      >
        <Upload className="w-4 h-4" />
        Carregar
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onLoad}
        className="hidden"
      />
    </div>
  );
}