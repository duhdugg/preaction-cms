FROM node:lts-alpine
RUN apk update \
  && apk upgrade --no-cache \
  && apk add bash exiftool --no-cache
ADD . /home/node/preaction-cms
WORKDIR /home/node/preaction-cms
RUN chown -R node:node . \
  && su node -c 'yarn' \
  && su node -c 'yarn build'
EXPOSE 8999
ENV NODE_ENV=production
USER node
CMD ["node", "server.js"]
