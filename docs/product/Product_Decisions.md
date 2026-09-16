# Product decisions — Asana Agent

This record explains the tradeoffs in the fictional prototype. It does not claim live usage, customer evidence, or a delivery commitment.

## Proposal before task action

**Alternatives considered:** apply a conversational request immediately, require a form for every action, or let conversation prepare a reviewable proposal. **Chosen compromise:** show the readable task title and before-and-after values, then require confirm or cancel for task, reset, and undo changes. **Cost:** an extra interaction for routine updates. **Reconsider when:** research shows the preview is not understood, creates material friction, or a different review pattern proves clearer.

## Deterministic local handling

**Alternatives considered:** open-ended external AI, a live task-system integration, or a limited local request set. **Chosen compromise:** deterministic handling against visible fictional records makes the boundary testable. **Cost:** limited phrasing and no claim of general language understanding. **Reconsider when:** consented sessions identify high-value request types that cannot safely be supported.

## Clarify ambiguity rather than guess

**Alternatives considered:** choose the first match, show a ranked guess, or ask the person to identify the task. **Chosen compromise:** ask a clear question when multiple or no tasks match. **Cost:** conversation can feel slower. **Reconsider when:** people cannot resolve the prompt, or a transparent disambiguation display improves comprehension.

## Browser-local recovery

**Alternatives considered:** server-backed history, no persistence, or local state with reviewed reset and undo. **Chosen compromise:** persist confirmed sample state when available and preview undo and reset. **Cost:** no collaboration, audit record, permissions, or cross-device continuity. **Reconsider when:** validated workflows require a shared record and access, privacy, reliability, and support controls are defined.

## Clearing the conversation does not cancel a proposal

**Alternatives considered:** make Clear chat dismiss an open proposal, block Clear chat during review, or clear only messages while leaving the proposal visible. **Chosen compromise:** Clear chat removes transient conversation context but keeps the prepared review open. **Cost:** a person must choose Cancel or Confirm explicitly. **Why:** a task proposal is decision state, not chat history; coupling them could make an unrelated cleanup appear to cancel or alter NTH-112. **Reconsider when:** consented sessions show people cannot distinguish the two controls; test clearer labels or placement before changing the action boundary.

## Decision reversal rules

| Choice | Reverse only when evidence says | What changes first |
|---|---|---|
| Proposal before action | At least two consented participants believe a request already changed NTH-104 or cannot state the previewed transition. | Redesign preview language or sequence before adding new actions. |
| Deterministic handling | Participants identify a repeated high-value request that the limited set cannot support safely. | Specify the request, error states, and confirmation contract before expanding coverage. |
| Clarification over guessing | Participants cannot resolve ambiguity with the prompt or a clear selection proves safer. | Test an explicit disambiguation display; do not silently rank a match. |
| Browser-local recovery | A validated workflow requires a shared record or durable history. | Define access, privacy, reliability, retention, and support requirements before integration. |
| Clear chat preserves proposal | Participants expect Clear chat to cancel, or cannot locate Cancel after using it. | Test clearer transient-state language and control placement without making chat cleanup mutate task state. |
