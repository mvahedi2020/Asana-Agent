# Product Requirements Document

## Problem and user

A product lead coordinating a small cross-functional team needs quick answers about current work and a safer way to express routine updates. Switching between a task table and a separate assistant makes grounding hard to inspect.

## Goal

Demonstrate a transparent local assistant that reads and updates the same visible sample task state.

## Requirements

1. Show realistic fictional tasks with project, status, owner, due date, priority, and blocker context.
2. Answer assigned-work, due-date, blocker, briefing, and portfolio-summary questions deterministically from current state.
3. Prepare status and assignee changes from the board or supported text commands.
4. Preview every single and bulk mutation; require confirm or cancel; support undo.
5. Keep a pending change visible if conversation history is cleared.
6. Render user text safely as text and state capability limits honestly.
7. Persist state locally with a versioned key, display a storage warning, and offer reset.
8. Provide hash navigation, keyboard-operable controls, empty states, and responsive layouts.

## Non-goals

Authentication, Asana/API integration, generative AI, autonomous execution, notifications, analytics, and production claims are out of scope.

## Acceptance criteria

All quality scripts pass; answers change when task data changes; no mutation occurs before confirmation; Escape and Cancel dismiss a pending preview; clearing chat preserves it; reset restores the seed data.
