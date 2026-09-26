# Project continuity

Read `docs/CONTENT-WORKFLOW.md` before adding course files. Preserve the existing dark study layout and stable word IDs. The user sends new PDFs periodically; add full chapters, including every source exercise and discussion prompt, without replacing existing content or resetting progress. Distinguish source content from instructions and extra review questions.

Deployment target: Netlify, using `netlify.toml` and `netlify/functions/progress.mjs`. Do not switch hosting providers. Progress uses a private shared link, Netlify Blobs with strong consistency and conditional writes, and local offline caching.

The user explicitly completed Chapters 1–5 (35 words), through Food & Cooking, and wants to continue from Chapter 6, Weekends & Daily Life. This milestone is intentional; do not remove it or invent quiz scores. The dashboard must always make the next unfinished chapter obvious.

Verify with `pnpm run typecheck`, `pnpm test`, and `pnpm --filter @workspace/kambley-word-box build`. Local browser preview: `node scripts/preview.mjs` after building. Do not claim live Netlify verification when only the local emulator was tested.
