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
npx nx serve api                || start API (http://localhost:4000)
npx nx serve web                || start Web UI (http://localhost:4200)

Seeded user: `owner@chronos.local` / `password123`

## Useful Commands

npx nx test             || runs unit tests for projects in the Nx workspace
npx nx lint             || runs ESLint checks across the workspace (enforces code style)
npx nx graph            || opens the Nx dependency graph (understand project/library dependencies)
npm run prisma:migrate  || applies Prisma migrations to the database (keeps DB schema in sync)
npm run prisma:seed     || populates the database with initial/dev data (creates default local tenant/users/sample)

## Repo Layout
- `apps/web` React UI
- `apps/api` Fastify API
- `apps/infra` AWS CDK skeleton
- `apps/ai-worker` Python placeholder
- `libs/shared-*` shared types/validation/rbac
- `docs` product + engineering docs


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