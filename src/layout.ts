import { ArrowType, Entities, Settings } from "./parser";

export interface ParticipantPos {
  type: "participant";
  x: number;
  y1: number;
  y2: number;
  name: string;
}

export interface ArrowPos {
  type: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  arrowType: ArrowType;
  thickness: number;
  label?: string;
}

export interface AnnotationPos {
  type: "annotation";
  x: number;
  y: number;
  align: "left" | "right";
  text: string;
}

export interface TickPos {
  type: "tick";
  y: number;
  label: string;
}

export interface TimeAxisPos {
  type: "timeAxis";
  x: number;
  y1: number;
  y2: number;
}

export interface Diagram {
  settings: Settings;
  width: number;
  height: number;
  draws: (ParticipantPos | ArrowPos | AnnotationPos | TickPos | TimeAxisPos)[];
}

export function resolveLayout(entities: Entities): Diagram {
  const { settings, participants, actions, numAnnotations } = entities;

  // 1. Calculate horizontal positions
  const timeUnitLabel = settings.showTimeTicks ? `Time ${settings.timeUnit}` : "";
  const timeAxisHeaderHalfWidth = timeUnitLabel.length * settings.participantFontSize * 0.3;
  
  const firstParticipantName = participants[0]?.name || "";
  const firstParticipantHalfWidth = firstParticipantName.length * settings.participantFontSize * 0.3;

  // Distance from the time axis header label to the left is fixed at paddingX.
  // We use max(halfWidth, 40) to also leave room for tick labels like "100" if the unit is short.
  const timeAxisX = settings.paddingX + Math.max(timeAxisHeaderHalfWidth, 40);
  
  const textBuffer = 20; // minimal gap between text labels
  const headerOverlapGap = timeAxisHeaderHalfWidth + firstParticipantHalfWidth + textBuffer;
  const annSpace = numAnnotations > 0 ? (settings.annotationWidth + settings.labelOffset) : 0;

  // Distance from axis line to first lifeline.
  const axisLineToParticipantGap = settings.showTimeTicks 
    ? Math.max(headerOverlapGap, annSpace)
    : (20 + annSpace);

  const startX = settings.showTimeTicks 
    ? timeAxisX + axisLineToParticipantGap
    : settings.paddingX + axisLineToParticipantGap;

  const lastParticipantX = startX + settings.participantSpacing * (participants.length - 1);
  const lastParticipantName = participants[participants.length - 1]?.name || "";
  const lastParticipantHalfWidth = lastParticipantName.length * settings.participantFontSize * 0.3;

  // Total width calculation
  const rightBuffer = Math.max(lastParticipantHalfWidth, annSpace);
  const width = lastParticipantX + rightBuffer + settings.paddingX;

  // 2. figure out top spacing for participant label and padding

  let height = settings.paddingY + settings.participantLabelHeight + settings.timeTickInterval; // last one is a hack

  // 3. resolve participant x position

  const participantsX = new Map(); // map alias -> x coord
  {
    let x = startX;
    for (const participant of participants) {
      participantsX.set(participant.alias, x);
      x += settings.participantSpacing;
    }
  }

  // 4. resolve arrows and annotations

  let counter = 0, counterMax = counter;
  const draws: (ParticipantPos | ArrowPos | AnnotationPos | TickPos | TimeAxisPos)[] = [];

  for (const action of actions) { // actions should be in order :D
    switch (action.type) {
      case "arrow":
        // @ positioning on the source should modify the counter
        let startY = counter;
        let endY = counter + 1;

        if (action.start !== undefined) {
          counter = action.start;
          startY = counter;
          endY = counter + 1;
        }

        if (action.end !== undefined) {
          endY = action.end;
        }

        const currentThicknessRatio = (action.arrowType === "thick") 
          ? (action.thicknessRatio ?? settings.thickArrowThickness)
          : 0;
        
        const thickness = currentThicknessRatio * settings.timeTickInterval;

        draws.push({
          type: action.type,
          x1: participantsX.get(action.from),
          y1: height + startY * settings.timeTickInterval,
          x2: participantsX.get(action.to),
          y2: height + endY * settings.timeTickInterval,
          arrowType: action.arrowType,
          thickness,
          label: action.label,
        });

        counterMax = Math.max(counterMax, startY + currentThicknessRatio, endY + currentThicknessRatio);
        counter++;
        break;

      case "annotation":
        // @ positioning should just position and nothing else
        let y = counter;
        if (action.height !== undefined) {
          y = action.height;
        }

        draws.push({
          type: action.type,
          x: participantsX.get(action.participant) - ((action.side == "left" ? 1 : -1) * settings.labelOffset),
          y: height + y * settings.timeTickInterval,
          align: action.side == "left" ? "right" : "left", // if on left, use right align
          text: action.text,
        });

        counterMax = Math.max(counterMax, y);
        break;

      // default:
      //   // should not reach here
      //   console.error(`[protocol-ml] Errror: invalid action type ${action.type}`);
    }
  }

  // 5. resolve height of participant lifetimes

  // draws.reverse(); // TBC: might look better if one rendered above

  const oldHeight = height - settings.timeTickInterval; // another hack
  const totalTicks = Math.ceil(counterMax);
  height += (totalTicks + 1) * settings.timeTickInterval; // add some extra length to the lifetime

  const lifelines: ParticipantPos[] = participants.map(p => {
    return {
      type: "participant",
      x: participantsX.get(p.alias),
      y1: oldHeight,
      y2: height,
      name: p.name,
    };
  });

  if (settings.showTimeTicks || settings.showGrid) {
    const step = Math.max(1, settings.timeTickStep);
    for (let i = 0; i <= totalTicks; i += step) {
      draws.push({
        type: "tick",
        y: oldHeight + settings.timeTickInterval + i * settings.timeTickInterval,
        label: `${i}`,
      });
    }
  }

  if (settings.showTimeTicks) {
    draws.push({
      type: "timeAxis",
      x: timeAxisX,
      y1: oldHeight,
      y2: height,
    });
  }

  height += settings.paddingY;

  return {
    settings,
    width,
    height,
    draws: [...lifelines, ...draws],
  };
}
