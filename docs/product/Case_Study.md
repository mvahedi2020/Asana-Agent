# Case Study: Conversational task operations

## Context

Northstar is a fictional B2B SaaS company. Product and delivery teams need a compact view of current work, while natural-language interfaces can make routine retrieval and updates faster to express.

## Product question

How might a conversational assistant reduce coordination friction without obscuring the records it reads or the changes it makes?

## Prototype response

The demo keeps the board and assistant together. Responses reference visible task IDs and recalculate from the current sample state. Five read intents are supported. Mutation requests are converted into a reviewable change, and every single or bulk write requires explicit confirmation. The last confirmed write can be undone.

## Deliberate limits

The prototype is deterministic and local. It does not connect to Asana, use an LLM, authenticate users, or represent production readiness. The people, tasks, organization, dates, and copy are fictional. No user study or outcome is claimed.

## Ownership and implementation

PM ownership includes the problem framing, intended user, scope, task flows, safety requirements, sample dataset, acceptance criteria, and evaluation plan. Antigravity/AI assisted with software implementation. The prototype requires human review before any production use.
