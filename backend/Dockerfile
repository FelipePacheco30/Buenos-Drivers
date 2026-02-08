FROM node:20-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3333

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
