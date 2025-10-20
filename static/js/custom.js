/* globals window, document */
// Little script to highlight the links and definitions that were navigated to
window.addEventListener("load", locationHashChanged, false);
window.addEventListener("hashchange", locationHashChanged, false);
function locationHashChanged() {
  document.querySelectorAll(".highlight").forEach((dfn) => {
    dfn.classList.remove("highlight");
  });
  const highlightedElementId = window.location.hash.split("#")[1];
  console.debug("highlighting", highlightedElementId);
  const highlightedElement = document.getElementById(highlightedElementId);
  if (highlightedElement) {
    highlightedElement.classList.add("highlight");
    if (highlightedElement.getElementsByTagName("a")[0]) {
      addAnchorTitle(highlightedElement.getElementsByTagName("a")[0].title);
    } else {
      addAnchorTitle(highlightedElement.textContent);
    }
  }
}

function addAnchorTitle(anchorTitle) {
  const split = document.title.split(" | ");
  anchorTitle = anchorTitle.replace("Direct link to ", "");
  document.title = `${anchorTitle} | ${split[split.length - 1]} | ${split[split.length - 2]}`;
}

var __NAV_SCROLL_THRESHOLD__ = 2;
var __navScrollTicking__ = false;

function __applyNavScrolled__() {
  var scrolled = (window.scrollY || window.pageYOffset) > __NAV_SCROLL_THRESHOLD__;
  var val = scrolled ? "1" : "0";
  var html = document.documentElement;
  if (html.getAttribute("data-nav-scrolled") !== val) {
    html.setAttribute("data-nav-scrolled", val);
  }
  __navScrollTicking__ = false;
}

function __onNavScroll__() {
  if (!__navScrollTicking__) {
    __navScrollTicking__ = true;
    window.requestAnimationFrame(__applyNavScrolled__);
  }
}

window.addEventListener("load", __applyNavScrolled__, false);
window.addEventListener("scroll", __onNavScroll__, { passive: true });
window.addEventListener("resize", __onNavScroll__);
window.addEventListener("orientationchange", __onNavScroll__);

/* --- Responsive tables --- */
const MOBILE_MAX = 1152;

function enhanceTables(root = document) {
  const tables = root.querySelectorAll(".theme-doc-markdown table, .markdown table");
  const isMobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;

  tables.forEach((t) => {
    const heads = Array.from(t.querySelectorAll("thead th")).map((th) => (th.textContent || "").trim());
    if (!heads.length) return;

    // Always set/refresh data-labels
    t.querySelectorAll("tbody tr").forEach((tr) => {
      Array.from(tr.children).forEach((td, i) => {
        const label = heads[i] || "";
        if (td.getAttribute("data-label") !== label) td.setAttribute("data-label", label);
      });
    });

    const hasLegend = t.previousElementSibling && t.previousElementSibling.classList?.contains("table-legend-mobile");
    if (isMobile) {
      if (!hasLegend) {
        const legend = document.createElement("div");
        legend.className = "table-legend-mobile";
        legend.setAttribute("aria-hidden", "true");
        legend.innerHTML = heads.map((h) => `<span>${h}</span>`).join('<span class="sep">|</span>');
        t.parentNode.insertBefore(legend, t);
      }
    } else if (hasLegend) {
      t.previousElementSibling.remove();
    }
  });
}

function enhanceNow() {
  try {
    enhanceTables(document);
  } catch (e) {
    console.warn("Table enhance failed", e);
  }
}

// Initial runs
window.addEventListener("load", enhanceNow, false);
window.addEventListener("pageshow", enhanceNow, false); // BFCache restore
setTimeout(enhanceNow, 200);

// Re-run on resize and MQ change
let __rt_tid;
function rerunDebounced() {
  clearTimeout(__rt_tid);
  __rt_tid = setTimeout(enhanceNow, 120);
}
window.addEventListener("resize", rerunDebounced, { passive: true });
try {
  const mm = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
  mm.addEventListener?.("change", rerunDebounced);
} catch (e) {
  console.debug("matchMedia listener not supported:", e);
}

// Observe SPA DOM changes
(function initObserver() {
  const mount = document.getElementById("__docusaurus") || document.body || document.documentElement;
  if (!mount || typeof mount.nodeType !== "number") {
    document.addEventListener("DOMContentLoaded", initObserver, { once: true });
    return;
  }

  // eslint-disable-next-line no-undef
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.addedNodes && m.addedNodes.length) {
        rerunDebounced();
        break;
      }
    }
  });

  try {
    mo.observe(mount, { childList: true, subtree: true });
  } catch (err) {
    console.warn("[tables] observe failed, retrying on DOMContentLoaded", err);
    document.addEventListener("DOMContentLoaded", initObserver, { once: true });
  }
})();
