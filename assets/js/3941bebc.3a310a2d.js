"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[4764],{6589:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>d,contentTitle:()=>r,default:()=>h,frontMatter:()=>n,metadata:()=>o,toc:()=>c});var s=a(4848),i=a(8453);const n={sidebar_position:4,description:"A Data Product is a data set exposed for consumption outside the boundaries of the producing application or service via APIs. They are described through high quality metadata that can be accessed through the Data Product Directory.",title:"Data Product"},r="Data Product BETA",o={id:"details/articles/data-product",title:"Data Product",description:"A Data Product is a data set exposed for consumption outside the boundaries of the producing application or service via APIs. They are described through high quality metadata that can be accessed through the Data Product Directory.",source:"@site/docs/details/articles/data-product.md",sourceDirName:"details/articles",slug:"/details/articles/data-product",permalink:"/open-resource-discovery/details/articles/data-product",draft:!1,unlisted:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/details/articles/data-product.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4,description:"A Data Product is a data set exposed for consumption outside the boundaries of the producing application or service via APIs. They are described through high quality metadata that can be accessed through the Data Product Directory.",title:"Data Product"},sidebar:"detailsSidebar",previous:{title:"Grouping and Bundling",permalink:"/open-resource-discovery/details/articles/grouping-and-bundling"},next:{title:"Integration Dependency",permalink:"/open-resource-discovery/details/articles/integration-dependency"}},d={},c=[{value:"Definition",id:"definition",level:2},{value:"Data Aspect",id:"data-aspect",level:3},{value:"API Aspect",id:"api-aspect",level:3},{value:"Metadata Aspect",id:"metadata-aspect",level:3},{value:"Product Aspect",id:"product-aspect",level:3},{value:"Business Semantic Aspect",id:"business-semantic-aspect",level:3},{value:"Data Products at SAP",id:"data-products-at-sap",level:2},{value:"Architecture Overview",id:"architecture-overview",level:2},{value:"Model",id:"model",level:3},{value:"Roles",id:"roles",level:3},{value:"Beta Status",id:"beta-status",level:2}];function l(e){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(t.h1,{id:"data-product-beta",children:["Data Product ",(0,s.jsx)("span",{className:"feature-status-beta",children:"BETA"})]}),"\n",(0,s.jsxs)(t.blockquote,{children:["\n",(0,s.jsxs)(t.p,{children:["\ud83d\udea7 Please note that the ",(0,s.jsx)(t.a,{href:"../../spec-v1/interfaces/document#data-product",children:"Data Products"})," concept is currently in ",(0,s.jsx)(t.a,{href:"#beta-status",children:"Beta Status"}),"."]}),"\n"]}),"\n",(0,s.jsx)(t.h2,{id:"definition",children:"Definition"}),"\n",(0,s.jsxs)(t.blockquote,{children:["\n",(0,s.jsxs)(t.p,{children:["A ",(0,s.jsx)(t.a,{href:"../../spec-v1/interfaces/document#data-product",children:"Data Product"})," is a ",(0,s.jsx)(t.strong,{children:"data set"})," exposed for consumption outside the boundaries of the producing application or service via ",(0,s.jsx)(t.strong,{children:"APIs"}),". They are described through high quality ",(0,s.jsx)(t.strong,{children:"metadata"})," that can be accessed through the Data Product Directory (",(0,s.jsx)(t.a,{href:"../../spec-v1/#ord-aggregator",children:"ORD Aggregator"}),")."]}),"\n"]}),"\n",(0,s.jsxs)(t.p,{children:["The Data Product concept is based on ",(0,s.jsx)(t.a,{href:"https://martinfowler.com/articles/data-mesh-principles.html",children:"Data Mesh Principles"})," (see also ",(0,s.jsx)(t.a,{href:"https://www.thoughtworks.com/en-de/insights/books/data-mesh",children:"this book"}),")."]}),"\n",(0,s.jsx)(t.p,{children:"While that provides a concise definition, let's support that with a few more clarification points:"}),"\n",(0,s.jsxs)(t.p,{children:["The following aspects of the definition are essential: (1) ",(0,s.jsx)(t.a,{href:"#data-aspect",children:"data"}),", (2) ",(0,s.jsx)(t.a,{href:"#api-aspect",children:"APIs"}),", (3) ",(0,s.jsx)(t.a,{href:"#metadata-aspect",children:"metadata"})," and (4) ",(0,s.jsx)(t.a,{href:"#product-aspect",children:"product"}),". If they are not covered, it\u2019s not a Data Product. Optionally, a Data Product can also have (5) ",(0,s.jsx)(t.a,{href:"#business-semantic-aspect",children:"business semantics"}),"."]}),"\n",(0,s.jsx)(t.h3,{id:"data-aspect",children:"Data Aspect"}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsx)(t.li,{children:"Applications produce data within a domain. An application takes responsibility for the data it produces, and the application offers data for consumption outside the original context in the form of a Data Product."}),"\n",(0,s.jsxs)(t.li,{children:['A data product is a "data set" \u2013 which can include:',"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsx)(t.li,{children:"Business Objects: master data, transaction data"}),"\n",(0,s.jsx)(t.li,{children:"Other objects, e.g.: config data"}),"\n",(0,s.jsx)(t.li,{children:"Analytical data, including cubes, measures and dimensions"}),"\n",(0,s.jsx)(t.li,{children:"Graph data (e.g. who knows whom, recommendations)"}),"\n",(0,s.jsx)(t.li,{children:"Documents (e.g. raw log entries, events, multi-level-aggregates, hierarchies)"}),"\n",(0,s.jsx)(t.li,{children:"Spatial data"}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(t.li,{children:'A data product is exposed by a "producer" to fulfill the needs of "consumers".'}),"\n",(0,s.jsx)(t.li,{children:'The data set is optimized toward "intensive reads" and consumed in a read-only fashion.'}),"\n"]}),"\n",(0,s.jsx)(t.h3,{id:"api-aspect",children:"API Aspect"}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsx)(t.li,{children:'Above we say that Data Products are consumed via APIs, but to be precise, they are consumed via APIs or Events (we treat events as a special form of API). In this doc, we generally use the term APIs to include Events (it is just more readable than always saying "APIs and/or Events").'}),"\n",(0,s.jsxs)(t.li,{children:["There is a clear expectation that the APIs are described via ",(0,s.jsx)(t.a,{href:"#metadata-aspect",children:"metadata"})," for machine- and human-readable documentation."]}),"\n",(0,s.jsx)(t.li,{children:"For Data Products only certain types of API Protocols and qualities (performant mass read) are adequate."}),"\n",(0,s.jsxs)(t.li,{children:["Data Products are also expected to describe their data lineage. This is done via Data Product input ports, which are described in details as an ORD ",(0,s.jsx)(t.a,{href:"../../spec-v1/interfaces/document#integration-dependency",children:"Integration Dependency"})]}),"\n"]}),"\n",(0,s.jsx)(t.h3,{id:"metadata-aspect",children:"Metadata Aspect"}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:['A data product is described by the producer via ORD, which fulfills the role as its discoverability API / port. Through this, the discoverability of a Data Product is decentralized and therefore "shifted left": It\'s the data products responsibility to describe itself. The ',(0,s.jsx)(t.a,{href:"../../spec-v1/#ord-aggregator",children:"ORD Aggregators"}),"(s) take on the responsibility of the Data Product Directory."]}),"\n",(0,s.jsxs)(t.li,{children:["Please note that ORD is only used to describe Data Products on (slow changing) metadata level. It is not intended as an active control API or as an API to fetch fast moving runtime data (e.g. log metrics)","\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:["However, those can be added to the Data Product as dedicated APIs, which follow a standardized ",(0,s.jsx)(t.a,{href:"https://en.wikipedia.org/wiki/Service_provider_interface",children:"SPI"})," contract and be marked as such via the ORD ",(0,s.jsx)(t.code,{children:"implementationStandard"}),". This way, such APIs can still be discovered via API, but are treated as a separate concern."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(t.h3,{id:"product-aspect",children:"Product Aspect"}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsx)(t.li,{children:'The word "Product" does not imply that it\u2019s something on the price list. Instead it only implies a product mindset towards its consumers. Typically, Data Products are not independent "products" but are available as part of a larger product that produces them.'}),"\n",(0,s.jsx)(t.li,{children:"Data Products have owners that are responsible for defining what Data Products to produce to meet the needs of consumers. All data products have owners."}),"\n",(0,s.jsx)(t.li,{children:"The owners of the data product (at least of its definition) are ideally the domain owners / the same team that is responsible for the operational data (decentralized data products)."}),"\n"]}),"\n",(0,s.jsx)(t.h3,{id:"business-semantic-aspect",children:"Business Semantic Aspect"}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:["In ORD, it's not just possible to describe the APIs - and through them the data model / schema / syntax of the data. There are also ",(0,s.jsx)(t.a,{href:"../../spec-v1/interfaces/document#entity-type",children:"Entity Types"})," which can be used to describe the ",(0,s.jsx)(t.strong,{children:"semantic model"})," (underlying conceptual model) and map it with the technical API / data model."]}),"\n"]}),"\n",(0,s.jsx)(t.h2,{id:"data-products-at-sap",children:"Data Products at SAP"}),"\n",(0,s.jsx)(t.p,{children:"At SAP, the minimum required metadata is the description of the Data Product as an ORD resource. Additional metadata, e.g. CSN, can also be provided."}),"\n",(0,s.jsxs)(t.p,{children:["There are internal guidance what qualities and protocols a Data Product needs to or should have. Those are currently worked our during the beta phase. Once they are clear, they may find their way into a SAP specific ",(0,s.jsx)(t.a,{href:"/open-resource-discovery/spec-extensions/policy-levels/",children:"policy level"}),"."]}),"\n",(0,s.jsx)(t.h2,{id:"architecture-overview",children:"Architecture Overview"}),"\n",(0,s.jsx)(t.h3,{id:"model",children:"Model"}),"\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{alt:"Data Product Model Overview",src:a(5200).A+"",title:"Data Product Model Overview"})}),"\n",(0,s.jsx)(t.p,{children:"The diagram is not a complete ER model, but highlights the most important relationships from Data Product perspective."}),"\n",(0,s.jsx)(t.h3,{id:"roles",children:"Roles"}),"\n",(0,s.jsxs)(t.p,{children:["Data Products are exposed by ",(0,s.jsx)(t.strong,{children:"Producers"})," so that they can be used by ",(0,s.jsx)(t.strong,{children:"Consumers"}),". Consumers can use ",(0,s.jsx)(t.strong,{children:"Aggregators"})," / Data Product Directories to discover, explore and understand Data Products."]}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsx)(t.li,{children:"Data Product Producers are applications or services that expose data via one or more APIs and describe relevant contracts and information via metadata. Note that there are various types of producers."}),"\n",(0,s.jsx)(t.li,{children:"Data Product Consumers are applications or services that access and use the data from Data Products. Consumers can be of various types and cover both transactional and analytical applications. An application that processes operational data can be as Data Product consumer, as can analytical products like SAP Datasphere and SAP Analytics Cloud (SAC)."}),"\n",(0,s.jsxs)(t.li,{children:["The Data Product Directory (",(0,s.jsx)(t.a,{href:"../../spec-v1/#ord-aggregator",children:"ORD Aggregator"}),") is used by Consumers to find and discover available Data Products."]}),"\n"]}),"\n",(0,s.jsx)(t.h2,{id:"beta-status",children:"Beta Status"}),"\n",(0,s.jsxs)(t.p,{children:["Please note that the Data Product concept is currently in ",(0,s.jsx)("span",{className:"feature-status-beta",title:"This feature is in BETA status and subject to potential changes.",children:"BETA"}),"."]}),"\n",(0,s.jsx)(t.p,{children:"This has the following implications"}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsx)(t.li,{children:"The interface contract is potentially subject to changes, although we aim to avoid breaking changes if possible."}),"\n",(0,s.jsxs)(t.li,{children:["Many data product relevant attributes are currently ",(0,s.jsx)(t.strong,{children:"not explicitly defined"})," in the specification yet.","\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:["Some attributes should be handled via documentation, e.g. Service Level Agreements via ",(0,s.jsx)(t.a,{href:"../../spec-v1/interfaces/document#data-product_dataproductlinks",children:"dataProductLinks"})," of ",(0,s.jsx)(t.code,{children:"type"}),": ",(0,s.jsx)(t.a,{href:"../../spec-v1/interfaces/document#data-product-link_type",children:(0,s.jsx)(t.code,{children:"service-level-agreement"})})]}),"\n",(0,s.jsxs)(t.li,{children:["Such attributes need to be defined through generic extensibility mechanisms like ",(0,s.jsx)(t.code,{children:"labels"})," and ",(0,s.jsx)(t.code,{children:"documentationLabels"})," or added as text to the documentation."]}),"\n",(0,s.jsx)(t.li,{children:"We do this to gain more experience on what information we need to collect and how to structure them best. Later ORD Data Product releases will add more standardized properties or define a dedicated Data Product definition specification that can be attached."}),"\n",(0,s.jsx)(t.li,{children:"Which information needs to be added as additional extensibility attributes is currently only defined as SAP internal guidance."}),"\n"]}),"\n"]}),"\n"]})]})}function h(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},5200:(e,t,a)=>{a.d(t,{A:()=>s});const s=a.p+"assets/images/data-product-model.drawio-2554f72baaacc84a65b9ced2f092cef8.svg"},8453:(e,t,a)=>{a.d(t,{R:()=>r,x:()=>o});var s=a(6540);const i={},n=s.createContext(i);function r(e){const t=s.useContext(n);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),s.createElement(n.Provider,{value:t},e.children)}}}]);