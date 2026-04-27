---
name: brainstorming-ideas
description: Explores user intent, requirements, and design before implementation. Use when the user requests a new feature or before any creative work.
---

# Brainstorming Ideas Into Designs

## When to use this skill
- Before any creative work (creating features, building components, adding functionality).
- When the user presents an idea that needs a design or spec.
- When deciding architecture, component boundaries, or user flow.

## Workflow

- [ ] **Explore project context:** Check files, docs, recent commits.
- [ ] **Offer visual companion:** If the topic involves visual questions, offer the visual companion.
- [ ] **Ask clarifying questions:** Ask **one at a time**, to understand context, constraints, and success criteria.
- [ ] **Propose 2-3 approaches:** Present approaches with trade-offs and your recommendation.
- [ ] **Present design sections:** Scale to complexity, get user approval after each section.
- [ ] **Write design doc:** Save the design spec locally and commit.
- [ ] **Spec review loop:** Dispatch a spec-document-reviewer subagent and fix issues until approved.
- [ ] **User reviews written spec:** Ask the user to review the spec.
- [ ] **Transition:** Transition to the planning-tasks skill.

## Instructions

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

**Anti-Pattern:** "This Is Too Simple To Need A Design". Every project goes through this process. You MUST present a design and get approval before taking any implementation action.

- **One question at a time:** Don't overwhelm with multiple questions.
- **Multiple choice preferred:** Better than open-ended questions when possible.
- **Visual Companion:** If visuals are needed, offer the visual companion as an isolated message. "Some of what we're working on might be easier to explain if I can show it to you in a web browser..." Deciding per-question if text or visual is better.
- **Write Spec:** Save to `docs/specs/YYYY-MM-DD-<topic>-design.md`

### Review Loop
After writing the spec document, run a review loop with the prompt in resources. Fix issues until approved (max 5 iterations, then human guidance).

## Resources
- [Spec Document Reviewer Prompt](resources/spec-document-reviewer-prompt.md)
- [Visual Companion Info](resources/visual-companion.md)
- [Helper Scripts](scripts/)
