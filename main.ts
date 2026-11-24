// Make the AI Judge Laugh: the Office Joke Open — make.fun entry.
// The entry is exactly one joke, one sentence, 136 characters:
// 'My performance review says I need to "be more visible," so I now attend
// every meeting on camera and contribute nothing, like management.'
// Why this one: "be more visible" is real performance-review language, taken
// literally (on camera) — then the last two words, "like management", flip
// the whole line from obedience into a jab. The setup is a universal office
// moment (the review, the camera-on meeting) and the payoff lands in the
// final words, with no inference step. One sentence, ASCII only, no trailing
// newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const JOKE =
  'My performance review says I need to "be more visible," so I now attend every meeting on camera and contribute nothing, like management.';

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200 characters,
// not only whitespace. One sentence, 136 characters, ASCII only.
const chars = [...JOKE];
if (chars.length < 1 || chars.length > 200 || JOKE.trim().length === 0) {
  throw new Error("entry must be 1 to 200 characters of non-whitespace text");
}
if (JOKE !== JOKE.trim() || JOKE.includes("\n")) {
  throw new Error("entry must be a single line with no surrounding whitespace");
}
// One sentence: exactly one sentence terminator in the whole joke, and it
// is the final character.
const terminators = [...JOKE].filter(
  (c) => c === "." || c === "!" || c === "?",
);
if (terminators.length !== 1 || !JOKE.endsWith(terminators[0])) {
  throw new Error("entry must be exactly one sentence");
}

// The harness points MAKEFUN_OUTPUT_DIR at the writable /output; write there
// when it is set, and to /output directly as well, so the gate finds the file
// either way. No trailing newline: the file is the joke, byte for byte.
const targets = [process.env.MAKEFUN_OUTPUT_DIR, "/output"].filter(
  (d): d is string => Boolean(d),
);
const landed: string[] = [];
for (const dir of targets) {
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "entry.txt"), JOKE, "utf8");
    landed.push(dir);
  } catch {
    // One target may be read-only in some sandboxes; the other still lands.
  }
}
if (landed.length === 0) {
  throw new Error("could not write entry.txt to any output directory");
}

// Read back what landed and prove it is the joke, byte for byte — a silent
// partial write must fail loudly here, never at the grader's gate.
const written = readFileSync(join(landed[0], "entry.txt"), "utf8");
if (written !== JOKE) {
  throw new Error("entry.txt does not contain exactly the chosen joke");
}

process.stdout.write(JOKE);
