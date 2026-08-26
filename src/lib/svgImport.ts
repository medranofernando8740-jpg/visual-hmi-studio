import type { HmiElement } from "@/types/hmi";
import { uid } from "./tree";

const CONTAINER_TAGS = new Set(["g", "svg"]);
const SHAPE_TAGS = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "image",
  "use",
]);

export interface SvgImportResult {
  element: HmiElement;
  nodeCount: number;
}

/**
 * Parses an SVG document, guarantees every meaningful node has a stable id,
 * and builds an HmiElement tree of `svgnode` children mirroring the SVG
 * structure so any group/shape can receive bindings and behaviors.
 */
export function importSvg(markup: string, fileName: string): SvgImportResult | null {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  const root = doc.querySelector("svg");
  if (!root || doc.querySelector("parsererror")) return null;

  let count = 0;
  const nameOf = (node: Element) =>
    node.getAttribute("inkscape:label") ||
    node.getAttribute("data-name") ||
    node.getAttribute("id") ||
    node.tagName;

  const walk = (node: Element): HmiElement[] => {
    const out: HmiElement[] = [];
    for (const child of Array.from(node.children)) {
      const tag = child.tagName.toLowerCase();
      if (!CONTAINER_TAGS.has(tag) && !SHAPE_TAGS.has(tag)) continue;
      if (!child.getAttribute("id")) child.setAttribute("id", `svg_${uid("n").slice(2)}`);
      const refId = child.getAttribute("id")!;
      count++;
      const kids = walk(child);
      const node2: HmiElement = {
        id: uid("svgn"),
        name: nameOf(child),
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
        props: { tag },
        bindings: [],
        behaviors: [],
        states: [],
        svgRef: refId,
      };
      if (kids.length) node2.children = kids;
      out.push(node2);
    }
    return out;
  };

  const children = walk(root);

  const vb = (root.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
  const wAttr = parseFloat(root.getAttribute("width") ?? "");
  const hAttr = parseFloat(root.getAttribute("height") ?? "");
  const width = Number.isFinite(wAttr) ? wAttr : vb.length === 4 ? vb[2]! : 320;
  const height = Number.isFinite(hAttr) ? hAttr : vb.length === 4 ? vb[3]! : 240;
  if (vb.length !== 4) root.setAttribute("viewBox", `0 0 ${width} ${height}`);
  root.setAttribute("width", "100%");
  root.setAttribute("height", "100%");
  root.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const element: HmiElement = {
    id: uid("svg"),
    name: fileName.replace(/\.svg$/i, ""),
    kind: "svg",
    x: 60,
    y: 60,
    width: Math.round(width),
    height: Math.round(height),
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
    children,
    svgMarkup: new XMLSerializer().serializeToString(root),
  };

  return { element, nodeCount: count };
}

/** A built-in industrial fan sample so the SVG pipeline is testable without files. */
export const SAMPLE_FAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <g id="FAN_GROUP">
    <circle id="MOTOR_BODY" cx="120" cy="120" r="104" fill="#243040" stroke="#4b5b70" stroke-width="4"/>
    <circle id="HOUSING_INNER" cx="120" cy="120" r="86" fill="#1a2330" stroke="#38465a" stroke-width="2"/>
    <g id="ROTOR">
      <path id="BLADE_1" d="M120 120 C150 96 168 66 156 42 C132 34 108 62 120 120Z" fill="#7f93ad"/>
      <path id="BLADE_2" d="M120 120 C138 156 168 176 190 162 C194 138 160 116 120 120Z" fill="#8fa4bf"/>
      <path id="BLADE_3" d="M120 120 C86 148 60 172 40 158 C36 132 78 112 120 120Z" fill="#6f839c"/>
      <circle id="SHAFT" cx="120" cy="120" r="18" fill="#c3d0e0" stroke="#4b5b70" stroke-width="3"/>
    </g>
    <circle id="STATUS_LIGHT" cx="200" cy="42" r="14" fill="#3f4a5a"/>
    <text id="LABEL" x="120" y="228" font-size="18" fill="#9fb0c6" text-anchor="middle">FAN-01</text>
  </g>
</svg>`;
