import { useHistory, useLocation } from "@docusaurus/router";
import useIsBrowser from "@docusaurus/useIsBrowser";
import type {
  CompiledLevel,
  PolicyLevelsData,
} from "@site/src/build/policyOverlay/types";
import policyLevelsData from "@site/src/generated/policy-levels.json";
import {
  forceAlignToHashTarget,
  runWhenContentStable,
} from "@site/src/theme/contentStable";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  applyOverlay,
  captureViewportAnchor,
  clearOverlay,
  renderMarkdown,
  restoreViewportAnchor,
  rewriteDocLinks,
} from "./applyOverlay";

const data = policyLevelsData as unknown as PolicyLevelsData;

const NONE_VALUE = "";

/** Levels in display order, ignoring any missing lookups. */
function orderedLevels(): CompiledLevel[] {
  return data.order
    .map((policyId) => data.levels[policyId])
    .filter((lvl): lvl is CompiledLevel => Boolean(lvl));
}

function levelBySlug(slug: string | null): CompiledLevel | null {
  if (!slug) return null;
  for (const policyId of Object.keys(data.levels)) {
    const lvl = data.levels[policyId];
    if (lvl && lvl.slug === slug) return lvl;
  }
  return null;
}

function policyFromSearch(search: string): string | null {
  return new URLSearchParams(search).get("policy");
}

function Markdown({ md, className }: { md: string; className?: string }) {
  return (
    <div
      className={className}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: first-party content, escaped and limited to a safe markdown subset by renderMarkdown
      dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }}
    />
  );
}

function PolicyDetail({ level }: { level: CompiledLevel }) {
  const isDraft = level.status === "draft";
  const ref = useRef<HTMLDivElement>(null);
  // The summary may reference other policy levels with links authored relative to
  // the policy-pages directory; resolve them for this (Document) page + base path.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the selected level (and thus the rendered summary) changes
  useEffect(() => {
    if (ref.current) rewriteDocLinks(ref.current);
  }, [level]);
  return (
    <div className="policy-switcher__detail" ref={ref}>
      {isDraft ? (
        <div className="policy-panel__draft-banner">
          This policy level is a <strong>draft</strong> and may change.
        </div>
      ) : null}
      <Markdown className="policy-panel__summary" md={level.summary} />
      <p className="policy-panel__inline-hint">
        Its additional requirements are <strong>highlighted inline</strong>{" "}
        throughout the spec below, next to what they apply to.
      </p>
      <a
        className="policy-panel__deeplink"
        href={`../../spec-extensions/policy-levels/${level.slug}`}
      >
        Full policy level →
      </a>
    </div>
  );
}

export function PolicySwitcher() {
  const loc = useLocation();
  const history = useHistory();
  const navSeq = useRef(0);
  // Tracks the pathname of the previous apply so we can tell a policy-only change
  // (same page, only ?policy= changed) from real page navigation. Deliberately
  // excludes the hash: a hash-only change (clicking a TOC entry) must NOT rebuild
  // the overlay — that layout shift would land the target behind the toolbar.
  const prevPathnameRef = useRef<string | null>(null);
  // Docusaurus statically renders this page with no query string. Deriving the
  // selection from `?policy=` during the first (hydration) render would diverge
  // from the server HTML and cause a React hydration mismatch, so until the
  // client has mounted we render the base state (no selection).
  const isBrowser = useIsBrowser();

  const levels = useMemo(() => orderedLevels(), []);
  const currentSlug = isBrowser ? policyFromSearch(loc.search) : null;
  const selected = levelBySlug(currentSlug);

  // Sticky-collapse behaviour: a sentinel directly above the sticky bar tells us
  // when the bar has stuck under the navbar. When stuck we collapse the detailed
  // description; the user can still expand it on demand (override wins).
  const sentinelRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [override, setOverride] = useState<boolean | null>(null);
  const expanded = override ?? !stuck;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setStuck(!entries[0].isIntersecting),
      // Treat the bar as "stuck" once the sentinel passes under the navbar,
      // matching the sticky top offset so the detail collapses right on time.
      { threshold: 0, rootMargin: "-66px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Publish the sticky bar's live height as a CSS variable so anchor scroll
  // offsets (scroll-margin-top / scroll-padding-top and the JS re-align) can
  // clear it — otherwise a TOC jump lands the heading behind the toolbar.
  useEffect(() => {
    const el = switcherRef.current;
    const root = document.documentElement;
    if (!el || typeof ResizeObserver === "undefined") return;
    const publish = () =>
      root.style.setProperty(
        "--policy-switcher-offset",
        `${Math.round(el.getBoundingClientRect().height)}px`,
      );
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--policy-switcher-offset");
    };
  }, []);

  const onSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const params = new URLSearchParams(loc.search);
    if (value === NONE_VALUE) params.delete("policy");
    else params.set("policy", value);
    const qs = params.toString();
    history.replace(`${loc.pathname}${qs ? `?${qs}` : ""}${loc.hash}`);
  };

  // Apply / clear the overlay once content is stable, re-arming on navigation
  // and on policy-selection changes. A navSeq guard discards stale passes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional navigation trigger — route fields re-arm the stable pass, not consumed in the callback
  useEffect(() => {
    if (typeof document === "undefined") return;
    const seq = ++navSeq.current;
    // Same pathname as last apply => only the policy changed (this effect re-runs
    // only on pathname/policy change, never on a hash-only TOC click). Preserve
    // the reader's scroll position instead of jumping to the hash target.
    const policyOnlyChange = prevPathnameRef.current === loc.pathname;
    prevPathnameRef.current = loc.pathname;
    runWhenContentStable(() => {
      if (seq !== navSeq.current) return;
      if (policyOnlyChange) {
        const anchor = captureViewportAnchor();
        clearOverlay();
        if (selected) applyOverlay(selected);
        restoreViewportAnchor(anchor);
      } else {
        clearOverlay();
        if (selected) applyOverlay(selected);
        forceAlignToHashTarget();
      }
    });
  }, [loc.pathname, loc.search, selected]);

  // Clear annotations when the switcher unmounts (SPA navigation away).
  useEffect(() => {
    return () => {
      navSeq.current++;
      clearOverlay();
    };
  }, []);

  return (
    <>
      <div
        className="policy-switcher__sentinel"
        aria-hidden="true"
        ref={sentinelRef}
      />
      <div
        className={`policy-switcher${stuck ? " policy-switcher--stuck" : ""}`}
        data-policy-switcher=""
        ref={switcherRef}
      >
        <div className="policy-switcher__control">
          <label
            className="policy-switcher__label"
            htmlFor="policy-level-select"
          >
            Policy Level
          </label>
          <select
            id="policy-level-select"
            className="policy-switcher__select"
            value={selected?.slug ?? NONE_VALUE}
            onChange={onSelect}
          >
            <option value={NONE_VALUE}>None (base spec)</option>
            {levels.map((lvl) => (
              <option key={lvl.policyId} value={lvl.slug}>
                {lvl.shortTitle}
                {lvl.status === "draft" ? " (DRAFT)" : ""}
              </option>
            ))}
          </select>
          {selected?.status === "draft" ? (
            <span className="policy-pill">DRAFT</span>
          ) : null}
          {selected ? (
            <button
              type="button"
              className="policy-switcher__toggle"
              aria-expanded={expanded}
              onClick={() => setOverride(!expanded)}
            >
              {expanded ? "Hide details ▴" : "Show details ▾"}
            </button>
          ) : null}
        </div>

        {selected ? (
          expanded ? (
            <PolicyDetail level={selected} />
          ) : null
        ) : (
          <p className="policy-switcher__hint">
            Choose a policy level to annotate the spec below with its
            requirements.
          </p>
        )}
      </div>
    </>
  );
}

export default PolicySwitcher;
