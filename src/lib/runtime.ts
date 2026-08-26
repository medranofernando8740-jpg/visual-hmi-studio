import type { Behavior, HmiElement } from "@/types/hmi";
import { evaluateCondition, evaluateExpression, type VarScope } from "./expression";

export interface RuntimeVisual {
  visible: boolean;
  opacity: number;
  fill: string;
  stroke: string;
  rotation: number;
  dx: number;
  dy: number;
  scale: number;
  text: string | undefined;
  value: number | undefined;
  /** 0..1 fill level used by shape-based level widgets */
  fillLevel: number | undefined;
  /** css animation shorthand list */
  animation: string;
  /** distance used by translate animations */
  animDistance: number;
  stateName: string | undefined;
}

function num(v: unknown, fallback: number) {
  const n = typeof v === "boolean" ? (v ? 1 : 0) : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalize(value: number, min: number, max: number) {
  if (max === min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

function lerpColor(a: string, b: string, t: number) {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  if (!pa || !pb) return b;
  const mix = pa.map((c, i) => Math.round(c + (pb[i]! - c) * t));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

function hexToRgb(hex: string): number[] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
}

function resolveBinding(el: HmiElement, property: string, scope: VarScope): unknown {
  const b = el.bindings.find((x) => x.property === property);
  if (!b) return undefined;
  if (b.mode === "fixed") return undefined;
  if (b.mode === "variable" && b.variable) return scope[b.variable];
  if (b.mode === "expression" && b.expression) return evaluateExpression(b.expression, scope);
  return undefined;
}

function behaviorValue(b: Behavior, scope: VarScope): number {
  if (b.valueVariable && b.valueVariable in scope) return num(scope[b.valueVariable], 0);
  return b.speed;
}

/**
 * The generic animation/binding engine. Any element (basic shape, widget or
 * imported SVG node) is resolved through this single function.
 */
export function computeRuntime(
  el: HmiElement,
  scope: VarScope,
  live: boolean,
): RuntimeVisual {
  const rt: RuntimeVisual = {
    visible: el.visible,
    opacity: el.opacity,
    fill: el.fill,
    stroke: el.stroke,
    rotation: el.rotation,
    dx: 0,
    dy: 0,
    scale: 1,
    text: el.text,
    value: el.props["value"] !== undefined ? num(el.props["value"], 0) : undefined,
    fillLevel: undefined,
    animation: "",
    animDistance: 0,
    stateName: undefined,
  };

  if (!live) return rt;

  // ---- Bindings -----------------------------------------------------------
  const bVisible = resolveBinding(el, "visible", scope);
  if (bVisible !== undefined) rt.visible = Boolean(bVisible);
  const bOpacity = resolveBinding(el, "opacity", scope);
  if (bOpacity !== undefined) rt.opacity = Math.min(1, Math.max(0, num(bOpacity, el.opacity)));
  const bRot = resolveBinding(el, "rotation", scope);
  if (bRot !== undefined) rt.rotation = num(bRot, el.rotation);
  const bFill = resolveBinding(el, "fill", scope);
  if (bFill !== undefined && typeof bFill === "string") rt.fill = bFill;
  const bText = resolveBinding(el, "text", scope);
  if (bText !== undefined) rt.text = String(bText);
  const bValue = resolveBinding(el, "value", scope);
  if (bValue !== undefined) rt.value = num(bValue, rt.value ?? 0);
  const bX = resolveBinding(el, "x", scope);
  if (bX !== undefined) rt.dx = num(bX, 0);
  const bY = resolveBinding(el, "y", scope);
  if (bY !== undefined) rt.dy = num(bY, 0);

  // ---- Visual states ------------------------------------------------------
  for (const st of el.states) {
    if (!evaluateCondition(st.condition, scope)) continue;
    rt.stateName = st.name;
    if (st.fill) rt.fill = st.fill;
    if (st.text !== undefined && st.text !== "") rt.text = st.text;
    if (st.opacity !== undefined) rt.opacity = st.opacity;
    if (st.visible !== undefined) rt.visible = st.visible;
    if (st.blink) rt.animation = joinAnim(rt.animation, "hmi-blink 0.7s steps(2) infinite");
    break;
  }

  // ---- Behaviors ----------------------------------------------------------
  for (const b of el.behaviors) {
    if (!b.enabled || !evaluateCondition(b.condition, scope)) continue;
    const value = behaviorValue(b, scope);
    const iter = b.mode === "oneshot" ? "1" : "infinite";
    const dirCss = b.mode === "pingpong" ? "alternate" : "normal";

    switch (b.type) {
      case "rotate": {
        const rpm = Math.abs(value);
        if (rpm > 0.001) {
          const dur = Math.max(0.05, 60 / rpm);
          const name = b.direction === "ccw" ? "hmi-spin-ccw" : "hmi-spin";
          rt.animation = joinAnim(rt.animation, `${name} ${dur}s linear ${iter}`);
        }
        break;
      }
      case "translateX":
      case "translateY": {
        const speed = Math.abs(value) || 1;
        const dur = Math.max(0.1, b.distance / speed);
        rt.animDistance = b.direction === "reverse" ? -b.distance : b.distance;
        const name = b.type === "translateX" ? "hmi-slide-x" : "hmi-slide-y";
        rt.animation = joinAnim(rt.animation, `${name} ${dur}s linear ${iter} ${dirCss}`);
        break;
      }
      case "scale": {
        rt.scale = 0.2 + normalize(value, b.min, b.max) * 1.6;
        break;
      }
      case "opacity": {
        rt.opacity = normalize(value, b.min, b.max);
        break;
      }
      case "color": {
        if (b.ranges?.length) {
          const hit = [...b.ranges].sort((x, y) => x.limit - y.limit).find((r) => value < r.limit);
          rt.fill = hit ? hit.color : b.colorHigh;
        } else {
          rt.fill = lerpColor(b.colorLow, b.colorHigh, normalize(value, b.min, b.max));
        }
        break;
      }
      case "fillLevel":
      case "progress":
      case "height":
      case "width": {
        rt.fillLevel = normalize(value, b.min, b.max);
        rt.value = value;
        break;
      }
      case "blink":
        rt.animation = joinAnim(
          rt.animation,
          `hmi-blink ${Math.max(0.1, b.durationMs / 1000)}s steps(2) ${iter}`,
        );
        break;
      case "pulse":
        rt.animation = joinAnim(
          rt.animation,
          `hmi-pulse ${Math.max(0.2, b.durationMs / 1000)}s ease-in-out ${iter}`,
        );
        break;
      case "shake":
        rt.animation = joinAnim(
          rt.animation,
          `hmi-shake ${Math.max(0.1, b.durationMs / 1000)}s ease-in-out ${iter}`,
        );
        break;
      case "flash":
        rt.animation = joinAnim(
          rt.animation,
          `hmi-flash ${Math.max(0.1, b.durationMs / 1000)}s ease-out ${iter}`,
        );
        break;
    }
  }

  return rt;
}

function joinAnim(current: string, next: string) {
  return current ? `${current}, ${next}` : next;
}

export function formatValue(el: HmiElement, value: number | undefined) {
  const decimals = num(el.props["decimals"], 1);
  const unit = String(el.props["unit"] ?? "");
  const v = value ?? num(el.props["value"], 0);
  return `${v.toFixed(decimals)}${unit ? " " + unit : ""}`;
}
