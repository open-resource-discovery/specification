---
slug: /
id: landing
title: Open Resource Discovery
hide_title: true
hide_table_of_contents: true
---

import { ProviderDiagram } from "@site/src/components/OrdDiagrams";

<div className="ord-home-flag" hidden />

<div className="lp-home">
  <div className="container lp-hero">
    <div className="main">
      <h1 className="heading">
        <span className="name clip">Open Resource Discovery</span>
        <span className="text">Self-describing applications and services</span>
      </h1>
      <p className="tagline">An open protocol for decentralized application / service metadata publishing and discovery</p>
    </div>
    <div className="image">
      <div className="image-container">
        <div className="image-bg"></div>
        <div className="lp-image image-src" alt="Open Resource Discovery" />
      </div>
    </div>
  </div>

  <div className="container">
    <div className="actions">
      <div className="action medium brand">
        [Introduction](./introduction.mdx)
      </div>
      <div className="action medium alt">
        [Specification](./spec-v1/index.md)
      </div>
      <div className="action medium alt">
        [Ecosystem](./ecosystem/index.mdx)
      </div>
      <div className="action medium alt">
        [Help](./help/index.mdx)
      </div>
    </div>
  </div>

  <div className="container">
    <div className="lp-overview-grid">
      <div className="lp-overview-text">
        <p>Open Resource Discovery (ORD) is a protocol that enables applications and services to self-describe their exposed resources and capabilities, standardizing metadata publishing and discovery. It serves as a foundation for <strong>metadata catalogs and marketplaces</strong> while improving integration automation and quality.</p>
        <p>ORD is designed to be <strong>general-purpose</strong> and to work with a wide variety of industry-standard protocols and metadata standards. It can be used for <strong>static documentation</strong> or to describe the <strong>run-time system landscape</strong>, reflecting tenant-specific configuration and extensions.</p>
        <p>Technically, ORD allows applications to implement a read-only entry point (<a href="https://en.wikipedia.org/wiki/Service_provider_interface">Service Provider Interface</a>) that can be used to discover and crawl relevant metadata. The ORD standard is governed by the <a href="https://www.linuxfoundation.org/">Linux Foundation</a> / <a href="https://neonephos.org/">NeoNephos</a>.</p>
      </div>
      <ProviderDiagram />
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
      <li><strong>Understand:</strong> Read the <a href="./introduction">ORD introduction</a> to grasp the core concepts.</li>
      <li><strong>Explore:</strong> Check the <a href="./spec-v1/examples">example files</a> to see ORD in action.</li>
      <li><strong>Implement:</strong> Follow the <a href="./spec-v1/interfaces/Configuration">ORD Configuration Interface</a> to add ORD to your application.</li>
      <li><strong>Validate:</strong> Use the <a href="https://www.npmjs.com/package/@open-resource-discovery/specification">JSON Schema</a> to validate your ORD documents.</li>
    </ol>
  </div>

  <div className="container lp-usecases-container">
    <h2>What You Can Build</h2>
    <p>ORD metadata supports both static catalogs and detailed inspection of actual system landscapes:</p>
    <ul>
      <li>Unified catalogs for APIs, events, data products, agents, and capabilities.</li>
      <li>Landscape-aware discovery of resources available in a specific tenant.</li>
      <li>Integration and platform automation based on machine-readable metadata.</li>
      <li>Developer tools and AI agents grounded in current resource capabilities and relationships.</li>
    </ul>
  </div>

  <div className="container">
    <div className="row"><div className="col">
      <div className="card"><div className="card__header">
        <h3>Design Goals</h3>
      </div><div className="card__body">
        <ul>
          <li>Let systems <strong>describe themselves</strong> through one crawlable entry point.</li>
          <li>Support both static product metadata and the <strong>runtime system landscape</strong>.</li>
          <li>Enable <strong>automated publication and discovery</strong> across tools and vendors.</li>
          <li>Add common context and relationships while preserving established definition formats.</li>
          <li>Remain <a href="https://github.com/open-resource-discovery/specification">open source</a> and extensible.</li>
        </ul>
      </div></div>
    </div>
    <div className="col">
      <div className="card"><div className="card__header">
        <h3>Non-Goals</h3>
      </div><div className="card__body">
        <ul>
          <li>Replace industry-standard resource definition formats such as OpenAPI.</li>
          <li>Describe resources or capabilities in exhaustive technical detail.</li>
          <li>Transport fast-changing operational information.</li>
          <li>Describe resources that are not owned and exposed directly by the system.</li>
        </ul>
      </div></div>
    </div></div>
  </div>

  <div className="container lp-learnmore-container">
    <h2>Learn More</h2>
    <p>Explore ORD through the interactive presentation, or visit the Help hub for videos, implementation guidance, examples, and answers to common questions.</p>
    <div className="lp-learnmore-actions">
      <div className="action medium brand">
        [Explore the Presentation ↗](https://open-resource-discovery.github.io/presentation/)
      </div>
      <div className="action medium alt">
        [Browse Help](./help/index.mdx)
      </div>
    </div>
  </div>

</div>
