# the8thavenue-api

API for the web application [8th Avenue](https://github.com/itsabdessalam/eighthavenue)

API url: https://eighthavenue-jnmbdknr5q-ew.a.run.app

It has been deployed on GCP with a continuous deployment using Cloud Build and Cloud Run.

## Stack used ⚙️

- Fastify
- Typescript
- Docker (for the Cloud Run deployment)
- MongoDB
- Cloudinary

## Installation 🚀

1. Install dependencies

```
npm install
```

2. Setting up environnement variables

```
# Cloudinary keys
CDN_CLOUD_NAME=xxxx
CDN_API_KEY=xxxx
CDN_API_SECRET=xxxx
CDN_URL=xxxx

# For auth
JWT_KEY=xxxx

# DB
MONGO_URI=xxxx
```

3. Run server

```
npm run dev
```

## Collaborators 🤖

[Abdessalam BENHARIRA](https://github.com/itsabdessalam)

[Floran MAITTE](https://github.com/Floran-mtte)

[Naomi PAULMIN](https://github.com/codebynao)
