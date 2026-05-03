---
inclusion: always
---

# Git Workflow

## Hard Rules — Never Do These

- Never `git reset --hard`
- Never `git checkout -- <path>` or `git restore <path>`
- Never `git clean`
- Never `git stash drop`
- Never `git push --force`
- Never `git add .` or `git add -A`
- Never `git commit -a` or `git commit -o -- <path>`
- Never overwrite a file that may have uncommitted changes

## Always Do These

- Stage explicit paths only: `git add path/to/file.tsx`
- Use inline branch guard before commits:
  ```bash
  test "$(git branch --show-current)" = "<your-branch>" && git commit -m "..."
  ```
- Commit early and often — uncommitted work is the most fragile state
- Before any "restore from git" operation, first survey: working tree, stashes, branches, reflog, and `git fsck --lost-found`

## Branches

- Never push directly to `main` or `master`
- Always push to a new branch: `git push -u origin <branch-name>`
- Use `gh pr create` to open pull requests

## PR Guidelines

- PR titles: concise, under 70 characters
- Use the description for details: summary of changes, what was tested, any blocked features

## Remote

- Remote: `https://github.com/yuwilson105/Kiro_Hackathon.git`
- Confirm push credentials before first push — remote account differs from local setup
