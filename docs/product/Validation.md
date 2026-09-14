# Validation plan

## Product workflow coverage

The automated checks cover plain-language status changes by title, status words inside task titles, assignment by title and owner name, a grounded “mark that done” follow-up, missing-task clarification, ambiguous-title clarification, read-only blocker requests, negated requests, an unambiguous combined status-and-owner preview, cancellation that leaves both fields unchanged, atomic confirmation, atomic undo, bulk completion, direct selectors, reload persistence, unavailable or invalid storage recovery, keyboard controls, and a 390 px mobile viewport without horizontal page overflow.

The browser review checks that the page loads with meaningful content, key controls are visible, no framework error overlay appears, and the interaction paths render their confirmation preview. Recorded workflow and screenshots are retained in `docs/media` when the capture run is requested.

A current Lighthouse run against the production preview scored 100 for performance and 100 for accessibility. The saved report is `docs/media/browser-results.json`. This is a local technical check, not a usability study.

## What this evidence means

These are deterministic software checks against fictional local data. They show that the described sample flows work in the tested browser; they do not measure language-model quality, customer demand, business impact, or human usability.

## What needs human evidence

A next step would be moderated sessions with product or delivery leads. Ask participants to find a blocker, ask for a due date, prepare and cancel an owner update, confirm a status change, and recover it. Observe whether people understand the sample boundary, recognize the preview, and know what will happen before confirmation. Redesign if people believe an unsupported request succeeded or cannot identify the task that will change.

## Proposed five-participant scoring protocol

No participant research has been conducted. A next study would recruit five consenting product, delivery, or program leads who use a structured task system weekly. In a 30-minute session with fictional Northstar tasks, each person finds a blocker, asks when NTH-115 is due, prepares and cancels an owner update, confirms NTH-104 as complete, and uses reviewed Undo. The moderator asks “What will happen if you continue?” before each preview and does not describe the intended safety behavior in advance.

Score each session 0–2 for task identification (names the affected task), scope comprehension (states the before-and-after values), action boundary (distinguishes proposal from confirmed change), recovery (can cancel and use Undo), and local-boundary clarity (does not infer a live Asana or AI connection). For every dimension, 0 means incorrect or unable, 1 means partly correct or completed only after moderator help, and 2 means complete independently. Record moderator help separately; neutral task instructions do not count as help. A proposed unassisted success is at least 8/10, has no action-boundary error, and requires no help identifying the task or completing the requested task flow in four of five sessions. This supplemental comprehension score does not replace any published measure or acceptance criterion. Any critical action-boundary misunderstanding pauses language expansion, bulk behavior, or integration work until the flow is reviewed and retested. Repeated lesser confusion also identifies an explanation to revise.

For comparable sessions, alternate the order of the current-method and prototype tasks across the five participants. Use the same fictional task routine and time box in each condition. The unassisted denominator is all five participants. Keep an assisted denominator only for attempts where the moderator identifies a task, explains a preview, or directs a recovery action; a neutral restatement of the task is not assistance.

Use these scoring anchors. Task identification earns 2 when the participant independently names the affected task using the visible board or preview, 1 when the answer is partial or requires moderator help, and 0 when they name another task or cannot tell. Reading the preview is normal task behavior and is not assistance. Scope comprehension earns 2 when they state both before and after values, 1 when they name one value or need help, and 0 when they cannot describe the transition. Action boundary earns 2 when they say that confirmation applies the change, 1 when they notice a review step but are unsure when state changes, and 0 when they believe the request already changed the task. Recovery earns 2 for independent Cancel and reviewed Undo, 1 with help or one path only, and 0 if they cannot recover. Local-boundary clarity earns 2 when they identify the fictional local sample, 1 when they are unsure about one boundary, and 0 when they infer a live Asana or AI connection.

The technical checks above remain historical software results: they confirm deterministic behavior in the stated environment. They do not supply usability scores, customer demand, model quality, adoption, retention, or business results.
