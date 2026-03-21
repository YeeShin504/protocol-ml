let e;let t={arrowHeadSize:10,dropCrossSize:12,thickArrowThickness:40,labelOffset:10,corruptStartRatio:.85,dropStartRatio:.85,squiggleSize:20,squiggleCount:2,timeTickInterval:40,participantSpacing:240,participantLabelHeight:30,annotationWidth:80,participantFontSize:20,messageFontSize:15,paddingX:30,paddingY:20,showGrid:!1,showTimeTicks:!1,timeUnit:""};function i(e){let t=e.trim();return t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'")?t.slice(1,-1):t}function a(e){let t=i(e);if(""===t)return null;if(t.endsWith("%")){let e=t.slice(0,-1),i=Number(e);if(""!==e&&!isNaN(i))return i/100}if(t.endsWith("px")){let e=t.slice(0,-2),i=Number(e);if(""!==e&&!isNaN(i))return i}let a=Number(t);return isNaN(a)?null:a}let n=document.getElementById("preview"),o=document.getElementById("copyCode"),r=document.getElementById("copyPNG"),l=document.getElementById("copySVG"),s=document.getElementById("panel-reference"),d=document.getElementById("panel-editor"),p=document.getElementById("panel-preview"),c=document.getElementById("resizer-ref"),m=document.getElementById("resizer-preview"),x=document.getElementById("toggleReference");function h(e,t,i,a){let n,o;e.addEventListener("mousedown",r=>{if("toggleReference"===r.target.id)return;n=r.clientX,o=t.offsetWidth,i.offsetWidth,t.style.transition="none";let l=e=>{let i=e.clientX-n;if(a){let e=Math.max(0,o+i);t.style.flex=`0 0 ${e}px`,$&&$.refresh()}else{let e=Math.max(100,o+i);t.style.flex=`0 0 ${e}px`,$&&$.refresh()}},s=()=>{document.removeEventListener("mousemove",l),document.removeEventListener("mouseup",s),e.classList.remove("dragging"),document.body.style.cursor="default",t.style.transition="",$&&$.refresh()};document.addEventListener("mousemove",l),document.addEventListener("mouseup",s),e.classList.add("dragging"),document.body.style.cursor="col-resize"})}x.addEventListener("click",e=>{e.stopPropagation(),s.classList.toggle("collapsed"),x.textContent=s.classList.contains("collapsed")?"▶":"◀"});let u=[{group:"Participants",items:[{title:"Define Participant",syntax:"participant Name alias",example:"participant Client c\nparticipant Server s"},{title:"Participant Spacing",syntax:"def participantSpacing 240px",example:"def participantSpacing 300px"},{title:"Label Height",syntax:"def participantLabelHeight 30px",example:"def participantLabelHeight 50px"},{title:"Font Size",syntax:"def participantFontSize 20px",example:"def participantFontSize 24px"}]},{group:"Message Arrows",items:[{title:"Normal Arrow",syntax:'a -> b : "label"',example:'a -> b : "Request"'},{title:"Thick Arrow",syntax:'a => b : "label"',example:'a => b : "Big Data"'},{title:"Corrupt Arrow",syntax:'a ~> b : "label"',example:'a ~> b : "Fragmented"'},{title:"Dropped Message",syntax:'a -x b : "label"',example:'a -x b : "Timeout"'},{title:"Time Offsets",syntax:"a @1.5 -> b @1",example:'a @1.5 -> b @1 : "Relative Time"'}]},{group:"Arrow Styles",items:[{title:"Arrow Head Size",syntax:"def arrowHeadSize 10px",example:"def arrowHeadSize 15px"},{title:"Thick Thickness",syntax:"def thickArrowThickness 40px",example:"def thickArrowThickness 20px"},{title:"Label Offset",syntax:"def labelOffset 10px",example:"def labelOffset 20px"},{title:"Message Font Size",syntax:"def messageFontSize 15px",example:"def messageFontSize 18px"}]},{group:"Corrupt & Dropped",items:[{title:"Corrupt Start %",syntax:"def corruptStartRatio 85%",example:"def corruptStartRatio 50%"},{title:"Drop Start %",syntax:"def dropStartRatio 85%",example:"def dropStartRatio 50%"},{title:"Drop Cross Size",syntax:"def dropCrossSize 12px",example:"def dropCrossSize 20px"},{title:"Corrupt Squiggle Size",syntax:"def squiggleSize 20px",example:"def squiggleSize 10px"},{title:"Corrupt Squiggle Count",syntax:"def squiggleCount 2",example:"def squiggleCount 5"}]},{group:"Annotations",items:[{title:"Left Note",syntax:'a < "text"',example:'a < "Local check"'},{title:"Right Note",syntax:'a > "text"',example:'a > "Processing"'},{title:"Annotation Width",syntax:"def annotationWidth 80px",example:"def annotationWidth 120px"}]},{group:"Grid & Time",items:[{title:"Show Grid",syntax:"def showGrid true",example:"def showGrid true"},{title:"Show Time Ticks",syntax:"def showTimeTicks true",example:"def showTimeTicks true"},{title:"Time Interval",syntax:"def timeTickInterval 40px",example:"def timeTickInterval 60px"},{title:"Time Unit",syntax:"def timeUnit /ms",example:"def timeUnit /ms"}]},{group:"Layout",items:[{title:"Horizontal Padding",syntax:"def paddingX 30px",example:"def paddingX 50px"},{title:"Vertical Padding",syntax:"def paddingY 20px",example:"def paddingY 50px"}]}];function f(e=""){let t=document.getElementById("reference-list");if(!t)return;t.innerHTML="";let i=e.toLowerCase().trim();u.forEach(e=>{let a=e.items.filter(t=>t.title.toLowerCase().includes(i)||t.syntax.toLowerCase().includes(i)||e.group.toLowerCase().includes(i));if(0===a.length)return;let n=document.createElement("div");n.className="ref-group",n.innerHTML=`<h4>${e.group}</h4>`;let o=document.createElement("div");o.className="group-items",a.forEach(e=>{let t=document.createElement("div");t.className="ref-item";let i=document.createElement("div");i.className="ref-title",i.textContent=e.title;let a=document.createElement("code");a.className="ref-syntax",CodeMirror.runMode(e.syntax,"protocol-ml",a);let n=document.createElement("button");n.className="try-btn-small",n.textContent="Try it",n.addEventListener("click",()=>{let t=$.getValue(),i=t?t+"\n\n"+e.example:e.example;$.setValue(i),$.setCursor($.lineCount(),0),$.focus()}),t.appendChild(i),t.appendChild(a),t.appendChild(n),o.appendChild(t)}),n.appendChild(o),t.appendChild(n)}),""===t.innerHTML&&""!==i&&(t.innerHTML='<div class="loading">No results found for "'+e+'"</div>')}let g=document.getElementById("refSearch");g&&g.addEventListener("input",e=>{f(e.target.value)});let y=`def timeTickInterval 40px
def participantSpacing 240px
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
b @5 > "right label @5"`;CodeMirror.commands.autocomplete=function(e){e.showHint({hint:CodeMirror.hint["protocol-ml"]})};let $=window.CodeMirror(document.getElementById("editor"),{value:y,mode:"protocol-ml",lineNumbers:!0,autofocus:!0,tabSize:2,indentUnit:2,indentWithTabs:!1,viewportMargin:1/0,extraKeys:{"Ctrl-Space":"autocomplete","Ctrl-/":"toggleComment","Cmd-/":"toggleComment",Tab:e=>{if(e.state.completionActive)e.state.completionActive.pick();else{let t=e.getCursor(),i=e.getLine(t.line).slice(0,t.ch);if(/^\s*$/.test(i))return CodeMirror.Pass;e.execCommand("autocomplete")}}},hintOptions:{direction:"above",completeSingle:!1,alignWithWord:!0}});$.on("inputRead",(e,t)=>{" "!==t.text[0]&&"\n"!==t.text[0]&&e.showHint({hint:CodeMirror.hint["protocol-ml"]})});let w="";function k(){let e=$.getValue();try{let o=function(e){let n={...t},o=[],r=[],l=0;for(let s of e.split("\n")){if(!(s=s.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\/\/.*$/g,(e,t)=>t||"").trim()))continue;if(s.startsWith("def ")){let e=s.match(/^def\s+([\w.]+)\s+(.+)$/);if(!e)continue;let o=e[1],r=e[2],l=o.toLowerCase(),d=Object.keys(t).find(e=>e.toLowerCase()===l);if(d){let e=t[d];if("number"==typeof e){let e=a(r);null!==e&&(n[d]=e)}else if("boolean"==typeof e){let e=function(e){let t=i(e).toLowerCase();return"true"===t||"false"!==t&&null}(r);null!==e&&(n[d]=e)}else"string"==typeof e&&(n[d]=i(r))}continue}if(s.startsWith("participant ")){let e=s.match(/^participant\s+(?:(?:"([^"]+)")|(\S+))\s+(\w+)/);if(!e)continue;let t=e[1]||e[2],i=e[3];o.push({name:t,alias:i,column:o.length});continue}let e=s.match(/^(\w+)(?:\s*@([\d.%px]+))?\s*([<>])\s*"(.+)"/);if(e){l++,r.push({type:"annotation",participant:e[1],height:e[2]?a(e[2])??void 0:void 0,side:"<"===e[3]?"left":"right",text:e[4]});continue}let d=s.match(/^(\w+)(?:\s*@([\d.%px]+))?\s*(->|=>|~>|-x)\s*(\w+)(?:\s*@([\d.%px]+))?(?:\s*:\s*"(.+)")?/);if(d){let e={"->":"normal","=>":"thick","~>":"corrupt","-x":"dropped"};r.push({type:"arrow",from:d[1],start:d[2]?a(d[2])??void 0:void 0,arrowType:e[d[3]],to:d[4],end:d[5]?a(d[5])??void 0:void 0,label:d[6]});continue}}return{settings:n,participants:o,actions:r,numAnnotations:l}}(e);w=function(e){let t,i,{settings:a,width:n,height:o,draws:r}=function(e){let{settings:t,participants:i,actions:a,numAnnotations:n}=e,o=60*!!t.showTimeTicks,r=n>0?t.annotationWidth:0,l=t.paddingX+o,s=l+20*!!t.showTimeTicks+r,d=s+t.participantSpacing*(i.length-1)+r+t.paddingX,p=t.paddingY+t.participantLabelHeight+t.timeTickInterval,c=new Map;{let e=s;for(let a of i)c.set(a.alias,e),e+=t.participantSpacing}let m=0,x=0,h=[];for(let e of a)switch(e.type){case"arrow":let i=m,a=m+1;e.start&&(i=m=e.start,a=m+1),e.end&&(a=e.end),h.push({type:e.type,x1:c.get(e.from),y1:p+i*t.timeTickInterval,x2:c.get(e.to),y2:p+a*t.timeTickInterval,arrowType:e.arrowType,label:e.label});let n="thick"===e.arrowType?t.thickArrowThickness/t.timeTickInterval:0;x=Math.max(x,i+n,a+n),m=a+n;break;case"annotation":let o=m;e.height&&(o=e.height),h.push({type:e.type,x:c.get(e.participant)-("left"==e.side?1:-1)*t.labelOffset,y:p+o*t.timeTickInterval,align:"left"==e.side?"right":"left",text:e.text}),x=Math.max(x,o)}let u=p-t.timeTickInterval,f=Math.ceil(x);p+=(f+1)*t.timeTickInterval;let g=i.map(e=>({type:"participant",x:c.get(e.alias),y1:u,y2:p,name:e.name}));if(t.showTimeTicks||t.showGrid)for(let e=0;e<=f;e++)h.push({type:"tick",y:u+t.timeTickInterval+e*t.timeTickInterval,label:`${e}`});return t.showTimeTicks&&h.push({type:"timeAxis",x:l,y1:u,y2:p}),p+=t.paddingY,{settings:t,width:d,height:p,draws:[...g,...h]}}(e),l=[];l.push(`<svg class="protocol-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${o}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`),l.push('<rect width="100%" height="100%" fill="#333333"/>');let s=r.filter(e=>"tick"===e.type),d=r.find(e=>"timeAxis"===e.type);for(let e of(a.showGrid&&l.push(s.map(e=>`<line stroke="#aaaaaa" stroke-dasharray="2" x1="0" y1="${e.y}" x2="${n}" y2="${e.y}" />`).join("\n")),a.showTimeTicks&&d&&l.push((t=`
<text
  x="${d.x}"
  y="${d.y1-a.participantLabelHeight/2}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${a.participantFontSize}"
>
  Time ${a.timeUnit}
</text>
<line stroke="#aaaaaa" stroke-width="3" x1="${d.x}" y1="${d.y1}" x2="${d.x}" y2="${d.y2}" />`,i=s.map(e=>`
<line stroke="#aaaaaa" x1="${d.x-5}" y1="${e.y}" x2="${d.x+5}" y2="${e.y}" />
<text
  x="${d.x-10}"
  y="${e.y}"
  text-anchor="end"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${a.messageFontSize}"
>
  ${e.label}
</text>`).join("\n"),`${t}${i}`)),r))switch(e.type){case"participant":l.push(function(e,t){let{x:i,y1:a,y2:n,name:o}=t;return`
<text
  x="${i}"
  y="${a-e.participantLabelHeight/2}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${e.participantFontSize}"
>
  ${o}
</text>
<line stroke="#aaaaaa" x1="${i}" y1="${a}" x2="${i}" y2="${n}" />`}(a,e));break;case"arrow":l.push(function(e,t){let{x1:i,y1:a,x2:n,y2:o,arrowType:r,label:l}=t,s=n-i,d=o-a,p=Math.hypot(s,d),c=s/p,m=d/p,x=-m,h="",u=n-c*e.arrowHeadSize,f=o-m*e.arrowHeadSize,g=u+x*e.arrowHeadSize*.5,y=f+c*e.arrowHeadSize*.5,$=u-x*e.arrowHeadSize*.5,w=f-c*e.arrowHeadSize*.5;switch(r){case"normal":h=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <line x1="${i}" y1="${a}" x2="${n}" y2="${o}" />
  <line x1="${n}" y1="${o}" x2="${g}" y2="${y}" />
  <line x1="${n}" y1="${o}" x2="${$}" y2="${w}" />
</g>`;break;case"dropped":let k=i+c*p*e.dropStartRatio,b=a+m*p*e.dropStartRatio;h=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <line x1="${i}" y1="${a}" x2="${k}" y2="${b}" />
  <line stroke="red" x1="${k-.5*e.dropCrossSize}" y1="${b-.5*e.dropCrossSize}" x2="${k+.5*e.dropCrossSize}" y2="${b+.5*e.dropCrossSize}" />
  <line stroke="red" x1="${k-.5*e.dropCrossSize}" y1="${b+.5*e.dropCrossSize}" x2="${k+.5*e.dropCrossSize}" y2="${b-.5*e.dropCrossSize}" />
</g>`;break;case"corrupt":let S=i+c*p*e.corruptStartRatio,T=a+m*p*e.corruptStartRatio,v=(p*(1-e.corruptStartRatio)-2*e.arrowHeadSize)/(4*e.squiggleCount),C="",z=S,L=T;for(let t=0;t<e.squiggleCount;t++)z+=c*v,L+=m*v,C+=`L ${z-x*e.squiggleSize*.5} ${L-c*e.squiggleSize*.5} `,z+=2*c*v,L+=2*m*v,C+=`L ${z+x*e.squiggleSize*.5} ${L+c*e.squiggleSize*.5} `,z+=c*v,L+=m*v;z+=c*v,L+=m*v,C+=`L ${z} ${L}`,h=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <line x1="${i}" y1="${a}" x2="${S}" y2="${T}" />
  <path stroke="orange" d="M ${S} ${T} ${C} L ${u} ${f}" />
  <line stroke="orange" x1="${u}" y1="${f}" x2="${n}" y2="${o}" />
  <line stroke="orange" x1="${n}" y1="${o}" x2="${g}" y2="${y}" />
  <line stroke="orange" x1="${n}" y1="${o}" x2="${$}" y2="${w}" />
</g>`;break;case"thick":h=`
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <polygon stroke="none" fill="#ffffff44" points="${i},${a} ${n},${o} ${n},${o+e.thickArrowThickness} ${i},${a+e.thickArrowThickness}" />
  <line x1="${i}" y1="${a}" x2="${n}" y2="${o}" />
  <line x1="${n}" y1="${o}" x2="${g}" y2="${y}" />
  <line x1="${n}" y1="${o}" x2="${$}" y2="${w}" />
  <line x1="${i}" y1="${a+e.thickArrowThickness}" x2="${n}" y2="${o+e.thickArrowThickness}" />
  <line x1="${n}" y1="${o+e.thickArrowThickness}" x2="${g}" y2="${y+e.thickArrowThickness}" />
  <line x1="${n}" y1="${o+e.thickArrowThickness}" x2="${$}" y2="${w+e.thickArrowThickness}" />
</g>`}let M="";if(l){let t=(a+o)/2,p=e.labelOffset,m=1,h=180*Math.atan2(d,s)/Math.PI;(h>90||h<-90)&&(h+=180,p*=m=-1);let u=(i+n)/2-x*p,f="thick"===r?t+m*c*e.thickArrowThickness/2:t-c*p;M=`
<text
  x="${u}"
  y="${f}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  transform="rotate(${h} ${u} ${f})"
  fill="white"
  font-size="${e.messageFontSize}"
>
  ${l}
</text>`}return`${h}${M}`}(a,e));break;case"annotation":l.push(function(e,t){let{x:i,y:a,align:n,text:o}=t,r=.6*e.messageFontSize,l=e.labelOffset,s=function(e,t){let i=e.split(" "),a=[],n="";for(let e=0;e<i.length;e++){let o=i[e];0===n.length?n=o:n.length+1+o.length<=t?n+=" "+o:(a.push(n),n=o)}return n&&a.push(n),a}(o,Math.max(1,Math.floor((e.annotationWidth-l)/r))),d=1.2*e.messageFontSize,p=s.map((e,t)=>`<tspan x="${i}" y="${a+t*d}">${e}</tspan>`).join("\n");return`
<text
  xml:space="preserve"
  text-anchor="${"left"===n?"start":"right"===n?"end":"middle"}"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${e.messageFontSize}"
>
  ${p}
</text>`}(a,e))}return l.push("</svg>"),l.join("\n")}(o),n.innerHTML=`<div class="protocol-ml-wrapper">${w}</div>`}catch(e){n.innerHTML=`<div class="error">Error: ${e.message}</div>`,w=""}}$.on("change",()=>{clearTimeout(e),e=setTimeout(k,300)}),o.addEventListener("click",async()=>{try{await navigator.clipboard.writeText($.getValue()),o.textContent="Copied!",o.classList.add("copied"),setTimeout(()=>{o.textContent="Copy Code",o.classList.remove("copied")},2e3)}catch(e){console.error("Failed to copy:",e)}}),r.addEventListener("click",async()=>{if(w)try{let e=n.querySelector("svg");if(!e)return;let t=document.createElement("canvas"),i=t.getContext("2d"),a=new XMLSerializer().serializeToString(e);t.width=e.width.baseVal.value,t.height=e.height.baseVal.value;let o=new Image,l=new Blob([a],{type:"image/svg+xml;charset=utf-8"}),s=URL.createObjectURL(l);o.onload=async()=>{i.drawImage(o,0,0),URL.revokeObjectURL(s),t.toBlob(async e=>{try{await navigator.clipboard.write([new ClipboardItem({"image/png":e})]),r.textContent="Copied!",r.classList.add("copied"),setTimeout(()=>{r.textContent="Copy PNG",r.classList.remove("copied")},2e3)}catch(e){console.error("Failed to copy PNG:",e),r.textContent="Failed",setTimeout(()=>{r.textContent="Copy PNG"},2e3)}},"image/png")},o.onerror=()=>{console.error("Failed to load SVG"),URL.revokeObjectURL(s)},o.src=s}catch(e){console.error("Failed to copy PNG:",e)}}),l.addEventListener("click",async()=>{if(w)try{await navigator.clipboard.writeText(w),l.textContent="Copied!",l.classList.add("copied"),setTimeout(()=>{l.textContent="Copy SVG",l.classList.remove("copied")},2e3)}catch(e){console.error("Failed to copy:",e)}}),k(),f(),h(c,s,d,!0),h(m,d,p,!1);
//# sourceMappingURL=docs.bccda14d.js.map
