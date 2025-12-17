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
  var scrolled =
    (window.scrollY || window.pageYOffset) > __NAV_SCROLL_THRESHOLD__;
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

// Internal banner: fetch content from API and display it (hidden by default)
function initInternalBanner() {
  // Check localStorage to identify banner type - only proceed for internal-banner
  var bannerId = localStorage.getItem("docusaurus.announcement.id");
  if (bannerId !== "internal-banner") {
    return;
  }

  var banner = document.querySelector(".theme-announcement-bar");
  if (banner) {
    banner.style.display = "none";
    fetchBannerContent(banner);
    return;
  }

  // Banner not yet rendered (React hydration pending), use MutationObserver
  var observer = new MutationObserver(function (_, obs) {
    var banner = document.querySelector(".theme-announcement-bar");
    if (banner) {
      obs.disconnect();
      banner.style.display = "none";
      fetchBannerContent(banner);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(function () {
    observer.disconnect();
  }, 10000);
}

var BANNER_CACHE_KEY = "banner-server-cache";
var BANNER_CACHE_TTL = 24 * 60 * 60 * 1000;

function getBannerCache() {
  try {
    var cached = localStorage.getItem(BANNER_CACHE_KEY);
    if (!cached) return null;

    var parsed = JSON.parse(cached);
    var now = Date.now();

    if (parsed.timestamp && now - parsed.timestamp < BANNER_CACHE_TTL) {
      return parsed.data;
    }

    localStorage.removeItem(BANNER_CACHE_KEY);
    return null;
  } catch (e) {
    return null;
  }
}

function setBannerCache(data) {
  try {
    var cacheEntry = {
      timestamp: Date.now(),
      data: data,
    };
    localStorage.setItem(BANNER_CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (e) {
    // Silent fail if localStorage is full or unavailable
  }
}

function getBannerApiUrl() {
  var baseUrl = window.bannerServerBaseUrl || "";
  if (!baseUrl) return null;

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }
  return baseUrl + "/api/v1/content/open-resource-discovery/specification";
}

async function fetchWithRetry(url, retries, delay) {
  for (var i = 0; i <= retries; i++) {
    try {
      var response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      if (i === retries) {
        throw error;
      }
    }
    // Wait before retrying
    if (i < retries) {
      await new Promise(function (resolve) {
        setTimeout(resolve, delay);
      });
    }
  }
  return null;
}

function displayBanner(banner, data) {
  if (!data || !data.url) return;

  var content =
    banner.querySelector(".announcementBarContent") ||
    banner.querySelector("[class*='announcementBarContent']");

  if (content) {
    content.innerHTML =
      '<b>This is PUBLIC version. For internal version, follow this URL: <a href="' +
      data.url +
      '">' +
      data.url +
      "</a></b>";
    banner.style.display = "";
    adjustLayoutForBanner();
  }
}

async function fetchBannerContent(banner) {
  var apiUrl = getBannerApiUrl();
  if (!apiUrl) {
    console.debug(
      "BANNER_SERVER_BASE_URL not configured, skipping banner fetch",
    );
    return;
  }

  var cachedData = getBannerCache();
  if (cachedData) {
    displayBanner(banner, cachedData);
    return;
  }

  try {
    var data = await fetchWithRetry(apiUrl, 2, 1000);

    if (data && data.url) {
      setBannerCache(data);
      displayBanner(banner, data);
    }
  } catch (_error) {
    // Silent catch
  }
}

// Adjust navbar and main-wrapper position based on announcement bar height
function adjustLayoutForBanner() {
  var banner = document.querySelector(".theme-announcement-bar");
  var navbar = document.querySelector(".navbar");
  var mainWrapper = document.querySelector(".main-wrapper");

  if (!banner || !navbar) return;

  // Only apply on mobile/tablet (max-width: 996px)
  if (window.innerWidth > 996) return;

  var bannerHeight = banner.offsetHeight;
  if (bannerHeight > 0) {
    navbar.style.top = bannerHeight + "px";
    if (mainWrapper) {
      var navbarHeight = navbar.offsetHeight || 60;
      mainWrapper.style.paddingTop = bannerHeight + navbarHeight + "px";
    }
  }
}

// Re-adjust on resize
window.addEventListener("resize", adjustLayoutForBanner);
window.addEventListener("load", initInternalBanner, false);

window.addEventListener("load", __applyNavScrolled__, false);
window.addEventListener("scroll", __onNavScroll__, { passive: true });
window.addEventListener("resize", __onNavScroll__);
window.addEventListener("orientationchange", __onNavScroll__);
