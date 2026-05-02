# SecondChance — Hackathon Project

## Multi-agent setup

Ahmed routinely runs **7 sibling Claude agents** simultaneously against this repo, all sharing one working tree. Read `~/.claude/projects/-Users-ahmedufukserce-Desktop-SecondChance/memory/feedback_sibling_safety_prompt.md` and `feedback_multi_agent_protocol.md` before any git or Write operation.

Hard rules (full list in memory):
- **Never** `git reset --hard`, `git checkout -- <path>`, `git restore <path>`, `git clean`, `git stash drop`, `git push --force`, `git add .`, `git add -A`, `git commit -a`, `git commit -o -- <path>`.
- **Never** overwrite a file with sibling uncommitted changes via `Write`/`cp`/redirect.
- **Never** "restore from git" without first surveying working tree, stashes, branches, reflog, and `git fsck --lost-found`.
- Stage explicit paths only: `git add path/to/file.tsx`.
- Inline branch guard before commits: `test "$(git branch --show-current)" = "<your-branch>" && git commit -m "..."`.
- Commit early, commit often — uncommitted work is the most fragile state in a multi-agent session.

## Stack

TBD — picked at hackathon kickoff. When stack is chosen, add specifics here (frameworks, doc paths, design tokens, motion tokens, etc.).

## Repo

- Local: `/Users/ahmedufukserce/Desktop/SecondChance`
- Remote: `https://github.com/yuwilson105/Kiro_Hackathon.git` (different account from `gitbud`'s `AhmedUfukSerce` setup — confirm push credentials before first push)
