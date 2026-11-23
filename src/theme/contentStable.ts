/// <reference lib="dom" />
// Shared client-side settle detection + hash realignment.
//
// Extracted from src/theme/Root.tsx so that other client islands
// (e.g. the Policy-Level overlay applier) can reuse the exact same
// "content has stopped mutating" signal without duplicating the logic.

/**
 * Invoke `run` once the document content has stopped mutating.
 *
 * Uses a debounced MutationObserver on the markdown root: every mutation
 * re-arms a `quietMs` timer, and `run` fires when no mutation has happened
 * for `quietMs` (or after a `maxMs` hard cap, whichever comes first).
 * The observer self-disconnects before `run` is invoked.
 *
 * No-op during SSR.
 */
export function runWhenContentStable(
  run: () => void,
  opts?: { quietMs?: number; maxMs?: number },
): void {
  if (typeof document === "undefined") return;
  const root =
    document.querySelector<HTMLElement>(".theme-doc-markdown, .markdown") ||
    document.body;
  const quietMs = opts?.quietMs ?? 120;
  const maxMs = opts?.maxMs ?? 2000;

  let settledTimer: number | null = null;
  let hardStopTimer: number | null = null;

  const finish = () => {
    if (settledTimer) window.clearTimeout(settledTimer);
    if (hardStopTimer) window.clearTimeout(hardStopTimer);
    try {
      mo.disconnect();
    } catch {}
    run();
  };

  const afterPaint = (cb: () => void) =>
    requestAnimationFrame(() => requestAnimationFrame(cb));
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

/**
 * Re-align the viewport to the element targeted by the current URL hash,
 * compensating for the sticky navbar. No-op during SSR or when there is no
 * hash / matching element.
 */
export function forceAlignToHashTarget(): void {
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
