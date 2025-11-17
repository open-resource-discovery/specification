# Issue #23: No Release Process Documentation

**Priority:** LOW
**Importance:** Low
**Impact:** Low
**Effort:** Low

## Problem

`.github/workflows/release.yml` exists but process is not documented:
- How to create a release
- When to bump versions
- What to include in release notes
- NPM publishing steps
- GitHub release creation

Maintainers must figure it out or rely on institutional knowledge.

## Solution

Create `RELEASE.md` documenting the release process:

```markdown
# Release Process

## Prerequisites
- Maintainer access
- NPM publish rights
- GitHub release permissions

## Steps

### 1. Prepare Release
1. Update version in package.json
2. Update CHANGELOG.md
3. Run tests: npm test
4. Build: npm run build
5. Create PR with version bump

### 2. Merge and Tag
1. Merge PR to main
2. Create git tag: git tag v1.x.x
3. Push tag: git push origin v1.x.x

### 3. Publish
1. Go to GitHub Actions
2. Run "Release" workflow
3. Select NPM and GitHub Release options
4. Monitor workflow completion

### 4. Verify
1. Check NPM: npm view @open-resource-discovery/specification
2. Check GitHub releases
3. Verify documentation deployed

## Version Numbers
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

## Changelog
Update CHANGELOG.md before release with:
- Breaking changes
- New features
- Bug fixes
- Deprecations
```

---

## Agent Prompt

```
Document the release process for the ORD specification.

Tasks:
1. Create RELEASE.md with:
   - Step-by-step release instructions
   - Version numbering guidelines
   - Changelog requirements
   - NPM publishing process
   - GitHub release creation
   - Verification steps
2. Document prerequisites and permissions needed
3. Add troubleshooting section
4. Link from README.md and CONTRIBUTING.md

Expected outcome:
- Clear release process documented
- Maintainers can follow standard process
- Less room for error
- Onboarding easier for new maintainers
```
