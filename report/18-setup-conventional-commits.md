# Issue #18: No Conventional Commits Setup

**Priority:** LOW
**Importance:** Low
**Impact:** Low
**Effort:** Low

## Problem

No standard for commit messages:
- Inconsistent formats
- Hard to generate changelogs
- Unclear what changed
- No semantic versioning automation possible

## Solution

Adopt Conventional Commits specification:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

Configure commitlint:
```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // New feature
      'fix',      // Bug fix
      'docs',     // Documentation
      'style',    // Formatting
      'refactor', // Code refactoring
      'test',     // Tests
      'chore',    // Maintenance
    ]],
  },
};
```

Add commit-msg hook:
```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

---

## Agent Prompt

```
Set up Conventional Commits with commitlint.

Tasks:
1. Install commitlint dependencies
2. Create commitlint.config.js
3. Add commit-msg hook with Husky
4. Document commit message format in CONTRIBUTING.md
5. Add examples of good commit messages

Expected outcome:
- Commit messages follow standard format
- Automated validation
- Foundation for automated changelogs
```
