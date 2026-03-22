export type ArrowType =
  | "normal"
  | "thick"
  | "corrupt"
  | "dropped";

export interface Participant {
  name: string;
  alias: string;
  column: number;
}

export interface Arrow {
  type: "arrow";
  from: string;
  to: string;
  start?: number;
  end?: number;
  arrowType: ArrowType;
  thicknessRatio?: number;
  label?: string;
}

export interface Annotation {
  type: "annotation";
  participant: string;
  height?: number;
  side: "left" | "right";
  text: string;
}

export interface Entities {
  settings: Settings;
  participants: Participant[];
  actions: (Arrow | Annotation)[];
  numAnnotations: number;
}

export interface Settings {
  arrowHeadSize: number;
  dropCrossSize: number;
  thickArrowThickness: number;
  labelOffset: number;
  corruptStartRatio: number;
  dropStartRatio: number;

  squiggleSize: number;
  squiggleCount: number;

  timeTickInterval: number;
  participantSpacing: number;
  participantLabelHeight: number;
  annotationWidth: number;

  participantFontSize: number;
  messageFontSize: number;

  paddingX: number;
  paddingY: number;

  showGrid: boolean;
  showTimeTicks: boolean;
  timeUnit: string;
}

const DEFAULT_SETTINGS: Settings = {
  arrowHeadSize: 10,
  dropCrossSize: 12,
  thickArrowThickness: 1.0,
  labelOffset: 10,
  corruptStartRatio: 0.85,
  dropStartRatio: 0.85,

  squiggleSize: 20,
  squiggleCount: 2,

  timeTickInterval: 40,
  participantSpacing: 240,
  participantLabelHeight: 30,
  annotationWidth: 80,

  participantFontSize: 20,
  messageFontSize: 15,

  paddingX: 30,
  paddingY: 20,

  showGrid: false,
  showTimeTicks: false,
  timeUnit: "",
};

function parseString(val: string): string {
  const v = val.trim();
  // Strip quotes if present
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseNumber(val: string): number | null {
  const v = parseString(val);
  if (v === "") return null;

  // Percentage: "85%" -> 0.85
  if (v.endsWith("%")) {
    const numPart = v.slice(0, -1);
    const n = Number(numPart);
    if (numPart !== "" && !isNaN(n)) return n / 100;
  }

  // Pixels: "20px" -> 20
  if (v.endsWith("px")) {
    const numPart = v.slice(0, -2);
    const n = Number(numPart);
    if (numPart !== "" && !isNaN(n)) return n;
  }

  // Strict number coercion
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function parseBoolean(val: string): boolean | null {
  const v = parseString(val).toLowerCase();
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

export function parse(src: string): Entities {
  const settings: Settings = { ...DEFAULT_SETTINGS };

  const participants: Participant[] = [];
  const actions: (Arrow | Annotation)[] = [];
  let numAnnotations = 0;

  const lines = src.split("\n");

  for (let line of lines) {
    // Strip inline comments, respecting quotes
    line = line.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\/\/.*$/g, (m: string, g1: string | undefined) => g1 ? g1 : "").trim();

    if (!line) continue;

    // overwrite default settings
    if (line.startsWith("def ")) {
      // Use regex to capture the full value which might contain spaces and quotes
      const match = line.match(/^def\s+([\w.]+)\s+(.+)$/);
      if (!match) continue;

      const name = match[1];
      const rawValue = match[2];

      const normalizedName = name.toLowerCase();
      // find exact match (case-insensitive)
      const targetKey = Object.keys(DEFAULT_SETTINGS).find(k => k.toLowerCase() === normalizedName) as keyof Settings | undefined;

      if (targetKey) {
        const defaultValue = DEFAULT_SETTINGS[targetKey];

        // Use specialized parsers based on the target type
        if (typeof defaultValue === "number") {
          const val = parseNumber(rawValue);
          if (val !== null) (settings as any)[targetKey] = val;
        } else if (typeof defaultValue === "boolean") {
          const val = parseBoolean(rawValue);
          if (val !== null) (settings as any)[targetKey] = val;
        } else if (typeof defaultValue === "string") {
          (settings as any)[targetKey] = parseString(rawValue);
        }
      }

      continue;
    }

    // participants
    // Example: participant Client c1
    // Example: participant "Web Server" ws
    if (line.startsWith("participant ")) {
      const match = line.match(/^participant\s+(?:(?:"([^"]+)")|(\S+))\s+(\w+)/);
      if (!match) continue;

      const name = match[1] || match[2];
      const alias = match[3];

      participants.push({
        name,
        alias,
        column: participants.length
      });

      continue;
    }

    // annotations
    const annMatch = line.match(
      /^(\w+)(?:\s*@([\d.%px]+))?\s*([<>])\s*"(.+)"/
    );

    if (annMatch) {
      numAnnotations++;

      actions.push({
        type: "annotation",
        participant: annMatch[1],
        height: annMatch[2] ? (parseNumber(annMatch[2]) ?? undefined) : undefined,
        side: annMatch[3] === "<" ? "left" : "right",
        text: annMatch[4]
      });

      continue;
    }

    // arrows
    const arrowMatch = line.match(
      /^(\w+)(?:\s*@([\d.%px]+))?\s*(->|=>|~>|-x)(?:\[([\d.]+)\])?\s*(?:@([\d.%px]+)\s+)?(\w+)(?:\s*@([\d.%px]+))?(?:\s*:\s*"(.+)")?/
    );

    if (arrowMatch) {

      const typeMap: Record<string, ArrowType> = {
        "->": "normal",
        "=>": "thick",
        "~>": "corrupt",
        "-x": "dropped"
      };

      actions.push({
        type: "arrow",
        from: arrowMatch[1],
        start: arrowMatch[2] ? (parseNumber(arrowMatch[2]) ?? undefined) : undefined,
        arrowType: typeMap[arrowMatch[3]],
        thicknessRatio: arrowMatch[4] ? parseFloat(arrowMatch[4]) : undefined,
        to: arrowMatch[6],
        end: (arrowMatch[5] || arrowMatch[7]) ? (parseNumber(arrowMatch[5] || arrowMatch[7]) ?? undefined) : undefined,
        label: arrowMatch[8]
      });

      continue;
    }

  }

  return {
    settings,
    participants,
    actions,
    numAnnotations
  };
}
