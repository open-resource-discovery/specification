// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import { themes as prismThemes } from "prism-react-renderer";

const baseUrl = process.env.BASE_URL ?? "/";
const editUrlBase =
  "https://github.com/open-resource-discovery/specification/tree/main/";
/** @type {Record<string, string>} */
const generatedDocSources = {
  "spec-v1/interfaces/Configuration.md": "spec/v1/Configuration.schema.yaml",
  "spec-v1/interfaces/Document.md": "spec/v1/Document.schema.yaml",
  "spec-v1/interfaces/OrdOverlay.md": "spec/v1/OrdOverlay.schema.yaml",
  "spec-v1/examples/configuration-1.md":
    "examples/configuration/configuration-1.json",
  "spec-v1/examples/document-1.md": "examples/documents/document-1.json",
  "spec-v1/examples/document-agents.md":
    "examples/documents/document-agents.json",
  "spec-v1/examples/document-data-product.md":
    "examples/documents/document-data-product.json",
  "spec-v1/examples/document-entity-types.md":
    "examples/documents/document-entity-types.json",
  "spec-v1/examples/document-integration-dependencies.md":
    "examples/documents/document-integration-dependencies.jsonc",
  "spec-v1/examples/document-overlays.md":
    "examples/documents/document-overlays.json",
  "spec-v1/examples/document-poc.md": "examples/documents/document-poc.jsonc",
  "spec-v1/examples/document-special-protocols.md":
    "examples/documents/document-special-protocols.json",
};

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

  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      mdx1CompatDisabledByDefault: true,
      siteStorageNamespacing: true,
      fasterByDefault: true,
    },
  },

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
          editUrl: ({ docPath }) =>
            editUrlBase + (generatedDocSources[docPath] ?? `docs/${docPath}`),
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
          {
            from: "/spec-v1/concepts/compatibility",
            to: "/spec-v1/concepts/versioning-and-lifecycle#compatibility",
          },
          {
            from: "/spec-v1/concepts/implementing-ord-natively",
            to: "/spec-v1/guides/implementing-ord-natively",
          },
          {
            from: "/spec-extensions/models/OrdOverlay",
            to: "/spec-v1/interfaces/OrdOverlay",
          },
          {
            from: "/overview",
            to: "/",
          },
          {
            from: "/details",
            to: "/spec-v1",
          },
          {
            from: "/details/articles",
            to: "/spec-v1",
          },
          {
            from: "/details/articles/data-product",
            to: "/spec-v1/concepts/data-product",
          },
          {
            from: "/details/articles/grouping-and-bundling",
            to: "/spec-v1/concepts/grouping-and-bundling",
          },
          {
            from: "/details/articles/integration-dependency",
            to: "/spec-v1/concepts/integration-dependency",
          },
          {
            from: "/details/articles/system-landscape-model",
            to: "/spec-v1/concepts/system-landscape-model",
          },
          {
            from: "/details/articles/adopt-ord-as-provider",
            to: "/help/faq/adopt-ord-as-provider",
          },
          {
            from: "/details/articles/why-ord",
            to: "/help/faq/why-ord",
          },
          {
            from: "/details/faq",
            to: "/help/faq",
          },
          {
            from: "/details/videos",
            to: "/help/videos",
          },
          {
            from: "/details/videos/introduction",
            to: "/help/videos/introduction",
          },
          {
            from: "/spec-v1/diagrams",
            to: "https://open-resource-discovery.org/tools/schema-viewer/index.html?schema=Document",
          },
          {
            from: "/spec-v1/diagrams/ord-configuration",
            to: "https://open-resource-discovery.org/tools/schema-viewer/index.html?schema=Configuration",
          },
          {
            from: "/spec-v1/diagrams/ord-document",
            to: "https://open-resource-discovery.org/tools/schema-viewer/index.html?schema=Document",
          },
          {
            from: "/spec-v1/diagrams/ord-overlay",
            to: "https://open-resource-discovery.org/tools/schema-viewer/index.html?schema=OrdOverlay",
          },
          {
            from: "/spec-v1/interfaces/explorer",
            to: "https://open-resource-discovery.org/tools/schema-viewer/index.html?schema=Document",
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
        defaultMode: "light",
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      prism: {
        theme: prismThemes.oceanicNext,
        darkTheme: prismThemes.oceanicNext,
      },
      mermaid: {
        theme: { light: "neutral", dark: "dark" },
      },
      navbar: {
        title: "Open Resource Discovery",
        logo: {
          alt: "Open Resource Discovery",
          src: "img/logo/ORD_Icon_Color_Logo.svg",
        },
        items: [
          {
            label: "Introduction",
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
                label: "ORD Overlay Interface",
                to: "spec-v1/interfaces/OrdOverlay",
              },
              {
                label: "Concepts",
                to: "spec-v1/concepts",
              },
              {
                type: "html",
                value:
                  '<hr style="margin: 0.1rem 0.1rem; border: none; border-top: 1px solid var(--ifm-color-emphasis-300);">',
              },
              {
                label: "Schema Explorer",
                href: "/tools/schema-viewer/index.html?schema=Document",
                target: "_blank",
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
            label: "Guides",
            position: "left",
            to: "spec-v1/guides/",
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
              {
                label: "ORD Presentation",
                href: "https://open-resource-discovery.github.io/presentation/",
              },
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
              {
                label: "Ask AI (NotebookLM)",
                href: "https://notebooklm.google.com/notebook/f57d6c36-a0b0-4baa-898b-efede2521382",
              },
            ],
          },
          {
            href: "https://notebooklm.google.com/notebook/f57d6c36-a0b0-4baa-898b-efede2521382",
            label: "Ask AI",
            position: "right",
            className: "header-notebooklm-pill",
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
            <div class="footer-partners" aria-label="Project affiliation and funding">
              <a href="https://commission.europa.eu/strategy-and-policy/recovery-plan-europe_en" target="_blank" rel="noopener noreferrer" class="footer-partner-link footer-partner-link--funding">
                <img
                  src="${`${baseUrl}img/ord-footer-bmwe.png`}"
                  alt="Funded by the European Union NextGenerationEU and supported by the German Federal Ministry for Economic Affairs and Energy"
                  class="footer-partner-logo footer-partner-logo--funding"
                />
              </a>
              <span class="footer-partners__divider" aria-hidden="true"></span>
              <nav class="footer-governance" aria-label="Project and governance organizations">
                <a href="https://linuxfoundation.eu/" target="_blank" rel="noopener noreferrer" class="footer-partner-link">
                  <img
                    src="${`${baseUrl}img/linux-foundation-europe-white.svg`}"
                    alt="Linux Foundation Europe"
                    class="footer-partner-logo footer-partner-logo--linux-foundation"
                  />
                </a>
                <span class="footer-governance__divider" aria-hidden="true"></span>
                <a href="https://neonephos.org/" target="_blank" rel="noopener noreferrer" class="footer-partner-link">
                  <img
                    src="${`${baseUrl}img/ord-footer-neonephos.svg`}"
                    alt="NeoNephos Foundation"
                    class="footer-partner-logo footer-partner-logo--neonephos neonephos-logo--dark"
                  />
                  <img
                    src="${`${baseUrl}img/ord-footer-neonephos-light.svg`}"
                    alt=""
                    aria-hidden="true"
                    class="footer-partner-logo footer-partner-logo--neonephos neonephos-logo--light"
                  />
                </a>
                <span class="footer-governance__divider" aria-hidden="true"></span>
                <a href="https://apeirora.eu/" target="_blank" rel="noopener noreferrer" class="footer-partner-link">
                  <img
                    src="${`${baseUrl}img/apeirora.svg`}"
                    alt="ApeiroRA"
                    class="footer-partner-logo footer-partner-logo--apeirora"
                  />
                </a>
              </nav>
            </div>
            <div class="footer-copy">
              <div class="footer-funding__text">
                <p><strong>Funded by the European Union – NextGenerationEU.</strong></p>
                <p>The views and opinions expressed are solely those of the author(s) and do not necessarily reflect the views of the European Union or the European Commission. Neither the European Union nor the European Commission can be held responsible for them.</p>
              </div>
              <div class="footer-copyright">
                <p><strong>Copyright © Linux Foundation Europe.</strong></p>
                <p>Open Resource Discovery is a project of NeoNephos Foundation and part of ApeiroRA. For applicable policies including privacy policy, terms of use and trademark usage guidelines, please see <a href="https://linuxfoundation.eu">https://linuxfoundation.eu</a>. Linux is a registered trademark of Linus Torvalds.</p>
              </div>
            </div>
            <!--
            <div class="footer-legal-links">
              <a href="${`${baseUrl}about/terms-of-use`}">Terms of Use</a>
              <span class="footer-legal-sep">|</span>
              <a href="${`${baseUrl}about/privacy`}">Privacy Statement</a>
              <span class="footer-legal-sep">|</span>
              <a href="${`${baseUrl}about/legal-disclosure`}">Legal Disclosure</a>
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
                backgroundColor: "#ffe900",
                textColor: "#000000",
                content: '<div class="internal-banner-hidden"></div>',
                isCloseable: false,
              },
            }
          : {}),
    }),
};

module.exports = config;
