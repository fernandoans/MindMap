# ----------------------------------------------------
# Estágio 1: Build da aplicação React
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência primeiro para aproveitar o cache das camadas
COPY package*.json ./

# Instala todas as dependências
RUN npm ci

# Copia todo o código-fonte
COPY . .

# Executa o script de build configurado no package.json
RUN npm run build

# ----------------------------------------------------
# Estágio 2: Servir com Nginx
# ----------------------------------------------------
FROM nginx:alpine AS runner

# Copia os arquivos estáticos compilados da pasta dist para o diretório padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80 do container
EXPOSE 80

# Inicia o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]