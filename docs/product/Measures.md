# Proposed success measures

These are future evaluation targets, not customer results.

| Measure | Method and denominator | Target | Guardrail |
|---|---|---|---|
| Correct answer scope | Correct task IDs and counts / all supported read requests in a versioned evaluation set | 100% for this deterministic sample | Today, overdue and week must remain different scopes |
| Confirmation coverage | Proposed writes shown for review / all proposed writes, single and bulk | 100% | Unsupported requests must never create a write |
| Unassisted task completion | Participants completing briefing, reassignment and undo / five consenting PM evaluators | 4/5 | Must correctly identify sample data and confirmation scope |
| Coordination time | Median task time versus each participant's current method | Explore a 20% reduction | No increase in incorrect or unintended edits |

The implemented browser checks exercise cancellation, confirmed assignment with persistence, bulk confirmation, clear-chat during preview, undo, unsupported requests and safe text rendering. They establish deterministic workflow behavior only. No language model was evaluated and no human study has occurred.
