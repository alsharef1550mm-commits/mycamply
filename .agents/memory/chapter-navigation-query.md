---
name: Wouter query navigation
description: Query-string navigation behavior for chapter routes in the learning app
---

For chapter-specific routes, read query parameters from `window.location.search` rather than assuming Wouter's `useLocation()` value includes the query string.

**Why:** The app rendered `/learn?chapter=6` but stayed on Chapter 01 when the query was parsed from the Wouter location value.

**How to apply:** Use `URLSearchParams(window.location.search)` for the chapter and quiz selectors, while continuing to use Wouter for navigation and route changes.