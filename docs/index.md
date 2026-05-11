---
slug: /
id: landing
title: Open Resource Discovery
hide_title: true
hide_table_of_contents: true
---

<div className="ord-home-flag" hidden />

<div className="lp-home">
  <div className="container lp-hero">
    <div className="main">
      <h1 className="heading">
        <span className="name clip">Open Resource Discovery</span>
      </h1>
      <p className="subtitle">Self-describing applications and services</p>
      <p className="tagline">An open protocol for decentralized application / service metadata publishing and discovery</p>
    </div>
    <div className="image">
      <div className="image-container">
        <div className="image-bg"></div>
        <div className="lp-image image-src" alt="Open Resource Discovery" />
      </div>
    </div>
    <div className="lp-hero-bottom">
      <div className="actions">
        <div className="action medium brand">
          [Introduction](./introduction.mdx)
        </div>
        <div className="action medium alt">
          [Specification](./spec-v1/index.md)
        </div>
        <div className="action medium alt">
          [Extensions](./spec-extensions/index.md)
        </div>
        <div className="action medium alt">
          [Ecosystem](./ecosystem/index.mdx)
        </div>
        <div className="action medium alt">
          [FAQ](./help/faq/index.md)
        </div>
        <div className="action medium alt">
          [Videos](./help/videos/index.mdx)
        </div>
      </div>
    </div>
  </div>

  <div className="container">
    <div className="lp-overview-grid">
      <div className="lp-overview-text">
        <p>Open Resource Discovery (ORD) is a protocol that enables applications and services to self-describe their exposed resources and capabilities, standardizing metadata publishing and discovery. It serves as a foundation for <strong>metadata catalogs and marketplaces</strong> while improving integration automation and quality.</p>
        <p>ORD is designed to be <strong>general-purpose</strong> and to work with a wide variety of industry-standard protocols and metadata standards. It can be used for <strong>static documentation</strong> or to describe the <strong>run-time system landscape</strong>, reflecting tenant-specific configuration and extensions.</p>
        <p>Technically, ORD allows applications to implement a read-only entry point (<a href="https://en.wikipedia.org/wiki/Service_provider_interface">Service Provider Interface</a>) that can be used to discover and crawl relevant metadata. The ORD standard is governed by the <a href="https://www.linuxfoundation.org/">Linux Foundation</a> / <a href="https://neonephos.org/projects/open-resource-discovery-ord/">NeoNephos</a>.</p>
      </div>
      <div className="lp-overview-diagram">
        ![ORD Provider Overview](/img/ord-provider-overview.svg 'ORD Provider Overview')
      </div>
    </div>
  </div>

  <div className="container">
    <div className="lp-features">
      <div className="lp-feature-card">
        <h3>Unify and Connect</h3>
        <p>Foundation for unified, well-connected metadata catalogs and marketplaces.</p>
      </div>
      <div className="lp-feature-card">
        <h3>Multi-purpose</h3>
        <p>Covers different technologies and domains, designed to be general-purpose and extensible.</p>
      </div>
      <div className="lp-feature-card">
        <h3>Standardized</h3>
        <p>Works with a wide variety of existing industry-standard protocols and metadata standards.</p>
      </div>
      <div className="lp-feature-card">
        <h3>Multiple scenarios</h3>
        <p>Use it for static documentation of your offerings or runtime system landscape introspection.</p>
      </div>
    </div>
  </div>

  <div className="container lp-quickstart-container">
    <h2>Quick Start</h2>
    <ol>
      <li><strong>Understand</strong> — Read the <a href="./introduction.mdx">5-minute primer</a> to grasp the core concepts</li>
      <li><strong>Explore</strong> — Check the <a href="./spec-v1/examples">example files</a> to see ORD in action</li>
      <li><strong>Implement</strong> — Follow the <a href="./spec-v1/interfaces/Configuration">ORD Configuration Interface</a> to add ORD to your application</li>
      <li><strong>Validate</strong> — Use the <a href="https://www.npmjs.com/package/@open-resource-discovery/specification">JSON Schema</a> to validate your ORD documents</li>
    </ol>
  </div>

  <div className="container lp-usecases-container">
    <h2>Use Cases</h2>
    <p>Information expressed or discovered through ORD can be used to build static <strong>metadata catalogs</strong> or do detailed <strong>runtime inspection of actual system landscapes</strong>:</p>
    <ul>
      <li>API and event catalog</li>
      <li>Data product directory/catalog</li>
      <li>Landscape specific API/event discovery for development platforms, platform engineering and low-code/no-code development</li>
      <li>Support admins in configuring services (discovery &amp; automation)</li>
      <li>AI grounding &amp; training</li>
      <li>Generic channel to describe, discover and exchange system capabilities between providers and consumers (even across vendors)</li>
    </ul>
  </div>

  <div className="container">
    <div className="row"><div className="col">
      <div className="card"><div className="card__header">
        <h3>Design Goals</h3>
      </div><div className="card__body">
        <ul>
          <li>Systems to <strong>describe themselves</strong> with a single entry-point to crawl all relevant metadata</li>
          <li>Achieve a combined, machine-readable <strong>system landscape metadata view</strong></li>
          <li>Enable <strong>fully automatic publication and discovery</strong> of metadata</li>
          <li>Having <strong>one aligned standard</strong> for description of different resource types, static and runtime perspectives, and many metadata-driven use-cases</li>
          <li>ORD is an <strong>open standard</strong> — <a href="https://github.com/open-resource-discovery/specification">open source</a> and extensible via labels, custom types, and spec extensions</li>
        </ul>
      </div></div>
    </div>
    <div className="col">
      <div className="card"><div className="card__header">
        <h3>Non-Goals</h3>
      </div><div className="card__body">
        <ul>
          <li>Replace industry-standard resource definition formats like OpenAPI</li>
          <li>Describing resources or capabilities in extensive detail</li>
          <li>Fast-changing information (current pull-based transport is not suited for time-critical updates)</li>
          <li>Describing resources not owned and exposed directly by the system (self-description only)</li>
        </ul>
      </div></div>
    </div></div>
  </div>

  <div className="container lp-learnmore-container">
    <h2>Learn More</h2>
    <ul>
      <li>Read the <a href="./introduction.mdx">ORD Introduction</a> and watch the <a href="./help/videos">ORD Videos</a></li>
      <li>Read blog post: <a href="https://community.sap.com/t5/technology-blog-posts-by-sap/why-we-created-open-resource-discovery/ba-p/14172057">Why we created Open Resource Discovery</a> and listen to <a href="https://podcast.opensap.info/open-source-way/2024/06/14/open-resource-discovery-ord/">podcast on ORD</a></li>
      <li>The npm package <a href="https://www.npmjs.com/package/@open-resource-discovery/specification"><code>@open-resource-discovery/specification</code></a> provides the JSON Schema and TypeScript types</li>
      <li>Have questions? <a href="https://notebooklm.google.com/notebook/f57d6c36-a0b0-4baa-898b-efede2521382">Ask AI about ORD</a> (NotebookLM)</li>
    </ul>
    <div className="videoContainer">
      <iframe className="videoIframe" src="https://www.youtube.com/embed/7Z818CdoZJg" title="Introducing the Open Resource Discovery protocol" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
    </div>
  </div>

</div>
