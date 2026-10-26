/**
 * Token lint, the rule that keeps the scale alive.
 *
 * Scans app source for the four ways the token system erodes:
 *   1. Tailwind arbitrary values          p-[13px], text-[15px], z-[41]
 *   2. Internal token references          --ramp-*, --darken-*, --gray-*, --ink
 *   3. Literal z-index                    z-50, z-index: 41
 *   4. Stock type utilities               text-sm (roles only: text-body, …)
 *   5. `font:` shorthand off a role token (kills tabular figures)
 *
 * Usage: node scripts/lint-tokens.mjs <dir> [<dir> …]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const roots = process.argv.slice(2).map((p) => resolve(process.cwd(), p));
if (roots.length === 0) {
  console.error("usage: lint-tokens.mjs <dir> [<dir> …]");
  process.exit(2);
}

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  ".git",
  "public",
  "tests",
  "_tests",
]);
const EXTENSIONS = /\.(tsx?|css|mdx?)$/;
/* Tests assert on data, not class lists; a regex like /^product-[a-z0-9]{6}$/
   in one reads as an arbitrary value and there is no token to true it to. */
const TEST_FILE = /\.test\.[^.]+$/;

/** Variant prefixes that legitimately use brackets (selectors, not values).
    Variants chain (group-has-data-[...], peer-aria-[...]), so allow any dash
    chain of variant words ending in one that takes a bracketed selector. */
const VARIANT_PREFIX =
  /(?:^|[\s:"'`*])(?:(?:group|peer|has|not|in|where)(?:\/[\w-]+)?-)*(?:data|aria|has|supports|nth|nth-last|not)-$/;

const ARBITRARY = /[\w-]+-\[[^\]]+\]/g;
/* A `/` that opens a regex literal follows an operator, a delimiter, or a
   keyword; one that follows a value is division. `}` is left out: in JSX
   `{done}/{total}` and in `${base}/${id}` the slash follows a value. */
const REGEX_OPENER = /(?:^|[(,=:[!&|?{;]|\breturn|\btypeof|=>)\s*$/;

/** Character ranges of the regex literals on one line, so a class-shaped
    character class (`product-[a-z0-9]`) is not read as an arbitrary value. */
function regexSpans(line) {
  const spans = [];
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== "/" || /[/*>]/.test(line[i + 1] ?? "")) continue;
    if (!REGEX_OPENER.test(line.slice(0, i))) continue;
    let inClass = false;
    let j = i + 1;
    for (; j < line.length; j++) {
      const ch = line[j];
      if (ch === "\\") {
        j++;
      } else if (inClass) {
        if (ch === "]") inClass = false;
      } else if (ch === "[") {
        inClass = true;
      } else if (ch === "/") {
        /* `</b>` and `/>` are JSX, and a slash followed by a word
                   character other than a flag letter is a path (`a/b`,
                   `href="/b"`), never a regex close. A span that only closes
                   there is not a regex, so drop it. */
        if (
          line[j - 1] === "<" ||
          line[j + 1] === ">" ||
          /[^dgimsuvy\W]/.test(line[j + 1] ?? " ")
        )
          j = line.length;
        break;
      }
    }
    if (j >= line.length) break;
    spans.push([i, j]);
    i = j;
  }
  return spans;
}

const insideAny = (spans, index) =>
  spans.some(([start, end]) => index > start && index < end);
const VAR_SHORTHAND = /[\w-]+-\(--[\w-]+\)/g;
/* gray/gray-alpha are PUBLIC (AGENTS.md nav pattern uses the alpha ramp
   directly); internal = the raw ramp, the non-flipping darken/lighten pair,
   ink, and raw status steps. */
const INTERNAL_TOKENS =
  /--(?:ramp|darken|lighten)-[\w-]+|--ink\b|--(?:destructive|warning|success|attention)-\d+/g;
/* Status colours report, they never command (AGENTS.md §1). The -glyph steps
   are icon colours (text-*-glyph) and never a fill either, neutral included:
   a glyph painted as a background is a status colour doing a surface's job. */
const STATUS_BUTTON =
  /\b(?:bg-|background(?:-color)?:\s*var\(--)(?:(?:destructive|success|warning|attention)\b(?!-subtle)|neutral-glyph\b)/g;
const LITERAL_Z_CLASS = /(?:^|[\s:"'`])-?z-\d+\b/g;
const LITERAL_Z_CSS = /z-index\s*:\s*-?\d/g;
const STOCK_TEXT = /\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b/g;
/* gray is absent on purpose: the solid gray ramp is public and mapped. */
const STOCK_PALETTE =
  /\b(?:bg|text|border|ring|outline|fill|stroke|decoration|divide|accent|caret|shadow|from|via|to)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|zinc|neutral|stone)-\d+(?:\/\d+)?\b/g;
const FONT_SHORTHAND = /font:\s*var\(--text-/g;
/* --color-secondary is the shadcn button-FILL alias (maps to --muted); as a
   text colour it paints a 4% wash, invisible text. De-emphasis is
   text-muted-foreground. */
const SECONDARY_AS_TEXT = /\btext-secondary\b/g;
/* No colour token backs quiet icons (alpha ink double-paints crossing
   strokes), so text-icon-quiet compiles to nothing and silently paints the
   icon currentColor. The sanctioned class is the icon-quiet UTILITY. */
const ICON_QUIET_AS_TEXT = /\btext-icon-quiet(?:-hover|-disabled)?\b/g;

const findings = [];

const LUCIDE_IMPORT = /import\s*\{([^}]+)\}\s*from\s*"lucide-react"/g;
const UI_INTERNAL = /components[\\/]ui[\\/](?!tests)/;

function scanFile(path) {
  const source = readFileSync(path, "utf8");
  const isCss = path.endsWith(".css");
  const lines = source.split("\n");

  /* Icons render through <Icon> so flip/labelling decisions have one home.
       Passing the component as a value (icon={Search}) is the sanctioned use;
       raw JSX (<Search />) outside components/ui internals is not. */
  if (!isCss && !UI_INTERNAL.test(path)) {
    const names = [];
    for (const m of source.matchAll(LUCIDE_IMPORT)) {
      for (const raw of m[1].split(",")) {
        const name = raw
          .trim()
          .split(/\s+as\s+/)
          .pop();
        if (name) names.push(name);
      }
    }
    if (names.length > 0) {
      const jsx = new RegExp(`<(${names.join("|")})[\\s/>]`);
      lines.forEach((line, i) => {
        const m = line.match(jsx);
        if (m) {
          findings.push({
            path,
            line: i + 1,
            rule: "raw lucide JSX, render through <Icon icon={…}>",
            match: `<${m[1]}>`,
          });
        }
      });
    }
  }

  lines.forEach((line, i) => {
    const report = (rule, match) =>
      findings.push({ path, line: i + 1, rule, match });

    if (!isCss) {
      const regexes = regexSpans(line);
      for (const m of line.matchAll(ARBITRARY)) {
        if (insideAny(regexes, m.index)) continue;
        const before = line.slice(0, m.index + m[0].indexOf("["));
        if (!VARIANT_PREFIX.test(before)) {
          report("arbitrary value", m[0]);
        }
      }
      for (const m of line.matchAll(VAR_SHORTHAND)) {
        report("arbitrary var value", m[0]);
      }
      for (const m of line.matchAll(STOCK_TEXT)) {
        report("stock type utility (use a text role)", m[0]);
      }
      for (const m of line.matchAll(SECONDARY_AS_TEXT)) {
        report(
          "text-secondary is the shadcn fill alias (4% wash), use text-muted-foreground",
          m[0],
        );
      }
      for (const m of line.matchAll(ICON_QUIET_AS_TEXT)) {
        report(
          "no such colour utility, quiet icons use the icon-quiet utility (solid ink + opacity)",
          m[0],
        );
      }
      for (const m of line.matchAll(STOCK_PALETTE)) {
        report("stock palette utility (wiped, use a semantic colour)", m[0]);
      }
      for (const m of line.matchAll(LITERAL_Z_CLASS)) {
        report("literal z-index class (use a named --z-* layer)", m[0].trim());
      }
    }
    for (const m of line.matchAll(INTERNAL_TOKENS)) {
      report("internal token reference", m[0]);
    }
    for (const m of line.matchAll(STATUS_BUTTON)) {
      report("status colour as a fill (status reports, never commands)", m[0]);
    }
    for (const m of line.matchAll(LITERAL_Z_CSS)) {
      report("literal z-index (use a named --z-* layer)", m[0]);
    }
    for (const m of line.matchAll(FONT_SHORTHAND)) {
      report("font: shorthand kills tabular figures (use longhands)", m[0]);
    }
  });
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) walk(path);
    else if (EXTENSIONS.test(entry) && !TEST_FILE.test(entry)) scanFile(path);
  }
}

for (const root of roots) {
  walk(root);
}

if (findings.length > 0) {
  for (const f of findings) {
    console.error(
      `${relative(process.cwd(), f.path)}:${f.line}  [${f.rule}]  ${f.match}`,
    );
  }
  console.error(`\n${findings.length} token violation(s)`);
  process.exit(1);
}
console.log("lint:tokens clean");
