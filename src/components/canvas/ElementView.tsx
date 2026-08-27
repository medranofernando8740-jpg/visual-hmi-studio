import { useMemo } from "react";
import type { HmiElement } from "@/types/hmi";
import type { VarScope } from "@/lib/expression";
import { computeRuntime, formatValue, type RuntimeVisual } from "@/lib/runtime";
import { SvgHost } from "./SvgHost";
import { useEditor } from "@/stores/editorStore";

interface Props {
  el: HmiElement;
  scope: VarScope;
  live: boolean;
  selectedIds: string[];
  onSelect?: (id: string, additive: boolean, e: React.PointerEvent) => void;
  interactive: boolean;
}

const num = (v: unknown, f: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : f;
};

export function ElementView({ el, scope, live, selectedIds, onSelect, interactive }: Props) {
  const rt = useMemo(() => computeRuntime(el, scope, live), [el, scope, live]);
  const selected = selectedIds.includes(el.id);

  if (!rt.visible) return null;

  return (
    <div
      data-element-id={el.id}
      onPointerDown={(e) => {
        if (!onSelect) return;
        e.stopPropagation();
        onSelect(el.id, e.shiftKey, e);
      }}
      style={{
        position: "absolute",
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        opacity: rt.opacity,
        transform: `rotate(${rt.rotation}deg) translate(${rt.dx}px, ${rt.dy}px) scale(${rt.scale})`,
        outline: selected ? "1.5px solid var(--color-selection)" : undefined,
        outlineOffset: 1,
        cursor: onSelect ? (el.locked ? "not-allowed" : "move") : "default",
      }}
    >
      <div
        className="h-full w-full"
        style={{
          animation: rt.animation || undefined,
          ["--hmi-dist" as string]: `${rt.animDistance}px`,
        }}
      >
        <ElementBody
          el={el}
          rt={rt}
          scope={scope}
          live={live}
          selectedIds={selectedIds}
          onSelect={onSelect}
          interactive={interactive}
        />
      </div>
    </div>
  );
}

function ElementBody({
  el,
  rt,
  scope,
  live,
  selectedIds,
  onSelect,
  interactive,
}: Props & { rt: RuntimeVisual }) {
  const setVariableValue = useEditor((s) => s.setVariableValue);
  const min = num(el.props["min"], 0);
  const max = num(el.props["max"], 100);
  const value = rt.value ?? num(el.props["value"], 0);
  const ratio = max === min ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)));
  const level = rt.fillLevel;

  const writeTarget = el.bindings.find(
    (b) => b.property === "value" && b.mode === "variable",
  )?.variable;
  const canWrite = interactive && Boolean(writeTarget);

  const box = (extra?: React.CSSProperties, children?: React.ReactNode) => (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: level === undefined ? rt.fill : "transparent",
        border: el.strokeWidth ? `${el.strokeWidth}px solid ${rt.stroke}` : undefined,
        borderRadius: el.radius,
        ...extra,
      }}
    >
      {level !== undefined && (
        <div
          className="absolute inset-x-0 bottom-0 transition-[height] duration-200"
          style={{ height: `${level * 100}%`, background: rt.fill }}
        />
      )}
      {children}
    </div>
  );

  switch (el.kind) {
    case "svg":
      return <SvgHost el={el} scope={scope} live={live} />;

    case "group":
    case "frame":
    case "widget":
      return (
        <div
          className="relative h-full w-full"
          style={{
            border:
              el.kind === "frame" && el.strokeWidth
                ? `${el.strokeWidth}px solid ${rt.stroke}`
                : el.kind === "group" || el.kind === "widget"
                  ? "1px dashed color-mix(in oklab, var(--color-primary) 40%, transparent)"
                  : undefined,
            background: el.kind === "frame" ? rt.fill : "transparent",
            borderRadius: el.radius,
          }}
        >
          {el.children?.map((child) => (
            <ElementView
              key={child.id}
              el={child}
              scope={scope}
              live={live}
              selectedIds={selectedIds}
              interactive={interactive}
              {...(onSelect ? { onSelect } : {})}
            />
          ))}
        </div>
      );

    case "circle":
    case "ellipse":
      return box({ borderRadius: "50%" });

    case "led":
    case "pilot":
      return box({
        borderRadius: "50%",
        boxShadow: `0 0 ${el.kind === "pilot" ? 18 : 10}px ${rt.fill}`,
        border: `2px solid color-mix(in oklab, ${rt.fill} 50%, black)`,
      });

    case "line":
      return (
        <div className="flex h-full w-full items-center">
          <div style={{ height: Math.max(1, el.strokeWidth), width: "100%", background: rt.fill }} />
        </div>
      );

    case "text":
    case "multitext":
      return (
        <div
          className="flex h-full w-full items-center"
          style={{
            color: rt.fill,
            fontSize: el.fontSize ?? 14,
            whiteSpace: el.kind === "multitext" ? "pre-wrap" : "nowrap",
            fontWeight: 500,
          }}
        >
          {rt.text ?? el.name}
        </div>
      );

    case "numeric":
      return (
        <div
          className="flex h-full w-full items-center justify-end rounded-sm px-2 font-mono tabular-nums"
          style={{
            color: rt.fill,
            fontSize: el.fontSize ?? 14,
            background: "color-mix(in oklab, black 35%, transparent)",
            border: "1px solid var(--color-border)",
          }}
        >
          {formatValue(el, value)}
        </div>
      );

    case "textinput":
    case "numericinput":
      return (
        <div className="flex h-full w-full items-center rounded-sm border border-border bg-input px-2 font-mono text-xs text-foreground">
          {el.kind === "numericinput" ? formatValue(el, value) : (rt.text ?? "input")}
        </div>
      );

    case "button":
    case "toggle":
      return (
        <button
          type="button"
          className="h-full w-full rounded-sm text-xs font-semibold"
          style={{ background: rt.fill, color: "#f8fafc" }}
          onClick={() => {
            if (!canWrite || !writeTarget) return;
            setVariableValue(writeTarget, !scope[writeTarget]);
          }}
        >
          {rt.text ?? el.name}
        </button>
      );

    case "switch": {
      const on = Boolean(writeTarget ? scope[writeTarget] : value);
      return (
        <button
          type="button"
          className="flex h-full w-full items-center rounded-full p-[3px] transition-colors"
          style={{ background: on ? rt.fill : "var(--color-muted)" }}
          onClick={() => {
            if (!canWrite || !writeTarget) return;
            setVariableValue(writeTarget, !on);
          }}
        >
          <span
            className="h-full rounded-full bg-foreground transition-transform"
            style={{
              aspectRatio: "1",
              transform: on ? "translateX(100%)" : "translateX(0)",
            }}
          />
        </button>
      );
    }

    case "checkbox":
      return box({ borderRadius: 3, border: "1.5px solid var(--color-primary)" });

    case "slider":
    case "vslider": {
      const vertical = el.kind === "vslider";
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div
            className="absolute rounded-full bg-muted"
            style={vertical ? { width: 6, height: "100%" } : { height: 6, width: "100%" }}
          />
          <div
            className="absolute rounded-full"
            style={
              vertical
                ? { width: 6, height: `${ratio * 100}%`, bottom: 0, background: "var(--color-primary)" }
                : { height: 6, width: `${ratio * 100}%`, left: 0, background: "var(--color-primary)" }
            }
          />
          <div
            className="absolute h-4 w-4 rounded-full border border-border bg-foreground"
            style={
              vertical
                ? { bottom: `calc(${ratio * 100}% - 8px)` }
                : { left: `calc(${ratio * 100}% - 8px)` }
            }
          />
        </div>
      );
    }

    case "knob":
      return (
        <div className="relative h-full w-full rounded-full border-2 border-border bg-muted">
          <div
            className="absolute left-1/2 top-1/2 h-1/2 w-[3px] origin-bottom rounded bg-primary"
            style={{ transform: `translate(-50%,-100%) rotate(${-135 + ratio * 270}deg)` }}
          />
        </div>
      );

    case "dropdown":
      return (
        <div className="flex h-full w-full items-center justify-between rounded-sm border border-border bg-input px-2 text-xs">
          <span>{String(el.props["value"] ?? "Auto")}</span>
          <span className="text-muted-foreground">▾</span>
        </div>
      );

    case "progress":
    case "vprogress": {
      const vertical = el.kind === "vprogress";
      const p = level ?? ratio;
      return (
        <div className="h-full w-full overflow-hidden rounded-sm bg-muted">
          <div
            className="transition-all duration-200"
            style={
              vertical
                ? { height: `${p * 100}%`, width: "100%", background: rt.fill, marginTop: `${(1 - p) * 100}%` }
                : { width: `${p * 100}%`, height: "100%", background: rt.fill }
            }
          />
        </div>
      );
    }

    case "circularprogress":
    case "gauge":
    case "meter": {
      const p = level ?? ratio;
      const isGauge = el.kind !== "circularprogress";
      const sweep = isGauge ? 240 : 360;
      const r = 42;
      const c = 2 * Math.PI * r;
      return (
        <div className="relative h-full w-full">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="9"
              strokeDasharray={`${(c * sweep) / 360} ${c}`}
              strokeLinecap="round"
              transform={isGauge ? "rotate(150 50 50)" : "rotate(-90 50 50)"}
            />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={rt.fill === el.fill ? "var(--color-primary)" : rt.fill}
              strokeWidth="9"
              strokeDasharray={`${(c * sweep * p) / 360} ${c}`}
              strokeLinecap="round"
              transform={isGauge ? "rotate(150 50 50)" : "rotate(-90 50 50)"}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-foreground">
            {formatValue(el, value)}
          </div>
        </div>
      );
    }

    case "thermometer":
      return (
        <div className="relative flex h-full w-full flex-col items-center justify-end rounded-full border border-border bg-muted p-1">
          <div
            className="w-full rounded-full transition-all duration-200"
            style={{ height: `${(level ?? ratio) * 100}%`, background: rt.fill }}
          />
        </div>
      );

    case "battery":
      return (
        <div className="flex h-full w-full items-center gap-[2px]">
          <div className="h-full flex-1 rounded-sm border-2 border-border p-[3px]">
            <div
              className="h-full rounded-[2px]"
              style={{ width: `${(level ?? ratio) * 100}%`, background: rt.fill }}
            />
          </div>
          <div className="h-1/3 w-[4px] rounded-r bg-border" />
        </div>
      );

    case "level":
      return box({ border: `1px solid ${rt.stroke}` });

    case "bargraph":
    case "barchart":
      return (
        <div className="flex h-full w-full items-end gap-[3px] rounded-sm bg-muted/40 p-1">
          {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, ratio || 0.5].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${h * 100}%`, background: i % 2 ? "var(--color-chart-2)" : "var(--color-chart-1)" }}
            />
          ))}
        </div>
      );

    case "linechart":
    case "areachart":
    case "trend":
      return (
        <div className="h-full w-full rounded-sm border border-border bg-muted/30 p-1">
          <svg viewBox="0 0 100 40" className="h-full w-full" preserveAspectRatio="none">
            <polyline
              points={sparkline(ratio)}
              fill={el.kind === "areachart" ? "color-mix(in oklab, var(--color-primary) 25%, transparent)" : "none"}
              stroke="var(--color-primary)"
              strokeWidth="1.2"
            />
          </svg>
        </div>
      );

    case "table":
    case "alarmlist":
      return (
        <div className="h-full w-full overflow-hidden rounded-sm border border-border bg-muted/30 text-[10px]">
          {Array.from({ length: num(el.props["rows"], 4) }).map((_, i) => (
            <div key={i} className="flex gap-2 border-b border-border px-1 py-[3px] last:border-0">
              <span className="w-14 text-muted-foreground">
                {el.kind === "alarmlist" ? "ALM-" + (i + 1) : "Row " + (i + 1)}
              </span>
              <span className="flex-1 truncate">
                {el.kind === "alarmlist" ? "High level warning" : "value"}
              </span>
            </div>
          ))}
        </div>
      );

    case "image":
    case "icon":
      return (
        <div className="flex h-full w-full items-center justify-center rounded-sm border border-dashed border-border bg-muted/40 text-[10px] text-muted-foreground">
          {el.kind === "icon" ? "ICON" : "IMAGE"}
        </div>
      );

    case "polygon":
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <polygon points="50,4 96,35 78,94 22,94 4,35" fill={rt.fill} stroke={rt.stroke} />
        </svg>
      );

    case "path":
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path d="M6 82 C30 12, 70 96, 94 20" fill="none" stroke={rt.fill} strokeWidth="4" />
        </svg>
      );

    default:
      return box();
  }
}

function sparkline(ratio: number) {
  const pts = [8, 22, 14, 30, 18, 26, 12, 24, 10];
  return pts
    .map((v, i) => `${(i / (pts.length - 1)) * 100},${40 - v * (0.5 + ratio)}`)
    .join(" ");
}
