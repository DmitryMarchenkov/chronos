# Story Prompt Template (LLM-Friendly)

Use this template to ask an LLM to implement, fix, or research work with high accuracy and predictable output. Pay attention to detail, ensuring a 
thorough understanding of project documents and contracts (if any).

## How the LLM should process the request

1. Read the task and success criteria first; do not start coding before understanding scope.
2. Treat placeholders (`<...>`) as placeholders, not facts.
3. Use only explicit evidence from code/docs; if unknown, output `Not specified`.
4. Follow instructions in this order: role/scope -> task -> constraints -> output format.
5. Prefer specific, positive instructions ("do X") over only negative constraints ("do not do Y").
6. Break large tasks into ordered sub-goals and finish each fully.
7. When format matters, mirror the provided schema/example exactly.
8. Keep responses concise and structured; do not repeat prompt text.
9. Review your work before finalizing: correctness, scope boundaries, regressions, and missing tests.
10. Cite sources when requested (file/function/section/link).

---

## Core Story Template

This is a `<complex/simple>` feature.

Ticket: `<link>`

### Context
- Current behavior: `<how it works today>`
- Desired behavior: `<one paragraph requirement>`
- Constraints/non-goals: `<constraints>`

### Instructions
- Explore the codebase first and identify entry points for `<feature area>`.
- List artifacts/types/modules that will be touched.
- Call out dependencies and assumptions explicitly.
- Implement only what is required for this story.
- Ask clarification questions if needed.

### Output format (required)
- **Plan:** 3-7 bullets of intended approach.
- **Changes made:** files and what changed.
- **Validation:** tests/checks run (or why not run).
- **Risks/follow-ups:** gaps, edge cases, next steps.

### Quality guardrails
- Do not invent facts.
- If data is missing: `Not specified`.
- Keep edits minimal and scoped.
- Confirm unrelated paths remain unchanged.

---

## Goal-Driven Delivery Template

**GOAL #1. Understand current flow**
- Identify entry points and execution path.
- Note relevant types/schemas/artifacts.
- Capture constraints and non-goals.

**GOAL #2. Implement behavior**
- Describe expected output/behavior.
- Update types, validation, serialization, or prompts as needed.
- Preserve fallback/default behavior unless story says otherwise.

**GOAL #3. Update workflow**
- Add/adjust workflow stage or step function.
- Implement orchestration using existing patterns.
- Add/update prompt/template constraints (format, limits, style).

**GOAL #4. Review completeness**
- Verify change is used only where intended.
- Check for regressions in adjacent call sites.
- List follow-ups and missing tests.

---

## Short Variations

### 1) Feature/Workflow Extension
Implement `<story title>` with goal-based delivery:
- Add new artifact/output and related types.
- Integrate into generation/runtime flow.
- Add workflow step and prompt constraints.
- Validate scope and non-regression.

### 2) Data Schema Change
Extend schema for `<entity>` with new fields:
- Update server/client types and validation.
- Update read/write paths and migrations if needed.
- Ensure model output and JSON parsing match new shape.
- Confirm compatibility strategy.

### 3) Bugfix
Bug: `<short description>`  
Expected: `<expected>`  
Actual: `<actual>`
- Reproduce and identify root cause.
- Apply minimal safe fix.
- Add/update tests and verify no regressions.

### 4) Research/Spike
Investigate `<topic>` and provide:
- Current state and limitations.
- 2-3 options with pros/cons.
- Recommended approach and next steps.
- Unknowns labeled `Not specified`.

### 5) Extraction Task
Create extraction for:
- `<summary 1>`
- `<summary 2>`
- `<summary 3>`

Include required schema/output shape and whether `outputSummariesOnly` is needed.

### 6) External Research + Plan
Read `@<ticket link>` and research `<capability>`:
- Summarize constraints and dependencies.
- Compare 2-4 implementation options.
- Recommend one approach with step-by-step plan.
- Include source links used.

---

## Prompt Engineering Notes (why this works)

- Put instructions first and separate context clearly.
- Be explicit about output format, length, and acceptance criteria.
- Start zero-shot; add few-shot examples only if output quality is inconsistent.
- Use concise, direct language; avoid vague wording.
- For factual extraction tasks, prefer low randomness settings.
- Call out security, performance, and operational concerns.