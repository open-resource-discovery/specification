# Issue #05: 25+ Unresolved TODOs in Schema Files

**Priority:** HIGH
**Importance:** High
**Impact:** Medium
**Effort:** High

## Problem Description

The specification schema files contain **25+ TODO comments** representing:
- Pending deprecation decisions
- Planned feature additions
- Needed clarifications
- Cleanup tasks
- Unresolved design questions

These TODOs represent technical debt and uncertainty in the specification.

## Impact

**Specification Quality:**
- Uncertainty in the standard
- Incomplete features
- Potential breaking changes pending
- Unclear deprecation timeline

**User Confusion:**
- Users don't know if TODOs affect them
- Unclear future direction
- Hesitation to adopt affected features

**Maintenance Burden:**
- TODOs accumulate over time
- Context lost as time passes
- Harder decisions to make later
- Technical debt increases

## TODO Inventory

### In `spec/v1/Document.schema.yaml` (23 items)

1. **Line 100-103:** `system-instance-delta` perspective (commented out)
   ```yaml
   # TODO: As future optimization we could also provide this perspective
   ```

2. **Line 149:** Custom policy level deprecation
   ```yaml
   # TODO: Deprecate this?
   ```

3. **Line 164:** Custom policy level deprecation
   ```yaml
   # TODO: Deprecate this?
   ```

4. **Line 525:** Line of business vocabulary cleanup
   ```yaml
   # TODO: Cleanup. Those values seem to be not part of the lineOfBusiness vocabulary officially
   ```

5. **Line 798:** Reverse relationship consideration
   ```yaml
   # TODO: Drop this, because the reverse relationship is polymorphic and needs extra-care (?)
   ```

6. **Line 1269:** Implementation standard contract
   ```yaml
   # TODO: Consider adding one more property to provide the ORD ID of the shared implementation standard contract
   ```

7. **Line 1298:** Data slices clarification
   ```yaml
   # TODO: Clarify whether to include Data Slices or not
   ```

8. **Line 1622:** Deprecate in favor of compatibleWith
   ```yaml
   # TODO: Deprecate this in favor of `compatibleWith`?
   ```

9. **Line 1648:** Deprecation consideration
   ```yaml
   # TODO: Deprecate this?
   ```

10. **Line 1655:** Deprecate in favor of compatibleWith
    ```yaml
    # TODO: Deprecate this in favor of `compatibleWith`?
    ```

11. **Line 1657:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

12. **Line 1662:** Deprecate in favor of compatibleWith
    ```yaml
    # TODO: Deprecate this in favor of `compatibleWith`?
    ```

13. **Line 2063:** Future hotfix removal
    ```yaml
    # TODO: Remove again in the future, once hotfix isn't needed anymore
    ```

14. **Line 2461:** Custom type deprecation
    ```yaml
    # TODO: Deprecate this?
    ```

15. **Line 2570:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

16. **Line 2785:** API and event relations
    ```yaml
    # TODO: Clarify if we want to have relations to APIs and events like this
    ```

17. **Line 2877:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

18. **Line 3094:** Mandatory title consideration
    ```yaml
    # TODO: Do we need a mandatory title?
    ```

19. **Line 3415:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

20. **Line 3480:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

21. **Line 3487:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

22. **Line 3544:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

23. **Line 3551:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

24. **Line 3739:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

25. **Line 3747:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

26. **Line 3799:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

27. **Line 3804:** Deprecation consideration
    ```yaml
    # TODO: Deprecate this?
    ```

28. **Line 3899:** Documentation labels bug
    ```yaml
    # TODO: Add documentationLabels and more in the future? (Currently causing a bug)
    ```

29. **Line 4400:** Inclusion clarification
    ```yaml
    # TODO: Clarify whether to include this
    ```

### In `spec/v1/Configuration.schema.yaml` (1 item)

30. **Line 128:** system-instance-delta perspective (same as Document)
    ```yaml
    # TODO: As future optimization...
    ```

### In `spec/v1/Document.ums.yaml` (1 item)

31. **Line 3:** Missing UMS overrides
    ```yaml
    # TODO: add all missing overrides here
    ```

## Categorization

### Category 1: Deprecation Decisions (17 TODOs)
Many "TODO: Deprecate this?" comments indicate features that:
- May be superseded by newer approaches
- Have unclear usage
- Need stakeholder review

**Action:** Review each with stakeholders and either:
- Deprecate with timeline
- Keep and remove TODO
- Document reasoning

### Category 2: Feature Additions (5 TODOs)
Features or properties that might be added:
- system-instance-delta perspective
- Implementation standard contract ID
- Documentation labels
- Relationship types

**Action:** Either implement or create proper feature proposals

### Category 3: Clarifications Needed (6 TODOs)
Design decisions that need clarity:
- Data slices inclusion
- API/event relations
- Mandatory title requirement
- Vocabulary cleanup

**Action:** Research, decide, document, remove TODO

### Category 4: Bugs/Hotfixes (2 TODOs)
- documentationLabels bug
- Hotfix that needs removal

**Action:** Fix bugs and remove temporary code

## Proposed Solution

### Phase 1: Triage (1 week)

Create issues for each TODO:
```markdown
## TODO Triage Template

**Location:** `spec/v1/Document.schema.yaml:LINE`
**TODO:** [exact TODO text]
**Category:** Deprecation / Feature / Clarification / Bug
**Priority:** High / Medium / Low
**Decision:** Deprecate / Implement / Keep / Remove
**Rationale:** [why this decision]
**Breaking Change:** Yes / No
**Timeline:** vX.Y.Z
```

### Phase 2: Deprecation Review (2 weeks)

For all "Deprecate this?" TODOs:
1. **Analyze usage:**
   - Are examples using it?
   - Is it in SAP implementations?
   - External usage?

2. **Make decision:**
   - **Deprecate:** Add deprecation markers, timeline
   - **Keep:** Document why, remove TODO
   - **Replace:** Implement replacement, then deprecate

3. **Document:**
   ```yaml
   x-deprecation-text: "Use compatibleWith instead"
   x-deprecated-in-version: "1.13.0"
   x-planned-removal-version: "2.0.0"
   ```

### Phase 3: Feature Review (2 weeks)

For feature addition TODOs:
1. **Create proposals:**
   - Why is this needed?
   - Who requested it?
   - Use cases?

2. **Decide:**
   - **Implement now:** Add to next version
   - **Backlog:** Create issue, remove TODO
   - **Won't implement:** Document decision, remove TODO

### Phase 4: Clarifications (1 week)

For clarification TODOs:
1. **Research:**
   - Review history
   - Check usage
   - Consult stakeholders

2. **Document decision:**
   - Update schema description
   - Add to specification docs
   - Remove TODO

### Phase 5: Cleanup (1 week)

1. **Fix bugs:**
   - documentationLabels bug
   - Remove hotfix code

2. **Final review:**
   - All TODOs addressed
   - Documentation updated
   - CHANGELOG entries

## Example Resolutions

### Example 1: Deprecation Decision

**Before:**
```yaml
customPolicyLevel:
  type: string
  # TODO: Deprecate this?
```

**After (if deprecating):**
```yaml
customPolicyLevel:
  type: string
  x-deprecated-in-version: "1.13.0"
  x-deprecation-text: "Use policyLevels (plural) array instead"
  x-planned-removal-version: "2.0.0"
```

**After (if keeping):**
```yaml
customPolicyLevel:
  type: string
  description: |-
    Custom policy level for non-standard policies.
    Kept for backward compatibility and niche use cases.
```

### Example 2: Feature Decision

**Before:**
```yaml
# TODO: Consider adding one more property to provide the ORD ID
```

**After (if implementing):**
```yaml
implementationStandardContractId:
  type: string
  x-introduced-in-version: "1.13.0"
  description: |-
    Optional ORD ID reference to shared implementation standard contract
  pattern: ^([a-z0-9-]+(?:[.][a-z0-9-]+)*):([a-zA-Z0-9._\-/]+):(v0|v[1-9][0-9]*)$
```

**After (if rejecting):**
```yaml
# Decision 2024-01: Not adding implementation standard contract ID
# Rationale: Use extensibility attributes instead
# See ADR-012 for details
```

## Implementation Plan

### Week 1-2: Triage and Analysis
- Create GitHub issues for each TODO
- Analyze usage and impact
- Consult with stakeholders

### Week 3-4: Deprecations
- Decide on each deprecation candidate
- Add deprecation markers
- Update documentation

### Week 5-6: Features and Clarifications
- Implement approved features
- Document clarifications
- Update specification text

### Week 7: Testing and Documentation
- Validate schema changes
- Update examples if needed
- Create migration guide
- Update CHANGELOG

## Expected Outcomes

After resolution:
- ✅ Zero TODO comments in schema files
- ✅ Clear deprecation timeline for deprecated features
- ✅ All design decisions documented
- ✅ New features implemented or backlogged
- ✅ Bugs fixed
- ✅ ADRs created for major decisions
- ✅ Migration guide updated

## Success Metrics

- All 31 TODOs resolved
- Schema passes validation
- Examples still work
- Documentation updated
- Stakeholder approval obtained
- No new TODOs added

## Related Issues

- #13 (ADRs) - Document major decisions
- #08 (Migration Guides) - For breaking changes
- #02 (Testing) - Validate changes

## Files to Modify

- `spec/v1/Document.schema.yaml`
- `spec/v1/Configuration.schema.yaml`
- `spec/v1/Document.ums.yaml`
- `CHANGELOG.md`
- `docs/spec-v1/index.md` (if clarifications affect main spec)
- Migration guide (if deprecations)

---

## Agent Prompt

```
Audit and resolve all TODO comments in the ORD specification schema files.

Context:
- 31 TODO comments exist across schema files
- 17 are about deprecation decisions
- 5 are about feature additions
- 6 are about clarifications needed
- 2 are about bugs/hotfixes
- These represent technical debt and specification uncertainty

Tasks:
1. Create a comprehensive TODO inventory:
   - List all TODOs with file locations and line numbers
   - Categorize each (Deprecation/Feature/Clarification/Bug)
   - Assess impact and urgency

2. For each TODO:
   - Research the context (git history, related issues)
   - Determine if still relevant
   - Propose a resolution (implement/deprecate/keep/remove)

3. Create a resolution plan document:
   - Priority order for resolution
   - Resources needed
   - Timeline estimate
   - Breaking change analysis

4. For deprecation TODOs:
   - Analyze current usage
   - Recommend deprecation timeline
   - Suggest replacement approach

5. For feature TODOs:
   - Assess value vs. cost
   - Recommend implement/backlog/reject

6. For clarification TODOs:
   - Research the question
   - Propose clear documentation

7. Create GitHub issues for each TODO that requires work beyond documentation

8. Generate a summary report with:
   - TODOs by category
   - Quick wins (easy to resolve)
   - High-impact items
   - Recommended priorities

DO NOT make changes to schema files yet - this task is about analysis and planning.

Expected outcomes:
- Complete TODO inventory with analysis
- Resolution plan for each item
- Prioritized action items
- GitHub issues created
- Clear path to zero TODOs
```
