import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = join(__dirname, "..", "..", "..", "scripts", "lint-tokens.mjs");

type LintResult = { status: number; output: string };

const isExitFailure = (e: unknown): e is { status: number; stderr: string } =>
  typeof e === "object" &&
  e !== null &&
  typeof (e as { status?: unknown }).status === "number" &&
  typeof (e as { stderr?: unknown }).stderr === "string";

function lint(files: Record<string, string>): LintResult {
  const root = mkdtempSync(join(tmpdir(), "lint-tokens-"));
  for (const [name, body] of Object.entries(files)) {
    const path = join(root, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
  }
  try {
    const output = execFileSync(process.execPath, [SCRIPT, root], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, output };
  } catch (error: unknown) {
    if (!isExitFailure(error)) throw error;
    return { status: error.status, output: error.stderr };
  }
}

const HANDLE_ASSERT =
  "expect(handle).toMatch(/^product-[a-z0-9]{6}$/);\n" +
  "expect(slug).toMatch(/^[a-z]+-[a-z0-9]{4}$/);\n";

describe("lint-tokens", () => {
  it("skips test files and test directories", () => {
    const result = lint({
      "_tests/handle.test.ts": 'const c = "p-[13px]";\n',
      "tests/form.test.tsx": 'const c = "mt-[3px]";\n',
      "handle.test.ts": 'const c = "z-[41]";\n',
      "widget.test.tsx": 'const c = "text-[15px]";\n',
    });
    expect(result.status).toBe(0);
  });

  it("does not read a regex character class as an arbitrary value", () => {
    const result = lint({ "handle.ts": HANDLE_ASSERT });
    expect(result.status, result.output).toBe(0);
  });

  it("still catches arbitrary values in class strings", () => {
    const result = lint({
      "a.tsx": '<div className="p-[13px]" />\n',
      "b.tsx": 'const c = cn("mt-[3px]", open && "z-[41]");\n',
      "c.tsx": "const c = `text-[15px] ${x}`;\n",
      "d.tsx": "const c = clsx('w-[calc(100%-2rem)]');\n",

      "e.tsx": '<img src={`${base}/${id}`} className="w-[120px]" />\n',
      "f.tsx": '<span>{done}/{total} <b className="p-[13px]">x</b></span>\n',

      "g.tsx":
        '<div style={{ backgroundImage: "url(/hero.png)" }} className="p-[13px]"><a href="/b">x</a></div>\n',
      "h.tsx": '<span>(/mo) <b className="p-[13px]">a/b</b></span>\n',
    });
    expect(result.status).toBe(1);
    for (const hit of [
      "a.tsx:1  [arbitrary value]  p-[13px]",
      "b.tsx:1  [arbitrary value]  mt-[3px]",
      "b.tsx:1  [arbitrary value]  z-[41]",
      "c.tsx:1  [arbitrary value]  text-[15px]",
      "d.tsx:1  [arbitrary value]  w-[calc(100%-2rem)]",
      "e.tsx:1  [arbitrary value]  w-[120px]",
      "f.tsx:1  [arbitrary value]  p-[13px]",
      "g.tsx:1  [arbitrary value]  p-[13px]",
      "h.tsx:1  [arbitrary value]  p-[13px]",
    ]) {
      expect(result.output).toContain(hit);
    }
  });

  it("keeps a class string that shares a line with a regex", () => {
    const result = lint({
      "mixed.tsx": 'const ok = /^x-[a-z]+$/.test(v) ? "p-[13px]" : "p-2";\n',
    });
    expect(result.status).toBe(1);
    expect(result.output).toContain("[arbitrary value]  p-[13px]");
    expect(result.output).not.toContain("x-[a-z]");
  });

  it("refuses every status colour as a fill, the attention yellow and the glyph steps included", () => {
    const classes = [
      "bg-attention",
      "bg-attention-glyph",
      "bg-warning-glyph",
      "bg-destructive-glyph",
      "bg-success-glyph",
      "bg-neutral-glyph",
    ];
    const result = lint(
      Object.fromEntries(
        classes.map((c) => [`${c}.tsx`, `<i className="${c}" />\n`]),
      ),
    );
    expect(result.status).toBe(1);
    for (const c of classes) {
      expect(result.output).toContain(
        `${c}.tsx:1  [status colour as a fill (status reports, never commands)]`,
      );
    }
  });

  it("keeps the status washes and the glyph as TEXT or icon colour legal", () => {
    const result = lint({
      "ok.tsx":
        '<i className="bg-attention-subtle text-attention" /><i className="text-attention-glyph" /><i className="text-warning-glyph" /><i className="text-neutral-glyph" />\n',
    });
    expect(result.status, result.output).toBe(0);
  });

  it("refuses the raw attention ramp steps like the other status ramps", () => {
    const result = lint({
      "raw.css": ".chip { background: var(--attention-100); }\n",
    });
    expect(result.status).toBe(1);
    expect(result.output).toContain(
      "[internal token reference]  --attention-100",
    );
  });

  it("still allows bracketed variant selectors", () => {
    const result = lint({
      "v.tsx": '<div className="data-[state=open]:bg-muted" />\n',
    });
    expect(result.status, result.output).toBe(0);
  });
});
