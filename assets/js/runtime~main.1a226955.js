(()=>{"use strict";var e,a,f,c,r,t={},d={};function b(e){var a=d[e];if(void 0!==a)return a.exports;var f=d[e]={id:e,loaded:!1,exports:{}};return t[e].call(f.exports,f,f.exports,b),f.loaded=!0,f.exports}b.m=t,b.c=d,e=[],b.O=(a,f,c,r)=>{if(!f){var t=1/0;for(i=0;i<e.length;i++){for(var[f,c,r]=e[i],d=!0,o=0;o<f.length;o++)(!1&r||t>=r)&&Object.keys(b.O).every((e=>b.O[e](f[o])))?f.splice(o--,1):(d=!1,r<t&&(t=r));if(d){e.splice(i--,1);var n=c();void 0!==n&&(a=n)}}return a}r=r||0;for(var i=e.length;i>0&&e[i-1][2]>r;i--)e[i]=e[i-1];e[i]=[f,c,r]},b.n=e=>{var a=e&&e.__esModule?()=>e.default:()=>e;return b.d(a,{a:a}),a},f=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,b.t=function(e,c){if(1&c&&(e=this(e)),8&c)return e;if("object"==typeof e&&e){if(4&c&&e.__esModule)return e;if(16&c&&"function"==typeof e.then)return e}var r=Object.create(null);b.r(r);var t={};a=a||[null,f({}),f([]),f(f)];for(var d=2&c&&e;"object"==typeof d&&!~a.indexOf(d);d=f(d))Object.getOwnPropertyNames(d).forEach((a=>t[a]=()=>e[a]));return t.default=()=>e,b.d(r,t),r},b.d=(e,a)=>{for(var f in a)b.o(a,f)&&!b.o(e,f)&&Object.defineProperty(e,f,{enumerable:!0,get:a[f]})},b.f={},b.e=e=>Promise.all(Object.keys(b.f).reduce(((a,f)=>(b.f[f](e,a),a)),[])),b.u=e=>"assets/js/"+({66:"972d9d57",272:"49739adf",657:"df60d5ad",1039:"b9324a1b",1144:"8a0a4a95",1569:"7d62b6ad",1719:"571b7163",2138:"1a4e3797",2344:"5de725a4",2543:"3d7d78e6",2801:"84eda13f",2977:"59752f04",3361:"c377a04b",3488:"56b1f36f",3919:"0ca0789f",4256:"a9a33a67",4357:"9329c2f4",4671:"6b96b968",4764:"3941bebc",4921:"138e0e15",5208:"f6c016ba",5397:"651bc23f",5403:"19dee439",5515:"4d94f526",5549:"b46dbca8",5742:"aba21aa0",5878:"c7f444ab",6072:"58ca6d1a",6390:"3ee22aad",6454:"9c56a465",6907:"cbd32073",7026:"53c8afc8",7098:"a7bd4aaa",7237:"78f7cf16",7342:"48dec6f1",7448:"91aed54b",7510:"4df77889",7739:"794998a9",8137:"bba3f0ec",8401:"17896441",8417:"e333832a",8631:"fe0242b1",8632:"0bd79b54",9048:"a94703ab",9647:"5e95c892",9851:"838e818c"}[e]||e)+"."+{66:"44eb8319",272:"cd547ab3",489:"4fb7605b",657:"a2f8222c",1039:"35f78209",1144:"0ce8974f",1169:"de33baf1",1176:"6842f194",1245:"827aa828",1303:"e2f50517",1331:"76eb6dfb",1398:"8e129115",1569:"5de9b4a6",1719:"a88d515d",1946:"2e70da2f",2130:"fc74f43e",2138:"6ebc22dc",2344:"ce3d0309",2376:"1097e67e",2453:"5fc28aac",2543:"98ed8730",2548:"26a3b9e2",2801:"723cbacc",2843:"066bcc8e",2925:"115ffe7f",2977:"5b3ee2b7",2983:"25de3896",3042:"3d5e3b64",3068:"dca5f5c8",3361:"143efaec",3488:"a79d4c83",3626:"f1c84937",3706:"70105c6b",3919:"fa3e5d39",4162:"e14ee268",4256:"094d9d8d",4357:"bc66d570",4671:"ab1db5e3",4741:"8f95a11c",4764:"7c1c7c41",4921:"53d67fdb",4943:"7efa463c",5208:"f0eee11e",5397:"15528ff5",5403:"68bf9da5",5515:"c505f464",5549:"f303b5d7",5741:"18b10f2a",5742:"06b92472",5878:"11bf2754",6072:"c4a89711",6390:"0c8267be",6420:"64a3cc60",6454:"dbea5c85",6788:"f1430b8f",6803:"a708ef16",6907:"3f7b9900",7026:"1a2842bf",7098:"15063f30",7237:"c80467b1",7342:"06c3b827",7426:"63426b2f",7448:"79c52144",7510:"fbe90f28",7542:"e826fe72",7739:"2388e2bf",8055:"195cb1b7",8137:"2573061e",8337:"7a9ad211",8401:"bb7949a7",8417:"54e97f18",8478:"4b15a154",8631:"987c8eff",8632:"095aa17f",8635:"e60dee91",8810:"5758e04e",8869:"b6ea3b19",9048:"faf89349",9647:"516ac697",9689:"fe80849f",9851:"0ea64a34"}[e]+".js",b.miniCssF=e=>{},b.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),b.o=(e,a)=>Object.prototype.hasOwnProperty.call(e,a),c={},r="@open-resource-discovery/specification:",b.l=(e,a,f,t)=>{if(c[e])c[e].push(a);else{var d,o;if(void 0!==f)for(var n=document.getElementsByTagName("script"),i=0;i<n.length;i++){var u=n[i];if(u.getAttribute("src")==e||u.getAttribute("data-webpack")==r+f){d=u;break}}d||(o=!0,(d=document.createElement("script")).charset="utf-8",d.timeout=120,b.nc&&d.setAttribute("nonce",b.nc),d.setAttribute("data-webpack",r+f),d.src=e),c[e]=[a];var s=(a,f)=>{d.onerror=d.onload=null,clearTimeout(l);var r=c[e];if(delete c[e],d.parentNode&&d.parentNode.removeChild(d),r&&r.forEach((e=>e(f))),a)return a(f)},l=setTimeout(s.bind(null,void 0,{type:"timeout",target:d}),12e4);d.onerror=s.bind(null,d.onerror),d.onload=s.bind(null,d.onload),o&&document.head.appendChild(d)}},b.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},b.p="/specification/",b.gca=function(e){return e={17896441:"8401","972d9d57":"66","49739adf":"272",df60d5ad:"657",b9324a1b:"1039","8a0a4a95":"1144","7d62b6ad":"1569","571b7163":"1719","1a4e3797":"2138","5de725a4":"2344","3d7d78e6":"2543","84eda13f":"2801","59752f04":"2977",c377a04b:"3361","56b1f36f":"3488","0ca0789f":"3919",a9a33a67:"4256","9329c2f4":"4357","6b96b968":"4671","3941bebc":"4764","138e0e15":"4921",f6c016ba:"5208","651bc23f":"5397","19dee439":"5403","4d94f526":"5515",b46dbca8:"5549",aba21aa0:"5742",c7f444ab:"5878","58ca6d1a":"6072","3ee22aad":"6390","9c56a465":"6454",cbd32073:"6907","53c8afc8":"7026",a7bd4aaa:"7098","78f7cf16":"7237","48dec6f1":"7342","91aed54b":"7448","4df77889":"7510","794998a9":"7739",bba3f0ec:"8137",e333832a:"8417",fe0242b1:"8631","0bd79b54":"8632",a94703ab:"9048","5e95c892":"9647","838e818c":"9851"}[e]||e,b.p+b.u(e)},(()=>{b.b=document.baseURI||self.location.href;var e={5354:0,1869:0};b.f.j=(a,f)=>{var c=b.o(e,a)?e[a]:void 0;if(0!==c)if(c)f.push(c[2]);else if(/^(1869|5354)$/.test(a))e[a]=0;else{var r=new Promise(((f,r)=>c=e[a]=[f,r]));f.push(c[2]=r);var t=b.p+b.u(a),d=new Error;b.l(t,(f=>{if(b.o(e,a)&&(0!==(c=e[a])&&(e[a]=void 0),c)){var r=f&&("load"===f.type?"missing":f.type),t=f&&f.target&&f.target.src;d.message="Loading chunk "+a+" failed.\n("+r+": "+t+")",d.name="ChunkLoadError",d.type=r,d.request=t,c[1](d)}}),"chunk-"+a,a)}},b.O.j=a=>0===e[a];var a=(a,f)=>{var c,r,[t,d,o]=f,n=0;if(t.some((a=>0!==e[a]))){for(c in d)b.o(d,c)&&(b.m[c]=d[c]);if(o)var i=o(b)}for(a&&a(f);n<t.length;n++)r=t[n],b.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return b.O(i)},f=self.webpackChunk_open_resource_discovery_specification=self.webpackChunk_open_resource_discovery_specification||[];f.forEach(a.bind(null,0)),f.push=a.bind(null,f.push.bind(f))})()})();