# Issue #10: No Dependency Caching in CI

**Priority:** MEDIUM
**Importance:** Medium
**Impact:** Low
**Effort:** Low

## Problem

`.github/workflows/main.yml` doesn't cache npm dependencies. Every build:
- Downloads all node_modules (830KB package-lock.json)
- Wastes CI minutes
- Slows down PR feedback
- Unnecessary network usage

## Current State

```yaml
- name: Install NPM dependencies
  run: npm ci
# No caching configured
```

## Solution

Add dependency caching:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'  # Add this line

- name: Install dependencies
  run: npm ci
```

Or explicit caching:

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Install dependencies
  run: npm ci
```

## Expected Impact

- **Faster builds:** 30-60 seconds faster
- **Reduced costs:** Fewer CI minutes used
- **Better experience:** Quicker PR feedback

---

## Agent Prompt

```
Add npm dependency caching to GitHub Actions workflow for faster builds.

Tasks:
1. Update .github/workflows/main.yml
2. Add cache configuration to setup-node step
3. Test that caching works correctly
4. Document the change

Expected outcome:
- Dependencies cached between runs
- Faster CI builds
- Reduced resource usage
```
