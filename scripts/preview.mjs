// Local verification with Netlify's real Blobs emulator. Never uses production data.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { localStore } from "./local-blobs-store.mjs";
import { BlobsServer } from "@netlify/blobs/server";
import { createHandler } from "../netlify/functions/progress.mjs";
const blobs = new BlobsServer({
  directory: path.resolve(".local/preview-blobs"),
  token: "local-preview-only",
});
const address = await blobs.start();
const handler = createHandler(() =>
  localStore({
    name: "preview",
    siteID: "local",
    token: "local-preview-only",
    apiURL: `http://localhost:${address.port}`,
    consistency: "strong",
  }),
);
const root = path.resolve("artifacts/kambley-word-box/dist/public");
createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/api/progress") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const result = await handler(
        new Request("http://localhost/api/progress", {
          method: req.method,
          headers: req.headers,
          body: req.method === "PUT" ? Buffer.concat(chunks) : undefined,
        }),
      );
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(await result.text());
      return;
    }
    const file = path.resolve(root, "." + decodeURIComponent(pathname));
    if (!file.startsWith(root + path.sep) && file !== root) {
      res.writeHead(403);
      res.end();
      return;
    }
    let data;
    let ext = path.extname(file);
    try {
      data = await readFile(file);
    } catch {
      data = await readFile(path.join(root, "index.html"));
      ext = ".html";
    }
    res.setHeader(
      "Content-Type",
      {
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".html": "text/html",
      }[ext] || "application/octet-stream",
    );
    res.end(data);
  } catch {
    res.writeHead(500);
    res.end("Preview error");
  }
}).listen(5173, "127.0.0.1", () =>
  console.log("Local preview: http://127.0.0.1:5173"),
);
