# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Account settings page with profile, notification, and security placeholders
- Notifications page with preferences and activity placeholder
- Data structure documentation for the Prisma schema
- Mock data generator for local dev realism
- Public data fetch script (HTML table -> JSON output)
- Guardrails for external data ingestion (row limits)

### Fixed

- Real data parser now falls back to non-ID table detection
- Real data script now seeds clients from a public companies table

### Changed

- Account menu now routes to the settings page
- Account menu now links to notifications
- Web UI refreshed with a green-accented, enterprise-inspired visual system
- Notifications preferences moved from settings to notifications page

## [0.1.0] - 2026-02-04

### Added

- Nx workspace with web, api, infra, and ai-worker apps
- Shared libraries for types, validation, and RBAC
- Fastify API with JWT auth, RBAC, and Prisma models
- React UI with dashboard and assessment editing
- GitLab CI, Husky, and commitlint baseline
