"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[3488],{2688:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>h,frontMatter:()=>r,metadata:()=>a,toc:()=>d});var i=n(4848),s=n(8453);const r={sidebar_position:5,description:"Detailed explanation of the Integration Dependency concept."},o="Integration Dependency",a={id:"details/articles/integration-dependency",title:"Integration Dependency",description:"Detailed explanation of the Integration Dependency concept.",source:"@site/docs/details/articles/integration-dependency.md",sourceDirName:"details/articles",slug:"/details/articles/integration-dependency",permalink:"/open-resource-discovery/details/articles/integration-dependency",draft:!1,unlisted:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/details/articles/integration-dependency.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5,description:"Detailed explanation of the Integration Dependency concept."},sidebar:"detailsSidebar",previous:{title:"Data Product",permalink:"/open-resource-discovery/details/articles/data-product"},next:{title:"System Landscape Model",permalink:"/open-resource-discovery/details/articles/system-landscape-model"}},c={},d=[{value:"Summary",id:"summary",level:2},{value:"Problem Statement",id:"problem-statement",level:2},{value:"Proposed Solution",id:"proposed-solution",level:2},{value:"Big Picture",id:"big-picture",level:2},{value:"Examples with Explanation",id:"examples-with-explanation",level:2},{value:"SAP Subscription Billing Events",id:"sap-subscription-billing-events",level:3}];function l(e){const t={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",header:"header",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.header,{children:(0,i.jsx)(t.h1,{id:"integration-dependency",children:"Integration Dependency"})}),"\n",(0,i.jsx)(t.h2,{id:"summary",children:"Summary"}),"\n",(0,i.jsxs)(t.p,{children:["An ",(0,i.jsx)(t.strong,{children:"Integration Dependency"})," states that the described system (self) can integrate with external systems (integration target) to achieve an integration purpose.\nThe purpose could be to enable a certain feature or integration scenario, but it could also be a mandatory prerequisite for the described system to work."]}),"\n",(0,i.jsx)(t.p,{children:"The integration dependency includes a list of requirements, which point out which API and event resources (or other ORD concepts) are involved.\nEach requirement describes one aspect / ingredient and can be used to express alternatives (OR condition) for achieving the same outcome."}),"\n",(0,i.jsxs)(t.p,{children:["See also: ",(0,i.jsx)(t.a,{href:"../../spec-v1/interfaces/document#integration-dependency",children:"Integration Dependency interface"}),"."]}),"\n",(0,i.jsx)(t.h2,{id:"problem-statement",children:"Problem Statement"}),"\n",(0,i.jsx)(t.p,{children:"In a distributed and technology-agnostic system landscape we need to understand which integrations can (or have to) be setup."}),"\n",(0,i.jsxs)(t.p,{children:["Up until ORD v1.6, the specification focused only on describing what capabilities and resources a system offers ",(0,i.jsx)(t.em,{children:"to others"}),".\nMost notably, ORD can be used to describe APIs, Events and Capabilities which can be consumed and used externally."]}),"\n",(0,i.jsxs)(t.p,{children:["If we only know this side, we cannot fully understand the integration possibilities in a distributed and technology-agnostic system landscape.\nWhat we are missing, is not only to describe what a systems ",(0,i.jsx)(t.em,{children:"offers"}),", but also describe what it (potentially) ",(0,i.jsx)(t.em,{children:"can consume"}),".\nThis is usually implemented as integration client code (usually against an external or assumed target API contract)."]}),"\n",(0,i.jsxs)(t.p,{children:["Therefore, we introduced Integration Dependency as a means to describe what a system can an ",(0,i.jsx)(t.em,{children:"consume"}),' / "make use of" from other systems.\nIf this is setup and connected at run-time, we call this an integration.\nBut at ORD level, we\'re only describing the "type-level" ability to integrate and what dependencies and requirements that entails.']}),"\n",(0,i.jsx)(t.p,{children:"The following diagram shows the situation of how two systems can integrate with each other via APIs and Events:"}),"\n",(0,i.jsx)(t.p,{children:(0,i.jsx)(t.img,{alt:"Integration Dependency Problem Statement",src:n(7072).A+"",title:"Integration Dependency Problem Statement"})}),"\n",(0,i.jsxs)(t.blockquote,{children:["\n",(0,i.jsx)(t.p,{children:"This figure shown an integration scenario between system A and B. System Instance A has implemented API clients against the API Resources B-1 and B-2 of its integration target, as well as an event subscription (client implementation) for events from event resource B-3. It has an API Resource A-2, which the integration target is supposed to write an API client against and use it to provide data for A."}),"\n"]}),"\n",(0,i.jsx)(t.h2,{id:"proposed-solution",children:"Proposed Solution"}),"\n",(0,i.jsxs)(t.p,{children:["We introduce a new ORD resource type ",(0,i.jsx)(t.strong,{children:"Integration Dependency"}),". It can be used to describe the ability, and therefore dependency to integrate with an external application / service for the purpose of achieving an integration goal (or scenario). In practice, this is often implemented as client integration code. This includes listing ",(0,i.jsx)(t.strong,{children:"Requirements"})," what API and Event interfaces need or may be used. Typically, these are also described via ORD by the integration target system or the owner of the API or Event contract."]}),"\n",(0,i.jsx)(t.p,{children:"In addition, it is also possible to further define that only a subset of the depended resources is necessary for the integration, allowing us to be more precise when necessary (e.g., for the SAP Event Broker use case).\nWith the proposed solution we can handle SAP Event Broker and Data Product related requirements with a shared, generic concept. In general, Integration Dependencies are optional to be provided and will only be mandated through specific use cases, e.g., SAP Event Broker or Data Products."}),"\n",(0,i.jsx)(t.p,{children:(0,i.jsx)(t.img,{alt:"Integration Dependency",src:n(6390).A+"",title:"Integration Dependency"})}),"\n",(0,i.jsxs)(t.blockquote,{children:["\n",(0,i.jsx)(t.p,{children:"This figure is based on the situation in Figure 1. It shows how System Instance A not only exposes API resources on its own side, but how it also defines an Integration Dependency. In the depicted case, it has two requirements which include references to external resources (System Instance B). Requirement 1 shows the situation that it can be either realized by getting access to the API Resource B-1 or B-2. The API client implementation in System Instance A can handle both API Resources as alternatives. Requirement 2 covers the Event Subscription use case. Requirement 3 points to an own API resource, which implies that the integration target implements an API client to send data back to system A."}),"\n"]}),"\n",(0,i.jsx)(t.p,{children:"Here are some typical scenarios with additional explanations:"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsx)(t.li,{children:"The most obvious situation is to reference to an external API resource, described by the integration target system. This implies that the integration target owns the contract. The system that describes the integration dependency will likely initiate the interaction (see Requirement 1 and 2)."}),"\n",(0,i.jsx)(t.li,{children:"The requirement can reference to an own inbound API resource. In this case the described system owns the contract and the API implementation and is therefore in the server role. The integration target system is using this API to send information to the described system that is relevant to the integration dependency (see Requirement 3)."}),"\n",(0,i.jsx)(t.li,{children:"The requirement can reference an own outbound API or event resource. The contract is owned by the described system, but it might not act in the server role. Instead, it can interact with the integration target system according to the defined contract."}),"\n"]}),"\n",(0,i.jsx)(t.p,{children:"Requirements express the following additional information:"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsx)(t.li,{children:"Requirements can be optional if the application can still provide meaningful results without it being provided."}),"\n",(0,i.jsx)(t.li,{children:"Within a requirement there can be references to semantically equivalent API or event resources that are alternatives to each other (OR condition)."}),"\n",(0,i.jsx)(t.li,{children:"Constraints like a minimum version of the target resource."}),"\n",(0,i.jsx)(t.li,{children:"Define a subset of the target resource that is needed. This helps in some situations to not give out wider rights or create more subscriptions than necessary."}),"\n",(0,i.jsx)(t.li,{children:"The requirement API or event resources can be references to descriptions from another (external) application if the integration target application owns the contract and lifecycle of it. But the contract can also be owned by the described application itself."}),"\n",(0,i.jsx)(t.li,{children:"Additionally, it is possible to describe which Consumption Bundle is to be used for setting up trust and credentials to the target API or Event resource."}),"\n",(0,i.jsx)(t.li,{children:"The application could also decide to expose an API or event resource contract itself, that another (external) application needs to implement and fulfill to integrate with the application in focus."}),"\n"]}),"\n",(0,i.jsx)(t.p,{children:'Integration Dependencies can also be mandatory, which implies that it\'s a prerequisite for provisioning the described system.\nThey inherit the typical, shared ORD attributes that can be used to handle lifecycle, versioning, globally unique IDs, correlations and more.\nIntegration Dependencies are not meant to describe complete processes, where multiple parties are involved. They are only meant to describe the technical ingredients that are involved in integrating with ideally only one type of target systems for exactly one integration purpose. Overarching information like processes and blueprints are usually governed and defined centrally as they go beyond just pure self-description of individual systems.\nAlso be aware that Integration Dependencies and Requirements are describing a type-level / "scenario-level" information. This proposal does not cover describing concrete integration instances. In our current target picture, we would prefer integrations to be setup via centralized tools like URM and UCL . In theory ORD could also be used to describe integration instances if only the application / service knows them itself (no central setup) \u2013 but this is out of scope of this proposal.'}),"\n",(0,i.jsx)(t.h2,{id:"big-picture",children:"Big Picture"}),"\n",(0,i.jsx)(t.p,{children:"We think describing such outward requirements fits well into the ORD scope, because only the system itself knows what external requirements it has and what integration outcomes / scenarios it realizes by integrating with the requirement targets."}),"\n",(0,i.jsx)(t.p,{children:(0,i.jsx)(t.img,{alt:"ORD High Level Data Model",src:n(4270).A+"",title:"ORD High Level Data Model"})}),"\n",(0,i.jsxs)(t.blockquote,{children:["\n",(0,i.jsx)(t.p,{children:"This figure shows a high-Level overview on ORD entities and where Integration Dependency and Requirements fit in."}),"\n"]}),"\n",(0,i.jsx)(t.h2,{id:"examples-with-explanation",children:"Examples with Explanation"}),"\n",(0,i.jsx)(t.h3,{id:"sap-subscription-billing-events",children:"SAP Subscription Billing Events"}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-yaml",children:'{\n  # ...\n  "integrationDependencies": [\n    {\n      "ordId": "sap.s4:integrationDependency:subscriptionReplication:v2",\n      "version": "2.2.3",\n      "title": "Subscription Billing Replication",\n      "description": "Replication of Subscription Billing data into S/4",\n      "mandatory": false,\n      "aspects": [\n        {\n          "eventResources": [\n            {\n              "ordId": "sap.billing.sb:eventResource:SAPSubscriptionBillingBusinessEvents:v2",\n              "systemTypeRestriction": ["sap.billing"],\n              "subset": [\n                { "eventType": "sap.billing.sb.Subscription.Created.v2" },\n                { "eventType": "sap.billing.sb.Subscription.Deleted.v2" }\n              ]\n            }\n          ]\n        }\n      ]\n    },\n  ]\n'})}),"\n",(0,i.jsx)(t.p,{children:'The above example is a very simple application of the Integration Dependency of S/4HANA creating a subscription for Subscription Billing events (that are available through the SAP Event Broker intermediary). It only lists one requirement which refers to one event resource. But it states that from the event resource only a subset of event types  is needed. This addresses the requirement of SAP Event Broker around "Subscription Content" and helps them to provide a UI and more automation for creating event subscriptions based on the desired integration scenario.'}),"\n",(0,i.jsx)(t.p,{children:"If we want to add more event subscriptions that are defined across more than one Event Resource, it needs to be added as another Aspect (as they are combined with AND condition)."}),"\n",(0,i.jsxs)(t.p,{children:["The ",(0,i.jsx)(t.code,{children:"systemTypeRestriction"})," indicates that only events published by that system type (application or service) are meant to be subscribed, further narrowing down the subscription."]}),"\n",(0,i.jsx)(t.p,{children:'In the future, we may need to extend the Integration Dependency with knowledge about whether it has been instantiated (or "enabled"). This becomes necessary when outside parties need to learn about whether the Integration Dependency has already been enabled for them or not. Whether this should be done via ORD protocol is not clear and needs further clarification.'}),"\n",(0,i.jsx)(t.p,{children:"Let's explore the target picture together with blueprint driven provisioning and Unified Resource Manager for SAP defined processes: In the solution blueprint architects with the knowledge of the overall process define that there needs to be an integration between S/4 and SAP Event Broker that events from Subscription Billing needs to be transferred. This results in URM resources that setup the integration channel between S/4 and Event Broker as well as with Subscription Billing and Event Broker. In the last step Event Broker takes the information from the integration dependency in ORD that this specific S/4 tenant needs to consume a set of specific subscription billing events."})]})}function h(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(l,{...e})}):l(e)}},7072:(e,t,n)=>{n.d(t,{A:()=>i});const i=n.p+"assets/images/integration-dependency-ps.drawio-c2fe8c1132213b5787e07a6665b2307d.svg"},6390:(e,t,n)=>{n.d(t,{A:()=>i});const i=n.p+"assets/images/integration-dependency.drawio-a690ffdf531c6e221e45f3e6585ee369.svg"},4270:(e,t,n)=>{n.d(t,{A:()=>i});const i=n.p+"assets/images/ord-high-level-data-model.drawio-e32e8af7e9f81d4705b5ee9de4978a42.svg"},8453:(e,t,n)=>{n.d(t,{R:()=>o,x:()=>a});var i=n(6540);const s={},r=i.createContext(s);function o(e){const t=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function a(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),i.createElement(r.Provider,{value:t},e.children)}}}]);