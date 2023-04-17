FROM node:18.14.2-slim

EXPOSE 8000

WORKDIR /home/node/website

RUN npm install -g create-react-app

COPY /config /home/node/website/config
COPY /public /home/node/website/public
COPY /routes /home/node/website/routes
COPY /package.json /home/node/website/package.json
COPY /yarn.lock /home/node/website/yarn.lock
COPY /app.js /home/node/website/app.js

RUN yarn install

CMD [ "yarn", "start" ]