---
name: planning-tasks
description: Creates comprehensive implementation plans before touching code. Use when solving a multi-step task or requirement.
---

# Planning Tasks

## When to use this skill
- Before starting to write code for a new feature.
- When you are given a spec or requirements for a multi-step task.
- When transitioning from a brainstorming/spec phase to an implementation phase.

## Workflow

- [ ] **Review Requirements:** Check if the spec covers multiple independent subsystems. Break them into separate plans if needed.
- [ ] **Map File Structure:** Map out which files will be created or modified. Design units with clear boundaries.
- [ ] **Define Bite-Sized Tasks:** Break down into 2-5 minute actionable steps (Write failing test, run test, implement minimal code, verify pass, commit).
- [ ] **Write Plan Document:** Create the plan using the documented header and task structure format below.
- [ ] **Plan Review Loop:** Dispatch reviewer for each chunk and fix issues until approved (max 5 iterations).
- [ ] **Execute or Handoff:** Save plan and begin execution.

## Instructions

Write comprehensive implementation plans assuming the engineer has zero context for our codebase. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, and how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Save plans to: `docs/plans/YYYY-MM-DD-<feature-name>.md`

### Plan Document Header Format
```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED: Execute this plan step-by-step. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]
**Architecture:** [2-3 sentences about approach]
**Tech Stack:** [Key technologies/libraries]

---
```

### Task Structure Example
````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

### Review Loop
After completing each chunk (max 1000 lines), run a review loop using the attached prompt before proceeding. Same agent that wrote the plan fixes it (preserves context). Let the human know if the loop exceeds 5 iterations.

## Resources
- [plan-document-reviewer-prompt.md](resources/plan-document-reviewer-prompt.md)
