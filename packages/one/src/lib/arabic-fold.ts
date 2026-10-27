const FOLDS: ReadonlyArray<readonly [string, string]> = [
  ...Array.from("أإآٱ").map((alef): readonly [string, string] => [alef, "ا"]),
  ["ى", "ي"],
  ["ة", "ه"],
  ["ؤ", "و"],
  ["ئ", "ي"],
  ...digitFolds(0x0660),
  ...digitFolds(0x06f0),
  ...codePoints(0x064b, 0x0655).map((mark): readonly [string, string] => [
    mark,
    "",
  ]),
  ["ٰ", ""],
  ["ـ", ""],
];

function codePoints(from: number, to: number): string[] {
  const points: string[] = [];
  for (let code = from; code <= to; code += 1) {
    points.push(String.fromCodePoint(code));
  }
  return points;
}

function digitFolds(zero: number): ReadonlyArray<readonly [string, string]> {
  return codePoints(zero, zero + 9).map(
    (digit, index): readonly [string, string] => [digit, String(index)],
  );
}

const FOLD_BY_CHAR: ReadonlyMap<string, string> = new Map(FOLDS);

function mapSpelling(text: string): string {
  let folded = "";
  for (const char of text) {
    folded += FOLD_BY_CHAR.get(char) ?? char;
  }
  return folded;
}

export function foldArabic(text: string): string {
  return mapSpelling(
    text
      .normalize("NFC")
      .replace(/\u0130/g, "i")
      .toLowerCase(),
  );
}
