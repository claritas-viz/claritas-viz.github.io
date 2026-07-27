# Claritas website agent instructions

## Site and visualization-documentation invariants

- Keep product claims, supported query languages, examples, screenshots, API links, install instructions, and demos aligned with the data-visualization server and published releases.
- Preserve accessible semantic HTML, keyboard navigation, visible focus, text alternatives, responsive layouts, color-contrast requirements, and non-color encodings for data meaning.
- Browser tests must cover real built/previewed output. Security relaxations such as `--no-sandbox` are permitted only in explicitly constrained CI environments and must never become production runtime defaults.
- Keep Playwright/Puppeteer or other browser suites deterministic, bounded, and leak-free. Do not weaken assertions merely to accommodate a product regression.
- GitHub Pages deployment must publish the exact reviewed and tested source. Pin Actions, minimize permissions, avoid persisted credentials, and keep deployment provenance explicit.
- Do not expose secrets, sensitive datasets, unreviewed third-party scripts, unsafe HTML, or telemetry containing user content.

## Instruction discovery

Resolve `$PWD`, walk upward through every parent directory to the filesystem root, read every readable lowercase `agents.md` on that ancestor chain, and apply them root-to-leaf. Do not search siblings. Deduplicate resolved paths/inodes, avoid symlink cycles, and report unreadable files.

## Synchronize with the remote

Before editing, inspect `git status`, current branch, configured remotes, and the default branch. Run `git fetch --all --prune` and create the feature branch from the latest remote default branch. Fetch again before pushing and incorporate upstream changes with `git merge` or `git pull` on a clean working tree.

- avoid git rebase in favor of git merge.
- Never discard remote commits, force-push, rewrite shared history, bypass review, or bypass required CI.

## Resolve Git conflicts semantically

Resolve conflicts by understanding and combining both sides' intent. Do not mechanically choose `ours`, `theirs`, current, or incoming changes. Produce the conceptually correct result while preserving accurate product documentation, accessibility, browser-test coverage, CI-only sandbox exceptions, Pages provenance, security/privacy, tests, configuration, and public URLs. Regenerate built output from merged source rather than selecting one side's generated files. If intentions are incompatible, make the smallest explicit design decision and document it in the pull request.

After resolving, reread every affected file from the top, run site checks/builds, browser tests in local and CI-equivalent modes, accessibility/link validation, and workflow validation, then search the entire worktree for conflict markers:

```sh
grep -RInE '^(<<<<<<<|=======|>>>>>>>)' --exclude-dir=.git .
```

If any marker or suspicious partial resolution remains, repeat semantic resolution from the top and rerun validation. A conflict is resolved only when the website is conceptually coherent and verified, not merely accepted by Git.