FROM node:18.16.1-alpine as builder

WORKDIR /tmp/

COPY package*.json ./

RUN npm install

RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

FROM node:18.16.1-alpine as app

WORKDIR /app/

COPY --from=build /tmp/node_modules ./node_modules
COPY --from=build /tmp/package*.json ./
COPY --from=build /tmp/dist ./dist

RUN apk --no-cache add curl

CMD ["node", "dist/src/main.js"]