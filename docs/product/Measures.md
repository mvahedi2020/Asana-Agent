# Proposed success measures

These are future evaluation targets, not customer results.

| Measure | Method and denominator | Target | Guardrail |
|---|---|---|---|
| Correct answer scope | Correct task IDs and counts / all supported read requests in a versioned evaluation set | 100% for this deterministic sample | Today, overdue and week must remain different scopes |
| Confirmation coverage | Proposed writes shown for review / all proposed writes, single and bulk | 100% | Unsupported requests must never create a write |
| Unassisted task completion | Participants completing the briefing, a cancelled reassignment, confirmed NTH-104 update, and reviewed Undo / five consenting product, delivery, or program leads | 4/5 | Must correctly identify the task, local-sample boundary, and confirmation scope |
| Coordination comparison | Median successful task time in the prototype versus the same task in each participant's current method | Describe the five-person pattern only | Keep assisted attempts out of the primary time comparison; no increase in incorrect or unintended edits |
| Action-boundary clarity | Participants who state that a preview is not yet a completed task update / five participants | 5/5 | Any critical belief that a message already changed a task pauses expansion |
| Unintended-mutation rate | Confirmed task writes not requested by the participant / all confirmed task writes in the session | 0/ all sessions | Count a change to the wrong task or field even if the participant later uses Undo |

Record all five participants in the unassisted denominator. Record moderator-assisted attempts separately and name the help given; neutral task instructions are not assistance. The implemented browser checks exercise cancellation, confirmed assignment with persistence, bulk confirmation, clear-chat during preview, undo, unsupported requests and safe text rendering. They establish deterministic workflow behavior only. No language model was evaluated and no human study has occurred.

For the mutation measure, a participant changing NTH-104 to Complete after reviewing that exact transition is requested. Changing NTH-112’s owner after a request about NTH-104 is unintended even if the result looks plausible. A cancelled proposal, a read response, and Clear chat are excluded because none writes task data. Record the request, displayed proposal, confirmation choice, resulting records, and any recovery step together so a low count cannot hide a confusing path.
