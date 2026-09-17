---
name: release
description: Prepare and publish an Open Resource Discovery specification release. Use when selecting a version, preparing a release/vX.Y.Z pull request, validating release metadata, or running and verifying the release workflow.
compatibility: Requires Git, Node.js, npm, GitHub CLI authentication, and network access to GitHub and NPM.
---

# Release the ORD specification

Prepare releases through pull requests and publish them with the repository release workflow.

## Guardrails

- Never commit, push, merge, tag, publish, or dispatch a workflow unless the user explicitly authorizes it.
- Never push to main or merge locally into main.
- Start release/vX.Y.Z from the current origin/main and preserve unrelated work.
- Commit with git commit --signoff and verify the Signed-off-by trailer before pushing.
- Do not create a tag manually in the normal release path.

## Select and audit the release

Use full Semantic Versioning for the NPM package, branch, and vX.Y.Z tag.

- MAJOR is for incompatible contract changes.
- MINOR is for backward-compatible functionality.
- PATCH is for backward-compatible fixes and clarifications.

Confirm that the version is newer than package.json and that neither the tag nor GitHub release exists.

The human-readable ORD specification version may omit the patch component, but package.json and package-lock.json must contain X.Y.Z.

Fetch tags and review all changes since the latest release.

    git fetch origin --tags
    git log LATEST_TAG..origin/main --oneline
    git diff LATEST_TAG..origin/main -- spec docs examples

Resolve LATEST_TAG with git describe --tags --abbrev=0 before running the review commands.

Ensure every consumer-visible change is represented under ## [unreleased] in CHANGELOG.md.

Exclude routine tooling, dependency, generated-file, test, and CI changes unless consumers observe them.

Check new schema objects, properties, and enum values under spec/v1/ and spec-extension/models/ for the correct x-introduced-in-version value.

Leave the notes under ## [unreleased] because the workflow creates the dated version section later.

## Prepare the release pull request

    git fetch origin --tags
    git switch -c release/vX.Y.Z origin/main
    npm version X.Y.Z --no-git-tag-version

The version command must update package.json and package-lock.json without creating a commit or tag.

Inspect dependency and security status, but do not silently bundle broad upgrades into the release.

    npm outdated
    npm audit
    npm audit --omit=dev

Report relevant findings and keep nonessential upgrades separate unless the user asks to include them.

Run the full verification loop.

    npm ci
    npm run lint
    npm run generate
    npm run test
    npm run build
    git status --short

Investigate unexpected generated changes.

Commit approved release changes with signoff, push the branch, and open it into main.

Describe the release scope and corrections in the pull request body, but do not add the finalized changelog section.

Wait for checks and review, and do not merge without explicit user authorization.

## Generate the changelog pull request

After the preparation pull request merges, confirm main contains X.Y.Z.

Run only the GitHub release job first.

    gh workflow run release.yml --ref main -f npm=false -f githubRelease=true

This run creates release-changelog-update/X.Y.Z and opens a pull request that moves unreleased notes into a dated version section.

The action then intentionally stops pending that pull request.

Review the generated notes for completeness, categorization, release link, and accidental tooling-only entries.

Do not merge without explicit user authorization.

## Publish and verify

After the changelog pull request merges, run both jobs.

    gh workflow run release.yml --ref main -f npm=true -f githubRelease=true

The workflow publishes @open-resource-discovery/specification, then creates the vX.Y.Z tag and GitHub release from main.

Never publish NPM on the first run because publishing before the changelog merge leaves a partially completed release and makes the same package version impossible to republish.

    gh run list --workflow=release.yml --limit 5
    gh release view vX.Y.Z
    npm view @open-resource-discovery/specification version
    git ls-remote --tags origin refs/tags/vX.Y.Z

All artifacts must report X.Y.Z.

If the workflow fails, understand the failed job before retrying and request explicit approval before any manual recovery.
