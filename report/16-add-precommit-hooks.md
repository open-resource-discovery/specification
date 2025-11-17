# Issue #16: No Pre-commit Hooks for Quality Checks

**Priority:** MEDIUM
**Importance:** Medium
**Impact:** Medium
**Effort:** Low

## Problem

No pre-commit hooks exist to:
- Validate code before commit
- Run linters automatically
- Format code consistently
- Check for common mistakes

Results in:
- Invalid commits pushed
- CI failures after push
- Inconsistent code quality
- Wasted time in code review

## Solution

Use Husky + lint-staged for pre-commit hooks:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Configure `.husky/pre-commit`:
```bash
#!/bin/sh
npx lint-staged
```

Configure lint-staged in `package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,mdx}": [
      "prettier --write"
    ],
    "examples/**/*.json": [
      "node scripts/validate-examples.js"
    ]
  }
}
```

Benefits:
- Catch issues before commit
- Automatic formatting
- Validate examples
- Faster CI feedback

---

## Agent Prompt

```
Add pre-commit hooks using Husky and lint-staged.

Tasks:
1. Install husky and lint-staged
2. Initialize husky: npx husky init
3. Configure pre-commit hook
4. Add lint-staged configuration to package.json:
   - Lint and format TypeScript files
   - Format JSON/Markdown files
   - Validate example files
5. Create scripts/validate-examples.js for example validation
6. Test hooks work correctly
7. Document in CONTRIBUTING.md

Expected outcome:
- Pre-commit validation working
- Code formatted automatically
- Examples validated before commit
- Fewer CI failures
```
