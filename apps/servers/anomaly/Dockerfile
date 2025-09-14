FROM node:22

WORKDIR /app
COPY package.json .
RUN yarn add cromio 

COPY . .

RUN npx node-gyp rebuild
