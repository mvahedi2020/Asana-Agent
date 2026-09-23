# Control matrix

This matrix describes every visible interactive control in the fictional local sample. No control connects to Asana, a customer workspace, an account, an API, or an external AI service.

| Control | What it does | Safety and recovery | Verified by |
|---|---|---|---|
| Asana Agent logo | Returns to the workspace | Does not change tasks | Browser navigation and visual review |
| Workspace navigation | Opens the task workspace | Does not change tasks | Browser navigation and desktop review |
| Weekly view navigation | Opens the local weekly summary | Summary reads the current local task state | Browser navigation and desktop review |
| About this sample navigation | Opens the product explanation | Does not change tasks | Browser navigation and desktop review |
| Reset sample | Prepares restoration of the original fictional task set | Shows changed fields plus added or removed records; requires Confirm or Cancel; preserves incompatible raw storage until confirmation | Recovery browser tests |
| Undo last change | Prepares restoration of the immediately previous confirmed state | Shows only affected records and fields; requires Confirm or Cancel; is not created for an unchanged replacement | Direct-control and unchanged-reset browser tests |
| Status menu on each task | Prepares the selected status for that named task | Never updates immediately; Blocked is available only after a nonblank blocker reason is confirmed; preview shows readable title and old/new status | Direct-control and blocker-reason browser tests |
| Owner menu on each task | Prepares the selected owner for that named task | Never updates immediately; preview shows readable title, old owner, and new owner | Direct-control browser test and keyboard check |
| Blocker reason field and Review reason | Prepares a reason change for the named task | Shows old/new reason before confirmation; blank removal is blocked while status is Blocked; a draft alone cannot enable Blocked | Blocker-reason unit and browser tests |
| Complete tasks in review | Prepares completion for all current in-review tasks | Preview lists every affected task; disabled when no task is in review | Bulk browser test |
| Example request chips | Sends the visible example phrase to the workspace guide | Read requests remain read-only; change requests open the same review step | Browser workflows |
| Clear chat | Clears conversation messages | Does not clear tasks or an open preview; available both in the guide and the review dialog | Clear-chat browser test |
| Conversation field and Send | Sends an ordinary-language request | The guide asks for a missing or ambiguous target, declines negated changes, and never changes a task before confirmation | Unit and browser workflows |
| Confirm change | Applies the displayed single, bulk, reset, or undo proposal to local browser storage | Adds Undo after a visible change; an unchanged reset reports that no Undo step was created | Confirmation, persistence, and recovery browser tests |
| Cancel and Escape | Dismisses an open proposal | Leaves the task data unchanged and returns focus to the prior control | Cancellation and keyboard browser tests |
| Discuss this briefing | Adds a weekly briefing to the conversation and returns to Workspace | Does not change tasks | Briefing navigation behavior |
| How this sample works | Opens the local sample explanation | Does not change tasks | Browser navigation and visual review |

## Conversation boundaries

The guide supports readable task titles or task codes, the visible owner names and first names, common status words, blockers, due dates, task lists, briefings, summaries, and the visible bulk action. It can use a previously clear task for “it” or “that.” If more than one task could match or no task is named, it asks a plain-language follow-up instead of choosing a task. A clear status-and-owner request for one task stays together in one reviewable preview, so no requested field is dropped.

Due-date updates and external workspaces are plainly declined. A request to edit a blocker reason through chat directs the person to the card's reviewed field; the guide does not infer a reason from conversational wording. Read-only questions do not open a confirmation dialog.

## One review contract across entry points

The conversation and the task-card selectors are different ways to prepare the same kind of task change. For example, either route can prepare NTH-112’s owner change, but neither route writes it before the preview identifies **Review trial nurture copy**, the old owner, and the proposed owner. Blocker reasons use the same confirmation and Undo boundary through an explicit card field. Confirmation creates the local change and the Undo option; Cancel and Escape preserve the task. Clear chat has no role in that sequence because it changes only the transcript. This makes the recovery contract inspectable without implying an Asana integration or shared audit history.

## Saved-board boundary

The app accepts a nonempty local board only when task codes remain unique after trimming and case-folding, every record has a valid date and supported status/owner/priority, Blocked work has a reason, field lengths stay within the documented review bounds, and the board contains no more than 50 tasks. A rejected payload is not silently normalized or overwritten. The visible fixture becomes a recovery surface, and only a confirmed Reset replaces the incompatible browser data.
