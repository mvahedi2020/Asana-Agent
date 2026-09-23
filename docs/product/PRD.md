# Product requirements: conversational task workspace

## Product brief

**User:** A product or delivery lead who needs to understand current work and prepare routine updates.

**Problem:** A task system can make simple coordination slow when people must translate an everyday request into rigid controls. A conversational layer can reduce that friction, but it must not hide which record will change or take action without review.

**Goal:** Create a transparent, local sample where the conversation and visible task records stay in sync, and every proposed change can be checked before it is applied. This is a fictional prototype, not a claim of customer demand, model performance, or production impact.

## Product principles and scope

1. **Ground the conversation in visible records.** Responses use the task data already shown in the workspace and lead with readable task titles.
2. **Make changes reviewable.** A status, owner, blocker reason, bulk, reset, or undo operation must show its affected records and before-and-after values, then require confirmation.
3. **Prefer safe uncertainty.** The workspace asks a clarifying question for an unclear task and treats negation as a reason not to prepare a change.
4. **Keep the claim bounded.** The sample uses deterministic local handling and fictional Northstar data; it does not imply an Asana connection or external AI capability.

The first release favors clarity and recoverability over broad automation. It excludes authentication, permissions, notifications, due-date editing, live integrations, and open-ended language-model behavior. Those are valuable future questions, but they would require different privacy, reliability, and evaluation controls.

## What the prototype enforces

| Behavior | Enforced now | Recommended product practice |
|---|---|---|
| Read requests | Grounded replies use visible fictional tasks and do not open a change preview. | Check the named task and sample-date boundary before acting on a reply. |
| Task changes | Supported status, owner, and blocker-reason changes create a preview with title and before-and-after values. | Treat the preview as the decision point, not the conversation message. |
| Ambiguity and negation | Multiple or missing matches prompt for a task; negated changes create no proposal. | Resolve ambiguity explicitly rather than rephrasing it as a guessed update. |
| Bulk, reset, and Undo | Every changed, added, or removed task is previewed and requires confirm or cancel. An unchanged reset creates no empty Undo step. | Review the displayed scope before confirmation. |
| Local persistence | Confirmed valid sample state persists where browser storage works; oversized or incompatible saved boards remain untouched until explicit reset. | Do not infer collaboration, audit history, or a connected system. |
| Conversation bounds | Requests accept up to 500 characters and the tab retains the most recent 40 messages. Oversized requests create no proposal. | Split complex work into one clear, reviewable task change at a time. |

## Required behavior

1. Show fictional tasks with a title, task code, project, status, owner, due date, priority, and blocker when relevant.
2. Accept ordinary requests for blocked work, due dates, task details, owner work, summaries, and weekly briefings.
3. Prepare status changes from a task title or code and familiar words such as done, in progress, blocked, in review, planned, and reopen.
4. Prepare owner changes from a task title or code and one of the visible owner names.
5. Let people choose a status or owner directly from each task card, using the same review flow as the conversation.
6. Ask a clear question when no task is named or more than one task could match. Keep pronoun context only after a reply about one identified task; a board-wide or unsupported reply clears that context. When one task, status, and owner are all clear, prepare both changes in one preview.
7. Show each affected task’s code, readable title, and before-and-after value before any single, bulk, reset, or undo change. Replacement reviews cover task code, title, project, status, owner, due date, priority, blocker, and record addition or removal. Require confirm or cancel.
8. Keep saved state in local browser storage; warn without overwriting incompatible storage; reset only after confirmation; provide a reviewed undo only when visible task values changed. Accept at most 50 saved tasks, with bounded identity and display fields, so the local review remains usable.
9. Work with keyboard controls and a narrow mobile viewport.
10. Require a nonblank blocker reason before offering **Blocked** as a new status. A task that already carries a blocker reason may leave and later return to Blocked because the reason remains visible in its record.
11. Clear single-task conversational context when the transcript is cleared or a reset/undo replaces the board. Replacement previews list only records or fields that will change; if no visible values differ, the review says why confirmation may still matter for incompatible saved data.
12. Apply the same Blocked eligibility rule in conversation interpretation, direct controls, and defensive action handling. A disabled selector must not be the only enforcement point.
13. State the number of affected tasks in every nonempty review and label each value as **Before** or **After**. Associate the dialog description, scope, and local-data boundary with the dialog for assistive technology.
14. Let a person edit a blocker reason on a task card within the same review flow. Trim a confirmed reason; allow removing it only when the task is not Blocked. A reason on an In progress task remains visible as recorded context, without claiming that the task is currently blocked. The guide directs reason-editing language to this explicit control rather than pretending to parse the proposed reason.

## Non-goals

This sample has no authentication, Asana or other task-system integration, API, external model, paid service, live customer data, analytics, notifications, permission system, or production claim.

## Saved-board review limits

| Saved element | Accepted boundary | Product reason |
|---|---:|---|
| Tasks | 1–50 records | Keeps a single replacement review inspectable in this card-based sample. |
| Task code | 1–40 characters | Preserves a stable readable identifier without accepting an unbounded label. |
| Title | 1–160 characters | Supports descriptive work while keeping task cards and previews usable. |
| Project | 1–80 characters | Keeps grouping context readable in the current layout. |
| Blocker reason | 1–500 characters when present | Allows actionable context while bounding restored browser content. |
| One assistant request | 1–500 characters | Keeps target and intent reviewable in one proposal. |
| Local transcript | Most recent 40 messages | Bounds the in-tab conversation while retaining recent context; task data is unaffected. |

Status, owner, and priority must match the visible supported vocabularies, and due dates must be real calendar dates in `YYYY-MM-DD` form. These are prototype review limits rather than claims about Asana or a production workspace. A future larger workspace would require search, pagination, permissions, and a different bulk-review design before these limits could be raised responsibly.

## Acceptance criteria

Every supplied capability example works as written. A read request does not open a change preview. A negated change does not prepare an opposite update. A change never applies before confirmation, including bulk, reset, and undo. Task-title replies lead with readable titles; change previews pair those titles with stable task codes. A pronoun can reuse the immediately established single-task context, but an intervening board-wide answer expires it. Saved state survives reload when storage is available, and an invalid saved state does not crash or get overwritten without a confirmed reset.

A request to mark NTH-104 Blocked is rejected because that fixture has no blocker reason; the direct selector communicates the same constraint. Entering a reason such as “Waiting on legal approval” creates a Before/After preview; only after confirmation does Blocked become available. Cancelling keeps the prior reason and status, and reviewed Undo can restore the prior reason. Clearing chat or confirming a board replacement makes a later “Mark that done” ask for a task again. Resetting an unchanged valid board shows no task-difference rows and creates no Undo control, while still explaining that a confirmed reset is the explicit recovery action for incompatible saved data. A saved board with a renamed task, changed due date, added record, or missing fixture record exposes each of those differences before reset.

## Concrete Northstar acceptance examples

In the fictional Northstar board, “Mark Finalize onboarding checklist as done” prepares a preview for NTH-104 that names the task and shows **In progress → Complete**. Confirm applies that task update; Cancel leaves the task unchanged. “Assign Review trial nurture copy to Jon Bell” similarly previews **Priya Shah → Jon Bell** before confirmation. “Complete all tasks in review” must show every affected readable task before it can proceed. A request for blockers or a due date answers from the visible local data and opens no change preview.

When a request could name more than one task, the workspace asks the person to identify one task or code instead of selecting a guess. “Do not mark this done” creates no update. Direct Status and Owner controls use the same proposal path as conversation. Reset and Undo each show their own before-and-after preview and require confirmation because they modify task state. **Clear chat** only removes local conversation messages; it does not update, reset, undo, or otherwise change any task and therefore is outside the task-change confirmation contract. These examples are prototype acceptance behavior for fictional data, not a claim about a connected Asana product.

## State-boundary contract

The sample keeps three kinds of state deliberately separate. A conversation message is transient context; **Clear chat** may remove it without changing a task or closing an already prepared proposal. A proposal is a review surface: it names the records and values that would change, but it leaves task data untouched until **Confirm change**. A confirmed task update is local browser state and can be recovered only through its own reviewed Undo or Reset proposal. This distinction applies equally to a conversational request and a direct selector, so NTH-104, NTH-112, and NTH-115 have one understandable action boundary rather than competing interaction rules.
