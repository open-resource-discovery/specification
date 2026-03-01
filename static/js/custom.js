/* globals window, document */
// Little script to highlight the links and definitions that were navigated to
window.addEventListener('load', locationHashChanged, false);
window.addEventListener('hashchange', locationHashChanged, false);
function locationHashChanged() {
  document.querySelectorAll('.highlight').forEach((dfn) => {
    dfn.classList.remove('highlight');
  });
  const highlightedElementId = window.location.hash.split('#')[1];
  console.debug('highlighting', highlightedElementId);
  const highlightedElement = document.getElementById(highlightedElementId);
  if (highlightedElement) {
    highlightedElement.classList.add('highlight');
    if (highlightedElement.getElementsByTagName('a')[0]) {
      addAnchorTitle(highlightedElement.getElementsByTagName('a')[0].title);
    } else {
      addAnchorTitle(highlightedElement.textContent);
    }
  }
}

function addAnchorTitle(anchorTitle) {
  const split = document.title.split(' | ');
  anchorTitle = anchorTitle.replace('Direct link to ', '');
  document.title = `${anchorTitle} | ${split[split.length - 1]} | ${split[split.length - 2]}`;
}

const __NAV_SCROLL_THRESHOLD__ = 2;
let __navScrollTicking__ = false;

function __applyNavScrolled__() {
  const scrolled =
    (window.scrollY || window.pageYOffset) > __NAV_SCROLL_THRESHOLD__;
  const val = scrolled ? '1' : '0';
  const html = document.documentElement;
  if (html.getAttribute('data-nav-scrolled') !== val) {
    html.setAttribute('data-nav-scrolled', val);
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
  const bannerId = localStorage.getItem('docusaurus.announcement.id');
  if (bannerId !== 'internal-banner') {
    return;
  }

  const banner = document.querySelector('.theme-announcement-bar');
  if (banner) {
    banner.style.display = 'none';
    fetchBannerContent(banner);
    return;
  }

  // Banner not yet rendered (React hydration pending), use MutationObserver
  const observer = new MutationObserver((_, obs) => {
    const banner = document.querySelector('.theme-announcement-bar');
    if (banner) {
      obs.disconnect();
      banner.style.display = 'none';
      fetchBannerContent(banner);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => {
    observer.disconnect();
  }, 10000);
}

const BANNER_CACHE_KEY = 'banner-server-cache';
const BANNER_CACHE_TTL = 24 * 60 * 60 * 1000;

function getBannerCache() {
  try {
    const cached = localStorage.getItem(BANNER_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const now = Date.now();

    if (parsed.timestamp && now - parsed.timestamp < BANNER_CACHE_TTL) {
      return parsed.data;
    }

    localStorage.removeItem(BANNER_CACHE_KEY);
    return null;
  } catch (_e) {
    return null;
  }
}

function setBannerCache(data) {
  try {
    const cacheEntry = {
      timestamp: Date.now(),
      data: data,
    };
    localStorage.setItem(BANNER_CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (_e) {
    // Silent fail if localStorage is full or unavailable
  }
}

function getBannerApiUrl() {
  let baseUrl = window.bannerServerBaseUrl || '';
  if (!baseUrl) return null;

  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  return `${baseUrl}/api/v1/content/open-resource-discovery/specification`;
}

async function fetchWithRetry(url, retries, delay) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url);
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
      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }
  return null;
}

function displayBanner(banner, data) {
  if (!data || !data.url) return;

  const content =
    banner.querySelector('.announcementBarContent') ||
    banner.querySelector("[class*='announcementBarContent']");

  if (content) {
    content.innerHTML =
      '<b>This is PUBLIC version. For internal version, follow this URL: <a href="' +
      data.url +
      '">' +
      data.url +
      '</a></b>';
    banner.style.display = '';
    adjustLayoutForBanner();
  }
}

async function fetchBannerContent(banner) {
  const apiUrl = getBannerApiUrl();
  if (!apiUrl) {
    console.debug(
      'BANNER_SERVER_BASE_URL not configured, skipping banner fetch',
    );
    return;
  }

  const cachedData = getBannerCache();
  if (cachedData) {
    displayBanner(banner, cachedData);
    return;
  }

  try {
    const data = await fetchWithRetry(apiUrl, 2, 1000);

    if (data?.url) {
      setBannerCache(data);
      displayBanner(banner, data);
    }
  } catch (_error) {
    // Silent catch
  }
}

// Adjust navbar and main-wrapper position based on announcement bar height
function adjustLayoutForBanner() {
  const banner = document.querySelector('.theme-announcement-bar');
  const navbar = document.querySelector('.navbar');
  const mainWrapper = document.querySelector('.main-wrapper');
  const docRoot = document.querySelector("[class*='docRoot_']");

  if (!banner || !navbar) return;

  const bannerHeight = banner.offsetHeight;
  const isDesktop = window.innerWidth > 996;

  if (isDesktop) {
    // Desktop: reset mobile styles
    navbar.style.top = '';
    if (mainWrapper) {
      mainWrapper.style.paddingTop = '';
    }
    // Add padding to docRoot if banner is taller than default 30px
    if (docRoot && bannerHeight > 30) {
      docRoot.style.paddingTop = `${bannerHeight - 30}px`;
    } else if (docRoot) {
      docRoot.style.paddingTop = '';
    }
    return;
  }

  // Mobile/tablet: adjust navbar and main-wrapper
  if (bannerHeight > 0) {
    navbar.style.top = `${bannerHeight}px`;
    if (mainWrapper) {
      const navbarHeight = navbar.offsetHeight || 60;
      mainWrapper.style.paddingTop = `${bannerHeight + navbarHeight}px`;
    }
  }
  // Reset docRoot padding on mobile
  if (docRoot) {
    docRoot.style.paddingTop = '';
  }
}

// Re-adjust on resize
window.addEventListener('resize', adjustLayoutForBanner);
window.addEventListener('load', initInternalBanner, false);

window.addEventListener('load', __applyNavScrolled__, false);
window.addEventListener('scroll', __onNavScroll__, { passive: true });
window.addEventListener('resize', __onNavScroll__);
window.addEventListener('orientationchange', __onNavScroll__);
