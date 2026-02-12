# Debugging Playbook

Reusable process for investigating production or local issues without jumping straight to code changes.

## When to use this

Use this playbook when:
- an issue is hard to reproduce,
- logs suggest unexpected behavior,
- the root cause may be external (infra, dependencies, config, third-party APIs),
- you need a structured investigation before deciding on a fix.

## Investigation workflow (generic)

### 1) Frame the problem clearly
- Capture expected behavior vs actual behavior in one or two sentences.
- Record environment details: service, branch/version, date/time window, region, tenant/account, and affected users.
- State current impact level (blocked, degraded, intermittent, cosmetic).

### 2) Build a timeline from evidence
- Collect logs from oldest to newest within the incident window.
- Keep raw evidence immutable; do not paraphrase before storing it.
- Mark key transitions: first warning, first failure, retries, rollback, recovery.

### 3) Trace logs to execution path
- For each key log line, locate where it is emitted in code.
- Map the path: entry point -> orchestrator -> external calls -> persistence -> completion/rollback.
- Identify exact boundaries where control moves across systems.

### 4) Form hypotheses (multiple, not single-threaded)
- Create 2-4 plausible causes, including at least one external/systemic hypothesis.
- For each hypothesis, define what evidence should be true if it is correct.
- Prefer falsifiable statements over broad guesses.

### 5) Run minimal verification checks
- Validate configuration and secret state for the affected environment.
- Verify dependent system health/status pages and API quotas.
- Re-run the smallest safe repro path with extra observability.
- Compare against a known-good run (diff logs, payload shape, timing, config).

### 6) Isolate root cause class
- Classify the issue before fixing:
  - Code regression
  - Data/state drift
  - Config/environment drift
  - Dependency/service outage
  - Auth/permission drift
  - Concurrency/timing issue

### 7) Define containment and recovery
- Decide immediate containment: retry guard, feature toggle, rollback, fail-closed/open behavior.
- Evaluate blast radius by tenant, region, operation type, and data integrity risk.
- Document user-facing impact and communication needs.

### 8) Produce investigation output
- Summarize findings with confidence level (high/medium/low).
- List confirmed facts, disproven hypotheses, and remaining unknowns.
- Provide next actions:
  - immediate mitigation,
  - permanent fix proposal,
  - observability/test gaps to prevent recurrence.

## Evidence table template

Use this template during investigations:

| Time (UTC) | Signal | Source | What it means | Confidence |
|---|---|---|---|---|
| 2026-01-01T10:01:00Z | Error X | service logs | First hard failure | Medium |
| 2026-01-01T10:02:30Z | Retry/rollback Y | worker logs | Failure handling path entered | High |

## Hypothesis table template

| Hypothesis | Supporting evidence | Contradicting evidence | Validation step | Status |
|---|---|---|---|---|
| External API timeout causes rollback | Increased latency logs | No 5xx in app logs | Check provider metrics/status | Open |

## Investigation prompt template (copy/paste)

Use this when asking an engineer or AI assistant to investigate:

1. **Intent**
   - "Do not fix yet. Investigate and explain likely root causes."
2. **Context**
   - service/module:
   - environment:
   - timeframe:
   - expected behavior:
   - actual behavior:
3. **Evidence**
   - ordered logs (oldest -> newest),
   - relevant alerts/metrics,
   - links to related code paths.
4. **Requested output**
   - traced execution path tied to log lines,
   - 2-4 hypotheses with validation steps,
   - likely root-cause class,
   - containment options,
   - recommended next action.

## Quality bar for a completed investigation

An investigation is complete when:
- timeline is evidence-backed,
- log-to-code mapping is explicit,
- at least one hypothesis is disproven with data,
- root-cause class is identified with confidence,
- next actions are concrete and prioritized.
