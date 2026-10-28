import http from "node:http";
import { pathToFileURL } from "node:url";
import { createPostgresReadRepository } from "./PostgresReadRepository.mjs";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 43154;

function allowedOrigin(origin) {
  return Boolean(origin && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin));
}

function json(res, status, payload, origin) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (allowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.end(JSON.stringify(payload));
}

export function createSciipPostgresReadApi({
  repository = createPostgresReadRepository(),
  host = process.env.SCIIP_POSTGRES_READ_API_HOST || DEFAULT_HOST,
  port = Number(process.env.SCIIP_POSTGRES_READ_API_PORT || DEFAULT_PORT),
} = {}) {
  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin;
    try {
      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        if (allowedOrigin(origin)) {
          res.setHeader("Access-Control-Allow-Origin", origin);
          res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
          res.setHeader("Vary", "Origin");
        }
        res.end();
        return;
      }

      if (req.method !== "GET") {
        json(res, 405, { error: "method_not_allowed" }, origin);
        return;
      }

      const url = new URL(req.url || "/", `http://${host}:${port}`);

      if (url.pathname === "/health") {
        const health = await repository.health();
        json(res, 200, { ok: true, source: "postgres", ...health }, origin);
        return;
      }

      // SCIIP_A10BA_POSTGRES_PROPERTIES_ENDPOINT
      if (url.pathname === "/api/postgres/properties") {
        const data = await repository.explorerProperties({
          limit: url.searchParams.get("limit"),
          offset: url.searchParams.get("offset"),
        });
        json(res, 200, data, origin);
        return;
      }

      const match = url.pathname.match(/^\/api\/postgres\/(assets|buildings|listings)$/);
      if (!match) {
        json(res, 404, { error: "not_found" }, origin);
        return;
      }

      const data = await repository.list(match[1], {
        limit: url.searchParams.get("limit"),
        offset: url.searchParams.get("offset"),
      });
      json(res, 200, data, origin);
    } catch (error) {
      json(res, 500, {
        error: "postgres_read_failed",
        message: error instanceof Error ? error.message : String(error),
      }, origin);
    }
  });

  return {
    host,
    port,
    server,
    repository,
    async start() {
      await new Promise((resolve, reject) => {
        const onError = (error) => {
          server.off("listening", onListening);
          reject(error);
        };
        const onListening = () => {
          server.off("error", onError);
          resolve();
        };
        server.once("error", onError);
        server.once("listening", onListening);
        server.listen(port, host);
      });
      return server.address();
    },
    async close() {
      await new Promise((resolve) => server.close(() => resolve()));
      await repository.close();
    },
  };
}

async function main() {
  const api = createSciipPostgresReadApi();
  const address = await api.start();
  const shutdown = async () => {
    try { await api.close(); } finally { process.exit(0); }
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  console.log(`SCIIP PostgreSQL read API listening on http://${address.address}:${address.port}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
