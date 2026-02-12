# Chronos

Nx monorepo starter for a multi-tenant B2B consulting delivery platform (Fastify API + React web app), with shared validation/types/RBAC libraries and an AWS CDK infrastructure skeleton.

## What’s Inside
- **Monorepo:** Nx + TypeScript
- **API:** Fastify + Prisma
- **Web:** React + React Router
- **Database:** Postgres (via Docker)
- **Shared libs:** `libs/shared-*` (types, Zod validation, RBAC helpers)
- **Infrastructure:** `apps/infra` (AWS CDK skeleton)
- **AI worker:** `apps/ai-worker` (Python placeholder)


## Quickstart

docker compose up -d            || start Postgres
npm install                     || install dependencies
cp .env.example .env            || create local environment file
npx prisma validate             || validate Prisma schema (preflight)
npm run prisma:migrate          || apply database migrations
npm run prisma:seed             || seed initial data
npm run prisma:mock             || (optional) add mock data to make the app feel live
npm run prisma:mock:leads       || (optional) create 5 mock leads for local testing
npm run data:real               || (optional) fetch real client data + seed DB
npx nx serve api                || start API (http://localhost:4000)
npx nx serve web                || start Web UI (http://localhost:4200)

Seeded user: `owner@chronos.local` / `password123`

## Local Kubernetes (k3d + Ingress)

This repository includes local Kubernetes manifests in `k8s/` for:
- `postgres` (stateful dev database)
- `api` (Fastify + Prisma)
- `web` (React static build served by Nginx)
- `Ingress` routes:
  - `http://chronos.local` -> web
  - `http://api.chronos.local` -> api

### 1) Create cluster

```
k3d cluster create chronos -p "80:80@loadbalancer" -p "443:443@loadbalancer"
```

### 2) Configure local hostnames

Add this to `/etc/hosts`:

```
127.0.0.1 chronos.local api.chronos.local
```

### 3) Build images

```
docker build -t chronos-api:dev .
docker build -f Dockerfile.web --build-arg VITE_API_URL=http://api.chronos.local -t chronos-web:dev .
```

### 4) Import images into k3d

```
k3d image import chronos-api:dev -c chronos
k3d image import chronos-web:dev -c chronos
```

### 5) Deploy manifests

```
kubectl apply -k k8s
kubectl wait --for=condition=complete job/api-migrate-seed -n chronos --timeout=180s
kubectl rollout status deployment/postgres -n chronos
kubectl rollout status deployment/api -n chronos
kubectl rollout status deployment/web -n chronos
```

### 6) Verify deployment

```
kubectl get pods,svc,ingress -n chronos
curl -H "Host: api.chronos.local" http://127.0.0.1/health
curl -H "Host: chronos.local" http://127.0.0.1/
curl -H "Host: api.chronos.local" -H "Content-Type: application/json" \
  -d '{"email":"k3d-user@chronos.local","password":"password123"}' \
  http://127.0.0.1/auth/register
curl -H "Host: api.chronos.local" -H "Content-Type: application/json" \
  -d '{"email":"k3d-user@chronos.local","password":"password123"}' \
  http://127.0.0.1/auth/login
```

### 7) Teardown / reset

```
kubectl delete -k k8s
k3d cluster delete chronos
```

## Useful Commands

npm run test            || runs tests across all projects in the Nx workspace
npm run lint            || runs ESLint checks across the workspace (enforces code style)
npm run build           || builds all projects that define a build target
npx nx graph            || opens the Nx dependency graph (understand project/library dependencies)
npm run prisma:migrate  || applies Prisma migrations to the database (keeps DB schema in sync)
npm run prisma:seed     || populates the database with initial/dev data (creates default local tenant/users/sample)
npm run prisma:mock     || populates additional mock data (more workspaces/users/assessments)
npm run prisma:mock:leads || creates 5 leads for `owner@chronos.local` (idempotent)
npm run data:real       || fetches real client data into DB + data/real-clients.json

## Security Configuration (Required for Deployment)

- Set a strong `JWT_SECRET` (32+ chars, high entropy).
- Set explicit `CORS_ORIGINS` (comma-separated exact origins, no wildcard).
- Do not deploy with local defaults from `.env.example`.

## API & Postman
A Postman collection and local environment are in `postman/`. Import the collection and (optionally) the **Chronos Local** environment, then run **Auth → Login** (or Register) to get a token; other requests use it automatically. See [postman/README.md](postman/README.md) for details.

## Repo Layout
- `apps/web` React UI
- `apps/api` Fastify API
- `postman/` Postman collection and environment for the API
- `apps/infra` AWS CDK skeleton
- `apps/ai-worker` Python placeholder
- `libs/shared-*` shared types/validation/rbac
- `docs` product + engineering docs

Useful docs:
- `docs/DEBUGGING_PLAYBOOK.md` generic incident/error investigation workflow


## Nx Basics

npx nx <target> <project>           || run an Nx task for a specific project (serve/test/build/lint)
npx nx graph                        || view the workspace dependency graph

Examples:
npx nx serve api                    || run API locally
npx nx test web                     || run tests for the Web app
npx nx lint api                     || lint the API project

## Generators (optional)
npx nx g <plugin>:app <name>        || generate a new app in apps/
npx nx g <plugin>:lib <name>        || generate a new library in libs/

Example:
npx nx g @nx/react:lib ui-kit       || create a React library

## Nx Cloud (optional)
npx nx connect                      || enable remote caching to speed up CI and local builds


## Useful links
- [Learn more about this workspace setup](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)