import { useHistory, useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import OriginalRoot from "@theme-original/Root";
import type React from "react";
import { useEffect, useRef } from "react";
import { forceAlignToHashTarget, runWhenContentStable } from "./contentStable";

// Keep published deep links working after moving the normative detail sections.
const movedIdentifierAnchors = new Set([
  "structure-of-namespaces",
  "namespace-constraints",
  "vendor-namespace",
  "system-namespace",
  "authority-namespace",
  "sub-context-namespace",
  "customer-namespace",
  "ord-id-construction",
  "ord-id-resolving",
  "correlation-id-construction",
  "specification-id-construction",
  "def-ord-system-namespace",
  "def-authority-namespace",
  "def-ord-sub-context-namespace",
  "def-ord-id",
  "def-correlation-id",
  "def-specification-id",
]);

/** Idempotent: only sets data-label, no structural mutations */
function enhanceTables(root: Document | HTMLElement = document) {
  const tables = root.querySelectorAll<HTMLTableElement>(
    ".theme-doc-markdown table, .markdown table",
  );
  tables.forEach((t) => {
    const heads = Array.from(t.querySelectorAll("thead th")).map((th) =>
      (th.textContent || "").trim(),
    );
    if (!heads.length) return;
    t.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((tr) => {
      Array.from(tr.children).forEach((td, i) => {
        const label = heads[i] || "";
        if (td.getAttribute("data-label") !== label)
          td.setAttribute("data-label", label);
      });
    });
  });
}

/** Step detection */
function widthStepIndex(w: number, start = 1400, step = 200) {
  if (w >= start) return 0;
  const delta = Math.max(0, start - w);
  return Math.floor(delta / step) + 1;
}

export default function Root({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const history = useHistory();
  const specificationPath = useBaseUrl("/spec-v1");
  const identifiersPath = useBaseUrl("/spec-v1/concepts/identifiers");
  const lifecyclePath = useBaseUrl(
    "/spec-v1/concepts/versioning-and-lifecycle",
  );
  const navSeq = useRef(0);
  const lastStep = useRef<number | null>(null);
  const rafTid = useRef<number | null>(null);

  useEffect(() => {
    const path = loc.pathname.replace(/\/$/, "");
    const anchor = loc.hash.slice(1);
    if (path === specificationPath) {
      if (movedIdentifierAnchors.has(anchor)) {
        history.replace(`${identifiersPath}${loc.search}${loc.hash}`);
      } else if (anchor === "versioning" || anchor === "lifecycle") {
        history.replace(`${lifecyclePath}${loc.search}${loc.hash}`);
      }
    }
  }, [
    loc.pathname,
    loc.hash,
    loc.search,
    history,
    specificationPath,
    identifiersPath,
    lifecyclePath,
  ]);

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
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional navigation trigger — deps used to detect route changes, not consumed inside callback
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
          requestAnimationFrame(() =>
            requestAnimationFrame(forceAlignToHashTarget),
          );
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
