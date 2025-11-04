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
