"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[5742],{4838:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>o,contentTitle:()=>a,default:()=>h,frontMatter:()=>r,metadata:()=>c,toc:()=>d});var i=n(4848),t=n(8453);const r={slug:"/",id:"overview",title:"Open Resource Discovery",hide_title:!1,sidebar_position:0},a=void 0,c={id:"overview",title:"Open Resource Discovery",description:"Summary",source:"@site/docs/index.md",sourceDirName:".",slug:"/",permalink:"/open-resource-discovery/",draft:!1,unlisted:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/index.md",tags:[],version:"current",sidebarPosition:0,frontMatter:{slug:"/",id:"overview",title:"Open Resource Discovery",hide_title:!1,sidebar_position:0}},o={},d=[{value:"Summary",id:"summary",level:2},{value:"Use Cases",id:"use-cases",level:2},{value:"Introduction",id:"introduction",level:2},{value:"Goals",id:"goals",level:2},{value:"Future Plans",id:"future-plans",level:2}];function l(e){const s={a:"a",blockquote:"blockquote",h2:"h2",img:"img",li:"li",p:"p",strong:"strong",ul:"ul",...(0,t.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.h2,{id:"summary",children:"Summary"}),"\n",(0,i.jsxs)(s.p,{children:["Open Resource Discovery (ORD) is a protocol that ",(0,i.jsx)(s.strong,{children:"allows applications and services to self-describe their exposed resources and capabilities"}),".\nIt can be used to describe static documentation, but can also reflect tenant specific configuration and extensions (at run-time).\u200b"]}),"\n",(0,i.jsxs)(s.p,{children:["Typically, ORD is used to describe ",(0,i.jsx)(s.a,{href:"./spec-v1/interfaces/document#api-resource",children:"APIs"})," and ",(0,i.jsx)(s.a,{href:"./spec-v1/interfaces/document#event-resource",children:"Events"}),", but it also supports higher-level concepts like ",(0,i.jsx)(s.a,{href:"./spec-v1/interfaces/document#entity-type",children:"Entity Types"})," (Business Objects) and ",(0,i.jsx)(s.a,{href:"./spec-v1/interfaces/document#data-products",children:"Data Products"})," (beta).\nWith ",(0,i.jsx)(s.a,{href:"./spec-v1/interfaces/document#integration-dependency",children:"Integration Dependencies"})," the (potential) use of external resources can be stated, too.\nIn case that the standardized concepts or attributes are not sufficient, there are extensibility attributes and ",(0,i.jsx)(s.a,{href:"./spec-v1/interfaces/document#capability",children:"Capabilities"}),"."]}),"\n",(0,i.jsxs)(s.p,{children:["By adopting ORD, an application will implement a single-entry point (",(0,i.jsx)(s.a,{href:"https://en.wikipedia.org/wiki/Service_provider_interface",children:"Service Provider Interface"}),") that can be used to discover and crawl the relevant information / metadata.\nThe information can be used to build a static metadata catalog or do runtime inspection of actual system landscapes."]}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:["\u2139 ORD is an open standard by SAP, released as ",(0,i.jsx)(s.a,{href:"https://github.com/SAP/open-resource-discovery",children:"open source"})," under the Apache 2 license (see ",(0,i.jsx)(s.a,{href:"https://blogs.sap.com/2023/11/14/open-resource-discovery-a-protocol-for-decentralized-metadata-discovery-is-now-open-source/",children:"public announcement"}),")."]}),"\n"]}),"\n",(0,i.jsx)("div",{style:{"text-align":"center","margin-top":"8px"},children:(0,i.jsx)(s.p,{children:(0,i.jsx)(s.img,{alt:"ORD Provider Overview",src:n(5333).A+"",title:"ORD Provider Overview",width:"3428",height:"1369"})})}),"\n",(0,i.jsx)(s.h2,{id:"use-cases",children:"Use Cases"}),"\n",(0,i.jsxs)(s.p,{children:["The information can be used to build a static ",(0,i.jsx)(s.strong,{children:"metadata catalog"})," or do detailed ",(0,i.jsx)(s.strong,{children:"runtime inspection of actual system landscapes"}),".\nBased on this, many end-user use cases can be realized, e.g.:"]}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"Data product directory/catalog"}),"\n",(0,i.jsx)(s.li,{children:"Static API/event catalog"}),"\n",(0,i.jsx)(s.li,{children:"Landscape specific API/event discovery for development platforms, platform engineering and low-code/no-code development"}),"\n",(0,i.jsx)(s.li,{children:"Support admins in configuring services (discovery & automation)"}),"\n",(0,i.jsx)(s.li,{children:"AI grounding & training"}),"\n",(0,i.jsx)(s.li,{children:"Generic channel to describe and discover system capabilities between providers and consumers"}),"\n"]}),"\n",(0,i.jsx)(s.h2,{id:"introduction",children:"Introduction"}),"\n",(0,i.jsxs)(s.p,{children:["Read the \ud83d\udcc4 ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/introduction",children:"ORD Introduction"})," and watch the \ud83c\udfa6",(0,i.jsx)(s.a,{href:"./details/videos",children:"ORD Videos"}),"."]}),"\n",(0,i.jsx)("div",{className:"videoContainer",children:(0,i.jsx)("iframe",{className:"videoIframe",src:"https://www.youtube.com/embed/7Z818CdoZJg",title:"Introducing the Open Resource Discovery protocol",frameBorder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"})}),"\n",(0,i.jsx)(s.h2,{id:"goals",children:"Goals"}),"\n",(0,i.jsx)("div",{className:"container",children:(0,i.jsxs)("div",{className:"row",children:[(0,i.jsx)("div",{className:"col",children:(0,i.jsxs)("div",{className:"card",children:[(0,i.jsx)("div",{className:"card__header",children:(0,i.jsx)("h3",{children:"Design Goals"})}),(0,i.jsx)("div",{className:"card__body",children:(0,i.jsx)("p",{children:(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["Systems to ",(0,i.jsx)(s.strong,{children:"describe themselves"})," with a single entry-point to crawl all relevant metadata"]}),"\n",(0,i.jsxs)(s.li,{children:["Achieve a combined, machine-readable ",(0,i.jsx)(s.strong,{children:"system landscape metadata view"})]}),"\n",(0,i.jsxs)(s.li,{children:["Enable full ",(0,i.jsx)(s.strong,{children:"automation of publication and discovery"})," of metadata"]}),"\n",(0,i.jsxs)(s.li,{children:["Having ",(0,i.jsx)(s.strong,{children:"one aligned standard"})," for","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"Description of different types of resources"}),"\n",(0,i.jsx)(s.li,{children:"Description of both the static / generic perspective and the actual runtime perspective"}),"\n",(0,i.jsx)(s.li,{children:"Support of many different metadata-driven use-cases and consumer requirements"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["ORD is an ",(0,i.jsx)(s.strong,{children:"open standard"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["It is ",(0,i.jsx)(s.a,{href:"https://github.com/SAP/open-resource-discovery",children:"open source"})," an can be used by SAP partners and customers if they see a value in adopting it, like better integration in the SAP ecosystem"]}),"\n",(0,i.jsx)(s.li,{children:"The specification is open for extensions via labels, custom types, spec extensions. Those don't need to go through alignment first."}),"\n"]}),"\n"]}),"\n"]})})})]})}),(0,i.jsx)("div",{className:"col",children:(0,i.jsxs)("div",{className:"card",children:[(0,i.jsx)("div",{className:"card__header",children:(0,i.jsx)("h3",{children:"Non-Goals"})}),(0,i.jsx)("div",{className:"card__body",children:(0,i.jsx)("p",{children:(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"Replace industry-standard resource definition formats like OpenAPI"}),"\n",(0,i.jsx)(s.li,{children:"Describing resources or capabilities in extensive detail."}),"\n",(0,i.jsxs)(s.li,{children:["Currently: Describe resources other than those that are owned and exposed by the systems directly\n(only self-description of systems).","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"We could change this scope in the future if necessary."}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["We don't put fast changing information into ORD, as the current pull-based transport mechanism would be to slow and expensive to support time-critical updates.","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"We could change this in the future by introducing more efficient, asynchronous transport modes."}),"\n"]}),"\n"]}),"\n"]})})})]})})]})}),"\n",(0,i.jsx)(s.h2,{id:"future-plans",children:"Future Plans"}),"\n",(0,i.jsxs)(s.p,{children:["Now that ORD is ",(0,i.jsx)(s.a,{href:"https://sap.github.io/open-resource-discovery/",children:"open-source"}),", a potential next step is to work with partners on a true industry wide standard, as ORD is currently focused on  SAPs requirements.\nWe are also part of the publicly funded ",(0,i.jsx)(s.a,{href:"https://www.bmwk.de/Redaktion/EN/Artikel/Industry/ipcei-cis.html",children:"IPCEI CIS"})," project, where we also work towards this goal."]}),"\n",(0,i.jsxs)(s.p,{children:["The specification itself is designed to be generic, so most SAP specific aspects are described as ",(0,i.jsx)(s.a,{href:"./spec-extensions",children:"spec extensions"}),".\nSome concepts like ",(0,i.jsx)(s.a,{href:"./spec-v1/#namespaces",children:"namespaces"})," could be further standardized if there's a need for cross-company metadata exchange."]}),"\n",(0,i.jsx)(s.p,{children:"We are thinking about ways to make ORD publishing more efficient when there is a lot of tenant specific metadata or data changes happen frequently and replication is more time critical.\nThere is also need to make publishing easier for simple, static providers that prefer publishing on deploy-time."})]})}function h(e={}){const{wrapper:s}={...(0,t.R)(),...e.components};return s?(0,i.jsx)(s,{...e,children:(0,i.jsx)(l,{...e})}):l(e)}},5333:(e,s,n)=>{n.d(s,{A:()=>i});const i=n.p+"assets/images/ord-provider-overview-71f65b143d7a8fbbfc42ae708f967972.svg"},8453:(e,s,n)=>{n.d(s,{R:()=>a,x:()=>c});var i=n(6540);const t={},r=i.createContext(t);function a(e){const s=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function c(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:a(e.components),i.createElement(r.Provider,{value:s},e.children)}}}]);