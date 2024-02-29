"use strict";(self.webpackChunk_sap_open_resource_discovery=self.webpackChunk_sap_open_resource_discovery||[]).push([[138],{1035:(e,r,t)=>{t.r(r),t.d(r,{default:()=>N});var n=t(3845),a=t(675),s=t(467),c=t(6540),l=t(4586),u=t(5476),o=t(5260),i=t(8774),h=t(1312),m=["zero","one","two","few","many","other"];function d(e){return m.filter((function(r){return e.includes(r)}))}var p={locale:"en",pluralForms:d(["one","other"]),select:function(e){return 1===e?"one":"other"}};function f(){var e=(0,l.A)().i18n.currentLocale;return(0,c.useMemo)((function(){try{return r=e,t=new Intl.PluralRules(r),{locale:r,pluralForms:d(t.resolvedOptions().pluralCategories),select:function(e){return t.select(e)}}}catch(n){return console.error('Failed to use Intl.PluralRules for locale "'+e+'".\nDocusaurus will fallback to the default (English) implementation.\nError: '+n.message+"\n"),p}var r,t}),[e])}function g(){var e=f();return{selectMessage:function(r,t){return function(e,r,t){var n=e.split("|");if(1===n.length)return n[0];n.length>t.pluralForms.length&&console.error("For locale="+t.locale+", a maximum of "+t.pluralForms.length+" plural forms are expected ("+t.pluralForms.join(",")+"), but the message contains "+n.length+": "+e);var a=t.select(r),s=t.pluralForms.indexOf(a);return n[Math.min(s,n.length-1)]}(t,r,e)}}}var x=t(5391),y=t(6347),v=t(2303),C=t(1088);const S=function(){var e=(0,v.A)(),r=(0,y.W6)(),t=(0,y.zy)(),n=(0,l.A)().siteConfig.baseUrl,a=e?new URLSearchParams(t.search):null,s=(null==a?void 0:a.get("q"))||"",c=(null==a?void 0:a.get("ctx"))||"",u=(null==a?void 0:a.get("version"))||"",o=function(e){var r=new URLSearchParams(t.search);return e?r.set("q",e):r.delete("q"),r};return{searchValue:s,searchContext:c&&Array.isArray(C.Hg)&&C.Hg.some((function(e){return"string"==typeof e?e===c:e.path===c}))?c:"",searchVersion:u,updateSearchPath:function(e){var t=o(e);r.replace({search:t.toString()})},updateSearchContext:function(e){var n=new URLSearchParams(t.search);n.set("ctx",e),r.replace({search:n.toString()})},generateSearchPageLink:function(e){var r=o(e);return n+"search?"+r.toString()}}};var j=t(5891),A=t(2384),w=t(6841),I=t(3810),_=t(7674),R=t(2849),P=t(4471);const b={searchContextInput:"searchContextInput_mXoe",searchQueryInput:"searchQueryInput_CFBF",searchResultItem:"searchResultItem_U687",searchResultItemPath:"searchResultItemPath_uIbk",searchResultItemSummary:"searchResultItemSummary_oZHr",searchQueryColumn:"searchQueryColumn_q7nx",searchContextColumn:"searchContextColumn_oWAF"};var F=t(3385),T=t(4848);function k(){var e,r=(0,l.A)(),t=r.siteConfig.baseUrl,n=r.i18n.currentLocale,u=g().selectMessage,i=S(),m=i.searchValue,d=i.searchContext,p=i.searchVersion,f=i.updateSearchPath,y=i.updateSearchContext,v=(0,c.useState)(m),w=v[0],I=v[1],_=(0,c.useState)(),P=_[0],k=_[1],N=(0,c.useState)(),q=N[0],L=N[1],U=""+t+p,z=(0,c.useMemo)((function(){return w?(0,h.T)({id:"theme.SearchPage.existingResultsTitle",message:'Search results for "{query}"',description:"The search page title for non-empty query"},{query:w}):(0,h.T)({id:"theme.SearchPage.emptyResultsTitle",message:"Search the documentation",description:"The search page title for empty query"})}),[w]);(0,c.useEffect)((function(){f(w),P&&(w?P(w,(function(e){L(e)})):L(void 0))}),[w,P]);var M=(0,c.useCallback)((function(e){I(e.target.value)}),[]);return(0,c.useEffect)((function(){m&&m!==w&&I(m)}),[m]),(0,c.useEffect)((function(){function e(){return(e=(0,s.A)((0,a.A)().mark((function e(){var r,t,n;return(0,a.A)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(Array.isArray(C.Hg)&&!d&&!C.dz){e.next=6;break}return e.next=3,(0,j.Z)(U,d);case 3:e.t0=e.sent,e.next=7;break;case 6:e.t0={wrappedIndexes:[],zhDictionary:[]};case 7:r=e.t0,t=r.wrappedIndexes,n=r.zhDictionary,k((function(){return(0,A.m)(t,n,100)}));case 11:case"end":return e.stop()}}),e)})))).apply(this,arguments)}!function(){e.apply(this,arguments)}()}),[d,U]),(0,T.jsxs)(c.Fragment,{children:[(0,T.jsxs)(o.A,{children:[(0,T.jsx)("meta",{property:"robots",content:"noindex, follow"}),(0,T.jsx)("title",{children:z})]}),(0,T.jsxs)("div",{className:"container margin-vert--lg",children:[(0,T.jsx)("h1",{children:z}),(0,T.jsxs)("div",{className:"row",children:[(0,T.jsx)("div",{className:(0,x.A)("col",(e={},e[b.searchQueryColumn]=Array.isArray(C.Hg),e["col--9"]=Array.isArray(C.Hg),e["col--12"]=!Array.isArray(C.Hg),e)),children:(0,T.jsx)("input",{type:"search",name:"q",className:b.searchQueryInput,"aria-label":"Search",onChange:M,value:w,autoComplete:"off",autoFocus:!0})}),Array.isArray(C.Hg)?(0,T.jsx)("div",{className:(0,x.A)("col","col--3","padding-left--none",b.searchContextColumn),children:(0,T.jsxs)("select",{name:"search-context",className:b.searchContextInput,id:"context-selector",value:d,onChange:function(e){return y(e.target.value)},children:[C.dz&&(0,T.jsx)("option",{value:"",children:(0,h.T)({id:"theme.SearchPage.searchContext.everywhere",message:"everywhere"})}),C.Hg.map((function(e){var r=(0,F.p)(e,n),t=r.label,a=r.path;return(0,T.jsx)("option",{value:a,children:t},a)}))]})}):null]}),!P&&w&&(0,T.jsx)("div",{children:(0,T.jsx)(R.A,{})}),q&&(q.length>0?(0,T.jsx)("p",{children:u(q.length,(0,h.T)({id:"theme.SearchPage.documentsFound.plurals",message:"1 document found|{count} documents found",description:'Pluralized label for "{count} documents found". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)'},{count:q.length}))}):(0,T.jsx)("p",{children:(0,h.T)({id:"theme.SearchPage.noResultsText",message:"No documents were found",description:"The paragraph for empty search result"})})),(0,T.jsx)("section",{children:q&&q.map((function(e){return(0,T.jsx)(H,{searchResult:e},e.document.i)}))})]})]})}function H(e){var r=e.searchResult,t=r.document,a=r.type,s=r.page,c=r.tokens,l=r.metadata,u=0===a,o=2===a,h=(u?t.b:s.b).slice(),m=o?t.s:t.t;u||h.push(s.t);var d="";if(C.CU&&c.length>0){for(var p,f=new URLSearchParams,g=(0,n.A)(c);!(p=g()).done;){var x=p.value;f.append("_highlight",x)}d="?"+f.toString()}return(0,T.jsxs)("article",{className:b.searchResultItem,children:[(0,T.jsx)("h2",{children:(0,T.jsx)(i.A,{to:t.u+d+(t.h||""),dangerouslySetInnerHTML:{__html:o?(0,w.Z)(m,c):(0,I.C)(m,(0,_.g)(l,"t"),c,100)}})}),h.length>0&&(0,T.jsx)("p",{className:b.searchResultItemPath,children:(0,P.$)(h)}),o&&(0,T.jsx)("p",{className:b.searchResultItemSummary,dangerouslySetInnerHTML:{__html:(0,I.C)(t.t,(0,_.g)(l,"t"),c,100)}})]})}const N=function(){return(0,T.jsx)(u.A,{children:(0,T.jsx)(k,{})})}}}]);