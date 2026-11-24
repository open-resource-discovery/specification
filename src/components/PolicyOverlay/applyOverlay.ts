/// <reference lib="dom" />
// Client-side DOM overlay applier for Policy Levels.
//
// Pure functions that re-annotate the already-rendered ORD Document spec in
// place: swapping requirement badges, injecting inline policy-note callouts
// under affected property rows, and injecting notes under definition headings.
//
// Every node that is added or modified is tagged with `data-policy-overlay`
// so the operation is fully reversible via `clearOverlay()`. Modified badges
// additionally stash their original class/text so they can be restored.

import type {
  Admonition,
  CompiledLevel,
  CompiledRule,
  Requirement,
  RuleLink,
  RuleTable,
} from "../../build/policyOverlay/types";

const BADGE_SELECTOR = "span.optional, span.mandatory, span.recommended";

/** Requirement -> badge CSS class. `conditional` keeps the base badge. */
const REQ_CLASS: Record<Requirement, string> = {
  mandatory: "mandatory",
  recommended: "recommended",
  optional: "optional",
  forbidden: "policy-forbidden",
  conditional: "",
};

/** Requirement -> badge label text. */
const REQ_LABEL: Record<Requirement, string> = {
  mandatory: "MANDATORY",
  recommended: "RECOMMENDED",
  optional: "OPTIONAL",
  forbidden: "FORBIDDEN",
  conditional: "",
};

// ---------------------------------------------------------------------------
// Safe inline renderer (first-party content). Escapes everything, then
// re-introduces a small, known-safe subset of inline markdown as HTML.
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Allow only safe link schemes: http(s), mailto, and relative/anchor hrefs.
 * Anything else (notably `javascript:`) is neutralized to "#". Defense-in-depth —
 * overlay content is first-party, but notes flow into innerHTML / element hrefs.
 */
function safeHref(href: string): string {
  return /^(https?:|mailto:|\/|\.|#)/i.test(href.trim()) ? href : "#";
}

/** Render a small subset of CommonMark inline syntax to safe HTML. */
export function renderInlineHtml(md: string): string {
  let s = escapeHtml(md);
  // inline code `code`
  s = s.replace(/`([^`]+)`/g, (_m, c: string) => `<code>${c}</code>`);
  // bold **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, (_m, b: string) => `<strong>${b}</strong>`);
  // links [text](href) — href is already HTML-escaped; scheme is also restricted
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, t: string, h: string) =>
      `<a href="${safeHref(h)}" target="_blank" rel="noopener noreferrer">${t}</a>`,
  );
  // allow explicit <br>, <br/>, <br /> line breaks authored in the content
  s = s.replace(/&lt;br\s*\/?&gt;/gi, "<br/>");
  // soft line breaks
  s = s.replace(/\n/g, "<br/>");
  return s;
}

// ---------------------------------------------------------------------------
// Callout construction
// ---------------------------------------------------------------------------

function buildTable(doc: Document, table: RuleTable): HTMLTableElement {
  const el = doc.createElement("table");
  el.className = "policy-note__table";
  if (table.caption) {
    const cap = doc.createElement("caption");
    cap.textContent = table.caption;
    el.appendChild(cap);
  }
  const thead = doc.createElement("thead");
  const htr = doc.createElement("tr");
  for (const col of table.columns) {
    const th = doc.createElement("th");
    th.innerHTML = renderInlineHtml(col);
    htr.appendChild(th);
  }
  thead.appendChild(htr);
  el.appendChild(thead);
  const tbody = doc.createElement("tbody");
  for (const row of table.rows) {
    const tr = doc.createElement("tr");
    for (const cell of row) {
      const td = doc.createElement("td");
      td.innerHTML = renderInlineHtml(cell);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  el.appendChild(tbody);
  return el;
}

function buildLinks(doc: Document, links: RuleLink[]): HTMLElement {
  const wrap = doc.createElement("div");
  wrap.className = "policy-note__links";
  links.forEach((link, i) => {
    if (i > 0) wrap.appendChild(doc.createTextNode(" · "));
    const a = doc.createElement("a");
    a.href = safeHref(link.href);
    a.textContent = link.text;
    if (/^https?:/i.test(link.href)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    wrap.appendChild(a);
  });
  return wrap;
}

const ADMONITIONS = new Set<Admonition>([
  "note",
  "tip",
  "info",
  "warning",
  "danger",
]);

/** Build the inner `.policy-note` callout element for a rule. */
function buildCallout(
  doc: Document,
  rule: CompiledRule,
  currentTitle: string,
): HTMLElement {
  const admonition: Admonition =
    rule.admonition && ADMONITIONS.has(rule.admonition)
      ? rule.admonition
      : "note";

  const callout = doc.createElement("div");
  callout.className = `policy-note policy-note--${admonition}`;

  const head = doc.createElement("div");
  head.className = "policy-note__head";
  // Primary tag: the currently selected policy level (e.g. "SAP Core v1").
  const label = doc.createElement("span");
  label.className = "policy-note__label";
  label.textContent = currentTitle;
  head.appendChild(label);
  // When the requirement is inherited, name the level it comes from.
  if (rule.inheritedFrom !== "self") {
    const inherited = doc.createElement("span");
    inherited.className = "policy-note__inherited";
    inherited.textContent = `inherited from ${rule.sourceTitle}`;
    head.appendChild(inherited);
  }
  callout.appendChild(head);

  // Requirement title on its own line, below the policy-level label(s).
  const title = doc.createElement("div");
  title.className = "policy-note__title";
  title.textContent = rule.title;
  callout.appendChild(title);

  if (rule.note) {
    const body = doc.createElement("div");
    body.className = "policy-note__body";
    body.innerHTML = renderInlineHtml(rule.note);
    callout.appendChild(body);
  }

  if (rule.appliesWhen) {
    const aw = doc.createElement("div");
    aw.className = "policy-note__applies-when";
    aw.innerHTML = `<strong>Applies when:</strong> ${renderInlineHtml(
      rule.appliesWhen,
    )}`;
    callout.appendChild(aw);
  }

  if (rule.exceptions && rule.exceptions.length > 0) {
    const ex = doc.createElement("div");
    ex.className = "policy-note__exceptions";
    ex.innerHTML = `<strong>Except:</strong> ${renderInlineHtml(
      rule.exceptions.join(", "),
    )}`;
    callout.appendChild(ex);
  }

  if (rule.tables) {
    for (const table of rule.tables) {
      callout.appendChild(buildTable(doc, table));
    }
  }

  if (rule.links && rule.links.length > 0) {
    callout.appendChild(buildLinks(doc, rule.links));
  }

  return callout;
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

function applyBadges(doc: Document, level: CompiledLevel): void {
  for (const [anchor, requirement] of Object.entries(level.badgeByAnchor)) {
    const nameEl = doc.getElementById(anchor);
    if (!nameEl) continue;
    const badge = nameEl.querySelector<HTMLElement>(BADGE_SELECTOR);

    const nextClass = REQ_CLASS[requirement];
    // `conditional` / empty -> keep the base badge untouched.
    if (badge && nextClass && !badge.hasAttribute("data-policy-orig-class")) {
      badge.setAttribute("data-policy-orig-class", badge.className);
      badge.setAttribute("data-policy-orig-text", badge.textContent ?? "");
      badge.setAttribute("data-policy-overlay", "badge");
      badge.className = nextClass;
      badge.textContent = REQ_LABEL[requirement];
    }

    // Append a small provenance marker (idempotent).
    if (!nameEl.querySelector('[data-policy-overlay="marker"]')) {
      const marker = doc.createElement("span");
      marker.className = "policy-badge";
      marker.setAttribute("data-policy-overlay", "marker");
      marker.textContent = level.shortTitle;
      marker.title = `${level.shortTitle} policy level`;
      // Place the marker after the badge when present, else at the end.
      if (badge && badge.parentNode === nameEl) {
        badge.insertAdjacentElement("afterend", marker);
      } else {
        nameEl.appendChild(marker);
      }
    }
  }
}

function applyInlineNotes(doc: Document, level: CompiledLevel): void {
  for (const [anchor, rules] of Object.entries(level.noteRulesByAnchor)) {
    const nameEl = doc.getElementById(anchor);
    if (!nameEl) continue;
    const row = nameEl.closest("tr");
    if (!row) continue;
    // Target the property's DESCRIPTION cell so the requirement reads as extra
    // description content (not a full-width row across all three columns).
    const descEl = row.querySelector(".interface-property-description");
    const container: Element | null = descEl ?? row.lastElementChild;
    if (!container) continue;
    // Within the description cell an <hr/> separates the prose/default
    // requirements from the schema constraints (Regex Pattern, Introduced in
    // Version, Example Values…). Insert the requirement just before that <hr/>
    // so it sits below the default requirements but above the constraints.
    const hr = descEl ? descEl.querySelector("hr") : null;

    for (const rule of rules) {
      const exists = container.querySelector(
        `[data-policy-overlay="note"][data-anchor="${CSS.escape(
          anchor,
        )}"][data-rule-id="${CSS.escape(rule.id)}"]`,
      );
      if (exists) continue;
      const callout = buildCallout(doc, rule, level.shortTitle);
      callout.setAttribute("data-policy-overlay", "note");
      callout.setAttribute("data-anchor", anchor);
      callout.setAttribute("data-rule-id", rule.id);
      if (hr?.parentNode === container) container.insertBefore(callout, hr);
      else container.appendChild(callout);
    }
  }
}

function applyDefinitionNotes(doc: Document, level: CompiledLevel): void {
  for (const [defSlug, rules] of Object.entries(level.definitionRules)) {
    const heading = doc.getElementById(defSlug);
    if (!heading) continue;

    let anchorNode: Element = heading;
    for (const rule of rules) {
      const exists = doc.querySelector(
        `[data-policy-overlay="def-note"][data-def="${CSS.escape(
          defSlug,
        )}"][data-rule-id="${CSS.escape(rule.id)}"]`,
      );
      if (exists) {
        anchorNode = exists;
        continue;
      }
      const block = doc.createElement("div");
      block.className = "policy-note-block";
      block.setAttribute("data-policy-overlay", "def-note");
      block.setAttribute("data-def", defSlug);
      block.setAttribute("data-rule-id", rule.id);
      block.appendChild(buildCallout(doc, rule, level.shortTitle));
      anchorNode.insertAdjacentElement("afterend", block);
      anchorNode = block;
    }
  }
}

/**
 * Inject document-wide (`general`) rules at the root "Ord Document" section, their
 * natural in-place home. Falls back to no-op if that heading is absent.
 */
function applyGeneralNotes(doc: Document, level: CompiledLevel): void {
  if (level.generalRules.length === 0) return;
  const heading = doc.getElementById("ord-document");
  if (!heading) return;

  let anchorNode: Element = heading;
  for (const rule of level.generalRules) {
    const exists = doc.querySelector(
      `[data-policy-overlay="general-note"][data-rule-id="${CSS.escape(rule.id)}"]`,
    );
    if (exists) {
      anchorNode = exists;
      continue;
    }
    const block = doc.createElement("div");
    block.className = "policy-note-block";
    block.setAttribute("data-policy-overlay", "general-note");
    block.setAttribute("data-rule-id", rule.id);
    block.appendChild(buildCallout(doc, rule, level.shortTitle));
    anchorNode.insertAdjacentElement("afterend", block);
    anchorNode = block;
  }
}

/**
 * Apply all annotations for `level` onto the rendered spec DOM.
 * Idempotent: re-running without an intervening `clearOverlay()` will not
 * duplicate nodes. No-op during SSR or when target nodes are absent.
 */
export function applyOverlay(
  level: CompiledLevel,
  doc: Document | undefined = typeof document !== "undefined"
    ? document
    : undefined,
): void {
  if (!doc) return;
  applyBadges(doc, level);
  applyInlineNotes(doc, level);
  applyDefinitionNotes(doc, level);
  applyGeneralNotes(doc, level);
}

// ---------------------------------------------------------------------------
// Scroll anchoring — keep the property the reader is looking at fixed in the
// viewport when switching policy levels (notes added/removed above it would
// otherwise shift the whole page).
// ---------------------------------------------------------------------------

export interface ScrollAnchor {
  el: Element;
  top: number;
}

/**
 * Pick a stable reference: the first element with an `id` in the spec whose top
 * is at or just below the sticky switcher bar (i.e. the topmost thing the reader
 * currently sees), and record its viewport offset.
 */
export function captureViewportAnchor(
  doc: Document | undefined = typeof document !== "undefined"
    ? document
    : undefined,
): ScrollAnchor | null {
  if (!doc) return null;
  const bar = doc.querySelector<HTMLElement>(".policy-switcher");
  const topLine = bar ? bar.getBoundingClientRect().bottom : 0;
  const nodes = doc.querySelectorAll<HTMLElement>(
    ".theme-doc-markdown [id], .markdown [id]",
  );
  for (const el of nodes) {
    const top = el.getBoundingClientRect().top;
    if (top >= topLine - 1) return { el, top };
  }
  return null;
}

/** Re-scroll so the captured element sits at its original viewport offset. */
export function restoreViewportAnchor(anchor: ScrollAnchor | null): void {
  if (!anchor || typeof window === "undefined" || !anchor.el.isConnected)
    return;
  const delta = anchor.el.getBoundingClientRect().top - anchor.top;
  if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
}

/**
 * Remove every annotation added by `applyOverlay`, restoring modified badges
 * to their original class/text and deleting all injected nodes.
 */
export function clearOverlay(
  doc: Document | undefined = typeof document !== "undefined"
    ? document
    : undefined,
): void {
  if (!doc) return;
  // Restore modified-in-place badges first (also drops their overlay tag).
  doc
    .querySelectorAll<HTMLElement>("[data-policy-orig-class]")
    .forEach((el) => {
      const cls = el.getAttribute("data-policy-orig-class");
      if (cls !== null) el.className = cls;
      const txt = el.getAttribute("data-policy-orig-text");
      if (txt !== null) el.textContent = txt;
      el.removeAttribute("data-policy-orig-class");
      el.removeAttribute("data-policy-orig-text");
      el.removeAttribute("data-policy-overlay");
    });
  // Remove all remaining injected nodes (markers, note rows, def notes).
  doc.querySelectorAll("[data-policy-overlay]").forEach((el) => {
    el.remove();
  });
}
