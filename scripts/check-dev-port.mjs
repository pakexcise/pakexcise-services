import { execSync } from "node:child_process";
import net from "node:net";

const DEFAULT_PORT = Number(process.env.PORT ?? 3000);

function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(true))
      .once("listening", () => {
        tester.close(() => resolve(false));
      })
      .listen(port, "127.0.0.1");
  });
}

function getListeningPids(port) {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr ":${port}"`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });

      const pids = new Set();
      for (const line of output.split(/\r?\n/)) {
        if (!line.includes("LISTENING")) {
          continue;
        }

        const parts = line.trim().split(/\s+/);
        const pid = Number(parts.at(-1));
        if (Number.isInteger(pid) && pid > 0) {
          pids.add(pid);
        }
      }

      return [...pids];
    }

    const output = execSync(`lsof -ti tcp:${port}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    return output
      .split(/\s+/)
      .map((value) => Number(value))
      .filter((pid) => Number.isInteger(pid) && pid > 0);
  } catch {
    return [];
  }
}

const inUse = await isPortInUse(DEFAULT_PORT);

if (!inUse) {
  process.exit(0);
}

const pid = getListeningPids(DEFAULT_PORT)[0] ?? null;

console.error("");
console.error(`[dev] Port ${DEFAULT_PORT} is already in use${pid ? ` (PID ${pid})` : ""}.`);
console.error("[dev] Multiple Next.js dev servers corrupt .next and cause 500/blank pages.");
console.error("[dev] Run: npm run dev:reset");
console.error("");

process.exit(1);
