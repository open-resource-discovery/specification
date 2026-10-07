import unifiedMetadata from "../../../diagrams/unified-metadata.json";

const consumers = [
  "Joule",
  "Joule Studio",
  "SAP BTP",
  "SAP Business Data Cloud",
  "SAP Event Hub",
  "…",
];

export function SilosDiagram() {
  const silos = [
    ["inventory", "Inventory", "Systems / Services", ["a", "b", "c"]],
    ["api", "Catalog", "APIs", ["a", "b", "c"]],
    ["event", "Catalog", "Events", ["a", "b"]],
    ["data", "Catalog", "Data", ["a", "b", "c"]],
    ["agent", "Catalog", "Agents", ["a", "b"]],
  ] as const;

  return (
    <figure
      className="ord-diagram ord-silos"
      aria-label="System inventory and resource metadata split across separate inventories and catalogs"
    >
      <div className="ord-silos__formats">
        <span>Service discovery</span>
        <span>OpenAPI</span>
        <span>AsyncAPI</span>
        <span>A2A</span>
        <span>MCP</span>
      </div>
      <div className="ord-silos__grid">
        {silos.map(([type, kind, label, items]) => (
          <section className={`ord-silo ord-silo--${type}`} key={type}>
            <small>{kind}</small>
            <strong>{label}</strong>
            {items.map((item) => (
              <i key={item} />
            ))}
          </section>
        ))}
      </div>
      <div className="ord-silos__gap">
        <strong>No shared landscape view</strong>
        <span>inventory · context · relationships · runtime state</span>
      </div>
    </figure>
  );
}

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

export function SpecificationMap() {
  const sections = [
    {
      label: "01 · Participants",
      question: "Who publishes, connects, and uses metadata?",
      description:
        "Start with the three roles. One system can implement more than one.",
      links: [
        ["ORD roles", "#ord-roles"],
        ["Provider", "#ord-provider"],
        ["Aggregator", "#ord-aggregator"],
        ["Consumer", "#ord-consumer"],
      ],
      type: "roles",
    },
    {
      label: "02 · Publication",
      question: "How is metadata exposed and retrieved?",
      description:
        "Follow the provider contract from its entry point to documents and definitions.",
      links: [
        ["Transport modes", "#ord-transport-modes"],
        ["Provider API", "#ord-provider-api"],
        ["ORD document", "#ord-document"],
        ["Resource definitions", "#resource-definitions"],
      ],
      type: "publication",
    },
    {
      label: "03 · Discovery",
      question: "How does metadata become discoverable?",
      description:
        "See what aggregators must preserve, resolve, validate, and serve.",
      links: [
        ["Aggregation", "#ord-aggregation"],
        ["Discovery API", "#ord-discovery-api"],
        ["Perspectives", "#perspectives"],
      ],
      type: "discovery",
    },
    {
      label: "04 · Semantics",
      question: "How does metadata stay unambiguous?",
      description:
        "Use shared identity, lifecycle, and protocol conventions across resources.",
      links: [
        ["ID concepts", "#id-concepts"],
        ["Version and lifecycle", "#version-and-lifecycle"],
        ["REST characteristics", "#common-rest-characteristics"],
        ["Terminology", "#terminology"],
      ],
      type: "semantics",
    },
  ] as const;

  return (
    <nav
      className="ord-diagram ord-spec-map"
      aria-label="Navigate the ORD specification"
    >
      {sections.map(({ label, question, description, links, type }) => (
        <section
          className={`ord-spec-map__section ord-spec-map__section--${type}`}
          key={type}
        >
          <span className="ord-spec-map__label">{label}</span>
          <strong>{question}</strong>
          <p>{description}</p>
          <div className="ord-spec-map__links">
            {links.map(([title, href]) => (
              <a href={href} key={href}>
                {title}
              </a>
            ))}
          </div>
        </section>
      ))}
    </nav>
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

export function PerspectivesDiagram() {
  return (
    <figure
      className="ord-diagram ord-perspectives"
      aria-label="ORD static, dynamic, and system-independent perspectives"
    >
      <div className="ord-perspectives__global">
        <span>System-independent</span>
        <strong>Shared taxonomy</strong>
        <small>Products · Vendors · global Entity Types and Groups</small>
      </div>
      <div className="ord-perspectives__grid">
        <section className="ord-perspective ord-perspective--static">
          <span>Static</span>
          <h3>System type / version</h3>
          <p>Reusable design-time baseline.</p>
          <div>
            <b>offered APIs</b>
            <b>versions</b>
            <b>design-time contracts</b>
          </div>
        </section>
        <section className="ord-perspective ord-perspective--dynamic">
          <span>Dynamic</span>
          <h3>System instance</h3>
          <p>Complete view of one running tenant.</p>
          <div>
            <b>active APIs</b>
            <b>extensions</b>
            <b>endpoints</b>
          </div>
        </section>
      </div>
      <div className="ord-perspectives__effective">
        <span>Aggregator responsibility</span>
        <strong>Resolve the effective view for consumers</strong>
      </div>
    </figure>
  );
}

export function LandscapeDiagram() {
  const relationMarker = "ord-landscape-entity-type";
  const dependencyMarker = "ord-landscape-dependency";

  return (
    <figure
      className="ord-diagram ord-landscape"
      aria-label="Order fulfillment resource graph across Orders, Fulfillment, and Shipping providers"
    >
      <svg viewBox="0 0 1184 430" role="img">
        <title>A connected ORD resource graph</title>
        <desc>
          A Fulfillment Agent declares dependencies on an Order Created Event,
          the Orders API, and the Shipment API. Order and Shipment Entity Types
          provide shared business context.
        </desc>
        <defs>
          <marker
            id={relationMarker}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerUnits="userSpaceOnUse"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <path className="relation-head" d="M0 0L10 5L0 10Z" />
          </marker>
          <marker
            id={dependencyMarker}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerUnits="userSpaceOnUse"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <path className="dependency-head" d="M0 0L10 5L0 10Z" />
          </marker>
        </defs>

        <path
          className="dependency"
          d="M440 75H176V170"
          markerEnd={`url(#${dependencyMarker})`}
        />
        <path
          className="dependency"
          d="M744 108H800V359H856"
          markerEnd={`url(#${dependencyMarker})`}
        />
        <path
          className="dependency"
          d="M744 75H856"
          markerEnd={`url(#${dependencyMarker})`}
        />
        <text className="dependency-label" x="308" y="61" textAnchor="middle">
          triggered by
        </text>
        <text className="dependency-label" x="810" y="283">
          read order
        </text>
        <text className="dependency-label" x="800" y="40" textAnchor="middle">
          <tspan x="800">create</tspan>
          <tspan x="800" dy="19">
            shipment
          </tspan>
        </text>

        <path
          className="relation"
          d="M592 126V304"
          markerEnd={`url(#${relationMarker})`}
        />
        <path
          className="relation"
          d="M328 246L440 340"
          markerEnd={`url(#${relationMarker})`}
        />
        <path
          className="relation"
          d="M856 384H744"
          markerEnd={`url(#${relationMarker})`}
        />
        <path
          className="relation"
          d="M1008 126V170"
          markerEnd={`url(#${relationMarker})`}
        />
        <text className="relation-label" x="606" y="236">
          works with
        </text>

        <g className="resource-node agent-node" transform="translate(440 20)">
          <rect width="304" height="106" rx="8" />
          <text className="kind" x="20" y="27">
            Agent
          </text>
          <text className="name" x="20" y="59">
            Fulfillment Agent
          </text>
          <text className="provider" x="20" y="86">
            Fulfillment · Provider
          </text>
        </g>
        <g className="resource-node event-node" transform="translate(24 170)">
          <rect width="304" height="106" rx="8" />
          <text className="kind" x="20" y="27">
            Event Resource
          </text>
          <text className="name" x="20" y="59">
            Order Created
          </text>
          <text className="provider" x="20" y="86">
            Orders · Provider
          </text>
        </g>
        <g className="resource-node api-node" transform="translate(856 306)">
          <rect width="304" height="106" rx="8" />
          <text className="kind" x="20" y="27">
            API Resource
          </text>
          <text className="name" x="20" y="59">
            Orders API
          </text>
          <text className="provider" x="20" y="86">
            Orders · Provider
          </text>
        </g>
        <g className="resource-node api-node" transform="translate(856 20)">
          <rect width="304" height="106" rx="8" />
          <text className="kind" x="20" y="27">
            API Resource
          </text>
          <text className="name" x="20" y="59">
            Shipment API
          </text>
          <text className="provider" x="20" y="86">
            Shipping · Provider
          </text>
        </g>
        <g className="taxonomy-node" transform="translate(440 304)">
          <rect width="304" height="108" rx="8" />
          <text className="kind" x="152" y="28" textAnchor="middle">
            Shared Entity Type
          </text>
          <text className="entity-name" x="152" y="63" textAnchor="middle">
            Order
          </text>
          <text className="detail" x="152" y="89" textAnchor="middle">
            Common business semantics
          </text>
        </g>
        <g className="taxonomy-node" transform="translate(856 170)">
          <rect width="304" height="82" rx="8" />
          <text className="kind" x="152" y="28" textAnchor="middle">
            Entity Type
          </text>
          <text className="entity-name" x="152" y="61" textAnchor="middle">
            Shipment
          </text>
        </g>
      </svg>
      <figcaption>
        ORD describes the resource relationships and declared dependencies, not
        the runtime data flow.
      </figcaption>
    </figure>
  );
}

export function UnifiedMetadataDiagram() {
  const nodes = new Map(unifiedMetadata.nodes.map((node) => [node.id, node]));
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
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {unifiedMetadata.links.map((link) => {
              const from = nodes.get(link.from);
              const to = nodes.get(link.to);
              if (!from || !to)
                throw new Error("Unresolved metadata graph link");
              return (
                <line
                  key={`${link.from}-${link.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className={`${link.kind}-link`}
                />
              );
            })}
          </svg>
          {unifiedMetadata.nodes.map((node) => (
            <b
              key={node.id}
              className={node.id}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: `${(node.width / unifiedMetadata.layoutWidth) * 100}%`,
              }}
            >
              {node.label}
              {node.detail && <small>{node.detail}</small>}
            </b>
          ))}
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

export function OrdIdDiagram() {
  return (
    <figure className="ord-diagram ord-id-diagram" aria-label="Construction and meaning of an ORD ID">
      <div className="ord-id-pattern">
        <span className="namespace">namespace</span><i>:</i>
        <span className="concept">conceptName</span><i>:</i>
        <span className="resource">resourceName</span><i>:</i>
        <span className="major">v&lt;major&gt;</span>
      </div>
      <div className="ord-id-example">
        <span>Example</span>
        <code><b className="namespace">foo.orders</b>:<b className="concept">apiResource</b>:<b className="resource">Orders</b>:<b className="major">v1</b></code>
      </div>
      <div className="ord-id-fragments">
        <section className="namespace"><span>01</span><h3>Namespace</h3><p>Identifies the owner governing the information.</p></section>
        <section className="concept"><span>02</span><h3>Concept name</h3><p>A fixed ORD type such as <code>apiResource</code> or <code>agent</code>.</p></section>
        <section className="resource"><span>03</span><h3>Resource name</h3><p>A stable technical name within the namespace.</p></section>
        <section className="major"><span>04</span><h3>Major version</h3><p>Marks incompatible generations. Product and Vendor IDs leave this fragment empty.</p></section>
      </div>
      <figcaption><b>Design-time ORD ID</b><i>+</i><b>system-instance context</b><i>=</i><span>a unique resource instance at runtime</span></figcaption>
    </figure>
  );
}

export function IdentifierTypesDiagram() {
  const identifiers = [
    ["ord", "Identity inside ORD", "ORD ID", "What ORD resource or taxonomy item is this?", "foo.orders:apiResource:Orders:v1", ["Stable identity within ORD", "Uses a fixed ORD type name", "Major version marks an incompatible generation"]],
    ["correlation", "Identity outside ORD", "Correlation ID", "Which external record is this the same as?", "foo.crm:customer:4711", ["Maps to a system-of-record identifier", "Stored in correlationIds", "No separate version fragment"]],
    ["specification", "Shared behavior", "Specification ID", "Which standard or strategy should be implemented?", "ord:overlay:v1", ["Names a standard or strategy", "Used by extensible fields", "Major version marks incompatible specifications"]],
  ] as const;
  return (
    <figure className="ord-diagram ord-identifier-types" aria-label="Comparison of ORD IDs, correlation IDs, and specification IDs">
      <div className="ord-identifier-grid">
        {identifiers.map(([kind, kicker, title, question, example, details]) => (
          <section className={`ord-identifier-card ord-identifier-card--${kind}`} key={kind}>
            <header><span>{kicker}</span><h3>{title}</h3><p>{question}</p></header>
            <code>{example}</code>
            <ul>{details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
          </section>
        ))}
      </div>
      <figcaption><strong>Reference ORD IDs for content described by ORD.</strong><span>Group Types use Concept IDs such as <code>foo:process</code>; <code>ord:</code> identifies ORD-owned specifications.</span></figcaption>
    </figure>
  );
}

export function GroupingPackagingDiagram() {
  return (
    <figure className="ord-diagram ord-grouping" aria-label="ORD grouping concepts compared by concern and resource assignment">
      <div className="ord-grouping-table-wrap">
        <table>
          <thead><tr><th>Concept</th><th>Concern</th><th>Assignment</th><th>Reference</th></tr></thead>
          <tbody>
            <tr className="mandatory"><th>Package <small>required</small></th><td>Publishing ownership and shared metadata</td><td>Resource → exactly 1</td><td><code>partOfPackage</code></td></tr>
            <tr><th>Product</th><td>Software portfolio or service offering</td><td>Package / resource → 0..n</td><td><code>partOfProducts</code></td></tr>
            <tr><th>Consumption Bundle</th><td>Shared credentials and authentication mechanism</td><td>API / Event → 0..n</td><td><code>partOfConsumptionBundles</code></td></tr>
            <tr><th>Entity Type</th><td>Business object or domain semantics</td><td>Supported resources → 0..n</td><td>Varies by resource type</td></tr>
            <tr><th>Group</th><td>Custom, governed taxonomy defined by a Group Type</td><td>Resource → 0..n</td><td><code>partOfGroups</code></td></tr>
          </tbody>
        </table>
      </div>
      <div className="ord-group-example"><div><small>ORD resource</small><strong>Sales API</strong></div><i>→</i><div><small>Group</small><strong>Order to cash</strong></div><i>→</i><div><small>Group Type</small><strong>Business process</strong></div></div>
      <figcaption><b>Tags</b> add keywords; <b>labels</b> add queryable key-value metadata. Namespaces govern identity; use Groups for flexible taxonomy.</figcaption>
    </figure>
  );
}

export function LifecycleDiagram() {
  return (
    <figure className="ord-diagram ord-lifecycle" aria-label="ORD versioning and lifecycle model">
      <div className="ord-status-flow"><span>Common releaseStatus path</span><b>development</b><i>→</i><b>beta</b><i>→</i><b>active</b><i>→</i><b>deprecated</b><i>→</i><b>sunset</b></div>
      <div className="ord-change-grid">
        <section><header><span>Compatible change</span><strong>Update the resource in place</strong></header><div><code>…:Order:v1</code><b>1.0.0</b><i>→</i><code>…:Order:v1</code><b>1.1.0</b></div><p>The ORD ID stays stable; the Semantic Version communicates the new resource state.</p></section>
        <section className="breaking"><header><span>Incompatible change</span><strong>Create a successor identity</strong></header><div><code>…:Order:v1</code><b>deprecated</b><i>→</i><code>…:Order:v2</code><b>active</b></div><p>Link the successor. When the old resource is decommissioned, mark it sunset and publish a tombstone.</p></section>
      </div>
      <figcaption><strong>Keep three signals separate:</strong> identity in the ORD ID, contract state in <code>version</code>, and maturity in <code>releaseStatus</code>.</figcaption>
    </figure>
  );
}

export function ApiLifecycleDiagram() {
  return (
    <figure className="ord-diagram ord-api-lifecycle" aria-label="An API evolves under one ORD ID until an incompatible contract creates a successor identity">
      <div className="ord-api-lifecycle__scroll">
        <svg viewBox="0 0 1136 390" role="img" aria-labelledby="ord-api-lifecycle-title ord-api-lifecycle-desc">
          <title id="ord-api-lifecycle-title">API lifecycle from compatible evolution to successor and retirement</title>
          <desc id="ord-api-lifecycle-desc">An API evolves compatibly under the same ORD ID. A breaking contract creates a new major ORD ID while the old resource is deprecated, then sunset with a tombstone.</desc>
          <defs>
            <marker id="ord-lifecycle-update-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" className="ord-api-lifecycle__update-fill" /></marker>
            <marker id="ord-lifecycle-successor-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" className="ord-api-lifecycle__successor-fill" /></marker>
          </defs>
          <g className="ord-api-lifecycle__stage"><text x="0" y="24">01 · Baseline</text><text x="304" y="24">02 · Compatible update</text><text x="608" y="24">03 · Breaking contract</text><text x="912" y="24">04 · Retire old API</text></g>
          <path d="M224 134H304" className="ord-api-lifecycle__update-line" markerEnd="url(#ord-lifecycle-update-arrow)" />
          <path d="M528 134H608" className="ord-api-lifecycle__update-line" markerEnd="url(#ord-lifecycle-update-arrow)" />
          <path d="M832 134H912" className="ord-api-lifecycle__update-line" markerEnd="url(#ord-lifecycle-update-arrow)" />
          <path d="M568 134V306H608" className="ord-api-lifecycle__successor-line" markerEnd="url(#ord-lifecycle-successor-arrow)" />
          <path d="M832 306H912" className="ord-api-lifecycle__update-line" markerEnd="url(#ord-lifecycle-update-arrow)" />
          <g className="ord-api-lifecycle__resource" transform="translate(0 66)"><rect width="224" height="136" rx="8" /><text x="18" y="30" className="name">Orders API</text><text x="18" y="62" className="id">…:Order:v1</text><text x="18" y="91">version: 1.0.0</text><text x="18" y="116">releaseStatus: active</text></g>
          <g className="ord-api-lifecycle__resource" transform="translate(304 66)"><rect width="224" height="136" rx="8" /><text x="18" y="30" className="name">Same resource</text><text x="18" y="62" className="id">…:Order:v1</text><text x="18" y="91">version: 1.1.0</text><text x="18" y="116">releaseStatus: active</text></g>
          <g className="ord-api-lifecycle__resource ord-api-lifecycle__old-resource" transform="translate(608 66)"><rect width="224" height="136" rx="8" /><text x="18" y="30" className="name">Retained contract</text><text x="18" y="62" className="id">…:Order:v1</text><text x="18" y="91">version: 1.1.0</text><text x="18" y="116">releaseStatus: deprecated</text></g>
          <g className="ord-api-lifecycle__resource" transform="translate(912 66)"><rect width="224" height="136" rx="8" /><text x="18" y="30" className="name">Publish a tombstone</text><text x="18" y="62" className="id">…:Order:v1</text><text x="18" y="91">Record sunsetDate</text><text x="18" y="116">Remove or keep as sunset</text></g>
          <g className="ord-api-lifecycle__resource ord-api-lifecycle__successor" transform="translate(608 238)"><rect width="224" height="136" rx="8" /><text x="18" y="30" className="name">New resource</text><text x="18" y="62" className="id">…:Order:v2</text><text x="18" y="91">version: 2.0.0</text><text x="18" y="116">releaseStatus: active</text></g>
          <g className="ord-api-lifecycle__resource" transform="translate(912 238)"><rect width="224" height="136" rx="8" /><text x="18" y="30" className="name">Continues evolving</text><text x="18" y="62" className="id">…:Order:v2</text><text x="18" y="91">version: 2.1.0</text><text x="18" y="116">releaseStatus: active</text></g>
          <text x="0" y="238" className="ord-api-lifecycle__annotation">Optional feature added?</text><text x="0" y="264" className="ord-api-lifecycle__explanation">Update version; preserve the ORD ID.</text>
          <text x="304" y="338" className="ord-api-lifecycle__annotation ord-api-lifecycle__breaking-note">Consumer contract breaks?</text><text x="304" y="364" className="ord-api-lifecycle__explanation">Create a successor with a new major ID.</text>
          <text x="618" y="225" className="ord-api-lifecycle__coexist">Both contracts coexist during migration</text>
        </svg>
      </div>
      <figcaption>Deprecation is an explicit decision: link <code>successors</code> and provide migration dates. Development and beta resources may break without a new major ID; tenant extensions update <code>lastUpdate</code>.</figcaption>
    </figure>
  );
}

export function PerspectiveResolutionSummaryDiagram() {
  return (
    <figure className="ord-diagram ord-resolution-summary" aria-label="Summary of ORD perspective resolution">
      <section className="request"><span>Consumer request</span><strong>Resolve the effective view for a system instance</strong></section>
      <div className="decision">Is a complete <code>system-instance</code> perspective published?</div>
      <div className="branches">
        <section className="yes"><span>Yes</span><strong>Use only the runtime perspective</strong><p>An absent ORD ID is unavailable on that instance. Do not fill it from static metadata.</p></section>
        <section className="no"><span>No</span><strong>Resolve the effective static view</strong><p>Select the applicable system-version layer, then fall back by ORD ID to system-type.</p><div><b>system-version</b><i>→</i><b>system-type</b></div></section>
      </div>
      <figcaption><span><b>Complete representations.</b> Never merge properties.</span><span><b>Exact means exact.</b> Do not substitute a missing requested version.</span><span><b>System-independent</b> stays outside the fallback chain.</span></figcaption>
    </figure>
  );
}

export function AiEnrichmentDiagram() {
  return (
    <figure className="ord-diagram ord-ai-enrichment" aria-label="AI-oriented enrichment at ORD resource and resource-definition levels">
      <section><header><span>01</span><strong>Resource-level guidance</strong><small>Inside the ORD document</small></header><pre><code>"title": "Orders API",{`\n`}"description": "Read customer orders",{`\n`}"aiHint": "Use before shipping…"</code></pre><footer><b>Helps an AI consumer choose</b><span>Purpose and usage guidance stay separate from human documentation.</span></footer></section>
      <section className="definition"><header><span>02</span><strong>Definition-level enrichment</strong><small>OpenAPI, OData, A2A, MCP, and more</small></header><div className="ord-enrichment-stack"><code>Base definition</code><b>+</b><code>ORD Overlay<br />purpose: ord:ai-enrichment</code></div><footer><b>Helps an AI consumer use</b><span>Add operation-level semantics and hints without editing the source.</span></footer></section>
      <figcaption><code>aiHint</code> is defined on supported ORD resources. Fine-grained enrichment belongs in an ORD Overlay.</figcaption>
    </figure>
  );
}

export function OverlayDiagram() {
  return (
    <figure className="ord-diagram ord-overlay" aria-label="An ORD Overlay enriches a resource definition without modifying its source">
      <div className="ord-overlay__flow">
        <section><small>Source definition</small><strong>openapi.json</strong><pre><code>operationId: listOrders{`\n`}summary: List orders</code></pre><span>Owned by the API team</span></section><i>+</i>
        <section className="patch"><small>ORD Overlay 0.1</small><strong>orders.overlay.json</strong><pre><code>action: merge{`\n`}selector:{`\n`}  operation: listOrders{`\n`}data: &#123; summary: … &#125;</code></pre><span>Separately owned and governed</span></section><i>=</i>
        <section className="result"><small>Enriched definition</small><strong>OpenAPI + guidance</strong><pre><code>operationId: listOrders{`\n`}summary: List orders{`\n`}for fulfillment</code></pre><span>Original contract stays unchanged</span></section>
      </div>
      <figcaption><span><b>Target</b> definition</span><span><b>Select</b> an element</span><span><b>Patch</b> merge, update, or remove</span></figcaption>
    </figure>
  );
}

export function IntegrationScenarioDiagram() {
  return (
    <figure className="ord-diagram ord-integration-scenario" aria-label="A system declares the external APIs and events needed for an integration scenario">
      <section className="consumer"><small>Described system</small><strong>System A</strong><span>Implements the integration scenario</span></section>
      <div className="needs"><span>needs</span><i>→</i></div>
      <section className="dependency"><small>ORD metadata</small><strong>Integration Dependency</strong><span>Declares required resources and alternatives</span></section>
      <div className="needs"><span>references</span><i>→</i></div>
      <section className="provider"><small>Integration target</small><strong>System B</strong><div><b>API B-1 or API B-2</b><b>Event B-3</b><b>uses callback API A-2</b></div></section>
      <figcaption>ORD describes the type-level integration capability and its requirements. Runtime connections remain outside ORD.</figcaption>
    </figure>
  );
}

export function AgentConnectivityDiagram() {
  return (
    <figure className="ord-diagram ord-agent-connectivity" aria-label="Complete overview of the Agent relationships defined by ORD">
      <div className="ord-agent-model">
        <section className="ord-agent-relations ord-agent-classification">
          <header><small>Placement and classification</small><strong>Where the Agent belongs</strong></header>
          <div><code>partOfPackage</code><i>→</i><b>Package <small>exactly 1</small></b></div>
          <div><code>partOfProducts</code><i>→</i><b>Products <small>0..n</small></b></div>
          <div><code>partOfGroups</code><i>→</i><b>Groups <small>0..n</small></b></div>
        </section>

        <section className="ord-agent-card">
          <small>ORD resource</small>
          <strong>Agent</strong>
          <span>Autonomous task execution</span>
          <div>
            <code>ordId</code><code>version</code><code>visibility</code><code>releaseStatus</code>
          </div>
        </section>

        <div className="ord-agent-technical">
          <section className="ord-agent-path ord-agent-exposure">
            <header><code>exposedApiResources</code><small>0..n</small></header>
            <div><b>API Resource</b><i>→</i><b>Resource Definition</b><i>→</i><b>A2A Agent Card <small>example</small></b></div>
            <p><code>apiProtocol: a2a</code> and <code>type: a2a-agent-card</code> describe one supported interaction contract.</p>
          </section>
          <section className="ord-agent-path ord-agent-dependencies">
            <header><code>integrationDependencies</code><small>0..n</small></header>
            <div><b>Integration Dependency</b><i>→</i><b>API Resources</b><b>Event Resources</b><b>Capabilities</b></div>
            <p>Dependency aspects identify required external resources. An MCP API and selected tools are one example.</p>
          </section>
        </div>

        <section className="ord-agent-relations ord-agent-domain">
          <header><small>Domain and evolution</small><strong>What the Agent relates to</strong></header>
          <div><code>relatedEntityTypes</code><i>→</i><b>Entity Types <small>0..n</small></b></div>
          <div><code>successors</code><i>→</i><b>Successor Agents <small>0..n</small></b></div>
        </section>
      </div>
      <figcaption>These are the Agent's explicit ORD relationships. Generic metadata such as links, labels, tags, responsibility, and correlation IDs adds context but is not another resource relation.</figcaption>
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
  const marker = (kind: string) => `ord-sap-${kind}-arrow`;
  const position = (x: number, y: number, width: number, height: number) => ({
    left: `${(x / 1136) * 100}%`,
    top: `${(y / 416) * 100}%`,
    width: `${(width / 1136) * 100}%`,
    height: `${(height / 416) * 100}%`,
  });

  return (
    <figure
      className="ord-diagram ord-sap-architecture"
      aria-label="Shared SAP applications publish static and dynamic metadata. UMS receives both perspectives and other landscape metadata. SAP Business Accelerator Hub receives only static metadata. Knowledge Graph receives UMS metadata and other metadata sources, and feeds consumer tools."
    >
      <div className="ord-sap-architecture__scroll">
        <div className="ord-sap-architecture__canvas">
          <div
            className="ord-sap-label ord-sap-label--provider"
            style={position(0, 0, 244, 20)}
          >
            Shared providers
          </div>
          <div
            className="ord-sap-label ord-sap-label--aggregator"
            style={position(307, 0, 266, 20)}
          >
            Aggregators
          </div>
          <div
            className="ord-sap-label ord-sap-label--knowledge"
            style={position(637, 0, 208, 20)}
          >
            Knowledge integration
          </div>
          <div
            className="ord-sap-label ord-sap-label--consumer"
            style={position(908, 0, 228, 20)}
          >
            Consumers
          </div>

          <svg
            className="ord-sap-connectors"
            viewBox="0 0 1136 416"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id={marker("provider")}
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0 0 10 5 0 10Z" />
              </marker>
              <marker
                id={marker("aggregator")}
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0 0 10 5 0 10Z" />
              </marker>
              <marker
                id={marker("other")}
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0 0 10 5 0 10Z" />
              </marker>
              <marker
                id={marker("knowledge")}
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0 0 10 5 0 10Z" />
              </marker>
            </defs>
            <path
              className="provider-edge"
              d="M230 237H264V164H307"
              markerEnd={`url(#${marker("provider")})`}
            />
            <path
              className="provider-edge"
              d="M230 375H283V204H307"
              markerEnd={`url(#${marker("provider")})`}
            />
            <path
              className="provider-edge"
              d="M283 375H307"
              markerEnd={`url(#${marker("provider")})`}
            />
            <path
              className="other-edge"
              d="M440 74V110"
              markerEnd={`url(#${marker("other")})`}
            />
            <path
              className="aggregator-edge"
              d="M573 164H637"
              markerEnd={`url(#${marker("aggregator")})`}
            />
            <path
              className="other-edge"
              d="M741 74V110"
              markerEnd={`url(#${marker("other")})`}
            />
            <path className="aggregator-edge" d="M573 210H609V270H880" />
            <path className="aggregator-edge" d="M573 375H880M880 270V375" />
            <path
              className="aggregator-edge"
              d="M880 322H908"
              markerEnd={`url(#${marker("aggregator")})`}
            />
            <path
              className="knowledge-edge"
              d="M845 188H880V222H908"
              markerEnd={`url(#${marker("knowledge")})`}
            />
            <circle cx="283" cy="375" r="3" />
          </svg>

          <section
            className="ord-sap-provider"
            style={position(0, 110, 244, 306)}
          >
            <span className="ord-sap-node-role">ORD Providers</span>
            <h3>Applications / services</h3>
            <div className="ord-sap-provider__output ord-sap-provider__output--dynamic">
              <strong>Dynamic</strong>
              <span>System-instance metadata</span>
            </div>
            <div className="ord-sap-provider__output ord-sap-provider__output--static">
              <strong>Static</strong>
              <span>System type / version</span>
            </div>
          </section>

          <aside
            className="ord-sap-other-source"
            style={position(307, 30, 266, 44)}
          >
            <strong>Other landscape metadata</strong>
            <span>BTP destinations / registries</span>
          </aside>
          <aside
            className="ord-sap-other-source"
            style={position(637, 30, 208, 44)}
          >
            <strong>Other metadata sources</strong>
          </aside>
          <section
            className="ord-sap-node ord-sap-node--ums"
            style={position(307, 110, 266, 124)}
          >
            <span className="ord-sap-node-role">ORD Aggregator</span>
            <h3>
              Unified Metadata
              <br />
              Service (UMS)
            </h3>
            <p>Static + dynamic metadata</p>
          </section>
          <section
            className="ord-sap-node ord-sap-node--bah"
            style={position(307, 314, 266, 102)}
          >
            <span className="ord-sap-node-role">ORD Aggregator</span>
            <h3>
              SAP Business
              <br />
              Accelerator Hub
            </h3>
            <p>Static catalog only</p>
          </section>
          <section
            className="ord-sap-node ord-sap-node--knowledge"
            style={position(637, 110, 208, 124)}
          >
            <span className="ord-sap-node-role">Combine metadata</span>
            <h3>Knowledge Graph</h3>
            <p>UMS + other sources</p>
          </section>
          <section
            className="ord-sap-consumers"
            style={position(908, 110, 228, 306)}
          >
            <h3>Consumers</h3>
            <ul>
              {consumers.map((consumer) => (
                <li
                  key={consumer}
                  aria-label={consumer === "…" ? "Other consumers" : undefined}
                >
                  {consumer}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <figcaption>
        <strong>
          UMS combines both perspectives; BAH takes the static catalog.
        </strong>
        <span>
          Arrows show metadata delivery. Knowledge Graph also integrates other
          metadata sources.
        </span>
      </figcaption>
    </figure>
  );
}
