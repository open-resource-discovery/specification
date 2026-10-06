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
        <h2>Publish and discover metadata consistently</h2>
        <p>Open Resource Discovery (ORD) standardizes how applications and services publish metadata about the resources and capabilities they expose, and how consumers discover it.</p>
        <p>
          <span>Providers can describe and connect APIs, events, data products, AI agents, and other capabilities with shared business context and relationships.</span>{" "}
          <span>Consumers can use this standardized metadata to build catalogs and marketplaces, automate integration workflows, or inspect what is actually available in a tenant-specific runtime landscape.</span>
        </p>
        <p>ORD complements established standards such as OpenAPI and AsyncAPI rather than replacing them, so teams can keep their existing definitions as the source of truth while adding consistent discovery, business context, and cross-resource relationships.</p>
        <p>It is an open standard governed by the <a href="https://www.linuxfoundation.org/">Linux Foundation</a> / <a href="https://neonephos.org/">NeoNephos</a>.</p>
      </div>
      <ProviderDiagram />
    </div>
  </div>

  <div className="container lp-benefits-container">
    <h2>Why ORD?</h2>
    <div className="lp-features">
      <div className="lp-feature-card">
        <h3>Automated Discovery</h3>
        <p>Publish metadata at the source so catalogs and tools can find and refresh it without manual registration.</p>
      </div>
      <div className="lp-feature-card">
        <h3>The Actual Runtime Landscape</h3>
        <p>Reveal tenant-specific configuration, extensions, and endpoints, not only static product documentation.</p>
      </div>
      <div className="lp-feature-card">
        <h3>Existing Standards, Connected</h3>
        <p>Keep OpenAPI, AsyncAPI, and other definitions as the source of truth while ORD adds shared context and relationships.</p>
      </div>
      <div className="lp-feature-card">
        <h3>Extensible Where Needed</h3>
        <p>Use labels, custom types, and specification extensions for domain-specific needs while retaining a common core.</p>
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
    <p>Explore ORD through the <a href="https://open-resource-discovery.github.io/presentation/">interactive presentation</a>, or visit the <a href="./help">Help hub</a> for videos, implementation guidance, examples, and answers to common questions.</p>
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
