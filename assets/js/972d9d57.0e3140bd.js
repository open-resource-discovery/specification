"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[937],{3905:(e,t,a)=>{a.d(t,{Zo:()=>c,kt:()=>h});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var l=n.createContext({}),d=function(e){var t=n.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},c=function(e){var t=d(e.components);return n.createElement(l.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),p=d(a),m=r,h=p["".concat(l,".").concat(m)]||p[m]||u[m]||o;return a?n.createElement(h,i(i({ref:t},c),{},{components:a})):n.createElement(h,i({ref:t},c))}));function h(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,i=new Array(o);i[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[p]="string"==typeof e?e:r,i[1]=s;for(var d=2;d<o;d++)i[d]=a[d];return n.createElement.apply(null,i)}return n.createElement.apply(null,a)}m.displayName="MDXCreateElement"},9880:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>h,frontMatter:()=>s,metadata:()=>d,toc:()=>p});var n=a(7462),r=a(3366),o=(a(7294),a(3905)),i=["components"],s={toc_max_heading_level:3},l="ORD Introduction",d={unversionedId:"introduction",id:"introduction",title:"ORD Introduction",description:"Why ORD?",source:"@site/docs/introduction.mdx",sourceDirName:".",slug:"/introduction",permalink:"/introduction",draft:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/introduction.mdx",tags:[],version:"current",frontMatter:{toc_max_heading_level:3}},c={},p=[{value:"Why ORD?",id:"why-ord",level:2},{value:"Quick Overview",id:"quick-overview",level:2},{value:"ORD Architecture at SAP",id:"ord-architecture-at-sap",level:2},{value:"ORD by Examples",id:"ord-by-examples",level:2},{value:"SAP Business Accelerator Hub",id:"sap-business-accelerator-hub",level:3},{value:"Unified Customer Landscape",id:"unified-customer-landscape",level:3},{value:"API Metadata Validator",id:"api-metadata-validator",level:3},{value:"ORD in More Detail",id:"ord-in-more-detail",level:2}],u={toc:p},m="wrapper";function h(e){var t=e.components,s=(0,r.Z)(e,i);return(0,o.kt)(m,(0,n.Z)({},u,s,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"ord-introduction"},"ORD Introduction"),(0,o.kt)("h2",{id:"why-ord"},"Why ORD?"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"We need consistent ",(0,o.kt)("strong",{parentName:"li"},"technical documentation how applications and services can be integrated with and developed against"),"."),(0,o.kt)("li",{parentName:"ul"},"We and our customers need to ",(0,o.kt)("strong",{parentName:"li"},"understand run-time system landscapes, reflecting customizations and extensions")," - so developers and architects know how to work with it."),(0,o.kt)("li",{parentName:"ul"},"We need provide ",(0,o.kt)("strong",{parentName:"li"},"more automation and a better development experience")," for integrating SAP products with each other, the BTP SAP ecosystem and side-by-side extensions."),(0,o.kt)("li",{parentName:"ul"},"Many AI and Analytics use-cases ",(0,o.kt)("strong",{parentName:"li"},"rely on consistent and standardized metadata")," to deliver value or scale well."),(0,o.kt)("li",{parentName:"ul"},"Support a ",(0,o.kt)("strong",{parentName:"li"},"heterogenous landscape")," of different products and tech-stacks that may also be owned by customers and partners.")),(0,o.kt)("details",null,(0,o.kt)("summary",null,"Metadata integration without alignment"),(0,o.kt)("p",null,(0,o.kt)("p",null,"Without alignment on metadata standards and how they are discovered, all metadata integration between providers and consumers happens on a point-to-point basis.\nThis not only means a lot of integrations, but also that the integrations may need to be implemented differently."),(0,o.kt)("p",null,"This is a similar situation when there was no standardization on charging cable adapters.\nIt was difficult or sometimes impossible to connect various devices and led to high efforts and waste for everyone."),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"ORD Provider Overview",src:a(9168).Z,title:"Metadata Integration without alignment",width:"4106",height:"1690"})))),(0,o.kt)("details",null,(0,o.kt)("summary",null,"Metadata integration with ORD alignment"),(0,o.kt)("p",null,(0,o.kt)("p",null,"We can tackle this problem by introducing two concepts: First, use ",(0,o.kt)("strong",{parentName:"p"},"aligned standards for metadata description and discovery"),".\nSecond, use a ",(0,o.kt)("strong",{parentName:"p"},"central aggregator"),", which can read metadata from all providers and can serve the information to all consumers."),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"ORD Provider Overview",src:a(2886).Z,title:"Metadata Integration with ORD",width:"4137",height:"1714"})))),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"\u2139 Read the ",(0,o.kt)("a",{parentName:"p",href:"/details/articles/why-ord"},"Why ORD?")," article for more background.")),(0,o.kt)("h2",{id:"quick-overview"},"Quick Overview"),(0,o.kt)("p",null,"Open Resource Discovery (ORD) is a protocol that ",(0,o.kt)("strong",{parentName:"p"},"allows applications and services to self-describe their exposed resources and capabilities"),". This can be done at deploy-time for publishing static documentation and at runtime to also reflect tenant specific configuration and extensions.\u200b"),(0,o.kt)("p",null,"By adopting ORD, an application will implement a single-entry point (",(0,o.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Service_provider_interface"},"Service Provider Interface"),") that can be used to discover and crawl the relevant information / metadata."),(0,o.kt)("div",{style:{"text-align":"center"}},(0,o.kt)("p",null,(0,o.kt)("img",{alt:"ORD Provider Overview",src:a(381).Z,title:"ORD Provider Overview",width:"3428",height:"1369"}))),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"\u2139 Please note that ORD does not replace already established standards to describe resources in detail.\nFor example, plain REST APIs could be described via ",(0,o.kt)("a",{parentName:"p",href:"https://www.openapis.org/"},"OpenAPI"),".\nORD will enable the discovery of this fact and the relevant metadata detail documents.")),(0,o.kt)("details",null,(0,o.kt)("summary",null,"More Detail: How ORD helps with Self-Description"),(0,o.kt)("p",null,(0,o.kt)("p",null,"In the picture above, the center is an application or service describing itself.\nThey typically have multiple resources and capabilities that are outward facing and are of interest for external consumers."),(0,o.kt)("p",null,"The most typical information to describe with ORD are ",(0,o.kt)("strong",{parentName:"p"},"APIs")," and ",(0,o.kt)("strong",{parentName:"p"},"Events"),".\nBut due to its general purpose nature, it can also be used to describe other aspects.\nFor example what additional ",(0,o.kt)("strong",{parentName:"p"},"capabilities")," there are; a description the underlying conceptual models (Domain Model) as ",(0,o.kt)("strong",{parentName:"p"},"Entity Types"),", external ",(0,o.kt)("strong",{parentName:"p"},"Integration Dependencies")," and potentially also ",(0,o.kt)("strong",{parentName:"p"},"Data Products")," in the future.\nAll those information can be brought into relation with each other."),(0,o.kt)("p",null,"ORD standardizes how those information can be automatically discovered and aggregated.\nPlease note that ORD is no replacement for detailed resource definition standards like OpenAPI.\nInstead, it describes a bigger context with shared, high-level information, taxonomy and relations between the described resources.\nIt also standardizes the publishing and discovery related interfaces and behaviors, to ensure a high degree of automation that allows us to keep in sync with reality.\nThe same ORD implementation can be used to both describe the tenant-specific customer landscape and the static reference landscape view to an API Catalog."),(0,o.kt)("p",null,"When ORD information get combined by a central ORD aggregator and integrated with other, central metadata sources, we can realize a connected (customer) ",(0,o.kt)("strong",{parentName:"p"},"system landscape metadata view"),".\nThis gives both SAP and our customers better introspection about the actual system landscape. This enables or improves many meta-data driven use-cases (like low-code/no-code)."),(0,o.kt)("p",null,"The specification provides a shared contract and alignment point for the ecosystem, spanning various consumers and providers. This allows to have one aligned standard instead of a wild growth of specific point-to-point alignments and integrations."))),(0,o.kt)("h2",{id:"ord-architecture-at-sap"},"ORD Architecture at SAP"),(0,o.kt)("p",null,"Below is a simplified overview of how ORD has been adopted at SAP:"),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"ORD Provider Overview",src:a(348).Z,title:"SAP ORD Architecture Overview",width:"2750",height:"1619"})),(0,o.kt)("p",null,"We need to make a distinction between describing and understanding:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"Customer System Landscape"),': Describes a real system landscape as it actually exists, e.g. for a customer ("as-is view").',(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"SAP uses the ",(0,o.kt)("a",{parentName:"li",href:"#unified-customer-landscape"},"Unified Customer Landscape")," (UCL) as central aggregator, that will discover and combine ORD information and re-expose them as a (customer specific) system landscape metadata view."))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"Reference Landscape"),': Describes a static, generic catalog of what is offered ("could-be view").',(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"SAP publishes static documentation to the ",(0,o.kt)("a",{parentName:"li",href:"#sap-business-accelerator-hub"},"SAP Business Accelerator Hub"))))),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"ORD Consumers")," have now the convenience to get a holistic, pre-aggregated and connected picture and can use the aggregators for documentation and fetching the metadata via ORD Service APIs."),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"ORD Providers")," can now use the same protocol to publish the metadata to both perspectives and aggregators that has been aligned to work for various ORD Consumer use cases."),(0,o.kt)("h2",{id:"ord-by-examples"},"ORD by Examples"),(0,o.kt)("h3",{id:"sap-business-accelerator-hub"},"SAP Business Accelerator Hub"),(0,o.kt)("p",null,"The ",(0,o.kt)("a",{parentName:"p",href:"https://api.sap.com/"},"SAP Business Accelerator Hub")," is an example of an ORD aggregator that uses static information to present generic documentation.\nThis perspective is very important, as it describes technical aspects of products without the need to first own and provision the system."),(0,o.kt)("details",null,(0,o.kt)("summary",null,"Click to see UI examples with annotations"),(0,o.kt)("p",null,(0,o.kt)("p",null,(0,o.kt)("img",{alt:"SAP Business Accelerator Hub Example 1",src:a(782).Z,title:"SAP Business Accelerator Hub Example 1",width:"2293",height:"1078"})),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"SAP Business Accelerator Hub Example 2",src:a(1111).Z,title:"SAP Business Accelerator Hub Example 2",width:"1814",height:"902"})))),(0,o.kt)("h3",{id:"unified-customer-landscape"},"Unified Customer Landscape"),(0,o.kt)("p",null,"The Unified Customer Landscape is foremost a technical background service that offers the system landscape metadata (incl. ORD information) to other applications and services.\nWhile the ",(0,o.kt)("a",{parentName:"p",href:"#business-accelerator-hub"},"Business Accelerator Hub")," focuses on the static perspective of a product, the UCL can provide the actual system tenant metadata - including possible customer extensions and customizations."),(0,o.kt)("p",null,"This is also exposed via the ",(0,o.kt)("a",{parentName:"p",href:"https://www.sap.com/products/technology-platform.html"},"SAP BTP")," Cockpit in the System Landscape overview.\nHere customers can see their own systems / tenants and manage them, e.g. by grouping them via formations that enable trust and automatic integration between them.\nSystems that are in the same formation usually need to get information about each other, some of which may be provided via ORD."),(0,o.kt)("details",null,(0,o.kt)("summary",null,"Click to see UI examples with annotations"),(0,o.kt)("p",null,(0,o.kt)("p",null,(0,o.kt)("img",{alt:"BTP Cockpit System Landscape via UCL",src:a(3879).Z,title:"BTP Cockpit System Landscape via UCL",width:"2265",height:"1290"})),(0,o.kt)("p",null,"The most notable concept is the ",(0,o.kt)("a",{parentName:"p",href:"/#def-system-instance"},"ORD System Instance"),", which is usually a tenant.\nIf ORD information are provided, the detail view can show them and they will be made available to other systems in the same formation or account context."))),(0,o.kt)("h3",{id:"api-metadata-validator"},"API Metadata Validator"),(0,o.kt)("p",null,"We believe that standards and policies can only realistically be ensured if we can automatically verify for correctness and compliance."),(0,o.kt)("p",null,"This is why we have a complementary project, called the SAP API Metadata Validator.\nIt can validate ORD documents, but also a other metadata formats that we usually pass along via the ORD protocol, like OpenAPI documents.\nWe use this also to not just test for technical correctness, but also to adherence to certain compliance levels."),(0,o.kt)("h2",{id:"ord-in-more-detail"},"ORD in More Detail"),(0,o.kt)("details",null,(0,o.kt)("summary",null,"ORD Information"),(0,o.kt)("p",null,(0,o.kt)("p",null,"ORD as a protocol standardizes both the ",(0,o.kt)("strong",{parentName:"p"},"information model")," and the ",(0,o.kt)("a",{parentName:"p",href:"#ord-behaviors"},"behavior")," how the information are exchanged."),(0,o.kt)("p",null,"Typical questions that are addressed on ORD level are:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Get an complete overview of the resources and capabilities"),(0,o.kt)("li",{parentName:"ul"},"What type of resource something is and how to access its metadata or the resource itself"),(0,o.kt)("li",{parentName:"ul"},"Where to find more information on the resource, e.g. links to machine-readable definitions (e.g. OpenAPI)"),(0,o.kt)("li",{parentName:"ul"},"Get overview documentation and find links to external human readable documentation"),(0,o.kt)("li",{parentName:"ul"},"How the resources fit into a global taxonomy"),(0,o.kt)("li",{parentName:"ul"},"How resources relate to each other (e.g. for navigation)")),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"ORD Information Overview",src:a(8837).Z,title:"ORD Information Overview",width:"3180",height:"1390"})))),(0,o.kt)("details",null,(0,o.kt)("summary",null,"ORD Behavior"),(0,o.kt)("p",null,(0,o.kt)("p",null,"ORD can enable fully automated metadata discovery and exchange (after initial onboarding).\nby also standardizing how the information are discovered, transported and accessed. See ",(0,o.kt)("a",{parentName:"p",href:"/spec-v1/#ord-transport-modes"},"ORD Transport Modes")," for an example."),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"ORD Behavior Overview",src:a(3635).Z,title:"ORD Behavior Overview",width:"3941",height:"1370"})))),(0,o.kt)("details",null,(0,o.kt)("summary",null,"ORD Roles Overview"),(0,o.kt)("p",null,(0,o.kt)("p",null,"In ORD there are three roles that systems can have.\nDepending on the role, only some parts of the specification are relevant and need to be implemented.\nOne system can also have more than one role, e.g. an ORD Provider can also be an ORD Consumer."),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"ORD Roles Overview",src:a(3903).Z,title:"ORD Roles Overview",width:"3979",height:"1214"})))),(0,o.kt)("details",null,(0,o.kt)("summary",null,"ORD Provider Role"),(0,o.kt)("p",null,(0,o.kt)("p",null,"The ",(0,o.kt)("a",{parentName:"p",href:"/spec-v1/#ord-provider"},"ORD Provider"),"  is a system that describes itself via ORD, so it's metadata becomes available to interested ORD Consumers."),(0,o.kt)("p",null,"They have to implement one of the ORD transport modes (currently only a pull-based API is supported), so the ORD information and related metadata definitions can be discovered and fetched."),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"ORD Provider Role",src:a(3911).Z,title:"ORD Provider Role",width:"3144",height:"972"})))),(0,o.kt)("details",null,(0,o.kt)("summary",null,"ORD Aggregator Role"),(0,o.kt)("p",null,(0,o.kt)("p",null,"The ",(0,o.kt)("a",{parentName:"p",href:"/spec-v1/#ord-aggregator"},"ORD Aggregator")," has the job to simplify the life of ORD Consumers.\nIt will discover and connect to many ORD Providers and fetch their metadata.\nIt may also integrate information from other (usually central) repositories.\nSince it builds an aggregated overview, here the decentralized information from many sources can come together and form a connected graph of metadata knowledge."),(0,o.kt)("p",null,"It's most notable feature is that it offers an ",(0,o.kt)("a",{parentName:"p",href:"/spec-v1/#ord-service"},"ORD Service"),", which offers a high-quality API to ORD consumers.\nThe information offered represent an aggregated, connected and consolidated metadata overview."),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"ORD Aggregator Role",src:a(8678).Z,title:"ORD Aggregator Role",width:"3472",height:"810"})))),(0,o.kt)("details",null,(0,o.kt)("summary",null,"ORD Consumer Role"),(0,o.kt)("p",null,(0,o.kt)("p",null,"The ",(0,o.kt)("a",{parentName:"p",href:"/spec-v1/#ord-consumer"},"ORD Consumer")," is interested in learning about the resources and capabilities of other systems."),(0,o.kt)("p",null,"Ideally, it will get them from the ORD Aggregator, where a complete overview is offered with a"),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"ORD Consumer Role",src:a(1618).Z,title:"ORD Consumer Role",width:"2740",height:"1181"})))))}h.isMDXComponent=!0},2886:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/aligned-standards-01994613a81547c71ec94743069ba361.svg"},3879:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/btp-cockpit-ucl-example-83414adba58c65aee952154b6ed7b928.png"},782:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/business-accelerator-hub-example1-467ed1dadd8b8770d60373726173d231.png"},1111:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/business-accelerator-hub-example2-4316ef70019af908cdb0644c635eba42.png"},9168:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/no-aligned-standards-2f04799e249a888b146dd3a1442dfa64.svg"},3635:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/ord-behavior-overview-09abfa41a19d1ad11280eeb0367ef8a7.svg"},8837:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/ord-information-overview-d40620b5784095400b48e8ddb0680d11.svg"},381:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/ord-provider-overview-dd2d934b4bbce9bfcdb69f06a59cde59.svg"},8678:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/ord-role-aggregator-51fdc26fd4bab05102cd8a55f1c113a2.svg"},1618:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/ord-role-consumer-3289d50ebc7766b03c64edcce4d92429.svg"},3911:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/ord-role-provider-07f8e59c8fff920051278d0c2ad23dd7.svg"},3903:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/ord-roles-overview-0feac4bc3245853ebfca99ec2b4b7ab5.svg"},348:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/ord-sap-architecture-overview-4e0b6e3a327d6825835e8d338effeae8.svg"}}]);