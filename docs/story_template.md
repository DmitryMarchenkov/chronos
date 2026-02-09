This is a <complex / simple> feature.

Start by reading this ticket: <link>

Please explore the codebase and make sure you understand how <current behavior> works (how we do <process> today).
Call out any assumptions or dependencies you find.
Perform your tasks with accuracy and attention to detail, ensuring a thorough understanding of project documents and contracts (if any).

<important_guidelines>
1. Information accuracy: Only extract and summarize information that is explicitly stated in the provided documents or code. Do not invent or assume. If something is not available, say "Not specified" or "Information not available."
2. Template recognition: Distinguish between real project-specific content and template placeholder text. Ignore placeholders when extracting facts.
3. Response formatting: Do not repeat instructions in your response. Provide only the requested output or findings.
4. Source referencing: When you extract summaries or specific facts, include a reference to where it was found (e.g., section name, file, or function).
5. Think hard, move slowly, take your time.
6. Review what you've done.
</important_guidelines>

The feature is asking you to <one-paragraph requirement>.

**GOAL #1.** Understand the current flow
- Identify the main entry points for <feature area>.
- List the existing artifacts/types that will be touched.
- Note any constraints or non-goals.

**GOAL #2.** Implement the new behavior
- Describe how the new output should look.
- Extend types/schemas and any hydration/serialization logic if needed.
- Update any prompt/content generation paths if applicable.

**GOAL #3.** Add/extend workflow steps
This goal splits into sub-steps:

- **GOAL #3.1.** Update workflow definition/step function
- **GOAL #3.2.** Implement orchestration function (copy/adapt from existing step)
- **GOAL #3.3.** Add/update prompt for the new step

**GOAL #4.** Review and completeness
- Verify the change is used in the intended location only.
- Confirm other call sites still use the original behavior.
- List any follow-ups or missing tests.
 - Confirm any referenced sources are cited where requested.

---

## Variations

### 1) Feature/Workflow Extension
I need you to implement the following story: <short story title>. I will break it down into several goals that you need to achieve. Please think deep and move slowly. You will need to make sure you understand the parts of the codebase related to the change well before you start applying your changes.

**GOAL #1.** Add a new artifact or output
- Extend types describing <content>.
- Extend artifacts list (if any).
- Update hydration/serialization if needed.

**GOAL #2.** Integrate into generation flow
- Use <new artifact> for <specific path>.
- Ensure fallback behavior remains intact.

**GOAL #3.** Add a workflow step
- Add stage to workflow definition.
- Create orchestrator function (copy and adapt).
- Add prompt with constraints (max tokens, format).

**GOAL #4.** Review
- Validate usage is limited to the intended feature.
- Double-check related paths remain unchanged.

### 2) Data Schema Change
We need to extend the schema for <entity>. Current shape has <fields>. New fields:
- <field>: <type> — <reason>
- <field>: <type> — <reason>

**GOAL #1.** Update schema and types
- Align server and client types.
- Update validation/parsing logic.

**GOAL #2.** Update data flow
- Ensure read/write paths include new fields.
- Update migrations/backfills if needed.

**GOAL #3.** Update prompts/serialization
- Ensure AI outputs the new structured shape.
- Update any JSON parsing logic.

**GOAL #4.** Review
- Validate backward compatibility or migration plan.
- Identify required test coverage.

### 3) Bugfix
Bug: <short description>. Expected: <expected>. Actual: <actual>.

**GOAL #1.** Reproduce and locate
- Find the entry point and failing condition.
- Identify why existing checks do not work.

**GOAL #2.** Fix
- Apply minimal change.
- Add or update tests.

**GOAL #3.** Review
- Ensure no regressions in adjacent paths.
- Verify error handling and logging.

### 4) Research/Spike (no code or limited code)
We need a short investigation: <topic>. Produce findings and recommendation.

**GOAL #1.** Explore
- Identify current implementation and limitations.
- Capture risks and unknowns.

**GOAL #2.** Options
- Provide 2–3 approaches with pros/cons.
- Recommend one approach and why.

**GOAL #3.** Next steps
- Outline the follow-up implementation plan.

**GOAL #4.** Review
- Ensure findings are grounded in explicit sources.
- Mark any unknowns as "Not specified."

### 5) Extraction Task (summaries from documents)
Help me create a new extraction task to get the following summaries:
- <summary 1> (borrow from <existing tenant> if applicable; do not reuse schema)
- <summary 2>
- <summary 3>

Notes:
- Specify any schema expectations or output shape.
- Clarify whether to use `outputSummariesOnly` for this section.

### 6) Research + Implementation Plan (external systems)
Please read @<ticket link>. I need you to research how best to implement <capability>. I have questions about the best way to <integration detail>. I need you to build an implementation plan and list the options I have. Search the web for ideas and solutions.

**GOAL #1.** Understand the problem
- Summarize the requirement and constraints.
- Identify relevant systems and dependencies.

**GOAL #2.** Research options
- Provide 2–4 approaches with pros/cons.
- Call out security, cost, and operational concerns.

**GOAL #3.** Recommend and plan
- Recommend one approach and explain why.
- Provide a step-by-step implementation plan.

**GOAL #4.** Review
- List unknowns and how to validate them.
- Link to sources used in research.