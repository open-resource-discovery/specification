"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[82],{2992:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>d,contentTitle:()=>l,default:()=>a,frontMatter:()=>c,metadata:()=>t,toc:()=>o});var i=n(5893),r=n(1151);const c={title:"SAP Core v1"},l="SAP Core Policy Level (v1.0)",t={id:"spec-extensions/policy-levels/sap-core-v1",title:"SAP Core v1",description:"Description",source:"@site/docs/spec-extensions/policy-levels/sap-core-v1.md",sourceDirName:"spec-extensions/policy-levels",slug:"/spec-extensions/policy-levels/sap-core-v1",permalink:"/open-resource-discovery/spec-extensions/policy-levels/sap-core-v1",draft:!1,unlisted:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/spec-extensions/policy-levels/sap-core-v1.md",tags:[],version:"current",frontMatter:{title:"SAP Core v1"},sidebar:"specExtensionsSidebar",previous:{title:"ORD Policy Levels",permalink:"/open-resource-discovery/spec-extensions/policy-levels/"}},d={},o=[{value:"Description",id:"description",level:2},{value:"General Policies",id:"general-policies",level:2},{value:"Access Strategies",id:"access-strategies",level:3},{value:"Namespaces",id:"namespaces",level:3},{value:"ID Constraints",id:"id-constraints",level:3},{value:"Title Constraints",id:"title-constraints",level:3},{value:"Description Constraints",id:"description-constraints",level:3},{value:"Short Description Constraints",id:"short-description-constraints",level:3},{value:"Misc Constraints",id:"misc-constraints",level:3},{value:"Context Specific Policies",id:"context-specific-policies",level:2},{value:"Package",id:"package",level:3},{value:"Consumption Bundle",id:"consumption-bundle",level:3},{value:"API Resource",id:"api-resource",level:3},{value:"Event Resource",id:"event-resource",level:3},{value:"Extensible",id:"extensible",level:3},{value:"Correlation IDs",id:"correlation-ids",level:3}];function h(e){const s={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,r.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.h1,{id:"sap-core-policy-level-v10",children:"SAP Core Policy Level (v1.0)"}),"\n",(0,i.jsx)(s.h2,{id:"description",children:"Description"}),"\n",(0,i.jsxs)(s.p,{children:["This policy level (aka compliance level) ",(0,i.jsx)(s.code,{children:"sap:core:v1"})," MUST be fulfilled by all SAP applications and services.\nExceptions are only allowed on a case by case basis."]}),"\n",(0,i.jsx)(s.p,{children:"This policy level is based on various SAP guidelines and rules - most of them which are already established."}),"\n",(0,i.jsx)(s.p,{children:"It defines the core rules and guidelines that are shared across SAP, although more specific rules and guidelines MAY be applied on top."}),"\n",(0,i.jsx)(s.h2,{id:"general-policies",children:"General Policies"}),"\n",(0,i.jsx)(s.h3,{id:"access-strategies",children:"Access Strategies"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["SAP applications and services MUST use SAP specific access strategies:","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:[(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-extensions/access-strategies/sap-businesshub-basic-v1",children:(0,i.jsx)(s.code,{children:"sap.businesshub:basic-auth:v1"})})," for the ",(0,i.jsx)(s.a,{href:"https://api.sap.com/",children:"SAP Business Accelerator Hub"}),".","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:'The use of "mixed" access strategies is not supported, so both the ORD documents AND the attached resource definitions MUST be available through the same access strategy.'}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:[(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-extensions/access-strategies/sap-cmp-mtls-v1",children:(0,i.jsx)(s.code,{children:"sap:cmp-mtls:v1"})})," for the Unified Customer Landscape."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"namespaces",children:"Namespaces"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["All SAP ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/#namespaces",children:"namespaces"})," MUST be registered in the SAP namespace-registry.","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["All SAP applications MUST use the ",(0,i.jsx)(s.code,{children:"sap"})," vendor namespace."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"id-constraints",children:"ID Constraints"}),"\n",(0,i.jsxs)(s.p,{children:["IF the resources have already been published to the public ",(0,i.jsx)(s.a,{href:"https://api.sap.com/",children:"SAP Business Accelerator Hub"})," we MUST somehow keep a correlation between their ORD ID and already existing Business Hub ID. This is necessary to keep existing URLs stable and to ensure we update the existing entries, not create new ones."]}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:[(0,i.jsx)(s.strong,{children:"Preferred Approach"}),":","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["Get in touch with the Business Hub colleagues, to clarify which existing packages need to be associated with the registered ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/#namespaces",children:"namespace"})," (from step above)."]}),"\n",(0,i.jsxs)(s.li,{children:["Keep the ",(0,i.jsx)(s.code,{children:"<resourceId>"})," fragment of the ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/#ord-id",children:"ORD ID"})," identical to the ID that was previously published on the Business Accelerator Hub."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"title-constraints",children:"Title Constraints"}),"\n",(0,i.jsxs)(s.p,{children:["The following constraints apply in addition to the constraints defined in the ",(0,i.jsx)(s.a,{href:"https://sap.github.io/open-resource-discovery/spec-v1/interfaces/document/",children:"ORD Document"}),"."]}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["All ",(0,i.jsx)(s.code,{children:"title"})," values (except link titles) MUST NOT exceed 120 characters, as per SAP API Style Guide and SAP Business Accelerator Hub guideline recommendations."]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["All ",(0,i.jsx)(s.code,{children:"title"}),' values (except link titles) MUST NOT contain the term "Deprecated" or "Decommissioned". Use ',(0,i.jsx)(s.code,{children:"releaseStatus"})," to indicate this instead, if available."]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["All ",(0,i.jsx)(s.code,{children:"title"})," values (except link titles) SHOULD use the following charset:"]}),"\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Chars"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsxs)(s.tr,{children:[(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"A-Z"}),", ",(0,i.jsx)(s.code,{children:"a-z"})]}),(0,i.jsx)(s.td,{children:"Latin letters"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"0-9"})}),(0,i.jsx)(s.td,{children:"Numbers"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:" "})}),(0,i.jsx)(s.td,{children:"Space"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"-"})," ",(0,i.jsx)(s.code,{children:"\u2014"})," ",(0,i.jsx)(s.code,{children:"\u2013"})]}),(0,i.jsx)(s.td,{children:"Different hyphens"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:","})}),(0,i.jsx)(s.td,{children:"Comma"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"("})," ",(0,i.jsx)(s.code,{children:")"})]}),(0,i.jsx)(s.td,{children:"Parentheses"})]})]})]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"package"})," ",(0,i.jsx)(s.code,{children:"title"})," values MAY use the following additional characters:"]}),"\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Char"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsx)(s.tbody,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"/"})}),(0,i.jsx)(s.td,{children:"Forward slash"})]})})]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["All ",(0,i.jsx)(s.code,{children:"title"})," values (except link titles) SHOULD NOT contain the following terms:"]}),"\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Term"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsxs)(s.tr,{children:[(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"create"}),(0,i.jsx)("br",{}),(0,i.jsx)(s.code,{children:"read"}),(0,i.jsx)("br",{}),(0,i.jsx)(s.code,{children:"delete"}),(0,i.jsx)("br",{}),(0,i.jsx)(s.code,{children:"update"})]}),(0,i.jsx)(s.td,{children:"Operation words"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"v1"}),", ",(0,i.jsx)(s.code,{children:"v2"}),", etc."]}),(0,i.jsx)(s.td,{children:"Versions"})]})]})]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["All ",(0,i.jsx)(s.code,{children:"title"})," values (except link titles) MAY use the following specially approved terms:"]}),"\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Approved Term"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"S/4HANA"})}),(0,i.jsx)(s.td,{children:"Approved product name"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"country/region"})}),(0,i.jsx)(s.td,{children:"Approved name"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"G/L"})}),(0,i.jsx)(s.td,{children:"General ledger. Approved abbreviation."})]})]})]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"description-constraints",children:"Description Constraints"}),"\n",(0,i.jsxs)(s.p,{children:["The following constraints apply in addition to the constraints defined in the ",(0,i.jsx)(s.a,{href:"https://sap.github.io/open-resource-discovery/spec-v1/interfaces/document/",children:"ORD Document"}),"."]}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["All ",(0,i.jsx)(s.code,{children:"description"})," values MUST NOT contain the short description.\nThey are complementary to the short description and should not just be a longer replacement."]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"short-description-constraints",children:"Short Description Constraints"}),"\n",(0,i.jsxs)(s.p,{children:["The following constraints apply in addition to the constraints defined in the ",(0,i.jsx)(s.a,{href:"https://sap.github.io/open-resource-discovery/spec-v1/interfaces/document/",children:"ORD Document"}),"."]}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["All ",(0,i.jsx)(s.code,{children:"shortDescription"})," values SHOULD NOT exceed 180 characters."]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["All ",(0,i.jsx)(s.code,{children:"shortDescription"})," values MUST NOT repeat or start with the object name."]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["All ",(0,i.jsx)(s.code,{children:"shortDescription"})," values SHOULD use the following charset:"]}),"\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Chars"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsxs)(s.tr,{children:[(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"A-Z"}),", ",(0,i.jsx)(s.code,{children:"a-z"})]}),(0,i.jsx)(s.td,{children:"Latin letters"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"0-9"})}),(0,i.jsx)(s.td,{children:"Numbers"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:" "})}),(0,i.jsx)(s.td,{children:"Space"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"_"})}),(0,i.jsx)(s.td,{children:"Underscores"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"-"})," ",(0,i.jsx)(s.code,{children:"\u2014"})," ",(0,i.jsx)(s.code,{children:"\u2013"})]}),(0,i.jsx)(s.td,{children:"Different hyphens"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"."})}),(0,i.jsx)(s.td,{children:"Fullstop (Period)"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:","})}),(0,i.jsx)(s.td,{children:"Comma"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsxs)(s.td,{children:[(0,i.jsx)(s.code,{children:"("})," ",(0,i.jsx)(s.code,{children:")"})]}),(0,i.jsx)(s.td,{children:"Parentheses"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"'s"})}),(0,i.jsx)(s.td,{children:"Possessive apostrophe"})]})]})]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["All ",(0,i.jsx)(s.code,{children:"shortDescription"})," values MAY use the following specially approved terms:"]}),"\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Approved Name"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"S/4HANA"})}),(0,i.jsx)(s.td,{children:"Approved product name"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"country/region"})}),(0,i.jsx)(s.td,{children:"Approved name"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"G/L"})}),(0,i.jsx)(s.td,{children:"General ledger. Approved abbreviation."})]})]})]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"misc-constraints",children:"Misc Constraints"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"For setting and incrementing API versions and major versions, the SAP API Compatibility rules MUST be followed."}),"\n",(0,i.jsxs)(s.li,{children:["If an API or event resource has been deprecated, the ",(0,i.jsx)(s.code,{children:"deprecationDate"})," MUST be provided."]}),"\n",(0,i.jsxs)(s.li,{children:["For all ",(0,i.jsx)(s.code,{children:"releaseStatus"})," changes, a changelog entry SHOULD be created."]}),"\n",(0,i.jsxs)(s.li,{children:["For the taxonomy properties ",(0,i.jsx)(s.code,{children:"lineOfBusiness"})," and ",(0,i.jsx)(s.code,{children:"industry"}),": Only the recommended values MUST be chosen."]}),"\n",(0,i.jsxs)(s.li,{children:["The ",(0,i.jsx)(s.code,{children:"accessStrategy"})," ",(0,i.jsx)(s.code,{children:"open"})," MUST NOT be used without explicit consent by the responsible security experts, especially when the metadata could expose tenant (customer) specific information."]}),"\n",(0,i.jsxs)(s.li,{children:["Although ",(0,i.jsx)(s.code,{children:"Vendor"})," is technically not validated by a policy level, we need to ensure that within SAP we don't define the SAP vendor multiple times or reference it differently.","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["The SAP ",(0,i.jsx)(s.code,{children:"Vendor"})," MUST NOT be defined by any SAP application or service, as this is done centrally."]}),"\n",(0,i.jsxs)(s.li,{children:["The correct value for a SAP vendor reference is ",(0,i.jsx)(s.code,{children:"sap:vendor:SAP:"}),"."]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["For OpenAPI documents which are already published on Business Accelerator Hub, the existing ",(0,i.jsx)(s.code,{children:"x-sap-"})," extension properties MUST be kept even if the information are now also in the ORD Document. This is to not break end-consumers that only have access to the OpenAPI file. We MAY remove this requirement in the future, by automatically post-processing the ORD information into the OpenAPI files centrally (feature request)."]}),"\n"]}),"\n",(0,i.jsx)(s.h2,{id:"context-specific-policies",children:"Context Specific Policies"}),"\n",(0,i.jsx)(s.h3,{id:"package",children:"Package"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["For ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/interfaces/document#package",children:"Packages"})," with policy level sap, the Governance Guidelines for API Packages MUST be followed.","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"This includes the current limitation that Packages MUST NOT contain mixed resource types. E.g., a Package must only contain either APIs or Events, but never both together."}),"\n",(0,i.jsx)(s.li,{children:"SAP Business Accelerator Hub publishing becomes slow if too much content is in a Package (> 100 resources). Consider creating smaller packages that are split around the aspect of what needs to be published in one transaction."}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["The ",(0,i.jsx)(s.code,{children:"vendor"})," of a Package MUST be set to ",(0,i.jsx)(s.code,{children:"sap:vendor:SAP:"}),"."]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"consumption-bundle",children:"Consumption Bundle"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["For public or internal ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/interfaces/document#api-resource",children:"API Resources"})," with ",(0,i.jsx)(s.code,{children:"inbound"})," or ",(0,i.jsx)(s.code,{children:"mixed"})," direction (consumption pattern): MUST provide and assign a ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/interfaces/document#consumption-bundle",children:"Consumption Bundle"}),". This is necessary as some SAP ORD Consumers rely on Consumption Bundles to find and navigate accessible resources."]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"api-resource",children:"API Resource"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["For ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/interfaces/document#api-resource",children:"API Resources"})," the Guidelines for publishing API Resources on the SAP Business Accelerator Hub MUST be followed according to our internal API and external API guidelines.\nThe first link includes a decision table for internal vs. external, which corresponds to ",(0,i.jsx)(s.code,{children:"visibility"})," internal vs. public in ORD."]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["The ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/interfaces/document#api-resource_extensible",children:(0,i.jsx)(s.code,{children:"extensible"})})," property MUST be provided."]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["For API Resources with ",(0,i.jsx)(s.code,{children:"visibility"}),': "public" or "internal":']}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"Resource definitions MUST be provided for OData, REST, GraphQL and SOAP APIs."}),"\n",(0,i.jsxs)(s.li,{children:["OData APIs MUST have a resource definition of ",(0,i.jsx)(s.code,{children:'"type": "edmx"'})," AND additionally one of either ",(0,i.jsx)(s.code,{children:'"type": "openapi-v3"'})," or ",(0,i.jsx)(s.code,{children:'"type": "openapi-v2"'}),". Optionally, ",(0,i.jsx)(s.code,{children:'"type": "csdl-json"'}),' may be added."']}),"\n",(0,i.jsxs)(s.li,{children:["Plain REST APIs MUST have a resource definition of ",(0,i.jsx)(s.code,{children:'"type": "openapi-v3"'})," (RECOMMENDED) or ",(0,i.jsx)(s.code,{children:'"type": "openapi-v2"'}),"."]}),"\n",(0,i.jsxs)(s.li,{children:["GraphQL APIs MUST have a resource definition of ",(0,i.jsx)(s.code,{children:'"type": "graphql-sdl"'}),"."]}),"\n",(0,i.jsxs)(s.li,{children:["SOAP APIs MUST have a resource definition of ",(0,i.jsx)(s.code,{children:'"type": "wsdl-v2"'})," (RECOMMENDED) or ",(0,i.jsx)(s.code,{children:'"type": "wsdl-v1"'}),"."]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["OpenAPI definitions SHOULD be validated via the SAP API Metadata Validator, using ",(0,i.jsx)(s.code,{children:"sap:core:v1"})," compliance level."]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["The SAP API Harmonization Guideline rules MAY be adhered, but are not part of the ",(0,i.jsx)(s.code,{children:"sap:core:v1"})," scope."]}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["We intend to release an additional policy level (",(0,i.jsx)(s.code,{children:"sap:core:v2"}),"?) that includes this as MUST requirement."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"event-resource",children:"Event Resource"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["For ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/interfaces/document#event-resource",children:"Event Resources"})," the ",(0,i.jsx)(s.a,{href:"https://help.sap.com/viewer/9c880f03c6084ca4b2573b5605ec7a83/Cloud/en-US/3cda0ea7b65849108d530eb33ce2fb85.html",children:"Governance Guidelines for Events"})," MUST be followed."]}),"\n",(0,i.jsxs)(s.li,{children:["The ",(0,i.jsx)(s.code,{children:"extensible"})," property MUST be provided."]}),"\n",(0,i.jsxs)(s.li,{children:["For Event Resources with ",(0,i.jsx)(s.code,{children:"visibility"}),': "public" or "internal":',"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"Resource definitions MUST be provided."}),"\n",(0,i.jsxs)(s.li,{children:["CloudEvents MUST have a resource definition of ",(0,i.jsx)(s.code,{children:'"type": "asyncapi-v2"'})," (see ",(0,i.jsx)(s.a,{href:"https://www.asyncapi.com/docs/specifications/2.0.0",children:"AsyncAPI specification 2.0"}),")."]}),"\n",(0,i.jsxs)(s.li,{children:["SAP Business Events (that conform to the SAP Event Specification:","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["MUST use the SAP Event Catalog standard, which is compatible to AsyncAPI 2.0 (",(0,i.jsx)(s.code,{children:'"type": "asyncapi-v2"'}),")."]}),"\n",(0,i.jsxs)(s.li,{children:["MUST NOT be part of a consumption bundle.","\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"Events can only be consumed at an intermediary, i.e., the SAP Event Mesh."}),"\n",(0,i.jsx)(s.li,{children:"Consequently, the producing application cannot describe how they are eventually consumed."}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["SAP Event Catalogs SHOULD be validated via the SAP API Metadata Validator, using ",(0,i.jsx)(s.code,{children:"sap:core:v1"})," compliance level."]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"extensible",children:"Extensible"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["If the mandatory ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/interfaces/document#extensible",children:"Extensible"})," object has a ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/interfaces/document#extensible_description",children:"description"}),", it MUST follow the guidance and rules of the SAP Technology Guideline TG12.R2."]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"correlation-ids",children:"Correlation IDs"}),"\n",(0,i.jsxs)(s.p,{children:["With ORD comes a ",(0,i.jsx)(s.a,{href:"/open-resource-discovery/spec-v1/#correlation-id",children:"Correlation ID"})," concept."]}),"\n",(0,i.jsxs)(s.p,{children:["All correlations that target an ",(0,i.jsx)(s.code,{children:"sap.*"})," namespace MUST use registered correlation ID types.\nLike the namespaces, they can be registered in the SAP namespace-registry."]}),"\n",(0,i.jsx)(s.p,{children:"This will help us to 1) achieve internal consistency that we can also automatically validate and 2) get an overview of valid and registered Correlation ID Types."})]})}function a(e={}){const{wrapper:s}={...(0,r.a)(),...e.components};return s?(0,i.jsx)(s,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},1151:(e,s,n)=>{n.d(s,{Z:()=>t,a:()=>l});var i=n(7294);const r={},c=i.createContext(r);function l(e){const s=i.useContext(c);return i.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function t(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),i.createElement(c.Provider,{value:s},e.children)}}}]);