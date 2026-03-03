:::caution Alpha
This specification is in **alpha** and subject to change.
:::

Use ORD Overlays to patch the ORD resources themselves, e.g. to add `partOfGroups` assignments, `labels`, and other ORD-level metadata.

This allows external parties to enrich or annotate ORD resources without modifying the original ORD documents.
This can be necessary when the ownership or lifecycle of the original ORD documents is different from the enhancements in the overlay.

:::warning
Incompatible ORD-level changes are not allowed through ORD Overlays.
Only additive or non-breaking changes (such as adding group assignments or labels) are permitted.
:::
