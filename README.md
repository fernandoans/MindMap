# 🧠 Interactive Mind Map & Flow Builder

Aplicação web interativa para criação, edição e visualização de mapas mentais e diagramas de fluxo dinâmicos. Desenvolvida em **React**, **TypeScript** e **React Flow** (`@xyflow/react`), a ferramenta oferece nós customizáveis estilo "balão oval", conexões dinâmicas flutuantes, atalhos ágeis de teclado, sistema completo de histórico (desfazer/refazer) e exportação em alta qualidade.

---

## 🚀 Funcionalidades

- **Nós Dinâmicos estilo Mapa Mental**:
  - Formato ovalado/pílula que expande sua largura automaticamente de acordo com o texto digitado.
  - Indicação visual elegante do nó selecionado (borda azul destacada com anel de foco).
  - Menu contextual individual por nó com opções para criar nó filho, editar texto e excluir.

- **⌨️ Atalhos Rápidos de Teclado (*Workflow Ágil*)**:
  - Construa mapas mentais completos sem tirar as mãos do teclado.
  - Navegação e criação encadeada de ramos e subtópicos.
  - Menu suspenso com guia rápido de atalhos diretamente no painel superior.

- **↺ Desfazer & Refazer (*Undo / Redo*)**:
  - Histórico de até 50 estados para reverter ou restaurar alterações.
  - Rastreia criações, exclusões, edição de textos, alteração de cores, novas conexões e arraste de nós pelo canvas.
  - Acessível tanto pelos atalhos `Ctrl + Z` / `Ctrl + Y` quanto por botões dedicados no painel.

- **📸 Exportação para Imagem PNG**:
  - Geração de arquivo PNG em alta resolução do mapa mental completo.
  - Cálculo automático dos limites (*bounding box*) com enquadramento perfeito e margem de respiro, sem cortar nenhum nó.
  - Fundo branco renderizado para máxima legibilidade em qualquer visualizador de imagens.
  - Nome do arquivo sincronizado automaticamente com o título do mapa.

- **Conexões Flutuantes (*Floating Edges*)**:
  - Ponto de ancoragem calculado geometricamente entre as bordas dos nós.
  - Paleta de cores rápida para categorizar conexões diretamente na linha.
  - Capacidade de reconectar linhas existentes arrastando seus terminais com o mouse.

- **💾 Persistência de Dados (Salvar & Carregar)**:
  - **Salvar em JSON**: Exporta a estrutura completa (nós, conexões, posições, cores e zoom da tela).
  - **Carregar JSON**: Importa arquivos salvos anteriormente para continuar o trabalho.
  - **Título Customizável**: Altere o título do mapa com sincronização em tempo real na aba do navegador.

---

## ⌨️ Atalhos de Teclado

| Tecla / Atalho | Ação | Descrição |
| :--- | :--- | :--- |
| <kbd>Tab</kbd> | **Novo Filho** | Cria um nó filho conectado abaixo do nó selecionado e já o seleciona para continuar a criação. |
| <kbd>Enter</kbd> | **Novo Irmão** | Cria um nó no mesmo nível hierárquico (sob o mesmo pai). Se o nó raiz estiver selecionado, cria um novo ramo principal. |
| <kbd>Del</kbd> / <kbd>Backspace</kbd> | **Excluir** | Remove o nó selecionado e todas as suas arestas conectadas. |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> *(ou Cmd+Z)* | **Desfazer** | Desfaz a última alteração realizada no mapa mental. |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> *(ou Ctrl+Shift+Z)* | **Refazer** | Refaz a última alteração desfeita. |

> *Nota: Os atalhos não interferem quando o cursor estiver dentro de caixas de texto (como a edição do título).*

---

## 🛠️ Tecnologias Utilizadas

- **[React 18](https://react.dev/)**: Biblioteca base para a interface de usuário.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática e segurança de código.
- **[React Flow (@xyflow/react)](https://reactflow.dev/)**: Motor para diagramação, manipulação de nós e canvas interativo.
- **[html-to-image](https://github.com/bubkoo/html-to-image)**: Renderização do canvas DOM para arquivo de imagem PNG.
- **[Tailwind CSS](https://tailwindcss.com/)**: Estilização utilitária e design responsivo.
- **[Shadcn UI / Radix UI](https://ui.shadcn.com/)**: Primitivas acessíveis de interface (Dropdown Menu, Buttons, Inputs).
- **[Lucide React](https://lucide.dev/)**: Ícones vetoriais modernos.
- **[Vite](https://vitejs.dev/)**: Bundler ultrarrápido para desenvolvimento frontend.

---

## 📦 Estrutura do Projeto

```text
src/
├── components/
│   ├── Connector/
│   │   └── index.tsx              # Componente customizado do Nó (estilo mapa mental)
│   ├── FloatingConnectionLine/
│   │   └── index.tsx              # Linha guia temporária durante a criação de conexões
│   ├── FloatingEdge/
│   │   └── index.tsx              # Aresta customizada flutuante com seletor de cores
│   ├── SaveLoadPanel/
│   │   └── index.tsx              # Painel superior (Título, Undo/Redo, Atalhos, Salvar/Carregar, PNG)
│   └── ui/                        # Componentes de interface base (Button, Input, DropdownMenu)
├── context/
│   └── MindMapContext.tsx         # Gerenciamento de estado global, histórico (Undo/Redo) e atalhos
├── lib/
│   └── utils.ts                   # Utilitários de classes CSS (Tailwind merge)
├── utils.ts                       # Funções geométricas de interseção e inicialização do mapa
├── App.tsx                        # Montagem do canvas React Flow e Provedores de contexto
├── main.tsx                       # Ponto de entrada da aplicação React
└── index.css                      # Estilos globais e variáveis de tema
```

---

## ▶️ Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou gerenciador de pacotes equivalente

### A. Executar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra no navegador:
   [http://localhost:5173](http://localhost:5173)

---

### B. Executar via Docker

1. Crie a imagem Docker:
   ```bash
   docker build -t mindmap-app .
   ```

2. Inicie o contêiner:
   ```bash
   docker run -d -p 8080:80 --name meu-mindmap mindmap-app
   ```

3. Acesse a aplicação em:
   [http://localhost:8080](http://localhost:8080)

---

## 🖼️ Captura de Tela

![Tela inicial da Aplicação](./telainicial.png)