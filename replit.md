# صندوق كلماتي في كامبلي

تطبيق تعلم مفردات إنجليزية يحول محتوى Everyday English Vocabulary & Speaking إلى دروس تفاعلية ومراجعة وكتابة مع حفظ التقدم على الجهاز.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/kambley-word-box/src/App.tsx` — shell, routes, learning flows, quiz, review, writing, progress, and import UI.
- `artifacts/kambley-word-box/src/content.ts` — the 10 Chapters and 70 seed words extracted from the supplied course PDF.
- `artifacts/kambley-word-box/src/index.css` — dark RTL study interface theme and responsive layout.

## Architecture decisions

- The first version is frontend-only and stores study progress, quiz results, saved sentences, and imported file metadata in localStorage.
- Seed content mirrors the supplied course structure: ten Chapters with seven words each, simple definitions, examples, and generated chapter checks.
- The interface is English-first with LTR layout, while keeping the learning content and examples in clear English contexts.

## Product

- Dashboard with 10-chapter map and progress totals.
- Sequential word learning that requires viewing the example before moving on.
- Locked chapter quizzes with feedback and score.
- Random review and sentence writing with explicit hint cancellation.
- Progress view and a file-intake page ready for future course additions.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
