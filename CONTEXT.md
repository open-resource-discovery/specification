# Open Resource Discovery

Open Resource Discovery (ORD) describes the resources and capabilities exposed by systems and makes those descriptions discoverable across system landscapes.

## Perspectives

**Static baseline**:
A complete, tenant-independent description of a system type or a specific system version.
_Avoid_: Generic tenant

**Complete system-instance perspective**:
A self-contained description of the effective ORD metadata for one running system instance; it does not inherit from a static baseline.
_Avoid_: Instance delta, tenant patch

**System-instance delta**:
A baseline-relative set of complete ORD entries that differ, or can differ, for one system instance; omitted entries are inherited unchanged from the applicable static baseline.
_Avoid_: System-instance diff, system-instance difference, system-instance overlay

**Effective system-instance view**:
The complete ORD description of one system instance, obtained directly from its complete perspective, by composing its delta with a static baseline, or by falling back to that baseline.
_Avoid_: Merged document
