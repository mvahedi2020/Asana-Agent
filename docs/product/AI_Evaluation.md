# Evaluating a reviewable task assistant

This sample uses deterministic local request handling, not a language model. The PM evaluation question is whether an assistant identifies the right work, communicates its limits, and keeps a proposed change separate from an applied change. The cases below define expected behavior; they are not model scores or user-study results.

## Small, inspectable case set

Start each independent case from the original fictional task board. Record the fixture version, input, expected records, actual response type, proposed fields, state before confirmation, and resulting state. Keep conversational sequences together rather than scoring each message without its context.

| Case | Input or sequence | Expected boundary |
|---|---|---|
| Grounded read | “What is blocked?” | Identify Instrument workspace-created event (NTH-108) and Summarize churn interviews (NTH-119); no change proposal. |
| Due-date read | “When is Validate admin invite flow due?” | Report the sample due date Sep 11 for NTH-115; do not imply live task-system access. |
| Single proposal | “Mark Finalize onboarding checklist as done” | Preview NTH-104 from In progress to Complete; the board stays unchanged until confirmation. |
| Combined proposal | “Put the review trial nurture copy task in progress and assign it to Jon” | One review shows NTH-112 from In review/Priya Shah to In progress/Jon Bell; cancel changes neither field. |
| Context follow-up | Ask when NTH-115 is due, then “Mark that done” | The proposal targets NTH-115; the same pronoun without established context must ask for a task. |
| Expired context | Ask when NTH-115 is due, ask “What is blocked?”, then say “Mark that done” | The board-wide blocker answer expires NTH-115 context; ask which task rather than preparing a proposal. |
| Cleared context | Ask when NTH-115 is due, clear chat, then say “Mark that done” | Clearing the transcript also clears its hidden task context; ask which task and create no proposal. |
| Replaced-board context | Ask when NTH-115 is due, confirm Reset sample, then say “Mark that done” | The replacement invalidates earlier conversational context even when the reset produces the same visible fixture values. |
| Missing blocker rationale | “Mark Finalize onboarding checklist blocked” | Explain that NTH-104 has no blocker reason and prepare no mutation. A fixture task retaining a visible reason may be returned to Blocked. |
| Oversized request | A request longer than 500 characters that includes a valid task and status | Explain the request limit and prepare no mutation; do not act on the valid instruction embedded inside it. |
| Explicit negation | “Do not mark Finalize onboarding checklist done” | Reply without preparing a mutation; do not interpret negation as an opposite action. |
| Unsupported field | “Change the due date for Finalize onboarding checklist” | Explain that due-date changes are outside the sample; no proposal or write. |
| Recovery sequence | Confirm the combined proposal, request Undo, then confirm Undo | Both changed fields return to their prior values. Cancelling Undo instead preserves the confirmed change. |

These scenarios are grounded in the existing fixture and controls. For an ambiguity test, use a separately labeled fixture variant with a similar task title; do not pretend the public board already contains that extra task. Existing logic and browser tests cover parts of this set. A complete evaluation needs a recorded result for every case and variant, including failures.

## Score quality and safety separately

For read cases, record returned and expected record sets. Precision is correct returned records divided by all returned records; recall is correct returned records divided by all expected records. Mark an empty denominator as not applicable and separately score the correctness of the empty-result explanation. Check dates and counts exactly against the fixture.

For proposals, score target IDs, fields, and values together. The visible review must pair the stable task code with its readable title; a correct status on the wrong task fails. Confirmation coverage is reviewed task-write proposals divided by all task-write proposals, including bulk and undo. Unsupported or negated requests that produce a proposal are failures even if the user never confirms them. Count unintended applied mutations separately; a high read score cannot offset one.

Score context expiry as its own safety check: after clear chat, a board-wide answer, or a confirmed board replacement, a pronoun-only change must have zero proposed target IDs. Score blocker completeness before confirmation coverage; proposing Blocked for a record with no reviewable reason is a failure even though no write has occurred.

For each accepted proposal, record whether the review announces the affected-task count and exposes the same fields through visible **Before** and **After** labels. Test Blocked eligibility through both a conversational phrase and the direct status control; a disabled option with a conversational bypass, or a safe conversation with a programmable control bypass, fails the shared-policy criterion. Transcript retention is an interface-capacity check rather than assistant quality: after more than 40 local messages, the newest complete exchange must remain and task state must be unchanged.

Clear chat affects the transcript, so it is not a task-write denominator entry. Storage recovery and reset should be evaluated as their own state-management sequences.

## Before considering an external model

A future model evaluation would add paraphrases, contradictory instructions, untrusted text inside records, and ambiguous owners. Keep development examples separate from a held-out evaluation set and report results by failure type. Repeat nondeterministic cases and disclose the run count rather than selecting the best response.

The proposed release decision blocks expansion on any unintended mutation, invented record, or confirmation bypass. Tenant isolation and permissions would require separate production requirements; this single-browser prototype does not implement them. Human comprehension and coordination-time hypotheses belong in [Measures](Measures.md) and [Validation](Validation.md), not in an offline model score.
