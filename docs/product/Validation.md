# Validation Plan

## Observed software verification — September 8, 2026

Node 24/macOS: lint, strict type checks, five logic tests, production build and three repository Playwright tests passed. The additional headless Chrome walkthrough passed scoped queries, cancel/confirm, assignment persistence, bulk preview, clearing chat during preview, undo, unsupported requests, safe text rendering, briefing navigation and reset. Mobile at 390 × 844 had no page overflow; blocked browser storage showed a session-only warning. No page errors were captured. npm audit reported zero vulnerabilities.

The first production Lighthouse run scored 91 performance and 95 accessibility under mobile simulated throttling. Identified contrast and accessible-name issues were then corrected. Actual screenshots and workflow recording are in ../media; complete reports accompany the implementation handoff. These checks are not a language-model benchmark or evidence of human usability.

After removing blocking third-party font requests and correcting accessibility issues, the production-build Lighthouse recheck scored 100 performance and 100 accessibility. The repository's first GitHub verification/deployment run passed; a fresh run accompanies the final baseline.

Independent review added real calendar-date validation and preservation of incompatible saved data until an explicitly confirmed reset. Six unit tests and five repository browser tests now pass, including both recovery regressions. The full live walkthrough also passed before the final baseline update.

## What is validated in the repository

Automated logic tests verify intent routing, data-grounded blocker counts, and targeted mutations. Lint, strict TypeScript checks, and the production build verify code quality and packaging.

## What still needs human evidence

Run five moderated sessions with product or delivery leads using fictional work. Ask participants to find their work, identify a blocker, request a briefing, prepare a single update, and review a bulk update. Measure task success, incorrect assumptions, confirmation comprehension, recovery behavior, and confidence in what will change.

Stop or redesign if participants believe an unsupported action occurred, cannot identify the affected records, or routinely confirm the wrong scope. No participant study has been run for this sample.
