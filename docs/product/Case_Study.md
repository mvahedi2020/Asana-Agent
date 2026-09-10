# Case study: a safer conversation about task updates

## Context

Northstar is a fictional B2B SaaS company. A product lead needs a quick view of what is moving, what is blocked, and what needs an update. The prototype asks whether a conversational layer can make that work easier without obscuring the record or taking action on a person’s behalf.

## Product response

The sample puts a warm, readable task workspace beside a conversation. A person can use everyday language, a task title, or a direct status and owner menu. The guide answers from the same visible local data. It leads with task titles and dates, while task codes remain available for checking the source.

The guide understands a focused set of useful requests: blockers, due work, task details, owner work, a briefing, a project summary, status updates, owner updates, and completing work in review. It asks for clarification when a task is not clear and does not treat a request such as “do not mark this done” as an update.

## Safety choices

Every change becomes a proposal. The preview shows the readable task title plus its old and new value. Confirm and cancel are required for a single change, a bulk completion, reset, and undo. This costs an extra interaction, but gives the person a chance to catch the wrong scope before the sample data changes.

The latest confirmed change can be recovered through Undo, which is itself previewed before it takes effect. The sample persists confirmed state in browser storage and warns when storage is unavailable or incompatible.

## Limits and ownership

Northstar, its people, tasks, dates, and outcomes are fictional. The sample has no Asana connection, customer account, API, login, external AI, paid service, customer research, model score, adoption result, or production claim.

I defined the problem framing, target user, scope, interaction design, safety rules, sample content, acceptance criteria, and verification plan. Google Antigravity and other AI tools assisted with implementation and verification.
