import { execSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_PORT = Number(process.env.PORT ?? 3000);
const PORTS_TO_RESET = [3000, 3001, 3002, 3003];

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
    const matcher =
      process.platform === "win32"
        ? `:${port}`
        : `:${port}`;

    const command =
      process.platform === "win32"
        ? `netstat -ano | findstr "${matcher}"`
        : `lsof -ti tcp:${port}`;

    const output = execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    if (process.platform === "win32") {
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

    return output
      .split(/\s+/)
      .map((value) => Number(value))
      .filter((pid) => Number.isInteger(pid) && pid > 0);
  } catch {
    return [];
  }
}

function stopProcess(pid) {
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
      return true;
    }

    process.kill(pid, "SIGTERM");
    return true;
  } catch {
    return false;
  }
}

const stoppedPids = new Set();

for (const port of PORTS_TO_RESET) {
  if (!(await isPortInUse(port))) {
    continue;
  }

  for (const pid of getListeningPids(port)) {
    if (stoppedPids.has(pid)) {
      continue;
    }

    if (stopProcess(pid)) {
      stoppedPids.add(pid);
      console.log(`[dev:reset] Stopped process ${pid} on port ${port}`);
    }
  }
}

const nextDir = path.join(rootDir, ".next");
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("[dev:reset] Cleared .next cache");
}

if (await isPortInUse(DEFAULT_PORT)) {
  console.error(
    `[dev:reset] Port ${DEFAULT_PORT} is still in use. Close remaining terminals and run again.`,
  );
  process.exit(1);
}

console.log(`[dev:reset] Ready. Start one dev server with: npm run dev`);
