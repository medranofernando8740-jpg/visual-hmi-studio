/**
 * Core domain model for HMI Studio.
 * These types are intentionally backend-agnostic so a Laravel API can
 * serialize/deserialize them without UI changes.
 */

export type ElementKind =
  | "rect"
  | "roundrect"
  | "circle"
  | "ellipse"
  | "line"
  | "polygon"
  | "path"
  | "text"
  | "multitext"
  | "numeric"
  | "textinput"
  | "numericinput"
  | "button"
  | "toggle"
  | "switch"
  | "checkbox"
  | "slider"
  | "vslider"
  | "knob"
  | "dropdown"
  | "led"
  | "pilot"
  | "progress"
  | "vprogress"
  | "circularprogress"
  | "gauge"
  | "meter"
  | "thermometer"
  | "battery"
  | "level"
  | "bargraph"
  | "linechart"
  | "areachart"
  | "barchart"
  | "trend"
  | "table"
  | "alarmlist"
  | "image"
  | "icon"
  | "group"
  | "frame"
  | "svg"
  | "svgnode"
  | "widget";

export type BindingMode = "fixed" | "variable" | "expression";

export interface Binding {
  /** Target property name, e.g. "rotation", "fill", "visible", "value" */
  property: string;
  mode: BindingMode;
  variable?: string;
  expression?: string;
}

export type BehaviorType =
  | "rotate"
  | "translateX"
  | "translateY"
  | "scale"
  | "opacity"
  | "color"
  | "fillLevel"
  | "width"
  | "height"
  | "progress"
  | "blink"
  | "pulse"
  | "shake"
  | "flash";

export type AnimationMode = "continuous" | "oneshot" | "pingpong";

export interface Behavior {
  id: string;
  type: BehaviorType;
  enabled: boolean;
  /** Expression that gates the behavior, e.g. "FAN_RUNNING == true" */
  condition?: string;
  mode: AnimationMode;
  direction: "cw" | "ccw" | "normal" | "reverse";
  /** Fixed speed (rpm-ish / px per second) */
  speed: number;
  /** Variable driving the speed / value */
  valueVariable?: string;
  min: number;
  max: number;
  distance: number;
  durationMs: number;
  colorLow: string;
  colorHigh: string;
  /** Range based coloring: value < t1 -> low, < t2 -> mid, else high */
  ranges?: { limit: number; color: string }[];
}

export interface VisualState {
  id: string;
  name: string;
  condition: string;
  fill?: string;
  text?: string;
  opacity?: number;
  visible?: boolean;
  blink?: boolean;
}

export interface HmiElement {
  id: string;
  name: string;
  kind: ElementKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
  text?: string;
  fontSize?: number;
  /** free-form widget config (min/max, unit, decimals, options...) */
  props: Record<string, string | number | boolean>;
  bindings: Binding[];
  behaviors: Behavior[];
  states: VisualState[];
  children?: HmiElement[];
  /** raw markup for imported SVG roots */
  svgMarkup?: string;
  /** id inside the SVG document this node maps to */
  svgRef?: string;
  /** widget definition id for widget instances */
  widgetId?: string;
  /** instance parameter -> global variable */
  paramMap?: Record<string, string>;
}

export type VariableType = "boolean" | "number" | "string";

export type SignalKind =
  | "manual"
  | "constant"
  | "ramp"
  | "sine"
  | "triangle"
  | "square"
  | "random"
  | "counter"
  | "timer";

export interface HmiVariable {
  id: string;
  name: string;
  type: VariableType;
  value: number | boolean | string;
  unit?: string;
  source: string;
  quality: "good" | "stale" | "bad";
  timestamp: number;
  favorite?: boolean;
  signal: SignalKind;
  min: number;
  max: number;
  periodMs: number;
}

export interface WidgetParam {
  name: string;
  type: VariableType;
}

export interface WidgetDefinition {
  id: string;
  name: string;
  category: string;
  params: WidgetParam[];
  elements: HmiElement[];
  width: number;
  height: number;
}

export interface Screen {
  id: string;
  name: string;
  width: number;
  height: number;
  background: string;
  elements: HmiElement[];
}

export type ProtocolKind =
  | "uart"
  | "usb-serial"
  | "rs232"
  | "rs485"
  | "modbus-rtu"
  | "modbus-ascii"
  | "modbus-tcp"
  | "mqtt"
  | "websocket"
  | "http"
  | "opc-ua";

export interface ConnectionConfig {
  id: string;
  name: string;
  protocol: ProtocolKind;
  port: string;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: "none" | "even" | "odd";
  flowControl: "none" | "hardware" | "software";
  readTimeout: number;
  writeTimeout: number;
  host?: string;
  tcpPort?: number;
  connected: boolean;
}

export interface TargetDevice {
  name: string;
  model: string;
  port: string;
  baudRate: number;
  protocol: ProtocolKind;
  displayWidth: number;
  displayHeight: number;
  orientation: "landscape" | "portrait";
}

export interface Asset {
  id: string;
  name: string;
  type: "svg" | "image" | "font";
  size: number;
}

export interface Project {
  id: string;
  name: string;
  screens: Screen[];
  variables: HmiVariable[];
  widgets: WidgetDefinition[];
  connections: ConnectionConfig[];
  target: TargetDevice;
  assets: Asset[];
}

export type EditorMode = "design" | "simulate" | "preview";
