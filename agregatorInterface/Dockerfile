FROM node:18.15.0-alpine3.16

WORKDIR /usr/src/interface
COPY package*.json ./
RUN npm install -r 

COPY . .

EXPOSE 5173
