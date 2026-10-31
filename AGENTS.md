# Project continuity

All website UI, course descriptions, prompts, metadata, and date formatting must be English-only. Do not add Arabic translations or bilingual buttons. Preserve learner-entered content and saved progress.

Read `docs/CONTENT-WORKFLOW.md` before adding course files. Preserve the existing dark study layout and stable word IDs. The user sends new PDFs periodically; add full chapters, including every source exercise and discussion prompt, without replacing existing content or resetting progress. Distinguish source content from instructions and extra review questions.

Deployment target: Netlify, using `netlify.toml` and `netlify/functions/progress.mjs`. Do not switch hosting providers. Progress uses a private shared link, Netlify Blobs with strong consistency and conditional writes, and local offline caching.

The user's latest instruction (2026-09-27) supersedes the old Chapter 6 milestone: start with zero progress, as a first-time user, and let them earn all completion themselves. The dashboard starts at Chapter 1 and always shows the next unfinished chapter. Progress v2 intentionally excludes the former seeded local/cloud data; preserve v2 for future releases and do not seed completed words or quiz scores.

Verify with `pnpm run typecheck`, `pnpm test`, and `pnpm --filter @workspace/kambley-word-box build`. Local browser preview: `node scripts/preview.mjs` after building. Do not claim live Netlify verification when only the local emulator was tested.

Latest UI direction (2026-10-31): Home contains all chapters and their vocabulary; prioritize Random Review. Do not recreate Study plan, With my teacher, or separate PDF-specific pages. New files should enrich vocabulary chapters and word-related discussion, not grammar lessons or homework pages. Keep source archives for provenance. Random Review must stay within the selected chapters, draw 15 distinct words per round (or all available if fewer), mix discussion and blanks, support skipping, and rotate question alternatives before reuse. Review practice must not automatically complete chapters.

The user explicitly withdrew the public-progress redesign on 2026-10-31 after understanding the existing private link. Keep the existing v2 cloud storage and private #box link unchanged. The same private link shares the learner's record with a teacher and permits editing; the bare site URL is a different record. Never publish private box tokens, seed the user's reported completion, or replace their existing record.
