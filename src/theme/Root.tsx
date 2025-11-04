import React, { useEffect, useRef } from "react";
import OriginalRoot from "@theme-original/Root";
import { useLocation } from "@docusaurus/router";

/** Idempotent: only sets data-label, no structural mutations */
function enhanceTables(root: Document | HTMLElement = document) {
  const tables = root.querySelectorAll<HTMLTableElement>(".theme-doc-markdown table, .markdown table");
  tables.forEach((t) => {
    const heads = Array.from(t.querySelectorAll("thead th")).map((th) => (th.textContent || "").trim());
    if (!heads.length) return;
    t.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((tr) => {
      Array.from(tr.children).forEach((td, i) => {
        const label = heads[i] || "";
        if (td.getAttribute("data-label") !== label) td.setAttribute("data-label", label);
      });
    });
  });
}

/** Run last */
function runWhenContentStable(run: () => void, opts?: { quietMs?: number; maxMs?: number }) {
  if (typeof document === "undefined") return;
  const root = document.querySelector<HTMLElement>(".theme-doc-markdown, .markdown") || document.body;
  const quietMs = opts?.quietMs ?? 120;
  const maxMs = opts?.maxMs ?? 2000;

  let settledTimer: number | null = null;
  let hardStopTimer: number | null = null;

  const finish = () => {
    if (settledTimer) window.clearTimeout(settledTimer);
    if (hardStopTimer) window.clearTimeout(hardStopTimer);
    try { mo.disconnect(); } catch {}
    run();
  };

  const afterPaint = (cb: () => void) => requestAnimationFrame(() => requestAnimationFrame(cb));
  let mo: MutationObserver;

  afterPaint(() => {
    const debouncedSettle = () => {
      if (settledTimer) window.clearTimeout(settledTimer);
      settledTimer = window.setTimeout(() => finish(), quietMs);
    };

    try {
      mo = new MutationObserver(debouncedSettle);
      mo.observe(root, { childList: true, subtree: true, characterData: true });
    } catch {
      setTimeout(finish, quietMs);
      return;
    }

    // initial settle kick + hard cap
    debouncedSettle();
    hardStopTimer = window.setTimeout(() => finish(), maxMs);
  });
}

function forceAlignToHashTarget() {
  if (typeof window === "undefined") return;
  const raw = window.location.hash?.slice(1);
  if (!raw) return;
  const id = decodeURIComponent(raw);
  const el = document.getElementById(id);
  if (!el) return;

  const prev = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";

  const nav = document.querySelector<HTMLElement>(".navbar");
  const offset = (nav?.getBoundingClientRect().height ?? 0) + 8;

  const rect = el.getBoundingClientRect();
  const y = window.scrollY + rect.top - offset;

  window.scrollTo({ top: y, left: 0 });
  el.classList?.add("is-target");

  document.documentElement.style.scrollBehavior = prev;
}

/** Step detection */
function widthStepIndex(w: number, start = 1400, step = 200) {
  if (w >= start) return 0;
  const delta = Math.max(0, start - w);
  return Math.floor(delta / step) + 1;
}

export default function Root({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const navSeq = useRef(0);
  const lastStep = useRef<number | null>(null);
  const rafTid = useRef<number | null>(null);

  // Initial hydration: tables + anchors align properly
  useEffect(() => {
    const seq = ++navSeq.current;
    runWhenContentStable(() => {
      if (seq !== navSeq.current) return;
      enhanceTables(document);
      forceAlignToHashTarget();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SPA navigation: realign after stabilization
  useEffect(() => {
    const seq = ++navSeq.current;
    runWhenContentStable(() => {
      if (seq !== navSeq.current) return;
      enhanceTables(document);
      forceAlignToHashTarget();
    });
  }, [loc.pathname, loc.hash, loc.search]);

  // Re-align every 200px step, Also when getting bigger.
  useEffect(() => {
    const onResize = () => {
      if (rafTid.current) cancelAnimationFrame(rafTid.current);
      rafTid.current = requestAnimationFrame(() => {
        const w = window.innerWidth;
        const idx = widthStepIndex(w, 1400, 200);
        if (lastStep.current === null) {
          lastStep.current = idx;
          return;
        }
        if (idx !== lastStep.current) {
          lastStep.current = idx;
          requestAnimationFrame(() => requestAnimationFrame(forceAlignToHashTarget));
        }
      });
    };
    // Init
    lastStep.current = widthStepIndex(window.innerWidth, 1400, 200);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafTid.current) cancelAnimationFrame(rafTid.current);
    };
  }, []);

  return <OriginalRoot>{children}</OriginalRoot>;
}
