let e;let t={arrowSize:10,crossSize:12,thickArrowSize:30,labelOffset:10,corruptStart:.85,dropStart:.85,squiggleSize:20,squiggleCount:2,messageSpacingY:40,participantSpacingX:240,participantLabelHeight:30,annotationSpacingX:80,participantFontSize:20,messageFontSize:15,paddingX:30,paddingY:20,showGrid:!1,showTimeTicks:!1},i=document.getElementById("preview"),a=document.getElementById("copyCode"),o=document.getElementById("copyPNG"),n=document.getElementById("copySVG"),r=`def messageSpacing 20px
def participantSpacing 160px
def showTimeTicks true
def showGrid true

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
b @5 > "right label @5"`,s=window.CodeMirror(document.getElementById("editor"),{value:r,mode:"protocol-ml",lineNumbers:!0,autofocus:!0,tabSize:2,indentUnit:2,viewportMargin:1/0}),l="";function c(){let e=s.getValue();try{let a=function(e){let i={...t},a=[],o=[],n=0;for(let t of e.split("\n")){if(!(t=t.trim())||t.startsWith("//"))continue;if(t.startsWith("def")){let[,e,a]=t.split(/\s+/);/^true$/i.test(a)?i[e]=!0:/^false$/i.test(a)?i[e]=!1:i[e]=parseFloat(a);continue}if(t.startsWith("participant")){let[,e,i]=t.split(/\s+/);a.push({name:e,alias:i,column:a.length});continue}let e=t.match(/^(\w+)(?:\s*@([\d.]+))?\s*([<>])\s*"(.+)"/);if(e){n++,o.push({type:"annotation",participant:e[1],height:e[2]?parseFloat(e[2]):void 0,side:"<"===e[3]?"left":"right",text:e[4]});continue}let r=t.match(/^(\w+)(?:\s*@([\d.]+))?\s*(->|=>|~>|-x)\s*(\w+)(?:\s*@([\d.]+))?(?:\s*:\s*"(.+)")?/);if(r){let e={"->":"normal","=>":"thick","~>":"corrupt","-x":"dropped"};o.push({type:"arrow",from:r[1],start:r[2]?parseFloat(r[2]):void 0,arrowType:e[r[3]],to:r[4],end:r[5]?parseFloat(r[5]):void 0,label:r[6]});continue}}return{settings:i,participants:a,actions:o,numAnnotations:n}}(e);l=function(e){let t,i,{settings:a,width:o,height:n,draws:r}=function(e){let{settings:t,participants:i,actions:a,numAnnotations:o}=e,n=60*!!t.showTimeTicks,r=t.participantSpacingX*(i.length-1)+2*t.paddingX+n;o>0&&(r+=2*t.annotationSpacingX);let s=t.paddingX+t.participantLabelHeight+t.messageSpacingY,l=new Map,c=t.paddingX+(o>0?t.annotationSpacingX:0)+20*(n>0);{let e=c+n;for(let a of(0===n&&(e=t.paddingX+(o>0?t.annotationSpacingX:0)),i))l.set(a.alias,e),e+=t.participantSpacingX}let p=0,d=0,$=[];for(let e of a){switch(e.type){case"arrow":let i=p,a=p+1;e.start&&(i=p=e.start,a=p+1),e.end&&(a=e.end),$.push({type:e.type,x1:l.get(e.from),y1:s+i*t.messageSpacingY,x2:l.get(e.to),y2:s+a*t.messageSpacingY,arrowType:e.arrowType,label:e.label}),p++;break;case"annotation":let o=p;e.height&&(o=e.height),$.push({type:e.type,x:l.get(e.participant)-("left"==e.side?1:-1)*(t.annotationSpacingX/2),y:s+o*t.messageSpacingY,align:"left"==e.side?"right":"left",text:e.text})}d=Math.max(d,p)}let g=s-t.messageSpacingY;s+=(d+1)*t.messageSpacingY;let y=i.map(e=>({type:"participant",x:l.get(e.alias),y1:g,y2:s,name:e.name}));if(t.showTimeTicks||t.showGrid)for(let e=0;e<=d;e++)$.push({type:"tick",y:g+t.messageSpacingY+e*t.messageSpacingY,label:`${e}`});return t.showTimeTicks&&$.push({type:"timeAxis",x:c,y1:g,y2:s}),s+=t.paddingY,{settings:t,width:r,height:s,draws:[...y,...$]}}(e),s=[];s.push(`<svg class="protocol-diagram" xmlns="http://www.w3.org/2000/svg" width="${o}" height="${n}">`),s.push('<rect width="100%" height="100%" fill="#333333"/>');let l=r.filter(e=>"tick"===e.type),c=r.find(e=>"timeAxis"===e.type);for(let e of(a.showGrid&&s.push(l.map(e=>`<line stroke="#aaaaaa" stroke-dasharray="2" x1="0" y1="${e.y}" x2="${o}" y2="${e.y}" />`).join("\n")),a.showTimeTicks&&c&&s.push((t=`
<text
  x="${c.x}"
  y="${c.y1-a.participantLabelHeight/2}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${a.participantFontSize}"
>
  Time
</text>
<line stroke="#aaaaaa" stroke-width="3" x1="${c.x}" y1="${c.y1}" x2="${c.x}" y2="${c.y2}" />`,i=l.map(e=>`
<line stroke="#aaaaaa" x1="${c.x-5}" y1="${e.y}" x2="${c.x+5}" y2="${e.y}" />
<text
  x="${c.x-10}"
  y="${e.y}"
  text-anchor="end"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${a.messageFontSize}"
>
  ${e.label}
</text>`).join("\n"),`${t}${i}`)),r))switch(e.type){case"participant":s.push(function(e,t){let{x:i,y1:a,y2:o,name:n}=t;return`
<text
  x="${i}"
  y="${a-e.participantLabelHeight/2}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${e.participantFontSize}"
>
  ${n}
</text>
<line stroke="#aaaaaa" x1="${i}" y1="${a}" x2="${i}" y2="${o}" />`}(a,e));break;case"arrow":s.push(function(e,t){let{x1:i,y1:a,x2:o,y2:n,arrowType:r,label:s}=t,l=o-i,c=n-a,p=Math.hypot(l,c),d=l/p,$=c/p,g=-$,y="",h=o-d*e.arrowSize,m=n-$*e.arrowSize,x=h+g*e.arrowSize*.5,u=m+d*e.arrowSize*.5,w=h-g*e.arrowSize*.5,f=m-d*e.arrowSize*.5;switch(r){case"normal":y=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <line x1="${i}" y1="${a}" x2="${o}" y2="${n}" />
  <line x1="${o}" y1="${n}" x2="${x}" y2="${u}" />
  <line x1="${o}" y1="${n}" x2="${w}" y2="${f}" />
</g>`;break;case"dropped":let S=i+d*p*e.dropStart,k=a+$*p*e.dropStart;y=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <line x1="${i}" y1="${a}" x2="${S}" y2="${k}" />
  <line stroke="red" x1="${S-.5*e.crossSize}" y1="${k-.5*e.crossSize}" x2="${S+.5*e.crossSize}" y2="${k+.5*e.crossSize}" />
  <line stroke="red" x1="${S-.5*e.crossSize}" y1="${k+.5*e.crossSize}" x2="${S+.5*e.crossSize}" y2="${k-.5*e.crossSize}" />
</g>`;break;case"corrupt":let b=i+d*p*e.corruptStart,z=a+$*p*e.corruptStart,v=(p*(1-e.corruptStart)-2*e.arrowSize)/(4*e.squiggleCount),T="",L=b,C=z;for(let t=0;t<e.squiggleCount;t++)L+=d*v,C+=$*v,T+=`L ${L-g*e.squiggleSize*.5} ${C-d*e.squiggleSize*.5} `,L+=2*d*v,C+=2*$*v,T+=`L ${L+g*e.squiggleSize*.5} ${C+d*e.squiggleSize*.5} `,L+=d*v,C+=$*v;L+=d*v,C+=$*v,T+=`L ${L} ${C}`,y=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <line x1="${i}" y1="${a}" x2="${b}" y2="${z}" />
  <path stroke="orange" d="M ${b} ${z} ${T} L ${h} ${m}" />
  <line stroke="orange" x1="${h}" y1="${m}" x2="${o}" y2="${n}" />
  <line stroke="orange" x1="${o}" y1="${n}" x2="${x}" y2="${u}" />
  <line stroke="orange" x1="${o}" y1="${n}" x2="${w}" y2="${f}" />
</g>`;break;case"thick":y=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <polygon stroke="none" fill="#ffffff44" points="${i},${a} ${o},${n} ${o},${n+e.thickArrowSize} ${i},${a+e.thickArrowSize}" />
  <line x1="${i}" y1="${a}" x2="${o}" y2="${n}" />
  <line x1="${o}" y1="${n}" x2="${x}" y2="${u}" />
  <line x1="${o}" y1="${n}" x2="${w}" y2="${f}" />
  <line x1="${i}" y1="${a+e.thickArrowSize}" x2="${o}" y2="${n+e.thickArrowSize}" />
  <line x1="${o}" y1="${n+e.thickArrowSize}" x2="${x}" y2="${u+e.thickArrowSize}" />
  <line x1="${o}" y1="${n+e.thickArrowSize}" x2="${w}" y2="${f+e.thickArrowSize}" />
</g>`}let F="";if(s){let t=(a+n)/2,p=e.labelOffset,$=1,y=180*Math.atan2(c,l)/Math.PI;(y>90||y<-90)&&(y+=180,p*=$=-1);let h=(i+o)/2-g*p,m="thick"===r?t+$*d*e.thickArrowSize/2:t-d*p;F=`
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
</text>`}return`${y}${F}`}(a,e));break;case"annotation":s.push(function(e,t){let{x:i,y:a,align:o,text:n}=t;return`
<text
  x="${i}"
  y="${a}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${e.messageFontSize}"
>
  ${n}
</text>`}(a,e))}return s.push("</svg>"),s.join("\n")}(a),i.innerHTML=`<div class="protocol-ml-wrapper">${l}</div>`}catch(e){i.innerHTML=`<div class="error">Error: ${e.message}</div>`,l=""}}s.on("change",()=>{clearTimeout(e),e=setTimeout(c,300)}),a.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(s.getValue()),a.textContent="Copied!",a.classList.add("copied"),setTimeout(()=>{a.textContent="Copy Code",a.classList.remove("copied")},2e3)}catch(e){console.error("Failed to copy:",e)}}),o.addEventListener("click",async()=>{if(l)try{let e=i.querySelector("svg");if(!e)return;let t=document.createElement("canvas"),a=t.getContext("2d"),n=new XMLSerializer().serializeToString(e);t.width=e.width.baseVal.value,t.height=e.height.baseVal.value;let r=new Image,s=new Blob([n],{type:"image/svg+xml;charset=utf-8"}),l=URL.createObjectURL(s);r.onload=async()=>{a.drawImage(r,0,0),URL.revokeObjectURL(l),t.toBlob(async e=>{try{await navigator.clipboard.write([new ClipboardItem({"image/png":e})]),o.textContent="Copied!",o.classList.add("copied"),setTimeout(()=>{o.textContent="Copy PNG",o.classList.remove("copied")},2e3)}catch(e){console.error("Failed to copy PNG:",e),o.textContent="Failed",setTimeout(()=>{o.textContent="Copy PNG"},2e3)}},"image/png")},r.onerror=()=>{console.error("Failed to load SVG"),URL.revokeObjectURL(l)},r.src=l}catch(e){console.error("Failed to copy PNG:",e)}}),n.addEventListener("click",async()=>{if(l)try{await navigator.clipboard.writeText(l),n.textContent="Copied!",n.classList.add("copied"),setTimeout(()=>{n.textContent="Copy SVG",n.classList.remove("copied")},2e3)}catch(e){console.error("Failed to copy:",e)}}),c();
//# sourceMappingURL=docs.13477033.js.map
