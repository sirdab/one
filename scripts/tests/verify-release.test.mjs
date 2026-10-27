import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const verifierUrl = new URL("../verify-release.mjs", import.meta.url).href;
const mainSha = "a".repeat(40);
const candidateSha = "b".repeat(40);

function verify(overrides = {}) {
  const fixture = {
    requested: "v0.1.0-alpha.1",
    repository: "sirdab/one",
    workflowRef: "refs/heads/main",
    mainSha,
    headSha: mainSha,
    candidateSha,
    ancestor: true,
    manifest: { name: "@sirdab/one", version: "0.1.0-alpha.1" },
    runs: [
      {
        head_sha: candidateSha,
        head_branch: "main",
        event: "push",
        status: "completed",
        conclusion: "success",
      },
    ],
    ...overrides,
  };
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import fs from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
const fixture = JSON.parse(process.env.RELEASE_TEST_FIXTURE);
let output = "";
let requests = 0;
const commands = [];
childProcess.execFileSync = (command, args) => {
  assert.equal(command, "git");
  commands.push(args);
  if (args[0] === "rev-parse") {
    const ref = args.at(-1).replace(/\\^\\{commit\\}$/, "");
    if (ref === "HEAD") return fixture.headSha;
    if (ref === "origin/main") return fixture.mainSha;
    if (ref === "refs/tags/" + fixture.requested) {
      if (fixture.missingRef) throw new Error("Unknown release ref");
      return fixture.candidateSha;
    }
  }
  if (args[0] === "merge-base") {
    if (!fixture.ancestor) throw new Error("Candidate is outside main history");
    return "";
  }
  if (args[0] === "show") {
    assert.equal(args[1], fixture.candidateSha + ":packages/one/package.json");
    return fixture.invalidJson ? "{" : JSON.stringify(fixture.manifest);
  }
  if (args[0] === "checkout") {
    // An off-main tag can replace the verifier with arbitrary executable code.
    console.log("CANDIDATE_VERIFIER_EXECUTED");
    throw new Error("Candidate checkout before trust verification");
  }
  throw new Error("Unexpected Git command: " + args.join(" "));
};
fs.readFile = async () => JSON.stringify({ name: "@sirdab/one", version: "0.1.0-alpha.0" });
fs.appendFile = async (file, data) => {
  assert.equal(file, "test-github-output");
  output += data;
};
syncBuiltinESMExports();
globalThis.fetch = async (url) => {
  requests++;
  const query = new URL(url);
  assert.equal(query.origin, "https://api.github.com");
  assert.equal(query.pathname, "/repos/sirdab/one/actions/workflows/ci.yml/runs");
  assert.equal(query.searchParams.get("head_sha"), fixture.candidateSha);
  assert.equal(query.searchParams.get("branch"), "main");
  assert.equal(query.searchParams.get("event"), "push");
  if (fixture.networkError) throw new Error("CI network unavailable");
  return {
    ok: !fixture.apiFailure,
    status: fixture.apiFailure ? 503 : 200,
    json: async () => ({ workflow_runs: fixture.runs }),
  };
};
try {
  await import(${JSON.stringify(verifierUrl)});
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  console.log(JSON.stringify({ output, requests, commands }));
}
`,
    ],
    {
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        RELEASE_TEST_FIXTURE: JSON.stringify(fixture),
        RELEASE_REF: fixture.requested,
        GITHUB_REPOSITORY: fixture.repository,
        GITHUB_REF: fixture.workflowRef,
        GH_TOKEN: "test-read-token",
        GITHUB_OUTPUT: "test-github-output",
      },
    },
  );
  assert.ifError(result.error);
  return {
    ...result,
    ...JSON.parse(result.stdout.trim().split("\n").at(-1)),
  };
}

function rejects(overrides, message) {
  const result = verify(overrides);
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stderr, message);
  assert.equal(result.output, "", "Rejected candidates must not reach release");
  return result;
}

test("only the read-only main verifier can select code for the publishing job", () => {
  const workflow = readFileSync(
    new URL("../../.github/workflows/release-alpha.yml", import.meta.url),
    "utf8",
  );
  const validation = workflow
    .split("\n  validate:\n")[1]
    ?.split("\n  release:\n")[0];
  assert.ok(
    validation,
    "Candidate verification needs a separate read-only job",
  );
  assert.match(validation, /ref: main/);
  assert.match(validation, /persist-credentials: false/);
  assert.match(validation, /run: node scripts\/verify-release\.mjs/);
  assert.doesNotMatch(validation, /id-token: write|environment:|git checkout/);
  assert.equal((validation.match(/actions\/checkout@/g) ?? []).length, 1);
  assert.match(validation, /sha: \$\{\{ steps\.verify\.outputs\.sha \}\}/);
  const release = workflow.split("\n  release:\n")[1];
  assert.match(release, /needs: validate/);
  assert.match(release, /ref: \$\{\{ needs\.validate\.outputs\.sha \}\}/);
  assert.doesNotMatch(release, /inputs\.release_ref|verify-release\.mjs/);
});

test("rejects an off-main malicious verifier without executing candidate code", () => {
  const result = rejects({ ancestor: false }, /outside main history/);
  assert.equal(result.requests, 0);
  assert.doesNotMatch(result.stdout, /CANDIDATE_VERIFIER_EXECUTED/);
  assert.equal(
    result.commands.some(([command]) => command === "checkout"),
    false,
  );
});

test("accepts the exact CI-verified tag commit using its manifest as data", () => {
  const result = verify();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, `sha=${candidateSha}\n`);
  assert.match(result.stdout, /@sirdab\/one@0\.1\.0-alpha\.1/);
  assert.equal(result.requests, 1);
});

test("resolves main to the immutable commit accepted by CI", () => {
  const result = verify({
    requested: "main",
    mainSha: candidateSha,
    headSha: candidateSha,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, `sha=${candidateSha}\n`);
});

test("rejects invalid, missing and noncanonical alpha refs", () => {
  for (const requested of [
    "feature",
    "--help",
    "v1.0.0",
    "v01.0.0-alpha.1",
    "v1.0.0-alpha.01",
    "v1.0.0-alpha.1\n",
  ]) {
    const result = rejects({ requested }, /Select main or an exact/);
    assert.equal(result.requests, 0);
  }
  rejects({ missingRef: true }, /Unknown release ref/);
});

test("rejects invalid candidate manifests and tag/version mismatches", () => {
  rejects({ invalidJson: true }, /JSON|property name/);
  rejects(
    { manifest: { name: "@other/package", version: "0.1.0-alpha.1" } },
    /@sirdab\/one/,
  );
  for (const version of ["0.1.0", "0.1.0-alpha.01", "0.1.0-alpha.1\n", null]) {
    rejects(
      { manifest: { name: "@sirdab/one", version } },
      /only publishes alpha/,
    );
  }
  rejects(
    { manifest: { name: "@sirdab/one", version: "0.1.0-alpha.2" } },
    /Tag and package version differ/,
  );
});

test("rejects CI from another SHA, branch or event and incomplete or failed CI", () => {
  for (const run of [
    { head_sha: mainSha },
    { head_branch: "feature" },
    { event: "pull_request" },
    { status: "in_progress" },
    { conclusion: "failure" },
  ]) {
    rejects(
      {
        runs: [
          {
            head_sha: candidateSha,
            head_branch: "main",
            event: "push",
            status: "completed",
            conclusion: "success",
            ...run,
          },
        ],
      },
      /no successful main CI/,
    );
  }
  rejects({ runs: [] }, /no successful main CI/);
});

test("fails closed on CI API and network errors", () => {
  rejects({ apiFailure: true }, /Cannot verify CI: HTTP 503/);
  rejects({ networkError: true }, /CI network unavailable/);
});

test("requires trusted main code and the canonical main dispatch", () => {
  rejects({ headSha: candidateSha }, /Run the verifier from trusted main/);
  rejects({ repository: "another/one" }, /Only the canonical repository/);
  rejects(
    { workflowRef: "refs/heads/feature" },
    /Dispatch the release workflow from main/,
  );
});
