// Derives the universe of valid anchor ids the policy overlays may target, and
// validates overlay targets against it. This is the key DX safeguard: if a
// property is renamed in the schema, the build fails pointing at the stale target.
//
// Two anchor kinds, produced by two different code paths — validated accordingly:
//   * property anchors  — emitted literally by spec-toolkit as id="<defslug>_<prop>"
//                         in Document.md. The regex scan of the md is authoritative.
//   * definition anchors — NOT in the md; Docusaurus auto-generates them from the
//                         "### Heading" text at render time using a single stateful
//                         github-slugger per page. We reproduce that exactly with
//                         @docusaurus/utils createSlugger over all headings in order.

import { readFileSync } from "node:fs";
import { createSlugger } from "@docusaurus/utils";

export interface AnchorUniverse {
  /** Every property-row anchor id, e.g. "api-resource_extensible". */
  propertyAnchors: Set<string>;
  /** Every definition heading anchor, e.g. "api-resource". */
  definitionAnchors: Set<string>;
  /** property name -> set of concrete property anchors that carry it (for propertyName expansion). */
  propertyNameIndex: Map<string, string[]>;
}

/** Plain (stateless) slug of a single string, matching spec-toolkit's property-id slugging of titles. */
function plainSlug(text: string): string {
  return createSlugger().slug(text);
}

/**
 * Scan the emitted Document.md for the authoritative property-anchor set.
 * Property name cells render as: <div className="interface-property-name anchor" id="api-resource_extensible">
 */
function readPropertyAnchorsFromMd(documentMdPath: string): Set<string> {
  const md = readFileSync(documentMdPath, "utf8");
  const anchors = new Set<string>();
  const re = /id="([a-z0-9-]+_[a-z0-9]+)"/g;
  for (const match of md.matchAll(re)) {
    anchors.add(match[1]);
  }
  return anchors;
}

/**
 * Reproduce Docusaurus heading ids: run one slugger over every heading in document
 * order and record the slug for each "### " (definition) heading.
 */
function readDefinitionAnchorsFromMd(documentMdPath: string): Set<string> {
  const md = readFileSync(documentMdPath, "utf8");
  const slugger = createSlugger();
  const anchors = new Set<string>();
  for (const line of md.split("\n")) {
    const h = /^(#{1,6})\s+(.*?)\s*$/.exec(line);
    if (!h) continue;
    // Strip inline MDX/HTML (e.g. the DRAFT <span>) before slugging, matching
    // Docusaurus. Loop to a fixpoint so nested/split tags cannot leave a partial
    // "<tag" behind (CodeQL: incomplete multi-character sanitization).
    let text = h[2];
    let prev: string;
    do {
      prev = text;
      text = text.replace(/<[^>]*>/g, "");
    } while (text !== prev);
    text = text.trim();
    const slug = slugger.slug(text);
    if (h[1].length === 3) anchors.add(slug);
  }
  return anchors;
}

interface SchemaDef {
  title?: string;
  properties?: Record<string, unknown>;
}
interface DocumentSchema {
  title?: string;
  properties?: Record<string, unknown>;
  definitions?: Record<string, SchemaDef>;
}

/**
 * Derive the expected property-anchor set and the propertyName index from the
 * generated JSON Schema. Property anchor = `${plainSlug(defTitle)}_${key.toLowerCase()}`.
 */
function deriveFromSchema(schema: DocumentSchema): {
  expectedPropertyAnchors: Set<string>;
  propertyNameIndex: Map<string, string[]>;
} {
  const expected = new Set<string>();
  const nameIndex = new Map<string, string[]>();

  const addDef = (
    title: string | undefined,
    props: Record<string, unknown> | undefined,
  ): void => {
    if (!title || !props) return;
    const defSlug = plainSlug(title);
    for (const key of Object.keys(props)) {
      const anchor = `${defSlug}_${key.toLowerCase()}`;
      expected.add(anchor);
      const list = nameIndex.get(key) ?? [];
      list.push(anchor);
      nameIndex.set(key, list);
    }
  };

  addDef(schema.title, schema.properties);
  for (const def of Object.values(schema.definitions ?? {})) {
    addDef(def.title, def.properties);
  }
  return { expectedPropertyAnchors: expected, propertyNameIndex: nameIndex };
}

/**
 * Build the anchor universe from the generated md (ground truth) and the schema
 * (expectation set). Throws if the schema-derived property anchors are not a subset
 * of what the md actually emits — a tripwire for spec-toolkit slug-algorithm drift.
 */
export function buildAnchorUniverse(
  documentMdPath: string,
  documentSchemaPath: string,
): AnchorUniverse {
  const propertyAnchors = readPropertyAnchorsFromMd(documentMdPath);
  const definitionAnchors = readDefinitionAnchorsFromMd(documentMdPath);
  const schema = JSON.parse(
    readFileSync(documentSchemaPath, "utf8"),
  ) as DocumentSchema;
  const { expectedPropertyAnchors, propertyNameIndex } =
    deriveFromSchema(schema);

  // Slug-algorithm drift tripwire. We cannot assert a strict subset: the schema
  // JSON carries hidden (`x-hide`) and deprecated properties that spec-toolkit
  // intentionally omits from the rendered md (so they have no anchor to target),
  // and `x-hide` is stripped from the JSON so we cannot detect them here. A healthy
  // repo therefore has most — but not all — schema-derived anchors present in the md
  // (~91% today). A change to the slug algorithm would instead drop the match rate
  // to near zero, which is what we guard against.
  const expected = [...expectedPropertyAnchors];
  const present = expected.filter((a) => propertyAnchors.has(a));
  const coverage = expected.length === 0 ? 1 : present.length / expected.length;
  const MIN_COVERAGE = 0.8;
  if (coverage < MIN_COVERAGE) {
    throw new Error(
      `Anchor derivation drift: only ${present.length}/${expected.length} ` +
        `(${Math.round(coverage * 100)}%) schema-derived property anchors were found in ` +
        `${documentMdPath}. The slug algorithm or definition titles likely changed.`,
    );
  }

  // Keep only names whose anchors actually exist in the md (defensive).
  const index = new Map<string, string[]>();
  for (const [name, anchors] of propertyNameIndex) {
    const present = anchors.filter((a) => propertyAnchors.has(a));
    if (present.length > 0) index.set(name, present);
  }

  return { propertyAnchors, definitionAnchors, propertyNameIndex: index };
}
