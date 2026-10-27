import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";
import { auditPackage } from "./audit-package.mjs";
import { smokeConsumer } from "./consumer-browser.mjs";

const root = resolve(import.meta.dirname, "..");
const temporary = await realpath(
  await mkdtemp(join(tmpdir(), "sirdab-one-consumers-")),
);
const evidenceRoot = join(root, "artifacts/consumers");
const evidence = join(
  evidenceRoot,
  new Date().toISOString().replaceAll(":", "-"),
);
await mkdir(evidence, { recursive: true });
const environment = { ...process.env, CI: "1", NEXT_TELEMETRY_DISABLED: "1" };
delete environment.NODE_PATH;
delete environment.NODE_OPTIONS;
const children = new Set();
const cancelled = new AbortController();

function terminate(child, signal = "SIGTERM") {
  if (!child.pid) return;
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ESRCH"))
      throw error;
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    cancelled.abort(new Error(`Interrupted: ${signal}`));
    for (const child of children) terminate(child);
  });
}

function launch(command, args, cwd, label, { capture = false } = {}) {
  cancelled.signal.throwIfAborted();
  const log = createWriteStream(join(evidence, `${label}.log`));
  log.write(`${command} ${args.join(" ")}\nWorking directory: ${cwd}\n`);
  const child = spawn(command, args, {
    cwd,
    env: environment,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.add(child);
  let stdout = "";
  child.stdout.on("data", (chunk) => {
    if (capture) stdout += chunk.toString();
    log.write(chunk);
  });
  child.stderr.on("data", (chunk) => log.write(chunk));
  const done = new Promise((resolveDone, rejectDone) => {
    child.once("error", rejectDone);
    child.once("close", (code, signal) => {
      children.delete(child);
      log.end();
      if (code === 0) resolveDone(stdout);
      else
        rejectDone(
          new Error(
            `${label} failed (${code ?? signal}). See ${join(evidence, `${label}.log`)}`,
          ),
        );
    });
  });
  return { child, done };
}

async function run(command, args, cwd, label, options) {
  console.log(`[consumers] ${label}`);
  const { child, done } = launch(command, args, cwd, label, options);
  const timeout = setTimeout(() => terminate(child, "SIGKILL"), 10 * 60 * 1000);
  try {
    return await done;
  } finally {
    clearTimeout(timeout);
  }
}

async function freePort() {
  const server = createServer();
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  assert(address && typeof address !== "string");
  await new Promise((resolveClose, rejectClose) =>
    server.close((error) => (error ? rejectClose(error) : resolveClose())),
  );
  return address.port;
}

async function ready(url, child) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    cancelled.signal.throwIfAborted();
    assert(
      child.exitCode === null && child.signalCode === null,
      "Consumer server exited before readiness",
    );
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch {}
    await delay(200);
  }
  throw new Error(`Consumer server did not become ready: ${url}`);
}

async function checkBundle(directory) {
  const measurements = {};
  for (const [name, specifier] of [
    ["root", "@sirdab/one"],
    ["subpath", "@sirdab/one/components/button"],
  ]) {
    const result = await build({
      absWorkingDir: directory,
      stdin: {
        contents: `export { Button } from ${JSON.stringify(specifier)};`,
        resolveDir: directory,
        sourcefile: "small-import.js",
      },
      bundle: true,
      minify: true,
      format: "esm",
      platform: "browser",
      write: false,
      metafile: true,
      external: ["react", "react/*", "react-dom", "react-dom/*"],
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
    });
    const bytes = result.outputFiles.reduce(
      (sum, file) => sum + gzipSync(file.contents).length,
      0,
    );
    const used = Object.values(result.metafile.outputs).flatMap((output) =>
      Object.entries(output.inputs)
        .filter(([, details]) => details.bytesInOutput > 0)
        .map(([input]) => input),
    );
    measurements[name] = { gzipBytes: bytes, bundledInputs: used };
    await writeFile(
      join(evidence, "small-import.json"),
      JSON.stringify(measurements, null, 2),
    );
    assert(
      !used.some((input) =>
        /node_modules\/(?:recharts|streamdown|next)\//.test(input),
      ),
      `${name} Button import retained unrelated heavy runtime`,
    );
    assert(
      bytes < 64 * 1024,
      `${name} Button import exceeds the 64 KiB gzip regression ceiling: ${bytes}`,
    );
  }
  assert(
    measurements.root.gzipBytes <= measurements.subpath.gzipBytes * 1.3 + 4096,
    "Root import does not tree-shake like the Button subpath",
  );
}

async function verifyConsumers() {
  assert(
    !temporary.startsWith(`${root}/`),
    "Consumers must live outside workspace roots",
  );
  const packOutput = await run(
    "npm",
    [
      "pack",
      join(root, "packages/one"),
      "--ignore-scripts",
      "--json",
      "--pack-destination",
      temporary,
    ],
    temporary,
    "pack",
    { capture: true },
  );
  const packed = JSON.parse(packOutput);
  assert(
    Array.isArray(packed) &&
      packed.length === 1 &&
      typeof packed[0].filename === "string",
    "npm pack did not report exactly one tarball",
  );
  const tarball = join(temporary, packed[0].filename);
  await cp(tarball, join(evidence, "package.tgz"));
  const unpacked = join(temporary, "unpacked");
  await mkdir(unpacked);
  await run("tar", ["-xzf", tarball, "-C", unpacked], temporary, "unpack");
  const audit = await auditPackage(
    join(unpacked, "package"),
    join(root, "packages/one/src"),
  );
  await writeFile(
    join(evidence, "package-audit.json"),
    JSON.stringify(audit, null, 2),
  );

  for (const framework of ["next", "vite"]) {
    const directory = join(temporary, framework);
    await cp(join(root, "fixtures", framework), directory, { recursive: true });
    await cp(join(root, "fixtures/shared"), join(directory, "shared"), {
      recursive: true,
    });
    const manifest = JSON.parse(
      await readFile(join(directory, "package.json"), "utf8"),
    );
    assert(
      !manifest.overrides && !manifest.resolutions && !manifest.workspaces,
      "Fixtures cannot use aliases, overrides or workspace resolution",
    );
    if (framework === "vite")
      assert(
        !manifest.dependencies.next && !manifest.devDependencies.next,
        "Vite must not declare Next",
      );
    await run(
      "npm",
      [
        "install",
        "--no-audit",
        "--no-fund",
        "--registry=https://registry.npmjs.org",
        tarball,
      ],
      directory,
      `${framework}-install`,
    );
    const installed = join(directory, "node_modules/@sirdab/one");
    assert(
      !(await lstat(installed)).isSymbolicLink(),
      "npm must unpack the tarball, not link a workspace",
    );
    assert(
      (await realpath(installed)).startsWith(`${directory}/`),
      "Installed package escaped its isolated consumer",
    );
    const lock = JSON.parse(
      await readFile(join(directory, "package-lock.json"), "utf8"),
    );
    for (const [name, dependency] of Object.entries(lock.packages)) {
      assert(
        !dependency.link,
        `Linked dependency in isolated install: ${name}`,
      );
      if (framework === "vite")
        assert(
          !/(?:^|\/)node_modules\/next$/.test(name),
          "Vite resolved Next through a transitive dependency",
        );
    }
    await cp(
      join(directory, "package-lock.json"),
      join(evidence, `${framework}-package-lock.json`),
    );
    await cp(
      join(directory, "package.json"),
      join(evidence, `${framework}-package.json`),
    );
    await run(
      "npm",
      ["ls", "--all", "--json"],
      directory,
      `${framework}-dependency-tree`,
    );
    await run(
      process.execPath,
      [join(root, "scripts/check-public-types.mjs"), directory],
      directory,
      `${framework}-public-types`,
    );
    await run("npm", ["run", "build"], directory, `${framework}-build`);
    if (framework === "vite") await checkBundle(directory);
    const port = await freePort();
    const args =
      framework === "next"
        ? [
            "run",
            "start",
            "--",
            "--hostname",
            "127.0.0.1",
            "--port",
            String(port),
          ]
        : [
            "run",
            "start",
            "--",
            "--host",
            "127.0.0.1",
            "--port",
            String(port),
            "--strictPort",
          ];
    const server = launch("npm", args, directory, `${framework}-server`);
    const unexpectedExit = server.done.then(() => {
      throw new Error(`${framework} server exited unexpectedly`);
    });
    unexpectedExit.catch(() => {});

    server.done.catch(() => {});
    try {
      const url = `http://127.0.0.1:${port}/one-consumer/`;
      await Promise.race([ready(url, server.child), unexpectedExit]);
      await smokeConsumer(url, framework, evidence);
      assert(
        server.child.exitCode === null && server.child.signalCode === null,
        "Consumer server exited during browser smoke",
      );
    } finally {
      terminate(server.child);
      const kill = setTimeout(() => terminate(server.child, "SIGKILL"), 3000);
      await server.done.catch(() => {});
      clearTimeout(kill);
    }
    cancelled.signal.throwIfAborted();
  }
  const sha256 = createHash("sha256")
    .update(await readFile(tarball))
    .digest("hex");
  cancelled.signal.throwIfAborted();
  await cp(tarball, join(evidenceRoot, "verified-package.tgz"));
  cancelled.signal.throwIfAborted();
  await writeFile(
    join(evidenceRoot, "verified-package.json"),
    JSON.stringify({ ...audit, sha256, evidence }, null, 2),
  );
  cancelled.signal.throwIfAborted();
}

async function clearVerifiedArtifacts() {
  await Promise.all(
    ["verified-package.tgz", "verified-package.json"].map((name) =>
      rm(join(evidenceRoot, name), { force: true }),
    ),
  );
}

try {
  try {
    await clearVerifiedArtifacts();
    await verifyConsumers();
  } finally {
    for (const child of children) terminate(child, "SIGKILL");
    await rm(temporary, { recursive: true, force: true });
  }
  cancelled.signal.throwIfAborted();
  console.log(`[consumers] PASS. Evidence: ${evidence}`);
} catch (error) {
  await clearVerifiedArtifacts();
  await writeFile(
    join(evidence, "failure.txt"),
    error instanceof Error ? (error.stack ?? error.message) : String(error),
  );
  console.error(`[consumers] FAIL. Evidence: ${evidence}`);
  throw error;
}
