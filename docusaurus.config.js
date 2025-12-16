// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import { themes as prismThemes } from "prism-react-renderer";

const baseUrl = process.env.BASE_URL ?? "/";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Open Resource Discovery",
  tagline:
    "An aligned protocol for publishing and discovering metadata about systems.",
  url: "https://open-resource-discovery.org",
  baseUrl,
  trailingSlash: false,
  onBrokenLinks: "throw",
  onDuplicateRoutes: "throw",
  staticDirectories: ["static"],
  favicon: "img/favicon.svg",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          sidebarCollapsible: true,
          sidebarCollapsed: true,
          routeBasePath: "/", // Serve the docs at the site's root
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/open-resource-discovery/specification/tree/main/",
        },
        blog: false, // disable the blog plugin
        theme: {
          customCss: require.resolve("./static/css/custom.css"),
        },
      }),
    ],
  ],

  headTags: [
    {
      tagName: "script",
      attributes: {},
      innerHTML: `window.bannerServerBaseUrl = ${JSON.stringify(process.env.BANNER_SERVER_BASE_URL || "")};`,
    },
  ],

  scripts: [`${baseUrl}js/custom.js`],

  plugins: [
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            from: "/spec-v1/interfaces/configuration",
            to: "/spec-v1/interfaces/Configuration",
          },
          {
            from: "/spec-v1/interfaces/document",
            to: "/spec-v1/interfaces/Document",
          },
        ],
      },
    ],
  ],

  themes: [
    "@docusaurus/theme-mermaid",
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        searchResultLimits: 10,
        hashed: true,
        indexBlog: false,
        indexPages: false,
        language: ["en"],
        docsRouteBasePath: "/",
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: "dark",
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.oceanicNext,
      },
      mermaid: {
        theme: { light: "neutral", dark: "forest" },
      },
      navbar: {
        title: "Open Resource Discovery",
        logo: {
          alt: "Open Resource Discovery",
          src: "img/logo/ORD_Icon_Color_Logo.svg",
        },
        items: [
          {
            label: "Overview",
            to: "overview",
          },
          {
            label: "Primer",
            to: "introduction",
          },
          {
            type: "dropdown",
            position: "left",
            label: "Specification",
            to: "spec-v1/",
            items: [
              {
                label: "ORD Specification",
                to: "/spec-v1/",
              },
              {
                label: "ORD Configuration Interface",
                to: "spec-v1/interfaces/Configuration",
              },
              {
                label: "ORD Document Interface",
                to: "spec-v1/interfaces/Document",
              },
              {
                label: "ORD Concepts",
                to: "spec-v1/concepts",
              },
              {
                label: "ORD Provider API",
                to: "spec-v1/interfaces/document-api",
              },
              {
                label: "Example Files",
                to: "spec-v1/examples",
              },
              {
                label: "Changelog",
                to: "https://github.com/open-resource-discovery/specification/blob/main/CHANGELOG.md",
              },
            ],
          },
          {
            type: "dropdown",
            position: "left",
            label: "Extensions",
            to: "spec-extensions",
            items: [
              {
                label: "Access Strategies",
                to: "spec-extensions/access-strategies/",
              },
              {
                label: "Policy Levels",
                to: "spec-extensions/policy-levels/",
              },
              {
                label: "Global Group Types",
                to: "spec-extensions/group-types/",
              },
            ],
          },
          {
            label: "Ecosystem",
            position: "left",
            to: "ecosystem/",
            items: [
              {
                label: "ORD Reference Application",
                href: "https://ord-reference-application.cfapps.sap.hana.ondemand.com/",
              },
            ],
          },
          {
            type: "dropdown",
            position: "left",
            label: "Help",
            to: "help/",
            items: [
              // {
              //   label: "Overview",
              //   to: "help/",
              // },
              {
                label: "Videos",
                to: "help/videos/",
              },
              {
                label: "FAQ",
                to: "help/faq/",
              },
            ],
          },
          {
            href: "https://github.com/open-resource-discovery/specification",
            label: "GitHub",
            position: "right",
            className: "header-github-pill",
          },
        ],
      },
      footer: {
        style: "dark",
        copyright: `
          <div class="footer-container">
            <div class="footer-funding">
              <div class="footer-funding__image">
                <img src="${baseUrl + "img/ord-footer-bmwe.png"}" alt="EU and German government funding logos" />
              </div>
              <div class="footer-funding__text">
                <p><strong>Funded by the European Union – NextGenerationEU.</strong></p>
                <p>The views and opinions expressed are solely those of the author(s) and do not necessarily reflect the views of the European Union or the European Commission. Neither the European Union nor the European Commission can be held responsible for them.</p>
                <div class="footer-copyright">
                  <p><strong>Copyright © Linux Foundation Europe.</strong></p>
                  <p>Open Resource Discovery is a project of NeoNephos Foundation. For applicable policies including privacy policy, terms of use and trademark usage guidelines, please see <a href="https://linuxfoundation.eu">https://linuxfoundation.eu</a>. Linux is a registered trademark of Linus Torvalds. </p>
                </div>
              </div>
            </div>
            <div class="neonephos-logos">
              <a href="https://neonephos.org/" target="_blank" rel="noopener noreferrer" class="neonephos-link">
                <img
                  src="${baseUrl + "img/ord-footer-neonephos.svg"}"
                  alt="Neonephos Logo"
                  class="neonephos-logo neonephos-logo--dark"
                />
                <img
                  src="${baseUrl + "img/ord-footer-neonephos-light.svg"}"
                  alt=""
                  aria-hidden="true"
                  class="neonephos-logo neonephos-logo--light"
                />
              </a>
            </div>
            <!--
            <div class="footer-legal-links">
              <a href="${baseUrl + "about/terms-of-use"}">Terms of Use</a>
              <span class="footer-legal-sep">|</span>
              <a href="${baseUrl + "about/privacy"}">Privacy Statement</a>
              <span class="footer-legal-sep">|</span>
              <a href="${baseUrl + "about/legal-disclosure"}">Legal Disclosure</a>
            </div>
            -->
          </div>
        `,
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
      ...(process.env.PR_PREVIEW_NUMBER
        ? {
            announcementBar: {
              id: "pr-preview-banner",
              content: `<b>This is a preview version of the website for <a href="https://github.com/open-resource-discovery/specification/pull/${process.env.PR_PREVIEW_NUMBER}" target="_blank">PR #${process.env.PR_PREVIEW_NUMBER}</a></b>`,
              backgroundColor: "#e65050ff",
              textColor: "#fff",
              isCloseable: false,
            },
          }
        : process.env.NODE_ENV === "production" &&
            process.env.BANNER_SERVER_BASE_URL
          ? {
              announcementBar: {
                id: "internal-banner",
                backgroundColor: "#f0fd00ff",
                textColor: "#000000",
                content: '<div class="internal-banner-hidden"></div>',
                isCloseable: false,
              },
            }
          : {}),
    }),
};

module.exports = config;
