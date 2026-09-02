---
name: release
description: Perform a release for the ORD specification
---

# Release Process for ORD Specification

This skill guides the release process for creating a new version of the Open Resource Discovery (ORD) specification.

## Pre-Release Checklist

1. **Verify branch name matches version**
   - Branch should be `release/vX.Y.Z`
   - Check with: `git branch --show-current`

2. **Verify version numbers are consistent**
   - Check `package.json` version field
   - Check `package-lock.json`, if not in sync, run `npm install` to update
   - Check `CHANGELOG.md` has section for this version
   - Ensure they match the branch name

3. **Review all commits since last release**
   ```bash
   git log $(git describe --tags --abbrev=0)..HEAD --oneline
   ```
   - Verify each PR/commit with end-user or interface impact is documented in CHANGELOG.md
   - Infrastructure changes (CI/CD, workflows) and chore tasks don't need changelog entries
   - Focus on: new features, bug fixes, breaking changes, deprecations

4. **Verify x-introduced-in-version markers**
   - All new properties/objects introduced in this release MUST have `x-introduced-in-version: "X.Y.Z"` marker
   - Check new properties added:
     - On object definitions (e.g., `File:`, `RelatedApiResource:`)
     - On properties within objects (e.g., `files:`, `relatedApiResources:`)
     - On enum values (e.g., new `releaseStatus` values)
   - Search for any `x-introduced-in-version` with incorrect versions (future versions or wrong release) in `spec/v1/Document.schema.yaml`
   - If incorrect version markers are found, fix them to match the current release version and commit the changes

5. **Run full build and tests**
   ```bash
   npm run build
   npm run test
   ```
   - Build must succeed without errors
   - All tests must pass

6. **Check for uncommitted changes**
   ```bash
   git status
   ```
   - Working directory should be clean before release

## Release Steps

Once all checks pass:

1. **Commit any final fixes**
   - If x-introduced-in-version markers were added/fixed, commit those changes
   - Include any other last-minute documentation or schema fixes

2. **Create Pull Request**
   - Create PR from `release/vX.Y.Z` to `main`
   - Use changelog content as PR description
   - Request review from maintainers

3. **User actions required** (inform the user):
   - Review and merge the PR to main
   - The GitHub Actions workflow will automatically:
     - Create the git tag `vX.Y.Z`
     - Publish to npm registry
     - Create a GitHub release with changelog notes
   - Announce the release to relevant stakeholders if needed

## Common Issues

- **Version mismatch**: Ensure package.json, CHANGELOG.md, and branch name all use the same version
- **Missing x-introduced-in-version**: New features must be annotated with version markers
- **Build failures**: Usually due to missing generated files - run `npm run generate` first
- **Test failures**: Don't proceed with release if tests fail - fix issues first
