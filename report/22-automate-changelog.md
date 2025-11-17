# Issue #22: No Automated Changelog Generation

**Priority:** LOW
**Importance:** Low
**Impact:** Low
**Effort:** Low

## Problem

CHANGELOG.md is manually maintained:
- Time-consuming
- Easily forgotten
- Inconsistent format
- Missing entries

## Solution

Use conventional-changelog to automate:

```bash
npm install --save-dev conventional-changelog-cli
```

Add script to package.json:
```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "changelog:reset": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0"
  }
}
```

Generate changelog from commits:
```bash
npm run changelog
```

Requires: #18 (Conventional Commits) to be implemented first.

---

## Agent Prompt

```
Set up automated changelog generation from conventional commits.

Prerequisites:
- Conventional commits must be in use (#18)

Tasks:
1. Install conventional-changelog-cli
2. Add changelog scripts to package.json
3. Test changelog generation
4. Document process in RELEASE.md
5. Add to release workflow

Expected outcome:
- Automated changelog generation
- Consistent format
- Less manual work
```
