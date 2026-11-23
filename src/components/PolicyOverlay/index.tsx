import { useHistory, useLocation } from "@docusaurus/router";
import useIsBrowser from "@docusaurus/useIsBrowser";
import type {
  CompiledLevel,
  PolicyLevelsData,
  Requirement,
} from "@site/src/build/policyOverlay/types";
import policyLevelsData from "@site/src/generated/policy-levels.json";
import {
  forceAlignToHashTarget,
  runWhenContentStable,
} from "@site/src/theme/contentStable";
import { type ChangeEvent, useEffect, useMemo, useRef } from "react";
import { applyOverlay, clearOverlay, renderInlineHtml } from "./applyOverlay";

const data = policyLevelsData as unknown as PolicyLevelsData;

const NONE_VALUE = "";

const LEGEND: { requirement: Requirement; label: string; cls: string }[] = [
  { requirement: "mandatory", label: "Mandatory (MUST)", cls: "mandatory" },
  {
    requirement: "recommended",
    label: "Recommended (SHOULD)",
    cls: "recommended",
  },
  { requirement: "optional", label: "Optional (MAY)", cls: "optional" },
  {
    requirement: "forbidden",
    label: "Forbidden (MUST NOT)",
    cls: "policy-forbidden",
  },
  {
    requirement: "conditional",
    label: "Conditional (see note)",
    cls: "optional",
  },
];

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
    <span
      className={className}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: first-party content, escaped and limited to a safe inline subset by renderInlineHtml
      dangerouslySetInnerHTML={{ __html: renderInlineHtml(md) }}
    />
  );
}

function PolicyInfoBar({ level }: { level: CompiledLevel }) {
  const isDraft = level.status === "draft";
  return (
    <section
      className={`policy-panel${isDraft ? " policy-panel--draft" : ""}`}
      aria-label={`${level.shortTitle} policy`}
    >
      <div className="policy-panel__body">
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

        <div className="policy-panel__meta">
          {level.ancestry.length > 1 ? (
            <span className="policy-panel__ancestry">
              Includes {level.ancestry.join(" → ")}
            </span>
          ) : null}
          <a
            className="policy-panel__deeplink"
            href={`/spec-extensions/policy-levels/${level.slug}`}
          >
            Full policy level →
          </a>
        </div>

        <div className="policy-panel__legend">
          {LEGEND.map((item) => (
            <span className="policy-legend-item" key={item.requirement}>
              <span className={`policy-legend-badge ${item.cls}`}>
                {item.requirement.toUpperCase()}
              </span>
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PolicySwitcher() {
  const loc = useLocation();
  const history = useHistory();
  const navSeq = useRef(0);
  // Docusaurus statically renders this page with no query string. Deriving the
  // selection from `?policy=` during the first (hydration) render would diverge
  // from the server HTML and cause a React hydration mismatch, so until the
  // client has mounted we render the base state (no selection).
  const isBrowser = useIsBrowser();

  const levels = useMemo(() => orderedLevels(), []);
  const currentSlug = isBrowser ? policyFromSearch(loc.search) : null;
  const selected = levelBySlug(currentSlug);

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
    runWhenContentStable(() => {
      if (seq !== navSeq.current) return;
      clearOverlay();
      if (selected) applyOverlay(selected);
      forceAlignToHashTarget();
    });
  }, [loc.pathname, loc.search, loc.hash, selected]);

  // Clean up annotations when the switcher unmounts (e.g. SPA navigation away).
  useEffect(() => {
    return () => {
      navSeq.current++;
      clearOverlay();
    };
  }, []);

  return (
    <div className="policy-switcher" data-policy-switcher="">
      <div className="policy-switcher__control">
        <label className="policy-switcher__label" htmlFor="policy-level-select">
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
      </div>
      <p className="policy-switcher__hint">
        Choose a policy level to annotate the spec below with its requirements.
      </p>
      {selected ? <PolicyInfoBar level={selected} /> : null}
    </div>
  );
}

export default PolicySwitcher;
