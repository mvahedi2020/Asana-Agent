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

## The tradeoff behind the product question

The product question was deliberately narrow: can a person use plain language for a routine Northstar task update without being uncertain about the record that changes? I chose a constrained deterministic request set and a visible board rather than an open-ended assistant because the product claim depends on inspecting the source task and proposed result. The concrete test is NTH-104: a person can ask to mark the onboarding checklist done, then see **In progress → Complete** before deciding whether to confirm.

That decision adds friction. A confirmation step slows routine work, ambiguity prompts can interrupt conversation, and the sample does not support due-date edits or a real Asana connection. Local storage and reviewed Undo help demonstrate recovery, but they are not a shared audit trail. The current technical checks confirm expected behavior with fictional tasks; they do not measure usability, customer trust, adoption, language-model quality, or business impact.

The next investment is the five-participant [Discovery Plan](Discovery_Plan.md) and [Validation](Validation.md) rubric, not broader automation. It would show whether people identify the affected task, understand the proposal boundary, and recover deliberately. The [product decisions](Product_Decisions.md), [risks](Product_Risks.md), and [prioritized backlog](Sprint_Backlog.md) explain what evidence would justify a next step.
