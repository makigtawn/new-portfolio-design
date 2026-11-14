import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const port = Number(process.env.MOCK_GITHUB_PORT ?? "4010");
const repo = process.env.GITHUB_REPO ?? "test-owner/test-repo";
const contentPath = resolve(process.cwd(), "content/site.json");
const initialContent = readFileSync(contentPath, "utf8");
type MockFile = { sha: string; content: string };
type MockCommit = {
  path: string;
  message: string;
  sha: string;
  content: string;
};
type MockBody = Record<string, unknown>;
let files: Map<string, MockFile>;
let commits: MockCommit[];
let seedIndex: number;
let conflictNextPut: boolean;

function reset() {
  files = new Map([
    ["content/site.json", { sha: "seed-0", content: initialContent }],
  ]);
  commits = [];
  seedIndex = 0;
  conflictNextPut = false;
}

function reply(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function readJson(request: IncomingMessage): Promise<MockBody> {
  return new Promise((resolveBody, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk: string) => {
      raw += chunk;
      if (raw.length > 6 * 1024 * 1024) {
        reject(new Error("Mock request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        const parsed: unknown = JSON.parse(raw || "{}");
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          reject(new Error("Mock request body must be an object."));
          return;
        }
        resolveBody(parsed as MockBody);
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

reset();

const server = createServer(
  async (request: IncomingMessage, response: ServerResponse) => {
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
    const filePath = decodeURIComponent(
      url.pathname.slice(contentsPrefix.length),
    );
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
        const content = Buffer.from(
          String(body.content ?? ""),
          "base64",
        ).toString("utf8");
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
  },
);

server.listen(port, "127.0.0.1");
