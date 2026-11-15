import express, { type Express } from "express";
import path from "node:path";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
// The static MyCamply app is hosted under /mycamply and calls the API using
// its Vite base URL. Keep the legacy root API mounted for Netlify/local tools.
app.use("/mycamply/api", router);

const webRoot = process.env.MYCAMPly_WEB_ROOT;
if (webRoot) {
  app.use("/mycamply", express.static(webRoot, { index: false }));
  app.get(/^\/mycamply(?:\/.*)?$/, (_req, res, next) => {
    res.sendFile(path.join(webRoot, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}

export default app;
