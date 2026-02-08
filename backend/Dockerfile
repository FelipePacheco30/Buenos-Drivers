FROM node:20-alpine

# Instala cliente PostgreSQL
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3333

CMD ["npm", "start"]
