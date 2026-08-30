import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("homepage exposes labeled Claritas integrations", async () => {
  const page = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
  const component = await readFile(new URL("../src/components/ClientShowcase.astro", import.meta.url), "utf8");
  for (const expected of ["SQL", "TypeScript / HTTP", "Native plan JSON", "MCP tool call", "does not yet publish"]) {
    assert.ok(page.includes(expected), `missing ${expected}`);
  }
  assert.match(component, /Select client language/);
  assert.match(component, /navigator\.clipboard/);
  assert.match(component, /prefers-reduced-motion/);
});

test("homepage exposes a sticky responsive header and separate access boundaries", async () => {
  const page = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
  assert.match(page, /class="site-header"/);
  assert.match(page, /position:sticky/);
  assert.match(page, /class="mobile-nav"/);
  for (const boundary of [
    "https://user.claritas-viz.github.io/",
    "https://org.claritas-viz.github.io/",
    "https://auth.claritas-viz.github.io/",
  ]) assert.ok(page.includes(boundary), `missing ${boundary}`);
});
