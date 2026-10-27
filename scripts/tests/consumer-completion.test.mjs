import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const bootstrap = `
import { registerHooks } from "node:module";
const entry = new URL("./scripts/verify-consumers.mjs", import.meta.url).href;
const stub = new URL("./stubs.mjs", import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === entry && [
      "node:child_process", "node:fs/promises", "esbuild",
      "./audit-package.mjs", "./consumer-browser.mjs",
    ].includes(specifier)) return { url: stub, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
`;

const stubs = `
import { EventEmitter, once } from "node:events";
import { PassThrough } from "node:stream";
import * as fs from "node:fs/promises";
import { join, basename } from "node:path";
export { lstat, mkdir, mkdtemp, realpath } from "node:fs/promises";
let reached = false;
async function checkpoint(phase) {
  if (reached || process.env.CANCEL_PHASE !== phase) return;
  reached = true;
  process.send({ phase });
  await once(process, "message");
}
process.on("SIGTERM", () => process.send({ delivered: "SIGTERM" }));
const originalKill = process.kill.bind(process);
const children = new Map();
process.kill = (pid, signal) => {
  const child = children.get(-pid);
  if (!child) return originalKill(pid, signal);
  if (child.stopping) return true;
  child.stopping = true;
  void (async () => {
    if (child.framework === "vite") await checkpoint("teardown");
    child.signalCode = signal;
    child.emit("close", null, signal);
    children.delete(-pid);
  })();
  return true;
};
globalThis.fetch = async () => new Response("ready");
export function spawn(command, args, options) {
  const child = new EventEmitter();
  Object.assign(child, {
    pid: 800000 + children.size, exitCode: null, signalCode: null,
    stdout: new PassThrough(), stderr: new PassThrough(),
    framework: basename(options.cwd),
  });
  children.set(child.pid, child);
  setImmediate(async () => {
    try {
      if (args[0] === "pack") {
        await fs.writeFile(join(options.cwd, "candidate.tgz"), "candidate bytes");
        child.stdout.write(JSON.stringify([{ filename: "candidate.tgz" }]));
        await checkpoint("pack");
      }
      if (command === "tar") await fs.mkdir(join(args.at(-1), "package"));
      if (args[0] === "install") {
        await fs.mkdir(join(options.cwd, "node_modules/@sirdab/one"), { recursive: true });
        await fs.writeFile(join(options.cwd, "package-lock.json"), JSON.stringify({ packages: {} }));
      }
      if (args[1] === "start") return;
      child.exitCode = 0;
      child.emit("close", 0, null);
      children.delete(child.pid);
    } catch (error) { child.emit("error", error); }
  });
  return child;
}
export async function cp(source, destination, options) {
  await fs.cp(source, destination, options);
  if (basename(destination) === "verified-package.tgz") await checkpoint("tarball");
}
export async function readFile(path, options) {
  const result = await fs.readFile(path, options);
  if (basename(path) === "candidate.tgz") await checkpoint("hash");
  return result;
}
export async function writeFile(path, content, options) {
  await fs.writeFile(path, content, options);
  if (basename(path) === "verified-package.json") await checkpoint("metadata");
}
export async function rm(path, options) {
  await fs.rm(path, options);
  if (basename(path).startsWith("sirdab-one-consumers-")) await checkpoint("cleanup");
}
export async function auditPackage() { return { version: "0.1.0-test" }; }
export async function smokeConsumer() {}
export async function build() {
  return { outputFiles: [{ contents: Buffer.from("button") }], metafile: { outputs: {} } };
}
`;

async function runConsumer(phase) {
  const directory = await mkdtemp(join(tmpdir(), "one-completion-test-"));
  const artifacts = join(directory, "artifacts/consumers");
  try {
    await mkdir(join(directory, "scripts"));
    await cp(
      new URL("../verify-consumers.mjs", import.meta.url),
      join(directory, "scripts/verify-consumers.mjs"),
    );
    await writeFile(join(directory, "bootstrap.mjs"), bootstrap);
    await writeFile(join(directory, "stubs.mjs"), stubs);
    await mkdir(join(directory, "fixtures/shared"), { recursive: true });
    for (const framework of ["next", "vite"]) {
      await mkdir(join(directory, "fixtures", framework));
      await writeFile(
        join(directory, "fixtures", framework, "package.json"),
        JSON.stringify({ dependencies: {}, devDependencies: {} }),
      );
    }
    await mkdir(artifacts, { recursive: true });
    for (const name of ["verified-package.tgz", "verified-package.json"])
      await writeFile(join(artifacts, name), "stale success");
    const child = fork(join(directory, "scripts/verify-consumers.mjs"), {
      execArgv: ["--import", join(directory, "bootstrap.mjs")],
      env: { ...process.env, CANCEL_PHASE: phase },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    });
    let output = "";
    let reached = false;
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.on("message", (message) => {
      if (message.phase === phase) {
        reached = true;
        child.kill("SIGTERM");
      } else if (message.delivered === "SIGTERM") child.send("continue");
    });
    const timeout = setTimeout(() => child.kill("SIGKILL"), 10_000);
    const result = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code, signal) => resolve({ code, signal }));
    }).finally(() => clearTimeout(timeout));
    const names = await readdir(artifacts);
    const evidence = names.find(
      (name) => !name.startsWith("verified-package."),
    );
    return {
      ...result,
      output,
      reached,
      names,
      failure: evidence
        ? await readFile(
            join(artifacts, evidence, "failure.txt"),
            "utf8",
          ).catch(() => null)
        : null,
      tarball: names.includes("verified-package.tgz")
        ? await readFile(join(artifacts, "verified-package.tgz"), "utf8")
        : null,
      receipt: names.includes("verified-package.json")
        ? await readFile(join(artifacts, "verified-package.json"), "utf8")
        : null,
    };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

for (const phase of [
  "pack",
  "teardown",
  "hash",
  "tarball",
  "metadata",
  "cleanup",
]) {
  test(`SIGTERM during ${phase} cannot leave a successful consumer receipt`, async () => {
    const result = await runConsumer(phase);
    assert.equal(result.reached, true, result.output);
    assert.equal(result.signal, null, result.output);
    assert.notEqual(result.code, 0, result.output);
    assert.doesNotMatch(result.output, /\[consumers\] PASS/);
    assert.match(result.failure, /SIGTERM/);
    assert.equal(
      result.tarball,
      null,
      "Cancelled run left a current or stale tarball",
    );
    assert.equal(
      result.receipt,
      null,
      "Cancelled run left a current or stale receipt",
    );
  });
}

test("successful consumer verification replaces stale artifacts with the tested bytes", async () => {
  const result = await runConsumer("none");
  assert.equal(result.code, 0, result.output);
  assert.equal(result.signal, null, result.output);
  assert.match(result.output, /\[consumers\] PASS/);
  assert.equal(result.failure, null);
  assert.equal(result.tarball, "candidate bytes");
  assert.equal(
    JSON.parse(result.receipt).sha256,
    createHash("sha256").update(result.tarball).digest("hex"),
  );
});
