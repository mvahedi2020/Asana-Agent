# Asana Agent

**[Try the live sample](https://mvahedi2020.github.io/Asana-Agent/)** · [Watch the workflow](docs/media/workflow.webm) · [Read the case study](docs/product/Case_Study.md)

![A fictional Northstar workspace with task cards beside a plain-English conversation](docs/media/screenshot.png)

Asana Agent is an independent product sample for a calmer way to understand and update work. A fictional product lead can ask about tasks in everyday language, then review a clear before-and-after preview before a change is made. It is not affiliated with Asana.

## What you can try

The sample understands these requests without requiring a task code:

- “What is blocked?”
- “When is Validate admin invite flow due?”
- “Mark Finalize onboarding checklist as done.”
- “Assign Review trial nurture copy to Jon Bell.”
- “Complete all tasks in review.”

It also understands common status words such as **done**, **in progress**, and **reopen**, and first names such as “Maya” when assigning work. After a clear task is discussed, a follow-up such as “mark that done” works too. If more than one task could match, the guide asks which one you mean. It can explain due dates, but due-date changes are outside this sample. It never applies a change before you confirm it.

The task cards also have direct Status and Owner menus. These do not change data immediately: they open the same review step as the conversation. Confirm, cancel, reset, bulk changes, and undo are all previewed. Confirmed sample changes persist in the browser and the latest one can be undone.

## What this is and is not

Northstar, its people, dates, tasks, and results are fictional. The assistant uses a small local sample dataset and deterministic request handling. There is no login, Asana connection, API, paid service, external AI call, customer data, research result, or production claim. Browser storage is local to the device and may be unavailable; the sample makes this visible and offers a reviewed reset.

## My role

I owned the product problem, target user, scope, task flows, sample content, safety rules, acceptance criteria, and evaluation plan. AI assisted the implementation. This portfolio prototype should be reviewed as a product sample, not as proof of production software ownership or business impact.

## Product documentation

- [Case study](docs/product/Case_Study.md)
- [Product requirements](docs/product/PRD.md)
- [Validation plan](docs/product/Validation.md)
- [AI evaluation approach](docs/product/AI_Evaluation.md)
- [Proposed measures and guardrails](docs/product/Measures.md)
- [GTM strategy](docs/product/GTM_Strategy.md)
- [Sprint backlog](docs/product/Sprint_Backlog.md)
- [Contributing and local setup](CONTRIBUTING.md)

Licensed under the [MIT License](LICENSE).
