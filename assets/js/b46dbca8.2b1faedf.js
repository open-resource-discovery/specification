"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[549],{6828:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>c,default:()=>u,frontMatter:()=>o,metadata:()=>a,toc:()=>d});var r=n(4848),s=n(8453),i=n(3514);const o={sidebar_position:5,hide_table_of_contents:!0},c="ORD Example Files",a={id:"spec-v1/examples/index",title:"ORD Example Files",description:"This section contains example ORD Document and ORD Configuration files.",source:"@site/docs/spec-v1/examples/index.md",sourceDirName:"spec-v1/examples",slug:"/spec-v1/examples/",permalink:"/open-resource-discovery/spec-v1/examples/",draft:!1,unlisted:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/spec-v1/examples/index.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5,hide_table_of_contents:!0},sidebar:"specV1Sidebar",previous:{title:"ORD Document API",permalink:"/open-resource-discovery/spec-v1/interfaces/document-api"},next:{title:"Example Configuration Files",permalink:"/open-resource-discovery/spec-v1/examples/configuration"}},l={},d=[];function p(e){const t={blockquote:"blockquote",h1:"h1",p:"p",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h1,{id:"ord-example-files",children:"ORD Example Files"}),"\n",(0,r.jsx)(t.p,{children:"This section contains example ORD Document and ORD Configuration files."}),"\n",(0,r.jsxs)(t.blockquote,{children:["\n",(0,r.jsx)(t.p,{children:"\u2139 Please note that some of the examples are constructed to showcase certain features of ORD.\nThey do not work as a 1:1 copy template. For example, the namespaces need to be customized."}),"\n"]}),"\n","\n","\n",(0,r.jsx)("br",{}),"\n",(0,r.jsx)(i.A,{})]})}function u(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(p,{...e})}):p(e)}},3514:(e,t,n)=>{n.d(t,{A:()=>v});n(6540);var r=n(4164),s=n(1754),i=n(8774),o=n(6654),c=n(1312),a=n(1107);const l={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var d=n(4848);function p(e){var t=e.href,n=e.children;return(0,d.jsx)(i.A,{href:t,className:(0,r.A)("card padding--lg",l.cardContainer),children:n})}function u(e){var t=e.href,n=e.icon,s=e.title,i=e.description;return(0,d.jsxs)(p,{href:t,children:[(0,d.jsxs)(a.A,{as:"h2",className:(0,r.A)("text--truncate",l.cardTitle),title:s,children:[n," ",s]}),i&&(0,d.jsx)("p",{className:(0,r.A)("text--truncate",l.cardDescription),title:i,children:i})]})}function m(e){var t,n=e.item,r=(0,s.Nr)(n);return r?(0,d.jsx)(u,{href:r,icon:"\ud83d\uddc3\ufe0f",title:n.label,description:null!=(t=n.description)?t:(0,c.T)({message:"{count} items",id:"theme.docs.DocCard.categoryDescription",description:"The default description for a category card in the generated index about how many items this category includes"},{count:n.items.length})}):null}function f(e){var t,n,r=e.item,i=(0,o.A)(r.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",c=(0,s.cC)(null!=(t=r.docId)?t:void 0);return(0,d.jsx)(u,{href:r.href,icon:i,title:r.label,description:null!=(n=r.description)?n:null==c?void 0:c.description})}function x(e){var t=e.item;switch(t.type){case"link":return(0,d.jsx)(f,{item:t});case"category":return(0,d.jsx)(m,{item:t});default:throw new Error("unknown item type "+JSON.stringify(t))}}function h(e){var t=e.className,n=(0,s.$S)();return(0,d.jsx)(v,{items:n.items,className:t})}function v(e){var t=e.items,n=e.className;if(!t)return(0,d.jsx)(h,Object.assign({},e));var i=(0,s.d1)(t);return(0,d.jsx)("section",{className:(0,r.A)("row",n),children:i.map((function(e,t){return(0,d.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,d.jsx)(x,{item:e})},t)}))})}},8453:(e,t,n)=>{n.d(t,{R:()=>o,x:()=>c});var r=n(6540);const s={},i=r.createContext(s);function o(e){const t=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),r.createElement(i.Provider,{value:t},e.children)}}}]);