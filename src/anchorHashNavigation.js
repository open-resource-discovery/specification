// fix processing of hashes in url
// without this fix, clicking on a direct link to http://localhost:3000/spec-v1/interfaces/Document#product_ordid, for example,
// will open the page but not scroll to `#product_ordid`, apparently because the page hasn't hydrated in time to
// find the hash tag. This function waits for rendering to complete and then tries again to scroll in view.

let pathname = undefined; // scrolling to the right place on the page is only a problem for the initial page load

export function onRouteDidUpdate({ location }) {
  debugger
  if (pathname !== location.pathname) {
    pathname = location.pathname;
    handleAnchorScroll(location);
    setPageHighlight();
  } else {
      setPageHighlight();
  }
}

function handleAnchorScroll(location) {
    const hash = location.hash;
    if (hash) {
      // Wait for content to load, then scroll
      setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
          }
      }, 400); // Adjust timing as needed
    }
}

function setPageHighlight() {
  // remove all existing page highlights first
  document.querySelectorAll(".highlight").forEach((dfn) => {
    dfn.classList.remove("highlight");
  });

  // highlight the links and definitions that were navigated to
  const toBeHighlightedElementId = window.location.hash.split("#")[1];

  const highlightedElement = document.getElementById(toBeHighlightedElementId);
  if (highlightedElement) {
    highlightedElement.classList.add("highlight");
  }
}
