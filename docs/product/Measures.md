# Proposed success measures

These are future evaluation targets, not customer results.

| Measure | Method and denominator | Target | Guardrail |
|---|---|---|---|
| Correct answer scope | Correct task IDs and counts / all supported read requests in a versioned evaluation set | 100% for this deterministic sample | Today, overdue and week must remain different scopes |
| Confirmation coverage | Proposed writes shown for review / all proposed writes, single and bulk | 100% | Unsupported requests must never create a write |
| Unassisted task completion | Participants completing the briefing, a cancelled reassignment, confirmed NTH-104 update, and reviewed Undo / five consenting product, delivery, or program leads | 4/5 | Must correctly identify the task, local-sample boundary, and confirmation scope |
| Coordination comparison | Median successful task time in the prototype versus the same task in each participant's current method | Describe the five-person pattern only | Keep assisted attempts out of the primary time comparison; no increase in incorrect or unintended edits |
| Action-boundary clarity | Participants who state that a preview is not yet a completed task update / five participants | 5/5 | Any critical belief that a message already changed a task pauses expansion |
| Unintended writes | Count of observed task mutations that differ from the participant’s requested task or field, or that follow a no-write interaction | 0 observed | Any mutation after a read, Cancel, Clear chat, unsupported request, or other no-write action is a failure, even if later undone |

Record all five participants in the unassisted denominator. Record moderator-assisted attempts separately and name the help given; neutral task instructions are not assistance. The implemented browser checks exercise cancellation, confirmed assignment with persistence, bulk confirmation, clear-chat during preview, undo, unsupported requests and safe text rendering. They establish deterministic workflow behavior only. No language model was evaluated and no human study has occurred.

For the unintended-write count, a participant changing NTH-104 to Complete after reviewing that exact transition is requested. Changing NTH-112’s owner after a request about NTH-104 is unintended even if the result looks plausible. A mutation after a cancelled proposal, read response, or Clear chat is also unintended because those interactions must not write task data. Record every observed interaction, its request or control, displayed proposal where applicable, confirmation choice, resulting records, and any recovery step. Report the interaction opportunities and sessions observed alongside the count; zero observed unintended writes is a technical observation, not evidence of human comprehension or demand.
