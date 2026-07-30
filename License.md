# Licenses

This repository intentionally uses different licenses for the normative ORD
standard and for its machine-readable interfaces and implementation material.
The license follows the artifact, not the directory name or whether the
artifact contains technical requirements.

## Normative ORD Specification

The normative ORD standard is available under the **Community Specification
License 1.0** (`Community-Spec-1.0`). This currently comprises:

- the core specification and concept pages under `docs/spec-v1/`;
- the human-readable interface reference published from those sources; and
- the registered specification-extension documents under
  `docs/spec-extensions/`.

Normative YAML schema, OpenAPI, and UMS sources under `spec/v1/` and
`spec-extension/models/` are dual-licensed as
**`Community-Spec-1.0 OR Apache-2.0`**. The Community Specification alternative
places their normative requirements within the Specification; the Apache
alternative supplies the license used for generated implementation artifacts.

The exact tracked source paths and license expressions are enumerated in
[`REUSE.toml`](https://github.com/open-resource-discovery/specification/blob/main/REUSE.toml).
Navigation, examples, generated diagrams, and the interactive schema explorer
are not made normative merely because they are published on the documentation
site.

The full license text is available in
[`LICENSES/Community-Spec-1.0.txt`](./LICENSES/Community-Spec-1.0.txt).
The patent commitments apply only within the scope defined by
[`Scope.md`](https://github.com/open-resource-discovery/specification/blob/main/Scope.md);
the copyright license assigned to an artifact does not expand that patent
scope.

## Schemas, Packages, Examples, and Tooling

The following are licensed solely under the **Apache License, Version 2.0**
(`Apache-2.0`):

- every generated JSON Schema and machine-readable copy of the normative YAML
  sources, including files
  under `src/generated/`, `dist/`, `static/spec-v1/interfaces/`, and
  `static/spec-extension/`;
- generated TypeScript types and the
  `@open-resource-discovery/specification` npm package;
- examples, generated example pages, and generated schema diagrams;
- validators, build tooling, Docusaurus/site code, configuration, automation,
  and other implementation material.

Unless a file is explicitly listed as normative specification material or
carries another license marker, Apache-2.0 is the repository default. The full
Apache-2.0 text is in
[`LICENSES/Apache-2.0.txt`](./LICENSES/Apache-2.0.txt).

## Derived Artifacts

The generated Markdown/HTML interface reference is published as part of the
human-readable normative specification under `Community-Spec-1.0`. Its YAML
sources remain available under both licenses; generated JSON Schemas,
TypeScript declarations, UMS artifacts, and npm distributions use the
`Apache-2.0` alternative. This distinction is intentional and lets the
human-readable specification and machine-readable implementation artifacts
follow different distribution terms without removing the Apache grant from
the source.

## Per-File Licensing

There is no rule that one of these licenses takes priority over the other.
The applicable license is determined per artifact. Tracked-file license and
copyright information is recorded in
[`REUSE.toml`](https://github.com/open-resource-discovery/specification/blob/main/REUSE.toml);
the [REUSE compliance report](https://api.reuse.software/info/github.com/open-resource-discovery/specification)
checks that mapping.
