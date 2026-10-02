"use strict";(self.webpackChunk_open_resource_discovery_specification=self.webpackChunk_open_resource_discovery_specification||[]).push([["5732"],{7454(t,e,a){function r(t,e){t.accDescr&&e.setAccDescription?.(t.accDescr),t.accTitle&&e.setAccTitle?.(t.accTitle),t.title&&e.setDiagramTitle?.(t.title)}a.d(e,{S:()=>r}),(0,a(6827).K)(r,"populateCommonDb")},2463(t,e,a){a.d(e,{diagram:()=>y});var r=a(7454),i=a(5319),o=a(4877),l=a(2383),s=a(1293),c=a(6827),n=a(8731),d=l.UI.packet,p=class{constructor(){this.packet=[],this.setAccTitle=l.SV,this.getAccTitle=l.iN,this.setDiagramTitle=l.ke,this.getDiagramTitle=l.ab,this.getAccDescription=l.m7,this.setAccDescription=l.EI}static{(0,c.K)(this,"PacketDB")}getConfig(){let t=(0,o.$t)({...d,...(0,l.zj)().packet});return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){(0,l.IU)(),this.packet=[]}},k=(0,c.K)((t,e)=>{(0,r.S)(t,e);let a=-1,i=[],o=1,{bitsPerRow:l}=e.getConfig();for(let{start:r,end:c,bits:n,label:d}of t.blocks){if(void 0!==r&&void 0!==c&&c<r)throw Error(`Packet block ${r} - ${c} is invalid. End must be greater than start.`);if((r??=a+1)!==a+1)throw Error(`Packet block ${r} - ${c??r} is not contiguous. It should start from ${a+1}.`);if(0===n)throw Error(`Packet block ${r} is invalid. Cannot have a zero bit field.`);for(c??=r+(n??1)-1,n??=c-r+1,a=c,s.R.debug(`Packet block ${r} - ${a} with label ${d}`);i.length<=l+1&&e.getPacket().length<1e4;){let[t,a]=h({start:r,end:c,bits:n,label:d},o,l);if(i.push(t),t.end+1===o*l&&(e.pushWord(i),i=[],o++),!a)break;({start:r,end:c,bits:n,label:d}=a)}}e.pushWord(i)},"populate"),h=(0,c.K)((t,e,a)=>{if(void 0===t.start)throw Error("start should have been set during first phase");if(void 0===t.end)throw Error("end should have been set during first phase");if(t.start>t.end)throw Error(`Block start ${t.start} is greater than block end ${t.end}.`);if(t.end+1<=e*a)return[t,void 0];let r=e*a-1,i=e*a;return[{start:t.start,end:r,label:t.label,bits:r-t.start},{start:i,end:t.end,label:t.label,bits:t.end-i}]},"getNextFittingBlock"),b={parser:{yy:void 0},parse:(0,c.K)(async t=>{let e=await (0,n.qg)("packet",t),a=b.parser?.yy;if(!(a instanceof p))throw Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");s.R.debug(e),k(e,a)},"parse")},f=(0,c.K)((t,e,a,r)=>{let o=r.db,s=o.getConfig(),{rowHeight:c,paddingY:n,bitWidth:d,bitsPerRow:p}=s,k=o.getPacket(),h=o.getDiagramTitle(),b=c+n,f=b*(k.length+1)-(h?0:c),g=d*p+2,y=(0,i.D)(e);for(let[t,e]of(y.attr("viewBox",`0 0 ${g} ${f}`),(0,l.a$)(y,f,g,s.useMaxWidth),k.entries()))u(y,e,t,s);y.append("text").text(h).attr("x",g/2).attr("y",f-b/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),u=(0,c.K)((t,e,a,{rowHeight:r,paddingX:i,paddingY:o,bitWidth:l,bitsPerRow:s,showBits:c,bitOrder:n})=>{let d=t.append("g"),p=a*(r+o)+o,k="descending"===n;for(let t of e){let e=t.end-t.start+1,a=t.start%s,o=(k?s-a-e:a)*l+1,n=e*l-i;if(d.append("rect").attr("x",o).attr("y",p).attr("width",n).attr("height",r).attr("class","packetBlock"),d.append("text").attr("x",o+n/2).attr("y",p+r/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(t.label),!c)continue;let[h,b]=k?[t.end,t.start]:[t.start,t.end],f=1===e,u=p-2;d.append("text").attr("x",o+(f?n/2:0)).attr("y",u).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",f?"middle":"start").text(h),f||d.append("text").attr("x",o+n).attr("y",u).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(b)}},"drawWord"),g={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},y={parser:b,get db(){return new p},renderer:{draw:f},styles:(0,c.K)(({packet:t}={})=>{let e=(0,o.$t)(g,t);return`
	.packetByte {
		font-size: ${e.byteFontSize};
	}
	.packetByte.start {
		fill: ${e.startByteColor};
	}
	.packetByte.end {
		fill: ${e.endByteColor};
	}
	.packetLabel {
		fill: ${e.labelColor};
		font-size: ${e.labelFontSize};
	}
	.packetTitle {
		fill: ${e.titleColor};
		font-size: ${e.titleFontSize};
	}
	.packetBlock {
		stroke: ${e.blockStrokeColor};
		stroke-width: ${e.blockStrokeWidth};
		fill: ${e.blockFillColor};
	}
	`},"styles")}}}]);