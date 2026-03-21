import { Entities, Settings } from "./parser";
import { AnnotationPos, ArrowPos, ParticipantPos, TickPos, TimeAxisPos, resolveLayout } from "./layout";

function drawGrid(settings: Settings, ticks: TickPos[], width: number): string {
  return ticks.map(tick =>
    `<line stroke="#aaaaaa" stroke-dasharray="2" x1="0" y1="${tick.y}" x2="${width}" y2="${tick.y}" />`
  ).join("\n");
}

function drawTimeAxis(settings: Settings, axis: TimeAxisPos, ticks: TickPos[]): string {
  const header = `
<text
  x="${axis.x}"
  y="${axis.y1 - settings.participantLabelHeight / 2}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${settings.participantFontSize}"
>
  Time ${settings.timeUnit}
</text>
<line stroke="#aaaaaa" stroke-width="3" x1="${axis.x}" y1="${axis.y1}" x2="${axis.x}" y2="${axis.y2}" />`;

  const tickElements = ticks.map(tick => `
<line stroke="#aaaaaa" x1="${axis.x - 5}" y1="${tick.y}" x2="${axis.x + 5}" y2="${tick.y}" />
<text
  x="${axis.x - 10}"
  y="${tick.y}"
  text-anchor="end"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${settings.messageFontSize}"
>
  ${tick.label}
</text>`).join("\n");

  return `${header}${tickElements}`;
}

function drawParticipant(settings: Settings, participant: ParticipantPos): string {
  const { x, y1, y2, name } = participant;

  return `
<text
  x="${x}"
  y="${y1 - settings.participantLabelHeight / 2}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${settings.participantFontSize}"
>
  ${name}
</text>
<line stroke="#aaaaaa" x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" />`;
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxChars) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines;
}

function drawAnnotation(settings: Settings, annotation: AnnotationPos): string {
  const { x, y, align, text } = annotation;
  
  const charWidth = settings.messageFontSize * 0.6;
  const marginOffset = settings.labelOffset;
  const rectWidth = settings.annotationWidth - marginOffset;
  const maxChars = Math.max(1, Math.floor(rectWidth / charWidth));
  
  const lines = wrapText(text, maxChars);
  const lineHeight = settings.messageFontSize * 1.2;
  const startY = y;
  
  const anchor = align === "left" ? "start" : align === "right" ? "end" : "middle";
  
  const tspans = lines.map((line, i) => 
    `<tspan x="${x}" y="${startY + i * lineHeight}">${line}</tspan>`
  ).join("\n");

  return `
<text
  xml:space="preserve"
  text-anchor="${anchor}"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  fill="white"
  font-size="${settings.messageFontSize}"
>
  ${tspans}
</text>`
}

function drawArrow(settings: Settings, arrow: ArrowPos): string {
  const { x1, y1, x2, y2, arrowType, label } = arrow;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const len = Math.hypot(dx, dy);

  // normalized
  const ux = dx / len;
  const uy = dy / len;

  // normalized perpendicular
  const px = -uy;
  const py = ux;

  // arrow
  let arrowsvg = '';

  // arrow head
  const baseX = x2 - ux * settings.arrowHeadSize;
  const baseY = y2 - uy * settings.arrowHeadSize;

  const leftX = baseX + px * settings.arrowHeadSize * 0.5;
  const leftY = baseY + py * settings.arrowHeadSize * 0.5;

  const rightX = baseX - px * settings.arrowHeadSize * 0.5;
  const rightY = baseY - py * settings.arrowHeadSize * 0.5;

  switch (arrowType) {
    case "normal":
      arrowsvg = `
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />
  <line x1="${x2}" y1="${y2}" x2="${leftX}" y2="${leftY}" />
  <line x1="${x2}" y1="${y2}" x2="${rightX}" y2="${rightY}" />
</g>`;
      break;

    case "dropped":
      // cross
      const dropX = x1 + ux * len * settings.dropStartRatio;
      const dropY = y1 + uy * len * settings.dropStartRatio;

      arrowsvg = `
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <line x1="${x1}" y1="${y1}" x2="${dropX}" y2="${dropY}" />
  <line stroke="red" x1="${dropX - settings.dropCrossSize * 0.5}" y1="${dropY - settings.dropCrossSize * 0.5}" x2="${dropX + settings.dropCrossSize * 0.5}" y2="${dropY + settings.dropCrossSize * 0.5}" />
  <line stroke="red" x1="${dropX - settings.dropCrossSize * 0.5}" y1="${dropY + settings.dropCrossSize * 0.5}" x2="${dropX + settings.dropCrossSize * 0.5}" y2="${dropY - settings.dropCrossSize * 0.5}" />
</g>`;
      break;

    case "corrupt":
      // draw the squiggly
      const waveX = x1 + ux * len * settings.corruptStartRatio;
      const waveY = y1 + uy * len * settings.corruptStartRatio;

      const waveLen = (len * (1 - settings.corruptStartRatio)) - 2 * settings.arrowHeadSize;
      const waveInterval = waveLen / (4 * settings.squiggleCount);


      let path = '';

      let sx = waveX;
      let sy = waveY;

      for (let i = 0; i < settings.squiggleCount; i++) {
        sx += ux * waveInterval;
        sy += uy * waveInterval;

        path += `L ${sx - (px * settings.squiggleSize * 0.5)} ${sy - (py * settings.squiggleSize * 0.5)} `

        sx += 2 * ux * waveInterval;
        sy += 2 * uy * waveInterval;

        path += `L ${sx + (px * settings.squiggleSize * 0.5)} ${sy + (py * settings.squiggleSize * 0.5)} `;

        sx += ux * waveInterval;
        sy += uy * waveInterval;
      }
      sx += ux * waveInterval;
      sy += uy * waveInterval;

      path += `L ${sx} ${sy}`

      arrowsvg = `
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <line x1="${x1}" y1="${y1}" x2="${waveX}" y2="${waveY}" />
  <path stroke="orange" d="M ${waveX} ${waveY} ${path} L ${baseX} ${baseY}" />
  <line stroke="orange" x1="${baseX}" y1="${baseY}" x2="${x2}" y2="${y2}" />
  <line stroke="orange" x1="${x2}" y1="${y2}" x2="${leftX}" y2="${leftY}" />
  <line stroke="orange" x1="${x2}" y1="${y2}" x2="${rightX}" y2="${rightY}" />
</g>`;
      break;

    case "thick":
      arrowsvg = `
<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round">
  <polygon stroke="none" fill="#ffffff44" points="${x1},${y1} ${x2},${y2} ${x2},${y2 + settings.thickArrowThickness} ${x1},${y1 + settings.thickArrowThickness}" />
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />
  <line x1="${x2}" y1="${y2}" x2="${leftX}" y2="${leftY}" />
  <line x1="${x2}" y1="${y2}" x2="${rightX}" y2="${rightY}" />
  <line x1="${x1}" y1="${y1 + settings.thickArrowThickness}" x2="${x2}" y2="${y2 + settings.thickArrowThickness}" />
  <line x1="${x2}" y1="${y2 + settings.thickArrowThickness}" x2="${leftX}" y2="${leftY + settings.thickArrowThickness}" />
  <line x1="${x2}" y1="${y2 + settings.thickArrowThickness}" x2="${rightX}" y2="${rightY + settings.thickArrowThickness}" />
</g>`;
      break;

    // default:
    //   // should not reach here
    //   console.error(`[protocol-ml] Error: Invalid arrow type: ${type}`)
  }

  // label
  let labelsvg = '';

  if (label) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    let offset = settings.labelOffset;
    let direction = 1;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle > 90 || angle < -90) {
      angle += 180;
      direction = -1;
      offset *= direction;
    }

    const lx = mx - px * offset;
    const ly = (arrowType === "thick")
      ? my + (direction * py * settings.thickArrowThickness / 2)
      : my - py * offset;


    labelsvg = `
<text
  x="${lx}"
  y="${ly}"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="JetBrains Mono, monospace"
  transform="rotate(${angle} ${lx} ${ly})"
  fill="white"
  font-size="${settings.messageFontSize}"
>
  ${label}
</text>`;
  }

  return `${arrowsvg}${labelsvg}`;
}

export function renderSVG(entities: Entities): string {
  const { settings, width, height, draws } = resolveLayout(entities);

  let svg: string[] = [];

  svg.push(
    `<svg class="protocol-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`
  );

  svg.push(
    `<rect width="100%" height="100%" fill="#333333"/>`
  );

  const ticks = draws.filter((d): d is TickPos => d.type === "tick");
  const timeAxis = draws.find((d): d is TimeAxisPos => d.type === "timeAxis");

  if (settings.showGrid) {
    svg.push(drawGrid(settings, ticks, width));
  }

  if (settings.showTimeTicks && timeAxis) {
    svg.push(drawTimeAxis(settings, timeAxis, ticks));
  }

  for (const draw of draws) {
    switch (draw.type) {
      case "participant":
        svg.push(drawParticipant(settings, draw));
        break;
      case "arrow":
        svg.push(drawArrow(settings, draw));
        break;
      case "annotation":
        svg.push(drawAnnotation(settings, draw));
        break;
    }
  }

  //   svg.push(`<line
  //   x1=50
  //   y1=0
  //   x2=50
  //   y2=480
  //   stroke="#eeeeee"
  //   stroke-width=1
  // />
  // <line
  //   x1=330
  //   y1=0
  //   x2=330
  //   y2=480
  //   stroke="#eeeeee"
  //   stroke-width=1
  // />`);

  // svg.push(drawArrow("normal", 50, 50, 510, 100, "hello"));
  // svg.push(drawArrow("dropped", 510, 100, 50, 200, "hello indeed"));
  // svg.push(drawArrow("corrupt", 50, 200, 510, 300, "why u blue tick me?"));
  // svg.push(drawArrow("thick", 510, 300, 50, 430, "chonk"));
  //
  svg.push(`</svg>`);

  return svg.join("\n");
}
