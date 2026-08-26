import type { Behavior, BehaviorType, ElementKind, HmiElement } from "@/types/hmi";
import { uid } from "./tree";

const defaultSize: Partial<Record<ElementKind, [number, number]>> = {
  text: [120, 24],
  multitext: [180, 70],
  numeric: [110, 34],
  textinput: [160, 32],
  numericinput: [120, 32],
  button: [120, 38],
  toggle: [120, 38],
  switch: [58, 30],
  checkbox: [22, 22],
  slider: [180, 28],
  vslider: [28, 180],
  knob: [80, 80],
  dropdown: [150, 32],
  led: [26, 26],
  pilot: [40, 40],
  progress: [180, 16],
  vprogress: [16, 160],
  circularprogress: [90, 90],
  gauge: [150, 110],
  meter: [150, 110],
  thermometer: [40, 160],
  battery: [70, 34],
  level: [60, 160],
  bargraph: [180, 110],
  linechart: [260, 150],
  areachart: [260, 150],
  barchart: [260, 150],
  trend: [300, 150],
  table: [280, 150],
  alarmlist: [300, 140],
  circle: [80, 80],
  ellipse: [110, 70],
  line: [140, 2],
  polygon: [90, 90],
  path: [110, 90],
  rect: [120, 80],
  roundrect: [120, 80],
  frame: [220, 160],
  group: [160, 120],
  image: [140, 100],
  icon: [40, 40],
};

const labels: Partial<Record<ElementKind, string>> = {
  text: "Label",
  multitext: "Texto multilínea",
  button: "Button",
  toggle: "Toggle",
  numeric: "0.0",
};

export function createElement(kind: ElementKind, x = 40, y = 40): HmiElement {
  const [w, h] = defaultSize[kind] ?? [120, 80];
  const el: HmiElement = {
    id: uid(kind),
    name: prettyKind(kind),
    kind,
    x: Math.round(x),
    y: Math.round(y),
    width: w,
    height: h,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fill: pickFill(kind),
    stroke: "#3f4a5a",
    strokeWidth: kind === "line" ? 2 : 1,
    radius: kind === "roundrect" ? 10 : 2,
    props: defaultProps(kind),
    bindings: [],
    behaviors: [],
    states: [],
  };
  if (labels[kind]) el.text = labels[kind];
  if (["text", "multitext", "button", "toggle", "numeric", "status"].includes(kind))
    el.fontSize = 14;
  if (kind === "group" || kind === "frame") el.children = [];
  return el;
}

function pickFill(kind: ElementKind): string {
  if (kind === "led" || kind === "pilot") return "#22c55e";
  if (kind === "text" || kind === "multitext" || kind === "numeric") return "#dbe4f0";
  if (kind === "button" || kind === "toggle") return "#1f6feb";
  if (kind === "line") return "#6b7a90";
  return "#2b3442";
}

function defaultProps(kind: ElementKind): Record<string, string | number | boolean> {
  switch (kind) {
    case "gauge":
    case "meter":
    case "circularprogress":
    case "progress":
    case "vprogress":
    case "thermometer":
    case "battery":
    case "level":
    case "slider":
    case "vslider":
    case "knob":
    case "numeric":
    case "numericinput":
    case "bargraph":
      return { min: 0, max: 100, value: 45, unit: "", decimals: 1 };
    case "dropdown":
      return { options: "Auto,Manual,Off", value: "Auto" };
    case "table":
    case "alarmlist":
      return { rows: 4 };
    default:
      return {};
  }
}

export function prettyKind(kind: ElementKind) {
  const map: Partial<Record<ElementKind, string>> = {
    roundrect: "Rounded Rect",
    svgnode: "SVG Node",
    circularprogress: "Circular Progress",
    vprogress: "Progress V",
    vslider: "Slider V",
    linechart: "Line Chart",
    areachart: "Area Chart",
    barchart: "Bar Chart",
    alarmlist: "Alarm List",
    multitext: "Multiline Text",
    textinput: "Text Input",
    numericinput: "Numeric Input",
  };
  return map[kind] ?? kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function createBehavior(type: BehaviorType): Behavior {
  return {
    id: uid("bhv"),
    type,
    enabled: true,
    condition: "",
    mode: "continuous",
    direction: type === "rotate" ? "cw" : "normal",
    speed: type === "rotate" ? 60 : 40,
    min: 0,
    max: 100,
    distance: 80,
    durationMs: 800,
    colorLow: "#ef4444",
    colorHigh: "#22c55e",
  };
}
