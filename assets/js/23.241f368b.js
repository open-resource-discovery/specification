"use strict";(self.webpackChunk_open_resource_discovery_specification=self.webpackChunk_open_resource_discovery_specification||[]).push([["23"],{7454(e,t,a){function i(e,t){e.accDescr&&t.setAccDescription?.(e.accDescr),e.accTitle&&t.setAccTitle?.(e.accTitle),e.title&&t.setDiagramTitle?.(e.title)}a.d(t,{S:()=>i}),(0,a(6827).K)(i,"populateCommonDb")},1082(e,t,a){a.d(t,{diagram:()=>k});var i=a(7454),l=a(7851),r=a(2595),n=a(6149),s=a(1293),o=a(6827),c=a(8731),p=a(7829),d=n.UI.pie,h={sections:new Map,showData:!1,config:d},g=h.sections,u=h.showData,f=structuredClone(d),m=(0,o.K)(()=>structuredClone(f),"getConfig"),$=(0,o.K)(()=>{g=new Map,u=h.showData,(0,n.IU)()},"clear"),x=(0,o.K)(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);g.has(e)||(g.set(e,t),s.R.debug(`added new section: ${e}, with value: ${t}`))},"addSection"),w=(0,o.K)(()=>g,"getSections"),S=(0,o.K)(e=>{u=e},"setShowData"),y=(0,o.K)(()=>u,"getShowData"),b={getConfig:m,clear:$,setDiagramTitle:n.ke,getDiagramTitle:n.ab,setAccTitle:n.SV,getAccTitle:n.iN,setAccDescription:n.EI,getAccDescription:n.m7,addSection:x,getSections:w,setShowData:S,getShowData:y},v=(0,o.K)((e,t)=>{(0,i.S)(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},"populateDb"),C={parse:(0,o.K)(async e=>{let t=await (0,c.qg)("pie",e);s.R.debug(t),v(t,b)},"parse")},D=(0,o.K)(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),T=(0,o.K)(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),a=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return(0,p.rLf)().value(e=>e.value).sort(null)(a)},"createPieArcs"),k={parser:C,db:b,renderer:{draw:(0,o.K)((e,t,a,i)=>{s.R.debug("rendering pie chart\n"+e);let o=i.db,c=(0,n.D7)(),d=(0,r.$t)(o.getConfig(),c.pie),h=(0,l.D)(t),g=h.append("g");g.attr("transform","translate(225,225)");let{themeVariables:u}=c,[f]=(0,r.I5)(u.pieOuterStrokeWidth);f??=2;let m=d.legendPosition,$=d.textPosition,x=d.donutHole>0&&d.donutHole<=.9?d.donutHole:0,w=(0,p.JLW)().innerRadius(185*x).outerRadius(185),S=(0,p.JLW)().innerRadius(185*$).outerRadius(185*$),y=g.append("g");y.append("circle").attr("cx",0).attr("cy",0).attr("r",185+f/2).attr("class","pieOuterCircle");let b=o.getSections(),v=T(b),C=[u.pie1,u.pie2,u.pie3,u.pie4,u.pie5,u.pie6,u.pie7,u.pie8,u.pie9,u.pie10,u.pie11,u.pie12],D=0;b.forEach(e=>{D+=e});let k=v.filter(e=>"0"!==(e.data.value/D*100).toFixed(0)),A=(0,p.UMr)(C).domain([...b.keys()]);y.selectAll("mySlices").data(k).enter().append("path").attr("d",w).attr("fill",e=>A(e.data.label)).attr("class",e=>{let t="pieCircle";return"hover"===d.highlightSlice?t+=" highlightedOnHover":d.highlightSlice===e.data.label&&(t+=" highlighted"),t}),y.selectAll("mySlices").data(k).enter().append("text").text(e=>(e.data.value/D*100).toFixed(0)+"%").attr("transform",e=>"translate("+S.centroid(e)+")").style("text-anchor","middle").attr("class","slice");let K=g.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-200).attr("class","pieTitleText"),R=[...b.entries()].map(([e,t])=>({label:e,value:t})),O=g.selectAll(".legend").data(R).enter().append("g").attr("class","legend");O.append("rect").attr("width",18).attr("height",18).style("fill",e=>A(e.label)).style("stroke",e=>A(e.label)),O.append("text").attr("x",22).attr("y",14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let _=Math.max(...O.selectAll("text").nodes().map(e=>e?.getBoundingClientRect().width??0)),M=450,z=490,W=22*R.length;switch(m){case"center":O.attr("transform",(e,t)=>"translate("+(-_/2-22)+","+(22*t-22*R.length/2)+")");break;case"top":M+=W,O.attr("transform",(e,t)=>`translate(${-_/2-22}, ${22*t-185})`),y.attr("transform",()=>`translate(0, ${W+22})`);break;case"bottom":M+=W,O.attr("transform",(e,t)=>"translate("+(-_/2-22)+","+(22*t- -207)+")");break;case"left":z+=22+_,O.attr("transform",(e,t)=>"translate(-207,"+(22*t-22*R.length/2)+")"),y.attr("transform",()=>`translate(${_+18+4}, 0)`);break;default:z+=22+_,O.attr("transform",(e,t)=>"translate(216,"+(22*t-22*R.length/2)+")")}let F=K.node()?.getBoundingClientRect().width??0,H=Math.min(0,225-F/2),L=Math.max(z,225+F/2)-H;h.attr("viewBox",`${H} 0 ${L} ${M}`),(0,n.a$)(h,M,L,d.useMaxWidth)},"draw")},styles:D}}}]);