FROM node:18-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./

FROM base as production

RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]