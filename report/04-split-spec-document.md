# Issue #04: Main Specification Document Too Long (1,011 Lines)

**Priority:** HIGH
**Importance:** High
**Impact:** Medium
**Effort:** Medium

## Problem Description

The main specification document (`docs/spec-v1/index.md`) is **1,011 lines long**, making it:
- Difficult to navigate
- Hard to maintain
- Challenging for new users to consume
- Not optimized for search
- Overwhelming for quick reference

A monolithic document of this size violates documentation best practices and reduces usability.

## Impact

**User Experience:**
- Users struggle to find specific information
- Reading time is excessive for focused questions
- Hard to bookmark specific sections
- Mobile reading experience is poor
- Search engines don't index granular topics well

**Maintenance:**
- Merge conflicts more likely
- Multiple editors working on same file
- Difficult to track changes to specific topics
- Harder to review PRs touching the spec

**SEO and Discoverability:**
- Search engines prefer focused pages
- Harder to rank for specific topics
- Internal linking less effective
- Social sharing links to wrong sections

## Analysis

### Current Structure (1,011 lines)

```
docs/spec-v1/index.md (1,011 lines)
├── Notational Conventions (10 lines)
├── Terminology (850 lines) ⚠️ TOO LARGE
├── ORD Roles (100 lines)
├── ORD Transport Modes (80 lines)
├── ORD Parts (sections continue...)
├── ID Concepts (115 lines) ← Should be separate
├── Version and Lifecycle (25 lines) ← Should be separate
└── Common REST Characteristics (19+ lines) ← Should be separate
```

### Sections That Should Be Extracted

1. **ID Concepts** (lines 850-965, ~115 lines)
   - ORD ID
   - Local ID
   - Correlation ID
   - Concept ID
   - Specification ID

2. **Version and Lifecycle** (lines 966-990, ~25 lines)
   - Version rules
   - Deprecation
   - Sunset
   - Tombstones

3. **REST Characteristics** (lines 992-1011+, ~20+ lines)
   - Error Handling
   - Authentication & Authorization
   - HTTP Headers

4. **Detailed Terminology** (currently embedded, ~200 lines could be extracted)
   - System concepts (system type, instance, installation, version)
   - Resource concepts
   - Product concepts

## Proposed Solution

### Target Structure

```
docs/spec-v1/
├── index.md (reduced to ~400 lines)
│   ├── Notational Conventions
│   ├── Overview & Introduction
│   ├── ORD Roles (summary)
│   ├── ORD Transport Modes (summary)
│   └── Links to detailed pages
│
├── terminology/
│   ├── index.md (main terminology)
│   ├── system-concepts.md (system type, instance, etc.)
│   ├── resource-concepts.md (resources, definitions)
│   └── ord-concepts.md (ORD information, behavior)
│
├── identifiers/
│   ├── index.md (ID concepts overview)
│   ├── ord-id.md (ORD ID details)
│   ├── local-id.md
│   ├── correlation-id.md
│   ├── concept-id.md
│   └── specification-id.md
│
├── lifecycle/
│   ├── index.md (versioning and lifecycle)
│   ├── versioning.md (semantic versioning rules)
│   ├── deprecation.md (deprecation process)
│   └── sunset.md (sunset and tombstones)
│
├── rest-api/
│   ├── index.md (REST characteristics)
│   ├── error-handling.md
│   ├── authentication.md
│   └── http-headers.md
│
└── ...existing structure...
```

### Benefits of This Structure

✅ **Better Navigation:**
- Focused pages for specific topics
- Clear hierarchy
- Easier to find information

✅ **Improved Maintainability:**
- Smaller files, fewer conflicts
- Easier to review changes
- Better git history per topic

✅ **Better User Experience:**
- Quick access to specific concepts
- Better mobile experience
- Faster page loads

✅ **Better SEO:**
- Targeted pages for specific queries
- Better search engine ranking
- More granular internal linking

## Implementation Steps

### Phase 1: Planning (2 hours)

1. **Create outline:**
   - Map current content to new structure
   - Identify dependencies and links
   - Plan URL redirects

2. **Set up directory structure:**
```bash
mkdir -p docs/spec-v1/terminology
mkdir -p docs/spec-v1/identifiers
mkdir -p docs/spec-v1/lifecycle
mkdir -p docs/spec-v1/rest-api
```

### Phase 2: Extract ID Concepts (3 hours)

1. **Create `docs/spec-v1/identifiers/` pages:**
   - Extract ORD ID section
   - Extract Local ID section
   - Extract Correlation ID section
   - Extract Concept ID section
   - Extract Specification ID section
   - Create index page with overview

2. **Update links:**
   - Change `#ord-id` to `/spec-v1/identifiers/ord-id`
   - Update all cross-references
   - Test all internal links

3. **Add navigation to sidebar:**
```javascript
// sidebars.js
{
  type: 'category',
  label: 'Identifiers',
  items: [
    'spec-v1/identifiers/index',
    'spec-v1/identifiers/ord-id',
    'spec-v1/identifiers/local-id',
    'spec-v1/identifiers/correlation-id',
    'spec-v1/identifiers/concept-id',
    'spec-v1/identifiers/specification-id',
  ],
}
```

### Phase 3: Extract Lifecycle (2 hours)

1. **Create `docs/spec-v1/lifecycle/` pages**
2. **Update links and navigation**

### Phase 4: Extract REST Characteristics (2 hours)

1. **Create `docs/spec-v1/rest-api/` pages**
2. **Update links and navigation**

### Phase 5: Refactor Main Document (3 hours)

1. **Reduce main index.md to core concepts:**
   - Keep high-level overview
   - Add "See also" links to detailed pages
   - Maintain flow and readability

2. **Add redirects in docusaurus.config.js:**
```javascript
redirects: [
  {
    from: '/spec-v1/#ord-id',
    to: '/spec-v1/identifiers/ord-id',
  },
  // Add more as needed
]
```

### Phase 6: Testing and Validation (2 hours)

1. **Validate all links:**
```bash
npm run build
# Check for broken links
```

2. **Test navigation:**
   - Verify sidebar works
   - Test mobile navigation
   - Check breadcrumbs

3. **Review content:**
   - Ensure no content lost
   - Verify formatting
   - Check code examples

## Migration Strategy

### URL Preservation

Keep existing URLs working with redirects:
```javascript
// docusaurus.config.js
{
  from: ['/spec-v1/index', '/spec-v1/'],
  to: '/spec-v1/',
}
```

### Anchor Preservation

Where possible, keep anchor IDs:
```markdown
<!-- Old: -->
<dfn id="def-ord-id">ORD ID</dfn>

<!-- New location maintains ID: -->
<dfn id="def-ord-id">ORD ID</dfn>
```

### Documentation

Add to main index.md:
```markdown
## Documentation Structure

This specification is organized into several focused sections:

- **[Identifiers](./identifiers/)** - ID concepts (ORD ID, Local ID, etc.)
- **[Lifecycle](./lifecycle/)** - Versioning, deprecation, and sunset
- **[REST API](./rest-api/)** - REST characteristics and conventions
- **[Concepts](./concepts/)** - Deep-dive articles on key concepts
```

## Expected Outcomes

After refactoring:
- ✅ Main document reduced to ~400 lines (60% reduction)
- ✅ Focused pages for specific topics
- ✅ Improved navigation and discoverability
- ✅ Better maintainability
- ✅ Enhanced SEO
- ✅ All existing links still work via redirects
- ✅ No content lost
- ✅ Better mobile experience

## Success Metrics

- Main document < 500 lines
- No broken internal links
- Build completes successfully
- All redirects working
- Positive feedback from users
- Improved time-to-find-information

## Risks and Mitigation

**Risk:** Breaking external links to specific sections
**Mitigation:** Comprehensive redirect strategy, maintain anchor IDs

**Risk:** Confusing users with new structure
**Mitigation:** Clear documentation, prominent navigation, breadcrumbs

**Risk:** Losing context by splitting content
**Mitigation:** Strategic linking, clear cross-references, maintain flow

## Files to Create

- `docs/spec-v1/identifiers/index.md`
- `docs/spec-v1/identifiers/ord-id.md`
- `docs/spec-v1/identifiers/local-id.md`
- `docs/spec-v1/identifiers/correlation-id.md`
- `docs/spec-v1/identifiers/concept-id.md`
- `docs/spec-v1/identifiers/specification-id.md`
- `docs/spec-v1/lifecycle/index.md`
- `docs/spec-v1/lifecycle/versioning.md`
- `docs/spec-v1/lifecycle/deprecation.md`
- `docs/spec-v1/lifecycle/sunset.md`
- `docs/spec-v1/rest-api/index.md`
- `docs/spec-v1/rest-api/error-handling.md`
- `docs/spec-v1/rest-api/authentication.md`

## Files to Modify

- `docs/spec-v1/index.md` (significantly reduce content)
- `sidebars.js` (add new sections)
- `docusaurus.config.js` (add redirects)

---

## Agent Prompt

```
Refactor the monolithic ORD specification document by splitting it into focused, manageable pages.

Context:
- docs/spec-v1/index.md is 1,011 lines long
- Users struggle to navigate and find information
- Sections like "ID Concepts", "Lifecycle", and "REST Characteristics" should be separate
- Must maintain all existing links and anchors with redirects
- Using Docusaurus for documentation

Tasks:
1. Create new directory structure:
   - docs/spec-v1/identifiers/
   - docs/spec-v1/lifecycle/
   - docs/spec-v1/rest-api/

2. Extract ID Concepts section (lines ~850-965) to identifiers/:
   - Create index.md with overview
   - Create ord-id.md (ORD ID content)
   - Create local-id.md (Local ID content)
   - Create correlation-id.md (Correlation ID content)
   - Create concept-id.md (Concept ID content)
   - Create specification-id.md (Specification ID content)

3. Extract Lifecycle section (lines ~966-990) to lifecycle/:
   - Create index.md
   - Create versioning.md
   - Create deprecation.md (deprecation and sunset content)

4. Extract REST Characteristics (lines ~992-1011+) to rest-api/:
   - Create index.md
   - Create error-handling.md
   - Create authentication.md

5. Update main index.md:
   - Remove extracted content
   - Add clear navigation to new sections
   - Maintain introductory content
   - Add "See also" links

6. Update sidebars.js:
   - Add new sections with proper hierarchy
   - Maintain existing structure

7. Add redirects in docusaurus.config.js:
   - Map old anchor links to new pages
   - Preserve external links

8. Update all cross-references and internal links

9. Validate:
   - Build succeeds
   - No broken links
   - All content preserved
   - Navigation works

Expected outcomes:
- Main document reduced to ~400 lines
- Focused, navigable pages
- All links still work
- Improved user experience
```
