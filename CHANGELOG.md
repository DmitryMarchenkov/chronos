# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.2.0] - 2026-02-10

### Added

- Account settings page with profile, notification, and security placeholders
- Notifications page with preferences and activity placeholder
- Data structure documentation for the Prisma schema
- Mock data generator for local dev realism
- Public data fetch script (HTML table -> JSON output)
- Guardrails for external data ingestion (row limits)
- Unified engineering practices document with security, testing, scalability baseline and audit backlog (`docs/engineeringpractices.md`)
- API auth rate-limiting using `@fastify/rate-limit`
- Web Jest test setup polyfills for stable test runtime (`TextEncoder`/`TextDecoder`)

### Fixed

- Real data parser now falls back to non-ID table detection
- Real data script now seeds clients from a public companies table
- Broken Nx executor references in `ai-worker` project targets
- Stale scaffold tests in shared libraries replaced with real behavior assertions
- Workspace-level lint/test scripts now execute reliably

### Changed

- Account menu now routes to the settings page
- Account menu now links to notifications
- Web UI refreshed with a green-accented, enterprise-inspired visual system
- Notifications preferences moved from settings to notifications page
- API security baseline hardened for production (`JWT_SECRET` enforcement and CORS allowlist)
- CI workflow now uses validated workspace scripts for lint/test and targeted app builds

## [0.1.0] - 2026-02-04

### Added

- Nx workspace with web, api, infra, and ai-worker apps
- Shared libraries for types, validation, and RBAC
- Fastify API with JWT auth, RBAC, and Prisma models
- React UI with dashboard and assessment editing
- GitLab CI, Husky, and commitlint baseline
