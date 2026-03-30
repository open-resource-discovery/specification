// fix processing of hashes in url
// without this fix, clicking on a link to spec-v1/interfaces/Document#product_ordid, for example,
// will open the page but not scroll to `#product_ordid`, apparently because the page hasn't hydrated in time to
// find the hash tag. This function waits for rendering to complete and then tries again.
export function onRouteDidUpdate({ location }) {
  if (location.hash) {
    let id = location.hash.substring(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // do nothing. we'll keep the undecoded version
    }
    document.getElementById(id)?.scrollIntoView();

    setPageHighlight();
  }
}

function setPageHighlight() {
  // remove all existing page highlights first
  document.querySelectorAll(".highlight").forEach((dfn) => {
    dfn.classList.remove("highlight");
  });

  // highlight the links and definitions that were navigated to
  const toBeHighlightedElementId = window.location.hash.split("#")[1];
  console.debug("highlighting", toBeHighlightedElementId);
  const highlightedElement = document.getElementById(toBeHighlightedElementId);
  if (highlightedElement) {
    highlightedElement.classList.add("highlight");
  }
}
