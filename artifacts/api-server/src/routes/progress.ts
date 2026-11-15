import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import {
  createHandler,
  validState,
  type ProgressStore,
} from "../../../../lib/progress-handler.mjs";

const router: IRouter = Router();

function openStore(): ProgressStore {
  return {
    async getWithMetadata(key) {
      const result = await pool.query(
        "SELECT state, revision FROM mycamply_progress_v2 WHERE key_hash = $1",
        [key],
      );
      const row = result.rows[0] as
        | { state: unknown; revision: string }
        | undefined;
      return row ? { data: row.state, etag: row.revision } : null;
    },
    async setJSON(key, state, condition) {
      const revision = randomUUID();
      if (condition.onlyIfNew) {
        const result = await pool.query(
          `INSERT INTO mycamply_progress_v2 (key_hash, state, revision)
           VALUES ($1, $2::jsonb, $3)
           ON CONFLICT (key_hash) DO NOTHING
           RETURNING revision`,
          [key, JSON.stringify(state), revision],
        );
        const row = result.rows[0] as { revision: string } | undefined;
        return row
          ? { modified: true, etag: row.revision }
          : { modified: false };
      }
      if (condition.onlyIfMatch) {
        const result = await pool.query(
          `UPDATE mycamply_progress_v2
           SET state = $2::jsonb, revision = $3, updated_at = now()
           WHERE key_hash = $1 AND revision = $4
           RETURNING revision`,
          [key, JSON.stringify(state), revision, condition.onlyIfMatch],
        );
        const row = result.rows[0] as { revision: string } | undefined;
        return row
          ? { modified: true, etag: row.revision }
          : { modified: false };
      }
      return { modified: false };
    },
  };
}

const legacyUrl =
  process.env.MYCAMPly_LEGACY_API_URL ??
  "https://mycamply.netlify.app/api/progress";

const handler = createHandler(openStore, async ({ key, token, store }) => {
  const response = await fetch(legacyUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Progress-Version": "2",
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok)
    throw new Error(`Legacy progress source returned ${response.status}.`);
  const legacy = (await response.json()) as {
    state?: unknown;
    revision?: unknown;
  };
  // A null revision means the private key has no saved Netlify record.
  if (legacy.revision === null) return null;
  if (typeof legacy.revision !== "string" || !validState(legacy.state))
    throw new Error("Legacy progress record was invalid.");
  // Use the new store's own revision; the Netlify ETag is not transferable.
  await store.setJSON(key, legacy.state, { onlyIfNew: true });
  return store.getWithMetadata(key, { type: "json" });
});

router.all("/progress", async (req, res, next) => {
  try {
    const headers = new Headers();
    for (const name of ["authorization", "x-progress-version"]) {
      const value = req.get(name);
      if (value) headers.set(name, value);
    }
    const body = req.method === "PUT" ? JSON.stringify(req.body) : undefined;
    const request = new Request("http://mycamply.local/api/progress", {
      method: req.method,
      headers,
      body,
    });
    const response = await handler(request);
    response.headers.forEach((value, name) => res.setHeader(name, value));
    res.status(response.status).send(await response.text());
  } catch (error) {
    next(error);
  }
});

export default router;
