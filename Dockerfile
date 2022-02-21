FROM node:lts-alpine
RUN apk update
RUN apk upgrade --no-cache
RUN apk add bash exiftool --no-cache
ADD . /home/node/preaction-cms
WORKDIR /home/node/preaction-cms
RUN chown -R node:node .
RUN su node -c 'yarn'
RUN su node -c 'yarn build'
EXPOSE 8999
ENV NODE_ENV=production
USER node
CMD ["node", "server.js"]
