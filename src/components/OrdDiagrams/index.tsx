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
