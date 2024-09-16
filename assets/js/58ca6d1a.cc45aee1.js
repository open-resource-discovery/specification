"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[6072],{7788:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>l,contentTitle:()=>a,default:()=>m,frontMatter:()=>o,metadata:()=>c,toc:()=>u});var t=n(4848),s=n(8453),i=n(3514);const o={sidebar_position:7,hide_table_of_contents:!0},a="Class Diagrams",c={id:"spec-v1/diagrams/index",title:"Class Diagrams",description:"This section contains simplified class diagrams for the ORD Document and ORD Configuration interface.",source:"@site/docs/spec-v1/diagrams/index.md",sourceDirName:"spec-v1/diagrams",slug:"/spec-v1/diagrams/",permalink:"/open-resource-discovery/spec-v1/diagrams/",draft:!1,unlisted:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/spec-v1/diagrams/index.md",tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_position:7,hide_table_of_contents:!0},sidebar:"specV1Sidebar",previous:{title:"Example Document Files",permalink:"/open-resource-discovery/spec-v1/examples/document"},next:{title:"ORD Configuration Diagram",permalink:"/open-resource-discovery/spec-v1/diagrams/configuration"}},l={},u=[];function d(e){const r={h1:"h1",header:"header",p:"p",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(r.header,{children:(0,t.jsx)(r.h1,{id:"class-diagrams",children:"Class Diagrams"})}),"\n",(0,t.jsx)(r.p,{children:"This section contains simplified class diagrams for the ORD Document and ORD Configuration interface."}),"\n","\n",(0,t.jsx)("br",{}),"\n",(0,t.jsx)(i.A,{})]})}function m(e={}){const{wrapper:r}={...(0,s.R)(),...e.components};return r?(0,t.jsx)(r,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},3514:(e,r,n)=>{n.d(r,{A:()=>x});n(6540);var t=n(4164),s=n(4718),i=n(8774),o=n(5846),a=n(6654),c=n(1312),l=n(1107);const u={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var d=n(4848);function m(e){var r=e.href,n=e.children;return(0,d.jsx)(i.A,{href:r,className:(0,t.A)("card padding--lg",u.cardContainer),children:n})}function p(e){var r=e.href,n=e.icon,s=e.title,i=e.description;return(0,d.jsxs)(m,{href:r,children:[(0,d.jsxs)(l.A,{as:"h2",className:(0,t.A)("text--truncate",u.cardTitle),title:s,children:[n," ",s]}),i&&(0,d.jsx)("p",{className:(0,t.A)("text--truncate",u.cardDescription),title:i,children:i})]})}function f(e){var r,n,t=e.item,i=(0,s.Nr)(t),a=(n=(0,o.W)().selectMessage,function(e){return n(e,(0,c.T)({message:"1 item|{count} items",id:"theme.docs.DocCard.categoryDescription.plurals",description:"The default description for a category card in the generated index about how many items this category includes"},{count:e}))});return i?(0,d.jsx)(p,{href:i,icon:"\ud83d\uddc3\ufe0f",title:t.label,description:null!=(r=t.description)?r:a(t.items.length)}):null}function h(e){var r,n,t=e.item,i=(0,a.A)(t.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",o=(0,s.cC)(null!=(r=t.docId)?r:void 0);return(0,d.jsx)(p,{href:t.href,icon:i,title:t.label,description:null!=(n=t.description)?n:null==o?void 0:o.description})}function g(e){var r=e.item;switch(r.type){case"link":return(0,d.jsx)(h,{item:r});case"category":return(0,d.jsx)(f,{item:r});default:throw new Error("unknown item type "+JSON.stringify(r))}}function v(e){var r=e.className,n=(0,s.$S)();return(0,d.jsx)(x,{items:n.items,className:r})}function x(e){var r=e.items,n=e.className;if(!r)return(0,d.jsx)(v,Object.assign({},e));var i=(0,s.d1)(r);return(0,d.jsx)("section",{className:(0,t.A)("row",n),children:i.map((function(e,r){return(0,d.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,d.jsx)(g,{item:e})},r)}))})}},5846:(e,r,n)=>{n.d(r,{W:()=>l});var t=n(6540),s=n(4586),i=["zero","one","two","few","many","other"];function o(e){return i.filter((function(r){return e.includes(r)}))}var a={locale:"en",pluralForms:o(["one","other"]),select:function(e){return 1===e?"one":"other"}};function c(){var e=(0,s.A)().i18n.currentLocale;return(0,t.useMemo)((function(){try{return r=e,n=new Intl.PluralRules(r),{locale:r,pluralForms:o(n.resolvedOptions().pluralCategories),select:function(e){return n.select(e)}}}catch(t){return console.error('Failed to use Intl.PluralRules for locale "'+e+'".\nDocusaurus will fallback to the default (English) implementation.\nError: '+t.message+"\n"),a}var r,n}),[e])}function l(){var e=c();return{selectMessage:function(r,n){return function(e,r,n){var t=e.split("|");if(1===t.length)return t[0];t.length>n.pluralForms.length&&console.error("For locale="+n.locale+", a maximum of "+n.pluralForms.length+" plural forms are expected ("+n.pluralForms.join(",")+"), but the message contains "+t.length+": "+e);var s=n.select(r),i=n.pluralForms.indexOf(s);return t[Math.min(i,t.length-1)]}(n,r,e)}}}},8453:(e,r,n)=>{n.d(r,{R:()=>o,x:()=>a});var t=n(6540);const s={},i=t.createContext(s);function o(e){const r=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function a(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),t.createElement(i.Provider,{value:r},e.children)}}}]);