---
name: Uploaded learning content verification
description: Verify seeded educational content against the user's supplied source before presenting the first build.
---

Design scaffolds may invent sample content even when the user supplied a real lesson file. Always compare the seeded words, chapter names, and examples against the source document before shipping, especially for educational tools where incorrect content breaks trust.

**Why:** The first generated vocabulary set did not match the attached course PDF, so the source had to be re-read and the content separated into a verified source file.

**How to apply:** For apps built from uploaded lessons, inspect the source first, then treat extracted content as a separate source-of-truth from the visual implementation.