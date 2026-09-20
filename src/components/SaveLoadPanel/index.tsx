import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  useReactFlow,
  ReactFlowJsonObject,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Download,
  Upload,
  Image as ImageIcon,
  Loader2,
  Undo2,
  Redo2,
  Keyboard,
} from 'lucide-react';
import { useMindMap } from '../../context/MindMapContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SaveLoadPanel() {
  const { toObject, setViewport, getNodes } = useReactFlow();
  const {
    mapTitle,
    setMapTitle,
    undo,
    redo,
    canUndo,
    canRedo,
    loadFlow,
  } = useMindMap();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);

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
            loadFlow(flow.nodes || [], flow.edges || []);
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
    [loadFlow, setMapTitle, setViewport]
  );

  // 3. EXPORTAR COMO IMAGEM PNG
  const onExportPng = useCallback(async () => {
    const nodes = getNodes();
    if (!nodes || nodes.length === 0) {
      alert('Não há nós no mapa mental para exportar.');
      return;
    }

    try {
      setIsExporting(true);

      const nodesBounds = getNodesBounds(nodes);

      // Margem em torno dos nós para a imagem não ficar rente às bordas
      const padding = 60;
      const imageWidth = Math.max(
        1024,
        Math.round(nodesBounds.width + padding * 2)
      );
      const imageHeight = Math.max(
        768,
        Math.round(nodesBounds.height + padding * 2)
      );

      const viewport = getViewportForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.1,
        2,
        0.1
      );

      const viewportElement = document.querySelector(
        '.react-flow__viewport'
      ) as HTMLElement;

      if (!viewportElement) {
        throw new Error('Elemento da viewport do React Flow não encontrado.');
      }

      const formattedFileName = mapTitle
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9à-ú\s-]/gi, '')
        .replace(/\s+/g, '-');

      const dataUrl = await toPng(viewportElement, {
        backgroundColor: '#ffffff',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      const link = document.createElement('a');
      link.download = `${formattedFileName || 'mapa-mental'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao exportar PNG:', error);
      alert('Ocorreu um erro ao exportar o mapa mental como PNG.');
    } finally {
      setIsExporting(false);
    }
  }, [getNodes, mapTitle]);

  return (
    <div className="fixed top-5 right-5 z-10 flex gap-2 items-center bg-white/90 p-2 rounded-lg shadow-md backdrop-blur border border-gray-200">
      {/* Campo para o título do mapa */}
      <Input
        type="text"
        value={mapTitle}
        onChange={(e) => setMapTitle(e.target.value)}
        placeholder="Título do Mapa..."
        className="w-44 h-8 text-sm border-gray-300 focus-visible:ring-1"
      />

      {/* Botões Desfazer / Refazer */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <Button
          onClick={(e) => {
            undo();
            e.currentTarget.blur();
          }}
          disabled={!canUndo}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          title="Desfazer (Ctrl + Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          onClick={(e) => {
            redo();
            e.currentTarget.blur();
          }}
          disabled={!canRedo}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          title="Refazer (Ctrl + Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Guia de Atalhos */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="flex gap-1 items-center h-8 px-2"
            title="Ver atalhos de teclado"
          >
            <Keyboard className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Atalhos</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-3 text-xs space-y-2">
          <div className="font-semibold text-slate-800 border-b pb-1 text-sm">
            Atalhos de Teclado
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Novo Filho:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-semibold text-[11px]">
              Tab
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Novo Irmão:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-semibold text-[11px]">
              Enter
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Excluir Nó:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-semibold text-[11px]">
              Del / Backspace
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Desfazer:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-semibold text-[11px]">
              Ctrl + Z
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Refazer:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-semibold text-[11px]">
              Ctrl + Y
            </kbd>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={onSave}
        size="sm"
        variant="outline"
        className="flex gap-1 items-center h-8"
        title="Salvar projeto em arquivo JSON"
      >
        <Download className="w-4 h-4" />
        Salvar
      </Button>

      <Button
        onClick={onExportPng}
        disabled={isExporting}
        size="sm"
        variant="outline"
        className="flex gap-1 items-center h-8"
        title="Exportar mapa como imagem PNG"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
        {isExporting ? 'Exportando...' : 'Exportar PNG'}
      </Button>

      <Button
        onClick={() => fileInputRef.current?.click()}
        size="sm"
        variant="outline"
        className="flex gap-1 items-center h-8"
        title="Carregar projeto a partir de arquivo JSON"
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