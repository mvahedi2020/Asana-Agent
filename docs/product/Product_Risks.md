# Product risks — Asana Agent

These are prospective decision risks for the fictional prototype and any later exploration. They do not describe incidents or customer outcomes.

| Risk | Early signal | Mitigation and decision trigger |
|---|---|---|
| Conversation is mistaken for completed action | Participants believe a message already changed a task | Keep proposal and confirmed state distinct. Redesign the transition if two or more participants misread it. |
| Preview does not establish scope | People cannot name the task or before-and-after value | Lead with readable titles and show values. Do not add bulk breadth until the tested preview is understood. |
| Ambiguity creates unsafe assumptions | People expect the guide to choose among similar tasks | Ask a clarification question and preserve a no-change state. Test clearer choices before any ranking approach. |
| Old conversational context targets the wrong task | A pronoun after a board-wide answer still proposes a change to an earlier task | Expire single-task context when an intervening answer has no single record. Treat any wrong-target proposal as a release blocker. |
| Hidden context survives an explicit cleanup or replacement | A pronoun after Clear chat, Reset, or Undo still targets the previously discussed task | Expire task context with transcript cleanup and confirmed board replacement. Block release if any context-expiry sequence opens a proposal. |
| Blocked status lacks an actionable reason | A task is moved to Blocked but the board cannot explain what needs attention | Disable or refuse the transition when the record has no nonblank blocker reason. Add reason editing only with its own review and validation contract. |
| Recovery path is not discoverable | Participants cannot cancel or use reviewed undo | Keep both flows in the same review pattern; revise labels or sequence when sessions show failure. |
| Replacement preview buries the real change | Reset or Undo lists unchanged tasks until the affected record is hard to identify | Show only visible status or owner deltas. When there are none, explain the incompatible-storage recovery case instead of presenting unchanged rows. |
| Transient chat control is mistaken for a task action | Participants expect Clear chat to apply, cancel, reset, or undo a task update | Keep the open proposal visible and task values unchanged; test labels and placement before coupling chat cleanup to task state. |
| Local sample boundary is confused with a connected product | Participants assume login, permissions, audit trail, or external updates | State the deterministic local boundary. Gate integrations on access, privacy, reliability, support, and model-evaluation requirements. |

Review the signals alongside the proposed session protocol. For every safety misunderstanding, preserve the request, the visible proposal, the participant explanation, confirmation choice, and final task state in the study note. Repeated misunderstanding should change the tested workflow before language expansion or commercial investment.
