# ORD Push Publication Scope

## Status

**Accepted: Option 3 — ORD provider contribution, configured through onboarding (#233).**

Options 1 and 2 were discussed and rejected.

## Context and problem

ORD uses explicit tombstones to remove information. Some providers can list their current content but cannot track deleted items. These providers need deletion by omission: a complete publication replaces the previous set.

The aggregator needs a boundary for that set. An application can have several ORD providers, deployment pipelines, or teams. Omission from one provider's publication must not delete another provider's content.

For example, S/4HANA publishes APIs, while BDC publishes additional APIs for the same system. An S/4HANA replacement must preserve the BDC contribution.

Both pull and push need a clear replacement boundary. This decision establishes that boundary for push transport (#187). Pull-based replacement is a separate topic.

## Decision

### Accepted: Option 3 — ORD provider contribution

The publication scope is the content assigned to one onboarded ORD provider for the publishing system and applicable perspective. The aggregator derives the provider identity from authentication and onboarding.

A publishing system can supply content for several clients together. Those clients share a provider scope, while each item retains its own described-system context.

The provider selects replace mode when it submits a complete publication. Onboarding determines the boundary of that replacement.

- ORD documents need no new properties or resource labels.
- The boundary covers resources, Packages, Consumption Bundles, and other taxonomy.
- Separate replacement sets require separate onboarded ORD providers, for example one per deployment pipeline.
- The boundary remains aggregator metadata. The standard ORD model does not expose provider attribution.

Scope records which provider last published an item. It is not an authorization boundary or part of the item's identity.

### Rejected alternatives

| Option | Proposed boundary | Decision |
| --- | --- | --- |
| 1: `ord:publication-scope` Group (#230) | Resources assigned through `partOfGroups` | Rejected |
| 2: `Package.publicationMode` (#232) | Resources in a Package with `publicationMode: replace` | Rejected |

**Option 1** makes the boundary visible in ORD and can divide a Package into smaller sets. It adds a Group Type and another assignment that providers must maintain.

It covers resources with `partOfGroups`, but not Packages, Consumption Bundles, or other taxonomy. Group membership alone also needs a transport or onboarding binding to enable replacement.

**Option 2** reuses Package membership and makes replacement intent visible in ORD. It couples deletion to catalog structure and inherited metadata. Smaller sets require different Package assignments.

A Package property would turn omission into deletion. Partial retrieval complicates moves between Packages. An empty replacement requires an empty Package, contrary to the advice to avoid empty Packages.

This option also requires strict Package reference checks. Existing reference rules allow aggregators to accept dangling references, which do not provide a reliable deletion boundary.

Both alternatives still require provider attribution. Option 3 meets the requirement without adding scope concepts to the ORD model or changing Package semantics.

### ORD specification boundary

The ORD document schema remains unchanged. The push API accepts no `scopeId` or `providerId` supplied by the provider. The aggregator derives the scope from the authenticated provider's onboarding configuration.

Aggregator-specific query APIs can expose provider attribution. For example, UMS uses the technical property `umsProvidedBy`. This property is not part of the ORD document schema.

## Replace algorithm and provider attribution

For the publishing system and applicable perspective, a replace submission has two logical steps:

1. **Delete the current set.** Delete all content currently assigned to the authenticated provider's scope.
2. **Publish the new set.** Merge the submitted content by ORD ID and assign it to that provider's scope.

Item matching uses the ORD ID within the item's described-system and perspective context. The same ORD ID in two client contexts does not identify the same stored item.

The second step creates new items and updates existing items. An existing item can have no scope or a different provider's scope. In both cases, the submission assigns the item to the current provider.

These are logical steps within the push transaction. They do not require separate client calls or an intermediate, publicly visible deletion.

The same algorithm applies to the first push. If the provider's scope is empty, step 1 deletes nothing. Step 2 assigns the submitted content to that scope.

### Responsibility for conflicts

**No strict ownership guardrails or explicit ownership-transfer APIs are required.** A provider can take over an existing item by publishing its ORD ID. No prior removal or separate ownership claim is necessary.

The Line of Business (LOB) is responsible for configuring its ORD providers correctly. If configured providers conflict, the LOB must coordinate them and keep their publications consistent.

For example, when `bar` takes over an API from `foo`, `foo` must stop publishing that API. Otherwise, the next publication from `foo` assigns it back to `foo`.

Authentication and onboarding still determine who can publish for the application. Provider attribution does not add a separate permission check between its configured providers.

### Example: from pull to push, then between providers

All rows below belong to the same system and perspective context. The scope column shows aggregator metadata, not an ORD property. `Unassigned` means no provider scope exists for that item.

#### 1. Initial pull content

Pull supplies three application APIs and one BDC API. None has a scope.

| ORD ID | Scope |
| --- | --- |
| `foo:apiResource:api1:v1` | Unassigned |
| `foo:apiResource:api2:v1` | Unassigned |
| `foo:apiResource:api3:v1` | Unassigned |
| `sap.bdc.foo:apiResource:dpApi1:v1` | Unassigned (Pull from different provider) |

#### 2. Provider `foo` replaces with API 1 and API 2

The aggregator derives scope `foo` from onboarding. Its current set is empty, so nothing is deleted. The aggregator updates API 1 and API 2 and assigns both to `foo`.

| ORD ID | Scope |
| --- | --- |
| `foo:apiResource:api1:v1` | `foo` |
| `foo:apiResource:api2:v1` | `foo` |
| `foo:apiResource:api3:v1` | Unassigned |
| `sap.bdc.foo:apiResource:dpApi1:v1` | Unassigned |

API 3 and the BDC API remain unchanged. Neither belonged to `foo`, and neither appears in this submission.

#### 3. Provider `bar` replaces with API 2

Scope `bar` is empty, so nothing is deleted. The aggregator updates API 2 and changes its scope from `foo` to `bar`. This is not a duplicate-ID conflict.

| ORD ID | Scope |
| --- | --- |
| `foo:apiResource:api1:v1` | `foo` |
| `foo:apiResource:api2:v1` | `bar` |
| `foo:apiResource:api3:v1` | Unassigned |
| `sap.bdc.foo:apiResource:dpApi1:v1` | Unassigned |

The LOB coordinates the change so that `foo` stops publishing API 2.

#### 4. Provider `foo` replaces with API 4

The aggregator deletes API 1, the only item still assigned to `foo`. It then creates API 4 and assigns it to `foo`.

| ORD ID | Scope |
| --- | --- |
| `foo:apiResource:api2:v1` | `bar` |
| `foo:apiResource:api3:v1` | Unassigned |
| `foo:apiResource:api4:v1` | `foo` |
| `sap.bdc.foo:apiResource:dpApi1:v1` | Unassigned |

API 2 remains under `bar`. API 3 and the BDC API remain unassigned. Omission deletes only content in the provider's current scope.

## Legacy pulled content and scope for pull

Replacement addresses a provider that knows its complete current content but does not know everything it published in the past. It does not support an incomplete current set: omission deletes items already assigned to its scope.

A push assigns a scope only to the items it includes. It does not automatically remove obsolete pull content that it omits. API 3 in the example remains until someone explicitly removes it.

**Replacement does not resolve this historical cleanup gap.** If API 3 no longer exists and the provider no longer knows about it, the provider cannot include it or name it in a tombstone. Later replacements also leave it unassigned.

This limitation applies to all three discussed options. None can automatically identify unknown historical content outside its replacement boundary, whether that boundary is a Group, a Package, or an onboarded provider's contribution.

The application can query existing ORD IDs and submit tombstones for obsolete content. For a clean start, it can identify and tombstone its previous content before the new publication.

That cleanup must preserve content from other providers. An unassigned scope alone does not identify obsolete content: the example's BDC API is also unassigned.

Queries reveal stored content, but do not establish which unassigned items belonged to this provider. Cleanup therefore requires enough information to identify its obsolete content. Without that information, stale content remains.

Once content is assigned to the provider's scope, later replacements remove it by omission. The provider then needs only its complete current set, without a history of deleted items.

Pull configuration remains unchanged. Scope assignment for pull endpoints and pull-based replacement belong in a separate feature or issue.

## Reference model: MAP onboarding and S/4HANA

This section describes the agreed MAP/UMS reference model. The configuration and technical query properties are aggregator-specific, not additions to the ORD schema.

### Push provider configuration

Each push provider has a mandatory `name`, unique within its MAP configuration. The name is a local identifier, such as `abap` or `bdc`. It does not need to contain a system or tenant ID.

The following configuration excerpt shows two push providers. The certificate subject and issuer values are placeholders.

```json
{
  "namespace": "sap.s4",
  "openResourceDiscovery": {
    "providers": [
      {
        "name": "abap",
        "mode": ["push"],
        "pushTransport": {
          "trust": {
            "subject": "<abap-certificate-subject>",
            "issuer": "<abap-certificate-issuer>"
          }
        }
      },
      {
        "name": "bdc",
        "mode": ["push"],
        "pushTransport": {
          "trust": {
            "subject": "<bdc-certificate-subject>",
            "issuer": "<bdc-certificate-issuer>"
          }
        }
      }
    ]
  }
}
```

UMS matches the authenticated connection to the onboarded provider. The provider does not send its configured name or a scope identifier in each push request.

### Provider attribution in UMS

UMS exposes provider attribution through `umsProvidedBy`, a technical query property like `umsLastUpdate`. Its value combines the MAP namespace and provider name with a slash:

```text
<MAP namespace>/<provider name>
```

The example produces `sap.s4/abap` and `sap.s4/bdc`. These values help users inspect and filter content by provider without repeating the namespace in every configured name.

The value identifies the configured provider, not a tenant or system instance. UMS retains the publishing-system and perspective boundary separately. The string alone does not define a global deletion boundary.

### Example: one S/4HANA system, two clients

S/4HANA system `ETX` has clients `000` and `100`. Its `abap` provider uses one certificate and publishes both clients' content together. It does not need a separate provider registration per client.

The table shows a simplified UMS query result. `API 3` appears in two client contexts, so these rows are distinct even though they describe the same API.

| API | `systemId` | `umsProvidedBy` |
| --- | --- | --- |
| API 1 | `etx000` | `sap.s4/abap` |
| API 2 | `etx100` | `sap.s4/abap` |
| API 3 | `etx000` | `sap.s4/bdc` |
| API 3 | `etx100` | `sap.s4/bdc` |

Both clients share the same provider attribution. Their `systemId` values distinguish the client contexts. A replace publication from `abap` covers its contribution across both clients of this publishing system.

If the next complete publication contains API 1 but omits API 2, UMS removes API 2. Both BDC rows remain. Content from other publishing systems remains outside this replacement boundary.
