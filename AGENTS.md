# Agent Rules

Rules for AI agents (and humans) working in this repository.

## Forbidden — destructive operations

Never run, script, or suggest any of the following here:

- `rm` / `rm -rf` on tracked or untracked files (stage removals with `git rm` on a reviewed branch instead)
- `git rebase` (interactive or otherwise)
- `git reset` (any mode — `--soft`, `--mixed`, `--hard`)
- `git push --force` / `--force-with-lease` / `--force-if-includes`
- `git filter-repo`, `git filter-branch`, BFG, or any history-rewriting tool
- `git clean`
- `git checkout -- <path>` / `git restore` that discards uncommitted work
- deleting branches or tags (local `-D` or remote)
- amending commits that have been pushed

## Required workflow

- History is append-only. Fix mistakes with a new commit or `git revert` — never by rewriting.
- Changes land on `main` via feature branches; keep commits small and reviewable.
- **This repository is the source of truth.** The copy vendored into
  `ORESoftware/k8s-cluster` (under `remote/deployments/`) is a *secondary* submodule
  checkout — after merging here, bump the submodule pointer there. Do not edit the
  vendored copy directly.

## Build context

Path dependencies (`../../libs`, `../../submodules`) resolve only when this repo is
checked out at its `remote/deployments/` path inside the `k8s-cluster` superproject.
Full builds happen there; standalone CI is limited to hygiene and format checks by design.

## Repository-local Git worktrees

- Create or use a Git worktree only when the human operator explicitly authorizes it for the current task. Concurrency or a dirty checkout is not permission by itself.
- Put every authorized worktree at `<repository-root>/tmp/worktrees/<name>`; from the repository root, use `./tmp/worktrees/<name>`. Never place worktrees beside repositories or organization directories.
- Keep `tmp`, `temp`, `tmp/worktrees`, and `temp/worktrees` ignored in the repository-root `.gitignore`. Do not commit files from those directories.
- Relocate or remove a worktree only when the operator explicitly requests it. Before removal, preserve and publish intended changes, verify its commit is represented on the target branch, and confirm there are no tracked, untracked, ignored-sensitive, or in-use files that must survive. Remove it with `git worktree remove <path>` without `--force`; never delete a worktree directory with `rm`.
