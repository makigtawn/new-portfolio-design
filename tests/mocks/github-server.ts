const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.MOCK_GITHUB_PORT ?? "4010");
const repo = process.env.GITHUB_REPO ?? "test-owner/test-repo";
const contentPath = path.resolve(process.cwd(), "content/site.json");
const initialContent = fs.readFileSync(contentPath, "utf8");
let files;
let commits;
let seedIndex;
let conflictNextPut;

function reset() {
  files = new Map([
    ["content/site.json", { sha: "seed-0", content: initialContent }],
  ]);
  commits = [];
  seedIndex = 0;
  conflictNextPut = false;
}

function reply(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 6 * 1024 * 1024) {
        reject(new Error("Mock request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

reset();

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  if (url.pathname === "/__health") return reply(response, 200, { ok: true });
  if (url.pathname === "/__reset" && request.method === "POST") {
    reset();
    return reply(response, 200, { ok: true });
  }
  if (url.pathname === "/__commits" && request.method === "GET") {
    return reply(response, 200, commits);
  }
  if (url.pathname === "/__conflict-next" && request.method === "POST") {
    conflictNextPut = true;
    return reply(response, 200, { ok: true });
  }
  if (url.pathname === "/__seed" && request.method === "POST") {
    try {
      const body = await readJson(request);
      const file = String(body.path ?? "");
      files.set(file, {
        sha: `seed-${++seedIndex}`,
        content: String(body.content ?? ""),
      });
      return reply(response, 200, { ok: true });
    } catch {
      return reply(response, 400, { message: "Invalid seed request." });
    }
  }

  const contentsPrefix = `/repos/${repo}/contents/`;
  if (!url.pathname.startsWith(contentsPrefix)) {
    return reply(response, 404, { message: "Not Found" });
  }
  const filePath = decodeURIComponent(url.pathname.slice(contentsPrefix.length));
  if (request.method === "GET") {
    const file = files.get(filePath);
    if (!file) return reply(response, 404, { message: "Not Found" });
    return reply(response, 200, {
      sha: file.sha,
      encoding: "base64",
      content: Buffer.from(file.content, "utf8").toString("base64"),
    });
  }

  if (request.method === "PUT") {
    try {
      const body = await readJson(request);
      if (conflictNextPut) {
        conflictNextPut = false;
        return reply(response, 409, { message: "Conflict" });
      }
      const current = files.get(filePath);
      if ((current && body.sha !== current.sha) || (!current && body.sha)) {
        return reply(response, 409, { message: "Conflict" });
      }
      const content = Buffer.from(String(body.content ?? ""), "base64").toString(
        "utf8",
      );
      const sha = `mock-${commits.length + 1}`;
      files.set(filePath, { sha, content });
      commits.push({
        path: filePath,
        sha,
        message: String(body.message ?? ""),
        content,
      });
      return reply(response, 201, { content: { sha } });
    } catch {
      return reply(response, 400, { message: "Invalid contents request." });
    }
  }

  return reply(response, 405, { message: "Method Not Allowed" });
});

server.listen(port, "127.0.0.1");
