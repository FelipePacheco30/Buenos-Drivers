FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copia dependências
COPY package*.json ./

# Instala dependências
RUN npm install --production

# Copia o código
COPY . .

# Expõe a porta da API
EXPOSE 3333

# Comando padrão
CMD ["npm", "run", "start"]
