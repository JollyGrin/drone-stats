#!/usr/bin/env node
// Zero-dependency static server. No Python, no npm install. Just: npm start
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, normalize, join } from "node:path";

const ROOT = process.cwd();
const PORT = process.env.PORT || 8000;
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  // strip query string, prevent path traversal, default to index.html
  let path = decodeURIComponent(req.url.split("?")[0]);
  if (path === "/") path = "/index.html";
  const file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ""));
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("404 not found");
  }
}).listen(PORT, () => {
  console.log(`drone-stats → http://localhost:${PORT}`);
});
