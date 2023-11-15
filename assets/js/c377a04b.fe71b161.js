"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[971],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>f});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),l=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},p=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=l(r),m=a,f=u["".concat(c,".").concat(m)]||u[m]||d[m]||i;return r?n.createElement(f,o(o({ref:t},p),{},{components:r})):n.createElement(f,o({ref:t},p))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=m;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s[u]="string"==typeof e?e:a,o[1]=s;for(var l=2;l<i;l++)o[l]=r[l];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},1269:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>p,contentTitle:()=>c,default:()=>f,frontMatter:()=>s,metadata:()=>l,toc:()=>u});var n=r(7462),a=r(3366),i=(r(7294),r(3905)),o=["components"],s={slug:"/",id:"overview",title:"Open Resource Discovery",hide_title:!1,sidebar_position:0},c=void 0,l={unversionedId:"overview",id:"overview",title:"Open Resource Discovery",description:"Summary",source:"@site/docs/index.md",sourceDirName:".",slug:"/",permalink:"/open-resource-discovery/",draft:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/index.md",tags:[],version:"current",sidebarPosition:0,frontMatter:{slug:"/",id:"overview",title:"Open Resource Discovery",hide_title:!1,sidebar_position:0}},p={},u=[{value:"Summary",id:"summary",level:2},{value:"Introduction",id:"introduction",level:2},{value:"Goals",id:"goals",level:2},{value:"Future Plans",id:"future-plans",level:2}],d={toc:u},m="wrapper";function f(e){var t=e.components,s=(0,a.Z)(e,o);return(0,i.kt)(m,(0,n.Z)({},d,s,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"summary"},"Summary"),(0,i.kt)("p",null,"Open Resource Discovery (ORD) is a protocol that ",(0,i.kt)("strong",{parentName:"p"},"allows applications and services to self-describe their exposed resources and capabilities"),".\nIt can be used to describe static documentation, but can also reflect tenant specific configuration and extensions (at run-time).\u200b"),(0,i.kt)("p",null,"Typically, ORD is used to describe ",(0,i.kt)("a",{parentName:"p",href:"./spec-v1/interfaces/document#api-resource"},"APIs")," and ",(0,i.kt)("a",{parentName:"p",href:"./spec-v1/interfaces/document#event-resource"},"Events"),", but it also supports higher-level concepts like ",(0,i.kt)("a",{parentName:"p",href:"./spec-v1/interfaces/document#entity-type"},"Entity Types")," (Business Objects) and ",(0,i.kt)("a",{parentName:"p",href:"./spec-v1/interfaces/document#data-products"},"Data Products")," (beta).\nWith ",(0,i.kt)("a",{parentName:"p",href:"./spec-v1/interfaces/document#integration-dependency"},"Integration Dependencies")," the (potential) use of external resources can be stated, too.\nIn case that the standardized concepts or attributes are not sufficient, there are extensibility attributes and ",(0,i.kt)("a",{parentName:"p",href:"./spec-v1/interfaces/document#capability"},"Capabilities"),"."),(0,i.kt)("p",null,"By adopting ORD, an application will implement a single-entry point (",(0,i.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Service_provider_interface"},"Service Provider Interface"),") that can be used to discover and crawl the relevant information / metadata."),(0,i.kt)("div",{style:{"text-align":"center","margin-top":"8px"}},(0,i.kt)("p",null,(0,i.kt)("img",{alt:"ORD Provider Overview",src:r(381).Z,title:"ORD Provider Overview",width:"3428",height:"1369"}))),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"\u2139 ORD is an open standard by SAP, released as open source under the Apache 2 license (see ",(0,i.kt)("a",{parentName:"p",href:"https://blogs.sap.com/2023/11/14/open-resource-discovery-a-protocol-for-decentralized-metadata-discovery-is-now-open-source/"},"public announcement"),")."),(0,i.kt)("p",{parentName:"blockquote"},"It is built to be a generic standard and could be used outside of SAP, if the infrastructure (aggregators, namespace registry) is built or adjusted.\nThe standard is extensible through extensibility attributes, custom types and policy levels.")),(0,i.kt)("h2",{id:"introduction"},"Introduction"),(0,i.kt)("p",null,"Read the \ud83d\udcc4 ",(0,i.kt)("a",{parentName:"p",href:"/open-resource-discovery/introduction"},"ORD Introduction")," and watch the \ud83c\udfa6",(0,i.kt)("a",{parentName:"p",href:"./details/videos"},"ORD Videos"),"."),(0,i.kt)("iframe",{width:"800",height:"454",src:"https://www.youtube.com/embed/7Z818CdoZJg",title:"Introducing the Open Resource Discovery protocol",frameborder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",allowfullscreen:!0}),(0,i.kt)("h2",{id:"goals"},"Goals"),(0,i.kt)("div",{class:"container"},(0,i.kt)("div",{class:"row"},(0,i.kt)("div",{class:"col"},(0,i.kt)("div",{class:"card"},(0,i.kt)("div",{class:"card__header"},(0,i.kt)("h3",null,"Design Goals")),(0,i.kt)("div",{class:"card__body"},(0,i.kt)("p",null,(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Systems to ",(0,i.kt)("strong",{parentName:"li"},"describe themselves")," with a single entry-point to crawl all relevant metadata"),(0,i.kt)("li",{parentName:"ul"},"Achieve a combined, machine-readable ",(0,i.kt)("strong",{parentName:"li"},"system landscape metadata view")),(0,i.kt)("li",{parentName:"ul"},"Enable full ",(0,i.kt)("strong",{parentName:"li"},"automation of publication and discovery")," of metadata"),(0,i.kt)("li",{parentName:"ul"},"Having ",(0,i.kt)("strong",{parentName:"li"},"one aligned standard")," for",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"Description of different types of resources"),(0,i.kt)("li",{parentName:"ul"},"Description of both the static / generic perspective and the actual runtime perspective"),(0,i.kt)("li",{parentName:"ul"},"Support of many different metadata-driven use-cases and consumer requirements"))),(0,i.kt)("li",{parentName:"ul"},"ORD is an ",(0,i.kt)("strong",{parentName:"li"},"open standard"),(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"It is open-source an can be used by SAP partners and customers if they see a value in adopting it, like better integration in the SAP ecosystem"),(0,i.kt)("li",{parentName:"ul"},"The specification is open for extensions via labels, custom types etc. that don't need to go through alignment first.")))))))),(0,i.kt)("div",{class:"col"},(0,i.kt)("div",{class:"card"},(0,i.kt)("div",{class:"card__header"},(0,i.kt)("h3",null,"Non-Goals")),(0,i.kt)("div",{class:"card__body"},(0,i.kt)("p",null,(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Replace industry-standard resource definition formats like OpenAPI"),(0,i.kt)("li",{parentName:"ul"},"Describing resources or capabilities in extensive detail."),(0,i.kt)("li",{parentName:"ul"},"Currently: Describe resources other than those that are owned and exposed by the systems directly\n(only self-description of systems).",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"We could change this scope in the future if necessary."))),(0,i.kt)("li",{parentName:"ul"},"We don't put fast changing information into ORD, as the current pull-based transport mechanism would be to slow and expensive to support time-critical updates.",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"We could change this in the future by introducing more efficient, asynchronous transport modes.")))))))))),(0,i.kt)("h2",{id:"future-plans"},"Future Plans"),(0,i.kt)("p",null,"We are thinking about ways to make ORD publishing more efficient when there is a lot of tenant specific metadata or data changes happen frequently and replication is more time critical."),(0,i.kt)("p",null,"Now that ORD is ",(0,i.kt)("a",{parentName:"p",href:"https://sap.github.io/open-resource-discovery/"},"open-source"),", a potential next step is to work with partners on a true industry wide standard.\nORD in its current state is focused around SAP. While most SAP specific aspects are described as ",(0,i.kt)("a",{parentName:"p",href:"./spec-extensions"},"spec extensions"),", some concepts like ",(0,i.kt)("a",{parentName:"p",href:"./spec-v1/#namespaces"},"namespaces")," need more work."))}f.isMDXComponent=!0},381:(e,t,r)=>{r.d(t,{Z:()=>n});const n=r.p+"assets/images/ord-provider-overview-71f65b143d7a8fbbfc42ae708f967972.svg"}}]);