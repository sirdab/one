import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { appendFile } from "node:fs/promises";

const requested = process.env.RELEASE_REF;
const repository = process.env.GITHUB_REPOSITORY;
assert.equal(
  repository,
  "sirdab/one",
  "Only the canonical repository can release",
);
assert.equal(
  process.env.GITHUB_REF,
  "refs/heads/main",
  "Dispatch the release workflow from main",
);
const alphaVersion =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)-alpha\.(?:0|[1-9]\d*)$(?![\s\S])/;
assert(
  requested === "main" ||
    (typeof requested === "string" &&
      requested.startsWith("v") &&
      alphaVersion.test(requested.slice(1))),
  "Select main or an exact vX.Y.Z-alpha.N tag",
);
const gitOptions = { encoding: "utf8" };
const mainSha = execFileSync(
  "git",
  ["rev-parse", "--verify", "origin/main^{commit}"],
  gitOptions,
).trim();
assert.equal(
  execFileSync("git", ["rev-parse", "--verify", "HEAD"], gitOptions).trim(),
  mainSha,
  "Run the verifier from trusted main before checking out a candidate",
);
const candidateRef =
  requested === "main" ? "origin/main" : `refs/tags/${requested}`;
const sha = execFileSync(
  "git",
  ["rev-parse", "--verify", "--end-of-options", `${candidateRef}^{commit}`],
  gitOptions,
).trim();
assert(/^[a-f0-9]{40}$/.test(sha), "Expected an immutable commit SHA");
execFileSync("git", ["merge-base", "--is-ancestor", sha, mainSha], gitOptions);

const manifest = JSON.parse(
  execFileSync("git", ["show", `${sha}:packages/one/package.json`], gitOptions),
);
assert.equal(manifest.name, "@sirdab/one");
assert(
  typeof manifest.version === "string" && alphaVersion.test(manifest.version),
  "This workflow only publishes alpha versions",
);
if (requested !== "main") {
  assert.equal(
    requested,
    `v${manifest.version}`,
    "Tag and package version differ",
  );
}
assert(process.env.GH_TOKEN, "GitHub read token required to verify CI");
const response = await fetch(
  `https://api.github.com/repos/${repository}/actions/workflows/ci.yml/runs?head_sha=${sha}&status=success&event=push&branch=main&per_page=100`,
  {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(15_000),
  },
);
assert(response.ok, `Cannot verify CI: HTTP ${response.status}`);
const result = await response.json();
assert(
  result.workflow_runs?.some(
    (run) =>
      run.head_sha === sha &&
      run.head_branch === "main" &&
      run.event === "push" &&
      run.status === "completed" &&
      run.conclusion === "success",
  ),
  "This exact commit has no successful main CI run",
);
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `sha=${sha}\n`);
}
console.log(`Verified ${manifest.name}@${manifest.version} at ${sha}`);
