###
### Première partie : Compilation du code Typescript
###
FROM node:lts-alpine as tsc-builder
WORKDIR /usr/src/app

# Installation des dépendances et build.
COPY . .
RUN yarn install && yarn run build

###
### Construction de l'image de production (2ème partie)
###
FROM node:lts-alpine as runtime-container
WORKDIR /usr/src/app

ARG _CDN_CLOUD_NAME
ARG _CDN_API_KEY
ARG _CDN_API_SECRET
ARG _MONGO_URI
ARG _TEST_ENV

ENV CDN_CLOUD_NAME $_CDN_CLOUD_NAME
ENV CDN_API_KEY $_CDN_API_KEY
ENV CDN_API_SECRET $_CDN_API_SECRET
ENV MONGO_URI $_MONGO_URI
ENV TEST_ENV $_TEST_ENV

# On copie les sources compilées depuis la première étape
COPY --from=tsc-builder /usr/src/app/dist ./dist
COPY --from=tsc-builder ["/usr/src/app/package.json", "/usr/src/app/yarn.lock", "./"]

# Installation des modules de production seulement
RUN yarn install --prod

# Start
CMD yarn run start

EXPOSE 8080
