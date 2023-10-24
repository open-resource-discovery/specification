"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[856],{3905:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>m});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},s=Object.keys(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=r.createContext({}),p=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},l=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,s=e.originalType,c=e.parentName,l=a(e,["components","mdxType","originalType","parentName"]),d=p(n),f=i,m=d["".concat(c,".").concat(f)]||d[f]||u[f]||s;return n?r.createElement(m,o(o({ref:t},l),{},{components:n})):r.createElement(m,o({ref:t},l))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var s=n.length,o=new Array(s);o[0]=f;var a={};for(var c in t)hasOwnProperty.call(t,c)&&(a[c]=t[c]);a.originalType=e,a[d]="string"==typeof e?e:i,o[1]=a;for(var p=2;p<s;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},5194:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>c,default:()=>m,frontMatter:()=>a,metadata:()=>p,toc:()=>d});var r=n(7462),i=n(3366),s=(n(7294),n(3905)),o=["components"],a={sidebar_position:0,hide_table_of_contents:!0,sidebar_class_name:"hidden"},c="Specification Extensions",p={unversionedId:"spec-extensions/index",id:"spec-extensions/index",title:"Specification Extensions",description:"Open Resource Discovery itself can be understood as a core specification that allows to be extended through specification extensions.",source:"@site/docs/spec-extensions/index.md",sourceDirName:"spec-extensions",slug:"/spec-extensions/",permalink:"/spec-extensions/",draft:!1,editUrl:"https://github.com/SAP/open-resource-discovery/tree/main/docs/spec-extensions/index.md",tags:[],version:"current",sidebarPosition:0,frontMatter:{sidebar_position:0,hide_table_of_contents:!0,sidebar_class_name:"hidden"},sidebar:"specExtensionsSidebar",next:{title:"ORD Access Strategies",permalink:"/spec-extensions/access-strategies/"}},l={},d=[],u={toc:d},f="wrapper";function m(e){var t=e.components,n=(0,i.Z)(e,o);return(0,s.kt)(f,(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h1",{id:"specification-extensions"},"Specification Extensions"),(0,s.kt)("p",null,"Open Resource Discovery itself can be understood as a ",(0,s.kt)("strong",{parentName:"p"},"core specification")," that allows to be extended through specification extensions."),(0,s.kt)("p",null,"Those specification extensions that have been centrally aligned can be hosted on the ORD Specification page itself, with their own version lifecycle."),(0,s.kt)("p",null,"Most notably, you'll find:"),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("a",{parentName:"li",href:"/spec-extensions/access-strategies/"},"Registered ",(0,s.kt)("strong",{parentName:"a"},"Access Strategies"))," that standardize how ORD information can be accessed by the ORD Aggregators."),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("a",{parentName:"li",href:"/spec-extensions/access-strategies/"},"Registered ",(0,s.kt)("strong",{parentName:"a"},"Policy Levels"))," that standardize (ideally verifiable) rules how ORD should be implemented by ORD Providers.")),(0,s.kt)("p",null,"Specification Extensions have registered ",(0,s.kt)("a",{parentName:"p",href:"/spec-v1/#specification-id"},"Specification IDs"),"."))}m.isMDXComponent=!0}}]);