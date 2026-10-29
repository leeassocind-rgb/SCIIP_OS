import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createSciipPostgresReadApi } from "./postgres/read-api.mjs";

const HOST = process.env.SCIIP_PRODUCTION_HOST || process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.SCIIP_PRODUCTION_PORT || process.env.PORT || 3000);
const STATIC_ROOT = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const INDEX_FILE = resolve(STATIC_ROOT, "index.html");

if (!Number.isInteger(PORT) || PORT < 0 || PORT > 65535) {
  throw new Error("Invalid production server port");
}

const postgresApi = createSciipPostgresReadApi();
if (!postgresApi || typeof postgresApi !== "object") {
  throw new Error("Existing PostgreSQL read API factory did not return the certified wrapper object");
}
const apiServer = postgresApi.server;
if (
  !apiServer ||
  apiServer.constructor?.name !== "Server" ||
  typeof apiServer.listeners !== "function" ||
  typeof apiServer.listen !== "function"
) {
  throw new Error("Existing PostgreSQL read API wrapper did not expose the certified .server boundary");
}
if (apiServer.listening) {
  throw new Error("Existing PostgreSQL read API .server unexpectedly started listening");
}
const requestListeners = apiServer.listeners("request");
if (requestListeners.length !== 1 || typeof requestListeners[0] !== "function") {
  throw new Error("Certified PostgreSQL read API .server did not expose exactly one request listener");
}
const postgresRequestHandler = requestListeners[0];

const MIME = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".txt", "text/plain; charset=utf-8"],
]);

function sendText(res, statusCode, text) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(text);
}

function safeStaticPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;
  const parts = decoded.split("/").filter(Boolean);
  if (parts.some((part) => part === ".." || part.startsWith("."))) return null;
  const candidate = resolve(STATIC_ROOT, parts.join("/"));
  if (candidate !== STATIC_ROOT && !candidate.startsWith(STATIC_ROOT + sep)) return null;
  return candidate;
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function sendFile(req, res, path) {
  const body = await readFile(path);
  res.statusCode = 200;
  res.setHeader("Content-Type", MIME.get(extname(path).toLowerCase()) || "application/octet-stream");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Length", String(body.length));
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  res.end(body);
}

await stat(INDEX_FILE).catch(() => {
  throw new Error(`Vite production build not found at ${INDEX_FILE}`);
});

const server = createServer(async (req, res) => {
  try {
    const rawTarget = req.url || "/";
    const rawPath = rawTarget.split("?", 1)[0];
    let decodedRawPath;
    try {
      decodedRawPath = decodeURIComponent(rawPath);
    } catch {
      sendText(res, 400, "Bad Request");
      return;
    }
    if (
      decodedRawPath.includes("\0") ||
      decodedRawPath.split("/").filter(Boolean).some((part) => part === ".." || part.startsWith("."))
    ) {
      sendText(res, 400, "Bad Request");
      return;
    }

    const url = new URL(rawTarget, "http://127.0.0.1");

    if (
      url.pathname === "/health" ||
      url.pathname === "/api/postgres" ||
      url.pathname.startsWith("/api/postgres/")
    ) {
      await Promise.resolve(postgresRequestHandler.call(apiServer, req, res));
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendText(res, 405, "Method Not Allowed");
      return;
    }

    const requested = safeStaticPath(url.pathname);
    if (!requested) {
      sendText(res, 400, "Bad Request");
      return;
    }

    if (requested !== STATIC_ROOT && await isFile(requested)) {
      await sendFile(req, res, requested);
      return;
    }

    await sendFile(req, res, INDEX_FILE);
  } catch {
    if (!res.headersSent) {
      sendText(res, 500, "Internal Server Error");
    } else {
      res.end();
    }
  }
});

server.listen(PORT, HOST, () => {
  const address = server.address();
  const boundPort = typeof address === "object" && address ? address.port : PORT;
  console.log(`SCIIP production server listening on http://${HOST}:${boundPort}`);
});
