import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  sourceChapterSpecs,
  sourceWordCatalog,
} from "../artifacts/kambley-word-box/src/content.ts";
import { personalPrompts } from "../artifacts/kambley-word-box/src/data/personal-prompts.ts";
const course = JSON.parse(
  readFileSync(
    new URL(
      "../artifacts/kambley-word-box/src/data/course-exercises.json",
      import.meta.url,
    ),
  ),
);
const pages = JSON.parse(
  readFileSync(new URL("../docs/source-pages.json", import.meta.url)),
);
const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, "")
    .replace(/[.,]/g, "");
const source = normalize(pages.slice(6).join(" "));
test("all ten chapters, 70 word entries and 144 original prompts match the source", () => {
  assert.equal(sourceChapterSpecs.length, 10);
  assert.equal(sourceWordCatalog.length, 70);
  assert.equal(course.chapters.flatMap((c) => c.questions).length, 144);
  assert.deepEqual(
    course.chapters.map((c) => c.questions.length),
    [17, 17, 17, 16, 12, 13, 12, 12, 12, 16],
  );
  const ids = new Set();
  for (const c of course.chapters)
    for (const q of c.questions) {
      assert.ok(
        source.includes(normalize(q.prompt)),
        `Source prompt missing: ${q.prompt}`,
      );
      assert.ok(!ids.has(q.id));
      ids.add(q.id);
    }
  for (const [word, definition, example] of sourceWordCatalog) {
    assert.ok(
      source.includes(normalize(definition)),
      `Definition mismatch: ${word}: ${definition}`,
    );
    assert.ok(
      source.includes(normalize(example)),
      `Example mismatch: ${word}: ${example}`,
    );
  }
});
test("each word has a unique supplemental personal prompt", () => {
  assert.equal(personalPrompts.length, 70);
  assert.equal(new Set(personalPrompts).size, 70);
  assert.equal(course.introduction.length, 6);
});
