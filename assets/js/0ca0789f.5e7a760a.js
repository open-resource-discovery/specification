"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[3919],{1811:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>a,contentTitle:()=>c,default:()=>u,frontMatter:()=>r,metadata:()=>i,toc:()=>p});var s=o(4848),t=o(8453);const r={},c="Example Configuration Files",i={id:"spec-v1/examples/configuration",title:"Example Configuration Files",description:"./examples/configuration-1.json",source:"@site/docs/spec-v1/examples/configuration.md",sourceDirName:"spec-v1/examples",slug:"/spec-v1/examples/configuration",permalink:"/open-resource-discovery/spec-v1/examples/configuration",draft:!1,unlisted:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/spec-v1/examples/configuration.md",tags:[],version:"current",frontMatter:{},sidebar:"specV1Sidebar",previous:{title:"Example Files",permalink:"/open-resource-discovery/spec-v1/examples/"},next:{title:"Example Document Files",permalink:"/open-resource-discovery/spec-v1/examples/document"}},a={},p=[{value:"./examples/configuration-1.json",id:"examplesconfiguration-1json",level:3}];function l(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h3:"h3",header:"header",p:"p",pre:"pre",...(0,t.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"example-configuration-files",children:"Example Configuration Files"})}),"\n",(0,s.jsx)(n.h3,{id:"examplesconfiguration-1json",children:"./examples/configuration-1.json"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:["Source Code: ",(0,s.jsx)(n.a,{href:"https://github.com/SAP/open-resource-discovery/blob/main/examples/configuration-1.json",children:"./examples/configuration-1.json"})]}),"\n"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:'{\n  "$schema": "https://sap.github.io/open-resource-discovery/spec-v1/interfaces/Configuration.schema.json",\n  "openResourceDiscoveryV1": {\n    "documents": [\n      {\n        "url": "/ord/documents/1.json",\n        "accessStrategies": [\n          {\n            "type": "open"\n          }\n        ]\n      },\n      {\n        "url": "/ord/documents/data-product.json",\n        "accessStrategies": [\n          {\n            "type": "open"\n          },\n          {\n            "type": "custom",\n            "customType": "sap.foo:open-with-tenant-id:v1",\n            "customDescription": "The metadata information is openly accessible but system instance aware.\\nThe tenant is selected by providing a global or local tenant ID header."\n          }\n        ],\n        "systemInstanceAware": true\n      }\n    ]\n  }\n}\n'})})]})}function u(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},8453:(e,n,o)=>{o.d(n,{R:()=>c,x:()=>i});var s=o(6540);const t={},r=s.createContext(t);function c(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:c(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);