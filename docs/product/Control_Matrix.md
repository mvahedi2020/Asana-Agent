# Control matrix

This matrix describes every visible interactive control in the fictional local sample. No control connects to Asana, a customer workspace, an account, an API, or an external AI service.

| Control | What it does | Safety and recovery | Verified by |
|---|---|---|---|
| Asana Agent logo | Returns to the workspace | Does not change tasks | Browser navigation and visual review |
| Workspace navigation | Opens the task workspace | Does not change tasks | Browser navigation and desktop review |
| Weekly view navigation | Opens the local weekly summary | Summary reads the current local task state | Browser navigation and desktop review |
| About this sample navigation | Opens the product explanation | Does not change tasks | Browser navigation and desktop review |
| Reset sample | Prepares restoration of the original fictional task set | Shows every task’s before-and-after values; requires Confirm or Cancel | Recovery browser test |
| Undo last change | Prepares restoration of the immediately previous confirmed state | Shows every affected task’s before-and-after values; requires Confirm or Cancel | Direct-control browser test |
| Status menu on each task | Prepares the selected status for that named task | Never updates immediately; preview shows readable title, old status, and new status | Direct-control browser test and keyboard check |
| Owner menu on each task | Prepares the selected owner for that named task | Never updates immediately; preview shows readable title, old owner, and new owner | Direct-control browser test and keyboard check |
| Complete tasks in review | Prepares completion for all current in-review tasks | Preview lists every affected task; disabled when no task is in review | Bulk browser test |
| Example request chips | Sends the visible example phrase to the workspace guide | Read requests remain read-only; change requests open the same review step | Browser workflows |
| Clear chat | Clears conversation messages | Does not clear tasks or an open preview; available both in the guide and the review dialog | Clear-chat browser test |
| Conversation field and Send | Sends an ordinary-language request | The guide asks for a missing or ambiguous target, declines negated changes, and never changes a task before confirmation | Unit and browser workflows |
| Confirm change | Applies the displayed single, bulk, reset, or undo proposal to local browser storage | Adds an Undo option after a confirmed change | Confirmation, persistence, and recovery browser tests |
| Cancel and Escape | Dismisses an open proposal | Leaves the task data unchanged and returns focus to the prior control | Cancellation and keyboard browser tests |
| Discuss this briefing | Adds a weekly briefing to the conversation and returns to Workspace | Does not change tasks | Briefing navigation behavior |
| How this sample works | Opens the local sample explanation | Does not change tasks | Browser navigation and visual review |

## Conversation boundaries

The guide supports readable task titles or task codes, the visible owner names and first names, common status words, blockers, due dates, task lists, briefings, summaries, and the visible bulk action. It can use a previously clear task for “it” or “that.” If more than one task could match or no task is named, it asks a plain-language follow-up instead of choosing a task. A clear status-and-owner request for one task stays together in one reviewable preview, so no requested field is dropped.

Due-date updates, external workspaces, and unsupported requests are plainly declined. Read-only questions do not open a confirmation dialog.
