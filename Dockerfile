# BUILDER

FROM node:18 AS delphioracle-builder
USER node

COPY --chown=node . /var/delphioracle/
WORKDIR /var/delphioracle
RUN npm ci

# PRODUCTION

FROM node:18-alpine AS delphioracle
USER node
COPY --chown=node --from=delphioracle-builder /var/delphioracle /var/delphioracle
WORKDIR /var/delphioracle
CMD [ "node", "index.js" ]
