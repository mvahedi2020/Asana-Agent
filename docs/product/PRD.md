# Product requirements: conversational task workspace

## Product brief

**User:** A product or delivery lead who needs to understand current work and prepare routine updates.

**Problem:** A task system can make simple coordination slow when people must translate an everyday request into rigid controls. A conversational layer can reduce that friction, but it must not hide which record will change or take action without review.

**Goal:** Create a transparent, local sample where the conversation and visible task records stay in sync, and every proposed change can be checked before it is applied. This is a fictional prototype, not a claim of customer demand, model performance, or production impact.

## Product principles and scope

1. **Ground the conversation in visible records.** Responses use the task data already shown in the workspace and lead with readable task titles.
2. **Make changes reviewable.** A status, owner, bulk, reset, or undo operation must show its affected records and before-and-after values, then require confirmation.
3. **Prefer safe uncertainty.** The workspace asks a clarifying question for an unclear task and treats negation as a reason not to prepare a change.
4. **Keep the claim bounded.** The sample uses deterministic local handling and fictional Northstar data; it does not imply an Asana connection or external AI capability.

The first release favors clarity and recoverability over broad automation. It excludes authentication, permissions, notifications, due-date editing, live integrations, and open-ended language-model behavior. Those are valuable future questions, but they would require different privacy, reliability, and evaluation controls.

## Required behavior

1. Show fictional tasks with a title, task code, project, status, owner, due date, priority, and blocker when relevant.
2. Accept ordinary requests for blocked work, due dates, task details, owner work, summaries, and weekly briefings.
3. Prepare status changes from a task title or code and familiar words such as done, in progress, blocked, in review, planned, and reopen.
4. Prepare owner changes from a task title or code and one of the visible owner names.
5. Let people choose a status or owner directly from each task card, using the same review flow as the conversation.
6. Ask a clear question when no task is named or more than one task could match. When one task, status, and owner are all clear, prepare both changes in one preview.
7. Show each affected task’s readable title and before-and-after value before any single, bulk, reset, or undo change. Require confirm or cancel.
8. Keep saved state in local browser storage; warn without overwriting incompatible storage; reset only after confirmation; provide a reviewed undo.
9. Work with keyboard controls and a narrow mobile viewport.

## Non-goals

This sample has no authentication, Asana or other task-system integration, API, external model, paid service, live customer data, analytics, notifications, permission system, or production claim.

## Acceptance criteria

Every supplied capability example works as written. A read request does not open a change preview. A negated change does not prepare an opposite update. A change never applies before confirmation, including bulk, reset, and undo. Task-title replies lead with readable titles rather than task codes. Saved state survives reload when storage is available, and an invalid saved state does not crash or get overwritten without a confirmed reset.

## Concrete Northstar acceptance examples

In the fictional Northstar board, “Mark Finalize onboarding checklist as done” prepares a preview for NTH-104 that names the task and shows **In progress → Complete**. Confirm applies that task update; Cancel leaves the task unchanged. “Assign Review trial nurture copy to Jon Bell” similarly previews **Priya Shah → Jon Bell** before confirmation. “Complete all tasks in review” must show every affected readable task before it can proceed. A request for blockers or a due date answers from the visible local data and opens no change preview.

When a request could name more than one task, the workspace asks the person to identify one task or code instead of selecting a guess. “Do not mark this done” creates no update. Direct Status and Owner controls use the same proposal path as conversation. Reset and Undo each show their own before-and-after preview and require confirmation because they modify task state. **Clear chat** only removes local conversation messages; it does not update, reset, undo, or otherwise change any task and therefore is outside the task-change confirmation contract. These examples are prototype acceptance behavior for fictional data, not a claim about a connected Asana product.
