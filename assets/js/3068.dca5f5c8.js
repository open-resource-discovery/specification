"use strict";(self.webpackChunk_open_resource_discovery_specification=self.webpackChunk_open_resource_discovery_specification||[]).push([[3068],{687:(e,t,s)=>{s.d(t,{diagram:()=>R});var o=s(1245),i=s(697),r=s(6312),a=s(9702),n=s(2983);s(4353),s(6750),s(2838),s(1176),s(4075);const d="rect",c="rectWithTitle",l="statediagram",p=`${l}-state`,b="transition",g=`${b} note-edge`,h=`${l}-note`,u=`${l}-cluster`,y=`${l}-cluster-alt`,f="parent",w="note",x="----",$=`${x}${w}`,m=`${x}${f}`,T="fill:none",v="fill: #333",S="text",k="normal";let D={},A=0;function B(e="",t=0,s="",o=x){return`state-${e}${null!==s&&s.length>0?`${o}${s}`:""}-${t}`}const _=(e,t,s,i,r,n)=>{const l=s.id,b=null==(x=i[l])?"":x.classes?x.classes.join(" "):"";var x;if("root"!==l){let t=d;!0===s.start&&(t="start"),!1===s.start&&(t="end"),s.type!==o.D&&(t=s.type),D[l]||(D[l]={id:l,shape:t,description:a.e.sanitizeText(l,(0,a.c)()),classes:`${b} ${p}`});const i=D[l];s.description&&(Array.isArray(i.description)?(i.shape=c,i.description.push(s.description)):i.description.length>0?(i.shape=c,i.description===l?i.description=[s.description]:i.description=[i.description,s.description]):(i.shape=d,i.description=s.description),i.description=a.e.sanitizeTextOrArray(i.description,(0,a.c)())),1===i.description.length&&i.shape===c&&(i.shape=d),!i.type&&s.doc&&(a.l.info("Setting cluster for ",l,C(s)),i.type="group",i.dir=C(s),i.shape=s.type===o.a?"divider":"roundedWithTitle",i.classes=i.classes+" "+u+" "+(n?y:""));const r={labelStyle:"",shape:i.shape,labelText:i.description,classes:i.classes,style:"",id:l,dir:i.dir,domId:B(l,A),type:i.type,padding:15,centerLabel:!0};if(s.note){const t={labelStyle:"",shape:"note",labelText:s.note.text,classes:h,style:"",id:l+$+"-"+A,domId:B(l,A,w),type:i.type,padding:15},o={labelStyle:"",shape:"noteGroup",labelText:s.note.text,classes:i.classes,style:"",id:l+m,domId:B(l,A,f),type:"group",padding:0};A++;const a=l+m;e.setNode(a,o),e.setNode(t.id,t),e.setNode(l,r),e.setParent(l,a),e.setParent(t.id,a);let n=l,d=t.id;"left of"===s.note.position&&(n=t.id,d=l),e.setEdge(n,d,{arrowhead:"none",arrowType:"",style:T,labelStyle:"",classes:g,arrowheadStyle:v,labelpos:"c",labelType:S,thickness:k})}else e.setNode(l,r)}t&&"root"!==t.id&&(a.l.trace("Setting node ",l," to be child of its parent ",t.id),e.setParent(l,t.id)),s.doc&&(a.l.trace("Adding nodes children "),L(e,s,s.doc,i,r,!n))},L=(e,t,s,i,r,n)=>{a.l.trace("items",s),s.forEach((s=>{switch(s.stmt){case o.b:case o.D:_(e,t,s,i,r,n);break;case o.S:{_(e,t,s.state1,i,r,n),_(e,t,s.state2,i,r,n);const o={id:"edge"+A,arrowhead:"normal",arrowTypeEnd:"arrow_barb",style:T,labelStyle:"",label:a.e.sanitizeText(s.description,(0,a.c)()),arrowheadStyle:v,labelpos:"c",labelType:S,thickness:k,classes:b};e.setEdge(s.state1.id,s.state2.id,o,A),A++}}}))},C=(e,t=o.c)=>{let s=t;if(e.doc)for(let o=0;o<e.doc.length;o++){const t=e.doc[o];"dir"===t.stmt&&(s=t.value)}return s},E={setConf:function(e){const t=Object.keys(e);for(const s of t)e[s]},getClasses:function(e,t){return t.db.extract(t.db.getRootDocV2()),t.db.getClasses()},draw:async function(e,t,s,o){a.l.info("Drawing state diagram (v2)",t),D={},o.db.getDirection();const{securityLevel:c,state:p}=(0,a.c)(),b=p.nodeSpacing||50,g=p.rankSpacing||50;a.l.info(o.db.getRootDocV2()),o.db.extract(o.db.getRootDocV2()),a.l.info(o.db.getRootDocV2());const h=o.db.getStates(),u=new i.T({multigraph:!0,compound:!0}).setGraph({rankdir:C(o.db.getRootDocV2()),nodesep:b,ranksep:g,marginx:8,marginy:8}).setDefaultEdgeLabel((function(){return{}}));let y;_(u,void 0,o.db.getRootDocV2(),h,o.db,!0),"sandbox"===c&&(y=(0,r.Ltv)("#i"+t));const f="sandbox"===c?(0,r.Ltv)(y.nodes()[0].contentDocument.body):(0,r.Ltv)("body"),w=f.select(`[id="${t}"]`),x=f.select("#"+t+" g");await(0,n.r)(x,u,["barb"],l,t);a.u.insertTitle(w,"statediagramTitleText",p.titleTopMargin,o.db.getDiagramTitle());const $=w.node().getBBox(),m=$.width+16,T=$.height+16;w.attr("class",l);const v=w.node().getBBox();(0,a.i)(w,T,m,p.useMaxWidth);const S=`${v.x-8} ${v.y-8} ${m} ${T}`;a.l.debug(`viewBox ${S}`),w.attr("viewBox",S);const k=document.querySelectorAll('[id="'+t+'"] .edgeLabel .label');for(const i of k){const e=i.getBBox(),t=document.createElementNS("http://www.w3.org/2000/svg",d);t.setAttribute("rx",0),t.setAttribute("ry",0),t.setAttribute("width",e.width),t.setAttribute("height",e.height),i.insertBefore(t,i.firstChild)}}},R={parser:o.p,db:o.d,renderer:E,styles:o.s,init:e=>{e.state||(e.state={}),e.state.arrowMarkerAbsolute=e.arrowMarkerAbsolute,o.d.clear()}}}}]);