import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useReactFlow, ReactFlowJsonObject } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload } from 'lucide-react';

export default function SaveLoadPanel() {
  const { toObject, setNodes, setEdges, setViewport } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mapTitle, setMapTitle] = useState('Meu Mapa Mental');

  // Atualiza o título da aba do navegador sempre que o usuário altera o título do mapa
  useEffect(() => {
    document.title = mapTitle ? mapTitle : 'Mapa Mental';
  }, [mapTitle]);

  // 1. SALVAR EM ARQUIVO JSON
  const onSave = useCallback(() => {
    const flow = toObject();
    const jsonString = JSON.stringify(flow, null, 2);

    // Formata o nome do arquivo a partir do título (ex: "Meu Mapa Mental" -> "meu-mapa-mental.json")
    const formattedFileName = mapTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9à-ú\s-]/gi, '')
      .replace(/\s+/g, '-');

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formattedFileName || 'mapa-mental'}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }, [toObject, mapTitle]);

  // 2. RESTAURAR A PARTIR DE UM ARQUIVO JSON
  const onLoad = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Define o título do mapa com base no nome do arquivo carregado (sem a extensão .json)
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      const formattedTitleFromFilename = fileNameWithoutExtension
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      setMapTitle(formattedTitleFromFilename);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow: ReactFlowJsonObject = JSON.parse(
            e.target?.result as string
          );

          if (flow) {
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            if (flow.viewport) {
              const { x = 0, y = 0, zoom = 1 } = flow.viewport;
              setViewport({ x, y, zoom });
            }
          }
        } catch (error) {
          alert('Erro ao ler o arquivo JSON.');
          console.error(error);
        }
      };

      reader.readAsText(file);
      event.target.value = '';
    },
    [setNodes, setEdges, setViewport]
  );

  return (
    <div className="fixed top-5 right-5 z-10 flex gap-2 items-center bg-white/90 p-2 rounded-lg shadow-md backdrop-blur border border-gray-200">
      {/* Campo para o título do mapa */}
      <Input
        type="text"
        value={mapTitle}
        onChange={(e) => setMapTitle(e.target.value)}
        placeholder="Título do Mapa..."
        className="w-48 h-8 text-sm border-gray-300 focus-visible:ring-1"
      />

      <Button
        onClick={onSave}
        size="sm"
        variant="outline"
        className="flex gap-1 items-center h-8"
      >
        <Download className="w-4 h-4" />
        Salvar
      </Button>

      <Button
        onClick={() => fileInputRef.current?.click()}
        size="sm"
        variant="outline"
        className="flex gap-1 items-center h-8"
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