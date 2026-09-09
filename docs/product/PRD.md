# Product requirements: conversational task workspace

## Problem and goal

A product or delivery lead needs to understand current work and prepare routine updates without translating every intent into a specialist interface. The goal is a transparent, local sample where the conversation and visible task records stay in sync.

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
