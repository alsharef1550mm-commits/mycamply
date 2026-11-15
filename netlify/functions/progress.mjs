import { getStore } from "@netlify/blobs";
import { createHandler } from "../../lib/progress-handler.mjs";

export { validState, createHandler } from "../../lib/progress-handler.mjs";

export default createHandler(() =>
  getStore({ name: "mycamply-progress-v2", consistency: "strong" }),
);
// netlify.toml rewrites /api/progress to this function's default endpoint.
// A custom config.path disables that endpoint and would make the rewrite 404.
