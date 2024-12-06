"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[5878],{3313:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>r,default:()=>h,frontMatter:()=>c,metadata:()=>s,toc:()=>d});const s=JSON.parse('{"id":"spec-extensions/access-strategies/open","title":"Open Access Strategy","description":"Access without mandatory authentication and authorization.","source":"@site/docs/spec-extensions/access-strategies/open.md","sourceDirName":"spec-extensions/access-strategies","slug":"/spec-extensions/access-strategies/open","permalink":"/open-resource-discovery/spec-extensions/access-strategies/open","draft":false,"unlisted":false,"editUrl":"https://github.com/SAP/open-resource-discovery/tree/main/docs/spec-extensions/access-strategies/open.md","tags":[],"version":"current","frontMatter":{"title":"Open Access Strategy","description":"Access without mandatory authentication and authorization."},"sidebar":"specExtensionsSidebar","previous":{"title":"ORD Access Strategies","permalink":"/open-resource-discovery/spec-extensions/access-strategies/"},"next":{"title":"SAP Business Accelerator Hub Basic Auth v1","permalink":"/open-resource-discovery/spec-extensions/access-strategies/sap-businesshub-basic-v1"}}');var a=t(4848),i=t(8453);const c={title:"Open Access Strategy",description:"Access without mandatory authentication and authorization."},r="Open Access Strategy (v1.0)",o={},d=[{value:"Description",id:"description",level:2},{value:"Optional Tenant HTTP Headers",id:"optional-tenant-http-headers",level:2},{value:"Local-Tenant-Id",id:"local-tenant-id",level:3},{value:"Global-Tenant-Id",id:"global-tenant-id",level:3},{value:"General Remarks",id:"general-remarks",level:3}];function l(e){const n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",pre:"pre",...(0,i.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"open-access-strategy-v10",children:"Open Access Strategy (v1.0)"})}),"\n",(0,a.jsx)(n.h2,{id:"description",children:"Description"}),"\n",(0,a.jsxs)(n.p,{children:["The ",(0,a.jsx)(n.code,{children:"open"})," access strategy indicates that there is no mandatory authentication and authorization to access the information. A regular HTTP GET call will be sufficient as the information are ",(0,a.jsx)(n.em,{children:"unprotected"}),"."]}),"\n",(0,a.jsx)(n.p,{children:"Whether this is a valid choice depends on the security considerations that the ORD providers are subject to."}),"\n",(0,a.jsxs)(n.p,{children:["The ",(0,a.jsx)(n.code,{children:"accessStrategy"}),".",(0,a.jsx)(n.code,{children:"type"})," value for it is: ",(0,a.jsx)(n.code,{children:"open"}),"."]}),"\n",(0,a.jsx)(n.h2,{id:"optional-tenant-http-headers",children:"Optional Tenant HTTP Headers"}),"\n",(0,a.jsx)(n.p,{children:"It may be necessary to indicate which tenant the information are requested for.\nThis becomes necessary when the ORD Provider is multi-tenant and the metadata it provides is different across those tenants (system instance aware)."}),"\n",(0,a.jsx)(n.p,{children:"The HTTP headers are optional and will only be sent by the ORD Aggregator if they are applicable and known by it."}),"\n",(0,a.jsx)(n.p,{children:"If the ORD Provider has metadata that is different per tenant and it understands the provided tenant IDs, it MUST return the ORD related information and metadata for the chosen tenant."}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:["\u2139 Please note that according to ",(0,a.jsx)(n.a,{href:"https://www.rfc-editor.org/rfc/rfc7230#section-3.2",children:"RFC 7230 Section 3.2"})," HTTP headers are case insensitive."]}),"\n"]}),"\n",(0,a.jsx)(n.h3,{id:"local-tenant-id",children:"Local-Tenant-Id"}),"\n",(0,a.jsxs)(n.p,{children:["The local tenant ID is the ID that the system instance itself created and uses to identify its tenants.\nIt is passed along as a ",(0,a.jsx)(n.code,{children:"Local-Tenant-Id"})," header."]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-http",children:"GET /.well-known/open-resource-discovery/document/1\nContent-Type: application/json\nLocal-Tenant-Id: 000023\n"})}),"\n",(0,a.jsx)(n.h3,{id:"global-tenant-id",children:"Global-Tenant-Id"}),"\n",(0,a.jsxs)(n.p,{children:["The global tenant ID is a globally unique ID for a system instance (tenant). The scope of uniqueness is within the connected aggregator.\nIt is passed along as a ",(0,a.jsx)(n.code,{children:"Global-Tenant-Id"})," header."]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-http",children:"GET /.well-known/open-resource-discovery/document/1\nContent-Type: application/json\nGlobal-Tenant-Id: c6c80b52-ecc1-47f8-9303-0d55fb67fd41\n"})}),"\n",(0,a.jsx)(n.h3,{id:"general-remarks",children:"General Remarks"}),"\n",(0,a.jsxs)(n.blockquote,{children:["\n",(0,a.jsxs)(n.p,{children:["\u2139 If the metadata is not different across tenants (system instance unaware), the response is static and the same across tenants.\nIn this case, this should be indicated via ",(0,a.jsx)(n.code,{children:"systemInstanceAware"}),": ",(0,a.jsx)(n.code,{children:"false"})," to avoid unnecessary requests for each tenant."]}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(l,{...e})}):l(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>c,x:()=>r});var s=t(6540);const a={},i=s.createContext(a);function c(e){const n=s.useContext(i);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:c(e.components),s.createElement(i.Provider,{value:n},e.children)}}}]);