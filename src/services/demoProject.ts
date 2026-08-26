import type { Behavior, HmiElement, HmiVariable, Project, VisualState } from "@/types/hmi";
import { createElement } from "@/lib/factory";
import { SAMPLE_FAN_SVG } from "@/lib/svgImport";

let seq = 0;
const id = (p: string) => `${p}_d${++seq}`;

function behavior(partial: Partial<Behavior> & { type: Behavior["type"] }): Behavior {
  return {
    id: id("bhv"),
    enabled: true,
    condition: "",
    mode: "continuous",
    direction: "cw",
    speed: 60,
    min: 0,
    max: 100,
    distance: 80,
    durationMs: 700,
    colorLow: "#ef4444",
    colorHigh: "#22c55e",
    ...partial,
  };
}

function svgNode(name: string, ref: string, children?: HmiElement[]): HmiElement {
  const node: HmiElement = {
    id: id("svgn"),
    name,
    kind: "svgnode",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fill: "",
    stroke: "",
    strokeWidth: 0,
    radius: 0,
    props: { tag: "g" },
    bindings: [],
    behaviors: [],
    states: [],
    svgRef: ref,
  };
  if (children) node.children = children;
  return node;
}

function variable(v: Partial<HmiVariable> & { name: string; type: HmiVariable["type"] }): HmiVariable {
  return {
    id: id("var"),
    value: v.type === "boolean" ? false : v.type === "number" ? 0 : "",
    source: "Simulated",
    quality: "good",
    timestamp: Date.now(),
    signal: "manual",
    min: 0,
    max: 100,
    periodMs: 4000,
    ...v,
  };
}

export function createDemoProject(): Project {
  seq = 0;

  const rotor = svgNode("ROTOR", "ROTOR");
  rotor.behaviors = [
    behavior({
      type: "rotate",
      condition: "FAN_RUNNING == true",
      valueVariable: "FAN_SPEED",
      direction: "cw",
    }),
  ];

  const light: HmiElement = svgNode("STATUS_LIGHT", "STATUS_LIGHT");
  const lightStates: VisualState[] = [
    { id: id("st"), name: "ALARM", condition: "MOTOR_ALARM == true", fill: "#ef4444", blink: true },
    { id: id("st"), name: "RUNNING", condition: "FAN_RUNNING == true", fill: "#22c55e" },
    { id: id("st"), name: "OFF", condition: "true", fill: "#3f4a5a" },
  ];
  light.states = lightStates;

  const fan: HmiElement = {
    id: id("svg"),
    name: "VENTILADOR_01",
    kind: "svg",
    x: 60,
    y: 90,
    width: 240,
    height: 240,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fill: "transparent",
    stroke: "transparent",
    strokeWidth: 0,
    radius: 0,
    props: {},
    bindings: [],
    behaviors: [],
    states: [],
    svgMarkup: SAMPLE_FAN_SVG.replace("<svg ", '<svg width="100%" height="100%" '),
    children: [
      svgNode("Fan Group", "FAN_GROUP", [
        svgNode("Motor Body", "MOTOR_BODY"),
        svgNode("Housing Inner", "HOUSING_INNER"),
        rotor,
        light,
        svgNode("Label", "LABEL"),
      ]),
    ],
  };

  const tankShell = createElement("roundrect", 380, 110);
  tankShell.name = "Tanque Cuerpo";
  tankShell.width = 130;
  tankShell.height = 200;
  tankShell.fill = "#1a2330";
  tankShell.stroke = "#4b5b70";
  tankShell.radius = 16;

  const liquid = createElement("rect", 386, 116);
  liquid.name = "Tanque Nivel";
  liquid.width = 118;
  liquid.height = 188;
  liquid.fill = "#0ea5e9";
  liquid.stroke = "transparent";
  liquid.behaviors = [
    behavior({ type: "fillLevel", valueVariable: "TANK_LEVEL", min: 0, max: 100 }),
    behavior({
      type: "color",
      valueVariable: "TANK_LEVEL",
      ranges: [
        { limit: 20, color: "#ef4444" },
        { limit: 50, color: "#f59e0b" },
      ],
      colorHigh: "#22c55e",
    }),
  ];

  const gauge = createElement("gauge", 560, 110);
  gauge.name = "Temperatura";
  gauge.props = { min: 0, max: 150, value: 62, unit: "°C", decimals: 1 };
  gauge.bindings = [{ property: "value", mode: "variable", variable: "TEMPERATURE" }];

  const led = createElement("led", 560, 250);
  led.name = "Alarma Motor";
  led.states = [
    { id: id("st"), name: "ALARM", condition: "MOTOR_ALARM == true", fill: "#ef4444", blink: true },
    { id: id("st"), name: "OK", condition: "true", fill: "#22c55e" },
  ];

  const speedText = createElement("numeric", 610, 244);
  speedText.name = "RPM";
  speedText.props = { min: 0, max: 1800, value: 0, unit: "RPM", decimals: 0 };
  speedText.bindings = [{ property: "value", mode: "variable", variable: "FAN_SPEED" }];

  const title = createElement("text", 60, 40);
  title.name = "Título";
  title.text = "LÍNEA DE PROCESO 01";
  title.fontSize = 22;
  title.width = 380;
  title.height = 30;

  const beltBox = createElement("rect", 60, 360);
  beltBox.name = "Banda Base";
  beltBox.width = 440;
  beltBox.height = 28;
  beltBox.fill = "#232c3a";

  const beltMarker = createElement("rect", 70, 366);
  beltMarker.name = "Banda Marca";
  beltMarker.width = 26;
  beltMarker.height = 16;
  beltMarker.fill = "#8fa4bf";
  beltMarker.behaviors = [
    behavior({
      type: "translateX",
      condition: "CONVEYOR_RUNNING == true",
      valueVariable: "CONVEYOR_SPEED",
      distance: 380,
    }),
  ];

  const screenElements: HmiElement[] = [
    title,
    fan,
    tankShell,
    liquid,
    gauge,
    led,
    speedText,
    beltBox,
    beltMarker,
  ];

  return {
    id: "demo",
    name: "Planta Demo",
    screens: [
      {
        id: id("scr"),
        name: "Main Screen",
        width: 800,
        height: 480,
        background: "#0f141c",
        elements: screenElements,
      },
      {
        id: id("scr"),
        name: "Alarmas",
        width: 800,
        height: 480,
        background: "#0f141c",
        elements: [],
      },
    ],
    variables: [
      variable({ name: "FAN_RUNNING", type: "boolean", value: true }),
      variable({
        name: "FAN_SPEED",
        type: "number",
        value: 900,
        unit: "RPM",
        min: 0,
        max: 1800,
        signal: "manual",
      }),
      variable({ name: "MOTOR_ALARM", type: "boolean", value: false }),
      variable({
        name: "TEMPERATURE",
        type: "number",
        value: 62,
        unit: "°C",
        min: 0,
        max: 150,
        signal: "sine",
        periodMs: 8000,
      }),
      variable({
        name: "TANK_LEVEL",
        type: "number",
        value: 68,
        unit: "%",
        min: 0,
        max: 100,
        signal: "triangle",
        periodMs: 12000,
      }),
      variable({ name: "PUMP_STATUS", type: "boolean", value: true }),
      variable({ name: "CONVEYOR_RUNNING", type: "boolean", value: true }),
      variable({
        name: "CONVEYOR_SPEED",
        type: "number",
        value: 90,
        unit: "mm/s",
        min: 0,
        max: 250,
      }),
    ],
    widgets: [],
    connections: [
      {
        id: id("conn"),
        name: "ESP32 USB",
        protocol: "usb-serial",
        port: "COM3",
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        flowControl: "none",
        readTimeout: 1000,
        writeTimeout: 1000,
        connected: false,
      },
    ],
    target: {
      name: "Panel Planta",
      model: "ESP32-S3",
      port: "COM3",
      baudRate: 115200,
      protocol: "usb-serial",
      displayWidth: 800,
      displayHeight: 480,
      orientation: "landscape",
    },
    assets: [
      { id: id("as"), name: "VENTILADOR_01.svg", type: "svg", size: 4820 },
      { id: id("as"), name: "logo.svg", type: "svg", size: 1240 },
    ],
  };
}
