import { useHistory, useLocation } from "@docusaurus/router";
import useIsBrowser from "@docusaurus/useIsBrowser";
import type {
  CompiledLevel,
  CompiledRule,
  PolicyLevelsData,
  Requirement,
} from "@site/src/build/policyOverlay/types";
import policyLevelsData from "@site/src/generated/policy-levels.json";
import {
  forceAlignToHashTarget,
  runWhenContentStable,
} from "@site/src/theme/contentStable";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
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

function RuleTableView({ rule }: { rule: CompiledRule }) {
  if (!rule.tables || rule.tables.length === 0) return null;
  return (
    <>
      {rule.tables.map((table) => {
        const tableKey = table.caption ?? table.columns.join("|");
        return (
          <table className="policy-note__table" key={tableKey}>
            {table.caption ? <caption>{table.caption}</caption> : null}
            <thead>
              <tr>
                {table.columns.map((col) => (
                  <th key={col}>
                    <Markdown md={col} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => {
                const rowKey = row.join("¦");
                return (
                  <tr key={rowKey}>
                    {row.map((cell) => (
                      <td key={`${rowKey}:${cell}`}>
                        <Markdown md={cell} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      })}
    </>
  );
}

function RuleView({ rule }: { rule: CompiledRule }) {
  return (
    <li className="policy-rule">
      <div className="policy-rule__title">
        {rule.requirement ? (
          <span
            className={`policy-badge-req policy-badge-req--${rule.requirement}`}
          >
            {rule.requirement}
          </span>
        ) : null}
        <strong>{rule.title}</strong>
      </div>
      {rule.note ? (
        <Markdown className="policy-rule__note" md={rule.note} />
      ) : null}
      {rule.appliesWhen ? (
        <div className="policy-rule__applies-when">
          <strong>Applies when:</strong> <Markdown md={rule.appliesWhen} />
        </div>
      ) : null}
      {rule.exceptions && rule.exceptions.length > 0 ? (
        <div className="policy-rule__exceptions">
          <strong>Except:</strong> {rule.exceptions.join(", ")}
        </div>
      ) : null}
      <RuleTableView rule={rule} />
    </li>
  );
}

function SummaryPanel({ level }: { level: CompiledLevel }) {
  const [open, setOpen] = useState(true);
  const isDraft = level.status === "draft";

  // General rules grouped by `section`.
  const groups = useMemo(() => {
    const map = new Map<string, CompiledRule[]>();
    for (const rule of level.generalRules) {
      const key = rule.section ?? "General Policies";
      const bucket = map.get(key);
      if (bucket) bucket.push(rule);
      else map.set(key, [rule]);
    }
    return Array.from(map.entries());
  }, [level]);

  return (
    <section
      className={`policy-panel${isDraft ? " policy-panel--draft" : ""}`}
      aria-label={`${level.shortTitle} policy summary`}
    >
      <header className="policy-panel__header">
        <button
          type="button"
          className="policy-panel__toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="policy-panel__chevron" aria-hidden="true">
            {open ? "▾" : "▸"}
          </span>
          <span className="policy-panel__name">{level.shortTitle}</span>
          {isDraft ? <span className="policy-pill">DRAFT</span> : null}
        </button>
        <a
          className="policy-panel__deeplink"
          href={`/spec-extensions/policy-levels/${level.slug}`}
        >
          Full policy level →
        </a>
      </header>

      {open ? (
        <div className="policy-panel__body">
          {isDraft ? (
            <div className="policy-panel__draft-banner">
              This policy level is a <strong>draft</strong> and may change.
            </div>
          ) : null}

          <Markdown className="policy-panel__summary" md={level.summary} />

          {level.ancestry.length > 0 ? (
            <div className="policy-panel__ancestry">
              Includes {level.ancestry.join(" → ")}
            </div>
          ) : null}

          {groups.map(([section, rules]) => (
            <div className="policy-panel__group" key={section}>
              <h4>{section}</h4>
              <ul className="policy-rule-list">
                {rules.map((rule) => (
                  <RuleView key={rule.id} rule={rule} />
                ))}
              </ul>
            </div>
          ))}

          {level.propertyNameGroups.length > 0 ? (
            <div className="policy-panel__group">
              <h4>Property-name policies</h4>
              <ul className="policy-rule-list">
                {level.propertyNameGroups.map((rule) => (
                  <RuleView key={rule.id} rule={rule} />
                ))}
              </ul>
            </div>
          ) : null}

          <div className="policy-panel__legend">
            <h4>Badge legend</h4>
            <ul>
              {LEGEND.map((item) => (
                <li key={item.requirement}>
                  <span className={`policy-legend-badge ${item.cls}`}>
                    {item.requirement.toUpperCase()}
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
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
      {selected ? <SummaryPanel level={selected} /> : null}
    </div>
  );
}

export default PolicySwitcher;
