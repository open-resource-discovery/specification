"use strict";(self.webpackChunk_open_resource_discovery_specification=self.webpackChunk_open_resource_discovery_specification||[]).push([["188"],{5871(t,e,a){function r(t,e){t.accDescr&&e.setAccDescription?.(t.accDescr),t.accTitle&&e.setAccTitle?.(t.accTitle),t.title&&e.setDiagramTitle?.(t.title)}a.d(e,{S:()=>r}),(0,a(797).K2)(r,"populateCommonDb")},6567(t,e,a){a.d(e,{diagram:()=>g});var r=a(3590),i=a(5871),o=a(3226),l=a(8365),s=a(797),c=a(8731),n=l.UI.packet,d=class{constructor(){this.packet=[],this.setAccTitle=l.SV,this.getAccTitle=l.iN,this.setDiagramTitle=l.ke,this.getDiagramTitle=l.ab,this.getAccDescription=l.m7,this.setAccDescription=l.EI}static{(0,s.K2)(this,"PacketDB")}getConfig(){let t=(0,o.$t)({...n,...(0,l.zj)().packet});return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){(0,l.IU)(),this.packet=[]}},p=(0,s.K2)((t,e)=>{(0,i.S)(t,e);let a=-1,r=[],o=1,{bitsPerRow:l}=e.getConfig();for(let{start:i,end:c,bits:n,label:d}of t.blocks){if(void 0!==i&&void 0!==c&&c<i)throw Error(`Packet block ${i} - ${c} is invalid. End must be greater than start.`);if((i??=a+1)!==a+1)throw Error(`Packet block ${i} - ${c??i} is not contiguous. It should start from ${a+1}.`);if(0===n)throw Error(`Packet block ${i} is invalid. Cannot have a zero bit field.`);for(c??=i+(n??1)-1,n??=c-i+1,a=c,s.Rm.debug(`Packet block ${i} - ${a} with label ${d}`);r.length<=l+1&&e.getPacket().length<1e4;){let[t,a]=k({start:i,end:c,bits:n,label:d},o,l);if(r.push(t),t.end+1===o*l&&(e.pushWord(r),r=[],o++),!a)break;({start:i,end:c,bits:n,label:d}=a)}}e.pushWord(r)},"populate"),k=(0,s.K2)((t,e,a)=>{if(void 0===t.start)throw Error("start should have been set during first phase");if(void 0===t.end)throw Error("end should have been set during first phase");if(t.start>t.end)throw Error(`Block start ${t.start} is greater than block end ${t.end}.`);if(t.end+1<=e*a)return[t,void 0];let r=e*a-1,i=e*a;return[{start:t.start,end:r,label:t.label,bits:r-t.start},{start:i,end:t.end,label:t.label,bits:t.end-i}]},"getNextFittingBlock"),h={parser:{yy:void 0},parse:(0,s.K2)(async t=>{let e=await (0,c.qg)("packet",t),a=h.parser?.yy;if(!(a instanceof d))throw Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");s.Rm.debug(e),p(e,a)},"parse")},b=(0,s.K2)((t,e,a,i)=>{let o=i.db,s=o.getConfig(),{rowHeight:c,paddingY:n,bitWidth:d,bitsPerRow:p}=s,k=o.getPacket(),h=o.getDiagramTitle(),b=c+n,u=b*(k.length+1)-(h?0:c),g=d*p+2,m=(0,r.D)(e);for(let[t,e]of(m.attr("viewbox",`0 0 ${g} ${u}`),(0,l.a$)(m,u,g,s.useMaxWidth),k.entries()))f(m,e,t,s);m.append("text").text(h).attr("x",g/2).attr("y",u-b/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),f=(0,s.K2)((t,e,a,{rowHeight:r,paddingX:i,paddingY:o,bitWidth:l,bitsPerRow:s,showBits:c})=>{let n=t.append("g"),d=a*(r+o)+o;for(let t of e){let e=t.start%s*l+1,a=(t.end-t.start+1)*l-i;if(n.append("rect").attr("x",e).attr("y",d).attr("width",a).attr("height",r).attr("class","packetBlock"),n.append("text").attr("x",e+a/2).attr("y",d+r/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(t.label),!c)continue;let o=t.end===t.start,p=d-2;n.append("text").attr("x",e+(o?a/2:0)).attr("y",p).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",o?"middle":"start").text(t.start),o||n.append("text").attr("x",e+a).attr("y",p).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(t.end)}},"drawWord"),u={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},g={parser:h,get db(){return new d},renderer:{draw:b},styles:(0,s.K2)(({packet:t}={})=>{let e=(0,o.$t)(u,t);return`
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