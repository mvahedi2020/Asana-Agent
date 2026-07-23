# Sprint Backlog: Asana Agent

## Sprint Goal
Deliver the core natural language querying capability, allowing users to ask basic questions about their Asana workspace and receive accurate, sub-2-second responses.

## Current Sprint (Sprint 4)

### 1. [Feature] NLQ Parsing Engine (5 Story Points)
**Description:** Implement the initial LLM prompt chain to parse user queries (e.g., "What is due today?") into structured JSON intents that map to Asana API parameters.
**Acceptance Criteria:**
- Successfully maps "due today" to `due_on=today`.
- Successfully extracts project names and maps them to Asana `project_gid`.
- Passes the core unit test suite for 50 common PM queries.
**Assignee:** Marcus T. (Backend)

### 2. [Integration] Asana Graph Fetcher (3 Story Points)
**Description:** Build the caching layer for fetching Asana tasks based on the parsed intents.
**Acceptance Criteria:**
- Implements exponential backoff for rate limits.
- Caches non-volatile data (e.g., project names, user IDs) using Redis for 15 minutes.
**Assignee:** Elena R. (Fullstack)

### 3. [UX/UI] Chat Interface Polish (3 Story Points)
**Description:** Finalize the "typing indicator" animation and ensure auto-scroll behavior works flawlessly on mobile Safari.
**Acceptance Criteria:**
- Typing indicator renders smoothly at 60fps.
- Chat automatically scrolls to the newest message upon receiving a response.
- Input field autofocuses on desktop, but respects mobile keyboard lifecycle.
**Assignee:** Sarah J. (Frontend)

### 4. [Bug] Token Expiry Handling (2 Story Points)
**Description:** If the Asana OAuth token expires mid-session, the app throws a 500 error instead of gracefully prompting for re-authentication.
**Acceptance Criteria:**
- Catch 401 Unauthorized errors from Asana.
- Render a "Session Expired" UI state with a "Reconnect" button.
**Assignee:** David L. (DevOps/Sec)

## Backlog (Next Sprint)
- [Feature] Implement bulk-update actions (e.g., "Assign all these tasks to me").
- [Design] Dark mode toggle in Settings.
- [Analytics] Plumb PostHog events for `query_submitted` and `action_executed`.
