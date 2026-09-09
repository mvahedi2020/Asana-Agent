# Validation plan

## Product workflow coverage

The automated checks cover plain-language status changes by title, status words inside task titles, assignment by title and owner name, a grounded “mark that done” follow-up, missing-task clarification, ambiguous-title clarification, read-only blocker requests, negated requests, an unambiguous combined status-and-owner preview, cancellation that leaves both fields unchanged, atomic confirmation, atomic undo, bulk completion, direct selectors, reload persistence, unavailable or invalid storage recovery, keyboard controls, and a 390 px mobile viewport without horizontal page overflow.

The browser review checks that the page loads with meaningful content, key controls are visible, no framework error overlay appears, and the interaction paths render their confirmation preview. Recorded workflow and screenshots are retained in `docs/media` when the capture run is requested.

A current Lighthouse run against the production preview scored 100 for performance and 100 for accessibility. The saved report is `docs/media/browser-results.json`. This is a local technical check, not a usability study.

## What this evidence means

These are deterministic software checks against fictional local data. They show that the described sample flows work in the tested browser; they do not measure language-model quality, customer demand, business impact, or human usability.

## What needs human evidence

A next step would be moderated sessions with product or delivery leads. Ask participants to find a blocker, ask for a due date, prepare and cancel an owner update, confirm a status change, and recover it. Observe whether people understand the sample boundary, recognize the preview, and know what will happen before confirmation. Redesign if people believe an unsupported request succeeded or cannot identify the task that will change.
