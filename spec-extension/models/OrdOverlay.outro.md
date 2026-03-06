## Open TODOs

**Overlay `ordId`:**

- Decide whether the overlay document itself needs a stable `ordId`.
- If overlays are published only via the configuration endpoint, define what that stable ID should represent.
- Decide whether `ordId` stays optional or becomes mandatory.

**Target resolution and matching:**

- Decide what should be optional vs mandatory on `target`.
- Decide whether transparency-oriented fields such as `url` and `correlationIds` stay in the model.
- Align the spec-level target identifiers with reference merge behavior, especially when `requireTargetMatch` is enabled.

**Extension model naming:**

- Decide how model extensions should avoid interface-name collisions with ORD core models.
- Confirm whether extension-local definitions should always use an explicit prefix such as `Overlay...`.

**Patch value model:**

- Decide whether `PatchValue` should remain an explicit JSON-type union or become a truly unconstrained value (`unknown` / `any`) once the toolkit supports that shape cleanly.
- Decide whether `null` should be supported as an explicit standalone patch value outside `remove` masks.

**OData selectors:**

- Validate the `operation` selector mapping with OData experts.
- Best current guess: map selector `operation` to schema-level `Action`/`Function` names, preferring fully-qualified names, or to container-level `ActionImport`/`FunctionImport` names when exposed via the entity container.
- Define the implementation roadmap for `entityType` and `propertyType` selector support in the reference merge library.

Reference: [OData CSDL XML 4.01](https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html).
