---
name: release
description: Prepare and publish an Open Resource Discovery specification release. Use when selecting a version, preparing a release/vX.Y.Z pull request, validating release metadata, or running and verifying the release workflow.
compatibility: Requires Git, Node.js, npm, GitHub CLI authentication, and network access to GitHub and NPM.
---

# Release the ORD specification

Prepare releases through pull requests and publish them with the repository release workflow.

## Golden rule

A pull request that changes the published specification MUST NOT be merged unless a release will be created immediately afterward.

The documentation site is built from main, while versioned consumers use the tagged and NPM-published specification.

Delaying the release therefore makes the documentation describe a contract that consumers cannot obtain as a release.

Batch related specification changes before merging them, not on main after the first contract-changing merge.

Documentation corrections that do not change the contract do not require a release.

## Guardrails

- Never commit, push, merge, tag, publish, or dispatch a workflow unless the user explicitly authorizes it.
- Never push to main or merge locally into main.
- Never merge the release pull request. The user always merges it themselves, even after they authorize the rest of the release.
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

A property that reuses a shared anchor with `<<: *anchor` still needs its own x-introduced-in-version, because the merge does not supply one.

New values in extensible enums (anyOf `const` lists) follow the surrounding convention and are usually not individually tagged.

Finalize the dated version header in the release pull request itself, do not leave the notes under ## [unreleased] for the workflow to date later.

Rename ## [unreleased] to the dated version section and leave a new empty ## [unreleased] above it, matching the exact format the release action produces:

    ## [unreleased]

    ## [[X.Y.Z](https://github.com/open-resource-discovery/specification/releases/tag/vX.Y.Z)] - YYYY-MM-DD

Use the planned release date for YYYY-MM-DD, and update it if the release slips to another day before publishing.
The version in the link and heading MUST match package.json, and the tag MUST be vX.Y.Z.

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

Describe the release scope and corrections in the pull request body, but do not paste the changelog section into the body itself.
The finalized dated changelog section belongs in CHANGELOG.md on the branch, not in the pull request description.

Wait for checks and review. The user merges the release pull request themselves, so never merge it, and continue to the publish step only after it has merged.

## Why the changelog header is finalized in the release pull request

The release action rewrites the changelog only when it cannot find the version already present.
When CHANGELOG.md already contains the dated ## [[X.Y.Z](...)] section, the action takes its no-change branch: it reuses that section as the release body and skips opening a changelog pull request.
When the version is absent, the action instead opens a separate changelog pull request and stops, requiring a second workflow run after that pull request merges.

Finalizing the header in the release pull request therefore avoids the fragile two-run handshake.
It keeps the changelog correct at the moment the release pull request merges, removes the window where main describes a released state that has no tag yet, and avoids release-body drift if other changes merge between runs.
The separate GitHub-release-only run (-f npm=false -f githubRelease=true) is then unnecessary.

## Publish and verify

After the release pull request merges, confirm main contains X.Y.Z and the dated CHANGELOG.md section, then run both jobs.

    gh workflow run release.yml --ref main -f npm=true -f githubRelease=true

Because the changelog already contains X.Y.Z, the action skips the changelog pull request and proceeds to publish @open-resource-discovery/specification, then creates the vX.Y.Z tag and GitHub release from main.

Confirm the tag and GitHub release do not already exist before this run, because the action fails if the release for the tag is already present.

    gh run list --workflow=release.yml --limit 5
    gh release view vX.Y.Z
    npm view @open-resource-discovery/specification version
    git ls-remote --tags origin refs/tags/vX.Y.Z

All artifacts must report X.Y.Z.

If the workflow fails, understand the failed job before retrying and request explicit approval before any manual recovery.
