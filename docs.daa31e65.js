let e;let t={arrowSize:10,crossSize:12,thickArrowSize:30,labelOffset:10,corruptStart:.85,dropStart:.85,squiggleSize:20,squiggleCount:2,messageSpacingY:40,participantSpacingX:240,participantLabelHeight:30,annotationSpacingX:80,participantFontSize:20,messageFontSize:15,paddingX:30,paddingY:20},i=document.getElementById("preview"),a=document.getElementById("copyCode"),o=document.getElementById("copyPNG"),r=document.getElementById("copySVG"),n=`def messageSpacing 20px
def participantSpacing 160px

participant Alice a
participant Bob b

a -> b : "normal"
b -> a : "normal reply"

a ~> b : "corrupted"
b ~> a : "corrupted reply"

a -x b : "dropped"
b -x a : "dropped reply"

a => b : "thick"
b => a : "thick reply"

a @2 < "left label @2"
b @5 > "right label @5"`,s=window.CodeMirror(document.getElementById("editor"),{value:n,mode:"protocol-ml",lineNumbers:!0,autofocus:!0,tabSize:2,indentUnit:2,viewportMargin:1/0}),l="";function c(){let e=s.getValue();try{let a=function(e){let i=[],a=[],o=0;for(let r of e.split("\n")){if(!(r=r.trim())||r.startsWith("//"))continue;if(r.startsWith("def")){let[,e,i]=r.split(/\s+/);t[e]=parseFloat(i);continue}if(r.startsWith("participant")){let[,e,t]=r.split(/\s+/);i.push({name:e,alias:t,column:i.length});continue}let e=r.match(/^(\w+)(?:\s*@([\d.]+))?\s*([<>])\s*"(.+)"/);if(e){o++,a.push({type:"annotation",participant:e[1],height:e[2]?parseFloat(e[2]):void 0,side:"<"===e[3]?"left":"right",text:e[4]});continue}let n=r.match(/^(\w+)(?:\s*@([\d.]+))?\s*(->|=>|~>|-x)\s*(\w+)(?:\s*@([\d.]+))?(?:\s*:\s*"(.+)")?/);if(n){let e={"->":"normal","=>":"thick","~>":"corrupt","-x":"dropped"};a.push({type:"arrow",from:n[1],start:n[2]?parseFloat(n[2]):void 0,arrowType:e[n[3]],to:n[4],end:n[5]?parseFloat(n[5]):void 0,label:n[6]});continue}}return{settings:t,participants:i,actions:a,numAnnotations:o}}(e);l=function(e){let{settings:t,width:i,height:a,draws:o}=function(e){let{settings:t,participants:i,actions:a,numAnnotations:o}=e,r=t.participantSpacingX*(i.length-1)+2*t.paddingX;o>0&&(r+=2*t.annotationSpacingX);let n=t.paddingX+t.participantLabelHeight+t.messageSpacingY,s=new Map;{let e=t.paddingX+(o>0?t.annotationSpacingX:0);for(let a of i)s.set(a.alias,e),e+=t.participantSpacingX}let l=0,c=0,p=[];for(let e of a){switch(e.type){case"arrow":let i=l,a=l+1;e.start&&(i=l=e.start,a=l+1),e.end&&(a=e.end),p.push({type:e.type,x1:s.get(e.from),y1:n+i*t.messageSpacingY,x2:s.get(e.to),y2:n+a*t.messageSpacingY,arrowType:e.arrowType,label:e.label}),l++;break;case"annotation":let o=l;e.height&&(o=e.height),p.push({type:e.type,x:s.get(e.participant)-("left"==e.side?1:-1)*(t.annotationSpacingX/2),y:n+o*t.messageSpacingY,align:"left"==e.side?"right":"left",text:e.text})}c=Math.max(c,l)}let d=n-t.messageSpacingY;n+=(c+1)*t.messageSpacingY;let g=i.map(e=>({type:"participant",x:s.get(e.alias),y1:d,y2:n,name:e.name}));return n+=t.paddingY,{settings:t,width:r,height:n,draws:[...g,...p]}}(e),r=[];for(let e of(r.push(`<svg class="protocol-diagram" xmlns="http://www.w3.org/2000/svg" width="${i}" height="${a}">`),r.push('<rect width="100%" height="100%" fill="#333333"/>'),o))switch(e.type){case"participant":r.push(function(e,t){let{x:i,y1:a,y2:o,name:r}=t;return`
<text
  x="${i}"
  y="${a-e.participantLabelHeight/2}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${e.participantFontSize}"
>
  ${r}
</text>
<line stroke="#aaaaaa" x1="${i}" y1="${a}" x2="${i}" y2="${o}" />`}(t,e));break;case"arrow":r.push(function(e,t){let{x1:i,y1:a,x2:o,y2:r,arrowType:n,label:s}=t,l=o-i,c=r-a,p=Math.hypot(l,c),d=l/p,g=c/p,$=-g,y="",h=o-d*e.arrowSize,m=r-g*e.arrowSize,u=h+$*e.arrowSize*.5,x=m+d*e.arrowSize*.5,w=h-$*e.arrowSize*.5,S=m-d*e.arrowSize*.5;switch(n){case"normal":y=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <line x1="${i}" y1="${a}" x2="${o}" y2="${r}" />
  <line x1="${o}" y1="${r}" x2="${u}" y2="${x}" />
  <line x1="${o}" y1="${r}" x2="${w}" y2="${S}" />
</g>`;break;case"dropped":let f=i+d*p*e.dropStart,k=a+g*p*e.dropStart;y=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <line x1="${i}" y1="${a}" x2="${f}" y2="${k}" />
  <line stroke="red" x1="${f-.5*e.crossSize}" y1="${k-.5*e.crossSize}" x2="${f+.5*e.crossSize}" y2="${k+.5*e.crossSize}" />
  <line stroke="red" x1="${f-.5*e.crossSize}" y1="${k+.5*e.crossSize}" x2="${f+.5*e.crossSize}" y2="${k-.5*e.crossSize}" />
</g>`;break;case"corrupt":let b=i+d*p*e.corruptStart,z=a+g*p*e.corruptStart,v=(p*(1-e.corruptStart)-2*e.arrowSize)/(4*e.squiggleCount),L="",C=b,F=z;for(let t=0;t<e.squiggleCount;t++)C+=d*v,F+=g*v,L+=`L ${C-$*e.squiggleSize*.5} ${F-d*e.squiggleSize*.5} `,C+=2*d*v,F+=2*g*v,L+=`L ${C+$*e.squiggleSize*.5} ${F+d*e.squiggleSize*.5} `,C+=d*v,F+=g*v;C+=d*v,F+=g*v,L+=`L ${C} ${F}`,y=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <line x1="${i}" y1="${a}" x2="${b}" y2="${z}" />
  <path stroke="orange" d="M ${b} ${z} ${L} L ${h} ${m}" />
  <line stroke="orange" x1="${h}" y1="${m}" x2="${o}" y2="${r}" />
  <line stroke="orange" x1="${o}" y1="${r}" x2="${u}" y2="${x}" />
  <line stroke="orange" x1="${o}" y1="${r}" x2="${w}" y2="${S}" />
</g>`;break;case"thick":y=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <polygon stroke="none" fill="#ffffff44" points="${i},${a} ${o},${r} ${o},${r+e.thickArrowSize} ${i},${a+e.thickArrowSize}" />
  <line x1="${i}" y1="${a}" x2="${o}" y2="${r}" />
  <line x1="${o}" y1="${r}" x2="${u}" y2="${x}" />
  <line x1="${o}" y1="${r}" x2="${w}" y2="${S}" />
  <line x1="${i}" y1="${a+e.thickArrowSize}" x2="${o}" y2="${r+e.thickArrowSize}" />
  <line x1="${o}" y1="${r+e.thickArrowSize}" x2="${u}" y2="${x+e.thickArrowSize}" />
  <line x1="${o}" y1="${r+e.thickArrowSize}" x2="${w}" y2="${S+e.thickArrowSize}" />
</g>`}let T="";if(s){let t=(a+r)/2,p=e.labelOffset,g=1,y=180*Math.atan2(c,l)/Math.PI;(y>90||y<-90)&&(y+=180,p*=g=-1);let h=(i+o)/2-$*p,m="thick"===n?t+g*d*e.thickArrowSize/2:t-d*p;T=`
<text
  x="${h}"
  y="${m}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  transform="rotate(${y} ${h} ${m})"
  fill="white"
  font-size="${e.messageFontSize}"
>
  ${s}
</text>`}return`${y}${T}`}(t,e));break;case"annotation":r.push(function(e,t){let{x:i,y:a,align:o,text:r}=t;return`
<text
  x="${i}"
  y="${a}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${e.messageFontSize}"
>
  ${r}
</text>`}(t,e))}return r.push("</svg>"),r.join("\n")}(a),i.innerHTML=`<div class="protocol-ml-wrapper">${l}</div>`}catch(e){i.innerHTML=`<div class="error">Error: ${e.message}</div>`,l=""}}s.on("change",()=>{clearTimeout(e),e=setTimeout(c,300)}),a.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(s.getValue()),a.textContent="Copied!",a.classList.add("copied"),setTimeout(()=>{a.textContent="Copy Code",a.classList.remove("copied")},2e3)}catch(e){console.error("Failed to copy:",e)}}),o.addEventListener("click",async()=>{if(l)try{let e=i.querySelector("svg");if(!e)return;let t=document.createElement("canvas"),a=t.getContext("2d"),r=new XMLSerializer().serializeToString(e);t.width=e.width.baseVal.value,t.height=e.height.baseVal.value;let n=new Image,s=new Blob([r],{type:"image/svg+xml;charset=utf-8"}),l=URL.createObjectURL(s);n.onload=async()=>{a.drawImage(n,0,0),URL.revokeObjectURL(l),t.toBlob(async e=>{try{await navigator.clipboard.write([new ClipboardItem({"image/png":e})]),o.textContent="Copied!",o.classList.add("copied"),setTimeout(()=>{o.textContent="Copy PNG",o.classList.remove("copied")},2e3)}catch(e){console.error("Failed to copy PNG:",e),o.textContent="Failed",setTimeout(()=>{o.textContent="Copy PNG"},2e3)}},"image/png")},n.onerror=()=>{console.error("Failed to load SVG"),URL.revokeObjectURL(l)},n.src=l}catch(e){console.error("Failed to copy PNG:",e)}}),r.addEventListener("click",async()=>{if(l)try{await navigator.clipboard.writeText(l),r.textContent="Copied!",r.classList.add("copied"),setTimeout(()=>{r.textContent="Copy SVG",r.classList.remove("copied")},2e3)}catch(e){console.error("Failed to copy:",e)}}),c();
//# sourceMappingURL=docs.daa31e65.js.map
