const consumers = [
  "Joule",
  "Joule Studio",
  "SAP BTP",
  "SAP Business Data Cloud",
  "SAP Event Hub",
  "Other consumers",
];

export function AlignmentDiagram() {
  return (
    <figure
      className="ord-diagram ord-alignment"
      aria-label="Metadata integration with and without ORD alignment"
    >
      <section className="ord-alignment__mode ord-alignment__mode--unmanaged">
        <header>
          <span>Without alignment</span>
          <strong>Point-to-point metadata integration</strong>
        </header>
        <div className="ord-alignment__network">
          <div className="ord-alignment__nodes ord-alignment__nodes--providers">
            <span>Provider</span>
            <span>Provider</span>
            <span>Provider</span>
          </div>
          <svg
            className="ord-alignment__connections"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 16.667H100 M0 50H100 M0 83.333H100 M0 16.667L100 50 M0 16.667L100 83.333 M0 50L100 16.667 M0 50L100 83.333 M0 83.333L100 16.667 M0 83.333L100 50" />
          </svg>
          <div className="ord-alignment__nodes ord-alignment__nodes--consumers">
            <span>Consumer</span>
            <span>Consumer</span>
            <span>Consumer</span>
          </div>
        </div>
      </section>
      <section className="ord-alignment__mode ord-alignment__mode--aligned">
        <header>
          <span>With ORD alignment</span>
          <strong>Shared metadata through an aggregator</strong>
        </header>
        <div className="ord-alignment__rail">
          Common description and discovery
        </div>
        <div className="ord-alignment__flow">
          <div className="ord-alignment__stack ord-alignment__stack--providers">
            <span>Provider</span>
            <span>Provider</span>
            <span>Provider</span>
          </div>
          <i className="ord-flow-arrow" aria-hidden="true" />
          <div className="ord-alignment__aggregator">
            <b aria-hidden="true" />
            <strong>ORD aggregator</strong>
            <small>Reads metadata and serves consumers</small>
          </div>
          <i className="ord-flow-arrow" aria-hidden="true" />
          <div className="ord-alignment__stack ord-alignment__stack--consumers">
            <span>Consumer</span>
            <span>Consumer</span>
            <span>Consumer</span>
          </div>
        </div>
      </section>
    </figure>
  );
}

export function ProviderDiagram() {
  return (
    <figure className="ord-diagram ord-provider-diagram">
      <svg
        viewBox="0 0 700 570"
        role="img"
        aria-labelledby="ord-provider-title ord-provider-desc"
      >
        <title id="ord-provider-title">ORD provider overview</title>
        <desc id="ord-provider-desc">
          An application or service exposes resources and capabilities through
          ORD and declares dependencies on external resources. The protocols and
          formats shown are examples.
        </desc>
        <g className="provided">
          <path d="M330 200V132" />
          <circle cx="330" cy="132" r="10" />
          <path d="M400 200L502 132" />
          <circle cx="502" cy="132" r="10" />
          <path d="M272.9 324H218" />
          <circle cx="218" cy="324" r="10" />
          <path d="M400 370L502 420" />
          <circle cx="502" cy="420" r="10" />
          <path d="M350 370L390 460" />
          <circle cx="390" cy="460" r="10" />
          <path d="M450 285H474" />
          <circle cx="474" cy="285" r="10" />
          <path d="M152 420H190" />
          <circle cx="200" cy="420" r="10" />
        </g>
        <path className="taxonomy-association" d="M281.2 232H200" />
        <g className="required">
          <path d="M300 370L218 420" />
          <path className="socket" d="M200 402C224 402 224 438 200 438" />
        </g>
        <polygon
          className="hex"
          points="250,285 300,200 400,200 450,285 400,370 300,370"
        />
        <text className="provider-role" x="350" y="244" textAnchor="middle">
          ORD Provider
        </text>
        <text className="hex-label" x="350" y="277" textAnchor="middle">
          <tspan x="350">Application</tspan>
          <tspan x="350" dy="30">
            / Service
          </tspan>
        </text>
        <g className="tag provided-tag" transform="translate(200 52)">
          <rect width="260" height="62" rx="8" />
          <text x="130" y="25" textAnchor="middle">
            Capabilities
          </text>
          <text
            className="protocol-examples"
            x="130"
            y="47"
            textAnchor="middle"
          >
            Features · configuration
          </text>
        </g>
        <g className="tag provided-tag" transform="translate(520 100)">
          <rect width="160" height="62" rx="8" />
          <text x="80" y="25" textAnchor="middle">
            APIs
          </text>
          <text className="protocol-examples" x="80" y="47" textAnchor="middle">
            REST · MCP · A2A
          </text>
        </g>
        <g className="tag taxonomy-tag" transform="translate(32 201)">
          <rect width="168" height="62" rx="8" />
          <text x="84" y="25" textAnchor="middle">
            Entity Types
          </text>
          <text className="protocol-examples" x="84" y="47" textAnchor="middle">
            Business semantics
          </text>
        </g>
        <g className="tag provided-tag" transform="translate(32 293)">
          <rect width="168" height="62" rx="8" />
          <text x="84" y="25" textAnchor="middle">
            Data Products
          </text>
          <text className="protocol-examples" x="84" y="47" textAnchor="middle">
            Delta Sharing · SQL
          </text>
        </g>
        <g className="tag provided-tag" transform="translate(520 380)">
          <rect width="160" height="62" rx="8" />
          <text x="80" y="25" textAnchor="middle">
            Events
          </text>
          <text className="protocol-examples" x="80" y="47" textAnchor="middle">
            CloudEvents
          </text>
        </g>
        <g className="tag provided-tag" transform="translate(308 478)">
          <rect width="164" height="62" rx="8" />
          <text x="82" y="37" textAnchor="middle">
            Agents
          </text>
        </g>
        <g className="tag required-tag" transform="translate(24 478)">
          <rect width="268" height="62" rx="8" />
          <text x="134" y="25" textAnchor="middle">
            Integration Dependencies
          </text>
          <text
            className="protocol-examples"
            x="134"
            y="47"
            textAnchor="middle"
          >
            Requires external APIs / Events
          </text>
        </g>
        <g className="external-provider">
          <polygon
            className="hex"
            points="24,420 56,375 120,375 152,420 120,465 56,465"
          />
          <text x="88" y="413" textAnchor="middle">
            Application
          </text>
          <text x="88" y="434" textAnchor="middle">
            / Service
          </text>
        </g>
        <g className="api-card" transform="translate(494 250)">
          <rect width="186" height="68" rx="8" />
          <text className="api-title" x="93" y="27" textAnchor="middle">
            ORD Provider API
          </text>
          <text className="api-subtitle" x="93" y="49" textAnchor="middle">
            Expose metadata
          </text>
        </g>
        <g className="definition-note" transform="translate(514 194)">
          <path d="M-12-47L-4-18" />
          <text className="definition-title">Detailed definitions</text>
          <text className="definition-subtitle" y="23">
            for example OpenAPI
          </text>
        </g>
      </svg>
      <figcaption>
        Protocols and formats shown are examples; ORD supports more.
      </figcaption>
    </figure>
  );
}

export function RolesDiagram() {
  return (
    <figure
      className="ord-diagram ord-roles"
      aria-label="ORD provider, aggregator, and consumer roles"
    >
      <section className="ord-role ord-role--provider">
        <span className="ord-role__kicker">Publish</span>
        <h3>Provider</h3>
        <span className="ord-role__description">
          Describes an application or service.
        </span>
        <div>
          <b>ORD Provider API</b>
          <b>ORD documents</b>
          <b>Definitions</b>
        </div>
      </section>
      <i className="ord-role-flow">
        <span>Metadata</span>
      </i>
      <section className="ord-role ord-role--aggregator">
        <span className="ord-role__kicker">Connect</span>
        <h3>Aggregator</h3>
        <span className="ord-role__description">
          Collects, validates, resolves, and serves metadata.
        </span>
        <div>
          <b>Effective views</b>
          <b>Hosted definitions</b>
          <b>Discovery API · own contract</b>
        </div>
      </section>
      <i className="ord-role-flow">
        <span>Discovery API</span>
      </i>
      <section className="ord-role ord-role--consumer">
        <span className="ord-role__kicker">Use</span>
        <h3>Consumer</h3>
        <span className="ord-role__description">
          Finds and uses resources across systems.
        </span>
        <div>
          <b>Catalogs</b>
          <b>Developer tools</b>
          <b>Automation &amp; AI</b>
        </div>
      </section>
      <figcaption>
        Arrows show metadata delivery. Roles can overlap; consumers may also
        read a provider directly.
      </figcaption>
    </figure>
  );
}

export function DiscoveryFlowDiagram() {
  const steps = [
    ["01", "Know the system", "Base URL or registered endpoint", "known"],
    ["02", "Read ORD config", "/.well-known/open-resource-discovery", "config"],
    ["03", "Fetch documents", "Perspectives, resources, taxonomy", "document"],
    [
      "04",
      "Follow definitions",
      "OpenAPI, AsyncAPI, A2A, and more",
      "definitions",
    ],
  ];
  return (
    <figure
      className="ord-diagram ord-discovery-flow"
      aria-label="ORD pull discovery flow"
    >
      <div className="ord-discovery-flow__steps">
        {steps.map(([number, title, detail, type], index) => (
          <div className="ord-discovery-flow__group" key={number}>
            <section
              className={`ord-discovery-step ord-discovery-step--${type}`}
            >
              <span>{number}</span>
              <strong>{title}</strong>
              {type === "config" ? (
                <code>{detail}</code>
              ) : (
                <small>{detail}</small>
              )}
            </section>
            {index < steps.length - 1 && (
              <i className="ord-flow-arrow" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
      <figcaption>
        <span>Repeatable crawl</span>
        <strong>High-level context and detailed contracts stay linked</strong>
      </figcaption>
    </figure>
  );
}

export function DataModelDiagram() {
  return (
    <figure
      className="ord-diagram ord-data-model"
      aria-label="ORD high-level information model"
    >
      <section className="ord-model-column ord-model-column--system">
        <header>
          <span>Context</span>
          <strong>System domain</strong>
        </header>
        <div className="ord-model-items">
          <b>System Instance</b>
          <b>System Version</b>
          <b>System Type</b>
        </div>
      </section>
      <section className="ord-model-column ord-model-column--resources">
        <header>
          <span>What is exposed or required</span>
          <strong>Resources &amp; Capabilities</strong>
        </header>
        <div className="ord-model-items">
          <b>APIs</b>
          <b>Events</b>
          <b>Data Products</b>
          <b>Capabilities</b>
          <b>Agents</b>
          <b>Integration Dependencies</b>
        </div>
      </section>
      <section className="ord-model-column ord-model-column--taxonomy">
        <header>
          <span>How it is understood</span>
          <strong>Taxonomy &amp; access</strong>
        </header>
        <div className="ord-model-items">
          <b>Vendor &amp; Product</b>
          <b>Package</b>
          <b>Entity Type</b>
          <b>Group / Group Type</b>
          <b>Consumption Bundle</b>
        </div>
      </section>
      <figcaption>
        <strong>ORD Document</strong>
        <span>
          Stable IDs, lifecycle, visibility, definitions, and relationships
          connect the three parts.
        </span>
      </figcaption>
    </figure>
  );
}

export function UnifiedMetadataDiagram() {
  return (
    <figure
      className="ord-diagram ord-unified-metadata"
      aria-label="Metadata sources connected by an ORD aggregator and served through a discovery API"
    >
      <section className="ord-unified-metadata__sources">
        <header>
          <span>Many existing sources</span>
          <h3>Inventories &amp; catalogs</h3>
        </header>
        <div>
          <b>
            Systems &amp; services<small>Inventory · service discovery</small>
          </b>
          <b>
            APIs<small>OpenAPI definitions</small>
          </b>
          <b>
            Events<small>AsyncAPI definitions</small>
          </b>
          <b>
            Data resources<small>Catalogs &amp; definitions</small>
          </b>
          <b>
            Agents<small>A2A · MCP</small>
          </b>
        </div>
      </section>
      <i className="ord-flow-arrow" aria-hidden="true" />
      <section className="ord-unified-metadata__graph">
        <header>
          <span>One ORD aggregator</span>
          <h3>Connected metadata graph</h3>
        </header>
        <div className="ord-graph">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <b className="system">Systems</b>
          <b className="api">APIs</b>
          <b className="events">Events</b>
          <b className="entity">
            Entity Types<small>shared semantics</small>
          </b>
          <b className="data">Data</b>
          <b className="agents">Agents</b>
          <b className="taxonomy">
            Taxonomy<small>groups · products</small>
          </b>
        </div>
        <span className="ord-unified-metadata__caption">
          Resources · shared semantics · taxonomy
        </span>
      </section>
      <i className="ord-flow-arrow" aria-hidden="true" />
      <section className="ord-unified-metadata__consumers">
        <header>
          <span>One interface</span>
          <h3>Discovery API</h3>
        </header>
        <strong>
          ORD Discovery API<small>One connected view</small>
        </strong>
        <div>
          <b>Catalogs</b>
          <b>Developer tools</b>
          <b>Automation</b>
          <b>AI agents</b>
        </div>
      </section>
      <figcaption>
        ORD connects resource descriptions and their relationships while
        detailed contracts remain in their existing standards.
      </figcaption>
    </figure>
  );
}

export function NamespaceDiagram() {
  const variants = [
    [
      "System-owned",
      "A resource specific to one system type",
      "system",
      "system type",
      "System namespace",
      "vendor + system type",
    ],
    [
      "Authority-owned",
      "A shared contract, definition, or taxonomy",
      "authority",
      "authority",
      "Authority namespace",
      "vendor + governing authority",
    ],
  ];
  return (
    <figure
      className="ord-diagram ord-namespace"
      aria-label="ORD system and authority namespace structures"
    >
      {variants.map(([kind, description, owner, ownerLabel, name, meaning]) => (
        <section key={kind}>
          <header>
            <span>{kind}</span>
            <strong>{description}</strong>
          </header>
          <div className="ord-namespace__code">
            <b>vendor</b>
            <i>.</i>
            <b>{owner}</b>
            <i>.</i>
            <b>sub-context</b>
          </div>
          <div className="ord-namespace__labels">
            <span>vendor</span>
            <span>{ownerLabel}</span>
            <span>optional context</span>
          </div>
          <span className="ord-namespace__meaning">
            <strong>{name}</strong> = {meaning}
          </span>
        </section>
      ))}
      <figcaption>
        <span>
          Namespaces express ownership and collision-free identity. Groups
          support flexible categorization.
        </span>
        <span>
          Products and Vendors use the vendor namespace alone:{" "}
          <code>foo:product:Orders:</code>.
        </span>
      </figcaption>
    </figure>
  );
}

export function PullSequenceDiagram() {
  return (
    <figure className="ord-diagram ord-pull-sequence">
      <svg
        viewBox="0 0 1120 470"
        role="img"
        aria-labelledby="ord-pull-title ord-pull-desc"
      >
        <title id="ord-pull-title">ORD pull transport sequence</title>
        <desc id="ord-pull-desc">
          A provider registers with service discovery. An aggregator discovers
          system instances, then requests the configuration, ORD documents, and
          linked definitions.
        </desc>
        <defs>
          <marker
            id="ord-pull-arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10Z" />
          </marker>
        </defs>
        <g className="participant aggregator">
          <rect x="55" y="16" width="220" height="52" rx="7" />
          <text x="165" y="49">
            ORD Aggregator
          </text>
        </g>
        <g className="participant provider">
          <rect x="450" y="16" width="220" height="52" rx="7" />
          <text x="560" y="49">
            ORD Provider
          </text>
        </g>
        <g className="participant service-discovery">
          <rect x="845" y="16" width="220" height="52" rx="7" />
          <text x="955" y="49">
            Service Discovery
          </text>
        </g>
        <g className="lifelines">
          <path d="M165 68V458M560 68V458M955 68V458" />
        </g>
        <g className="message">
          <text x="760" y="96">
            Register system instance
          </text>
          <path d="M560 106H955" markerEnd="url(#ord-pull-arrow)" />
        </g>
        <g className="message">
          <text x="560" y="139">
            1 · Discover system instances
          </text>
          <path d="M165 149H955" markerEnd="url(#ord-pull-arrow)" />
          <path
            className="response"
            d="M955 167H165"
            markerEnd="url(#ord-pull-arrow)"
          />
        </g>
        <g className="loop">
          <rect x="95" y="185" width="580" height="258" rx="8" />
          <path d="M95 185H285L269 209H95Z" />
          <text x="108" y="202">
            per system instance
          </text>
        </g>
        <g className="message">
          <text x="365" y="229">
            2 · GET well-known configuration
          </text>
          <path d="M165 239H560" markerEnd="url(#ord-pull-arrow)" />
          <path
            className="response"
            d="M560 257H165"
            markerEnd="url(#ord-pull-arrow)"
          />
        </g>
        <g className="loop inner">
          <rect x="111" y="272" width="548" height="155" rx="7" />
          <path d="M111 272H285L269 296H111Z" />
          <text x="124" y="289">
            per ORD document
          </text>
        </g>
        <g className="message">
          <text x="365" y="313">
            3 · GET ORD document
          </text>
          <path d="M165 323H560" markerEnd="url(#ord-pull-arrow)" />
          <path
            className="response"
            d="M560 341H165"
            markerEnd="url(#ord-pull-arrow)"
          />
        </g>
        <g className="loop inner">
          <rect x="127" y="352" width="516" height="63" rx="7" />
          <path d="M127 352H332L316 376H127Z" />
          <text x="140" y="369">
            per resource definition
          </text>
        </g>
        <g className="message">
          <text x="385" y="389">
            4 · GET linked definition
          </text>
          <path d="M165 399H560" markerEnd="url(#ord-pull-arrow)" />
          <path
            className="response"
            d="M560 410H165"
            markerEnd="url(#ord-pull-arrow)"
          />
        </g>
      </svg>
      <figcaption>
        <span>Pull transport</span>
        <strong>HTTP GET · honor advertised access strategies</strong>
        <small>Definition files may be hosted elsewhere.</small>
      </figcaption>
    </figure>
  );
}

export function SapArchitectureDiagram() {
  return (
    <figure
      className="ord-diagram ord-sap-architecture"
      aria-label="SAP metadata architecture with shared providers, aggregators, knowledge integration, and consumers"
    >
      <section className="ord-sap-column ord-sap-column--providers">
        <span>Shared providers</span>
        <div>
          <small>ORD Providers</small>
          <h3>Applications / services</h3>
          <b>
            Dynamic<em>System-instance metadata</em>
          </b>
          <b>
            Static<em>System type / version</em>
          </b>
        </div>
      </section>
      <i className="ord-flow-arrow" aria-hidden="true" />
      <section className="ord-sap-column ord-sap-column--aggregators">
        <span>Aggregators</span>
        <div>
          <small>ORD Aggregator</small>
          <h3>Unified Metadata Service (UMS)</h3>
          <span className="ord-sap-column__detail">
            Static + dynamic metadata
          </span>
        </div>
        <div>
          <small>ORD Aggregator</small>
          <h3>SAP Business Accelerator Hub</h3>
          <span className="ord-sap-column__detail">Static catalog only</span>
        </div>
      </section>
      <i className="ord-flow-arrow" aria-hidden="true" />
      <section className="ord-sap-column ord-sap-column--knowledge">
        <span>Knowledge integration</span>
        <div>
          <small>Combine metadata</small>
          <h3>Knowledge Graph</h3>
          <span className="ord-sap-column__detail">UMS + other sources</span>
        </div>
      </section>
      <i className="ord-flow-arrow" aria-hidden="true" />
      <section className="ord-sap-column ord-sap-column--consumers">
        <span>Consumers</span>
        <div>
          {consumers.map((consumer) => (
            <b key={consumer}>{consumer}</b>
          ))}
        </div>
      </section>
      <figcaption>
        <strong>
          UMS combines both perspectives; SAP Business Accelerator Hub takes the
          static catalog.
        </strong>
        <span>
          Arrows summarize metadata delivery to connected consumer experiences.
        </span>
      </figcaption>
    </figure>
  );
}
