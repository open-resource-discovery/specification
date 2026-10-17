import { useId } from "react";
import graph from "../../../diagrams/agent-example.json";

export function AgentExampleDiagram() {
  const id = useId();
  return (
    <figure className="ord-diagram ord-agent-example">
      <section
        className="ord-agent-example__scroll"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: The scrollable diagram must support keyboard scrolling.
        tabIndex={0}
        aria-label="Agent interaction and dependency example; scroll horizontally on narrow screens"
      >
        <svg
          viewBox={graph.viewBox}
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>
            Fulfillment Agent: interaction and external dependencies
          </title>
          <desc id={`${id}-desc`}>{graph.description}</desc>
          <defs>
            {["dependency", "interaction"].map((type) => (
              <marker
                key={type}
                id={`${id}-${type}`}
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerUnits="userSpaceOnUse"
                markerWidth="10"
                markerHeight="10"
                orient="auto"
              >
                <path className={`${type}-head`} d="M0 0L10 5L0 10Z" />
              </marker>
            ))}
          </defs>
          {graph.columns.map((column) => (
            <text className="column-label" x={column.x} y="20" key={column.x}>
              {column.label}
            </text>
          ))}
          {graph.links.map((link) => (
            <path
              key={`${link.from}-${link.to}`}
              className={`${link.type}-edge`}
              d={link.path}
              markerEnd={`url(#${id}-${link.type})`}
            />
          ))}
          {graph.labels.map((label) => (
            <text
              key={`${label.x}-${label.y}`}
              className={`field-label ${label.type}-label`}
              x={label.x}
              y={label.y}
              textAnchor={label.anchor as "start" | "middle"}
            >
              {label.text}
            </text>
          ))}
          {graph.nodes.map((node) => (
            <g
              key={node.id}
              className={`${node.type}-node`}
              transform={`translate(${node.x} ${node.y})`}
            >
              <rect width={node.width} height="96" rx="8" />
              {node.kind && (
                <text className="kind" x="20" y="26">
                  {node.kind}
                </text>
              )}
              <text className="name" x="20" y={node.nameY}>
                {node.name.map((line, index) => (
                  <tspan x="20" dy={index ? 26 : 0} key={line}>
                    {line}
                  </tspan>
                ))}
              </text>
              <text className="detail" x="20" y="82">
                {node.detail}
              </text>
            </g>
          ))}
        </svg>
      </section>
      <figcaption>
        Arrows describe metadata references. Each Agent or Capability can
        declare its own Integration Dependencies.
      </figcaption>
    </figure>
  );
}
