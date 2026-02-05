# Architecture

## Overview
- Nx monorepo with React web app, Fastify API, and AWS CDK skeleton.
- Shared libraries for domain types, validation, and RBAC helpers.

## Services
- `apps/api`: Fastify + Prisma, JWT auth, RBAC enforcement.
- `apps/web`: React + React Router, communicates with API via REST.
- `apps/infra`: CDK placeholder stacks (S3, SQS, CloudFront, Lambda).

## Data
- PostgreSQL for persistence.
- Prisma schema defines User, Client, WorkspaceMember, Assessment, and AssessmentDomainScore.
