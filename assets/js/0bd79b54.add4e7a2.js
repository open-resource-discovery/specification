"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[8632],{7649:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>a,contentTitle:()=>c,default:()=>p,frontMatter:()=>i,metadata:()=>l,toc:()=>u});var r=t(4848),s=t(8453),o=t(3514);const i={sidebar_position:2,hide_table_of_contents:!0},c="ORD Policy Levels",l={id:"spec-extensions/policy-levels/index",title:"ORD Policy Levels",description:"This section contains the documentation for the standardized ORD policyLevel choices.",source:"@site/docs/spec-extensions/policy-levels/index.mdx",sourceDirName:"spec-extensions/policy-levels",slug:"/spec-extensions/policy-levels/",permalink:"/open-resource-discovery/spec-extensions/policy-levels/",draft:!1,unlisted:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/spec-extensions/policy-levels/index.mdx",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2,hide_table_of_contents:!0},sidebar:"specExtensionsSidebar",previous:{title:"Specification Extensions",permalink:"/open-resource-discovery/spec-extensions/"},next:{title:"SAP Core v1",permalink:"/open-resource-discovery/spec-extensions/policy-levels/sap-core-v1"}},a={},u=[];function d(e){const n={code:"code",h1:"h1",header:"header",p:"p",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"ord-policy-levels",children:"ORD Policy Levels"})}),"\n",(0,r.jsxs)(n.p,{children:["This section contains the documentation for the standardized ORD ",(0,r.jsx)(n.code,{children:"policyLevel"})," choices."]}),"\n",(0,r.jsx)(n.p,{children:"The policies are versioned independently of the ORD spec.\nAs a consequence the validity of an ORD document is a separate concern as the compliance of the ORD document with the chosen policy. Changes in the policy MAY lead to compliance issues."}),"\n","\n",(0,r.jsx)("br",{}),"\n",(0,r.jsx)(o.A,{})]})}function p(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},3514:(e,n,t)=>{t.d(n,{A:()=>y});t(6540);var r=t(4164),s=t(4718),o=t(8774),i=t(5846),c=t(6654),l=t(1312),a=t(1107);const u={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var d=t(4848);function p(e){var n=e.href,t=e.children;return(0,d.jsx)(o.A,{href:n,className:(0,r.A)("card padding--lg",u.cardContainer),children:t})}function h(e){var n=e.href,t=e.icon,s=e.title,o=e.description;return(0,d.jsxs)(p,{href:n,children:[(0,d.jsxs)(a.A,{as:"h2",className:(0,r.A)("text--truncate",u.cardTitle),title:s,children:[t," ",s]}),o&&(0,d.jsx)("p",{className:(0,r.A)("text--truncate",u.cardDescription),title:o,children:o})]})}function m(e){var n,t,r=e.item,o=(0,s.Nr)(r),c=(t=(0,i.W)().selectMessage,function(e){return t(e,(0,l.T)({message:"1 item|{count} items",id:"theme.docs.DocCard.categoryDescription.plurals",description:"The default description for a category card in the generated index about how many items this category includes"},{count:e}))});return o?(0,d.jsx)(h,{href:o,icon:"\ud83d\uddc3\ufe0f",title:r.label,description:null!=(n=r.description)?n:c(r.items.length)}):null}function f(e){var n,t,r=e.item,o=(0,c.A)(r.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",i=(0,s.cC)(null!=(n=r.docId)?n:void 0);return(0,d.jsx)(h,{href:r.href,icon:o,title:r.label,description:null!=(t=r.description)?t:null==i?void 0:i.description})}function v(e){var n=e.item;switch(n.type){case"link":return(0,d.jsx)(f,{item:n});case"category":return(0,d.jsx)(m,{item:n});default:throw new Error("unknown item type "+JSON.stringify(n))}}function x(e){var n=e.className,t=(0,s.$S)();return(0,d.jsx)(y,{items:t.items,className:n})}function y(e){var n=e.items,t=e.className;if(!n)return(0,d.jsx)(x,Object.assign({},e));var o=(0,s.d1)(n);return(0,d.jsx)("section",{className:(0,r.A)("row",t),children:o.map((function(e,n){return(0,d.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,d.jsx)(v,{item:e})},n)}))})}},5846:(e,n,t)=>{t.d(n,{W:()=>a});var r=t(6540),s=t(4586),o=["zero","one","two","few","many","other"];function i(e){return o.filter((function(n){return e.includes(n)}))}var c={locale:"en",pluralForms:i(["one","other"]),select:function(e){return 1===e?"one":"other"}};function l(){var e=(0,s.A)().i18n.currentLocale;return(0,r.useMemo)((function(){try{return n=e,t=new Intl.PluralRules(n),{locale:n,pluralForms:i(t.resolvedOptions().pluralCategories),select:function(e){return t.select(e)}}}catch(r){return console.error('Failed to use Intl.PluralRules for locale "'+e+'".\nDocusaurus will fallback to the default (English) implementation.\nError: '+r.message+"\n"),c}var n,t}),[e])}function a(){var e=l();return{selectMessage:function(n,t){return function(e,n,t){var r=e.split("|");if(1===r.length)return r[0];r.length>t.pluralForms.length&&console.error("For locale="+t.locale+", a maximum of "+t.pluralForms.length+" plural forms are expected ("+t.pluralForms.join(",")+"), but the message contains "+r.length+": "+e);var s=t.select(n),o=t.pluralForms.indexOf(s);return r[Math.min(o,r.length-1)]}(t,n,e)}}}},8453:(e,n,t)=>{t.d(n,{R:()=>i,x:()=>c});var r=t(6540);const s={},o=r.createContext(s);function i(e){const n=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:i(e.components),r.createElement(o.Provider,{value:n},e.children)}}}]);