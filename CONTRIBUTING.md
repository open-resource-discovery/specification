# Contributing to Open Resource Discovery

## Code of Conduct

All members of the project community must abide by the [LF Europe Code of Conduct](https://linuxfoundation.eu/policies/code-of-conduct).
Only by respecting each other can we develop a productive, collaborative community.
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported per [`Notices.md`](./Notices.md), or by creating a [GitHub issue](https://github.com/open-resource-discovery/specification/issues).

## Contributor License Agreement

Open Resource Discovery is developed under the [**Community Specification License 1.0**](./Community_Specification_License-v1.md). Before a first contribution can be merged, contributors must agree to the [Community Specification Contributor License Agreement](./Community_Specification_Contributor_License_Agreement.md), which binds participants to the specification's license, governance, and contribution policies, and the [LF Europe Code of Conduct](https://linuxfoundation.eu/policies/code-of-conduct).

> **Open question:** Whether agreement is captured via an automated CLA bot (e.g., EasyCLA) or via another mechanism is to be decided by the [ORD Steering Committee](https://github.com/open-resource-discovery/steering).

## Contributing with AI-generated code

See [CONTRIBUTING_USING_GENAI.md](./CONTRIBUTING_USING_GENAI.md).

## Steps to Contribute

- Before implementing your change, create an issue that describes the problem you would like to solve or the code that should be enhanced. Please note that you are willing to work on that issue.

- The team will review the issue and decide whether it should be implemented as a pull request. In that case, they will assign the issue to you. If the team decides against picking up the issue, the team will post a comment with an explanation.

Should you wish to work on an issue, please claim it first by commenting on the GitHub issue that you want to work on. This is to prevent duplicated efforts from other contributors on the same issue.

If you have questions about one of the issues, please comment on them, and one of the maintainers will clarify.

## Contributing Code or Documentation

You are welcome to contribute code in order to fix a bug or to implement a new feature that is logged as an issue.

The following rules govern contributions:

- Specification content (under `spec/`, `spec-extension/`, `docs/`, and the published specification documents) is contributed under the [Community Specification License 1.0](./Community_Specification_License-v1.md).
- Source code, sample/reference code, build tooling, and the Docusaurus site configuration are contributed under the [Apache License, Version 2.0](./LICENSES/Apache-2.0.txt).
- See [`License.md`](./License.md) and [`REUSE.toml`](./REUSE.toml) for the authoritative per-path licensing.

## Generated Artifacts and Review Process

This repository checks in certain generated files (TypeScript types and UMS types). We intentionally commit these artifacts so pull requests clearly show the impact on those interfaces and downstream consumers during review.

- What is generated: TypeScript interfaces referenced unde `dist/generated/spec/v1` and `src/generated` and UMS types referenced under `spec/v1` and `src/generated/`.
- How to generate: run `npm run generate` (this executes the spec toolkit and copies results via the postgenerate step).

### CI verification

To prevent accidental divergence, our CI runs `npm run generate` and fails if it produces changes that are not committed. This protects the main branch from merging updates that forgot to regenerate.

### Local pre-commit hook (optional)

We provide a pre-commit hook via [Lefthook](https://github.com/evilmartians/lefthook) that automatically runs `npm run generate` before each commit and re-stages any changed files. This helps ensure generated artifacts are always included.

Enable it locally:

```
npm i -D lefthook
npx lefthook install
```

## Issues and Planning

- We use GitHub issues to track bugs and enhancement requests.

- Please provide as much context as possible when you open an issue. The information you provide must be comprehensive enough to reproduce that issue for the assignee.
