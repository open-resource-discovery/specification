# Open Resource Discovery (ORD) - Explainer Video Script
## Duration: 5-8 minutes | Target: Technical decision-makers, architects, developers

---

## SCENE 1: THE HOOK (0:00 - 0:45)
**[Visual: Complex system landscape diagram with dozens of interconnected services]**

**NARRATOR:**

Imagine you're building a modern application. You need to integrate with five different services—maybe an ERP system, a CRM platform, a payment gateway, an event streaming service, and a data warehouse.

**[Visual: Zoom into chaos - different API portals, documentation sites, wikis]**

So you start hunting. You check API portals. You dig through wikis. You ask colleagues on Slack. You discover one system uses OpenAPI for REST, another uses AsyncAPI for events, and yet another has its own custom format.

**[Visual: Developer frustrated, multiple browser tabs open]**

Three hours later, you've found half the APIs you need... and you still don't know if they're actually available in your specific environment, or what data they actually expose.

**[Visual: Text overlay: "There has to be a better way"]**

What if every system could simply *tell you* what it offers—automatically, in a standard way?

---

## SCENE 2: INTRODUCING ORD (0:45 - 1:15)
**[Visual: ORD logo reveal, clean animation]**

**NARRATOR:**

Meet **Open Resource Discovery**, or ORD—a specification that solves the metadata discovery problem in distributed systems.

**[Visual: Simple diagram showing ORD as a bridge between providers and consumers]**

ORD is an open standard that lets applications and services describe *what they offer*—their APIs, events, data products, and capabilities—in a unified, machine-readable format.

Think of it as a standardized "menu" that every system can publish about itself, making discovery automatic instead of manual.

**[Visual: Transition to problem deep-dive]**

But to understand why this matters, let's look at the problem more closely.

---

## SCENE 3: THE PROBLEM IN DETAIL (1:15 - 2:45)
**[Visual: Split screen showing "Before ORD" scenarios]**

**NARRATOR:**

In today's enterprise landscapes, you have **three fundamental challenges**:

**[Visual: Icon 1 - Multiple format logos: OpenAPI, AsyncAPI, OData, GraphQL, WSDL]**

**First: Format Fragmentation.**
Every system uses different standards. REST APIs with OpenAPI. Events with AsyncAPI. OData services with CSDL. GraphQL with SDL. There's no *common layer* to discover what's available across all these formats.

**[Visual: Icon 2 - Network graph showing point-to-point connections]**

**Second: Integration Complexity.**
Without a standard discovery mechanism, every metadata consumer needs a custom integration with every provider. That's O(n) complexity—it doesn't scale. API catalogs, marketplaces, development platforms—they all need custom connectors for each system they support.

**[Visual: Icon 3 - Static vs Dynamic metadata comparison]**

**Third: The Static-Dynamic Gap.**
Product documentation shows what *could* exist in a generic installation. But your actual environment? That's customized, extended, and configured specifically for your needs. Traditional API documentation can't tell you what's *actually* available in *your* tenant, right now.

**[Visual: Animation showing developer wasting time]**

The result? Developers waste countless hours on discovery. Integration platforms struggle with maintenance. And organizations lack visibility into their own system landscape.

---

## SCENE 4: HOW ORD SOLVES IT (2:45 - 4:45)
**[Visual: Clean slate - "The ORD Solution"]**

**NARRATOR:**

ORD solves this through **three core innovations**:

**[Visual: Animation showing /.well-known/open-resource-discovery endpoint]**

**Innovation 1: A Standard Entry Point.**
Every ORD-enabled system exposes a well-known URL: `/.well-known/open-resource-discovery`

One endpoint. One format. No guessing.

**[Visual: JSON document animation showing ORD document structure]**

This endpoint returns a configuration that points to ORD Documents—JSON files containing complete metadata about the system's APIs, events, data products, and more.

**[Visual: Diagram showing ORD complementing existing standards]**

**Innovation 2: Complement, Don't Replace.**
ORD doesn't try to replace OpenAPI or AsyncAPI. Instead, it adds a *common metadata layer* on top.

An ORD document describes your APIs at a high level—their purpose, lifecycle, visibility, and relationships—then *references* the detailed OpenAPI or AsyncAPI specs you already have.

**[Visual: Split view showing static vs dynamic perspectives]**

**Innovation 3: Static AND Dynamic Perspectives.**
ORD supports two perspectives:

- **System-Version perspective**: The generic capabilities of a product version—think of it as the product catalog.
- **System-Instance perspective**: What's actually deployed and enabled in *your specific* tenant, including customizations and extensions.

This means you can discover both what a product *offers* and what your environment *actually has*.

**[Visual: Architecture diagram showing the full flow]**

Here's how it works in practice:

**[Animated sequence showing the flow]**

1. **ORD Providers** (your applications and services) implement the ORD endpoint and publish ORD documents describing their capabilities.

2. **ORD Aggregators** (like API catalogs or landscape management tools) periodically pull from these providers, validate the metadata, merge it, and build a central repository.

3. **ORD Consumers** (developers, platforms, automation tools) query the aggregator to discover what's available—no custom integrations needed.

**[Visual: Network graph transforming from complex mesh to hub-and-spoke]**

Suddenly, your O(n) integration problem becomes O(1). Every provider exposes the same standard. Every consumer uses the same discovery mechanism.

---

## SCENE 5: KEY CONCEPTS & CAPABILITIES (4:45 - 6:30)
**[Visual: Icon-based concept showcase]**

**NARRATOR:**

Let's explore what you can actually discover with ORD:

**[Visual: API icon with protocol badges]**

**APIs**: REST, OData, GraphQL, SOAP—whatever protocol you use, ORD can describe it. You get the high-level metadata plus references to detailed specs like OpenAPI.

**[Visual: Event stream animation]**

**Events**: Async event resources with AsyncAPI definitions. Know what events a system publishes or consumes.

**[Visual: Database/data warehouse icon]**

**Data Products**: Following data mesh principles, ORD describes data sets, their output ports (APIs), input ports (dependencies), and lineage.

**[Visual: Dependency graph]**

**Integration Dependencies**: Systems can declare what *they need* from others. This is huge for automation—imagine platforms that automatically set up connectivity based on declared dependencies.

**[Visual: Semantic layer animation]**

**Entity Types**: The business objects behind your APIs. This creates a semantic layer connecting technical endpoints to domain concepts—crucial for understanding *what* data you're working with.

**[Visual: Folder/organization structure]**

**Packages and Bundles**: Organize resources logically. Packages group resources by ownership and lifecycle. Consumption bundles group resources by authentication mechanism.

**[Visual: Grid showing different use cases]**

This enables powerful use cases:

- **API Catalogs** that automatically stay up-to-date
- **Data Product Directories** for data mesh architectures
- **Runtime Landscape Discovery** showing what's actually deployed
- **Development Platform Integration** with auto-discovered APIs
- **AI Training** using ORD as ground truth for system capabilities

**[Visual: Namespace and ID structure visualization]**

And it's all organized through globally unique namespaces and ORD IDs, ensuring there are never conflicts—even across vendors.

---

## SCENE 6: REAL-WORLD BENEFITS (6:30 - 7:15)
**[Visual: Before/After comparison]**

**NARRATOR:**

What does this mean for you?

**[Visual: Developer at computer, happy, productive]**

**For Developers**: No more hunting through documentation. Your IDE or platform shows you exactly what's available in your environment.

**[Visual: Architect looking at landscape visualization]**

**For Architects**: Complete visibility into your system landscape. Understand dependencies, find integration points, plan changes with confidence.

**[Visual: API catalog interface]**

**For Platform Teams**: Build catalogs, marketplaces, and developer portals that automatically discover and stay synchronized with your systems.

**[Visual: Automation workflow]**

**For Automation**: Enable intelligent automation that understands what systems offer and need, then configures integrations automatically.

---

## SCENE 7: CALL TO ACTION (7:15 - 8:00)
**[Visual: ORD documentation site preview]**

**NARRATOR:**

ORD is production-ready. It's governed by the Linux Foundation through the NeoNephos project. And it's being adopted by major vendors like SAP to power their API catalogs and landscape management tools.

**[Visual: Text overlays with resources]**

Want to dive deeper?

- **Read the Specification** at the ORD documentation site
- **Explore Examples** to see real ORD documents
- **Check out the Primer** for implementation guidance
- **Try it out**: Implement an ORD provider for your system

**[Visual: Community/contribution icons]**

ORD is open. It's extensible. And it's designed to work across vendors and ecosystems.

**[Visual: Final message]**

**Stop hunting for metadata. Start discovering it automatically.**

**Open Resource Discovery—because your systems should tell you what they offer.**

**[Visual: ORD logo, website URL, fade out]**

---

## PRODUCTION NOTES

### Suggested Visuals
- **Animated diagrams**: System landscapes, data flows, before/after comparisons
- **Code/JSON snippets**: Brief glimpses of ORD documents and configuration (not deep code)
- **UI mockups**: API catalog interfaces, developer portals using ORD
- **Icon-based explanations**: For abstract concepts like perspectives, namespaces, etc.

### Tone
- Professional but accessible
- Problem-first, solution-second approach
- Avoid jargon where possible; explain when necessary
- Emphasize practical benefits over technical details

### Pacing
- Scene 1-2 (Hook): Fast-paced, engaging
- Scene 3-4 (Problem/Solution): Moderate, clear
- Scene 5-6 (Details/Benefits): Slightly slower, informative
- Scene 7 (CTA): Energetic, inspiring

### Background Music
- Opening: Slightly tense (problem emphasis)
- Middle: Uplifting, modern (solution reveal)
- Closing: Inspirational, forward-looking

---

**Total Word Count**: ~1,100 words (~7-8 minutes at natural speaking pace)
**Target Audience**: Developers, architects, platform engineers, technical decision-makers
**Key Message**: ORD makes metadata discovery automatic, standardized, and scalable
