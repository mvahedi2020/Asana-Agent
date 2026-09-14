# Asana Agent — decision brief

## User and problem

A fictional Northstar product, delivery, or program lead needs a quick way to inspect work and prepare a routine update without losing sight of the task record. The product question is whether everyday-language requests can reduce coordination friction while keeping the affected task and change boundary understandable.

## Product choice

The prototype pairs a constrained local workspace guide with visible task cards. It can answer grounded questions, prepare supported status and owner changes, and use direct controls. Each task, reset, Undo, and bulk update becomes a preview with readable task titles and before-and-after values. NTH-104 makes the choice concrete: “Mark Finalize onboarding checklist as done” prepares **In progress → Complete**; it changes only after confirmation.

## Cost and boundary

Confirmation adds an interaction to routine updates, ambiguity prompts can interrupt a request, and deterministic handling supports a limited phrase set. The sample does not edit due dates or connect to Asana, an API, an external model, or customer data. Browser-local persistence and reviewed recovery demonstrate a boundary, not a shared audit history, permissions, or durable operations.

## Evidence and next investment

Technical checks establish that documented local flows ran; they do not establish human trust, usability, demand, model quality, or business impact. No participant study has occurred. The next investment is a five-participant comparison with each person’s current task workflow. Expand only if participants independently identify the affected task, distinguish a proposal from a confirmed update, and recover a deliberate change without a critical action-boundary error. [The walkthrough](Sample%20Walkthrough.md), [PRD](PRD.md), [decisions](Product_Decisions.md), and [validation plan](Validation.md) make that product case reviewable.

## My role as Product Manager

I defined the problem, prioritization and scope, workflows, fictional sample data, acceptance criteria, and evaluation plan. AI tools assisted with implementation and verification; I do not claim manual authorship of the application code.
