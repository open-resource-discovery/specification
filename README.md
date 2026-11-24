[![REUSE status](https://api.reuse.software/badge/github.com/open-resource-discovery/specification)](https://api.reuse.software/info/github.com/open-resource-discovery/specification)
<a href="https://www.npmjs.com/package/@open-resource-discovery/specification"><img src="https://img.shields.io/npm/v/@open-resource-discovery/specification" alt="NPM package"></a>

# Open Resource Discovery Specification

![Open Resource Discovery Logo](./static/img/open-resource-discovery-logo-wide.png "Open Resource Discovery Logo")

## Summary

Open Resource Discovery (ORD) is a protocol that **enables applications and services to self-describe their exposed resources and capabilities**. It supports both static documentation and runtime tenant-specific configuration and extensions.

**To learn more, have a look at the [Open Resource Discovery Specification](https://open-resource-discovery.org/) documentation.**

> ℹ ORD is an open standard by SAP, currently geared towards the SAP ecosystem.
> However, it is designed as a generic standard that can be used outside SAP with appropriate infrastructure (aggregators and namespace registry).
> The standard is extensible through extensibility attributes, custom types, and policy levels.

## Communication, Feedback & FAQ

If you have feedback, questions or problems, please create a [GitHub issue](https://github.com/open-resource-discovery/specification/issues).

## Ownership and Governance

The ORD standard is governed by the [Linux Foundation](https://www.linuxfoundation.org/) / [NeoNephos](https://neonephos.org/), a neutral nonprofit organization that supports the development of open-source projects and standards. See [ORD steering committee](https://github.com/open-resource-discovery/steering#readme).

## Resources

### Tools and Examples

#### ORD Reference Application

Explore the public and demo-authenticated tenant-specific metadata of the [ORD Reference Application](https://ord-reference-application.cfapps.sap.hana.ondemand.com/) in its embedded [ORD Explorer](https://github.com/open-resource-discovery/explorer).
The [reference application source](https://github.com/open-resource-discovery/reference-application) shows how the ORD Provider endpoints are implemented.

#### ORD Example Data

- Within this repository: [examples/](./examples/).

#### Diagrams

See [diagram sources and synchronization](./diagrams/README.md) for the shared graph data and the matching React and Vue diagrams in the specification site and presentation.

## Package Compatibility

The published npm package contains JSON schemas and TypeScript contracts, with no production dependencies.
It supports Node.js 24 and later with npm 11 and later.
CI, documentation generation, and publishing use Node.js 26.

## Development Install Policy

The published package retains its Node.js 24 and npm 11 minimums.
Repository development requires npm 11.20 or later to enforce install-script approvals; CI selects npm 11.20.0 on Node.js 26.
Run `npm ci` to install the committed lockfile.

Install-time scripts are approved only for the reviewed versions of SWC (native compiler bindings), fsevents (native file watching), and Lefthook (local hook installation).
The core-js funding notification script is denied.
Before approving a new script or version, inspect it with `npm install-scripts ls` and review the corresponding `allowScripts` entry in `package.json`.
The repository's own generation pre- and post-scripts continue to run normally.

Ordinary dependency resolution has a one-day release-age cutoff, and installs fail on engine or peer-dependency mismatches.
For an urgent reviewed security fix blocked by that cutoff, pass `--min-release-age-exclude=<package>` only for the affected package and document the exception in the update PR.
Renovate retains its separate three-day ordinary-update policy and immediate security-alert policy.

Publishing requests npm provenance through `publishConfig` and needs a supported provenance provider.
The existing GitHub release workflow already grants OIDC permission to the npm publishing job.

## History

For detailed and recent changes, please refer to the [CHANGELOG.md](CHANGELOG.md).

## Acknowledgements

- The original idea for ORD came from Harsh Jegadeesan and Divya Mary.
- The currently active core-contributors to the spec are: [Simon Heimler](https://github.com/Fannon), [Sebastian Wennemers](https://github.com/swennemers), [Pavel Kornev](https://github.com/pavelkornev), [Steffen Göbel](https://github.com/steffengoebel), [Ralf Hofmann](https://github.com/ormos), [Kiril Kabakchiev](https://github.com/KirilKabakchiev), [Nikolay Mateev](https://github.com/NickyMateev), [Bibin Thomas](https://github.com/Bibin-T) and others.

## License

Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/open-resource-discovery/specification).

## Open Resource Discovery and NeoNephos

Open Resource Discovery has been donated to the NeoNephos Foundation, a Linux Foundation initiative dedicated to advancing open-source projects that align with the strategic objectives of IPCEI-CIS under neutral governance. Learn more about NeoNephos and our role within it [here](https://neonephos.org/).

<p align="center"><img alt="Bundesministerium für Wirtschaft und Energie (BMWE)-EU funding logo" src="https://apeirora.eu/assets/img/BMWK-EU.png" width="400"/></p>
