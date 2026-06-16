import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
}

const portCheckResult = run("node", ["scripts/check-dev-port.mjs"], {
  stdio: "inherit",
});

if (portCheckResult.status !== 0) {
  process.exit(portCheckResult.status ?? 1);
}

const syncResult = run("node", ["scripts/sync-env.mjs"]);

if (syncResult.status !== 0) {
  process.exit(syncResult.status ?? 1);
}

const generateResult = run("npx", ["prisma", "generate"], {
  stdio: "pipe",
  encoding: "utf8",
});

if (generateResult.status === 0) {
  if (generateResult.stdout) {
    process.stdout.write(generateResult.stdout);
  }
  process.exit(0);
}

const errorOutput = `${generateResult.stderr ?? ""}${generateResult.stdout ?? ""}`;

if (errorOutput.includes("EPERM")) {
  console.warn(
    "[predev] Prisma generate skipped: query engine file is locked (another Node/Next process is probably still running).",
  );
  console.warn("[predev] Starting dev server with the existing Prisma client.");
  process.exit(0);
}

if (generateResult.stdout) {
  process.stdout.write(generateResult.stdout);
}

if (generateResult.stderr) {
  process.stderr.write(generateResult.stderr);
}

process.exit(generateResult.status ?? 1);
